import { AdminLayout } from '../components/admin/AdminLayout.js';

export function createAdminPlaceholderPage(title) {
  return function AdminPlaceholderPage() {
    return AdminLayout(`
      <section class="admin-placeholder" aria-labelledby="admin-placeholder-title">
        <p class="admin-eyebrow">Administration</p>
        <h1 id="admin-placeholder-title">${title}</h1>
        <p>Cette section sera développée lors d’une prochaine étape du projet.</p>
        <a class="btn btn-primary" href="/administration" data-link>Revenir au tableau de bord</a>
      </section>
    `);
  };
}
