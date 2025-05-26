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
            document.body.classList.toggle('nav-open');
        });
    }

    const setActiveLink = () => {
        const links = document.querySelectorAll('.nav-links a');
        links.forEach(link => {
            link.classList.remove('active');
            let linkHref = link.getAttribute('href').split("/").pop();
            if (linkHref === '' && currentPath === 'index.html') linkHref = 'index.html';
            if (linkHref === currentPath) {
                link.classList.add('active');
            }
        });
    };
    setActiveLink();

    const currentYearSpan = document.getElementById('currentYear');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // --- Page Specific Initializations ---
    if (currentPath === 'index.html') {
        // console.log("Homepage loaded");
    }

    if (currentPath === 'notice.html') {
        loadAllNotices();
    }

    if (currentPath === 'results.html') {
        initializeResultsPage();
    }

    if (currentPath === 'gallery.html') {
        loadGalleryData();
    }
});

// --- Notice Loading Functions ---
async function fetchNotices() {
    try {
        const response = await fetch('data/notices.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
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
        noticesHTML += `
            <div class="notice-card ${notice.isNew ? 'new-notice' : ''}">
                ${notice.isNew ? '<span class="new-badge">NEW</span>' : ''}
                <div class="notice-header">
                    <h3 class="notice-title">${notice.title}</h3>
                    <span class="notice-date">${formatDate(notice.date)}</span>
                </div>
                <p class="notice-description">${notice.description}</p>
                ${notice.image ? `<img src="${notice.image}" alt="${notice.title}" class="notice-image">` : ''}
            </div>
        `;
    });
    containerElement.innerHTML = noticesHTML;
}

