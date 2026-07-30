const PLAYER_COLORS = [
  { value: "#7460d9", name: "すみれ" },
  { value: "#ef766d", name: "さんご" },
  { value: "#46b89b", name: "みどり" },
  { value: "#e2a83e", name: "きん" },
];

const DEFAULT_NAMES = ["はる", "そら", "みどり", "もも"];
const STARTING_CASH = 120000;
const GOAL_ID = "goal";

const SPACES = [
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
  { id: "college-2", label: "新しい友だち", sub: "いいこと", icon: "☀", type: "event", amount: 12000, grid: [6, 2], next: "college-3" },
  { id: "college-3", label: "研究発表", sub: "チャンス", icon: "🔭", type: "chance", grid: [5, 3], next: "college-4" },
  { id: "college-4", label: "卒業旅行", sub: "思い出", icon: "🧳", type: "event", amount: -10000, grid: [4, 4], next: "college-5" },
  { id: "college-5", label: "内定！", sub: "スタート", icon: "✦", type: "event", amount: 26000, grid: [4, 5], next: "city-join" },
  { id: "work-1", label: "入社", sub: "スタート", icon: "🏢", type: "event", amount: 15000, grid: [8, 3], next: "work-2" },
  { id: "work-2", label: "初ボーナス", sub: "ラッキー", icon: "🎁", type: "event", amount: 18000, grid: [8, 4], next: "work-3" },
  { id: "work-3", label: "先輩の助言", sub: "いいこと", icon: "💬", type: "event", amount: 8000, grid: [7, 5], next: "work-4" },
  { id: "work-4", label: "スキルアップ", sub: "自己投資", icon: "💡", type: "event", amount: -7000, grid: [6, 5], next: "work-5" },
  { id: "work-5", label: "昇進", sub: "チャンス", icon: "📈", type: "chance", grid: [5, 6], next: "city-join" },
  { id: "city-join", label: "まちへ", sub: "合流", icon: "🏙", type: "event", amount: 10000, grid: [4, 6], next: "city-1" },
  { id: "city-1", label: "給料日", sub: "+収入", icon: "💴", type: "money", grid: [4, 7], next: "city-2" },
  { id: "city-2", label: "趣味の時間", sub: "出会い", icon: "🎸", type: "event", amount: 7000, grid: [3, 8], next: "city-3" },
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
  { id: "urban-4", label: "給料日", sub: "+収入", icon: "💴", type: "money", grid: [5, 14], next: "urban-5" },
  { id: "urban-5", label: "引っ越し祝い", sub: "いいこと", icon: "🎀", type: "event", amount: 17000, grid: [6, 13], next: "urban-6" },
  { id: "urban-6", label: "週末の旅", sub: "思い出", icon: "🗺", type: "event", amount: -9000, grid: [7, 12], next: "life-join" },
  { id: "home-1", label: "リノベ計画", sub: "自己投資", icon: "🔨", type: "event", amount: -16000, grid: [5, 10], next: "home-2" },
  { id: "home-2", label: "家庭菜園", sub: "いいこと", icon: "🥕", type: "event", amount: 12000, grid: [6, 10], next: "home-3" },
  { id: "home-3", label: "給料日", sub: "+収入", icon: "💴", type: "money", grid: [7, 10], next: "life-join" },
  { id: "life-join", label: "特別な出会い", sub: "人生イベント", icon: "💍", type: "family", familyAction: "partner", amount: 18000, grid: [8, 11], next: "family-1" },
  { id: "family-1", label: "第一子誕生", sub: "家族が増える", icon: "🍼", type: "family", familyAction: "child", amount: 10000, grid: [9, 11], next: "family-2" },
  { id: "family-2", label: "第二子誕生", sub: "家族が増える", icon: "🧸", type: "family", familyAction: "child", amount: 8000, grid: [9, 10], next: "family-3" },
  { id: "family-3", label: "家族の休日", sub: "しあわせ", icon: "🎠", type: "event", amount: 15000, grid: [10, 9], next: "dream-fork" },
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
  { id: "challenge-4", label: "大成功！", sub: "ラッキー", icon: "🏅", type: "event", amount: 40000, grid: [11, 4], next: "last-join" },
  { id: "relax-1", label: "家族の時間", sub: "しあわせ", icon: "🌼", type: "event", amount: 21000, grid: [11, 7], next: "relax-2" },
  { id: "relax-2", label: "好きな景色", sub: "思い出", icon: "🌅", type: "event", amount: 14000, grid: [11, 6], next: "relax-3" },
  { id: "relax-3", label: "小さな贅沢", sub: "いいこと", icon: "🍰", type: "event", amount: 9000, grid: [12, 5], next: "relax-4" },
  { id: "relax-4", label: "みんなの笑顔", sub: "しあわせ", icon: "☺", type: "event", amount: 18000, grid: [12, 4], next: "last-join" },
  { id: "last-join", label: "ラストスパート", sub: "合流", icon: "🏎", type: "chance", grid: [11, 3], next: "final-1" },
  { id: "final-1", label: "感謝を伝える", sub: "いいこと", icon: "💌", type: "event", amount: 13000, grid: [12, 3], next: "final-2" },
  { id: "final-2", label: "あと一歩", sub: "ゴール前", icon: "✨", type: "event", amount: 10000, grid: [12, 2], next: GOAL_ID },
  { id: GOAL_ID, label: "GOAL", sub: "おつかれさま", icon: "🏆", type: "goal", grid: [12, 1] },
];

