import { SERVICES, type Service } from '@beautinique/shared-contracts';

// A subscriber is the service that takes an event (`finance`), or one of its handlers when a
// service has more than one way in (`catalog.reviews`). Its name is the key of its deliveries in
// the outbox and of its records in `processed_events`.
const SUBSCRIBER = /^([a-z]+)(\.[a-z][A-Za-z0-9]{0,63})?$/;
const SERVICE_NAMES = new Set<string>(SERVICES);

/** The service of a subscriber, or a `RangeError` when the name is not one. */
export function subscriberService(subscriber: string): Service {
  const match = SUBSCRIBER.exec(subscriber);
  const service = match?.[1];
  if (service === undefined || !SERVICE_NAMES.has(service)) {
    throw new RangeError(
      `The subscriber ${subscriber} is not <service> or <service>.<name>, with a service of the list.`,
    );
  }
  return service as Service;
}
