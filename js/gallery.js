/* =====================================================
   thehitchedstories - Gallery JavaScript
   Filtering, Lightbox, Video Handling
   ===================================================== */

document.addEventListener('DOMContentLoaded', function () {
    initGalleryFilters();
    initLightbox();
    initVideoHover();
    initVideoModal();
    initLazyImages();
});

/* ----- Gallery Filters ----- */
function initGalleryFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');

    if (!filterBtns.length || !galleryItems.length) return;

    filterBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            // Update active button
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            const filter = this.dataset.filter;

            galleryItems.forEach(item => {
                const isMatch = filter === 'all'
                    ? true
                    : item.dataset.category === filter;

                if (isMatch) {
                    item.style.display = '';
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'scale(1)';
                    }, 10);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.8)';
                    setTimeout(() => {
                        item.style.display = 'none';
                    }, 300);
                }
            });
        });
    });
}

/* ----- Lightbox ----- */
function initLightbox() {
    const galleryItems = document.querySelectorAll('.gallery-item:not(.gallery-item--video)');
    const lightbox = document.querySelector('.lightbox');

    if (!lightbox) return;

    const lightboxImg = lightbox.querySelector('.lightbox__content img');
    const closeBtn = lightbox.querySelector('.lightbox__close');
    const prevBtn = lightbox.querySelector('.lightbox__prev');
    const nextBtn = lightbox.querySelector('.lightbox__next');

    let currentImages = [];
    let currentIndex = 0;

    function openLightbox(index, images) {
        currentImages = images;
        currentIndex = index;
        updateLightboxImage();
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    function updateLightboxImage() {
        if (lightboxImg && currentImages[currentIndex]) {
            lightboxImg.src = currentImages[currentIndex];
        }
    }

    function nextImage() {
        currentIndex = (currentIndex + 1) % currentImages.length;
        updateLightboxImage();
    }

    function prevImage() {
        currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
        updateLightboxImage();
    }

    // Click on gallery items
    galleryItems.forEach((item, index) => {
        item.addEventListener('click', function () {
            const images = Array.from(galleryItems).map(i => {
                const img = i.querySelector('img');
                return img ? img.src : '';
            }).filter(Boolean);

            openLightbox(index, images);
        });
    });

    // Close button
    if (closeBtn) {
        closeBtn.addEventListener('click', closeLightbox);
    }

    // Navigation
    if (prevBtn) prevBtn.addEventListener('click', prevImage);
    if (nextBtn) nextBtn.addEventListener('click', nextImage);

    // Close on backdrop click
    lightbox.addEventListener('click', function (e) {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    // Keyboard navigation
    document.addEventListener('keydown', function (e) {
        if (!lightbox.classList.contains('active')) return;

        switch (e.key) {
            case 'Escape':
                closeLightbox();
                break;
            case 'ArrowLeft':
                prevImage();
                break;
            case 'ArrowRight':
                nextImage();
                break;
        }
    });
}

/* ----- Video Hover Autoplay ----- */
function initVideoHover() {
    const videoItems = document.querySelectorAll('.gallery-item--video');

    videoItems.forEach(item => {
        const video = item.querySelector('video');
        if (!video) return;

        item.addEventListener('mouseenter', function () {
            video.play().catch(() => { });
        });

        item.addEventListener('mouseleave', function () {
            video.pause();
            video.currentTime = 0;
        });
    });
}

/* ----- Video Modal ----- */
function initVideoModal() {
    const videoModal = document.querySelector('.video-modal');
    if (!videoModal) return;

    const videoContainer = videoModal.querySelector('.video-modal__content');
    const closeBtn = videoModal.querySelector('.video-modal__close');
    // Support both local videos (data-video-src) and YouTube embeds (data-video-url, data-video)
    const videoTriggers = document.querySelectorAll('[data-video-url], [data-video-src], [data-video]');

    function openVideoModal(videoSrc, isLocal) {
        // Clear container first
        videoContainer.innerHTML = '';

        if (isLocal) {
            // Create HTML5 video element for local files
            const video = document.createElement('video');
            video.src = videoSrc;
            video.controls = true;
            video.autoplay = true;
            video.style.width = '100%';
            video.style.maxHeight = '80vh';
            video.style.backgroundColor = '#000';
            videoContainer.appendChild(video);
        } else {
            // Create iframe for YouTube/Vimeo embeds
            const iframe = document.createElement('iframe');
            iframe.src = videoSrc + '?autoplay=1';
            iframe.allow = 'autoplay; fullscreen';
            iframe.allowFullscreen = true;
            videoContainer.appendChild(iframe);
        }

        // Add close button back
        const close = document.createElement('button');
        close.className = 'video-modal__close';
        close.innerHTML = '&times;';
        close.setAttribute('aria-label', 'Close video');
        close.addEventListener('click', closeVideoModal);
        videoContainer.appendChild(close);

        videoModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeVideoModal() {
        videoModal.classList.remove('active');
        document.body.style.overflow = '';

        // Clear video/iframe to stop playback
        setTimeout(() => {
            const video = videoContainer.querySelector('video');
            const iframe = videoContainer.querySelector('iframe');
            if (video) {
                video.pause();
                video.remove();
            }
            if (iframe) iframe.remove();
        }, 300);
    }

    // Click triggers
    videoTriggers.forEach(trigger => {
        trigger.addEventListener('click', function (e) {
            e.preventDefault();
            const localVideoSrc = this.dataset.videoSrc;
            const youtubeUrl = this.dataset.videoUrl || this.dataset.video;

            if (localVideoSrc) {
                openVideoModal(localVideoSrc, true);
            } else if (youtubeUrl) {
                openVideoModal(youtubeUrl, false);
            }
        });
    });

    // Close button
    if (closeBtn) {
        closeBtn.addEventListener('click', closeVideoModal);
    }

    // Close on backdrop click
    videoModal.addEventListener('click', function (e) {
        if (e.target === videoModal) {
            closeVideoModal();
        }
    });

    // Escape key
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && videoModal.classList.contains('active')) {
            closeVideoModal();
        }
    });
}

/* ----- Lazy Images Fade-in with Responsive Cloudinary ----- */
function initLazyImages() {
    const lazyImgs = document.querySelectorAll('.gallery-grid img');
    if (!lazyImgs.length) return;

    // Determine optimal image width based on screen size and grid columns
    const screenWidth = window.innerWidth;
    let optimalWidth;

    if (screenWidth <= 480) {
        optimalWidth = 300;  // Mobile: single column, smaller images
    } else if (screenWidth <= 768) {
        optimalWidth = 400;  // Tablet: 2 columns
    } else {
        optimalWidth = 500;  // Desktop: 3 columns
    }

    lazyImgs.forEach(img => {
        img.loading = 'lazy';
        img.decoding = 'async';
        img.classList.add('lazy-img');

        // Optimize Cloudinary URLs by adding responsive transformations
        const src = img.getAttribute('src');
        if (src && src.includes('res.cloudinary.com') && !src.includes(',w_')) {
            // Add width transformation for Cloudinary images that don't have one
            const optimizedSrc = src.replace(
                '/upload/',
                `/upload/f_auto,q_auto,w_${optimalWidth}/`
            );
            img.setAttribute('src', optimizedSrc);
        }

        const markLoaded = () => img.classList.add('is-loaded');
        if (img.complete) {
            markLoaded();
        } else {
            img.addEventListener('load', markLoaded, { once: true });
        }
    });
}
