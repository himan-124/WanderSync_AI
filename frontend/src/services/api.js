export function getAuth() {
  try { return JSON.parse(localStorage.getItem("auth")); } catch { return null; }
}

export function setAuth(token, username) {
  localStorage.setItem("auth", JSON.stringify({ token, username }));
}

export function clearAuth() {
  localStorage.removeItem("auth");
  window.dispatchEvent(new CustomEvent("auth:expired"));
}

export function authHeaders() {
  const a = getAuth();
  return a ? { "Authorization": "Bearer " + a.token } : {};
}

export async function loginApi(username, password) {
  const r = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const d = await r.json();
  if (!r.ok) throw new Error(d.detail || "Login failed");
  return d;
}

export async function registerApi(username, password) {
  const r = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const d = await r.json();
  if (!r.ok) throw new Error(d.detail || "Register failed");
  return d;
}

export async function checkAuth() {
  const a = getAuth();
  if (!a) return null;
  try {
    const r = await fetch("/api/auth/me", { headers: authHeaders() });
    if (!r.ok) throw new Error("Auth invalid");
    const d = await r.json();
    return d.username;
  } catch (e) {
    clearAuth();
    return null;
  }
}

export async function getProfile() {
  const r = await fetch("/api/user/profile", { headers: authHeaders() });
  if (!r.ok) throw new Error("Failed to get profile");
  return r.json();
}

export async function getPlan(id) {
  const r = await fetch(`/api/plan/${id}`, { headers: authHeaders() });
  const d = await r.json();
  if (!r.ok) throw new Error(d.detail || "Failed to load plan");
  return d;
}

export function streamPlan(body, callbacks) {
  const { onAbort, onStage, onResult, onMissingFields, onWarning, onError } = callbacks;
  const abortCtrl = new AbortController();
  onAbort && onAbort(() => abortCtrl.abort());

  fetch("/api/plan/stream", {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: abortCtrl.signal,
  }).then(async (res) => {
    if (!res.ok) {
      let msg = "Network error";
      try { const d = await res.json(); msg = d.detail || msg; } catch {}
      throw new Error(msg);
    }
    const reader = res.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buf = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop();
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const ev = JSON.parse(line);
          if (ev.type === "stage") onStage && onStage(ev);
          else if (ev.type === "result") onResult && onResult(ev);
          else if (ev.type === "missing_fields") onMissingFields && onMissingFields(ev);
          else if (ev.type === "warning") onWarning && onWarning(ev);
          else if (ev.type === "error") onError && onError(ev.error);
        } catch (e) {
          console.warn("Parse error", line, e);
        }
      }
    }
  }).catch(err => {
    if (err.name !== "AbortError") onError && onError(err.message);
  });
}

export function confirmModification(pendingId, parentPlanId, callbacks) {
  const { onAbort, onStage, onResult, onError } = callbacks;
  const abortCtrl = new AbortController();
  onAbort && onAbort(() => abortCtrl.abort());

  fetch("/api/plan/confirm_modification", {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ pending_id: pendingId, parent_plan_id: parentPlanId }),
    signal: abortCtrl.signal,
  }).then(async (res) => {
    if (!res.ok) {
      let msg = "Network error";
      try { const d = await res.json(); msg = d.detail || msg; } catch {}
      throw new Error(msg);
    }
    const reader = res.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buf = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop();
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const ev = JSON.parse(line);
          if (ev.type === "stage") onStage && onStage(ev);
          else if (ev.type === "result") onResult && onResult(ev);
          else if (ev.type === "error") onError && onError(ev.error);
        } catch (e) {}
      }
    }
  }).catch(err => {
    if (err.name !== "AbortError") onError && onError(err.message);
  });
}

export async function getConfig() {
  const r = await fetch("/api/system/config");
  return r.json();
}

