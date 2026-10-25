try { var t = localStorage.getItem('theme'); if (t) document.documentElement.dataset.theme = t; } catch (e) {}

window.setTheme = function (theme, themeColor) {
  var applyTheme = function () {
    document.documentElement.dataset.theme = theme;
    var colorMeta = document.querySelector('meta[name="theme-color"]');
    if (colorMeta) colorMeta.content = themeColor;
    try { localStorage.setItem('theme', theme); } catch (error) { console.warn('Could not save the theme preference.', error); }
  };

  if (matchMedia('(prefers-reduced-motion: reduce)').matches || typeof document.startViewTransition !== 'function') {
    applyTheme();
    return;
  }

  document.startViewTransition(applyTheme);
};
