// ====== CONFIG ======
const API_BASE = "http://localhost:8080/api/announcements"; // backend base URL
const IMAGE_BASE_URL = "http://localhost:8080/api/announcements/images/"; // endpoint to serve images

// ====== DOM ELEMENTS ======
const addAnnouncementBtn = document.getElementById("addAnnouncementBtn");
const addAnnouncementFormDiv = document.getElementById("addAnnouncementForm");
const cancelAnnBtn = document.getElementById("cancelAnnBtn");
const announcementForm = document.getElementById("announcementForm");
const announcementsGrid = document.getElementById("announcementsGrid");
const emptyState = document.getElementById("emptyState");
const announcementModal = document.getElementById("announcementModal");
const closeAnnModalBtn = document.getElementById("closeAnnModalBtn");
const modalAnnForm = document.getElementById("modalAnnForm");

// ====== STATE ======
let annSelectedFiles = [];
let modalAnnSelectedFiles = [];

// ====== TOAST NOTIFICATION ======
function showToast(message, type = "success") {
  const existingToast = document.getElementById("toast");
  if (existingToast) existingToast.remove();

  const toast = document.createElement("div");
  toast.id = "toast";
  toast.className = `
    fixed top-5 right-5 px-6 py-4 rounded-lg shadow-lg text-white z-50 
    transition-transform duration-300 transform translate-x-full
    ${type === "success" ? "bg-green-600" : "bg-red-600"}
  `;
  toast.innerHTML = `
    <div class="flex items-center gap-3">
      <span class="material-symbols-outlined">
        ${type === "success" ? "check_circle" : "error"}
      </span>
      <span>${message}</span>
    </div>
  `;
  document.body.appendChild(toast);

  // Slide in
  setTimeout(() => toast.classList.remove("translate-x-full"), 10);

  // Slide out
  setTimeout(() => {
    toast.classList.add("translate-x-full");
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ====== SHOW/HIDE FORM ======
addAnnouncementBtn.addEventListener("click", () => {
  addAnnouncementFormDiv.classList.remove("hidden");
});

cancelAnnBtn.addEventListener("click", () => {
  addAnnouncementFormDiv.classList.add("hidden");
  announcementForm.reset();
  annSelectedFiles = [];
  updateImagePreview(document.getElementById("annImagesPreview"), annSelectedFiles);
});

// ====== FETCH ANNOUNCEMENTS ======
async function fetchAnnouncements() {
  try {
    const res = await fetch(API_BASE);
    const data = await res.json();
    displayAnnouncements(data);
  } catch (err) {
    console.error("Error fetching announcements:", err);
    showToast("Failed to load announcements", "error");
  }
}

// ====== DISPLAY ANNOUNCEMENTS ======
function displayAnnouncements(announcements) {
  announcementsGrid.innerHTML = "";
  if (!announcements || announcements.length === 0) {
    emptyState.classList.remove("hidden");
    return;
  }

  emptyState.classList.add("hidden");

  announcements.forEach((ann) => {
    const card = document.createElement("div");
    card.className =
      "bg-white dark:bg-[#19232e] rounded-xl shadow-md flex flex-col border border-gray-200 dark:border-[#2e3a47] h-[460px] overflow-hidden";

    // Content wrapper (scrollable)
    const contentDiv = document.createElement("div");
    contentDiv.className = "card-content flex-1 overflow-y-auto p-4";

    // Handle images
    if (ann.images) {
      const imgs = Array.isArray(ann.images) ? ann.images : ann.images.split(",");
      imgs.forEach((img) => {
        if (img.trim()) {
          const imgEl = document.createElement("img");
          imgEl.src = `${IMAGE_BASE_URL}${img.trim()}`;
          imgEl.className = "h-32 w-full object-cover rounded-md border border-gray-300 mb-2";
          contentDiv.appendChild(imgEl);
        }
      });
    }

    // Title
    const titleEl = document.createElement("h3");
    titleEl.className = "text-lg font-semibold";
    titleEl.textContent = ann.title;
    contentDiv.appendChild(titleEl);

    // Content
    const contentEl = document.createElement("p");
    contentEl.className = "text-gray-600 dark:text-gray-300";
    contentEl.textContent = ann.content;
    contentDiv.appendChild(contentEl);

    // Priority + Category + CreatedBy
    const infoEl = document.createElement("p");
    infoEl.className = "text-sm text-gray-400 italic mt-2";
    infoEl.innerHTML = `
      Priority: <span class="font-medium">${ann.priority || "N/A"}</span> |
      Category: <span class="font-medium">${ann.category || "N/A"}</span> |
      Created By: <span class="font-medium">${ann.createdBy || "N/A"}</span>
    `;
    contentDiv.appendChild(infoEl);

    card.appendChild(contentDiv);

    // Buttons (fixed at bottom)
    const btnDiv = document.createElement("div");
    btnDiv.className = "flex justify-end gap-2 px-4 py-3 border-t border-gray-200 dark:border-[#334155] bg-white dark:bg-[#19232e]";

    const editBtn = document.createElement("button");
    editBtn.className = "editBtn bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 flex items-center gap-1";
    editBtn.innerHTML = `<span class="material-symbols-outlined text-sm">edit</span> Edit`;
    editBtn.addEventListener("click", () => openEditModal(ann));

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "deleteBtn bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 flex items-center gap-1";
    deleteBtn.innerHTML = `<span class="material-symbols-outlined text-sm">delete</span> Delete`;
    deleteBtn.addEventListener("click", () => deleteAnnouncement(ann.id));

    btnDiv.appendChild(editBtn);
    btnDiv.appendChild(deleteBtn);
    card.appendChild(btnDiv);

    announcementsGrid.appendChild(card);
  });
}


// ====== ADD ANNOUNCEMENT ======
announcementForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData();
  formData.append("title", document.getElementById("annTitle").value);
  formData.append("content", document.getElementById("annContent").value);
  formData.append("priority", document.getElementById("annPriority").value);
  formData.append("category", document.getElementById("annCategory").value);
  formData.append("createdBy", document.getElementById("annCreatedBy").value);

  annSelectedFiles.forEach((file) => formData.append("images", file));

  const success = await submitForm(`${API_BASE}/create`, formData);
  if (success) showToast("Announcement created successfully!");
  announcementForm.reset();
  annSelectedFiles = [];
  updateImagePreview(document.getElementById("annImagesPreview"), annSelectedFiles);
  addAnnouncementFormDiv.classList.add("hidden");
});

// ====== EDIT ANNOUNCEMENT ======
function openEditModal(ann) {
  announcementModal.classList.remove("hidden");
  document.getElementById("modalAnnId").value = ann.id;
  document.getElementById("modalAnnTitle").value = ann.title;
  document.getElementById("modalAnnContent").value = ann.content;
  document.getElementById("modalAnnPriority").value = ann.priority || "";
  document.getElementById("modalAnnCategory").value = ann.category || "";
  document.getElementById("modalAnnCreatedBy").value = ann.createdBy || "";
  modalAnnSelectedFiles = [];
  updateImagePreview(document.getElementById("modalAnnImagesPreview"), modalAnnSelectedFiles);

  const modalAnnDeleteBtn = document.getElementById("modalAnnDeleteBtn");
modalAnnDeleteBtn.addEventListener("click", () => {
  const id = document.getElementById("modalAnnId").value; // get the ID from the hidden input
  deleteAnnouncement(id);
  announcementModal.classList.add("hidden"); // close modal after deletion
});

}

closeAnnModalBtn.addEventListener("click", () => {
  announcementModal.classList.add("hidden");
  modalAnnSelectedFiles = [];
  updateImagePreview(document.getElementById("modalAnnImagesPreview"), modalAnnSelectedFiles);
});

// ====== UPDATE ANNOUNCEMENT ======
modalAnnForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("modalAnnId").value;
  const formData = new FormData();
  formData.append("title", document.getElementById("modalAnnTitle").value);
  formData.append("content", document.getElementById("modalAnnContent").value);
  formData.append("priority", document.getElementById("modalAnnPriority").value);
  formData.append("category", document.getElementById("modalAnnCategory").value);
  formData.append("createdBy", document.getElementById("modalAnnCreatedBy").value);

  modalAnnSelectedFiles.forEach((file) => formData.append("images", file));

  const success = await submitForm(`${API_BASE}/${id}`, formData, "PUT");
  if (success) showToast("Announcement updated successfully!");
  announcementModal.classList.add("hidden");
  fetchAnnouncements();
});

