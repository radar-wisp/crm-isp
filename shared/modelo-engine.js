/* ============================================================
 * Motor de Modelos — Configurações > Modelos
 * ------------------------------------------------------------
 * O módulo passa a ser responsável APENAS pela configuração de
 * modelos de contrato, organizado em três abas — "Perfil de
 * contrato", "Documentos" e "Aceite" — todas com adição, edição
 * e exclusão.
 *
 * Continua vivendo dentro do painel genérico de Configurações
 * (#cfg-modelo) e reaproveita os componentes já existentes:
 * .toolbar, .seg, .card/.card-head, .cfg-table, .cfg-acts,
 * .chip-soft, .badge, .fg, .select, .cfg-checks/.cfg-check-item
 * e a casca de modal #modeloOverlay (.cfgmodal/.cfg-form/
 * .cfg-modal-foot). Nenhum outro arquivo do projeto é alterado:
 * renderCfg é estendido do mesmo jeito não-invasivo já usado por
 * engine/persistence.js.
 * ============================================================ */

const MODELO_TIPOS_CONTRATO = ['Residencial', 'Empresarial'];

const MODELO_ACEITE_OPTS = [
  ['email', 'Enviar no E-mail'],
  ['whatsapp', 'Enviar no Whatsapp'],
  ['selfie', 'Solicitar Selfie'],
  ['assinatura', 'Solicitar assinatura'],
  ['documentos', 'Solicitar documentos pessoais']
];

const MODELO_TABS = [
  { key: 'perfil', label: 'Perfil de contrato' },
  { key: 'documento', label: 'Documentos' },
  { key: 'aceite', label: 'Aceite' }
];

/* ---- 1) Dados: três coleções dentro do registro CFG.modelo ---- */
CFG.modelo.cols = [{ key: 'nome', label: 'Nome', type: 'text' }];
CFG.modelo.perfis = [
  { nome: 'Contrato Residencial Fibra' },
  { nome: 'Contrato Empresarial' }
];
CFG.modelo.data = [
  {
    nome: 'Adesão Fibra Residencial',
    tipoContrato: 'Residencial',
    perfil: 'Contrato Residencial Fibra',
    aceiteEletronico: true,
    documento: '<p>Contrato de prestação de serviços firmado entre a Radar Internet e <b>{{cliente_nome}}</b>.</p><p>Plano contratado: {{plano_nome}} — mensalidade de {{plano_valor}}.</p>'
  }
];
CFG.modelo.aceites = [
  { nome: 'Aceite padrão', docsVinculados: ['Adesão Fibra Residencial'], email: true, whatsapp: true, selfie: false, assinatura: true, documentos: false }
];

function modeloStore(tab) {
  return tab === 'perfil' ? CFG.modelo.perfis : tab === 'aceite' ? CFG.modelo.aceites : CFG.modelo.data;
}

/* ---- 2) Lista por aba ---- */
let modeloTab = 'perfil';

function modeloHeads() {
  if (modeloTab === 'perfil') return ['Nome'];
  if (modeloTab === 'aceite') return ['Nome', 'Documentos vinculados'];
  return ['Nome', 'Tipo de contrato', 'Perfil de contrato', 'Aceite eletrônico'];
}

function modeloRowHtml(r, i) {
  const nome = '<td><span style="font-weight:600;color:var(--body-strong)">' + esc(r.nome) + '</span></td>';
  let cells = nome;
  if (modeloTab === 'documento') {
    cells += '<td><span class="chip-soft">' + esc(r.tipoContrato || '—') + '</span></td>' +
      '<td>' + esc(r.perfil || '—') + '</td>' +
      '<td><span class="badge ' + (r.aceiteEletronico ? 'b-won">Sim' : 'b-lost">Não') + '</span></td>';
  } else if (modeloTab === 'aceite') {
    const docs = r.docsVinculados || [];
    cells += '<td>' + (docs.length ? docs.map(d => '<span class="chip-soft">' + esc(d) + '</span>').join(' ') : '—') + '</td>';
  }
  return '<tr>' + cells +
    '<td><div class="cfg-acts"><button class="row-act" data-mdl-edit="' + i + '">' + editIco + '</button>' +
    '<button class="row-act del" data-mdl-del="' + i + '">' + delIco + '</button></div></td></tr>';
}

