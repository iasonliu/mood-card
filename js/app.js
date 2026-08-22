/* ─────────────────────────────────────────────────────────────
   MoodHand Main App Controller & Event Bus
   ───────────────────────────────────────────────────────────── */
import { SVG_ICONS, WEATHER_ITEMS, MOOD_DATABASE } from './config.js';
import { rngFrom, pick, jit } from './draw-engine.js';
import { renderDoodleScene, eggState, triggerEggBanner, spawnSvgFx } from './avatar-scene.js';
import { SoundEngine, SpeechEngine, triggerHaptic } from './audio.js';
import { saveCardToHistory, getHistoryRecords } from './storage.js';
import { Avatar3DRig } from './avatar-3d.js';

// 初始化核心服务
export const sound = new SoundEngine();
export const speech = new SpeechEngine();

// DOM 元素引用
const avatarCanvas = document.getElementById('avatarCanvas');
const userInput = document.getElementById('userInput');
const dateDisplay = document.getElementById('date-display');
const weatherDisplay = document.getElementById('weather-display');
const personaText = document.getElementById('persona-text');
const tagCapsule = document.getElementById('tag-capsule');
const tagIconWrap = document.getElementById('tag-icon-wrap');
const tagText = document.getElementById('tag-text');
const quoteText = document.getElementById('quote-text');
const quoteSource = document.getElementById('quote-source');
const fortuneDo = document.getElementById('fortune-do');
const fortuneDont = document.getElementById('fortune-dont');
const energyTitle = document.getElementById('energy-title');
const energyValue = document.getElementById('energy-value');
const energyBar = document.getElementById('energy-bar');
const authorSig = document.getElementById('author-sig');
const moodCard = document.getElementById('mood-card');
const avatarStage = document.getElementById('avatar-stage');
const pokeTipText = document.getElementById('poke-tip-text');
const moodTabs = document.querySelectorAll('.mood-tab');
const themeCircles = document.querySelectorAll('.theme-circle');
const btnRandom = document.getElementById('btn-random');
const btnExport = document.getElementById('btn-export');
const btnShareWechat = document.getElementById('btn-share-wechat');
const btnShareXHS = document.getElementById('btn-share-xhs');
const wechatMask = document.getElementById('wechat-mask');
const xhsMask = document.getElementById('xhs-mask');
const btnCloseWechatMask = document.getElementById('btn-close-wechat-mask');
const btnCloseXhsMask = document.getElementById('btn-close-xhs-mask');
const btnXhsDirectShare = document.getElementById('btn-xhs-direct-share');
const xhsPreviewBox = document.getElementById('xhs-preview-box');
const toast = document.getElementById('toast');
const toastText = document.getElementById('toast-text');
const btnSoundToggle = document.getElementById('btn-sound-toggle');
const soundIcon = document.getElementById('sound-icon');
const btnHistoryToggle = document.getElementById('btn-history-toggle');
const historyDrawer = document.getElementById('history-drawer');
const btnCloseHistory = document.getElementById('btn-close-history');
const historyList = document.getElementById('history-list');
const btnSpeechRead = document.getElementById('btn-speech-read');
const speechText = document.getElementById('speech-text');
const btnDimensionToggle = document.getElementById('btn-dimension-toggle');
const dimText = document.getElementById('dim-text');
const btnGyroToggle = document.getElementById('btn-gyro-toggle');
const card3DWrapper = document.getElementById('card-3d-wrapper');

let currentMoodKey = 'happy';
let currentSeed = 'seed-' + Date.now();
let currentTheme = 'pine';
let is3DMode = false;
let avatar3D = null;

// 初始化日期
const now = new Date();
const formattedDate = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;
dateDisplay.textContent = formattedDate;

export function showToast(msg) {
  toastText.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2200);
}

function updateSoundButtonState() {
  if (sound.isMuted) {
    soundIcon.innerHTML = `<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>`;
  } else {
    soundIcon.innerHTML = `<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>`;
  }
}

