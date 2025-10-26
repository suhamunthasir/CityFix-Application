
// API endpoints
const API_BASE_URL = 'http://localhost:8080/api/reports';
const UPLOADS_BASE_URL = 'http://localhost:8080/uploads/reports';
const FEEDBACK_API = 'http://localhost:8080/api/feedback/';

let loggedInCitizen = null;
let reportsData = [];
let currentReport = null;

function loadUserHeader() {
    const storedUser = localStorage.getItem("loggedInCitizen");
    const userAvatar = document.getElementById("user-avatar");
    const userName = document.getElementById("user-name");

    if (!storedUser) {
        alert("Please log in to access this page.");
        window.location.href = "signin.html";
        return;
    }

    let citizen = null;
    try {
        citizen = JSON.parse(storedUser);
    } catch (e) {
        console.error("Invalid user data in localStorage", e);
        localStorage.removeItem("loggedInCitizen");
        alert("User data corrupted. Please log in again.");
        window.location.href = "signin.html";
        return;
    }

    if (!citizen || !citizen.id) {
        alert("User not found. Please log in again.");
        localStorage.removeItem("loggedInCitizen");
        window.location.href = "signin.html";
        return;
    }

    loggedInCitizen = citizen;

    const fullName = `${citizen.firstName || ''} ${citizen.lastName || ''}`.trim();
    userName.textContent = fullName || 'User';

    const firstChar = (fullName && fullName.length > 0) ? fullName.charAt(0).toUpperCase() : 'U';

    if (citizen.profilePicture) {
        const img = document.createElement('img');
        img.src = `http://localhost:8080/uploads/citizens/${citizen.profilePicture}`;
        img.alt = 'Profile';
        img.classList.add('profile-img');
        img.onerror = () => {
            userAvatar.innerHTML = `<div class="profile-fallback">${firstChar}</div>`;
        };
        userAvatar.appendChild(img);
    } else {
        userAvatar.innerHTML = `<div class="profile-fallback">${firstChar}</div>`;
    }
}

async function fetchReports() {
    try {
        const response = await fetch(`${API_BASE_URL}/citizen/${loggedInCitizen.id}`);
        if (!response.ok) throw new Error('Failed to fetch reports');
        reportsData = await response.json();
        renderReports();
        updateCounts();
    } catch (error) {
        console.error('Error fetching reports:', error);
        document.getElementById('empty-state').style.display = 'block';
    }
}

function updateCounts() {
    const total = reportsData.length;
    const pending = reportsData.filter(r => (r.status || '').toLowerCase() === 'pending').length;
    const inProgress = reportsData.filter(r => (r.status || '').toLowerCase() === 'in progress' || (r.status || '').toLowerCase() === 'inprogress').length;
    const resolved = reportsData.filter(r => (r.status || '').toLowerCase() === 'resolved' || (r.status || '').toLowerCase() === 'fixed' || (r.status || '').toLowerCase() === 'closed').length;

    document.getElementById('count-all').textContent = total;
    document.getElementById('count-pending').textContent = pending;
    document.getElementById('count-inprogress').textContent = inProgress;
    document.getElementById('count-resolved').textContent = resolved;
}

