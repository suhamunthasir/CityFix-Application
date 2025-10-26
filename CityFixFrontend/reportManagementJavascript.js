const API_BASE = "http://localhost:8080/api/reports";
const IMAGE_BASE = "http://localhost:8080/api/reports/uploads/reports/";

const cityCoordinates = {
  Colombo: { lat: 6.9271, lon: 79.8612 },
  "Dehiwala-Mount Lavinia": { lat: 6.8644, lon: 79.9712 },
  "Sri Jayawardenepura Kotte": { lat: 6.9271, lon: 79.9734 },
  Kaduwela: { lat: 6.9744, lon: 79.9744 },
  Moratuwa: { lat: 6.7493, lon: 79.9786 },
  Gampaha: { lat: 7.0903, lon: 80.0220 },
  Kalutara: { lat: 6.5745, lon: 79.9685 },
  Matale: { lat: 7.4600, lon: 80.6333 },
  Kandy: { lat: 7.2906, lon: 80.6337 },
  Kurunegala: { lat: 7.4678, lon: 80.3505 },
  Anuradhapura: { lat: 8.3110, lon: 80.4037 },
  Badulla: { lat: 6.9864, lon: 81.0532 },
  Bandarawela: { lat: 6.8286, lon: 81.0504 },
  Batticaloa: { lat: 7.7110, lon: 81.7011 },
  Galle: { lat: 6.0535, lon: 80.2200 },
  Jaffna: { lat: 9.6615, lon: 80.0225 },
  Matara: { lat: 5.9489, lon: 80.5385 },
  Negombo: { lat: 7.2089, lon: 79.9735 },
  "Nuwara Eliya": { lat: 6.9486, lon: 80.7900 },
  Panadura: { lat: 6.6300, lon: 79.9670 },
  "Point Pedro": { lat: 9.7750, lon: 80.5150 },
  Vavuniya: { lat: 8.7510, lon: 80.5070 },
  Kalmunai: { lat: 7.4230, lon: 81.7710 },
  Akkaraipattu: { lat: 7.3870, lon: 81.7610 },
  Trincomalee: { lat: 8.5650, lon: 81.2330 },
  Polonnaruwa: { lat: 7.9333, lon: 81.0000 }
};

