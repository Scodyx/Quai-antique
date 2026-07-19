import Modal from 'bootstrap/js/dist/modal';

import { AdminLayout, initAdminLayout } from '../components/admin/AdminLayout.js';
import { cleanupBootstrapOverlayState } from '../utils/bootstrapCleanup.js';
import { escapeHtml, normalizeText } from '../utils/textUtils.js';

const CATEGORIES = ['Restaurant', 'Plats', 'Équipe', 'Ambiance'];
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Ces éléments simulés seront remplacés par ceux récupérés depuis l’API Symfony.
const MOCK_GALLERY_ITEMS = [
  { id: 401, title: 'Salle du restaurant', alternativeText: 'Salle élégante du restaurant Quai Antique', category: 'Restaurant', isPublished: true, order: 1, visualVariant: 'gallery-visual--forest' },
  { id: 402, title: 'Entrée raffinée', alternativeText: 'Entrée gastronomique dressée avec soin', category: 'Plats', isPublished: true, order: 2, visualVariant: 'gallery-visual--copper' },
  { id: 403, title: 'Dessert du chef', alternativeText: 'Dessert du chef aux notes fruitées', category: 'Plats', isPublished: true, order: 3, visualVariant: 'gallery-visual--berry' },
  { id: 404, title: 'Terrasse au bord de l’eau', alternativeText: 'Terrasse du restaurant donnant sur le quai', category: 'Restaurant', isPublished: false, order: 4, visualVariant: 'gallery-visual--water' },
  { id: 405, title: 'Plat de saison', alternativeText: 'Plat composé de produits frais de saison', category: 'Plats', isPublished: true, order: 5, visualVariant: 'gallery-visual--sage' },
  { id: 406, title: 'Équipe en cuisine', alternativeText: 'Équipe du restaurant travaillant en cuisine', category: 'Équipe', isPublished: true, order: 6, visualVariant: 'gallery-visual--kitchen' },
  { id: 407, title: 'Vue sur le quai', alternativeText: 'Vue paisible sur le quai depuis le restaurant', category: 'Ambiance', isPublished: false, order: 7, visualVariant: 'gallery-visual--quay' },
  { id: 408, title: 'Menu découverte', alternativeText: 'Assortiment du menu découverte du restaurant', category: 'Plats', isPublished: true, order: 8, visualVariant: 'gallery-visual--gold' },
  { id: 409, title: 'Dressage d’une assiette', alternativeText: 'Chef dressant précisément une assiette', category: 'Équipe', isPublished: true, order: 9, visualVariant: 'gallery-visual--copper' },
  { id: 410, title: 'Cuisine du chef', alternativeText: 'Chef préparant un plat dans sa cuisine', category: 'Équipe', isPublished: false, order: 10, visualVariant: 'gallery-visual--kitchen' },
  { id: 411, title: 'Service en salle', alternativeText: 'Équipe assurant le service dans la salle', category: 'Équipe', isPublished: true, order: 11, visualVariant: 'gallery-visual--forest' },
  { id: 412, title: 'Ambiance du soir', alternativeText: 'Salle du restaurant dans une ambiance du soir', category: 'Ambiance', isPublished: true, order: 12, visualVariant: 'gallery-visual--evening' },
];

function sortAndNormalize(items) {
  items.sort((first, second) => first.order - second.order);
  items.forEach((item, index) => { item.order = index + 1; });
}

function getIndicators(items) {
  return [
    { label: 'Nombre total d’éléments', value: items.length, detail: 'Tous les éléments de la collection locale' },
    { label: 'Éléments publiés', value: items.filter((item) => item.isPublished).length, detail: 'Éléments actuellement visibles' },
    { label: 'Éléments masqués', value: items.filter((item) => !item.isPublished).length, detail: 'Éléments conservés mais non publiés' },
    { label: 'Catégories utilisées', value: new Set(items.map((item) => item.category)).size, detail: 'Catégories représentées dans la collection' },
  ];
}

function filterItems(items, filters) {
  const search = normalizeText(filters.search).toLocaleLowerCase('fr-FR');
  return items
    .filter((item) => filters.category === 'all' || item.category === filters.category)
    .filter((item) => filters.status === 'all' || (filters.status === 'published' ? item.isPublished : !item.isPublished))
    .filter((item) => !search || `${item.title} ${item.alternativeText}`.toLocaleLowerCase('fr-FR').includes(search))
    .sort((first, second) => first.order - second.order);
}

