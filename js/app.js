const STEP_TITLES = ['DECISION SYSTEM', 'KONFIGURASI', 'KRITERIA', 'ALTERNATIF', 'INPUT NILAI', 'HASIL RANKING'];

function updateMethodUI() {
  const m = METHODS[state.method];
  if (!m) return;

  document.getElementById('brandTitle').textContent = m.name;
  document.getElementById('logoText').textContent = m.name.substring(0, 3);
  document.getElementById('methodBadge').textContent = m.name;
  document.getElementById('methodFull').innerHTML = m.full.replace(' ', '<br>');

  document.querySelectorAll('[data-method-label]').forEach(el => {
    el.textContent = m.name;
  });
}

function goStep(n) {
  if (n > 1) collectStep(currentStep);

  document.querySelectorAll('.section').forEach((s,i) => {
    s.classList.toggle('visible', i+1 === n);
  });
  document.querySelectorAll('.step-card').forEach((s,i) => {
    s.classList.remove('active','done');
    if (i+1 === n) s.classList.add('active');
    if (i+1 < n) s.classList.add('done');
  });

  if (n === 2) buildCriteriaForm();
  if (n === 3) buildAltForm();
  if (n === 4) buildMatrixForm();

  currentStep = n;
  updateTopBar();
  window.scrollTo({top:0, behavior:'smooth'});
}

function updateTopBar() {
  const title = document.getElementById('pageTitle');
  if (title) title.textContent = STEP_TITLES[currentStep] || STEP_TITLES[0];

  const stepEl = document.getElementById('statStep');
  if (stepEl) stepEl.textContent = currentStep;

  const cEl = document.getElementById('statCriteria');
  const aEl = document.getElementById('statAlt');
  if (cEl) cEl.textContent = state.criteria.length || state.nC || 0;
  if (aEl) aEl.textContent = state.alternatives.length || state.nA || 0;
}

function collectStep(n) {
  if (n === 1) {
    state.name = document.getElementById('systemName').value || 'SPK';
    state.desc = document.getElementById('systemDesc').value;
    state.nC = parseInt(document.getElementById('numCriteria').value) || 4;
    state.nA = parseInt(document.getElementById('numAlternatives').value) || 4;
  }
  if (n === 2) {
    state.criteria = [];
    for (let i = 0; i < state.nC; i++) {
      state.criteria.push({
        name: document.getElementById(`cname_${i}`)?.value || `C${i+1}`,
        weight: parseFloat(document.getElementById(`cweight_${i}`)?.value) || 1,
        type: document.getElementById(`ctype_${i}`)?.value || 'benefit'
      });
    }
  }
  if (n === 3) {
    state.alternatives = [];
    for (let i = 0; i < state.nA; i++) {
      state.alternatives.push({
        name: document.getElementById(`aname_${i}`)?.value || `A${i+1}`
      });
    }
  }
  if (n === 4) {
    state.matrix = [];
    for (let i = 0; i < state.nA; i++) {
      state.matrix[i] = [];
      for (let j = 0; j < state.nC; j++) {
        state.matrix[i][j] = parseFloat(document.getElementById(`m_${i}_${j}`)?.value) || 0;
      }
    }
  }
}

function calculate() {
  calculateSAW();
}

window.onload = () => {
  updateMethodUI();
  goStep(1);
};
