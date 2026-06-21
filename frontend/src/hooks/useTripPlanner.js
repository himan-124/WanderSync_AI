import { useState, useEffect, useRef } from 'react';
import { streamPlan, adaptPlan, confirmModification } from '@/services/api';

export const JOURNEY_STEPS = [
  { key: "intent",            label: "Understanding Trip Intent",       detail: "Destination / Dates / Preferences" },
  { key: "query_rewrite",     label: "Optimizing Profile",   detail: "Personalizing query" },
  { key: "attraction_search", label: "Finding Tourist Spots",    detail: "Searching attractions" },
  { key: "plan_review",       label: "Planning & Reviewing",    detail: "Refining daily schedule" },
  { key: "time_check",        label: "Checking Timings",        detail: "Verifying opening hours" },
  { key: "meal",              label: "Finding Restaurants",        detail: "Finding food spots" },
  { key: "finalize",          label: "Finalizing Plan",         detail: "Almost done..." },
];

export const NODE_TO_STEP = {
  intent:            "intent",
  query_rewrite:     "query_rewrite",
  attraction_search: "attraction_search",
  planner:           "plan_review",
  reviewer:          "plan_review",
  time_check:        "time_check",
  meal_search:       "meal",
  meal_recommend:    "meal",
  spot_tips:         "finalize",
  finalize:          "finalize",
};

export function useTripPlanner({ onPhaseChange, onPlanReady, currentUsername }) {
  const [phase, setPhase] = useState("idle");
  const [query, setQuery] = useState("");
  const [planId, setPlanId] = useState(null);
  const [logs, setLogs] = useState([]);
  const [activeNode, setActiveNode] = useState(null);
  const [doneNodes, setDoneNodes] = useState([]);
  const [stageLabel, setStageLabel] = useState("");
  const [missingFields, setMissingFields] = useState([]);
  const [threadId, setThreadId] = useState(null);
  const [concernModal, setConcernModal] = useState(null);
  const [errMsg, setErrMsg] = useState("");
  
  const abortRef = useRef(null);
  const maxStepRef = useRef(-1);

  useEffect(() => { onPhaseChange?.(phase); }, [phase, onPhaseChange]);
  useEffect(() => () => abortRef.current?.(), []);

  const handleStage = (ev) => {
    setLogs(prev => [...prev, ev.label || ev.node]);
    setStageLabel(ev.label || "");
    const key = NODE_TO_STEP[ev.node] || ev.node;
    const idx = JOURNEY_STEPS.findIndex(s => s.key === key);
    if (idx < 0 || idx <= maxStepRef.current) return;
    maxStepRef.current = idx;
    setActiveNode(key);
    setDoneNodes(JOURNEY_STEPS.slice(0, idx).map(s => s.key));
  };

  const resetJourney = () => {
    maxStepRef.current = -1;
    setActiveNode(null);
    setDoneNodes([]);
    setStageLabel("");
  };

  const doStream = (body) => {
    setPhase("loading");
    const isModify = !!(body.plan_id && body.modification_notes);
    if (isModify) {
      const preDone = JOURNEY_STEPS.slice(0, 3).map(s => s.key);
      maxStepRef.current = 3;
      setDoneNodes(preDone);
      setActiveNode("plan_review");
      setStageLabel("");
      setLogs([]);
    } else {
      resetJourney();
    }
    setErrMsg("");

    streamPlan(body, {
      onAbort: (fn) => { abortRef.current = fn; },
      onStage: handleStage,
      onResult: (ev) => {
        const adapted = adaptPlan(ev.plan, currentUsername);
        adapted.logs = ev.history || logs;
        setPlanId(ev.plan_id);
        setDoneNodes(JOURNEY_STEPS.map(s => s.key));
        setTimeout(() => { onPlanReady?.(adapted, ev.plan_id); setPhase("idle"); }, 600);
      },
      onMissingFields: (ev) => {
        setMissingFields(ev.missing_fields || []);
        setThreadId(ev.thread_id || null);
        setPhase("idle");
      },
      onWarning: (ev) => {
        setConcernModal({
          concern: ev.concern,
          pending_id: ev.pending_id,
          parent_plan_id: ev.parent_plan_id || planId,
        });
        setPhase("idle");
      },
      onError: (msg) => {
        setErrMsg(msg);
        setPhase("idle");
      },
    });
  };

  const startPlan = (overrideQuery) => {
    const q = overrideQuery || (threadId ? (query + " " + (threadId || "")).trim() : query.trim());
    if (!q) return;
    setMissingFields([]);
    doStream({ query: q, thread_id: threadId || undefined });
  };

  const confirmConcern = async () => {
    const { pending_id, parent_plan_id } = concernModal;
    setConcernModal(null);
    setPhase("loading");
    resetJourney();
    confirmModification(pending_id, parent_plan_id, {
      onAbort: (fn) => { abortRef.current = fn; },
      onStage: handleStage,
      onResult: (ev) => {
        const adapted = adaptPlan(ev.plan, currentUsername);
        const newPlanId = ev.plan_id || planId;
        setPlanId(newPlanId);
        setDoneNodes(JOURNEY_STEPS.map(s => s.key));
        setTimeout(() => { onPlanReady?.(adapted, newPlanId); setPhase("idle"); }, 600);
      },
      onError: (msg) => { setErrMsg(msg); setPhase("idle"); },
    });
  };

  return {
    phase, query, setQuery, planId, activeNode, doneNodes, stageLabel, missingFields,
    concernModal, errMsg, doStream, startPlan, confirmConcern
  };
}
