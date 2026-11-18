/* ══════════════════════════════════════════════════════════════
   The bouquet — drawn from scratch, petal by petal.
   Every rose, carnation, hydrangea floret, sprig and ribbon tail
   below is generated as layered SVG, never a photograph.
   ══════════════════════════════════════════════════════════════ */
const CX = 500;
const BIND_Y = 800;
export const BLOOM_MS = 8000;

/* ── palettes ───────────────────────────────────────────── */
const PAL = {
  rose: {
    light: '#F9C2D2', base: '#EC93AE', mid: '#DD7797', dark: '#B95272', deep: '#8E3452', edge: '#FFE9EF'
  },
  pink: {
    light: '#FBD4DF', base: '#F3ADC2', mid: '#E993AC', dark: '#C96785', deep: '#9C4462', edge: '#FFF0F4'
  },
  blush: {
    light: '#FDE7EC', base: '#F8CCD8', mid: '#F0B3C4', dark: '#D08CA0', deep: '#AC667D', edge: '#FFF7F8'
  },
  ivory: {
    light: '#FFFFFF', base: '#FEF8F4', mid: '#F9E9E4', dark: '#E3C9C7', deep: '#C7A7A7', edge: '#FFFFFF'
  },
  cream: {
    light: '#FFFCF8', base: '#FCF1EA', mid: '#F6E2DA', dark: '#DFC1BD', deep: '#C4A5A3', edge: '#FFFDFB'
  },
  mauve: {
    light: '#EFCAD5', base: '#DFA8B9', mid: '#D190A5', dark: '#AE657E', deep: '#89445C', edge: '#FAE1E8'
  },
  carnation: {
    light: '#FEE9EE', base: '#F8CAD7', mid: '#EFB0C3', dark: '#CF829A', deep: '#AA5D78', edge: '#FFF4F6'
  },
  carnationCream: {
    light: '#FFFFFF', base: '#FBF0EC', mid: '#F5E1DE', dark: '#DFC1BF', deep: '#C6A5A5', edge: '#FFFFFF'
  }
};

/* ── tiny utilities ─────────────────────────────────────── */
const n1 = (n) => Math.round(n * 10) / 10;
const n2 = (n) => Math.round(n * 100) / 100;

function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function polar(angle, radius) {
  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius
  };
}

function ruffledCircle(R, bumps, depth, phase) {
  const step = (Math.PI * 2) / bumps;
  let d = '';
  for (let i = 0; i < bumps; i++) {
    const a0 = phase + i * step;
    const a1 = a0 + step;
    const mid = a0 + step / 2;
    const p0 = polar(a0, R * (1 - depth));
    const p1 = polar(a1, R * (1 - depth));
    const c = polar(mid, R * (1 + depth * 1.9));
    if (i === 0) d += `M ${n1(p0.x)} ${n1(p0.y)}`;
    d += ` Q ${n1(c.x)} ${n1(c.y)} ${n1(p1.x)} ${n1(p1.y)}`;
  }
  return d + ' Z';
}

const PETAL = 'M0 6 C-22 2 -39 -12 -41 -31 C-43 -50 -27 -62 -2 -63 C23 -64 42 -49 40 -30 C38 -13 23 1 0 6 Z';
const PETAL_B = 'M0 6 C-24 3 -40 -11 -42 -30 C-44 -49 -28 -64 -5 -64 C22 -64 43 -50 41 -30 C39 -13 22 2 0 6 Z';
const PETAL_C = 'M0 8 C-16 8 -32 2 -41 -12 C-48 -24 -47 -42 -35 -53 C-25 -62 -12 -60 -5 -53 C-1 -49 1 -49 5 -53 C12 -60 25 -62 35 -53 C47 -42 48 -24 41 -12 C32 2 16 8 0 8 Z';
const PETAL_D = 'M0 8 C-18 4 -35 -2 -43 -16 C-50 -30 -44 -47 -30 -55 C-19 -62 -6 -57 -2 -49 C0 -45 2 -45 4 -49 C9 -58 22 -62 33 -54 C46 -45 49 -28 42 -15 C34 -2 17 5 0 8 Z';
const CREASE = 'M0 2 C-6 -19 -8 -38 -2 -54';

