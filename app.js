const state = {
  questions: [],
  results: [],
  adjectives: [],
  scoringRules: null,
  hiddenTraits: null,
  current: 0,
  answers: [],
  scores: { n: {}, adj: {} },
  heat: 0
};

const loadingMessages = [
  '正在扫描你的班味浓度……',
  '正在匹配牛马兽人格皮肤……',
  '正在计算你还能撑几天……',
  '正在生成工位人格诊断报告……'
];

const rarityMap = {
  deadline_warrior: { level: 'SS', rate: '5.8%' },
  office_ghost: { level: 'SSS', rate: '3.6%' },
  caffeine_factory: { level: 'SS', rate: '5.2%' },
  doc_alchemist: { level: 'SS', rate: '4.9%' },
  black_pot_dealer: { level: 'SSS', rate: '3.2%' },
  balloon_collector: { level: 'SSS', rate: '3.5%' },
  bubble_roll_king: { level: 'SSSS', rate: '1.9%' },
  anti_pua_fighter: { level: 'SSSS', rate: '1.7%' },
  paid_poop_king: { level: 'SSS', rate: '2.8%' },
  ai_master: { level: 'SS', rate: '4.2%' },
  requirement_transformer: { level: 'SSS', rate: '2.6%' },
  work_emperor: { level: 'WIN', rate: '0.3%' }
};



const resultThemes = {
  deadline_warrior: { bg: '#fff0e8', accent: '#f0a071', soft: '#fff1e5', shadow: 'rgba(215, 126, 75, 0.16)' },
  office_ghost: { bg: '#eef4f6', accent: '#9eb8c5', soft: '#f0f7fa', shadow: 'rgba(102, 136, 150, 0.16)' },
  caffeine_factory: { bg: '#f7eee5', accent: '#c99367', soft: '#fff1df', shadow: 'rgba(153, 100, 57, 0.16)' },
  doc_alchemist: { bg: '#fff5df', accent: '#e2b75f', soft: '#fff6dc', shadow: 'rgba(191, 145, 55, 0.16)' },
  black_pot_dealer: { bg: '#f0ece7', accent: '#9f8a78', soft: '#f7efe8', shadow: 'rgba(106, 91, 79, 0.16)' },
  balloon_collector: { bg: '#eef5ff', accent: '#d7a7d9', soft: '#f6edff', shadow: 'rgba(164, 113, 177, 0.14)' },
  bubble_roll_king: { bg: '#f8effb', accent: '#ead07a', soft: '#fff5cf', shadow: 'rgba(190, 150, 52, 0.14)' },
  anti_pua_fighter: { bg: '#eef8f1', accent: '#8fc99d', soft: '#eff9f0', shadow: 'rgba(82, 154, 99, 0.14)' },
  paid_poop_king: { bg: '#fff4df', accent: '#d6aa61', soft: '#fff3d9', shadow: 'rgba(166, 117, 45, 0.15)' },
  ai_master: { bg: '#eef1ff', accent: '#9fa8e8', soft: '#f1f3ff', shadow: 'rgba(96, 106, 190, 0.15)' },
  requirement_transformer: { bg: '#f2f4e9', accent: '#d1b860', soft: '#faf5d9', shadow: 'rgba(156, 136, 50, 0.15)' },
  work_emperor: { bg: '#fff5dc', accent: '#d9aa45', soft: '#fff3d0', shadow: 'rgba(178, 128, 35, 0.17)' }
};

function applyResultTheme(resultId) {
  const theme = resultThemes[resultId] || resultThemes.deadline_warrior;
  screens.result.style.setProperty('--result-bg', theme.bg);
  screens.result.style.setProperty('--result-accent', theme.accent);
  screens.result.style.setProperty('--result-soft', theme.soft);
  screens.result.style.setProperty('--result-shadow', theme.shadow);
}

