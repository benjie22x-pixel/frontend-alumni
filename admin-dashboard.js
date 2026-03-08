/**
 * =============================================
 * ADMIN DASHBOARD.JS - TRACE ALUMNI SYSTEM
 * Fully backend-driven version
 * =============================================
 */

let alumniData = [];
let currentPage = 1;
const itemsPerPage = 10;
let chartInstances = {};
let deleteId = null;

// ----------------------------
// INITIALIZATION
// ----------------------------
document.addEventListener('DOMContentLoaded', function() {
    loadAlumniData();
    loadAdminEvents(); // <-- ADD THIS
    setupEventListeners();
});

// ----------------------------
// LOAD ALL ALUMNI DATA
// ----------------------------
async function loadAlumniData() {
    try {
        const res = await fetch("https://tracealumni-production.up.railway.app/alumni");
        if (!res.ok) throw new Error("Failed to fetch alumni data");
        alumniData = await res.json();

        updateDashboardStats();
        renderAlumniTable();
        renderCharts();
        populateFilters();
    } catch (err) {
        console.error(err);
        showToast("Failed to load alumni data", "error");
    }
}

// ----------------------------
// DASHBOARD STATS
// ----------------------------

function formatTime(timeString) {
    if (!timeString) return '';
    const [hour, minute] = timeString.split(':');
    let hourNum = parseInt(hour);
    const ampm = hourNum >= 12 ? 'PM' : 'AM';
    hourNum = hourNum % 12 || 12;
    return `${hourNum}:${minute} ${ampm}`;
}
function updateDashboardStats() {
    const total = alumniData.length;
    const employed = alumniData.filter(a => a.status === 'Employed' || a.status === 'Entrepreneur').length;
    const college = alumniData.filter(a => a.status === 'College').length;
    const rate = total > 0 ? Math.round((employed / total) * 100) : 0;

    document.getElementById("totalAlumni").innerText = total;
    document.getElementById("employedCount").innerText = employed;
    document.getElementById("collegeCount").innerText = college;
    document.getElementById("employmentRate").innerText = rate + "%";
}

// ----------------------------
// RENDER ALUMNI TABLE
// ----------------------------
function renderAlumniTable() {
    const tbody = document.getElementById('alumniTableBody');
    tbody.innerHTML = '';
    const filteredData = filterData();
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedData = filteredData.slice(start, end);

    if (paginatedData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">No records found.</td></tr>`;
        updatePagination(0);
        return;
    }

    paginatedData.forEach(alumni => {
        let badgeClass = 'badge-secondary';
        if(alumni.status === 'Employed') badgeClass = 'badge-employed';
        else if(alumni.status === 'College') badgeClass = 'badge-college';
        else if(alumni.status === 'Entrepreneur') badgeClass = 'badge-entrepreneur';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <div style="display:flex; align-items:center; gap:10px;">
                    <img src="${alumni.profileImage || 'Image/hsnhs.logo.jpg'}" 
                         style="width:40px; height:40px; border-radius:50%; object-fit:cover;">
                    <div>
                        <strong>${alumni.fullName}</strong><br>
                        <small>${alumni.email}</small>
                    </div>
                </div>
            </td>
            <td>${alumni.yearGraduated}</td>
            <td>${alumni.strand}</td>
            <td><span class="badge ${badgeClass}">${alumni.status}</span></td>
            <td>
                <button class="btn-icon" onclick="openEditModal(${alumni.id})"><i class="fas fa-edit"></i></button>
                <button class="btn-icon btn-danger" onclick="openDeleteModal(${alumni.id})"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    updatePagination(filteredData.length);
}

// ----------------------------
// FILTERING
// ----------------------------
function filterData() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const batch = document.getElementById('filterBatch').value;
    const strand = document.getElementById('filterStrand').value;
    const status = document.getElementById('filterStatus').value;

    return alumniData.filter(item => {
        return item.fullName.toLowerCase().includes(search) &&
               (batch ? item.yearGraduated.toString() === batch : true) &&
               (strand ? item.strand === strand : true) &&
               (status ? item.status === status : true);
    });
}

function filterTable() { currentPage = 1; renderAlumniTable(); }

function populateFilters() {
    const batches = [...new Set(alumniData.map(a => a.yearGraduated))].sort((a,b) => b-a);
    const batchSelect = document.getElementById('filterBatch');
    batchSelect.innerHTML = '<option value="">All Batches</option>';
    batches.forEach(b => batchSelect.innerHTML += `<option value="${b}">${b}</option>`);
}

// ----------------------------
// PAGINATION
// ----------------------------
function updatePagination(totalItems) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    document.getElementById('pageInfo').innerText = `Page ${currentPage} of ${totalPages || 1}`;
    document.getElementById('prevBtn').disabled = currentPage === 1;
    document.getElementById('nextBtn').disabled = currentPage === totalPages || totalPages === 0;
}

