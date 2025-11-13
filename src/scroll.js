let scrollCount = 0;
let lastDirection = 0;
let isScrolling = false;
let currentSectionIndex = 0;

const sections = document.querySelectorAll('.hero, .snap-section');
const SCROLL_THRESHOLD = 2;

function updateCurrentSection() {
  // Si on est tout en haut, on est forcément sur le hero
  if (window.scrollY < 100) {
    currentSectionIndex = 0;
    return;
  }

  // Sinon, on détecte la section visible
  const scrollPos = window.scrollY + 200; // Point de référence plus haut

  sections.forEach((section, index) => {
    const rect = section.getBoundingClientRect();
    const sectionTop = window.scrollY + rect.top;
    const sectionBottom = sectionTop + section.offsetHeight;

    if (scrollPos >= sectionTop && scrollPos < sectionBottom) {
      currentSectionIndex = index;
    }
  });
}

window.addEventListener(
  'wheel',
  e => {
    if (isScrolling) {
      e.preventDefault();
      return;
    }

    const direction = e.deltaY > 0 ? 1 : -1;

    if (direction !== lastDirection) {
      scrollCount = 0;
      lastDirection = direction;
    }

    scrollCount++;

    if (scrollCount >= SCROLL_THRESHOLD) {
      e.preventDefault();
      isScrolling = true;
      scrollCount = 0;

      updateCurrentSection();
      const nextIndex = currentSectionIndex + direction;

      if (nextIndex >= 0 && nextIndex < sections.length) {
        currentSectionIndex = nextIndex;
        sections[nextIndex].scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      setTimeout(() => {
        isScrolling = false;
        lastDirection = 0;
      }, 1000);
    }
  },
  { passive: false }
);

window.addEventListener('scrollend', () => {
  if (!isScrolling) {
    updateCurrentSection();
  }
});

// Initialise au chargement
updateCurrentSection();
