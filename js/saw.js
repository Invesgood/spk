function calculateSAW() {
  collectStep(4);
  const nA = state.nA, nC = state.nC;
  const X = state.matrix;
  const C = state.criteria;

  const wSum = C.reduce((s, c) => s + c.weight, 0);
  const W = C.map(c => c.weight / wSum);

  const R = Array.from({ length: nA }, () => Array(nC).fill(0));
  const colMax = Array(nC).fill(0);
  const colMin = Array(nC).fill(Infinity);

  for (let j = 0; j < nC; j++) {
    for (let i = 0; i < nA; i++) {
      if (X[i][j] > colMax[j]) colMax[j] = X[i][j];
      if (X[i][j] < colMin[j] && X[i][j] > 0) colMin[j] = X[i][j];
    }
  }

  for (let i = 0; i < nA; i++) {
    for (let j = 0; j < nC; j++) {
      if (C[j].type === 'benefit') {
        R[i][j] = colMax[j] ? X[i][j] / colMax[j] : 0;
      } else {
        R[i][j] = X[i][j] ? colMin[j] / X[i][j] : 0;
      }
    }
  }

  const V = R.map(row => row.reduce((s, v, j) => s + W[j] * v, 0));

  const ranked = V.map((v, i) => ({ idx: i, vi: v })).sort((a, b) => b.vi - a.vi);
  const rankOf = Array(nA);
  ranked.forEach((r, pos) => { rankOf[r.idx] = pos + 1; });

  renderCards(V, rankOf, false);
  renderResultTableSAW(X, R, V, rankOf, W);
  renderCalcStepsSAW(R, V, W, colMax, colMin);

  goStep(5);
  showToast('Perhitungan SAW selesai!');
}

function renderResultTableSAW(X, R, V, rankOf, W) {
  const el = document.getElementById('resultTable');
  const topIdx = V.indexOf(Math.max(...V));

  let html = `<thead><tr>
    <th>Alternatif</th>
    ${state.criteria.map((c, j) => `<th>${c.name || 'C'+(j+1)}<br><small style="font-weight:400">w=${W[j].toFixed(3)}</small></th>`).join('')}
    <th>V</th><th>Rank</th>
  </tr></thead><tbody>`;

  for (let i = 0; i < state.nA; i++) {
    const cls = i === topIdx ? 'winner-row' : '';
    html += `<tr class="${cls}">
      <td style="font-weight:700;text-align:left">${state.alternatives[i]?.name || 'A'+(i+1)}</td>
      ${X[i].map(v => `<td>${v}</td>`).join('')}
      <td style="font-weight:900">${V[i].toFixed(4)}</td>
      <td style="font-weight:900">${rankOf[i]}</td>
    </tr>`;
  }
  html += `</tbody>`;
  el.innerHTML = html;
}

function renderCalcStepsSAW(R, V, W, colMax, colMin) {
  const el = document.getElementById('calcSteps');
  el.innerHTML = `
    <div class="matrix-section">
      <div class="card">
        <div class="card-title">Langkah 1 — Bobot Ternormalisasi (W)</div>
        <h4>wj = bobot kriteria / Σ bobot</h4>
        <div class="matrix-wrap" style="margin-top:12px">
          <table>
            <thead><tr><th>Kriteria</th><th>Bobot Awal</th><th>Bobot Normal</th><th>Persentase</th></tr></thead>
            <tbody>
              ${state.criteria.map((c, j) => `
                <tr>
                  <td style="text-align:left;font-weight:700">${c.name || 'C'+(j+1)}</td>
                  <td>${c.weight}</td>
                  <td>${W[j].toFixed(4)}</td>
                  <td style="font-weight:700">${(W[j]*100).toFixed(2)}%</td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="matrix-section">
      <div class="card">
        <div class="card-title">Langkah 2 — Matriks Ternormalisasi (R)</div>
        <h4>Benefit: rij = xij / max(xj) &nbsp;·&nbsp; Cost: rij = min(xj) / xij</h4>
        <div class="matrix-wrap" style="margin-top:12px">
          <table>
            <thead><tr><th>Alt</th>${state.criteria.map((c, j) => `<th>${c.name || 'C'+(j+1)}</th>`).join('')}</tr></thead>
            <tbody>
              ${R.map((row, i) => `
                <tr>
                  <td style="text-align:left;font-weight:700">${state.alternatives[i]?.name || 'A'+(i+1)}</td>
                  ${row.map(v => `<td>${v.toFixed(4)}</td>`).join('')}
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="matrix-section">
      <div class="card">
        <div class="card-title">Langkah 3 — Nilai Preferensi (V)</div>
        <h4>Vi = Σ (wj × rij)</h4>
        <div class="matrix-wrap" style="margin-top:12px">
          <table>
            <thead><tr><th>Alternatif</th><th>Perhitungan</th><th>Nilai V</th></tr></thead>
            <tbody>
              ${V.map((v, i) => {
                const terms = R[i].map((r, j) => `${W[j].toFixed(3)}×${r.toFixed(3)}`).join(' + ');
                return `
                  <tr>
                    <td style="text-align:left;font-weight:700">${state.alternatives[i]?.name || 'A'+(i+1)}</td>
                    <td style="text-align:left;font-size:11px">${terms}</td>
                    <td style="font-weight:900">${v.toFixed(4)}</td>
                  </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}