/* ── gradients ──────────────────────────────────────────── */
function buildDefs() {
  let out = '';

  Object.keys(PAL).forEach((key) => {
    const p = PAL[key];
    out += `
      <radialGradient id="petal-${key}" cx="50%" cy="100%" r="105%">
        <stop offset="0" stop-color="${p.deep}"/>
        <stop offset=".3" stop-color="${p.dark}"/>
        <stop offset=".62" stop-color="${p.mid}"/>
        <stop offset=".88" stop-color="${p.base}"/>
        <stop offset="1" stop-color="${p.light}"/>
      </radialGradient>
      <radialGradient id="under-${key}" cx="48%" cy="44%" r="62%">
        <stop offset="0" stop-color="${p.deep}"/>
        <stop offset=".55" stop-color="${p.dark}"/>
        <stop offset="1" stop-color="${p.mid}"/>
      </radialGradient>
      <radialGradient id="carn-${key}" cx="50%" cy="50%" r="62%">
        <stop offset="0" stop-color="${p.dark}"/>
        <stop offset=".48" stop-color="${p.mid}"/>
        <stop offset=".82" stop-color="${p.base}"/>
        <stop offset="1" stop-color="${p.light}"/>
      </radialGradient>`;
  });

  return `<defs>
    ${out}

    <radialGradient id="flowerShadow" cx="50%" cy="52%" r="52%">
      <stop offset="0" stop-color="#6C2A40" stop-opacity=".26"/>
      <stop offset=".55" stop-color="#6C2A40" stop-opacity=".12"/>
      <stop offset="1" stop-color="#6C2A40" stop-opacity="0"/>
    </radialGradient>

    <radialGradient id="groundShadow" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="#6C2A40" stop-opacity=".18"/>
      <stop offset=".6" stop-color="#6C2A40" stop-opacity=".07"/>
      <stop offset="1" stop-color="#6C2A40" stop-opacity="0"/>
    </radialGradient>

    <radialGradient id="hydraBase" cx="50%" cy="42%" r="62%">
      <stop offset="0" stop-color="#FFFDF9"/>
      <stop offset=".62" stop-color="#FBF0E8"/>
      <stop offset="1" stop-color="#F1DCD7"/>
    </radialGradient>

    <linearGradient id="leafGrad" x1="0" y1="1" x2="1" y2="0">
      <stop offset="0" stop-color="#4F6652"/>
      <stop offset=".55" stop-color="#728B70"/>
      <stop offset="1" stop-color="#A3B294"/>
    </linearGradient>
    <linearGradient id="leafGrad2" x1="0" y1="1" x2="1" y2="0">
      <stop offset="0" stop-color="#3F5644"/>
      <stop offset=".6" stop-color="#617A5F"/>
      <stop offset="1" stop-color="#879C7B"/>
    </linearGradient>
    <linearGradient id="stemGrad" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0" stop-color="#4C6249"/>
      <stop offset=".6" stop-color="#708868"/>
      <stop offset="1" stop-color="#96A584"/>
    </linearGradient>
    <linearGradient id="eucaGrad" x1="0" y1="1" x2="1" y2="0">
      <stop offset="0" stop-color="#6B826C"/>
      <stop offset=".55" stop-color="#8FA189"/>
      <stop offset="1" stop-color="#C0C7AB"/>
    </linearGradient>

    <linearGradient id="wrapA" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#C4839A"/>
      <stop offset=".24" stop-color="#E4B1C1"/>
      <stop offset=".54" stop-color="#F9E2E8"/>
      <stop offset=".8" stop-color="#E5B3C2"/>
      <stop offset="1" stop-color="#C88DA0"/>
    </linearGradient>
    <linearGradient id="wrapB" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#D7A1B2"/>
      <stop offset=".28" stop-color="#F2D0D9"/>
      <stop offset=".58" stop-color="#FFF3F4"/>
      <stop offset=".84" stop-color="#E9C0CC"/>
      <stop offset="1" stop-color="#D19AAB"/>
    </linearGradient>
    <linearGradient id="wrapC" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#B6768C"/>
      <stop offset=".3" stop-color="#DCA6B7"/>
      <stop offset=".6" stop-color="#F3CFD9"/>
      <stop offset=".85" stop-color="#D9A1B3"/>
      <stop offset="1" stop-color="#B7788E"/>
    </linearGradient>
    <linearGradient id="wrapD" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#E0B1BE"/>
      <stop offset=".32" stop-color="#F7DDE4"/>
      <stop offset=".64" stop-color="#FFFBFA"/>
      <stop offset=".86" stop-color="#F0C9D4"/>
      <stop offset="1" stop-color="#D9A4B4"/>
    </linearGradient>
    <linearGradient id="wrapFold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#7C3A50" stop-opacity=".16"/>
      <stop offset=".55" stop-color="#7C3A50" stop-opacity=".03"/>
      <stop offset="1" stop-color="#FFFFFF" stop-opacity=".14"/>
    </linearGradient>

    <linearGradient id="wrapPale" x1="0" y1="0" x2="1" y2=".2">
      <stop offset="0" stop-color="#F4CDD8"/>
      <stop offset=".35" stop-color="#FCE7EB"/>
      <stop offset=".62" stop-color="#FFF7F4"/>
      <stop offset=".84" stop-color="#F6D5DD"/>
      <stop offset="1" stop-color="#E9B5C4"/>
    </linearGradient>
    <linearGradient id="wrapPaleDeep" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#D99BAD"/>
      <stop offset=".45" stop-color="#F2C7D3"/>
      <stop offset=".7" stop-color="#FBE2E8"/>
      <stop offset="1" stop-color="#DCA2B2"/>
    </linearGradient>
    <linearGradient id="wrapCone" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#E8B2C1"/>
      <stop offset=".22" stop-color="#F8D8E0"/>
      <stop offset=".52" stop-color="#FEF3F2"/>
      <stop offset=".74" stop-color="#F9DDE4"/>
      <stop offset="1" stop-color="#E4ABBB"/>
    </linearGradient>

    <linearGradient id="paperA" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#B2738A"/>
      <stop offset=".28" stop-color="#D6A0B1"/>
      <stop offset=".55" stop-color="#E9C1CC"/>
      <stop offset=".8" stop-color="#D5A0B1"/>
      <stop offset="1" stop-color="#B5798E"/>
    </linearGradient>
    <linearGradient id="paperB" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#C0849A"/>
      <stop offset=".3" stop-color="#E2B4C2"/>
      <stop offset=".58" stop-color="#F3D4DC"/>
      <stop offset=".84" stop-color="#DFAEBE"/>
      <stop offset="1" stop-color="#C0869B"/>
    </linearGradient>
    <linearGradient id="paperC" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#CE93A6"/>
      <stop offset=".35" stop-color="#EDC6D1"/>
      <stop offset=".62" stop-color="#FAE3E8"/>
      <stop offset=".86" stop-color="#EFC8D2"/>
      <stop offset="1" stop-color="#CE95A7"/>
    </linearGradient>
    <linearGradient id="paperInner" x1="0" y1="0" x2="1" y2=".1">
      <stop offset="0" stop-color="#EBB8C7"/>
      <stop offset=".3" stop-color="#F9DCE4"/>
      <stop offset=".6" stop-color="#FFF1F1"/>
      <stop offset=".85" stop-color="#F8DCE4"/>
      <stop offset="1" stop-color="#EAB9C8"/>
    </linearGradient>
    <radialGradient id="fanShade" cx="50%" cy="72%" r="64%">
      <stop offset="0" stop-color="#8F435D" stop-opacity=".22"/>
      <stop offset=".55" stop-color="#8F435D" stop-opacity=".08"/>
      <stop offset="1" stop-color="#8F435D" stop-opacity="0"/>
    </radialGradient>

    <linearGradient id="satin" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#CE8AA0"/>
      <stop offset=".2" stop-color="#F2BDCD"/>
      <stop offset=".46" stop-color="#FDE7EC"/>
      <stop offset=".72" stop-color="#F0B4C6"/>
      <stop offset="1" stop-color="#C98399"/>
    </linearGradient>
    <linearGradient id="satinDeep" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#B76E86"/>
      <stop offset=".34" stop-color="#E3A4B7"/>
      <stop offset=".58" stop-color="#F7D2DC"/>
      <stop offset=".82" stop-color="#D995A9"/>
      <stop offset="1" stop-color="#B16880"/>
    </linearGradient>
    <linearGradient id="satinTail" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#C07990"/>
      <stop offset=".22" stop-color="#EBB4C4"/>
      <stop offset=".48" stop-color="#FCE6EB"/>
      <stop offset=".68" stop-color="#F2C2D0"/>
      <stop offset=".88" stop-color="#D99AAE"/>
      <stop offset="1" stop-color="#B96F87"/>
    </linearGradient>
  </defs>`;
}

/* ── roses ───────────────────────────────────────────────── */
function rose(cfg) {
  const { x, y, s = 1, rot = 0, pal = 'pink', delay = 2, hero = false, sway = false } = cfg;
  const p = PAL[pal];
  const seed = mulberry32(Math.round(x * 7 + y * 13));
  const rings = [
    { count: 7, angle: 4, scale: 1.02, pick: true, shade: false },
    { count: 6, angle: 30, scale: 0.76, pick: false, shade: true },
    { count: 5, angle: 66, scale: 0.52, pick: false, shade: true }
  ];

  let petals = '';
  rings.forEach((ring, ri) => {
    for (let i = 0; i < ring.count; i++) {
      const jitter = (seed() - 0.5) * 5;
      const a = ring.angle + i * (360 / ring.count) + jitter;
      const dly = delay + ri * 0.045 + i * 0.024;
      const scale = ring.scale * (0.93 + seed() * 0.09);
      const path = ring.pick && i % 2 ? PETAL_D : ring.pick ? PETAL_C : (i % 2 ? PETAL_C : PETAL_D);
      petals += `<g transform="rotate(${n1(a)}) translate(0 -${ri === 0 ? 1 : 3}) scale(${n2(scale)})">
          <g class="rose-petal-anim" style="--delay:${n2(dly)}s">
            <path d="${path}" fill="url(#petal-${pal})" stroke="${p.dark}" stroke-opacity=".2" stroke-width="1"/>
            ${ri === 0 && i % 2 === 0 ? `<path d="${CREASE}" fill="none" stroke="${p.light}" stroke-opacity=".2" stroke-width="1.4" stroke-linecap="round"/>` : ''}
          </g>
        </g>`;
      if (ring.shade && i === 0) {
        petals += `<circle r="${ri === 1 ? 33 : 21}" fill="url(#flowerShadow)" opacity="${ri === 1 ? 0.85 : 0.7}"/>`;
      }
    }
  });

  const swirl = `
    <path d="M-10 7 C-19 0 -18 -12 -8 -17 C2 -22 14 -16 15 -5 C16 4 7 10 -2 8 C-9 6 -10 -2 -4 -4 C1 -6 5 -1 3 2"
      fill="none" stroke="${p.light}" stroke-opacity=".55" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M3 12 C-6 11 -12 4 -10 -3" fill="none" stroke="${p.deep}" stroke-opacity=".36" stroke-width="1.3" stroke-linecap="round"/>`;

  const highlight = seed() > 0.4
    ? `<path d="M-40 -14 C-43 -38 -29 -54 -6 -59" fill="none" stroke="#FFFFFF" stroke-opacity=".2" stroke-width="2.2" stroke-linecap="round"/>
       <path d="M34 -40 C39 -31 41 -22 40 -14" fill="none" stroke="${p.light}" stroke-opacity=".25" stroke-width="1.6" stroke-linecap="round"/>`
    : `<path d="M-38 -22 C-32 -41 -18 -52 -1 -55" fill="none" stroke="#FFFFFF" stroke-opacity=".16" stroke-width="2" stroke-linecap="round"/>`;

  const swayStyle = `--sway-delay:${n2(seed() * -6)}s;--sway-dur:${n2(7 + seed() * 3)}s`;
  const swayOpen = sway ? `<g class="flower-sway" style="${swayStyle}">` : '<g>';
  const swayClose = '</g>';

  return `<g class="flower flower--rose${hero ? ' flower--hero' : ''}" transform="translate(${n1(x)} ${n1(y)}) rotate(${n1(rot)}) scale(${n2(s)})">
    <g class="flower-bloom" style="--delay:${n2(delay)}s;--bud-rot:${n1(-6 + seed() * 12)}deg">
      ${swayOpen}
        <ellipse cx="1" cy="9" rx="62" ry="57" fill="url(#flowerShadow)"/>
        <circle r="49" fill="url(#under-${pal})"/>
        ${petals}
        <circle r="17" fill="url(#under-${pal})"/>
        ${swirl}
        <circle cx="-4" cy="-6" r="1.7" fill="${p.light}" opacity=".55"/>
        ${highlight}
      ${swayClose}
    </g>
  </g>`;
}

