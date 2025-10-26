document.addEventListener("DOMContentLoaded", function() {
    // Password toggle
    const passwordField = document.getElementById('adminPassword');
    const toggleIcon = document.getElementById('toggleAdminPassword');
    toggleIcon.addEventListener('click', function() {
        if (passwordField.type === 'password') {
            passwordField.type = 'text';
            toggleIcon.textContent = '🔒';
        } else {
            passwordField.type = 'password';
            toggleIcon.textContent = '👁️';
        }
    });

    function validateEmail(email) { 
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); 
    }

    function showError(id){ document.getElementById(id).style.display='block'; }
    function hideError(id){ document.getElementById(id).style.display='none'; }

    const adminForm = document.getElementById('adminLoginForm');
    adminForm.addEventListener('submit', function(e){
        e.preventDefault();

        const role = document.getElementById('adminRole').value;
        const email = document.getElementById('adminEmail').value.trim();
        const password = document.getElementById('adminPassword').value.trim();
        let valid = true;

        if(!role){ showError('adminRoleError'); valid=false; } else { hideError('adminRoleError'); }
        if(!validateEmail(email)){ showError('adminEmailError'); valid=false; } else { hideError('adminEmailError'); }
        if(password===''){ showError('adminPasswordError'); valid=false; } else { hideError('adminPasswordError'); }

        if(!valid) return;

        // --- LOGIN HANDLER BY ROLE ---
        if(role === "SUPER_ADMIN"){
            const formData = new FormData();
            formData.append("username", email);
            formData.append("password", password);

            fetch("http://127.0.0.1:8080/api/auth/superadmin/login", {
                method: "POST",
                body: formData,
                credentials: "include"
            })
            .then(res => res.text())
            .then(text => {
                if(text === "SUCCESS"){
                    const superAdminData = {
                        id: "superadmin",
                        firstName: "Super",
                        lastName: "Admin",
                        email: email,
                        role: "SUPER_ADMIN"
                    };
                    localStorage.setItem("loggedInUser", JSON.stringify(superAdminData));
                    window.location.href = "city.html";
                } else {
                    alert("Invalid Super Admin credentials.");
                }
            })
            .catch(err => alert("Failed to connect to server: " + err.message));

        } // Assuming you already have email, password, role variables
if(role === "CITY_ADMIN") {
    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    fetch("http://127.0.0.1:8080/api/auth/cityadmin/login", {
        method: "POST",
        body: formData,
        credentials: "include"
    })
    .then(res => {
        if(res.status === 200) return res.json();
        else if(res.status === 401) throw new Error("Invalid City Admin credentials.");
        else throw new Error("Unexpected server error: " + res.status);
    })
   .then(admin => {
    const cityAdminData = {
        id: admin.id,
        firstName: admin.fullName.split(" ")[0],
        lastName: admin.fullName.split(" ")[1] || "",
        email: admin.email,
        role: "CITY_ADMIN",
        cityAssigned: admin.cityAssigned // now stored
    };
    localStorage.setItem("loggedInUser", JSON.stringify(cityAdminData));
    window.location.href = "cityManager.html";
})

    .catch(err => {
        alert(err.message);
    });
}
 else if (role === "DEPARTMENT_MANAGER") {
    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    fetch("http://localhost:8080/api/department-managers")
        .then(res => {
            if (res.status === 200) return res.json();
            else if (res.status === 401) throw new Error("Invalid Department Manager credentials.");
            else throw new Error("Unexpected server error: " + res.status);
        })
        .then(managers => {
            // Find the manager matching email and password
            const manager = managers.find(m => m.email === email && m.password === password);
            if (!manager) throw new Error("Invalid Department Manager credentials.");

            const managerData = {
                id: manager.id,
                firstName: manager.fullName.split(" ")[0],
                lastName: manager.fullName.split(" ")[1] || "",
                email: manager.email,
                role: "DEPARTMENT_MANAGER",
                department: manager.department,
                cityAssigned: manager.city || ""  // <-- now stored correctly
            };

            // Save to localStorage
            localStorage.setItem("loggedInUser", JSON.stringify(managerData));

            // Redirect to report management page
            window.location.href = "reportmanagement.html";
        })
        .catch(err => {
            alert(err.message);
        });
}

 
    });
});
