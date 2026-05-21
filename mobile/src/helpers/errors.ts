export const VERIFICATION_REQUIRED_CREATE_TASK =
  "Verifiera dig med BankID för att publicera uppdrag.";

export const VERIFICATION_REQUIRED_CREATE_OFFER =
  "Verifiera dig med BankID för att skicka erbjudanden.";

export function getApiErrorStatus(error: unknown): number | undefined {
  const e = error as { response?: { status?: number }; status?: number };
  return e?.response?.status ?? e?.status;
}

export function messageForCreateTaskError(error: unknown): string {
  if (getApiErrorStatus(error) === 403) {
    return VERIFICATION_REQUIRED_CREATE_TASK;
  }
  return "Kunde inte skapa uppdraget. Försök igen.";
}

export function messageForCreateOfferError(error: unknown): string {
  if (getApiErrorStatus(error) === 403) {
    return VERIFICATION_REQUIRED_CREATE_OFFER;
  }
  return "Kunde inte skicka erbjudandet. Försök igen.";
}

export function alertTitleForApiError(error: unknown): string {
  return getApiErrorStatus(error) === 403 ? "Verifiering krävs" : "Fel";
}
