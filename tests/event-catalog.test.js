"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { parseCsvRows, parseEventCatalog } = require("../event-catalog.js");

const csv = fs.readFileSync(path.join(__dirname, "..", "data", "events.csv"), "utf8");
const catalog = parseEventCatalog(csv);

assert.equal(catalog.ok, true, catalog.errors.join(" / "));
assert.equal(catalog.rows.length, 200, "管理者CSVは200件である");
assert.ok(catalog.events.length >= 12, "通常イベントが十分にある");
assert.ok(catalog.chanceCards.length > 0, "チャンスイベントがある");
assert.equal(new Set(catalog.rows.map((row) => row.id)).size, catalog.rows.length, "イベントIDが重複していない");
assert.ok(catalog.rows.some((row) => row.label === "借金の返済" && row.amount < 0), "借金イベントを含む");
assert.ok(catalog.rows.some((row) => row.label === "ビルを購入" && row.amount < 0), "ビル購入イベントを含む");
assert.ok(catalog.rows.some((row) => row.label === "家賃収入" && row.amount > 0), "家賃収入イベントを含む");

const quoted = parseCsvRows([
  "id,type,label,sub,description,amount,icon,eventScene,weight,enabled",
  'quoted,event,"説明に、カンマがあります",イベント,"CSVの引用符を確認",12000,✨,,1,true',
].join("\n"));
assert.equal(quoted[1][2], "説明に、カンマがあります", "引用符内のカンマを保持する");

const invalid = parseEventCatalog([
  "id,type,label,sub,description,amount,icon,eventScene,weight,enabled",
  "duplicate,event,一件目,,,,,1,true",
  "duplicate,event,二件目,,,,,1,true",
].join("\n"));
assert.equal(invalid.ok, false, "不正なCSVを受け入れない");
assert.ok(invalid.errors.some((error) => error.includes("重複")), "重複IDを報告する");

console.log("event-catalog: 200 rows parsed and validation checks passed");