function createReportItem(report) {
    const reportItem = document.createElement('div');
    reportItem.classList.add('report-item');
    reportItem.setAttribute('data-status', (report.status || '').toLowerCase());

    const submitted = report.submittedDate ? new Date(report.submittedDate).toLocaleDateString() : 'N/A';

    reportItem.innerHTML = `
        <div class="report-header">
            <div>
                <h3 class="report-title">${escapeHtml(report.problemTitle || '')}</h3>
                <div class="report-meta">
                    <span>Reported: ${submitted}</span>
                    <span>Category: ${escapeHtml(report.problemCategory || '')}</span>
                    <span>Reference: #CF${report.id}</span>
                </div>
            </div>
            <span class="report-status status-${(report.status || '').toLowerCase().replace(/\s+/g,'-')}">${escapeHtml(report.status || 'New')}</span>
        </div>
        <div class="report-content">
            <div class="report-image"></div>
            <div class="report-details">
                <p class="report-description">${escapeHtml(report.problemDescription || '')}</p>
                <div class="report-actions">
                    <button class="action-button primary view-btn">View</button>
                    <button class="action-button update-btn">Update</button>
                    <button class="action-button delete-btn">Delete</button>
                </div>
            </div>
        </div>
    `;

    // images
    const reportImageContainer = reportItem.querySelector('.report-image');
    reportImageContainer.innerHTML = '';
    if (report.photos && report.photos.length > 0) {
        const photoFilenames = report.photos.split(',');
        photoFilenames.forEach(filename => {
            const img = document.createElement('img');
            img.src = `${UPLOADS_BASE_URL}/${filename.trim()}`;
            img.alt = report.problemTitle || '';
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            img.onerror = () => { img.src = 'https://via.placeholder.com/150'; };
            reportImageContainer.appendChild(img);
        });
    } else {
        reportImageContainer.innerHTML = `<span style="display:inline-block;width:100%;height:100%;background:#f2f2f2;display:flex;align-items:center;justify-content:center;color:#999">No Image</span>`;
    }

    // button events
    reportItem.querySelector('.view-btn').addEventListener('click', () => openModal(report));
    reportItem.querySelector('.update-btn').addEventListener('click', () => openModal(report));
    reportItem.querySelector('.delete-btn').addEventListener('click', () => deleteReport(report.id));

    return reportItem;
}

