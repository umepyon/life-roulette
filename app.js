const PLAYER_COLORS = [
  { value: "#7460d9", name: "すみれ" },
  { value: "#ef766d", name: "さんご" },
  { value: "#46b89b", name: "みどり" },
  { value: "#e2a83e", name: "きん" },
];

const CHARACTER_PROFILES = [
  { id: "m1", name: "湊", gender: "男性", hobby: "写真とキャンプ", dreamJob: "冒険写真家", sheet: "men", sprite: 0 },
  { id: "m2", name: "律", gender: "男性", hobby: "科学実験", dreamJob: "研究者", sheet: "men", sprite: 1 },
  { id: "m3", name: "蓮", gender: "男性", hobby: "バスケットボール", dreamJob: "スポーツトレーナー", sheet: "men", sprite: 2 },
  { id: "m4", name: "颯太", gender: "男性", hobby: "コーヒー研究", dreamJob: "バリスタ", sheet: "men", sprite: 3 },
  { id: "m5", name: "大和", gender: "男性", hobby: "街歩き", dreamJob: "起業家", sheet: "men", sprite: 4 },
  { id: "m6", name: "悠真", gender: "男性", hobby: "登山", dreamJob: "アウトドアガイド", sheet: "men", sprite: 5 },
  { id: "m7", name: "蒼", gender: "男性", hobby: "書道", dreamJob: "クリエイティブディレクター", sheet: "men", sprite: 6 },
  { id: "m8", name: "樹", gender: "男性", hobby: "ギター", dreamJob: "ミュージシャン", sheet: "men", sprite: 7 },
  { id: "f1", name: "ひなた", gender: "女性", hobby: "ヨガ", dreamJob: "フィットネストレーナー", sheet: "women", sprite: 0 },
  { id: "f2", name: "美月", gender: "女性", hobby: "写真", dreamJob: "フォトグラファー", sheet: "women", sprite: 1 },
  { id: "f3", name: "凛", gender: "女性", hobby: "ファッション", dreamJob: "ジュエリーデザイナー", sheet: "women", sprite: 2 },
  { id: "f4", name: "結衣", gender: "女性", hobby: "料理", dreamJob: "シェフ", sheet: "women", sprite: 3 },
  { id: "f5", name: "咲良", gender: "女性", hobby: "イラスト", dreamJob: "イラストレーター", sheet: "women", sprite: 4 },
  { id: "f6", name: "葵", gender: "女性", hobby: "文房具集め", dreamJob: "編集者", sheet: "women", sprite: 5 },
  { id: "f7", name: "澪", gender: "女性", hobby: "ドライブ", dreamJob: "モータージャーナリスト", sheet: "women", sprite: 6 },
  { id: "f8", name: "琴音", gender: "女性", hobby: "ガーデニング", dreamJob: "植物研究者", sheet: "women", sprite: 7 },
];

const CHARACTER_BY_ID = Object.fromEntries(CHARACTER_PROFILES.map((profile) => [profile.id, profile]));
const DEFAULT_CHARACTER_IDS = ["m1", "f1", "m2", "f2"];
const DEFAULT_NAMES = DEFAULT_CHARACTER_IDS.map((id) => CHARACTER_BY_ID[id].name);
const STARTING_CASH = 120000;
const GOAL_ID = "goal";
const GIFT_AMOUNTS = { 1: 10000, 2: 20000, 3: 30000, 4: 50000, 5: 70000, 6: 100000 };
const CASINO_LOSS_AMOUNT = -10000000;
const MOBILE_LAYOUT_QUERY = "(max-width: 760px), (max-width: 900px) and (max-height: 500px)";

const LEGACY_SPACES = [
  { id: "start", label: "START", sub: "出発", icon: "🏁", type: "start", grid: [11, 1], next: "first-payday" },
  { id: "first-payday", label: "はじめての給料", sub: "+収入", icon: "💴", type: "money", grid: [10, 1], next: "dream-seed" },
  { id: "dream-seed", label: "夢のタネ", sub: "発見", icon: "🌱", type: "event", amount: 9000, grid: [9, 1], next: "school-fork" },
  {
    id: "school-fork", label: "最初の分岐", sub: "進路を選ぶ", icon: "⇄", type: "branch", grid: [8, 2],
    routeOptions: [
      { title: "学びのルート", detail: "時間をかけて、好きなことを深く学ぶ", next: "college-1", effect: "学びのルートを選んだ" },
      { title: "仕事のルート", detail: "すぐに社会へ。経験を積みながら成長する", next: "work-1", effect: "仕事のルートを選んだ" },
    ],
  },
  { id: "college-1", label: "キャンパス", sub: "学び", icon: "📚", type: "event", amount: -8000, grid: [7, 2], next: "college-2" },
  { id: "college-2", label: "3マスもどる", sub: "思わぬ遠回り", icon: "↩", type: "move-back", moveBack: 3, grid: [6, 2], next: "college-3" },
  { id: "college-3", label: "研究発表", sub: "チャンス", icon: "🔭", type: "chance", grid: [5, 3], next: "college-4" },
  { id: "college-4", label: "卒業旅行", sub: "思い出", icon: "🧳", type: "event", amount: -10000, grid: [4, 4], next: "college-5" },
  { id: "college-5", label: "内定！", sub: "スタート", icon: "✦", type: "event", amount: 26000, grid: [4, 5], next: "city-join" },
  { id: "work-1", label: "入社", sub: "新しい職場", icon: "🏢", type: "event", amount: 15000, eventScene: "office", grid: [8, 3], next: "work-2" },
  { id: "work-2", label: "初ボーナス", sub: "ラッキー", icon: "🎁", type: "event", amount: 18000, grid: [8, 4], next: "work-3" },
  { id: "work-3", label: "先輩の助言", sub: "いいこと", icon: "💬", type: "event", amount: 8000, grid: [7, 5], next: "work-4" },
  { id: "work-4", label: "スキルアップ", sub: "自己投資", icon: "💡", type: "event", amount: -7000, grid: [6, 5], next: "work-5" },
  { id: "work-5", label: "昇進", sub: "チャンス", icon: "📈", type: "chance", grid: [5, 6], next: "city-join" },
  { id: "city-join", label: "まちへ", sub: "合流", icon: "🏙", type: "event", amount: 10000, grid: [4, 6], next: "city-1" },
  { id: "city-1", label: "給料日", sub: "+収入", icon: "💴", type: "money", grid: [4, 7], next: "city-2" },
  { id: "city-2", label: "1回休み", sub: "ひと休み", icon: "💤", type: "skip-turn", skipTurns: 1, grid: [3, 8], next: "city-3" },
  { id: "city-3", label: "キャリアの転機", sub: "チャンス", icon: "🚀", type: "chance", grid: [3, 9], next: "city-4" },
  { id: "city-4", label: "給料日", sub: "+収入", icon: "💴", type: "money", grid: [3, 10], next: "home-fork" },
  {
    id: "home-fork", label: "暮らしの分岐", sub: "住まいを選ぶ", icon: "⌂", type: "branch", grid: [4, 11],
    routeOptions: [
      { title: "ゆとりの街ルート", detail: "仲間が集まる便利な場所で、毎日を楽しむ", next: "urban-1", effect: "ゆとりの街ルートを選んだ" },
      { title: "じっくり住まいルート", detail: "手をかけた住まいで、穏やかな暮らしを育てる", next: "home-1", effect: "じっくり住まいルートを選んだ" },
    ],
  },
  { id: "urban-1", label: "シェアライフ", sub: "仲間", icon: "🪴", type: "event", amount: 12000, grid: [3, 12], next: "urban-2" },
  { id: "urban-2", label: "まちの祭り", sub: "たのしい", icon: "🎪", type: "event", amount: 9000, grid: [3, 13], next: "urban-3" },
  { id: "urban-3", label: "屋上カフェ", sub: "出会い", icon: "☕", type: "chance", grid: [4, 14], next: "urban-4" },
  { id: "urban-4", label: "憧れのマイカー", sub: "大きな買い物", icon: "🏎", type: "event", amount: -30000, eventScene: "car", grid: [5, 14], next: "urban-5" },
  { id: "urban-5", label: "引っ越し祝い", sub: "いいこと", icon: "🎀", type: "event", amount: 17000, grid: [6, 13], next: "urban-6" },
  { id: "urban-6", label: "週末の旅", sub: "思い出", icon: "🗺", type: "event", amount: -9000, grid: [7, 12], next: "life-join" },
  { id: "home-1", label: "マイホーム購入", sub: "夢の住まい", icon: "🏠", type: "event", amount: -16000, eventScene: "home", grid: [5, 10], next: "home-2" },
  { id: "home-2", label: "家庭菜園", sub: "いいこと", icon: "🥕", type: "event", amount: 12000, grid: [6, 10], next: "home-3" },
  { id: "home-3", label: "給料日", sub: "+収入", icon: "💴", type: "money", grid: [7, 10], next: "life-join" },
  { id: "life-join", label: "結婚！", sub: "人生イベント", icon: "💍", type: "family", familyAction: "partner", amount: 18000, grid: [8, 11], next: "family-1" },
  { id: "family-1", label: "第一子誕生", sub: "家族が増える", icon: "🍼", type: "family", familyAction: "child", amount: 10000, grid: [9, 11], next: "family-2" },
  { id: "family-2", label: "第二子誕生", sub: "家族が増える", icon: "🧸", type: "family", familyAction: "child", amount: 8000, grid: [9, 10], next: "family-3" },
  { id: "family-3", label: "先頭と入れ替え", sub: "人生の大逆転", icon: "⇆", type: "swap-leader", grid: [10, 9], next: "dream-fork" },
  {
    id: "dream-fork", label: "未来の分岐", sub: "夢を選ぶ", icon: "✦", type: "branch", grid: [10, 8],
    routeOptions: [
      { title: "挑戦のルート", detail: "新しい仕事や夢へ、思いきって進む", next: "challenge-1", effect: "挑戦のルートを選んだ" },
      { title: "しあわせのルート", detail: "好きな人たちとの時間を、ていねいに楽しむ", next: "relax-1", effect: "しあわせのルートを選んだ" },
    ],
  },
  { id: "challenge-1", label: "大きな挑戦", sub: "勝負", icon: "⚡", type: "chance", grid: [9, 7], next: "challenge-2" },
  { id: "challenge-2", label: "新プロジェクト", sub: "チャンス", icon: "🛠", type: "event", amount: 25000, grid: [9, 6], next: "challenge-3" },
  { id: "challenge-3", label: "ごほうび旅行", sub: "思い出", icon: "🌴", type: "event", amount: -12000, grid: [10, 5], next: "challenge-4" },
  { id: "challenge-4", label: "大成功！", sub: "大金を獲得", icon: "🏅", type: "event", amount: 40000, eventScene: "success", grid: [11, 4], next: "last-join" },
  { id: "relax-1", label: "家族の時間", sub: "しあわせ", icon: "🌼", type: "event", amount: 21000, grid: [11, 7], next: "relax-2" },
  { id: "relax-2", label: "好きな景色", sub: "思い出", icon: "🌅", type: "event", amount: 14000, grid: [11, 6], next: "relax-3" },
  { id: "relax-3", label: "小さな贅沢", sub: "いいこと", icon: "🍰", type: "event", amount: 9000, grid: [12, 5], next: "relax-4" },
  { id: "relax-4", label: "みんなの笑顔", sub: "しあわせ", icon: "☺", type: "event", amount: 18000, grid: [12, 4], next: "last-join" },
  { id: "last-join", label: "ラストスパート", sub: "合流", icon: "🏎", type: "chance", grid: [11, 3], next: "final-1" },
  { id: "final-1", label: "感謝を伝える", sub: "いいこと", icon: "💌", type: "event", amount: 13000, grid: [12, 3], next: "final-2" },
  { id: "final-2", label: "スタートに戻る", sub: "所持金が半分に", icon: "⏪", type: "return-start", grid: [12, 2], next: GOAL_ID },
  { id: GOAL_ID, label: "GOAL", sub: "おつかれさま", icon: "🏆", type: "goal", grid: [12, 1] },
];

