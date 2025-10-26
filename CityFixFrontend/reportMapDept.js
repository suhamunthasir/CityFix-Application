const API_BASE = "http://localhost:8080/api/reports";

// Coordinates of cities in Sri Lanka
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

function isInCity(reportLat, reportLon, cityName) {
  const city = cityCoordinates[cityName];
  if (!city) return false;

  const R = 6371; // km
  const dLat = (city.lat - reportLat) * Math.PI / 180;
  const dLon = (city.lon - reportLon) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(reportLat*Math.PI/180)*Math.cos(city.lat*Math.PI/180)*Math.sin(dLon/2)**2;
  const c = 2*Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R*c;
  return distance <= 5;
}

document.addEventListener("DOMContentLoaded", async () => {
  const userData = JSON.parse(localStorage.getItem("loggedInUser"));
  if (!userData) return window.location.href = "signin.html";

  const fullname = userData.fullname || ((userData.firstName || "") + (userData.lastName ? " " + userData.lastName : ""));
  document.getElementById("userName").textContent = fullname || "Department Manager";
  document.getElementById("userEmail").textContent = userData.email || "N/A";
  if (userData.department) document.getElementById("userDepartment").textContent = "Department: " + userData.department;
  const city = userData.cityAssigned || userData.city;
  if (city) document.getElementById("userCity").textContent = "City: " + city;

  const department = userData.department;

  // Initialize map centered on Sri Lanka
  const map = L.map('map').setView([7.8731, 80.7718], 7);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  // Fetch reports
  const res = await fetch(API_BASE + "/");
  let reports = await res.json();

  reports = reports.filter(r => r.problemCategory === department && isInCity(r.latitude, r.longitude, city));

  // Add markers
  reports.forEach(r => {
    const statusColor = r.status === "Resolved" ? "green" :
                        r.status === "In Progress" ? "orange" :
                        r.status === "Pending" ? "yellow" : "blue";

    const marker = L.circleMarker([r.latitude, r.longitude], {
      radius: 8,
      color: statusColor,
      fillColor: statusColor,
      fillOpacity: 0.6,
      weight: 1.5
    }).addTo(map);

    marker.bindPopup(`
      <b>${r.problemTitle}</b><br/>
      <b>Status:</b> ${r.status}<br/>
      <b>Severity:</b> ${r.severity || "Medium"}<br/>
      <b>Submitted:</b> ${r.submittedDate}<br/>
      <b>Description:</b> ${r.problemDescription}
    `);
  });
});
