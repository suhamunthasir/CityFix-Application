const API_BASE_URL = 'http://localhost:8080/api/reports';
const UPLOADS_BASE_URL = 'http://localhost:8080/uploads/reports';

let loggedInCitizen = null;

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

    if (citizen.profilePicture) {
        const img = document.createElement('img');
        img.src = `http://localhost:8080/uploads/citizens/${citizen.profilePicture}`;
        img.alt = 'Profile';
        img.classList.add('profile-img');
        img.onerror = () => {
            userAvatar.innerHTML = `<div class="profile-fallback">${fullName.charAt(0).toUpperCase()}</div>`;
        };
        userAvatar.appendChild(img);
    } else {
        userAvatar.innerHTML = `<div class="profile-fallback">${fullName.charAt(0).toUpperCase()}</div>`;
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    loadUserHeader();
    if (!loggedInCitizen) return;

    const reportsContainer = document.querySelector('.reports-list');
    const emptyState = document.getElementById('empty-state');

    let reportsData = [];

    async function fetchReports() {
        try {
            const response = await fetch(`${API_BASE_URL}/citizen/${loggedInCitizen.id}`);
            reportsData = await response.json();
            renderReports();
        } catch (error) {
            console.error('Error fetching reports:', error);
            emptyState.style.display = 'block';
        }
    }

    function renderReports() {
        reportsContainer.innerHTML = '';

        if (!reportsData || reportsData.length === 0) {
            emptyState.style.display = 'block';
            return;
        } else {
            emptyState.style.display = 'none';
        }

        reportsData.forEach(report => {
            const reportItem = document.createElement('div');
            reportItem.classList.add('report-item');
            reportItem.setAttribute('data-status', report.status?.toLowerCase() || 'new');

            reportItem.innerHTML = `
                <div class="report-header">
                    <div>
                        <h3 class="report-title">${report.problemTitle}</h3>
                        <div class="report-meta">
                            <span>Reported: ${new Date(report.submittedDate).toLocaleDateString()}</span>
                            <span>Category: ${report.problemCategory}</span>
                            <span>Reference: #CF${report.id}</span>
                        </div>
                    </div>
                    <span class="report-status status-${report.status?.toLowerCase() || 'new'}">${report.status || 'New'}</span>
                </div>
                <div class="report-content">
                    <div class="report-image"></div>
                    <div class="report-details">
                        <p class="report-description">${report.problemDescription}</p>
                        <div class="report-actions">
                            <button class="action-button primary view-btn">View</button>
                            <button class="action-button update-btn">Update</button>
                            <button class="action-button delete-btn">Delete</button>
                        </div>
                    </div>
                </div>
            `;

            // --- Updated report photo handling ---
            const reportImageContainer = reportItem.querySelector('.report-image');
            reportImageContainer.innerHTML = '';

            if (report.photos && report.photos.length > 0) {
                const photoFilenames = report.photos.split(',');
                photoFilenames.forEach(filename => {
                    const img = document.createElement('img');
                    img.src = `${UPLOADS_BASE_URL}/${filename.trim()}`;
                    img.alt = report.problemTitle;
                    img.classList.add('w-full', 'h-full', 'object-contain', 'p-1');
                    img.onerror = () => {
                        img.src = 'https://via.placeholder.com/150';
                    };
                    reportImageContainer.appendChild(img);
                });
            } else {
                // Fallback icon like department logos
                reportImageContainer.innerHTML = `
                    <span class="material-symbols-outlined text-2xl text-gray-400">image</span>
                `;
            }
            // --- End of updated photo handling ---

            // Buttons
            reportItem.querySelector('.view-btn').addEventListener('click', () => {
                alert(`Viewing details for: ${report.problemTitle}`);
            });

            reportItem.querySelector('.update-btn').addEventListener('click', () => {
                window.location.href = `update-report.html?reportId=${report.id}`;
            });

            reportItem.querySelector('.delete-btn').addEventListener('click', async () => {
                if (confirm(`Are you sure you want to delete report #CF${report.id}?`)) {
                    try {
                        await fetch(`${API_BASE_URL}/${report.id}`, { method: 'DELETE' });
                        reportsData = reportsData.filter(r => r.id !== report.id);
                        renderReports();
                    } catch (error) {
                        console.error('Error deleting report:', error);
                        alert('Failed to delete report');
                    }
                }
            });

            reportsContainer.appendChild(reportItem);
        });
    }

    fetchReports();
});