const LEGACY_SPACE_BY_ID = Object.fromEntries(LEGACY_SPACES.map((space) => [space.id, space]));
const LEGACY_ROUTE_LINES = [
  ["start", "first-payday", "dream-seed", "school-fork"],
  ["school-fork", "college-1", "college-2", "college-3", "college-4", "college-5", "city-join"],
  ["school-fork", "work-1", "work-2", "work-3", "work-4", "work-5", "city-join"],
  ["city-join", "city-1", "city-2", "city-3", "city-4", "home-fork"],
  ["home-fork", "urban-1", "urban-2", "urban-3", "urban-4", "urban-5", "urban-6", "life-join"],
  ["home-fork", "home-1", "home-2", "home-3", "life-join"],
  ["life-join", "family-1", "family-2", "family-3", "dream-fork"],
  ["dream-fork", "challenge-1", "challenge-2", "challenge-3", "challenge-4", "last-join"],
  ["dream-fork", "relax-1", "relax-2", "relax-3", "relax-4", "last-join"],
  ["last-join", "final-1", "final-2", GOAL_ID],
];

const LEGACY_BRANCH_SIGNPOSTS = [
  { grid: [7, 1], label: "学び ↑ / 仕事 →" },
  { grid: [5, 12], label: "街 ↑ / 住まい ↓" },
  { grid: [10, 7], label: "挑戦 ↑ / しあわせ ↓" },
];

const LEGACY_COURSE = {
  kind: "legacy",
  spaces: LEGACY_SPACES,
  spaceById: LEGACY_SPACE_BY_ID,
  routeLines: LEGACY_ROUTE_LINES,
  signposts: LEGACY_BRANCH_SIGNPOSTS,
  startId: "start",
  seed: null,
};

const CHANCE_CARDS = [
  { title: "宝くじに当選！", amount: 40000, eventScene: "lottery" },
  { title: "友人の助け", amount: 18000, eventScene: "friends" },
  { title: "予定外の修理", amount: -26000, eventScene: "repair" },
  { title: "とっておきの副収入", amount: 30000, eventScene: "freelance" },
  { title: "うっかり出費", amount: -14000, eventScene: "expense" },
];

const EVENT_SCENES = {
  card: { kicker: "LIFE SPACE", label: "止まったマスの出来事カード" },
  office: { kicker: "NEW JOB", label: "新しい職場へ向かうイラスト" },
  car: { kicker: "BIG PURCHASE", label: "オープンカーを買うイラスト" },
  home: { kicker: "NEW HOME", label: "マイホームを買うイラスト" },
  lottery: { kicker: "JACKPOT", label: "宝くじ当選と札束のイラスト" },
  friends: { kicker: "GOOD FRIENDS", label: "友人に支えられるイラスト" },
  repair: { kicker: "UNEXPECTED REPAIR", label: "修理費の請求に困るイラスト" },
  freelance: { kicker: "SIDE INCOME", label: "副収入を得るイラスト" },
  expense: { kicker: "BIG EXPENSE", label: "大きな出費に驚くイラスト" },
  success: { kicker: "BIG SUCCESS", label: "プロジェクト成功を祝うイラスト" },
  wedding: { kicker: "WEDDING DAY", label: "結婚式を挙げるイラスト" },
  baby: { kicker: "WELCOME BABY", label: "赤ちゃんを抱っこする家族のイラスト" },
  goal: { kicker: "LIFE GOAL", label: "ゴールのトロフィーを掲げるイラスト" },
  "goal-poor-man": { kicker: "TOUGH ENDING", label: "古いアパートで節約暮らしをする男性のイラスト" },
  "goal-poor-woman": { kicker: "TOUGH ENDING", label: "古いアパートで節約暮らしをする女性のイラスト" },
};

const GENERATED_EVENT_TEMPLATES = [
  { label: "給料日", sub: "+収入", icon: "💴", type: "money" },
  { label: "趣味の時間", sub: "いいこと", icon: "🎸", type: "event", amount: 7000 },
  { label: "副業が好調", sub: "副収入", icon: "💻", type: "event", amount: 16000, eventScene: "freelance" },
  { label: "思いがけない修理", sub: "出費", icon: "🔧", type: "event", amount: -14000, eventScene: "repair" },
  { label: "新しい出会い", sub: "いいこと", icon: "🌼", type: "event", amount: 9000 },
  { label: "憧れのマイカー", sub: "大きな買い物", icon: "🏎", type: "event", amount: -30000, eventScene: "car" },
  { label: "宝くじチャンス", sub: "運だめし", icon: "🎟", type: "chance" },
  { label: "マイホーム計画", sub: "夢の住まい", icon: "🏠", type: "event", amount: -16000, eventScene: "home" },
  { label: "友人の助け", sub: "いいこと", icon: "🤝", type: "event", amount: 12000, eventScene: "friends" },
  { label: "小さな贅沢", sub: "出費", icon: "🍰", type: "event", amount: -8000, eventScene: "expense" },
  { label: "大きな挑戦", sub: "チャンス", icon: "⚡", type: "chance" },
  { label: "週末の旅", sub: "思い出", icon: "🗺", type: "event", amount: -10000 },
];

function buildHexGameCourse() {
  const hexApi = globalThis.LifeRouletteHex || globalThis.window?.LifeRouletteHex;
  if (!hexApi) return LEGACY_COURSE;
  const hexCourse = hexApi.generateHexCourse();
  const graph = hexApi.createRouteGraph(hexCourse);
  const random = hexApi.createRandom(`${hexCourse.seed}:events`);
  const mainIndexById = new Map(hexCourse.mainRoute.map((id, index) => [id, index]));
  const branchIndexById = new Map(hexCourse.branches.map((branch, index) => [branch.from, index]));
  const templates = random.shuffle(GENERATED_EVENT_TEMPLATES);
  const spaceById = {};
  const mainLength = hexCourse.mainRoute.length;
  const moveBackIndex = 5;
  const partnerIndex = 13;
  const skipTurnIndex = 14;
  const swapLeaderIndex = mainLength - 6;
  const childIndex = mainLength - 4;
  const returnStartIndex = mainLength - 2;
  let templateIndex = 0;

  hexCourse.nodes.forEach((node) => {
    const mainIndex = mainIndexById.get(node.id);
    const branchIndex = branchIndexById.get(node.id);
    let space;
    if (node.id === hexCourse.startId) {
      space = { label: "START", sub: "出発", icon: "🏁", type: "start" };
    } else if (node.id === hexCourse.goalId) {
      space = { label: "GOAL", sub: "おつかれさま", icon: "🏆", type: "goal" };
    } else if (mainIndex === returnStartIndex) {
      space = { label: "スタートに戻る", sub: "所持金が半分に", icon: "⏪", type: "return-start" };
    } else if (branchIndex !== undefined) {
      const routeOptions = graph.branchOptionsById[node.id];
      space = {
        label: branchIndex === 0 ? "最初の分岐" : "未来の分岐",
        sub: "道を選ぶ",
        icon: "⇄",
        type: "branch",
        routeOptions: [
          { title: "王道ルート", detail: "まっすぐ進んで、堅実に前へ", next: routeOptions[0], effect: "王道ルートを選んだ" },
          { title: "寄り道ルート", detail: "景色を変えて、別の出来事へ", next: routeOptions[1], effect: "寄り道ルートを選んだ" },
        ],
      };
    } else if (mainIndex === moveBackIndex) {
      space = { label: "3マスもどる", sub: "思わぬ遠回り", icon: "↩", type: "move-back", moveBack: 3 };
    } else if (mainIndex === partnerIndex) {
      space = { label: "結婚！", sub: "人生イベント", icon: "💍", type: "family", familyAction: "partner", amount: 18000 };
    } else if (mainIndex === skipTurnIndex) {
      space = { label: "1回休み", sub: "ひと休み", icon: "💤", type: "skip-turn", skipTurns: 1 };
    } else if (mainIndex === swapLeaderIndex) {
      space = { label: "先頭と入れ替え", sub: "人生の大逆転", icon: "⇆", type: "swap-leader" };
    } else if (mainIndex === childIndex) {
      space = { label: "第一子誕生", sub: "家族が増える", icon: "🍼", type: "family", familyAction: "child", amount: 10000 };
    } else {
      space = { ...templates[templateIndex % templates.length] };
      templateIndex += 1;
    }
    spaceById[node.id] = {
      id: node.id,
      q: node.q,
      r: node.r,
      next: graph.nextById[node.id],
      ...space,
    };
  });

  return {
    kind: "hex",
    seed: hexCourse.seed,
    hexCourse,
    spaces: hexCourse.nodes.map((node) => spaceById[node.id]),
    spaceById,
    startId: hexCourse.startId,
  };
}

