// Initialize map and variables
let map, marker;
let currentLat = 6.9271; // Default to Colombo
let currentLng = 79.8612;
let selectedCategory = '';
let uploadedPhotos = [];
let loggedInCitizen = null;

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
    
    // Add marker
    if (marker) {
        map.removeLayer(marker);
    }
    marker = L.marker([lat, lng], {draggable: true}).addTo(map);
    
    // Update coordinates when marker is dragged
    marker.on('dragend', function() {
        const position = marker.getLatLng();
        currentLat = position.lat;
        currentLng = position.lng;
        updateAddressFromCoordinates(currentLat, currentLng);
    });
    
    // Add click event to map to move marker
    map.on('click', function(e) {
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
        .catch(error => {
            console.error('Error getting address:', error);
        });
}

// Search for location using Nominatim
function searchLocation(query) {
    if (!query) {
        alert('Please enter a location to search');
        return;
    }
    
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=lk&limit=1`)
        .then(response => response.json())
        .then(data => {
            if (data && data.length > 0) {
                const result = data[0];
                currentLat = parseFloat(result.lat);
                currentLng = parseFloat(result.lon);
                initMap(currentLat, currentLng);
                document.getElementById('location-search').value = result.display_name;
            } else {
                alert('Location not found. Please try another search term.');
            }
        })
        .catch(error => {
            console.error('Error searching location:', error);
            alert('Error searching for location. Please try again.');
        });
}

// Update progress bar
function updateProgressBar(step) {
    const progressSteps = document.querySelectorAll('.progress-step');
    const progressBar = document.getElementById('progressBar');
    
    progressSteps.forEach(stepEl => {
        stepEl.classList.remove('active', 'completed');
    });
    
    for (let i = 1; i <= step; i++) {
        const stepEl = document.querySelector(`.progress-step[data-step="${i}"]`);
        if (i < step) {
            stepEl.classList.add('completed');
        } else {
            stepEl.classList.add('active');
        }
    }
    
    // Update progress line
    const progressPercentage = ((step - 1) / 3) * 100;
    progressBar.style.setProperty('--progress-width', `${progressPercentage}%`);
}

// Show specific section
function showSection(sectionId) {
    document.querySelectorAll('.form-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
}

// Update confirmation details
function updateConfirmation() {
    document.getElementById('confirm-location').textContent = `Latitude: ${currentLat.toFixed(6)}, Longitude: ${currentLng.toFixed(6)}`;
    document.getElementById('confirm-category').textContent = selectedCategory ? selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1) : 'Not selected';
    document.getElementById('confirm-title').textContent = document.getElementById('problem-title').value || 'Not provided';
    document.getElementById('confirm-description').textContent = document.getElementById('problem-description').value || 'Not provided';
    
    const photosContainer = document.getElementById('confirm-photos');
    photosContainer.innerHTML = '';
    
    if (uploadedPhotos.length > 0) {
        uploadedPhotos.forEach(photo => {
            const img = document.createElement('img');
            img.src = photo;
            img.alt = 'Problem photo';
            photosContainer.appendChild(img);
        });
    } else {
        photosContainer.textContent = 'No photos added';
    }
}

// Load logged-in user information
function loadUserInfo() {
    const storedUser = localStorage.getItem("loggedInCitizen");
    console.log("Stored user:", storedUser);
    
    if (storedUser) {
        try {
            loggedInCitizen = JSON.parse(storedUser);
            console.log("Parsed citizen:", loggedInCitizen);
            
            // Update user info in header
            const userName = document.getElementById('user-name');
            const userAvatar = document.getElementById('user-avatar');
            
            if (loggedInCitizen.firstName || loggedInCitizen.lastName) {
                userName.textContent = `${loggedInCitizen.firstName || ''} ${loggedInCitizen.lastName || ''}`.trim();
            } else if (loggedInCitizen.name) {
                userName.textContent = loggedInCitizen.name;
            } else {
                userName.textContent = 'User';
            }
            
            // Set avatar
            if (loggedInCitizen.profilePicture) {
                userAvatar.innerHTML = `<img src="${loggedInCitizen.profilePicture}" alt="Profile Picture">`;
            } else {
                // Create initials from name
                const name = loggedInCitizen.firstName || loggedInCitizen.name || 'User';
                const initials = name.charAt(0).toUpperCase();
                userAvatar.textContent = initials;
                userAvatar.style.backgroundColor = '#e67e22';
                userAvatar.style.color = 'white';
                userAvatar.style.display = 'flex';
                userAvatar.style.alignItems = 'center';
                userAvatar.style.justifyContent = 'center';
                userAvatar.style.fontWeight = 'bold';
            }
        } catch (error) {
            console.error('Error parsing user data:', error);
            document.getElementById('user-name').textContent = 'User';
        }
    } else {
        console.log('No user found in localStorage, redirecting to login');
        // Redirect to login if no user is logged in
        alert('Please log in to report a problem.');
        window.location.href = 'signin.html';
    }
}

// Submit report to backend
function submitReport() {
    if (!loggedInCitizen || !loggedInCitizen.id) {
        alert('Please log in to submit a report.');
        return;
    }
    
    // Validate required fields
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
    
    // Prepare form data
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
    
    // Add photos
    const photoInput = document.getElementById('photo-input');
    if (photoInput.files.length > 0) {
        for (let i = 0; i < photoInput.files.length; i++) {
            formData.append("photos", photoInput.files[i]);
        }
    }
    
    // Submit to backend
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

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM loaded, initializing page...");
    
    // Load user info first
    loadUserInfo();
    
    // Then initialize the map with a slight delay to ensure DOM is ready
    setTimeout(() => {
        initMap();
        updateProgressBar(1);
        console.log("Map initialization complete");
    }, 100);
    
    // Navigation between sections
    document.getElementById('next-to-photo').addEventListener('click', function() {
        showSection('photo-section');
        updateProgressBar(2);
    });
    
    document.getElementById('next-to-details').addEventListener('click', function() {
        showSection('details-section');
        updateProgressBar(3);
    });
    
    document.getElementById('next-to-confirmation').addEventListener('click', function() {
        // Validate details section
        if (!selectedCategory) {
            alert('Please select a problem category');
            return;
        }
        
        if (!document.getElementById('problem-title').value) {
            alert('Please enter a problem title');
            return;
        }
        
        if (!document.getElementById('problem-description').value) {
            alert('Please describe the problem');
            return;
        }
        
        updateConfirmation();
        showSection('confirmation-section');
        updateProgressBar(4);
    });
    
    document.getElementById('back-to-location').addEventListener('click', function() {
        showSection('location-section');
        updateProgressBar(1);
    });
    
    document.getElementById('back-to-photo').addEventListener('click', function() {
        showSection('photo-section');
        updateProgressBar(2);
    });
    
    document.getElementById('back-to-details').addEventListener('click', function() {
        showSection('details-section');
        updateProgressBar(3);
    });
    
    // Location search functionality
    document.getElementById('search-location-btn').addEventListener('click', function() {
        const searchInput = document.getElementById('location-search').value.trim();
        searchLocation(searchInput);
    });
    
    // Use my location button
    document.getElementById('use-my-location').addEventListener('click', function() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                function(position) {
                    currentLat = position.coords.latitude;
                    currentLng = position.coords.longitude;
                    initMap(currentLat, currentLng);
                    updateAddressFromCoordinates(currentLat, currentLng);
                }, 
                function(error) {
                    alert('Unable to retrieve your location. Please try searching manually.');
                }
            );
        } else {
            alert('Geolocation is not supported by your browser.');
        }
    });
    
    // Allow pressing Enter to search
    document.getElementById('location-search').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            document.getElementById('search-location-btn').click();
        }
    });
    
    // Category selection
    document.querySelectorAll('.category-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.category-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            this.classList.add('selected');
            selectedCategory = this.getAttribute('data-category');
        });
    });
    
    // Photo upload functionality
    document.getElementById('photo-upload-area').addEventListener('click', function() {
        document.getElementById('photo-input').click();
    });
    
    document.getElementById('photo-input').addEventListener('change', function(e) {
        const files = e.target.files;
        const previewContainer = document.getElementById('photo-preview');
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (!file.type.match('image.*')) continue;
            
            const reader = new FileReader();
            
            reader.onload = function(e) {
                const photoUrl = e.target.result;
                uploadedPhotos.push(photoUrl);
                
                const thumbnail = document.createElement('div');
                thumbnail.className = 'photo-thumbnail';
                thumbnail.innerHTML = `
                    <img src="${photoUrl}" alt="Uploaded photo">
                    <button type="button" class="remove-photo">&times;</button>
                `;
                
                previewContainer.appendChild(thumbnail);
                
                // Add remove functionality
                thumbnail.querySelector('.remove-photo').addEventListener('click', function() {
                    const index = uploadedPhotos.indexOf(photoUrl);
                    if (index > -1) {
                        uploadedPhotos.splice(index, 1);
                    }
                    thumbnail.remove();
                });
            };
            
            reader.readAsDataURL(file);
        }
        
        // Reset input to allow uploading the same file again
        e.target.value = '';
    });
    
    // Drag and drop for photos
    const photoUploadArea = document.getElementById('photo-upload-area');
    
    photoUploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.style.borderColor = '#e67e22';
        this.style.backgroundColor = '#fff9f2';
    });
    
    photoUploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        this.style.borderColor = '#ddd';
        this.style.backgroundColor = '';
    });
    
    photoUploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        this.style.borderColor = '#ddd';
        this.style.backgroundColor = '';
        
        const files = e.dataTransfer.files;
        const event = new Event('change');
        document.getElementById('photo-input').files = files;
        document.getElementById('photo-input').dispatchEvent(event);
    });
    
    // Consent option styling
    document.querySelectorAll('.consent-option').forEach(option => {
        option.addEventListener('click', function() {
            const checkbox = this.querySelector('input[type="checkbox"]');
            checkbox.checked = !checkbox.checked;
            this.classList.toggle('selected', checkbox.checked);
        });
    });
    
    // Submit report
    document.getElementById('submit-report').addEventListener('click', function() {
        submitReport();
    });
});