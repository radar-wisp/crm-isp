/* ============================================================
 * Motor de Modelos — Configurações > Modelos
 * ------------------------------------------------------------
 * "Modelos" continua vivendo dentro do motor genérico de
 * Configurações (CFG.modelo, mesmo card/tabela/badge/botões do
 * resto da tela). Este arquivo apenas:
 *   1) estende CFG.modelo com os campos necessários (descrição,
 *      novos tipos, última alteração);
 *   2) substitui a forma de exibir esse painel específico por um
 *      padrão lista → detalhe (mesma área, sem navegação/rota
 *      nova), com conteúdo condicional por Tipo;
 *   3) reaproveita o modal de cadastro genérico já existente
 *      (cfgOverlay/cfgForm/openCfgEdit) para "Novo" e "Editar"
 *      das Informações Gerais.
 * Nada em engine/config-engine.js, modules/config.html, menu
 * lateral, cabeçalho ou nas demais abas de Configurações é
 * alterado — as funções globais existentes (renderCfg,
 * cfgColsHtml) são estendidas do mesmo jeito que
 * engine/persistence.js já faz com renderLeads/renderVenda.
 * ============================================================ */

const MODELO_TIPOS_LIST = ['Perfil de Contrato', 'Modelo de E-mail', 'Modelo de WhatsApp'];

/* Fonte de exemplo para a aba "Contratos" do Perfil de Contrato.
 * Não existe hoje um cadastro de contratos no protótipo — assim
 * como CFG.plan é a fonte usada por "Grupo de planos", esta lista
 * cumpre o mesmo papel para os vínculos de contrato. */
const MODELO_CONTRATOS = [
  { codigo: 'CT-1042', contrato: 'Adesão Fibra Residencial', tipoContrato: 'Residencial', status: 'Ativo' },
  { codigo: 'CT-1088', contrato: 'Adesão Fibra Empresarial', tipoContrato: 'Empresarial', status: 'Ativo' },
  { codigo: 'CT-1103', contrato: 'Renovação Anual', tipoContrato: 'Residencial', status: 'Ativo' },
  { codigo: 'CT-1157', contrato: 'Adesão Combo Residencial', tipoContrato: 'Residencial', status: 'Inativo' }
];

/* valores de exemplo usados só na Preview/Pré-visualização */
const MODELO_SAMPLE = { '{{cliente_nome}}': 'Maria Souza', '{{plano_nome}}': 'Fibra 500', '{{plano_valor}}': 'R$ 99,90' };
function modeloApplySample(text) { return (text || '').replace(/\{\{[a-zA-Z0-9_]+\}\}/g, m => MODELO_SAMPLE[m] || m); }
function modeloNow() { const d = new Date(), p = n => String(n).padStart(2, '0'); return p(d.getDate()) + '/' + p(d.getMonth() + 1) + '/' + d.getFullYear() + ' ' + p(d.getHours()) + ':' + p(d.getMinutes()); }
function modeloInsertAtCursor(el, text) {
  const start = el.selectionStart ?? el.value.length, end = el.selectionEnd ?? el.value.length;
  el.value = el.value.slice(0, start) + text + el.value.slice(end);
  el.focus(); const pos = start + text.length; el.setSelectionRange(pos, pos);
}

