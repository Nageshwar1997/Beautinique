import { ACCOUNT_PATHS } from '@beautinique/frontend-auth-ui';
import { Navigate } from 'react-router';

/** `/account` itself: the security page, the first of the account's pages. */
export default function AccountIndex() {
  return <Navigate to={ACCOUNT_PATHS.security} replace />;
}