const SPACE_BY_ID = Object.fromEntries(SPACES.map((space) => [space.id, space]));
const ROUTE_LINES = [
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

const BRANCH_SIGNPOSTS = [
  { grid: [7, 1], label: "学び ↑ / 仕事 →" },
  { grid: [5, 12], label: "街 ↑ / 住まい ↓" },
  { grid: [10, 7], label: "挑戦 ↑ / しあわせ ↓" },
];

const CHANCE_CARDS = [
  { title: "懸賞に当選！", amount: 40000 },
  { title: "友人の助け", amount: 18000 },
  { title: "予定外の修理", amount: -26000 },
  { title: "とっておきの副収入", amount: 30000 },
  { title: "うっかり出費", amount: -14000 },
];

const elements = {
  board: document.querySelector("#board"),
  playerList: document.querySelector("#player-list"),
  currentPlayerCard: document.querySelector("#current-player-card"),
  dice: document.querySelector("#dice"),
  rollButton: document.querySelector("#roll-button"),
  rollHint: document.querySelector("#roll-hint"),
  turnBanner: document.querySelector("#turn-banner"),
  eventFeed: document.querySelector("#event-feed"),
  setupModal: document.querySelector("#setup-modal"),
  choiceModal: document.querySelector("#choice-modal"),
  resultModal: document.querySelector("#result-modal"),
  helpModal: document.querySelector("#help-modal"),
  nameFields: document.querySelector("#name-fields"),
  setupForm: document.querySelector("#setup-form"),
  choiceTitle: document.querySelector("#choice-title"),
  choiceDescription: document.querySelector("#choice-description"),
  choiceOptions: document.querySelector("#choice-options"),
  resultsList: document.querySelector("#results-list"),
  toast: document.querySelector("#toast"),
};

const state = {
  players: [],
  currentIndex: 0,
  dice: 1,
  isBusy: false,
  pendingChoice: null,
  feed: [],
  playerCount: 2,
  setupNames: [...DEFAULT_NAMES],
};

function money(amount) {
  const absolute = Math.abs(amount).toLocaleString("ja-JP");
  return `${amount < 0 ? "−" : ""}¥${absolute}`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
  }[character]));
}

function currentPlayer() {
  return state.players[state.currentIndex];
}

function currentSpace(player) {
  return SPACE_BY_ID[player.spaceId];
}

