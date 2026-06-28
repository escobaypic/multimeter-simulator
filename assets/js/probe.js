/* ==========================================================================
   probe.js — probe & port connection handling
   ========================================================================== */

const ProbeSystem = (() => {

  /**
   * Creates a probe controller bound to a set of port elements.
   * ports: { portId: { el, hole, accepts: ['red'|'black'|'both'] } }
   */
  function create({ container, ports, onChange }) {
    const state = { red: null, black: null, selected: 'red' };

    const selectorBtns = container.querySelectorAll('.probe-btn');
    selectorBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        state.selected = btn.dataset.probe;
        selectorBtns.forEach(b => b.classList.toggle('selected', b === btn));
        highlightSuggestions();
      });
    });

    function highlightSuggestions() {
      Object.entries(ports).forEach(([id, p]) => {
        p.hole.classList.remove('suggest');
        if (p.accepts.includes(state.selected) || p.accepts.includes('both')) {
          p.hole.classList.add('suggest');
        }
      });
    }

    Object.entries(ports).forEach(([id, p]) => {
      p.hole.addEventListener('click', () => {
        plug(state.selected, id);
      });
    });

    function plug(probeColor, portId) {
      // unplug probe from any previous port
      Object.entries(ports).forEach(([pid, p]) => {
        p.hole.classList.remove('plugged-' + probeColor);
      });
      state[probeColor] = portId;
      ports[portId].hole.classList.add('plugged-' + probeColor);
      renderLabels();
      if (onChange) onChange(getState());
    }

    function renderLabels() {
      Object.values(ports).forEach(p => p.hole.title = '');
      if (state.red && ports[state.red]) ports[state.red].hole.title = 'Probe merah terpasang';
      if (state.black && ports[state.black]) ports[state.black].hole.title = 'Probe hitam terpasang';
    }

    function getState() { return { red: state.red, black: state.black }; }

    function reset() {
      state.red = null; state.black = null;
      Object.values(ports).forEach(p => {
        p.hole.classList.remove('plugged-red', 'plugged-black', 'suggest');
      });
    }

    highlightSuggestions();
    return { getState, reset, plug };
  }

  /** Validates that the probes are in the ports a given mode requires. */
  function validate(state, requiredRed, requiredBlack) {
    if (!state.red || !state.black) {
      return { ok: false, message: 'Pasangkan kedua probe (merah & hitam) ke port yang sesuai terlebih dahulu.' };
    }
    if (state.red !== requiredRed) {
      return { ok: false, message: `Probe merah seharusnya di port "${requiredRed}", bukan "${state.red}".` };
    }
    if (state.black !== requiredBlack) {
      return { ok: false, message: `Probe hitam seharusnya di port "${requiredBlack}" (Common).` };
    }
    return { ok: true, message: 'Probe terpasang dengan benar.' };
  }

  return { create, validate };
})();