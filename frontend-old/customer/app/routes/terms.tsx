import { LegalPage } from '../components/LegalPage';
import type { Route } from './+types/terms';

export const meta: Route.MetaFunction = () => [
  { title: 'Terms of use (dummy) | Beautinique' },
  {
    name: 'description',
    content: 'Sample terms of use of Beautinique, a portfolio project. Not a real agreement.',
  },
];

/** The dummy terms of use the sign-up consent links to (version dummy-1). */
export default function Terms() {
  return (
    <LegalPage
      title="Terms of use"
      updated="2 Nov 2026"
      intro={
        <p>
          Beautinique is an education and portfolio project, not a real shop. These terms show how a
          beauty marketplace would set out its rules. Nothing here is a contract, and no order
          placed on this site is delivered or charged.
        </p>
      }
      sections={[
        {
          heading: 'Your account',
          body: (
            <p>
              You need to be 18 or older to create an account. Keep your password and your
              authenticator to yourself; you are responsible for what is done with your account.
              Tell us at once if you think someone else has used it.
            </p>
          ),
        },
        {
          heading: 'Products and sellers',
          body: (
            <p>
              Products are listed by sellers, who are responsible for what they sell and for the
              details they give. Prices include GST unless the page says otherwise.
            </p>
          ),
        },
        {
          heading: 'Orders, returns and refunds',
          body: (
            <p>
              An order is a request to buy. It is accepted when the seller confirms it. Returns and
              refunds follow the policy shown on the product page at the time of the order.
            </p>
          ),
        },
        {
          heading: 'Fair use',
          body: (
            <p>
              Do not misuse the site: no fake reviews, no reselling against a seller&apos;s terms,
              and no attempts to break into accounts or systems. We may close accounts that do.
            </p>
          ),
        },
        {
          heading: 'Changes to these terms',
          body: (
            <p>
              When these terms change, the version above changes too, and we ask for your consent
              again where the law needs it.
            </p>
          ),
        },
      ]}
    />
  );
}
