// js/gallery.js

document.addEventListener('DOMContentLoaded', () => {
    // Only run gallery-specific code if we are on the gallery page
    // and the main gallery container exists.
    const galleryContainer = document.getElementById('image-gallery-container');
    if (window.location.pathname.includes('gallery.html') && galleryContainer) {
        loadGalleryData();
    }
});

let originalGalleryDataStore = []; // Changed variable name for clarity

async function fetchGalleryData() {
    try {
        const response = await fetch('data/gallery.json'); // Path relative to HTML (gallery.html)
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} fetching gallery.json`);
        }
        originalGalleryDataStore = await response.json();
        return originalGalleryDataStore;
    } catch (error) {
        console.error("Could not fetch gallery data:", error);
        originalGalleryDataStore = []; // Reset on error
        return [];
    }
}

function displayGalleryAlbums(albumsToDisplay, containerElement) {
    if (!containerElement) {
        console.error("Gallery container element not found for display.");
        return;
    }
    // Sort albums by ID descending (newest first)
    const sortedAlbumsForDisplay = [...albumsToDisplay].sort((a, b) => b.id - a.id);

    if (sortedAlbumsForDisplay.length === 0) {
        containerElement.innerHTML = '<p class="placeholder-text">No gallery albums to display at the moment.</p>';
        return;
    }

    let galleryHTML = '';
    sortedAlbumsForDisplay.forEach((album) => {
        const coverImage = (album.image && album.image.length > 0) ? album.image[0] : 'images/gallery_placeholder_default.jpg'; // Path relative to HTML
        
        galleryHTML += `
            <div class="gallery-item" data-album-id="${album.id}">
                <img src="${coverImage}" alt="${album.title}">
                <div class="gallery-item-caption">${album.title}</div>
            </div>
        `;
    });
    containerElement.innerHTML = galleryHTML;
}

async function loadGalleryData() {
    const galleryContainer = document.getElementById('image-gallery-container');
    // This check might be redundant if DOMContentLoaded already checks, but good for direct calls
    if (!galleryContainer) { 
        console.error("Gallery container (#image-gallery-container) not found by loadGalleryData.");
        return;
    }
    galleryContainer.innerHTML = '<p class="loading-text">Loading gallery...</p>';

    const albums = await fetchGalleryData(); // Fetches and stores in originalGalleryDataStore
    displayGalleryAlbums(albums, galleryContainer); // Display them
    
    initializeGalleryScrollAnimations();
    initializeGalleryLightbox(); // Uses the global originalGalleryDataStore
}

function initializeGalleryScrollAnimations() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    if (!galleryItems.length) return;

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1 // Trigger when 10% of the item is visible
    };

    const observerCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target); // Stop observing once animated
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
        console.warn("One or more lightbox elements are missing. Lightbox functionality will be affected.");
        return;
    }
    if (galleryItems.length === 0) {
        // console.log("No gallery items found to attach lightbox listeners.");
        return;
    }

    function openLightbox(targetAlbumId) {
        // Find the album from the globally stored originalGalleryDataStore
        const selectedAlbum = originalGalleryDataStore.find(album => album.id === targetAlbumId);

        if (!selectedAlbum || !selectedAlbum.image || selectedAlbum.image.length === 0) {
            console.error("Lightbox: Album not found or has no images. Album ID:", targetAlbumId);
            return;
        }

        currentAlbumImagesForLightbox = selectedAlbum.image;
        currentAlbumTitleForLightbox = selectedAlbum.title;
        currentImageIndexInLightbox = 0; // Always start with the first image of the album

        updateLightboxDisplay();
        lightbox.style.display = 'flex'; // Use flex for centering
        document.body.style.overflow = 'hidden'; // Prevent body scroll
    }

    function updateLightboxDisplay() {
        if (currentAlbumImagesForLightbox.length === 0) return;
        
        // Ensure index is within bounds
        currentImageIndexInLightbox = Math.max(0, Math.min(currentImageIndexInLightbox, currentAlbumImagesForLightbox.length - 1));

        // Paths in currentAlbumImagesForLightbox are already relative to HTML (e.g., "images/gallery/...")
        lightboxImg.src = currentAlbumImagesForLightbox[currentImageIndexInLightbox];
        lightboxImg.alt = `${currentAlbumTitleForLightbox} - Image ${currentImageIndexInLightbox + 1}`;
        if (lightboxCaption) lightboxCaption.textContent = currentAlbumTitleForLightbox;
        if (lightboxCounter) lightboxCounter.textContent = `${currentImageIndexInLightbox + 1} / ${currentAlbumImagesForLightbox.length}`;

        const isSingleImageAlbum = currentAlbumImagesForLightbox.length <= 1;
        prevBtn.style.display = isSingleImageAlbum ? 'none' : 'block';
        nextBtn.style.display = isSingleImageAlbum ? 'none' : 'block';
        
        prevBtn.classList.toggle('disabled', currentImageIndexInLightbox === 0);
        nextBtn.classList.toggle('disabled', currentImageIndexInLightbox === currentAlbumImagesForLightbox.length - 1);
    }

    function closeLightboxAction() {
        lightbox.style.display = 'none';
        lightboxImg.src = ''; // Clear the image
        document.body.style.overflow = 'auto'; // Restore body scroll
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
            const albumId = parseInt(item.dataset.albumId);
            if (isNaN(albumId)) {
                console.error("Clicked gallery item has invalid or missing data-album-id.");
                return;
            }
            openLightbox(albumId);
        });
    });

    closeLightboxBtn.addEventListener('click', closeLightboxAction);
    prevBtn.addEventListener('click', showPrevImage);
    nextBtn.addEventListener('click', showNextImage);

    lightbox.addEventListener('click', (e) => { // Close if clicked on backdrop
        if (e.target === lightbox) {
            closeLightboxAction();
        }
    });

    document.addEventListener('keydown', (e) => { // Keyboard navigation
        if (lightbox.style.display === 'flex') { // Check if lightbox is visible
            if (e.key === "Escape") closeLightboxAction();
            if (e.key === "ArrowLeft") showPrevImage();
            if (e.key === "ArrowRight") showNextImage();
        }
    });

    // Basic Touch Swipe Functionality
    let touchstartX = 0;
    let touchendX = 0;
    const swipeThreshold = 50; // Min pixels for a swipe

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