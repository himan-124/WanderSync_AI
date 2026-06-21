import { createBrowserRouter } from 'react-router-dom';

export const router = createBrowserRouter([
  {
    path: '/',
    lazy: async () => {
      const { LandingPage } = await import('@/pages/LandingPage');
      return { Component: LandingPage };
    },
  },
  {
    path: '/planner',
    lazy: async () => {
      const { PlannerPage } = await import('@/pages/PlannerPage');
      return { Component: PlannerPage };
    },
  },
  {
    path: '/trip/:id',
    lazy: async () => {
      const { TripPage } = await import('@/pages/TripPage');
      return { Component: TripPage };
    },
  },
  {
    path: '*',
    lazy: async () => {
      const { NotFoundPage } = await import('@/pages/NotFoundPage');
      return { Component: NotFoundPage };
    },
  },
]);