const screens = {
  home: document.getElementById('home'),
  quiz: document.getElementById('quiz'),
  loading: document.getElementById('loading'),
  result: document.getElementById('result')
};

const els = {
  startBtn: document.getElementById('startBtn'),
  backBtn: document.getElementById('backBtn'),
  restartBtn: document.getElementById('restartBtn'),
  saveBtn: document.getElementById('saveBtn'),
  homeHeat: document.getElementById('homeHeat'),
  currentIndex: document.getElementById('currentIndex'),
  totalCount: document.getElementById('totalCount'),
  progressBar: document.getElementById('progressBar'),
  questionTitle: document.getElementById('questionTitle'),
  optionsList: document.getElementById('optionsList'),
  loadingText: document.getElementById('loadingText'),
  resultImage: document.getElementById('resultImage'),
  resultTitle: document.getElementById('resultTitle'),
  rarityBadge: document.getElementById('rarityBadge'),
  rateBadge: document.getElementById('rateBadge'),
  hiddenTraitText: document.getElementById('hiddenTraitText'),
  secondaryNText: document.getElementById('secondaryNText'),
  resultTagline: document.getElementById('resultTagline'),
  resultDescription: document.getElementById('resultDescription'),
  adjDescription: document.getElementById('adjDescription'),
  resultMotto: document.getElementById('resultMotto'),
  manualList: document.getElementById('manualList')
};

function formatNumber(num) {
  return String(num).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function randomHeat() {
  return Math.floor(32000 + Math.random() * 52000);
}

async function loadJson(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`加载配置失败：${path}`);
  }
  return response.json();
}

async function init() {
  try {
    const [questions, results, adjectives, hiddenTraits, scoringRules] = await Promise.all([
      loadJson('data/questions.json'),
      loadJson('data/results.json'),
      loadJson('data/adjectives.json'),
      loadJson('data/hiddenTraits.json'),
      loadJson('data/scoringRules.json')
    ]);

    state.questions = questions;
    state.results = results;
    state.adjectives = adjectives;
    state.hiddenTraits = hiddenTraits;
    state.scoringRules = scoringRules;
    state.heat = randomHeat();
    els.homeHeat.textContent = formatNumber(state.heat);
    els.totalCount.textContent = state.questions.length;
  } catch (error) {
    console.error(error);
    alert('配置加载失败。请确认文件结构完整，并通过 GitHub Pages 或本地静态服务打开页面。');
  }
}

function showScreen(name) {
  Object.values(screens).forEach(screen => screen.classList.remove('active'));
  screens[name].classList.add('active');
  window.scrollTo(0, 0);
}

function startQuiz() {
  state.current = 0;
  state.answers = [];
  state.scores = { n: {}, adj: {} };
  showScreen('quiz');
  renderQuestion();
}

function renderQuestion() {
  const question = state.questions[state.current];
  const currentNumber = state.current + 1;
  const total = state.questions.length;

  els.currentIndex.textContent = String(currentNumber).padStart(2, '0');
  els.questionTitle.textContent = question.title;
  els.progressBar.style.width = `${(currentNumber - 1) / total * 100}%`;
  els.optionsList.innerHTML = '';

  question.options.forEach(option => {
    const button = document.createElement('button');
    button.className = 'option-card';
    button.type = 'button';
    button.innerHTML = `
      <span class="option-label">${escapeHtml(option.label)}</span>
      <span class="option-text">${escapeHtml(option.text)}</span>
    `;
    button.addEventListener('click', () => selectOption(option));
    els.optionsList.appendChild(button);
  });
}

function selectOption(option) {
  const question = state.questions[state.current];
  state.answers.push({ questionId: question.id, optionId: option.id });
  addScores(option.scores);

  if (state.current < state.questions.length - 1) {
    state.current += 1;
    renderQuestion();
  } else {
    els.progressBar.style.width = '100%';
    showLoadingThenResult();
  }
}

