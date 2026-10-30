// Playground: every component in working examples, inside the shell (theme switcher for light and
// dark). `npm run playground --workspace @beautinique/frontend-components`, http://localhost:5184.
import './playground.css';

import { AppFrame, THEME_SCRIPT, ThemeSwitcher } from '@beautinique/frontend-app-shell';
import {
  IconBox,
  IconClose,
  IconDelivery,
  IconFaceScan,
  IconPalette,
  IconShieldCheck,
  IconTagPrice,
} from '@beautinique/frontend-icons';
import { type ReactNode, StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';

import {
  Button,
  BUTTON_SIZES,
  BUTTON_VARIANTS,
  Checkbox,
  clearToasts,
  CodeInput,
  Dialog,
  Input,
  PasswordInput,
  Radio,
  RadioGroup,
  Spinner,
  toast,
  Toaster,
  TONES,
  Tooltip,
} from '../src/index';
import { Pickers } from './pickers';

function Card({ title, id, children }: { title: string; id: string; children: ReactNode }) {
  return (
    <section className="border-border bg-surface rounded-2xl border p-5" aria-labelledby={id}>
      <h2 id={id} className="font-display text-xl font-medium">
        {title}
      </h2>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

function Buttons() {
  const [loading, setLoading] = useState(false);
  return (
    <Card title="Button" id="buttons">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="primary" loading={loading}>
          Sign in
        </Button>
        <Button
          variant="outline"
          tone="neutral"
          onClick={() => {
            setLoading((was) => !was);
          }}
        >
          {loading ? 'Stop loading' : 'Show loading'}
        </Button>
        <Button startIcon={<IconTagPrice size={18} />} loading={loading}>
          Add offer
        </Button>
        <Button variant="soft" endIcon={<IconDelivery size={18} />}>
          Track order
        </Button>
        <Button disabled>Disabled</Button>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {BUTTON_SIZES.map((size) => (
          <Button key={size} size={size} variant="solid">
            Size {size}
          </Button>
        ))}
        {BUTTON_SIZES.map((size) => (
          <Button
            key={`icon-${size}`}
            size={size}
            variant="ghost"
            tone="neutral"
            icon={<IconClose size={size === 'lg' ? 22 : 18} />}
            aria-label={`Close (${size})`}
          />
        ))}
      </div>
      <Button variant="primary" size="lg" fullWidth>
        Place order
      </Button>
      <div className="overflow-x-auto">
        <table className="border-separate border-spacing-2 text-sm">
          <thead>
            <tr>
              <th scope="col" className="text-foreground-muted text-start font-medium">
                tone
              </th>
              {BUTTON_VARIANTS.filter((variant) => variant !== 'primary').map((variant) => (
                <th
                  key={variant}
                  scope="col"
                  className="text-foreground-muted text-start font-medium"
                >
                  {variant}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TONES.map((tone) => (
              <tr key={tone}>
                <th scope="row" className="pe-2 text-start font-mono font-normal">
                  {tone}
                </th>
                {BUTTON_VARIANTS.filter((variant) => variant !== 'primary').map((variant) => (
                  <td key={variant}>
                    <Button variant={variant} tone={tone} size="sm">
                      Save
                    </Button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function Inputs() {
  const [email, setEmail] = useState('');
  const [tried, setTried] = useState(false);
  const [code, setCode] = useState('');
  const emailError = tried && !email.includes('@') ? 'Enter an email like name@example.com' : '';
  return (
    <Card title="Input, PasswordInput, CodeInput" id="inputs">
      <Input
        label="Email"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(event) => {
          setEmail(event.target.value);
        }}
        hint="We send the sign-in code here"
        error={emailError}
      />
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          setTried(true);
        }}
      >
        Check email
      </Button>
      <PasswordInput label="Password" autoComplete="new-password" hint="At least 12 characters" />
      <Input
        label="Search"
        type="search"
        startIcon={<IconFaceScan size={18} />}
        placeholder="Lipstick, serum…"
      />
      <Input label="Disabled" disabled defaultValue="Can't change this" />
      <CodeInput
        label="Code from the email"
        value={code}
        onChange={setCode}
        onComplete={(value) => {
          toast({ tone: 'success', title: 'Code complete', description: value });
        }}
        hint="6 digits; pasting works"
        error={code.startsWith('0') ? 'A code never starts with 0' : ''}
      />
    </Card>
  );
}

function Choices() {
  const [terms, setTerms] = useState(false);
  const [tried, setTried] = useState(false);
  const [picked, setPicked] = useState<readonly string[]>(['serum']);
  const all = ['serum', 'lipstick', 'kajal'];
  const [speed, setSpeed] = useState('standard');
  return (
    <Card title="Checkbox, RadioGroup" id="choices">
      <Checkbox
        isSelected={terms}
        onChange={setTerms}
        isRequired
        hint="You can read them on the next page"
        error={tried && !terms ? 'Please accept the terms to go on' : ''}
      >
        I accept the terms
      </Checkbox>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          setTried(true);
        }}
      >
        Continue
      </Button>
      <div>
        <Checkbox
          isSelected={picked.length === all.length}
          isIndeterminate={picked.length > 0 && picked.length < all.length}
          onChange={(on) => {
            setPicked(on ? all : []);
          }}
        >
          All products
        </Checkbox>
        <div className="ps-8">
          {all.map((item) => (
            <Checkbox
              key={item}
              isSelected={picked.includes(item)}
              onChange={(on) => {
                setPicked((was) => (on ? [...was, item] : was.filter((one) => one !== item)));
              }}
            >
              {item}
            </Checkbox>
          ))}
        </div>
      </div>
      <Checkbox isDisabled defaultSelected>
        Disabled
      </Checkbox>
      <RadioGroup label="Delivery" hint="Free above ₹499" value={speed} onChange={setSpeed}>
        <Radio value="standard" hint="3–5 days">
          Standard
        </Radio>
        <Radio value="express" hint="1–2 days, ₹99">
          Express
        </Radio>
        <Radio value="same-day" isDisabled hint="Not in your city yet">
          Same day
        </Radio>
      </RadioGroup>
      <RadioGroup
        label="Size"
        orientation="horizontal"
        defaultValue="m"
        error="This size is sold out"
      >
        <Radio value="s">S</Radio>
        <Radio value="m">M</Radio>
        <Radio value="l">L</Radio>
      </RadioGroup>
    </Card>
  );
}

function Dialogs() {
  const [open, setOpen] = useState<'none' | 'info' | 'delete'>('none');
  const close = () => {
    setOpen('none');
  };
  return (
    <Card title="Dialog, Tooltip, Spinner" id="dialogs">
      <div className="flex flex-wrap gap-3">
        <Button
          variant="outline"
          onClick={() => {
            setOpen('info');
          }}
        >
          Open a dialog
        </Button>
        <Button
          variant="soft"
          tone="error"
          onClick={() => {
            setOpen('delete');
          }}
        >
          Delete address
        </Button>
      </div>
      <Dialog
        open={open === 'info'}
        onOpenChange={(next) => {
          if (!next) close();
        }}
        title="Shade guide"
        description="How we name our shades"
        footer={<Button onClick={close}>Got it</Button>}
      >
        <p className="text-sm">
          Every shade has a name and a number. Escape, a click outside or the close button close
          this dialog.
        </p>
      </Dialog>
      <Dialog
        open={open === 'delete'}
        onOpenChange={(next) => {
          if (!next) close();
        }}
        role="alertdialog"
        dismissable={false}
        size="sm"
        title="Delete this address?"
        description="Home, Pune. It goes from every order form."
        footer={
          <>
            <Button variant="outline" tone="neutral" onClick={close}>
              Cancel
            </Button>
            <Button
              tone="error"
              onClick={() => {
                close();
                toast({
                  tone: 'success',
                  title: 'Address deleted',
                  action: {
                    label: 'Undo',
                    onAction: () => toast({ title: 'Address back' }),
                  },
                });
              }}
            >
              Delete
            </Button>
          </>
        }
      />
      <div className="flex flex-wrap items-center gap-2">
        <Tooltip content="Your orders">
          <Button variant="ghost" tone="neutral" icon={<IconBox size={20} />} aria-label="Orders" />
        </Tooltip>
        <Tooltip content="Try it on" placement="bottom">
          <Button
            variant="ghost"
            tone="neutral"
            icon={<IconFaceScan size={20} />}
            aria-label="Try on"
          />
        </Tooltip>
        <Tooltip content="Change the colours">
          <Button
            variant="ghost"
            tone="neutral"
            icon={<IconPalette size={20} />}
            aria-label="Theme"
          />
        </Tooltip>
        <Spinner label="Loading orders" size="lg" className="text-brand ms-4" />
      </div>
    </Card>
  );
}

function Toasts() {
  return (
    <Card title="Toast" id="toasts">
      <div className="flex flex-wrap gap-3">
        <Button
          variant="soft"
          tone="success"
          onClick={() => toast({ tone: 'success', title: 'Address saved' })}
        >
          Success
        </Button>
        <Button
          variant="soft"
          tone="info"
          onClick={() => toast({ title: 'New offer', description: '20% off serums until Sunday' })}
        >
          Info
        </Button>
        <Button
          variant="soft"
          tone="warning"
          onClick={() =>
            toast({ id: 'offline', tone: 'warning', title: 'You are offline (one at a time)' })
          }
        >
          Warning (same id)
        </Button>
        <Button
          variant="soft"
          tone="error"
          onClick={() =>
            toast({ tone: 'error', title: 'Could not pay', description: 'Nothing was charged.' })
          }
        >
          Error (stays)
        </Button>
        <Button
          variant="ghost"
          tone="neutral"
          startIcon={<IconShieldCheck size={18} />}
          onClick={clearToasts}
        >
          Clear all
        </Button>
      </div>
      <p className="text-foreground-muted text-sm">
        Hover or focus a toast to stop its clock; swipe it sideways to dismiss.
      </p>
    </Card>
  );
}

function Page() {
  return (
    <AppFrame
      header={
        <header className="border-border border-b">
          <div className="container-page flex min-h-16 items-center gap-4">
            <h1 className="font-display text-brand-gradient mr-auto text-2xl font-medium">
              Components
            </h1>
            <ThemeSwitcher />
          </div>
        </header>
      }
    >
      <div className="container-page grid grid-cols-1 gap-5 py-8 lg:grid-cols-2">
        <div className="lg:col-span-2">
          <Buttons />
        </div>
        <Inputs />
        <Choices />
        <Dialogs />
        <Toasts />
        <Pickers />
      </div>
      <Toaster />
    </AppFrame>
  );
}

const router = createBrowserRouter([{ path: '/', Component: Page }]);

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