function nextSpaceId(player) {
  const space = currentSpace(player);
  return space.routeOptions ? player.routes[space.id] : space.next;
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

function gridPoint(spaceId) {
  const [row, column] = SPACE_BY_ID[spaceId].grid;
  return `${column - 0.5},${row - 0.5}`;
}

function routeSvgMarkup() {
  const paths = ROUTE_LINES.map((line, index) => `<path class="route-line ${index === 0 || index === ROUTE_LINES.length - 1 ? "route-line--main" : ""}" d="M ${line.map(gridPoint).join(" L ")}" />`).join("");
  return `<svg class="route-network" viewBox="0 0 14 12" preserveAspectRatio="none" aria-hidden="true">${paths}</svg>`;
}

function renderBoard() {
  const positions = state.players.reduce((accumulator, player) => {
    (accumulator[player.spaceId] ||= []).push(player);
    return accumulator;
  }, {});
  const activeSpaceId = currentPlayer()?.spaceId;
  const spaces = SPACES.map((space) => {
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
  const signposts = BRANCH_SIGNPOSTS.map((signpost) => `<div class="branch-sign" style="grid-row:${signpost.grid[0]};grid-column:${signpost.grid[1]}">${signpost.label}</div>`).join("");

  elements.board.innerHTML = `${routeSvgMarkup()}${spaces}${signposts}
    <div class="board-center" aria-hidden="true">
      <div class="center-orbit"><div class="center-copy"><span>THREE ROUTES, ONE LIFE</span><strong>人生の<br />交差点</strong><small>3つの分岐で、あなたらしい道を選ぼう。</small></div></div>
    </div>`;
}

function renderPlayers() {
  elements.playerList.innerHTML = state.players.map((player, index) => `
    <article class="player-card ${index === state.currentIndex && !player.finished ? "is-current" : ""} ${player.finished ? "is-finished" : ""}">
      <span class="player-color" style="background:${player.color}"></span>
      <div class="player-info">
        <div class="player-name">${escapeHtml(player.name)} ${player.finished ? `<span class="finish-badge">GOAL ${player.finishOrder}位</span>` : ""}</div>
        <div class="player-job">${escapeHtml(player.job)} · ${familySummary(player)}</div>
      </div>
      <div class="player-money">${money(player.cash)}</div>
    </article>`).join("");
}

function renderCurrentPlayer() {
  const player = currentPlayer();
  if (!player) return;
  const space = currentSpace(player);
  const next = nextSpaceId(player) ? SPACE_BY_ID[nextSpaceId(player)] : null;
  elements.currentPlayerCard.innerHTML = `
    <div class="current-player-top">
      <div class="current-player-name"><span class="current-player-color" style="background:${player.color}"></span>${escapeHtml(player.name)}の番</div>
      <span class="current-player-position">${player.steps} マス目</span>
    </div>
    <div class="current-player-money">${money(player.cash)}</div>
    <div class="current-player-job">${escapeHtml(player.job)} · 毎回の収入 ${money(player.salary)}</div>
    <div class="family-meter">${carMarkup(player)}<span>${familySummary(player)}</span></div>`;
  elements.turnBanner.innerHTML = `<span class="turn-color" style="background:${player.color}"></span><strong>${escapeHtml(player.name)}</strong> の番です。${space.routeOptions ? "進路を決めて、次の人生へ。" : "運命のサイコロを振ろう。"}`;
  elements.rollButton.disabled = state.isBusy || player.finished;
  elements.rollButton.innerHTML = state.isBusy ? `<span class="button-icon" aria-hidden="true">⌁</span>人生を進めています` : `<span class="button-icon" aria-hidden="true">✦</span>サイコロを振る`;
  elements.rollHint.textContent = state.isBusy ? "オープンカーがマス目を進んでいます…" : next ? `次は「${next.label}」の方向へ。` : "分岐で行き先を選んでください。";
}

function renderFeed() {
  elements.eventFeed.innerHTML = state.feed.length ? state.feed.map((item) => `<li><span class="feed-dot ${item.tone || ""}"></span><span>${item.text}</span></li>`).join("") : `<li><span class="feed-dot"></span><span>さあ、最初のサイコロを振ろう。</span></li>`;
}

function render() {
  renderBoard();
  renderPlayers();
  renderCurrentPlayer();
  elements.dice.innerHTML = diceMarkup(state.dice);
  elements.dice.classList.toggle("rolling", state.isBusy);
  renderFeed();
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

function renderSetup() {
  document.querySelectorAll("[data-player-count]").forEach((button) => button.classList.toggle("is-selected", Number(button.dataset.playerCount) === state.playerCount));
  elements.nameFields.innerHTML = Array.from({ length: state.playerCount }, (_, index) => `<label class="name-field"><span class="name-field-dot" style="background:${PLAYER_COLORS[index].value}"></span><input name="player-${index}" maxlength="12" value="${escapeHtml(state.setupNames[index])}" aria-label="${index + 1}人目の名前" /></label>`).join("");
}

function openSetup() {
  state.playerCount = state.players.length || state.playerCount;
  if (state.players.length) state.setupNames = Array.from({ length: 4 }, (_, index) => state.players[index]?.name || DEFAULT_NAMES[index]);
  renderSetup();
  elements.setupModal.classList.remove("is-hidden");
}

function startGame(event) {
  event.preventDefault();
  const formData = new FormData(elements.setupForm);
  const names = Array.from({ length: state.playerCount }, (_, index) => String(formData.get(`player-${index}`) || "").trim() || DEFAULT_NAMES[index]);
  state.setupNames = Array.from({ length: 4 }, (_, index) => names[index] || state.setupNames[index] || DEFAULT_NAMES[index]);
  state.players = names.map((name, index) => ({
    id: index, name, color: PLAYER_COLORS[index].value, cash: STARTING_CASH, salary: 30000, job: "これからの人", spaceId: "start", steps: 0,
    routes: {}, partner: false, children: 0, familyMilestones: [], finished: false, finishOrder: null,
  }));
  state.currentIndex = 0;
  state.dice = 1;
  state.isBusy = false;
  state.pendingChoice = null;
  state.feed = [];
  addFeed(`${names.join("・")}の人生がスタート！ オープンカーで出発。`, "choice-dot");
  elements.setupModal.classList.add("is-hidden");
  elements.resultModal.classList.add("is-hidden");
  render();
  toast("ゲームをはじめます。最初のサイコロをどうぞ！");
}

function changeMoney(player, amount) {
  player.cash = Math.max(0, player.cash + amount);
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

function moveStep(remaining) {
  const player = currentPlayer();
  const nextId = nextSpaceId(player);
  if (!nextId || remaining <= 0) {
    resolveLanding(player);
    return;
  }
  player.spaceId = nextId;
  player.steps += 1;
  const enteredSpace = currentSpace(player);
  if (enteredSpace.type === "family") resolveFamilyEvent(player, enteredSpace);
  render();
  window.setTimeout(() => moveStep(remaining - 1), 190);
}

function resolveFamilyEvent(player, space) {
  if (player.familyMilestones.includes(space.id)) return false;
  player.familyMilestones.push(space.id);
  let message = "";
  if (space.familyAction === "partner" && !player.partner) {
    player.partner = true;
    changeMoney(player, space.amount);
    message = `${player.name}は結婚！ オープンカーが2人乗りになった。 ${money(space.amount)}！`;
  } else if (space.familyAction === "child") {
    player.children += 1;
    changeMoney(player, space.amount);
    message = `${player.name}に子どもが生まれた！ ${familySummary(player)}に。 ${money(space.amount)}！`;
  } else {
    changeMoney(player, space.amount);
    message = `${player.name}：${space.label} ${money(space.amount)}`;
  }
  addFeed(message, "choice-dot");
  toast(message);
  return true;
}

function resolveLanding(player) {
  const space = currentSpace(player);
  if (space.id === GOAL_ID) {
    player.finished = true;
    player.finishOrder = state.players.filter((entry) => entry.finished).length;
    const finishBonus = 45000;
    changeMoney(player, finishBonus);
    addFeed(`${player.name}が${player.finishOrder}番目にゴール！ ボーナス ${money(finishBonus)}。`, "choice-dot");
    toast(`${player.name}、ゴール！ おつかれさま！`);
    finishTurn();
    return;
  }
  if (space.routeOptions) {
    openRouteChoice(player, space);
    return;
  }
  if (space.type === "money") {
    changeMoney(player, player.salary);
    addFeed(`${player.name}は給料日。${money(player.salary)} を受け取った！`);
    toast(`給料日！ ${money(player.salary)} を受け取りました。`);
  } else if (space.type === "chance") {
    const chance = CHANCE_CARDS[Math.floor(Math.random() * CHANCE_CARDS.length)];
    changeMoney(player, chance.amount);
    addFeed(`${player.name}：${chance.title} ${chance.amount >= 0 ? "+" : ""}${money(chance.amount)}`, chance.amount < 0 ? "negative" : "");
    toast(`${chance.title} ${chance.amount >= 0 ? "+" : ""}${money(chance.amount)}`);
  } else if (space.type === "family") {
    resolveFamilyEvent(player, space);
  } else {
    const amount = space.amount || 0;
    changeMoney(player, amount);
    addFeed(`${player.name}：${space.label} ${amount >= 0 ? "+" : ""}${money(amount)}`, amount < 0 ? "negative" : "");
    toast(`${space.label} ${amount >= 0 ? "+" : ""}${money(amount)}`);
  }
  finishTurn();
}

function openRouteChoice(player, space) {
  state.pendingChoice = { type: "route", playerId: player.id, spaceId: space.id, options: space.routeOptions };
  elements.choiceTitle.textContent = space.label;
  elements.choiceDescription.textContent = `${player.name}、${space.sub}。どちらの道を進む？`;
  elements.choiceOptions.innerHTML = space.routeOptions.map((option, index) => `<button class="choice-option route-option" type="button" data-choice-option="${index}"><strong><span class="route-option-arrow">↗</span>${option.title}</strong><span>${option.detail}</span><em>このルートへ進む</em></button>`).join("");
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
  if (state.players.every((player) => player.finished)) {
    state.isBusy = false;
    render();
    showResults();
    return;
  }
  let nextIndex = state.currentIndex;
  do nextIndex = (nextIndex + 1) % state.players.length; while (state.players[nextIndex].finished);
  state.currentIndex = nextIndex;
  state.isBusy = false;
  render();
}

function showResults() {
  const standings = [...state.players].sort((first, second) => second.cash - first.cash);
  elements.resultsList.innerHTML = standings.map((player, index) => `<li class="result-row"><span class="result-place">${index === 0 ? "👑" : `${index + 1}`}</span><span class="result-color" style="background:${player.color}"></span><span class="result-name">${escapeHtml(player.name)}<span class="result-job">${escapeHtml(player.job)} · ${familySummary(player)} · ゴール ${player.finishOrder}番目</span></span><span class="result-money">${money(player.cash)}</span></li>`).join("");
  elements.resultModal.classList.remove("is-hidden");
}

document.querySelectorAll("[data-player-count]").forEach((button) => button.addEventListener("click", () => { state.playerCount = Number(button.dataset.playerCount); renderSetup(); }));
elements.setupForm.addEventListener("submit", startGame);
elements.rollButton.addEventListener("click", rollDice);
document.querySelector("#new-game-button").addEventListener("click", openSetup);
document.querySelector("#play-again-button").addEventListener("click", openSetup);
document.querySelector("#help-button").addEventListener("click", () => elements.helpModal.classList.remove("is-hidden"));
document.querySelector("#help-close").addEventListener("click", () => elements.helpModal.classList.add("is-hidden"));
document.querySelector("#setup-close").addEventListener("click", () => { if (state.players.length) elements.setupModal.classList.add("is-hidden"); });
elements.choiceOptions.addEventListener("click", (event) => { const option = event.target.closest("[data-choice-option]"); if (option) chooseOption(Number(option.dataset.choiceOption)); });
document.querySelectorAll(".modal-backdrop").forEach((backdrop) => backdrop.addEventListener("click", (event) => { if (event.target === backdrop && (backdrop === elements.helpModal || (backdrop === elements.setupModal && state.players.length))) backdrop.classList.add("is-hidden"); }));

renderSetup();
startGame(new Event("submit"));
elements.setupModal.classList.remove("is-hidden");
