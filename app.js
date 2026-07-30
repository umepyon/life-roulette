const PLAYER_COLORS = [
  { value: "#7460d9", name: "すみれ" },
  { value: "#ef766d", name: "さんご" },
  { value: "#46b89b", name: "みどり" },
  { value: "#e2a83e", name: "きん" },
];

const DEFAULT_NAMES = ["はる", "そら", "みどり", "もも"];
const STARTING_CASH = 120000;
const GOAL_POSITION = 31;

const SPACES = [
  ["START", "出発", "🏁", "start"],
  ["給料日", "+収入", "💴", "money"],
  ["ご近所", "いいこと", "🌷", "event", 12000],
  ["習いごと", "自己投資", "🎨", "event", -9000],
  ["チャンス", "運しだい", "🎈", "choice"],
  ["進路選択", "えらぶ", "↗", "choice"],
  ["給料日", "+収入", "💴", "money"],
  ["ハプニング", "予想外", "☔", "event", -15000],
  ["ごほうび", "ちいさな幸せ", "🍰", "event", 8000],
  ["給料日", "+収入", "💴", "money"],
  ["住まい", "えらぶ", "⌂", "choice"],
  ["メンテナンス", "出費", "🔧", "event", -18000],
  ["臨時収入", "ラッキー", "🎁", "event", 24000],
  ["給料日", "+収入", "💴", "money"],
  ["お祝い", "いいこと", "🎉", "event", 16000],
  ["チャンス", "運しだい", "🎈", "choice"],
  ["給料日", "+収入", "💴", "money"],
  ["小さな旅", "リフレッシュ", "🧳", "event", -12000],
  ["夢の分岐", "えらぶ", "✦", "choice"],
  ["給料日", "+収入", "💴", "money"],
  ["ハプニング", "予想外", "⚡", "event", -20000],
  ["資産運用", "運しだい", "📈", "choice"],
  ["給料日", "+収入", "💴", "money"],
  ["まちの祭り", "たのしい", "🎪", "event", 9000],
  ["ライフイベント", "出会い", "💐", "event", 14000],
  ["給料日", "+収入", "💴", "money"],
  ["一発逆転", "運しだい", "🎯", "choice"],
  ["憧れの品", "えらぶ", "🛍", "choice"],
  ["給料日", "+収入", "💴", "money"],
  ["しあわせ", "最高の日", "☀", "event", 30000],
  ["ラストチャンス", "運しだい", "🎲", "choice"],
  ["GOAL", "おつかれさま", "🏆", "goal"],
].map(([label, sub, icon, type, amount]) => ({ label, sub, icon, type, amount }));

const CHANCE_CARDS = [
  { title: "懸賞に当選！", amount: 40000, detail: "思いがけないプレゼントが届いた。" },
  { title: "友人の助け", amount: 18000, detail: "困っていたところを助けてもらった。" },
  { title: "予定外の修理", amount: -26000, detail: "大事なものの修理が必要になった。" },
  { title: "とっておきの副収入", amount: 30000, detail: "得意なことが仕事につながった。" },
  { title: "うっかり出費", amount: -14000, detail: "気づいたら小さな出費が積み重なっていた。" },
];

