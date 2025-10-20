// Initialize map and variables
let map, marker;
let currentLat = 6.9271; // Default to Colombo
let currentLng = 79.8612;
let selectedCategory = '';
let uploadedPhotos = [];
let loggedInCitizen = null;
// ✅ Load logged-in user info and update header
function loadUserHeader() {
    const storedUser = localStorage.getItem("loggedInCitizen");
    const userAvatar = document.getElementById("user-avatar");
    const userName = document.getElementById("user-name");

    if (!storedUser) {
        alert("Please log in to access this page.");
        window.location.href = "signin.html";
        return;
    }

    try {
        const citizen = JSON.parse(storedUser);
        loggedInCitizen = citizen;

        // Set full name
        const fullName = `${citizen.firstName || ''} ${citizen.lastName || ''}`.trim();
        userName.textContent = fullName || 'User';

        // Clear previous avatar content
        userAvatar.innerHTML = '';

        // Set avatar
        if (citizen.profilePicture) {
            const img = document.createElement('img');

            // Corrected path to include "citizens" folder
            img.src = `http://localhost:8080/uploads/citizens/${citizen.profilePicture}`;
            img.alt = 'Profile';
            img.classList.add('profile-img');

            // Fallback if image fails to load
            img.onerror = () => {
                userAvatar.innerHTML = `<div class="profile-fallback">${fullName ? fullName.charAt(0).toUpperCase() : 'U'}</div>`;
            };

            userAvatar.appendChild(img);
        } else {
            // Fallback if no profile picture
            userAvatar.innerHTML = `<div class="profile-fallback">${fullName ? fullName.charAt(0).toUpperCase() : 'U'}</div>`;
        }

        // Style fallback initials
        const fallback = userAvatar.querySelector('.profile-fallback');
        if (fallback) {
            fallback.style.backgroundColor = '#e67e22';
            fallback.style.color = '#fff';
            fallback.style.display = 'flex';
            fallback.style.alignItems = 'center';
            fallback.style.justifyContent = 'center';
            fallback.style.fontWeight = 'bold';
            fallback.style.borderRadius = '50%';
            fallback.style.width = '40px';
            fallback.style.height = '40px';
            fallback.style.fontSize = '16px';
        }

    } catch (error) {
        console.error("Error parsing stored user:", error);
        userName.textContent = 'User';
        userAvatar.innerHTML = `<div class="profile-fallback">U</div>`;
    }
}


