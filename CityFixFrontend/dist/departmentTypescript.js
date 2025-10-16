"use strict";
document.addEventListener("DOMContentLoaded", () => {
    const addDeptBtn = document.getElementById("addDepartmentBtn");
    const addDeptForm = document.getElementById("addDepartmentForm");
    const cancelDeptBtn = document.getElementById("cancelDeptBtn");
    const deptLogoInput = document.getElementById("deptLogo");
    const logoPreview = document.getElementById("logoPreview");
    // Toggle form visibility
    addDeptBtn.addEventListener("click", () => {
        addDeptForm.classList.remove("hidden");
        addDeptForm.classList.add("animate-fadeIn");
        addDeptForm.scrollIntoView({ behavior: "smooth" });
    });
    // Cancel button hides the form
    cancelDeptBtn.addEventListener("click", () => {
        addDeptForm.classList.add("hidden");
    });
    // Logo preview
    deptLogoInput.addEventListener("change", (e) => {
        const target = e.target;
        if (target.files && target.files[0]) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                var _a;
                logoPreview.innerHTML = `<img src="${(_a = ev.target) === null || _a === void 0 ? void 0 : _a.result}" class="w-20 h-20 object-cover rounded" />`;
            };
            reader.readAsDataURL(target.files[0]);
        }
    });
});
// Optional: simple fade-in animation with Tailwind
const style = document.createElement("style");
style.innerHTML = `
  @keyframes fadeIn {
    0% { opacity: 0; transform: translateY(-10px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  .animate-fadeIn { animation: fadeIn 0.3s ease-in-out; }
`;
document.head.appendChild(style);
//# sourceMappingURL=departmentTypescript.js.map