function renderModelo() {
  const panel = document.getElementById('cfg-modelo');
  if (!panel) return;
  const tab = MODELO_TABS.find(t => t.key === modeloTab);
  const rows = modeloStore(modeloTab);
  const heads = modeloHeads();
  panel.innerHTML =
    '<div class="toolbar"><div class="seg" id="modeloSeg">' +
    MODELO_TABS.map(t => '<button data-tab="' + t.key + '"' + (t.key === modeloTab ? ' class="on"' : '') + '>' + esc(t.label) + '</button>').join('') +
    '</div></div>' +
    '<div class="card"><div class="card-head"><h3>' + esc(tab.label) + '</h3>' +
    '<button class="btn-primary" id="modeloNovo">' + plusIco + 'Novo</button></div>' +
    '<div class="table-wrap"><table class="cfg-table"><thead><tr>' +
    heads.map(h => '<th>' + h + '</th>').join('') + '<th></th></tr></thead><tbody>' +
    (rows.length ? rows.map(modeloRowHtml).join('') :
      '<tr><td colspan="' + (heads.length + 1) + '" style="text-align:center;color:#98a4b6;padding:26px 0">Nenhum registro cadastrado.</td></tr>') +
    '</tbody></table></div></div>';

  panel.querySelectorAll('#modeloSeg button').forEach(b => b.addEventListener('click', () => { modeloTab = b.dataset.tab; renderModelo(); }));
  document.getElementById('modeloNovo').addEventListener('click', () => openModeloModal(null));
  panel.querySelectorAll('[data-mdl-edit]').forEach(b => b.addEventListener('click', () => openModeloModal(parseInt(b.dataset.mdlEdit))));
  panel.querySelectorAll('[data-mdl-del]').forEach(b => b.addEventListener('click', () => {
    if (confirm('Excluir este registro?')) { modeloStore(modeloTab).splice(parseInt(b.dataset.mdlDel), 1); renderModelo(); }
  }));
}

/* ---- 3) Plugagem no motor genérico (extensão não-invasiva) ---- */
const _origRenderCfg = renderCfg;
renderCfg = function (key) {
  if (key === 'modelo') { renderModelo(); return; }
  return _origRenderCfg(key);
};

/* ============================================================
 * 4) Modal de cadastro/edição por aba
 * Reaproveita a casca #modeloOverlay já existente e os mesmos
 * campos (.fg, .cfg-field, .select, .cfg-checks) do restante de
 * Configurações.
 * ============================================================ */
const mdlChev = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="6 9 12 15 18 9"/></svg>';

const modeloOverlay = document.getElementById('modeloOverlay');
const modeloForm = document.getElementById('modeloForm');
let modeloModalIdx = null;

function mdlInput(id, label, val, full) { return '<div class="fg' + (full ? ' full' : '') + '"><label>' + esc(label) + '</label><input type="text" id="' + id + '" value="' + escA(val || '') + '" placeholder="' + escA(label) + '"></div>'; }
function mdlSelect(id, label, opts, val, full) { return '<div class="cfg-field' + (full ? ' full' : '') + '"><label class="cfg-flabel">' + esc(label) + '</label><div class="select"><select id="' + id + '">' + opts.map(o => '<option value="' + escA(o) + '"' + (o === val ? ' selected' : '') + '>' + esc(o) + '</option>').join('') + '</select>' + mdlChev + '</div></div>'; }
function mdlChecks(id, label, opts, rec) {
  return '<div class="cfg-field full"><label class="cfg-flabel">' + esc(label) + '</label><div class="cfg-checks" id="' + id + '">' +
    opts.map(o => '<label class="cfg-check-item' + (rec[o[0]] ? ' on' : '') + '" data-val="' + escA(o[0]) + '"><span class="cbox"></span>' + esc(o[1]) + '</label>').join('') +
    '</div></div>';
}

function mdlCheckdrop(id, label, opts, arr) {
  const sel = Array.isArray(arr) ? arr : [];
  return '<div class="cfg-field full"><label class="cfg-flabel">' + esc(label) + '</label>' +
    '<div class="checkdrop" id="' + id + '"><button type="button" class="cd-btn"><span class="cd-sum">' +
    esc(sel.length ? sel.length + ' selecionado(s)' : label) + '</span>' + mdlChev + '</button><div class="cd-panel">' +
    (opts.length ? opts.map(o => '<label class="cd-item' + (sel.includes(o) ? ' on' : '') + '" data-val="' + escA(o) + '"><span class="cbox"></span>' + esc(o) + '</label>').join('') :
      '<label class="cd-item" style="cursor:default;color:#98a4b6">Nenhum documento cadastrado.</label>') +
    '</div></div></div>';
}