const CHOICES = {
  5: {
    title: "最初の進路を決めよう",
    description: "どんな働き方を選ぶ？ 収入と手持ちが変わります。",
    options: [
      { title: "安定の会社員", detail: "毎月の収入をコツコツ増やす", cash: 0, salary: 35000, job: "会社員", effect: "収入が ¥35,000 になった" },
      { title: "自由なクリエイター", detail: "準備費は必要。でも夢は大きい", cash: -18000, salary: 44000, job: "クリエイター", effect: "準備費を払い、収入が ¥44,000 になった" },
    ],
  },
  10: {
    title: "どんな住まいにする？",
    description: "暮らしの選択も、人生の大切な一部。",
    options: [
      { title: "居心地のいいシェアハウス", detail: "生活費を抑えて、気の合う仲間もできた", cash: 12000, effect: "暮らしを整えて ¥12,000 節約した" },
      { title: "憧れのひとり暮らし", detail: "初期費用はかかるけど、毎日が少し特別", cash: -22000, effect: "新生活の準備に ¥22,000 使った" },
    ],
  },
  18: {
    title: "夢に向かう分岐点",
    description: "いまの自分に、どちらの一歩を選ぶ？",
    options: [
      { title: "学び直してステップアップ", detail: "受講料を払って、収入アップを目指す", cash: -15000, salary: 12000, jobSuffix: "・スキルアップ", effect: "学びに投資し、収入が ¥12,000 増えた" },
      { title: "仲間と小さな挑戦", detail: "挑戦の結果がすぐに小さな実りに", cash: 28000, effect: "仲間との挑戦が実を結び ¥28,000 手に入れた" },
    ],
  },
  21: {
    title: "資産運用、どうする？",
    description: "余裕資金をどう使うかは、あなた次第。",
    options: [
      { title: "堅実に積み立てる", detail: "小さく、でも確かなリターン", cash: 17000, effect: "コツコツ積み立てが ¥17,000 の実りになった" },
      { title: "思いきってチャレンジ", detail: "当たれば大きい。結果は運しだい！", random: [-28000, 56000], effect: "チャレンジ投資の結果が出た" },
    ],
  },
  26: {
    title: "一発逆転のチャンス",
    description: "ここで勝負する？ それとも確実な幸せを取る？",
    options: [
      { title: "小さな確実を選ぶ", detail: "大好きな人たちとの時間が心を満たす", cash: 16000, effect: "大切な時間が ¥16,000 の幸運を呼んだ" },
      { title: "運命に賭ける", detail: "当たりか、はずれか。サイコロの神様におまかせ", random: [-35000, 70000], effect: "大勝負の結果が出た" },
    ],
  },
  27: {
    title: "ずっと欲しかったもの",
    description: "最後の寄り道。あなたならどうする？",
    options: [
      { title: "思い出を選ぶ", detail: "出会いに感謝して、素敵な写真を残す", cash: 18000, effect: "思い出が新しい幸運を連れてきた" },
      { title: "憧れを手に入れる", detail: "欲しかったものは、明日へのエネルギー", cash: -25000, salary: 7000, jobSuffix: "・ごきげん", effect: "憧れを手に入れ、なぜか収入も上がった" },
    ],
  },
  30: {
    title: "ゴール前のラストチャンス",
    description: "あと少し。最後にどんな選択をする？",
    options: [
      { title: "感謝を伝える", detail: "つながりは、いつだって財産になる", cash: 22000, effect: "思いがけないお礼を受け取った" },
      { title: "最後のひと勝負", detail: "人生は一度きり。思いきり楽しもう", random: [-30000, 65000], effect: "最後の勝負の結果が出た" },
    ],
  },
};

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

function positionFor(index) {
  if (index <= 8) return { row: 1, column: index + 1 };
  if (index <= 15) return { row: index - 7, column: 9 };
  if (index <= 24) return { row: 9, column: 25 - index };
  return { row: 33 - index, column: 1 };
}

function diceMarkup(value) {
  const visiblePips = {
    1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8],
  }[value] || [4];
  return Array.from({ length: 9 }, (_, index) => `<span class="pip ${visiblePips.includes(index) ? "" : "empty"}"></span>`).join("");
}

function playerInitial(player) {
  return escapeHtml(player.name.trim().slice(0, 1) || "人");
}

function renderBoard() {
  const positions = state.players.reduce((accumulator, player) => {
    (accumulator[player.position] ||= []).push(player);
    return accumulator;
  }, {});
  const activePosition = currentPlayer()?.position;

  const spaces = SPACES.map((space, index) => {
    const { row, column } = positionFor(index);
    const tokens = (positions[index] || []).map((player) => `<span class="token" style="background:${player.color}" title="${escapeHtml(player.name)}">${playerInitial(player)}</span>`).join("");
    return `<div class="space ${space.type} ${index === activePosition ? "is-current-space" : ""}" style="grid-row:${row};grid-column:${column}" aria-label="${escapeHtml(space.label)}：${escapeHtml(space.sub)}">
      <span class="space-icon" aria-hidden="true">${space.icon}</span>
      <span class="space-label">${space.label}</span>
      <span class="space-sub">${space.sub}</span>
      <span class="tokens">${tokens}</span>
    </div>`;
  }).join("");

  elements.board.innerHTML = `${spaces}
    <div class="board-center" aria-hidden="true">
      <div class="center-orbit"><div class="center-copy"><span>LIFE ROULETTE</span><strong>人生<br />ルーレット</strong><small>あなたの選択が、明日をつくる。</small></div></div>
    </div>`;
}

function renderPlayers() {
  elements.playerList.innerHTML = state.players.map((player, index) => `
    <article class="player-card ${index === state.currentIndex && !player.finished ? "is-current" : ""} ${player.finished ? "is-finished" : ""}">
      <span class="player-color" style="background:${player.color}"></span>
      <div class="player-info">
        <div class="player-name">${escapeHtml(player.name)} ${player.finished ? `<span class="finish-badge">GOAL ${player.finishOrder}位</span>` : ""}</div>
        <div class="player-job">${escapeHtml(player.job)} · 収入 ${money(player.salary)}</div>
      </div>
      <div class="player-money">${money(player.cash)}</div>
    </article>`).join("");
}

