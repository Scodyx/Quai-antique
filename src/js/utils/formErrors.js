export function clearFormErrors(form) {
  form.querySelectorAll('.is-invalid').forEach((input) => input.classList.remove('is-invalid'));
  form.querySelectorAll('[data-error-for]').forEach((element) => {
    element.textContent = '';
  });
}

export function showFormErrors(form, fields = {}) {
  clearFormErrors(form);
  let firstInvalid = null;
  Object.entries(fields).forEach(([name, message]) => {
    const input = form.elements.namedItem(name);
    const error = form.querySelector(`[data-error-for="${name}"]`);
    if (input instanceof HTMLElement) {
      input.classList.add('is-invalid');
      input.setAttribute('aria-invalid', 'true');
      firstInvalid ??= input;
    }
    if (error) error.textContent = message;
  });
  firstInvalid?.focus();
}

export function apiErrorMessage(error) {
  if (error?.status === 403) return 'Vous n’avez pas l’autorisation d’effectuer cette action.';
  if (error?.status === 404) return error.message || 'Élément introuvable.';
  if (error?.status === 409) return error.message;
  if (error?.status === 422) return 'Veuillez corriger les champs signalés.';
  return 'Impossible d’effectuer cette action pour le moment.';
}
