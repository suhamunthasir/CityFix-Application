"use strict";
const API_BASE_URL = "http://localhost:8080/api/departments";
const departmentContainer = document.getElementById("departmentContainer");
const addBtn = document.getElementById("addDepartmentBtn");
// Load all departments
async function loadDepartments() {
    const response = await fetch(API_BASE_URL);
    const data = await response.json();
    departmentContainer.innerHTML = "";
    data.forEach((dept) => {
        const card = document.createElement("div");
        card.className = "bg-white p-6 rounded-lg shadow";
        card.innerHTML = `
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-bold">${dept.name}</h2>
        <div class="flex gap-2">
          <button class="text-blue-600 hover:underline edit-btn" data-id="${dept.id}">Edit</button>
          <button class="text-red-600 hover:underline delete-btn" data-id="${dept.id}">Delete</button>
        </div>
      </div>
      <p><strong>Email:</strong> ${dept.email}</p>
      <p class="mt-2">${dept.description}</p>
      ${dept.logo ? `<img src="/uploads/department/${dept.logo}" class="mt-4 w-24 h-24 object-cover rounded-lg"/>` : ""}
    `;
        departmentContainer.appendChild(card);
    });
    attachEventListeners();
}
// Add/Edit/Delete listeners
function attachEventListeners() {
    document.querySelectorAll(".delete-btn").forEach((btn) => {
        btn.addEventListener("click", async (e) => {
            const id = e.target.getAttribute("data-id");
            if (confirm("Are you sure?")) {
                await fetch(`${API_BASE_URL}/${id}`, { method: "DELETE" });
                loadDepartments();
            }
        });
    });
    document.querySelectorAll(".edit-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            const id = e.target.getAttribute("data-id");
            showForm("update", Number(id));
        });
    });
}
// Add Department button
addBtn.addEventListener("click", () => showForm("add"));
// Show Add/Edit form
async function showForm(mode, id) {
    let department = { name: "", email: "", description: "" };
    if (mode === "update" && id) {
        const response = await fetch(`${API_BASE_URL}/${id}`);
        department = await response.json();
    }
    departmentContainer.innerHTML = `
    <form id="departmentForm" class="bg-white p-6 rounded-lg shadow space-y-4">
      <h2 class="text-2xl font-bold mb-4">${mode === "add" ? "Add" : "Update"} Department</h2>

      <div>
        <label class="block text-sm font-medium">Department Name</label>
        <input type="text" id="name" value="${department.name || ""}" required
          class="mt-1 w-full border rounded-lg px-3 py-2">
      </div>

      <div>
        <label class="block text-sm font-medium">Email</label>
        <input type="email" id="email" value="${department.email || ""}" required
          class="mt-1 w-full border rounded-lg px-3 py-2">
      </div>

      <div>
        <label class="block text-sm font-medium">Description</label>
        <textarea id="description" rows="3" class="mt-1 w-full border rounded-lg px-3 py-2">${department.description || ""}</textarea>
      </div>

      <div>
        <label class="block text-sm font-medium">Logo</label>
        <input type="file" id="logo" class="mt-1 block w-full border rounded-lg px-3 py-2">
      </div>

      <div class="flex gap-2">
        <button type="submit" class="px-4 py-2 bg-primary text-white rounded-lg">${mode === "add" ? "Save" : "Update"}</button>
        <button type="button" id="cancelBtn" class="px-4 py-2 border rounded-lg">Cancel</button>
      </div>
    </form>
  `;
    document.getElementById("cancelBtn").addEventListener("click", loadDepartments);
    const form = document.getElementById("departmentForm");
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const formData = new FormData();
        const deptData = {
            name: document.getElementById("name").value,
            email: document.getElementById("email").value,
            description: document.getElementById("description").value,
        };
        formData.append("department", new Blob([JSON.stringify(deptData)], { type: "application/json" }));
        const logoInput = document.getElementById("logo");
        if (logoInput.files && logoInput.files[0]) {
            formData.append("logo", logoInput.files[0]);
        }
        const method = mode === "add" ? "POST" : "PUT";
        const url = mode === "add" ? API_BASE_URL : `${API_BASE_URL}/${id}`;
        await fetch(url, { method, body: formData });
        loadDepartments();
    });
}
// Initial load
loadDepartments();
//# sourceMappingURL=departmentTypescript.js.map