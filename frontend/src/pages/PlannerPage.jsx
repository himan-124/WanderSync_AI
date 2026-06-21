import { useNavigate } from 'react-router-dom';
import { PlanPage } from '@/features/trip/components/PlanPage';

export function PlannerPage() {
  const navigate = useNavigate();

  const handlePlanReady = (adaptedPlan, planId) => {
    navigate(`/trip/${planId}`, { state: { plan: adaptedPlan } });
  };

  const handleRequestLogin = () => {
    // Show AuthModal logic here
    console.log("Login requested");
  };

  return (
    <PlanPage 
      onRequestLogin={handleRequestLogin} 
      onPlanReady={handlePlanReady}
    />
  );
}