function prevPage() { if(currentPage > 1) { currentPage--; renderAlumniTable(); } }
function nextPage() { currentPage++; renderAlumniTable(); }

// ----------------------------
// MODALS - EDIT
// ----------------------------
function openEditModal(id) {
    const alumni = alumniData.find(a => a.id === id);
    if (!alumni) return;

    document.getElementById('alumniId').value = alumni.id;
    document.getElementById('fullName').value = alumni.fullName;
    document.getElementById('email').value = alumni.email;
    document.getElementById('yearGraduated').value = alumni.yearGraduated;
    document.getElementById('strand').value = alumni.strand;
    document.getElementById('status').value = alumni.status;
    document.getElementById('courseJob').value = alumni.courseJob || '';
    document.getElementById('companySchool').value = alumni.companySchool || '';
    document.getElementById('location').value = alumni.location || '';
    document.getElementById('skills').value = alumni.skills || '';
    document.getElementById('modalTitle').innerText = 'Edit Alumni';
    document.getElementById('alumniModal').style.display = 'block';
}

function closeModal() { document.getElementById('alumniModal').style.display = 'none'; }

// ----------------------------
// SAVE / ADD ALUMNI
// ----------------------------
async function saveAlumni(event) {
    event.preventDefault();
    const id = document.getElementById('alumniId').value;
    const fileInput = document.getElementById('profileImage');
    const file = fileInput.files[0];

    function upload(imageBase64) {
        const payload = {
            fullName: document.getElementById('fullName').value,
            email: document.getElementById('email').value,
            yearGraduated: parseInt(document.getElementById('yearGraduated').value),
            strand: document.getElementById('strand').value,
            status: document.getElementById('status').value,
            courseJob: document.getElementById('courseJob').value,
            companySchool: document.getElementById('companySchool').value,
            location: document.getElementById('location').value,
            skills: document.getElementById('skills').value,
            profileImage: imageBase64 || null
        };

        const method = id ? 'PUT' : 'POST';
        const url = id ? `https://tracealumni-production.up.railway.app/alumni/${id}` : 'https://tracealumni-production.up.railway.app/alumni';

        fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        })
        .then(res => res.json())
        .then(() => {
            closeModal();
            loadAlumniData();
            showToast("Alumni saved successfully!", "success");
        })
        .catch(err => {
            console.error(err);
            showToast("Failed to save alumni", "error");
        });
    }

    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => upload(e.target.result);
        reader.readAsDataURL(file);
    } else {
        upload(null);
    }
}

// ----------------------------
// DELETE ALUMNI
// ----------------------------
function openDeleteModal(id) { deleteId = id; document.getElementById('deleteModal').style.display = 'block'; }
function closeDeleteModal() { document.getElementById('deleteModal').style.display = 'none'; }

