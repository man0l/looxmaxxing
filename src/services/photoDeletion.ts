let clearScanPhotoUris: (() => void) | undefined;

export function registerScanPhotoClear(handler: () => void) {
  clearScanPhotoUris = handler;
}

export function unregisterScanPhotoClear() {
  clearScanPhotoUris = undefined;
}

export function runScanPhotoClear() {
  clearScanPhotoUris?.();
}