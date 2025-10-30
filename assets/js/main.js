// ===============================
// ✅ CAREVIA FOUNDATION - main.js
// Handles navigation, contact form, gallery & testimonials from Supabase
// ===============================

import { supabase } from "./supabase.js";

// ✅ When page is loaded → run functions
document.addEventListener("DOMContentLoaded", () => {
    initNavigation();
    initContactForm();
    loadGallery();
    loadTestimonials();
});

// ==========================================================
// ✅ MOBILE NAVIGATION
// ==========================================================
function initNavigation() {
    const navToggle = document.querySelector(".nav-toggle");
    const navMenu = document.querySelector(".site-nav");

    if (!navToggle || !navMenu) return;

    // ✅ Open Menu
    navToggle.addEventListener("click", () => {
        navMenu.classList.toggle("active");
    });

    // ✅ Close menu when clicking a link
    document.querySelectorAll(".site-nav a").forEach(link => {
        link.addEventListener("click", () => {
            navMenu.classList.remove("active");
        });
    });
}

// ==========================================================
// ✅ CONTACT FORM → SUPABASE
// ==========================================================
function initContactForm() {
    const form = document.getElementById("contactForm");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const subject = document.getElementById("subject").value.trim();
        const message = document.getElementById("message").value.trim();

        if (!name || !email || !phone || !subject || !message) {
            alert("⚠ Please fill all fields");
            return;
        }

        const { error } = await supabase
            .from("contacts")
            .insert([{ name, email, phone, subject, message }]);

        if (error) {
            console.error(error);
            alert("❌ Failed to send message");
            return;
        }

        alert("✅ Message submitted successfully!");
        form.reset();
    });
}

// ==========================================================
// ✅ LOAD GALLERY FROM SUPABASE
// ==========================================================
async function loadGallery() {
    const galleryGrid = document.getElementById("galleryGrid");
    if (!galleryGrid) return;

    galleryGrid.innerHTML = `<p style="text-align:center;">Loading...</p>`;

    const { data, error } = await supabase
        .from("gallery")
        .select("*")
        .order("id", { ascending: false });

    if (error) {
        console.error(error);
        galleryGrid.innerHTML = `<p style="color:red;text-align:center;">Failed to load gallery</p>`;
        return;
    }

    if (!data.length) {
        galleryGrid.innerHTML = `<p style="text-align:center;">No images uploaded yet.</p>`;
        return;
    }

    galleryGrid.innerHTML = "";

    data.forEach(item => {
        const box = document.createElement("div");
        box.classList.add("gallery-item");

        box.innerHTML = `
            <img src="${item.image_url}" alt="${item.title}" class="gallery-img">
            <p class="gallery-title">${item.title}</p>
        `;

        galleryGrid.appendChild(box);
    });
}

// ==========================================================
// ✅ LOAD TESTIMONIALS / STORIES
// ==========================================================
async function loadTestimonials() {
    const container = document.querySelector(".testimonials-grid");
    if (!container) return;

    container.innerHTML = `<p style="text-align:center;">Loading stories...</p>`;

    const { data, error } = await supabase
        .from("stories")
        .select("*")
        .order("id", { ascending: false });

    if (error) {
        console.error(error);
        container.innerHTML = `<p style="text-align:center;color:red;">Failed to load testimonials</p>`;
        return;
    }

    if (!data.length) {
        container.innerHTML = `<p style="text-align:center;">No stories found yet.</p>`;
        return;
    }

    container.innerHTML = "";

    data.forEach(story => {
        const card = document.createElement("div");
        card.classList.add("testimonial-card");

        card.innerHTML = `
            ${story.image_url ? `<img src="${story.image_url}" class="testimonial-img">` : ""}
            <div class="testimonial-text">"${story.content}"</div>
            <div class="testimonial-author">
                <strong>${story.author || "Anonymous"}</strong>
                <span>${story.title || ""}</span>
            </div>
        `;

        container.appendChild(card);
    });
}
