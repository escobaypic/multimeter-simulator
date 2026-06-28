/* ==========================================================================
   quiz.js — practice.html quiz engine
   ========================================================================== */

const Quiz = (() => {
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  async function loadQuestions() {
    try {
      const res = await fetch(Components.dataPath('questions.json'));
      const data = await res.json();
      return data.questions;
    } catch (e) {
      console.error('Gagal memuat questions.json', e);
      return [];
    }
  }

  function init(root, { count = 10 } = {}) {
    const els = {
      progress: root.querySelector('#quizProgress'),
      card: root.querySelector('#quizCard'),
      score: root.querySelector('#quizScore'),
      gaugeSvg: root.querySelector('#scoreGauge'),
      restartBtn: root.querySelector('#quizRestart'),
      resultPanel: root.querySelector('#quizResult'),
      playPanel: root.querySelector('#quizPlay')
    };

    let pool = [];
    let idx = 0;
    let score = 0;
    let answered = false;

    async function start() {
      const all = await loadQuestions();
      pool = shuffle(all).slice(0, Math.min(count, all.length));
      idx = 0; score = 0; answered = false;
      els.resultPanel.hidden = true;
      els.playPanel.hidden = false;
      renderQuestion();
    }

    function renderProgress() {
      els.progress.innerHTML = '';
      pool.forEach((q, i) => {
        const dot = document.createElement('span');
        if (i < idx) dot.classList.add('done');
        els.progress.appendChild(dot);
      });
      els.score.textContent = `Skor: ${score}/${pool.length}`;
    }

    function renderQuestion() {
      answered = false;
      renderProgress();
      const q = pool[idx];
      if (!q) return finish();

      els.card.innerHTML = '';
      const cat = document.createElement('span');
      cat.className = 'kicker';
      cat.textContent = q.category;
      els.card.appendChild(cat);

      const h = document.createElement('h3');
      h.style.textTransform = 'none';
      h.style.fontFamily = 'var(--font-body)';
      h.style.fontWeight = '600';
      h.style.fontSize = '17px';
      h.style.margin = '6px 0 16px';
      h.textContent = q.question;
      els.card.appendChild(h);

      const answerArea = document.createElement('div');
      answerArea.style.display = 'flex';
      answerArea.style.flexDirection = 'column';
      answerArea.style.gap = '10px';

      if (q.type === 'mcq') {
        q.choices.forEach((choice, i) => {
          const btn = document.createElement('button');
          btn.className = 'btn ghost';
          btn.style.justifyContent = 'flex-start';
          btn.style.textAlign = 'left';
          btn.textContent = choice;
          btn.addEventListener('click', () => submitMcq(i, btn, answerArea, q));
          answerArea.appendChild(btn);
        });
      } else if (q.type === 'calc') {
        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.gap = '10px';
        const input = document.createElement('input');
        input.type = 'number';
        input.placeholder = 'Jawaban (Ohm)';
        input.style.flex = '1';
        input.style.padding = '10px 12px';
        input.style.borderRadius = '8px';
        input.style.border = '1px solid var(--hairline)';
        input.style.background = 'var(--panel-raised)';
        input.style.color = 'var(--ink)';
        input.style.fontFamily = 'var(--font-mono)';
        const submit = document.createElement('button');
        submit.className = 'btn primary';
        submit.textContent = 'Jawab';
        submit.addEventListener('click', () => submitCalc(parseFloat(input.value), answerArea, q));
        row.appendChild(input); row.appendChild(submit);
        answerArea.appendChild(row);
      }

      els.card.appendChild(answerArea);
    }

    function lockAndExplain(container, correct, q) {
      const banner = document.createElement('div');
      banner.className = 'banner ' + (correct ? 'ok' : 'bad');
      banner.style.marginTop = '12px';
      banner.textContent = (correct ? '\u2713 Benar. ' : '\u2717 Kurang tepat. ') + q.explanation;
      container.appendChild(banner);

      const next = document.createElement('button');
      next.className = 'btn primary';
      next.style.marginTop = '12px';
      next.textContent = idx < pool.length - 1 ? 'Soal Berikutnya \u2192' : 'Lihat Hasil \u2192';
      next.addEventListener('click', () => { idx++; renderQuestion(); });
      container.appendChild(next);

      Lab.play(correct ? 'beep' : 'click');
    }

    function submitMcq(i, btn, container, q) {
      if (answered) return;
      answered = true;
      const correct = i === q.answerIndex;
      if (correct) score++;
      [...container.children].forEach((c, ci) => {
        c.disabled = true;
        if (ci === q.answerIndex) c.style.borderColor = 'var(--trace-green)';
        if (ci === i && !correct) c.style.borderColor = 'var(--probe-red)';
      });
      lockAndExplain(container, correct, q);
    }

    function submitCalc(value, container, q) {
      if (answered) return;
      answered = true;
      const correct = Math.abs(value - q.answer) <= (q.tolerance || 0);
      if (correct) score++;
      [...container.querySelectorAll('input,button')].forEach(c => c.disabled = true);
      lockAndExplain(container, correct, q);
    }

    function finish() {
      els.playPanel.hidden = true;
      els.resultPanel.hidden = false;
      const pct = pool.length ? score / pool.length : 0;
      const summary = els.resultPanel.querySelector('#resultSummary');
      summary.textContent = `${score} dari ${pool.length} benar (${Math.round(pct * 100)}%)`;
      const angle = LCD.angleForVoltRaw(pct * 50);
      LCD.renderGauge(els.gaugeSvg, angle);
    }

    els.restartBtn.addEventListener('click', start);
    start();
  }

  return { init };
})();