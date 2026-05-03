/**
 * Carousel utility for Adobe Experience Manager Edge Delivery Services
 * Provides reusable carousel functionality for any block with carousel class
 * Follows EDS performance patterns and accessibility standards
 */

/**
 * Reads carousel configuration from block classes and optional config row
 * @param {Element} root - The block element
 * @returns {Object} Configuration object
 */
export function readCarouselOptions(root) {
  const options = {
    itemSelector: ':scope > div',
    visibleItems: {
      mobile: 1,
      tablet: 1,
      desktop: 2,
    },
    indicators: 'none', // 'dots', 'count', or 'none'
    navigation: true,
    autoplay: false,
    loop: true,
  };

  // Read configuration from CSS classes
  const classList = Array.from(root.classList);

  // Check for column configuration
  const colsMatch = classList.find((cls) => cls.match(/^cols-([2-4])$/));
  if (colsMatch) {
    const cols = parseInt(colsMatch.split('-')[1], 10);
    options.visibleItems.desktop = cols;
    options.visibleItems.tablet = Math.min(cols, 2);
  }

  // Check for indicator configuration
  if (classList.includes('indicators-dots')) {
    options.indicators = 'dots';
  } else if (classList.includes('indicators-count')) {
    options.indicators = 'count';
  }

  // Read configuration from config row if present
  const configRow = root.querySelector(':scope > div:first-child');
  if (configRow && configRow.children.length === 2) {
    const firstCell = configRow.children[0];
    const secondCell = configRow.children[1];

    // Check if this looks like a config row (key-value pairs)
    if (firstCell.textContent.toLowerCase().includes('config')
      || firstCell.textContent.toLowerCase().includes('setting')) {
      // Parse config from second cell
      const configText = secondCell.textContent;
      const configLines = configText.split('\n').filter((line) => line.trim());

      configLines.forEach((line) => {
        const [key, value] = line.split(':').map((s) => s.trim());
        if (key && value) {
          switch (key.toLowerCase()) {
            case 'autoplay':
              options.autoplay = value.toLowerCase() === 'true';
              break;
            case 'loop':
              options.loop = value.toLowerCase() === 'true';
              break;
            case 'indicators':
              if (['dots', 'count', 'none'].includes(value.toLowerCase())) {
                options.indicators = value.toLowerCase();
              }
              break;
            default:
              break;
          }
        }
      });

      // Remove config row from DOM
      configRow.remove();
    }
  }

  return options;
}

/**
 * Utility function to debounce function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Gets current breakpoint based on window width
 * @returns {string} Current breakpoint (mobile, tablet, desktop)
 */
function getBreakpoint() {
  const width = window.innerWidth;
  if (width >= 1024) return 'desktop';
  if (width >= 768) return 'tablet';
  return 'mobile';
}

/**
 * Creates the carousel DOM structure
 * @param {Element} rootElement - Root element
 * @param {Array} carouselItems - Carousel items
 * @param {Object} configuration - Configuration object
 * @returns {Object} Carousel elements
 */
function createCarouselStructure(rootElement, carouselItems, configuration) {
  // Create container
  const containerElement = document.createElement('div');
  containerElement.className = 'carousel-container';
  containerElement.setAttribute('role', 'region');
  containerElement.setAttribute('aria-label', 'Carousel');

  // Create track
  const trackElement = document.createElement('div');
  trackElement.className = 'carousel-track';
  trackElement.setAttribute('role', 'list');

  // Move items to track
  carouselItems.forEach((item, index) => {
    item.className = `carousel-item ${item.className || ''}`;
    item.setAttribute('role', 'listitem');
    item.setAttribute('aria-label', `Slide ${index + 1} of ${carouselItems.length}`);
    trackElement.appendChild(item);
  });

  containerElement.appendChild(trackElement);

  // Create navigation
  let previousButton;
  let nextButton;
  if (configuration.navigation) {
    const nav = document.createElement('div');
    nav.className = 'carousel-navigation';

    previousButton = document.createElement('button');
    previousButton.className = 'carousel-btn carousel-btn-prev';
    previousButton.setAttribute('aria-label', 'Previous slide');
    previousButton.innerHTML = '<span aria-hidden="true">‹</span>';

    nextButton = document.createElement('button');
    nextButton.className = 'carousel-btn carousel-btn-next';
    nextButton.setAttribute('aria-label', 'Next slide');
    nextButton.innerHTML = '<span aria-hidden="true">›</span>';

    nav.appendChild(previousButton);
    nav.appendChild(nextButton);
    containerElement.appendChild(nav);
  }

  // Create indicators
  let indicatorElements;
  if (configuration.indicators !== 'none') {
    indicatorElements = document.createElement('div');
    indicatorElements.className = 'carousel-indicators';
    indicatorElements.setAttribute('role', 'tablist');
    indicatorElements.setAttribute('aria-label', 'Carousel slides');

    if (configuration.indicators === 'dots') {
      carouselItems.forEach((_, index) => {
        const dot = document.createElement('button');
        dot.className = 'carousel-indicator-dot';
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
        dot.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
        dot.dataset.index = index;
        indicatorElements.appendChild(dot);
      });
    } else if (configuration.indicators === 'count') {
      const counter = document.createElement('div');
      counter.className = 'carousel-counter';
      counter.setAttribute('aria-live', 'polite');
      counter.setAttribute('aria-atomic', 'true');
      indicatorElements.appendChild(counter);
    }

    containerElement.appendChild(indicatorElements);
  }

  // Replace original content
  rootElement.innerHTML = '';
  rootElement.appendChild(containerElement);

  return {
    container: containerElement,
    track: trackElement,
    prevBtn: previousButton,
    nextBtn: nextButton,
    indicators: indicatorElements,
  };
}