function createIndicators(items) {
  return getIndicators(items).map((indicator) => `
    <article class="admin-gallery-indicator"><p>${indicator.label}</p><strong>${indicator.value}</strong><span>${indicator.detail}</span></article>
  `).join('');
}

function createVisual(item, className = '') {
  if (item.previewUrl) {
    return `<img class="${className}" src="${escapeHtml(item.previewUrl)}" alt="${escapeHtml(item.alternativeText)}">`;
  }
  return `<div class="image-placeholder ${escapeHtml(item.visualVariant)} ${className}" role="img" aria-label="${escapeHtml(item.alternativeText)}"></div>`;
}

function createCard(item, totalItems) {
  const status = item.isPublished ? 'Publié' : 'Masqué';
  return `
    <article class="admin-gallery-card${item.isPublished ? '' : ' admin-gallery-card--hidden'}">
      ${createVisual(item, 'admin-gallery-card__visual')}
      <div class="admin-gallery-card__body">
        <div class="admin-gallery-card__heading"><h2>${escapeHtml(item.title)}</h2><span class="admin-gallery-status admin-gallery-status--${item.isPublished ? 'published' : 'hidden'}">${status}</span></div>
        <p class="admin-gallery-card__category">${escapeHtml(item.category)}</p>
        <p class="admin-gallery-card__alt"><strong>Texte alternatif :</strong> ${escapeHtml(item.alternativeText)}</p>
        ${item.fileName ? `<p class="admin-gallery-card__file"><strong>Fichier local :</strong> ${escapeHtml(item.fileName)}</p>` : ''}
        <p class="admin-gallery-card__order">Position ${item.order} sur ${totalItems}</p>
        <div class="admin-gallery-card__actions">
          <button class="btn btn-secondary" type="button" data-gallery-action="edit" data-gallery-id="${item.id}" aria-label="Modifier ${escapeHtml(item.title)}">Modifier</button>
          <button class="btn btn-secondary" type="button" data-gallery-action="publish" data-gallery-id="${item.id}" aria-label="${item.isPublished ? 'Masquer' : 'Publier'} ${escapeHtml(item.title)}">${item.isPublished ? 'Masquer' : 'Publier'}</button>
          <button class="btn admin-gallery-order-button" type="button" data-gallery-action="up" data-gallery-id="${item.id}" aria-label="Monter ${escapeHtml(item.title)} dans l’ordre d’affichage" ${item.order === 1 ? 'disabled' : ''}>Monter</button>
          <button class="btn admin-gallery-order-button" type="button" data-gallery-action="down" data-gallery-id="${item.id}" aria-label="Descendre ${escapeHtml(item.title)} dans l’ordre d’affichage" ${item.order === totalItems ? 'disabled' : ''}>Descendre</button>
          <button class="btn admin-gallery-delete-button" type="button" data-gallery-action="delete" data-gallery-id="${item.id}" aria-label="Supprimer ${escapeHtml(item.title)}">Supprimer</button>
        </div>
      </div>
    </article>
  `;
}

function prepareMetadata(item) {
  return { id: item.id, title: item.title, alternativeText: item.alternativeText, category: item.category, isPublished: item.isPublished, order: item.order };
}

function preparePublication(item) {
  return { id: item.id, isPublished: item.isPublished };
}

function prepareOrder(items) {
  return { items: items.map(({ id, order }) => ({ id, order })) };
}

function prepareDeletion(id) {
  return { id };
}