/* ── carnations ──────────────────────────────────────────── */
function carnation(cfg) {
  const { x, y, s = 1, rot = 0, pal = 'carnation', delay = 4, sway = false } = cfg;
  const p = PAL[pal];
  const seed = mulberry32(Math.round(x * 9 + y * 3));
  const outer = ruffledCircle(48, 14, 0.09, 0);
  const mid = ruffledCircle(48, 12, 0.11, 0.22);
  const inner = ruffledCircle(48, 10, 0.13, 0.5);

  const creases = Array.from({ length: 13 }, (_, i) => {
    const a = (i / 13) * Math.PI * 2;
    const q = polar(a, 47);
    return `<path d="M0 0 L ${n1(q.x)} ${n1(q.y)}" stroke="${p.dark}" stroke-opacity=".13" stroke-width="1"/>`;
  }).join('');

  const swayStyle = `--sway-delay:${n2(seed() * -5)}s;--sway-dur:${n2(8 + seed() * 3)}s`;
  const swayOpen = sway ? `<g class="flower-sway" style="${swayStyle}">` : '<g>';

  return `<g class="flower flower--carnation" transform="translate(${n1(x)} ${n1(y)}) rotate(${n1(rot)}) scale(${n2(s)})">
    <g class="flower-bloom" style="--delay:${n2(delay)}s;--bud-rot:${n1(-5 + seed() * 10)}deg">
      ${swayOpen}
        <ellipse cx="1" cy="8" rx="52" ry="48" fill="url(#flowerShadow)"/>
        <circle r="39" fill="${p.base}" opacity=".8"/>
        <path d="${outer}" fill="url(#carn-${pal})" stroke="${p.dark}" stroke-opacity=".22" stroke-width="1"/>
        ${creases}
        <g transform="rotate(13) scale(.79)"><path d="${mid}" fill="url(#carn-${pal})" opacity=".92"/></g>
        <g transform="rotate(27) scale(.58)"><path d="${inner}" fill="url(#carn-${pal})"/></g>
        <g transform="rotate(41) scale(.36)"><path d="${ruffledCircle(48, 9, 0.15, 0.4)}" fill="${p.light}" opacity=".65"/></g>
        <circle r="7.5" fill="${p.dark}" opacity=".3"/>
        <circle r="3.4" fill="${p.light}" opacity=".4"/>
      ${swayClose(sway, '</g>')}
    </g>
  </g>`;
}

function swayClose(used, tag) {
  return used ? tag : '</g>';
}

/* ── hydrangea ───────────────────────────────────────────── */
function hydrangea(cfg) {
  const { x, y, s = 1, rot = 0, delay = 3, seed = 1, sway = false } = cfg;
  const rng = mulberry32(seed);
  const count = 24;
  let florets = '';

  for (let i = 0; i < count; i++) {
    const t = Math.sqrt((i + 0.6) / count);
    const a = i * 2.399963 + rng() * 0.7;
    const rad = 57 * (0.14 + 0.86 * t);
    const fx = Math.cos(a) * rad * 1.02;
    const fy = Math.sin(a) * rad * 0.8;
    const fs = 0.76 + (1 - t) * 0.4 + rng() * 0.1;
    const tone = rng();
    const fill = tone > 0.66 ? '#FFFDFB' : tone > 0.3 ? '#FCF4EE' : '#F9EBE7';
    const stroke = tone > 0.5 ? '#EBD8D3' : '#DFC6C2';

    florets += `<g transform="translate(${n1(fx)} ${n1(fy)}) rotate(${n1(rng() * 90)}) scale(${n2(fs)})">
      <ellipse cx="0" cy="-8.2" rx="6.8" ry="8.4" fill="${fill}" stroke="${stroke}" stroke-width=".6" stroke-opacity=".8"/>
      <ellipse cx="0" cy="8.2" rx="6.8" ry="8.4" fill="${fill}" stroke="${stroke}" stroke-width=".6" stroke-opacity=".8"/>
      <ellipse cx="-8.2" cy="0" rx="6.8" ry="8.4" fill="${fill}" stroke="${stroke}" stroke-width=".6" stroke-opacity=".8"/>
      <ellipse cx="8.2" cy="0" rx="6.8" ry="8.4" fill="${fill}" stroke="${stroke}" stroke-width=".6" stroke-opacity=".8"/>
      <circle r="2.8" fill="${tone > 0.55 ? '#D8C7AB' : '#DCE0C4'}" opacity=".85"/>
    </g>`;
  }

  const blob = ruffledCircle(58, 11, 0.06, 0.3);
  const swayStyle = `--sway-delay:${n2(rng() * -7)}s;--sway-dur:${n2(9 + rng() * 3)}s`;
  const swayOpen = sway ? `<g class="flower-sway" style="${swayStyle}">` : '<g>';

  return `<g class="flower flower--hydrangea" transform="translate(${n1(x)} ${n1(y)}) rotate(${n1(rot)}) scale(${n2(s)})">
    <g class="flower-bloom" style="--delay:${n2(delay)}s;--bud-rot:${n1(-4 + rng() * 8)}deg">
      ${swayOpen}
        <ellipse cx="2" cy="10" rx="70" ry="62" fill="url(#flowerShadow)"/>
        <path d="${blob}" fill="url(#hydraBase)"/>
        <path d="${ruffledCircle(47, 12, 0.07, 0.6)}" fill="#FFFDFC" opacity=".65"/>
        ${florets}
      ${swayClose(sway, '</g>')}
    </g>
  </g>`;
}

