// ===== AUTHENTICATION SYSTEM =====
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: '2024' // change if needed
};

// Check if user is authenticated
function isAuthenticated() {
    const authenticated = localStorage.getItem('adminAuthenticated') === 'true';
    const loginTime = localStorage.getItem('loginTime');

    if (loginTime) {
        const currentTime = new Date().getTime();
        const eightHours = 8 * 60 * 60 * 1000;
        if (currentTime - parseInt(loginTime) > eightHours) {
            logout();
            return false;
        }
    }
    return authenticated;
}

// Login function
function login(username, password) {
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        localStorage.setItem('adminAuthenticated', 'true');
        localStorage.setItem('loginTime', new Date().getTime().toString());
        return true;
    }
    return false;
}

// Logout function
function logout() {
    localStorage.removeItem('adminAuthenticated');
    localStorage.removeItem('loginTime');
}

// Auto-redirect if already logged in
if (window.location.pathname.includes('login.html') && isAuthenticated()) {
    window.location.href = 'admin.html';
}

// Handle login form
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;

    const submitBtn = loginForm.querySelector('button[type="submit"]');

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;

        // Loading state
        const originalText = submitBtn.textContent;
        submitBtn.textContent = '⏳ Authenticating...';
        submitBtn.disabled = true;

        setTimeout(() => {
            if (login(username, password)) {
                submitBtn.textContent = '✅ Success! Redirecting...';
                setTimeout(() => {
                    window.location.href = 'admin.html';
                }, 1000);
            } else {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                alert('❌ Invalid username or password. Please try again.');
                document.getElementById('password').value = '';
                document.getElementById('password').focus();
            }
        }, 500);
    });

    // Input focus animation
    const inputs = loginForm.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.style.borderColor = 'var(--primary-color)';
            input.style.boxShadow = '0 0 0 3px rgba(143, 201, 255, 0.1)';
        });
        input.addEventListener('blur', () => {
            input.style.borderColor = '#e1e5e9';
            input.style.boxShadow = 'none';
        });
    });
});
