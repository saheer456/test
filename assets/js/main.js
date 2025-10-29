// ===============================
// 🌐 CAREVIA FOUNDATION - main.js
// Handles navigation, contact/donation forms, gallery, and stories.
// Also syncs with Admin Panel (localStorage-based backend simulation).
// ===============================

document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  initContactForm();
  initDonationForm();
  loadDynamicContent(); // Load stories + gallery dynamically
  setupStorageSync();   // Listen for admin updates
});

// ==========================================================
// 🧭 NAVIGATION MENU
// ==========================================================
function initNavigation() {
  const navToggle = document.querySelector(".nav-toggle");
  const siteNav = document.querySelector(".site-nav");

  if (!navToggle || !siteNav) return;

  // Toggle navigation open/close
  navToggle.addEventListener("click", () => {
    siteNav.classList.toggle("active");
    document.body.style.overflow = siteNav.classList.contains("active")
      ? "hidden"
      : "";
  });

  // Close when clicking outside
  document.addEventListener("click", (e) => {
    if (
      siteNav.classList.contains("active") &&
      !e.target.closest(".site-nav") &&
      !e.target.closest(".nav-toggle")
    ) {
      siteNav.classList.remove("active");
      document.body.style.overflow = "";
    }
  });

  // Highlight section currently in view
  window.addEventListener("scroll", () => {
    const sections = document.querySelectorAll("section");
    const navLinks = document.querySelectorAll('.site-nav a[href^="#"]');
    let current = "";

    sections.forEach((section) => {
      const top = section.offsetTop - 100;
      const height = section.clientHeight;
      if (scrollY >= top && scrollY < top + height) current = section.id;
    });

    navLinks.forEach((link) => {
      link.classList.remove("active");
      if (link.getAttribute("href") === `#${current}`)
        link.classList.add("active");
    });
  });
}

// ==========================================================
// 💬 CONTACT FORM (Sends Message via WhatsApp)
// ==========================================================
function initContactForm() {
  const form = document.querySelector(".contact-form form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const subject = document.getElementById("subject").value.trim();
    const message = document.getElementById("message").value.trim();

    if (!name || !email || !subject || !message) {
      alert("⚠️ Please fill in all required fields before sending!");
      return;
    }

    const adminNumber = "919545503065"; // WhatsApp number (with country code)
    const waMessage = `📩 *New Contact Message from Carevia Website* 
-------------------------
👤 Name: ${name}
📧 Email: ${email}
📝 Subject: ${subject}
💬 Message: ${message}`;

    alert("Opening WhatsApp to send your message...");
    window.open(`https://wa.me/${adminNumber}?text=${encodeURIComponent(waMessage)}`, "_blank");
    form.reset();
  });
}

// ==========================================================
// 💰 DONATION FORM (Sends Details via WhatsApp)
// ==========================================================
function initDonationForm() {
  const form = document.querySelector(".donation-form");
  if (!form) return;

  const amountButtons = document.querySelectorAll(".amount-btn");
  const customAmountInput = document.getElementById("custom-amount");
  let selectedAmount = 2000; // Default amount

  // Handle preset buttons
  amountButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      amountButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      selectedAmount = btn.dataset.amount;
      customAmountInput.value = "";
    });
  });

  // Handle custom amount input
  customAmountInput.addEventListener("input", () => {
    amountButtons.forEach((b) => b.classList.remove("active"));
    selectedAmount = customAmountInput.value;
  });

  // On submit → open WhatsApp message
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("donor-name").value.trim();
    const phone = document.getElementById("donor-phone").value.trim();
    const email = document.getElementById("donor-email").value.trim();
    const amount = selectedAmount || customAmountInput.value;

    if (!name || !phone || !email || !amount) {
      alert("⚠️ Please fill all fields before donating!");
      return;
    }

    const adminNumber = "919545503065";
    const waMessage = `🌟 *New Donation Request* 🌟
-------------------------
💰 Amount: ₹${amount}
👤 Name: ${name}
📞 Phone: ${phone}
📧 Email: ${email}
-------------------------
🙏 Thank you for supporting Carevia Foundation!`;

    alert("Opening WhatsApp to send your donation details...");
    window.open(`https://wa.me/${adminNumber}?text=${encodeURIComponent(waMessage)}`, "_blank");
    form.reset();
  });
}