/* ---- 1) Estende o registro genérico CFG.modelo ---- */
CFG.modelo.cols = [
  { key: 'nome', label: 'Nome do modelo', type: 'text' },
  { key: 'descricao', label: 'Descrição', type: 'text' },
  { key: 'tipo', label: 'Tipo', type: 'select', options: MODELO_TIPOS_LIST },
  { key: 'status', label: 'Status', type: 'radio', options: ['Ativo', 'Inativo'] },
  { key: 'updatedAt', label: 'Última alteração', type: 'text', hideInForm: true }
];
CFG.modelo.data = [
  { nome: 'Contrato Residencial Fibra', descricao: 'Perfil padrão para contratos de planos residenciais de fibra.', tipo: 'Perfil de Contrato', status: 'Ativo', updatedAt: '20/07/2026 09:14', vincContratos: ['CT-1042'], vincPlanos: ['Fibra 300', 'Fibra 500'] },
  { nome: 'Boas-vindas ao cliente', descricao: 'Mensagem enviada após a conclusão da instalação.', tipo: 'Modelo de WhatsApp', status: 'Ativo', updatedAt: '22/07/2026 16:40', mensagem: 'Olá {{cliente_nome}}, seja bem-vindo(a) à Radar Internet! Seu plano {{plano_nome}} já está ativo.' },
  { nome: 'Confirmação de instalação', descricao: 'E-mail enviado ao cliente quando a instalação é concluída.', tipo: 'Modelo de E-mail', status: 'Ativo', updatedAt: '24/07/2026 11:05', assunto: 'Sua instalação foi concluída!', corpo: '<p>Olá {{cliente_nome}},</p><p>Sua instalação do plano <b>{{plano_nome}}</b> foi concluída com sucesso.</p><p>Mensalidade: {{plano_valor}}</p>' }
];

/* Passa a suportar hideInForm no motor genérico (usado só por 'updatedAt';
 * as demais chaves de CFG não usam essa flag, então o comportamento delas
 * não muda em nada). */
const _origCfgColsHtml = cfgColsHtml;
cfgColsHtml = function (cols, idx, c) { return _origCfgColsHtml(cols.filter(col => !col.hideInForm), idx, c); };

/* ---- 2) estado da view (lista / detalhe) do painel Modelos ---- */
let modeloDetailIdx = null;
let modeloActiveTab = 'contratos';
let modeloFilters = { q: '', tipo: '', status: '' };

function modeloFilteredData() {
  return CFG.modelo.data.map((r, i) => ({ r, i })).filter(({ r }) => {
    if (modeloFilters.tipo && r.tipo !== modeloFilters.tipo) return false;
    if (modeloFilters.status && r.status !== modeloFilters.status) return false;
    if (modeloFilters.q) {
      const q = modeloFilters.q.toLowerCase();
      if (!(r.nome || '').toLowerCase().includes(q) && !(r.descricao || '').toLowerCase().includes(q)) return false;
    }
    return true;
  });
}

function renderModeloList() {
  modeloDetailIdx = null;
  const panel = document.getElementById('cfg-modelo');
  panel.innerHTML =
    '<div class="toolbar"><div class="search-row"><div class="field-search">' +
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>' +
    '<input type="text" id="modeloSearch" placeholder="Pesquisar por nome ou descrição..."></div></div>' +
    '<div class="filters">' +
    '<div class="filter"><label>Tipo</label><div class="select"><select id="modeloFiltroTipo"><option value="">Todos os tipos</option>' +
    MODELO_TIPOS_LIST.map(t => '<option value="' + escA(t) + '">' + esc(t) + '</option>').join('') +
    '</select><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="6 9 12 15 18 9"/></svg></div></div>' +
    '<div class="filter"><label>Status</label><div class="select"><select id="modeloFiltroStatus"><option value="">Todos os status</option><option value="Ativo">Ativo</option><option value="Inativo">Inativo</option></select><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="6 9 12 15 18 9"/></svg></div></div>' +
    '</div></div>' +
    '<div class="card"><div class="card-head"><h3>Modelos</h3><button class="btn-primary" id="new-modelo">' + plusIco + 'Novo</button></div>' +
    '<div class="table-wrap"><table class="cfg-table"><thead><tr><th>Nome</th><th>Tipo</th><th>Status</th><th>Última alteração</th><th></th></tr></thead>' +
    '<tbody id="modeloTbody"></tbody></table></div></div>';

  document.getElementById('modeloSearch').value = modeloFilters.q;
  document.getElementById('modeloFiltroTipo').value = modeloFilters.tipo;
  document.getElementById('modeloFiltroStatus').value = modeloFilters.status;
  document.getElementById('new-modelo').addEventListener('click', () => openCfgEdit('modelo', null));
  document.getElementById('modeloSearch').addEventListener('input', e => { modeloFilters.q = e.target.value; renderModeloRows(); });
  document.getElementById('modeloFiltroTipo').addEventListener('change', e => { modeloFilters.tipo = e.target.value; renderModeloRows(); });
  document.getElementById('modeloFiltroStatus').addEventListener('change', e => { modeloFilters.status = e.target.value; renderModeloRows(); });
  renderModeloRows();
}

