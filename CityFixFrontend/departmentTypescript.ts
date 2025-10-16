document.addEventListener("DOMContentLoaded", () => {
  const addDeptBtn = document.getElementById("addDepartmentBtn") as HTMLButtonElement;
  const addDeptForm = document.getElementById("addDepartmentForm") as HTMLDivElement;
  const cancelDeptBtn = document.getElementById("cancelDeptBtn") as HTMLButtonElement;
  const deptLogoInput = document.getElementById("deptLogo") as HTMLInputElement;
  const logoPreview = document.getElementById("logoPreview") as HTMLDivElement;

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
  deptLogoInput.addEventListener("change", (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (target.files && target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        logoPreview.innerHTML = `<img src="${ev.target?.result}" class="w-20 h-20 object-cover rounded" />`;
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