function updateQRCode(shareURL) {
  const qrContainer = document.getElementById('card-qrcode');
  if (!qrContainer) return;
  qrContainer.innerHTML = '';
  try {
    if (typeof QRCode !== 'undefined') {
      new QRCode(qrContainer, {
        text: shareURL,
        width: 28,
        height: 28,
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.L
      });
    } else {
      qrContainer.innerHTML = `<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`;
    }
  } catch (e) {}
}

export function buildShareURL() {
  const url = new URL(window.location.href.split('?')[0]);
  const name = userInput.value.trim();
  if (name) url.searchParams.set('name', name);
  url.searchParams.set('mood', currentMoodKey);
  url.searchParams.set('seed', currentSeed);
  url.searchParams.set('theme', currentTheme);
  return url.toString();
}

export function updateAppCard(seed, moodKey = null, shouldSave = true) {
  currentSeed = seed || 'default';
  const rng = rngFrom(currentSeed);

  if (moodKey) {
    currentMoodKey = moodKey;
  } else {
    const keys = Object.keys(MOOD_DATABASE);
    currentMoodKey = pick(rng, keys);
  }

  const moodData = MOOD_DATABASE[currentMoodKey] || MOOD_DATABASE.happy;
  
  const rawInput = userInput.value.trim().toLowerCase();
  if (rawInput.includes('卡皮巴拉') || rawInput.includes('水豚') || rawInput.includes('capybara')) {
    if (eggState.specialKeyword !== 'capybara') {
      sound.playMagic();
      triggerHaptic('medium');
      spawnSvgFx('paw', 18);
      triggerEggBanner('已触发隐藏彩蛋：卡皮巴拉情绪附体！');
    }
    eggState.specialKeyword = 'capybara';
    personaText.textContent = '隐藏款：终极佛系水豚卡皮巴拉';
    tagText.textContent = '头顶小橙子';
    fortuneDo.textContent = '泡温泉 / 情绪极其稳定';
    fortuneDont.textContent = '焦虑内耗 / 被世俗打扰';
  } else if (rawInput.includes('猫') || rawInput.includes('cat') || rawInput.includes('喵')) {
    if (eggState.specialKeyword !== 'cat') {
      sound.playMagic();
      triggerHaptic('medium');
      spawnSvgFx('paw', 16);
      triggerEggBanner('已触发隐藏彩蛋：喵星人附体！');
    }
    eggState.specialKeyword = 'cat';
    personaText.textContent = '隐藏款：尊贵的高冷猫主子';
    tagText.textContent = '喵星人附体';
    fortuneDo.textContent = '大口吃肉 / 伸懒腰发呆';
    fortuneDont.textContent = '被无聊人类打扰 / 剪指甲';
  } else if (rawInput.includes('暴富') || rawInput.includes('发财') || rawInput.includes('money') || rawInput.includes('金币')) {
    if (eggState.specialKeyword !== 'money') {
      sound.playCoin();
      triggerHaptic('medium');
      spawnSvgFx('coin', 18);
      triggerEggBanner('已触发隐藏彩蛋：暴富吸金模式！');
    }
    eggState.specialKeyword = 'money';
    personaText.textContent = '隐藏款：移动吸金暴富锦鲤';
    tagText.textContent = '财运滚滚来';
    fortuneDo.textContent = '买刮刮乐 / 准点数钱';
    fortuneDont.textContent = '冲动借钱 / 精神内耗';
  } else if (rawInput.includes('咖啡') || rawInput.includes('coffee') || rawInput.includes('拿铁')) {
    if (eggState.specialKeyword !== 'coffee') {
      sound.playMagic();
      triggerHaptic('medium');
      spawnSvgFx('coffee', 14);
      triggerEggBanner('已触发隐藏彩蛋：重度咖啡续命！');
    }
    eggState.specialKeyword = 'coffee';
    personaText.textContent = '隐藏款：全天候咖啡因续命星人';
    tagText.textContent = '注入灵魂热气';
    fortuneDo.textContent = '来杯大冰美 / 精神抖擞';
    fortuneDont.textContent = '空腹猛灌 / 晚上失眠';
  } else {
    eggState.specialKeyword = null;
    personaText.textContent = moodData.persona;
    tagText.textContent = moodData.tag;
    fortuneDo.textContent = pick(rng, moodData.doList);
    fortuneDont.textContent = pick(rng, moodData.dontList);
  }

  tagIconWrap.innerHTML = SVG_ICONS[currentMoodKey] || SVG_ICONS.happy;
  const quoteItem = pick(rng, moodData.quotes);
  quoteText.textContent = quoteItem.text;
  quoteSource.textContent = quoteItem.source || '';

  energyTitle.textContent = moodData.energyTitle;
  const energyPercent = Math.min(100, Math.max(12, moodData.energyVal + Math.round(jit(rng, 5))));
  energyValue.textContent = `${energyPercent}%`;
  energyBar.style.width = `${energyPercent}%`;

  const weatherObj = pick(rng, WEATHER_ITEMS);
  weatherDisplay.innerHTML = `${weatherObj.icon} <span>${weatherObj.text}</span>`;

  const authorName = userInput.value.trim();
  authorSig.textContent = authorName ? `— @${authorName}` : '— @匿名漫游者';

  moodTabs.forEach(tab => {
    tab.classList.toggle('active', tab.dataset.mood === currentMoodKey);
  });

  renderDoodleScene(avatarCanvas, currentSeed, currentMoodKey);
  if (is3DMode && avatar3D) {
    avatar3D.build(currentSeed, currentMoodKey);
  }
  updateQRCode(buildShareURL());

  if (shouldSave) {
    saveCardToHistory({
      date: formattedDate,
      seed: currentSeed,
      mood: currentMoodKey,
      name: authorName,
      tag: tagText.textContent,
      quote: quoteText.textContent,
      theme: currentTheme
    });
  }
}