const elements = {
  board: document.querySelector("#board"),
  playerList: document.querySelector("#player-list"),
  playerDetails: document.querySelector("#player-details"),
  currentPlayerCard: document.querySelector("#current-player-card"),
  dice: document.querySelector("#dice"),
  rollButton: document.querySelector("#roll-button"),
  rollHint: document.querySelector("#roll-hint"),
  mobileMenuButton: document.querySelector("#mobile-menu-button"),
  mobileGameMenu: document.querySelector("#mobile-game-menu"),
  mobileNewGameButton: document.querySelector("#mobile-new-game-button"),
  boardOverviewButton: document.querySelector("#board-overview-button"),
  boardOverviewModal: document.querySelector("#board-overview-modal"),
  boardOverview: document.querySelector("#board-overview"),
  boardOverviewClose: document.querySelector("#board-overview-close"),
  turnBanner: document.querySelector("#turn-banner"),
  mobileDriveView: document.querySelector("#mobile-drive-view"),
  eventFeed: document.querySelector("#event-feed"),
  setupModal: document.querySelector("#setup-modal"),
  choiceModal: document.querySelector("#choice-modal"),
  eventModal: document.querySelector("#event-modal"),
  giftModal: document.querySelector("#gift-modal"),
  goalBonusModal: document.querySelector("#goal-bonus-modal"),
  resultModal: document.querySelector("#result-modal"),
  helpModal: document.querySelector("#help-modal"),
  setupPlayerTabs: document.querySelector("#setup-player-tabs"),
  nameFields: document.querySelector("#name-fields"),
  characterGrid: document.querySelector("#character-grid"),
  setupForm: document.querySelector("#setup-form"),
  choiceTitle: document.querySelector("#choice-title"),
  choiceDescription: document.querySelector("#choice-description"),
  choiceOptions: document.querySelector("#choice-options"),
  eventScene: document.querySelector("#event-scene"),
  eventKicker: document.querySelector("#event-kicker"),
  eventTitle: document.querySelector("#event-title"),
  eventDescription: document.querySelector("#event-description"),
  eventAmount: document.querySelector("#event-amount"),
  eventContinue: document.querySelector("#event-continue"),
  giftTitle: document.querySelector("#gift-title"),
  giftDescription: document.querySelector("#gift-description"),
  giftDice: document.querySelector("#gift-dice"),
  giftResult: document.querySelector("#gift-result"),
  giftRoll: document.querySelector("#gift-roll"),
  goalBonusTitle: document.querySelector("#goal-bonus-title"),
  goalBonusDescription: document.querySelector("#goal-bonus-description"),
  goalBonusDice: document.querySelector("#goal-bonus-dice"),
  goalBonusResult: document.querySelector("#goal-bonus-result"),
  goalBonusRoll: document.querySelector("#goal-bonus-roll"),
  resultsList: document.querySelector("#results-list"),
  toast: document.querySelector("#toast"),
};

const state = {
  course: null,
  players: [],
  currentIndex: 0,
  dice: 1,
  isBusy: false,
  pendingChoice: null,
  pendingEvent: null,
  pendingGift: null,
  pendingGoalBonus: null,
  feed: [],
  playerCount: 2,
  setupNames: [...DEFAULT_NAMES],
  setupCharacters: [...DEFAULT_CHARACTER_IDS],
  activeSetupPlayer: 0,
  showingResults: false,
};

function onlineBridge() {
  return window.lifeRouletteOnline || null;
}

function canControlPlayer(playerId) {
  return onlineBridge()?.canControlPlayer?.(playerId) ?? true;
}

function publishOnlineState() {
  onlineBridge()?.publishSnapshot?.();
}

function money(amount) {
  const absolute = Math.abs(amount).toLocaleString("ja-JP");
  return `${amount < 0 ? "−" : ""}¥${absolute}`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
  }[character]));
}

function characterProfile(characterId) {
  return CHARACTER_BY_ID[characterId] || CHARACTER_PROFILES[0];
}

function activeCourse() {
  return state.course || LEGACY_COURSE;
}

function activeSpaceById(id) {
  return activeCourse().spaceById[id];
}

function portraitMarkup(profile, className = "", label = `${profile.name}のバストアップ画像`) {
  const column = profile.sprite % 4;
  const row = Math.floor(profile.sprite / 4);
  const x = (column / 3) * 100;
  const y = row * 100;
  return `<span class="character-portrait portrait-${profile.sheet} ${className}" style="--portrait-x:${x}%;--portrait-y:${y}%" role="img" aria-label="${escapeHtml(label)}"></span>`;
}

function currentPlayer() {
  return state.players[state.currentIndex];
}

function currentSpace(player) {
  return activeSpaceById(player.spaceId);
}

function nextSpaceId(player) {
  const space = currentSpace(player);
  return space.routeOptions ? player.routes[space.id] : space.next;
}

function remainingStepsToGoal(player) {
  let spaceId = player.spaceId;
  let remaining = 0;
  const visited = new Set();

  while (spaceId) {
    if (visited.has(spaceId)) return null;
    visited.add(spaceId);

    const space = activeSpaceById(spaceId);
    if (!space) return null;
    if (space.type === "goal") return remaining;

    const nextId = space.routeOptions
      ? player.routes[space.id] || space.routeOptions[0]?.next
      : space.next;
    if (!nextId) return null;

    spaceId = nextId;
    remaining += 1;
  }

  return null;
}

function remainingStepsLabel(player) {
  if (player.finished) return "ゴール済み";
  const remaining = remainingStepsToGoal(player);
  return Number.isInteger(remaining) ? `ゴールまであと${remaining}マス` : "ゴールまでの道を確認中";
}

function diceMarkup(value) {
  const visiblePips = {
    1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8],
  }[value] || [4];
  return Array.from({ length: 9 }, (_, index) => `<span class="pip ${visiblePips.includes(index) ? "" : "empty"}"></span>`).join("");
}

function passengerCount(player) {
  return 1 + Number(player.partner) + player.children;
}

function familySummary(player) {
  if (!player.partner) return "ひとり乗車";
  if (!player.children) return "パートナーと2人乗車";
  return `家族 ${passengerCount(player)}人乗車`;
}

function carMarkup(player, isCurrent = false) {
  const riders = ["adult", ...(player.partner ? ["partner"] : []), ...Array.from({ length: player.children }, () => "child")];
  const label = `${player.name}のオープンカー。${familySummary(player)}`;
  return `<span class="car-token ${isCurrent ? "is-current-car" : ""}" style="--car:${player.color}" title="${escapeHtml(label)}" role="img" aria-label="${escapeHtml(label)}">
    <span class="car-passengers">${riders.map((rider, index) => `<span class="rider ${rider} ${index === 0 ? "driver" : ""}"></span>`).join("")}</span>
    <span class="car-windshield"></span><span class="car-body"></span><span class="car-wheel wheel-left"></span><span class="car-wheel wheel-right"></span>
  </span>`;
}

function legacyGridPoint(spaceId) {
  const [row, column] = LEGACY_SPACE_BY_ID[spaceId].grid;
  return `${column - 0.5},${row - 0.5}`;
}

function legacyRouteSvgMarkup() {
  const paths = LEGACY_ROUTE_LINES.map((line, index) => `<path class="route-line ${index === 0 || index === LEGACY_ROUTE_LINES.length - 1 ? "route-line--main" : ""}" d="M ${line.map(legacyGridPoint).join(" L ")}" />`).join("");
  return `<svg class="route-network" viewBox="0 0 14 12" preserveAspectRatio="none" aria-hidden="true">${paths}</svg>`;
}

function playerPositions() {
  return state.players.reduce((accumulator, player) => {
    (accumulator[player.spaceId] ||= []).push(player);
    return accumulator;
  }, {});
}

function renderLegacyBoard() {
  elements.board.classList.remove("board-grid--hex");
  const positions = playerPositions();
  const activeSpaceId = currentPlayer()?.spaceId;
  const spaces = LEGACY_SPACES.map((space) => {
    const [row, column] = space.grid;
    const tokens = (positions[space.id] || []).map((player) => carMarkup(player, player.id === currentPlayer()?.id)).join("");
    return `<div class="space ${space.type} ${space.id === activeSpaceId ? "is-current-space" : ""}" style="grid-row:${row};grid-column:${column}" aria-label="${escapeHtml(space.label)}：${escapeHtml(space.sub)}">
      <span class="space-icon" aria-hidden="true">${space.icon}</span>
      <span class="space-label">${space.label}</span>
      <span class="space-sub">${space.sub}</span>
      ${space.routeOptions ? `<span class="branch-arrow" aria-hidden="true">↯</span>` : ""}
      <span class="tokens">${tokens}</span>
    </div>`;
  }).join("");
  const signposts = LEGACY_BRANCH_SIGNPOSTS.map((signpost) => `<div class="branch-sign" style="grid-row:${signpost.grid[0]};grid-column:${signpost.grid[1]}">${signpost.label}</div>`).join("");

  elements.board.innerHTML = `${legacyRouteSvgMarkup()}${spaces}${signposts}
    <div class="board-center" aria-hidden="true">
      <div class="center-orbit"><div class="center-copy"><span>THREE ROUTES, ONE LIFE</span><strong>人生の<br />交差点</strong><small>3つの分岐で、あなたらしい道を選ぼう。</small></div></div>
    </div>`;
}

function hexBoardLayout(hexCourse) {
  const rawPoints = hexCourse.nodes.map((node) => ({
    id: node.id,
    x: node.q * 1.5,
    y: (node.r + node.q / 2) * Math.sqrt(3),
  }));
  const minX = Math.min(...rawPoints.map((point) => point.x));
  const maxX = Math.max(...rawPoints.map((point) => point.x));
  const minY = Math.min(...rawPoints.map((point) => point.y));
  const maxY = Math.max(...rawPoints.map((point) => point.y));
  const padding = 1.3;
  const width = maxX - minX + padding * 2;
  const height = maxY - minY + padding * 2;
  const pointById = Object.fromEntries(rawPoints.map((point) => [point.id, {
    x: point.x - minX + padding,
    y: point.y - minY + padding,
  }]));
  return { width, height, pointById };
}

