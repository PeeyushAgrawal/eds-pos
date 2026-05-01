import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Banner block for promotional content with image and text overlay
 * @param {Element} block The banner block element
 */
export default function decorate(block) {
  const bannerContent = block.querySelector('div');
  if (!bannerContent) return;

  const banner = document.createElement('div');
  banner.className = 'banner-content';
  moveInstrumentation(bannerContent, banner);

  // Process image if present
  const picture = bannerContent.querySelector('picture');
  if (picture) {
    const img = picture.querySelector('img');
    if (img) {
      const optimizedPic = createOptimizedPicture(
        img.src,
        img.alt || 'Banner image',
        false,
        [{ width: '1200' }, { width: '768' }],
      );
      moveInstrumentation(img, optimizedPic.querySelector('img'));
      picture.replaceWith(optimizedPic);
    }

    const imageWrapper = document.createElement('div');
    imageWrapper.className = 'banner-image';
    imageWrapper.appendChild(picture);
    banner.appendChild(imageWrapper);
  }

  // Process text content
  const textElements = [...bannerContent.children].filter(
    (el) => el !== picture,
  );
  if (textElements.length > 0) {
    const textWrapper = document.createElement('div');
    textWrapper.className = 'banner-text';

    textElements.forEach((el) => {
      moveInstrumentation(el, el);
      textWrapper.appendChild(el);
    });

    banner.appendChild(textWrapper);
  }

  // Add CTA button styling
  const buttons = banner.querySelectorAll('a');
  buttons.forEach((button) => {
    if (button.textContent.trim()) {
      button.className = 'banner-cta';
      button.setAttribute('role', 'button');

      // Add keyboard accessibility
      button.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          button.click();
        }
      });
    }
  });

  block.replaceChildren(banner);

  // Add intersection observer for animation
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('banner-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 },
  );

  observer.observe(block);
}
