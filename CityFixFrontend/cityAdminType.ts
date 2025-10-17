document.addEventListener("DOMContentLoaded", () => {
  console.log("User Management (TS) Loaded ✅");

  const htmlElement = document.documentElement;
  const tbody = document.getElementById("userTableBody") as HTMLTableSectionElement;
  const API_BASE_URL = "http://localhost:8080/api/city-admins";

  // 🌓 Dark mode toggle with 'D' key (ignores typing)
  document.addEventListener("keydown", (e: KeyboardEvent) => {
    const tag = (document.activeElement?.tagName || "").toLowerCase();
    if (e.key.toLowerCase() === "d" && tag !== "input" && tag !== "textarea") {
      htmlElement.classList.toggle("dark");
    }
  });

  interface User {
    id?: number;
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

  interface CityAdmin {
    fullName: string;
    nic: string;
    email: string;
    phoneNumber: string;
    address: string;
    dob: string;
    cityAssigned: string;
    password: string;
    role: string;
    firstLogin: boolean;
  }

  // 🧍 Dummy users for display (you can remove later)
  let users: User[] = [];

  // 🧩 API Functions
  async function saveCityAdminToBackend(adminData: CityAdmin): Promise<number | null> {
    try {
      console.log("Sending to backend:", adminData);
      const superAdminUsername = "superadmin@google.com";
      const superAdminPassword = "Temp@123";

      const response = await fetch(`${API_BASE_URL}/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Basic " + btoa(`${superAdminUsername}:${superAdminPassword}`),
        },
        body: JSON.stringify(adminData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("✅ Added:", result);
        return result.id;
      } else {
        console.error("❌ Backend error:", response.status, await response.text());
        return null;
      }
    } catch (error) {
      console.error("🔥 Network error:", error);
      return null;
    }
  }

  async function getAllCityAdminsFromBackend(): Promise<User[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/all`);
      if (response.ok) {
        const cityAdmins: any[] = await response.json();
        console.log("Loaded from backend:", cityAdmins);
        return cityAdmins.map(admin => ({
          id: admin.id,
          firstName: admin.fullName?.split(" ")[0] || "",
          lastName: admin.fullName?.split(" ").slice(1).join(" ") || "",
          email: admin.email,
          phone: admin.phoneNumber,
          address: admin.address,
          profilePicture: "",
          city: admin.cityAssigned,
          subCity: "",
          role: "City Admin",
          lastLogin: new Date().toISOString().split("T")[0],
        }));
      }
      return [];
    } catch (error) {
      console.error("Error loading from backend:", error);
      return [];
    }
  }

  async function deleteCityAdminFromBackend(id: number): Promise<boolean> {
    try {
      const superAdminUsername = "superadmin@google.com";
      const superAdminPassword = "Temp@123";

      const response = await fetch(`${API_BASE_URL}/delete/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": "Basic " + btoa(`${superAdminUsername}:${superAdminPassword}`),
        },
      });
      return response.ok;
    } catch (error) {
      console.error("Failed to delete from backend:", error);
      return false;
    }
  }

  async function updateCityAdminInBackend(user: User): Promise<boolean> {
    if (!user.id) {
      console.error("❌ Missing ID for update");
      return false;
    }

    try {
      const superAdminUsername = "superadmin@google.com";
      const superAdminPassword = "Temp@123";

      const existingRes = await fetch(`${API_BASE_URL}/${user.id}`, {
        headers: {
          "Authorization": "Basic " + btoa(`${superAdminUsername}:${superAdminPassword}`),
        },
      });

      if (!existingRes.ok) {
        console.error("❌ Failed to fetch existing City Admin before update");
        return false;
      }

      const existing = await existingRes.json();

      const updatedAdmin = {
        id: user.id,
        fullName: `${user.firstName} ${user.lastName}`.trim(),
        nic: existing.nic || "",
        email: user.email,
        phoneNumber: user.phone,
        address: user.address,
        dob: existing.dob || "",
        cityAssigned: user.city,
        password: existing.password || "",
        role: "CITY_ADMIN",
        firstLogin: existing.firstLogin ?? false,
      };

      const response = await fetch(`${API_BASE_URL}/update/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Basic " + btoa(`${superAdminUsername}:${superAdminPassword}`),
        },
        body: JSON.stringify(updatedAdmin),
      });

      if (response.ok) {
        console.log("✅ Updated:", updatedAdmin);
        return true;
      } else {
        console.error("❌ Update failed:", response.status, await response.text());
        return false;
      }
    } catch (error) {
      console.error("🔥 Update failed:", error);
      return false;
    }
  }

  // 🧭 Modal Elements
  const modal = document.getElementById("userModal") as HTMLDivElement;
  const closeModalBtn = document.getElementById("closeModalBtn") as HTMLButtonElement;
  const modalForm = document.getElementById("modalForm") as HTMLFormElement;
  const modalProfilePicture = document.getElementById("modalProfilePicture") as HTMLDivElement;
  const modalFirstName = document.getElementById("modalFirstName") as HTMLInputElement;
  const modalLastName = document.getElementById("modalLastName") as HTMLInputElement;
  const modalEmail = document.getElementById("modalEmail") as HTMLInputElement;
  const modalPhone = document.getElementById("modalPhone") as HTMLInputElement;
  const modalAddress = document.getElementById("modalAddress") as HTMLInputElement;
  const modalCity = document.getElementById("modalCity") as HTMLSelectElement;
  const modalSubCity = document.getElementById("modalSubCity") as HTMLInputElement;
  const modalRole = document.getElementById("modalRole") as HTMLInputElement;
  const modalDeleteBtn = document.getElementById("modalDeleteBtn") as HTMLButtonElement;
  const modalSaveBtn = document.getElementById("modalSaveBtn") as HTMLButtonElement;

  // 🧾 Render table
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

    tbody.querySelectorAll("tr").forEach(row => {
      row.addEventListener("click", (e) => {
        const target = e.target as HTMLElement;
        if (target.classList.contains("delete-btn")) return;
        const idx = parseInt(row.dataset.index || "0");
        openModal(users.filter(u => u.role !== "Super Admin")[idx]);
      });
    });

    tbody.querySelectorAll(".delete-btn").forEach((btn, idx) => {
      btn.addEventListener("click", async (e) => {
        e.stopPropagation();
        const filteredUsers = users.filter(u => u.role !== "Super Admin");
        const userToDelete = filteredUsers[idx];
        if (userToDelete.id) {
          const deleted = await deleteCityAdminFromBackend(userToDelete.id);
          if (deleted) {
            users.splice(users.indexOf(userToDelete), 1);
            renderTable(users);
            showPopup("Success ✅", "City Admin deleted successfully!", true);
          } else {
            showPopup("Error ❌", "Failed to delete from backend!", false);
          }
        } else {
          users.splice(users.indexOf(userToDelete), 1);
          renderTable(users);
        }
      });
    });
  }

  function openModal(user: User) {
    modalFirstName.value = user.firstName;
    modalLastName.value = user.lastName;
    modalEmail.value = user.email;
    modalPhone.value = user.phone;
    modalAddress.value = user.address;

    if (user.role === "City Admin") {
      modalCity.value = user.city;
      modalCity.disabled = false;
      modalCity.style.display = "block";
    } else {
      modalCity.style.display = "none";
    }

    modalSubCity.value = user.subCity;
    modalRole.value = user.role;
    modalProfilePicture.innerHTML = user.profilePicture
      ? `<img src="${user.profilePicture}" class="w-20 h-20 rounded-full"/>`
      : `<span class="material-symbols-outlined text-4xl">person</span>`;

    modalSubCity.style.display = (user.role === "Citizen") ? "none" : "block";
    modalSubCity.disabled = (user.role === "City Admin");

    modalForm.querySelectorAll("input").forEach(inp => {
      const inputEl = inp as HTMLInputElement;
      inputEl.readOnly = !(user.role === "City Admin" && inputEl.id !== "modalRole");
    });

    modalSaveBtn.style.display = (user.role === "City Admin") ? "inline-block" : "none";
    modalDeleteBtn.style.display = (user.role === "Citizen" || user.role === "City Admin") ? "inline-block" : "none";

    modal.classList.remove("hidden");

    modalDeleteBtn.onclick = async () => {
      if (!user.id) {
        showPopup("Error ❌", "City Admin ID not found. Cannot delete.", false);
        return;
      }

      const backendDeleted = await deleteCityAdminFromBackend(user.id);
      if (backendDeleted) {
        users.splice(users.indexOf(user), 1);
        renderTable(users);
        showPopup("Success ✅", "City Admin deleted successfully!", true);
      } else {
        showPopup("Error ❌", "Failed to delete City Admin from backend!", false);
      }
      modal.classList.add("hidden");
    };

    modalForm.onsubmit = async (e) => {
      e.preventDefault();
      if (user.role === "City Admin") {
        user.firstName = modalFirstName.value;
        user.lastName = modalLastName.value;
        user.email = modalEmail.value;
        user.phone = modalPhone.value;
        user.address = modalAddress.value;
        user.city = modalCity.value;
        user.subCity = modalSubCity.value;

        const backendUpdated = await updateCityAdminInBackend(user);
        if (backendUpdated) {
          showPopup("Success ✅", "City Admin updated successfully!", true);
          renderTable(users);
        } else {
          showPopup("Error ❌", "Failed to update City Admin in backend!", false);
        }
      }
      modal.classList.add("hidden");
    };
  }

  closeModalBtn.addEventListener("click", () => modal.classList.add("hidden"));

  renderTable(users);

  // 🏙 Add City Admin
  const addBtn = document.getElementById("addCityAdminBtn") as HTMLButtonElement;
  const formDiv = document.getElementById("addCityAdminForm") as HTMLDivElement;
  const cancelBtn = document.getElementById("cancelBtn") as HTMLButtonElement;
  const form = document.getElementById("cityAdminForm") as HTMLFormElement;

  addBtn.addEventListener("click", () => formDiv.classList.toggle("hidden"));
  cancelBtn.addEventListener("click", () => formDiv.classList.add("hidden"));

  // 🧠 Validations
  function validateEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
  function validatePhone(phone: string) {
    return /^0(7[0-8])[0-9]{7}$/.test(phone.trim());
  }
  function validateNIC(nic: string) {
    return /^(?:\d{9}[vVxX]|\d{12})$/.test(nic.trim());
  }
  function validatePassword(password: string) {
    return /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,}$/.test(password);
  }

  // 📝 Form submission
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fullName = (document.getElementById("fullName") as HTMLInputElement).value.trim();
    const nic = (document.getElementById("nic") as HTMLInputElement).value.trim();
    const email = (document.getElementById("email") as HTMLInputElement).value.trim();
    const phone = (document.getElementById("phone") as HTMLInputElement).value.trim();
    const address = (document.getElementById("address") as HTMLInputElement).value.trim();
    const dob = (document.getElementById("dob") as HTMLInputElement).value.trim();
    const city = (document.getElementById("city") as HTMLSelectElement).value.trim();
    const password = (document.getElementById("password") as HTMLInputElement).value;

    if (!fullName || !nic || !email || !phone || !address || !dob || !city || !password) {
      alert("All fields are required!");
      return;
    }
    if (!validateEmail(email)) {
      alert("Invalid email format!");
      return;
    }
    if (!validatePhone(phone)) {
      alert("Phone number must be 10 digits!");
      return;
    }
    if (!validateNIC(nic)) {
      alert("Invalid NIC format!");
      return;
    }
    if (!validatePassword(password)) {
      alert("Password must include number + special character!");
      return;
    }

    const cityAdminData: CityAdmin = {
      fullName,
      nic,
      email,
      phoneNumber: phone,
      address,
      dob,
      cityAssigned: city,
      password,
      role: "CITY_ADMIN",
      firstLogin: true,
    };

    const backendId = await saveCityAdminToBackend(cityAdminData);

    users.push({
      id: backendId || undefined,
      firstName: fullName.split(" ")[0] || "",
      lastName: fullName.split(" ").slice(1).join(" "),
      email,
      phone,
      address,
      profilePicture: "",
      city,
      subCity: "",
      role: "City Admin",
      lastLogin: new Date().toISOString().split("T")[0],
    });

    renderTable(users);
    form.reset();
    formDiv.classList.add("hidden");

    if (backendId) {
      showPopup("Success ✅", "City Admin added successfully!", true);
    } else {
      showPopup("Error ❌", "Failed to save City Admin to backend!", false);
    }
  });

  // 🧩 Load from backend
  getAllCityAdminsFromBackend().then(backendAdmins => {
    if (backendAdmins.length > 0) {
      users = users.filter(user => user.role !== "City Admin").concat(backendAdmins);
      renderTable(users);
    }
  });

  // 💬 Popup
  function showPopup(title: string, message: string, isSuccess: boolean) {
    const popup = document.getElementById("popupMessage") as HTMLDivElement;
    const titleEl = document.getElementById("popupTitle") as HTMLElement;
    const textEl = document.getElementById("popupText") as HTMLElement;
    const content = popup.querySelector(".popup-content") as HTMLDivElement;

    titleEl.textContent = title;
    textEl.textContent = message;

    content.classList.remove("success", "error");
    content.classList.add(isSuccess ? "success" : "error");

    popup.classList.remove("hidden");
    setTimeout(() => popup.classList.add("hidden"), 2500);
  }

  document.getElementById("popupClose")?.addEventListener("click", () => {
    document.getElementById("popupMessage")?.classList.add("hidden");
  });
});
