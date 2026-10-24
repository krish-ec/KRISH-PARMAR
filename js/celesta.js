const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const themeButton = document.querySelector('#theme');
themeButton.addEventListener('click', () => {
  const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = nextTheme;
  document.querySelector('meta[name="theme-color"]').content = nextTheme === 'dark' ? '#080808' : '#f3f1ee';
  try { localStorage.setItem('theme', nextTheme); } catch (error) { console.warn('Could not save the theme preference.', error); }
});

const story = document.querySelector('#story');
const moments = [...document.querySelectorAll('.moment')];
const chapter = document.querySelector('#chapter');
const progress = document.querySelector('.progress');
const progressFill = document.querySelector('#progress-fill');
const previous = document.querySelector('#prev');
const next = document.querySelector('#next');
let framePending = false;
let activeIndex = -1;

function setMoment(index) {
  const boundedIndex = Math.max(0, Math.min(index, moments.length - 1));
  const stackedView = matchMedia('(max-width: 800px)').matches || reduceMotion;
  activeIndex = boundedIndex;
  moments.forEach((moment, momentIndex) => {
    moment.classList.toggle('active', momentIndex === activeIndex);
    moment.classList.toggle('past', momentIndex < activeIndex);
    moment.setAttribute('aria-hidden', String(!stackedView && momentIndex !== activeIndex));
  });
  chapter.textContent = `${String(activeIndex + 1).padStart(2, '0')} / ${String(moments.length).padStart(2, '0')}`;
  progress.setAttribute('aria-valuenow', String(activeIndex + 1));
  progressFill.style.transform = `scaleX(${activeIndex / (moments.length - 1)})`;
  previous.disabled = activeIndex === 0;
  next.disabled = activeIndex === moments.length - 1;
}

function updateStory() {
  framePending = false;
  if (matchMedia('(max-width: 800px)').matches || reduceMotion) {
    setMoment(activeIndex < 0 ? 0 : activeIndex);
    return;
  }
  const scrollDistance = story.offsetHeight - innerHeight;
  const amount = scrollDistance > 0
    ? Math.min(1, Math.max(0, -story.getBoundingClientRect().top / scrollDistance))
    : 0;
  setMoment(Math.round(amount * (moments.length - 1)));
}

function scheduleUpdate() {
  if (!framePending) {
    framePending = true;
    requestAnimationFrame(updateStory);
  }
}

function goToMoment(index) {
  const boundedIndex = Math.max(0, Math.min(index, moments.length - 1));
  if (matchMedia('(max-width: 800px)').matches || reduceMotion) {
    moments[boundedIndex].scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    return;
  }
  const storyTop = story.getBoundingClientRect().top + scrollY;
  const maxScroll = story.offsetHeight - innerHeight;
  scrollTo({
    top: storyTop + (boundedIndex / (moments.length - 1)) * maxScroll,
    behavior: reduceMotion ? 'auto' : 'smooth'
  });
}

previous.addEventListener('click', () => goToMoment(activeIndex - 1));
next.addEventListener('click', () => goToMoment(activeIndex + 1));
addEventListener('scroll', scheduleUpdate, { passive: true });
addEventListener('resize', scheduleUpdate);
setMoment(0);
updateStory();
