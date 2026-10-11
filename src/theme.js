const radii = {
  none: [0, 0, 0, 0, 0, 0, 0, 0],
  soft: [18, 24, 16, 22, 22, 18, 24, 16],
  organic: [29, 42, 23, 37, 36, 25, 40, 27],
  expressive: [48, 24, 42, 20, 24, 46, 22, 44],
};

// Versioned, deterministic geometry. No DOM or animation is needed to generate it.
function randomFor(seed) {
  let state = 2166136261;
  for (const character of `ff-shape-v1:${seed}`) {
    state = Math.imul(state ^ character.codePointAt(0), 16777619);
  }
  return () => {
    state += 0x6d2b79f5;
    let value = Math.imul(state ^ (state >>> 15), state | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function radius(values, variation, random) {
  const generated = values.map(
    (value) => `${(value * (1 + (random() - 0.5) * variation)).toFixed(1)}px`,
  );
  return `${generated.slice(0, 4).join(' ')} / ${generated.slice(4).join(' ')}`;
}

const edges = ['top', 'right', 'bottom', 'left'];

function waveMask(strength, variation, seed, counts) {
  if (strength === 0 || edges.every((edge) => counts[edge] === 0)) return 'none';
  const amplitude = strength * 2;
  const inset = amplitude + 1;
  const width = 1000 - inset * 2;
  const height = 600 - inset * 2;
  const parts = [`M${inset} ${inset}`];
  const point = (side, along, offset) => {
    if (side === 0) return [inset + width * along, inset + offset];
    if (side === 1) return [1000 - inset - offset, inset + height * along];
    if (side === 2) return [1000 - inset - width * along, 600 - inset - offset];
    return [inset + offset, 600 - inset - height * along];
  };
  for (let side = 0; side < 4; side++) {
    // Separate streams keep the other edges stable when one count changes.
    // Offsets preserve the original v1 silhouette at the default four waves.
    const random = randomFor(`${seed}:wave`);
    for (let skip = 0; skip < side * 8; skip++) random();
    const segments = counts[edges[side]] * 2;
    if (segments === 0) {
      parts.push(`L${point(side, 1, 0).join(' ')}`);
      continue;
    }
    for (let step = 0; step < segments; step++) {
      const along = step / segments;
      const offset =
        (((step % 2 ? -1 : 1) * amplitude * 4) / 3) * (1 + (random() - 0.5) * variation);
      const controls = [
        ...point(side, along + 1 / (segments * 3), offset),
        ...point(side, along + 2 / (segments * 3), offset),
        ...point(side, along + 1 / segments, 0),
      ];
      parts.push(`C${controls.map((value) => value.toFixed(1)).join(' ')}`);
    }
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 600" preserveAspectRatio="none"><path fill="white" d="${parts.join(' ')}Z"/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

/** Generate repeatable geometry; apply to a theme boundary or export static CSS. */
export function createTheme({
  seed = 'forest-and-fern',
  shape = 'organic',
  variation = 0.6,
  waveStrength = 0,
  waveCounts = {},
} = {}) {
  if (typeof seed !== 'string' || seed.length === 0 || seed.length > 200) {
    throw new TypeError('seed must be a nonempty string of at most 200 characters');
  }
  if (!Object.hasOwn(radii, shape)) throw new TypeError('Unknown shape preset');
  if (!Number.isFinite(variation) || variation < 0 || variation > 1) {
    throw new RangeError('variation must be between 0 and 1');
  }
  if (!Number.isInteger(waveStrength) || waveStrength < 0 || waveStrength > 12) {
    throw new RangeError('waveStrength must be an integer between 0 and 12');
  }
  if (!waveCounts || typeof waveCounts !== 'object' || Array.isArray(waveCounts)) {
    throw new TypeError('waveCounts must be an object with top, right, bottom, or left counts');
  }
  if (Object.keys(waveCounts).some((edge) => !edges.includes(edge))) {
    throw new TypeError('Unknown waveCounts edge');
  }
  const counts = Object.fromEntries(edges.map((edge) => [edge, waveCounts[edge] ?? 4]));
  if (Object.values(counts).some((count) => !Number.isInteger(count) || count < 0 || count > 12)) {
    throw new RangeError('Each wave count must be an integer between 0 and 12');
  }
  const tokens = Object.freeze({
    '--ff-shape-radius': radius(radii[shape], variation, randomFor(`${seed}:surface`)),
    '--ff-control-radius': radius(
      shape === 'none' ? radii.none : [17, 26, 12, 23, 20, 16, 24, 18],
      variation,
      randomFor(`${seed}:control`),
    ),
    '--ff-wave-mask': waveMask(waveStrength, variation, seed, counts),
  });
  return Object.freeze({
    seed,
    version: 1,
    tokens,
    apply(element) {
      for (const [name, value] of Object.entries(tokens)) {
        element.style.setProperty(name, value);
      }
    },
    toCSS() {
      return `.ff-seeded-theme {\n${Object.entries(tokens)
        .map(([name, value]) => `  ${name}: ${value};`)
        .join('\n')}\n}\n`;
    },
  });
}
