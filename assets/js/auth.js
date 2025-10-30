import { supabase } from "./supabase.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  if (!form) {
    console.error("❌ loginForm not found");
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log("✅ Form submitted");

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    const button = form.querySelector("button");
    button.disabled = true;
    button.textContent = "⏳ Logging in...";

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    console.log("✅ Response from Supabase:", { data, error });

    if (error) {
      alert("❌ Wrong email or password");
      button.disabled = false;
      button.textContent = "Login";
      return;
    }

    button.textContent = "✅ Success!";
    setTimeout(() => {
      window.location.href = "admin.html";
    }, 700);
  });
});
