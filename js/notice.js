// js/notice.js

document.addEventListener('DOMContentLoaded', () => {
    const noticesContainer = document.getElementById('notices-container');
    // Ensure this script only fully executes logic if it's on a page with the notices-container
    if (window.location.pathname.includes('notice.html') && noticesContainer) {
        loadAllNotices();
    } else if (noticesContainer && !window.location.pathname.includes('notice.html')) {
        // This case might be for a homepage snippet, which you removed.
        // If you ever add a small notice section elsewhere, you'd need a different loader.
        // console.log("Notices container found, but not on notice.html. Notices not loaded by notice.js for this page.");
    }
});

async function fetchNotices() {
    try {
        // Path relative to the HTML file that includes this script
        const response = await fetch('data/notices.json'); 
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} when fetching notices.json`);
        }
        return await response.json();
    } catch (error) {
        console.error("Could not fetch notices:", error);
        return [];
    }
}

function displayNotices(notices, containerElement) {
    if (!containerElement) {
        console.error("Notice container element not provided to displayNotices.");
        return;
    }
    const sortedNotices = notices.sort((a, b) => new Date(b.date) - new Date(a.date) || b.id - a.id);
    
    if (sortedNotices.length === 0) {
        containerElement.innerHTML = '<p class="placeholder-text">No notices to display at the moment.</p>';
        return;
    }

    let noticesHTML = '';
    sortedNotices.forEach(notice => {
        const hasImage = notice.image && notice.image.trim() !== '';
        
        noticesHTML += `
            <div class="notice-card ${notice.isNew ? 'new-notice' : ''}">
                ${notice.isNew ? '<span class="new-badge">NEW</span>' : ''}
                <div class="notice-content-wrapper">
                    ${hasImage ? `
                        <div class="notice-image-container">
                            <img src="${notice.image}" alt="${notice.title}" class="notice-image"> 
                        </div>
                    ` : ''}
                    <div class="notice-text-content">
                        <div class="notice-header">
                            <h3 class="notice-title">${notice.title}</h3>
                            <span class="notice-date">${formatDate(notice.date)}</span>
                        </div>
                        <p class="notice-description">${notice.description}</p>
                    </div>
                </div>
            </div>
        `;
    });
    containerElement.innerHTML = noticesHTML;
}

async function loadAllNotices() {
    const noticesContainer = document.getElementById('notices-container');
    if (!noticesContainer) {
        console.error("Notice container (#notices-container) not found on the page by loadAllNotices.");
        return;
    }
    noticesContainer.innerHTML = '<p class="loading-text">Loading notices...</p>';

    const notices = await fetchNotices();
    displayNotices(notices, noticesContainer);
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
             console.warn("Invalid date string provided to formatDate:", dateString);
             return dateString; 
        }
        return date.toLocaleDateString(undefined, options);
    } catch (e) {
        console.warn("Could not format date:", dateString, e);
        return dateString;
    }
}