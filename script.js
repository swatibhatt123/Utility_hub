// Navigation toggle for mobile
const bar = document.getElementById('bar');
const close = document.getElementById('close');
const nav = document.getElementById('navbar');

if (bar) {
    bar.addEventListener('click', () => {
        nav.classList.add('active');
    });
}

if (close){
    close.addEventListener('click', () =>{
        nav.classList.remove('active');
    })
}

// Utility links mapping
const cardLinks = [
    "/calculatorapp/indexcal.html",
    "/weatherapp/indexwet.html",
    "/tictactoe/indextic.html"
];

// Handle card clicks when unauthenticated
function handleUnauthenticatedClick(e) {
    e.preventDefault();
    alert('Please login to access this utility');
    window.location.href = '/loginpage/public/index.html';
}

// Authentication state management
async function checkAuthState() {
    try {
        const res = await fetch('/api/auth/status', {
            credentials: 'include'
        });
        
        const data = await res.json();
        
        if (data.success) {
            // User is authenticated
            updateUIForAuthenticatedUser(data.user);
            enableCards();
        } else {
            // User is not authenticated
            updateUIForUnauthenticatedUser();
            disableCards();
        }
    } catch (err) {
        console.error('Auth check failed:', err);
        updateUIForUnauthenticatedUser();
        disableCards();
    }
}

function enableCards() {
    const cards = document.querySelectorAll('.card a');
    cards.forEach((cardLink, index) => {
        cardLink.href = cardLinks[index];
        cardLink.style.pointerEvents = 'auto';
        cardLink.style.cursor = 'pointer';
        cardLink.onclick = null;
    });
}

function disableCards() {
    const cards = document.querySelectorAll('.card a');
    cards.forEach(cardLink => {
        cardLink.style.pointerEvents = 'auto'; // Keep clickable for login message
        cardLink.style.cursor = 'pointer';
        cardLink.onclick = handleUnauthenticatedClick;
    });
}

function updateUIForAuthenticatedUser(user) {
    // Update welcome message
    const welcomeEl = document.getElementById('welcome-message');
    if (welcomeEl) {
        welcomeEl.textContent = `Utility Hub, ${user.fullname || user.email}`;
    }

    // Update user email display
    const userEmail = document.getElementById('user-email');
    if (userEmail) {
        userEmail.textContent = `Logged as: ${user.email}`;
        userEmail.style.color = "white";
    }

    // Update navigation buttons
    document.getElementById('logout-button').style.display = 'inline-block';
    document.getElementById('login-link').style.display = 'none';
    document.getElementById('signup-link').style.display = 'none';
}

function updateUIForUnauthenticatedUser() {
    // Update navigation buttons
    document.getElementById('logout-button').style.display = 'none';
    document.getElementById('login-link').style.display = 'inline-block';
    document.getElementById('signup-link').style.display = 'inline-block';
    
    // Reset user info displays
    const welcomeEl = document.getElementById('welcome-message');
    if (welcomeEl) welcomeEl.textContent = 'Utility Hub';
    
    const userEmail = document.getElementById('user-email');
    if (userEmail) userEmail.textContent = '';
}

// Logout functionality
document.getElementById('logout-button').addEventListener('click', async () => {
    try {
        const res = await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include'
        });
        
        const data = await res.json();
        
        if (data.success) {
            alert('Logout successful. Visit again.');
            checkAuthState(); // This will reset the UI
        } else {
            alert('Logout failed. Please try again.');
        }
    } catch (error) {
        console.error('Logout error:', error);
        alert('An error occurred during logout.');
    }
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Check auth state (will handle card setup)
    checkAuthState();
});