function renderCurrentPlayer() {
  const player = currentPlayer();
  if (!player) return;
  elements.currentPlayerCard.innerHTML = `
    <div class="current-player-top">
      <div class="current-player-name"><span class="current-player-color" style="background:${player.color}"></span>${escapeHtml(player.name)}の番</div>
      <span class="current-player-position">${player.position} / ${GOAL_POSITION}</span>
    </div>
    <div class="current-player-money">${money(player.cash)}</div>
    <div class="current-player-job">${escapeHtml(player.job)} · 毎回の収入 ${money(player.salary)}</div>`;
  elements.turnBanner.innerHTML = `<span class="turn-color" style="background:${player.color}"></span><strong>${escapeHtml(player.name)}</strong> の番です。運命のサイコロを振ろう。`;
  elements.rollButton.disabled = state.isBusy || player.finished;
  elements.rollButton.innerHTML = state.isBusy ? `<span class="button-icon" aria-hidden="true">⌁</span>人生を進めています` : `<span class="button-icon" aria-hidden="true">✦</span>サイコロを振る`;
  elements.rollHint.textContent = state.isBusy ? "マス目を進んでいます…" : `次は「${SPACES[Math.min(player.position + 1, GOAL_POSITION)].label}」の方向へ。`;
}

function renderFeed() {
  elements.eventFeed.innerHTML = state.feed.length ? state.feed.map((item) => `
    <li><span class="feed-dot ${item.tone || ""}"></span><span>${item.text}</span></li>`).join("") : `<li><span class="feed-dot"></span><span>さあ、最初のサイコロを振ろう。</span></li>`;
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
  document.querySelectorAll("[data-player-count]").forEach((button) => {
    button.classList.toggle("is-selected", Number(button.dataset.playerCount) === state.playerCount);
  });
  elements.nameFields.innerHTML = Array.from({ length: state.playerCount }, (_, index) => `
    <label class="name-field">
      <span class="name-field-dot" style="background:${PLAYER_COLORS[index].value}"></span>
      <input name="player-${index}" maxlength="12" value="${escapeHtml(state.setupNames[index])}" aria-label="${index + 1}人目の名前" />
    </label>`).join("");
}

function openSetup() {
  state.playerCount = state.players.length || state.playerCount;
  if (state.players.length) state.setupNames = state.players.map((player) => player.name).concat(DEFAULT_NAMES).slice(0, 4);
  renderSetup();
  elements.setupModal.classList.remove("is-hidden");
}

function startGame(event) {
  event.preventDefault();
  const formData = new FormData(elements.setupForm);
  const names = Array.from({ length: state.playerCount }, (_, index) => {
    const entered = String(formData.get(`player-${index}`) || "").trim();
    return entered || DEFAULT_NAMES[index];
  });
  state.setupNames = Array.from({ length: 4 }, (_, index) => names[index] || state.setupNames[index] || DEFAULT_NAMES[index]);
  state.players = names.map((name, index) => ({
    id: index,
    name,
    color: PLAYER_COLORS[index].value,
    cash: STARTING_CASH,
    salary: 30000,
    job: "これからの人",
    position: 0,
    finished: false,
    finishOrder: null,
  }));
  state.currentIndex = 0;
  state.dice = 1;
  state.isBusy = false;
  state.pendingChoice = null;
  state.feed = [];
  addFeed(`${names.join("・")}の人生がスタート！`, "choice-dot");
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
  if (!player) return;
  if (remaining <= 0 || player.position >= GOAL_POSITION) {
    resolveLanding(player);
    return;
  }
  player.position += 1;
  render();
  window.setTimeout(() => moveStep(remaining - 1), 185);
}

function resolveLanding(player) {
  const space = SPACES[player.position];
  if (player.position === GOAL_POSITION) {
    player.finished = true;
    player.finishOrder = state.players.filter((entry) => entry.finished).length;
    const finishBonus = 45000;
    changeMoney(player, finishBonus);
    addFeed(`${player.name}が${player.finishOrder}番目にゴール！ ボーナス ${money(finishBonus)}。`, "choice-dot");
    toast(`${player.name}、ゴール！ おつかれさま！`);
    finishTurn();
    return;
  }
  if (space.type === "money") {
    changeMoney(player, player.salary);
    addFeed(`${player.name}は給料日。${money(player.salary)} を受け取った！`);
    toast(`給料日！ ${money(player.salary)} を受け取りました。`);
    finishTurn();
    return;
  }
  if (CHOICES[player.position]) {
    openChoice(player, CHOICES[player.position]);
    return;
  }
  if (space.type === "choice") {
    const chance = CHANCE_CARDS[Math.floor(Math.random() * CHANCE_CARDS.length)];
    changeMoney(player, chance.amount);
    addFeed(`${player.name}：${chance.title} ${chance.amount >= 0 ? "+" : ""}${money(chance.amount)}`, chance.amount < 0 ? "negative" : "");
    toast(`${chance.title} ${chance.amount >= 0 ? "+" : ""}${money(chance.amount)}`);
    finishTurn();
    return;
  }
  const amount = space.amount || 0;
  changeMoney(player, amount);
  addFeed(`${player.name}：${space.label} ${amount >= 0 ? "+" : ""}${money(amount)}`, amount < 0 ? "negative" : "");
  toast(`${space.label} ${amount >= 0 ? "+" : ""}${money(amount)}`);
  finishTurn();
}

