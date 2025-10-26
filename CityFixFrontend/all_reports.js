// ===== CONFIG =====
const API_BASE_URL = "http://localhost:8080/api/reports/"; // trailing slash
const DEPARTMENT_URL = "http://localhost:8080/api/departments";
const UPLOADS_BASE_URL = "http://localhost:8080/api/reports/uploads/reports";
const REPORTS_PER_PAGE = 5;

let reportsData = [];
let filteredReports = [];
let currentPage = 1;
let map;
let mapInitialized = false;

// ===== INITIAL LOAD =====
document.addEventListener("DOMContentLoaded", () => {
    loadDepartments();
    loadReports();

    document.getElementById('list-view')?.addEventListener('click', showListView);
    document.getElementById('map-view')?.addEventListener('click', showMapView);

    document.querySelector('.filter-button')?.addEventListener('click', () => {
        currentPage = 1;
        applyFilters();
    });

    document.getElementById('sort-by')?.addEventListener('change', () => {
        currentPage = 1;
        sortReports();
    });
});

// ===== LOAD DEPARTMENTS =====
async function loadDepartments() {
    const container = document.getElementById("department-filters");
    if(!container) return;

    try {
        const res = await fetch(DEPARTMENT_URL);
        if(!res.ok) throw new Error("Failed to load departments");
        const departments = await res.json();

        container.querySelectorAll(".filter-option").forEach(el => el.remove());

        departments.forEach(dept => {
            const div = document.createElement("div");
            div.className = "filter-option";
            div.innerHTML = `
                <input type="checkbox" id="category-${dept.id}" value="${dept.name}" >
                <label for="category-${dept.id}">${dept.name}</label>
            `;
            container.appendChild(div);
        });

    } catch (err) {
        console.error("Error loading departments:", err);
        container.innerHTML += `<p style="color:red;">Failed to load categories</p>`;
    }
}

// ===== LOAD REPORTS =====
async function loadReports() {
    try {
        const res = await fetch(API_BASE_URL);
        if(!res.ok) throw new Error("Failed to load reports");
        const data = await res.json();

        reportsData = data.filter(r => r.publicizeIssue === 1);
        filteredReports = [...reportsData];

        renderPage(currentPage);
    } catch (err) {
        console.error("Error loading reports:", err);
        alert("Failed to load reports. Make sure backend is running at http://localhost:8080");
    }
}

// ===== PAGINATION =====
function renderPage(page) {
    const start = (page - 1) * REPORTS_PER_PAGE;
    const end = start + REPORTS_PER_PAGE;
    const pageReports = filteredReports.slice(start, end);
    renderReportList(pageReports);
    renderPagination();
}

function renderPagination() {
    const container = document.querySelector(".pagination");
    if(!container) return;

    container.innerHTML = "";
    const totalPages = Math.ceil(filteredReports.length / REPORTS_PER_PAGE);

    if(totalPages === 0) return;

    const prevBtn = document.createElement("button");
    prevBtn.textContent = "Prev";
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener("click", () => {
        if(currentPage > 1){
            currentPage--;
            renderPage(currentPage);
        }
    });
    container.appendChild(prevBtn);

    for(let i=1; i<=totalPages; i++){
        const btn = document.createElement("button");
        btn.textContent = i;
        btn.className = i === currentPage ? "active" : "";
        btn.addEventListener("click", () => {
            currentPage = i;
            renderPage(currentPage);
        });
        container.appendChild(btn);
    }

    const nextBtn = document.createElement("button");
    nextBtn.textContent = "Next";
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.addEventListener("click", () => {
        if(currentPage < totalPages){
            currentPage++;
            renderPage(currentPage);
        }
    });
    container.appendChild(nextBtn);
}

