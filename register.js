/**
 * register.js - TRACE Alumni System
 * Holy Spirit National High School
 * 
 * Features:
 * - Dynamic Year Dropdown Population
 * - Password Visibility Toggle
 * - Conditional Field Logic (Employment vs College)
 * - Comprehensive Form Validation
 * - Toast Notifications & Modal Handling
 * - Mock API Submission
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize the application
    initializeYearDropdown();
    
    // Set up event listeners
    setupEventListeners();
});

/**
 * 1. POPULATE YEAR DROPDOWN
 * Dynamically fills the "Year Graduated" select box 
 * starting from the current year back to 1970.
 */
function initializeYearDropdown() {
    const yearSelect = document.getElementById('yearGraduated');
    if (!yearSelect) return;

    const currentYear = new Date().getFullYear();
    const startYear = 1970;

    for (let year = currentYear; year >= startYear; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    }
}

/**
 * 2. EVENT LISTENERS
 * Attaches non-inline event listeners for better performance and cleaner code.
 */
function setupEventListeners() {
    // Password Toggles
    const passwordFields = ['password', 'confirmPassword'];
    passwordFields.forEach(id => {
        const toggleBtn = document.querySelector(`#${id}`).parentElement.querySelector('.password-toggle');
        if(toggleBtn) {
            toggleBtn.addEventListener('click', () => togglePasswordField(id));
        }
    });

    // Real-time Password Matching Feedback
    const confirmPassword = document.getElementById('confirmPassword');
    if (confirmPassword) {
        confirmPassword.addEventListener('input', function() {
            const password = document.getElementById('password').value;
            if (this.value.length > 0) {
                if (this.value !== password) {
                    setError(this, 'Passwords do not match');
                } else {
                    clearError(this);
                }
            } else {
                clearError(this);
            }
        });
    }

    // Close Modals on outside click
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            closeModal(event.target.id);
        }
    });
}

/**
 * 3. PASSWORD VISIBILITY TOGGLE
 * Switches input type between 'password' and 'text'.
 */
