export class AiShareConsentError extends Error {
  constructor() {
    super('Permission is needed before photos can be sent to OpenAI.');
    this.name = 'AiShareConsentError';
  }
}

let granted = false;

export function getAiShareGranted(): boolean {
  return granted;
}

export function setAiShareGranted(value: boolean): void {
  granted = value;
}

export function assertAiShareGranted(): void {
  if (!granted) throw new AiShareConsentError();
}

export function isAiShareConsentError(e: unknown): e is AiShareConsentError {
  return e instanceof AiShareConsentError;
}
