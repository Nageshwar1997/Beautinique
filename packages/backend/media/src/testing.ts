// The fakes, for tests only: a service's `src` never imports this entry, so no fake reaches a
// production bundle (docs/RULES.md RT-11).
export {
  createFakeMediaProvider,
  type FakeMediaProvider,
  type FakeMediaProviderOptions,
} from './testing/fake-media-provider.ts';
export {
  createFakeObjectStorage,
  type FakeObjectStorage,
  type FakeObjectStorageOptions,
  type FetchedObject,
} from './testing/fake-object-storage.ts';