function renderModeloRows() {
  const tbody = document.getElementById('modeloTbody');
  if (!tbody) return;
  const rows = modeloFilteredData();
  tbody.innerHTML = rows.length ? rows.map(({ r, i }) =>
    '<tr class="modelo-row" data-idx="' + i + '">' +
    '<td><span style="font-weight:600;color:var(--body-strong)">' + esc(r.nome) + '</span></td>' +
    '<td><span class="chip-soft">' + esc(r.tipo) + '</span></td>' +
    '<td>' + cfgBadge(r.status) + '</td>' +
    '<td>' + esc(r.updatedAt || '—') + '</td>' +
    '<td><div class="cfg-acts"><button class="row-act del" data-del="' + i + '">' + delIco + '</button></div></td>' +
    '</tr>'
  ).join('') : '<tr><td colspan="5" style="text-align:center;color:#98a4b6;padding:26px 0">Nenhum modelo encontrado.</td></tr>';

  tbody.querySelectorAll('.modelo-row').forEach(tr => {
    tr.addEventListener('click', e => { if (e.target.closest('[data-del]')) return; openModeloDetail(parseInt(tr.dataset.idx)); });
  });
  tbody.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', e => {
    e.stopPropagation();
    if (confirm('Excluir este modelo?')) { CFG.modelo.data.splice(parseInt(b.dataset.del), 1); renderModeloRows(); }
  }));
}

function openModeloDetail(idx) { modeloDetailIdx = idx; modeloActiveTab = 'contratos'; renderModeloDetail(); }

function renderModeloDetail() {
  const panel = document.getElementById('cfg-modelo');
  const r = CFG.modelo.data[modeloDetailIdx];
  if (!r) { renderModeloList(); return; }
  panel.innerHTML =
    '<div class="card">' +
    '<div class="card-head"><div class="modelo-detail-head">' +
    '<button class="btn-ghost" id="modeloVoltar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px"><polyline points="15 18 9 12 15 6"/></svg>Voltar</button>' +
    '<h3>' + esc(r.nome) + '<small>' + esc(r.tipo) + '</small></h3>' +
    '</div><button class="btn-ghost" id="modeloEditarInfo">' + editIco + 'Editar</button></div>' +
    '<div class="modelo-info-grid">' +
    '<div><label>Nome</label><span>' + esc(r.nome) + '</span></div>' +
    '<div><label>Tipo</label><span>' + esc(r.tipo) + '</span></div>' +
    '<div><label>Status</label><span>' + cfgBadge(r.status) + '</span></div>' +
    '<div><label>Última alteração</label><span style="font-weight:500">' + esc(r.updatedAt || '—') + '</span></div>' +
    '<div class="full"><label>Descrição</label><span style="font-weight:500">' + esc(r.descricao || '—') + '</span></div>' +
    '</div>' +
    modeloTipoBody(r) +
    '</div>';

  document.getElementById('modeloVoltar').addEventListener('click', renderModeloList);
  document.getElementById('modeloEditarInfo').addEventListener('click', () => openCfgEdit('modelo', modeloDetailIdx));
  modeloBindTipoBody(panel, r);
}

