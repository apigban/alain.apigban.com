// Hero Section JavaScript Enhancements
document.addEventListener('DOMContentLoaded', function() {
  // Enhanced typing animation
  const heroSection = document.querySelector('#home');
  const typedElement = document.getElementById('typed');
  const typingData = document.getElementById('typing-carousel-data');

  if (typedElement && typingData) {
    const items = Array.from(typingData.children).map(li => li.textContent);
    let itemIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function typeWriter() {
      const current = items[itemIndex];

      if (isDeleting) {
        typedElement.textContent = current.substring(0, charIndex - 1);
        charIndex--;
      } else {
        typedElement.textContent = current.substring(0, charIndex + 1);
        charIndex++;
      }

      let typeSpeed = isDeleting ? 50 : 100;

      if (!isDeleting && charIndex === current.length) {
        typeSpeed = 2000; // Pause at end
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        itemIndex = (itemIndex + 1) % items.length;
        typeSpeed = 500; // Pause before next
      }

      setTimeout(typeWriter, typeSpeed);
    }

    typeWriter();
  }

  // Add parallax effect to hero background
  window.addEventListener('scroll', function() {
    const scrolled = window.pageYOffset;
    const bgElement = document.getElementById('homePageBackgroundImageDivStyled');

    if (bgElement && heroSection) {
      const rate = scrolled * -0.5;
      bgElement.style.transform = `translateY(${rate}px)`;
    }
  });

  // Add smooth scroll for CTA arrow
  const arrowLink = document.querySelector('.arrow-center');
  if (arrowLink) {
    arrowLink.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // Preload background images for performance
  const bgImages = [
    'bg_hu_267893f0b6f3da70.png',
    'bg_hu_6dca053c5ee00a69.png',
    'bg_hu_39aee7ffeac9cfdc.png',
    'bg_hu_503cdc396c38c550.png',
    'bg.png'
  ];

  function preloadBackground(index) {
    if (index < bgImages.length) {
      const img = new Image();
      img.onload = () => {
        setTimeout(() => preloadBackground(index + 1), 100);
      };
      img.src = `/images/background/${bgImages[index]}`;
    }
  }

  // Start preloading after initial load
  window.addEventListener('load', () => preloadBackground(0));

  // Add accessibility improvements
  const typingCarousel = document.querySelector('.typing-carousel');
  if (typingCarousel) {
    typingCarousel.setAttribute('role', 'text');
    typingCarousel.setAttribute('aria-live', 'polite');
    typingCarousel.setAttribute('aria-label', 'Animated introduction');
  }

  // Add keyboard navigation for social links
  const socialLinks = document.querySelectorAll('.hero-social a');
  socialLinks.forEach(link => {
    link.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.click();
      }
    });
  });

  // Add intersection observer for performance optimizations
  if ('IntersectionObserver' in window) {
    const heroObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('hero-visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    const heroElements = document.querySelectorAll('.hero-tagline, .hero-actions, .hero-social');
    heroElements.forEach(el => heroObserver.observe(el));
  }
});