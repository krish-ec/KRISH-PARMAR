const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const themeButton = document.querySelector('#theme');
themeButton.addEventListener('click', () => {
  const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = nextTheme;
  document.querySelector('meta[name="theme-color"]').content = nextTheme === 'dark' ? '#06050f' : '#f5f2eb';
  try { localStorage.setItem('theme', nextTheme); } catch (error) { console.warn('Could not save the theme preference.', error); }
});
document.querySelector('#year').textContent = new Date().getFullYear();

const desk = document.querySelector('#desk');
const modeLabel = document.querySelector('#mode-label');
const progress = document.querySelector('#read-progress');
const chapters = [...document.querySelectorAll('.chapter')];
const modeNames = {
  home: 'Daily overview',
  timetable: 'Weekly timetable',
  tasks: 'Academic to-do',
  focus: 'Pomodoro focus',
  saved: 'Saved on this browser'
};
function setActiveChapter(chapter) {
  const mode = chapter.dataset.mode;
  desk.dataset.mode = mode;
  modeLabel.textContent = modeNames[mode];
  chapters.forEach(item => {
    const active = item === chapter;
    item.classList.toggle('active', active);
    if (active) item.setAttribute('aria-current', 'step');
    else item.removeAttribute('aria-current');
  });
  document.querySelectorAll('[data-nav]').forEach(item => item.classList.toggle('active', item.dataset.nav === mode));
  const title = document.querySelector('#app-title');
  title.textContent = mode === 'home' ? 'Good morning, Alex'
    : mode === 'timetable' ? 'Your weekly timetable'
    : mode === 'tasks' ? 'A little progress adds up'
    : mode === 'focus' ? 'Time to focus'
    : 'Welcome back, Alex';
}
const observer = new IntersectionObserver(entries => {
  const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
  if (visible.length) setActiveChapter(visible[0].target);
}, { rootMargin: '-38% 0px -38% 0px', threshold: [0, .1, .25, .5, .75, 1] });
chapters.forEach(chapter => observer.observe(chapter));

let scheduled = false;
function updateProgress() {
  scheduled = false;
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
}
addEventListener('scroll', () => {
  if (!scheduled) {
    scheduled = true;
    requestAnimationFrame(updateProgress);
  }
}, { passive: true });
addEventListener('resize', updateProgress);
updateProgress();
