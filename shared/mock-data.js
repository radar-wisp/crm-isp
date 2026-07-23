/* ============================================================
 * Dados fictícios (mock/seed) usados por Leads, Funil e Fluxo da Venda
 * Extraído do <script> original (bloco contíguo, ordem de execução
 * preservada). Nenhuma linha de lógica foi reescrita.
 * ============================================================ */
const PLAT={
meta:{l:'Meta Ads',c:'pf-meta',s:'<path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zM2 12h20"/><path d="M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20z"/>'},
google:{l:'Google Ads',c:'pf-google',s:'<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>'},
ig:{l:'Instagram',c:'pf-ig',s:'<rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/>'},
site:{l:'Site',c:'pf-site',s:'<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20z"/>'},
wa:{l:'WhatsApp',c:'pf-tel',s:'<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>'}
};
const ORIG={meta:'Anúncio pago',google:'Anúncio pago',ig:'Orgânico',site:'Site institucional',wa:'Indicação'};
const STAT=[['Novo','b-new'],['Em contato','b-contact'],['Em negociação','b-neg'],['Convertido','b-won'],['Perdido','b-lost']];
const CAMP=['Fibra 500 · Julho','Black Friday Internet','Combo Empresarial','Indique e Ganhe'];
const VEND=['Renatha Loiola','Ana Lima','João Prado','Carla Dias','Pedro Nunes'];
const GRAD=['#0ea5b7,#14c8dd','#7c5cf6,#9d7bff','#ec4899,#f472b6','#22c55e,#4ade80','#f59e0b,#fbbf24','#334c7a,#4f6aa8'];
const FN=['Juliana','Marcos','Carla','Fernando','Patrícia','Bruno','Renata','Diego','Amanda','Thiago','Gabriel','Camila','Lucas','Beatriz','Rodrigo','Letícia','Eduardo','Marina','Felipe','Vanessa','Igor','Priscila','André','Tatiane','Márcio','Sabrina','Otávio','Débora','Henrique','Larissa'];
const LN=['Souza','Ribeiro','Andrade','Lima','Teixeira','Gomes','Alves','Cardoso','Costa','Pereira','Silva','Nunes','Martins','Rocha','Barros','Tavares','Freitas','Castro','Moreira','Pinto'];
const pk=a=>a[Math.floor(Math.random()*a.length)];
const RUAS=['Rua 10','Av. Anhanguera','Rua 84','Av. T-63','Rua das Palmeiras','Av. Goiás','Rua 15','Rua C-205'];
const BAIRROS=['Setor Central','Setor Bueno','Setor Oeste','Jardim Goiás','Setor Sul','Setor Marista'];
const CIDADES=['Goiânia - GO','Anápolis - GO','Jaraguá - GO','Ceres - GO'];
const PAIS=['José','Antônio','Carlos','Paulo','Marcos','Luiz','Sérgio'];
const MAES=['Maria','Ana','Fátima','Sônia','Cláudia','Regina','Helena'];
const cpfGen=()=>String(Math.floor(100+Math.random()*899))+'.'+String(Math.floor(100+Math.random()*899))+'.'+String(Math.floor(100+Math.random()*899))+'-'+String(Math.floor(10+Math.random()*89));
const telGen=()=>'(62) 9'+(8000+Math.floor(Math.random()*1999))+'-'+(1000+Math.floor(Math.random()*8999));
const LEADS=[];
const platKeys=Object.keys(PLAT);
for(let i=0;i<132;i++){
const fn=pk(FN),ln=pk(LN);
const p=pk(platKeys);
const d=17-Math.floor(i/12);
const cep=String(74000+Math.floor(Math.random()*8999)).replace(/(\d{5})(\d{3})/, '$1-$2');
const rua=pk(RUAS),num=String(10+Math.floor(Math.random()*900)),bairro=pk(BAIRROS),cidUf=pk(CIDADES);
const cidade=cidUf.split(' - ')[0],uf=cidUf.split(' - ')[1];
LEADS.push({
name:fn+' '+ln,
ini:(fn[0]+ln[0]).toUpperCase(),
grad:pk(GRAD),
phone:telGen(),
plat:p,orig:ORIG[p],camp:pk(CAMP),stat:pk(STAT),vend:pk(VEND),
data:String(Math.max(d,1)).padStart(2,'0')+'/07/2026',
cpf:cpfGen(),
nasc:(1970+Math.floor(Math.random()*35))+'-'+String(1+Math.floor(Math.random()*12)).padStart(2,'0')+'-'+String(1+Math.floor(Math.random()*28)).padStart(2,'0'),
pai:pk(PAIS)+' '+ln,
mae:pk(MAES)+' '+ln,
tel2:telGen(),tel3:telGen(),
email:fn.toLowerCase()+'.'+ln.toLowerCase()+'@email.com',
cep:cep,rua:rua,num:num,bairro:bairro,cidade:cidade,uf:uf,
end:rua+', nº '+num+', '+bairro+', '+cidUf
});
}
