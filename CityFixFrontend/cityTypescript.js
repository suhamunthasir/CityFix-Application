document.addEventListener("DOMContentLoaded", function () {
    console.log("User Management (TS) Loaded ✅");
    var htmlElement = document.documentElement;
    var tbody = document.getElementById("userTableBody");
    // Dark mode toggle using 'D', ignore when typing
    document.addEventListener("keydown", function (e) {
        var _a;
        var tag = (((_a = document.activeElement) === null || _a === void 0 ? void 0 : _a.tagName) || "").toLowerCase();
        if (e.key.toLowerCase() === "d" && tag !== "input" && tag !== "textarea") {
            htmlElement.classList.toggle("dark");
        }
    });
    var users = [
        { firstName: "John", lastName: "Doe", email: "john.doe@example.com", phone: "123456789", address: "123 St", profilePicture: "", city: "Colombo", subCity: "", role: "City Admin", lastLogin: "2023-10-27" },
        { firstName: "Jane", lastName: "Smith", email: "jane.smith@example.com", phone: "987654321", address: "456 St", profilePicture: "", city: "Galle", subCity: "", role: "City Admin", lastLogin: "2023-10-26" },
        { firstName: "Citizen", lastName: "Kane", email: "citizen.kane@example.com", phone: "555666777", address: "789 St", profilePicture: "", city: "", subCity: "", role: "Citizen", lastLogin: "2023-10-24" },
        { firstName: "Mike", lastName: "Ross", email: "mike.ross@example.com", phone: "111222333", address: "101 St", profilePicture: "", city: "Kandy", subCity: "Sub 1", role: "Sub-City Manager", lastLogin: "2023-10-25" },
    ];
    var modal = document.getElementById("userModal");
    var closeModalBtn = document.getElementById("closeModalBtn");
    var modalForm = document.getElementById("modalForm");
    var modalProfilePicture = document.getElementById("modalProfilePicture");
    var modalFirstName = document.getElementById("modalFirstName");
    var modalLastName = document.getElementById("modalLastName");
    var modalEmail = document.getElementById("modalEmail");
    var modalPhone = document.getElementById("modalPhone");
    var modalAddress = document.getElementById("modalAddress");
    var modalCity = document.getElementById("modalCity");
    var modalSubCity = document.getElementById("modalSubCity");
    var modalRole = document.getElementById("modalRole");
    var modalDeleteBtn = document.getElementById("modalDeleteBtn");
    var modalSaveBtn = document.getElementById("modalSaveBtn");
    function renderTable(data) {
        tbody.innerHTML = data
            .filter(function (u) { return u.role !== "Super Admin"; })
            .map(function (user, index) { return "\n        <tr class=\"border-t cursor-pointer\" data-index=\"".concat(index, "\">\n          <td class=\"p-2\">").concat(user.firstName, " ").concat(user.lastName, "</td>\n          <td class=\"p-2\">").concat(user.email, "</td>\n          <td class=\"p-2\">").concat(user.role, "</td>\n          <td class=\"p-2\">").concat(user.lastLogin, "</td>\n          <td class=\"p-2\">\n            ").concat((user.role === "Citizen" || user.role === "City Admin") ? '<button class="text-red-600 hover:text-red-800 delete-btn">🗑</button>' : '', "\n          </td>\n        </tr>\n      "); }).join("");
        // Attach click to show modal
        tbody.querySelectorAll("tr").forEach(function (row) {
            row.addEventListener("click", function (e) {
                var target = e.target;
                if (target.classList.contains("delete-btn"))
                    return;
                var idx = parseInt(row.dataset.index || "0");
                openModal(users.filter(function (u) { return u.role !== "Super Admin"; })[idx]);
            });
        });
        // Delete from table
        tbody.querySelectorAll(".delete-btn").forEach(function (btn, idx) {
            btn.addEventListener("click", function (e) {
                e.stopPropagation();
                var filteredUsers = users.filter(function (u) { return u.role !== "Super Admin"; });
                var userToDelete = filteredUsers[idx];
                var actualIndex = users.indexOf(userToDelete);
                users.splice(actualIndex, 1);
                renderTable(users);
            });
        });
    }
    function openModal(user) {
        modalFirstName.value = user.firstName;
        modalLastName.value = user.lastName;
        modalEmail.value = user.email;
        modalPhone.value = user.phone;
        modalAddress.value = user.address;
        modalCity.value = user.city;
        modalSubCity.value = user.subCity;
        modalRole.value = user.role;
        modalProfilePicture.innerHTML = user.profilePicture ? "<img src=\"".concat(user.profilePicture, "\" class=\"w-20 h-20 rounded-full\"/>") : "<span class=\"material-symbols-outlined text-4xl\">person</span>";
        // Show/hide city & sub-city
        modalCity.style.display = (user.role === "Citizen") ? "none" : "block";
        modalSubCity.style.display = (user.role === "Citizen") ? "none" : "block";
        // Role-based input behavior
        modalForm.querySelectorAll("input").forEach(function (inp) {
            var inputEl = inp;
            inputEl.readOnly = !(user.role === "City Admin" && inputEl.id !== "modalRole");
        });
        modalSaveBtn.style.display = (user.role === "City Admin") ? "inline-block" : "none";
        modalDeleteBtn.style.display = (user.role === "Citizen" || user.role === "City Admin") ? "inline-block" : "none";
        modal.classList.remove("hidden");
        modalDeleteBtn.onclick = function () {
            var idx = users.indexOf(user);
            users.splice(idx, 1);
            renderTable(users);
            modal.classList.add("hidden");
        };
        modalForm.onsubmit = function (e) {
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
    closeModalBtn.addEventListener("click", function () { return modal.classList.add("hidden"); });
    renderTable(users);
    // Add City Admin
    var addBtn = document.getElementById("addCityAdminBtn");
    var formDiv = document.getElementById("addCityAdminForm");
    var cancelBtn = document.getElementById("cancelBtn");
    var form = document.getElementById("cityAdminForm");
    addBtn.addEventListener("click", function () { return formDiv.classList.toggle("hidden"); });
    cancelBtn.addEventListener("click", function () { return formDiv.classList.add("hidden"); });
    form.addEventListener("submit", function (e) {
        e.preventDefault();
        var name = document.getElementById("fullName").value;
        var email = document.getElementById("email").value;
        users.push({
            firstName: name.split(" ")[0] || "",
            lastName: name.split(" ")[1] || "",
            email: email,
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
