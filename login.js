/**
 * =============================================
 * LOGIN.JS - TRACE ALUMNI SYSTEM
 * Updated for MySQL Backend
 * =============================================
 */

// Global Variables
let currentRole = 'alumni';
let passwordVisible = false;

// =============================================
// INITIALIZATION
// =============================================
document.addEventListener('DOMContentLoaded', function() {
    checkExistingLogin();
    setupEventListeners();
    checkRegistrationSuccess();
});

// =============================================
// LOGIN CHECK
// =============================================
function checkExistingLogin() {
    const user = getCurrentUser();
    if (user) {
        if (user.role === 'admin') window.location.href = 'admin-dashboard.html';
        else window.location.href = 'alumni-dashboard.html';
    }
}

function checkRegistrationSuccess() {
    if (sessionStorage.getItem('registrationSuccess') === 'true') {
        showToast('Registration successful! Please login.', 'success');
        sessionStorage.removeItem('registrationSuccess');
    }
}

// =============================================
// EVENT LISTENERS
// =============================================
function setupEventListeners() {
    window.addEventListener('click', (event) => {
        document.querySelectorAll('.modal').forEach(modal => {
            if (event.target === modal) closeModal(modal.id);
        });
    });

    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            document.querySelectorAll('.modal.show').forEach(modal => closeModal(modal.id));
        }
    });
}

// =============================================
// ROLE SELECTION
// =============================================
function selectRole(role) {
    currentRole = role;
    const roleInput = document.getElementById('selectedRole');
    if (roleInput) roleInput.value = role;

    document.querySelectorAll('.role-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.role === role);
    });

    updateDemoCredentials(role);
    clearForm();
    const emailInput = document.getElementById('email');
    if (emailInput) emailInput.focus();
}

function updateDemoCredentials(role) {
    const div = document.getElementById('demoCredentials');
    if (!div) return;
    if (role === 'admin') {
        div.innerHTML = `<p><strong>Admin:</strong> admin@hsnhs.edu / admin123</p>`;
    } else {
        div.innerHTML = `<p><strong>Alumni:</strong> juan@hsnhs.edu / password123</p><p>Or any registered alumni email</p>`;
    }
}

// =============================================
// PASSWORD TOGGLE
// =============================================
function togglePassword() {
    const input = document.getElementById('password');
    const icon = document.getElementById('toggleIcon');
    if (!input || !icon) return;

    passwordVisible = !passwordVisible;
    input.type = passwordVisible ? 'text' : 'password';
    icon.className = passwordVisible ? 'fas fa-eye-slash' : 'fas fa-eye';
}

// =============================================
// LOGIN HANDLER
// =============================================
function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('email').value.trim().toLowerCase();
    const password = document.getElementById('password').value;

    if (!validateLoginInputs(email, password)) return false;

    if (currentRole === 'admin') loginAdmin(email, password);
    else loginAlumni(email, password);

    return false;
}

function validateLoginInputs(email, password) {
    let isValid = true;
    if (!email) { showError('email', 'Email is required'); isValid = false; }
    else if (!isValidEmail(email)) { showError('email', 'Invalid email'); isValid = false; }

    if (!password) { showError('password', 'Password is required'); isValid = false; }
    return isValid;
}

// ----------------------------
// ADMIN LOGIN
// ----------------------------
function loginAdmin(email, password) {
    const adminCredentials = { email: 'admin@hsnhs.edu', password: 'admin123' };
    
    if (email === adminCredentials.email && password === adminCredentials.password) {
        // Save to sessionStorage instead of localStorage
        const userData = { role: 'admin', email, name: 'Administrator', loginTime: new Date().toISOString() };
        sessionStorage.setItem('currentUser', JSON.stringify(userData));

        showToast('Login successful! Redirecting to Admin Dashboard...', 'success');

        setTimeout(() => window.location.href = 'admin-dashboard.html', 1500);
    } else {
        showToast('Invalid admin credentials', 'error');
        showError('password', 'Incorrect email or password');
    }
}