/* ---- editor "Documento": formatação aproximada do Word ---- */
const MODELO_FONTS = ['Arial', 'Calibri', 'Georgia', 'Times New Roman', 'Verdana'];
const MODELO_SIZES = [['1', '8'], ['2', '10'], ['3', '12'], ['4', '14'], ['5', '18'], ['6', '24'], ['7', '36']];
function mdlAlignIco(pts) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">' + pts.map((p, n) => '<line x1="' + p[0] + '" y1="' + (6 + n * 4) + '" x2="' + p[1] + '" y2="' + (6 + n * 4) + '"/>').join('') + '</svg>'; }
const MODELO_DOC_CMDS = [
  ['bold', '<b>N</b>', 'Negrito'],
  ['italic', '<i>I</i>', 'Itálico'],
  ['underline', '<u>S</u>', 'Sublinhado'],
  ['strikeThrough', '<s>T</s>', 'Tachado'],
  ['justifyLeft', mdlAlignIco([[3, 21], [3, 15], [3, 21], [3, 15]]), 'Alinhar à esquerda'],
  ['justifyCenter', mdlAlignIco([[3, 21], [6, 18], [3, 21], [6, 18]]), 'Centralizar'],
  ['justifyRight', mdlAlignIco([[3, 21], [9, 21], [3, 21], [9, 21]]), 'Alinhar à direita'],
  ['justifyFull', mdlAlignIco([[3, 21], [3, 21], [3, 21], [3, 21]]), 'Justificar'],
  ['insertUnorderedList', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4.5" cy="6" r="1.2"/><circle cx="4.5" cy="12" r="1.2"/><circle cx="4.5" cy="18" r="1.2"/></svg>', 'Lista com marcadores'],
  ['insertOrderedList', '1. Lista', 'Lista numerada'],
  ['outdent', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><polyline points="7 9 4 12 7 15"/></svg>', 'Diminuir recuo'],
  ['indent', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><polyline points="4 9 7 12 4 15"/></svg>', 'Aumentar recuo'],
  ['removeFormat', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7V4h16v3"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>', 'Limpar formatação'],
  ['undo', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>', 'Desfazer'],
  ['redo', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.13-9.36L23 10"/></svg>', 'Refazer']
];

function mdlDoc(id, label, html) {
  return '<div class="fg full"><label>' + esc(label) + '</label><div class="modelo-doc">' +
    '<div class="modelo-doc-bar">' +
    '<div class="select mdl-doc-sel"><select data-doccmd="fontName">' + MODELO_FONTS.map(f => '<option value="' + escA(f) + '">' + esc(f) + '</option>').join('') + '</select>' + mdlChev + '</div>' +
    '<div class="select mdl-doc-sel xs"><select data-doccmd="fontSize">' + MODELO_SIZES.map(s => '<option value="' + s[0] + '"' + (s[0] === '3' ? ' selected' : '') + '>' + s[1] + '</option>').join('') + '</select>' + mdlChev + '</div>' +
    MODELO_DOC_CMDS.map(c => '<button type="button" class="chip-soft" data-cmd="' + c[0] + '" title="' + escA(c[2]) + '">' + c[1] + '</button>').join('') +
    '</div>' +
    '<div class="modelo-doc-area" id="' + id + '" contenteditable="true">' + (html || '') + '</div></div>' +
    '<div class="modelo-vars" data-docfor="' + id + '">' +
    CFG.variavel.data.filter(v => v.status !== 'Inativo').map(v => '<button type="button" class="chip-soft" data-var="' + escA(v.tag) + '" title="' + escA(v.nome) + '">' + esc(v.tag) + '</button>').join('') +
    '</div></div>';
}

function mdlDocFocus(area) {
  if (document.activeElement !== area) {
    area.focus();
    const sel = window.getSelection();
    if (sel && !area.contains(sel.anchorNode)) {
      const rg = document.createRange();
      rg.selectNodeContents(area); rg.collapse(false);
      sel.removeAllRanges(); sel.addRange(rg);
    }
  }
}
function mdlBindDoc(root) {
  root.querySelectorAll('.modelo-doc').forEach(doc => {
    const area = doc.querySelector('.modelo-doc-area');
    try { document.execCommand('styleWithCSS', false, true); } catch (e) { }
    doc.querySelectorAll('[data-cmd]').forEach(b => b.addEventListener('mousedown', e => {
      e.preventDefault(); mdlDocFocus(area); document.execCommand(b.dataset.cmd, false, null);
    }));
    doc.querySelectorAll('[data-doccmd]').forEach(s => {
      s.addEventListener('mousedown', () => mdlDocFocus(area));
      s.addEventListener('change', () => { mdlDocFocus(area); document.execCommand(s.dataset.doccmd, false, s.value); });
    });
    const vars = root.querySelector('.modelo-vars[data-docfor="' + area.id + '"]');
    if (vars) vars.querySelectorAll('[data-var]').forEach(b => b.addEventListener('mousedown', e => {
      e.preventDefault(); mdlDocFocus(area); document.execCommand('insertText', false, b.dataset.var);
    }));
  });
}

function modeloModalBody(r) {
  if (modeloTab === 'perfil') return mdlInput('mdlNome', 'Nome', r.nome, true);
  if (modeloTab === 'aceite') return mdlInput('mdlNome', 'Nome', r.nome, true) +
    mdlCheckdrop('mdlAceiteDocs', 'Documentos vinculados', CFG.modelo.data.map(d => d.nome), r.docsVinculados) +
    mdlChecks('mdlAceiteChecks', 'Configurações do aceite', MODELO_ACEITE_OPTS, r);
  return mdlInput('mdlNome', 'Nome', r.nome) +
    mdlSelect('mdlTipoContrato', 'Tipo de contrato', MODELO_TIPOS_CONTRATO, r.tipoContrato) +
    mdlSelect('mdlPerfil', 'Associar perfil de contrato', CFG.modelo.perfis.map(p => p.nome), r.perfil, true) +
    mdlChecks('mdlDocChecks', 'Aceite', [['aceiteEletronico', 'Gerar aceite eletrônico']], r) +
    mdlDoc('mdlDocumento', 'Documento', r.documento);
}

function openModeloModal(idx) {
  modeloModalIdx = idx;
  const r = idx == null ? {} : modeloStore(modeloTab)[idx];
  if (!r) return;
  const tab = MODELO_TABS.find(t => t.key === modeloTab);
  document.getElementById('modeloModalTitle').textContent = (idx == null ? 'Novo registro' : 'Editar registro') + ' — ' + tab.label;
  modeloForm.innerHTML = modeloModalBody(r);
  modeloForm.querySelectorAll('.cfg-check-item').forEach(ci => ci.addEventListener('click', e => { e.preventDefault(); ci.classList.toggle('on'); }));
  modeloForm.querySelectorAll('.cd-btn').forEach(b => b.addEventListener('click', () => b.closest('.checkdrop').classList.toggle('open')));
  modeloForm.querySelectorAll('.cd-item[data-val]').forEach(it => it.addEventListener('click', e => {
    e.preventDefault(); it.classList.toggle('on');
    const cd = it.closest('.checkdrop'), n = cd.querySelectorAll('.cd-item.on').length;
    cd.querySelector('.cd-sum').textContent = n ? n + ' selecionado(s)' : cd.closest('.cfg-field').querySelector('.cfg-flabel').textContent;
  }));
  mdlBindDoc(modeloForm);
  modeloOverlay.classList.add('open');
}
function closeModeloModal() { modeloOverlay.classList.remove('open'); }

function modeloModalSave() {
  const v = id => { const el = document.getElementById(id); return el ? (el.isContentEditable ? el.innerHTML : el.value.trim()) : ''; };
  const nome = v('mdlNome');
  if (!nome) { const el = document.getElementById('mdlNome'); if (el) { el.classList.add('err'); el.focus(); } return; }
  const rec = modeloModalIdx == null ? {} : modeloStore(modeloTab)[modeloModalIdx];
  rec.nome = nome;
  if (modeloTab === 'aceite') {
    rec.docsVinculados = [...modeloForm.querySelectorAll('#mdlAceiteDocs .cd-item.on')].map(x => x.dataset.val);
    MODELO_ACEITE_OPTS.forEach(o => { rec[o[0]] = !!modeloForm.querySelector('#mdlAceiteChecks .cfg-check-item.on[data-val="' + o[0] + '"]'); });
  } else if (modeloTab === 'documento') {
    rec.tipoContrato = v('mdlTipoContrato');
    rec.perfil = v('mdlPerfil');
    rec.aceiteEletronico = !!modeloForm.querySelector('#mdlDocChecks .cfg-check-item.on');
    rec.documento = v('mdlDocumento');
  }
  if (modeloModalIdx == null) modeloStore(modeloTab).push(rec);
  closeModeloModal();
  renderModelo();
}

document.getElementById('modeloModalSave').addEventListener('click', modeloModalSave);
document.getElementById('modeloModalCancel').addEventListener('click', closeModeloModal);
document.getElementById('modeloCloseBtn').addEventListener('click', closeModeloModal);
modeloOverlay.addEventListener('click', e => { if (e.target === modeloOverlay) closeModeloModal(); });

/* desenha o painel já no novo padrão (o render genérico inicial de
 * config-engine.js já rodou antes deste arquivo carregar) */
renderModelo();
