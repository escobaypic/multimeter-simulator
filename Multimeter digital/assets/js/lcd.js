/* ==========================================================================
   lcd.js — display rendering: digital 7-segment LCD + analog needle gauge
   ========================================================================== */

const LCD = (() => {

  const DIGIT_SEGMENTS = {
    '0': ['a','b','c','d','e','f'],
    '1': ['b','c'],
    '2': ['a','b','g','e','d'],
    '3': ['a','b','g','c','d'],
    '4': ['f','g','b','c'],
    '5': ['a','f','g','c','d'],
    '6': ['a','f','g','e','d','c'],
    '7': ['a','b','c'],
    '8': ['a','b','c','d','e','f','g'],
    '9': ['a','b','c','d','f','g'],
    '-': ['g'],
    ' ': [],
    'L': ['f','e','d'],   // used for "OL" overload
    'O': ['a','b','c','d','e','f']
  };
  const H_SEGS = new Set(['a','g','d']);

  function buildDigit(ch, small) {
    const wrap = document.createElement('div');
    wrap.className = 'digit' + (small ? ' small' : '');
    const segs = DIGIT_SEGMENTS[ch] || [];
    'abcdefg'.split('').forEach(s => {
      const i = document.createElement('i');
      i.className = `seg ${H_SEGS.has(s) ? 'seg-h' : 'seg-v'} seg-${s}`;
      if (segs.includes(s)) i.classList.add('on');
      wrap.appendChild(i);
    });
    return wrap;
  }

  /** Renders a numeric/text string like "-225.4" or "OL" onto the LCD container. */
  function renderDigital(container, text, { small = false } = {}) {
    container.innerHTML = '';
    const signEl = document.createElement('span');
    signEl.className = 'lcd-sign';
    let rest = text;
    if (text.startsWith('-')) {
      signEl.classList.add('show');
      signEl.textContent = '-';
      rest = text.slice(1);
    } else {
      signEl.textContent = '-';
    }
    container.appendChild(signEl);

    let lastDigit = null;
    for (const ch of rest) {
      if (ch === '.') {
        const dot = document.createElement('span');
        dot.className = 'decimal-dot on';
        if (lastDigit) lastDigit.appendChild(dot);
        continue;
      }
      const d = buildDigit(ch.toUpperCase(), small);
      const dot = document.createElement('span');
      dot.className = 'decimal-dot';
      d.appendChild(dot);
      container.appendChild(d);
      lastDigit = d;
    }
  }

  /** Toggles small indicator labels, e.g. setIndicators(el, {DC:true, AC:false, OL:false}) */
  function setIndicators(container, flags) {
    container.querySelectorAll('[data-ind]').forEach(el => {
      el.classList.toggle('on', !!flags[el.dataset.ind]);
    });
  }

  // ---------------------------------------------------------------------
  // Analog needle gauge
  // ---------------------------------------------------------------------
  const NS = 'http://www.w3.org/2000/svg';
  const CX = 110, CY = 122, R_VOLT = 96, R_OHM = 80;

  function polar(angleDeg, r) {
    const rad = angleDeg * Math.PI / 180;
    return { x: CX + r * Math.sin(rad), y: CY - r * Math.cos(rad) };
  }
  function el(tag, attrs) {
    const e = document.createElementNS(NS, tag);
    Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v));
    return e;
  }

  const VOLT_MARKS = [0, 10, 20, 30, 40, 50];
  const OHM_MARKS = [0, 1, 2, 5, 10, 20, 50, 100, 200, 500, Infinity];
  const OHM_K = 20;

  function angleForVoltRaw(raw) { return -50 + (raw / 50) * 100; }
  function angleForOhmRaw(raw) {
    const pct = raw === Infinity ? 0 : OHM_K / (OHM_K + raw);
    return -50 + pct * 100;
  }

  function buildFace(svg) {
    svg.innerHTML = '';
    svg.setAttribute('viewBox', '0 0 220 150');

    // decorative mirror strip (parallax-error reminder, like real meters)
    const mirror = el('path', {
      class: 'gauge-mirror',
      d: describeArc(CY, R_VOLT + 10)
    });
    svg.appendChild(mirror);

    // main arc
    svg.appendChild(el('path', { class: 'gauge-arc', d: describeArc(CY, R_VOLT + 2) }));

    VOLT_MARKS.forEach(m => {
      const a = angleForVoltRaw(m);
      const p1 = polar(a, R_VOLT + 2), p2 = polar(a, R_VOLT - 8);
      svg.appendChild(el('line', { class: 'gauge-tick major', x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y }));
      const lp = polar(a, R_VOLT - 18);
      const t = el('text', { class: 'gauge-label volt', x: lp.x, y: lp.y });
      t.textContent = m;
      svg.appendChild(t);
    });

    OHM_MARKS.forEach(r => {
      const a = angleForOhmRaw(r);
      const p1 = polar(a, R_OHM + 2), p2 = polar(a, R_OHM - 7);
      svg.appendChild(el('line', { class: 'gauge-tick', x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y }));
      const lp = polar(a, R_OHM - 16);
      const t = el('text', { class: 'gauge-label ohm', x: lp.x, y: lp.y });
      t.textContent = r === Infinity ? '\u221E' : r;
      svg.appendChild(t);
    });

    const brand = el('text', { class: 'gauge-brand', x: CX, y: 36 });
    brand.textContent = 'AVO \u00B7 SMK LAB 360';
    svg.appendChild(brand);

    svg.appendChild(el('circle', { class: 'gauge-pivot', cx: CX, cy: CY, r: 5 }));

    const needle = el('line', {
      class: 'gauge-needle', id: 'gaugeNeedle',
      x1: CX, y1: CY, x2: CX, y2: CY - R_VOLT + 6,
      style: `--pivot-x:${CX}px; --pivot-y:${CY}px;`
    });
    svg.appendChild(needle);
  }

  function describeArc(cy, r) {
    const p1 = polar(-52, r), p2 = polar(52, r);
    return `M ${p1.x} ${p1.y} A ${r} ${r} 0 0 1 ${p2.x} ${p2.y}`;
  }

  /** angleDeg: -50..50 where the needle should rest. Builds the face if needed. */
  function renderGauge(svg, angleDeg) {
    if (!svg.querySelector('#gaugeNeedle')) buildFace(svg);
    const needle = svg.querySelector('#gaugeNeedle');
    const clamped = Math.max(-54, Math.min(54, angleDeg));
    needle.style.transform = `rotate(${clamped}deg)`;
  }

  return {
    renderDigital, setIndicators, renderGauge,
    angleForVoltRaw, angleForOhmRaw, OHM_K
  };
})();