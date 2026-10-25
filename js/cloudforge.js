const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const themeButton = document.querySelector('#theme');
themeButton.addEventListener('click', () => {
  const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  window.setTheme(nextTheme, nextTheme === 'dark' ? '#080a10' : '#f3f4f6');
});

const story = document.querySelector('#incident');
const topology = document.querySelector('#topology');
const title = document.querySelector('#story-title');
const body = document.querySelector('#story-body');
const number = document.querySelector('#story-number');
const kicker = document.querySelector('#story-kicker');
const tags = document.querySelector('#story-tags');
const terminal = document.querySelector('#terminal-lines');
const status = document.querySelector('#stage-status');
const dbState = document.querySelector('#db-state');
const progress = document.querySelector('.stage-progress');
const progressFill = document.querySelector('#progress-fill');
const stageIndex = document.querySelector('#stage-index');
const previous = document.querySelector('#story-prev');
const next = document.querySelector('#story-next');
const scenes = [
  {
    kicker: 'THE MISSION',
    title: 'Cloud isn’t a quiz.<br/><em>It’s a system.</em>',
    body: 'Start with a working architecture. Then follow the evidence when something breaks. CloudForge makes the reasoning—not memorizing service names—the main event.',
    tags: ['LEARN', 'BUILD', 'INVESTIGATE'],
    scene: 'mission',
    status: 'SYSTEM NOMINAL',
    db: 'TABLE ONLINE',
    lines: [['$ connect --environment aws-lab', ''], ['✓ Isolated lab environment ready', 'ok'], ['$ healthcheck --all', ''], ['✓ API · Lambda · DynamoDB operational', 'ok']]
  },
  {
    kicker: 'BUILD THE PATH',
    title: 'Three services.<br/><em>One request.</em>',
    body: 'Trace a learner request from API Gateway through Lambda and into DynamoDB. The architecture is a connected system, not a list of flash cards.',
    tags: ['API GATEWAY', 'LAMBDA', 'DYNAMODB'],
    scene: 'build',
    status: 'ALL SERVICES HEALTHY',
    db: 'TABLE ONLINE',
    lines: [['$ map --architecture serverless', ''], ['✓ API Gateway → Lambda', 'ok'], ['✓ Lambda → DynamoDB', 'ok'], ['$ deploy --environment lab', '']]
  },
  {
    kicker: 'THE BREAK',
    title: 'Then one call<br/><em>fails.</em>',
    body: 'A simulated incident interrupts the flow. The database is online, the API is answering—but Lambda cannot read the table. The first clue is a 403.',
    tags: ['INCIDENT', '403 FORBIDDEN', 'ACCESS DENIED'],
    scene: 'incident',
    status: 'INCIDENT DETECTED',
    db: 'TABLE ONLINE',
    lines: [['$ run quest serverless-rescue', ''], ['! 403 AccessDeniedException', 'error'], ['✕ dynamodb:GetItem denied', 'error'], ['$ investigate --logs', '']]
  },
  {
    kicker: 'FOLLOW THE EVIDENCE',
    title: 'Read the signal.<br/><em>Not the noise.</em>',
    body: 'The error points to authorization, not an unavailable service. Learners inspect the execution role and use evidence to narrow the cause before changing anything.',
    tags: ['CHECK THE LOGS', 'TRACE IAM', 'TEST A HYPOTHESIS'],
    scene: 'investigate',
    status: 'EVIDENCE FOUND',
    db: 'TABLE ONLINE',
    lines: [['$ logs --service lambda --tail', ''], ['AccessDenied: dynamodb:GetItem', 'error'], ['role: cloudlab-lambda-execution', 'hint'], ['$ inspect --policy attached', '']]
  },
  {
    kicker: 'THINK IT THROUGH',
    title: 'A mentor asks<br/><em>one better question.</em>',
    body: 'Instead of pasting a fix, the AI mentor prompts the learner to explain what the logs actually prove—reinforcing a method they can use in the next incident.',
    tags: ['SOCRATIC PROMPTS', 'REASON FROM PROOF', 'EXPLAIN THE WHY'],
    scene: 'mentor',
    status: 'MENTOR GUIDANCE',
    db: 'TABLE ONLINE',
    lines: [['mentor@cloudforge:~', 'hint'], ['What evidence points to permissions?', 'hint'], ['$ compare policy with table action', ''], ['→ Look for dynamodb:GetItem', 'ok']]
  },
  {
    kicker: 'MISSION COMPLETE',
    title: 'Fix the policy.<br/><em>Earn the intuition.</em>',
    body: 'The learner aligns the role policy with the required action, verifies the request, and earns progress. The point is not just a green check—it is understanding why the system failed.',
    tags: ['403 → 200 OK', '+250 XP', 'IAM DETECTIVE'],
    scene: 'complete',
    status: 'QUEST RESOLVED',
    db: 'READ SUCCESSFUL',
    lines: [['$ policy update --action GetItem', ''], ['✓ Permission scoped to lab table', 'ok'], ['$ retry --request learner-progress', ''], ['✓ 200 OK · +250 XP earned', 'ok']]
  }
];
let active = -1;
let scheduled = false;

