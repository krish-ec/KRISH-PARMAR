(function () {
  function init() {
    var button = document.getElementById('theme');
    if (!button) return;

    button.classList.add('theme-lamp');
    if (!button.querySelector('.lamp-bulb')) {
      var bulb = document.createElement('span');
      bulb.className = 'lamp-bulb';
      bulb.setAttribute('aria-hidden', 'true');
      var filament = document.createElement('span');
      filament.className = 'lamp-filament';
      filament.setAttribute('aria-hidden', 'true');
      bulb.appendChild(filament);
      button.appendChild(bulb);
    }
    if (!button.querySelector('.lamp-cap')) {
      var cap = document.createElement('span');
      cap.className = 'lamp-cap';
      cap.setAttribute('aria-hidden', 'true');
      button.appendChild(cap);
    }
    if (!button.querySelector('.lamp-pull')) {
      var pull = document.createElement('span');
      pull.className = 'lamp-pull';
      pull.setAttribute('aria-hidden', 'true');
      button.appendChild(pull);
    }
    button.addEventListener('click', function () {
      var next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      window.setTheme(next, next === 'dark' ? '#06050f' : '#f4f1eb');
    });

    var pulling = false;
    var startY = 0;
    var pullDistance = 0;
    button.addEventListener('pointerdown', function (event) {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      pulling = true;
      startY = event.clientY;
      pullDistance = 0;
      button.classList.remove('is-releasing');
      button.style.setProperty('--pull-y', '0px');
      button.classList.add('is-pulling');
      if (event.isTrusted) button.setPointerCapture(event.pointerId);
    });

    button.addEventListener('pointermove', function (event) {
      if (!pulling) return;
      pullDistance = Math.max(0, Math.min(24, event.clientY - startY));
      button.style.setProperty('--pull-y', pullDistance + 'px');
    });

    button.addEventListener('pointerup', function (event) {
      if (!pulling) return;
      pulling = false;
      button.classList.remove('is-pulling');
      button.style.setProperty('--release-y', pullDistance + 'px');
      button.style.setProperty('--pull-y', '0px');
      button.classList.add('is-releasing');
      window.setTimeout(function () { button.classList.remove('is-releasing'); }, 520);
      if (event.isTrusted && button.hasPointerCapture(event.pointerId)) button.releasePointerCapture(event.pointerId);
    });

    button.addEventListener('pointercancel', function () {
      pulling = false;
      button.classList.remove('is-pulling');
      button.style.setProperty('--release-y', pullDistance + 'px');
      button.style.setProperty('--pull-y', '0px');
      button.classList.add('is-releasing');
      window.setTimeout(function () { button.classList.remove('is-releasing'); }, 520);
    });

  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
