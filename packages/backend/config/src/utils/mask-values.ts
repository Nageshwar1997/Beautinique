// A value shorter than this is no secret (a port, `true`), and masking it would spoil the message.
const MIN_MASKED_LENGTH = 8;

/**
 * The message with every long enough value of `values` taken out, as `<value>`. A message that a
 * schema or a rule wrote may quote what it was given; a config error must not (docs/OPERATIONS.md
 * §4 rule 5), so this is the last guard, longest value first.
 */
export function maskValues(message: string, values: readonly string[]): string {
  const secrets = [...new Set(values)]
    .filter((value) => value.length >= MIN_MASKED_LENGTH)
    .sort((a, b) => b.length - a.length);
  return secrets.reduce((text, secret) => text.split(secret).join('<value>'), message);
}