async function confirmDelete() {
    if (!deleteId) return;

    try {
        const res = await fetch(`https://tracealumni-production.up.railway.app/alumni/${deleteId}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Failed to delete alumni");
        loadAlumniData();
        closeDeleteModal();
        showToast("Alumni deleted successfully!", "success");
    } catch (err) {
        console.error(err);
        showToast("Failed to delete alumni", "error");
    }
}

// ----------------------------
// CHARTS
// ----------------------------
function renderCharts() {
    const statusCounts = { 'Employed': 0, 'College': 0, 'Entrepreneur': 0, 'Skills Training': 0, 'Unemployed': 0 };
    alumniData.forEach(a => { if(statusCounts[a.status] !== undefined) statusCounts[a.status]++; });

    updateChart('employmentChart', 'doughnut', {
        labels: Object.keys(statusCounts),
        data: Object.values(statusCounts),
        colors: ['#28a745', '#17a2b8', '#ffc107', '#fd7e14', '#dc3545']
    });

    const strandCounts = {};
    alumniData.forEach(a => { strandCounts[a.strand] = (strandCounts[a.strand] || 0) + 1; });
    updateChart('strandChart', 'bar', {
        labels: Object.keys(strandCounts),
        data: Object.values(strandCounts),
        colors: ['#003366', '#004080', '#0059b3']
    });
}

function updateChart(canvasId, type, config) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    if (chartInstances[canvasId]) chartInstances[canvasId].destroy();
    chartInstances[canvasId] = new Chart(ctx, {
        type,
        data: {
            labels: config.labels,
            datasets: [{ data: config.data, backgroundColor: config.colors, borderWidth: 1 }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
    });
}
// ----------------------------
// EVENTS MANAGEMENT
// ----------------------------
let adminEvents = [];

async function loadAdminEvents() {
    const container = document.getElementById('eventsTableBody');
    try {
        const res = await fetch("https://tracealumni-production.up.railway.app/events");
        if (!res.ok) throw new Error('Failed to load events');
        adminEvents = await res.json();

        if (adminEvents.length === 0) {
            container.innerHTML = `<tr><td colspan="5" style="text-align:center;">No events found.</td></tr>`;
            return;
        }

        container.innerHTML = adminEvents.map(ev => `
            <tr>
                <td>${ev.title}</td>
                <td>${ev.description || ''}</td>
                <td>${new Date(ev.date).toLocaleDateString()}</td>
                <td>${ev.time ? formatTime(ev.time) : 'TBA'}</td>
                <td>${ev.location || ''}</td>
                <td>
                <button class="btn btn-sm btn-edit" onclick="openEventModal(${ev.id})" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-delete" onclick="deleteEvent(${ev.id})" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
            </tr>
        `).join('');

    } catch (err) {
        console.error(err);
        container.innerHTML = `<tr><td colspan="5">Error loading events</td></tr>`;
    }
}

function openEventModal(id = null) {
    if (id) {
        const ev = adminEvents.find(e => e.id === id);
        if (!ev) return;
        document.getElementById('eventId').value = ev.id;
        document.getElementById('eventTitle').value = ev.title;
        document.getElementById('eventDescription').value = ev.description || '';
        document.getElementById('eventDate').value = ev.date;
        document.getElementById('eventTime').value = ev.time || '';
        document.getElementById('eventLocation').value = ev.location || '';
        document.getElementById('eventModalTitle').innerText = 'Edit Event';
    } else {
        document.getElementById('eventForm').reset();
        document.getElementById('eventId').value = '';
        document.getElementById('eventModalTitle').innerText = 'Add Event';
    }
    document.getElementById('eventModal').style.display = 'flex';
}

function closeEventModal() {
    document.getElementById('eventModal').style.display = 'none';
}

document.getElementById('eventForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    const id = document.getElementById('eventId').value;
    const title = document.getElementById('eventTitle').value;
    const description = document.getElementById('eventDescription').value;
    const date = document.getElementById('eventDate').value;
    const location = document.getElementById('eventLocation').value;
    const time = document.getElementById('eventTime').value;

    try {
        let res;
        if (id) {
            // Update event
            res = await fetch(`https://tracealumni-production.up.railway.app/events/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, description, date, time, location })
            });
        } else {
            // Add new event
            res = await fetch(`https://tracealumni-production.up.railway.app/events`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, description, date, time, location })
            });
        }

        const data = await res.json();
        if (res.ok) {
            closeEventModal();
            loadAdminEvents();
            showToast(id ? 'Event updated!' : 'Event added!', 'success');
        } else {
            showToast(data.error || 'Failed to save event', 'error');
        }

    } catch (err) {
        console.error(err);
        showToast('Server error saving event', 'error');
    }
});

async function deleteEvent(id) {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
        const res = await fetch(`https://tracealumni-production.up.railway.app/events/${id}`, { method: 'DELETE' });
        if (res.ok) {
            showToast('Event deleted!', 'success');
            loadAdminEvents();
        } else {
            const data = await res.json();
            showToast(data.error || 'Failed to delete', 'error');
        }
    } catch (err) {
        console.error(err);
        showToast('Server error deleting event', 'error');
    }
}
// ----------------------------
// UTILITIES
// ----------------------------
function exportData() {
    let csv = "Name,Email,Batch,Strand,Status,Company\n";
    alumniData.forEach(a => csv += `"${a.fullName}","${a.email}","${a.yearGraduated}","${a.strand}","${a.status}","${a.companySchool}"\n`);
    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'alumni_data.csv';
    link.click();
    showToast('Data exported!', 'success');
}

function showToast(message, type) {
    const toast = document.getElementById('toast');
    toast.className = `toast toast-${type}`;
    document.getElementById('toastMessage').innerText = message;
    toast.style.display = 'block';
    setTimeout(() => toast.style.display = 'none', 3000);
}

function logout() {
    sessionStorage.removeItem('currentUser'); // clears login info
    window.location.href = 'index.html';       // back to login page
}
function toggleDarkMode() { document.body.classList.toggle('dark-mode'); }
function setupEventListeners() { 
    window.onclick = function(e) { 
        if(e.target.classList.contains('modal')) e.target.style.display = "none"; 
    } 
}