function modeloTipoBody(r) {
  if (r.tipo === 'Perfil de Contrato') return modeloContratoBody(r);
  if (r.tipo === 'Modelo de E-mail') return modeloEmailBody(r);
  if (r.tipo === 'Modelo de WhatsApp') return modeloWhatsappBody(r);
  return '<div class="modelo-form-body"><p style="color:#98a4b6">Este tipo de modelo ainda não tem uma visualização configurada.</p></div>';
}
function modeloBindTipoBody(panel, r) {
  if (r.tipo === 'Perfil de Contrato') modeloBindContrato(panel, r);
  else if (r.tipo === 'Modelo de E-mail') modeloBindEmail(panel, r);
  else if (r.tipo === 'Modelo de WhatsApp') modeloBindWhatsapp(panel, r);
}

/* ---- Perfil de Contrato: abas Contratos / Planos (reaproveita .seg) ---- */
function modeloLinkPanel(id, applyId, items, checkedList, labelFn) {
  return '<div class="modelo-link-pop"><button class="btn-primary" id="' + id + 'Btn">' + plusIco + (id === 'modeloContrato' ? 'Vincular Contrato' : 'Vincular Plano') + '</button>' +
    '<div class="cd-panel" id="' + id + 'Panel">' +
    items.map(labelFn).map((label, n) => '<label class="cd-item' + (checkedList.includes(items[n].val) ? ' on' : '') + '" data-val="' + escA(items[n].val) + '"><span class="cbox"></span>' + label + '</label>').join('') +
    '<div style="padding:8px 10px;border-top:1px solid var(--surface-line)"><button class="btn-primary" id="' + applyId + '" style="width:100%;height:34px;font-size:12.5px">Aplicar</button></div>' +
    '</div></div>';
}
function modeloContratoBody(r) {
  if (!r.vincContratos) r.vincContratos = [];
  if (!r.vincPlanos) r.vincPlanos = [];
  const contratoItems = MODELO_CONTRATOS.map(c => ({ val: c.codigo }));
  const planoItems = CFG.plan.data.map(p => ({ val: p.plano }));
  return '<div class="modelo-tabs-wrap">' +
    '<div class="seg" id="modeloSeg">' +
    '<button data-tab="contratos"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>Contratos</button>' +
    '<button data-tab="planos"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16v6H4z"/><path d="M4 14h16v6H4z"/></svg>Planos</button>' +
    '</div>' +
    '<div class="modelo-tabpanel" data-tabpanel="contratos" style="margin-top:16px">' +
    '<div class="card-head" style="padding:0 0 12px;border:none"><h3 style="font-size:14px">Contratos vinculados</h3>' +
    modeloLinkPanel('modeloContrato', 'modeloContratoAplicar', MODELO_CONTRATOS.map(c => ({ val: c.codigo, c })), r.vincContratos, it => esc(it.c.codigo) + ' — ' + esc(it.c.contrato)) +
    '</div>' +
    '<div class="table-wrap"><table class="cfg-table"><thead><tr><th>Código</th><th>Contrato</th><th>Tipo de contrato</th><th>Status</th></tr></thead><tbody>' +
    (r.vincContratos.length ? r.vincContratos.map(cod => { const c = MODELO_CONTRATOS.find(x => x.codigo === cod); return c ? '<tr><td><b>' + esc(c.codigo) + '</b></td><td>' + esc(c.contrato) + '</td><td><span class="chip-soft">' + esc(c.tipoContrato) + '</span></td><td>' + cfgBadge(c.status) + '</td></tr>' : ''; }).join('') : '<tr><td colspan="4" style="text-align:center;color:#98a4b6;padding:22px 0">Nenhum contrato vinculado.</td></tr>') +
    '</tbody></table></div></div>' +
    '<div class="modelo-tabpanel" data-tabpanel="planos" style="margin-top:16px">' +
    '<div class="card-head" style="padding:0 0 12px;border:none"><h3 style="font-size:14px">Planos vinculados</h3>' +
    modeloLinkPanel('modeloPlano', 'modeloPlanoAplicar', CFG.plan.data.map(p => ({ val: p.plano, p })), r.vincPlanos, it => esc(it.p.plano)) +
    '</div>' +
    '<div class="table-wrap"><table class="cfg-table"><thead><tr><th>Plano</th><th>Tecnologia</th><th>Status</th></tr></thead><tbody>' +
    (r.vincPlanos.length ? r.vincPlanos.map(pn => { const p = CFG.plan.data.find(x => x.plano === pn); return p ? '<tr><td><b>' + esc(p.plano) + '</b></td><td>' + esc(p.tecnologia) + '</td><td>' + cfgBadge(p.status) + '</td></tr>' : ''; }).join('') : '<tr><td colspan="3" style="text-align:center;color:#98a4b6;padding:22px 0">Nenhum plano vinculado.</td></tr>') +
    '</tbody></table></div></div>' +
    '</div>';
}
function modeloBindContrato(panel, r) {
  const seg = document.getElementById('modeloSeg');
  const applyTab = () => {
    seg.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.tab === modeloActiveTab));
    panel.querySelectorAll('.modelo-tabpanel').forEach(p => p.classList.toggle('on', p.dataset.tabpanel === modeloActiveTab));
  };
  seg.querySelectorAll('button').forEach(b => b.addEventListener('click', () => { modeloActiveTab = b.dataset.tab; applyTab(); }));
  applyTab();

  ['modeloContrato', 'modeloPlano'].forEach(prefix => {
    const btn = document.getElementById(prefix + 'Btn'), pop = btn.closest('.modelo-link-pop');
    btn.addEventListener('click', () => pop.classList.toggle('open'));
    pop.querySelectorAll('.cd-item').forEach(it => it.addEventListener('click', e => { e.preventDefault(); it.classList.toggle('on'); }));
  });
  document.getElementById('modeloContratoAplicar').addEventListener('click', () => {
    r.vincContratos = [...document.querySelectorAll('#modeloContratoPanel .cd-item.on')].map(x => x.dataset.val);
    r.updatedAt = modeloNow(); renderModeloDetail();
  });
  document.getElementById('modeloPlanoAplicar').addEventListener('click', () => {
    r.vincPlanos = [...document.querySelectorAll('#modeloPlanoPanel .cd-item.on')].map(x => x.dataset.val);
    r.updatedAt = modeloNow(); renderModeloDetail();
  });
}