function createFormModal() {
  return `
    <div class="modal fade admin-gallery-modal" id="admin-gallery-form-modal" tabindex="-1" aria-labelledby="admin-gallery-form-title" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-lg"><div class="modal-content">
        <div class="modal-header"><h2 class="modal-title" id="admin-gallery-form-title">Ajouter une image</h2><button class="btn-close" type="button" data-bs-dismiss="modal" aria-label="Fermer"></button></div>
        <form id="admin-gallery-form" novalidate>
          <div class="modal-body"><div class="admin-gallery-form-grid">
            <div class="admin-gallery-field admin-gallery-field--full"><label for="admin-gallery-file">Image</label><input class="form-control" id="admin-gallery-file" type="file" accept="image/jpeg,image/png,image/webp" aria-describedby="admin-gallery-file-help admin-gallery-file-error"><p class="admin-gallery-help" id="admin-gallery-file-help">JPEG, PNG ou WebP, 5 Mo maximum. Le fichier reste uniquement en mémoire.</p><p class="admin-gallery-error" id="admin-gallery-file-error"></p></div>
            <div class="admin-gallery-field"><label for="admin-gallery-title">Titre</label><input class="form-control" id="admin-gallery-title" type="text" maxlength="100" aria-describedby="admin-gallery-title-error" required><p class="admin-gallery-error" id="admin-gallery-title-error"></p></div>
            <div class="admin-gallery-field"><label for="admin-gallery-category">Catégorie</label><select class="form-select" id="admin-gallery-category" aria-describedby="admin-gallery-category-error" required><option value="">Sélectionner une catégorie</option>${CATEGORIES.map((category) => `<option value="${category}">${category}</option>`).join('')}</select><p class="admin-gallery-error" id="admin-gallery-category-error"></p></div>
            <div class="admin-gallery-field admin-gallery-field--full"><label for="admin-gallery-alt">Texte alternatif</label><textarea class="form-control" id="admin-gallery-alt" rows="3" maxlength="180" aria-describedby="admin-gallery-alt-help admin-gallery-alt-error" required></textarea><p class="admin-gallery-help" id="admin-gallery-alt-help">Décrivez brièvement le contenu utile de l’image.</p><p class="admin-gallery-error" id="admin-gallery-alt-error"></p></div>
            <div class="form-check form-switch admin-gallery-publish admin-gallery-field--full"><input class="form-check-input" id="admin-gallery-published" type="checkbox"><label class="form-check-label" for="admin-gallery-published">Publier immédiatement</label></div>
            <div class="admin-gallery-preview admin-gallery-field--full" id="admin-gallery-preview" aria-live="polite"><p>Aucune nouvelle image sélectionnée.</p></div>
          </div></div>
          <div class="modal-footer"><button class="btn btn-secondary" type="button" data-bs-dismiss="modal">Fermer</button><button class="btn btn-primary" id="admin-gallery-submit" type="submit">Ajouter à la galerie</button></div>
        </form>
      </div></div>
    </div>
  `;
}

function createDeleteModal() {
  return `
    <div class="modal fade admin-gallery-modal" id="admin-gallery-delete-modal" tabindex="-1" aria-labelledby="admin-gallery-delete-title" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered"><div class="modal-content">
        <div class="modal-header"><h2 class="modal-title" id="admin-gallery-delete-title">Supprimer l’image</h2><button class="btn-close" type="button" data-bs-dismiss="modal" aria-label="Fermer"></button></div>
        <div class="modal-body"><p>Cette suppression est uniquement simulée.</p><dl class="admin-gallery-delete-summary" id="admin-gallery-delete-summary"></dl></div>
        <div class="modal-footer"><button class="btn btn-secondary" type="button" data-bs-dismiss="modal">Conserver l’image</button><button class="btn btn-danger" id="admin-gallery-confirm-delete" type="button">Supprimer l’image</button></div>
      </div></div>
    </div>
  `;
}

export function AdminGalleryPage() {
  return AdminLayout(`
    <header class="admin-gallery-intro"><div><p class="admin-eyebrow">Contenus visuels</p><h1>Gestion de la galerie</h1><p>Consultez et organisez les visuels du restaurant. Les données, placeholders et éventuels aperçus sont uniquement simulés.</p></div><button class="btn btn-primary" id="admin-gallery-add" type="button">Ajouter une image</button></header>
    <div class="admin-gallery-live alert d-none" id="admin-gallery-live" role="status" aria-live="polite" tabindex="-1"></div>
    <section class="admin-gallery-indicators" id="admin-gallery-indicators" aria-label="Indicateurs de la galerie"></section>
    <section class="admin-gallery-filters" aria-labelledby="admin-gallery-filters-title"><h2 id="admin-gallery-filters-title">Recherche et filtres</h2><div class="admin-gallery-filter-grid">
      <div class="admin-gallery-field"><label for="admin-gallery-search">Rechercher dans la galerie</label><input class="form-control" id="admin-gallery-search" type="search" autocomplete="off"></div>
      <div class="admin-gallery-field"><label for="admin-gallery-category-filter">Catégorie</label><select class="form-select" id="admin-gallery-category-filter"><option value="all">Toutes les catégories</option>${CATEGORIES.map((category) => `<option value="${category}">${category}</option>`).join('')}</select></div>
      <div class="admin-gallery-field"><label for="admin-gallery-status-filter">Statut</label><select class="form-select" id="admin-gallery-status-filter"><option value="all">Tous les statuts</option><option value="published">Publiés</option><option value="hidden">Masqués</option></select></div>
      <button class="btn admin-gallery-reset" id="admin-gallery-reset" type="button">Réinitialiser les filtres</button>
    </div></section>
    <section class="admin-gallery-results" aria-labelledby="admin-gallery-results-title"><div class="admin-gallery-results__heading"><h2 id="admin-gallery-results-title">Éléments de la galerie</h2><p id="admin-gallery-count"></p></div><div id="admin-gallery-grid" aria-live="polite"></div></section>
    ${createFormModal()}${createDeleteModal()}
  `);
}

