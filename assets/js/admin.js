// ===============================
// Carevia Admin JS — CRUD for Gallery & Stories (localStorage)
// - Features: add/edit/delete/view
// - Keys used: carevia_gallery, carevia_stories
// ===============================

/* -----------------------------
   Utilities: storage helpers & id
   ----------------------------- */
const GALLERY_KEY = "carevia_gallery";
const STORIES_KEY = "carevia_stories";

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function readGallery() {
  return JSON.parse(localStorage.getItem(GALLERY_KEY) || "[]");
}
function writeGallery(arr) {
  localStorage.setItem(GALLERY_KEY, JSON.stringify(arr));
  // Note: storage event won't fire in same tab; index page (other tab) will react to storage
}

function readStories() {
  return JSON.parse(localStorage.getItem(STORIES_KEY) || "[]");
}
function writeStories(arr) {
  localStorage.setItem(STORIES_KEY, JSON.stringify(arr));
}

/* -----------------------------
   DOM shortcuts
   ----------------------------- */
const el = id => document.getElementById(id);

const tabGallery = el("tabGallery");
const tabStories = el("tabStories");
const sectionGallery = el("sectionGallery");
const sectionStories = el("sectionStories");

const galleryForm = el("galleryForm");
const galleryTitle = el("galleryTitle");
const galleryImage = el("galleryImage");
const galleryDescription = el("galleryDescription");
const galleryCategory = el("galleryCategory");
const galleryList = el("galleryList");
const imageCount = el("imageCount");
const bulkDeleteImagesBtn = el("bulkDeleteImages");

const storyForm = el("storyForm");
const storyTitle = el("storyTitle");
const storyAuthor = el("storyAuthor");
const storyContent = el("storyContent");
const storyImage = el("storyImage");
const storyDate = el("storyDate");
const storyList = el("storyList");
const storyCount = el("storyCount");
const bulkDeleteStoriesBtn = el("bulkDeleteStories");

const logoutBtn = el("logoutBtn");

// modal
const modalBackdrop = el("modalBackdrop");
const modalBody = el("modalBody");
const modalTitle = el("modalTitle");
const closeModalBtn = el("closeModal");

/* -----------------------------
   Authentication guard + init
   ----------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  // simple auth guard (uses adminAuthenticated flag)
  if (localStorage.getItem("adminAuthenticated") !== "true") {
    window.location.href = "login.html";
    return;
  }

  // wire tabs
  tabGallery.addEventListener("click", () => switchTab("gallery"));
  tabStories.addEventListener("click", () => switchTab("stories"));

  // wire logout
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("adminAuthenticated");
      localStorage.removeItem("loginTime");
      window.location.href = "login.html";
    });
  }

  // wire forms
  galleryForm.addEventListener("submit", handleGalleryAdd);
  storyForm.addEventListener("submit", handleStoryAdd);

  // bulk deletes
  bulkDeleteImagesBtn.addEventListener("click", () => {
    if (!confirm("Delete ALL images? This cannot be undone.")) return;
    writeGallery([]);
    renderGallery();
    alert("All images removed.");
  });
  bulkDeleteStoriesBtn.addEventListener("click", () => {
    if (!confirm("Delete ALL stories? This cannot be undone.")) return;
    writeStories([]);
    renderStories();
    alert("All stories removed.");
  });

  // modal
  closeModalBtn.addEventListener("click", closeModal);
  modalBackdrop.addEventListener("click", (e) => {
    if (e.target === modalBackdrop) closeModal();
  });

  // initial render
  renderGallery();
  renderStories();
});

/* -----------------------------
   Tab switcher
   ----------------------------- */
function switchTab(tab) {
  if (tab === "gallery") {
    tabGallery.classList.add("active");
    tabStories.classList.remove("active");
    sectionGallery.classList.add("active");
    sectionStories.classList.remove("active");
  } else {
    tabStories.classList.add("active");
    tabGallery.classList.remove("active");
    sectionStories.classList.add("active");
    sectionGallery.classList.remove("active");
  }
}

/* -----------------------------
   GALLERY: Add, Render, Edit, Delete
   ----------------------------- */
function handleGalleryAdd(e) {
  e.preventDefault();
  const title = galleryTitle.value.trim();
  const desc = galleryDescription.value.trim();
  const category = galleryCategory.value;

  const file = galleryImage.files[0];
  if (!title) { alert("Please enter an image title."); return; }
  if (!file) { alert("Please choose an image file."); return; }

  // read image as data URL
  const reader = new FileReader();
  reader.onload = () => {
    const src = reader.result;
    const gallery = readGallery();
    gallery.unshift({
      id: uid(),
      title,
      description: desc,
      category,
      src,
      date: new Date().toISOString()
    });
    writeGallery(gallery);
    galleryForm.reset();
    renderGallery();
    alert("Image added successfully.");
  };
  reader.onerror = () => alert("Failed to read image file.");
  reader.readAsDataURL(file);
}

