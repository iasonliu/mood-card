/* ─────────────────────────────────────────────────────────────
   MoodHand Declarative Configurations & Dictionaries
   ───────────────────────────────────────────────────────────── */

export const SVG_ICONS = {
  happy: `<svg class="svg-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>`,
  chill: `<svg class="svg-icon" viewBox="0 0 24 24"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/></svg>`,
  tired: `<svg class="svg-icon" viewBox="0 0 24 24"><rect x="1" y="6" width="18" height="12" rx="2"/><line x1="23" y1="13" x2="23" y2="11"/><line x1="6" y1="12" x2="8" y2="12"/></svg>`,
  rage: `<svg class="svg-icon" viewBox="0 0 24 24"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3z"/></svg>`,
  curious: `<svg class="svg-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  cozy: `<svg class="svg-icon" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`
};

export const WEATHER_ITEMS = [
  { text: '晴空万里', icon: `<svg class="svg-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>` },
  { text: '多云转晴', icon: `<svg class="svg-icon" viewBox="0 0 24 24"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>` },
  { text: '微风轻拂', icon: `<svg class="svg-icon" viewBox="0 0 24 24"><path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/></svg>` },
  { text: '细雨敲窗', icon: `<svg class="svg-icon" viewBox="0 0 24 24"><path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"/><line x1="8" y1="19" x2="8" y2="21"/><line x1="12" y1="19" x2="12" y2="21"/><line x1="16" y1="19" x2="16" y2="21"/></svg>` },
  { text: '星光闪烁', icon: `<svg class="svg-icon" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>` },
  { text: '初雪微凉', icon: `<svg class="svg-icon" viewBox="0 0 24 24"><line x1="12" y1="2" x2="12" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/><line x1="4.93" y1="19.07" x2="19.07" y2="4.93"/></svg>` }
];