/* ── greenery ────────────────────────────────────────────── */
function leaf(cfg) {
  const { x, y, angle = 0, s = 1, delay = 1.2, sway = true, dark = false, seed = 1 } = cfg;
  const rng = mulberry32(seed);
  const swayStyle = `--sway-delay:${n2(rng() * -8)}s`;
  const d = 'M0 0 C-25 -15 -33 -45 -12 -68 C 8 -87 33 -66 30 -39 C 27 -16 14 0 0 0 Z';
  const vein = 'M0 -2 C-5 -22 -8 -42 -9 -58';

  return `<g transform="translate(${n1(x)} ${n1(y)}) rotate(${n1(angle)}) scale(${n2(s)})">
    <g class="leaf-anim" style="--delay:${n2(delay)}s">
      ${sway ? `<g class="greenery-sway" style="${swayStyle}">` : '<g>'}
        <path d="${d}" fill="url(#${dark ? 'leafGrad2' : 'leafGrad'})" stroke="#405544" stroke-opacity=".36" stroke-width="1"/>
        <path d="${vein}" fill="none" stroke="#DDE5CF" stroke-opacity=".34" stroke-width="1.1" stroke-linecap="round"/>
        <path d="M-10 -50 C-2 -54 8 -50 12 -42" fill="none" stroke="#DDE5CF" stroke-opacity=".2" stroke-width=".8"/>
      </g>
    </g>
  </g>`;
}

function eucalyptus(cfg) {
  const { x, y, angle = 0, s = 1, flip = 1, delay = 1.1, seed = 1 } = cfg;
  const rng = mulberry32(seed);
  let leaves = '';

  for (let i = 0; i < 9; i++) {
    const t = 0.1 + i * 0.096;
    const py = -28 - t * 152;
    const px = Math.sin(t * 2.6) * 7 * flip;
    const side = i % 2 === 0 ? 1 : -1;
    const size = 0.68 + rng() * 0.34;
    leaves += `<g transform="translate(${n1(px)} ${n1(py)}) rotate(${side * (52 + rng() * 22)}) scale(${n2(size)})">
        <ellipse cx="0" cy="-13" rx="5.2" ry="13.4"
          fill="url(#eucaGrad)" stroke="#5A715C" stroke-opacity=".26" stroke-width=".8"/>
        <path d="M0 -2 L0 -23" fill="none" stroke="#E8EDD7" stroke-opacity=".34" stroke-width=".7"/>
        <path d="M0 -7 C-2 -12 -2 -17 -1 -21" fill="none" stroke="#5F7660" stroke-opacity=".2" stroke-width=".5"/>
      </g>`;
  }

  return `<g transform="translate(${n1(x)} ${n1(y)}) rotate(${n1(angle)}) scale(${n2(s)})">
    <g class="greenery-anim" style="--delay:${n2(delay)}s">
      <g class="greenery-sway" style="--sway-delay:${n2(rng() * -9)}s">
        <path d="M0 0 C${n1(7 * flip)} -48 ${n1(-7 * flip)} -104 ${n1(9 * flip)} -178"
          fill="none" stroke="#7F9377" stroke-width="2.4" stroke-linecap="round" opacity=".8"/>
        <path d="M0 0 C${n1(7 * flip)} -48 ${n1(-7 * flip)} -104 ${n1(9 * flip)} -178"
          fill="none" stroke="#B9C4A6" stroke-width=".8" stroke-linecap="round" opacity=".45"/>
        ${leaves}
        <ellipse cx="${n1(11 * flip)}" cy="-184" rx="4" ry="6" fill="#A4B393" opacity=".8"/>
      </g>
    </g>
  </g>`;
}

function twig(cfg) {
  const { x, y, height = 420, lean = -40, delay = 0.9, seed = 1 } = cfg;
  const rng = mulberry32(seed);
  const p1 = { x: lean * 0.22, y: -height * 0.42 };
  const p2 = { x: lean, y: -height };
  const qpoint = (t) => {
    const mt = 1 - t;
    return {
      x: mt * mt * 0 + 2 * mt * t * p1.x + t * t * p2.x,
      y: 2 * mt * t * p1.y + t * t * p2.y
    };
  };

  let branches = '';
  let buds = '';
  const stops = [0.28, 0.4, 0.52, 0.64, 0.76, 0.86, 0.94];
  stops.forEach((t, i) => {
    const p = qpoint(t);
    const dir = i % 2 === 0 ? 1 : -1;
    const len = 20 + rng() * 38;
    const bx = p.x + dir * len;
    const by = p.y - len * (0.5 + rng() * 0.5);
    branches += `<path d="M${n1(p.x)} ${n1(p.y)} Q ${n1(p.x + dir * len * 0.55)} ${n1(p.y - len * 0.5)} ${n1(bx)} ${n1(by)}"
      fill="none" stroke="#9D8274" stroke-width=".8" stroke-linecap="round" opacity="${n2(0.5 + rng() * 0.25)}"/>`;
    buds += `<ellipse cx="${n1(bx)}" cy="${n1(by)}" rx="1.8" ry="3.6" fill="#A98878" opacity=".72" transform="rotate(${n1(dir * 26)} ${n1(bx)} ${n1(by)})"/>`;
    buds += `<circle cx="${n1(bx + dir * 3)}" cy="${n1(by - 4)}" r="1.15" fill="#B99C8B" opacity=".6"/>`;
    buds += `<circle cx="${n1(bx - dir * 2.4)}" cy="${n1(by + 3)}" r="1" fill="#A98878" opacity=".55"/>`;
    if (rng() > 0.45) {
      buds += `<ellipse cx="${n1(p.x + dir * len * 0.5)}" cy="${n1(p.y - len * 0.48)}" rx="1.2" ry="2.5" fill="#B09282" opacity=".5"/>`;
    }
  });
  buds += `<ellipse cx="${n1(p2.x)}" cy="${n1(p2.y)}" rx="1.8" ry="4" fill="#A98878" opacity=".72"/>`;
  buds += `<circle cx="${n1(p2.x + 3)}" cy="${n1(p2.y - 5)}" r="1.1" fill="#B99C8B" opacity=".6"/>`;

  return `<g transform="translate(${n1(x)} ${n1(y)})">
    <g class="greenery-anim" style="--delay:${n2(delay)}s">
      <g class="greenery-sway" style="--sway-delay:${n2(rng() * -10)}s">
        <path d="M0 0 Q ${n1(p1.x)} ${n1(p1.y)} ${n1(p2.x)} ${n1(p2.y)}"
          fill="none" stroke="#9D8274" stroke-width="1.6" stroke-linecap="round" opacity=".78"/>
        ${branches}
        ${buds}
      </g>
    </g>
  </g>`;
}

function babysBreath(cfg) {
  const { x, y, rx = 44, ry = 32, delay = 5, seed = 1, tint = 0 } = cfg;
  const rng = mulberry32(seed);
  const count = 13;
  let stems = '';
  let dots = '';

  for (let i = 0; i < count; i++) {
    const a = rng() * Math.PI * 2;
    const rad = 0.3 + Math.sqrt(rng()) * 0.7;
    const px = Math.cos(a) * rx * rad;
    const py = Math.sin(a) * ry * rad;
    const cx1 = px * (0.3 + rng() * 0.3) + (rng() - 0.5) * 18;
    const cy1 = py * 0.3 - rng() * 14;
    const size = 2.6 + rng() * 2.4;
    const petalTone = tint > 0.5 ? '#FFF7F3' : '#FFFBFA';

    stems += `<path d="M0 0 Q ${n1(cx1)} ${n1(cy1)} ${n1(px)} ${n1(py)}"
      fill="none" stroke="#8EA083" stroke-width=".8" stroke-linecap="round" opacity=".55"/>`;
    dots += `<g transform="translate(${n1(px)} ${n1(py)})">
      <circle r="${n1(size)}" fill="${petalTone}" stroke="#EAD9D7" stroke-width=".5" stroke-opacity=".65"/>
      <circle r="${n1(size * 0.28)}" fill="#D9C7A9" opacity=".75"/>
      ${rng() > 0.6 ? `<circle cx="${n1(size * 1.5)}" cy="${n1(-size)}" r="${n1(size * 0.5)}" fill="${petalTone}" opacity=".9"/>` : ''}
    </g>`;
  }

  return `<g transform="translate(${n1(x)} ${n1(y)})">
    <g class="spray-anim" style="--delay:${n2(delay)}s">
      ${stems}
      ${dots}
    </g>
  </g>`;
}

