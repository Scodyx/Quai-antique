export function initializePasswordToggles(root = document) {
  const cleanupFunctions = [];

  root.querySelectorAll('[data-password-toggle]').forEach((button) => {
    const inputId = button.dataset.passwordTarget;
    const input = root.querySelector(`#${inputId}`);

    if (!input) {
      return;
    }

    const fieldName = button.dataset.passwordLabel ?? 'le mot de passe';

    const handleClick = () => {
      const isVisible = input.type === 'text';
      input.type = isVisible ? 'password' : 'text';
      button.setAttribute('aria-pressed', String(!isVisible));
      button.setAttribute('aria-label', `${isVisible ? 'Afficher' : 'Masquer'} ${fieldName}`);
      button.textContent = isVisible ? 'Afficher' : 'Masquer';
    };

    button.addEventListener('click', handleClick);
    cleanupFunctions.push(() => button.removeEventListener('click', handleClick));
  });

  return () => cleanupFunctions.forEach((cleanup) => cleanup());
}
