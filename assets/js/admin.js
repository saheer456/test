// ✅ CAREVIA — ADVANCED ADMIN PANEL WITH LOADING & EXPORT
import { supabase } from "./supabase.js";

document.addEventListener("DOMContentLoaded", () => {
    loadGallery();
    loadStories();
    loadContacts();
    setupTabs();
    setupLogout();
});

// ✅ Tabs
function setupTabs() {
    document.querySelectorAll(".tab-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
            document.querySelectorAll(".tab-content").forEach(t => t.style.display = "none");
            btn.classList.add("active");
            document.getElementById(btn.dataset.target).style.display = "block";
        });
    });
}

// ✅ Logout
function setupLogout() {
    document.getElementById("logoutBtn")?.addEventListener("click", () => {
        sessionStorage.removeItem("loggedIn");
        location.href = "login.html";
    });
}

/* ============================================================
   ✅ GALLERY SECTION
============================================================ */
async function loadGallery() {
    const table = document.getElementById("galleryTable");
    if (!table) return;

    table.innerHTML = `<tr><td colspan="4">Loading...</td></tr>`;

    const { data, error } = await supabase.from("gallery").select("*").order("created_at", { ascending: false });

    if (error) {
        table.innerHTML = `<tr><td colspan="4">Error loading gallery</td></tr>`;
        return;
    }

    if (!data.length) {
        table.innerHTML = `<tr><td colspan="4">No Images Found</td></tr>`;
        return;
    }

    table.innerHTML = "";
    data.forEach(row => {
        table.innerHTML += `
        <tr>
            <td><img src="${row.image_url}" style="width:80px;border-radius:6px;"></td>
            <td>${row.title}</td>
            <td>${row.category}</td>
            <td><button class="delete-btn" onclick="deleteGallery(${row.id})">🗑 Delete</button></td>
        </tr>`;
    });
}

// ✅ Upload Gallery Image with Loading
document.getElementById("galleryForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const submitBtn = document.querySelector("#galleryForm button");
    submitBtn.innerText = "Uploading...";
    submitBtn.disabled = true;

    const title = gTitle.value.trim();
    const category = gCategory.value.trim();
    const file = gImage.files[0];

    if (!title || !category || !file) {
        alert("Fill all fields");
        submitBtn.innerText = "Upload";
        submitBtn.disabled = false;
        return;
    }

    const fileName = `gallery-${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from("gallery").upload(fileName, file);

    if (uploadError) {
        alert("❌ Upload failed");
        submitBtn.innerText = "Upload";
        submitBtn.disabled = false;
        return;
    }

    const image_url = `https://fzhvotasyrbxyfmkqkfa.supabase.co/storage/v1/object/public/gallery/${fileName}`;


    const { error } = await supabase.from("gallery").insert([{ title, category, image_url }]);

    submitBtn.innerText = "Upload";
    submitBtn.disabled = false;

    if (error) return alert("❌ Failed to save");

    alert("✅ Image Uploaded!");
    galleryForm.reset();
    loadGallery();
});

// ✅ Delete Gallery
window.deleteGallery = async (id) => {
    if (!confirm("Delete this image?")) return;
    await supabase.from("gallery").delete().eq("id", id);
    loadGallery();
};

/* ============================================================
   ✅ STORIES SECTION
============================================================ */
async function loadStories() {
    const table = document.getElementById("storiesTable");
    if (!table) return;

    table.innerHTML = `<tr><td colspan="5">Loading...</td></tr>`;

    const { data, error } = await supabase.from("stories").select("*").order("created_at", { ascending: false });

    if (error) {
        table.innerHTML = `<tr><td colspan="5">Error</td></tr>`;
        return;
    }

    if (!data.length) {
        table.innerHTML = `<tr><td colspan="5">No Stories</td></tr>`;
        return;
    }

    table.innerHTML = "";
    data.forEach(row => {
        table.innerHTML += `
        <tr>
            <td>${row.image_url ? `<img src="${row.image_url}" style="width:80px;border-radius:6px;">` : "No Image"}</td>
            <td>${row.title}</td>
            <td>${row.author}</td>
            <td>${row.content.substring(0, 50)}...</td>
            <td><button class="delete-btn" onclick="deleteStory(${row.id})">🗑 Delete</button></td>
        </tr>`;
    });
}

// ✅ Upload Story with loading
document.getElementById("storyForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const btn = document.querySelector("#storyForm button");
    btn.innerText = "Uploading...";
    btn.disabled = true;

    const title = sTitle.value.trim();
    const author = sAuthor.value.trim();
    const content = sContent.value.trim();
    const file = sImage.files[0];

    if (!title || !author || !content) {
        alert("Fill required fields");
        btn.innerText = "Upload";
        btn.disabled = false;
        return;
    }

    let image_url = null;

    if (file) {
        const fileName = `story-${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage.from("stories").upload(fileName, file);
        if (!uploadError) {
           image_url = `https://fzhvotasyrbxyfmkqkfa.supabase.co/storage/v1/object/public/stories/${fileName}`;
        }
    }

    const { error } = await supabase.from("stories").insert([{ title, author, content, image_url }]);

    btn.innerText = "Upload";
    btn.disabled = false;

    if (error) return alert("DB Error");

    alert("✅ Story Added!");
    storyForm.reset();
    loadStories();
});

// ✅ Delete Story
window.deleteStory = async (id) => {
    if (!confirm("Delete story?")) return;
    await supabase.from("stories").delete().eq("id", id);
    loadStories();
};

/* ============================================================
   ✅ CONTACTS + EXPORT CSV + Phone Number Support
============================================================ */
async function loadContacts() {
    const table = document.getElementById("contactsTable");
    const countBox = document.getElementById("contactCount");

    if (!table) return;

    table.innerHTML = `<tr><td colspan="5">Loading...</td></tr>`;

    const { data, error } = await supabase.from("contacts").select("*").order("created_at", { ascending: false });

    if (error) {
        table.innerHTML = `<tr><td colspan="5">Error Loading</td></tr>`;
        return;
    }

    if (!data.length) {
        table.innerHTML = `<tr><td colspan="5">No Messages</td></tr>`;
        if (countBox) countBox.innerText = "0";
        return;
    }

    if (countBox) countBox.innerText = data.length;

    table.innerHTML = "";
    data.forEach(row => {
        table.innerHTML += `
        <tr>
            <td>${row.name}</td>
            <td>${row.email}</td>
            <td>${row.phone ?? "—"}</td>
            <td>${row.subject}</td>
            <td>${row.message}</td>
        </tr>`;
    });
}

// ✅ Export Contacts as CSV
window.exportContacts = async () => {
    const { data } = await supabase.from("contacts").select("*");
    if (!data.length) return alert("No data");

    let csv = "Name,Email,Phone,Subject,Message\n";

    data.forEach(row => {
        csv += `"${row.name}","${row.email}","${row.phone ?? ""}","${row.subject}","${row.message}"\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "contacts.csv";
    a.click();

    URL.revokeObjectURL(url);
};
