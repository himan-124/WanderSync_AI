import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { tripService } from '../services/tripService';

export const useTrip = (planId) => {
  const { accessToken } = useAuthStore();
  const queryClient = useQueryClient();

  const tripQuery = useQuery({
    queryKey: ['trip', planId],
    queryFn: () => tripService.getItinerary(planId, accessToken),
    enabled: !!planId && !!accessToken,
  });

  const optimizeMutation = useMutation({
    mutationFn: (day) => tripService.optimizeDay(planId, day, accessToken),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['trip', planId] });
    },
  });

  const saveTimelineMutation = useMutation({
    mutationFn: (days) => tripService.saveTimeline(planId, days, accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip', planId] });
    },
  });

  return {
    itinerary: tripQuery.data?.plan,
    loading: tripQuery.isLoading,
    error: tripQuery.error,
    fetchItinerary: tripQuery.refetch,
    optimizeDay: optimizeMutation.mutateAsync,
    saveTimeline: saveTimelineMutation.mutateAsync,
    isOptimizing: optimizeMutation.isPending,
  };
};