function hexPolygonPoints(point, radius = .62) {
  return Array.from({ length: 6 }, (_, index) => {
    const angle = (Math.PI / 3) * index;
    return `${(point.x + Math.cos(angle) * radius).toFixed(2)},${(point.y + Math.sin(angle) * radius).toFixed(2)}`;
  }).join(" ");
}

function renderHexBoard(course) {
  elements.board.classList.add("board-grid--hex");
  const positions = playerPositions();
  const activeSpaceId = currentPlayer()?.spaceId;
  const { width, height, pointById } = hexBoardLayout(course.hexCourse);
  const routes = course.hexCourse.edges.map((edge) => {
    const from = pointById[edge.from];
    const to = pointById[edge.to];
    const coordinates = `x1="${from.x.toFixed(2)}" y1="${from.y.toFixed(2)}" x2="${to.x.toFixed(2)}" y2="${to.y.toFixed(2)}"`;
    return `<line class="hex-route-bed hex-route-bed--${edge.role}" ${coordinates} /><line class="hex-route hex-route--${edge.role}" ${coordinates} />`;
  }).join("");
  const spaces = course.spaces.map((space) => {
    const point = pointById[space.id];
    return `<g class="hex-space hex-space--${space.type} ${space.id === activeSpaceId ? "is-current-space" : ""}" role="img" aria-label="${escapeHtml(space.label)}：${escapeHtml(space.sub)}">
      <polygon points="${hexPolygonPoints(point)}" />
      <text class="hex-space-icon" x="${point.x.toFixed(2)}" y="${point.y.toFixed(2)}" aria-hidden="true">${space.icon}</text>
    </g>`;
  }).join("");
  const tokens = Object.entries(positions).map(([spaceId, players]) => {
    const point = pointById[spaceId];
    if (!point) return "";
    return `<div class="hex-tokens" style="--hex-left:${(point.x / width * 100).toFixed(3)}%;--hex-top:${(point.y / height * 100).toFixed(3)}%">${players.map((player) => carMarkup(player, player.id === currentPlayer()?.id)).join("")}</div>`;
  }).join("");
  elements.board.innerHTML = `<svg class="hex-board-svg" viewBox="0 0 ${width.toFixed(2)} ${height.toFixed(2)}" role="img" aria-label="シード ${course.seed} のヘックス人生ルーレット盤">
      <title>シード ${course.seed} のヘックス人生ルーレット盤</title>
      <rect class="hex-board-background" x="0" y="0" width="${width.toFixed(2)}" height="${height.toFixed(2)}" rx="1" />
      <g class="hex-route-layer">${routes}</g>
      <g class="hex-space-layer">${spaces}</g>
    </svg><div class="hex-token-layer">${tokens}</div>`;
}

function renderBoard() {
  const course = activeCourse();
  if (course.kind === "hex") renderHexBoard(course);
  else renderLegacyBoard();
  if (!elements.boardOverviewModal.classList.contains("is-hidden")) renderBoardOverview();
}

function renderBoardOverview() {
  const boardCopy = elements.board.cloneNode(true);
  boardCopy.removeAttribute("id");
  boardCopy.setAttribute("aria-label", "人生ルーレットのボード全体");
  elements.boardOverview.replaceChildren(boardCopy);
}

function closeMobileGameMenu() {
  elements.mobileGameMenu.hidden = true;
  elements.mobileMenuButton.setAttribute("aria-expanded", "false");
  elements.mobileMenuButton.setAttribute("aria-label", "ゲームメニューを開く");
}

function toggleMobileGameMenu() {
  const willOpen = elements.mobileGameMenu.hidden;
  elements.mobileGameMenu.hidden = !willOpen;
  elements.mobileMenuButton.setAttribute("aria-expanded", String(willOpen));
  elements.mobileMenuButton.setAttribute("aria-label", willOpen ? "ゲームメニューを閉じる" : "ゲームメニューを開く");
}

function openBoardOverview() {
  closeMobileGameMenu();
  renderBoardOverview();
  elements.boardOverviewModal.classList.remove("is-hidden");
}

function closeBoardOverview() {
  elements.boardOverviewModal.classList.add("is-hidden");
  elements.mobileMenuButton.focus();
}

function renderPlayers() {
  elements.playerList.innerHTML = state.players.map((player, index) => `
    <article class="player-card ${index === state.currentIndex && !player.finished ? "is-current" : ""} ${player.finished ? "is-finished" : ""}">
      ${portraitMarkup(characterProfile(player.characterId), "player-avatar", `${player.name}のキャラクター`)}
      <div class="player-info">
        <div class="player-name"><span class="player-color" style="background:${player.color}"></span>${escapeHtml(player.name)} ${player.finished ? `<span class="finish-badge">GOAL ${player.finishOrder}位</span>` : ""}</div>
        <div class="player-job">夢：${escapeHtml(player.dreamJob)} · ${familySummary(player)}</div>
        <div class="player-remaining">${remainingStepsLabel(player)}</div>
      </div>
      <div class="player-money">${money(player.cash)}</div>
    </article>`).join("");
}

function renderCurrentPlayer() {
  const player = currentPlayer();
  if (!player) {
    elements.currentPlayerCard.innerHTML = `<p class="inactive-game-copy">ゲームを終了しました。<br />また遊ぶときは「新しいゲーム」を押してください。</p>`;
    elements.turnBanner.textContent = "ゲームを終了しました。おつかれさまでした！";
    elements.rollButton.disabled = true;
    elements.rollButton.setAttribute("aria-label", "ゲームは終了しています");
    elements.rollButton.innerHTML = `<span class="button-icon" aria-hidden="true">✦</span>サイコロを振る`;
    elements.rollHint.textContent = "新しいゲームから、いつでも再開できます。";
    return;
  }
  const space = currentSpace(player);
  const next = nextSpaceId(player) ? activeSpaceById(nextSpaceId(player)) : null;
  elements.currentPlayerCard.innerHTML = `
    <div class="current-player-top">
      <div class="current-player-name">
        ${portraitMarkup(characterProfile(player.characterId), "current-player-avatar", `${player.name}のキャラクター`)}
        <span class="current-player-summary">
          <span class="current-player-label"><i class="current-player-color" style="background:${player.color}"></i>${escapeHtml(player.name)}</span>
          <span class="current-player-money">${money(player.cash)}</span>
        </span>
      </div>
      <span class="current-player-position">${player.steps} マス目</span>
    </div>
    <div class="current-player-job">趣味：${escapeHtml(player.hobby)} · 夢：${escapeHtml(player.dreamJob)}<br />毎回の収入 ${money(player.salary)}</div>
    <div class="family-meter">${carMarkup(player)}<span>${familySummary(player)}</span></div>`;
  const course = activeCourse();
  const seedBadge = course.seed ? `<span class="course-seed" title="同じシードなら同じヘックスコースになります">HEX #${course.seed}</span>` : "";
  elements.turnBanner.innerHTML = `<span class="turn-color" style="background:${player.color}"></span><strong>${escapeHtml(player.name)}</strong> の番です。${space.routeOptions ? "進路を決めて、次の人生へ。" : "運命のサイコロを振ろう。"}${seedBadge}`;
  const canRoll = canControlPlayer(player.id);
  elements.rollButton.disabled = state.isBusy || player.finished || !canRoll;
  elements.rollButton.setAttribute("aria-label", `${player.name}さんのサイコロを振る`);
  elements.rollButton.innerHTML = state.isBusy ? `<span class="button-icon" aria-hidden="true">⌁</span>人生を進めています` : `<span class="button-icon" aria-hidden="true">✦</span>サイコロを振る`;
  elements.rollHint.textContent = state.isBusy
    ? "オープンカーがマス目を進んでいます…"
    : !canRoll
      ? `${player.name}さんの端末でサイコロを振ってください。`
      : next ? `次は「${next.label}」の方向へ。` : "分岐で行き先を選んでください。";
}

function mobileRoutePreview(player, count = 7) {
  const spaces = [];
  let space = currentSpace(player);
  for (let index = 0; space && index < count; index += 1) {
    spaces.push(space);
    const nextId = space.routeOptions
      ? player.routes[space.id] || space.routeOptions[0]?.next
      : space.next;
    space = nextId ? activeSpaceById(nextId) : null;
  }
  return spaces;
}

function renderMobileDrive() {
  const player = currentPlayer();
  if (!player) {
    elements.mobileDriveView.innerHTML = "";
    elements.mobileDriveView.classList.remove("is-moving");
    return;
  }
  const space = currentSpace(player);
  const progress = Math.min(100, Math.round((player.steps / 34) * 100));
  const drivingMessage = state.isBusy ? `サイコロの目 ${state.dice}。1マスずつ進行中！` : `いまは「${space.label}」にいます`;
  const track = mobileRoutePreview(player);
  elements.mobileDriveView.classList.toggle("is-moving", state.isBusy);
  elements.mobileDriveView.innerHTML = `
    <div class="mobile-drive-scene" role="img" aria-label="${escapeHtml(player.name)}が四角いマス目の道を進むドライブビュー">
      <div class="mobile-drive-hud">
        <span class="mobile-drive-kicker">MOBILE DRIVE BOARD</span>
        <strong><i style="background:${player.color}"></i>${escapeHtml(player.name)}の番</strong>
        <span>${escapeHtml(drivingMessage)}</span>
      </div>
      <div class="mobile-tile-road">
        ${track.map((routeSpace, index) => {
          const bottom = 24 + index * 48;
          const width = Math.max(39, 96 - index * 9);
          const fontSize = Math.max(8, 12 - index * 0.65);
          const isCurrent = index === 0;
          return `<div class="mobile-road-tile ${isCurrent ? "is-current" : ""}" style="--tile-bottom:${bottom}px;--tile-width:${width}%;--tile-font:${fontSize}px">
            <span class="mobile-road-tile-icon">${routeSpace.icon}</span>
            <strong>${escapeHtml(routeSpace.label)}</strong>
          </div>`;
        }).join("")}
      </div>
      <div class="mobile-rear-car ${state.isBusy ? "is-stepping" : ""}" aria-hidden="true"><img src="assets/mobile-rear-car.png" alt="" /></div>
      <div class="mobile-drive-progress" aria-label="ゴールまでの進行度 ${progress}%"><span style="width:${progress}%"></span></div>
    </div>`;
}

