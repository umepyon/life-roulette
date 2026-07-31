"use strict";

const assert = require("node:assert/strict");
const {
  courseFingerprint,
  createRouteGraph,
  generateHexCourse,
  hexDistance,
  validateHexCourse,
} = require("../hex-course.js");

const sampleSeed = 20260731;
const COURSE_SIZES = {
  small: { label: "小コース", mainRouteCells: 27 },
  medium: { label: "中コース", mainRouteCells: 60 },
  large: { label: "大コース", mainRouteCells: 100 },
};

function reachesGoal(course, graph, branchChoices) {
  let current = course.startId;
  const visited = new Set();
  while (current !== course.goalId) {
    assert.equal(visited.has(current), false, "循環しない");
    visited.add(current);
    const options = graph.branchOptionsById[current];
    const branchIndex = course.branches.findIndex((branch) => branch.from === current);
    current = options ? options[branchChoices[branchIndex] ? 1 : 0] : graph.nextById[current];
    assert.ok(current, "次のマスが存在する");
  }
}

function assertValidCourse(course, { size, seed }) {
  const validation = validateHexCourse(course);
  assert.equal(validation.valid, true, `seed ${seed}: ${validation.errors.join(" / ")}`);
  assert.equal(course.size, size, `${size}: コース規模が一致する`);
  assert.equal(course.sizeLabel, COURSE_SIZES[size].label, `${size}: コース名が一致する`);
  assert.equal(course.branches.length, 2, `${size}: 分岐は2本生成される`);
  assert.equal(course.mainRoute.length, COURSE_SIZES[size].mainRouteCells, `${size}: メインルートのマス数が一致する`);
  const generatedGraph = createRouteGraph(course);
  [[false, false], [false, true], [true, false], [true, true]].forEach((branchChoices) => reachesGoal(course, generatedGraph, branchChoices));
  course.edges.forEach((edge) => {
    const from = course.nodes.find((node) => node.id === edge.from);
    const to = course.nodes.find((node) => node.id === edge.to);
    assert.equal(hexDistance(from, to), 1, `seed ${seed}: 辺は隣接ヘックスをつなぐ`);
  });
  const edgeKeys = new Set(course.edges.map((edge) => [edge.from, edge.to].sort().join("|")));
  const edgeCounts = new Map(course.nodes.map((node) => [node.id, 0]));
  course.edges.forEach((edge) => {
    edgeCounts.set(edge.from, edgeCounts.get(edge.from) + 1);
    edgeCounts.set(edge.to, edgeCounts.get(edge.to) + 1);
  });
  edgeCounts.forEach((count) => assert.ok(count <= 3, `seed ${seed}: 分岐以外で余分に接続しない`));
  for (let firstIndex = 0; firstIndex < course.nodes.length; firstIndex += 1) {
    for (let secondIndex = firstIndex + 1; secondIndex < course.nodes.length; secondIndex += 1) {
      const firstNode = course.nodes[firstIndex];
      const secondNode = course.nodes[secondIndex];
      if (hexDistance(firstNode, secondNode) !== 1) continue;
      assert.ok(edgeKeys.has([firstNode.id, secondNode.id].sort().join("|")), `seed ${seed}: 接続していないヘックスは離れて配置する`);
    }
  }
}

for (const size of Object.keys(COURSE_SIZES)) {
  const first = generateHexCourse(sampleSeed, { size });
  const second = generateHexCourse(sampleSeed, { size });
  assert.deepEqual(first, second, `${size}: 同じシードでは同じコースになる`);
  assertValidCourse(first, { size, seed: sampleSeed });

  for (let seed = 1; seed <= 200; seed += 1) {
    assertValidCourse(generateHexCourse(seed, { size }), { size, seed });
  }
}

const smallFirst = generateHexCourse(sampleSeed, { size: "small" });
assert.notEqual(courseFingerprint(smallFirst), courseFingerprint(generateHexCourse(sampleSeed + 1, { size: "small" })), "小コースでは異なるシードでコースが変わる");

console.log("hex-course: 3 sizes × 200 seeds validated");
