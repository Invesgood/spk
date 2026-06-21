function buildCriteriaForm() {
  const el = document.getElementById('criteriaList');
  el.innerHTML = '';
  for (let i = 0; i < state.nC; i++) {
    const prev = state.criteria[i] || {};
    const div = document.createElement('div');

    div.className = 'criteria-item';
    div.innerHTML = `
      <div>
        <label>Nama Kriteria C${i+1}</label>
        <input type="text" id="cname_${i}" value="${prev.name || ''}" placeholder="cth: Harga"/>
      </div>
      <div>
        <label>Bobot</label>
        <input type="number" id="cweight_${i}" value="${prev.weight || 1}" min="1" max="10" step="0.1"/>
      </div>
      <div>
        <label>Tipe</label>
        <select id="ctype_${i}">
          <option value="benefit" ${(prev.type || 'benefit') === 'benefit' ? 'selected' : ''}>Benefit ↑</option>
          <option value="cost" ${prev.type === 'cost' ? 'selected' : ''}>Cost ↓</option>
        </select>
      </div>
      <div class="chip-wrap">
        <span id="chip_${i}" class="chip chip-benefit">B</span>
      </div>
    `;
    el.appendChild(div);

    setTimeout(() => {
      const sel = document.getElementById(`ctype_${i}`);
      const chip = document.getElementById(`chip_${i}`);
      if (!sel || !chip) return;
      const update = () => {
        if (sel.value === 'benefit') {
          chip.textContent = 'B';
          chip.className = 'chip chip-benefit';
        } else {
          chip.textContent = 'C';
          chip.className = 'chip chip-cost';
        }
      };
      sel.addEventListener('change', update);
      update();
    }, 0);
  }
}

function buildAltForm() {
  const el = document.getElementById('altList');
  el.innerHTML = '';
  for (let i = 0; i < state.nA; i++) {
    const prev = state.alternatives[i] || {};
    const div = document.createElement('div');
    div.className = 'criteria-item single-col';
    div.innerHTML = `
      <div>
        <label>Nama Alternatif A${i+1}</label>
        <input type="text" id="aname_${i}" value="${prev.name || ''}" placeholder="cth: Produk A"/>
      </div>
    `;
    el.appendChild(div);
  }
}

function buildMatrixForm() {
  collectStep(2);
  collectStep(3);
  const el = document.getElementById('decisionMatrix');
  if (!el) return;
  let html = '<table><thead><tr><th>Alternatif</th>';
  state.criteria.forEach((c, j) => {
    const tipe = c.type === 'cost' ? '↓' : '↑';
    html += `<th>${c.name || 'C'+(j+1)} ${tipe}<br><small style="color:var(--muted);font-family:sans-serif;font-size:10px;font-weight:400">bobot ${c.weight}</small></th>`;
  });
  html += '</tr></thead><tbody>';
  for (let i = 0; i < state.nA; i++) {
    html += `<tr><td style="text-align:left;font-weight:700;background:var(--yellow)">${state.alternatives[i]?.name || 'A'+(i+1)}</td>`;
    for (let j = 0; j < state.nC; j++) {
      const val = (state.matrix[i] && state.matrix[i][j]) || '';
      html += `<td><input type="number" id="m_${i}_${j}" value="${val}" min="0" step="0.01" /></td>`;
    }
    html += '</tr>';
  }
  html += '</tbody></table>';
  el.innerHTML = html;
}

function renderCards(scores, rankOf, isPercent) {
  const el = document.getElementById('resultCards');
  const items = scores.map((s, i) => ({ i, s, rank: rankOf[i] }))
                      .sort((a, b) => a.rank - b.rank);
  el.innerHTML = items.map(({ i, s, rank }) => {
    const cls = rank === 1 ? 'rank1' : rank === 2 ? 'rank2' : rank === 3 ? 'rank3' : 'rank-other';
    const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '';
    const display = isPercent ? `${(s * 100).toFixed(2)}%` : s.toFixed(4);
    return `
      <div class="result-card ${cls}">
        <div class="rank-badge">${rank}</div>
        <div class="alt-name">${medal} ${state.alternatives[i]?.name || 'A'+(i+1)}</div>
        <div class="vi-score">${display}</div>
        <div class="vi-label">${isPercent ? 'Priority Score' : 'Nilai Preferensi'}</div>
        ${rank === 1 ? `<div style="font-size:11px;color:#000;margin-top:8px;font-weight:900;letter-spacing:1px;">★ TERPILIH</div>` : ''}
      </div>`;
  }).join('');
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = '✓ ' + msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

function printResult() {
  window.print();
}