function renderFeed() {
  elements.eventFeed.innerHTML = state.feed.length ? state.feed.map((item) => `<li><span class="feed-dot ${item.tone || ""}"></span><span>${item.text}</span></li>`).join("") : `<li><span class="feed-dot"></span><span>さあ、最初のサイコロを振ろう。</span></li>`;
}

function render() {
  renderBoard();
  renderPlayers();
  renderCurrentPlayer();
  renderMobileDrive();
  elements.dice.innerHTML = diceMarkup(state.dice);
  elements.dice.classList.toggle("rolling", state.isBusy);
  renderFeed();
  publishOnlineState();
}

function addFeed(text, tone = "") {
  state.feed.unshift({ text, tone });
  state.feed = state.feed.slice(0, 9);
}

let toastTimer;
function toast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("is-visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => elements.toast.classList.remove("is-visible"), 2600);
}

function normalizeSetupCharacters() {
  const usedCharacters = new Set();
  for (let index = 0; index < state.playerCount; index += 1) {
    const previousProfile = characterProfile(state.setupCharacters[index]);
    if (!state.setupCharacters[index] || usedCharacters.has(state.setupCharacters[index])) {
      const replacement = CHARACTER_PROFILES.find((profile) => !usedCharacters.has(profile.id));
      state.setupCharacters[index] = replacement.id;
      if (state.setupNames[index] === previousProfile.name) state.setupNames[index] = replacement.name;
    }
    usedCharacters.add(state.setupCharacters[index]);
  }
}

function renderSetup() {
  normalizeSetupCharacters();
  state.activeSetupPlayer = Math.min(state.activeSetupPlayer, state.playerCount - 1);
  document.querySelectorAll("[data-player-count]").forEach((button) => button.classList.toggle("is-selected", Number(button.dataset.playerCount) === state.playerCount));
  elements.setupPlayerTabs.innerHTML = Array.from({ length: state.playerCount }, (_, index) => {
    const profile = characterProfile(state.setupCharacters[index]);
    return `<button class="setup-player-tab ${index === state.activeSetupPlayer ? "is-active" : ""}" type="button" data-setup-player="${index}" aria-pressed="${index === state.activeSetupPlayer}">
      ${portraitMarkup(profile, "setup-tab-avatar", `${index + 1}人目：${state.setupNames[index]}`)}
      <span>PLAYER ${index + 1}<strong data-setup-player-name="${index}">${escapeHtml(state.setupNames[index])}</strong></span>
    </button>`;
  }).join("");

  const activeIndex = state.activeSetupPlayer;
  const activeProfile = characterProfile(state.setupCharacters[activeIndex]);
  elements.nameFields.innerHTML = `
    ${portraitMarkup(activeProfile, "setup-featured-portrait")}
    <div class="setup-profile-copy">
      <label class="profile-name-field">
        <span><i style="background:${PLAYER_COLORS[activeIndex].value}"></i>プレイヤー名</span>
        <input id="active-player-name" maxlength="12" value="${escapeHtml(state.setupNames[activeIndex])}" aria-label="${activeIndex + 1}人目の名前" />
      </label>
      <dl class="setup-profile-details">
        <div><dt>趣味</dt><dd>${escapeHtml(activeProfile.hobby)}</dd></div>
        <div><dt>将来なりたい職業</dt><dd>${escapeHtml(activeProfile.dreamJob)}</dd></div>
      </dl>
    </div>`;

  elements.characterGrid.innerHTML = CHARACTER_PROFILES.map((profile) => {
    const assignedPlayer = state.setupCharacters.slice(0, state.playerCount).findIndex((characterId) => characterId === profile.id);
    const isCurrent = profile.id === activeProfile.id;
    const isTaken = assignedPlayer !== -1 && assignedPlayer !== activeIndex;
    return `<label class="character-card ${isCurrent ? "is-selected" : ""} ${isTaken ? "is-taken" : ""}" for="character-${profile.id}">
      <input class="character-radio" id="character-${profile.id}" type="radio" name="character-selection" value="${profile.id}" ${isCurrent ? "checked" : ""} ${isTaken ? "disabled" : ""} />
      ${portraitMarkup(profile, "character-card-portrait")}
      <span class="character-card-copy">
        <span class="character-card-heading"><strong>${escapeHtml(profile.name)}</strong><small>${escapeHtml(profile.gender)}</small></span>
        <span><b>趣味</b>${escapeHtml(profile.hobby)}</span>
        <span><b>夢</b>${escapeHtml(profile.dreamJob)}</span>
      </span>
      ${isTaken ? `<span class="character-taken">PLAYER ${assignedPlayer + 1}</span>` : ""}
    </label>`;
  }).join("");
}

function openSetup() {
  closeMobileGameMenu();
  state.playerCount = state.players.length || state.playerCount;
  state.activeSetupPlayer = 0;
  if (state.players.length) {
    state.setupNames = Array.from({ length: 4 }, (_, index) => state.players[index]?.name || state.setupNames[index] || DEFAULT_NAMES[index]);
    state.setupCharacters = Array.from({ length: 4 }, (_, index) => state.players[index]?.characterId || state.setupCharacters[index] || DEFAULT_CHARACTER_IDS[index]);
  }
  renderSetup();
  elements.setupModal.classList.remove("is-hidden");
}

function startGame(event) {
  event.preventDefault();
  const activeName = elements.nameFields.querySelector("#active-player-name");
  if (activeName) state.setupNames[state.activeSetupPlayer] = activeName.value.trim() || characterProfile(state.setupCharacters[state.activeSetupPlayer]).name;
  const names = Array.from({ length: state.playerCount }, (_, index) => state.setupNames[index].trim() || characterProfile(state.setupCharacters[index]).name);
  state.setupNames = Array.from({ length: 4 }, (_, index) => names[index] || state.setupNames[index] || DEFAULT_NAMES[index]);
  try {
    state.course = buildHexGameCourse();
  } catch (error) {
    console.warn("ヘックスコースを生成できなかったため、固定コースを使用します。", error);
    state.course = LEGACY_COURSE;
  }
  state.players = names.map((name, index) => {
    const profile = characterProfile(state.setupCharacters[index]);
    return {
      id: index, name, characterId: profile.id, hobby: profile.hobby, dreamJob: profile.dreamJob, color: PLAYER_COLORS[index].value,
      cash: STARTING_CASH, salary: 30000, job: `夢：${profile.dreamJob}`, spaceId: activeCourse().startId, steps: 0,
      routes: {}, pathHistory: [activeCourse().startId], skipTurns: 0, partner: false, children: 0, familyMilestones: [], finished: false, finishOrder: null,
    };
  });
  state.currentIndex = 0;
  state.dice = 1;
  state.isBusy = false;
  state.pendingChoice = null;
  state.pendingEvent = null;
  state.pendingGift = null;
  state.pendingGoalBonus = null;
  state.showingResults = false;
  state.feed = [];
  addFeed(`${names.join("・")}の人生がスタート！ オープンカーで出発。`, "choice-dot");
  if (state.course.seed) addFeed(`HEXコース #${state.course.seed} を生成。分岐の先には別の人生が待っています。`, "choice-dot");
  elements.playerDetails.open = !window.matchMedia(MOBILE_LAYOUT_QUERY).matches;
  elements.setupModal.classList.add("is-hidden");
  elements.resultModal.classList.add("is-hidden");
  elements.choiceModal.classList.add("is-hidden");
  elements.eventModal.classList.add("is-hidden");
  elements.giftModal.classList.add("is-hidden");
  elements.goalBonusModal.classList.add("is-hidden");
  render();
  toast("ゲームをはじめます。最初のサイコロをどうぞ！");
}

function changeMoney(player, amount) {
  player.cash += amount;
}

function rollDice() {
  const player = currentPlayer();
  if (!player || state.isBusy || player.finished) return;
  state.isBusy = true;
  state.dice = Math.floor(Math.random() * 6) + 1;
  addFeed(`${player.name}がサイコロを振った。${state.dice}マス進む！`, "choice-dot");
  render();
  window.setTimeout(() => moveStep(state.dice), 520);
}

function movementStepDelay() {
  return window.matchMedia(MOBILE_LAYOUT_QUERY).matches ? 330 : 190;
}

function moveStep(remaining) {
  const player = currentPlayer();
  const nextId = nextSpaceId(player);
  if (!nextId || remaining <= 0) {
    resolveLanding(player);
    return;
  }
  player.spaceId = nextId;
  player.steps += 1;
  player.pathHistory.push(nextId);
  const enteredSpace = currentSpace(player);
  const familyEvent = enteredSpace.type === "family" ? resolveFamilyEvent(player, enteredSpace) : null;
  render();
  if (familyEvent) {
    openLifeEvent(player, {
      ...familyEvent,
      resumeSteps: remaining - 1,
      followup: { type: "gift", celebration: familyEvent.celebration },
    });
    return;
  }
  window.setTimeout(() => moveStep(remaining - 1), movementStepDelay());
}

function movePlayerBack(player, spaces) {
  const history = Array.isArray(player.pathHistory) ? player.pathHistory : [activeCourse().startId];
  const actualSteps = Math.min(spaces, Math.max(0, history.length - 1));
  if (!actualSteps) return 0;
  player.pathHistory = history.slice(0, -actualSteps);
  player.spaceId = player.pathHistory[player.pathHistory.length - 1];
  player.steps = Math.max(0, player.steps - actualSteps);
  return actualSteps;
}

function resetPlayerToStart(player) {
  const startId = activeCourse().startId;
  player.spaceId = startId;
  player.steps = 0;
  player.routes = {};
  player.pathHistory = [startId];
}

