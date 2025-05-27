// js/script.js

document.addEventListener('DOMContentLoaded', () => {
    const currentPath = window.location.pathname.split("/").pop() || 'index.html';

    // Desktop Navigation Toggle
    const navToggle = document.querySelector('header .nav-toggle');
    const desktopNavLinks = document.querySelector('header .nav-links');
    if (navToggle && desktopNavLinks) {
        navToggle.addEventListener('click', () => {
            desktopNavLinks.classList.toggle('active');
            navToggle.classList.toggle('active');
            document.body.classList.toggle('nav-open');
        });
    }

    // Active Link Highlighting
    const setActiveLink = () => {
        const desktopLinks = document.querySelectorAll('header .nav-links a');
        desktopLinks.forEach(link => {
            link.classList.remove('active');
            let linkHref = link.getAttribute('href').split("/").pop();
            if (currentPath === 'index.html' && (linkHref === '' || linkHref === 'index.html')) {
                link.classList.add('active');
            } else if (linkHref === currentPath && linkHref !== '') {
                link.classList.add('active');
            }
        });

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
    setActiveLink();

    // Footer Current Year
    const currentYearSpan = document.getElementById('currentYear');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // Register Service Worker for PWA
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('Service Worker registered successfully with scope:', registration.scope);
            })
            .catch(error => {
                console.error('Service Worker registration failed:', error);
            });
    } else {
        console.log('Service Worker not supported by this browser.');
    }

    // Page-specific JS hooks (can be expanded or moved if logic grows)
    if (currentPath === 'educators.html') {
        // console.log("Educators page loaded.");
    } else if (currentPath === 'about.html') {
        // console.log("About Us page loaded.");
    } else if (currentPath === 'index.html') {
        // console.log("Homepage loaded.");
    }
});