function tinyFlower(cfg) {
  const { x, y, s = 1, rot = 0, delay = 5, pal = 'blush', sway = false, seed = 1 } = cfg;
  const p = PAL[pal];
  const rng = mulberry32(seed);
  const petals = [0, 72, 144, 216, 288].map((a) => `
    <ellipse cx="0" cy="-6.4" rx="4.1" ry="7" transform="rotate(${a})"
      fill="${p.base}" stroke="${p.dark}" stroke-width=".5" stroke-opacity=".3"/>`).join('');
  const swayStyle = `--sway-delay:${n2(rng() * -5)}s`;

  return `<g class="flower flower--tiny" transform="translate(${n1(x)} ${n1(y)}) rotate(${n1(rot)}) scale(${n2(s)})">
    <g class="flower-bloom" style="--delay:${n2(delay)}s;--bud-rot:${n1(-8 + rng() * 12)}deg">
      <g class="${sway ? 'flower-sway' : ''}" style="${sway ? swayStyle : ''}">
        <circle r="9" fill="url(#flowerShadow)" opacity=".7"/>
        ${petals}
        <circle r="2.7" fill="${p.light}" stroke="${p.dark}" stroke-width=".6" stroke-opacity=".4"/>
      </g>
    </g>
  </g>`;
}

/* ── a closed rosebud ────────────────────────────────────── */
function rosebud(cfg) {
  const { x, y, s = 1, rot = 0, pal = 'blush', delay = 3.6 } = cfg;
  const p = PAL[pal];

  return `<g class="flower flower--rosebud" transform="translate(${n1(x)} ${n1(y)}) rotate(${n1(rot)}) scale(${n2(s)})">
    <g class="flower-bloom" style="--delay:${n2(delay)}s;--bud-rot:${n1(rot * 0.4)}deg">
      <path d="M0 30 C-2 14 -2 2 0 -8" fill="none" stroke="#7E9377" stroke-width="3" stroke-linecap="round" opacity=".85"/>
      <path d="M0 18 C-16 12 -23 -6 -13 -22 C-5 -34 7 -33 15 -21 C24 -6 16 12 0 18Z"
        fill="url(#petal-${pal})" stroke="${p.dark}" stroke-opacity=".3" stroke-width="1"/>
      <path d="M0 12 C-9 8 -13 -1 -8 -11 C-3 -19 3 -19 8 -11 C13 -1 9 8 0 12Z"
        fill="url(#under-${pal})" opacity=".75"/>
      <path d="M-2 13 C-7 2 -6 -8 -1 -14" fill="none" stroke="${p.light}" stroke-opacity=".5" stroke-width="1.4" stroke-linecap="round"/>
      <path d="M-1 16 C-9 20 -17 20 -23 15 M1 16 C9 20 17 20 23 15" fill="none" stroke="#7E9377" stroke-width="2" stroke-linecap="round" opacity=".9"/>
    </g>
  </g>`;
}

/* ── stems ───────────────────────────────────────────────── */
function stemLines(flowers, delay = 0.55) {
  return flowers.map((fl, i) => {
    if (fl.noStem) return '';
    const mx = (CX + fl.x) / 2 + ((i % 3) - 1) * 18;
    const my = (BIND_Y + fl.y) / 2 + 10;
    const dly = delay + (i % 8) * 0.035;
    return `<path class="stem-draw" style="--delay:${n2(dly)}s" pathLength="1"
      d="M${CX} ${BIND_Y} Q ${n1(mx)} ${n1(my)} ${n1(fl.x)} ${n1(fl.y)}"
      fill="none" stroke="url(#stemGrad)" stroke-width="${n2(3.4 + (i % 4) * 0.45)}" stroke-linecap="round" opacity=".9"/>`;
  }).join('');
}

/* ── the great paper fan ─────────────────────────────────── */
function wrapFan() {
  const cx = 500;
  const cy = 838;
  const rad = Math.PI / 180;
  const pt = (a, r) => `${n1(cx + Math.cos(a * rad) * r)} ${n1(cy + Math.sin(a * rad) * r)}`;
  const wedge = (a0, a1, r0, r1, reach0, reach1) => {
    const am = (a0 + a1) / 2;
    const rm = (reach0 + reach1) / 2 * 1.012;
    return `M ${pt(a0, r0)} L ${pt(a0, reach0)} Q ${pt(am, rm)} ${pt(a1, reach1)} L ${pt(a1, r1)} Z`;
  };

  const bStart = 186;
  const bEnd = 354;
  const bN = 9;
  const bStep = (bEnd - bStart) / bN;
  const bReach = [478, 462, 486, 470, 490, 474, 492, 466, 484, 470];
  let back = '';
  for (let i = 0; i < bN; i++) {
    const a0 = bStart + i * bStep;
    const a1 = a0 + bStep + 0.6;
    const fill = i % 3 === 1 ? 'paperA' : i % 3 === 2 ? 'paperC' : 'paperB';
    back += `<path d="${wedge(a0, a1, 52, 486, bReach[i], bReach[i + 1])}" fill="url(#${fill})"/>`;
    back += `<path d="M ${pt(a0, 68)} L ${pt(a0, bReach[i] - 14)}" fill="none" stroke="#8F435D" stroke-opacity=".07" stroke-width="1.2"/>`;
    back += `<path d="M ${pt(a0 + 0.7, 72)} L ${pt(a0 + 0.7, bReach[i] - 24)}" fill="none" stroke="#FFF8F5" stroke-opacity=".14" stroke-width="1.1"/>`;
  }

  const iStart = 202;
  const iEnd = 338;
  const iN = 5;
  const iStep = (iEnd - iStart) / iN;
  const iReach = [356, 344, 364, 348, 360, 342];
  let inner = '';
  for (let i = 0; i < iN; i++) {
    const a0 = iStart + i * iStep;
    inner += `<path d="${wedge(a0, a0 + iStep + 0.7, 46, 366, iReach[i], iReach[i + 1])}" fill="url(#paperInner)" opacity=".95"/>`;
    inner += `<path d="M ${pt(a0, 62)} L ${pt(a0, iReach[i] - 16)}" fill="none" stroke="#B98A99" stroke-opacity=".12" stroke-width="1"/>`;
  }

  return `
    <g class="wrap-blade__anim" style="--delay:.02s;--form-rot:0deg">
      <ellipse cx="500" cy="512" rx="486" ry="388" fill="url(#fanShade)" opacity=".55"/>
      ${back}
    </g>
    <g class="wrap-blade__anim" style="--delay:.16s;--form-rot:0deg">
      ${inner}
      <path d="M 500 840 C 438 812 384 778 342 742" fill="none" stroke="#B07F90" stroke-opacity=".18" stroke-width="1.4"/>
      <path d="M 500 840 C 562 812 616 778 658 742" fill="none" stroke="#B07F90" stroke-opacity=".18" stroke-width="1.4"/>
    </g>
  `;
}

