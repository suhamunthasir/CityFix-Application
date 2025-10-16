const API_URL = "http://localhost:8080/api/departments/save";

const form = document.getElementById("departmentForm") as HTMLFormElement;
const responseDiv = document.getElementById("response") as HTMLDivElement;

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = (document.getElementById("name") as HTMLInputElement).value;
    const description = (document.getElementById("description") as HTMLTextAreaElement).value;
    const email = (document.getElementById("email") as HTMLInputElement).value;
    const logoInput = document.getElementById("logo") as HTMLInputElement;
    const logoFile = logoInput.files ? logoInput.files[0] : null;

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    if (email) formData.append("email", email);
    if (logoFile) formData.append("logo", logoFile);

    try {
        const res = await fetch(API_URL, {
            method: "POST",
            body: formData
        });

        if (!res.ok) throw new Error("Failed to save department");

        const data = await res.json();
        responseDiv.textContent = `✅ Department saved: ${data.name}`;
        form.reset();
    } catch (err) {
        console.error(err);
        responseDiv.textContent = `❌ Error saving department`;
    }
});
