/* ============================================================
 * Motor de Funil — funis, etapas, tipos, ações automáticas, validações
 * e próximas ações (aba Funis dentro de Configurações).
 * Extraído do <script> original (bloco contíguo, ordem de execução
 * preservada). Nenhuma linha de lógica foi reescrita.
 * ============================================================ */
function etapa(nome,cor,icone,descricao,sla,obrig,ativa,avancar,campos,tipo){return {nome,cor,icone,descricao,sla,obrigatoria:obrig,ativa,avancarQualquer:avancar,campos,tipo:tipo||''}}

/* Ícones usados nesta aba. Definidos aqui (e não reaproveitados de
 * modules/dashboard.js) porque aquele arquivo falha ao carregar — ele
 * redeclara "const dupIco", que já existe em engine/config-engine.js,
 * o que gera um erro de sintaxe e impede dashboard.js de rodar. Sem
 * isso, gearIco/upIco/downIco ficavam undefined e renderFunisPanel()
 * quebrava antes de desenhar qualquer coisa em #cfg-funis. Mesmos SVGs
 * já usados no restante do projeto — nenhuma mudança visual.
 */
const gearIco='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>';
const upIco='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:15px;height:15px"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>';
const downIco='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:15px;height:15px"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>';

let FUNIS=[
{nome:'Funil Residencial',descricao:'Fluxo padrão para vendas de fibra residencial',tipo:'Pessoa Física',status:'Ativo',visualizacao:'Kanban',etapas:[
etapa('Novo Lead','#0ea5b7','user-plus','Lead recém-cadastrado no sistema','2 horas','Sim','Sim','Não',['Nome','Telefone'],'Comercial'),
etapa('Contato','#7c5cf6','phone','Primeiro contato realizado com o lead','1 dia','Sim','Sim','Não',['Nome','Telefone','Endereço'],'Comercial'),
etapa('Qualificado','#f59e0b','check','Lead qualificado para negociação','2 dias','Sim','Sim','Não',['Nome','CPF','Telefone'],'Qualificação'),
etapa('Viabilidade','#14c8dd','map-pin','Consulta de viabilidade técnica no endereço','1 dia','Sim','Sim','Não',['Endereço'],'Técnica'),
etapa('Proposta','#3b82f6','file-text','Proposta comercial enviada ao cliente','3 dias','Não','Sim','Sim',['Plano'],'Comercial'),
etapa('Contrato','#f97316','file-text','Contrato gerado para assinatura','2 dias','Sim','Sim','Não',['Contrato'],'Contratual'),
etapa('Assinado','#22c55e','check','Contrato assinado pelo cliente','1 dia','Sim','Sim','Não',['Assinatura'],'Contratual'),
etapa('Concluído','#16a34a','flag','Venda concluída','—','Sim','Sim','Não',[],'Finalizadora')]},
{nome:'Funil Empresarial',descricao:'Fluxo para negociações corporativas (PJ)',tipo:'Pessoa Jurídica',status:'Ativo',visualizacao:'Lista',etapas:[
etapa('Novo Lead','#0ea5b7','user-plus','Lead corporativo recebido','4 horas','Sim','Sim','Não',['Nome','Telefone'],'Comercial'),
etapa('Diagnóstico','#7c5cf6','map-pin','Levantamento das necessidades do cliente','2 dias','Sim','Sim','Não',['Endereço'],'Técnica'),
etapa('Proposta','#3b82f6','file-text','Proposta comercial corporativa','5 dias','Não','Sim','Sim',['Plano'],'Comercial'),
etapa('Negociação','#f59e0b','phone','Ajustes comerciais e contratuais','5 dias','Não','Sim','Sim',[],'Comercial'),
etapa('Fechamento','#22c55e','check','Contrato assinado e ativado','2 dias','Sim','Sim','Não',['Contrato','Assinatura'],'Contratual')]},
{nome:'Funil de Retenção',descricao:'Tratamento de solicitações de cancelamento',tipo:'Retenção',status:'Inativo',visualizacao:'Kanban',etapas:[
etapa('Solicitação','#ef4444','file-text','Cliente solicitou cancelamento','1 dia','Sim','Sim','Não',['Nome'],'Comercial'),
etapa('Contato de Retenção','#f59e0b','phone','Contato para entender o motivo','2 dias','Sim','Sim','Não',[],'Comercial'),
etapa('Oferta','#3b82f6','file-text','Oferta de retenção enviada','2 dias','Não','Sim','Sim',[],'Comercial'),
etapa('Resolvido','#22c55e','flag','Caso finalizado','—','Sim','Sim','Não',[],'Finalizadora')]}
];
const MASTER_CAMPOS=['Nome','CPF','Telefone','Origem','Endereço','CEP','Cidade','Bairro','Plano','Fidelidade','Contrato','Documento','Assinatura'];
const AUTO_ACOES=['Criar atividade','Criar Follow-up','Alterar Status','Enviar E-mail','Enviar WhatsApp','Gerar Auditoria','Criar Ordem de Serviço','Notificar Supervisor','Agendar Instalação','Criar Pendência'];
const DEFAULT_CAMPOS_MAP={'Novo Lead':['Nome','Telefone','Origem'],'Contato':['Nome','Telefone'],'Qualificado':['Nome','CPF','Telefone'],'Viabilidade':['CEP','Endereço','Cidade','Bairro'],'Proposta':['Plano'],'Contrato':['Contrato','Documento','Assinatura'],'Assinado':['Assinatura']};
const DEFAULT_ACOES_MAP={'Novo Lead':['Criar atividade'],'Proposta':['Enviar E-mail'],'Contrato':['Enviar E-mail','Gerar Auditoria'],'Assinado':['Criar Ordem de Serviço','Notificar Supervisor'],'Concluído':['Criar Pendência']};
const VALID_GROUPS=[
{title:'Dados do Cliente',items:['Nome obrigatório','CPF obrigatório','Documento válido','Data de nascimento obrigatória','Telefone principal obrigatório','E-mail obrigatório','Endereço obrigatório','CEP obrigatório','Cidade obrigatória','Bairro obrigatório','Número obrigatório']},
{title:'Validação Comercial',items:['Lead Qualificada','Vendedor responsável definido','Origem da Lead obrigatória','Campanha obrigatória','Plano selecionado','Contrato selecionado','Tabela de preço definida']},
{title:'Validação Técnica',items:['Viabilidade obrigatória','Cobertura aprovada','Porta disponível','CTO disponível','Caixa disponível','Ampliação de rede aprovada']},
{title:'Validação Contratual',items:['Contrato enviado','Contrato visualizado','Contrato assinado','Documento anexado']},
{title:'Validação Financeira',items:['Forma de pagamento definida','Primeira cobrança gerada','Aprovação financeira']},
{title:'Permissões',items:['Permitir avanço mesmo com pendências','Apenas Supervisor pode ignorar validações','Apenas Gerente pode ignorar validações']}
];
const VALID_TOTAL_ITEMS=VALID_GROUPS.reduce((s,g)=>s+g.items.length,0);
const VALID_ACOES=['Apenas informar','Bloquear avanço','Solicitar aprovação','Criar pendência'];
const DEFAULT_VALID_MAP={'Novo Lead':['Nome obrigatório','Telefone principal obrigatório'],'Qualificado':['Lead Qualificada','Origem da Lead obrigatória'],'Viabilidade':['Viabilidade obrigatória','Cobertura aprovada'],'Proposta':['Plano selecionado','Tabela de preço definida'],'Contrato':['Contrato enviado','Documento anexado'],'Assinado':['Contrato assinado']};

