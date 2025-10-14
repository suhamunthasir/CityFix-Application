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
var API_BASE_URL = "http://localhost:8080/api/departments";
var departmentContainer = document.getElementById("departmentContainer");
var addBtn = document.getElementById("addDepartmentBtn");
// Load all departments
function loadDepartments() {
    return __awaiter(this, void 0, void 0, function () {
        var response, data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetch(API_BASE_URL)];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    departmentContainer.innerHTML = "";
                    data.forEach(function (dept) {
                        var card = document.createElement("div");
                        card.className = "bg-white p-6 rounded-lg shadow";
                        card.innerHTML = "\n      <div class=\"flex justify-between items-center mb-4\">\n        <h2 class=\"text-2xl font-bold\">".concat(dept.name, "</h2>\n        <div class=\"flex gap-2\">\n          <button class=\"text-blue-600 hover:underline edit-btn\" data-id=\"").concat(dept.id, "\">Edit</button>\n          <button class=\"text-red-600 hover:underline delete-btn\" data-id=\"").concat(dept.id, "\">Delete</button>\n        </div>\n      </div>\n      <p><strong>Email:</strong> ").concat(dept.email, "</p>\n      <p class=\"mt-2\">").concat(dept.description, "</p>\n      ").concat(dept.logo ? "<img src=\"/uploads/department/".concat(dept.logo, "\" class=\"mt-4 w-24 h-24 object-cover rounded-lg\"/>") : "", "\n    ");
                        departmentContainer.appendChild(card);
                    });
                    attachEventListeners();
                    return [2 /*return*/];
            }
        });
    });
}
// Add/Edit/Delete listeners
function attachEventListeners() {
    var _this = this;
    document.querySelectorAll(".delete-btn").forEach(function (btn) {
        btn.addEventListener("click", function (e) { return __awaiter(_this, void 0, void 0, function () {
            var id;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        id = e.target.getAttribute("data-id");
                        if (!confirm("Are you sure?")) return [3 /*break*/, 2];
                        return [4 /*yield*/, fetch("".concat(API_BASE_URL, "/").concat(id), { method: "DELETE" })];
                    case 1:
                        _a.sent();
                        loadDepartments();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        }); });
    });
    document.querySelectorAll(".edit-btn").forEach(function (btn) {
        btn.addEventListener("click", function (e) {
            var id = e.target.getAttribute("data-id");
            showForm("update", Number(id));
        });
    });
}
// Add Department button
addBtn.addEventListener("click", function () { return showForm("add"); });
// Show Add/Edit form
function showForm(mode, id) {
    return __awaiter(this, void 0, void 0, function () {
        var department, response, form;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    department = { name: "", email: "", description: "" };
                    if (!(mode === "update" && id)) return [3 /*break*/, 3];
                    return [4 /*yield*/, fetch("".concat(API_BASE_URL, "/").concat(id))];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    department = _a.sent();
                    _a.label = 3;
                case 3:
                    departmentContainer.innerHTML = "\n    <form id=\"departmentForm\" class=\"bg-white p-6 rounded-lg shadow space-y-4\">\n      <h2 class=\"text-2xl font-bold mb-4\">".concat(mode === "add" ? "Add" : "Update", " Department</h2>\n\n      <div>\n        <label class=\"block text-sm font-medium\">Department Name</label>\n        <input type=\"text\" id=\"name\" value=\"").concat(department.name || "", "\" required\n          class=\"mt-1 w-full border rounded-lg px-3 py-2\">\n      </div>\n\n      <div>\n        <label class=\"block text-sm font-medium\">Email</label>\n        <input type=\"email\" id=\"email\" value=\"").concat(department.email || "", "\" required\n          class=\"mt-1 w-full border rounded-lg px-3 py-2\">\n      </div>\n\n      <div>\n        <label class=\"block text-sm font-medium\">Description</label>\n        <textarea id=\"description\" rows=\"3\" class=\"mt-1 w-full border rounded-lg px-3 py-2\">").concat(department.description || "", "</textarea>\n      </div>\n\n      <div>\n        <label class=\"block text-sm font-medium\">Logo</label>\n        <input type=\"file\" id=\"logo\" class=\"mt-1 block w-full border rounded-lg px-3 py-2\">\n      </div>\n\n      <div class=\"flex gap-2\">\n        <button type=\"submit\" class=\"px-4 py-2 bg-primary text-white rounded-lg\">").concat(mode === "add" ? "Save" : "Update", "</button>\n        <button type=\"button\" id=\"cancelBtn\" class=\"px-4 py-2 border rounded-lg\">Cancel</button>\n      </div>\n    </form>\n  ");
                    document.getElementById("cancelBtn").addEventListener("click", loadDepartments);
                    form = document.getElementById("departmentForm");
                    form.addEventListener("submit", function (e) { return __awaiter(_this, void 0, void 0, function () {
                        var formData, deptData, logoInput, method, url;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    e.preventDefault();
                                    formData = new FormData();
                                    deptData = {
                                        name: document.getElementById("name").value,
                                        email: document.getElementById("email").value,
                                        description: document.getElementById("description").value,
                                    };
                                    formData.append("department", new Blob([JSON.stringify(deptData)], { type: "application/json" }));
                                    logoInput = document.getElementById("logo");
                                    if (logoInput.files && logoInput.files[0]) {
                                        formData.append("logo", logoInput.files[0]);
                                    }
                                    method = mode === "add" ? "POST" : "PUT";
                                    url = mode === "add" ? API_BASE_URL : "".concat(API_BASE_URL, "/").concat(id);
                                    return [4 /*yield*/, fetch(url, { method: method, body: formData })];
                                case 1:
                                    _a.sent();
                                    loadDepartments();
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    return [2 /*return*/];
            }
        });
    });
}
// Initial load
loadDepartments();
