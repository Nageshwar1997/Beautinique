import type { RouteObject } from 'react-router';

import { Layout } from './layout';
import { HomePage } from './pages/home';
import { NotFoundPage } from './pages/not-found';

/** The app's route table. Add pages here. */
export const routes: RouteObject[] = [
  {
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];
