import type { Messages } from '@/lib/i18n/en';

export const zh: Messages = {
  code: 'zh',
  name: '中文',

  formatMl: (ml: number) => {
    if (ml >= 1000) {
      const liters = ml / 1000;
      return `${liters % 1 === 0 ? liters.toFixed(0) : liters.toFixed(1)} 升`;
    }
    return `${ml} 毫升`;
  },

  dates: {
    months: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    weekdayInitials: ['日', '一', '二', '三', '四', '五', '六'],
    long: (date: Date) => `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`,
    chartDay: (date: Date) => `${date.getMonth() + 1}月${date.getDate()}日`,
    chartMonth: (date: Date) =>
      `${String(date.getFullYear()).slice(2)}年${date.getMonth() + 1}月`,
    range: (from: string, to: string, days: number) => `${from} → ${to} · ${days} 天`,
  },

  common: {
    loading: '加载中…',
    cancel: '取消',
    delete: '删除',
    remove: '移除',
    erase: '清除',
    days: (n: number) => `${n} 天`,
  },

  notFound: {
    header: '哎呀！',
    title: '这个页面不存在。',
    home: '返回首页',
  },

  tabs: {
    today: '今天',
    habits: '习惯',
    progress: '进度',
    settings: '设置',
    habit: '习惯',
    waterHistory: '饮水记录',
  },

  today: {
    loading: '正在加载 HabitFlow…',
    greeting: (hour: number): string => (hour < 12 ? '早上好' : hour < 18 ? '下午好' : '晚上好'),
    subtitleComplete: '今日目标已完成，做得好。',
    subtitleNoGoal: '添加一个习惯，开始你的第一段连续记录。',
    subtitleWaterLeft: (left: string, done: number, need: number) =>
      `还差 ${left} 水 · 已完成 ${done}/${need} 项`,
    subtitleTasks: (done: number, need: number) => `今天已完成 ${done}/${need} 项`,
    waterIsATask: '计入一项每日任务',
    addWaterA11y: (ml: number) => `添加 ${ml} 毫升水`,
    undo: '撤销上一次饮水',
    habitsSection: '今日习惯',
    emptyTitle: '还没有习惯',
    emptyBody: '添加第一个习惯，今天就开始积累连续记录。',
    emptyCta: '添加习惯',
  },

  streakHeader: {
    streak: '连续',
    gems: '宝石',
    level: '等级',
  },

  dailyGoal: {
    title: '每日目标',
    titleComplete: '今日目标已完成',
    titleEmpty: '还没有每日目标',
    captionEmpty: '添加习惯或开启饮水记录，即可开始连续记录。',
    captionMet: '今天的火焰已经保住了。',
    captionLeft: (left: number) => `再完成 ${left} 项即可保持连续记录。`,
    a11y: (done: number, need: number) => `每日目标：已完成 ${done}/${need} 项`,
    chipHabits: (done: number, total: number) => `✅ ${done}/${total} 个习惯`,
    chipWater: '💧 饮水',
    chipWaterDone: '💧 饮水已达标',
  },

  waterRing: {
    a11y: (ml: string, goal: string, percent: number) =>
      `饮水：${ml}，目标 ${goal}，${percent}%`,
    of: (goal: string, percent: number) => `目标 ${goal} · ${percent}%`,
  },

  habits: {
    title: '你的习惯',
    meta: (used: number, total: number) =>
      `${used} / ${total} 个位置 · 点击“编辑”重命名 · 长按删除`,
    waterTracking: '饮水记录',
    waterMeta: (ml: string, goal: string) => `${ml} / ${goal} · 长按移除`,
    waterHint: '长按移除饮水记录',
    addWaterTracking: '💧 添加饮水记录',
    addHabit: '+ 添加习惯',
    addHabitA11y: '添加习惯',
    unlockCta: (slots: number) => `🎬 观看广告解锁 ${slots} 个习惯`,
    unlockA11y: (slots: number) => `观看广告解锁 ${slots} 个习惯位置`,
    hint: (free: number, extra: number) =>
      `${free} 个习惯免费。观看一段短广告可再解锁 ${extra} 个位置，也让 HabitFlow 对所有人保持免费。饮水记录不占用位置。`,
    deleteTitle: '删除这个习惯？',
    removeWaterTitle: '移除饮水记录？',
    removeWaterBody: '之后可以再添加回来。你的饮水历史会留在这台手机上。',
    startStreak: '今天开始新的连续记录',
    dayStreak: (days: number) => `🔥 连续 ${days} 天`,
    edit: '编辑',
    editA11y: (name: string) => `编辑 ${name}`,
    rowA11y: (name: string, streak: number) => (streak > 0 ? `${name}，连续 ${streak} 天` : name),
    rowHint: '双击切换完成，长按删除',
  },

  rewards: {
    unavailableTitle: '奖励暂不可用',
    adFailedBody: '广告没有加载完成。请检查网络连接后稍后再试。',
    noAdHabitsBody: (free: number) => `目前没有可用广告。你的 ${free} 个免费习惯依然可用。`,
    noAdBody: '目前没有可用广告，请稍后再试。',
    freezeReadyTitle: '连续记录保护已就绪',
    freezeReadyBody: '如果漏掉一天，会自动消耗一个保护来守住火焰。',
    freezeFullTitle: '库存已满',
    freezeFullBody: (max: number) => `你已经有 ${max} 个连续记录保护。`,
  },

  progress: {
    title: '进度',
    meta: (streak: number, best: number, freezes: number) =>
      `🔥 连续 ${streak} 天 · 最佳 ${best} · ${freezes} 个保护`,
    thisWeek: '本周',
    dayGoalMet: '目标达成',
    dayFrozen: '使用了连续记录保护',
    dayMissed: '未达成目标',
    dayA11y: (date: string, status: string) => `${date}：${status}`,
    level: (level: number, into: number, total: number) => `等级 ${level} · ${into}/${total} XP`,
    xpLine: (xp: number, gems: number) => `共 ${xp} XP · 💎 ${gems} 宝石`,
    freezeCta: '❄️ 观看广告获得连续记录保护',
    freezeA11y: '观看广告获得连续记录保护',
    achievements: '成就',
    badgeA11y: (title: string, description: string, unlocked: boolean) =>
      `${title}：${description}。${unlocked ? '已解锁' : '未解锁'}`,
  },

  hydration: {
    title: '饮水',
    header: (ml: string, goal: string) => `${ml} / ${goal}`,
    footer: (total: string, average: string, met: number, days: number) =>
      `${days} 天共 ${total} · 平均每天 ${average} · 达标 ${met}/${days}`,
    allTime: (total: string, days: number) => `全部时间 · ${days} 天共 ${total}`,
    allTimeEmpty: '全部历史',
    seeAll: '查看全部 →',
    cardA11y: '饮水历史：打开全部时间图表',
    barA11y: (date: string, ml: string, goal: string, met: boolean) =>
      `${date}：${ml} / ${goal}${met ? '，已达标' : ''}`,
  },

  waterHistory: {
    ranges: { '7d': '7天', '30d': '30天', '1y': '1年', all: '全部' },
    rangeA11y: {
      '7d': '最近 7 天',
      '30d': '最近 30 天',
      '1y': '最近一年',
      all: '全部时间',
    },
    dailyAverage: '日均饮水',
    percentOfGoal: (percent: number) => `目标的 ${percent}%`,
    bucketDay: '每天一个数据点',
    bucketWeek: '每周一个数据点 — 日均',
    bucketMonth: '每月一个数据点 — 日均',
    legendGoal: (goal: string) => `目标 ${goal}`,
    legendAverage: '你的平均',
    chartA11y: (bucket: string, average: string, goal: string) =>
      `饮水折线图。${bucket}。日均 ${average}，目标 ${goal}。`,
    daysOnGoal: '达标天数',
    daysOnGoalHint: (percent: number) => `占 ${percent}%`,
    totalVolume: '总饮水量',
    totalVolumeHint: (days: number) => `已记录 ${days} 天`,
    bestDay: '最佳一天',
    bestDayEmpty: '没有饮水记录',
    trackingSince: '记录始于',
    trackingSinceHint: (days: number) => `${days} 天的历史`,
    emptyTitle: '还没有记录',
    emptyBody:
      '在“今天”页面添加饮水，这张图表就会开始填充。每日总量会永久保留，多年以后依然可以回看。',
    footnote: '每一次饮水明细保留 90 天；每天的总量则永久保留，所以“全部”视图会逐年变长。',
  },

  settings: {
    title: '设置',
    appearance: '外观',
    appearanceSystem: (current: string) =>
      `跟随手机设置 — 当前为${current}。选择浅色或深色，可让 HabitFlow 始终保持同一主题。`,
    appearanceFixed: (choice: string) => `无论手机如何切换，HabitFlow 都保持${choice}。`,
    themeSystem: '⚙️ 跟随系统',
    themeLight: '☀️ 浅色',
    themeDark: '🌙 深色',
    schemeLight: '浅色',
    schemeDark: '深色',
    themeA11y: (choice: string) => `外观：${choice}`,
    language: '语言',
    languageSystem: (current: string) =>
      `跟随手机设置 — 当前为${current}。选择一种语言，可让 HabitFlow 始终使用它。`,
    languageFixed: (current: string) => `HabitFlow 始终使用${current}。`,
    languageSystemChip: '⚙️ 跟随系统',
    languageA11y: (choice: string) => `语言：${choice}`,
    dailyGoal: '每日目标',
    dailyGoalHelpWater: '完成这么多项任务即可保住火焰，饮水目标算其中一项。',
    dailyGoalHelp: '完成这么多个习惯即可保住火焰。习惯较少时，目标会自动缩减。',
    goalCasual: '轻松 · 1',
    goalRegular: '常规 · 2',
    goalSerious: '认真 · 3',
    goalEverything: '全部',
    goalA11y: (label: string) => `每日目标：${label}`,
    waterIsATask: '饮水计入每日任务',
    waterIsATaskHelp:
      '开启：达成饮水目标会勾掉一项每日任务。关闭：饮水只带来额外 XP。',
    waterGoal: '每日饮水目标',
    waterGoalA11y: (goal: string) => `饮水目标 ${goal}`,
    reminders: '饮水提醒',
    waterOff: '饮水记录已关闭。可在“习惯”页面重新添加。',
    privacy: '隐私',
    privacyBody:
      'HabitFlow 只在本设备上保存你的习惯、饮水和连续记录，不会上传到服务器。广告由 Google AdMob 提供。',
    privacyPolicy: '隐私政策',
    adPrivacy: '广告隐私选项',
    eraseData: '清除我的全部数据',
    eraseTitle: '清除 HabitFlow 的全部数据？',
    eraseBody:
      '你的习惯、饮水历史、连续记录、XP 和宝石只保存在这台手机上。它们将被永久删除，HabitFlow 会重新开始。语言和外观设置会被保留。',
    about: '关于',
    version: (version: string) => `HabitFlow ${version}`,
    contactSupport: '联系支持',
  },

  habitForm: {
    newTitle: '新建习惯',
    editTitle: '编辑习惯',
    name: '名称',
    namePlaceholder: '例如：不吃糖',
    nameA11y: '习惯名称',
    icon: '图标',
    iconA11y: (emoji: string) => `图标 ${emoji}`,
    saveNew: '保存习惯',
    saveEdit: '保存修改',
    nameRequiredTitle: '需要名称',
    nameRequiredBody: '给这个习惯起一个简短的名字。',
    limitTitle: '习惯数量已达上限',
    limitBody: '在“习惯”页面观看激励广告即可解锁更多位置。',
    limitBodyHabitsTab: '在“习惯”页面观看一段短广告即可解锁更多位置。',
  },

  celebration: {
    titleStreak: '干得漂亮！',
    titleReward: '你获得了奖励',
    dailyGoal: (streak: number) => `今日目标已完成 · 连续 ${streak} 天`,
    perfectDay: '完美一天奖励',
    levelUp: (level: number) => `升级了！你达到了等级 ${level}`,
    xp: (xp: number) => `+${xp} XP`,
    gems: (gems: number) => `+${gems} 宝石`,
    keepGoing: '继续加油',
  },

  achievements: {
    first_goal: { title: '首胜', description: '达成一次每日目标' },
    streak_3: { title: '渐入佳境', description: '达到连续 3 天' },
    streak_7: { title: '一周勇士', description: '达到连续 7 天' },
    streak_14: { title: '两周之火', description: '达到连续 14 天' },
    streak_30: { title: '月度传奇', description: '达到连续 30 天' },
    streak_100: { title: '百日达人', description: '达到连续 100 天' },
    first_perfect: { title: '完美一天', description: '完成所有习惯和饮水目标' },
    level_5: { title: '等级 5', description: '达到等级 5' },
    level_10: { title: '等级 10', description: '达到等级 10' },
    hydrate_7: { title: '滋润一周', description: '连续 7 天达成饮水目标' },
  },

  notifications: {
    channel: 'HabitFlow 提醒',
    waterTitle: '该喝水了',
    waterBody: '快喝一杯，保住你的 HabitFlow 连续记录。',
    streakTitle: (days: number): string =>
      days > 0 ? `你连续 ${days} 天的记录有危险` : '你的连续记录有危险',
    streakBody: '完成今天的每日目标，让火焰继续燃烧。',
  },
};