/* ===== Próximas Ações (Follow-up) ===== */
const PA_TIPOS=['Ligação','WhatsApp','E-mail','Tarefa','Visita','Outro'];
const PA_PRAZOS=['15 minutos','30 minutos','1 hora','2 horas','24 horas','48 horas','Personalizado'];
const PA_PRIORIDADES=['Baixa','Normal','Alta','Crítica'];
const PA_RESPONSAVEIS=['Vendedor','Supervisor','Administrador'];
let PROX_ACOES=[
{nome:'Confirmar recebimento do contrato',descricao:'Verificar com o cliente se o contrato enviado foi recebido.',tipo:'WhatsApp',prazo:'24 horas',prioridade:'Alta',automatica:'Sim',status:'Ativo'},
{nome:'Confirmar assinatura',descricao:'Confirmar com o cliente a assinatura do contrato enviado.',tipo:'Ligação',prazo:'24 horas',prioridade:'Alta',automatica:'Sim',status:'Ativo'},
{nome:'Enviar proposta comercial',descricao:'Encaminhar a proposta comercial ao cliente.',tipo:'E-mail',prazo:'2 horas',prioridade:'Normal',automatica:'Não',status:'Ativo'},
{nome:'Realizar primeiro contato',descricao:'Fazer o primeiro contato com o lead recém-cadastrado.',tipo:'Ligação',prazo:'2 horas',prioridade:'Alta',automatica:'Sim',status:'Ativo'},
{nome:'Agendar visita técnica',descricao:'Agendar visita para avaliação de viabilidade técnica.',tipo:'Visita',prazo:'48 horas',prioridade:'Normal',automatica:'Não',status:'Ativo'}
];
const DEFAULT_PROXACOES_MAP={'Novo Lead':[{acao:'Realizar primeiro contato',criarAuto:'Sim',prazo:'2 horas',responsavel:'Vendedor'}],'Contrato':[{acao:'Confirmar recebimento do contrato',criarAuto:'Sim',prazo:'24 horas',responsavel:'Vendedor'},{acao:'Confirmar assinatura',criarAuto:'Sim',prazo:'24 horas',responsavel:'Vendedor'}]};

FUNIS.forEach(f=>{
f.fluxo=f.fluxo||{permitirRetorno:'Não',permitirManual:'Não',acoes:[]};
f.etapas.forEach((e,i)=>{
if(!e.avancarPara){
const nearEnd=i>=f.etapas.length-2;
e.avancarPara=i<f.etapas.length-1?(nearEnd?[f.etapas[i+1].nome]:[f.etapas[i+1].nome,'Perdido']):[];
}
if(!e.camposAvanco)e.camposAvanco=DEFAULT_CAMPOS_MAP[e.nome]||[];
if(!e.acoesAutomaticas)e.acoesAutomaticas=DEFAULT_ACOES_MAP[e.nome]||[];
if(!e.validacoes)e.validacoes=DEFAULT_VALID_MAP[e.nome]||[];
if(!e.validacaoAcao)e.validacaoAcao='Bloquear avanço';
if(!e.proximasAcoes)e.proximasAcoes=(DEFAULT_PROXACOES_MAP[e.nome]||[]).map(x=>({...x}));
});
});
let funilSelIdx=0;
let motorTab='funis';
let validEtapaIdx=0;

let TIPOS_ETAPA=[
{nome:'Comercial',descricao:'Etapas relacionadas ao contato e negociação comercial.',cor:'#3b82f6',icone:'',status:'Ativo',objetivo:'Conduzir o contato e a negociação comercial com o cliente.',exemplos:['Novo Lead','Contato','Negociação']},
{nome:'Qualificação',descricao:'Etapas responsáveis por validar o interesse do cliente.',cor:'#7c5cf6',icone:'',status:'Ativo',objetivo:'Validar o interesse e o potencial de compra do cliente.',exemplos:['Qualificado','Diagnóstico']},
{nome:'Técnica',descricao:'Etapas relacionadas à análise técnica e viabilidade.',cor:'#f97316',icone:'',status:'Ativo',objetivo:'Validar se existe cobertura para atendimento.',exemplos:['Viabilidade','Ampliação de Rede','Vistoria']},
{nome:'Contratual',descricao:'Etapas responsáveis pelo envio e assinatura do contrato.',cor:'#22c55e',icone:'',status:'Ativo',objetivo:'Formalizar o envio e a assinatura do contrato.',exemplos:['Contrato Enviado','Contrato Assinado']},
{nome:'Financeira',descricao:'Etapas relacionadas à aprovação financeira.',cor:'#f59e0b',icone:'',status:'Ativo',objetivo:'Validar a aprovação financeira da proposta.',exemplos:['Análise de Crédito','Aprovação Financeira']},
{nome:'Instalação',descricao:'Etapas referentes ao agendamento e execução da instalação.',cor:'#14c8dd',icone:'',status:'Ativo',objetivo:'Agendar e executar a instalação do serviço.',exemplos:['Instalação Agendada','Instalação Concluída']},
{nome:'Finalizadora',descricao:'Etapas que encerram o processo.',cor:'#94a3b8',icone:'',status:'Ativo',objetivo:'Encerrar o processo de venda ou atendimento.',exemplos:['Venda Concluída','Perdido']}
];

function tipoByName(nome){return TIPOS_ETAPA.find(t=>t.nome===nome)}
function tipoIndicator(nomeTipo){
const t=tipoByName(nomeTipo);
if(!t)return '<span style="color:#98a4b6;font-size:12.5px">—</span>';
return '<span style="display:inline-flex;align-items:center;gap:7px;font-size:12.5px;color:var(--body)"><span style="width:11px;height:11px;border-radius:3px;background:'+t.cor+';display:inline-block;flex-shrink:0"></span>'+esc(t.nome)+'</span>';
}
function tipoRow(t,i){
return '<tr><td><b style="color:var(--body-strong)">'+esc(t.nome)+'</b></td><td>'+esc(t.descricao)+'</td><td><span style="display:inline-flex;align-items:center;gap:8px"><i style="width:16px;height:16px;border-radius:5px;background:'+t.cor+';display:inline-block;flex-shrink:0"></i></span></td><td style="font-size:16px">'+t.icone+'</td><td>'+cfgBadge(t.status)+'</td><td><div class="cfg-acts"><button class="row-act" data-tipedit="'+i+'" title="Editar">'+editIco+'</button><button class="row-act del" data-tipdel="'+i+'" title="Excluir">'+delIco+'</button></div></td></tr>';
}
function renderTiposCard(){
const rows=TIPOS_ETAPA.map((t,i)=>tipoRow(t,i)).join('');
return '<div class="card" style="margin-bottom:18px" id="tiposCard"><div class="card-head"><h3>Tipos de Etapa</h3><button class="btn-primary" id="newTipoBtn">'+plusIco+'Novo Tipo</button></div>'+
'<div class="table-wrap"><table class="cfg-table"><thead><tr><th>Nome</th><th>Descrição</th><th>Cor</th><th>Ícone</th><th>Status</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div></div>';
}

function funRow(f,i){
return '<tr><td><b style="color:var(--body-strong)">'+esc(f.nome)+'</b><br><small style="color:#8a97ab;font-size:11.5px">'+esc(f.descricao)+'</small></td><td><span class="chip-soft">'+esc(f.tipo)+'</span></td><td>'+f.etapas.length+' etapa(s)</td><td>'+cfgBadge(f.status)+'</td><td><div class="cfg-acts"><button class="row-act" data-funsel="'+i+'" title="Configurar etapas">'+gearIco+'</button><button class="row-act" data-funedit="'+i+'" title="Editar">'+editIco+'</button><button class="row-act" data-fundup="'+i+'" title="Duplicar">'+dupIco+'</button><button class="row-act del" data-fundel="'+i+'" title="Excluir">'+delIco+'</button></div></td></tr>';
}

