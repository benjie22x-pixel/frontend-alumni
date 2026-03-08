/**
 * =============================================
 * ALUMNI DASHBOARD.JS - TRACE ALUMNI SYSTEM
 * Backend-driven version (no localStorage)
 * =============================================
 */

let currentUser = null;  // Logged-in user
let currentUserData = null; // Full user data from DB

// ----------------------------
// INITIALIZATION
// ----------------------------

document.addEventListener('DOMContentLoaded', async () => {
    currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'alumni') {
        window.location.href = 'index.html';
        return;
    }

    // Load profile, timeline, skills
    await loadAlumniData();

    // Load registered events & upcoming events
    await loadRegisteredEvents();
    await loadUpcomingEvents();

    // Setup forms and modals
    setupEventListeners();
});


// ----------------------------
// GET CURRENT USER (from sessionStorage or JWT token)
// ----------------------------
function getCurrentUser() {
    // If using sessionStorage for login info
    const userStr = sessionStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
}

// ----------------------------
// LOAD ALUMNI DATA
// ----------------------------
async function loadAlumniData() {
    try {
        const res = await fetch(`https://tracealumni-production.up.railway.app/alumni/${currentUser.id}`);
        if (!res.ok) throw new Error('Failed to fetch user data');
        currentUserData = await res.json();

        updateProfileUI(currentUserData);
        await loadTimeline(currentUserData.id);
        await loadSkills(currentUserData.id);

    } catch (err) {
        console.error(err);
        showToast('Error loading profile data', 'error');
    }
}

// ----------------------------
// EVENT LISTENERS
// ----------------------------
function setupEventListeners() {
    const statusForm = document.getElementById('statusForm');
    if (statusForm) statusForm.addEventListener('submit', updateAlumniStatus);

    const timelineForm = document.getElementById('timelineForm');
    if (timelineForm) timelineForm.addEventListener('submit', addTimelineEntry);

    const contactForm = document.querySelector('#contactAdminModal form');
    if (contactForm) contactForm.addEventListener('submit', sendAdminRequest);

    window.onclick = function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    }
}

// ----------------------------
// PROFILE UI
// ----------------------------
function updateProfileUI(user) {
    document.getElementById('headerName').textContent = user.fullName.split(' ')[0];
    document.getElementById('profileAvatar').src = user.profileImage || 'Image/hsnhs.logo.jpg';
    document.getElementById('headerAvatar').src = user.profileImage || 'Image/hsnhs.logo.jpg';

    document.getElementById('profileName').textContent = user.fullName;
    document.getElementById('profileMeta').textContent = `Class of ${user.yearGraduated} | ${user.strand}`;
    document.getElementById('profileEmail').textContent = user.email;
    document.getElementById('profileStrand').textContent = user.strand;
    document.getElementById('profileCompany').textContent = user.companyName || 'N/A';
    document.getElementById('profileLocation').textContent = user.location || 'N/A';

    const statusBadge = document.getElementById('profileStatus');
    statusBadge.textContent = user.status || 'Unemployed';
    statusBadge.className = `badge badge-${(user.status || 'unemployed').toLowerCase().replace(' ', '')}`;

    // Populate Status Form
    document.getElementById('newStatus').value = user.status || '';
    document.getElementById('newCourseJob').value = user.jobTitle || '';
    document.getElementById('newCompanySchool').value = user.companyName || '';
    document.getElementById('newLocation').value = user.location || '';
}

// ----------------------------
// STATUS UPDATE
// ----------------------------

console.log("Updating status for user:", currentUserData?.id);
console.log("Payload:", { status, courseJob, companySchool, location });

async function updateAlumniStatus(event) {
    event.preventDefault();

    const oldStatus = currentUserData.status;

    const status = document.getElementById('newStatus').value;
    const courseJob = document.getElementById('newCourseJob').value;
    const companySchool = document.getElementById('newCompanySchool').value;
    const location = document.getElementById('newLocation').value;

    try {
        const res = await fetch(`https://tracealumni-production.up.railway.app/alumni/${currentUserData.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status, courseJob, companySchool, location })
        });

        if (!res.ok) {
            const errorData = await res.json();
            return showToast(`Update failed: ${errorData.error}`, 'error');
        }

        const updatedUser = await res.json();
        currentUserData = updatedUser;
        updateProfileUI(currentUserData);

        // ✅ Notify user
        showToast('Record updated successfully!', 'success');

        // Only add timeline if the status actually changed
        if (oldStatus !== status) {
            await addAutoTimelineEntry(status, courseJob, companySchool);
        }
    } catch (err) {
        console.error(err);
        showToast('Server error. Please try again.', 'error');
    }
}

async function addAutoTimelineEntry(status, courseJob, companySchool) {
    let title = "";
    if (status === 'Employed') title = `Started working at ${companySchool || 'New Company'}`;
    else if (status === 'College') title = `Enrolled in ${courseJob || 'College'}`;
    else if (status === 'Entrepreneur') title = `Started business: ${courseJob}`;
    else title = `Updated status to ${status}`;

    try {
        await fetch(`https://tracealumni-production.up.railway.app/timeline`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: currentUserData.id,
                title,
                description: '',
                date: new Date().toISOString().split('T')[0]
            })
        });

        await loadTimeline(currentUserData.id);
    } catch (err) {
        console.error(err);
        showToast('Failed to add timeline entry', 'error');
    }
}

