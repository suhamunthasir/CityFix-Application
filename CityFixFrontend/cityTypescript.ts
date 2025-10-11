document.addEventListener("DOMContentLoaded", () => {
  console.log("User Management (TS) Loaded ✅");

  const htmlElement = document.documentElement;
  const tbody = document.getElementById("userTableBody") as HTMLTableSectionElement;

  // Dark mode toggle using 'D', ignore when typing
  document.addEventListener("keydown", (e: KeyboardEvent) => {
    const tag = (document.activeElement?.tagName || "").toLowerCase();
    if (e.key.toLowerCase() === "d" && tag !== "input" && tag !== "textarea") {
      htmlElement.classList.toggle("dark");
    }
  });

  interface User {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    profilePicture: string;
    city: string;
    subCity: string;
    role: string;
    lastLogin: string;
  }

  const users: User[] = [
    { firstName: "John", lastName: "Doe", email: "john.doe@example.com", phone: "123456789", address: "123 St", profilePicture: "", city: "Colombo", subCity: "", role: "City Admin", lastLogin: "2023-10-27" },
    { firstName: "Jane", lastName: "Smith", email: "jane.smith@example.com", phone: "987654321", address: "456 St", profilePicture: "", city: "Galle", subCity: "", role: "City Admin", lastLogin: "2023-10-26" },
    { firstName: "Citizen", lastName: "Kane", email: "citizen.kane@example.com", phone: "555666777", address: "789 St", profilePicture: "", city: "", subCity: "", role: "Citizen", lastLogin: "2023-10-24" },
    { firstName: "Mike", lastName: "Ross", email: "mike.ross@example.com", phone: "111222333", address: "101 St", profilePicture: "", city: "Kandy", subCity: "Sub 1", role: "Sub-City Manager", lastLogin: "2023-10-25" },
  ];

  const modal = document.getElementById("userModal") as HTMLDivElement;
  const closeModalBtn = document.getElementById("closeModalBtn") as HTMLButtonElement;
  const modalForm = document.getElementById("modalForm") as HTMLFormElement;
  const modalProfilePicture = document.getElementById("modalProfilePicture") as HTMLDivElement;
  const modalFirstName = document.getElementById("modalFirstName") as HTMLInputElement;
  const modalLastName = document.getElementById("modalLastName") as HTMLInputElement;
  const modalEmail = document.getElementById("modalEmail") as HTMLInputElement;
  const modalPhone = document.getElementById("modalPhone") as HTMLInputElement;
  const modalAddress = document.getElementById("modalAddress") as HTMLInputElement;
  const modalCity = document.getElementById("modalCity") as HTMLInputElement;
  const modalSubCity = document.getElementById("modalSubCity") as HTMLInputElement;
  const modalRole = document.getElementById("modalRole") as HTMLInputElement;
  const modalDeleteBtn = document.getElementById("modalDeleteBtn") as HTMLButtonElement;
  const modalSaveBtn = document.getElementById("modalSaveBtn") as HTMLButtonElement;

  function renderTable(data: User[]) {
    tbody.innerHTML = data
      .filter(u => u.role !== "Super Admin")
      .map((user, index) => `
        <tr class="border-t cursor-pointer" data-index="${index}">
          <td class="p-2">${user.firstName} ${user.lastName}</td>
          <td class="p-2">${user.email}</td>
          <td class="p-2">${user.role}</td>
          <td class="p-2">${user.lastLogin}</td>
          <td class="p-2">
            ${(user.role === "Citizen" || user.role === "City Admin") ? '<button class="text-red-600 hover:text-red-800 delete-btn">🗑</button>' : ''}
          </td>
        </tr>
      `).join("");

    // Attach click to show modal
    tbody.querySelectorAll("tr").forEach(row => {
      row.addEventListener("click", (e) => {
        const target = e.target as HTMLElement;
        if (target.classList.contains("delete-btn")) return;
        const idx = parseInt(row.dataset.index || "0");
        openModal(users.filter(u => u.role !== "Super Admin")[idx]);
      });
    });

    // Delete from table
    tbody.querySelectorAll(".delete-btn").forEach((btn, idx) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const filteredUsers = users.filter(u => u.role !== "Super Admin");
        const userToDelete = filteredUsers[idx];
        const actualIndex = users.indexOf(userToDelete);
        users.splice(actualIndex, 1);
        renderTable(users);
      });
    });
  }

  function openModal(user: User) {
    modalFirstName.value = user.firstName;
    modalLastName.value = user.lastName;
    modalEmail.value = user.email;
    modalPhone.value = user.phone;
    modalAddress.value = user.address;
    modalCity.value = user.city;
    modalSubCity.value = user.subCity;
    modalRole.value = user.role;
    modalProfilePicture.innerHTML = user.profilePicture ? `<img src="${user.profilePicture}" class="w-20 h-20 rounded-full"/>` : `<span class="material-symbols-outlined text-4xl">person</span>`;

    // Show/hide city & sub-city
    modalCity.style.display = (user.role === "Citizen") ? "none" : "block";
    modalSubCity.style.display = (user.role === "Citizen") ? "none" : "block";

    // Role-based input behavior
    modalForm.querySelectorAll("input").forEach(inp => {
      const inputEl = inp as HTMLInputElement;
      inputEl.readOnly = !(user.role === "City Admin" && inputEl.id !== "modalRole");
    });

    modalSaveBtn.style.display = (user.role === "City Admin") ? "inline-block" : "none";
    modalDeleteBtn.style.display = (user.role === "Citizen" || user.role === "City Admin") ? "inline-block" : "none";

    modal.classList.remove("hidden");

    modalDeleteBtn.onclick = () => {
      const idx = users.indexOf(user);
      users.splice(idx, 1);
      renderTable(users);
      modal.classList.add("hidden");
    };

    modalForm.onsubmit = (e) => {
      e.preventDefault();
      if (user.role === "City Admin") {
        user.firstName = modalFirstName.value;
        user.lastName = modalLastName.value;
        user.email = modalEmail.value;
        user.phone = modalPhone.value;
        user.address = modalAddress.value;
        user.city = modalCity.value;
        user.subCity = modalSubCity.value;
        renderTable(users);
      }
      modal.classList.add("hidden");
    };
  }

  closeModalBtn.addEventListener("click", () => modal.classList.add("hidden"));

  renderTable(users);

  // Add City Admin
  const addBtn = document.getElementById("addCityAdminBtn") as HTMLButtonElement;
  const formDiv = document.getElementById("addCityAdminForm") as HTMLDivElement;
  const cancelBtn = document.getElementById("cancelBtn") as HTMLButtonElement;
  const form = document.getElementById("cityAdminForm") as HTMLFormElement;

  addBtn.addEventListener("click", () => formDiv.classList.toggle("hidden"));
  cancelBtn.addEventListener("click", () => formDiv.classList.add("hidden"));

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = (document.getElementById("fullName") as HTMLInputElement).value;
    const email = (document.getElementById("email") as HTMLInputElement).value;

    users.push({
      firstName: name.split(" ")[0] || "",
      lastName: name.split(" ")[1] || "",
      email,
      phone: "",
      address: "",
      profilePicture: "",
      city: "",
      subCity: "",
      role: "City Admin",
      lastLogin: new Date().toISOString().split("T")[0],
    });

    renderTable(users);
    form.reset();
    formDiv.classList.add("hidden");
  });
});