function etapaRow(f,e,i,total){
return '<tr><td><b>'+(i+1)+'</b></td><td><span style="display:inline-flex;align-items:center;gap:8px"><i style="width:10px;height:10px;border-radius:3px;background:'+e.cor+';display:inline-block;flex-shrink:0"></i><b style="color:var(--body-strong)">'+esc(e.nome)+'</b></span></td><td>'+tipoIndicator(e.tipo)+'</td><td><i style="width:20px;height:20px;border-radius:6px;background:'+e.cor+';display:inline-block"></i></td><td>'+esc(e.sla)+'</td><td>'+(e.obrigatoria==='Sim'?'<span class="badge b-won">Sim</span>':'<span class="chip-soft">Não</span>')+'</td><td>'+(e.ativa==='Sim'?'<span class="badge b-won">Ativa</span>':'<span class="badge b-lost">Inativa</span>')+'</td><td><div class="cfg-acts"><button class="row-act" data-etpup="'+i+'" title="Subir"'+(i===0?' disabled style="opacity:.35;cursor:default"':'')+'>'+upIco+'</button><button class="row-act" data-etpdown="'+i+'" title="Descer"'+(i===total-1?' disabled style="opacity:.35;cursor:default"':'')+'>'+downIco+'</button><button class="row-act" data-etpedit="'+i+'" title="Editar">'+editIco+'</button><button class="row-act del" data-etpdel="'+i+'" title="Excluir">'+delIco+'</button></div></td></tr>';
}

function fluxoRow(f,e,i,total){
const opts=f.etapas.filter((x,xi)=>xi!==i).map(x=>x.nome).concat(['Perdido']);
const checked=e.avancarPara||[];
const items=opts.map(o=>'<label class="cfg-check-item'+(checked.includes(o)?' on':'')+'" data-fluxo-origin="'+i+'" data-val="'+escA(o)+'"><span class="cbox"></span>'+esc(o)+'</label>').join('');
return '<div style="display:flex;gap:24px;padding:16px 20px;align-items:flex-start'+(i<total-1?';border-bottom:1px solid var(--surface-line)':'')+'">'+
'<div style="min-width:170px;flex-shrink:0;padding-top:2px"><b style="color:var(--body-strong);font-size:13.5px">'+esc(e.nome)+'</b></div>'+
'<div style="flex:1"><div style="font-size:12px;color:#68758a;font-weight:600;margin-bottom:9px">Pode avançar para:</div><div class="cfg-checks">'+items+'</div></div>'+
'</div>';
}

function renderFluxoCard(f){
if(!f)return '';
const rows=f.etapas.map((e,i)=>fluxoRow(f,e,i,f.etapas.length)).join('');
const fx=f.fluxo;
const acoesOpts=['Criar atividade','Alterar Status','Enviar e-mail','Enviar WhatsApp','Registrar Auditoria'];
const acoesHtml=acoesOpts.map(o=>'<label class="cfg-check-item'+(fx.acoes.includes(o)?' on':'')+'" data-fluxo-acao data-val="'+escA(o)+'"><span class="cbox"></span>'+esc(o)+'</label>').join('');
return '<div class="card" style="margin-bottom:18px" id="fluxoCard">'+
'<div class="card-head"><h3>Fluxo entre Etapas</h3></div>'+
'<div style="padding:14px 20px 4px;font-size:13px;color:#8a97ab">Configure quais movimentações são permitidas entre as etapas deste funil.</div>'+
'<div>'+rows+'</div>'+
'<div class="cfg-form" style="padding:18px 20px;border-top:1px solid var(--surface-line)">'+
'<div class="cfg-field"><label class="cfg-flabel">Permitir retorno para etapa anterior</label><div class="radio-group" id="fluxoRetornoRG"><div class="radio-opt'+(fx.permitirRetorno==='Sim'?' sel':'')+'" data-val="Sim"><span class="rd"></span>Sim</div><div class="radio-opt'+(fx.permitirRetorno==='Não'?' sel':'')+'" data-val="Não"><span class="rd"></span>Não</div></div></div>'+
'<div class="cfg-field"><label class="cfg-flabel">Permitir movimentação manual para qualquer etapa</label><div class="radio-group" id="fluxoManualRG"><div class="radio-opt'+(fx.permitirManual==='Sim'?' sel':'')+'" data-val="Sim"><span class="rd"></span>Sim</div><div class="radio-opt'+(fx.permitirManual==='Não'?' sel':'')+'" data-val="Não"><span class="rd"></span>Não</div></div></div>'+
'<div class="cfg-field"><label class="cfg-flabel">Ao mover automaticamente para esta etapa</label><div class="cfg-checks" id="fluxoAcoesCk">'+acoesHtml+'</div></div>'+
'</div>'+
'<div class="cfg-modal-foot" style="justify-content:space-between;align-items:center">'+
'<span id="fluxoSavedMsg" style="font-size:12.5px;color:var(--signal);font-weight:600;opacity:0;transition:.25s">Fluxo salvo com sucesso!</span>'+
'<button class="btn-primary" id="saveFluxoBtn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:15px;height:15px"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>Salvar Fluxo</button>'+
'</div>'+
'</div>';
}

function renderCamposTab(f){
if(!f)return '<div class="card"><div class="card-head"><h3>Campos obrigatórios para avanço</h3></div></div>';
const rows=f.etapas.map((e,i)=>{
const checked=e.camposAvanco||[];
const items=MASTER_CAMPOS.map(c=>'<label class="cfg-check-item'+(checked.includes(c)?' on':'')+'" data-campos-origin="'+i+'" data-val="'+escA(c)+'"><span class="cbox"></span>'+esc(c)+'</label>').join('');
return '<div style="padding:16px 20px'+(i<f.etapas.length-1?';border-bottom:1px solid var(--surface-line)':'')+'"><div style="font-size:13.5px;font-weight:700;color:var(--body-strong);margin-bottom:10px">'+esc(e.nome)+'</div><div class="cfg-checks">'+items+'</div></div>';
}).join('');
return '<div class="card"><div class="card-head"><h3>Campos obrigatórios para avanço</h3></div>'+
'<div style="padding:14px 20px 0;font-size:13px;color:#8a97ab">Defina quais informações precisam estar preenchidas para permitir o avanço de cada etapa.</div>'+
'<div>'+rows+'</div>'+
'<div class="cfg-modal-foot" style="justify-content:space-between;align-items:center">'+
'<span id="camposSavedMsg" style="font-size:12.5px;color:var(--signal);font-weight:600;opacity:0;transition:.25s">Configuração salva com sucesso!</span>'+
'<button class="btn-primary" id="saveCamposBtn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:15px;height:15px"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>Salvar Campos Obrigatórios</button>'+
'</div></div>';
}