/* ── the wrapping held in two hands ──────────────────────── */
function wrapFront() {
  return `
    <g aria-hidden="true">
      <ellipse cx="500" cy="930" rx="265" ry="92" fill="url(#groundShadow)" opacity=".62"/>

      <g class="wrap-blade__anim" style="--delay:.62s;--form-rot:2deg">
        <path d="M 474 842 C 402 782 316 702 246 598 C 306 626 376 692 440 758 C 483 800 506 828 500 856 Z"
          fill="url(#wrapPaleDeep)" stroke="#B87C8F" stroke-opacity=".2" stroke-width="1"/>
        <path d="M 500 856 C 566 766 654 690 754 598 C 694 630 616 706 536 788 C 512 814 504 838 500 856 Z"
          fill="url(#wrapPaleDeep)" stroke="#B87C8F" stroke-opacity=".2" stroke-width="1"/>
      </g>

      <g class="wrap-blade__anim" style="--delay:.78s;--form-rot:0deg">
        <path d="M 372 704 C 424 680 462 682 500 710 C 538 682 576 680 628 704
          C 608 812 566 930 528 1006 C 516 1028 484 1028 472 1006 C 434 930 392 812 372 704 Z"
          fill="url(#wrapCone)" stroke="#B97E90" stroke-opacity=".24" stroke-width="1"/>
        <path d="M 500 712 C 500 790 496 920 500 1016" fill="none" stroke="#B57489" stroke-opacity=".16" stroke-width="1.4"/>
        <path d="M 438 716 C 436 800 424 900 430 958" fill="none" stroke="#FFFFFF" stroke-opacity=".34" stroke-width="5" stroke-linecap="round"/>
        <path d="M 562 718 C 574 800 580 900 570 968" fill="none" stroke="#A96178" stroke-opacity=".09" stroke-width="10" stroke-linecap="round"/>
        <path d="M 410 726 C 456 704 544 704 590 726 C 576 774 560 830 546 870 C 518 852 482 852 454 870 C 440 830 424 774 410 726 Z"
          fill="#FFFFFF" opacity=".1"/>
      </g>

      <g class="wrap-blade__anim" style="--delay:.92s;--form-rot:-2deg">
        <path d="M 468 846 C 406 782 336 704 268 604 C 336 616 414 676 474 750 C 512 798 520 824 504 852 Z"
          fill="url(#wrapPale)" stroke="#C58A9C" stroke-opacity=".25" stroke-width="1"/>
        <path d="M 532 846 C 594 782 664 704 732 604 C 664 616 586 676 526 750 C 488 798 480 824 496 852 Z"
          fill="url(#wrapPale)" stroke="#C58A9C" stroke-opacity=".25" stroke-width="1"/>
        <path d="M 270 610 C 336 630 410 686 462 748" fill="none" stroke="#FFFFFF" stroke-opacity=".42" stroke-width="2.2" stroke-linecap="round"/>
        <path d="M 730 610 C 664 630 590 686 538 748" fill="none" stroke="#FFFFFF" stroke-opacity=".36" stroke-width="2" stroke-linecap="round"/>
      </g>

      <g class="wrap-blade__anim" style="--delay:1.02s;--form-rot:0deg">
        <path d="M 420 858 C 458 848 542 848 580 858 C 558 902 536 940 522 976 C 506 992 494 992 478 976 C 464 940 442 902 420 858 Z"
          fill="url(#wrapPaleDeep)" opacity=".72"/>
        <path d="M 438 866 C 470 860 530 860 562 866" fill="none" stroke="#FFFFFF" stroke-opacity=".3" stroke-width="1.5"/>
      </g>
    </g>`;
}

/* ── ribbon ──────────────────────────────────────────────── */
function ribbon() {
  return `<g class="ribbon" aria-hidden="true">
    <g class="ribbon__streamers" opacity=".8">
      <path d="M 470 826 C 430 850 400 880 386 914" fill="none" stroke="#D797AB" stroke-width="2.2" stroke-linecap="round" opacity=".55"/>
      <path d="M 530 826 C 570 852 598 884 612 920" fill="none" stroke="#E4A8BA" stroke-width="2" stroke-linecap="round" opacity=".5"/>
    </g>

    <g class="ribbon-sway">
      <g class="ribbon-tail__anim" style="--delay:6.05s">
        <path d="M 478 836 C 440 900 410 958 424 1016 C 434 1058 418 1092 396 1122 L 452 1138 C 486 1092 492 1046 478 1004 C 462 956 492 900 508 850 Z"
          fill="url(#satinTail)" stroke="#A65F77" stroke-opacity=".28" stroke-width="1"/>
        <path d="M 478 848 C 456 898 442 948 452 1000 C 459 1034 448 1080 424 1116"
          fill="none" stroke="#FFEDF0" stroke-opacity=".65" stroke-width="2.4" stroke-linecap="round"/>
        <path d="M 486 846 C 462 904 460 964 472 1010" fill="none" stroke="#A96078" stroke-opacity=".2" stroke-width="6" stroke-linecap="round"/>
        <path d="M 398 1124 L 452 1140" stroke="#F8DCE3" stroke-opacity=".55" stroke-width="1.4"/>
      </g>

      <g class="ribbon-tail__anim" style="--delay:6.16s">
        <path d="M 522 838 C 566 900 598 968 578 1030 C 562 1082 586 1116 608 1150 L 552 1162 C 518 1114 510 1064 530 1018 C 552 966 516 902 500 848 Z"
          fill="url(#satinTail)" stroke="#A65F77" stroke-opacity=".28" stroke-width="1"/>
        <path d="M 524 850 C 550 900 572 954 564 1006 C 557 1044 570 1090 594 1126"
          fill="none" stroke="#FFEDF0" stroke-opacity=".62" stroke-width="2.6" stroke-linecap="round"/>
        <path d="M 516 848 C 540 908 546 966 534 1014" fill="none" stroke="#9F566E" stroke-opacity=".16" stroke-width="7" stroke-linecap="round"/>
        <path d="M 608 1152 L 552 1164" stroke="#F8DCE3" stroke-opacity=".5" stroke-width="1.4"/>
      </g>
    </g>

    <g class="ribbon__bow">
      <g class="ribbon-anim" style="--delay:5.82s">
        <path d="M 502 822 C 470 772 400 744 348 766 C 312 782 312 824 352 846 C 392 870 462 856 506 832 Z"
          fill="url(#satin)" stroke="#AE657D" stroke-opacity=".3" stroke-width="1.2"/>
        <path d="M 498 822 C 530 772 600 744 652 766 C 688 782 688 824 648 846 C 608 870 538 856 494 832 Z"
          fill="url(#satin)" stroke="#AE657D" stroke-opacity=".3" stroke-width="1.2"/>
        <path d="M 492 826 C 462 796 414 780 376 790 C 404 806 446 822 490 838 Z" fill="#9E566F" opacity=".15"/>
        <path d="M 508 826 C 538 796 586 780 624 790 C 596 806 554 822 510 838 Z" fill="#9E566F" opacity=".13"/>
        <path d="M 350 770 C 392 764 452 786 490 818" fill="none" stroke="#FFEDF0" stroke-opacity=".55" stroke-width="2.2" stroke-linecap="round"/>
        <path d="M 650 770 C 608 764 548 786 510 818" fill="none" stroke="#FFEDF0" stroke-opacity=".5" stroke-width="2.2" stroke-linecap="round"/>
        <path d="M 402 833 C 444 842 474 838 496 830" fill="none" stroke="#A45C74" stroke-opacity=".22" stroke-width="1.2"/>
        <path d="M 598 833 C 556 842 526 838 504 830" fill="none" stroke="#A45C74" stroke-opacity=".22" stroke-width="1.2"/>

        <path d="M 476 801 C 492 793 508 793 524 801 C 533 818 529 846 516 858 C 506 867 494 867 484 858 C 471 846 467 818 476 801 Z"
          fill="url(#satinDeep)" stroke="#9E526A" stroke-opacity=".32" stroke-width="1"/>
        <path d="M 483 804 C 492 800 508 800 517 804 C 522 818 518 838 509 848 C 501 854 497 854 491 848 C 480 836 478 816 483 804 Z"
          fill="#F8D8E1" opacity=".22"/>
        <path d="M 480 817 C 492 813 508 813 520 817" fill="none" stroke="#A45C74" stroke-opacity=".25" stroke-width="1"/>
      </g>
    </g>
  </g>`;
}

