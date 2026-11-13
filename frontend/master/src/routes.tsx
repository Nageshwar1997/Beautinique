import { ACCOUNT_PATHS, AUTH_PATHS, RequireSignIn } from '@beautinique/frontend-auth-ui';
import { Outlet, type RouteObject } from 'react-router';

import {
  AccountIndex,
  AccountLayout,
  AuthenticatorPage,
  DevicesPage,
  SecurityPage,
} from './pages/account';
import { CreditsPage } from './pages/credits';
import { ForgotPasswordPage } from './pages/forgot-password';
import { HomePage } from './pages/home';
import { InvitationPage } from './pages/invitation';
import { NotFoundPage } from './pages/not-found';
import { SignInPage } from './pages/sign-in';
import { AppRoot, PageError, RootError } from './root';

/**
 * The app's route table (ARCHITECTURE §9.2): sign-in first for everything; only the auth pages,
 * the icon credits and the error pages are open. A signed-out visit goes to sign-in and comes back
 * (`next`). Add pages here, and to nav.ts when they are ready.
 */
export const routes: RouteObject[] = [
  {
    element: <AppRoot />,
    errorElement: <RootError />,
    children: [
      {
        errorElement: <PageError />,
        children: [
          { path: AUTH_PATHS.signIn, element: <SignInPage /> },
          { path: AUTH_PATHS.forgotPassword, element: <ForgotPasswordPage /> },
          { path: AUTH_PATHS.invitation, element: <InvitationPage /> },
          { path: '/credits', element: <CreditsPage /> },
          {
            element: (
              <RequireSignIn>
                <Outlet />
              </RequireSignIn>
            ),
            children: [
              { index: true, element: <HomePage /> },
              {
                path: '/account',
                element: <AccountLayout />,
                children: [
                  { index: true, element: <AccountIndex /> },
                  { path: ACCOUNT_PATHS.security, element: <SecurityPage /> },
                  { path: ACCOUNT_PATHS.authenticator, element: <AuthenticatorPage /> },
                  { path: ACCOUNT_PATHS.devices, element: <DevicesPage /> },
                ],
              },
            ],
          },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
];
