var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
document.addEventListener("DOMContentLoaded", function () {
    var _a;
    console.log("User Management (TS) Loaded ✅");
    var htmlElement = document.documentElement;
    var tbody = document.getElementById("userTableBody");
    var API_BASE_URL = "http://localhost:8080/api/city-admins";
    // 🌓 Dark mode toggle with 'D' key (ignores typing)
    document.addEventListener("keydown", function (e) {
        var _a;
        var tag = (((_a = document.activeElement) === null || _a === void 0 ? void 0 : _a.tagName) || "").toLowerCase();
        if (e.key.toLowerCase() === "d" && tag !== "input" && tag !== "textarea") {
            htmlElement.classList.toggle("dark");
        }
    });
    // 🧍 Dummy users for display (you can remove later)
    var users = [];
    // 🧩 API Functions
    function saveCityAdminToBackend(adminData) {
        return __awaiter(this, void 0, void 0, function () {
            var superAdminUsername, superAdminPassword, response, result, _a, _b, _c, error_1;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 6, , 7]);
                        console.log("Sending to backend:", adminData);
                        superAdminUsername = "superadmin@google.com";
                        superAdminPassword = "Temp@123";
                        return [4 /*yield*/, fetch("".concat(API_BASE_URL, "/add"), {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                    "Authorization": "Basic " + btoa("".concat(superAdminUsername, ":").concat(superAdminPassword)),
                                },
                                body: JSON.stringify(adminData),
                            })];
                    case 1:
                        response = _d.sent();
                        if (!response.ok) return [3 /*break*/, 3];
                        return [4 /*yield*/, response.json()];
                    case 2:
                        result = _d.sent();
                        console.log("✅ Added:", result);
                        return [2 /*return*/, result.id];
                    case 3:
                        _b = (_a = console).error;
                        _c = ["❌ Backend error:", response.status];
                        return [4 /*yield*/, response.text()];
                    case 4:
                        _b.apply(_a, _c.concat([_d.sent()]));
                        return [2 /*return*/, null];
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        error_1 = _d.sent();
                        console.error("🔥 Network error:", error_1);
                        return [2 /*return*/, null];
                    case 7: return [2 /*return*/];
                }
            });
        });
    }
    function getAllCityAdminsFromBackend() {
        return __awaiter(this, void 0, void 0, function () {
            var response, cityAdmins, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, fetch("".concat(API_BASE_URL, "/all"))];
                    case 1:
                        response = _a.sent();
                        if (!response.ok) return [3 /*break*/, 3];
                        return [4 /*yield*/, response.json()];
                    case 2:
                        cityAdmins = _a.sent();
                        console.log("Loaded from backend:", cityAdmins);
                        return [2 /*return*/, cityAdmins.map(function (admin) {
                                var _a, _b;
                                return ({
                                    id: admin.id,
                                    firstName: ((_a = admin.fullName) === null || _a === void 0 ? void 0 : _a.split(" ")[0]) || "",
                                    lastName: ((_b = admin.fullName) === null || _b === void 0 ? void 0 : _b.split(" ").slice(1).join(" ")) || "",
                                    email: admin.email,
                                    phone: admin.phoneNumber,
                                    address: admin.address,
                                    profilePicture: "",
                                    city: admin.cityAssigned,
                                    subCity: "",
                                    role: "City Admin",
                                    lastLogin: new Date().toISOString().split("T")[0],
                                });
                            })];
                    case 3: return [2 /*return*/, []];
                    case 4:
                        error_2 = _a.sent();
                        console.error("Error loading from backend:", error_2);
                        return [2 /*return*/, []];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }
    function deleteCityAdminFromBackend(id) {
        return __awaiter(this, void 0, void 0, function () {
            var superAdminUsername, superAdminPassword, response, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        superAdminUsername = "superadmin@google.com";
                        superAdminPassword = "Temp@123";
                        return [4 /*yield*/, fetch("".concat(API_BASE_URL, "/delete/").concat(id), {
                                method: "DELETE",
                                headers: {
                                    "Authorization": "Basic " + btoa("".concat(superAdminUsername, ":").concat(superAdminPassword)),
                                },
                            })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.ok];
                    case 2:
                        error_3 = _a.sent();
                        console.error("Failed to delete from backend:", error_3);
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    }
    function updateCityAdminInBackend(user) {
        return __awaiter(this, void 0, void 0, function () {
            var superAdminUsername, superAdminPassword, existingRes, existing, updatedAdmin, response, _a, _b, _c, error_4;
            var _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        if (!user.id) {
                            console.error("❌ Missing ID for update");
                            return [2 /*return*/, false];
                        }
                        _e.label = 1;
                    case 1:
                        _e.trys.push([1, 8, , 9]);
                        superAdminUsername = "superadmin@google.com";
                        superAdminPassword = "Temp@123";
                        return [4 /*yield*/, fetch("".concat(API_BASE_URL, "/").concat(user.id), {
                                headers: {
                                    "Authorization": "Basic " + btoa("".concat(superAdminUsername, ":").concat(superAdminPassword)),
                                },
                            })];
                    case 2:
                        existingRes = _e.sent();
                        if (!existingRes.ok) {
                            console.error("❌ Failed to fetch existing City Admin before update");
                            return [2 /*return*/, false];
                        }
                        return [4 /*yield*/, existingRes.json()];
                    case 3:
                        existing = _e.sent();
                        updatedAdmin = {
                            id: user.id,
                            fullName: "".concat(user.firstName, " ").concat(user.lastName).trim(),
                            nic: existing.nic || "",
                            email: user.email,
                            phoneNumber: user.phone,
                            address: user.address,
                            dob: existing.dob || "",
                            cityAssigned: user.city,
                            password: existing.password || "",
                            role: "CITY_ADMIN",
                            firstLogin: (_d = existing.firstLogin) !== null && _d !== void 0 ? _d : false,
                        };
                        return [4 /*yield*/, fetch("".concat(API_BASE_URL, "/update/").concat(user.id), {
                                method: "PUT",
                                headers: {
                                    "Content-Type": "application/json",
                                    "Authorization": "Basic " + btoa("".concat(superAdminUsername, ":").concat(superAdminPassword)),
                                },
                                body: JSON.stringify(updatedAdmin),
                            })];
                    case 4:
                        response = _e.sent();
                        if (!response.ok) return [3 /*break*/, 5];
                        console.log("✅ Updated:", updatedAdmin);
                        return [2 /*return*/, true];
                    case 5:
                        _b = (_a = console).error;
                        _c = ["❌ Update failed:", response.status];
                        return [4 /*yield*/, response.text()];
                    case 6:
                        _b.apply(_a, _c.concat([_e.sent()]));
                        return [2 /*return*/, false];
                    case 7: return [3 /*break*/, 9];
                    case 8:
                        error_4 = _e.sent();
                        console.error("🔥 Update failed:", error_4);
                        return [2 /*return*/, false];
                    case 9: return [2 /*return*/];
                }
            });
        });
    }
    // 🧭 Modal Elements
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
    // 🧾 Render table
    function renderTable(data) {
        var _this = this;
        tbody.innerHTML = data
            .filter(function (u) { return u.role !== "Super Admin"; })
            .map(function (user, index) { return "\n        <tr class=\"border-t cursor-pointer\" data-index=\"".concat(index, "\">\n          <td class=\"p-2\">").concat(user.firstName, " ").concat(user.lastName, "</td>\n          <td class=\"p-2\">").concat(user.email, "</td>\n          <td class=\"p-2\">").concat(user.role, "</td>\n          <td class=\"p-2\">").concat(user.lastLogin, "</td>\n          <td class=\"p-2\">\n            ").concat((user.role === "Citizen" || user.role === "City Admin") ? '<button class="text-red-600 hover:text-red-800 delete-btn">🗑</button>' : '', "\n          </td>\n        </tr>\n      "); }).join("");
        tbody.querySelectorAll("tr").forEach(function (row) {
            row.addEventListener("click", function (e) {
                var target = e.target;
                if (target.classList.contains("delete-btn"))
                    return;
                var idx = parseInt(row.dataset.index || "0");
                openModal(users.filter(function (u) { return u.role !== "Super Admin"; })[idx]);
            });
        });
        tbody.querySelectorAll(".delete-btn").forEach(function (btn, idx) {
            btn.addEventListener("click", function (e) { return __awaiter(_this, void 0, void 0, function () {
                var filteredUsers, userToDelete, deleted;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            e.stopPropagation();
                            filteredUsers = users.filter(function (u) { return u.role !== "Super Admin"; });
                            userToDelete = filteredUsers[idx];
                            if (!userToDelete.id) return [3 /*break*/, 2];
                            return [4 /*yield*/, deleteCityAdminFromBackend(userToDelete.id)];
                        case 1:
                            deleted = _a.sent();
                            if (deleted) {
                                users.splice(users.indexOf(userToDelete), 1);
                                renderTable(users);
                                showPopup("Success ✅", "City Admin deleted successfully!", true);
                            }
                            else {
                                showPopup("Error ❌", "Failed to delete from backend!", false);
                            }
                            return [3 /*break*/, 3];
                        case 2:
                            users.splice(users.indexOf(userToDelete), 1);
                            renderTable(users);
                            _a.label = 3;
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
        });
    }
    function openModal(user) {
        var _this = this;
        modalFirstName.value = user.firstName;
        modalLastName.value = user.lastName;
        modalEmail.value = user.email;
        modalPhone.value = user.phone;
        modalAddress.value = user.address;
        if (user.role === "City Admin") {
            modalCity.value = user.city;
            modalCity.disabled = false;
            modalCity.style.display = "block";
        }
        else {
            modalCity.style.display = "none";
        }
        modalSubCity.value = user.subCity;
        modalRole.value = user.role;
        modalProfilePicture.innerHTML = user.profilePicture
            ? "<img src=\"".concat(user.profilePicture, "\" class=\"w-20 h-20 rounded-full\"/>")
            : "<span class=\"material-symbols-outlined text-4xl\">person</span>";
        modalSubCity.style.display = (user.role === "Citizen") ? "none" : "block";
        modalSubCity.disabled = (user.role === "City Admin");
        modalForm.querySelectorAll("input").forEach(function (inp) {
            var inputEl = inp;
            inputEl.readOnly = !(user.role === "City Admin" && inputEl.id !== "modalRole");
        });
        modalSaveBtn.style.display = (user.role === "City Admin") ? "inline-block" : "none";
        modalDeleteBtn.style.display = (user.role === "Citizen" || user.role === "City Admin") ? "inline-block" : "none";
        modal.classList.remove("hidden");
        modalDeleteBtn.onclick = function () { return __awaiter(_this, void 0, void 0, function () {
            var backendDeleted;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!user.id) {
                            showPopup("Error ❌", "City Admin ID not found. Cannot delete.", false);
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, deleteCityAdminFromBackend(user.id)];
                    case 1:
                        backendDeleted = _a.sent();
                        if (backendDeleted) {
                            users.splice(users.indexOf(user), 1);
                            renderTable(users);
                            showPopup("Success ✅", "City Admin deleted successfully!", true);
                        }
                        else {
                            showPopup("Error ❌", "Failed to delete City Admin from backend!", false);
                        }
                        modal.classList.add("hidden");
                        return [2 /*return*/];
                }
            });
        }); };
        modalForm.onsubmit = function (e) { return __awaiter(_this, void 0, void 0, function () {
            var backendUpdated;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        e.preventDefault();
                        if (!(user.role === "City Admin")) return [3 /*break*/, 2];
                        user.firstName = modalFirstName.value;
                        user.lastName = modalLastName.value;
                        user.email = modalEmail.value;
                        user.phone = modalPhone.value;
                        user.address = modalAddress.value;
                        user.city = modalCity.value;
                        user.subCity = modalSubCity.value;
                        return [4 /*yield*/, updateCityAdminInBackend(user)];
                    case 1:
                        backendUpdated = _a.sent();
                        if (backendUpdated) {
                            showPopup("Success ✅", "City Admin updated successfully!", true);
                            renderTable(users);
                        }
                        else {
                            showPopup("Error ❌", "Failed to update City Admin in backend!", false);
                        }
                        _a.label = 2;
                    case 2:
                        modal.classList.add("hidden");
                        return [2 /*return*/];
                }
            });
        }); };
    }
    closeModalBtn.addEventListener("click", function () { return modal.classList.add("hidden"); });
    renderTable(users);
    // 🏙 Add City Admin
    var addBtn = document.getElementById("addCityAdminBtn");
    var formDiv = document.getElementById("addCityAdminForm");
    var cancelBtn = document.getElementById("cancelBtn");
    var form = document.getElementById("cityAdminForm");
    addBtn.addEventListener("click", function () { return formDiv.classList.toggle("hidden"); });
    cancelBtn.addEventListener("click", function () { return formDiv.classList.add("hidden"); });
    // 🧠 Validations
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
    // 📝 Form submission
    form.addEventListener("submit", function (e) { return __awaiter(_this, void 0, void 0, function () {
        var fullName, nic, email, phone, address, dob, city, password, cityAdminData, backendId;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    fullName = document.getElementById("fullName").value.trim();
                    nic = document.getElementById("nic").value.trim();
                    email = document.getElementById("email").value.trim();
                    phone = document.getElementById("phone").value.trim();
                    address = document.getElementById("address").value.trim();
                    dob = document.getElementById("dob").value.trim();
                    city = document.getElementById("city").value.trim();
                    password = document.getElementById("password").value;
                    if (!fullName || !nic || !email || !phone || !address || !dob || !city || !password) {
                        alert("All fields are required!");
                        return [2 /*return*/];
                    }
                    if (!validateEmail(email)) {
                        alert("Invalid email format!");
                        return [2 /*return*/];
                    }
                    if (!validatePhone(phone)) {
                        alert("Phone number must be 10 digits & valid!");
                        return [2 /*return*/];
                    }
                    if (!validateNIC(nic)) {
                        alert("Invalid NIC format!");
                        return [2 /*return*/];
                    }
                    if (!validatePassword(password)) {
                        alert("Password must include number + special character!");
                        return [2 /*return*/];
                    }
                    cityAdminData = {
                        fullName: fullName,
                        nic: nic,
                        email: email,
                        phoneNumber: phone,
                        address: address,
                        dob: dob,
                        cityAssigned: city,
                        password: password,
                        role: "CITY_ADMIN",
                        firstLogin: true,
                    };
                    return [4 /*yield*/, saveCityAdminToBackend(cityAdminData)];
                case 1:
                    backendId = _a.sent();
                    users.push({
                        id: backendId || undefined,
                        firstName: fullName.split(" ")[0] || "",
                        lastName: fullName.split(" ").slice(1).join(" "),
                        email: email,
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
                        showPopup("Success ✅", "City Admin added successfully!", true);
                    }
                    else {
                        showPopup("Error ❌", "Failed to save City Admin to backend!", false);
                    }
                    return [2 /*return*/];
            }
        });
    }); });
    // 🧩 Load from backend
    getAllCityAdminsFromBackend().then(function (backendAdmins) {
        if (backendAdmins.length > 0) {
            users = users.filter(function (user) { return user.role !== "City Admin"; }).concat(backendAdmins);
            renderTable(users);
        }
    });
    // 💬 Popup
    function showPopup(title, message, isSuccess) {
        var popup = document.getElementById("popupMessage");
        var titleEl = document.getElementById("popupTitle");
        var textEl = document.getElementById("popupText");
        var content = popup.querySelector(".popup-content");
        titleEl.textContent = title;
        textEl.textContent = message;
        content.classList.remove("success", "error");
        content.classList.add(isSuccess ? "success" : "error");
        popup.classList.remove("hidden");
        setTimeout(function () { return popup.classList.add("hidden"); }, 2500);
    }
    (_a = document.getElementById("popupClose")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", function () {
        var _a;
        (_a = document.getElementById("popupMessage")) === null || _a === void 0 ? void 0 : _a.classList.add("hidden");
    });
});