function renderGallery() {
  const gallery = readGallery();
  imageCount.textContent = gallery.length || 0;
  galleryList.innerHTML = "";
  if (gallery.length === 0) {
    galleryList.innerHTML = `<div class="card small">No images uploaded yet.</div>`;
    return;
  }

  gallery.forEach(item => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${item.src}" alt="${escapeHtml(item.title)}" />
      <h4>${escapeHtml(item.title)}</h4>
      <p class="meta">${escapeHtml(item.category)} • ${new Date(item.date).toLocaleDateString()}</p>
      <div class="small">${escapeHtml(item.description || "")}</div>
      <div class="actions" style="margin-top:8px;">
        <button data-id="${item.id}" class="btn edit-gallery">Edit</button>
        <button data-id="${item.id}" class="btn danger delete-gallery">Delete</button>
      </div>
    `;
    galleryList.appendChild(card);
  });

  // wire action buttons (delegation-safe if re-called)
  galleryList.querySelectorAll(".edit-gallery").forEach(btn => {
    btn.addEventListener("click", (e) => openGalleryEditModal(btn.dataset.id));
  });
  galleryList.querySelectorAll(".delete-gallery").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const id = btn.dataset.id;
      if (!confirm("Delete this image?")) return;
      const newArr = readGallery().filter(i => i.id !== id);
      writeGallery(newArr);
      renderGallery();
      alert("Image deleted.");
    });
  });
}

function openGalleryEditModal(id) {
  const gallery = readGallery();
  const item = gallery.find(i => i.id === id);
  if (!item) return alert("Image not found.");

  modalTitle.textContent = "Edit Image";
  modalBody.innerHTML = `
    <div style="display:flex; gap:12px; flex-wrap:wrap;">
      <div style="flex:1; min-width:220px;">
        <img src="${item.src}" style="width:100%; border-radius:8px; margin-bottom:8px;">
        <div class="small">Current image preview</div>
      </div>
      <div style="flex:1; min-width:220px;">
        <label class="small">Title</label>
        <input id="editGalleryTitle" class="form-control" value="${escapeHtml(item.title)}" />
        <label class="small" style="margin-top:8px;">Category</label>
        <select id="editGalleryCategory" class="form-control">
          <option value="events">Events</option>
          <option value="success-stories">Success Stories</option>
          <option value="team">Team</option>
          <option value="community">Community</option>
        </select>
        <label class="small" style="margin-top:8px;">Description</label>
        <input id="editGalleryDescription" class="form-control" value="${escapeHtml(item.description || "")}" />
        <label class="small" style="margin-top:8px;">Replace Image (optional)</label>
        <input id="editGalleryImage" class="form-control" type="file" accept="image/*" />
        <div style="margin-top:10px; display:flex; gap:8px;">
          <button id="saveGalleryEdit" class="btn">Save</button>
          <button id="cancelGalleryEdit" class="btn danger">Cancel</button>
        </div>
      </div>
    </div>
  `;
  // set category value
  document.getElementById("editGalleryCategory").value = item.category || "events";

  // show modal
  openModal();

  // wire save/cancel
  el("cancelGalleryEdit").addEventListener("click", closeModal);
  el("saveGalleryEdit").addEventListener("click", () => {
    const newTitle = el("editGalleryTitle").value.trim();
    const newCategory = el("editGalleryCategory").value;
    const newDesc = el("editGalleryDescription").value.trim();
    const fileInput = el("editGalleryImage");
    if (!newTitle) return alert("Title cannot be empty.");

    // if image replaced, read file first
    const file = fileInput.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        item.src = reader.result;
        item.title = newTitle;
        item.category = newCategory;
        item.description = newDesc;
        writeGallery(gallery);
        renderGallery();
        closeModal();
        alert("Image updated.");
      };
      reader.readAsDataURL(file);
    } else {
      item.title = newTitle;
      item.category = newCategory;
      item.description = newDesc;
      writeGallery(gallery);
      renderGallery();
      closeModal();
      alert("Image updated.");
    }
  });
}

/* -----------------------------
   STORIES: Add, Render, Edit, Delete
   ----------------------------- */
function handleStoryAdd(e) {
  e.preventDefault();
  const title = storyTitle.value.trim();
  const author = storyAuthor.value.trim();
  const content = storyContent.value.trim();
  const dateVal = storyDate.value ? new Date(storyDate.value).toISOString() : new Date().toISOString();
  const file = storyImage.files[0];

  if (!title || !author || !content) { alert("Please fill title, author, and content."); return; }

  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      const stories = readStories();
      stories.unshift({
        id: uid(),
        title, author, content,
        image: reader.result,
        date: dateVal
      });
      writeStories(stories);
      storyForm.reset();
      renderStories();
      alert("Story added.");
    };
    reader.readAsDataURL(file);
  } else {
    const stories = readStories();
    stories.unshift({
      id: uid(),
      title, author, content,
      image: null,
      date: dateVal
    });
    writeStories(stories);
    storyForm.reset();
    renderStories();
    alert("Story added.");
  }
}

function renderStories() {
  const stories = readStories();
  storyCount.textContent = stories.length || 0;
  storyList.innerHTML = "";
  if (stories.length === 0) {
    storyList.innerHTML = `<div class="card small">No stories yet.</div>`;
    return;
  }

  stories.forEach(story => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      ${story.image ? `<img src="${story.image}" alt="${escapeHtml(story.title)}">` : ``}
      <h4>${escapeHtml(story.title)}</h4>
      <p class="meta">By ${escapeHtml(story.author)} • ${new Date(story.date).toLocaleDateString()}</p>
      <div class="small">${escapeHtml(story.content.substring(0, 130))}${story.content.length > 130 ? "..." : ""}</div>
      <div class="actions" style="margin-top:8px;">
        <button data-id="${story.id}" class="btn edit-story">Edit</button>
        <button data-id="${story.id}" class="btn danger delete-story">Delete</button>
      </div>
    `;
    storyList.appendChild(card);
  });

  storyList.querySelectorAll(".edit-story").forEach(btn => {
    btn.addEventListener("click", () => openStoryEditModal(btn.dataset.id));
  });
  storyList.querySelectorAll(".delete-story").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      if (!confirm("Delete this story?")) return;
      const newArr = readStories().filter(s => s.id !== id);
      writeStories(newArr);
      renderStories();
      alert("Story deleted.");
    });
  });
}

