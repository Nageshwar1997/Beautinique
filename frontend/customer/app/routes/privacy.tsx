import { LegalPage } from '../components/LegalPage';
import type { Route } from './+types/privacy';

export const meta: Route.MetaFunction = () => [
  { title: 'Privacy notice (dummy) | Beautinique' },
  {
    name: 'description',
    content: 'Sample privacy notice of Beautinique, a portfolio project. Not a real notice.',
  },
];

/** The dummy privacy notice the sign-up consent links to (version dummy-1). */
export default function Privacy() {
  return (
    <LegalPage
      title="Privacy notice"
      updated="2 Nov 2026"
      intro={
        <p>
          Beautinique is an education and portfolio project. This notice shows what a beauty
          marketplace in India would tell you about your personal data under the Digital Personal
          Data Protection Act, 2023. It is a sample, not a real notice.
        </p>
      }
      sections={[
        {
          heading: 'What we collect',
          body: (
            <p>
              Your email address and password (kept only as a secure hash), when you agreed to these
              documents and that you are 18 or older, and the devices you sign in on (the browser
              and the IP address), so you can see them in your account.
            </p>
          ),
        },
        {
          heading: 'Why we use it',
          body: (
            <p>
              To run your account and keep it safe: to sign you in, to email you sign-in codes and
              security alerts, and to stop misuse. We do not sell your data.
            </p>
          ),
        },
        {
          heading: 'How long we keep it',
          body: (
            <p>
              As long as your account is open, and after that only as long as the law asks (for
              example, tax records of orders).
            </p>
          ),
        },
        {
          heading: 'Your rights',
          body: (
            <p>
              You can see, correct and delete your data, and withdraw your consent. Ask our
              grievance officer at privacy@beautinique.example (a sample address).
            </p>
          ),
        },
        {
          heading: 'Cookies',
          body: (
            <p>
              We use only the cookies the site needs: your theme, and the cookies that keep you
              signed in. No advertising or tracking cookies.
            </p>
          ),
        },
      ]}
    />
  );
}