function frontGreens() {
  return `
    ${leaf({ x: 400, y: 846, angle: -58, s: 0.5, delay: 5.1, dark: true, seed: 21, sway: false })}
    ${leaf({ x: 600, y: 846, angle: 58, s: 0.5, delay: 5.16, dark: true, seed: 22, sway: false })}
    ${leaf({ x: 500, y: 872, angle: 0, s: 0.44, delay: 5.2, dark: true, seed: 23, sway: false })}
    ${eucalyptus({ x: 320, y: 678, angle: -108, s: 0.7, flip: 1, delay: 5.05, seed: 30 })}
    ${eucalyptus({ x: 680, y: 678, angle: 108, s: 0.7, flip: -1, delay: 5.08, seed: 31 })}
    ${leaf({ x: 308, y: 618, angle: -100, s: 0.48, delay: 5.24, seed: 24, sway: false })}
    ${leaf({ x: 294, y: 600, angle: -132, s: 0.44, delay: 5.26, seed: 25, sway: false })}
    ${leaf({ x: 318, y: 588, angle: -74, s: 0.4, delay: 5.28, seed: 26, sway: false })}
    ${leaf({ x: 692, y: 618, angle: 100, s: 0.48, delay: 5.3, seed: 27, sway: false })}
    ${leaf({ x: 706, y: 600, angle: 132, s: 0.44, delay: 5.32, seed: 28, sway: false })}
    ${leaf({ x: 682, y: 588, angle: 74, s: 0.4, delay: 5.34, seed: 29, sway: false })}
    ${leaf({ x: 332, y: 698, angle: -128, s: 0.46, delay: 5.36, dark: true, seed: 32, sway: false })}
    ${leaf({ x: 312, y: 682, angle: -158, s: 0.4, delay: 5.38, seed: 33, sway: false })}
    ${leaf({ x: 668, y: 698, angle: 128, s: 0.46, delay: 5.4, dark: true, seed: 34, sway: false })}
    ${leaf({ x: 688, y: 682, angle: 158, s: 0.4, delay: 5.42, seed: 35, sway: false })}
    ${babysBreath({ x: 348, y: 748, rx: 24, ry: 15, delay: 5.5, seed: 77, tint: 1 })}
    ${babysBreath({ x: 652, y: 752, rx: 20, ry: 13, delay: 5.56, seed: 78 })}
  `;
}

