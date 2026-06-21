import { useState, useRef, useEffect, useMemo } from 'react';
import { optimizeDay, revertDay, saveTimeline, savePlanMetadata, adaptPlan } from '@/services/api';

export function useTripEditing(planProp, planIdProp, currentUsername) {
  const [plan, setPlan] = useState(planProp);
  const [planId, setPlanId] = useState(planIdProp);
  const [optimizedDays, setOptimizedDays] = useState({});
  const [optimizingDay, setOptimizingDay] = useState(null);
  const [dayMsg, setDayMsg] = useState(null);
  
  // Manual Editing State
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(null);
  const draftRef = useRef(null);
  const [undoStack, setUndoStack] = useState([]);    
  const [redoStack, setRedoStack] = useState([]);
  const [editVer, setEditVer] = useState(0);         
  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState('');
  const [searchTarget, setSearchTarget] = useState(null);

  useEffect(() => {
    setPlan(planProp);
    setPlanId(planIdProp);
    setOptimizedDays({});
    setOptimizingDay(null);
    setDayMsg(null);
    setEditing(false);
    setDraft(null); 
    draftRef.current = null;
    setUndoStack([]);
    setRedoStack([]);
    setSaveErr('');
    setSearchTarget(null);
  }, [planProp, planIdProp]);

  useEffect(() => { draftRef.current = draft; }, [draft]);

  const dirty = undoStack.length > 0;
  const dirtyRef = useRef(false);
  useEffect(() => { dirtyRef.current = dirty; }, [dirty]);

  useEffect(() => {
    if (!editing) return;
    const guard = (e) => { if (dirtyRef.current) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('beforeunload', guard);
    return () => window.removeEventListener('beforeunload', guard);
  }, [editing]);

  const applyDayTimeline = (dayI, timeline) => {
    const raw = { ...plan._raw, days: plan._raw.days.map((d, i) => i === dayI ? { ...d, timeline } : d) };
    const adapted = adaptPlan(raw, currentUsername);
    adapted.logs = plan.logs;
    setPlan(adapted);
  };

  const showDayMsg = (dayNo, text) => {
    setDayMsg({ day: dayNo, text });
    setTimeout(() => setDayMsg(m => (m && m.day === dayNo && m.text === text ? null : m)), 5000);
  };

  const handleOptimize = async (dayNo) => {
    if (!confirm('Are you sure you want to optimize the route for this day?')) return;
    setOptimizingDay(dayNo);
    try {
      const dayI = dayNo - 1;
      const rawTimeline = plan._raw?.days?.[dayI]?.timeline;
      const res = await optimizeDay(planId, dayNo);
      if (res.optimized_day) {
        if (res.improved) {
          setOptimizedDays(prev => ({ ...prev, [dayI]: rawTimeline }));
          showDayMsg(dayNo, `Optimized successfully. Saved ${res.original_km - res.optimized_km} km.`);
        } else {
          showDayMsg(dayNo, `Route is already optimal.`);
        }
        applyDayTimeline(dayI, res.optimized_day.timeline);
      }
    } catch (e) { alert(e.message || 'Optimization failed'); }
    finally { setOptimizingDay(null); }
  };

  const handleRevert = async (dayNo) => {
    const dayI = dayNo - 1;
    const orig = optimizedDays[dayI];
    if (!orig || !planId) return;
    try {
      await revertDay(planId, dayNo, orig);
      setOptimizedDays(prev => { const n = { ...prev }; delete n[dayI]; return n; });
      applyDayTimeline(dayI, orig);
      showDayMsg(dayNo, 'Reverted successfully');
    } catch (e) { alert(e.message || 'Revert failed'); }
  };

  const enterEdit = () => {
    const clone = structuredClone(plan._raw.days);
    setDraft(clone); draftRef.current = clone;
    setUndoStack([]); setRedoStack([]); setSaveErr('');
    setEditing(true); setEditVer(v => v + 1);
  };

  const exitEdit = () => {
    if (dirty && !confirm('You have unsaved changes. Are you sure you want to discard them?')) return;
    setEditing(false); setDraft(null); draftRef.current = null; setSaveErr(''); setSearchTarget(null);
  };

  const applyEdit = (mutate) => {
    const cur = draftRef.current;
    setUndoStack(s => [...s, cur]);
    setRedoStack([]);
    const next = structuredClone(cur);
    mutate(next);
    setDraft(next);
    draftRef.current = next;
    setEditVer(v => v + 1);
  };

  const undo = () => {
    if (!undoStack.length) return;
    const cur = draftRef.current;
    const prev = undoStack[undoStack.length - 1];
    setRedoStack(r => [...r, cur]);
    setUndoStack(s => s.slice(0, -1));
    setDraft(prev);
    draftRef.current = prev;
    setEditVer(v => v + 1);
  };

  const redo = () => {
    if (!redoStack.length) return;
    const cur = draftRef.current;
    const next = redoStack[redoStack.length - 1];
    setUndoStack(s => [...s, cur]);
    setRedoStack(r => r.slice(0, -1));
    setDraft(next);
    draftRef.current = next;
    setEditVer(v => v + 1);
  };

  const saveEdit = async () => {
    setSaving(true); setSaveErr('');
    try {
      const days = draftRef.current.map((d, i) => ({ day: d.day ?? i + 1, timeline: d.timeline }));
      const res = await saveTimeline(planId, days);
      const day_themes = {};
      draftRef.current.forEach((d, i) => { if (d.theme) day_themes[String(d.day ?? i + 1)] = d.theme; });
      if (Object.keys(day_themes).length) {
        try { await savePlanMetadata(planId, { day_themes }); } catch {}
      }
      const adapted = adaptPlan(res.plan, currentUsername);
      adapted.logs = plan.logs;
      setPlan(adapted);
      setEditing(false); setDraft(null); draftRef.current = null; setSearchTarget(null);
      setOptimizedDays({});   
    } catch (e) {
      setSaveErr(e.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const editedView = useMemo(() => {
    if (!editing || !draft) return null;
    const adapted = adaptPlan({ ...plan._raw, days: draft }, currentUsername);
    adapted.logs = plan.logs;
    return adapted;
  }, [editing, editVer, plan, draft, currentUsername]);

  return {
    plan, planId, 
    optimizingDay, optimizedDays, dayMsg,
    handleOptimize, handleRevert,
    editing, saving, saveErr,
    enterEdit, exitEdit, saveEdit, applyEdit, undo, redo,
    undoCount: undoStack.length, redoCount: redoStack.length,
    editedView, draft, searchTarget, setSearchTarget
  };
}