function leadingOpponent(player) {
  const opponents = state.players.filter((entry) => entry.id !== player.id && !entry.finished && entry.steps > player.steps);
  return opponents.sort((first, second) => second.steps - first.steps)[0] || null;
}

function swapPlayerPositions(player, leader) {
  [player.spaceId, leader.spaceId] = [leader.spaceId, player.spaceId];
  [player.steps, leader.steps] = [leader.steps, player.steps];
  [player.routes, leader.routes] = [leader.routes, player.routes];
  [player.pathHistory, leader.pathHistory] = [leader.pathHistory, player.pathHistory];
}

function resolveSpecialSpace(player, space) {
  if (space.type === "move-back") {
    const actualSteps = movePlayerBack(player, space.moveBack || 3);
    const detail = actualSteps ? `${actualSteps}マスもどって、もう一度やり直しです。` : "START地点のため、これ以上はもどれません。";
    addFeed(`${player.name}は「${space.label}」で${actualSteps}マスもどった。`, "negative");
    render();
    return openLifeEvent(player, {
      scene: "card", title: space.label, amount: 0, amountLabel: actualSteps ? `${actualSteps}マスもどる` : "変化なし", amountTone: "is-neutral", icon: space.icon,
      description: `${player.name}は${detail}`,
    });
  }

  if (space.type === "skip-turn") {
    const skips = space.skipTurns || 1;
    player.skipTurns += skips;
    addFeed(`${player.name}は「${space.label}」。次の番を${skips}回休む。`, "negative");
    render();
    return openLifeEvent(player, {
      scene: "card", title: space.label, amount: 0, amountLabel: `次の番を${skips}回休み`, amountTone: "is-neutral", icon: space.icon,
      description: `${player.name}は少し休憩。次の番はお休みです。`,
    });
  }

  if (space.type === "swap-leader") {
    const leader = leadingOpponent(player);
    const detail = leader
      ? `${leader.name}さんと場所を入れ替えました！`
      : `${player.name}はすでに一番前。場所は変わりません。`;
    if (leader) swapPlayerPositions(player, leader);
    addFeed(`${player.name}の「${space.label}」：${detail}`, "choice-dot");
    render();
    return openLifeEvent(player, {
      scene: "card", title: space.label, amount: 0, amountLabel: leader ? "先頭と入れ替え！" : "あなたが先頭！", amountTone: "is-neutral", icon: space.icon,
      description: detail,
    });
  }

  if (space.type === "return-start") {
    const previousCash = player.cash;
    player.cash = Math.trunc(player.cash / 2);
    resetPlayerToStart(player);
    addFeed(`${player.name}は「${space.label}」。所持金 ${money(previousCash)} → ${money(player.cash)}でSTARTへ戻った。`, "negative");
    render();
    return openLifeEvent(player, {
      scene: "card", title: space.label, amount: 0, amountLabel: `所持金 ${money(previousCash)} → ${money(player.cash)}`, amountTone: "is-neutral", icon: space.icon,
      description: `${player.name}はゴール目前でSTARTに戻ります。所持金は半分になりました。`,
    });
  }

  return false;
}

function resolveFamilyEvent(player, space) {
  if (player.familyMilestones.includes(space.id)) return null;
  player.familyMilestones.push(space.id);
  let message = "";
  let scene = "baby";
  let celebration = "";
  if (space.familyAction === "partner" && !player.partner) {
    player.partner = true;
    scene = "wedding";
    celebration = `${player.name}さんが結婚しました！`;
    changeMoney(player, space.amount);
    message = `${player.name}は結婚！ オープンカーが2人乗りになった。 ${money(space.amount)}！`;
  } else if (space.familyAction === "child") {
    player.children += 1;
    celebration = `${player.name}さんに第${player.children}子が生まれました！`;
    changeMoney(player, space.amount);
    message = `${player.name}に子どもが生まれた！ ${familySummary(player)}に。 ${money(space.amount)}！`;
  } else {
    changeMoney(player, space.amount);
    message = `${player.name}：${space.label} ${money(space.amount)}`;
  }
  addFeed(message, "choice-dot");
  toast(message);
  return { scene, title: space.label, amount: space.amount, celebration };
}

function eventDescription(scene, player, title) {
  const descriptions = {
    office: `${player.name}は新しい職場へ。今日から仕事の物語が始まります。`,
    car: `${player.name}は憧れのオープンカーを購入！ 新しい景色へ出発です。`,
    home: `${player.name}は夢のマイホームを手に入れました。新しい暮らしのスタート！`,
    lottery: `${player.name}に大きな幸運が到来！ 「${title}」で資産がぐっと増えました。`,
    friends: `${player.name}は友人たちに支えられ、前向きな一歩を踏み出せました。`,
    repair: `${player.name}に予想外の出費。「${title}」を乗り越えて、次の一歩へ。`,
    freelance: `${player.name}の頑張りが実り、とっておきの副収入を得ました。`,
    expense: `${player.name}は大きな出費にびっくり。でも、人生はまだまだ続きます。`,
    success: `${player.name}の挑戦が実を結びました！ チームと一緒に大成功を祝おう。`,
    wedding: `${player.name}は大切な人と結婚。オープンカーにも新しい家族が加わります。`,
    baby: `${player.name}の家族に赤ちゃんが誕生！ オープンカーがもっとにぎやかに。`,
    goal: `${player.name}は人生のゴールへ到着！ 最後まで走り抜けたことを祝おう。`,
    "goal-poor-man": `${player.name}は所持金マイナスでゴール。ここから立て直す、新しい人生の始まりです。`,
    "goal-poor-woman": `${player.name}は所持金マイナスでゴール。ここから立て直す、新しい人生の始まりです。`,
  };
  return descriptions[scene];
}

function openLandingCard(player, space, amount) {
  const outcome = amount > 0
    ? `${money(amount)} を獲得しました。`
    : amount < 0
      ? `${money(Math.abs(amount))} の出費です。`
      : "次の一歩へ進みましょう。";
  return openLifeEvent(player, {
    scene: "card",
    title: space.label,
    amount,
    icon: space.icon,
    description: `${player.name}は「${space.label}」に止まりました。${outcome}`,
  });
}

function openLifeEvent(player, { scene, title, amount, amountLabel = "", amountTone = "", resumeSteps = null, followup = null, description = "", icon = "" }) {
  const sceneConfig = EVENT_SCENES[scene];
  if (!sceneConfig) return false;
  state.pendingEvent = {
    playerId: player.id, scene, title, amount, amountLabel, amountTone, resumeSteps, followup,
    description: description || eventDescription(scene, player, title) || "", icon,
  };
  renderLifeEvent();
  publishOnlineState();
  return true;
}

function renderLifeEvent() {
  const pending = state.pendingEvent;
  const player = pending && state.players.find((entry) => entry.id === pending.playerId);
  const sceneConfig = pending && EVENT_SCENES[pending.scene];
  if (!pending || !player || !sceneConfig) return;
  elements.eventScene.className = `event-scene event-scene--${pending.scene}`;
  elements.eventScene.dataset.eventIcon = pending.icon || "";
  elements.eventScene.setAttribute("aria-label", sceneConfig.label);
  elements.eventKicker.textContent = sceneConfig.kicker;
  elements.eventTitle.textContent = pending.title;
  elements.eventDescription.textContent = pending.description;
  elements.eventAmount.className = `event-amount ${pending.amountTone || (pending.amount < 0 ? "is-negative" : "is-positive")}`;
  elements.eventAmount.textContent = pending.amountLabel || `${pending.amount >= 0 ? "+" : ""}${money(pending.amount)}`;
  elements.eventContinue.disabled = !canControlPlayer(player.id);
  elements.eventContinue.setAttribute("aria-label", canControlPlayer(player.id) ? "つぎの人生へ進む" : `${player.name}さんの端末で続けてください`);
  elements.eventModal.classList.remove("is-hidden");
}

function continueAfterLifeEvent() {
  const pendingEvent = state.pendingEvent;
  if (!pendingEvent) return;
  state.pendingEvent = null;
  elements.eventModal.classList.add("is-hidden");
  publishOnlineState();
  if (pendingEvent.followup?.type === "gift") {
    startGiftCollection(pendingEvent.playerId, pendingEvent.followup, pendingEvent.resumeSteps);
    return;
  }
  if (Number.isInteger(pendingEvent.resumeSteps)) {
    window.setTimeout(() => moveStep(pendingEvent.resumeSteps), movementStepDelay());
    return;
  }
  finishTurn();
}

function giftAmountFor(roll) {
  return GIFT_AMOUNTS[roll] || GIFT_AMOUNTS[1];
}

function startGiftCollection(recipientId, { celebration }, resumeSteps = null) {
  const payerIds = state.players
    .filter((player) => player.id !== recipientId && !player.finished)
    .map((player) => player.id);
  if (!payerIds.length) {
    if (Number.isInteger(resumeSteps)) window.setTimeout(() => moveStep(resumeSteps), movementStepDelay());
    else finishTurn();
    return;
  }
  state.pendingGift = {
    recipientId,
    celebration,
    payerIds,
    payerIndex: 0,
    phase: "prompt",
    lastResult: null,
    resumeSteps,
    total: 0,
  };
  renderGiftCollection();
  elements.giftModal.classList.remove("is-hidden");
  publishOnlineState();
}

function currentGiftPayer() {
  const gift = state.pendingGift;
  return gift ? state.players.find((player) => player.id === gift.payerIds[gift.payerIndex]) : null;
}

