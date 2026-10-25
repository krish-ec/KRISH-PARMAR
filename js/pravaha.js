const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const themeButton = document.querySelector('#theme');
themeButton.addEventListener('click', () => {
  const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  window.setTheme(nextTheme, nextTheme === 'dark' ? '#06050f' : '#f4f1ff');
});
document.querySelector('#year').textContent = new Date().getFullYear();

const story = document.querySelector('#story');
const track = document.querySelector('#story-track');
const panels = [...track.querySelectorAll('.panel')];
const chapter = document.querySelector('#chapter');
const progress = document.querySelector('.progress');
const progressFill = document.querySelector('#progress-fill');
const previous = document.querySelector('#prev');
const next = document.querySelector('#next');
let framePending = false;

function updateStory() {
  framePending = false;
  if (matchMedia('(max-width: 760px)').matches || reduceMotion) return;
  const rect = story.getBoundingClientRect();
  const scrollDistance = story.offsetHeight - innerHeight;
  const amount = scrollDistance > 0 ? Math.min(1, Math.max(0, -rect.top / scrollDistance)) : 0;
  const maxOffset = Math.max(0, track.scrollWidth - innerWidth);
  track.style.transform = `translate3d(${-amount * maxOffset}px,0,0)`;
  const activePanel = Math.min(panels.length - 1, Math.round(amount * (panels.length - 1)));
  chapter.textContent = `${String(activePanel + 1).padStart(2, '0')} / ${String(panels.length).padStart(2, '0')}`;
  progress.setAttribute('aria-valuemax', String(panels.length));
  progress.setAttribute('aria-valuenow', String(activePanel + 1));
  progressFill.style.transform = `scaleX(${amount})`;
  previous.disabled = activePanel === 0;
  next.disabled = activePanel === panels.length - 1;
}
function scheduleUpdate() {
  if (!framePending) {
    framePending = true;
    requestAnimationFrame(updateStory);
  }
}
function goToPanel(index) {
  if (matchMedia('(max-width: 760px)').matches || reduceMotion) {
    panels[Math.max(0, Math.min(index, panels.length - 1))].scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    return;
  }
  const storyTop = story.getBoundingClientRect().top + scrollY;
  const maxScroll = story.offsetHeight - innerHeight;
  const amount = index / (panels.length - 1);
  scrollTo({ top: storyTop + amount * maxScroll, behavior: reduceMotion ? 'auto' : 'smooth' });
}
previous.addEventListener('click', () => {
  const index = Math.max(0, (Number(progress.getAttribute('aria-valuenow')) || 1) - 2);
  goToPanel(index);
});
next.addEventListener('click', () => {
  const index = Math.min(panels.length - 1, (Number(progress.getAttribute('aria-valuenow')) || 1));
  goToPanel(index);
});
addEventListener('scroll', scheduleUpdate, { passive: true });
addEventListener('resize', scheduleUpdate);
updateStory();
