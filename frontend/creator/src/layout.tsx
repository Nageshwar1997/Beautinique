import { Outlet } from 'react-router';

/** Every page: a skip link to the main content (DESIGN §8), then the page. */
export function Layout() {
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Outlet />
    </>
  );
}
