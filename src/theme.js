// Gestion du thème
const themeToggle = document.getElementById('theme-toggle');
const THEMES = ['light', 'dark', 'auto'];
let currentThemeIndex = 0;

// Fonction pour obtenir le thème du système
function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// Fonction pour appliquer le thème
function applyTheme(theme) {
  const icons = themeToggle.querySelectorAll('.theme-icon');
  icons.forEach(icon => (icon.style.display = 'none'));

  if (theme === 'auto') {
    const systemTheme = getSystemTheme();
    document.body.setAttribute('data-theme', systemTheme === 'dark' ? 'alt' : 'default');
    themeToggle.querySelector('.theme-icon-auto').style.display = 'block';
    themeToggle.setAttribute('title', 'Thème : Système (' + (systemTheme === 'dark' ? 'sombre' : 'clair') + ')');
  } else if (theme === 'dark') {
    document.body.setAttribute('data-theme', 'alt');
    themeToggle.querySelector('.theme-icon-dark').style.display = 'block';
    themeToggle.setAttribute('title', 'Thème : Sombre');
  } else {
    document.body.removeAttribute('data-theme');
    themeToggle.querySelector('.theme-icon-light').style.display = 'block';
    themeToggle.setAttribute('title', 'Thème : Clair');
  }
}

// Charger le thème sauvegardé ou utiliser 'auto' par défaut
const savedTheme = localStorage.getItem('theme') || 'auto';
currentThemeIndex = THEMES.indexOf(savedTheme);
if (currentThemeIndex === -1) currentThemeIndex = 2; // auto par défaut
applyTheme(THEMES[currentThemeIndex]);

// Écouter les changements de thème système si mode auto
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  if (THEMES[currentThemeIndex] === 'auto') {
    applyTheme('auto');
  }
});

// Basculer entre les thèmes au clic
themeToggle.addEventListener('click', () => {
  currentThemeIndex = (currentThemeIndex + 1) % THEMES.length;
  const newTheme = THEMES[currentThemeIndex];
  localStorage.setItem('theme', newTheme);
  applyTheme(newTheme);
});
