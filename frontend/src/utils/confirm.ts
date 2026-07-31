type ConfirmCallback = (result: boolean) => void;

let confirmCallback: ConfirmCallback | null = null;

export const confirmAlert = (message: string): Promise<boolean> => {
  return new Promise((resolve) => {
    confirmCallback = resolve;
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('app-confirm', { detail: message }));
    }
  });
};

export const resolveConfirm = (result: boolean) => {
  if (confirmCallback) {
    confirmCallback(result);
    confirmCallback = null;
  }
};