function proxAcaoChip(etapaIdx,subIdx,pa){
return '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;border:1.5px solid var(--surface-line);border-radius:10px;padding:9px 12px;background:#fbfcfe">'+
'<b style="font-size:12.5px;color:var(--body-strong)">'+esc(pa.acao)+'</b>'+
'<label style="display:flex;align-items:center;gap:6px;font-size:12px;color:#68758a;cursor:pointer"><input type="checkbox" data-pa-auto data-etapa="'+etapaIdx+'" data-sub="'+subIdx+'"'+(pa.criarAuto==='Sim'?' checked':'')+'>Criar automaticamente</label>'+
'<div class="select sm" style="min-width:120px"><select data-pa-prazo data-etapa="'+etapaIdx+'" data-sub="'+subIdx+'">'+PA_PRAZOS.filter(x=>x!=='Personalizado').map(pz=>'<option value="'+escA(pz)+'"'+(pz===pa.prazo?' selected':'')+'>'+esc(pz)+'</option>').join('')+'</select><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="6 9 12 15 18 9"/></svg></div>'+
'<div class="select sm" style="min-width:120px"><select data-pa-resp data-etapa="'+etapaIdx+'" data-sub="'+subIdx+'">'+PA_RESPONSAVEIS.map(r=>'<option value="'+escA(r)+'"'+(r===pa.responsavel?' selected':'')+'>'+esc(r)+'</option>').join('')+'</select><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="6 9 12 15 18 9"/></svg></div>'+
'<button class="row-act del" data-pa-remove data-etapa="'+etapaIdx+'" data-sub="'+subIdx+'" title="Remover" style="margin-left:auto">'+delIco+'</button>'+
'</div>';
}
function renderProxAcoesEtapaCard(f){
if(!f)return '';
const rows=f.etapas.map((e,i)=>{
const atual=e.proximasAcoes||[];
const chips=atual.length?atual.map((pa,pi)=>proxAcaoChip(i,pi,pa)).join(''):'<div style="font-size:12.5px;color:#98a4b6">Nenhuma Próxima Ação configurada para esta etapa.</div>';
const disponiveis=PROX_ACOES.filter(p=>p.status==='Ativo'&&!atual.some(a=>a.acao===p.nome));
return '<div style="padding:16px 20px'+(i<f.etapas.length-1?';border-bottom:1px solid var(--surface-line)':'')+'">'+
'<div style="font-size:13.5px;font-weight:700;color:var(--body-strong);margin-bottom:10px">'+esc(e.nome)+'</div>'+
'<div style="display:flex;flex-direction:column;gap:8px">'+chips+'</div>'+
'<div style="display:flex;gap:8px;align-items:center;margin-top:10px">'+
'<div class="select sm" style="min-width:220px;flex:1"><select data-pa-add-select="'+i+'">'+(disponiveis.length?disponiveis.map(p=>'<option value="'+escA(p.nome)+'">'+esc(p.nome)+'</option>').join(''):'<option value="">Nenhuma disponível</option>')+'</select><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="6 9 12 15 18 9"/></svg></div>'+
'<button class="btn-ghost btn-sm" data-pa-add="'+i+'"'+(disponiveis.length?'':' disabled')+'>'+plusIco+'Adicionar</button>'+
'</div></div>';
}).join('');
return '<div class="card" style="margin-top:18px" id="proxAcoesEtapaCard"><div class="card-head"><h3>Próxima Ação sugerida por etapa</h3></div>'+
'<div style="padding:14px 20px 0;font-size:13px;color:#8a97ab">Selecione quais modelos da Biblioteca de Próximas Ações serão sugeridos ao vendedor ao entrar em cada etapa. Para o vendedor, este recurso é sempre exibido como "Próxima Ação".</div>'+
'<div>'+rows+'</div></div>';
}

function proxAcaoLibRow(p,i){
return '<tr><td><b style="color:var(--body-strong)">'+esc(p.nome)+'</b>'+(p.descricao?'<br><small style="color:#8a97ab;font-size:11.5px">'+esc(p.descricao)+'</small>':'')+'</td><td><span class="chip-soft">'+esc(p.tipo)+'</span></td><td>'+esc(p.prazo)+'</td><td>'+esc(p.prioridade)+'</td><td>'+(p.automatica==='Sim'?'<span class="badge b-won">Sim</span>':'<span class="chip-soft">Não</span>')+'</td><td>'+cfgBadge(p.status)+'</td><td><div class="cfg-acts"><button class="row-act" data-paedit="'+i+'" title="Editar">'+editIco+'</button><button class="row-act del" data-padel="'+i+'" title="Excluir">'+delIco+'</button></div></td></tr>';
}
function renderProxAcoesTab(){
const rows=PROX_ACOES.map((p,i)=>proxAcaoLibRow(p,i)).join('');
return '<div class="card"><div class="card-head"><h3>Biblioteca de Próximas Ações</h3><button class="btn-primary" id="newProxAcaoBtn">'+plusIco+'Nova Próxima Ação</button></div>'+
'<div style="padding:14px 20px 0;font-size:13px;color:#8a97ab">Cadastre os modelos de ação que poderão ser sugeridos automaticamente durante o Fluxo da Venda. Internamente este recurso representa o Follow-up do CRM; para o vendedor, ele é sempre chamado de "Próxima Ação".</div>'+
'<div class="table-wrap" style="margin-top:14px"><table class="cfg-table"><thead><tr><th>Nome</th><th>Tipo</th><th>Prazo Padrão</th><th>Prioridade</th><th>Automática</th><th>Status</th><th></th></tr></thead><tbody>'+(rows||'')+'</tbody></table></div></div>';
}

function renderAcoesTab(f){
if(!f)return '<div class="card"><div class="card-head"><h3>Ações automáticas</h3></div></div>';
const rows=f.etapas.map((e,i)=>{
const checked=e.acoesAutomaticas||[];
const items=AUTO_ACOES.map(c=>'<label class="cfg-check-item'+(checked.includes(c)?' on':'')+'" data-acao-origin="'+i+'" data-val="'+escA(c)+'"><span class="cbox"></span>'+esc(c)+'</label>').join('');
return '<div style="padding:16px 20px'+(i<f.etapas.length-1?';border-bottom:1px solid var(--surface-line)':'')+'"><div style="font-size:13.5px;font-weight:700;color:var(--body-strong);margin-bottom:10px">'+esc(e.nome)+'</div><div class="cfg-checks">'+items+'</div></div>';
}).join('');
return '<div class="card"><div class="card-head"><h3>Ações automáticas</h3></div>'+
'<div style="padding:14px 20px 0;font-size:13px;color:#8a97ab">Configure quais ações ocorrerão automaticamente ao entrar em cada etapa.</div>'+
'<div>'+rows+'</div>'+
'<div class="cfg-modal-foot" style="justify-content:space-between;align-items:center">'+
'<span id="acoesSavedMsg" style="font-size:12.5px;color:var(--signal);font-weight:600;opacity:0;transition:.25s">Configuração salva com sucesso!</span>'+
'<button class="btn-primary" id="saveAcoesBtn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:15px;height:15px"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>Salvar Ações Automáticas</button>'+
'</div></div>';
}

