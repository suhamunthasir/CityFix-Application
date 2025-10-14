"use strict";
document.addEventListener("DOMContentLoaded", () => {
    var _a;
    console.log("User Management (TS) Loaded ✅");
    const htmlElement = document.documentElement;
    const tbody = document.getElementById("userTableBody");
    const API_BASE_URL = "http://localhost:8080/api/city-admins";
    // Dark mode toggle using 'D', ignore when typing
    document.addEventListener("keydown", (e) => {
        var _a;
        const tag = (((_a = document.activeElement) === null || _a === void 0 ? void 0 : _a.tagName) || "").toLowerCase();
        if (e.key.toLowerCase() === "d" && tag !== "input" && tag !== "textarea") {
            htmlElement.classList.toggle("dark");
        }
    });
    let users = [
        { firstName: "John", lastName: "Doe", email: "john.doe@example.com", phone: "123456789", address: "123 St", profilePicture: "", city: "Colombo", subCity: "", role: "City Admin", lastLogin: "2023-10-27" },
        { firstName: "Jane", lastName: "Smith", email: "jane.smith@example.com", phone: "987654321", address: "456 St", profilePicture: "", city: "Galle", subCity: "", role: "City Admin", lastLogin: "2023-10-26" },
        { firstName: "Citizen", lastName: "Kane", email: "citizen.kane@example.com", phone: "555666777", address: "789 St", profilePicture: "", city: "", subCity: "", role: "Citizen", lastLogin: "2023-10-24" },
        { firstName: "Mike", lastName: "Ross", email: "mike.ross@example.com", phone: "111222333", address: "101 St", profilePicture: "", city: "Kandy", subCity: "Sub 1", role: "Sub-City Manager", lastLogin: "2023-10-25" },
    ];
    // API functions
    async function saveCityAdminToBackend(adminData) {
        try {
            console.log('Sending to backend:', adminData);
            const superAdminUsername = "superadmin@google.com";
            const superAdminPassword = "Temp@123";
            const response = await fetch(`${API_BASE_URL}/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Basic ' + btoa(`${superAdminUsername}:${superAdminPassword}`)
                },
                body: JSON.stringify(adminData)
            });
            if (response.ok) {
                const result = await response.json();
                console.log('Success:', result);
                return result.id; // <-- get backend ID
            }
            else {
                console.error('Backend error:', response.status, await response.text());
                return null;
            }
        }
        catch (error) {
            console.error('Network error:', error);
            return null;
        }
    }
    async function getAllCityAdminsFromBackend() {
        try {
            const response = await fetch(`${API_BASE_URL}/all`);
            if (response.ok) {
                const cityAdmins = await response.json();
                console.log('Loaded from backend:', cityAdmins);
                return cityAdmins.map(admin => {
                    var _a, _b;
                    return ({
                        id: admin.id, // <-- keep backend id
                        firstName: ((_a = admin.fullName) === null || _a === void 0 ? void 0 : _a.split(' ')[0]) || '',
                        lastName: ((_b = admin.fullName) === null || _b === void 0 ? void 0 : _b.split(' ').slice(1).join(' ')) || '',
                        email: admin.email,
                        phone: admin.phoneNumber,
                        address: admin.address,
                        profilePicture: "",
                        city: admin.cityAssigned,
                        subCity: "",
                        role: "City Admin",
                        lastLogin: new Date().toISOString().split("T")[0]
                    });
                });
            }
            return [];
        }
        catch (error) {
            console.error('Error loading from backend:', error);
            return [];
        }
    }
    async function deleteCityAdminFromBackend(id) {
        try {
            const superAdminUsername = "superadmin@google.com";
            const superAdminPassword = "Temp@123";
            const response = await fetch(`${API_BASE_URL}/delete/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': 'Basic ' + btoa(`${superAdminUsername}:${superAdminPassword}`)
                }
            });
            return response.ok;
        }
        catch (error) {
            console.error('Failed to delete from backend:', error);
            return false;
        }
    }
    async function updateCityAdminInBackend(user) {
        var _a;
        if (!user.id) {
            console.error("❌ Missing ID for update");
            return false;
        }
        try {
            const superAdminUsername = "superadmin@google.com";
            const superAdminPassword = "Temp@123";
            // Fetch the existing City Admin first (to preserve required fields like nic, dob, etc.)
            const existingRes = await fetch(`${API_BASE_URL}/${user.id}`, {
                headers: {
                    'Authorization': 'Basic ' + btoa(`${superAdminUsername}:${superAdminPassword}`)
                }
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
                firstLogin: (_a = existing.firstLogin) !== null && _a !== void 0 ? _a : false
            };
            const response = await fetch(`${API_BASE_URL}/update/${user.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Basic " + btoa(`${superAdminUsername}:${superAdminPassword}`)
                },
                body: JSON.stringify(updatedAdmin)
            });
            if (response.ok) {
                console.log("✅ Successfully updated City Admin:", updatedAdmin);
                return true;
            }
            else {
                console.error("❌ Backend update failed:", response.status, await response.text());
                return false;
            }
        }
        catch (error) {
            console.error("🔥 Update failed due to network or JSON issue:", error);
            return false;
        }
    }
    const modal = document.getElementById("userModal");
    const closeModalBtn = document.getElementById("closeModalBtn");
    const modalForm = document.getElementById("modalForm");
    const modalProfilePicture = document.getElementById("modalProfilePicture");
    const modalFirstName = document.getElementById("modalFirstName");
    const modalLastName = document.getElementById("modalLastName");
    const modalEmail = document.getElementById("modalEmail");
    const modalPhone = document.getElementById("modalPhone");
    const modalAddress = document.getElementById("modalAddress");
    const modalCity = document.getElementById("modalCity");
    const modalSubCity = document.getElementById("modalSubCity");
    const modalRole = document.getElementById("modalRole");
    const modalDeleteBtn = document.getElementById("modalDeleteBtn");
    const modalSaveBtn = document.getElementById("modalSaveBtn");
    function renderTable(data) {
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
                const target = e.target;
                if (target.classList.contains("delete-btn"))
                    return;
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
                    }
                    else {
                        showPopup("Error ❌", "Failed to delete from backend!", false);
                    }
                }
                else {
                    users.splice(users.indexOf(userToDelete), 1);
                    renderTable(users);
                }
            });
        });
    }
    function openModal(user) {
        modalFirstName.value = user.firstName;
        modalLastName.value = user.lastName;
        modalEmail.value = user.email;
        modalPhone.value = user.phone;
        modalAddress.value = user.address;
        if (user.role === "City Admin") {
            modalCity.value = user.city; // set selected city
            modalCity.disabled = false; // allow editing
            modalCity.style.display = "block";
        }
        else {
            modalCity.style.display = "none"; // hide for non-admins
        }
        modalSubCity.value = user.subCity;
        modalRole.value = user.role;
        modalProfilePicture.innerHTML = user.profilePicture ? `<img src="${user.profilePicture}" class="w-20 h-20 rounded-full"/>` : `<span class="material-symbols-outlined text-4xl">person</span>`;
        modalCity.style.display = (user.role === "Citizen") ? "none" : "block";
        modalSubCity.style.display = (user.role === "Citizen") ? "none" : "block";
        modalSubCity.disabled = (user.role === "City Admin");
        modalForm.querySelectorAll("input").forEach(inp => {
            const inputEl = inp;
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
            }
            else {
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
                }
                else {
                    showPopup("Error ❌", "Failed to update City Admin in backend!", false);
                }
            }
            modal.classList.add("hidden");
        };
    }
    closeModalBtn.addEventListener("click", () => modal.classList.add("hidden"));
    renderTable(users);
    // Add City Admin
    const addBtn = document.getElementById("addCityAdminBtn");
    const formDiv = document.getElementById("addCityAdminForm");
    const cancelBtn = document.getElementById("cancelBtn");
    const form = document.getElementById("cityAdminForm");
    addBtn.addEventListener("click", () => formDiv.classList.toggle("hidden"));
    cancelBtn.addEventListener("click", () => formDiv.classList.add("hidden"));
    function validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
    function validatePhone(phone) {
        return /^0(7[0-8])[0-9]{7}$/.test(phone.trim());
    }
    function validateNIC(nic) {
        return /^(?:\d{9}[vVxX]|\d{12})$/.test(nic.trim());
    }
    function validatePassword(password) {
        return /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,}$/.test(password);
    }
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const fullName = document.getElementById("fullName").value.trim();
        const nic = document.getElementById("nic").value.trim();
        const email = document.getElementById("email").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const address = document.getElementById("address").value.trim();
        const dob = document.getElementById("dob").value.trim();
        const city = document.getElementById("city").value.trim();
        const password = document.getElementById("password").value;
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
            alert("Password must be at least 6 characters, include a number and a special character!");
            return;
        }
        const cityAdminData = {
            fullName,
            nic,
            email,
            phoneNumber: phone,
            address,
            dob,
            cityAssigned: city,
            password,
            role: "CITY_ADMIN",
            firstLogin: true
        };
        const backendId = await saveCityAdminToBackend(cityAdminData);
        users.push({
            id: backendId || undefined,
            firstName: fullName.split(" ")[0] || "",
            lastName: fullName.split(" ")[1] || "",
            email,
            phone: phone,
            address: address,
            profilePicture: "",
            city: city,
            subCity: "",
            role: "City Admin",
            lastLogin: new Date().toISOString().split("T")[0],
        });
        renderTable(users);
        form.reset();
        formDiv.classList.add("hidden");
        if (backendId) {
            showPopup("Success ✅", "City Admin added successfully to backend!", true);
        }
        else {
            showPopup("Error ❌", "Failed to save City Admin to backend. Please check console.", false);
        }
    });
    // Load existing admins from backend on startup
    getAllCityAdminsFromBackend().then(backendAdmins => {
        if (backendAdmins.length > 0) {
            users = users.filter(user => user.role !== "City Admin").concat(backendAdmins);
            renderTable(users);
        }
    });
    function showPopup(title, message, isSuccess) {
        const popup = document.getElementById('popupMessage');
        const titleEl = document.getElementById('popupTitle');
        const textEl = document.getElementById('popupText');
        const content = popup.querySelector('.popup-content');
        titleEl.textContent = title;
        textEl.textContent = message;
        content.classList.remove('success', 'error');
        content.classList.add(isSuccess ? 'success' : 'error');
        popup.classList.remove('hidden');
        setTimeout(() => popup.classList.add('hidden'), 2500);
    }
    (_a = document.getElementById('popupClose')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', () => {
        var _a;
        (_a = document.getElementById('popupMessage')) === null || _a === void 0 ? void 0 : _a.classList.add('hidden');
    });
});
//# sourceMappingURL=cityTypescript.js.map