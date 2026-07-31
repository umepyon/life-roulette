"use strict";

const assert = require("node:assert/strict");
const {
  courseFingerprint,
  generateHexCourse,
  hexDistance,
  validateHexCourse,
} = require("../hex-course.js");

const sampleSeed = 20260731;
const first = generateHexCourse(sampleSeed);
const second = generateHexCourse(sampleSeed);

assert.deepEqual(first, second, "同じシードでは同じコースになる");
assert.equal(validateHexCourse(first).valid, true, "サンプルコースは有効である");
assert.equal(first.branches.length, 2, "分岐は2本生成される");
assert.equal(first.mainRoute.length, 27, "メインルートは27マスである");
assert.notEqual(courseFingerprint(first), courseFingerprint(generateHexCourse(sampleSeed + 1)), "異なるシードではコースが変わる");

for (let seed = 1; seed <= 200; seed += 1) {
  const course = generateHexCourse(seed);
  const validation = validateHexCourse(course);
  assert.equal(validation.valid, true, `seed ${seed}: ${validation.errors.join(" / ")}`);
  course.edges.forEach((edge) => {
    const from = course.nodes.find((node) => node.id === edge.from);
    const to = course.nodes.find((node) => node.id === edge.to);
    assert.equal(hexDistance(from, to), 1, `seed ${seed}: 辺は隣接ヘックスをつなぐ`);
  });
}

console.log("hex-course: 200 seeds validated");