function renderHistoryList() {
  const records = getHistoryRecords();
  if (records.length === 0) {
    historyList.innerHTML = '<div style="text-align:center;padding:15px;font-size:13px;color:var(--hw-ink-soft);">还没有保存过心情手账～快去生成第一张吧！</div>';
    return;
  }
  historyList.innerHTML = records.map((item) => `
    <div class="history-item" data-seed="${item.seed}" data-mood="${item.mood}" data-name="${item.name || ''}" data-theme="${item.theme || 'pine'}">
      <div style="display:flex;flex-direction:column;gap:1px;">
        <div style="font-weight:bold;font-size:13px;color:var(--hw-ink);">${item.date} · ${item.tag}</div>
        <div style="font-size:11px;color:var(--hw-ink-soft);max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${item.quote}</div>
      </div>
      <div style="font-size:12px;font-weight:bold;color:var(--hw-accent-ink);display:inline-flex;align-items:center;gap:2px;"><span>回看</span><svg class="svg-icon" style="width:10px;height:10px;" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg></div>
    </div>
  `).join('');

  historyList.querySelectorAll('.history-item').forEach(el => {
    el.addEventListener('click', () => {
      sound.playWoosh();
      triggerHaptic('light');
      const { seed, mood, name, theme } = el.dataset;
      if (name) userInput.value = name;
      if (theme) {
        currentTheme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        document.body.setAttribute('data-theme', theme);
        themeCircles.forEach(c => c.classList.toggle('active', c.dataset.theme === theme));
      }
      updateAppCard(seed, mood, false);
      historyDrawer.classList.remove('active');
      showToast('已回溯历史心情手账！');
    });
  });
}

// ──────────────── 陀螺仪视差平滑阻尼引擎 ────────────────
let targetRotX = 0;
let targetRotY = 0;
let currentRotX = 0;
let currentRotY = 0;
let parallaxRaf = null;

function animateParallax() {
  if (!isGyroEnabled) return;
  currentRotX += (targetRotX - currentRotX) * 0.14;
  currentRotY += (targetRotY - currentRotY) * 0.14;
  card3DWrapper.style.transform = `rotateY(${currentRotY.toFixed(2)}deg) rotateX(${currentRotX.toFixed(2)}deg)`;
  parallaxRaf = requestAnimationFrame(animateParallax);
}