function renderGiftCollection() {
  const gift = state.pendingGift;
  const recipient = gift && state.players.find((player) => player.id === gift.recipientId);
  const payer = currentGiftPayer();
  if (!gift || !recipient || !payer) return;
  const nextPayer = state.players.find((player) => player.id === gift.payerIds[gift.payerIndex + 1]);
  const result = gift.lastResult;
  const isResult = gift.phase === "result";
  elements.giftTitle.textContent = gift.celebration;
  elements.giftDescription.textContent = isResult
    ? `${payer.name}さんから、${recipient.name}さんへご祝儀が渡されました。`
    : `${payer.name}さん、${recipient.name}さんにご祝儀を渡すことになりました。サイコロを振ってください。`;
  elements.giftDice.innerHTML = diceMarkup(result?.roll || 1);
  elements.giftDice.classList.toggle("rolling", gift.phase === "rolling");
  elements.giftResult.textContent = isResult
    ? `出目 ${result.roll}：${money(result.paid)} を渡しました`
    : `ご祝儀の金額はサイコロで決まります。${nextPayer ? `次は${nextPayer.name}さんも振ります。` : ""}`;
  elements.giftRoll.disabled = gift.phase === "rolling" || !canControlPlayer(payer.id);
  elements.giftRoll.setAttribute("aria-label", isResult ? "次のご祝儀へ進む" : `${payer.name}さんがご祝儀のサイコロを振る`);
  elements.giftRoll.innerHTML = gift.phase === "rolling"
    ? `<span class="button-icon" aria-hidden="true">⌁</span>サイコロを振っています`
    : isResult
      ? `${nextPayer ? `次は${escapeHtml(nextPayer.name)}さんへ` : "お祝いを受け取る"} <span aria-hidden="true">→</span>`
      : `サイコロを振る <span aria-hidden="true">🎲</span>`;
}

function rollGiftDice() {
  const gift = state.pendingGift;
  const payer = currentGiftPayer();
  if (!gift || !payer || gift.phase !== "prompt") return;
  gift.phase = "rolling";
  gift.lastResult = { roll: Math.floor(Math.random() * 6) + 1 };
  renderGiftCollection();
  publishOnlineState();
  window.setTimeout(settleGiftDice, 520);
}

function settleGiftDice() {
  const gift = state.pendingGift;
  const recipient = gift && state.players.find((player) => player.id === gift.recipientId);
  const payer = currentGiftPayer();
  if (!gift || !recipient || !payer || gift.phase !== "rolling") return;
  const requested = giftAmountFor(gift.lastResult.roll);
  const paid = requested;
  changeMoney(payer, -paid);
  changeMoney(recipient, paid);
  gift.total += paid;
  gift.lastResult = { ...gift.lastResult, requested, paid };
  gift.phase = "result";
  addFeed(`${payer.name}は${recipient.name}にご祝儀 ${money(paid)} を渡した（出目 ${gift.lastResult.roll}）。`, "negative");
  render();
  renderGiftCollection();
}

function continueGiftCollection() {
  const gift = state.pendingGift;
  if (!gift) return;
  if (gift.phase === "prompt") {
    rollGiftDice();
    return;
  }
  if (gift.phase !== "result") return;
  if (gift.payerIndex + 1 < gift.payerIds.length) {
    gift.payerIndex += 1;
    gift.phase = "prompt";
    gift.lastResult = null;
    renderGiftCollection();
    publishOnlineState();
    return;
  }
  const recipient = state.players.find((player) => player.id === gift.recipientId);
  state.pendingGift = null;
  elements.giftModal.classList.add("is-hidden");
  addFeed(`${recipient.name}はみんなからご祝儀合計 ${money(gift.total)} を受け取った！`, "choice-dot");
  toast(`${recipient.name}さん、おめでとう！`);
  render();
  if (Number.isInteger(gift.resumeSteps)) {
    window.setTimeout(() => moveStep(gift.resumeSteps), movementStepDelay());
    return;
  }
  finishTurn();
}

function goalRouletteAmountFor(roll) {
  return roll === 1 ? CASINO_LOSS_AMOUNT : 0;
}

function goalSceneFor(player) {
  if (player.cash >= 0) return "goal";
  return characterProfile(player.characterId).gender === "女性" ? "goal-poor-woman" : "goal-poor-man";
}

function openGoalEvent(player, amount) {
  return openLifeEvent(player, {
    scene: goalSceneFor(player),
    title: `${player.finishOrder}番目にゴール！`,
    amount,
    amountLabel: amount === 0 ? "変化なし" : "−1,000万円",
    amountTone: amount === 0 ? "is-neutral" : "is-negative",
    description: amount === 0
      ? `${player.name}は安全な出目でした。ゴール後の所持金は変わりません。`
      : `${player.name}はゴール後にカジノへ。運命の出目1で1,000万円を失いました。`,
  });
}

function startGoalBonus(player) {
  state.pendingGoalBonus = { playerId: player.id, phase: "prompt", roll: null, amount: null };
  renderGoalBonus();
  elements.goalBonusModal.classList.remove("is-hidden");
  publishOnlineState();
}

function renderGoalBonus() {
  const bonus = state.pendingGoalBonus;
  const player = bonus && state.players.find((entry) => entry.id === bonus.playerId);
  if (!bonus || !player) return;
  const isResult = bonus.phase === "result";
  elements.goalBonusTitle.textContent = `${player.name}さん、ゴール！`;
  elements.goalBonusDescription.textContent = isResult
    ? (bonus.amount < 0 ? `${player.name}さんは、カジノで大損してしまいました…。` : `${player.name}さんは、安全な出目でした！`)
    : "ゴール後の運命サイコロを振ります。出目1だけはカジノで大損！";
  elements.goalBonusDice.innerHTML = diceMarkup(bonus.roll || 1);
  elements.goalBonusDice.classList.toggle("rolling", bonus.phase === "rolling");
  elements.goalBonusResult.textContent = isResult
    ? (bonus.amount < 0 ? `出目 ${bonus.roll}：カジノで大損 −1,000万円` : `出目 ${bonus.roll}：変化なし`)
    : "出目1だけは −1,000万円です。";
  elements.goalBonusRoll.disabled = bonus.phase === "rolling" || !canControlPlayer(player.id);
  elements.goalBonusRoll.setAttribute("aria-label", isResult ? "ゴールの結果を見る" : `${player.name}さんがゴール後の運命サイコロを振る`);
  elements.goalBonusRoll.innerHTML = bonus.phase === "rolling"
    ? `<span class="button-icon" aria-hidden="true">⌁</span>運命を決めています`
    : isResult
      ? `ゴールの結果を見る <span aria-hidden="true">→</span>`
      : `運命サイコロを振る <span aria-hidden="true">🎲</span>`;
}

function rollGoalBonus() {
  const bonus = state.pendingGoalBonus;
  if (!bonus || bonus.phase !== "prompt") return;
  bonus.phase = "rolling";
  bonus.roll = Math.floor(Math.random() * 6) + 1;
  renderGoalBonus();
  publishOnlineState();
  window.setTimeout(settleGoalBonus, 520);
}

function settleGoalBonus() {
  const bonus = state.pendingGoalBonus;
  const player = bonus && state.players.find((entry) => entry.id === bonus.playerId);
  if (!bonus || !player || bonus.phase !== "rolling") return;
  bonus.amount = goalRouletteAmountFor(bonus.roll);
  if (bonus.amount) changeMoney(player, bonus.amount);
  bonus.phase = "result";
  addFeed(bonus.amount
    ? `${player.name}はゴール後の運命サイコロで出目1。カジノで ${money(Math.abs(bonus.amount))} を失った。`
    : `${player.name}はゴール後の運命サイコロで出目 ${bonus.roll}。所持金は変化なし。`, bonus.amount ? "negative" : "choice-dot");
  render();
  renderGoalBonus();
}

function continueGoalBonus() {
  const bonus = state.pendingGoalBonus;
  if (!bonus) return;
  if (bonus.phase === "prompt") {
    rollGoalBonus();
    return;
  }
  if (bonus.phase !== "result") return;
  const player = state.players.find((entry) => entry.id === bonus.playerId);
  const amount = bonus.amount;
  state.pendingGoalBonus = null;
  elements.goalBonusModal.classList.add("is-hidden");
  if (player) openGoalEvent(player, amount);
}

function resolveLanding(player) {
  const space = currentSpace(player);
  if (space.type === "goal") {
    player.finished = true;
    player.finishOrder = state.players.filter((entry) => entry.finished).length;
    addFeed(`${player.name}が${player.finishOrder}番目にゴール！ ゴール後の運命サイコロへ。`, "choice-dot");
    toast(`${player.name}、ゴール！ おつかれさま！`);
    startGoalBonus(player);
    return;
  }
  if (space.routeOptions) {
    openRouteChoice(player, space);
    return;
  }
  if (resolveSpecialSpace(player, space)) return;
  if (space.type === "money") {
    changeMoney(player, player.salary);
    addFeed(`${player.name}は給料日。${money(player.salary)} を受け取った！`);
    if (openLandingCard(player, space, player.salary)) return;
  } else if (space.type === "chance") {
    const chance = CHANCE_CARDS[Math.floor(Math.random() * CHANCE_CARDS.length)];
    changeMoney(player, chance.amount);
    addFeed(`${player.name}：${chance.title} ${chance.amount >= 0 ? "+" : ""}${money(chance.amount)}`, chance.amount < 0 ? "negative" : "");
    if (chance.eventScene && openLifeEvent(player, { scene: chance.eventScene, title: chance.title, amount: chance.amount })) return;
    toast(`${chance.title} ${chance.amount >= 0 ? "+" : ""}${money(chance.amount)}`);
  } else if (space.type === "family") {
    const familyEvent = resolveFamilyEvent(player, space);
    if (familyEvent && openLifeEvent(player, {
      ...familyEvent,
      followup: { type: "gift", celebration: familyEvent.celebration },
    })) return;
  } else {
    const amount = space.amount || 0;
    changeMoney(player, amount);
    addFeed(`${player.name}：${space.label} ${amount >= 0 ? "+" : ""}${money(amount)}`, amount < 0 ? "negative" : "");
    if (space.eventScene && openLifeEvent(player, { scene: space.eventScene, title: space.label, amount })) return;
    if (openLandingCard(player, space, amount)) return;
  }
  finishTurn();
}

function openRouteChoice(player, space) {
  state.pendingChoice = { type: "route", playerId: player.id, spaceId: space.id, options: space.routeOptions };
  renderRouteChoice();
  publishOnlineState();
}

