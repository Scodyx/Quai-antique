import { AdminLayout, initAdminLayout } from '../components/admin/AdminLayout.js';
import { createPicture, deletePicture, updatePicture } from '../api/adminApi.js';
import { getPictures, getRestaurant } from '../api/publicApi.js';
import { apiErrorMessage, showFormErrors } from '../utils/formErrors.js';

const SLUG_PATTERN = /^\/[a-z0-9._/-]+$/;

export function AdminGalleryPage() {
  return AdminLayout(`
    <header class="admin-gallery-intro"><p class="admin-eyebrow">Contenus visuels</p><h1>Gestion de la galerie</h1><p>Le fichier doit déjà être présent dans le dossier public du site. Cette interface gère uniquement ses métadonnées.</p></header>
    <div class="alert d-none" data-gallery-admin-message role="status" aria-live="polite"></div>
    <form class="admin-gallery-form" data-picture-form novalidate>
      <input type="hidden" name="id">
      <label for="picture-title">Titre</label><input class="form-control" id="picture-title" name="title" maxlength="128" required><p class="text-danger" data-error-for="title"></p>
      <label for="picture-slug">Chemin public</label><input class="form-control" id="picture-slug" name="slug" placeholder="/images/gallery/nom-image.jpg" maxlength="128" required><p class="form-text">Format attendu : /images/gallery/nom-image.jpg</p><p class="text-danger" data-error-for="slug"></p>
      <figure><img data-picture-preview alt="Aperçu de l’image" hidden><figcaption data-picture-preview-status>Aucun aperçu.</figcaption></figure>
      <button class="btn btn-primary" type="submit">Enregistrer</button><button class="btn btn-secondary" type="reset">Nouveau</button>
    </form>
    <div class="admin-gallery-grid" data-picture-list><p>Chargement…</p></div>
  `);
}

export function initAdminGalleryPage() {
  const cleanup = initAdminLayout();
  const form = document.querySelector('[data-picture-form]');
  const list = document.querySelector('[data-picture-list]');
  const message = document.querySelector('[data-gallery-admin-message]');
  const preview = document.querySelector('[data-picture-preview]');
  const previewStatus = document.querySelector('[data-picture-preview-status]');
  const controller = new AbortController();
  let restaurant = null;
  let pictures = [];
  const announce = (text, type = 'success') => { message.className = `alert alert-${type}`; message.textContent = text; };

  const updatePreview = () => {
    const slug = form.elements.slug.value.trim();
    preview.hidden = !slug;
    preview.src = slug;
    previewStatus.textContent = slug ? 'Chargement de l’aperçu…' : 'Aucun aperçu.';
  };
  preview.addEventListener('load', () => { previewStatus.textContent = 'Aperçu disponible.'; });
  preview.addEventListener('error', () => { preview.hidden = true; previewStatus.textContent = 'Le fichier indiqué est introuvable dans le dossier public.'; });
  form.elements.slug.addEventListener('input', updatePreview);

  const render = () => {
    list.replaceChildren();
    pictures.forEach((picture) => {
      const card = document.createElement('article');
      card.className = 'admin-gallery-card';
      const image = document.createElement('img');
      image.src = picture.slug;
      image.alt = picture.title;
      const title = document.createElement('h2');
      title.textContent = picture.title;
      const path = document.createElement('p');
      path.textContent = picture.slug;
      const edit = document.createElement('button');
      edit.className = 'btn btn-secondary';
      edit.textContent = 'Modifier';
      edit.addEventListener('click', () => {
        form.elements.id.value = picture.id;
        form.elements.title.value = picture.title;
        form.elements.slug.value = picture.slug;
        updatePreview();
        form.scrollIntoView({ behavior: 'smooth' });
      });
      const remove = document.createElement('button');
      remove.className = 'btn btn-danger';
      remove.textContent = 'Supprimer les métadonnées';
      remove.addEventListener('click', async () => {
        if (!window.confirm(`Supprimer les métadonnées de « ${picture.title} » ? Le fichier physique sera conservé.`)) return;
        remove.disabled = true;
        try { await deletePicture(picture.id); await load(); announce('Métadonnées supprimées. Le fichier physique est conservé.'); } catch (error) { announce(apiErrorMessage(error), 'danger'); remove.disabled = false; }
      });
      card.append(image, title, path, edit, document.createTextNode(' '), remove);
      list.append(card);
    });
  };

  const load = async () => {
    [pictures, restaurant] = await Promise.all([
      getPictures({ signal: controller.signal }),
      getRestaurant({ signal: controller.signal }),
    ]);
    render();
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const id = Number(form.elements.id.value);
    const payload = {
      title: form.elements.title.value.trim(),
      slug: form.elements.slug.value.trim(),
      restaurantId: restaurant.id,
    };
    const errors = {};
    if (!payload.title) errors.title = 'Le titre est obligatoire.';
    if (!SLUG_PATTERN.test(payload.slug)) errors.slug = 'Utilisez uniquement minuscules, chiffres, points, tirets, underscores et slashs.';
    if (Object.keys(errors).length) { showFormErrors(form, errors); return; }
    try {
      await (id ? updatePicture(id, payload) : createPicture(payload));
      form.reset(); preview.hidden = true; await load(); announce(id ? 'Image modifiée.' : 'Image ajoutée.');
    } catch (error) { if (error.status === 422) showFormErrors(form, error.data?.fields); announce(apiErrorMessage(error), 'danger'); }
  });
  form.addEventListener('reset', () => { form.elements.id.value = ''; preview.hidden = true; previewStatus.textContent = 'Aucun aperçu.'; });
  load().catch((error) => announce(apiErrorMessage(error), 'danger'));
  return () => { controller.abort(); cleanup?.(); };
}