// ----------------------------
// LOGOUT (works for both admin and alumni)
// ----------------------------
function logout() {
    sessionStorage.removeItem('currentUser'); // clear admin/alumni session
    window.location.href = 'index.html';
}

// ----------------------------
// GET CURRENT USER
// ----------------------------
function getCurrentUser() {
    const userStr = sessionStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
}

// =============================================
// ALUMNI LOGIN (via MySQL backend)
// =============================================
function loginAlumni(email, password) {
    fetch("https://tracealumni-production.up.railway.app/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    })
    .then(res => res.json())
    .then(response => {
        if (response.success) {
            const user = response.user;
            const userData = {
                role: 'alumni',
                email: user.email,
                name: user.fullName,
                id: user.id,
                loginTime: new Date().toISOString()
            };

            // Save in sessionStorage (matches alumni-dashboard.js)
            sessionStorage.setItem('currentUser', JSON.stringify(userData));

            showToast('Welcome back, ' + user.fullName + '!', 'success');
            setTimeout(() => window.location.href = 'alumni-dashboard.html', 1500);

        } else {
            showToast(response.message, 'error');
            showError('password', response.message);
        }
    })
    .catch(err => {
        console.error(err);
        showToast('Login failed due to server error', 'error');
    });
}

// =============================================
// UTILITY FUNCTIONS
// =============================================
function clearForm() {
    ['email','password'].forEach(id => {
        const input = document.getElementById(id);
        if(input){ input.value=''; clearError(input); }
    });
}

function showError(fieldId, message) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    field.classList.add('error');
    let div = field.parentElement.querySelector('.error-message');
    if(!div){ div=document.createElement('div'); div.className='error-message'; div.style.cssText='color:#dc3545;font-size:0.8rem;margin-top:5px;'; field.parentElement.appendChild(div);}
    div.textContent = message;
    setTimeout(()=>clearError(field),3000);
}

function clearError(field) {
    if(!field) return;
    field.classList.remove('error');
    const div = field.parentElement.querySelector('.error-message');
    if(div) div.remove();
}

function isValidEmail(email){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }

function showToast(message, type='info'){
    const existing = document.getElementById('toast');
    if(existing) existing.remove();
    const toast = document.createElement('div');
    toast.id='toast'; toast.className='toast toast-'+type; toast.innerHTML='<span id="toastMessage">'+message+'</span>';
    document.body.appendChild(toast);
    setTimeout(()=>toast.classList.add('show'),100);
    setTimeout(()=>{toast.classList.remove('show'); setTimeout(()=>toast.remove(),300);},3000);
}

function getCurrentUser(){ 
    const str = sessionStorage.getItem('currentUser'); 
    if(str) try { return JSON.parse(str); } catch(e) { return null; }
    return null; 
}

// =============================================
// MODAL FUNCTIONS
// =============================================
function showForgotPassword(){ const modal=document.getElementById('forgotPasswordModal'); if(modal) modal.classList.add('show'); return false;}
function showHelp(){ const modal=document.getElementById('helpModal'); if(modal) modal.classList.add('show'); return false;}
function closeModal(id){ const modal=document.getElementById(id); if(modal) modal.classList.remove('show'); }
function handleForgotPassword(event){ event.preventDefault(); const email=document.getElementById('resetEmail').value.trim(); if(email){ showToast('Password reset link sent to '+email,'success'); closeModal('forgotPasswordModal'); document.getElementById('forgotPasswordForm').reset();}}

// =============================================
// GLOBAL ACCESS
// =============================================
window.selectRole=selectRole;
window.togglePassword=togglePassword;
window.handleLogin=handleLogin;
window.showForgotPassword=showForgotPassword;
window.showHelp=showHelp;
window.closeModal=closeModal;
window.handleForgotPassword=handleForgotPassword;
window.handleRegister=function(){
    if(currentRole==='admin') showToast('Admin accounts are created by system administrator only.','info');
    else window.location.href='register.html';
};

// Remove demo localStorage initialization - now MySQL handles it