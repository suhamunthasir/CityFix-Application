document.addEventListener("DOMContentLoaded", async () => {
  const userData = JSON.parse(localStorage.getItem("loggedInUser"));
  if (!userData) return window.location.href = "signin.html";

  // Sidebar info
  document.getElementById("userName").textContent =
    userData.firstName + (userData.lastName ? " " + userData.lastName : "");
  document.getElementById("userEmail").textContent = userData.email;
  document.getElementById("userCity").textContent =
    userData.cityAssigned ? "City: " + userData.cityAssigned : "";

  const managerForm = document.getElementById("managerForm");
  const addManagerBtn = document.getElementById("addManagerBtn");
  const cancelBtn = document.getElementById("cancelBtn");
  const departmentSelect = document.getElementById("department");
  const cityInput = document.getElementById("city");
  const tableBody = document.querySelector("table tbody");
  const searchInput = document.getElementById("searchInput");

  cityInput.value = userData.cityAssigned || "";

  // Show form
addManagerBtn.addEventListener("click", () => {
 
  managerForm.classList.remove("hidden");
  clearForm();
  managerForm.scrollIntoView({ behavior: "smooth" });
});


  cancelBtn.addEventListener("click", () => {
    managerForm.classList.add("hidden");
    clearForm();
  });

  // Load departments
  async function loadDepartments() {
    try {
      const res = await fetch("http://localhost:8080/api/departments");
      const departments = await res.json();
      departmentSelect.innerHTML = '<option value="" disabled selected>Select Department</option>';
      departments.forEach(d => {
        const opt = document.createElement("option");
        opt.value = d.name;
        opt.textContent = d.name;
        departmentSelect.appendChild(opt);
      });
    } catch (err) {
      console.error("Failed to load departments:", err);
    }
  }
  await loadDepartments();

  let managersData = [];
  async function loadManagers() {
    try {
      const res = await fetch("http://localhost:8080/api/department-managers");
      const managers = await res.json();
      managersData = managers.filter(m =>
        !userData.cityAssigned || m.city === userData.cityAssigned
      );
      renderTable(managersData);
    } catch (err) {
      console.error(err);
    }
  }

  function renderTable(data) {
    tableBody.innerHTML = "";
    data.forEach((m, idx) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${idx + 1}</td>
        <td>${m.fullName}</td>
        <td>${m.nic}</td>
        <td>${m.email}</td>
        <td>${m.phoneNumber || ""}</td>
        <td>${m.department}</td>
        <td>${m.city}</td>
        <td class="flex gap-2">
          <button class="edit-btn bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600" data-id="${m.id}">Edit</button>
          <button class="delete-btn bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700" data-id="${m.id}">Delete</button>
        </td>
      `;
      tableBody.appendChild(tr);
    });
    attachTableActions();
  }

  function attachTableActions() {
    document.querySelectorAll(".edit-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id;
        const res = await fetch(`http://localhost:8080/api/department-managers/${id}`);
        const manager = await res.json();
        fillForm(manager);
        managerForm.classList.remove("hidden");
        managerForm.scrollIntoView({ behavior: "smooth" });
      });
    });

    document.querySelectorAll(".delete-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        if (confirm("Are you sure you want to delete this manager?")) {
          await fetch(`http://localhost:8080/api/department-managers/${btn.dataset.id}`, { method: "DELETE" });
          await loadManagers();
        }
      });
    });
  }

function fillForm(manager) {
  document.getElementById("managerId").value = manager.id;
  document.getElementById("fullName").value = manager.fullName;
  document.getElementById("nic").value = manager.nic;
  document.getElementById("email").value = manager.email;
  document.getElementById("password").value = manager.password || "";
  document.getElementById("phone").value = manager.phoneNumber || "";
  document.getElementById("address").value = manager.address || "";
  document.getElementById("department").value = manager.department;
  document.getElementById("city").value = manager.city || userData.cityAssigned;
}

function clearForm() {
  document.getElementById("managerId").value = "";
  document.getElementById("fullName").value = "";
  document.getElementById("nic").value = "";
  document.getElementById("email").value = "";
  document.getElementById("password").value = "";
  document.getElementById("phone").value = "";
  document.getElementById("address").value = "";
  document.getElementById("department").value = "";
  document.getElementById("city").value = userData.cityAssigned;
}

  // Submit form
 managerForm.querySelector("form").addEventListener("submit", async e => {
  e.preventDefault();

  // Gather form values
  const fullName = document.getElementById("fullName").value.trim();
  const nic = document.getElementById("nic").value.trim();
  const email = document.getElementById("email").value.trim();
  const phoneNumber = document.getElementById("phone").value.trim();
  const address = document.getElementById("address").value.trim();
  const department = document.getElementById("department").value;
  const city = document.getElementById("city").value;

  // === VALIDATIONS ===
  let errors = [];

  // Full Name (only letters and spaces)
  if (!/^[A-Za-z\s]{3,100}$/.test(fullName)) {
    errors.push("Full Name must be 3-100 letters and spaces only.");
  }

  // NIC validation (Sri Lanka: old NIC 9 digits + V/X or new NIC 12 digits)
  if (!/^(\d{9}[VXvx]|\d{12})$/.test(nic)) {
    errors.push("NIC must be valid (9 digits + V/X or 12 digits).");
  }

  // Email validation
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    errors.push("Please enter a valid email address.");
  }

  // Phone number (Sri Lanka: 10 digits, starts with 07)
  if (!/^07\d{8}$/.test(phoneNumber)) {
    errors.push("Phone number must be a valid Sri Lankan number starting with 07.");
  }

  // Department selection
  if (!department) {
    errors.push("Please select a department.");
  }

  // City (optional: check if empty)
  if (!city) {
    errors.push("City cannot be empty.");
  }

  // If errors, alert and stop
  if (errors.length > 0) {
    alert(errors.join("\n"));
    return;
  }

  // === SUBMIT FORM ===
  const password = document.getElementById("password").value.trim();

// Optional: simple password validation
if (password.length < 6) {
  alert("Password must be at least 6 characters long.");
  return;
}

const manager = {
  fullName,
  nic,
  email,
  phoneNumber,
  address,
  department,
  city,
  password
};


  const id = document.getElementById("managerId").value;
  if (id) {
    await fetch(`http://localhost:8080/api/department-managers/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(manager)
    });
  } else {
    await fetch("http://localhost:8080/api/department-managers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(manager)
    });
  }

  clearForm();
  managerForm.classList.add("hidden");
  await loadManagers();
});


  // Search functionality
  searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase();
    const filtered = managersData.filter(m =>
      m.fullName.toLowerCase().includes(query) ||
      m.nic.toLowerCase().includes(query) ||
      m.email.toLowerCase().includes(query) ||
      m.department.toLowerCase().includes(query)
    );
    renderTable(filtered);
  });

  await loadManagers();
});
