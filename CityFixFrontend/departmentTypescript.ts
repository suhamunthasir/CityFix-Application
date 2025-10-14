interface Department {
  id?: number;
  name: string;
  email?: string;
  description: string;
  logo?: File | string;
}

class DepartmentAPI {
  private baseUrl: string = "http://localhost:8080/api/departments";

  async getAllDepartments(): Promise<Department[]> {
    const response = await fetch(this.baseUrl);
    if (!response.ok) throw new Error("Failed to fetch departments");
    return response.json();
  }

  async createDepartment(dept: Department): Promise<Department> {
    const formData = new FormData();
    formData.append("name", dept.name);
    formData.append("description", dept.description);
    if (dept.email) formData.append("email", dept.email);
    if (dept.logo && dept.logo instanceof File) formData.append("logo", dept.logo);

    const response = await fetch(this.baseUrl, {
      method: "POST",
      body: formData,
    });
    if (!response.ok) throw new Error("Failed to create department");
    return response.json();
  }

  async updateDepartment(id: number, dept: Department): Promise<Department> {
    const formData = new FormData();
    formData.append("name", dept.name);
    formData.append("description", dept.description);
    if (dept.email) formData.append("email", dept.email);
    if (dept.logo && dept.logo instanceof File) formData.append("logo", dept.logo);

    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "PUT",
      body: formData,
    });
    if (!response.ok) throw new Error("Failed to update department");
    return response.json();
  }

  async deleteDepartment(id: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, { method: "DELETE" });
    if (!response.ok) throw new Error("Failed to delete department");
  }
}

class DepartmentManager {
  private api: DepartmentAPI;
  private departments: Department[] = [];
  private currentDepartmentId: number | null = null;

  constructor() {
    this.api = new DepartmentAPI();
    this.init();
  }

  async init() {
    await this.loadDepartments();
    this.setupEventListeners();
  }

  private async loadDepartments() {
    try {
      this.departments = await this.api.getAllDepartments();
      this.renderDepartments(this.departments);
    } catch (err) {
      console.error(err);
    }
  }

  private renderDepartments(departments: Department[]) {
    const container = document.getElementById("departmentsContainer")!;
    container.innerHTML = "";

    departments.forEach((dept) => {
      const card = document.createElement("div");
      card.className =
        "department-card bg-white dark:bg-[#19232e] border border-gray-200 dark:border-[#2e3a47] rounded-xl p-6";
      card.innerHTML = `
        <div class="flex justify-between items-start mb-4">
          <div class="flex items-center gap-4">
            <div class="logo-preview bg-gray-100" style="background-image: url('${dept.logo || ""}')">
              ${dept.logo ? "" : '<span class="material-symbols-outlined text-4xl text-gray-400">apartment</span>'}
            </div>
            <div>
              <h3 class="text-xl font-bold">${dept.name}</h3>
              <p class="text-gray-500">${dept.email || ""}</p>
            </div>
          </div>
          <div class="flex gap-2">
            <button class="edit-btn text-primary hover:underline flex items-center gap-1 text-sm font-medium" data-id="${dept.id}">
              <span class="material-symbols-outlined text-base">edit</span>
              <span>Edit</span>
            </button>
            <button class="delete-btn text-red-500 hover:underline flex items-center gap-1 text-sm font-medium" data-id="${dept.id}">
              <span class="material-symbols-outlined text-base">delete</span>
              <span>Delete</span>
            </button>
          </div>
        </div>
        <div class="text-gray-700 dark:text-gray-300">
          <p>${dept.description}</p>
        </div>
      `;
      container.appendChild(card);
    });

    this.setupEditDeleteListeners();
  }

  private setupEventListeners() {
    document.getElementById("addDepartmentBtn")!.addEventListener("click", () => this.toggleAddForm());
    document.getElementById("cancelBtn")!.addEventListener("click", () => this.toggleAddForm());
    document.getElementById("departmentForm")!.addEventListener("submit", (e) => {
      e.preventDefault();
      this.addDepartment();
    });
    document.getElementById("uploadLogoBtn")!.addEventListener("click", () => {
      document.getElementById("logoUpload")!.click();
    });
    document.getElementById("logoUpload")!.addEventListener("change", (e) => {
      this.previewLogo((e.target as HTMLInputElement).files![0], "logoPreview");
    });
    document.getElementById("searchInput")!.addEventListener("input", (e) => {
      this.filterDepartments((e.target as HTMLInputElement).value);
    });

    // Modal events
    document.getElementById("closeModalBtn")!.addEventListener("click", () => this.closeModal());
    document.getElementById("modalForm")!.addEventListener("submit", (e) => {
      e.preventDefault();
      this.updateDepartment();
    });
    document.getElementById("modalDeleteBtn")!.addEventListener("click", () => this.deleteDepartment());
    document.getElementById("popupClose")!.addEventListener("click", () => this.hidePopup());
  }