function renderValidacoesTab(f){
if(!f||!f.etapas.length)return '<div class="card"><div class="card-head"><h3>Regras de Validação</h3></div><div style="padding:18px 20px;font-size:13px;color:#8a97ab">Cadastre etapas para configurar validações.</div></div>';
if(validEtapaIdx>=f.etapas.length)validEtapaIdx=0;
const e=f.etapas[validEtapaIdx];
const checked=e.validacoes||[];
const etapaOptions=f.etapas.map((et,i)=>'<option value="'+i+'"'+(i===validEtapaIdx?' selected':'')+'>'+esc(et.nome)+'</option>').join('');
const etapaSelector='<div class="card" style="margin-bottom:18px"><div class="card-head" style="border-bottom:none"><h3>Etapa</h3>'+
'<div class="select sm" style="min-width:220px"><select id="validEtapaSelect">'+etapaOptions+'</select><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="6 9 12 15 18 9"/></svg></div></div></div>';
const groupsHtml=VALID_GROUPS.map(g=>'<div style="padding:16px 20px;border-top:1px solid var(--surface-line)"><div style="font-size:12.5px;font-weight:700;color:var(--body-strong);margin-bottom:10px">'+esc(g.title)+'</div><div class="cfg-checks">'+g.items.map(it=>'<label class="cfg-check-item'+(checked.includes(it)?' on':'')+'" data-valid-item data-val="'+escA(it)+'"><span class="cbox"></span>'+esc(it)+'</label>').join('')+'</div></div>').join('');
const acaoHtml='<div style="padding:16px 20px;border-top:1px solid var(--surface-line)"><div class="cfg-flabel" style="margin-bottom:9px">Quando uma validação não for atendida</div><div class="radio-group" id="validAcaoRG">'+VALID_ACOES.map(a=>'<div class="radio-opt'+(e.validacaoAcao===a?' sel':'')+'" data-val="'+escA(a)+'"><span class="rd"></span>'+esc(a)+'</div>').join('')+'</div></div>';
const regrasCard='<div class="card" style="flex:1;min-width:320px"><div class="card-head"><h3>Regras de Validação</h3></div>'+
'<div style="padding:14px 20px 0;font-size:13px;color:#8a97ab">Configure quais condições deverão ser atendidas antes de permitir o avanço para a próxima etapa.</div>'+
groupsHtml+acaoHtml+
'<div class="cfg-modal-foot" style="justify-content:space-between;align-items:center">'+
'<span id="validSavedMsg" style="font-size:12.5px;color:var(--signal);font-weight:600;opacity:0;transition:.25s">Validações salvas com sucesso!</span>'+
'<button class="btn-primary" id="saveValidBtn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:15px;height:15px"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>Salvar Validações</button>'+
'</div></div>';
const obrig=checked.length,opc=VALID_TOTAL_ITEMS-obrig;
const resumoCard='<div class="card" style="width:260px;flex-shrink:0"><div class="card-head"><h3>Resumo da Etapa</h3></div>'+
'<div style="padding:16px 20px;display:flex;flex-direction:column;gap:14px">'+
'<div><div class="cfg-flabel">Etapa</div><b style="font-size:13.5px;color:var(--body-strong)">'+esc(e.nome)+'</b></div>'+
'<div><div class="cfg-flabel">Quantidade de validações</div><b style="font-size:13.5px;color:var(--body-strong)">'+VALID_TOTAL_ITEMS+'</b></div>'+
'<div><div class="cfg-flabel">Quantidade obrigatória</div><b style="font-size:13.5px;color:var(--accent)">'+obrig+'</b></div>'+
'<div><div class="cfg-flabel">Quantidade opcional</div><b style="font-size:13.5px;color:var(--body-strong)">'+opc+'</b></div>'+
'<div><div class="cfg-flabel">Status</div>'+(obrig>0?'<span class="badge b-won">Configurada</span>':'<span class="badge b-lost">Pendente</span>')+'</div>'+
'</div></div>';
return etapaSelector+'<div style="display:flex;gap:18px;align-items:flex-start;flex-wrap:wrap">'+regrasCard+resumoCard+'</div>';
}

function renderMotorTabs(){
const tabs=[['funis','Funis'],['etapas','Etapas'],['fluxo','Fluxo'],['campos','Campos Obrigatórios'],['acoes','Ações Automáticas'],['proxacoes','Próximas Ações'],['validacoes','Validações']];
return tabs.map(t=>'<button class="'+(motorTab===t[0]?'on':'')+'" data-tab="'+t[0]+'">'+t[1]+'</button>').join('');
}

function renderFunisPanel(){
const panel=document.getElementById('cfg-funis');
const selFunil=FUNIS[funilSelIdx];
const funOptions=FUNIS.map((f,i)=>'<option value="'+i+'"'+(i===funilSelIdx?' selected':'')+'>'+esc(f.nome)+'</option>').join('');
const topSelector='<div class="card" style="margin-bottom:18px"><div class="card-head" style="border-bottom:none"><h3>Funil Atual</h3>'+
(FUNIS.length?'<div class="select sm" style="min-width:220px"><select id="funilAtualSelect">'+funOptions+'</select><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="6 9 12 15 18 9"/></svg></div>':'')+
'</div></div>';

const listRows=FUNIS.map((f,i)=>funRow(f,i)).join('');
const tabFunis='<div class="card"><div class="card-head"><h3>Funis de venda</h3><button class="btn-primary" id="newFunilBtn">'+plusIco+'Novo Funil</button></div>'+
'<div class="table-wrap"><table class="cfg-table"><thead><tr><th>Nome do Funil</th><th>Tipo</th><th>Qtd. Etapas</th><th>Status</th><th></th></tr></thead><tbody>'+listRows+'</tbody></table></div></div>';

const etapasRows=selFunil?selFunil.etapas.map((e,i)=>etapaRow(selFunil,e,i,selFunil.etapas.length)).join(''):'';
const legend='<div style="display:flex;flex-wrap:wrap;gap:14px;padding:14px 20px;border-top:1px solid var(--surface-line)">'+TIPOS_ETAPA.map(t=>'<span style="display:inline-flex;align-items:center;gap:6px;font-size:12.5px;color:var(--body)"><i style="width:10px;height:10px;border-radius:3px;background:'+t.cor+';display:inline-block;flex-shrink:0"></i>'+esc(t.nome)+'</span>').join('')+'</div>';
const tabEtapas=renderTiposCard()+
'<div class="card" style="margin-top:18px"><div class="card-head"><h3>Configuração das etapas</h3><button class="btn-primary" id="newEtapaBtn">'+plusIco+'Nova Etapa</button></div>'+
'<div class="table-wrap"><table class="cfg-table"><thead><tr><th>Ordem</th><th>Nome da Etapa</th><th>Tipo</th><th>Cor</th><th>SLA</th><th>Obrigatória</th><th>Ativa</th><th></th></tr></thead><tbody>'+etapasRows+'</tbody></table></div>'+legend+'</div>';

const tabFluxo=renderFluxoCard(selFunil);
const tabCampos=renderCamposTab(selFunil);
const tabAcoes=renderAcoesTab(selFunil)+renderProxAcoesEtapaCard(selFunil);
const tabProxAcoes=renderProxAcoesTab();
const tabValidacoes=renderValidacoesTab(selFunil);
const tabContentMap={funis:tabFunis,etapas:tabEtapas,fluxo:tabFluxo,campos:tabCampos,acoes:tabAcoes,proxacoes:tabProxAcoes,validacoes:tabValidacoes};

const motorCard='<div class="card" style="margin-bottom:18px" id="motorFunilCard"><div class="card-head"><h3>Motor do Funil</h3></div>'+
'<div style="padding:14px 20px 0"><div class="seg" id="motorTabs" style="overflow-x:auto;max-width:100%">'+renderMotorTabs()+'</div></div>'+
'<div id="motorTabContent" style="padding:18px 20px 20px">'+(tabContentMap[motorTab]||'')+'</div></div>';

const preview=selFunil?selFunil.etapas.map(e=>'<div class="col" style="min-width:200px;flex:0 0 200px"><div class="col-head"><i class="dt" style="background:'+e.cor+'"></i><h4>'+esc(e.nome)+'</h4></div><div class="col-sum">SLA: '+esc(e.sla)+'</div></div>').join(''):'';
const previewCard='<div class="card"><div class="card-head"><h3>Pré-visualização do funil</h3><span class="count">Ilustrativo · <b>'+esc(selFunil?selFunil.nome:'—')+'</b></span></div>'+
'<div style="padding:18px 20px"><div class="board">'+preview+'</div></div></div>';

panel.innerHTML=topSelector+previewCard+motorCard;
attachFunisEvents();
}

