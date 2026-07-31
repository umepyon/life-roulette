(function createLifeRouletteHexCourseApi(global) {
  "use strict";

  const HEX_DIRECTIONS = Object.freeze([
    { q: 1, r: 0 }, { q: 1, r: -1 }, { q: 0, r: -1 },
    { q: -1, r: 0 }, { q: -1, r: 1 }, { q: 0, r: 1 },
  ]);

  const COURSE_SIZES = Object.freeze({
    small: Object.freeze({
      size: "small",
      label: "小コース",
      mainEdges: 26,
      radius: 9,
      branchCount: 2,
      maximumAttempts: 2000,
    }),
    medium: Object.freeze({
      size: "medium",
      label: "中コース",
      mainEdges: 59,
      radius: 14,
      branchCount: 2,
      template: "medium",
    }),
    large: Object.freeze({
      size: "large",
      label: "大コース",
      mainEdges: 99,
      radius: 22,
      branchCount: 2,
      template: "large",
    }),
  });

  const DEFAULT_CONFIG = Object.freeze({
    ...COURSE_SIZES.small,
    radius: 9,
  });

  const COURSE_TEMPLATES = Object.freeze({
    medium: Object.freeze({
      start: Object.freeze({ q: -7, r: 0 }),
      mainDirections: "43223343211010121110501050545445501100500505445054500111101",
      branches: Object.freeze([
        Object.freeze({ fromIndex: 15, toIndex: 28, directions: "05001010" }),
        Object.freeze({ fromIndex: 33, toIndex: 47, directions: "45555550010101" }),
      ]),
    }),
    large: Object.freeze({
      start: Object.freeze({ q: -12, r: 0 }),
      mainDirections: "444450545555055550101123232212211232122101001005050100122332321110121010110105010112333333434323334",
      branches: Object.freeze([
        Object.freeze({ fromIndex: 25, toIndex: 48, directions: "111105010112212233221" }),
        Object.freeze({ fromIndex: 55, toIndex: 78, directions: "005501222211111112321" }),
      ]),
    }),
  });

  function hexKey(hex) {
    return `${hex.q},${hex.r}`;
  }

  function copyHex(hex) {
    return { q: hex.q, r: hex.r };
  }

  function transformHex(hex, rotation, mirrored) {
    let transformed = mirrored ? { q: hex.q, r: -hex.q - hex.r } : copyHex(hex);
    for (let index = 0; index < rotation; index += 1) {
      transformed = { q: transformed.q + transformed.r, r: -transformed.q };
    }
    return transformed;
  }

  function transformedDirectionIndex(index, rotation, mirrored) {
    const mirroredIndex = mirrored ? [1, 0, 5, 4, 3, 2][index] : index;
    return (mirroredIndex + rotation) % HEX_DIRECTIONS.length;
  }

  function pathFromDirections(start, directions, rotation, mirrored) {
    const path = [copyHex(start)];
    [...directions].forEach((character) => {
      const direction = HEX_DIRECTIONS[transformedDirectionIndex(Number(character), rotation, mirrored)];
      const current = path[path.length - 1];
      path.push({ q: current.q + direction.q, r: current.r + direction.r });
    });
    return path;
  }

  function createTemplatePaths(templateName, seed) {
    const template = COURSE_TEMPLATES[templateName];
    if (!template) return null;
    const random = createRandom(`${seed}:${templateName}:layout`);
    const rotation = random.integer(0, HEX_DIRECTIONS.length - 1);
    const mirrored = random.next() >= .5;
    const start = transformHex(template.start, rotation, mirrored);
    const mainPath = pathFromDirections(start, template.mainDirections, rotation, mirrored);
    const branchPaths = template.branches.map((branch) => {
      const branchPath = pathFromDirections(mainPath[branch.fromIndex], branch.directions, rotation, mirrored);
      const merge = mainPath[branch.toIndex];
      return sameHex(branchPath[branchPath.length - 1], merge) ? branchPath : null;
    });
    return branchPaths.every(Boolean) ? { mainPath, branchPaths } : null;
  }

  function sameHex(first, second) {
    return first.q === second.q && first.r === second.r;
  }

  function hexDistance(first, second) {
    const sFirst = -first.q - first.r;
    const sSecond = -second.q - second.r;
    return Math.max(Math.abs(first.q - second.q), Math.abs(first.r - second.r), Math.abs(sFirst - sSecond));
  }

  function isWithinRadius(hex, radius) {
    return Math.max(Math.abs(hex.q), Math.abs(hex.r), Math.abs(-hex.q - hex.r)) <= radius;
  }

  function hexNeighbors(hex) {
    return HEX_DIRECTIONS.map((direction) => ({ q: hex.q + direction.q, r: hex.r + direction.r }));
  }

  function normalizeSeed(value) {
    if (typeof value === "number" && Number.isFinite(value)) return (Math.trunc(value) >>> 0) || 1;
    const source = String(value ?? "life-roulette");
    let hash = 2166136261;
    for (let index = 0; index < source.length; index += 1) {
      hash = Math.imul(hash ^ source.charCodeAt(index), 16777619);
    }
    return (hash >>> 0) || 1;
  }

  function createRandom(seed) {
    let state = normalizeSeed(seed);
    return {
      next() {
        state = (state + 0x6D2B79F5) >>> 0;
        let value = state;
        value = Math.imul(value ^ (value >>> 15), value | 1);
        value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
        return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
      },
      integer(minimum, maximum) {
        return minimum + Math.floor(this.next() * (maximum - minimum + 1));
      },
      shuffle(items) {
        const shuffled = [...items];
        for (let index = shuffled.length - 1; index > 0; index -= 1) {
          const swapIndex = this.integer(0, index);
          [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
        }
        return shuffled;
      },
    };
  }

  function createCourseSeed() {
    if (global.crypto?.getRandomValues) {
      const values = new Uint32Array(1);
      global.crypto.getRandomValues(values);
      return values[0] || 1;
    }
    return normalizeSeed(`${Date.now()}-${Math.random()}`);
  }

  function canPlaceNextHex({ candidate, current, goal, remainingEdges, usedKeys, goalNeighborKeys }) {
    const candidateKey = hexKey(candidate);
    const currentKey = hexKey(current);
    const isGoal = sameHex(candidate, goal);
    const allowedNeighborKeys = new Set([currentKey]);

    if (isGoal) {
      goalNeighborKeys.forEach((key) => allowedNeighborKeys.add(key));
    } else if (remainingEdges === 2) {
      allowedNeighborKeys.add(hexKey(goal));
    }

    if (!isGoal && usedKeys.has(candidateKey)) return false;
    return hasOnlyAllowedNeighbors(candidate, usedKeys, allowedNeighborKeys);
  }

  function hasOnlyAllowedNeighbors(candidate, usedKeys, allowedNeighborKeys) {
    return hexNeighbors(candidate).every((neighbor) => {
      const neighborKey = hexKey(neighbor);
      return !usedKeys.has(neighborKey) || allowedNeighborKeys.has(neighborKey);
    });
  }

  function findExactPath({ start, goal, edges, radius, blockedKeys, random, goalNeighborKeys = [] }) {
    const usedKeys = new Set(blockedKeys);
    usedKeys.delete(hexKey(start));
    usedKeys.add(hexKey(start));
    const path = [copyHex(start)];

    function visit(current, remainingEdges) {
      if (remainingEdges === 0) return sameHex(current, goal);
      const candidates = random.shuffle(hexNeighbors(current)).filter((candidate) => {
        const candidateKey = hexKey(candidate);
        const isGoal = sameHex(candidate, goal);
        if (!isWithinRadius(candidate, radius)) return false;
        if (isGoal) return remainingEdges === 1;
        if (usedKeys.has(candidateKey)) return false;
        if (hexDistance(candidate, goal) > remainingEdges - 1) return false;
        return canPlaceNextHex({ candidate, current, goal, remainingEdges, usedKeys, goalNeighborKeys });
      });

      for (const candidate of candidates) {
        const candidateKey = hexKey(candidate);
        const isGoal = sameHex(candidate, goal);
        if (isGoal && !canPlaceNextHex({ candidate, current, goal, remainingEdges, usedKeys, goalNeighborKeys })) continue;
        if (!isGoal) usedKeys.add(candidateKey);
        path.push(copyHex(candidate));
        if (visit(candidate, remainingEdges - 1)) return true;
        path.pop();
        if (!isGoal) usedKeys.delete(candidateKey);
      }
      return false;
    }

    return visit(start, edges) ? path : null;
  }

  function branchAnchorIndexes(mainPathLength) {
    return [
      [Math.round((mainPathLength - 1) * 0.25), Math.round((mainPathLength - 1) * 0.48)],
      [Math.round((mainPathLength - 1) * 0.56), Math.round((mainPathLength - 1) * 0.79)],
    ];
  }

  function findBranchPath({ mainPath, startIndex, endIndex, occupiedKeys, radius, random }) {
    const start = mainPath[startIndex];
    const goal = mainPath[endIndex];
    const directDistance = hexDistance(start, goal);
    const mainSegmentEdges = endIndex - startIndex;
    const maximumEdges = Math.max(directDistance + 2, mainSegmentEdges + 3);

    for (let edges = directDistance + 1; edges <= maximumEdges; edges += 1) {
      const goalNeighborKeys = [mainPath[endIndex - 1], mainPath[endIndex + 1]]
        .filter(Boolean)
        .map(hexKey);
      const path = findExactPath({ start, goal, edges, radius, blockedKeys: occupiedKeys, random, goalNeighborKeys });
      if (path && path.length > 2) return path;
    }
    return null;
  }

  function nodeId(hex) {
    return `hex-${hex.q}-${hex.r}`;
  }

  function addPathNodes(nodesByKey, path, role) {
    path.forEach((hex) => {
      const key = hexKey(hex);
      const existing = nodesByKey.get(key);
      if (existing) {
        if (!existing.roles.includes(role)) existing.roles.push(role);
        return;
      }
      nodesByKey.set(key, { id: nodeId(hex), q: hex.q, r: hex.r, roles: [role] });
    });
  }

  function createCourseFromPaths({ seed, attempt, config, mainPath, branchPaths }) {
    const nodesByKey = new Map();
    addPathNodes(nodesByKey, mainPath, "main");
    branchPaths.forEach((path) => addPathNodes(nodesByKey, path, "branch"));
    const edges = [];
    const edgeKeys = new Set();
    function addEdges(path, role) {
      for (let index = 1; index < path.length; index += 1) {
        const from = nodeId(path[index - 1]);
        const to = nodeId(path[index]);
        const key = [from, to].sort().join("|");
        if (!edgeKeys.has(key)) {
          edgeKeys.add(key);
          edges.push({ from, to, role });
        }
      }
    }
    addEdges(mainPath, "main");
    branchPaths.forEach((path) => addEdges(path, "branch"));

    const start = mainPath[0];
    const goal = mainPath[mainPath.length - 1];
    return {
      version: 1,
      seed,
      attempt,
      size: config.size,
      sizeLabel: config.label,
      bounds: { radius: config.radius },
      startId: nodeId(start),
      goalId: nodeId(goal),
      nodes: [...nodesByKey.values()],
      edges,
      mainRoute: mainPath.map(nodeId),
      branches: branchPaths.map((path) => ({ from: nodeId(path[0]), to: nodeId(path[path.length - 1]), route: path.map(nodeId) })),
    };
  }

  function createRouteGraph(course) {
    const nextById = {};
    const branchOptionsById = {};
    course.mainRoute.forEach((id, index) => {
      if (index < course.mainRoute.length - 1) nextById[id] = course.mainRoute[index + 1];
    });
    course.branches.forEach((branch) => {
      const mainNext = nextById[branch.from];
      const branchNext = branch.route[1];
      if (!mainNext || !branchNext) return;
      branchOptionsById[branch.from] = [mainNext, branchNext];
      for (let index = 1; index < branch.route.length - 1; index += 1) {
        nextById[branch.route[index]] = branch.route[index + 1];
      }
    });
    return { nextById, branchOptionsById };
  }

  function findPathInGraph(course) {
    const neighbors = new Map(course.nodes.map((node) => [node.id, []]));
    course.edges.forEach((edge) => {
      neighbors.get(edge.from)?.push(edge.to);
      neighbors.get(edge.to)?.push(edge.from);
    });
    const visited = new Set([course.startId]);
    const queue = [course.startId];
    while (queue.length) {
      const current = queue.shift();
      if (current === course.goalId) return true;
      (neighbors.get(current) || []).forEach((next) => {
        if (!visited.has(next)) {
          visited.add(next);
          queue.push(next);
        }
      });
    }
    return false;
  }

  function validateHexCourse(course, expectedBranchCount = DEFAULT_CONFIG.branchCount) {
    const errors = [];
    const nodesById = new Map();
    course.nodes.forEach((node) => {
      if (nodesById.has(node.id)) errors.push(`重複したノードID: ${node.id}`);
      nodesById.set(node.id, node);
      if (!isWithinRadius(node, course.bounds.radius)) errors.push(`盤面外のヘックス: ${node.id}`);
    });
    if (!nodesById.has(course.startId) || !nodesById.has(course.goalId)) errors.push("START または GOAL が存在しません");
    if (course.branches.length !== expectedBranchCount) errors.push(`分岐数が ${expectedBranchCount} 本ではありません`);
    const edgeKeys = new Set();
    const edgeCountById = new Map(course.nodes.map((node) => [node.id, 0]));
    course.edges.forEach((edge) => {
      const from = nodesById.get(edge.from);
      const to = nodesById.get(edge.to);
      edgeKeys.add([edge.from, edge.to].sort().join("|"));
      edgeCountById.set(edge.from, (edgeCountById.get(edge.from) || 0) + 1);
      edgeCountById.set(edge.to, (edgeCountById.get(edge.to) || 0) + 1);
      if (!from || !to) errors.push(`接続先が存在しない辺: ${edge.from} → ${edge.to}`);
      else if (hexDistance(from, to) !== 1) errors.push(`隣接していない辺: ${edge.from} → ${edge.to}`);
    });
    edgeCountById.forEach((count, id) => {
      if (count > 3) errors.push(`接続数が3を超えています: ${id}`);
    });
    for (let firstIndex = 0; firstIndex < course.nodes.length; firstIndex += 1) {
      for (let secondIndex = firstIndex + 1; secondIndex < course.nodes.length; secondIndex += 1) {
        const first = course.nodes[firstIndex];
        const second = course.nodes[secondIndex];
        if (hexDistance(first, second) !== 1) continue;
        const key = [first.id, second.id].sort().join("|");
        if (!edgeKeys.has(key)) errors.push(`接続していないヘックスが隣接しています: ${first.id} / ${second.id}`);
      }
    }
    const mainNodeIds = new Set(course.mainRoute);
    if (course.mainRoute[0] !== course.startId || course.mainRoute[course.mainRoute.length - 1] !== course.goalId) errors.push("メインルートの始点または終点が不正です");
    course.branches.forEach((branch, index) => {
      if (branch.route[0] !== branch.from || branch.route[branch.route.length - 1] !== branch.to) errors.push(`分岐 ${index + 1} の始点または合流点が不正です`);
      if (!mainNodeIds.has(branch.from) || !mainNodeIds.has(branch.to)) errors.push(`分岐 ${index + 1} がメインルートに接続していません`);
      branch.route.slice(1, -1).forEach((id) => {
        if (mainNodeIds.has(id)) errors.push(`分岐 ${index + 1} が途中でメインルートに接触しています`);
      });
    });
    if (!findPathInGraph(course)) errors.push("START から GOAL へ到達できません");
    return { valid: errors.length === 0, errors };
  }

  function generateHexCourse(inputSeed = createCourseSeed(), options = {}) {
    const selectedSize = COURSE_SIZES[options.size] || COURSE_SIZES.small;
    const config = { ...DEFAULT_CONFIG, ...selectedSize, ...options };
    const seed = normalizeSeed(inputSeed);
    if (config.template) {
      const paths = createTemplatePaths(config.template, seed);
      if (paths) {
        const course = createCourseFromPaths({ seed, attempt: 0, config, ...paths });
        const validation = validateHexCourse(course, config.branchCount);
        if (validation.valid) return course;
      }
    }

    const start = { q: -config.radius, r: 0 };
    const goal = { q: config.radius, r: 0 };

    for (let attempt = 0; attempt < config.maximumAttempts; attempt += 1) {
      const random = createRandom(`${seed}:attempt:${attempt}`);
      const mainPath = findExactPath({
        start,
        goal,
        edges: config.mainEdges,
        radius: config.radius,
        blockedKeys: new Set(),
        random,
      });
      if (!mainPath) continue;

      const occupiedKeys = new Set(mainPath.map(hexKey));
      const branchPaths = [];
      let failed = false;
      for (const [startIndex, endIndex] of branchAnchorIndexes(mainPath.length).slice(0, config.branchCount)) {
        const branchPath = findBranchPath({ mainPath, startIndex, endIndex, occupiedKeys, radius: config.radius, random });
        if (!branchPath) {
          failed = true;
          break;
        }
        branchPath.slice(1, -1).forEach((hex) => occupiedKeys.add(hexKey(hex)));
        branchPaths.push(branchPath);
      }
      if (failed) continue;

      const course = createCourseFromPaths({ seed, attempt, config, mainPath, branchPaths });
      const validation = validateHexCourse(course, config.branchCount);
      if (validation.valid) return course;
    }
    throw new Error(`ヘックスコースを生成できませんでした（seed: ${seed}）`);
  }

  function courseFingerprint(course) {
    return JSON.stringify({ mainRoute: course.mainRoute, branches: course.branches, edges: course.edges });
  }

  const api = Object.freeze({
    COURSE_SIZES,
    DEFAULT_CONFIG,
    HEX_DIRECTIONS,
    createCourseSeed,
    createRandom,
    courseFingerprint,
    createRouteGraph,
    generateHexCourse,
    hexDistance,
    hexKey,
    hexNeighbors,
    normalizeSeed,
    validateHexCourse,
  });

  global.LifeRouletteHex = api;
  if (typeof window !== "undefined") window.LifeRouletteHex = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
}(globalThis));
