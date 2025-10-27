// Base URL for API calls - update this to match your backend URL
const API_BASE_URL = 'http://localhost:8080/api/departments';
const UPLOADS_BASE_URL = '/uploads/department';

// 🌓 Dark mode toggle with 'D' key (ignores typing)
document.addEventListener("keydown", function(e) {
  const tag = (document.activeElement && document.activeElement.tagName || "").toLowerCase();
  if (e.key.toLowerCase() === "d" && tag !== "input" && tag !== "textarea") {
    document.documentElement.classList.toggle("dark");
  }
});

// DOM Elements
const departmentsGrid = document.getElementById('departmentsGrid');
const emptyState = document.getElementById('emptyState');
const addDepartmentForm = document.getElementById('addDepartmentForm');
const departmentForm = document.getElementById('departmentForm');
const searchDept = document.getElementById('searchDept');
const departmentModal = document.getElementById('departmentModal');
const modalDeptForm = document.getElementById('modalDeptForm');

// State
let departments = [];
let currentEditingId = null;

// Event Listeners
document.getElementById('addDepartmentBtn').addEventListener('click', () => {
  addDepartmentForm.classList.toggle('hidden');
  resetForm();
});

document.getElementById('cancelDeptBtn').addEventListener('click', () => {
  addDepartmentForm.classList.add('hidden');
  resetForm();
});

document.getElementById('emptyStateAddBtn').addEventListener('click', () => {
  addDepartmentForm.classList.remove('hidden');
  emptyState.classList.add('hidden');
});

document.getElementById('closeDeptModalBtn').addEventListener('click', () => {
  departmentModal.classList.add('hidden');
});

// Form submissions
departmentForm.addEventListener('submit', handleCreateDepartment);
modalDeptForm.addEventListener('submit', handleUpdateDepartment);

// Search functionality
searchDept.addEventListener('input', filterDepartments);

// Logo preview functionality
document.getElementById('deptLogo').addEventListener('change', function(e) {
  previewLogo(e.target.files[0], 'logoPreview');
});

document.getElementById('modalDeptLogo').addEventListener('change', function(e) {
  previewLogo(e.target.files[0], 'modalLogoPreview');
});

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
  loadDepartments();
});

// Functions
function loadDepartments() {
  departmentsGrid.innerHTML = `
    <div class="col-span-full flex justify-center py-12">
      <div class="animate-pulse flex flex-col items-center">
        <div class="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-xl mb-4"></div>
        <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
        <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
      </div>
    </div>
  `;

  fetch(API_BASE_URL)
    .then(response => {
      if (!response.ok) throw new Error('Failed to fetch departments');
      return response.json();
    })
    .then(data => {
      departments = data;
      renderDepartments(departments);
    })
    .catch(error => {
      console.error('Error loading departments:', error);
      departmentsGrid.innerHTML = `
        <div class="col-span-full text-center py-12">
          <span class="material-symbols-outlined text-5xl text-red-400 mb-4">error</span>
          <h3 class="text-lg font-medium text-gray-600 dark:text-gray-300 mb-2">Failed to load departments</h3>
          <p class="text-gray-500 dark:text-gray-400 mb-4">Please check your connection and try again.</p>
          <button onclick="loadDepartments()" class="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700">Retry</button>
        </div>
      `;
    });
}

function renderDepartments(depts) {
  departmentsGrid.innerHTML = '';
  if (depts.length === 0) {
    departmentsGrid.classList.add('hidden');
    emptyState.classList.remove('hidden');
    return;
  }

  departmentsGrid.classList.remove('hidden');
  emptyState.classList.add('hidden');

  depts.forEach(dept => {
    const card = createDepartmentCard(dept);
    departmentsGrid.appendChild(card);
  });
}

function createDepartmentCard(dept) {
  const card = document.createElement('div');
  card.className =
    'department-card group cursor-pointer transition-transform hover:-translate-y-1 hover:shadow-xl bg-white dark:bg-[#19232e] rounded-xl p-6 border border-gray-100 dark:border-[#2e3a47] min-h-[280px]';

  const colorClass = getDepartmentColorClass(dept.name);

  card.innerHTML = `
    <div class="flex items-start justify-between mb-6">
      <div class="flex items-center gap-5">
        <div class="logo-container ${colorClass} w-24 h-24">
          ${
            dept.logo
              ? `<img src="${API_BASE_URL}/logos/${dept.logo}" alt="${dept.name} logo" class="w-full h-full object-contain p-1 rounded-lg">`
              : `<span class="material-symbols-outlined text-4xl ${getDepartmentIconColor(dept.name)}">corporate_fare</span>`
          }
        </div>
        <div>
          <h3 class="font-bold text-xl">${dept.name}</h3>
          <p class="text-gray-600 dark:text-gray-300 text-base">${dept.email || 'No email provided'}</p>
        </div>
      </div>
      <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button class="action-btn edit-btn" data-id="${dept.id}" title="Edit Department">
          <span class="material-symbols-outlined text-lg">edit</span>
        </button>
        <button class="action-btn delete-btn" data-id="${dept.id}" title="Delete Department">
          <span class="material-symbols-outlined text-lg">delete</span>
        </button>
      </div>
    </div>
    <p class="text-gray-700 dark:text-gray-200 mb-4 text-base line-clamp-2">${dept.description || 'No description provided'}</p>
    <div class="flex justify-between items-center text-sm text-gray-500 pt-4 border-t border-gray-100 dark:border-[#2e3a47]">
      <span class="flex items-center gap-1">
        <span class="material-symbols-outlined text-base">tag</span>
        ID: ${dept.id}
      </span>
      <span class="material-symbols-outlined text-base transform group-hover:translate-x-1 transition-transform">arrow_forward</span>
    </div>
  `;

  // Event listeners
  card.querySelector('.edit-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    openEditModal(dept.id);
  });

  card.querySelector('.delete-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    deleteDepartment(dept.id);
  });

  card.addEventListener('click', () => openEditModal(dept.id));
  return card;
}