function attachFunisEvents(){
const panel=document.getElementById('cfg-funis');
const nf=document.getElementById('newFunilBtn');if(nf)nf.addEventListener('click',()=>openFunilModal(null));
panel.querySelectorAll('[data-funsel]').forEach(b=>b.addEventListener('click',()=>{funilSelIdx=parseInt(b.dataset.funsel);renderFunisPanel();}));
panel.querySelectorAll('[data-funedit]').forEach(b=>b.addEventListener('click',()=>openFunilModal(parseInt(b.dataset.funedit))));
panel.querySelectorAll('[data-fundup]').forEach(b=>b.addEventListener('click',()=>{const i=parseInt(b.dataset.fundup);const c=JSON.parse(JSON.stringify(FUNIS[i]));c.nome=c.nome+' (cópia)';FUNIS.splice(i+1,0,c);renderFunisPanel();}));
panel.querySelectorAll('[data-fundel]').forEach(b=>b.addEventListener('click',()=>{const i=parseInt(b.dataset.fundel);if(confirm('Excluir este funil?')){FUNIS.splice(i,1);if(funilSelIdx>=FUNIS.length)funilSelIdx=Math.max(0,FUNIS.length-1);renderFunisPanel();}}));
const fp=document.getElementById('funilAtualSelect');if(fp)fp.addEventListener('change',()=>{funilSelIdx=parseInt(fp.value);validEtapaIdx=0;renderFunisPanel();});
panel.querySelectorAll('#motorTabs [data-tab]').forEach(b=>b.addEventListener('click',()=>{motorTab=b.dataset.tab;renderFunisPanel();}));
const nt=document.getElementById('newTipoBtn');if(nt)nt.addEventListener('click',()=>openTipoModal(null));
panel.querySelectorAll('[data-tipedit]').forEach(b=>b.addEventListener('click',()=>openTipoModal(parseInt(b.dataset.tipedit))));
panel.querySelectorAll('[data-tipdel]').forEach(b=>b.addEventListener('click',()=>{const i=parseInt(b.dataset.tipdel);if(confirm('Excluir este tipo de etapa?')){TIPOS_ETAPA.splice(i,1);renderFunisPanel();}}));
const ne=document.getElementById('newEtapaBtn');if(ne)ne.addEventListener('click',()=>openEtapaModal(null));
panel.querySelectorAll('[data-etpup]').forEach(b=>b.addEventListener('click',()=>{const i=parseInt(b.dataset.etpup);if(i>0){const arr=FUNIS[funilSelIdx].etapas;[arr[i-1],arr[i]]=[arr[i],arr[i-1]];renderFunisPanel();}}));
panel.querySelectorAll('[data-etpdown]').forEach(b=>b.addEventListener('click',()=>{const i=parseInt(b.dataset.etpdown);const arr=FUNIS[funilSelIdx].etapas;if(i<arr.length-1){[arr[i+1],arr[i]]=[arr[i],arr[i+1]];renderFunisPanel();}}));
panel.querySelectorAll('[data-etpedit]').forEach(b=>b.addEventListener('click',()=>openEtapaModal(parseInt(b.dataset.etpedit))));
panel.querySelectorAll('[data-etpdel]').forEach(b=>b.addEventListener('click',()=>{const i=parseInt(b.dataset.etpdel);if(confirm('Excluir esta etapa?')){FUNIS[funilSelIdx].etapas.splice(i,1);renderFunisPanel();}}));
panel.querySelectorAll('[data-fluxo-origin]').forEach(ci=>ci.addEventListener('click',e=>{e.preventDefault();ci.classList.toggle('on');}));
panel.querySelectorAll('#fluxoRetornoRG .radio-opt,#fluxoManualRG .radio-opt').forEach(opt=>opt.addEventListener('click',()=>{opt.parentElement.querySelectorAll('.radio-opt').forEach(o=>o.classList.remove('sel'));opt.classList.add('sel');}));
panel.querySelectorAll('[data-fluxo-acao]').forEach(ci=>ci.addEventListener('click',e=>{e.preventDefault();ci.classList.toggle('on');}));
const sfb=document.getElementById('saveFluxoBtn');if(sfb)sfb.addEventListener('click',saveFluxo);
panel.querySelectorAll('[data-campos-origin]').forEach(ci=>ci.addEventListener('click',e=>{e.preventDefault();ci.classList.toggle('on');}));
const scb=document.getElementById('saveCamposBtn');if(scb)scb.addEventListener('click',saveCampos);
panel.querySelectorAll('[data-acao-origin]').forEach(ci=>ci.addEventListener('click',e=>{e.preventDefault();ci.classList.toggle('on');}));
const sab=document.getElementById('saveAcoesBtn');if(sab)sab.addEventListener('click',saveAcoes);
const ves=document.getElementById('validEtapaSelect');if(ves)ves.addEventListener('change',()=>{validEtapaIdx=parseInt(ves.value);renderFunisPanel();});
panel.querySelectorAll('[data-valid-item]').forEach(ci=>ci.addEventListener('click',e=>{e.preventDefault();ci.classList.toggle('on');}));
panel.querySelectorAll('#validAcaoRG .radio-opt').forEach(opt=>opt.addEventListener('click',()=>{opt.parentElement.querySelectorAll('.radio-opt').forEach(o=>o.classList.remove('sel'));opt.classList.add('sel');}));
const svb=document.getElementById('saveValidBtn');if(svb)svb.addEventListener('click',saveValidacoes);
panel.querySelectorAll('[data-pa-auto]').forEach(cb=>cb.addEventListener('change',()=>{const et=parseInt(cb.dataset.etapa),su=parseInt(cb.dataset.sub);FUNIS[funilSelIdx].etapas[et].proximasAcoes[su].criarAuto=cb.checked?'Sim':'Não';}));
panel.querySelectorAll('[data-pa-prazo]').forEach(sel=>sel.addEventListener('change',()=>{const et=parseInt(sel.dataset.etapa),su=parseInt(sel.dataset.sub);FUNIS[funilSelIdx].etapas[et].proximasAcoes[su].prazo=sel.value;}));
panel.querySelectorAll('[data-pa-resp]').forEach(sel=>sel.addEventListener('change',()=>{const et=parseInt(sel.dataset.etapa),su=parseInt(sel.dataset.sub);FUNIS[funilSelIdx].etapas[et].proximasAcoes[su].responsavel=sel.value;}));
panel.querySelectorAll('[data-pa-remove]').forEach(b=>b.addEventListener('click',()=>{const et=parseInt(b.dataset.etapa),su=parseInt(b.dataset.sub);FUNIS[funilSelIdx].etapas[et].proximasAcoes.splice(su,1);renderFunisPanel();}));
panel.querySelectorAll('[data-pa-add]').forEach(b=>b.addEventListener('click',()=>{
const et=parseInt(b.dataset.paAdd);
const sel=panel.querySelector('[data-pa-add-select="'+et+'"]');
if(!sel||!sel.value)return;
const lib=PROX_ACOES.find(p=>p.nome===sel.value);
if(!lib)return;
FUNIS[funilSelIdx].etapas[et].proximasAcoes.push({acao:lib.nome,criarAuto:lib.automatica,prazo:lib.prazo,responsavel:'Vendedor'});
renderFunisPanel();
}));
const npa=document.getElementById('newProxAcaoBtn');if(npa)npa.addEventListener('click',()=>openProxAcaoModal(null));
panel.querySelectorAll('[data-paedit]').forEach(b=>b.addEventListener('click',()=>openProxAcaoModal(parseInt(b.dataset.paedit))));
panel.querySelectorAll('[data-padel]').forEach(b=>b.addEventListener('click',()=>{const i=parseInt(b.dataset.padel);if(confirm('Excluir esta Próxima Ação da biblioteca?')){PROX_ACOES.splice(i,1);renderFunisPanel();}}));
}