function addScores(scores) {
  Object.entries(scores.n || {}).forEach(([id, value]) => {
    state.scores.n[id] = (state.scores.n[id] || 0) + value;
  });
  Object.entries(scores.adj || {}).forEach(([id, value]) => {
    state.scores.adj[id] = (state.scores.adj[id] || 0) + value;
  });
}

function goBack() {
  if (state.current === 0) {
    showScreen('home');
    return;
  }
  startQuizFromAnswers(state.answers.slice(0, -1));
}

function startQuizFromAnswers(answers) {
  state.current = 0;
  state.answers = [];
  state.scores = { n: {}, adj: {} };

  answers.forEach(answer => {
    const question = state.questions.find(item => item.id === answer.questionId);
    const option = question?.options.find(item => item.id === answer.optionId);
    if (option) {
      state.answers.push(answer);
      addScores(option.scores);
      state.current += 1;
    }
  });

  renderQuestion();
}

function showLoadingThenResult() {
  showScreen('loading');
  let index = 0;
  els.loadingText.textContent = loadingMessages[index];

  const timer = setInterval(() => {
    index += 1;
    els.loadingText.textContent = loadingMessages[index % loadingMessages.length];
  }, 520);

  setTimeout(() => {
    clearInterval(timer);
    renderResult();
    showScreen('result');
  }, 1680);
}

function sortedScoreEntries(scoreMap) {
  return Object.entries(scoreMap).sort((a, b) => b[1] - a[1]);
}

function shouldTriggerHidden(sortedN) {
  const rule = state.scoringRules.hiddenResult.implementation;
  if (sortedN.length < rule.minNCount) return false;
  const topScore = sortedN[0]?.[1] || 0;
  const fourthScore = sortedN[rule.minNCount - 1]?.[1] || 0;
  const countAboveThreshold = sortedN.filter(([, score]) => score >= rule.minNScore).length;
  return topScore - fourthScore <= rule.topMinusFourthMax && countAboveThreshold >= rule.minNCount;
}

function pickResult() {
  const sortedN = sortedScoreEntries(state.scores.n);
  const sortedAdj = sortedScoreEntries(state.scores.adj);
  const hiddenTriggered = shouldTriggerHidden(sortedN);
  const nId = hiddenTriggered ? state.scoringRules.hiddenResult.id : sortedN[0]?.[0];
  const adjId = sortedAdj[0]?.[0];
  const secondaryAdjIds = sortedAdj.slice(1, 3).map(([id]) => id);
  const secondaryNIds = sortedN
    .map(([id]) => id)
    .filter(id => id !== nId)
    .slice(0, 1);
  return { nId, adjId, secondaryAdjIds, secondaryNIds, hiddenTriggered, sortedN, sortedAdj };
}

function compactText(labels) {
  return labels.length ? labels.join(' / ') : '加载失败但还在硬撑';
}

function renderResult() {
  const picked = pickResult();
  const result = state.results.find(item => item.id === picked.nId) || state.results[0];
  const adjective = state.adjectives.find(item => item.id === picked.adjId) || state.adjectives[0];
  const secondaryAdjs = picked.secondaryAdjIds
    .map(id => state.adjectives.find(item => item.id === id)?.name)
    .filter(Boolean);
  const secondaryNs = picked.secondaryNIds
    .map(id => state.results.find(item => item.id === id)?.name)
    .filter(Boolean);
  const rarity = rarityMap[result.id] || { level: 'SS', rate: '9.9%' };
  applyResultTheme(result.id);

  els.resultTitle.textContent = `${adjective.name}${result.name}`;
  els.rarityBadge.textContent = rarity.level;
  els.rateBadge.textContent = `牛马兽稀有度 ${rarity.rate}`;
  els.resultTagline.textContent = result.tagline;
  els.adjDescription.textContent = adjective.description;
  els.resultDescription.innerHTML = paragraphsToHtml(result.description);
  els.resultMotto.textContent = result.motto;
  els.hiddenTraitText.textContent = compactText(secondaryAdjs);
  els.secondaryNText.textContent = compactText(secondaryNs);
  els.manualList.innerHTML = '';

  (result.manual || []).forEach(item => {
    const li = document.createElement('li');
    li.textContent = item;
    els.manualList.appendChild(li);
  });

  if (result.image) {
    els.resultImage.classList.add('has-image');
    els.resultImage.innerHTML = `<img src="${escapeHtml(result.image)}" alt="${escapeHtml(result.name)}" />`;
  } else {
    els.resultImage.classList.remove('has-image');
    els.resultImage.innerHTML = '<span>牛马兽</span>';
  }
}

