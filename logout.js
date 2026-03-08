/**
 * =============================================
 * LOGOUT FUNCTIONALITY
 * TRACE Alumni System
 * =============================================
 */

/**
 * Logout function - Clears session and redirects to index
 */
function logout() {
    // Clear the current user from localStorage
    localStorage.removeItem('currentUser');
    
    // Show logout message
    alert('You have been logged out successfully!');
    
    // Redirect to index page
    window.location.href = 'index.html';
}

// Make logout function globally accessible
window.logout = logout;

/**
 * =============================================
 * LOGOUT.JS - TRACE Alumni System
 * Holy Spirit National High School
 * =============================================
 */

// =============================================
// INITIALIZATION
// =============================================

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    checkAuth();
});

/**
 * Check if user is authenticated
 */
function checkAuth() {
    const user = localStorage.getItem('currentUser');
    if (!user) {
        // Not logged in, redirect to login page
        window.location.href = 'login.html';
    }
}

/**
 * Logout function - Clears session and redirects to index
 */
function logout() {
    // Clear the current user from localStorage
    localStorage.removeItem('currentUser');
    
    // Show confirmation and redirect
    alert('You have been logged out successfully!');
    
    // Redirect to index page
    window.location.href = 'index.html';
}

// =============================================
// EXPORT FUNCTION FOR GLOBAL ACCESS
// =============================================

window.logout = logout;