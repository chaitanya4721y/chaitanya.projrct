// login.js  (no imports; uses the global Supabase from the CDN)

// --- Supabase client (use your real anon key) ---
const SUPABASE_URL = "https://xzkiphnprdjxcxkmocvf.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6a2lwaG5wcmRqeGN4a21vY3ZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxOTc3NDIsImV4cCI6MjA2OTc3Mzc0Mn0.IIB9czzGljZTEs1N9TAkAoWnI0dAq2tLpQQPsZplSyc";
const { createClient } = window.supabase;
const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

// Run after DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  // Support both ids: #email or #username (you used both in different versions)
  const emailEl = document.getElementById("email") || document.getElementById("username");
  const pwdEl = document.getElementById("password");
  const form = document.getElementById("loginForm");          // if you have a <form id="loginForm">
  const toggleBtn = document.getElementById("toggleBtn");     // optional

  if (toggleBtn && form) {
    toggleBtn.addEventListener("click", () => form.classList.toggle("hidden"));
  }

  async function doLogin() {
    const email = (emailEl?.value || "").trim();
    const password = (pwdEl?.value || "").trim();

    if (!email || !password) {
      alert("Please fill in all fields.");
      return;
    }

    const { data, error } = await sb.auth.signInWithPassword({ email, password });

    if (error) {
      alert(error.message);
      return;
    }

    // (Optional) log login event; won’t break if table doesn’t exist
    try {
      await sb.from("user_logins").insert([
        { user_id: data.user.id, email: data.user.email, login_time: new Date() }
      ]);
    } catch (e) {
      console.warn("Login logged skipped:", e?.message || e);
    }

    // Redirect (supports ?redirect=…)
    const params = new URLSearchParams(window.location.search);
    const redirectURL = params.get("redirect") || "index.html";
    window.location.href = redirectURL;
  }

  // If you have a <form id="loginForm">, submit will work:
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      doLogin();
    });
  }

  // If your HTML uses <button onclick="login()">Login</button>, this keeps it working:
  window.login = doLogin;
});