// Check if report is within ~5km of city coordinates
function isInCity(reportLat, reportLon, cityName) {
  const city = cityCoordinates[cityName];
  if (!city) return false;

  const R = 6371; // Earth's radius in km
  const dLat = (city.lat - reportLat) * Math.PI / 180;
  const dLon = (city.lon - reportLon) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(reportLat * Math.PI / 180) * Math.cos(city.lat * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance <= 5; // 5km radius
}

document.addEventListener("DOMContentLoaded", async () => {
  const userData = JSON.parse(localStorage.getItem("loggedInUser"));
  if (!userData) return window.location.href = "signin.html";

  // Full name fallback
  const fullname =
    userData.fullname ??
    userData.fullName ??
    ((userData.firstName || userData.lastName)
      ? ((userData.firstName || "") + (userData.lastName ? " " + userData.lastName : ""))
      : "");

  // Fill sidebar
  document.getElementById("userName").textContent = fullname || "Department Manager";
  document.getElementById("userEmail").textContent = userData.email || "N/A";
  if (userData.department) {
    document.getElementById("userDepartment").textContent = "Department: " + userData.department;
  }
  const city = userData.cityAssigned || userData.city;
  if (city) {
    document.getElementById("userCity").textContent = "City: " + city;
  }

  const department = userData.department;

  const reportGrid = document.getElementById("reportGrid");
  const modal = document.getElementById("reportModal");
  const modalContent = document.getElementById("modalContent");
  const modalTitle = document.getElementById("modalTitle");
  const closeModal = document.getElementById("closeModal");
  const saveChanges = document.getElementById("saveChanges");
  let currentReport = null;

  // Fetch all reports
  const response = await fetch(API_BASE + "/");
  let reports = await response.json();

  // Fetch all feedbacks
  const feedbackResponse = await fetch("http://localhost:8080/api/feedback/");
  const feedbacks = await feedbackResponse.json();

  // Filter by department and city
  reports = reports.filter(r => r.problemCategory === department && isInCity(r.latitude, r.longitude, city));

  // Render report cards
  reportGrid.innerHTML = "";
  reports.forEach(r => {
    const statusColor = r.status === "Resolved" ? "bg-success/20 text-success" :
                        r.status === "In Progress" ? "bg-warning/20 text-warning" :
                        r.status === "Pending" ? "bg-yellow-300/20 text-yellow-600" :
                        "bg-primary/20 text-primary";

    const severityColor = r.severity === "High" ? "bg-danger/20 text-danger" :
                          r.severity === "Low" ? "bg-success/20 text-success" :
                          "bg-warning/20 text-warning";

    const card = document.createElement("div");
    card.className = "bg-white dark:bg-[#19232e] border border-gray-200 dark:border-[#2e3a47] rounded-xl shadow-sm p-5 hover:shadow-lg transition cursor-pointer";
    card.innerHTML = `
      <div class="flex justify-between items-start mb-2">
        <h3 class="text-lg font-bold text-primary">${r.problemTitle}</h3>
        <span class="text-xs font-medium px-2 py-1 rounded ${statusColor}">${r.status}</span>
      </div>
      <p class="text-sm text-gray-500 mb-2">${r.problemCategory}</p>
      <span class="inline-block text-xs font-semibold px-2 py-1 rounded ${severityColor}">${r.severity || "Medium"}</span>
      <p class="mt-3 text-xs text-gray-400">Submitted: ${r.submittedDate}</p>
    `;
    card.addEventListener("click", () => openReportDetails(r.id, feedbacks));
    reportGrid.appendChild(card);
  });

  // Open report modal with feedback
  async function openReportDetails(id, feedbacks) {
    const res = await fetch(API_BASE + "/" + id);
    const report = await res.json();
    currentReport = report;
    modal.classList.remove("hidden");
    modal.classList.add("flex");
    modalTitle.textContent = report.problemTitle;

    // Filter feedbacks for this report
    const reportFeedbacks = feedbacks.filter(fb => fb.reportId === report.id);
    let feedbackHtml = "<p>No feedback submitted yet.</p>";
    if (reportFeedbacks.length > 0) {
      feedbackHtml = `<ul class="list-disc pl-5 mt-2">`;
      reportFeedbacks.forEach(fb => {
        feedbackHtml += `<li><strong>${new Date(fb.submittedDate).toLocaleDateString()}:</strong> ${fb.feedback}</li>`;
      });
      feedbackHtml += `</ul>`;
    }

    modalContent.innerHTML = `
      <p><strong>Category:</strong> ${report.problemCategory}</p>
      <p><strong>Status:</strong>
        <select id="statusSelect" class="border rounded px-2 py-1 bg-transparent">
          <option ${report.status === "New" ? "selected" : ""}>New</option>
          <option ${report.status === "Pending" ? "selected" : ""}>Pending</option>
          <option ${report.status === "In Progress" ? "selected" : ""}>In Progress</option>
          <option ${report.status === "Resolved" ? "selected" : ""}>Resolved</option>
        </select>
      </p>
      <p><strong>Severity:</strong>
        <select id="severitySelect" class="border rounded px-2 py-1 bg-transparent">
          <option ${report.severity === "Low" ? "selected" : ""}>Low</option>
          <option ${report.severity === "Medium" ? "selected" : ""}>Medium</option>
          <option ${report.severity === "High" ? "selected" : ""}>High</option>
        </select>
      </p>
      <p><strong>Description:</strong> ${report.problemDescription}</p>
      <p><strong>Citizen:</strong> ${report.citizen?.firstName || "N/A"} ${report.citizen?.lastName || ""}</p>
      <p><strong>Location:</strong> Lat: ${report.latitude}, Long: ${report.longitude}</p>
      <p><strong>Location Notes:</strong> ${report.locationNotes || "N/A"}</p>
      <p><strong>Submitted:</strong> ${report.submittedDate}</p>
      ${report.photos ? `<div class="mt-4"><strong>Photos:</strong><div class="flex flex-wrap gap-3 mt-2">
        ${report.photos.split(",").map(p => `<img src="${IMAGE_BASE + p}" alt="photo" class="w-24 h-24 object-cover rounded-lg border"/>`).join("")}
      </div></div>` : ""}
      <div class="mt-4">
        <strong>Feedback:</strong>
        ${feedbackHtml}
      </div>
    `;
  }

  closeModal.addEventListener("click", () => {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  });

  // Save changes to report
  saveChanges.addEventListener("click", async () => {
    if (!currentReport) return;
    const newStatus = document.getElementById("statusSelect").value;
    const newSeverity = document.getElementById("severitySelect").value;

    const formData = new FormData();
    formData.append("latitude", currentReport.latitude);
    formData.append("longitude", currentReport.longitude);
    formData.append("problemCategory", currentReport.problemCategory);
    formData.append("problemTitle", currentReport.problemTitle);
    formData.append("problemDescription", currentReport.problemDescription);
    formData.append("status", newStatus);
    formData.append("severity", newSeverity);

    const res = await fetch(API_BASE + "/" + currentReport.id, { method: "PUT", body: formData });
    const result = await res.json();
    alert(result.message);
    location.reload();
  });
});