// Initialize the map
function initMap(lat = currentLat, lng = currentLng) {
    console.log("Initializing map at:", lat, lng);

    if (map) {
        map.remove();
    }

    map = L.map('map').setView([lat, lng], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    if (marker) {
        map.removeLayer(marker);
    }

    marker = L.marker([lat, lng], { draggable: true }).addTo(map);

    marker.on('dragend', function () {
        const position = marker.getLatLng();
        currentLat = position.lat;
        currentLng = position.lng;
        updateAddressFromCoordinates(currentLat, currentLng);
    });

    map.on('click', function (e) {
        marker.setLatLng(e.latlng);
        currentLat = e.latlng.lat;
        currentLng = e.latlng.lng;
        updateAddressFromCoordinates(currentLat, currentLng);
    });

    console.log("Map initialized successfully");
}

// Get address from coordinates using Nominatim
function updateAddressFromCoordinates(lat, lng) {
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
        .then(response => response.json())
        .then(data => {
            if (data && data.display_name) {
                document.getElementById('location-search').value = data.display_name;
            }
        })
        .catch(error => console.error('Error getting address:', error));
}

// Search for location using Nominatim
function searchLocation(query) {
    if (!query) return alert('Please enter a location');

    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=lk&limit=1`)
        .then(response => response.json())
        .then(data => {
            if (data && data.length > 0) {
                const result = data[0];
                currentLat = parseFloat(result.lat);
                currentLng = parseFloat(result.lon);
                initMap(currentLat, currentLng);

                if (result.address) {
                    const addr = result.address;
                    const cleanAddress = [
                        addr.road,
                        addr.suburb,
                        addr.city || addr.town || addr.village,
                        addr.district,
                        addr.state,
                        addr.postcode,
                        addr.country
                    ].filter(Boolean).join(', ');

                    document.getElementById('location-search').value = cleanAddress;
                } else {
                    document.getElementById('location-search').value = result.display_name;
                }
            } else {
                alert('Location not found');
            }
        })
        .catch(err => console.error(err));
}

// Progress bar update
function updateProgressBar(step) {
    const progressSteps = document.querySelectorAll('.progress-step');
    const progressBar = document.getElementById('progressBar');

    progressSteps.forEach(stepEl => {
        stepEl.classList.remove('active', 'completed');
    });

    for (let i = 1; i <= step; i++) {
        const stepEl = document.querySelector(`.progress-step[data-step="${i}"]`);
        if (i < step) stepEl.classList.add('completed');
        else stepEl.classList.add('active');
    }

    const progressPercentage = ((step - 1) / 3) * 100;
    progressBar.style.setProperty('--progress-width', `${progressPercentage}%`);
}

// Show a section
function showSection(sectionId) {
    document.querySelectorAll('.form-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
}

// Update confirmation screen
function updateConfirmation() {
    document.getElementById('confirm-location').textContent = `Latitude: ${currentLat.toFixed(6)}, Longitude: ${currentLng.toFixed(6)}`;
    document.getElementById('confirm-category').textContent = selectedCategory ? selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1) : 'Not selected';
    document.getElementById('confirm-title').textContent = document.getElementById('problem-title').value || 'Not provided';
    document.getElementById('confirm-description').textContent = document.getElementById('problem-description').value || 'Not provided';

    const photosContainer = document.getElementById('confirm-photos');
    photosContainer.innerHTML = '';

    if (uploadedPhotos.length > 0) {
        uploadedPhotos.forEach(p => {
            const img = document.createElement('img');
            img.src = p.preview; // Use preview DataURL
            img.alt = 'Problem photo';
            photosContainer.appendChild(img);
        });
    } else {
        photosContainer.textContent = 'No photos added';
    }
}


// Submit report
function submitReport() {
    if (!loggedInCitizen || !loggedInCitizen.id) {
        alert('Please log in to submit a report.');
        return;
    }

    if (!selectedCategory) {
        alert('Please select a problem category.');
        return;
    }

    if (!document.getElementById('problem-title').value) {
        alert('Please enter a problem title.');
        return;
    }

    if (!document.getElementById('problem-description').value) {
        alert('Please describe the problem.');
        return;
    }

    const formData = new FormData();
    formData.append("citizenId", loggedInCitizen.id);
    formData.append("latitude", currentLat);
    formData.append("longitude", currentLng);
    formData.append("locationNotes", document.getElementById('location-notes').value);
    formData.append("problemCategory", selectedCategory);
    formData.append("problemTitle", document.getElementById('problem-title').value);
    formData.append("problemDescription", document.getElementById('problem-description').value);
    formData.append("publicizeIssue", document.getElementById('publicize-issue').checked ? 1 : 0);
    formData.append("showName", document.getElementById('show-name').checked ? 1 : 0);

   if (uploadedPhotos.length > 0) {
    uploadedPhotos.forEach(p => {
        formData.append("photos", p.file); // ✔ append the actual File object
    });
}



    fetch("http://localhost:8080/api/reports/submit", {
        method: "POST",
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === "success") {
                alert('Thank you! Your report has been submitted successfully.');
                window.location.href = 'myReport.html';
            } else {
                alert('Error submitting report: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error submitting report:', error);
            alert('Something went wrong. Please try again.');
        });
}

// ✅ Fetch categories (departments) from backend
// ✅ Fetch categories (departments) with logo + description
async function loadCategories() {
    const container = document.getElementById('category-options');
    container.innerHTML = '<p>Loading categories...</p>';

    try {
        const response = await fetch('http://localhost:8080/api/departments');
        if (!response.ok) throw new Error('Failed to load categories');

        const departments = await response.json();

        if (departments.length === 0) {
            container.innerHTML = '<p>No departments found.</p>';
            return;
        }

        container.innerHTML = ''; // Clear loading message

        departments.forEach(dep => {
            const div = document.createElement('div');
            div.classList.add('category-option');
            div.setAttribute('data-category', dep.name);

            // ✅ Construct correct logo path or fallback
            const imageUrl = dep.logo
                ? `http://localhost:8080/api/departments/logos/${dep.logo}`
                : 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';

            div.innerHTML = `
                <div style="display:flex;align-items:center;gap:12px;">
                    <img src="${imageUrl}" alt="${dep.name}"
                        style="width:60px;height:60px;border-radius:50%;
                               object-fit:cover;box-shadow:0 0 4px rgba(0,0,0,0.3);">
                    <div style="display:flex;flex-direction:column;">
                        <span style="font-weight:600;font-size:16px;">${dep.name}</span>
                        <span style="font-size:13px;color:#555;">${dep.description || "No description available"}</span>
                    </div>
                </div>
            `;

            div.addEventListener('click', function () {
                document.querySelectorAll('.category-option')
                    .forEach(opt => opt.classList.remove('selected'));
                this.classList.add('selected');
                selectedCategory = dep.name;
            });

            container.appendChild(div);
        });

    } catch (error) {
        console.error('Error loading categories:', error);
        container.innerHTML = '<p>Error loading categories. Please try again later.</p>';
    }
}


