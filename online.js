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

  function participantEntries() {
    const snapshot = game?.getSnapshot?.();
    const players = snapshot?.players || [];
    return Object.entries(session.seats)
      .map(([clientId, playerId]) => ({ clientId, player: players.find((player) => player.id === playerId), playerId }))
      .filter((entry) => entry.player);
  }

  function canControlPlayer(playerId) {
    if (!session.connected) return true;
    return session.localPlayerId === playerId;
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
    const status = session.role === "host"
      ? `参加 ${joined}/${total}人。部屋コードを共有してください。`
      : player
        ? `${player.name}として参加中。あなたの番だけ操作できます。`
        : "ホストが参加を受け付けています…";
    panel.innerHTML = `
      <div class="online-room-copy">
        <span class="online-room-kicker">ONLINE ROOM</span>
        <strong>部屋コード <b>${session.roomCode}</b></strong>
        <span>${status}</span>
      </div>
      <div class="online-room-actions">
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
      snapshot: game.getSnapshot(),
    });
    renderRoomPanel();
  }

  async function handleJoin(payload) {
    if (session.role !== "host" || !payload?.senderId) return;
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
      .on("broadcast", { event: "join-rejected" }, ({ payload }) => {
        if (payload?.targetId === session.clientId) setJoinStatus(payload.message || "参加できませんでした。", true);
      });
  }

  async function connect(onSubscribed) {
    session.client = makeClient();
    session.channel = session.client.channel(roomTopic(), { config: { broadcast: { self: false } } });
    bindChannel();
    session.channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED" && !session.started) {
        session.started = true;
        session.connected = true;
        await onSubscribed();
        renderRoomPanel();
      } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
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
      await connect(async () => {
        game.startOnlineGame();
        game.toast(`オンライン部屋を作りました。コード ${session.roomCode} を共有してください。`);
        await publishSnapshot();
      });
    } catch (error) {
      hostButton.disabled = false;
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
      joinForm.querySelector("button").disabled = true;
      setJoinStatus("部屋へ接続しています…");
      await connect(async () => {
        setJoinStatus("ホストの参加受付を待っています…");
        await send("join", {});
      });
    } catch (error) {
      joinForm.querySelector("button").disabled = false;
      setJoinStatus(error.message || "部屋へ接続できませんでした。", true);
    }
  }

  async function leaveRoom() {
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
    if (copy) copyCode();
    if (leave) leaveRoom();
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
    publishSnapshot,
  };
})();