function renderReports() {
    const container = document.querySelector('.reports-list');
    const emptyState = document.getElementById('empty-state');
    container.innerHTML = '';

    if (!reportsData || reportsData.length === 0) {
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';

    reportsData.forEach(r => container.appendChild(createReportItem(r)));
}

// --- Filters ---
document.addEventListener('click', (e) => {
    if (e.target && e.target.classList.contains('filter-button')) {
        document.querySelectorAll('.filter-button').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        const filter = e.target.getAttribute('data-filter');
        applyFilter(filter);
    }
});

function applyFilter(filterValue) {
    const items = document.querySelectorAll('.report-item');
    let visible = 0;
    items.forEach(item => {
        const status = item.getAttribute('data-status') || '';
        if (filterValue === 'all' || status === filterValue.toLowerCase()) {
            item.style.display = 'block';
            visible++;
        } else {
            item.style.display = 'none';
        }
    });
    document.getElementById('empty-state').style.display = visible === 0 ? 'block' : 'none';
}

// --- Search ---
document.querySelector('.search-box button').addEventListener('click', () => runSearch());
document.querySelector('.search-box input').addEventListener('keypress', (e) => { if (e.key === 'Enter') runSearch(); });

function runSearch() {
    const searchTerm = document.querySelector('.search-box input').value.toLowerCase().trim();
    const items = document.querySelectorAll('.report-item');
    let visible = 0;
    items.forEach(item => {
        const title = item.querySelector('.report-title').textContent.toLowerCase();
        const desc = item.querySelector('.report-description').textContent.toLowerCase();
        if (title.includes(searchTerm) || desc.includes(searchTerm)) { item.style.display = 'block'; visible++; } else { item.style.display = 'none'; }
    });
    document.getElementById('empty-state').style.display = visible === 0 ? 'block' : 'none';
}

// --- Modal logic ---
const modalBackdrop = document.getElementById('modal-backdrop');
const modalCloseBtn = document.getElementById('modal-close');
modalCloseBtn.addEventListener('click', closeModal);
modalBackdrop.addEventListener('click', (e) => { if (e.target === modalBackdrop) closeModal(); });

function openModal(report) {
    currentReport = report;
    document.getElementById('modal-title').textContent = `Report #CF${report.id}`;
    document.getElementById('modal-title-input').value = report.problemTitle || '';
    document.getElementById('modal-category-input').value = report.problemCategory || '';
    document.getElementById('modal-ref-input').value = `#CF${report.id}`;
    document.getElementById('modal-status-input').value = report.status || 'New';
    document.getElementById('modal-date-input').value = report.submittedDate ? new Date(report.submittedDate).toLocaleString() : '';
    document.getElementById('modal-description-input').value = report.problemDescription || '';
    document.getElementById('modal-feedback-input').value = '';

    // photos
    const photosDiv = document.getElementById('modal-photos');
    photosDiv.innerHTML = '';
    if (report.photos && report.photos.length > 0) {
        const photoFilenames = report.photos.split(',');
        photoFilenames.forEach(filename => {
            const img = document.createElement('img');
            img.src = `${UPLOADS_BASE_URL}/${filename.trim()}`;
            img.alt = 'photo';
            img.style.width = '120px';
            img.style.height = '80px';
            img.style.objectFit = 'cover';
            img.onerror = () => img.src = 'https://via.placeholder.com/120x80';
            photosDiv.appendChild(img);
        });
    } else {
        photosDiv.innerHTML = '<div style="color:#999">No photos</div>';
    }

    modalBackdrop.style.display = 'flex';
}

function closeModal() {
    modalBackdrop.style.display = 'none';
    currentReport = null;
}

// --- Update report ---
// --- Update report ---
document.getElementById('modal-update-btn').addEventListener('click', async () => {
    if (!currentReport) return alert('No report selected');

    const formData = new FormData();
    formData.append('latitude', currentReport.latitude || 0);
    formData.append('longitude', currentReport.longitude || 0);
    formData.append('locationNotes', currentReport.locationNotes || '');
    formData.append('problemCategory', document.getElementById('modal-category-input').value);
    formData.append('problemTitle', document.getElementById('modal-title-input').value);
    formData.append('problemDescription', document.getElementById('modal-description-input').value);
    formData.append('publicizeIssue', currentReport.publicizeIssue || 0);
    formData.append('showName', currentReport.showName || 0);
    formData.append('status', currentReport.status || 'New');
    formData.append('severity', currentReport.severity || '');

    try {
        const res = await fetch(`${API_BASE_URL}/${currentReport.id}`, {
            method: 'PUT',
            body: formData
        });
        
        if (!res.ok) throw new Error('Failed to update');
        
        const response = await res.json();
        if (response.status === 'success') {
            // Refresh the reports to get updated data
            await fetchReports();
            alert('Report updated successfully');
            closeModal();
        } else {
            throw new Error(response.message || 'Update failed');
        }
    } catch (err) {
        console.error(err);
        alert('Failed to update report: ' + err.message);
    }
});
// --- Delete report ---
async function deleteReport(reportId) {
    if (!confirm(`Are you sure you want to delete report #CF${reportId}?`)) return;
    try {
        const res = await fetch(`${API_BASE_URL}/${reportId}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Delete failed');
        reportsData = reportsData.filter(r => r.id !== reportId);
        renderReports();
        updateCounts();
        alert('Report deleted');
    } catch (err) {
        console.error(err);
        alert('Failed to delete report');
    }
}

// delete from modal
document.getElementById('modal-delete-btn').addEventListener('click', async () => {
    if (!currentReport) return;
    await deleteReport(currentReport.id);
    closeModal();
});

// --- Feedback save ---
document.getElementById('modal-save-feedback').addEventListener('click', async () => {
    if (!currentReport) return alert('No report selected');
    const text = document.getElementById('modal-feedback-input').value.trim();
    if (!text) return alert('Please enter feedback');

    const payload = {
        reportId: currentReport.id,
        
        feedback: text,
        submittedDate: new Date(),    };

    try {
        const res = await fetch(FEEDBACK_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Failed to save feedback');
        alert('Feedback saved');
        document.getElementById('modal-feedback-input').value = '';
    } catch (err) {
        console.error(err);
        alert('Failed to save feedback');
    }
});

// --- Utilities ---
function escapeHtml(text) {
    if (!text) return '';
    return text.replace(/[&<>"']/g, function (m) { return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#039;"})[m]; });
}

// --- Initialization ---
document.addEventListener('DOMContentLoaded', async () => {
    loadUserHeader();
    if (!loggedInCitizen) return;
    // default to 'all'
    document.querySelectorAll('.filter-button').forEach(btn => btn.classList.remove('active'));
    const allBtn = document.querySelector('.filter-button[data-filter="all"]');
    if (allBtn) allBtn.classList.add('active');

    await fetchReports();
});
