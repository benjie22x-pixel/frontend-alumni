/**
 * =============================================
 * SCRIPT.JS - TRACE ALUMNI SYSTEM
 * Holy Spirit National High School
 * Complete Login & Utility Functions
 * =============================================
 */

// Global Variables
let currentRole = 'alumni';

// =============================================
// LOCAL STORAGE INITIALIZATION
// =============================================

// Initialize localStorage with dummy data if not present
function initializeData() {
    if (!localStorage.getItem('alumniData')) {
        const dummyData = [
            {
                id: 1,
                fullName: 'Juan Dela Cruz',
                email: 'juan@hsnhs.edu',
                password: 'password123',
                yearGraduated: 2020,
                strand: 'STEM',
                status: 'Employed',
                courseJob: 'Software Engineer',
                companySchool: 'Tech Corp Philippines',
                location: 'Manila',
                skills: 'JavaScript, Python, React',
                photo: 'https://via.placeholder.com/150',
                createdAt: '2024-01-01T00:00:00.000Z',
                lastUpdated: '2024-01-01T00:00:00.000Z'
            },
            {
                id: 2,
                fullName: 'Maria Santos',
                email: 'maria@hsnhs.edu',
                password: 'password123',
                yearGraduated: 2019,
                strand: 'HUMSS',
                status: 'College',
                courseJob: 'Bachelor of Psychology',
                companySchool: 'University of the Philippines',
                location: 'Quezon City',
                skills: 'Research, Counseling, Communication',
                photo: 'https://via.placeholder.com/150',
                createdAt: '2024-01-01T00:00:00.000Z',
                lastUpdated: '2024-01-01T00:00:00.000Z'
            },
            {
                id: 3,
                fullName: 'Pedro Garcia',
                email: 'pedro@hsnhs.edu',
                password: 'password123',
                yearGraduated: 2021,
                strand: 'ABM',
                status: 'Entrepreneur',
                courseJob: 'Coffee Shop Owner',
                companySchool: 'Bean & Brew Café',
                location: 'Makati',
                skills: 'Business Management, Marketing, Finance',
                photo: 'https://via.placeholder.com/150',
                createdAt: '2024-01-01T00:00:00.000Z',
                lastUpdated: '2024-01-01T00:00:00.000Z'
            },
            {
                id: 4,
                fullName: 'Ana Reyes',
                email: 'ana@hsnhs.edu',
                password: 'password123',
                yearGraduated: 2022,
                strand: 'STEM',
                status: 'Employed',
                courseJob: 'Nurse',
                companySchool: 'St. Luke\'s Medical Center',
                location: 'Quezon City',
                skills: 'Patient Care, Medical Terminology, Compassion',
                photo: 'https://via.placeholder.com/150',
                createdAt: '2024-01-01T00:00:00.000Z',
                lastUpdated: '2024-01-01T00:00:00.000Z'
            },
            {
                id: 5,
                fullName: 'Jose Miguel',
                email: 'jose@hsnhs.edu',
                password: 'password123',
                yearGraduated: 2023,
                strand: 'TVL',
                status: 'Skills Training',
                courseJob: 'Automotive Mechanic',
                companySchool: 'TESDA Training Center',
                location: 'Caloocan',
                skills: 'Automotive Repair, Technical Skills',
                photo: 'https://via.placeholder.com/150',
                createdAt: '2024-01-01T00:00:00.000Z',
                lastUpdated: '2024-01-01T00:00:00.000Z'
            }
        ];
        localStorage.setItem('alumniData', JSON.stringify(dummyData));
    }
}

// Call initialization on load
initializeData();

// =============================================
// AUTHENTICATION FUNCTIONS
// =============================================

// Get current logged in user
function getCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
        try {
            return JSON.parse(userStr);
        } catch (e) {
            return null;
        }
    }
    return null;
}

// Set current user (after login)
function setCurrentUser(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
}

// Logout function
function logoutUser() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// =============================================
// DATA MANAGEMENT FUNCTIONS
// =============================================

// Get alumni data from localStorage
function getAlumniData() {
    const dataStr = localStorage.getItem('alumniData');
    if (dataStr) {
        try {
            return JSON.parse(dataStr);
        } catch (e) {
            return [];
        }
    }
    return [];
}

// Save alumni data to localStorage
function saveAlumniData(data) {
    localStorage.setItem('alumniData', JSON.stringify(data));
}

// =============================================
// LOGIN MODAL FUNCTIONS
// =============================================