function saveCampos(){
const f=FUNIS[funilSelIdx];const panel=document.getElementById('cfg-funis');
f.etapas.forEach((e,i)=>{e.camposAvanco=[...panel.querySelectorAll('[data-campos-origin="'+i+'"].on')].map(x=>x.dataset.val);});
const msg=document.getElementById('camposSavedMsg');
if(msg){msg.style.opacity='1';setTimeout(()=>{msg.style.opacity='0';},2200);}
}

function saveAcoes(){
const f=FUNIS[funilSelIdx];const panel=document.getElementById('cfg-funis');
f.etapas.forEach((e,i)=>{e.acoesAutomaticas=[...panel.querySelectorAll('[data-acao-origin="'+i+'"].on')].map(x=>x.dataset.val);});
const msg=document.getElementById('acoesSavedMsg');
if(msg){msg.style.opacity='1';setTimeout(()=>{msg.style.opacity='0';},2200);}
}

function saveValidacoes(){
const f=FUNIS[funilSelIdx];const panel=document.getElementById('cfg-funis');
const e=f.etapas[validEtapaIdx];if(!e)return;
e.validacoes=[...panel.querySelectorAll('[data-valid-item].on')].map(x=>x.dataset.val);
const acaoSel=panel.querySelector('#validAcaoRG .radio-opt.sel');
e.validacaoAcao=acaoSel?acaoSel.dataset.val:'Bloquear avanço';
renderFunisPanel();
const msg=document.getElementById('validSavedMsg');
if(msg){msg.style.opacity='1';setTimeout(()=>{msg.style.opacity='0';},2200);}
}

function saveFluxo(){
const f=FUNIS[funilSelIdx];const panel=document.getElementById('cfg-funis');
f.etapas.forEach((e,i)=>{e.avancarPara=[...panel.querySelectorAll('[data-fluxo-origin="'+i+'"].on')].map(x=>x.dataset.val);});
const retornoSel=panel.querySelector('#fluxoRetornoRG .radio-opt.sel');
const manualSel=panel.querySelector('#fluxoManualRG .radio-opt.sel');
f.fluxo={permitirRetorno:retornoSel?retornoSel.dataset.val:'Não',permitirManual:manualSel?manualSel.dataset.val:'Não',acoes:[...panel.querySelectorAll('[data-fluxo-acao].on')].map(x=>x.dataset.val)};
const msg=document.getElementById('fluxoSavedMsg');
if(msg){msg.style.opacity='1';setTimeout(()=>{msg.style.opacity='0';},2200);}
}

/* Modal Funil */
const funilOverlay=document.getElementById('funilOverlay');
let funilEditIdx=null;
function rgSet(id,val){document.querySelectorAll('#'+id+' .radio-opt').forEach(o=>o.classList.toggle('sel',o.dataset.val===val));}
function rgVal(id){const s=document.querySelector('#'+id+' .radio-opt.sel');return s?s.dataset.val:'';}
document.querySelectorAll('#funStatusRG .radio-opt').forEach(opt=>opt.addEventListener('click',()=>{opt.parentElement.querySelectorAll('.radio-opt').forEach(o=>o.classList.remove('sel'));opt.classList.add('sel');}));
function openFunilModal(idx){
funilEditIdx=idx;
const f=idx!=null?FUNIS[idx]:{nome:'',descricao:'',tipo:'Pessoa Física',status:'Ativo'};
document.getElementById('funilModalTitle').textContent=idx==null?'Novo Funil':'Editar Funil';
document.getElementById('funNome').value=f.nome;
document.getElementById('funDescricao').value=f.descricao;
document.getElementById('funTipo').value=f.tipo;rgSet('funStatusRG',f.status);
funilOverlay.classList.add('open');
}
function closeFunilModal(){funilOverlay.classList.remove('open')}
document.getElementById('funilCloseBtn').addEventListener('click',closeFunilModal);
document.getElementById('funilCancel').addEventListener('click',closeFunilModal);
funilOverlay.addEventListener('click',e=>{if(e.target===funilOverlay)closeFunilModal()});
document.getElementById('funilSave').addEventListener('click',()=>{
const nome=document.getElementById('funNome').value.trim();
if(!nome){document.getElementById('funNome').classList.add('err');return}
document.getElementById('funNome').classList.remove('err');
const rec={nome:nome,descricao:document.getElementById('funDescricao').value.trim(),tipo:document.getElementById('funTipo').value,status:rgVal('funStatusRG')};
if(funilEditIdx==null){rec.etapas=[];FUNIS.push(rec);funilSelIdx=FUNIS.length-1;}
else{Object.assign(FUNIS[funilEditIdx],rec);}
closeFunilModal();renderFunisPanel();
});

/* Modal Etapa */
const etapaOverlay=document.getElementById('etapaOverlay');
let etapaEditIdx=null;
document.querySelectorAll('#etpIconeRG .radio-opt,#etpObrigRG .radio-opt,#etpAtivaRG .radio-opt,#etpAvancarRG .radio-opt').forEach(opt=>opt.addEventListener('click',()=>{opt.parentElement.querySelectorAll('.radio-opt').forEach(o=>o.classList.remove('sel'));opt.classList.add('sel');}));
document.querySelectorAll('#etpCamposCk .cfg-check-item').forEach(ci=>ci.addEventListener('click',e=>{e.preventDefault();ci.classList.toggle('on');}));
function updateTipoResumo(nomeTipo){
const t=tipoByName(nomeTipo);
const el=document.getElementById('tipoResumoContent');
if(!t){el.innerHTML='<div style="font-size:12.5px;color:#98a4b6">Selecione um tipo para ver o resumo.</div>';return}
el.innerHTML='<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px"><span style="font-size:22px;line-height:1">'+t.icone+'</span><b style="font-size:14px;color:var(--body-strong)">'+esc(t.nome)+'</b></div>'+
'<div style="font-size:12.5px;color:var(--body);margin-bottom:14px">'+esc(t.descricao)+'</div>'+
'<div style="display:flex;align-items:center;gap:8px;margin-bottom:14px"><span style="width:16px;height:16px;border-radius:5px;background:'+t.cor+';display:inline-block;flex-shrink:0"></span><span style="font-size:12px;color:#68758a">Cor do tipo</span></div>'+
'<div style="font-size:11px;font-weight:700;color:#68758a;text-transform:uppercase;letter-spacing:.3px;margin-bottom:6px">Objetivo</div>'+
'<div style="font-size:12.5px;color:var(--body);margin-bottom:14px">'+esc(t.objetivo||'—')+'</div>'+
'<div style="font-size:11px;font-weight:700;color:#68758a;text-transform:uppercase;letter-spacing:.3px;margin-bottom:8px">Exemplo de utilização</div>'+
'<div style="display:flex;flex-wrap:wrap;gap:6px">'+(t.exemplos&&t.exemplos.length?t.exemplos.map(x=>'<span class="chip-soft">'+esc(x)+'</span>').join(''):'<span style="font-size:12px;color:#98a4b6">—</span>')+'</div>';
}
function openEtapaModal(idx){
etapaEditIdx=idx;
const arr=FUNIS[funilSelIdx].etapas;
const e=idx!=null?arr[idx]:{nome:'',cor:'#0ea5b7',icone:'user-plus',descricao:'',sla:'',obrigatoria:'Sim',ativa:'Sim',avancarQualquer:'Não',campos:[],tipo:''};
document.getElementById('etapaModalTitle').textContent=idx==null?'Nova Etapa':'Editar Etapa';
document.getElementById('etpNome').value=e.nome;
document.getElementById('etpCor').value=e.cor;
document.getElementById('etpDescricao').value=e.descricao;
document.getElementById('etpSla').value=e.sla;
rgSet('etpIconeRG',e.icone);rgSet('etpObrigRG',e.obrigatoria);rgSet('etpAtivaRG',e.ativa);rgSet('etpAvancarRG',e.avancarQualquer);
document.querySelectorAll('#etpCamposCk .cfg-check-item').forEach(ci=>ci.classList.toggle('on',(e.campos||[]).includes(ci.dataset.val)));
const tipoSel=document.getElementById('etpTipo');
const ativos=TIPOS_ETAPA.filter(t=>t.status==='Ativo');
tipoSel.innerHTML=ativos.map(t=>'<option value="'+escA(t.nome)+'"'+(t.nome===e.tipo?' selected':'')+'>'+esc(t.icone)+' '+esc(t.nome)+'</option>').join('');
if(!e.tipo&&ativos.length)tipoSel.value=ativos[0].nome;
updateTipoResumo(tipoSel.value);
etapaOverlay.classList.add('open');
}
document.getElementById('etpTipo').addEventListener('change',e=>updateTipoResumo(e.target.value));
function closeEtapaModal(){etapaOverlay.classList.remove('open')}
document.getElementById('etapaCloseBtn').addEventListener('click',closeEtapaModal);
document.getElementById('etapaCancel').addEventListener('click',closeEtapaModal);
etapaOverlay.addEventListener('click',e=>{if(e.target===etapaOverlay)closeEtapaModal()});
document.getElementById('etapaSave').addEventListener('click',()=>{
const nome=document.getElementById('etpNome').value.trim();
if(!nome){document.getElementById('etpNome').classList.add('err');return}
document.getElementById('etpNome').classList.remove('err');
const campos=[...document.querySelectorAll('#etpCamposCk .cfg-check-item.on')].map(x=>x.dataset.val);
const rec={nome:nome,cor:document.getElementById('etpCor').value,icone:rgVal('etpIconeRG'),descricao:document.getElementById('etpDescricao').value.trim(),sla:document.getElementById('etpSla').value.trim(),obrigatoria:rgVal('etpObrigRG'),ativa:rgVal('etpAtivaRG'),avancarQualquer:rgVal('etpAvancarRG'),campos:campos,tipo:document.getElementById('etpTipo').value};
const arr=FUNIS[funilSelIdx].etapas;
if(etapaEditIdx==null)arr.push(rec);else Object.assign(arr[etapaEditIdx],rec);
closeEtapaModal();renderFunisPanel();
});

