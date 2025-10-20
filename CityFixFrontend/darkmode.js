const darkModeToggle = document.getElementById('darkModeToggle');

function enableDarkMode() {
  document.documentElement.classList.add('dark');
  localStorage.setItem('darkMode', 'enabled');
}

function disableDarkMode() {
  document.documentElement.classList.remove('dark');
  localStorage.setItem('darkMode', 'disabled');
}

// Toggle dark mode
darkModeToggle.addEventListener('click', () => {
  if (document.documentElement.classList.contains('dark')) {
    disableDarkMode();
    darkModeToggle.querySelector('span.text-sm').textContent = 'Dark Mode';
  } else {
    enableDarkMode();
    darkModeToggle.querySelector('span.text-sm').textContent = 'Light Mode';
  }
});

// On page load, set dark mode if previously enabled
window.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('darkMode') === 'enabled') {
    enableDarkMode();
    darkModeToggle.querySelector('span.text-sm').textContent = 'Light Mode';
  }
});