// ===== RENDER LIST =====
function renderReportList(data) {
    const container = document.getElementById("list-view-content");
    if (!container) return;

    container.innerHTML = "";
    if (data.length === 0) {
        container.innerHTML = `<p style="text-align:center; color:#666;">No reports found.</p>`;
        return;
    }

    data.forEach(r => {
        const imageUrl = r.photos
            ? `${UPLOADS_BASE_URL}/${r.photos.split(",")[0]}`
            : "https://via.placeholder.com/120x90?text=No+Image";

        let reporterText = "";
        if (r.showName === 1 && r.publicizeIssue === 1 && r.citizen) {
            reporterText = `Reported by: ${r.citizen.firstName} ${r.citizen.lastName}`;
        }

        // ===== Severity Styling =====
        let severityText = r.severity || "Not Mentioned";
        let severityColor = "#999";
        switch(severityText.toLowerCase()){
            case "high": severityColor = "#e74c3c"; break;
            case "medium": severityColor = "#f1c40f"; break;
            case "low": severityColor = "#2ecc71"; break;
            default: severityColor = "#999"; break;
        }

        const item = document.createElement("div");
        item.className = "report-item";
        item.innerHTML = `
            <div class="report-image">
                <img src="${imageUrl}" alt="${r.problemTitle}">
            </div>
            <div class="report-content">
                <h3>${r.problemTitle}</h3>
                <p>Status: <span class="${getStatusClass(r.status)}">${r.status}</span></p>
                <p>Severity: <span style="color:${severityColor}; font-weight:bold;">${severityText}</span></p>
                <p>Category: ${r.problemCategory}</p>
                ${reporterText ? `<p>${reporterText}</p>` : ""}
                <p>Submitted: ${formatDate(r.submittedDate)}</p>
            </div>
        `;

        // === On click → open modal with full details ===
        item.addEventListener("click", () => openReportModal(r));

        container.appendChild(item);
    });
}