/* Modal Tipo de Etapa */
const tipoOverlay=document.getElementById('tipoOverlay');
let tipoEditIdx=null;
document.querySelectorAll('#tipStatusRG .radio-opt').forEach(opt=>opt.addEventListener('click',()=>{opt.parentElement.querySelectorAll('.radio-opt').forEach(o=>o.classList.remove('sel'));opt.classList.add('sel');}));
function openTipoModal(idx){
tipoEditIdx=idx;
const t=idx!=null?TIPOS_ETAPA[idx]:{nome:'',descricao:'',cor:'#3b82f6',icone:'',objetivo:'',exemplos:[],status:'Ativo'};
document.getElementById('tipoModalTitle').textContent=idx==null?'Novo Tipo':'Editar Tipo';
document.getElementById('tipNome').value=t.nome;
document.getElementById('tipDescricao').value=t.descricao;
document.getElementById('tipCor').value=t.cor;
document.getElementById('tipObjetivo').value=t.objetivo||'';
document.getElementById('tipExemplos').value=(t.exemplos||[]).join(', ');
rgSet('tipStatusRG',t.status);
tipoOverlay.classList.add('open');
}
function closeTipoModal(){tipoOverlay.classList.remove('open')}
document.getElementById('tipoCloseBtn').addEventListener('click',closeTipoModal);
document.getElementById('tipoCancel').addEventListener('click',closeTipoModal);
tipoOverlay.addEventListener('click',e=>{if(e.target===tipoOverlay)closeTipoModal()});
document.getElementById('tipoSave').addEventListener('click',()=>{
const nome=document.getElementById('tipNome').value.trim();
if(!nome){document.getElementById('tipNome').classList.add('err');return}
document.getElementById('tipNome').classList.remove('err');
const exemplos=document.getElementById('tipExemplos').value.split(',').map(s=>s.trim()).filter(Boolean);
const rec={nome:nome,descricao:document.getElementById('tipDescricao').value.trim(),cor:document.getElementById('tipCor').value,icone:(tipoEditIdx!=null?TIPOS_ETAPA[tipoEditIdx].icone:'')||'●',objetivo:document.getElementById('tipObjetivo').value.trim(),exemplos:exemplos,status:rgVal('tipStatusRG')};
if(tipoEditIdx==null)TIPOS_ETAPA.push(rec);else Object.assign(TIPOS_ETAPA[tipoEditIdx],rec);
closeTipoModal();renderFunisPanel();
});

/* Modal Próxima Ação (Biblioteca) */
const proxAcaoOverlay=document.getElementById('proxAcaoOverlay');
let proxAcaoEditIdx=null;
const paPrazoRGEl=document.getElementById('paPrazoRG');
if(paPrazoRGEl)paPrazoRGEl.querySelectorAll('.radio-opt').forEach(opt=>opt.addEventListener('click',()=>{
document.getElementById('paPrazoCustomWrap').style.display=opt.dataset.val==='Personalizado'?'block':'none';
}));
function openProxAcaoModal(idx){
proxAcaoEditIdx=idx;
const p=idx!=null?PROX_ACOES[idx]:{nome:'',descricao:'',tipo:'Ligação',prazo:'15 minutos',prioridade:'Normal',automatica:'Não',status:'Ativo'};
document.getElementById('proxAcaoModalTitle').textContent=idx==null?'Nova Próxima Ação':'Editar Próxima Ação';
document.getElementById('paNome').value=p.nome;
document.getElementById('paDescricao').value=p.descricao||'';
rgSet('paTipoRG',p.tipo);
const prazoPadrao=PA_PRAZOS.includes(p.prazo)?p.prazo:'Personalizado';
rgSet('paPrazoRG',prazoPadrao);
document.getElementById('paPrazoCustomWrap').style.display=prazoPadrao==='Personalizado'?'block':'none';
document.getElementById('paPrazoCustom').value=prazoPadrao==='Personalizado'?p.prazo:'';
rgSet('paPrioridadeRG',p.prioridade);
rgSet('paAutoRG',p.automatica);
rgSet('paStatusRG',p.status);
proxAcaoOverlay.classList.add('open');
}
function closeProxAcaoModal(){proxAcaoOverlay.classList.remove('open')}
document.getElementById('proxAcaoCloseBtn').addEventListener('click',closeProxAcaoModal);
document.getElementById('proxAcaoCancel').addEventListener('click',closeProxAcaoModal);
proxAcaoOverlay.addEventListener('click',e=>{if(e.target===proxAcaoOverlay)closeProxAcaoModal()});
document.getElementById('proxAcaoSave').addEventListener('click',()=>{
const nome=document.getElementById('paNome').value.trim();
if(!nome){document.getElementById('paNome').classList.add('err');return}
document.getElementById('paNome').classList.remove('err');
const prazoSel=rgVal('paPrazoRG');
const prazo=prazoSel==='Personalizado'?(document.getElementById('paPrazoCustom').value.trim()||'Personalizado'):prazoSel;
const rec={nome:nome,descricao:document.getElementById('paDescricao').value.trim(),tipo:rgVal('paTipoRG'),prazo:prazo,prioridade:rgVal('paPrioridadeRG'),automatica:rgVal('paAutoRG'),status:rgVal('paStatusRG')};
if(proxAcaoEditIdx==null)PROX_ACOES.push(rec);else Object.assign(PROX_ACOES[proxAcaoEditIdx],rec);
closeProxAcaoModal();renderFunisPanel();
});

renderFunisPanel();