function openChoice(player, choice) {
  state.pendingChoice = { playerId: player.id, choice };
  elements.choiceTitle.textContent = choice.title;
  elements.choiceDescription.textContent = `${player.name}、${choice.description}`;
  elements.choiceOptions.innerHTML = choice.options.map((option, index) => {
    const amountPreview = option.random ? "結果は運しだい" : `${option.cash >= 0 ? "+" : ""}${money(option.cash || 0)}${option.salary ? ` · 収入 ${option.salary > 0 ? "+" : ""}${money(option.salary)}` : ""}`;
    return `<button class="choice-option" type="button" data-choice-option="${index}"><strong>${option.title}</strong><span>${option.detail}</span><em>${amountPreview}</em></button>`;
  }).join("");
  elements.choiceModal.classList.remove("is-hidden");
}

function chooseOption(index) {
  const pending = state.pendingChoice;
  if (!pending) return;
  const player = state.players.find((entry) => entry.id === pending.playerId);
  const option = pending.choice.options[index];
  if (!player || !option) return;
  const amount = option.random ? option.random[Math.floor(Math.random() * option.random.length)] : option.cash || 0;
  changeMoney(player, amount);
  if (option.salary) player.salary += option.salary;
  if (option.job) player.job = option.job;
  if (option.jobSuffix) player.job += option.jobSuffix;
  const result = `${player.name}は「${option.title}」を選んだ。${option.effect}${amount ? ` ${amount >= 0 ? "+" : ""}${money(amount)}` : ""}`;
  addFeed(result, amount < 0 ? "negative" : "choice-dot");
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
  do {
    nextIndex = (nextIndex + 1) % state.players.length;
  } while (state.players[nextIndex].finished);
  state.currentIndex = nextIndex;
  state.isBusy = false;
  render();
}

function showResults() {
  const standings = [...state.players].sort((first, second) => second.cash - first.cash);
  elements.resultsList.innerHTML = standings.map((player, index) => `
    <li class="result-row">
      <span class="result-place">${index === 0 ? "👑" : `${index + 1}`}</span>
      <span class="result-color" style="background:${player.color}"></span>
      <span class="result-name">${escapeHtml(player.name)}<span class="result-job">${escapeHtml(player.job)} · ゴール ${player.finishOrder}番目</span></span>
      <span class="result-money">${money(player.cash)}</span>
    </li>`).join("");
  elements.resultModal.classList.remove("is-hidden");
}

document.querySelectorAll("[data-player-count]").forEach((button) => {
  button.addEventListener("click", () => {
    state.playerCount = Number(button.dataset.playerCount);
    renderSetup();
  });
});
elements.setupForm.addEventListener("submit", startGame);
elements.rollButton.addEventListener("click", rollDice);
document.querySelector("#new-game-button").addEventListener("click", openSetup);
document.querySelector("#play-again-button").addEventListener("click", openSetup);
document.querySelector("#help-button").addEventListener("click", () => elements.helpModal.classList.remove("is-hidden"));
document.querySelector("#help-close").addEventListener("click", () => elements.helpModal.classList.add("is-hidden"));
document.querySelector("#setup-close").addEventListener("click", () => {
  if (state.players.length) elements.setupModal.classList.add("is-hidden");
});
elements.choiceOptions.addEventListener("click", (event) => {
  const option = event.target.closest("[data-choice-option]");
  if (option) chooseOption(Number(option.dataset.choiceOption));
});
document.querySelectorAll(".modal-backdrop").forEach((backdrop) => {
  backdrop.addEventListener("click", (event) => {
    if (event.target !== backdrop) return;
    if (backdrop === elements.helpModal) backdrop.classList.add("is-hidden");
    if (backdrop === elements.setupModal && state.players.length) backdrop.classList.add("is-hidden");
  });
});

renderSetup();
startGame(new Event("submit"));
elements.setupModal.classList.remove("is-hidden");