function handlePointerMove(e) {
  if (!isGyroEnabled) return;
  const rect = card3DWrapper.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const dx = (e.clientX - cx) / (rect.width / 2);
  const dy = (e.clientY - cy) / (rect.height / 2);
  targetRotY = Math.max(-8, Math.min(8, dx * 8));
  targetRotX = Math.max(-8, Math.min(8, -dy * 8));
}

function handlePointerLeave() {
  if (!isGyroEnabled) return;
  targetRotX = 0;
  targetRotY = 0;
}

function handleDeviceOrientation(e) {
  if (!isGyroEnabled) return;
  const gamma = Math.max(-25, Math.min(25, e.gamma || 0));
  const beta = Math.max(-25, Math.min(25, (e.beta || 0) - 45));
  targetRotY = gamma * 0.35;
  targetRotX = -beta * 0.35;
}

// ──────────────── 彩蛋连戳与摸摸头 ────────────────
let pokeCount = 0;
let lastPokeTime = 0;
let longPressTimer = null;

function handlePoke() {
  const nowT = Date.now();
  if (nowT - lastPokeTime < 1200) {
    pokeCount++;
  } else {
    pokeCount = 1;
  }
  lastPokeTime = nowT;

  if (pokeCount >= 10) {
    sound.playMagic();
    triggerHaptic('heavy');
    eggState.isKoi = true;
    eggState.isDizzy = false;
    document.documentElement.setAttribute('data-egg', 'koi');
    personaText.textContent = '终极大彩蛋：宇宙无敌幸运锦鲤';
    tagText.textContent = '锦鲤附体 暴富幸运';
    quoteText.textContent = '“恭喜解锁隐藏锦鲤款！今日所有愿望即刻生效！”';
    quoteSource.textContent = '— 宇宙心想事成定律';
    pokeTipText.textContent = '已解锁超稀有金色锦鲤！';

    spawnSvgFx('star', 20);
    spawnSvgFx('coin', 14);
    moodCard.classList.add('koi-golden-pulse');
    triggerEggBanner('终极彩蛋：恭喜解锁黄金锦鲤隐藏款！');

    try {
      if (typeof confetti === 'function') {
        confetti({
          particleCount: 70,
          spread: 80,
          origin: { y: 0.55 },
          colors: ['#FFD700', '#FFA500', '#FF6347', '#FFE4B5']
        });
      }
    } catch(e) {}

    renderDoodleScene(avatarCanvas, currentSeed, currentMoodKey);
    showToast('恭喜触发 10 连击隐藏锦鲤彩蛋！');
    return;
  }

  if (pokeCount >= 5) {
    sound.playDizzyBoing();
    triggerHaptic('medium');
    eggState.isDizzy = true;
    pokeTipText.textContent = '别戳啦！脑浆都晃匀啦～';
    
    moodCard.classList.remove('shake-dizzy');
    void moodCard.offsetWidth;
    moodCard.classList.add('shake-dizzy');
    spawnSvgFx('star', 10);
    triggerEggBanner('小人被你戳晕啦！再连戳5次试试？');

    renderDoodleScene(avatarCanvas, currentSeed, currentMoodKey);
    showToast('小人被你戳晕啦！再连戳5次试试？');
    return;
  }

  sound.playPop();
  triggerHaptic('light');
  if (is3DMode && avatar3D) {
    avatar3D.jump();
  }
  let startT = null;
  const dur = 340;
  function jump(t) {
    if (!startT) startT = t;
    const p = (t - startT) / dur;
    if (p < 1) {
      const offset = -Math.sin(p * Math.PI) * 24;
      renderDoodleScene(avatarCanvas, currentSeed, currentMoodKey, offset);
      requestAnimationFrame(jump);
    } else {
      renderDoodleScene(avatarCanvas, currentSeed, currentMoodKey, 0);
    }
  }
  requestAnimationFrame(jump);
}