// ==========================================================
// 🖼️ LOAD GALLERY IMAGES (From Admin Panel)
// ==========================================================
function loadGalleryImages() {
  const galleryGrid = document.querySelector(".gallery-grid");
  if (!galleryGrid) return;

  const galleryData = JSON.parse(localStorage.getItem("carevia_gallery")) || [];
  galleryGrid.innerHTML = ""; // Clear all gallery items

  if (galleryData.length === 0) {
    galleryGrid.innerHTML = `<p style="grid-column:1/-1;text-align:center;">No images available yet</p>`;
    return;
  }

  galleryData.slice(0, 12).forEach((item) => {
    const div = document.createElement("div");
    div.className = "gallery-item";
    div.innerHTML = `
      <img src="${item.src}" alt="${item.title}" style="width:100%;height:200px;object-fit:cover;border-radius:8px;">
      <p style="text-align:center;margin-top:8px;font-size:0.9em;">${item.title}</p>
    `;
    galleryGrid.appendChild(div);
  });

  console.log("✅ Gallery loaded successfully:", galleryData.length, "images");
}

// ==========================================================
// 📖 LOAD STORIES (From Admin Panel)
// ==========================================================
function loadStories() {
  const testimonialsGrid = document.querySelector(".testimonials-grid");
  if (!testimonialsGrid) return;

  const storedStories = JSON.parse(localStorage.getItem("carevia_stories")) || [];
  console.log("📖 Loading stories:", storedStories.length);

  // Remove previously injected dynamic stories
  testimonialsGrid.querySelectorAll(".dynamic-testimonial").forEach((el) => el.remove());

  if (storedStories.length === 0) {
    console.log("ℹ️ No new stories found in localStorage.");
    return;
  }

  // Show up to 3 latest stories
  storedStories.slice(-3).reverse().forEach((story) => {
    const storyCard = document.createElement("div");
    storyCard.className = "testimonial-card dynamic-testimonial";
    storyCard.innerHTML = `
      <div class="testimonial-text">
        "${story.content.substring(0, 120)}${story.content.length > 120 ? "..." : ""}"
      </div>
      <div class="testimonial-author">
        <strong>${story.author}</strong>
        <span>${story.title}</span><br>
        <small>${new Date(story.date).toLocaleDateString("en-IN")}</small>
      </div>
    `;
    testimonialsGrid.appendChild(storyCard);
  });

  console.log("✅ Stories loaded successfully:", storedStories.length);
}

// ==========================================================
// 🔄 AUTO RELOAD WHEN ADMIN UPDATES LOCALSTORAGE
// ==========================================================
function setupStorageSync() {
  window.addEventListener("storage", (e) => {
    if (e.key === "carevia_gallery" || e.key === "carevia_stories") {
      console.log("🔄 Detected admin update:", e.key);
      loadDynamicContent();
    }
  });
}

// ==========================================================
// 🧩 COMBINED CONTENT LOADER (Gallery + Stories)
// ==========================================================
function loadDynamicContent() {
  console.log("=== 🔁 Refreshing Dynamic Content ===");
  loadGalleryImages();
  loadStories();
  console.log("=== ✅ Dynamic Content Loaded ===");
}

// ==========================================================
// 🧱 ADMIN DASHBOARD INITIALIZATION
// ==========================================================
function initAdminPanel() {
  if (localStorage.getItem("adminAuthenticated") !== "true") {
    window.location.href = "login.html";
    return;
  }

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("adminAuthenticated");
      localStorage.removeItem("loginTime");
      window.location.href = "login.html";
    });
  }

  // Show saved data in admin view
  if (typeof renderGallery === "function") renderGallery();
  if (typeof renderStories === "function") renderStories();

  console.log("✅ Admin panel initialized with existing data.");
}
