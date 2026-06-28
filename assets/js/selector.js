/* ==========================================================================
   selector.js — rotary selector switch (shared by digital & analog devices)
   ========================================================================== */

const Selector = (() => {

  /**
   * positions: [{ value, label }] laid out clockwise starting at top.
   * spanDeg: total arc the positions occupy (default 280deg, like a real meter).
   */
  function create(root, { positions, initial, onChange, spanDeg = 280 }) {
    const dial = root.querySelector('.selector-dial');
    const pointer = dial.querySelector('.selector-pointer');
    const posLayer = dial.querySelector('.selector-positions');
    const currentLabel = root.querySelector('.selector-current b');

    const startDeg = -spanDeg / 2;
    const stepDeg = positions.length > 1 ? spanDeg / (positions.length - 1) : 0;
    const radius = 66;

    let value = initial !== undefined ? initial : positions[0].value;

    posLayer.innerHTML = '';
    const buttons = positions.map((pos, i) => {
      const angleDeg = startDeg + stepDeg * i;
      const rad = (angleDeg - 90) * Math.PI / 180;
      const x = 84 + radius * Math.cos(rad);
      const y = 84 + radius * Math.sin(rad);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = pos.label;
      btn.style.left = x + 'px';
      btn.style.top = y + 'px';
      btn.dataset.value = pos.value;
      btn.setAttribute('aria-label', 'Pilih mode ' + pos.label);
      btn.addEventListener('click', () => setValue(pos.value));
      posLayer.appendChild(btn);
      return { btn, pos, angleDeg };
    });

    function setValue(v, silent) {
      const found = buttons.find(b => String(b.pos.value) === String(v));
      if (!found) return;
      value = found.pos.value;
      pointer.style.transform = `translate(-50%,-100%) rotate(${found.angleDeg}deg)`;
      buttons.forEach(b => b.btn.classList.toggle('active', b === found));
      if (currentLabel) currentLabel.textContent = found.pos.label;
      if (!silent && onChange) onChange(value);
    }

    // keyboard support: left/right arrow cycles through positions
    dial.setAttribute('tabindex', '0');
    dial.setAttribute('role', 'radiogroup');
    dial.addEventListener('keydown', (e) => {
      const idx = buttons.findIndex(b => String(b.pos.value) === String(value));
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        setValue(buttons[Math.min(idx + 1, buttons.length - 1)].pos.value);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        setValue(buttons[Math.max(idx - 1, 0)].pos.value);
      }
    });

    setValue(value, true);
    return { setValue, getValue: () => value };
  }

  return { create };
})();