// ----------------------------
// TIMELINE
// ----------------------------
async function loadTimeline(userId) {
    const container = document.getElementById('timelineContainer');
    console.log("loadTimeline called for user:", userId);

    try {
        const res = await fetch(`https://tracealumni-production.up.railway.app/timeline/${userId}`);
        console.log("fetch status:", res.status);

        if (!res.ok) throw new Error('Failed to load timeline');

        const timeline = await res.json();
        console.log("timeline response:", timeline);

        if (!timeline || timeline.length === 0) {
            container.innerHTML = `<div class="empty-state"><p>No timeline entries yet.</p></div>`;
            return;
        }

        container.innerHTML = timeline.map(item => `
            <div class="timeline-item">
                <div class="timeline-date">${formatDate(item.date)}</div>
                <div class="timeline-content">
                    <h4 class="timeline-title">${escapeHtml(item.title)}</h4>
                    <p class="timeline-desc">${escapeHtml(item.description)}</p>
                </div>
            </div>
        `).join('');

    } catch (err) {
        console.error("Error in loadTimeline:", err);
        container.innerHTML = `<div class="empty-state"><p>Error loading timeline</p></div>`;
    }
}

async function addTimelineEntry(event) {
    event.preventDefault();
    const title = document.getElementById('timelineTitle').value;
    const date = document.getElementById('timelineDate').value;
    const description = document.getElementById('timelineDescription').value;

    try {
        await fetch(`https://tracealumni-production.up.railway.app/timeline`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: currentUserData.id,
                title,
                description,
                date
            })
        });

        closeTimelineModal();
        document.getElementById('timelineForm').reset();
        await loadTimeline(currentUserData.id);
        showToast('Timeline entry added!', 'success');

    } catch (err) {
        console.error(err);
        showToast('Failed to add timeline entry', 'error');
    }
}

// ----------------------------
// SKILLS
// ----------------------------
async function loadSkills(userId) {
    const container = document.getElementById('skillsList');

    try {
        const res = await fetch(`https://tracealumni-production.up.railway.app/skills/${userId}`);
        if (!res.ok) throw new Error('Failed to load skills');
        const skills = await res.json();

        if (!skills || skills.length === 0) {
            container.innerHTML = '<span class="skill-tag">No skills added</span>';
            return;
        }

        container.innerHTML = skills.map(skill => `<span class="skill-tag">${escapeHtml(skill)}</span>`).join('');

    } catch (err) {
        console.error(err);
        container.innerHTML = '<span class="skill-tag">Error loading skills</span>';
    }
}

// ----------------------------
// MODALS & UTILITIES
// ----------------------------
function openContactAdminModal() { document.getElementById('contactAdminModal').style.display = 'flex'; }
function closeContactAdminModal() { document.getElementById('contactAdminModal').style.display = 'none'; }

function openTimelineModal() { document.getElementById('timelineModal').style.display = 'flex'; }
function closeTimelineModal() { document.getElementById('timelineModal').style.display = 'none'; }

function logout() {
    sessionStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    showToast('Dark mode toggled', 'info');
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.className = `toast toast-${type}`;
    document.getElementById('toastMessage').textContent = message;
    toast.style.display = 'block';
    
    void toast.offsetWidth;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => { toast.style.display = 'none'; }, 300);
    }, 3000);
}

function formatDate(dateString) {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' });
}

function escapeHtml(text) {
    if (!text) return '';
    return text.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;");
}

// ----------------------------
// EVENTS
// ----------------------------
async function loadEvents() {
    const container = document.getElementById('eventsContainer');
    try {
        const res = await fetch("https://tracealumni-production.up.railway.app/events");
        if (!res.ok) throw new Error('Failed to load events');
        const events = await res.json();

        if (!events || events.length === 0) {
            container.innerHTML = `<p>No upcoming events.</p>`;
            return;
        }

        container.innerHTML = events.map(ev => `
            <div class="event-card">
                <h4>${escapeHtml(ev.title)}</h4>
                <p>${escapeHtml(ev.description)}</p>
                <p><strong>Date:</strong> ${formatDate(ev.date)}</p>
                <p><strong>Location:</strong> ${escapeHtml(ev.location)}</p>
                <button onclick="registerEvent(${ev.id})">Register</button>
            </div>
        `).join('');

    } catch (err) {
        console.error(err);
        container.innerHTML = `<p>Error loading events</p>`;
    }
}