export const MOOD_DATABASE = {
  happy: {
    tag: '快乐起飞',
    persona: '情绪物种：全天候小太阳',
    scene: 'nature',
    pet: 'dog',
    energyTitle: '多巴胺活跃峰值',
    energyVal: 95,
    doList: ['尊嘟假嘟都快乐 / 奖励奶茶', '大步踩落叶 / 散发魅力', '对镜子大笑 / 开启好运结界'],
    dontList: ['扫兴冷场 / 犹豫不决', '自我否定 / 委屈自己', '节食内疚 / 压抑欢喜'],
    quotes: [
      { text: '“在隆冬，我终于知道，我身上有一个不可战胜的夏天。”', source: '— 阿尔贝·加缪《夏天集》' },
      { text: '“生活明朗，万物可爱，今天心情有八颗星！”', source: '— 快乐打工人宣言' },
      { text: '“我来人间一趟，本想光芒万丈，顺便炫杯奶茶。”', source: '— 当代多巴胺哲学' },
      { text: '“心里的欢喜像打翻了的汽水，咕噜咕噜冒着甜泡。”', source: '— 快乐放空日记' }
    ]
  },
  chill: {
    tag: '佛系摸鱼',
    persona: '情绪物种：卡皮巴拉式稳定发疯',
    scene: 'coffeeshop',
    pet: 'capybara',
    energyTitle: '松弛感与摸鱼指数',
    energyVal: 80,
    doList: ['准点下班 / 窗边发呆', '泡大麦茶 / 慢吞吞散步', '把任务推到明天 / 保持微笑'],
    dontList: ['秒回工作 / 瞎操心', '过度内耗 / 逞强硬扛', '卷生卷死 / 焦虑失眠'],
    quotes: [
      { text: '“只要我躺得够平，生活的镰刀就割不到我。”', source: '— 卡皮巴拉松弛哲学' },
      { text: '“偶尔发呆，是对繁忙大脑最温柔的重启。”', source: '— 《摸鱼的艺术》' },
      { text: '“不慌不忙，心平气和，天塌下来有高个子顶着。”', source: '— 淡淡的综合症' },
      { text: '“今日宜：慢吞吞、喝热茶、听微风吹过树梢。”', source: '— 慢生活手记' }
    ]
  },
  tired: {
    tag: '电量告急',
    persona: '情绪物种：低功耗待机脆皮小树獭',
    scene: 'workdesk',
    pet: 'cat',
    energyTitle: '剩余续航电量',
    energyVal: 15,
    doList: ['精神离职 / 提前钻被窝', '洗个热气腾腾热水澡', '静音手机 / 开启勿扰'],
    dontList: ['深夜网抑云 / 熬夜刷短视频', '强行营业 / 假装热情', '勉强自己 / 揽无谓责任'],
    quotes: [
      { text: '“世界上只有一种真正的英雄主义，那就是认清生活后依然爱它。”', source: '— 罗曼·罗兰' },
      { text: '“大脑已经下班，剩下的全靠肌肉记忆在敲键盘。”', source: '— 脆皮大学生观察录' },
      { text: '“正在低电量保护模式运行，请勿拍打喂食。”', source: '— 窝囊废文学精选' },
      { text: '“世界很大，但我现在只想缩进被窝里充会儿电。”', source: '— 晚安手账' }
    ]
  },
  rage: {
    tag: '炸毛暴走',
    persona: '情绪物种：一点就着移动小火球',
    scene: 'rooftop',
    pet: 'bird',
    energyTitle: '怒气沸腾数值',
    energyVal: 89,
    doList: ['阴暗爬行与稳定发疯 / 听摇滚', '暴风吸入冰淇淋 / 宣泄情绪', '把烦恼画成猪头撕碎'],
    dontList: ['跟杠精讲道理 / 生闷气', '勉强忍气吞声 / 委屈自己', '冲动买单 / 摔手机'],
    quotes: [
      { text: '“与恶龙缠斗过久，自身亦成为恶龙。”', source: '— 弗里德里希·尼采' },
      { text: '“别惹我，我现在的怒气值能烤熟两串大鸡翅！”', source: '— 发疯文学大赏' },
      { text: '“深呼吸，世界如此美妙，我不生气...才怪！”', source: '— 情绪急救指南' },
      { text: '“头顶正在冒烟，需要三盒冰淇淋才能灭火！”', source: '— 暴躁星人日常' }
    ]
  },
  curious: {
    tag: '脑洞大开',
    persona: '情绪物种：宇宙漫游级天马行空客',
    scene: 'rooftop',
    pet: 'cat',
    energyTitle: '灵感活跃程度',
    energyVal: 92,
    doList: ['记下荒谬新想法 / 探索新路线', '观察云朵像不像小狗', '换个奇妙的角度看世界'],
    dontList: ['墨守成规 / 扼杀脑洞', '自我怀疑 / 盲从他人', '死板教条 / 无趣度日'],
    quotes: [
      { text: '“我心里一直都在暗暗设想，天堂应该是图书馆的模样。”', source: '— 豪尔赫·路易斯·博尔赫斯' },
      { text: '“如果猫咪会说话，第一句肯定是在吐槽人类。”', source: '— 喵星观察哲学' },
      { text: '“今天有100个荒谬新想法，准备实现第101个。”', source: '— 灵感捕手笔记' },
      { text: '“搭乘思绪的飞船，去宇宙尽头吃一口彩虹云朵。”', source: '— 银河漫游漫记' }
    ]
  },
  cozy: {
    tag: '想睡大觉',
    persona: '情绪物种：暖烘烘被窝守护神',
    scene: 'bedroom',
    pet: 'dog',
    energyTitle: '睡眠充能意愿',
    energyVal: 35,
    doList: ['点暖黄床头灯 / 换软睡衣', '抱紧毛绒玩偶 / 放空思绪', '听白噪音 / 酝酿好梦'],
    dontList: ['胡思乱想 / 复盘尴尬事', '睡前喝浓茶 / 熬夜追剧', '开大灯 / 躺床上办公'],
    quotes: [
      { text: '“从前的日色变得慢，车，马，邮件都慢，一生只够爱一个人。”', source: '— 木心《从前慢》' },
      { text: '“把今天的所有疲惫留在门外，安心入眠吧。”', source: '— 晚安治愈集' },
      { text: '“月亮不睡我不睡，我是人间小美味...好吧先睡了。”', source: '— 治愈系睡前碎碎念' },
      { text: '“裹紧小被子，在梦里去见想见的人和风景。”', source: '— 甜梦指南' }
    ]
  }
};
