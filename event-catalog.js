(function createLifeRouletteEventCatalogApi(global) {
  "use strict";

  const REQUIRED_COLUMNS = Object.freeze([
    "id", "type", "label", "sub", "description", "amount", "icon", "eventScene", "weight", "enabled",
  ]);
  const ALLOWED_TYPES = new Set(["event", "money", "chance"]);
  const ALLOWED_SCENES = new Set([
    "", "office", "car", "home", "lottery", "friends", "repair", "freelance", "expense", "success",
    "wedding", "baby", "goal", "goal-poor-man", "goal-poor-woman",
  ]);

  function parseCsvRows(source) {
    const text = String(source ?? "").replace(/^\uFEFF/, "");
    const rows = [];
    let row = [];
    let cell = "";
    let quoted = false;

    for (let index = 0; index < text.length; index += 1) {
      const character = text[index];
      const next = text[index + 1];
      if (character === '"') {
        if (quoted && next === '"') {
          cell += '"';
          index += 1;
        } else {
          quoted = !quoted;
        }
      } else if (character === "," && !quoted) {
        row.push(cell);
        cell = "";
      } else if ((character === "\n" || character === "\r") && !quoted) {
        if (character === "\r" && next === "\n") index += 1;
        row.push(cell);
        if (row.some((value) => value.trim() !== "")) rows.push(row);
        row = [];
        cell = "";
      } else {
        cell += character;
      }
    }
    if (quoted) throw new Error("CSVの引用符が閉じていません");
    if (cell !== "" || row.length) {
      row.push(cell);
      if (row.some((value) => value.trim() !== "")) rows.push(row);
    }
    return rows;
  }

  function parseBoolean(value) {
    const normalized = String(value ?? "").trim().toLowerCase();
    if (["true", "1", "yes", "有効"].includes(normalized)) return true;
    if (["false", "0", "no", "無効"].includes(normalized)) return false;
    return null;
  }

  function parseAmount(value) {
    const normalized = String(value ?? "").trim().replace(/[,_円￥¥\s]/g, "");
    if (normalized === "") return 0;
    if (!/^-?\d+$/.test(normalized)) return null;
    const amount = Number(normalized);
    return Number.isSafeInteger(amount) ? amount : null;
  }

  function parseWeight(value) {
    const weight = Number(String(value ?? "").trim());
    return Number.isFinite(weight) && weight > 0 ? weight : null;
  }

  function parseEventCatalog(source) {
    const errors = [];
    let rows;
    try {
      rows = parseCsvRows(source);
    } catch (error) {
      return { ok: false, errors: [error.message], events: [], chanceCards: [], rows: [] };
    }
    if (!rows.length) return { ok: false, errors: ["CSVにデータがありません"], events: [], chanceCards: [], rows: [] };

    const headers = rows[0].map((header) => header.trim());
    const headerIndex = new Map(headers.map((header, index) => [header, index]));
    REQUIRED_COLUMNS.forEach((column) => {
      if (!headerIndex.has(column)) errors.push(`必須列がありません: ${column}`);
    });
    if (errors.length) return { ok: false, errors, events: [], chanceCards: [], rows: [] };

    const ids = new Set();
    const parsedRows = [];
    rows.slice(1).forEach((values, rowIndex) => {
      const line = rowIndex + 2;
      const read = (column) => values[headerIndex.get(column)]?.trim() || "";
      const id = read("id");
      const type = read("type");
      const label = read("label");
      const enabled = parseBoolean(read("enabled"));
      const amount = parseAmount(read("amount"));
      const weight = parseWeight(read("weight"));
      const eventScene = read("eventScene");
      if (!id) errors.push(`${line}行目: id が空です`);
      if (ids.has(id)) errors.push(`${line}行目: id が重複しています (${id})`);
      ids.add(id);
      if (!ALLOWED_TYPES.has(type)) errors.push(`${line}行目: type が不正です (${type})`);
      if (!label) errors.push(`${line}行目: label が空です`);
      if (enabled === null) errors.push(`${line}行目: enabled は true / false で指定してください`);
      if (amount === null) errors.push(`${line}行目: amount は整数で指定してください`);
      if (weight === null) errors.push(`${line}行目: weight は0より大きい数値で指定してください`);
      if (!ALLOWED_SCENES.has(eventScene)) errors.push(`${line}行目: eventScene が不正です (${eventScene})`);
      parsedRows.push({
        id,
        type,
        label,
        sub: read("sub"),
        description: read("description"),
        amount: amount ?? 0,
        icon: read("icon") || "✦",
        eventScene,
        weight: weight ?? 1,
        enabled: enabled === true,
      });
    });

    const activeRows = parsedRows.filter((row) => row.enabled);
    const events = activeRows.filter((row) => row.type === "event" || row.type === "money");
    const chanceCards = activeRows.filter((row) => row.type === "chance");
    if (events.length < 12) errors.push(`有効な通常イベントが少なすぎます (${events.length}件)`);
    if (!chanceCards.length) errors.push("有効なチャンスイベントがありません");
    return { ok: errors.length === 0, errors, events, chanceCards, rows: parsedRows };
  }

  async function loadEventCatalog(url = "data/events.csv") {
    if (typeof global.fetch !== "function") return { ok: false, errors: ["Fetch APIが利用できません"], events: [], chanceCards: [], rows: [] };
    try {
      const response = await global.fetch(url, { cache: "no-store" });
      if (!response.ok) throw new Error(`イベントCSVの読み込みに失敗しました (HTTP ${response.status})`);
      return parseEventCatalog(await response.text());
    } catch (error) {
      return { ok: false, errors: [error.message], events: [], chanceCards: [], rows: [] };
    }
  }

  const api = Object.freeze({
    ALLOWED_SCENES,
    REQUIRED_COLUMNS,
    loadEventCatalog,
    parseCsvRows,
    parseEventCatalog,
  });
  global.LifeRouletteEvents = api;
  if (typeof window !== "undefined") window.LifeRouletteEvents = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
}(globalThis));