async function registerEvent(eventId) {
    try {
        const res = await fetch(`https://tracealumni-production.up.railway.app/${eventId}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ alumniId: currentUserData.id })
        });

        const data = await res.json();
        if (data.success) showToast(data.message, 'success');
        else showToast(data.error || 'Failed to register', 'error');

    } catch (err) {
        console.error(err);
        showToast('Server error registering for event', 'error');
    }
}

async function loadRegisteredEvents() {
    try {
        const res = await fetch(`https://tracealumni-production.up.railway.app/event-registrations/${currentUser.id}`);
        if (!res.ok) throw new Error('Failed to load registered events');
        const registrations = await res.json();
        registeredEventIds = registrations.map(r => r.eventId);
    } catch (err) {
        console.error(err);
        registeredEventIds = [];
    }
}
/*
document.addEventListener('DOMContentLoaded', async () => {
    currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'alumni') {
        window.location.href = 'index.html';
        return;
    }

    // Load profile, timeline, skills
    await loadAlumniData();

    // Load registered events & upcoming events
    await loadRegisteredEvents();
    await loadUpcomingEvents();

    // Setup forms and modals
    setupEventListeners();
});

let allEvents = [];
let registeredEventIds = [];
*/
// ----------------------------
// LOAD UPCOMING EVENTS
// ----------------------------
// ----------------------------
// LOAD UPCOMING EVENTS (ROBUST)
// ----------------------------
async function loadUpcomingEvents() {
    const container = document.getElementById('upcomingEventsSection');
    container.innerHTML = '';

    try {
        // Make sure registered events are loaded first
        if (!registeredEventIds || !Array.isArray(registeredEventIds)) {
            await loadRegisteredEvents();
        }

        const res = await fetch('https://tracealumni-production.up.railway.app/events');
        if (!res.ok) throw new Error('Failed to fetch events');
        const events = await res.json();

        console.log("Fetched events:", events);
        console.log("Registered event IDs:", registeredEventIds);

        if (!events || events.length === 0) {
            container.innerHTML = `<p style="text-align:center;">No upcoming events.</p>`;
            return;
        }

        // Sort events by date safely
        events.sort((a, b) => new Date(a.date) - new Date(b.date));

        events.forEach(event => {
            // Safe date parsing
            let eventDate = event.date ? new Date(event.date) : new Date();
            if (isNaN(eventDate.getTime())) eventDate = new Date();

            const month = eventDate.toLocaleString('en-US', { month: 'short' }).toUpperCase();
            const day = eventDate.getDate();

            const isRegistered = registeredEventIds.includes(event.id);

            const div = document.createElement('div');
            div.className = `event-item ${isRegistered ? 'registered-event' : ''}`;
            div.innerHTML = `
                <div class="event-date">
                    <span class="month">${month}</span>
                    <span class="day">${day}</span>
                </div>
                <div class="event-info">
                    <h4>${escapeHtml(event.title)}</h4>
                    <p><i class="fas fa-map-marker-alt"></i> ${escapeHtml(event.location || 'TBA')}</p>
                    <p><i class="fas fa-clock"></i> ${event.time ? formatTime(event.time) : 'TBA'}</p>
                    <p>${escapeHtml(event.description || '')}</p>
                </div>
                <button class="btn btn-sm" ${isRegistered ? 'disabled' : ''} 
                        onclick="toggleEventRegistration(${event.id})">
                    ${isRegistered ? 'Registered' : 'Register'}
                </button>
            `;
            container.appendChild(div);
        });

    } catch (err) {
        console.error("Error loading upcoming events:", err);
        container.innerHTML = `<p style="text-align:center; color:red;">Error loading events.</p>`;
    }
}

function formatTime(timeString) {
    if (!timeString) return '';
    const [hour, minute, second] = timeString.split(':');
    let hourNum = parseInt(hour);
    const ampm = hourNum >= 12 ? 'PM' : 'AM';
    hourNum = hourNum % 12 || 12;
    return `${hourNum}:${minute} ${ampm}`;
}
// ----------------------------
// TOGGLE EVENT REGISTRATION
// ----------------------------
async function toggleEventRegistration(eventId) {
    const isRegistered = registeredEventIds.includes(eventId);

    try {
        let res;
        if (isRegistered) {
            res = await fetch(`https://tracealumni-production.up.railway.app/event-registrations/${currentUser.id}/${eventId}`, {
                method: 'DELETE'
            });
        } else {
            res = await fetch(`https://tracealumni-production.up.railway.app/event-registrations`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ alumniId: currentUser.id, eventId })
            });
        }

        if (!res.ok) throw new Error('Failed to update registration');

        // Reload registrations and events
        await loadRegisteredEvents();
        await loadUpcomingEvents();

        showToast(isRegistered ? 'Event unregistered' : 'Registered for event', 'success');

    } catch (err) {
        console.error(err);
        showToast('Error updating registration', 'error');
    }
}

// ----------------------------
// LOAD REGISTERED EVENTS FOR CURRENT USER
// ----------------------------
async function loadRegisteredEvents() {
    try {
        const res = await fetch(`https://tracealumni-production.up.railway.app/event-registrations/${currentUser.id}`);
        if (!res.ok) throw new Error('Failed to load registered events');
        const registrations = await res.json();
        registeredEventIds = registrations.map(r => r.eventId);
    } catch (err) {
        console.error(err);
        registeredEventIds = [];
    }
}