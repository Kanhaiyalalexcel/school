// js/script.js

document.addEventListener('DOMContentLoaded', () => {
    const currentPath = window.location.pathname.split("/").pop() || 'index.html';

    // --- Common Functionality ---

    // Desktop Navigation Toggle (Hamburger Menu)
    const navToggle = document.querySelector('header .nav-toggle'); // More specific selector for desktop
    const desktopNavLinks = document.querySelector('header .nav-links');
    if (navToggle && desktopNavLinks) {
        navToggle.addEventListener('click', () => {
            desktopNavLinks.classList.toggle('active');
            navToggle.classList.toggle('active'); // For hamburger X animation
            // Optional: Toggle a class on body if you need to prevent scroll when mobile menu is open
            // document.body.classList.toggle('nav-open'); 
        });
    }

    // Active Link Highlighting for both Desktop and Mobile Navigations
    const setActiveLink = () => {
        // For Desktop Navigation
        const desktopLinks = document.querySelectorAll('header .nav-links a');
        desktopLinks.forEach(link => {
            link.classList.remove('active');
            let linkHref = link.getAttribute('href').split("/").pop();
            
            // Handle root path correctly for index.html
            if (currentPath === 'index.html' && (linkHref === '' || linkHref === 'index.html')) {
                link.classList.add('active');
            } else if (linkHref === currentPath && linkHref !== '') { // Check if not empty for other pages
                link.classList.add('active');
            }
        });

        // For Mobile Bottom Navigation
        const mobileLinks = document.querySelectorAll('.mobile-bottom-nav a.mobile-nav-link');
        mobileLinks.forEach(link => {
            link.classList.remove('active');
            let linkHref = link.getAttribute('href').split("/").pop();

            if (currentPath === 'index.html' && (linkHref === '' || linkHref === 'index.html')) {
                link.classList.add('active');
            } else if (linkHref === currentPath && linkHref !== '') {
                link.classList.add('active');
            }
        });
    };
    setActiveLink(); // Call the function to highlight the active link on page load

    // Footer Current Year
    const currentYearSpan = document.getElementById('currentYear');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // --- Page Specific Initializations (for pages without their own dedicated JS file yet) ---
    // This section can be used to run small, unique JS snippets for specific pages
    // if they don't warrant a full separate JS file.

    if (currentPath === 'educators.html') { 
        // Example: console.log("Educators page specific JavaScript can run here.");
        // If educators.html eventually needs complex JS, create educators.js
    } else if (currentPath === 'about.html') {
        // Example: console.log("About Us page specific JavaScript can run here.");
    } else if (currentPath === 'index.html') {
        // Example: console.log("Homepage specific JavaScript (if any) can run here.");
    }

});