function renderRouteChoice() {
  const pending = state.pendingChoice;
  const player = pending && state.players.find((entry) => entry.id === pending.playerId);
  const space = pending && activeSpaceById(pending.spaceId);
  if (!pending || !player || !space) return;
  const canChoose = canControlPlayer(player.id);
  elements.choiceTitle.textContent = space.label;
  elements.choiceDescription.textContent = canChoose
    ? `${player.name}、${space.sub}。どちらの道を進む？`
    : `${player.name}さんが、別の端末で進路を選んでいます。`;
  elements.choiceOptions.innerHTML = pending.options.map((option, index) => `<button class="choice-option route-option" type="button" data-choice-option="${index}" ${canChoose ? "" : "disabled"}><strong><span class="route-option-arrow">↗</span>${option.title}</strong><span>${option.detail}</span><em>このルートへ進む</em></button>`).join("");
  elements.choiceModal.classList.remove("is-hidden");
}

function chooseOption(index) {
  const pending = state.pendingChoice;
  if (!pending || pending.type !== "route") return;
  const player = state.players.find((entry) => entry.id === pending.playerId);
  const option = pending.options[index];
  if (!player || !option) return;
  player.routes[pending.spaceId] = option.next;
  addFeed(`${player.name}は「${option.title}」を選んだ。`, "choice-dot");
  elements.choiceModal.classList.add("is-hidden");
  state.pendingChoice = null;
  toast(option.effect);
  finishTurn();
}

function finishTurn() {
  const unfinishedPlayers = state.players.filter((player) => !player.finished);
  if (unfinishedPlayers.length <= 1) {
    const lastPlayer = unfinishedPlayers[0];
    if (lastPlayer) {
      lastPlayer.finished = true;
      lastPlayer.finishOrder = state.players.length;
      addFeed(`${lastPlayer.name}は、ほかの全員がゴールしたため ${lastPlayer.finishOrder}番目（ビリ）でゴール！`, "negative");
      toast(`${lastPlayer.name}さんはビリでゴールです。結果を発表します！`);
    }
    state.isBusy = false;
    render();
    showResults();
    return;
  }
  let nextIndex = state.currentIndex;
  let checkedPlayers = 0;
  do {
    nextIndex = (nextIndex + 1) % state.players.length;
    const candidate = state.players[nextIndex];
    if (candidate.finished) continue;
    if (candidate.skipTurns > 0) {
      candidate.skipTurns -= 1;
      checkedPlayers += 1;
      addFeed(`${candidate.name}は「1回休み」で今回の番を休んだ。`, "negative");
      continue;
    }
    break;
  } while (checkedPlayers < state.players.length * 2);
  state.currentIndex = nextIndex;
  state.isBusy = false;
  render();
}

function showResults() {
  state.showingResults = true;
  renderResults();
  elements.resultModal.classList.remove("is-hidden");
  publishOnlineState();
}

function renderResults() {
  const standings = [...state.players].sort((first, second) => second.cash - first.cash);
  elements.resultsList.innerHTML = standings.map((player, index) => `<li class="result-row"><span class="result-place">${index === 0 ? "👑" : `${index + 1}`}</span><span class="result-color" style="background:${player.color}"></span><span class="result-name">${escapeHtml(player.name)}<span class="result-job">${escapeHtml(player.job)} · ${familySummary(player)} · ゴール ${player.finishOrder}番目</span></span><span class="result-money">${money(player.cash)}</span></li>`).join("");
}

function endGame() {
  state.players = [];
  state.currentIndex = 0;
  state.dice = 1;
  state.isBusy = false;
  state.pendingChoice = null;
  state.pendingEvent = null;
  state.pendingGift = null;
  state.pendingGoalBonus = null;
  state.showingResults = false;
  state.feed = [{ text: "ゲームを終了しました。おつかれさまでした。", tone: "choice-dot" }];
  elements.resultModal.classList.add("is-hidden");
  render();
  toast("ゲームを終了しました。おつかれさまでした！");
}

function sharedGameSnapshot() {
  const snapshot = {
    course: state.course,
    players: state.players,
    currentIndex: state.currentIndex,
    dice: state.dice,
    isBusy: state.isBusy,
    pendingChoice: state.pendingChoice,
    pendingEvent: state.pendingEvent,
    pendingGift: state.pendingGift,
    pendingGoalBonus: state.pendingGoalBonus,
    feed: state.feed,
    playerCount: state.playerCount,
    showingResults: state.showingResults,
  };
  return JSON.parse(JSON.stringify(snapshot));
}

function syncSharedDialogs() {
  if (state.pendingChoice) renderRouteChoice();
  else elements.choiceModal.classList.add("is-hidden");
  if (state.pendingEvent) renderLifeEvent();
  else elements.eventModal.classList.add("is-hidden");
  if (state.pendingGift) {
    renderGiftCollection();
    elements.giftModal.classList.remove("is-hidden");
  } else elements.giftModal.classList.add("is-hidden");
  if (state.pendingGoalBonus) {
    renderGoalBonus();
    elements.goalBonusModal.classList.remove("is-hidden");
  } else elements.goalBonusModal.classList.add("is-hidden");
  if (state.showingResults) {
    renderResults();
    elements.resultModal.classList.remove("is-hidden");
  } else elements.resultModal.classList.add("is-hidden");
}

function applySharedGameSnapshot(snapshot) {
  if (!snapshot || !Array.isArray(snapshot.players) || !snapshot.course) return;
  ["course", "players", "currentIndex", "dice", "isBusy", "pendingChoice", "pendingEvent", "pendingGift", "pendingGoalBonus", "feed", "playerCount", "showingResults"].forEach((key) => {
    if (key in snapshot) state[key] = snapshot[key];
  });
  elements.setupModal.classList.add("is-hidden");
  render();
  syncSharedDialogs();
}

function onlineActionOwner(action) {
  if (action === "roll") return currentPlayer()?.id;
  if (action === "choice") return state.pendingChoice?.playerId;
  if (action === "event") return state.pendingEvent?.playerId;
  if (action === "gift") return currentGiftPayer()?.id;
  if (action === "goal") return state.pendingGoalBonus?.playerId;
  return null;
}

function runOnlineAction(action, payload = {}) {
  if (action === "roll") return rollDice();
  if (action === "choice") return chooseOption(Number(payload.index));
  if (action === "event") return continueAfterLifeEvent();
  if (action === "gift") return continueGiftCollection();
  if (action === "goal") return continueGoalBonus();
}

window.lifeRouletteGame = {
  startOnlineGame: () => startGame({ preventDefault() {} }),
  getSnapshot: sharedGameSnapshot,
  applySnapshot: applySharedGameSnapshot,
  actionOwner: onlineActionOwner,
  runAction: runOnlineAction,
  render: () => {
    render();
    syncSharedDialogs();
  },
  toast,
};

document.querySelectorAll("[data-player-count]").forEach((button) => button.addEventListener("click", () => {
  state.playerCount = Number(button.dataset.playerCount);
  renderSetup();
}));
elements.setupPlayerTabs.addEventListener("click", (event) => {
  const tab = event.target.closest("[data-setup-player]");
  if (!tab) return;
  state.activeSetupPlayer = Number(tab.dataset.setupPlayer);
  renderSetup();
});
elements.characterGrid.addEventListener("change", (event) => {
  if (!event.target.matches(".character-radio")) return;
  const activeIndex = state.activeSetupPlayer;
  const previousProfile = characterProfile(state.setupCharacters[activeIndex]);
  const nextProfile = characterProfile(event.target.value);
  if (state.setupNames[activeIndex] === previousProfile.name) state.setupNames[activeIndex] = nextProfile.name;
  state.setupCharacters[activeIndex] = nextProfile.id;
  renderSetup();
});
elements.nameFields.addEventListener("input", (event) => {
  if (event.target.id !== "active-player-name") return;
  state.setupNames[state.activeSetupPlayer] = event.target.value;
  const tabName = elements.setupPlayerTabs.querySelector(`[data-setup-player-name="${state.activeSetupPlayer}"]`);
  if (tabName) tabName.textContent = event.target.value || characterProfile(state.setupCharacters[state.activeSetupPlayer]).name;
});
elements.setupForm.addEventListener("submit", startGame);
elements.rollButton.addEventListener("click", rollDice);
elements.eventContinue.addEventListener("click", continueAfterLifeEvent);
elements.giftRoll.addEventListener("click", continueGiftCollection);
elements.goalBonusRoll.addEventListener("click", continueGoalBonus);
document.querySelector("#new-game-button").addEventListener("click", openSetup);
elements.mobileMenuButton.addEventListener("click", (event) => {
  event.stopPropagation();
  toggleMobileGameMenu();
});
elements.mobileGameMenu.addEventListener("click", (event) => event.stopPropagation());
elements.mobileNewGameButton.addEventListener("click", openSetup);
elements.boardOverviewButton.addEventListener("click", openBoardOverview);
elements.boardOverviewClose.addEventListener("click", closeBoardOverview);
document.querySelector("#play-again-button").addEventListener("click", openSetup);
document.querySelector("#quit-game-button").addEventListener("click", endGame);
document.querySelector("#help-button").addEventListener("click", () => elements.helpModal.classList.remove("is-hidden"));
document.querySelector("#help-close").addEventListener("click", () => elements.helpModal.classList.add("is-hidden"));
document.querySelector("#setup-close").addEventListener("click", () => { if (state.players.length) elements.setupModal.classList.add("is-hidden"); });
elements.choiceOptions.addEventListener("click", (event) => { const option = event.target.closest("[data-choice-option]"); if (option) chooseOption(Number(option.dataset.choiceOption)); });
document.querySelectorAll(".modal-backdrop").forEach((backdrop) => backdrop.addEventListener("click", (event) => {
  if (event.target !== backdrop) return;
  if (backdrop === elements.boardOverviewModal) {
    closeBoardOverview();
    return;
  }
  if (backdrop === elements.helpModal || (backdrop === elements.setupModal && state.players.length)) backdrop.classList.add("is-hidden");
}));
document.addEventListener("click", (event) => {
  if (!elements.mobileGameMenu.hidden && !elements.mobileGameMenu.contains(event.target) && !elements.mobileMenuButton.contains(event.target)) closeMobileGameMenu();
});
document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if (!elements.boardOverviewModal.classList.contains("is-hidden")) {
    closeBoardOverview();
    return;
  }
  closeMobileGameMenu();
});

if (window.matchMedia(MOBILE_LAYOUT_QUERY).matches) elements.playerDetails.open = false;
renderSetup();
startGame(new Event("submit"));
elements.setupModal.classList.remove("is-hidden");
