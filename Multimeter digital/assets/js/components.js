/* ==========================================================================
   components.js — virtual circuit components & scenario generator
   Shared by digital-multimeter.html, analog-multimeter.html, practice.html
   ========================================================================== */

const Components = (() => {
  let data = null;

  async function load() {
    if (data) return data;
    try {
      const res = await fetch(dataPath('components.json'));
      data = await res.json();
    } catch (err) {
      console.error('Gagal memuat components.json, memakai data cadangan.', err);
      data = fallbackData();
    }
    return data;
  }

  // Resolve data/ path correctly whether page is at root or inside /simulator/
  function dataPath(file) {
    const inSimulator = location.pathname.includes('/simulator/');
    return (inSimulator ? '../data/' : 'data/') + file;
  }

  function fallbackData() {
    return {
      resistors: [{ id: 'R1', ohm: 220, bands: ['red', 'red', 'brown', 'gold'] }],
      batteries: [{ id: 'B1', label: 'Baterai 9V', volt: 9, internalDrop: 0.05 }],
      acSources: [{ id: 'AC1', label: 'Stop Kontak Rumah (PLN)', volt: 220, freq: 50, rangeHint: 250 }],
      leds: [{ id: 'LED1', label: 'LED Merah', forwardVoltage: 1.8 }],
      switches: [{ id: 'SW1', label: 'Saklar Lampu' }],
      dcCurrentLoads: [{ id: 'LOAD1', label: 'LED Indikator + R220', ma: 14.5 }],
      ohmMultipliers: [1, 10, 100, 1000],
      dcvRanges: [1, 2.5, 10, 50, 250, 1000],
      acvRanges: [10, 50, 250, 750],
      dcaRanges: [0.05, 2.5, 25, 250]
    };
  }

  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  function jitter(value, pct) {
    const delta = value * pct * (Math.random() * 2 - 1);
    return value + delta;
  }

  // Builds a fresh random "today's circuit" scenario for a given measurement mode
  async function scenario(mode) {
    const d = await load();
    switch (mode) {
      case 'DCV': {
        const b = pick(d.batteries);
        return { mode, component: b, trueValue: Math.max(0, b.volt - b.internalDrop), label: b.label, unit: 'V' };
      }
      case 'ACV': {
        const a = pick(d.acSources);
        return { mode, component: a, trueValue: jitter(a.volt, 0.01), label: a.label, unit: 'V', rangeHint: a.rangeHint };
      }
      case 'DCA': {
        const l = pick(d.dcCurrentLoads);
        return { mode, component: l, trueValue: jitter(l.ma, 0.03), label: l.label, unit: 'mA' };
      }
      case 'OHM': {
        const r = pick(d.resistors);
        return { mode, component: r, trueValue: r.ohm, label: 'Resistor ' + r.ohm + ' \u03A9', unit: '\u03A9', bands: r.bands };
      }
      case 'CONT': {
        const s = pick(d.switches);
        return { mode, component: s, label: s.label, forceOpen: !!s.forceOpen };
      }
      default:
        return null;
    }
  }

  function describeBands(bands) {
    return bands.map(b => b.charAt(0).toUpperCase() + b.slice(1)).join(' \u2013 ');
  }

  return { load, scenario, pick, dataPath, describeBands };
})();