let amapScriptPromise = null;
export function ensureAMap() {
  if (window.AMap) return Promise.resolve(window.AMap);
  if (amapScriptPromise) return amapScriptPromise;
  amapScriptPromise = getConfig().then(conf => {
    if (!conf.amap_web_key || !conf.amap_security_code) throw new Error("No AMap config");
    window._AMapSecurityConfig = { securityJsCode: conf.amap_security_code };
    return new Promise((resolve, reject) => {
      window._amapInit = () => { resolve(window.AMap); delete window._amapInit; };
      const s = document.createElement("script");
      s.src = `https://webapi.amap.com/maps?v=2.0&key=${conf.amap_web_key}&plugin=AMap.Driving,AMap.Transfer,AMap.Walking&callback=_amapInit`;
      s.onerror = () => reject(new Error("AMap load fail"));
      document.head.appendChild(s);
    });
  });
  return amapScriptPromise;
}

export async function initAmapForDay(container, points) {
  if (!points || !points.length) return false;
  try {
    const AMap = await ensureAMap();
    if (!container) return false;
    const map = new AMap.Map(container, { zoom: 12, mapStyle: "amap://styles/normal" });
    container._amapInstance = map;
    restoreFullRoute(container, points);
    return true;
  } catch (e) {
    console.error("AMap init fail:", e);
    return false;
  }
}

export function drawNavPairRoute(container, from, to) {
  const map = container?._amapInstance;
  if (!map || !from || !to || !window.AMap) return;
  map.clearMap();
  const driving = new window.AMap.Driving({ map, hideMarkers: false });
  driving.search(
    new window.AMap.LngLat(from.lng, from.lat),
    new window.AMap.LngLat(to.lng, to.lat)
  );
}

export function restoreFullRoute(container, points) {
  const map = container?._amapInstance;
  if (!map || !window.AMap || !points || !points.length) return;
  map.clearMap();
  const path = [];
  points.forEach((p, i) => {
    if (!p.lng || !p.lat) return;
    const ll = new window.AMap.LngLat(p.lng, p.lat);
    path.push(ll);
    const m = new window.AMap.Marker({
      position: ll,
      content: `<div class="w-6 h-6 flex items-center justify-center rounded-full text-white font-bold text-xs shadow-md ${p.type==='meal'?'bg-second-500':'bg-primary-500'}">${p.type==='meal'?'🍴':i+1}</div>`,
      offset: new window.AMap.Pixel(-12, -12),
    });
    map.add(m);
  });
  if (path.length > 1) {
    const poly = new window.AMap.Polyline({
      path, strokeColor: "#4f46e5", strokeOpacity: 0.8, strokeWeight: 4, strokeStyle: "dashed"
    });
    map.add(poly);
  }
  if (path.length > 0) {
    map.setFitView();
  }
}

export function destroyAmap(container) {
  if (container?._amapInstance) {
    container._amapInstance.destroy();
    delete container._amapInstance;
  }
}

export async function saveProfile(data) {
  const r = await fetch("/api/user/profile", {
    method: "PUT",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!r.ok) throw new Error("Failed to save profile");
  return r.json();
}

export async function optimizeDay(planId, day) {
  const r = await fetch("/api/plan/optimize_day", {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ plan_id: planId, day }),
  });
  const d = await r.json();
  if (!r.ok) throw new Error(d.detail || "Optimize failed");
  return d;
}

export async function revertDay(planId, day, original_timeline) {
  const r = await fetch("/api/plan/revert_day", {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ plan_id: planId, day, original_timeline }),
  });
  const d = await r.json();
  if (!r.ok) throw new Error(d.detail || "Revert failed");
  return d;
}

export async function saveTimeline(planId, days) {
  const r = await fetch(`/api/plan/${planId}/timeline`, {
    method: "PUT",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ days }),
  });
  const d = await r.json();
  if (!r.ok) throw new Error(d.detail || "Failed to save timeline");
  return d;
}