// Initialize on page load
document.addEventListener('DOMContentLoaded', function () {
    console.log("DOM loaded, initializing page...");
    loadUserHeader();
     loadCategories();

    setTimeout(() => {
        initMap();
        updateProgressBar(1);
        console.log("Map initialization complete");
    }, 100);

    document.getElementById('next-to-photo').addEventListener('click', function () {
        showSection('photo-section');
        updateProgressBar(2);
    });

    document.getElementById('next-to-details').addEventListener('click', function () {
        showSection('details-section');
        updateProgressBar(3);
    });

    document.getElementById('next-to-confirmation').addEventListener('click', function () {
        if (!selectedCategory) return alert('Please select a problem category');
        if (!document.getElementById('problem-title').value) return alert('Please enter a problem title');
        if (!document.getElementById('problem-description').value) return alert('Please describe the problem');

        updateConfirmation();
        showSection('confirmation-section');
        updateProgressBar(4);
    });

    document.getElementById('back-to-location').addEventListener('click', () => { showSection('location-section'); updateProgressBar(1); });
    document.getElementById('back-to-photo').addEventListener('click', () => { showSection('photo-section'); updateProgressBar(2); });
    document.getElementById('back-to-details').addEventListener('click', () => { showSection('details-section'); updateProgressBar(3); });

    document.getElementById('search-location-btn').addEventListener('click', function () {
        const searchInput = document.getElementById('location-search').value.trim();
        searchLocation(searchInput);
    });

    document.getElementById('use-my-location').addEventListener('click', function () {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                function (position) {
                    currentLat = position.coords.latitude;
                    currentLng = position.coords.longitude;
                    initMap(currentLat, currentLng);
                    updateAddressFromCoordinates(currentLat, currentLng);
                },
                function () {
                    alert('Unable to retrieve your location. Please try searching manually.');
                }
            );
        } else {
            alert('Geolocation is not supported by your browser.');
        }
    });

   document.getElementById('location-search').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        document.getElementById('search-location-btn').click();
    }
});



document.getElementById('photo-upload-area').addEventListener('click', function () {
    document.getElementById('photo-input').click();
});
document.getElementById('photo-input').addEventListener('change', function (e) {
    const files = e.target.files;
    const previewContainer = document.getElementById('photo-preview');

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.match('image.*')) continue;

        const reader = new FileReader();
        reader.onload = function (e) {
            const photoUrl = e.target.result;

            // Store both file and preview
            uploadedPhotos.push({ file, preview: photoUrl });

            const thumbnail = document.createElement('div');
            thumbnail.className = 'photo-thumbnail';
            thumbnail.innerHTML = `
                <img src="${photoUrl}" alt="Uploaded photo">
                <button type="button" class="remove-photo">&times;</button>
            `;

            previewContainer.appendChild(thumbnail);

            thumbnail.querySelector('.remove-photo').addEventListener('click', function () {
                const index = uploadedPhotos.findIndex(p => p.file === file);
                if (index > -1) uploadedPhotos.splice(index, 1);
                thumbnail.remove();
            });
        };
        reader.readAsDataURL(file);
    }
    e.target.value = '';
});

const photoUploadArea = document.getElementById('photo-upload-area');
photoUploadArea.addEventListener('dragover', e => { e.preventDefault(); photoUploadArea.style.borderColor = '#e67e22'; });
photoUploadArea.addEventListener('dragleave', e => { e.preventDefault(); photoUploadArea.style.borderColor = '#ddd'; });
photoUploadArea.addEventListener('drop', e => {
    e.preventDefault();
    photoUploadArea.style.borderColor = '#ddd';
    const files = e.dataTransfer.files;
    const event = new Event('change');
    document.getElementById('photo-input').files = files;
    document.getElementById('photo-input').dispatchEvent(event);
});

document.querySelectorAll('.consent-option').forEach(option => {
    option.addEventListener('click', function () {
        const checkbox = this.querySelector('input[type="checkbox"]');
        checkbox.checked = !checkbox.checked;
        this.classList.toggle('selected', checkbox.checked);
    });
});

document.getElementById('submit-report').addEventListener('click', function () {
    submitReport();
});

});  