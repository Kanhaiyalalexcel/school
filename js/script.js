// js/script.js
document.addEventListener('DOMContentLoaded', () => {
    const currentPath = window.location.pathname.split("/").pop() || 'index.html';

    // --- Common Functionality ---
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            navToggle.classList.toggle('active');
            document.body.classList.toggle('nav-open'); // Optional: for styling body when nav is open
        });
    }

    const setActiveLink = () => {
        const links = document.querySelectorAll('.nav-links a');
        links.forEach(link => {
            link.classList.remove('active');
            let linkHref = link.getAttribute('href').split("/").pop();
            
            // Handle index.html being the root path, or direct access to index.html
            if (currentPath === 'index.html' && (linkHref === '' || linkHref === 'index.html')) {
                link.classList.add('active');
            } else if (linkHref === currentPath) { // For other pages
                link.classList.add('active');
            }
        });
    };
    setActiveLink();

    const currentYearSpan = document.getElementById('currentYear');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // --- Page Specific Initializations (other than notice, results, gallery) ---
    if (currentPath === 'educators.html') { 
        // console.log("Educators page loaded. Any specific JS for this page can go here.");
    } else if (currentPath === 'about.html') {
        // console.log("About Us page loaded. Any specific JS for this page can go here.");
    } else if (currentPath === 'index.html') {
        // console.log("Homepage loaded. Any specific JS for this page can go here.");
    }

});