export async function savePlanMetadata(planId, data) {
  const r = await fetch(`/api/plan/${planId}/metadata`, {
    method: "PUT",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const d = await r.json();
  if (!r.ok) throw new Error(d.detail || "Failed to save metadata");
  return d;
}

export async function searchPoi(city, kw, kind) {
  const q = new URLSearchParams({ city, kw, kind });
  const r = await fetch(`/api/poi/search?${q.toString()}`, { headers: authHeaders() });
  const d = await r.json();
  if (!r.ok) throw new Error(d.detail || "Search failed");
  return d;
}

export async function searchNearby(lat, lng, type, radius=1500) {
  const q = new URLSearchParams({ lat, lng, type, radius });
  const r = await fetch(`/api/poi/nearby?${q.toString()}`, { headers: authHeaders() });
  const d = await r.json();
  if (!r.ok) throw new Error(d.detail || "Nearby search failed");
  return d;
}

// Adapt Plan logic ported directly from legacy api.js
export function adaptPlan(backendPlan, username) {
  const dest = backendPlan.destination || "Mystery Destination";
  const startDt = backendPlan.start_date ? new Date(backendPlan.start_date) : null;
  const endDt = backendPlan.end_date ? new Date(backendPlan.end_date) : null;
  let dateRange = "Flexible Dates";
  if (startDt && endDt) {
    const s = `${startDt.getMonth() + 1}.${startDt.getDate()}`;
    const e = `${endDt.getMonth() + 1}.${endDt.getDate()}`;
    dateRange = `${s} - ${e} / ${backendPlan.days?.length || 0} Days`;
  } else if (backendPlan.days?.length) {
    dateRange = `${backendPlan.days.length} Days Trip`;
  }
  
  const title = backendPlan.title || `${dest} Journey`;
  const encDest = encodeURIComponent(dest);
  const coverImg = `https://source.unsplash.com/featured/1200x600/?${encDest},travel,landscape`;

  const badges = [];
  if (backendPlan.planner_state?.attraction_preference) badges.push(backendPlan.planner_state.attraction_preference);
  if (backendPlan.planner_state?.food_preference) badges.push(backendPlan.planner_state.food_preference);
  if (backendPlan.planner_state?.habit_preference) badges.push(backendPlan.planner_state.habit_preference);
  if (!badges.length) badges.push("Explorer");

  const weather = (backendPlan.weather_forecast || []).map((w) => {
    const wl = w.weather || "";
    let icon = "🌤";
    if (wl.includes("Rain")) icon = "🌧";
    if (wl.includes("Cloud")) icon = "☁️";
    if (wl.includes("Snow")) icon = "❄️";
    return {
      day: w.date ? w.date.slice(5) : "",
      icon,
      text: wl,
      hi: w.high || "--",
      lo: w.low || "--",
    };
  });

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const days = (backendPlan.days || []).map((d, i) => {
    const timeline = d.timeline || [];
    const items = timeline.map((it) => ({
      ...it,
      desc: it.reason || it.tip || "",
      cover: it.photo || null,
    }));

    const mapPoints = timeline
      .filter((it) => it.location && it.location.lat && it.location.lng)
      .map((it) => ({
        name: it.name,
        type: it.type,
        location: it.location,
        extra: {
          rating: it.rating || null,
          photo: it.photo || null,
        },
      }));

    let dateLabel = d.date || `Day ${i + 1}`;
    if (backendPlan.start_date) {
      const dt = new Date(backendPlan.start_date);
      dt.setDate(dt.getDate() + i);
      dateLabel = `${dt.getMonth() + 1 < 10 ? "0" : ""}${dt.getMonth() + 1}.${String(dt.getDate()).padStart(2, "0")} ${weekdays[dt.getDay()]}`;
    }

    const dayThemes = backendPlan.day_themes || {};
    return {
      date: dateLabel,
      theme: dayThemes[String(d.day || i + 1)] || d.theme || `Day ${i + 1}`,
      items,
      mapPoints,
    };
  });

  const tips = [
    ...(backendPlan.weather_note ? [backendPlan.weather_note] : []),
    ...(backendPlan.route_issues || []),
  ];

  return {
    _raw: backendPlan,
    plan_id: backendPlan.plan_id,
    title,
    destination: dest,
    date_range: dateRange,
    badges,
    cover_seed: encDest,
    cover_img: coverImg,
    weather,
    days,
    tips,
    logs: backendPlan.history || [],
    username: username || "Traveler",
    candidate_spots: backendPlan.candidate_spots || [],
    hotel: backendPlan.hotel || "",
    notes: backendPlan.notes || "",
  };
}