/* fecha qualquer popover de vínculo aberto ao clicar fora dele */
document.addEventListener('click', e => {
  document.querySelectorAll('.modelo-link-pop.open').forEach(p => { if (!p.contains(e.target)) p.classList.remove('open'); });
});

/* ---- Modelo de E-mail ---- */
function modeloEmailBody(r) {
  return '<div class="modelo-form-body">' +
    '<div class="fg"><label>Assunto</label><input type="text" id="modeloAssunto" value="' + escA(r.assunto || '') + '" placeholder="Assunto do e-mail"></div>' +
    '<div class="fg"><label>Editor HTML</label><textarea id="modeloCorpo" class="mono" placeholder="Conteúdo em HTML...">' + esc(r.corpo || '') + '</textarea></div>' +
    '<div class="fg"><label>Variáveis disponíveis</label><div class="modelo-vars">' + CFG.variavel.data.map(v => '<button type="button" class="chip-soft" data-var="' + escA(v.tag) + '">' + esc(v.tag) + '</button>').join('') + '</div></div>' +
    '<div class="fg"><label>Preview</label><div class="modelo-preview" id="modeloPreview"></div></div>' +
    '</div>' +
    '<div class="modelo-form-foot"><button class="btn-ghost" id="modeloEnviarTeste">Enviar teste</button><button class="btn-primary" id="modeloSalvarConteudo">Salvar alterações</button></div>';
}
function modeloBindEmail(panel, r) {
  const subjectEl = document.getElementById('modeloAssunto'), bodyEl = document.getElementById('modeloCorpo');
  let lastField = bodyEl;
  subjectEl.addEventListener('focus', () => lastField = subjectEl);
  bodyEl.addEventListener('focus', () => lastField = bodyEl);
  const updatePreview = () => {
    document.getElementById('modeloPreview').innerHTML =
      '<div class="prev-subject">' + esc(subjectEl.value || '(sem assunto)') + '</div>' + modeloApplySample(bodyEl.value);
  };
  subjectEl.addEventListener('input', updatePreview);
  bodyEl.addEventListener('input', updatePreview);
  updatePreview();
  panel.querySelectorAll('.modelo-vars [data-var]').forEach(btn => btn.addEventListener('click', () => { modeloInsertAtCursor(lastField, btn.dataset.var); updatePreview(); }));
  document.getElementById('modeloEnviarTeste').addEventListener('click', () => alert('Teste enviado para o e-mail cadastrado do usuário logado.'));
  document.getElementById('modeloSalvarConteudo').addEventListener('click', () => {
    r.assunto = subjectEl.value; r.corpo = bodyEl.value; r.updatedAt = modeloNow();
    alert('Modelo salvo com sucesso.');
    renderModeloDetail();
  });
}