// ===== MODAL FOR REPORT DETAILS =====
async function openReportModal(report) {
    // Remove old modal if exists
    const oldModal = document.getElementById("report-modal");
    if (oldModal) oldModal.remove();

    const modal = document.createElement("div");
    modal.id = "report-modal";
    modal.style.cssText = `
        position: fixed;
        top: 0; left: 0;
        width: 100vw; height: 100vh;
        background: rgba(0,0,0,0.6);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        overflow: auto;
    `;

    const imageUrl = report.photos
        ? `${UPLOADS_BASE_URL}/${report.photos.split(",")[0]}`
        : "https://via.placeholder.com/400x250?text=No+Image";

    let reporterText = "";
    if (report.showName === 1 && report.publicizeIssue === 1 && report.citizen) {
        reporterText = `${report.citizen.firstName} ${report.citizen.lastName}`;
    }

    // Create the modal content container
    const content = document.createElement("div");
    content.style.cssText = `
        background: #fff;
        border-radius: 12px;
        width: 600px;
        max-width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        padding: 20px;
        position: relative;
        font-family: 'Public Sans', sans-serif;
        box-shadow: 0 8px 20px rgba(0,0,0,0.3);
    `;

    content.innerHTML = `
        <button id="close-modal" style="
            position: absolute;
            top: 10px; right: 15px;
            font-size: 24px;
            border: none;
            background: none;
            cursor: pointer;
            color: #888;
        ">&times;</button>
        <h2 style="margin-bottom: 10px;">${report.problemTitle}</h2>
        <img src="${imageUrl}" alt="Report Image" style="width:100%; border-radius:8px; margin-bottom:15px;">
        <p><strong>Status:</strong> ${report.status}</p>
        <p><strong>Severity:</strong> ${report.severity || "Not Mentioned"}</p>
        <p><strong>Category:</strong> ${report.problemCategory}</p>
        <p id="modal-location"><strong>Location:</strong> Fetching...</p>
        <p><strong>Submitted:</strong> ${formatDate(report.submittedDate)}</p>
        ${reporterText ? `<p><strong>Reported by:</strong> ${reporterText}</p>` : ""}
        ${report.problemDescription ? `<p><strong>Description:</strong> ${report.problemDescription}</p>` : ""}
    `;

    modal.appendChild(content);
    document.body.appendChild(modal);

    document.getElementById("close-modal").addEventListener("click", () => modal.remove());
    modal.addEventListener("click", (e) => {
        if (e.target === modal) modal.remove();
    });

    // ===== Reverse geocode for location =====
    if (report.latitude && report.longitude) {
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${report.latitude}&lon=${report.longitude}`);
            const data = await res.json();
            const location = data.display_name || "Not specified";
            document.getElementById("modal-location").innerHTML = `<strong>Location:</strong> ${location}`;
        } catch(err) {
            console.error("Reverse geocoding failed:", err);
            document.getElementById("modal-location").innerHTML = `<strong>Location:</strong> Not specified`;
        }
    } else {
        document.getElementById("modal-location").innerHTML = `<strong>Location:</strong> Not specified`;
    }
}


// ===== STATUS STYLING =====
function getStatusClass(status){
    switch((status||"").toLowerCase()){
        case "new": return "status-open";
        case "pending": return "status-pending";
        case "in progress": return "status-in-progress";
        case "resolved": return "status-closed";
        case "fixed": return "status-fixed";
        default: return "";
    }
}

// ===== DATE FORMAT =====
function formatDate(d){
    if(!d) return "Unknown";
    return new Date(d).toLocaleDateString("en-GB");
}

// ===== FILTERS =====
function getSelectedDepartments(){
    const checkboxes = document.querySelectorAll("#department-filters input[type='checkbox']");
    return Array.from(checkboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value);
}

function applyFilters() {
    const statusCheckboxes = document.querySelectorAll('.filters-sidebar input[id^="status-"]');
    const selectedStatuses = Array.from(statusCheckboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.nextElementSibling.textContent.toLowerCase().trim());

    const selectedCategories = getSelectedDepartments().map(c => c.toLowerCase().trim());

    const searchInput = document.querySelector(".filter-group input[type='text']");
    const searchText = searchInput?.value.toLowerCase().trim() || "";

    const fromDateInput = document.getElementById("date-from")?.value;
    const toDateInput = document.getElementById("date-to")?.value;
    const fromDate = fromDateInput ? new Date(fromDateInput) : null;
    const toDate = toDateInput ? new Date(toDateInput) : null;

    filteredReports = reportsData.filter(r => {
        const reportStatus = (r.status || "").toLowerCase().trim();
        const reportCategory = (r.problemCategory || "").toLowerCase().trim();
        const reportDate = new Date(r.submittedDate);

        const statusMatch = selectedStatuses.length === 0 || selectedStatuses.includes(reportStatus);
        const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(reportCategory);
        const searchMatch = !searchText || 
            (r.problemTitle && r.problemTitle.toLowerCase().includes(searchText));

        let dateMatch = true;
        if (fromDate && reportDate < fromDate) dateMatch = false;
        if (toDate && reportDate > toDate) dateMatch = false;

        return statusMatch && categoryMatch && searchMatch && dateMatch;
    });

    currentPage = 1;
    renderPage(currentPage);

    if(document.getElementById('map-view-content').style.display === 'block'){
        updateMapMarkers();
    }
}

// ===== SORTING =====
function sortReports(){
    const val = document.getElementById("sort-by")?.value;
    if(!val) return;

    if(val === "newest") filteredReports.sort((a,b)=> new Date(b.submittedDate) - new Date(a.submittedDate));
    if(val === "oldest") filteredReports.sort((a,b)=> new Date(a.submittedDate) - new Date(b.submittedDate));
    if(val === "updated") filteredReports.sort((a,b)=> new Date(b.updatedDate || b.submittedDate) - new Date(a.updatedDate || a.submittedDate));

    currentPage = 1;
    renderPage(currentPage);
}

// ===== MAP VIEW =====
function showMapView(){
    document.getElementById('list-view-content').style.display = 'none';
    document.getElementById('map-view-content').style.display = 'block';
    initMap();
}

function showListView(){
    document.getElementById('list-view-content').style.display = 'block';
    document.getElementById('map-view-content').style.display = 'none';
}

function initMap(){
    if(!map){
        map = L.map('map-view-content').setView([7.8731, 80.7718], 8);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);
    }
    updateMapMarkers();
}

function updateMapMarkers(){
    if(!map) return;
    map.eachLayer(layer => {
        if(layer instanceof L.Marker) map.removeLayer(layer);
    });
    addMarkers(filteredReports);
}

function addMarkers(data){
    const colors = {
        "new":"#ffeaa7",
        "pending":"#fab1a0",
        "in progress":"#74b9ff",
        "resolved":"#55efc4",
        "fixed":"#55efc4"
    };

    data.forEach(r => {
        if(r.latitude && r.longitude){
            let reporterText = "";
            if (r.showName === 1 && r.publicizeIssue === 1 && r.citizen) {
                reporterText = `${r.citizen.firstName} ${r.citizen.lastName}`;
            }

            // Severity coloring
            let severityText = r.severity || "Not Mentioned";
            let severityColor = "#999";
            switch(severityText.toLowerCase()){
                case "high": severityColor = "#e74c3c"; break;
                case "medium": severityColor = "#f1c40f"; break;
                case "low": severityColor = "#2ecc71"; break;
                default: severityColor = "#999"; break;
            }

            const marker = L.marker([r.latitude, r.longitude]).addTo(map);
            marker.bindPopup(`
                <b>${r.problemTitle}</b><br>
                Status: <span style="color:${colors[r.status.toLowerCase()] || "#333"}">${r.status}</span><br>
                Severity: <span style="color:${severityColor}; font-weight:bold;">${severityText}</span><br>
                Category: ${r.problemCategory}<br>
                Location: ${r.locationNotes || "N/A"}<br>
                ${reporterText ? `Reported by: ${reporterText}` : ""}
            `);
        }
    });
}