function openStoryEditModal(id) {
  const stories = readStories();
  const s = stories.find(x => x.id === id);
  if (!s) return alert("Story not found.");

  modalTitle.textContent = "Edit Story";
  modalBody.innerHTML = `
    <div style="display:flex; gap:12px; flex-wrap:wrap;">
      <div style="flex:1; min-width:220px;">
        ${s.image ? `<img src="${s.image}" style="width:100%; border-radius:8px; margin-bottom:8px;">` : `<div class="small">No image</div>`}
      </div>
      <div style="flex:1; min-width:220px;">
        <label class="small">Title</label>
        <input id="editStoryTitle" class="form-control" value="${escapeHtml(s.title)}" />
        <label class="small" style="margin-top:8px;">Author</label>
        <input id="editStoryAuthor" class="form-control" value="${escapeHtml(s.author)}" />
        <label class="small" style="margin-top:8px;">Content</label>
        <textarea id="editStoryContent" class="form-control" rows="5">${escapeHtml(s.content)}</textarea>
        <label class="small" style="margin-top:8px;">Replace Image (optional)</label>
        <input id="editStoryImage" class="form-control" type="file" accept="image/*" />
        <div style="margin-top:10px; display:flex; gap:8px;">
          <button id="saveStoryEdit" class="btn">Save</button>
          <button id="cancelStoryEdit" class="btn danger">Cancel</button>
        </div>
      </div>
    </div>
  `;
  openModal();

  el("cancelStoryEdit").addEventListener("click", closeModal);
  el("saveStoryEdit").addEventListener("click", () => {
    const newTitle = el("editStoryTitle").value.trim();
    const newAuthor = el("editStoryAuthor").value.trim();
    const newContent = el("editStoryContent").value.trim();
    const file = el("editStoryImage").files[0];

    if (!newTitle || !newAuthor || !newContent) return alert("Title, author, content required.");

    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        s.image = reader.result;
        s.title = newTitle;
        s.author = newAuthor;
        s.content = newContent;
        writeStories(stories);
        renderStories();
        closeModal();
        alert("Story updated.");
      };
      reader.readAsDataURL(file);
    } else {
      s.title = newTitle;
      s.author = newAuthor;
      s.content = newContent;
      writeStories(stories);
      renderStories();
      closeModal();
      alert("Story updated.");
    }
  });
}

/* -----------------------------
   Modal helpers
   ----------------------------- */
function openModal() {
  modalBackdrop.style.display = "flex";
}
function closeModal() {
  modalBackdrop.style.display = "none";
  modalBody.innerHTML = "";
}

/* -----------------------------
   small helpers
   ----------------------------- */
function escapeHtml(text) {
  if (!text && text !== 0) return "";
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* -----------------------------
   Render initial lists on changes
   ----------------------------- */
window.addEventListener("storage", (e) => {
  // If changes are made in other tab (index page or another admin), update UI
  if (e.key === GALLERY_KEY) renderGallery();
  if (e.key === STORIES_KEY) renderStories();
});
