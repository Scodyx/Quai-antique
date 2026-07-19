export function cleanupBootstrapOverlayState() {
  document.querySelectorAll('.modal-backdrop, .offcanvas-backdrop').forEach((backdrop) => backdrop.remove());
  document.body.classList.remove('modal-open', 'overflow-hidden');
  document.body.style.removeProperty('padding-right');
  document.body.style.removeProperty('overflow');
}
