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

    // --- PWA Installation Prompt Handling ---
    let deferredPrompt; // Allows to show the install prompt later
    const installButtonContainer = document.createElement('div');
    installButtonContainer.setAttribute('id', 'install-app-banner');
    installButtonContainer.style.display = 'none'; // Hidden by default
    // Basic styling for the install button/banner
    installButtonContainer.innerHTML = `
        <style>
            #install-app-banner {
                position: fixed;
                bottom: 65px; /* Above mobile nav if present, or adjust */
                left: 50%;
                transform: translateX(-50%);
                padding: 12px 20px;
                background-color: var(--accent-color, #00A896);
                color: var(--light-text-color, #fff);
                border-radius: var(--border-radius-md, 8px);
                box-shadow: 0 2px 10px rgba(0,0,0,0.2);
                z-index: 1001; /* Above most content but below potential modals */
                display: flex;
                align-items: center;
                gap: 15px;
                font-size: 0.9rem;
            }
            #install-app-banner button {
                padding: 8px 15px;
                background-color: var(--secondary-color, #FF7B54);
                color: var(--light-text-color, #fff);
                border: none;
                border-radius: var(--border-radius-sm, 4px);
                cursor: pointer;
                font-weight: 500;
            }
            #install-app-banner button:hover {
                opacity: 0.9;
            }
             @media (max-width: 768px) {
                #install-app-banner {
                    bottom: 75px; /* Ensure it's above mobile bottom nav */
                    width: calc(100% - 40px); /* Some padding from screen edges */
                    max-width: 350px;
                    justify-content: space-between;
                }
            }
        </style>
        <span>Install Springfield Academy App?</span>
        <button id="install-button">Install</button>
    `;
    document.body.appendChild(installButtonContainer);
    const installButton = document.getElementById('install-button');

    window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent Chrome 67 and earlier from automatically showing the prompt
        e.preventDefault();
        // Stash the event so it can be triggered later.
        deferredPrompt = e;
        // Update UI to notify the user they can add to home screen
        installButtonContainer.style.display = 'flex'; // Show our custom banner/button
        console.log('`beforeinstallprompt` event was fired.');
    });

    if (installButton) {
        installButton.addEventListener('click', async () => {
            // Hide our user interface that shows our A2HS button
            installButtonContainer.style.display = 'none';
            if (!deferredPrompt) {
                console.log('Install prompt not available.');
                // Optionally, inform the user they can install via browser menu
                // alert("To install, please use the 'Add to Home Screen' or 'Install app' option in your browser's menu.");
                return;
            }
            // Show the prompt
            deferredPrompt.prompt();
            // Wait for the user to respond to the prompt
            const { outcome } = await deferredPrompt.userChoice;
            console.log(`User response to the install prompt: ${outcome}`);
            // We've used the prompt, and can't use it again, throw it away
            deferredPrompt = null;
        });
    }

    window.addEventListener('appinstalled', (evt) => {
        // Log install to analytics or update UI.
        console.log('Springfield Academy was installed.', evt);
        installButtonContainer.style.display = 'none'; // Ensure banner is hidden
        deferredPrompt = null; // Clear the deferred prompt
    });


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

    // Page-specific JS hooks
    if (currentPath === 'educators.html') {
        // console.log("Educators page loaded.");
    } else if (currentPath === 'about.html') {
        // console.log("About Us page loaded.");
    } else if (currentPath === 'index.html') {
        // console.log("Homepage loaded.");
    }
});