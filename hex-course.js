(function createLifeRouletteHexCourseApi(global) {
  "use strict";

  const HEX_DIRECTIONS = Object.freeze([
    { q: 1, r: 0 }, { q: 1, r: -1 }, { q: 0, r: -1 },
    { q: -1, r: 0 }, { q: -1, r: 1 }, { q: 0, r: 1 },
  ]);

  const DEFAULT_CONFIG = Object.freeze({
    radius: 6,
    mainEdges: 26,
    branchCount: 2,
    maximumAttempts: 120,
  });

  function hexKey(hex) {
    return `${hex.q},${hex.r}`;
  }

  function copyHex(hex) {
    return { q: hex.q, r: hex.r };
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

  function findExactPath({ start, goal, edges, radius, blockedKeys, random }) {
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
        return hexDistance(candidate, goal) <= remainingEdges - 1;
      });

      for (const candidate of candidates) {
        const candidateKey = hexKey(candidate);
        const isGoal = sameHex(candidate, goal);
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
      const path = findExactPath({ start, goal, edges, radius, blockedKeys: occupiedKeys, random });
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
    course.edges.forEach((edge) => {
      const from = nodesById.get(edge.from);
      const to = nodesById.get(edge.to);
      if (!from || !to) errors.push(`接続先が存在しない辺: ${edge.from} → ${edge.to}`);
      else if (hexDistance(from, to) !== 1) errors.push(`隣接していない辺: ${edge.from} → ${edge.to}`);
    });
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
    const config = { ...DEFAULT_CONFIG, ...options };
    const seed = normalizeSeed(inputSeed);
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