export function initAdminGalleryPage() {
  const cleanupAdminLayout = initAdminLayout();
  const addButton = document.querySelector('#admin-gallery-add');
  const indicators = document.querySelector('#admin-gallery-indicators');
  const grid = document.querySelector('#admin-gallery-grid');
  const count = document.querySelector('#admin-gallery-count');
  const liveRegion = document.querySelector('#admin-gallery-live');
  const filters = { search: document.querySelector('#admin-gallery-search'), category: document.querySelector('#admin-gallery-category-filter'), status: document.querySelector('#admin-gallery-status-filter') };
  const resetFilters = document.querySelector('#admin-gallery-reset');
  const formModalElement = document.querySelector('#admin-gallery-form-modal');
  const deleteModalElement = document.querySelector('#admin-gallery-delete-modal');
  const form = document.querySelector('#admin-gallery-form');
  const submitButton = document.querySelector('#admin-gallery-submit');
  const preview = document.querySelector('#admin-gallery-preview');
  const deleteSummary = document.querySelector('#admin-gallery-delete-summary');
  const confirmDelete = document.querySelector('#admin-gallery-confirm-delete');
  const required = [addButton, indicators, grid, count, liveRegion, ...Object.values(filters), resetFilters, formModalElement, deleteModalElement, form, submitButton, preview, deleteSummary, confirmDelete];
  if (required.some((element) => !element)) { cleanupAdminLayout?.(); return undefined; }

  const inputs = { file: form.querySelector('#admin-gallery-file'), title: form.querySelector('#admin-gallery-title'), alternativeText: form.querySelector('#admin-gallery-alt'), category: form.querySelector('#admin-gallery-category'), isPublished: form.querySelector('#admin-gallery-published') };
  const errors = { file: form.querySelector('#admin-gallery-file-error'), title: form.querySelector('#admin-gallery-title-error'), alternativeText: form.querySelector('#admin-gallery-alt-error'), category: form.querySelector('#admin-gallery-category-error') };
  if ([...Object.values(inputs), ...Object.values(errors)].some((element) => !element)) { cleanupAdminLayout?.(); return undefined; }

  const items = MOCK_GALLERY_ITEMS.map((item) => ({ ...item }));
  const activeBlobUrls = new Set();
  const listeners = [];
  const formModal = Modal.getOrCreateInstance(formModalElement);
  const deleteModal = Modal.getOrCreateInstance(deleteModalElement);
  let nextId = Math.max(...items.map((item) => item.id)) + 1;
  let editingId = null;
  let deletingId = null;
  let pendingPreviewUrl = null;
  let pendingFile = null;
  let focusLiveAfterModal = false;

  function addListener(element, eventName, handler) { element.addEventListener(eventName, handler); listeners.push(() => element.removeEventListener(eventName, handler)); }
  function getFilters() { return { search: filters.search.value, category: filters.category.value, status: filters.status.value }; }
  function findItem(id) { return items.find((item) => item.id === id); }
  function announce(message) { liveRegion.textContent = message; liveRegion.className = 'admin-gallery-live alert alert-success'; }
  function setError(input, error, message) { error.textContent = message; input.classList.toggle('is-invalid', Boolean(message)); input.setAttribute('aria-invalid', String(Boolean(message))); return !message; }

  function render() {
    sortAndNormalize(items);
    const filtered = filterItems(items, getFilters());
    indicators.innerHTML = createIndicators(items);
    count.textContent = `${filtered.length} élément${filtered.length > 1 ? 's' : ''} affiché${filtered.length > 1 ? 's' : ''}.`;
    grid.className = filtered.length ? 'admin-gallery-grid' : '';
    grid.innerHTML = filtered.length
      ? filtered.map((item) => createCard(item, items.length)).join('')
      : '<p class="admin-gallery-empty">Aucun élément de galerie ne correspond aux critères sélectionnés.</p>';
  }

  function revokeBlobUrl(url) {
    if (url && activeBlobUrls.has(url)) { URL.revokeObjectURL(url); activeBlobUrls.delete(url); }
  }

  function clearPendingPreview() {
    revokeBlobUrl(pendingPreviewUrl);
    pendingPreviewUrl = null; pendingFile = null;
  }

  function renderPreview(item = null) {
    if (pendingPreviewUrl && pendingFile) {
      preview.innerHTML = `<img src="${escapeHtml(pendingPreviewUrl)}" alt="Aperçu local : ${escapeHtml(inputs.alternativeText.value || pendingFile.name)}"><p><strong>Fichier sélectionné :</strong> ${escapeHtml(pendingFile.name)} — ${(pendingFile.size / (1024 * 1024)).toFixed(2)} Mo</p>`;
    } else if (item) {
      preview.innerHTML = `${createVisual(item, 'admin-gallery-preview__visual')}<p>${item.fileName ? `Fichier local actuel : ${escapeHtml(item.fileName)}` : 'Placeholder simulé actuel'}</p>`;
    } else {
      preview.innerHTML = '<p>Aucune nouvelle image sélectionnée.</p>';
    }
  }

  function validateFile(file, isRequired) {
    let message = '';
    if (!file && isRequired) message = 'Sélectionnez une image JPEG, PNG ou WebP.';
    else if (file && !ALLOWED_IMAGE_TYPES.includes(file.type)) message = 'Sélectionnez une image JPEG, PNG ou WebP.';
    else if (file && file.size > MAX_FILE_SIZE) message = 'Le fichier ne doit pas dépasser 5 Mo.';
    return setError(inputs.file, errors.file, message);
  }

  function handleFileChange() {
    const file = inputs.file.files?.[0] ?? null;
    clearPendingPreview();
    if (!validateFile(file, editingId === null)) { inputs.file.value = ''; renderPreview(editingId ? findItem(editingId) : null); return; }
    if (!file) { renderPreview(editingId ? findItem(editingId) : null); return; }
    pendingPreviewUrl = URL.createObjectURL(file); activeBlobUrls.add(pendingPreviewUrl); pendingFile = file; renderPreview();
  }

  function openAddModal() {
    editingId = null; clearPendingPreview(); form.reset();
    document.querySelector('#admin-gallery-form-title').textContent = 'Ajouter une image'; submitButton.textContent = 'Ajouter à la galerie';
    Object.keys(errors).forEach((key) => setError(inputs[key], errors[key], '')); renderPreview(); formModal.show();
  }

  function openEditModal(item) {
    editingId = item.id; clearPendingPreview(); form.reset();
    inputs.title.value = item.title; inputs.alternativeText.value = item.alternativeText; inputs.category.value = item.category; inputs.isPublished.checked = item.isPublished;
    document.querySelector('#admin-gallery-form-title').textContent = 'Modifier l’image'; submitButton.textContent = 'Enregistrer les modifications';
    Object.keys(errors).forEach((key) => setError(inputs[key], errors[key], '')); renderPreview(item); formModal.show();
  }

  function validateForm() {
    inputs.title.value = normalizeText(inputs.title.value); inputs.alternativeText.value = normalizeText(inputs.alternativeText.value);
    const fileValid = validateFile(inputs.file.files?.[0] ?? null, editingId === null && !pendingPreviewUrl);
    const titleValid = setError(inputs.title, errors.title, inputs.title.value.length >= 2 && inputs.title.value.length <= 100 ? '' : 'Le titre doit contenir entre 2 et 100 caractères.');
    const altValid = setError(inputs.alternativeText, errors.alternativeText, inputs.alternativeText.value.length >= 5 && inputs.alternativeText.value.length <= 180 ? '' : 'Le texte alternatif doit contenir entre 5 et 180 caractères.');
    const categoryValid = setError(inputs.category, errors.category, CATEGORIES.includes(inputs.category.value) ? '' : 'Sélectionnez une catégorie valide.');
    return fileValid && titleValid && altValid && categoryValid;
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!validateForm()) { form.querySelector('.is-invalid')?.focus(); return; }
    if (editingId === null) {
      const item = { id: nextId, title: inputs.title.value, alternativeText: inputs.alternativeText.value, category: inputs.category.value, isPublished: inputs.isPublished.checked, order: items.length + 1, visualVariant: 'gallery-visual--forest', previewUrl: pendingPreviewUrl, fileName: pendingFile.name };
      nextId += 1; items.push(item); pendingPreviewUrl = null; pendingFile = null; prepareMetadata(item);
      announce('L’ajout est simulé. L’image sera téléversée lors du branchement à l’API Symfony.');
    } else {
      const item = findItem(editingId); if (!item) return;
      if (pendingPreviewUrl && pendingFile) { revokeBlobUrl(item.previewUrl); item.previewUrl = pendingPreviewUrl; item.fileName = pendingFile.name; pendingPreviewUrl = null; pendingFile = null; }
      Object.assign(item, { title: inputs.title.value, alternativeText: inputs.alternativeText.value, category: inputs.category.value, isPublished: inputs.isPublished.checked }); prepareMetadata(item);
      announce('La modification est simulée. Les métadonnées et le fichier seront enregistrés ultérieurement par l’API Symfony.');
    }
    // Le véritable téléversement utilisera plus tard l’API Symfony et un envoi multipart adapté.
    render(); focusLiveAfterModal = true; formModal.hide();
  }

  function moveItem(item, direction) {
    sortAndNormalize(items); const index = items.indexOf(item); const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= items.length) return;
    const target = items[targetIndex]; [item.order, target.order] = [target.order, item.order]; sortAndNormalize(items); prepareOrder(items);
    render(); announce(`${item.title} a été ${direction < 0 ? 'monté' : 'descendu'} dans l’ordre d’affichage. Le changement reste local.`);
  }

  function handleCardAction(event) {
    const button = event.target.closest('[data-gallery-action]'); if (!button || button.disabled) return;
    const item = findItem(Number(button.dataset.galleryId)); if (!item) return;
    const action = button.dataset.galleryAction;
    if (action === 'edit') openEditModal(item);
    else if (action === 'publish') { item.isPublished = !item.isPublished; preparePublication(item); render(); announce(`${item.title} est maintenant ${item.isPublished ? 'publié' : 'masqué'}. Le changement reste local.`); }
    else if (action === 'up') moveItem(item, -1);
    else if (action === 'down') moveItem(item, 1);
    else if (action === 'delete') {
      deletingId = item.id;
      deleteSummary.innerHTML = `<div><dt>Titre</dt><dd>${escapeHtml(item.title)}</dd></div><div><dt>Catégorie</dt><dd>${escapeHtml(item.category)}</dd></div><div><dt>Position</dt><dd>${item.order}</dd></div><div><dt>Statut</dt><dd>${item.isPublished ? 'Publié' : 'Masqué'}</dd></div>`;
      deleteModal.show();
    }
  }

  function handleDelete() {
    const index = items.findIndex((item) => item.id === deletingId); if (index < 0) return;
    const [item] = items.splice(index, 1); revokeBlobUrl(item.previewUrl); prepareDeletion(item.id); sortAndNormalize(items);
    render(); announce(`La suppression de ${item.title} est simulée.`); focusLiveAfterModal = true; deleteModal.hide();
  }

  function handleResetFilters() { filters.search.value = ''; filters.category.value = 'all'; filters.status.value = 'all'; render(); filters.search.focus(); }
  function handleFormModalHidden() { clearPendingPreview(); inputs.file.value = ''; if (focusLiveAfterModal) { focusLiveAfterModal = false; liveRegion.focus(); } }
  function handleDeleteModalHidden() { if (focusLiveAfterModal) { focusLiveAfterModal = false; liveRegion.focus(); } }

  addListener(filters.search, 'input', render); addListener(filters.category, 'change', render); addListener(filters.status, 'change', render); addListener(resetFilters, 'click', handleResetFilters);
  addListener(addButton, 'click', openAddModal); addListener(grid, 'click', handleCardAction); addListener(inputs.file, 'change', handleFileChange); addListener(inputs.alternativeText, 'input', () => { if (pendingPreviewUrl) renderPreview(); });
  addListener(form, 'submit', handleSubmit); addListener(confirmDelete, 'click', handleDelete); addListener(formModalElement, 'hidden.bs.modal', handleFormModalHidden); addListener(deleteModalElement, 'hidden.bs.modal', handleDeleteModalHidden);
  render();

  return () => {
    listeners.forEach((removeListener) => removeListener()); clearPendingPreview(); activeBlobUrls.forEach((url) => URL.revokeObjectURL(url)); activeBlobUrls.clear();
    [formModal, deleteModal].forEach((modal) => { modal.hide(); modal.dispose(); }); cleanupBootstrapOverlayState();
    cleanupAdminLayout?.();
  };
}
