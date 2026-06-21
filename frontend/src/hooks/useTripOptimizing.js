import { useState } from 'react';
import { updatePlan } from '@/services/api';

export function useTripOptimizing(plan, onModifyTrigger, onSetPlan) {
  const [optimizing, setOptimizing] = useState(false);
  const [optQuery, setOptQuery] = useState("");

  const handleOptimisePlan = () => {
    if (!optQuery.trim() || !plan?.id) return;
    setOptimizing(true);
    onModifyTrigger(optQuery, plan.id);
  };

  const syncToBackend = async (newPlan) => {
    try {
      await updatePlan(newPlan.id, newPlan);
    } catch (e) {
      console.error("Failed to sync plan updates:", e);
    }
  };

  const handleUpdateField = (field, value) => {
    if (!plan) return;
    const updated = { ...plan, [field]: value };
    onSetPlan(updated);
    syncToBackend(updated);
  };

  return {
    optimizing,
    setOptimizing,
    optQuery,
    setOptQuery,
    handleOptimisePlan,
    handleUpdateField,
    syncToBackend
  };
}