  private toggleAddForm() {
    const form = document.getElementById("addDepartmentForm")!;
    form.classList.toggle("hidden");
  }

  private async addDepartment() {
    const name = (document.getElementById("departmentName") as HTMLInputElement).value;
    const email = (document.getElementById("departmentEmail") as HTMLInputElement).value;
    const description = (document.getElementById("departmentDescription") as HTMLTextAreaElement).value;
    const logoInput = document.getElementById("logoUpload") as HTMLInputElement;
    const logoFile = logoInput.files ? logoInput.files[0] : undefined;

    try {
      await this.api.createDepartment({ name, email, description, logo: logoFile });
      await this.loadDepartments();
      this.toggleAddForm();
      this.resetForm();
      this.showPopup("Success", "Department added successfully!", "success");
    } catch (err) {
      console.error(err);
      this.showPopup("Error", "Failed to add department.", "error");
    }
  }

  private resetForm() {
    (document.getElementById("departmentForm") as HTMLFormElement).reset();
    const preview = document.getElementById("logoPreview")!;
    preview.style.backgroundImage = "";
    preview.innerHTML = '<span class="material-symbols-outlined text-4xl text-gray-400">apartment</span>';
  }

  private filterDepartments(term: string) {
    const filtered = this.departments.filter(
      (d) => d.name.toLowerCase().includes(term.toLowerCase()) || (d.email && d.email.toLowerCase().includes(term.toLowerCase()))
    );
    this.renderDepartments(filtered);
  }

  private setupEditDeleteListeners() {
    document.querySelectorAll(".edit-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = parseInt((e.currentTarget as HTMLElement).dataset.id!);
        this.openEditModal(id);
      });
    });

    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const id = parseInt((e.currentTarget as HTMLElement).dataset.id!);
        await this.deleteDepartment(id);
      });
    });
  }

  private openEditModal(id: number) {
    const dept = this.departments.find((d) => d.id === id);
    if (!dept) return;
    this.currentDepartmentId = id;

    (document.getElementById("modalDepartmentName") as HTMLInputElement).value = dept.name;
    (document.getElementById("modalDepartmentEmail") as HTMLInputElement).value = dept.email || "";
    (document.getElementById("modalDepartmentDescription") as HTMLTextAreaElement).value = dept.description;

    const logoPreview = document.getElementById("modalLogoPreview")!;
    if (dept.logo) {
      logoPreview.style.backgroundImage = `url('${dept.logo}')`;
      logoPreview.innerHTML = "";
    } else {
      logoPreview.style.backgroundImage = "";
      logoPreview.innerHTML = '<span class="material-symbols-outlined text-4xl text-gray-400">apartment</span>';
    }

    document.getElementById("departmentModal")!.classList.remove("hidden");
  }

  private closeModal() {
    document.getElementById("departmentModal")!.classList.add("hidden");
    this.currentDepartmentId = null;
  }

  private async updateDepartment() {
    if (!this.currentDepartmentId) return;

    const name = (document.getElementById("modalDepartmentName") as HTMLInputElement).value;
    const email = (document.getElementById("modalDepartmentEmail") as HTMLInputElement).value;
    const description = (document.getElementById("modalDepartmentDescription") as HTMLTextAreaElement).value;

    try {
      await this.api.updateDepartment(this.currentDepartmentId, { name, email, description });
      await this.loadDepartments();
      this.closeModal();
      this.showPopup("Success", "Department updated successfully!", "success");
    } catch (err) {
      console.error(err);
      this.showPopup("Error", "Failed to update department.", "error");
    }
  }

  private async deleteDepartment(id?: number) {
    const departmentId = id || this.currentDepartmentId;
    if (!departmentId) return;

    if (!confirm("Are you sure you want to delete this department?")) return;

    try {
      await this.api.deleteDepartment(departmentId);
      await this.loadDepartments();
      this.closeModal();
      this.showPopup("Success", "Department deleted successfully!", "success");
    } catch (err) {
      console.error(err);
      this.showPopup("Error", "Failed to delete department.", "error");
    }
  }

  private previewLogo(file: File, previewId: string) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = document.getElementById(previewId)!;
      preview.style.backgroundImage = `url('${e.target?.result}')`;
      preview.innerHTML = "";
    };
    reader.readAsDataURL(file);
  }

  private showPopup(title: string, text: string, type: "success" | "error") {
    const popup = document.getElementById("popupMessage")!;
    const popupTitle = document.getElementById("popupTitle")!;
    const popupText = document.getElementById("popupText")!;
    const popupContent = popup.querySelector(".popup-content")!;

    popupTitle.textContent = title;
    popupText.textContent = text;
    popupContent.classList.remove("success", "error");
    popupContent.classList.add(type);
    popup.classList.remove("hidden");

    setTimeout(() => this.hidePopup(), 3000);
  }

  private hidePopup() {
    document.getElementById("popupMessage")!.classList.add("hidden");
  }
}

document.addEventListener("DOMContentLoaded", () => new DepartmentManager());