/* ---- Modelo de WhatsApp ---- */
function modeloWhatsappBody(r) {
  return '<div class="modelo-form-body">' +
    '<div class="fg"><label>Mensagem</label><textarea id="modeloMensagem" placeholder="Digite a mensagem...">' + esc(r.mensagem || '') + '</textarea></div>' +
    '<div class="fg"><label>Variáveis disponíveis</label><div class="modelo-vars">' + CFG.variavel.data.map(v => '<button type="button" class="chip-soft" data-var="' + escA(v.tag) + '">' + esc(v.tag) + '</button>').join('') + '</div></div>' +
    '<div class="fg"><label>Pré-visualização</label><div class="modelo-wa-bubble" id="modeloWaPreview"></div></div>' +
    '</div>' +
    '<div class="modelo-form-foot"><button class="btn-ghost" id="modeloTestarEnvio">Testar envio</button><button class="btn-primary" id="modeloSalvarConteudo">Salvar alterações</button></div>';
}
function modeloBindWhatsapp(panel, r) {
  const msgEl = document.getElementById('modeloMensagem');
  const updatePreview = () => { document.getElementById('modeloWaPreview').textContent = modeloApplySample(msgEl.value) || 'Pré-visualização da mensagem...'; };
  msgEl.addEventListener('input', updatePreview);
  updatePreview();
  panel.querySelectorAll('.modelo-vars [data-var]').forEach(btn => btn.addEventListener('click', () => { modeloInsertAtCursor(msgEl, btn.dataset.var); updatePreview(); }));
  document.getElementById('modeloTestarEnvio').addEventListener('click', () => alert('Mensagem de teste enviada via WhatsApp.'));
  document.getElementById('modeloSalvarConteudo').addEventListener('click', () => {
    r.mensagem = msgEl.value; r.updatedAt = modeloNow();
    alert('Modelo salvo com sucesso.');
    renderModeloDetail();
  });
}

/* ---- 3) plugagem no motor genérico (mesma técnica de extensão não-invasiva de engine/persistence.js) ---- */
const _origRenderCfg = renderCfg;
renderCfg = function (key) {
  if (key === 'modelo') { if (modeloDetailIdx != null) renderModeloDetail(); else renderModeloList(); return; }
  return _origRenderCfg(key);
};

/* carimba "Última alteração" quando o modal genérico salva um registro de
 * Modelos (Novo / Editar Informações Gerais) — sem tocar no listener
 * original de #cfgSave em config-engine.js, só adiciona um segundo. */
document.getElementById('cfgSave').addEventListener('click', () => {
  if (cfgEditKey !== 'modelo') return;
  const idx = cfgEditIdx == null ? CFG.modelo.data.length - 1 : cfgEditIdx;
  const rec = CFG.modelo.data[idx];
  if (!rec) return;
  rec.updatedAt = modeloNow();
  if (modeloDetailIdx != null) renderModeloDetail(); else renderModeloList();
});

/* desenha o painel já no novo padrão (o render genérico inicial de
 * config-engine.js já rodou antes deste arquivo carregar) */
renderModeloList();
