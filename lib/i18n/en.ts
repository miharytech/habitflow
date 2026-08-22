/**
 * English is the source of truth: every other locale is typed as `Messages`,
 * so a missing or mistyped key is a compile error rather than a blank label.
 * Parameterised strings are functions, which keeps plural rules and word order
 * inside the language that needs them instead of in the screens.
 */
export const en = {
  code: 'en',
  name: 'English',

  formatMl: (ml: number) => {
    if (ml >= 1000) {
      const liters = ml / 1000;
      return `${liters % 1 === 0 ? liters.toFixed(0) : liters.toFixed(1)} L`;
    }
    return `${ml} ml`;
  },

  dates: {
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    /** Sunday first, matching `Date.getDay()`. */
    weekdayInitials: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
    long: (date: Date) =>
      `${en.dates.months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`,
    chartDay: (date: Date) => `${en.dates.months[date.getMonth()]} ${date.getDate()}`,
    chartMonth: (date: Date) =>
      `${en.dates.months[date.getMonth()]} '${String(date.getFullYear()).slice(2)}`,
    range: (from: string, to: string, days: number) => `${from} → ${to} · ${days} days`,
  },

  common: {
    loading: 'Loading…',
    cancel: 'Cancel',
    delete: 'Delete',
    remove: 'Remove',
    erase: 'Erase',
    days: (n: number) => `${n} ${n === 1 ? 'day' : 'days'}`,
  },

  notFound: {
    header: 'Oops!',
    title: "This screen doesn't exist.",
    home: 'Go to home screen',
  },

  tabs: {
    today: 'Today',
    habits: 'Habits',
    progress: 'Progress',
    settings: 'Settings',
    habit: 'Habit',
    waterHistory: 'Water history',
  },

  today: {
    loading: 'Loading HabitFlow…',
    greeting: (hour: number): string =>
      hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening',
    subtitleComplete: 'Daily goal complete. Nice work.',
    subtitleNoGoal: 'Add a habit to start your first streak.',
    subtitleWaterLeft: (left: string, done: number, need: number) =>
      `${left} of water left · ${done}/${need} tasks done`,
    subtitleTasks: (done: number, need: number) => `${done}/${need} tasks done today`,
    waterIsATask: 'Counts as one daily task',
    addWaterA11y: (ml: number) => `Add ${ml} millilitres of water`,
    undo: 'Undo last sip',
    habitsSection: "Today's habits",
    emptyTitle: 'No habits yet',
    emptyBody: 'Add your first habit and start building a streak today.',
    emptyCta: 'Add a habit',
  },

  streakHeader: {
    streak: 'streak',
    gems: 'gems',
    level: 'level',
  },

  dailyGoal: {
    title: 'Daily goal',
    titleComplete: 'Daily goal complete',
    titleEmpty: 'No daily goal yet',
    captionEmpty: 'Add a habit or turn on water tracking to start a streak.',
    captionMet: 'Your flame is safe for today.',
    captionLeft: (left: number) =>
      `${left} more ${left === 1 ? 'task' : 'tasks'} to keep your streak.`,
    a11y: (done: number, need: number) => `Daily goal: ${done} of ${need} tasks done`,
    chipHabits: (done: number, total: number) => `✅ ${done}/${total} habits`,
    chipWater: '💧 Water',
    chipWaterDone: '💧 Water done',
  },

  waterRing: {
    a11y: (ml: string, goal: string, percent: number) =>
      `Water: ${ml} of ${goal}, ${percent} percent`,
    of: (goal: string, percent: number) => `of ${goal} · ${percent}%`,
  },

  habits: {
    title: 'Your habits',
    meta: (used: number, total: number) =>
      `${used} / ${total} slots · tap Edit to rename · long-press to delete`,
    waterTracking: 'Water tracking',
    waterMeta: (ml: string, goal: string) => `${ml} / ${goal} · long-press to remove`,
    waterHint: 'Long press to remove water tracking',
    addWaterTracking: '💧 Add water tracking',
    addHabit: '+ Add habit',
    addHabitA11y: 'Add habit',
    unlockCta: (slots: number) => `🎬 Watch an ad to unlock ${slots} more habits`,
    unlockA11y: (slots: number) => `Watch an ad to unlock ${slots} more habit slots`,
    hint: (free: number, extra: number) =>
      `${free} habits are free. Watching a short ad unlocks ${extra} more slots and keeps HabitFlow free for everyone. Water tracking never uses a slot.`,
    deleteTitle: 'Delete habit?',
    removeWaterTitle: 'Remove water tracking?',
    removeWaterBody: 'You can add it back later. Your sip history stays on this phone.',
    startStreak: 'Start a streak today',
    dayStreak: (days: number) => `🔥 ${days}-day streak`,
    edit: 'Edit',
    editA11y: (name: string) => `Edit ${name}`,
    rowA11y: (name: string, streak: number) =>
      streak > 0 ? `${name}, ${streak} day streak` : name,
    rowHint: 'Double tap to toggle, long press to delete',
  },

  rewards: {
    unavailableTitle: 'Reward unavailable',
    adFailedBody:
      'The ad did not finish loading. Please check your connection and try again in a moment.',
    noAdHabitsBody: (free: number) =>
      `No ad is available right now. Your ${free} free habits stay available.`,
    noAdBody: 'No ad is available right now. Please try again later.',
    freezeReadyTitle: 'Streak freeze ready',
    freezeReadyBody: 'If you miss a day, one freeze will keep your flame.',
    freezeFullTitle: 'Inventory full',
    freezeFullBody: (max: number) => `You already have ${max} streak freezes.`,
  },

  progress: {
    title: 'Progress',
    meta: (streak: number, best: number, freezes: number) =>
      `🔥 ${streak}-day streak · best ${best} · ${freezes} freeze${freezes === 1 ? '' : 's'}`,
    thisWeek: 'This week',
    dayGoalMet: 'goal met',
    dayFrozen: 'streak freeze used',
    dayMissed: 'goal missed',
    dayA11y: (date: string, status: string) => `${date}: ${status}`,
    level: (level: number, into: number, total: number) =>
      `Level ${level} · ${into}/${total} XP`,
    xpLine: (xp: number, gems: number) => `${xp} XP total · 💎 ${gems} gems`,
    freezeCta: '❄️ Watch an ad for a streak freeze',
    freezeA11y: 'Watch an ad for a streak freeze',
    achievements: 'Achievements',
    badgeA11y: (title: string, description: string, unlocked: boolean) =>
      `${title}: ${description}. ${unlocked ? 'Unlocked' : 'Locked'}`,
  },

  hydration: {
    title: 'Hydration',
    header: (ml: string, goal: string) => `${ml} / ${goal}`,
    footer: (total: string, average: string, met: number, days: number) =>
      `${total} over ${days} days · ${average} a day · goal met ${met}/${days}`,
    allTime: (total: string, days: number) =>
      `All time · ${total} over ${days} ${days === 1 ? 'day' : 'days'}`,
    allTimeEmpty: 'All time history',
    seeAll: 'See all →',
    cardA11y: 'Water history: open the all-time chart',
    barA11y: (date: string, ml: string, goal: string, met: boolean) =>
      `${date}: ${ml} of ${goal}${met ? ', goal met' : ''}`,
  },

  waterHistory: {
    ranges: { '7d': '7D', '30d': '30D', '1y': '1Y', all: 'All' },
    rangeA11y: {
      '7d': 'Last 7 days',
      '30d': 'Last 30 days',
      '1y': 'Last year',
      all: 'All time',
    },
    dailyAverage: 'Daily average',
    percentOfGoal: (percent: number) => `${percent}% of goal`,
    bucketDay: 'One point per day',
    bucketWeek: 'One point per week — daily average',
    bucketMonth: 'One point per month — daily average',
    legendGoal: (goal: string) => `Goal ${goal}`,
    legendAverage: 'Your average',
    chartA11y: (bucket: string, average: string, goal: string) =>
      `Water intake chart. ${bucket}. Daily average ${average} against a ${goal} goal.`,
    daysOnGoal: 'Days on goal',
    daysOnGoalHint: (percent: number) => `${percent}% of days`,
    totalVolume: 'Total volume',
    totalVolumeHint: (days: number) => `${days} ${days === 1 ? 'day' : 'days'} logged`,
    bestDay: 'Best day',
    bestDayEmpty: 'No water logged',
    trackingSince: 'Tracking since',
    trackingSinceHint: (days: number) => `${days} days of history`,
    emptyTitle: 'Nothing logged yet',
    emptyBody:
      'Add water from the Today tab and this chart starts filling in. Daily totals are kept for good, so you can come back to them years from now.',
    footnote:
      "Every sip is kept for 90 days; each day's total is kept for good, so the All view keeps growing year after year.",
  },

  settings: {
    title: 'Settings',
    appearance: 'Appearance',
    appearanceSystem: (current: string) =>
      `Following your phone — currently ${current}. Pick Light or Dark to keep HabitFlow on one theme whatever your phone does.`,
    appearanceFixed: (choice: string) =>
      `HabitFlow stays ${choice} even when your phone switches.`,
    themeSystem: '⚙️ System',
    themeLight: '☀️ Light',
    themeDark: '🌙 Dark',
    schemeLight: 'light',
    schemeDark: 'dark',
    themeA11y: (choice: string) => `Appearance: ${choice}`,
    language: 'Language',
    languageSystem: (current: string) =>
      `Following your phone — currently ${current}. Pick a language to keep HabitFlow in it whatever your phone does.`,
    languageFixed: (current: string) => `HabitFlow stays in ${current}.`,
    languageSystemChip: '⚙️ System',
    languageA11y: (choice: string) => `Language: ${choice}`,
    dailyGoal: 'Daily goal',
    dailyGoalHelpWater:
      'Finish this many tasks to keep your flame. Your water goal counts as one of them.',
    dailyGoalHelp:
      'Finish this many habits to keep your flame. If you have fewer habits, the goal shrinks to match.',
    goalCasual: 'Casual · 1',
    goalRegular: 'Regular · 2',
    goalSerious: 'Serious · 3',
    goalEverything: 'Everything',
    goalA11y: (label: string) => `Daily goal: ${label}`,
    waterIsATask: 'Water counts as a daily task',
    waterIsATaskHelp:
      'On: hitting your water goal ticks off one of your daily tasks. Off: water only earns bonus XP.',
    waterGoal: 'Daily water goal',
    waterGoalA11y: (goal: string) => `Water goal ${goal}`,
    reminders: 'Water reminders',
    waterOff: 'Water tracking is off. Add it back from the Habits tab.',
    privacy: 'Privacy',
    privacyBody:
      'HabitFlow keeps your habits, sips and streak on this device only. Nothing is uploaded to a server. Ads are served by Google AdMob.',
    privacyPolicy: 'Privacy policy',
    adPrivacy: 'Ad privacy options',
    eraseData: 'Erase all my data',
    eraseTitle: 'Erase all HabitFlow data?',
    eraseBody:
      'Your habits, sip history, streak, XP and gems are stored only on this phone. They will be permanently deleted and HabitFlow will start over from scratch. Your language and appearance settings are kept.',
    about: 'About',
    version: (version: string) => `HabitFlow ${version}`,
    contactSupport: 'Contact support',
  },

  habitForm: {
    newTitle: 'New habit',
    editTitle: 'Edit habit',
    name: 'Name',
    namePlaceholder: 'e.g. No sugar',
    nameA11y: 'Habit name',
    icon: 'Icon',
    iconA11y: (emoji: string) => `Icon ${emoji}`,
    saveNew: 'Save habit',
    saveEdit: 'Save changes',
    nameRequiredTitle: 'Name required',
    nameRequiredBody: 'Give this habit a short name.',
    limitTitle: 'Habit limit reached',
    limitBody: 'Watch a rewarded ad from the Habits tab to unlock more slots.',
    limitBodyHabitsTab: 'Watch a short ad from the Habits tab to unlock more slots.',
  },

  celebration: {
    titleStreak: 'Nice work!',
    titleReward: 'You earned a reward',
    dailyGoal: (streak: number) => `Daily goal complete · ${streak}-day streak`,
    perfectDay: 'Perfect day bonus',
    levelUp: (level: number) => `Level up! You reached level ${level}`,
    xp: (xp: number) => `+${xp} XP`,
    gems: (gems: number) => `+${gems} gems`,
    keepGoing: 'Keep going',
  },

  achievements: {
    first_goal: { title: 'First win', description: 'Hit your daily goal' },
    streak_3: { title: 'On a roll', description: 'Reach a 3-day streak' },
    streak_7: { title: 'Week warrior', description: 'Reach a 7-day streak' },
    streak_14: { title: 'Two-week flame', description: 'Reach a 14-day streak' },
    streak_30: { title: 'Monthly legend', description: 'Reach a 30-day streak' },
    streak_100: { title: 'Centurion', description: 'Reach a 100-day streak' },
    first_perfect: { title: 'Perfect day', description: 'Finish every habit and water' },
    level_5: { title: 'Level 5', description: 'Reach level 5' },
    level_10: { title: 'Level 10', description: 'Reach level 10' },
    hydrate_7: { title: 'Hydrated week', description: 'Hit your water goal 7 days in a row' },
  },

  notifications: {
    channel: 'HabitFlow reminders',
    waterTitle: 'Time to drink water',
    waterBody: 'A quick glass keeps your HabitFlow streak alive.',
    streakTitle: (days: number): string =>
      days > 0 ? `Your ${days}-day streak is at risk` : 'Your streak is at risk',
    streakBody: 'Finish today’s daily goal to keep the flame going.',
  },
};

export type Messages = typeof en;
