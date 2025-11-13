// Configuration
const SCROLL_THRESHOLD = 50; // Delta cumulé minimum pour déclencher un scroll
const DEBOUNCE_TIME = 800; // Temps de blocage après un scroll
const WHEEL_TIMEOUT = 150; // Temps pour réinitialiser l'accumulation

// État
let isScrolling = false;
let currentSectionIndex = 0;
let wheelDelta = 0;
let wheelTimeout = null;
let scrollTimeout = null;

const sections = document.querySelectorAll('.hero, .snap-section');

/**
 * Détecte la section actuellement visible avec précision
 */
function updateCurrentSection() {
  if (isScrolling) return; // Ne pas mettre à jour pendant une animation

  const viewportCenter = window.scrollY + window.innerHeight / 2;

  let closestIndex = 0;
  let closestDistance = Infinity;

  sections.forEach((section, index) => {
    const rect = section.getBoundingClientRect();
    const sectionCenter = window.scrollY + rect.top + section.offsetHeight / 2;
    const distance = Math.abs(viewportCenter - sectionCenter);

    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = index;
    }
  });

  currentSectionIndex = closestIndex;
}

/**
 * Vérifie si on peut scroller dans la direction donnée
 */
function canScrollToSection(direction) {
  const nextIndex = currentSectionIndex + direction;
  return nextIndex >= 0 && nextIndex < sections.length;
}

/**
 * Scroll vers une section avec debounce
 */
function scrollToSection(direction) {
  if (isScrolling) return;

  const nextIndex = currentSectionIndex + direction;

  // Si on dépasse les limites, on autorise le scroll natif
  if (nextIndex < 0 || nextIndex >= sections.length) {
    return;
  }

  // On bloque uniquement si on va réellement scroller vers une section
  isScrolling = true;

  // Met à jour l'index et scroll
  currentSectionIndex = nextIndex;
  sections[nextIndex].scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  });

  // Débloquer après le debounce
  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(() => {
    isScrolling = false;
    updateCurrentSection();
  }, DEBOUNCE_TIME);
}

/**
 * Gestionnaire d'événement wheel avec throttle et accumulation
 */
window.addEventListener(
  'wheel',
  (e) => {
    // Bloque pendant le scroll
    if (isScrolling) {
      e.preventDefault();
      return;
    }

    // Accumule les deltas
    wheelDelta += e.deltaY;

    // Reset le timeout de réinitialisation
    clearTimeout(wheelTimeout);
    wheelTimeout = setTimeout(() => {
      wheelDelta = 0;
    }, WHEEL_TIMEOUT);

    // Vérifie si le seuil est atteint
    if (Math.abs(wheelDelta) >= SCROLL_THRESHOLD) {
      const direction = wheelDelta > 0 ? 1 : -1;

      // Ne bloquer que si on peut scroller vers une section valide
      if (canScrollToSection(direction)) {
        e.preventDefault();
        wheelDelta = 0; // Reset immédiat
        clearTimeout(wheelTimeout);
        scrollToSection(direction);
      } else {
        // On est aux limites, reset et laisser le scroll natif
        wheelDelta = 0;
        clearTimeout(wheelTimeout);
      }
    }
  },
  { passive: false }
);

/**
 * Gestion de la fin de scroll manuel (sans wheel)
 */
let scrollEndTimeout = null;
window.addEventListener('scroll', () => {
  if (isScrolling) return;

  clearTimeout(scrollEndTimeout);
  scrollEndTimeout = setTimeout(() => {
    updateCurrentSection();
  }, 100);
});

// Initialisation
updateCurrentSection();

// Recalcul lors du redimensionnement
window.addEventListener('resize', () => {
  if (!isScrolling) {
    updateCurrentSection();
  }
});