function renderLines(lines) {
  terminal.replaceChildren(...lines.map(([text, type]) => {
    const line = document.createElement('p');
    if (type) line.className = type;
    const [prefix, ...rest] = text.split(' ');
    if (['$', '✓', '!', '✕', '→'].includes(prefix)) {
      const marker = document.createElement('b');
      marker.textContent = prefix;
      line.append(marker, document.createTextNode(` ${rest.join(' ')}`));
    } else {
      line.textContent = text;
    }
    return line;
  }));
  const cursor = document.createElement('p');
  cursor.className = 'cursor-line';
  const prompt = document.createElement('b');
  prompt.textContent = '$';
  const caret = document.createElement('i');
  cursor.append(prompt, document.createTextNode(' '), caret);
  terminal.append(cursor);
}

function setScene(index) {
  const nextIndex = Math.max(0, Math.min(index, scenes.length - 1));
  if (nextIndex === active) return;
  active = nextIndex;
  const scene = scenes[active];
  number.textContent = String(active + 1).padStart(2, '0');
  kicker.textContent = scene.kicker;
  title.innerHTML = scene.title;
  body.textContent = scene.body;
  tags.replaceChildren(...scene.tags.map(label => {
    const item = document.createElement('span');
    item.textContent = label;
    return item;
  }));
  topology.dataset.scene = scene.scene;
  status.textContent = scene.status;
  dbState.textContent = scene.db;
  stageIndex.textContent = String(active + 1).padStart(2, '0');
  progress.setAttribute('aria-valuenow', String(active + 1));
  progressFill.style.transform = `scaleX(${active / (scenes.length - 1)})`;
  renderLines(scene.lines);
  previous.disabled = active === 0;
  next.disabled = active === scenes.length - 1;
}

function updateStory() {
  scheduled = false;
  if (matchMedia('(max-width: 700px)').matches) return;
  const distance = story.offsetHeight - innerHeight;
  const amount = distance > 0
    ? Math.min(1, Math.max(0, -story.getBoundingClientRect().top / distance))
    : 0;
  setScene(Math.round(amount * (scenes.length - 1)));
}

function scheduleUpdate() {
  if (!scheduled) {
    scheduled = true;
    requestAnimationFrame(updateStory);
  }
}

function goToScene(index) {
  const target = Math.max(0, Math.min(index, scenes.length - 1));
  if (matchMedia('(max-width: 700px)').matches) {
    setScene(target);
    document.querySelector('.story-copy').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    return;
  }
  const storyTop = story.getBoundingClientRect().top + scrollY;
  const maxScroll = story.offsetHeight - innerHeight;
  scrollTo({ top: storyTop + target / (scenes.length - 1) * maxScroll, behavior: reduceMotion ? 'auto' : 'smooth' });
}

previous.addEventListener('click', () => goToScene(active - 1));
next.addEventListener('click', () => goToScene(active + 1));
addEventListener('scroll', scheduleUpdate, { passive: true });
addEventListener('resize', scheduleUpdate);
setScene(0);
updateStory();