function openEditModal(id) {
  const dept = departments.find(d => d.id === id);
  if (!dept) return;

  document.getElementById('modalDeptId').value = dept.id;
  document.getElementById('modalDeptName').value = dept.name;
  document.getElementById('modalDeptDescription').value = dept.description || '';
  document.getElementById('modalDeptEmail').value = dept.email || '';

  const logoPreview = document.getElementById('modalLogoPreview');
  logoPreview.innerHTML = dept.logo
    ? `<img src="${API_BASE_URL}/logos/${dept.logo}" alt="${dept.name} logo" class="w-full h-full object-contain p-1">`
    : `<span class="material-symbols-outlined text-2xl text-gray-400">image</span>`;

  currentEditingId = id;
  departmentModal.classList.remove('hidden');
  departmentModal.style.display = 'flex';
}

function handleCreateDepartment(e) {
  e.preventDefault();
  const submitBtn = departmentForm.querySelector('button[type="submit"]');
  const originalText = submitBtn.innerHTML;
  submitBtn.innerHTML = `<div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> Creating...`;
  submitBtn.disabled = true;

  const formData = new FormData();
  formData.append('name', document.getElementById('deptName').value);
  formData.append('description', document.getElementById('deptDescription').value);
  formData.append('email', document.getElementById('deptEmail').value);

  const logoFile = document.getElementById('deptLogo').files[0];
  if (logoFile) formData.append('logo', logoFile);

  fetch(`${API_BASE_URL}/save`, {
    method: 'POST',
    body: formData
  })
    .then(response => {
      if (!response.ok) throw new Error('Failed to create department');
      return response.json();
    })
    .then(newDept => {
      departments.push(newDept);
      renderDepartments(departments);
      addDepartmentForm.classList.add('hidden');
      resetForm();
      showNotification('Department created successfully!', 'success');
    })
    .catch(error => {
      console.error('Error creating department:', error);
      showNotification('Failed to create department. Please try again.', 'error');
    })
    .finally(() => {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    });
}

function handleUpdateDepartment(e) {
  e.preventDefault();
  const submitBtn = modalDeptForm.querySelector('button[type="submit"]');
  const originalText = submitBtn.innerHTML;
  submitBtn.innerHTML = `<div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> Saving...`;
  submitBtn.disabled = true;

  const id = document.getElementById('modalDeptId').value;
  const formData = new FormData();
  formData.append('name', document.getElementById('modalDeptName').value);
  formData.append('description', document.getElementById('modalDeptDescription').value);
  formData.append('email', document.getElementById('modalDeptEmail').value);

  const logoFile = document.getElementById('modalDeptLogo').files[0];
  if (logoFile) formData.append('logo', logoFile);

  fetch(`${API_BASE_URL}/${id}`, {
    method: 'PUT',
    body: formData
  })
    .then(response => {
      if (!response.ok) throw new Error('Failed to update department');
      return response.json();
    })
    .then(updatedDept => {
      const index = departments.findIndex(d => d.id === updatedDept.id);
      if (index !== -1) departments[index] = updatedDept;
      renderDepartments(departments);
      departmentModal.classList.add('hidden');
      showNotification('Department updated successfully!', 'success');
    })
    .catch(error => {
      console.error('Error updating department:', error);
      showNotification('Failed to update department. Please try again.', 'error');
    })
    .finally(() => {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    });
}

function deleteDepartment(id) {
  if (!confirm('Are you sure you want to delete this department?')) return;

  fetch(`${API_BASE_URL}/${id}`, { method: 'DELETE' })
    .then(response => {
      if (!response.ok) throw new Error('Failed to delete department');
      departments = departments.filter(d => d.id !== id);
      renderDepartments(departments);
      showNotification('Department deleted successfully!', 'success');
    })
    .catch(error => {
      console.error('Error deleting department:', error);
      showNotification('Failed to delete department. Please try again.', 'error');
    });
}

function previewLogo(file, previewElementId) {
  const preview = document.getElementById(previewElementId);
  if (file) {
    const reader = new FileReader();
    reader.onload = e => {
      preview.innerHTML = `<img src="${e.target.result}" alt="Logo preview" class="w-full h-full object-contain p-1">`;
    };
    reader.readAsDataURL(file);
  } else {
    preview.innerHTML = `<span class="material-symbols-outlined text-3xl text-gray-400">image</span>`;
  }
}

function resetForm() {
  document.getElementById('deptName').value = '';
  document.getElementById('deptDescription').value = '';
  document.getElementById('deptEmail').value = '';
  document.getElementById('deptLogo').value = '';
  document.getElementById('logoPreview').innerHTML = `<span class="material-symbols-outlined text-3xl text-gray-400">image</span>`;
}

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';
  const icon = type === 'success' ? 'check_circle' : type === 'error' ? 'error' : 'info';

  notification.className = `fixed top-4 right-4 ${bgColor} text-white px-6 py-4 rounded-lg shadow-lg z-50 transform transition-transform duration-300 translate-x-full`;
  notification.innerHTML = `
    <div class="flex items-center gap-3">
      <span class="material-symbols-outlined">${icon}</span>
      <span>${message}</span>
    </div>
  `;

  document.body.appendChild(notification);
  setTimeout(() => notification.classList.remove('translate-x-full'), 10);
  setTimeout(() => {
    notification.classList.add('translate-x-full');
    setTimeout(() => notification.remove(), 300);
  }, 4000);
}
