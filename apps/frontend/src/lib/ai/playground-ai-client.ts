const toErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Unknown AI request error.';

export const normalizeAiError = (error: unknown) => toErrorMessage(error);