// Show login modal
function showLoginModal() {
    const modal = document.getElementById('login-modal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

// Close login modal
function closeLoginModal() {
    const modal = document.getElementById('login-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Open login modal (alias for showLoginModal)
function openLoginModal() {
    showLoginModal();
}

// =============================================
// ROLE SELECTION
// =============================================

/**
 * Select login role (Alumni or Admin)
 * @param {string} role - The role to select
 */
function selectRole(role) {
    currentRole = role;
    
    // Update hidden input
    const roleInput = document.getElementById('selectedRole');
    if (roleInput) {
        roleInput.value = role;
    }
    
    // Update tab styling
    const tabs = document.querySelectorAll('.role-tab');
    tabs.forEach(function(tab) {
        if (tab.dataset.role === role) {
            tab.classList.add('active');
            tab.style.background = '#003366';
            tab.style.color = '#ffffff';
        } else {
            tab.classList.remove('active');
            tab.style.background = 'transparent';
            tab.style.color = '#6c757d';
        }
    });
    
    // Update demo credentials display
    updateDemoCredentials(role);
    
    // Clear form
    clearLoginForm();
}

/**
 * Update demo credentials based on selected role
 * @param {string} role - The current role
 */
function updateDemoCredentials(role) {
    const demoInfo = document.getElementById('demo-info');
    if (!demoInfo) return;
    
    if (role === 'admin') {
        demoInfo.innerHTML = 'Admin: admin@hsnhs.edu / admin123';
    } else {
        demoInfo.innerHTML = 'Alumni: juan@hsnhs.edu / password123';
    }
}

/**
 * Clear login form fields
 */
function clearLoginForm() {
    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');
    
    if (emailInput) emailInput.value = '';
    if (passwordInput) passwordInput.value = '';
}

// =============================================
// LOGIN HANDLER - MAIN FUNCTION
// =============================================

/**
 * Handle login form submission
 * @param {Event} event - Form submit event
 */
function handleLogin(event) {
    event.preventDefault();
    event.stopPropagation();
    
    console.log('Login attempt started. Role:', currentRole);
    
    const email = document.getElementById('login-email').value.trim().toLowerCase();
    const password = document.getElementById('login-password').value;
    
    console.log('Email:', email);
    
    // Validate inputs
    if (!email) {
        showToast('Please enter your email address', 'error');
        return false;
    }
    
    if (!password) {
        showToast('Please enter your password', 'error');
        return false;
    }
    
    // Attempt login based on role
    if (currentRole === 'admin') {
        loginAdmin(email, password);
    } else {
        loginAlumni(email, password);
    }
    
    return false;
}

/**
 * Login as administrator - REDIRECTS TO ADMIN DASHBOARD
 * @param {string} email - Admin email
 * @param {string} password - Admin password
 */
function loginAdmin(email, password) {
    console.log('Attempting admin login...');
    
    // Hardcoded admin credentials
    const adminCredentials = {
        email: 'admin@hsnhs.edu',
        password: 'admin123'
    };
    
    if (email === adminCredentials.email && password === adminCredentials.password) {
        console.log('Admin login successful!');
        
        // Create admin user session
        const userData = {
            role: 'admin',
            email: email,
            name: 'Administrator',
            loginTime: new Date().toISOString()
        };
        
        // Store user session in localStorage
        localStorage.setItem('currentUser', JSON.stringify(userData));
        
        // Show success message
        showToast('Login successful! Redirecting to Admin Dashboard...', 'success');
        
        // Redirect to admin dashboard after short delay
        setTimeout(function() {
            console.log('Redirecting to admin-dashboard.html');
            window.location.href = 'admin-dashboard.html';
        }, 1500);
        
    } else {
        console.log('Admin login failed - invalid credentials');
        showToast('Invalid admin credentials. Please try again.', 'error');
    }
}

/**
 * Login as alumni - REDIRECTS TO ALUMNI DASHBOARD
 * @param {string} email - Alumni email
 * @param {string} password - Alumni password
 */
function loginAlumni(email, password) {
    console.log('Attempting alumni login...');
    
    // Get alumni data from localStorage
    const alumniData = getAlumniData();
    
    // Find user by email
    const user = alumniData.find(function(alumni) {
        return alumni.email.toLowerCase() === email;
    });
    
    if (user) {
        console.log('User found:', user.fullName);
        
        if (user.password === password) {
            console.log('Alumni login successful!');
            
            // Create alumni user session
            const userData = {
                role: 'alumni',
                email: email,
                name: user.fullName,
                id: user.id,
                loginTime: new Date().toISOString()
            };
            
            // Store user session in localStorage
            localStorage.setItem('currentUser', JSON.stringify(userData));
            
            // Show success message
            showToast('Welcome back, ' + user.fullName + '!', 'success');
            
            // Redirect to alumni dashboard after short delay
            setTimeout(function() {
                console.log('Redirecting to alumni-dashboard.html');
                window.location.href = 'alumni-dashboard.html';
            }, 1500);
            
        } else {
            console.log('Alumni login failed - wrong password');
            showToast('Incorrect password. Please try again.', 'error');
        }
    } else {
        console.log('Alumni login failed - user not found');
        showToast('Email not found. Please register first.', 'error');
    }
}

// =============================================
// TOAST NOTIFICATION
// =============================================

/**
 * Show toast notification
 * @param {string} message - Message to display
 * @param {string} type - Message type (success, error, info)
 */
function showToast(message, type) {
    // Remove existing toast
    const existingToast = document.getElementById('toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    // Create toast element
    const toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast toast-' + type;
    toast.innerHTML = '<span id="toastMessage">' + message + '</span>';
    
    // Add styles
    toast.style.cssText = 'position: fixed; top: 20px; right: 20px; padding: 15px 25px; border-radius: 8px; color: white; font-weight: 500; z-index: 9999; opacity: 0; transform: translateX(400px); transition: all 0.4s ease; box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2); max-width: 350px;';
    
    if (type === 'success') {
        toast.style.background = 'linear-gradient(135deg, #28a745, #20c997)';
    } else if (type === 'error') {
        toast.style.background = 'linear-gradient(135deg, #dc3545, #c82333)';
    } else {
        toast.style.background = 'linear-gradient(135deg, #003366, #004080)';
    }
    
    // Add to body
    document.body.appendChild(toast);
    
    // Show toast
    setTimeout(function() {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(0)';
    }, 100);
    
    // Hide after 3 seconds
    setTimeout(function() {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(400px)';
        setTimeout(function() {
            toast.remove();
        }, 300);
    }, 3000);
}

// =============================================
// DARK MODE TOGGLE
// =============================================

// Toggle dark mode
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    showToast('Dark mode toggled!', 'info');
}

// =============================================
// FOOTER & NAVIGATION
// =============================================

// Mobile menu toggle
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    if (mobileMenu) {
        mobileMenu.classList.toggle('active');
    }
}

// =============================================
// HOME PAGE STATISTICS
// =============================================