async function loadAllNotices() {
    const noticesContainer = document.getElementById('notices-container');
    if (!noticesContainer) {
        console.error("Notice container (#notices-container) not found.");
        return;
    }
    noticesContainer.innerHTML = '<p class="loading-text">Loading notices...</p>';
    const notices = await fetchNotices();
    displayNotices(notices, noticesContainer);
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    try {
        return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (e) {
        console.warn("Could not format date:", dateString, e);
        return dateString;
    }
}

// --- Results Page Functions ---
let resultsData = null;
async function fetchResults() {
    if (resultsData) return resultsData;
    try {
        const response = await fetch('data/results.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        resultsData = await response.json();
        return resultsData;
    } catch (error) {
        console.error("Could not fetch results:", error);
        const resultsTableContainer = document.getElementById('results-table-container');
        if (resultsTableContainer) {
             resultsTableContainer.innerHTML = '<p class="placeholder-text error-text">Failed to load results data.</p>';
        }
        return null;
    }
}

async function initializeResultsPage() {
    const classSelect = document.getElementById('class-select');
    const testSelect = document.getElementById('test-select');
    const viewResultsBtn = document.getElementById('view-results-btn');
    const resultsTableContainer = document.getElementById('results-table-container');

    if (!classSelect || !testSelect || !viewResultsBtn || !resultsTableContainer) return;
    
    resultsTableContainer.innerHTML = '<p class="placeholder-text">Loading result options...</p>';
    const data = await fetchResults();
    if (!data) {
        resultsTableContainer.innerHTML = '<p class="placeholder-text error-text">Could not load result categories.</p>';
        return;
    }
    resultsTableContainer.innerHTML = '<p class="placeholder-text">Please select a class and test to view results.</p>';

    const classes = Object.keys(data);
    if (classes.length === 0) {
        classSelect.innerHTML = '<option value="">No classes available</option>';
        classSelect.disabled = true; testSelect.disabled = true; viewResultsBtn.disabled = true; return;
    }
    classes.forEach(className => {
        const option = document.createElement('option');
        option.value = className;
        option.textContent = className.replace(/([A-Za-z]+)([0-9]+)/, (match, p1, p2) => `${p1.charAt(0).toUpperCase() + p1.slice(1)} ${p2}`);
        classSelect.appendChild(option);
    });

    classSelect.addEventListener('change', () => {
        const selectedClass = classSelect.value;
        testSelect.innerHTML = '<option value="">-- Select Test --</option>';
        testSelect.disabled = true; viewResultsBtn.disabled = true;
        resultsTableContainer.innerHTML = '<p class="placeholder-text">Please select a test to view results.</p>';
        if (selectedClass && data[selectedClass]) {
            const tests = Object.keys(data[selectedClass]);
            if (tests.length === 0) { testSelect.innerHTML = '<option value="">No tests available</option>'; return; }
            tests.forEach(testName => {
                const option = document.createElement('option');
                option.value = testName;
                option.textContent = testName.replace(/([A-Za-z]+)([0-9]+)/, (match, p1, p2) => `${p1.charAt(0).toUpperCase() + p1.slice(1)} ${p2}`);
                testSelect.appendChild(option);
            });
            testSelect.disabled = false;
        }
    });
    testSelect.addEventListener('change', () => {
        viewResultsBtn.disabled = !testSelect.value;
        if(testSelect.value) resultsTableContainer.innerHTML = '<p class="placeholder-text">Click "View Results" to load data.</p>';
    });
    viewResultsBtn.addEventListener('click', () => {
        const selectedClass = classSelect.value;
        const selectedTest = testSelect.value;
        if (selectedClass && selectedTest && data[selectedClass] && data[selectedClass][selectedTest]) {
            resultsTableContainer.innerHTML = '<p class="loading-text">Loading results...</p>';
            setTimeout(() => renderResultsTable(data[selectedClass][selectedTest], resultsTableContainer), 200);
        } else {
            resultsTableContainer.innerHTML = '<p class="placeholder-text error-text">No results found.</p>';
        }
    });
}
function renderResultsTable(studentResults, container) {
    if (!studentResults || studentResults.length === 0) {
        container.innerHTML = '<p class="placeholder-text">No results available.</p>'; return;
    }
    const headers = Object.keys(studentResults[0]);
    let tableHTML = '<table class="results-table"><thead><tr>';
    headers.forEach(header => {
        let thClass = '';
        let headerText = header.replace(/([A-Z](?=[a-z]))|([A-Z]+(?=[A-Z][a-z]|\b))/g, ' $1$2').trim();
        headerText = headerText.charAt(0).toUpperCase() + headerText.slice(1);
        if (header.toLowerCase() === 'rank') thClass = 'rank-col';
        if (header.toLowerCase() === 'percentage') thClass = 'percentage-col';
        if (header.toLowerCase() === 'name') thClass = 'name-col';
        tableHTML += `<th class="${thClass}">${headerText}</th>`;
    });
    tableHTML += '</tr></thead><tbody>';
    studentResults.forEach(student => {
        tableHTML += '<tr>';
        headers.forEach(header => {
            let tdClass = '';
            let currentHeaderText = header.replace(/([A-Z](?=[a-z]))|([A-Z]+(?=[A-Z][a-z]|\b))/g, ' $1$2').trim();
            currentHeaderText = currentHeaderText.charAt(0).toUpperCase() + currentHeaderText.slice(1);
            if (header.toLowerCase() === 'rank') tdClass = 'rank-col';
            if (header.toLowerCase() === 'percentage') tdClass = 'percentage-col';
            if (header.toLowerCase() === 'name') tdClass = 'name-col';
            tableHTML += `<td data-label="${currentHeaderText}" class="${tdClass}">${student[header] !== null ? student[header] : '-'}</td>`;
        });
        tableHTML += '</tr>';
    });
    tableHTML += '</tbody></table>';
    container.innerHTML = tableHTML;
}

// --- Gallery Page Functions ---
let originalGalleryData = []; // Store all fetched albums globally

async function fetchGalleryData() {
    try {
        const response = await fetch('data/gallery.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        originalGalleryData = await response.json(); // Store fetched data
        return originalGalleryData;
    } catch (error) {
        console.error("Could not fetch gallery data:", error);
        originalGalleryData = []; // Reset on error
        return [];
    }
}

function displayGalleryAlbums(albumsToDisplay, containerElement) {
    if (!containerElement) {
        console.error("Gallery container element not found.");
        return;
    }
    // The albumsToDisplay here is originalGalleryData, already sorted if needed by fetchGalleryData or loadGalleryData
    const sortedAlbums = albumsToDisplay.sort((a,b) => b.id - a.id); // Ensure sorting if not done elsewhere

    if (sortedAlbums.length === 0) {
        containerElement.innerHTML = '<p class="placeholder-text">No gallery albums to display.</p>';
        return;
    }

    let galleryHTML = '';
    sortedAlbums.forEach((album, albumIndex) => { // albumIndex is the index in the sortedAlbums array
        const coverImage = (album.image && album.image.length > 0) ? album.image[0] : 'images/gallery_placeholder_default.jpg';
        
        // Store albumIndex which corresponds to the index in the currently displayed (and potentially sorted) list
        galleryHTML += `
            <div class="gallery-item" data-album-index="${albumIndex}">
                <img src="${coverImage}" alt="${album.title}">
                <div class="gallery-item-caption">${album.title}</div>
            </div>
        `;
    });
    containerElement.innerHTML = galleryHTML;
}

async function loadGalleryData() {
    const galleryContainer = document.getElementById('image-gallery-container');
    if (!galleryContainer) {
        console.error("Gallery container (#image-gallery-container) not found on the page.");
        return;
    }
    galleryContainer.innerHTML = '<p class="loading-text">Loading gallery...</p>';

    const albums = await fetchGalleryData(); // Fetches and stores in originalGalleryData
    displayGalleryAlbums(albums, galleryContainer); // Display them
    
    initializeGalleryScrollAnimations();
    initializeGalleryLightbox(); // No need to pass albums, it will use originalGalleryData
}

function initializeGalleryScrollAnimations() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    if (!galleryItems.length) return;

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observerCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    };

    const galleryObserver = new IntersectionObserver(observerCallback, observerOptions);
    galleryItems.forEach(item => galleryObserver.observe(item));
}

// Lightbox Global State Variables
let currentAlbumImagesForLightbox = [];
let currentImageIndexInLightbox = 0;
let currentAlbumTitleForLightbox = '';

function initializeGalleryLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxCounter = document.getElementById('lightbox-counter');
    const closeLightboxBtn = document.querySelector('.close-lightbox');
    const prevBtn = lightbox.querySelector('.lightbox-nav.prev');
    const nextBtn = lightbox.querySelector('.lightbox-nav.next');
    const galleryItems = document.querySelectorAll('.gallery-item'); // Get items after they are rendered

    if (!lightbox || !lightboxImg || !closeLightboxBtn || !prevBtn || !nextBtn) {
        console.warn("One or more lightbox elements are missing.");
        return;
    }
    if (galleryItems.length === 0) {
        // console.log("No gallery items found to attach lightbox listeners.");
        return;
    }

    function openLightbox(albumIndexFromDOM, imagePathToStartWith) {
        // albumIndexFromDOM is the index from the sorted list currently on the page
        // originalGalleryData contains all albums, potentially in a different order if fetchGalleryData sorts it differently
        // For simplicity, assuming originalGalleryData is the source of truth and its order matches what displayGalleryAlbums used
        const selectedAlbum = originalGalleryData.sort((a,b) => b.id - a.id)[albumIndexFromDOM];


        if (!selectedAlbum || !selectedAlbum.image || selectedAlbum.image.length === 0) {
            console.error("Selected album data is invalid or has no images for lightbox:", selectedAlbum);
            return;
        }

        currentAlbumImagesForLightbox = selectedAlbum.image;
        currentAlbumTitleForLightbox = selectedAlbum.title;

        // Find the index of imagePathToStartWith within the selected album's images
        let startIndex = currentAlbumImagesForLightbox.findIndex(imgPath => imgPath === imagePathToStartWith);
        if (startIndex === -1) { // Fallback if exact match fails (e.g. full URL vs relative path)
            const startFilename = imagePathToStartWith.substring(imagePathToStartWith.lastIndexOf('/') + 1);
            startIndex = currentAlbumImagesForLightbox.findIndex(imgPath => 
                imgPath.substring(imgPath.lastIndexOf('/') + 1) === startFilename
            );
            if (startIndex === -1) startIndex = 0; // Default to first image if still not found
        }
        currentImageIndexInLightbox = startIndex;

        updateLightboxDisplay();
        lightbox.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    function updateLightboxDisplay() {
        if (currentAlbumImagesForLightbox.length === 0) return;
        lightboxImg.src = currentAlbumImagesForLightbox[currentImageIndexInLightbox];
        lightboxImg.alt = `${currentAlbumTitleForLightbox} - Image ${currentImageIndexInLightbox + 1}`;
        if (lightboxCaption) lightboxCaption.textContent = currentAlbumTitleForLightbox;
        if (lightboxCounter) lightboxCounter.textContent = `${currentImageIndexInLightbox + 1} / ${currentAlbumImagesForLightbox.length}`;

        prevBtn.style.display = currentAlbumImagesForLightbox.length <= 1 ? 'none' : 'block';
        nextBtn.style.display = currentAlbumImagesForLightbox.length <= 1 ? 'none' : 'block';
        
        prevBtn.classList.toggle('disabled', currentImageIndexInLightbox === 0);
        nextBtn.classList.toggle('disabled', currentImageIndexInLightbox === currentAlbumImagesForLightbox.length - 1);
    }

    function closeLightboxAction() {
        lightbox.style.display = 'none';
        lightboxImg.src = '';
        document.body.style.overflow = 'auto';
    }

    function showPrevImage() {
        if (currentImageIndexInLightbox > 0) {
            currentImageIndexInLightbox--;
            updateLightboxDisplay();
        }
    }

    function showNextImage() {
        if (currentImageIndexInLightbox < currentAlbumImagesForLightbox.length - 1) {
            currentImageIndexInLightbox++;
            updateLightboxDisplay();
        }
    }

    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            const albumIndex = parseInt(item.dataset.albumIndex); // Index from the DOM (sorted list)
            const clickedImageSrc = item.querySelector('img').src; // This will be the full URL
            
            // Extract relative path from full URL to match JSON structure
            // Assumes images are served from the same domain and path starts with 'images/'
            let relativeClickedImageSrc = '';
            try {
                const url = new URL(clickedImageSrc);
                // Find where 'images/' starts in the pathname
                const imagesPathIndex = url.pathname.indexOf('/images/');
                if (imagesPathIndex !== -1) {
                    relativeClickedImageSrc = url.pathname.substring(imagesPathIndex + 1); // Get 'images/gallery/...'
                } else {
                    // Fallback if 'images/' is not in the path (e.g. if served from root and path in JSON is 'gallery/...')
                    // This part might need adjustment based on actual server setup and JSON paths
                    relativeClickedImageSrc = clickedImageSrc.substring(clickedImageSrc.lastIndexOf('/') + 1); 
                    console.warn("Could not reliably determine relative path for clicked image. Using filename only.", clickedImageSrc);
                }
            } catch (e) { // If clickedImageSrc is already a relative path (less likely for `img.src`)
                relativeClickedImageSrc = clickedImageSrc;
            }
            
            openLightbox(albumIndex, relativeClickedImageSrc);
        });
    });

    closeLightboxBtn.addEventListener('click', closeLightboxAction);
    prevBtn.addEventListener('click', showPrevImage);
    nextBtn.addEventListener('click', showNextImage);

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightboxAction();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (lightbox.style.display === 'flex') {
            if (e.key === "Escape") closeLightboxAction();
            if (e.key === "ArrowLeft") showPrevImage();
            if (e.key === "ArrowRight") showNextImage();
        }
    });

    // Basic Touch Swipe Functionality
    let touchstartX = 0;
    let touchendX = 0;
    const swipeThreshold = 50;

    lightboxImg.addEventListener('touchstart', (e) => {
        touchstartX = e.changedTouches[0].screenX;
    }, { passive: true });

    lightboxImg.addEventListener('touchend', (e) => {
        touchendX = e.changedTouches[0].screenX;
        handleSwipe();
    });

    function handleSwipe() {
        const swipeDistance = touchendX - touchstartX;
        if (Math.abs(swipeDistance) >= swipeThreshold) {
            if (swipeDistance < 0) { // Swiped left
                showNextImage();
            } else { // Swiped right
                showPrevImage();
            }
        }
    }
}