function togglePasswordField(inputId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(`toggleIcon-${inputId}`);
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

/**
 * 4. STATUS CHANGE HANDLER
 * Shows/Hides dynamic form sections based on the user's current status.
 */
function handleStatusChange() {
    const status = document.getElementById('currentStatus').value;
    
    // Sections to toggle
    const employmentDetails = document.getElementById('employmentDetails');
    const unemploymentDetails = document.getElementById('unemploymentDetails');
    const collegeDetails = document.getElementById('collegeDetails');

    // Reset all first
    employmentDetails.style.display = 'none';
    unemploymentDetails.style.display = 'none';
    collegeDetails.style.display = 'none';
    
    // Clear validation errors in hidden sections
    clearSectionErrors(employmentDetails);
    clearSectionErrors(unemploymentDetails);
    clearSectionErrors(collegeDetails);

    // Show relevant section
    if (status === 'Employed' || status === 'Entrepreneur') {
        employmentDetails.style.display = 'block';
    } else if (status === 'Unemployed') {
        unemploymentDetails.style.display = 'block';
    } else if (status === 'College') {
        collegeDetails.style.display = 'block';
    }
}

/**
 * 5. FORM SUBMISSION & VALIDATION
 * Main handler for the form submit event.
 */
function handleRegistration(event) {
    event.preventDefault();

    // 1. Collect Form Data
    const form = document.getElementById('registerForm');
    const formData = {
        fullName: document.getElementById('fullName').value.trim(),
        email: document.getElementById('email').value.trim(),
        password: document.getElementById('password').value,
        confirmPassword: document.getElementById('confirmPassword').value,
        yearGraduated: document.getElementById('yearGraduated').value,
        strand: document.getElementById('strand').value,
        status: document.getElementById('currentStatus').value,
        contactNumber: document.getElementById('contactNumber')?.value.trim(),
        // Dynamic fields
        jobTitle: document.getElementById('jobTitle')?.value.trim(),
        companyName: document.getElementById('companyName')?.value.trim(),
        university: document.getElementById('university')?.value.trim(),
        course: document.getElementById('course')?.value.trim(),
        skills: document.getElementById('skills').value.trim()
    };

    // ✅ 1a. Contact Number Validation (optional field)
    if (formData.contactNumber && !/^\d{10,15}$/.test(formData.contactNumber)) {
        setError(document.getElementById('contactNumber'), 'Enter a valid contact number (10-15 digits)');
        return;
    } else {
        clearError(document.getElementById('contactNumber'));
    }

    // 2. Basic Validation
    if (!validateBasicFields(formData)) return;

    // 3. Conditional Validation (Check dynamic fields based on status)
    if (!validateConditionalFields(formData)) return;

    // 4. Terms Check
    const agreeTerms = document.getElementById('agreeTerms');
    if (!agreeTerms.checked) {
        showToast('Please agree to the Terms and Conditions.', 'error');
        return;
    }

    // 5. Submit Data
    submitRegistration(formData, form);
}

/**
 * Helper: Validate basic non-empty fields
 */
function validateBasicFields(data) {
    let isValid = true;

    if (data.fullName === '') {
        setError(document.getElementById('fullName'), 'Full name is required');
        isValid = false;
    }
    if (data.email === '' || !validateEmail(data.email)) {
        setError(document.getElementById('email'), 'Valid email is required');
        isValid = false;
    }
    if (data.password.length < 6) {
        setError(document.getElementById('password'), 'Password must be at least 6 characters');
        isValid = false;
    }
    if (data.password !== data.confirmPassword) {
        setError(document.getElementById('confirmPassword'), 'Passwords do not match');
        isValid = false;
    }
    if (data.yearGraduated === '') {
        setError(document.getElementById('yearGraduated'), 'Please select graduation year');
        isValid = false;
    }
    if (data.strand === '') {
        setError(document.getElementById('strand'), 'Please select a strand');
        isValid = false;
    }
    if (data.status === '') {
        setError(document.getElementById('currentStatus'), 'Please select your current status');
        isValid = false;
    }

    return isValid;
}

/**
 * Helper: Validate fields that appear only for specific statuses
 */
function validateConditionalFields(data) {
    let isValid = true;

    // If Employed or Entrepreneur
    if (data.status === 'Employed' || data.status === 'Entrepreneur') {
        if (!data.jobTitle) {
            setError(document.getElementById('jobTitle'), 'Job title is required');
            isValid = false;
        }
        if (!data.companyName) {
            setError(document.getElementById('companyName'), 'Company name is required');
            isValid = false;
        }
    }

    // If College Student
    if (data.status === 'College') {
        if (!data.university) {
            setError(document.getElementById('university'), 'University name is required');
            isValid = false;
        }
        if (!data.course) {
            setError(document.getElementById('course'), 'Course/Degree is required');
            isValid = false;
        }
    }

    return isValid;
}

/**
 * Helper: Regex for Email Validation
 */
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * Helper: Set Visual Error
 */
function setError(input, message) {
    const formGroup = input.parentElement.parentElement;
    input.classList.add('error');
    
    // Remove existing error msg if any
    let errorEl = formGroup.querySelector('.error-message');
    if(!errorEl) {
        errorEl = document.createElement('div');
        errorEl.className = 'error-message';
        formGroup.appendChild(errorEl);
    }
    errorEl.textContent = message;
}

/**
 * Helper: Clear Visual Error
 */
function clearError(input) {
    const formGroup = input.parentElement.parentElement;
    input.classList.remove('error');
    const errorEl = formGroup.querySelector('.error-message');
    if (errorEl) {
        errorEl.remove();
    }
}

/**
 * Helper: Clear errors in a specific section (used when hiding dynamic divs)
 */
function clearSectionErrors(section) {
    const inputs = section.querySelectorAll('.form-control');
    inputs.forEach(input => clearError(input));
}

/**
 * 6. SUBMISSION PROCESS
 * Simulates an API call with a delay.
 */
function submitRegistration(data, formElement) {

fetch("https://tracealumni-production.up.railway.app/register", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
})
.then(res => res.json())
.then(response => {
    const successModal = document.getElementById('successModal');
    successModal.classList.add('show');

    // Redirect to login after 2 seconds
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 2000);

    // Clear any old 'currentUser' key just in case
    localStorage.removeItem('currentUser');
})

}
/**
 * 7. MODAL & TOAST FUNCTIONS
 */

// Open Terms Modal
function showTerms(event) {
    event.preventDefault();
    document.getElementById('termsModal').classList.add('show');
}

// Open Privacy Modal
function showPrivacy(event) {
    event.preventDefault();
    document.getElementById('privacyModal').classList.add('show');
}

// Close Specific Modal
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
}

// Show Toast Notification
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    toast.className = `toast toast-${type} show`; // reset classes and add show
    toastMessage.textContent = message;
    
    // Add icon based on type
    let icon = 'fa-info-circle';
    if(type === 'success') icon = 'fa-check-circle';
    if(type === 'error') icon = 'fa-exclamation-circle';
    
    // We assume the HTML toast structure has an i tag, or we append it
    // Since HTML provided has <span>, let's check. 
    // If span is empty, add icon:
    if(toast.querySelector('i')) {
         toast.querySelector('i').className = `fas ${icon}`;
    } else {
        toast.innerHTML = `<i class="fas ${icon}"></i> ${message}`;
    }

    // Auto hide after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

