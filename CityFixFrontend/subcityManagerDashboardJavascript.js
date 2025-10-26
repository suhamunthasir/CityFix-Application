// Include cityCoordinates here instead of importing
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

document.addEventListener("DOMContentLoaded", () => {
  const userData = JSON.parse(localStorage.getItem("loggedInUser"));
  if (!userData) return window.location.href = "signin.html";

  // Sidebar info
  document.getElementById("userName").textContent =
    userData.firstName + (userData.lastName ? " " + userData.lastName : "");
  document.getElementById("userEmail").textContent = userData.email;
  if (userData.cityAssigned) {
    document.getElementById("userCity").textContent = "City: " + userData.cityAssigned;
  }

  const departmentsContainer = document.getElementById("departmentsContainer");
  const cityAssigned = userData.cityAssigned;

  const departmentApi = "http://localhost:8080/api/departments";
  const managerApi = "http://localhost:8080/api/department-managers";
  const reportApi = "http://localhost:8080/api/reports/"; // your reports endpoint

  // ---------------------------
  // Load Departments and Managers
  // ---------------------------
  async function loadDepartments() {
    try {
      const depResponse = await fetch(departmentApi);
      const departments = await depResponse.json();

      departmentsContainer.innerHTML = "";

      for (const dept of departments) {
        const card = document.createElement("div");
        card.className =
          "bg-white dark:bg-[#1a2532] border border-gray-200 dark:border-[#2e3a47] rounded-xl p-5 shadow-sm";

        const header = document.createElement("div");
        header.className = "flex items-center gap-3 mb-3";

        const icon = document.createElement("img");
        icon.src = dept.logo
          ? `http://localhost:8080/api/departments/logos/${dept.logo}`
          : "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
        icon.alt = "Department Logo";
        icon.className = "w-10 h-10 rounded-full object-cover border border-gray-300";

        const title = document.createElement("h3");
        title.className = "font-semibold text-lg";
        title.textContent = dept.name;

        header.appendChild(icon);
        header.appendChild(title);

        const desc = document.createElement("p");
        desc.className = "text-sm text-gray-500 mb-3";
        desc.textContent = dept.description || "No description available.";

        const managerContainer = document.createElement("div");
        managerContainer.className = "mt-3 bg-gray-50 dark:bg-[#111922] rounded-lg p-3";

        const managerTitle = document.createElement("p");
        managerTitle.className = "font-semibold text-sm mb-2";
        managerTitle.textContent = "Assigned Managers:";

        const managerList = document.createElement("ul");
        managerList.className = "text-sm text-gray-600 dark:text-gray-300 space-y-1";

        const mgrResponse = await fetch(managerApi);
        const managers = await mgrResponse.json();

        const filteredManagers = managers.filter(
          (m) =>
            m.department?.toLowerCase() === dept.name.toLowerCase() &&
            m.city?.toLowerCase() === cityAssigned.toLowerCase()
        );

        if (filteredManagers.length > 0) {
          filteredManagers.forEach((m) => {
            const li = document.createElement("li");
            li.innerHTML = `👤 <span class="font-medium">${m.fullName}</span> — ${m.email}`;
            managerList.appendChild(li);
          });
        } else {
          const li = document.createElement("li");
          li.textContent = "No managers assigned for this department.";
          li.className = "text-gray-400 italic";
          managerList.appendChild(li);
        }

        managerContainer.appendChild(managerTitle);
        managerContainer.appendChild(managerList);

        card.appendChild(header);
        card.appendChild(desc);
        card.appendChild(managerContainer);

        departmentsContainer.appendChild(card);
      }
    } catch (error) {
      console.error("Error loading departments:", error);
      alert("Failed to load department data.");
    }
  }

  // ---------------------------
  // Load Reports filtered by city
  // ---------------------------
 async function loadReports() {
  try {
    const response = await fetch(reportApi);
    const reports = await response.json();

    // Find matching city case-insensitively
    const cityKey = Object.keys(cityCoordinates).find(
      key => key.toLowerCase().trim() === cityAssigned.toLowerCase().trim()
    );
    const cityCoord = cityCoordinates[cityKey];

    if (!cityCoord) {
      console.warn("City coordinates not found for:", cityAssigned);
      return;
    }

    const R = 6371; // Earth radius in km
    function distance(lat1, lon1, lat2, lon2) {
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c; // km
    }

    // Filter reports within 10 km radius and ensure coordinates are numbers
    const filteredReports = reports.filter((r) => {
      const lat = parseFloat(r.latitude);
      const lon = parseFloat(r.longitude);
      if (isNaN(lat) || isNaN(lon)) return false;
      return distance(lat, lon, cityCoord.lat, cityCoord.lon) <= 5;
    });

    console.log("Filtered Reports:", filteredReports);

    // --------------------------
    // Update summary cards
    // --------------------------
    const totalReports = filteredReports.length;
    const resolvedReports = filteredReports.filter(r => r.status?.toLowerCase() === 'resolved').length;
    const pendingReports = filteredReports.filter(r => r.status?.toLowerCase() === 'pending').length;

    document.querySelector("div > h3.text-3xl.font-bold.text-primary").textContent = totalReports;
    document.querySelectorAll("div > h3.text-3xl.font-bold")[1].textContent = resolvedReports;
    document.querySelectorAll("div > h3.text-3xl.font-bold")[2].textContent = pendingReports;

    // --------------------------
    // Populate table
    // --------------------------
    const tableBody = document.querySelector("tbody");
    if (!tableBody) return;

    tableBody.innerHTML = "";
    filteredReports.forEach((r, index) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${index + 1}</td>
        <td>${r.problemTitle}</td>
        <td>${r.problemCategory}</td>
        <td><span class="${
          r.status?.toLowerCase() === "resolved" ? "text-green-600" : "text-yellow-500"
        } font-medium">${r.status}</span></td>
        <td>${r.submittedDate}</td>
      `;
      tableBody.appendChild(tr);
    });

  } catch (error) {
    console.error("Error loading reports:", error);
    alert("Failed to load reports.");
  }
}




  // Refresh button (optional)
  const refreshBtn = document.getElementById("refreshDepartments");
  if (refreshBtn) refreshBtn.addEventListener("click", loadDepartments);

  // Initial load
  loadDepartments();
  loadReports();
});
