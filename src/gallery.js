/**
 * Système Masonry pour la galerie
 * Place les images en colonnes optimisées pour éliminer les espaces vides
 */

/**
 * Calcule la largeur optimale des colonnes en fonction de l'espace disponible
 * @returns {Object} { columnWidth, visibleColumns }
 */
function calculateOptimalColumnWidth() {
  const container = document.querySelector('.gallery-container');
  const containerWidth = container.clientWidth; // Largeur visible

  const minColumnWidth = 250;
  const maxColumnWidth = 500;
  const gap = 16;

  // Calculer combien de colonnes peuvent tenir dans l'espace visible
  let visibleColumns = Math.floor((containerWidth + gap) / (minColumnWidth + gap));

  // Calculer la largeur optimale pour ces colonnes
  let optimalWidth = (containerWidth - (visibleColumns - 1) * gap) / visibleColumns;

  // Limiter entre min et max
  if (optimalWidth > maxColumnWidth) {
    optimalWidth = maxColumnWidth;
    // Recalculer le nombre de colonnes avec la largeur max
    visibleColumns = Math.floor((containerWidth + gap) / (maxColumnWidth + gap));
  } else if (optimalWidth < minColumnWidth) {
    optimalWidth = minColumnWidth;
  }

  return {
    columnWidth: Math.floor(optimalWidth),
    visibleColumns: visibleColumns
  };
}

function initMasonry() {
  const container = document.querySelector('.gallery-grid');
  const items = Array.from(document.querySelectorAll('.gallery-item'));

  if (items.length === 0) return;

  // Configuration dynamique
  const { columnWidth, visibleColumns } = calculateOptimalColumnWidth();
  const gap = 16;
  const containerHeight = container.parentElement.clientHeight;

  console.log(`Masonry: ${columnWidth}px columns, ${visibleColumns} visible, ${items.length} items`);

  // Calculer le nombre TOTAL de colonnes nécessaires
  // On veut avoir au moins visibleColumns, mais on peut en avoir plus
  // pour distribuer les images de manière optimale

  // Estimer la hauteur moyenne d'une image (basé sur les ratios)
  const avgAspectRatio = 1.5; // Ratio portrait moyen (plus haute que large)
  const avgItemHeight = columnWidth * avgAspectRatio;

  // Calculer combien d'images peuvent tenir par colonne en moyenne
  const itemsPerColumn = Math.floor((containerHeight + gap) / (avgItemHeight + gap));

  // Calculer le nombre optimal de colonnes pour distribuer toutes les images
  let optimalColumnCount = Math.ceil(items.length / Math.max(1, itemsPerColumn));

  // S'assurer d'avoir au moins les colonnes visibles (pour remplir l'écran)
  optimalColumnCount = Math.max(optimalColumnCount, visibleColumns);

  console.log(`Distribution: ${optimalColumnCount} columns, ~${itemsPerColumn} items per column`);

  // Créer les colonnes vides
  const columns = Array.from({ length: optimalColumnCount }, () => ({
    height: 0,
    items: []
  }));

  // Distribuer les images avec l'algorithme "colonne la plus courte"
  items.forEach(item => {
    const img = item.querySelector('img');

    // Utiliser les dimensions naturelles si disponibles, sinon estimer
    let aspectRatio;
    if (img.naturalWidth && img.naturalHeight) {
      aspectRatio = img.naturalHeight / img.naturalWidth;
    } else {
      aspectRatio = avgAspectRatio;
    }

    const itemHeight = columnWidth * aspectRatio;

    // Trouver la colonne la plus courte
    let shortestColumnIndex = 0;
    let minHeight = columns[0].height;

    for (let i = 1; i < columns.length; i++) {
      if (columns[i].height < minHeight) {
        minHeight = columns[i].height;
        shortestColumnIndex = i;
      }
    }

    // Ajouter l'item à la colonne la plus courte
    columns[shortestColumnIndex].items.push(item);
    columns[shortestColumnIndex].height += itemHeight + gap;
  });

  // Reconstruire le DOM avec les colonnes
  container.innerHTML = '';

  columns.forEach(column => {
    const columnEl = document.createElement('div');
    columnEl.className = 'gallery-column';
    columnEl.style.width = `${columnWidth}px`;
    columnEl.style.flexShrink = '0';

    column.items.forEach(item => {
      columnEl.appendChild(item);
    });

    container.appendChild(columnEl);
  });

  // Définir la largeur totale du grid
  const totalWidth = columns.length * (columnWidth + gap);
  container.style.width = `${totalWidth}px`;

  console.log(`Masonry created: ${columns.length} columns, total width: ${totalWidth}px`);
}

// Attendre le chargement de toutes les images avant d'initialiser
function waitForImages() {
  const images = document.querySelectorAll('.gallery-item img');
  console.log(`Attente du chargement de ${images.length} images`);

  // Forcer le chargement eager pour toutes les images
  images.forEach(img => {
    if (img.loading === 'lazy') {
      img.loading = 'eager';
    }
  });

  const promises = [];

  images.forEach((img, index) => {
    if (img.complete && img.naturalWidth) {
      console.log(`Image ${index} déjà chargée`);
      promises.push(Promise.resolve());
    } else {
      console.log(`Attente du chargement de l'image ${index}`);
      promises.push(
        new Promise((resolve, reject) => {
          img.addEventListener('load', () => {
            console.log(`Image ${index} chargée: ${img.naturalWidth}x${img.naturalHeight}`);
            resolve();
          });
          img.addEventListener('error', () => {
            console.error(`Erreur de chargement de l'image ${index}`);
            reject();
          });

          // Timeout de secours après 5 secondes
          setTimeout(() => {
            console.warn(`Timeout pour l'image ${index}, résolution forcée`);
            resolve();
          }, 5000);
        })
      );
    }
  });

  return Promise.all(promises);
}

// Initialiser après le chargement du DOM et des images
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM chargé, initialisation de la galerie masonry');

  waitForImages()
    .then(() => {
      console.log('Toutes les images sont chargées');
      initMasonry();
    })
    .catch(err => {
      console.error('Erreur lors du chargement des images:', err);
      // Initialiser quand même pour éviter une galerie vide
      initMasonry();
    });
});

// Réinitialiser au resize avec debounce pour optimiser les performances
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    console.log('Resize détecté, réinitialisation du masonry');
    initMasonry();
  }, 250);
});