// ====== DELETE ANNOUNCEMENT ======
async function deleteAnnouncement(id) {
  if (!confirm("Are you sure you want to delete this announcement?")) return;
  try {
    const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
    if (res.ok) {
      fetchAnnouncements();
      showToast("Announcement deleted successfully!");
    } else {
      showToast("Failed to delete announcement", "error");
    }
  } catch (err) {
    console.error(err);
    showToast("Failed to delete announcement", "error");
  }
}

// ====== FORM SUBMIT HELPER ======
async function submitForm(url, formData, method = "POST") {
  try {
    const res = await fetch(url, { method, body: formData });
    if (!res.ok) throw new Error("Request failed");
    await fetchAnnouncements();
    return true;
  } catch (err) {
    console.error(err);
    showToast("Failed to process announcement", "error");
    return false;
  }
}

// ====== IMAGE PREVIEW ======
function updateImagePreview(container, filesArray) {
  container.innerHTML = "";
  filesArray.forEach((file, index) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const div = document.createElement("div");
      div.className = "relative inline-block";

      const img = document.createElement("img");
      img.src = e.target.result;
      img.className = "h-24 w-24 object-cover rounded-md border border-gray-300 m-1";

      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.innerHTML = "&times;";
      removeBtn.className =
        "absolute top-0 right-0 bg-red-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center";
      removeBtn.addEventListener("click", () => {
        filesArray.splice(index, 1);
        updateImagePreview(container, filesArray);
      });

      div.appendChild(img);
      div.appendChild(removeBtn);
      container.appendChild(div);
    };
    reader.readAsDataURL(file);
  });
}

// ====== FILE INPUT HANDLERS ======
document.getElementById("annImages").addEventListener("change", (e) => {
  annSelectedFiles.push(...Array.from(e.target.files));
  updateImagePreview(document.getElementById("annImagesPreview"), annSelectedFiles);
});

document.getElementById("modalAnnImages").addEventListener("change", (e) => {
  modalAnnSelectedFiles.push(...Array.from(e.target.files));
  updateImagePreview(document.getElementById("modalAnnImagesPreview"), modalAnnSelectedFiles);
});

// ====== INITIAL LOAD ======
fetchAnnouncements();
