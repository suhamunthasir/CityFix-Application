const API_BASE = "http://localhost:8080/api/workers";

document.addEventListener("DOMContentLoaded", async () => {
  const userData = JSON.parse(localStorage.getItem("loggedInUser"));
  if (!userData) return window.location.href = "signin.html";

  // Fill sidebar
  document.getElementById("userName").textContent =
    userData.fullname || userData.firstName + " " + (userData.lastName || "");
  document.getElementById("userEmail").textContent = userData.email || "N/A";
  const dept = userData.department || "";
  const city = userData.cityAssigned || userData.city || "";
  document.getElementById("userDepartment").textContent = "Department: " + dept;
  document.getElementById("userCity").textContent = "City: " + city;

  const tableBody = document.getElementById("workersTableBody");
  const modal = document.getElementById("workerModal");
  const closeModal = document.getElementById("closeWorkerModal");
  const saveBtn = document.getElementById("saveWorkerBtn");

  const workerForm = document.getElementById("workerForm");
  const fields = ["workerId","fullName","email","phoneNumber","role","department","city","address"];

  // Fill department & city automatically in form
  document.getElementById("department").value = dept;
  document.getElementById("city").value = city;

  // Function to show inline error
  function setError(fieldId, message) {
    const field = document.getElementById(fieldId);
    let errorEl = field.nextElementSibling;
    if (!errorEl || !errorEl.classList.contains("error-msg")) {
      errorEl = document.createElement("div");
      errorEl.className = "error-msg text-red-600 text-sm mt-1";
      field.insertAdjacentElement("afterend", errorEl);
    }
    errorEl.textContent = message;
    field.classList.add("border-red-500");
  }

  function clearError(fieldId) {
    const field = document.getElementById(fieldId);
    const errorEl = field.nextElementSibling;
    if (errorEl && errorEl.classList.contains("error-msg")) errorEl.remove();
    field.classList.remove("border-red-500");
  }

  // Fetch workers for this department & city
  async function fetchWorkers() {
    const res = await fetch(`${API_BASE}/department/${dept}`);
    const allWorkers = await res.json();
    const workers = allWorkers.filter(w => w.city === city);

    tableBody.innerHTML = "";
    workers.forEach(w => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="px-4 py-2 border">${w.workerId}</td>
        <td class="px-4 py-2 border">${w.fullName}</td>
        <td class="px-4 py-2 border">${w.email}</td>
        <td class="px-4 py-2 border">${w.phoneNumber || ""}</td>
        <td class="px-4 py-2 border">${w.role}</td>
        <td class="px-4 py-2 border">${w.department}</td>
        <td class="px-4 py-2 border">${w.city}</td>
        <td class="px-4 py-2 border">${w.address || ""}</td>
        <td class="px-4 py-2 border">
          <button data-id="${w.workerId}" class="editBtn bg-warning text-white px-2 py-1 rounded mr-2">Edit</button>
          <button data-id="${w.workerId}" class="deleteBtn bg-danger text-white px-2 py-1 rounded">Delete</button>
        </td>
      `;
      tableBody.appendChild(tr);
    });

    document.querySelectorAll(".editBtn").forEach(btn => btn.addEventListener("click", e => openModal(e, "edit")));
    document.querySelectorAll(".deleteBtn").forEach(btn => btn.addEventListener("click", deleteWorker));
  }

  fetchWorkers();

  // Open Modal
  document.getElementById("addWorkerBtn").addEventListener("click", () => openModal(null,"add"));
  function openModal(e, mode) {
    modal.classList.remove("hidden");
    modal.classList.add("flex");

    // Clear previous errors
    fields.forEach(f => clearError(f));

    if(mode === "add") {
      document.getElementById("workerModalTitle").textContent = "Add Worker";
      fields.forEach(f => document.getElementById(f).value = f==="department"?dept:(f==="city"?city:""));
    } else {
      document.getElementById("workerModalTitle").textContent = "Edit Worker";
      const id = e.target.dataset.id;
      const row = Array.from(tableBody.children).find(tr => tr.firstElementChild.textContent == id);
      fields.forEach((f,i) => {
        const val = ["workerId","fullName","email","phoneNumber","role","department","city","address"].includes(f)?row.children[i].textContent:"";
        document.getElementById(f).value = val;
      });
    }
  }

  closeModal.addEventListener("click", () => {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  });

  // Delete Worker
  async function deleteWorker(e) {
    const id = e.target.dataset.id;
    if (confirm("Are you sure you want to delete this worker?")) {
      e.target.closest("tr").remove();
      const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
      const result = await res.json();
      alert(result.message || "Deleted");
      fetchWorkers();
    }
  }

  // Save Worker with inline validations
  saveBtn.addEventListener("click", async () => {
    const data = {
      fullName: document.getElementById("fullName").value.trim(),
      email: document.getElementById("email").value.trim(),
      phoneNumber: document.getElementById("phoneNumber").value.trim(),
      role: document.getElementById("role").value.trim(),
      department: document.getElementById("department").value.trim(),
      city: document.getElementById("city").value.trim(),
      address: document.getElementById("address").value.trim()
    };
    const workerId = document.getElementById("workerId").value.trim();

    let hasError = false;

    // Required fields
    for (let key in data) {
      if (!data[key]) {
        setError(key, `Please fill in ${key}`);
        hasError = true;
      } else {
        clearError(key);
      }
    }

    // Phone validation
    const slPhoneRegex = /^07\d{8}$/;
    if (data.phoneNumber && !slPhoneRegex.test(data.phoneNumber)) {
      setError("phoneNumber", "Enter a valid SL phone number e.g., 0712345678");
      hasError = true;
    } else if (data.phoneNumber) clearError("phoneNumber");

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (data.email && !emailRegex.test(data.email)) {
      setError("email", "Enter a valid email address");
      hasError = true;
    } else if (data.email) clearError("email");

    if (hasError) return;

    try {
      let res;
      if (workerId) {
        res = await fetch(`${API_BASE}/${workerId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });
      } else {
        res = await fetch(`${API_BASE}/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });
      }

      const result = await res.json();
      alert(result.message || "Success");

      modal.classList.add("hidden");
      modal.classList.remove("flex");
      fetchWorkers();
    } catch (err) {
      console.error(err);
      alert("An error occurred while saving the worker.");
    }
  });

});
