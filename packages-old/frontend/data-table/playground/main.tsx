// Playground: a staff list as the Master app shows it, against made-up people: filters and pages in
// the URL, a table that turns into cards on a phone, a side panel for a row. `npm run playground
// --workspace @beautinique/frontend-data-table`, http://localhost:5188.
import './playground.css';

import {
  AppFrame,
  NavList,
  SectionLayout,
  THEME_SCRIPT,
  ThemeSwitcher,
} from '@beautinique/frontend-app-shell';
import { Badge, Button, Dialog, Input, Select } from '@beautinique/frontend-components';
import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, Outlet, RouterProvider } from 'react-router';

import { type Column, CursorPager, DataTable, type TableStatus, useTableUrl } from '../src/index';

interface Grant {
  id: string;
  email: string;
  role: string;
  app: string;
  scope: string;
  active: boolean;
}

const APPS = ['admin', 'support', 'finance', 'logistics'] as const;
const ROLES = ['State Admin', 'Support Agent (L1)', 'Finance Manager', 'Hub Manager'];
const STATES = ['Maharashtra', 'Gujarat', 'Delhi', 'Karnataka', 'Global'];
const PEOPLE: Grant[] = Array.from({ length: 23 }, (_, i) => ({
  id: `g${String(i + 1).padStart(2, '0')}`,
  email: `person${String(i + 1)}@beautinique.example`,
  role: ROLES[i % ROLES.length] ?? '',
  app: APPS[i % APPS.length] ?? 'admin',
  scope: STATES[i % STATES.length] ?? 'Global',
  active: i % 5 !== 4,
}));
const PAGE = 8;

const COLUMNS: Column<Grant>[] = [
  { key: 'email', header: 'Email', cell: (g) => g.email, primary: true },
  { key: 'role', header: 'Role', cell: (g) => g.role },
  { key: 'app', header: 'App', cell: (g) => g.app, className: 'capitalize' },
  { key: 'scope', header: 'Scope', cell: (g) => g.scope, hideOnCard: true },
  {
    key: 'status',
    header: 'Status',
    cell: (g) =>
      g.active ? <Badge tone="success">Active</Badge> : <Badge tone="neutral">Ended</Badge>,
  },
];

const FILTERS = { email: '', app: '', status: 'active' } as const;

function StaffPage() {
  const url = useTableUrl({ filters: FILTERS });
  const [failOnce, setFailOnce] = useState(false);
  const [open, setOpen] = useState<Grant | null>(null);
  const { email, app } = url.filters;
  const wanted = PEOPLE.filter(
    (g) =>
      (email === '' || g.email === email) &&
      (app === '' || g.app === app) &&
      g.active === (url.filters.status === 'active'),
  );
  const start = url.cursor === undefined ? 0 : wanted.findIndex((g) => g.id === url.cursor) + 1;
  const rows = wanted.slice(start, start + PAGE);
  const nextCursor = start + PAGE < wanted.length ? (rows.at(-1)?.id ?? null) : null;

  // a pretend server: a moment to answer, and a failure when asked for
  const asked = [url.cursor ?? '', email, app, url.filters.status, String(failOnce)].join('|');
  const [answered, setAnswered] = useState<{ asked: string; status: TableStatus } | null>(null);
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnswered({ asked, status: failOnce ? 'error' : 'ready' });
    }, 400);
    return () => {
      clearTimeout(timer);
    };
  }, [asked, failOnce]);
  const status: TableStatus = answered?.asked === asked ? answered.status : 'loading';

  return (
    <div className="space-y-6">
      <title>People | Data table playground</title>
      <h1 className="font-display text-3xl font-medium">People</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        <Input
          label="Email"
          type="email"
          defaultValue={email}
          key={email}
          onBlur={(event) => {
            url.setFilters({ email: event.currentTarget.value.trim() });
          }}
        />
        <Select
          label="App"
          placeholder="Every app"
          clearable
          options={APPS.map((a) => ({ value: a, label: a.charAt(0).toUpperCase() + a.slice(1) }))}
          value={app === '' ? null : app}
          onChange={(value) => {
            url.setFilters({ app: value ?? '' });
          }}
        />
        <Select
          label="Status"
          options={[
            { value: 'active', label: 'Active' },
            { value: 'ended', label: 'Ended' },
          ]}
          value={url.filters.status}
          onChange={(value) => {
            url.setFilters({ status: value ?? 'active' });
          }}
        />
      </div>
      <div className="flex flex-wrap gap-3">
        {url.filtered && (
          <Button variant="ghost" tone="neutral" size="sm" onClick={url.clearFilters}>
            Clear filters
          </Button>
        )}
        <Button
          variant="outline"
          tone="neutral"
          size="sm"
          onClick={() => {
            setFailOnce((fail) => !fail);
          }}
        >
          {failOnce ? 'Let the server answer' : 'Make the server fail'}
        </Button>
      </div>
      <DataTable
        label="Staff"
        columns={COLUMNS}
        rows={rows}
        rowKey={(g) => g.id}
        status={status}
        errorMessage="The staff list could not be loaded."
        onRetry={() => {
          setFailOnce(false);
        }}
        empty="No staff match these filters."
        onOpen={setOpen}
        openKey={open?.id ?? null}
        footer={
          <CursorPager
            page={url.page}
            nextCursor={nextCursor}
            onNext={url.next}
            onPrevious={url.previous}
            busy={status === 'loading'}
          />
        }
      />
      <Dialog
        open={open !== null}
        onOpenChange={(isOpen) => {
          if (!isOpen) setOpen(null);
        }}
        title={open?.email ?? ''}
        description={open === null ? undefined : `${open.role} in ${open.app}`}
        placement="side"
      >
        <p>Scope: {open?.scope}</p>
      </Dialog>
    </div>
  );
}

const SECTION = [
  { label: 'People', to: '/', end: true },
  { label: 'Invitations', to: '/invitations' },
  { label: 'Roles', to: '/roles' },
];

function Layout() {
  return (
    <AppFrame
      header={
        <header className="border-border border-b">
          <div className="container-page flex min-h-16 items-center gap-3">
            <span className="font-display mr-auto text-lg font-medium">Data table</span>
            <NavList
              items={[{ label: 'Staff', to: '/' }]}
              label="Main"
              className="hidden md:block"
            />
            <ThemeSwitcher />
          </div>
        </header>
      }
    >
      <SectionLayout title="Staff" items={SECTION}>
        <Outlet />
      </SectionLayout>
    </AppFrame>
  );
}

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { index: true, element: <StaffPage /> },
      { path: '/invitations', element: <p>Invitations come in the Master app.</p> },
      { path: '/roles', element: <p>Roles come in the Master app.</p> },
    ],
  },
]);

// what a server-rendered app puts in <head> (ThemeScript)
const themeScript = document.createElement('script');
themeScript.textContent = THEME_SCRIPT;
document.head.prepend(themeScript);

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  );
}