function triggerHeartEgg() {
  sound.playMagic();
  triggerHaptic('medium');
  eggState.isHeart = true;
  pokeTipText.textContent = '摸摸头，今天被爱着呢～';
  spawnSvgFx('heart', 16);
  triggerEggBanner('触发摸摸头心动彩蛋！');
  renderDoodleScene(avatarCanvas, currentSeed, currentMoodKey);
  showToast('触发摸摸头心动彩蛋！');
}

// ──────────────── 事件绑定初始化 ────────────────
export function initApp() {
  updateSoundButtonState();

  // 音效
  btnSoundToggle.addEventListener('click', () => {
    const isMuted = sound.toggleMute();
    triggerHaptic('light');
    updateSoundButtonState();
    showToast(isMuted ? '已静音' : '已开启手绘音效');
    if (!isMuted) sound.playPop();
  });

  // 语音念白
  btnSpeechRead.addEventListener('click', () => {
    triggerHaptic('light');
    sound.playPop();
    if (speech.isSpeaking) {
      speech.stop();
    } else {
      const textToRead = `${personaText.textContent}。今日标签：${tagText.textContent}。今日心声：${quoteText.textContent}。今日宜：${fortuneDo.textContent}。今日忌：${fortuneDont.textContent}。`;
      speech.speak(
        textToRead,
        () => {
          speechText.textContent = '播报中';
          btnSpeechRead.classList.add('active');
        },
        () => {
          speechText.textContent = '读卡';
          btnSpeechRead.classList.remove('active');
        }
      );
    }
  });

  // 陀螺仪视差
  if (btnGyroToggle) {
    btnGyroToggle.addEventListener('click', () => {
      triggerHaptic('light');
      sound.playPop();
      isGyroEnabled = !isGyroEnabled;
      btnGyroToggle.classList.toggle('active', isGyroEnabled);

      if (isGyroEnabled) {
        showToast('已开启 3D 视差感知！移动手指或倾斜手机');
        animateParallax();
        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerleave', handlePointerLeave);
        if (window.DeviceOrientationEvent) {
          if (typeof DeviceOrientationEvent.requestPermission === 'function') {
            DeviceOrientationEvent.requestPermission().then(state => {
              if (state === 'granted') window.addEventListener('deviceorientation', handleDeviceOrientation);
            }).catch(() => {});
          } else {
            window.addEventListener('deviceorientation', handleDeviceOrientation);
          }
        }
      } else {
        showToast('已关闭 3D 视差');
        if (parallaxRaf) cancelAnimationFrame(parallaxRaf);
        targetRotX = targetRotY = currentRotX = currentRotY = 0;
        card3DWrapper.style.transform = 'none';
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerleave', handlePointerLeave);
        window.removeEventListener('deviceorientation', handleDeviceOrientation);
      }
    });
  }

  // 2D手绘 / 3D盲盒手办 模式切换
  if (btnDimensionToggle) {
    btnDimensionToggle.addEventListener('click', () => {
      sound.playPop();
      triggerHaptic('light');
      is3DMode = !is3DMode;
      btnDimensionToggle.classList.toggle('active', is3DMode);
      if (dimText) dimText.textContent = is3DMode ? '2D' : '3D';

      if (!avatar3D) {
        avatar3D = new Avatar3DRig(avatarStage);
      }
      avatar3D.setVisible(is3DMode);
      avatarCanvas.style.display = is3DMode ? 'none' : 'block';

      if (is3DMode) {
        avatar3D.build(currentSeed, currentMoodKey);
        showToast('已进入 3D 盲盒手办模式！支持 360° 旋转');
      } else {
        showToast('已返回 2D 手绘模式');
      }
    });
  }

  // 历史抽屉
  btnHistoryToggle.addEventListener('click', () => {
    triggerHaptic('light');
    sound.playPop();
    renderHistoryList();
    historyDrawer.classList.add('active');
  });

  btnCloseHistory.addEventListener('click', () => {
    historyDrawer.classList.remove('active');
  });

  // 舞台互动
  avatarStage.addEventListener('click', handlePoke);
  avatarStage.addEventListener('touchstart', () => {
    longPressTimer = setTimeout(triggerHeartEgg, 550);
  }, { passive: true });
  avatarStage.addEventListener('touchend', () => clearTimeout(longPressTimer));
  avatarStage.addEventListener('mousedown', () => {
    longPressTimer = setTimeout(triggerHeartEgg, 550);
  });
  avatarStage.addEventListener('mouseup', () => clearTimeout(longPressTimer));

  // 输入监听
  userInput.addEventListener('input', () => {
    const val = userInput.value.trim();
    updateAppCard(val ? `in-${val}` : 'default-seed', currentMoodKey);
  });

  // 情绪选择
  moodTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      sound.playWoosh();
      triggerHaptic('light');
      eggState.isDizzy = false;
      eggState.isHeart = false;
      pokeTipText.textContent = '戳戳我有彩蛋';
      moodCard.classList.remove('shake-dizzy');
      const mood = tab.dataset.mood;
      const base = userInput.value.trim() || 'mood';
      updateAppCard(`${base}-${mood}-${Math.random()}`, mood);
    });
  });

  // 主题色
  themeCircles.forEach(circle => {
    circle.addEventListener('click', () => {
      sound.playPop();
      triggerHaptic('light');
      document.documentElement.removeAttribute('data-egg');
      eggState.isKoi = false;
      moodCard.classList.remove('koi-golden-pulse');
      themeCircles.forEach(c => c.classList.remove('active'));
      circle.classList.add('active');

      currentTheme = circle.dataset.theme;
      document.documentElement.setAttribute('data-theme', currentTheme);
      document.body.setAttribute('data-theme', currentTheme);

      setTimeout(() => {
        renderDoodleScene(avatarCanvas, currentSeed, currentMoodKey);
        updateQRCode(buildShareURL());
      }, 50);
    });
  });

  // 抽盲盒
  btnRandom.addEventListener('click', () => {
    sound.playWoosh();
    triggerHaptic('medium');
    eggState.isDizzy = false;
    eggState.isKoi = false;
    eggState.isHeart = false;
    document.documentElement.removeAttribute('data-egg');
    moodCard.classList.remove('shake-dizzy', 'koi-golden-pulse');
    pokeTipText.textContent = '戳戳我有彩蛋';

    const randNum = Math.floor(Math.random() * 1e8);
    const nicknames = ['摸鱼特工', '卡皮巴拉分豚', '宇宙漫游者', '快乐小土豆', '失眠小熊', '打工战士', '甜筒刺客', '代码诗人', '晚风捕手', '精神离职大师'];
    if (Math.random() > 0.4) {
      userInput.value = pick(rngFrom(String(randNum)), nicknames);
    }

    moodCard.style.transform = 'scale(0.96) rotate(-1deg)';
    setTimeout(() => { moodCard.style.transform = 'none'; }, 180);

    try {
      if (typeof confetti === 'function') {
        confetti({
          particleCount: 45,
          spread: 65,
          origin: { y: 0.55 },
          colors: ['#53A548', '#C4553B', '#F5D061', '#4A6FA5', '#E26D46']
        });
      }
    } catch (e) {}

    updateAppCard('rand-' + randNum);
    showToast('抽取到全新今日精神状态！');
  });

  // 一键发朋友圈
  const isWeChat = /MicroMessenger/i.test(navigator.userAgent);
  btnShareWechat.addEventListener('click', () => {
    sound.playPop();
    triggerHaptic('light');
    const shareURL = buildShareURL();
    const title = `今日精神状态诊断书 · @${userInput.value.trim() || '我'} 的手绘心情小人`;

    if (isWeChat) {
      wechatMask.classList.add('active');
    } else if (navigator.share && navigator.canShare) {
      html2canvas(moodCard, { scale: 2.5, backgroundColor: null }).then(canvas => {
        canvas.toBlob(blob => {
          const file = new File([blob], 'my-mood-card.png', { type: 'image/png' });
          if (navigator.canShare({ files: [file] })) {
            navigator.share({
              files: [file],
              title: title,
              text: '测测你的今日手绘小人与精神状态！',
              url: shareURL
            }).catch(() => {});
          } else {
            wechatMask.classList.add('active');
          }
        });
      });
    } else {
      wechatMask.classList.add('active');
    }
  });

  // 一键发小红书
  btnShareXHS.addEventListener('click', () => {
    sound.playPop();
    triggerHaptic('light');
    xhsMask.classList.add('active');
    xhsPreviewBox.innerHTML = '<span style="font-size:11px;color:#888;">正在生成 3:4 卡片...</span>';

    html2canvas(moodCard, { scale: 3, backgroundColor: null }).then(canvas => {
      const img = new Image();
      img.src = canvas.toDataURL('image/png');
      img.style.maxWidth = '100%';
      img.style.maxHeight = '140px';
      img.style.borderRadius = '6px';
      xhsPreviewBox.innerHTML = '';
      xhsPreviewBox.appendChild(img);
    });
  });

  btnXhsDirectShare.addEventListener('click', () => {
    sound.playMagic();
    triggerHaptic('medium');
    const authorName = userInput.value.trim() || '我';
    const shareURL = buildShareURL();

    const xhsText = 
`今日精神状态鉴定完毕！
[情绪物种] ${personaText.textContent.replace(/.*：/, '')}
[状态标签] ${tagText.textContent}
[今日心声] “${quoteText.textContent.replace(/["“”]/g, '')}” ${quoteSource.textContent}
[今日宜] ${fortuneDo.textContent}
[今日忌] ${fortuneDont.textContent}

扫卡片右下角二维码测测你的今日小人: ${shareURL}
#今日心情 #手绘小人 #情绪手账 #治愈系 #精神状态图鉴 #卡皮巴拉 #我的日常`;

    navigator.clipboard.writeText(xhsText).then(() => {
      showToast('小红书爆款文案已复制！正在下载卡片...');
    });

    html2canvas(moodCard, { scale: 3, backgroundColor: null }).then(canvas => {
      const link = document.createElement('a');
      link.download = `xhs-mood-card-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      setTimeout(() => { xhsMask.classList.remove('active'); }, 1200);
    });
  });

  btnCloseWechatMask.addEventListener('click', () => wechatMask.classList.remove('active'));
  btnCloseXhsMask.addEventListener('click', () => xhsMask.classList.remove('active'));

  // 保存图片
  btnExport.addEventListener('click', () => {
    sound.playPop();
    triggerHaptic('light');
    btnExport.querySelector('span').textContent = '生成中...';

    html2canvas(moodCard, { scale: 3, backgroundColor: null, useCORS: true }).then(canvasOutput => {
      const link = document.createElement('a');
      link.download = `mood-card-${Date.now()}.png`;
      link.href = canvasOutput.toDataURL('image/png');
      link.click();

      btnExport.querySelector('span').textContent = '保存';
      showToast('拍立得手账图片已下载！');
    }).catch(() => {
      btnExport.querySelector('span').textContent = '保存';
      showToast('保存失败，请稍后重试');
    });
  });

  // URL 参数加载
  const params = new URLSearchParams(window.location.search);
  const nameParam = params.get('name');
  const moodParam = params.get('mood');
  const seedParam = params.get('seed');
  const themeParam = params.get('theme');

  if (nameParam || moodParam || seedParam) {
    if (nameParam) userInput.value = nameParam;
    if (themeParam) {
      currentTheme = themeParam;
      document.documentElement.setAttribute('data-theme', themeParam);
      document.body.setAttribute('data-theme', themeParam);
      themeCircles.forEach(c => c.classList.toggle('active', c.dataset.theme === themeParam));
    }
    updateAppCard(seedParam || `shared-${Date.now()}`, moodParam || 'happy');
  } else {
    updateAppCard('init-' + Date.now());
  }
}