/* ── putting the bouquet together ────────────────────────── */
function composition() {
  /* A florist's dome: a soft upper arc, one clean band of focal roses,
     two staggered rows below it, then a narrow tip. Centres are spaced
     so neighbouring blooms kiss rather than swallow each other. */
  /* The dome is built in three clear tiers. The outer rim is a ring of
     smaller roses that draws the silhouette; the five focal roses sit
     inside it on a staggered quincunx, with the grand central rose drawn
     last so its face stays completely clear. Everything below the focal
     ring is deliberately smaller, so the eye lands high and centre. */
  const backRoses = [
    { x: 500, y: 340, s: 0.92, rot: 3, pal: 'blush', sway: true, noStem: true },
    { x: 436, y: 350, s: 0.88, rot: -5, pal: 'ivory', noStem: true },
    { x: 564, y: 350, s: 0.88, rot: 5, pal: 'pink', noStem: true },
    { x: 382, y: 388, s: 0.84, rot: -8, pal: 'blush', noStem: true },
    { x: 618, y: 388, s: 0.84, rot: 7, pal: 'ivory', noStem: true },
    { x: 326, y: 448, s: 0.84, rot: -5, pal: 'pink' },
    { x: 674, y: 448, s: 0.84, rot: 6, pal: 'blush' },
    { x: 348, y: 516, s: 0.8, rot: 7, pal: 'ivory', sway: true },
    { x: 652, y: 516, s: 0.8, rot: -6, pal: 'pink' }
  ];

  const midRoses = [
    /* inner ring: side blooms close the circle around the focal rose */
    { x: 352, y: 500, s: 0.9, rot: -6, pal: 'blush' },
    { x: 648, y: 498, s: 0.9, rot: 6, pal: 'pink' },
    { x: 398, y: 438, s: 1.04, rot: -7, pal: 'pink', hero: true, noStem: true },
    { x: 602, y: 440, s: 1.02, rot: 7, pal: 'ivory', hero: true, noStem: true },
    { x: 412, y: 584, s: 1, rot: 5, pal: 'blush' },
    { x: 588, y: 584, s: 1, rot: -5, pal: 'pink' },
    /* the focal rose lands last, on top of its neighbours */
    { x: 500, y: 492, s: 1.24, rot: 2, pal: 'rose', hero: true }
  ];

  const lowerRoses = [
    { x: 338, y: 646, s: 0.72, rot: 8, pal: 'blush', sway: true },
    { x: 662, y: 642, s: 0.72, rot: -8, pal: 'pink' },
    /* one small bloom carries the eye from the focal rose down to the hydrangea */
    { x: 500, y: 606, s: 0.72, rot: -2, pal: 'ivory' }
  ];

  const frontRoses = [
    { x: 448, y: 726, s: 0.66, rot: -7, pal: 'blush', sway: true },
    { x: 552, y: 724, s: 0.66, rot: 8, pal: 'pink' }
  ];

  const hydraBack = [
    { x: 292, y: 620, s: 0.4, rot: -8, seed: 12, sway: true },
    { x: 708, y: 616, s: 0.4, rot: 7, seed: 13 }
  ];

  const hydraMain = { x: 500, y: 672, s: 0.8, rot: 2, seed: 11, sway: true };

  const carnations = [
    { x: 334, y: 610, s: 0.52, rot: 10, pal: 'carnation', sway: true },
    { x: 666, y: 606, s: 0.52, rot: -9, pal: 'carnationCream' },
    { x: 500, y: 772, s: 0.46, rot: 6, pal: 'carnation' }
  ];

  const tinies = [
    { x: 440, y: 318, s: 0.75, rot: 12, pal: 'blush' },
    { x: 560, y: 318, s: 0.75, rot: -6, pal: 'carnation' },
    { x: 372, y: 700, s: 0.68, rot: 10, pal: 'blush' },
    { x: 628, y: 696, s: 0.68, rot: -8, pal: 'pink' }
  ];

  /* most baby's breath lives behind the blooms, so the flowers keep
     clean faces and the sprays soften the silhouette */
  const gypsophilaBack = [
    { x: 266, y: 502, rx: 32, ry: 24, seed: 31 },
    { x: 734, y: 502, rx: 32, ry: 24, seed: 32 },
    { x: 300, y: 668, rx: 34, ry: 22, seed: 33, tint: 1 },
    { x: 700, y: 668, rx: 34, ry: 22, seed: 34 },
    { x: 400, y: 318, rx: 26, ry: 20, seed: 35 },
    { x: 600, y: 318, rx: 26, ry: 20, seed: 36 }
  ];

  const gypsophilaFront = [
    { x: 500, y: 292, rx: 22, ry: 16, seed: 37, tint: 1 },
    { x: 252, y: 568, rx: 24, ry: 18, seed: 38 },
    { x: 748, y: 568, rx: 24, ry: 18, seed: 39 },
    { x: 345, y: 742, rx: 24, ry: 15, seed: 40, tint: 1 },
    { x: 652, y: 748, rx: 21, ry: 13, seed: 41 }
  ];

  const anchors = [
    ...backRoses, ...midRoses, ...lowerRoses, ...frontRoses,
    ...hydraBack, hydraMain, ...carnations
  ];

  const rosebuds = [
    { x: 345, y: 332, s: 0.5, rot: -24, pal: 'rose', delay: 3.72 },
    { x: 655, y: 332, s: 0.5, rot: 22, pal: 'blush', delay: 3.82 },
    { x: 278, y: 652, s: 0.42, rot: -30, pal: 'pink', delay: 4.08 }
  ];

  const back = backRoses.map((c, i) => rose({ ...c, delay: 1.58 + i * 0.075 })).join('');
  const mid = midRoses.map((c, i) => rose({ ...c, delay: 2.28 + i * 0.062 })).join('');
  const lower = lowerRoses.map((c, i) => rose({ ...c, delay: 3.02 + i * 0.072 })).join('');
  const front = frontRoses.map((c, i) => rose({ ...c, delay: 3.9 + i * 0.08 })).join('');
  const hydraBackMarkup = hydraBack.map((c, i) => hydrangea({ ...c, delay: 2.78 + i * 0.07 })).join('');
  const rosebudMarkup = rosebuds.map((c) => rosebud(c)).join('');
  const hydraMainMarkup = hydrangea({ ...hydraMain, delay: 3.62 });
  const carnationMarkup = carnations.map((c, i) => carnation({ ...c, delay: 4.2 + i * 0.065 })).join('');
  const tinyMarkup = tinies.map((c, i) => tinyFlower({ ...c, delay: 4.72 + i * 0.045, seed: 50 + i })).join('');
  const gypsBackMarkup = gypsophilaBack.map((c, i) => babysBreath({ ...c, delay: 1.12 + i * 0.045 })).join('');
  const gypsFrontMarkup = gypsophilaFront.map((c, i) => babysBreath({ ...c, delay: 5.0 + i * 0.055 })).join('');

  const leaves = [
    { x: 280, y: 486, angle: -55, s: 0.78, delay: 1.18, seed: 61 },
    { x: 720, y: 486, angle: 55, s: 0.78, delay: 1.22, seed: 62 },
    { x: 268, y: 566, angle: -80, s: 0.8, delay: 1.26, dark: true, seed: 63 },
    { x: 732, y: 566, angle: 80, s: 0.8, delay: 1.3, dark: true, seed: 64 },
    { x: 330, y: 420, angle: -105, s: 0.62, delay: 1.34, seed: 65 },
    { x: 670, y: 420, angle: 105, s: 0.62, delay: 1.38, seed: 66 },
    { x: 346, y: 384, angle: -125, s: 0.55, delay: 1.42, seed: 67 },
    { x: 654, y: 384, angle: 125, s: 0.55, delay: 1.46, seed: 68 },
    { x: 500, y: 388, angle: 0, s: 0.5, delay: 1.5, seed: 69 }
  ].map(leaf).join('');

  const eucalyptusMarkup = [
    { x: 372, y: 610, angle: -58, s: 1.02, flip: 1, delay: 0.92, seed: 71 },
    { x: 628, y: 610, angle: 58, s: 1.02, flip: -1, delay: 0.98, seed: 72 },
    { x: 326, y: 500, angle: -30, s: 0.9, flip: 1, delay: 1.04, seed: 73 },
    { x: 674, y: 500, angle: 30, s: 0.9, flip: -1, delay: 1.1, seed: 74 },
    { x: 500, y: 664, angle: 6, s: 0.62, flip: 1, delay: 1.16, seed: 75 }
  ].map(eucalyptus).join('');

  const twigs = [
    twig({ x: 452, y: 606, height: 320, lean: -96, delay: 0.8, seed: 81 }),
    twig({ x: 548, y: 606, height: 320, lean: 96, delay: 0.86, seed: 82 }),
    twig({ x: 500, y: 596, height: 300, lean: 6, delay: 0.92, seed: 83 })
  ].join('');

  return `
    <g class="layer-wrap-back">${wrapFan()}</g>
    <g class="layer-greens-back">${twigs}${eucalyptusMarkup}</g>
    <g class="layer-stems">${stemLines(anchors)}</g>
    <g class="layer-leaves">${leaves}</g>
    <g class="layer-wrap-front">${wrapFront()}</g>
    <g class="layer-flower-shadow"><ellipse cx="500" cy="540" rx="292" ry="236" fill="url(#flowerShadow)" opacity=".5"/></g>
    <g class="layer-fillers-back">${gypsBackMarkup}</g>
    <g class="layer-flowers-back">${back}</g>
    <g class="layer-flowers-mid">${mid}${hydraBackMarkup}${rosebudMarkup}</g>
    <g class="layer-flowers-lower">${lower}</g>
    <g class="layer-flowers-front">${hydraMainMarkup}${front}${carnationMarkup}</g>
    <g class="layer-fillers">${tinyMarkup}${gypsFrontMarkup}</g>
    <g class="layer-greens-front">${frontGreens()}</g>
    <g class="layer-ribbon">${ribbon()}</g>
  `;
}

export function buildSparkleSpots() {
  // Desktop: 6 sparkles
  // Mobile: 3 sparkles for better performance
  const isMobile = typeof window !== 'undefined' && 
    (window.matchMedia('(max-width: 768px)').matches ||
     window.matchMedia('(hover: none) and (pointer: coarse)').matches);
  
  if (isMobile) {
    // Mobile: 3 strategically placed sparkles
    const spots = [
      [20, 22, 0.8, 6.0, 0.5],   // top left
      [80, 20, 0.75, 6.5, 2.0],  // top right
      [50, 70, 0.7, 5.8, 1.2]    // bottom center
    ];
    return spots.map(([left, top, scale, dur, delay]) =>
      `<span class="sparkle" style="left:${left}%;top:${top}%;--s:${scale};--dur:${dur}s;--delay:${delay}s"></span>`
    ).join('');
  }
  
  // Desktop: 6 sparkles
  const spots = [
    [18, 20, 0.9, 5.8, 0.3],   // top left near roses
    [82, 18, 0.85, 6.2, 1.8],  // top right
    [12, 48, 0.75, 5.5, 2.5],  // mid left
    [88, 52, 0.8, 6.0, 0.9],   // mid right
    [35, 76, 0.7, 5.3, 1.5],   // lower left
    [72, 78, 0.75, 5.9, 3.2]   // lower right
  ];
  return spots.map(([left, top, scale, dur, delay]) =>
    `<span class="sparkle" style="left:${left}%;top:${top}%;--s:${scale};--dur:${dur}s;--delay:${delay}s"></span>`
  ).join('');
}

/* ── the finished bouquet ───────────────────────────────── */
export function buildBouquetSVG() {
  return `<svg class="bouquet-svg" viewBox="0 0 1000 1200" role="img"
    aria-label="A hand-illustrated bouquet of pink and ivory roses, ruffled carnations, white hydrangea, baby's breath and sage greenery, wrapped in layers of blush paper and tied with a long pink satin ribbon.">
    ${buildDefs()}
    <g class="bouquet-root">${composition()}</g>
  </svg>`;
}

