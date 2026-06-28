/* ==========================================================================
   multimeter.js — core measurement engine
   A pure function: given the device state, returns what the meter should show.
   Used identically by digital-multimeter.html and analog-multimeter.html so
   that both devices stay procedurally consistent with one another.
   ========================================================================== */

const Multimeter = (() => {

  const REQUIRED_PORTS = { red: 'VOM', black: 'COM' };

  function portsOk(probes) {
    return probes.red === REQUIRED_PORTS.red && probes.black === REQUIRED_PORTS.black;
  }

  function portMessage(probes) {
    if (!probes.red || !probes.black) return 'Pasangkan probe merah ke port VΩmA dan probe hitam ke port COM.';
    if (probes.red !== REQUIRED_PORTS.red) return 'Probe merah seharusnya di port VΩmA.';
    if (probes.black !== REQUIRED_PORTS.black) return 'Probe hitam seharusnya di port COM.';
    return '';
  }

  function fmt(n, decimals = 1) {
    return n.toLocaleString('id-ID', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  }

  /**
   * state = {
   *   mode, deviceType:'digital'|'analog', scenario,
   *   probes:{red,black}, connected, switchOn, reversed,
   *   zeroCalibrated, ohmMultiplier, ohmCalibratedSet:Set,
   *   dcvRange, acvRange, dcaRange
   * }
   */
  function measure(state) {
    const { mode, deviceType, scenario } = state;
    const isAnalog = deviceType === 'analog';

    if (mode === 'OFF' || !mode) {
      return { status: 'off', message: 'Multimeter dalam keadaan OFF. Putar selektor untuk memulai.' };
    }

    if (!portsOk(state.probes)) {
      return { status: 'error', message: portMessage(state.probes) };
    }

    if (mode === 'CONT') return measureContinuity(state);
    if (mode === 'OHM') return measureOhm(state, isAnalog);
    if (mode === 'DCV') return measureVoltage(state, isAnalog, false);
    if (mode === 'ACV') return measureVoltage(state, isAnalog, true);
    if (mode === 'DCA') return measureCurrent(state, isAnalog);

    return { status: 'error', message: 'Mode tidak dikenal.' };
  }

  function measureVoltage(state, isAnalog, isAC) {
    const { scenario, connected, reversed, zeroCalibrated } = state;
    const verb = isAC ? 'Masukkan kedua probe ke lubang stop kontak.' : 'Tempelkan probe ke kutub sumber tegangan (paralel).';
    if (!connected) return { status: 'warn', message: verb };
    if (isAnalog && !zeroCalibrated) {
      return { status: 'warn', message: 'Kalibrasi jarum ke angka nol kiri dulu (putar sekrup kalibrasi memakai obeng).' };
    }

    let trueValue = scenario.trueValue;
    let value = reversed && !isAC ? -trueValue : trueValue;
    const unit = 'V';

    if (!isAnalog) {
      // Digital: auto-ranging, can legally show a negative reading if reversed.
      return {
        status: 'ok', value, unit, raw: value,
        message: reversed
          ? 'Nilai negatif: probe terpasang terbalik (merah di kutub negatif).'
          : `Terukur ${fmt(value, isAC ? 1 : 2)} ${unit} ${isAC ? 'AC' : 'DC'}.`,
        ac: isAC
      };
    }

    // Analog: needle physically can't swing left of zero.
    const range = isAC ? state.acvRange : state.dcvRange;
    if (value < 0) {
      return {
        status: 'warn', value: 0, unit, raw: 0,
        message: 'Jarum mentok di kiri (tidak bisa minus) — probe terbalik. Tukar posisi probe merah & hitam.',
        angleDeg: -54
      };
    }
    if (value > range) {
      return {
        status: 'warn', value, unit, raw: 50,
        message: `Melebihi batas ukur ${range}${unit}! Pindahkan selektor ke batas ukur lebih tinggi.`,
        angleDeg: LCD.angleForVoltRaw(50)
      };
    }
    const raw = (value / range) * 50;
    return {
      status: 'ok', value, unit, raw,
      message: `Jarum di angka ${fmt(raw, 0)} pada skala 50 \u2192 ${fmt(raw,0)}/50 \u00D7 ${range} = ${fmt(value, isAC?1:2)} ${unit}.`,
      angleDeg: LCD.angleForVoltRaw(raw),
      ac: isAC
    };
  }

  function measureCurrent(state, isAnalog) {
    const { scenario, connected, zeroCalibrated } = state;
    if (!connected) return { status: 'warn', message: 'Hubungkan multimeter secara SERI dengan rangkaian (putus salah satu jalur, sisipkan meter).' };
    if (isAnalog && !zeroCalibrated) {
      return { status: 'warn', message: 'Kalibrasi jarum ke angka nol kiri dulu sebelum mengukur arus.' };
    }
    const value = scenario.trueValue; // mA
    const unit = 'mA';

    if (!isAnalog) {
      return { status: 'ok', value, unit, raw: value, message: `Arus terukur ${fmt(value, 1)} ${unit}.` };
    }
    const range = state.dcaRange; // in mA equivalent already (we store mA-scale ranges)
    if (value > range) {
      return {
        status: 'warn', value, unit, raw: 50,
        message: `Melebihi batas ukur ${range} mA! Naikkan batas ukur arus.`,
        angleDeg: LCD.angleForVoltRaw(50)
      };
    }
    const raw = (value / range) * 50;
    return {
      status: 'ok', value, unit, raw,
      message: `Jarum di angka ${fmt(raw,0)} pada skala 50 \u2192 ${fmt(raw,0)}/50 \u00D7 ${range} = ${fmt(value,1)} mA.`,
      angleDeg: LCD.angleForVoltRaw(raw)
    };
  }

  function measureOhm(state, isAnalog) {
    const { scenario, connected, ohmMultiplier, ohmCalibratedSet } = state;
    if (!connected) return { status: 'warn', message: 'Tempelkan kedua probe ke ujung kaki komponen yang diukur.' };

    const trueOhm = scenario.trueValue;

    if (!isAnalog) {
      const display = trueOhm >= 1000 ? `${fmt(trueOhm / 1000, 2)} k\u03A9` : `${fmt(trueOhm, 0)} \u03A9`;
      return { status: 'ok', value: trueOhm, unit: '\u03A9', raw: trueOhm, message: `Resistansi terukur ${display}.` };
    }

    const calibrated = ohmCalibratedSet.has(ohmMultiplier);
    let raw = trueOhm / ohmMultiplier;
    let note = '';
    if (!calibrated) {
      // Big simulated error when not zeroed for this multiplier
      raw = raw * (1 + (Math.random() * 0.6 + 0.4));
      note = ' (belum dikalibrasi — hasil tidak akurat!)';
    } else if (raw < 1 || raw > 200) {
      note = ' — coba ganti pengali agar jarum berada di tengah skala.';
    }
    const angleDeg = LCD.angleForOhmRaw(Math.min(raw, 600));
    const computed = raw * ohmMultiplier;
    return {
      status: calibrated ? 'ok' : 'warn',
      value: computed, unit: '\u03A9', raw,
      message: `Jarum \u2248 ${fmt(raw,0)} \u00D7 ${ohmMultiplier} = ${fmt(computed,0)} \u03A9${note}`,
      angleDeg
    };
  }

  function measureContinuity(state) {
    const { scenario, connected, switchOn } = state;
    if (!connected) return { status: 'warn', message: 'Tempelkan probe merah & hitam ke masing-masing terminal saklar.' };
    const closed = switchOn && !scenario.forceOpen;
    if (closed) {
      return {
        status: 'ok', value: 0, unit: '\u03A9', raw: 50, beep: true,
        message: 'Beeep! Jalur terhubung baik (kontinuitas OK).',
        angleDeg: LCD.angleForOhmRaw(0)
      };
    }
    return {
      status: 'warn', value: Infinity, unit: '\u03A9', raw: 0, beep: false,
      message: scenario.forceOpen ? 'Tidak ada suara — saklar ini rusak/putus.' : 'Tidak ada suara — saklar dalam posisi OFF (jalur terputus).',
      angleDeg: LCD.angleForOhmRaw(Infinity)
    };
  }

  return { measure, portsOk, REQUIRED_PORTS };
})();