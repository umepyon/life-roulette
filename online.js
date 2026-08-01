(() => {
  const config = window.LIFE_ROULETTE_SUPABASE;
  const game = window.lifeRouletteGame;
  const panel = document.querySelector("#online-room-panel");
  const hostButton = document.querySelector("#online-host-button");
  const joinButton = document.querySelector("#online-join-button");
  const joinForm = document.querySelector("#online-join-form");
  const codeInput = document.querySelector("#online-room-code");
  const joinStatus = document.querySelector("#online-join-status");
  const ROOM_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const ACTION_SELECTORS = {
    "#roll-button": "roll",
    "#event-continue": "event",
    "#gift-roll": "gift",
    "#goal-bonus-roll": "goal",
  };

  const session = {
    client: null,
    channel: null,
    roomCode: "",
    role: null,
    clientId: createClientId(),
    hostId: null,
    seats: {},
    localPlayerId: null,
    connected: false,
    started: false,
  };

  function createClientId() {
    if (window.crypto?.randomUUID) return window.crypto.randomUUID();
    return `guest-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }

  function createRoomCode() {
    const bytes = new Uint32Array(8);
    if (window.crypto?.getRandomValues) window.crypto.getRandomValues(bytes);
    return Array.from(bytes, (value, index) => ROOM_ALPHABET[(value || Math.floor(Math.random() * ROOM_ALPHABET.length) + index) % ROOM_ALPHABET.length]).join("");
  }

  function configured() {
    return Boolean(config?.url && config?.publishableKey && window.supabase?.createClient && game);
  }

  function roomTopic() {
    return `life-roulette:${session.roomCode}`;
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, (character) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
    }[character]));
  }

  function participantEntries() {
    const snapshot = game?.getSnapshot?.();
    const players = snapshot?.players || [];
    return Object.entries(session.seats)
      .map(([clientId, playerId]) => ({ clientId, player: players.find((player) => player.id === playerId), playerId }))
      .filter((entry) => entry.player);
  }

  function canControlPlayer(playerId) {
    if (!session.connected) return true;
    return session.started && session.localPlayerId === playerId;
  }

  function renderRoomPanel() {
    if (!panel) return;
    panel.hidden = !session.connected;
    if (!session.connected) {
      panel.replaceChildren();
      return;
    }
    const entries = participantEntries();
    const snapshot = game.getSnapshot();
    const total = snapshot.players.length;
    const joined = entries.length;
    const player = snapshot.players.find((entry) => entry.id === session.localPlayerId);
    const playerLabel = escapeHtml(player?.name || "参加者");
    const ready = joined >= total;
    const status = session.started
      ? (session.role === "host" ? `参加 ${joined}/${total}人。ゲーム進行中です。` : `${playerLabel}として参加中。あなたの番だけ操作できます。`)
      : (session.role === "host"
        ? `参加 ${joined}/${total}人。${ready ? "ゲームを開始できます。" : "参加者を待っています。"}`
        : `${playerLabel}として参加中。ホストの開始を待っています…`);
    const participantList = snapshot.players.map((seat) => {
      const entry = entries.find((candidate) => candidate.playerId === seat.id);
      return `<li class="online-participant ${entry ? "is-joined" : "is-open"}"><span>${escapeHtml(seat.name)}</span><small>${entry ? "参加中" : "空席・参加待ち"}</small></li>`;
    }).join("");
    const startButton = session.role === "host" && !session.started
      ? `<button type="button" class="online-start-button" data-online-start ${ready ? "" : "disabled"}>${ready ? "ゲーム開始" : "参加者を待っています"}</button>`
      : "";
    panel.innerHTML = `
      <div class="online-room-copy">
        <span class="online-room-kicker">ONLINE ROOM</span>
        <strong>部屋コード <b>${escapeHtml(session.roomCode)}</b></strong>
        <span>${status}</span>
        <ul class="online-participant-list">${participantList}</ul>
      </div>
      <div class="online-room-actions">
        ${startButton}
        <button type="button" class="online-copy-button" data-online-copy>コピー</button>
        <button type="button" class="online-leave-button" data-online-leave>退出</button>
      </div>`;
  }

  function setJoinStatus(message, isError = false) {
    if (!joinStatus) return;
    joinStatus.textContent = message;
    joinStatus.classList.toggle("is-error", isError);
  }

  function makeClient() {
    if (!configured()) throw new Error("Supabase の読み込みに失敗しました。通信できる状態でページを再読み込みしてください。");
    return window.supabase.createClient(config.url, config.publishableKey);
  }

  async function send(event, payload) {
    if (!session.channel) return;
    await session.channel.send({ type: "broadcast", event, payload: { ...payload, senderId: session.clientId } });
  }

  function currentSeatFor(clientId) {
    const seat = session.seats[clientId];
    return Number.isInteger(seat) ? seat : null;
  }

  function assignGuestSeat(clientId) {
    const existing = currentSeatFor(clientId);
    if (existing !== null) return existing;
    const snapshot = game.getSnapshot();
    const used = new Set(Object.values(session.seats));
    const openSeat = snapshot.players.find((player) => !used.has(player.id));
    if (!openSeat) return null;
    session.seats[clientId] = openSeat.id;
    return openSeat.id;
  }

  async function publishSnapshot() {
    if (!session.connected || session.role !== "host" || !session.channel) return;
    await send("sync", {
      hostId: session.clientId,
      seats: session.seats,
      started: session.started,
      snapshot: game.getSnapshot(),
    });
    renderRoomPanel();
  }

  async function handleJoin(payload) {
    if (session.role !== "host" || !payload?.senderId) return;
    if (session.started) {
      await send("join-rejected", { targetId: payload.senderId, message: "ゲーム開始後は参加できません。" });
      return;
    }
    const playerId = assignGuestSeat(payload.senderId);
    if (playerId === null) {
      await send("join-rejected", { targetId: payload.senderId, message: "この部屋は満員です。" });
      return;
    }
    const player = game.getSnapshot().players.find((entry) => entry.id === playerId);
    game.toast(`${player?.name || "参加者"}さんがオンラインで参加しました。`);
    await publishSnapshot();
  }

  async function handleAction(payload) {
    if (session.role !== "host" || !payload?.senderId) return;
    const playerId = currentSeatFor(payload.senderId);
    if (playerId === null || game.actionOwner(payload.action) !== playerId) return;
    game.runAction(payload.action, payload);
  }

  function handleSync(payload) {
    if (session.role !== "guest" || !payload?.snapshot || !payload.hostId) return;
    if (session.hostId && session.hostId !== payload.hostId) return;
    session.hostId = payload.hostId;
    session.seats = payload.seats || {};
    session.started = Boolean(payload.started);
    session.localPlayerId = currentSeatFor(session.clientId);
    game.applySnapshot(payload.snapshot);
    renderRoomPanel();
    if (session.localPlayerId !== null) setJoinStatus("");
  }

  function bindChannel() {
    session.channel
      .on("broadcast", { event: "join" }, ({ payload }) => { handleJoin(payload); })
      .on("broadcast", { event: "sync" }, ({ payload }) => { handleSync(payload); })
      .on("broadcast", { event: "action" }, ({ payload }) => { handleAction(payload); })
      .on("broadcast", { event: "leave" }, ({ payload }) => { handleLeave(payload); })
      .on("broadcast", { event: "join-rejected" }, ({ payload }) => {
        if (payload?.targetId === session.clientId) setJoinStatus(payload.message || "参加できませんでした。", true);
      });
  }

  async function handleLeave(payload) {
    if (session.role !== "host" || !payload?.senderId || session.started) return;
    delete session.seats[payload.senderId];
    await publishSnapshot();
  }

  async function startOnlineGame() {
    if (session.role !== "host" || session.started) return;
    const snapshot = game.getSnapshot();
    const joined = participantEntries().length;
    if (joined < snapshot.players.length) {
      game.toast(`参加者が揃うまで開始できません（${joined}/${snapshot.players.length}人）。`);
      return;
    }
    const button = panel.querySelector("[data-online-start]");
    if (button) {
      button.disabled = true;
      button.textContent = "開始処理中…";
    }
    session.started = true;
    game.render?.();
    await publishSnapshot();
    game.toast("参加者が揃いました。オンラインゲームを開始します！");
  }

  async function connect(onSubscribed) {
    session.client = makeClient();
    session.channel = session.client.channel(roomTopic(), { config: { broadcast: { self: false } } });
    bindChannel();
    session.channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED" && !session.connected) {
        session.connected = true;
        await onSubscribed();
        renderRoomPanel();
      } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
        session.connected = false;
        if (session.role === "host") {
          hostButton.disabled = false;
          hostButton.textContent = "部屋をつくる";
        }
        const submitButton = joinForm.querySelector("button");
        submitButton.disabled = false;
        submitButton.textContent = "参加する";
        setJoinStatus("接続できませんでした。通信状態を確認して、もう一度試してください。", true);
      }
    });
  }

  async function createRoom() {
    if (session.connected) return;
    if (game.isEventCatalogReady && !game.isEventCatalogReady()) {
      game.toast("イベントCSVを読み込み中です。少し待ってください。");
      return;
    }
    try {
      session.role = "host";
      session.roomCode = createRoomCode();
      session.hostId = session.clientId;
      session.seats = { [session.clientId]: 0 };
      session.localPlayerId = 0;
      hostButton.disabled = true;
      hostButton.textContent = "部屋を作成中…";
      await connect(async () => {
        game.startOnlineGame();
        game.toast(`オンライン部屋を作りました。コード ${session.roomCode} を共有してください。`);
        await publishSnapshot();
      });
    } catch (error) {
      hostButton.disabled = false;
      hostButton.textContent = "部屋をつくる";
      game.toast(error.message || "オンライン部屋を作れませんでした。");
    }
  }

  async function joinRoom() {
    if (game.isEventCatalogReady && !game.isEventCatalogReady()) {
      game.toast("イベントCSVを読み込み中です。少し待ってください。");
      return;
    }
    const code = codeInput.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (code.length !== 8) {
      setJoinStatus("8文字の部屋コードを入力してください。", true);
      return;
    }
    try {
      session.role = "guest";
      session.roomCode = code;
      const submitButton = joinForm.querySelector("button");
      submitButton.disabled = true;
      submitButton.textContent = "接続中…";
      setJoinStatus("部屋へ接続しています…");
      await connect(async () => {
        setJoinStatus("ホストの参加受付を待っています…");
        await send("join", {});
      });
    } catch (error) {
      const submitButton = joinForm.querySelector("button");
      submitButton.disabled = false;
      submitButton.textContent = "参加する";
      setJoinStatus(error.message || "部屋へ接続できませんでした。", true);
    }
  }

  async function leaveRoom() {
    if (session.channel && session.connected) await send("leave", {});
    if (session.channel && session.client) await session.client.removeChannel(session.channel);
    window.location.reload();
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(session.roomCode);
      game.toast("部屋コードをコピーしました。");
    } catch {
      game.toast(`部屋コード：${session.roomCode}`);
    }
  }

  document.addEventListener("click", (event) => {
    const copy = event.target.closest("[data-online-copy]");
    const leave = event.target.closest("[data-online-leave]");
    const start = event.target.closest("[data-online-start]");
    if (copy) copyCode();
    if (leave) leaveRoom();
    if (start) startOnlineGame();
  });

  document.addEventListener("click", (event) => {
    if (session.role !== "guest" || !session.connected) return;
    if (event.target.closest("#new-game-button, #mobile-new-game-button, #play-again-button, #quit-game-button")) {
      event.preventDefault();
      event.stopImmediatePropagation();
      game.toast("オンライン参加中です。退出してから新しいゲームを始めてください。");
      return;
    }
    const action = Object.entries(ACTION_SELECTORS).find(([selector]) => event.target.closest(selector))?.[1]
      || (event.target.closest("[data-choice-option]") ? "choice" : null);
    if (!action) return;
    const owner = game.actionOwner(action);
    if (owner !== session.localPlayerId) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const choice = event.target.closest("[data-choice-option]");
    send("action", { action, ...(choice ? { index: Number(choice.dataset.choiceOption) } : {}) });
  }, true);

  hostButton.addEventListener("click", createRoom);
  joinButton.addEventListener("click", () => {
    joinForm.hidden = !joinForm.hidden;
    if (!joinForm.hidden) codeInput.focus();
  });
  joinForm.addEventListener("submit", (event) => {
    event.preventDefault();
    joinRoom();
  });

  window.lifeRouletteOnline = {
    canControlPlayer,
    canStartGame: () => session.connected && session.role === "host" && !session.started,
    isWaiting: () => session.connected && !session.started,
    publishSnapshot,
  };
})();