/**
 * Initializes carousel functionality on a block element
 * @param {Element} root - The block element to enhance with carousel
 * @param {Object} options - Configuration options
 * @returns {Object} Carousel instance with public methods
 */
export function initCarousel(root, options = {}) {
  // Validate root element
  if (!root || !(root instanceof Element)) {
    // console.error('Carousel: Invalid root element provided');
    return null;
  }

  // Merge default options
  const config = {
    itemSelector: ':scope > div',
    visibleItems: {
      mobile: 1,
      tablet: 1,
      desktop: 1,
    },
    indicators: 'none',
    navigation: true,
    autoplay: false,
    loop: true,
    ...options,
  };

  // Get carousel items
  const items = Array.from(root.querySelectorAll(config.itemSelector));

  if (items.length === 0) {
    // console.warn('Carousel: No items found with selector:', config.itemSelector);
    return null;
  }

  // State
  let currentIndex = 0;
  let isAnimating = false;
  let autoplayTimer = null;
  let touchStartX = 0;
  let touchEndX = 0;

  // Create carousel structure
  const carousel = createCarouselStructure(root, items, config);
  const {
    track,
    prevBtn,
    nextBtn,
    indicators,
  } = carousel;

  // Helper functions
  function getVisibleItemsCount() {
    const breakpoint = getBreakpoint();
    return config.visibleItems[breakpoint];
  }

  function updateCarouselLayout() {
    // Set CSS custom properties for responsive behavior
    const breakpoint = getBreakpoint();
    const visibleItems = config.visibleItems[breakpoint];

    root.style.setProperty('--carousel-visible-items', visibleItems);
    root.style.setProperty('--carousel-total-items', items.length);

    // Update track width - ensure proper calculation
    const trackWidth = (items.length / visibleItems) * 100;
    track.style.width = `${trackWidth}%`;

    // Set item flex properties
    items.forEach((item) => {
      item.style.flex = `0 0 calc((100% - (var(--carousel-gap) * (${visibleItems} - 1))) / ${visibleItems})`;
    });
  }

  function updateNavigationState() {
    if (!prevBtn || !nextBtn) return;

    const maxIndex = items.length - getVisibleItemsCount();

    if (config.loop) {
      prevBtn.disabled = false;
      nextBtn.disabled = false;
    } else {
      prevBtn.disabled = currentIndex === 0;
      nextBtn.disabled = currentIndex >= maxIndex;
    }
  }

  function updateIndicators() {
    if (!indicators) return;

    if (config.indicators === 'dots') {
      const dots = indicators.querySelectorAll('.carousel-indicator-dot');
      dots.forEach((dot, index) => {
        const isActive = index === currentIndex;
        dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
        dot.classList.toggle('active', isActive);
      });
    } else if (config.indicators === 'count') {
      const counter = indicators.querySelector('.carousel-counter');
      if (counter) {
        counter.textContent = `${currentIndex + 1} of ${items.length}`;
      }
    }
  }

  function updateAriaAttributes() {
    items.forEach((item, index) => {
      const isVisible = index >= currentIndex && index < currentIndex + getVisibleItemsCount();
      item.setAttribute('aria-hidden', isVisible ? 'false' : 'true');

      if (index === currentIndex) {
        item.setAttribute('aria-current', 'true');
      } else {
        item.removeAttribute('aria-current');
      }
    });
  }

  function updateCarousel(animate = true) {
    if (animate) {
      isAnimating = true;
      track.addEventListener('transitionend', () => {
        isAnimating = false;
      }, { once: true });
    }

    // Update transform with proper calculation
    const visibleItems = getVisibleItemsCount();
    const totalItems = items.length;
    const trackWidth = (totalItems / visibleItems) * 100;
    const slideWidth = trackWidth / totalItems;
    const offset = -(currentIndex * slideWidth);

    track.style.transform = `translateX(${offset}%)`;

    // Update navigation state
    updateNavigationState();

    // Update indicators
    updateIndicators();

    // Update ARIA attributes
    updateAriaAttributes();
  }

  function goToSlide(index, animate = true) {
    if (isAnimating || index === currentIndex) return;

    const maxIndex = items.length - getVisibleItemsCount();
    const targetIndex = Math.max(0, Math.min(index, maxIndex));

    currentIndex = targetIndex;
    updateCarousel(animate);
  }

  function goToNext() {
    if (isAnimating) return;

    const visibleItems = getVisibleItemsCount();
    const maxIndex = items.length - visibleItems;
    let nextIndex = currentIndex + 1; // Slide by 1 item instead of visibleItems

    if (nextIndex > maxIndex) {
      nextIndex = config.loop ? 0 : maxIndex;
    }

    goToSlide(nextIndex);
  }

  function goToPrevious() {
    if (isAnimating) return;

    const visibleItems = getVisibleItemsCount();
    const maxIndex = items.length - visibleItems;
    let prevIndex = currentIndex - 1; // Slide by 1 item instead of visibleItems

    if (prevIndex < 0) {
      prevIndex = config.loop ? maxIndex : 0;
    }

    goToSlide(prevIndex);
  }

  function handleKeydown(e) {
    if (!e.target.closest('.carousel-container')) return;

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        goToPrevious();
        break;
      case 'ArrowRight':
        e.preventDefault();
        goToNext();
        break;
      case 'Home':
        e.preventDefault();
        goToSlide(0);
        break;
      case 'End':
        e.preventDefault();
        goToSlide(items.length - getVisibleItemsCount());
        break;
      default:
        break;
    }
  }

  function handleTouchStart(e) {
    touchStartX = e.touches[0].clientX;
  }

  function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        goToNext();
      } else {
        goToPrevious();
      }
    }
  }

  function handleTouchEnd(e) {
    touchEndX = e.changedTouches[0].clientX;
    handleSwipe();
  }

  function handleMouseDown(event) {
    event.preventDefault();
    touchStartX = event.clientX;

    const handleMouseMove = (moveEvent) => {
      touchEndX = moveEvent.clientX;
    };

    const handleMouseUp = () => {
      handleSwipe();
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }

  function startAutoplay() {
    if (!config.autoplay || autoplayTimer) return;

    autoplayTimer = setInterval(() => {
      goToNext();
    }, 5000);
  }

  function pauseAutoplay() {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  }

  function setupEventListeners() {
    // Navigation buttons
    if (prevBtn) {
      prevBtn.addEventListener('click', () => goToPrevious());
      nextBtn.addEventListener('click', () => goToNext());
    }

    // Indicator dots
    if (indicators && config.indicators === 'dots') {
      indicators.addEventListener('click', (e) => {
        if (e.target.classList.contains('carousel-indicator-dot')) {
          const index = parseInt(e.target.dataset.index, 10);
          goToSlide(index);
        }
      });
    }

    // Keyboard navigation
    root.addEventListener('keydown', handleKeydown);

    // Touch/swipe support
    track.addEventListener('touchstart', handleTouchStart, { passive: true });
    track.addEventListener('touchend', handleTouchEnd, { passive: true });

    // Mouse drag support
    track.addEventListener('mousedown', handleMouseDown);

    // Pause autoplay on hover/focus
    if (config.autoplay) {
      root.addEventListener('mouseenter', pauseAutoplay);
      root.addEventListener('mouseleave', startAutoplay);
      root.addEventListener('focusin', pauseAutoplay);
      root.addEventListener('focusout', startAutoplay);
    }

    // Responsive updates
    window.addEventListener('resize', debounce(updateCarouselLayout, 250));
  }

  function setupCarousel() {
    // Add carousel classes
    root.classList.add('carousel-initialized');

    // Set up responsive behavior
    updateCarouselLayout();

    // Set up event listeners
    setupEventListeners();

    // Initialize position
    updateCarousel(false);

    // Start autoplay if enabled
    if (config.autoplay) {
      startAutoplay();
    }
  }

  // Initialize carousel
  setupCarousel();

  // Public API
  const api = {
    goToSlide,
    goToNext,
    goToPrevious,
    getCurrentIndex: () => currentIndex,
    getTotalItems: () => items.length,
    destroy() {
      pauseAutoplay();
      window.removeEventListener('resize', updateCarouselLayout);
      root.classList.remove('carousel-initialized');
    },
  };

  return api;
}

// Auto-initialize carousels when DOM is ready
if (typeof window !== 'undefined') {
  // This will be called by EDS when blocks are loaded
  window.addEventListener('DOMContentLoaded', () => {
    // EDS will handle initialization through block decorators
  });
}