function paragraphsToHtml(text) {
  return String(text || '')
    .split(/\n\s*\n/)
    .filter(Boolean)
    .map(paragraph => `<p>${escapeHtml(paragraph).replace(/\n/g, '<br>')}</p>`)
    .join('');
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function ensureShareModal() {
  let modal = document.getElementById('shareModal');
  if (modal) return modal;

  modal = document.createElement('div');
  modal.id = 'shareModal';
  modal.className = 'share-modal';
  modal.innerHTML = `
    <div class="share-modal-backdrop" data-close-share="true"></div>
    <div class="share-modal-panel" role="dialog" aria-modal="true" aria-label="保存结果图">
      <button class="share-modal-close" type="button" data-close-share="true" aria-label="关闭">×</button>
      <p class="share-modal-title">结果图已生成</p>
      <p class="share-modal-tip">手机端可长按图片保存；电脑端可右键保存图片。</p>
      <div class="share-image-wrap">
        <img id="sharePreviewImage" alt="工位人格测试结果图" />
      </div>
      <a id="shareDownloadLink" class="primary-btn share-download" download="workstation-personality-result.png">下载结果图</a>
    </div>
  `;
  document.body.appendChild(modal);
  modal.addEventListener('click', (event) => {
    if (event.target.dataset.closeShare === 'true') {
      closeShareModal();
    }
  });
  return modal;
}

function openShareModal(imageUrl) {
  const modal = ensureShareModal();
  const preview = modal.querySelector('#sharePreviewImage');
  const download = modal.querySelector('#shareDownloadLink');
  preview.src = imageUrl;
  download.href = imageUrl;
  modal.classList.add('show');
  document.body.classList.add('share-modal-open');
}

function closeShareModal() {
  const modal = document.getElementById('shareModal');
  if (!modal) return;
  modal.classList.remove('show');
  document.body.classList.remove('share-modal-open');
}

async function saveResultTip() {
  const target = document.querySelector('.poster-card');
  if (!target) {
    alert('还没有生成结果页，请先完成测试。');
    return;
  }

  if (typeof html2canvas !== 'function') {
    alert('结果图生成组件加载失败，请刷新页面后重试。');
    return;
  }

  const originalText = els.saveBtn.textContent;
  els.saveBtn.disabled = true;
  els.saveBtn.textContent = '生成中...';

  try {
    const canvas = await html2canvas(target, {
      backgroundColor: null,
      scale: Math.min(2.5, window.devicePixelRatio || 2),
      useCORS: true,
      allowTaint: false,
      logging: false,
      scrollX: 0,
      scrollY: -window.scrollY,
      windowWidth: document.documentElement.clientWidth,
      windowHeight: document.documentElement.clientHeight
    });

    const imageUrl = canvas.toDataURL('image/png');
    openShareModal(imageUrl);
  } catch (error) {
    console.error(error);
    alert('结果图生成失败，可以先用系统截图保存。');
  } finally {
    els.saveBtn.disabled = false;
    els.saveBtn.textContent = originalText;
  }
}

els.startBtn.addEventListener('click', startQuiz);
els.backBtn.addEventListener('click', goBack);
els.restartBtn.addEventListener('click', startQuiz);
els.saveBtn.addEventListener('click', saveResultTip);

init();
