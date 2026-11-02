import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js';
import { getFirestore, collection, doc, setDoc, addDoc, deleteDoc, onSnapshot, query, orderBy } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js';
const $=s=>document.querySelector(s);
const money=v=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(v||0);
const fmtDate=d=>{const [y,m,day]=d.split('-');return [day,m,y].join('/')};
const config=window.ELP3D_FIREBASE_CONFIG;
const adminUid=window.ELP3D_ADMIN_UID;
let db,auth,products=[],sales=[],unsubscribe=[],currentUser=null;
const defaults=[
{id:'estrela',name:'Estrela Sensorial',price:25,category:'Sensoriais',description:'Estrela sensorial com design geométrico e movimento agradável para explorar com as mãos.',image:'assets/estrela.webp'},
{id:'ovo-dragao',name:'Ovo de Dragão Articulado',price:25,category:'Decoração',description:'Um ovo especial que abre e revela seu interior. Uma peça divertida e cheia de fantasia.',image:'assets/ovo-dragao.webp'},
{id:'suporte-controle',name:'Suporte para Controle',price:40,category:'Acessórios',description:'Organize e destaque seu controle. Opções para Xbox e PlayStation.',image:'assets/suporte-controle.webp'},
{id:'decoracoes',name:'Decorações Personalizadas',price:60,category:'Decoração',description:'Peças para valorizar seus espaços. Modelo inspirado na Mercedes-Benz nas fotos.',image:'assets/decoracoes.webp'},
{id:'animais-sensoriais',name:'Animais Sensoriais',price:20,category:'Sensoriais',description:'Animais articulados com texturas e movimentos agradáveis de manipular.',image:'assets/animais-sensoriais.webp'},
{id:'chaveiro-celular',name:'Chaveiro Suporte de Celular',price:20,category:'Acessórios',description:'Pequeno, prático e personalizável com nome, marca ou @ do Instagram.',image:'assets/chaveiro-celular.webp'},
{id:'chaveiros',name:'Chaveiros Criativos',price:10,category:'Acessórios',description:'Miniaturas e formatos variados para levar sua personalidade aonde for.',image:'assets/chaveiros.webp'},
{id:'cubos-sensoriais',name:'Cubos Sensoriais',price:20,category:'Sensoriais',description:'Cubos articulados desestressantes para mexer com as mãos e explorar diferentes movimentos.',image:'assets/cubos-sensoriais.webp'},
{id:'estrela-giratoria',name:'Estrela Giratória',price:30,category:'Sensoriais',description:'Estrela sensorial que gira para cima e para baixo, com um movimento envolvente.',image:'assets/estrela-giratoria.webp'}
];
function message(t){const e=$('#toast');e.textContent=t;e.classList.add('show');clearTimeout(message.timer);message.timer=setTimeout(()=>e.classList.remove('show'),3300)}
function feedback(id,t){$(id).textContent=t}
function show(id){$('#setup').hidden=id!=='setup';$('#loginPanel').hidden=id!=='login';$('#dashboard').hidden=id!=='dashboard';$('#logout').hidden=id!=='dashboard'}
const configured=!!(config?.apiKey&&config?.projectId&&adminUid&&adminUid!=='ADMIN_UID_SUBSTITUA_AQUI');
if(!configured){show('setup')}else{
 try{
  const app=initializeApp(config,'elp3d-admin');auth=getAuth(app);db=getFirestore(app);
  onAuthStateChanged(auth,user=>{
   unsubscribe.forEach(f=>f());unsubscribe=[];
   if(user&&user.uid===adminUid){currentUser=user;show('dashboard');subscribe();}
   else {currentUser=null;show('login');if(user)signOut(auth);}
  });
 }catch(e){show('setup');console.error('Firebase:',e)}
}
$('#loginForm').addEventListener('submit',async e=>{e.preventDefault();feedback('#loginError','');const b=e.submitter;b.disabled=true;try{await signInWithEmailAndPassword(auth,$('#email').value,$('#password').value)}catch(err){feedback('#loginError','Não foi possível entrar. Verifique suas credenciais e sua autorização.')}finally{b.disabled=false}});
$('#logout').addEventListener('click',()=>auth&&signOut(auth));
document.querySelectorAll('[data-tab]').forEach(btn=>btn.addEventListener('click',()=>{
 document.querySelectorAll('[data-tab]').forEach(b=>b.classList.toggle('active',b===btn));
 document.querySelectorAll('.tab-pane').forEach(p=>p.hidden=p.id!==btn.dataset.tab);
}));
function subscribe(){
 unsubscribe.push(onSnapshot(query(collection(db,'products'),orderBy('sortOrder','asc')),snap=>{products=snap.docs.map(d=>({id:d.id,...d.data()}));renderProducts();renderOverview()},e=>message('Falha ao carregar produtos: '+e.code)));
 unsubscribe.push(onSnapshot(query(collection(db,'sales'),orderBy('date','desc')),snap=>{sales=snap.docs.map(d=>({id:d.id,...d.data()}));renderSales();renderOverview()},e=>message('Falha ao carregar vendas: '+e.code)));
}
function row(title,subtitle,img){
 const el=document.createElement('article');el.className='list-row';
 if(img){const pic=document.createElement('img');pic.src=img;pic.alt=title;el.append(pic)}
 const info=document.createElement('div');info.className='info';const h=document.createElement('strong');h.textContent=title;const sub=document.createElement('small');sub.textContent=subtitle;info.append(h,sub);el.append(info);return el;
}
function action(text,callback,danger=false){const btn=document.createElement('button');btn.type='button';btn.textContent=text;if(danger)btn.className='danger';btn.addEventListener('click',callback);return btn}
function renderProducts(){const list=$('#productList');list.replaceChildren();if(!products.length){list.textContent='Nenhum produto importado. Use o botão abaixo para começar.';return}
 products.forEach(p=>{const el=row(p.name,money(p.price)+' · '+p.category+(p.active===false?' · Oculto':''),p.image);el.append(action('Editar',()=>editProduct(p)),action('Excluir',async()=>{if(!confirm('Excluir '+p.name+' do catálogo?'))return;try{await deleteDoc(doc(db,'products',p.id));message('Produto excluído')}catch(e){message('Não foi possível excluir: '+e.code)}},true));list.append(el)})}
function openEditor(){ $('#productForm').hidden=false;$('#productForm').scrollIntoView({behavior:'smooth',block:'start'})}
function resetEditor(){ $('#productForm').reset();$('#productId').value='';$('#productActive').checked=true;$('#productOrder').value=99;$('#productFormTitle').textContent='Novo produto';$('#productForm').hidden=true;feedback('#productFeedback','')}
$('#newProduct').addEventListener('click',()=>{resetEditor();openEditor()});$('#cancelProduct').addEventListener('click',resetEditor);
function editProduct(p){resetEditor();$('#productId').value=p.id;$('#productName').value=p.name;$('#productPrice').value=p.price;$('#productCategory').value=p.category;$('#productOrder').value=p.sortOrder??99;$('#productDescription').value=p.description;$('#productImageUrl').value=p.image||'';$('#productActive').checked=p.active!==false;$('#productFormTitle').textContent='Editar '+p.name;openEditor()}
$('#productForm').addEventListener('submit',async e=>{e.preventDefault();if(!currentUser)return;
 const b=$('#saveProduct');b.disabled=true;feedback('#productFeedback','Salvando…');
 try{
  const id=$('#productId').value||'item-'+crypto.randomUUID();const old=products.find(p=>p.id===id);
  const image=$('#productImageUrl').value.trim()||old?.image||'';
  const localAsset=/^assets\/[a-z0-9._-]+\.(?:webp|png|jpe?g|avif)$/i.test(image);
  if(!image||(!localAsset&&!image.startsWith('https://')))throw Error('Informe um caminho em assets/nome.webp ou um link de imagem https://. Envie o arquivo primeiro pelo GitHub.');
  const data={name:$('#productName').value.trim(),price:Number($('#productPrice').value),category:$('#productCategory').value,description:$('#productDescription').value.trim(),image,active:$('#productActive').checked,sortOrder:Number($('#productOrder').value)||0};
  if(!data.name||!data.description||!Number.isFinite(data.price)||data.price<0)throw Error('Verifique os dados do produto.');
  await setDoc(doc(db,'products',id),data);
  message('Produto salvo no catálogo');resetEditor();
 }catch(err){feedback('#productFeedback',err.message||'Erro ao salvar')}finally{b.disabled=false}});
$('#seedProducts').addEventListener('click',async e=>{if(products.length&&!confirm('Importar os produtos padrão sem substituir os existentes?'))return;const b=e.currentTarget;b.disabled=true;try{for(const [i,p] of defaults.entries()){if(products.some(x=>x.id===p.id))continue;const {id,...data}=p;await setDoc(doc(db,'products',id),{...data,sortOrder:i,active:true})}message('Catálogo original importado com sucesso')}catch(e){message('Falha na importação: '+e.code)}finally{b.disabled=false}});
const isoToday=()=>new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,10);
$('#saleDate').value=isoToday();
$('#saleForm').addEventListener('submit',async e=>{e.preventDefault();const b=e.submitter;b.disabled=true;feedback('#saleFeedback','Registrando…');try{const data={date:$('#saleDate').value,amount:Number($('#saleAmount').value),cost:Number($('#saleCost').value)||0,note:$('#saleNote').value.trim(),createdAt:new Date().toISOString()};if(!/^\d{4}-\d{2}-\d{2}$/.test(data.date)||!Number.isFinite(data.amount)||data.amount<=0||data.cost<0)throw Error('Confira a data e os valores.');await addDoc(collection(db,'sales'),data);$('#saleForm').reset();$('#saleDate').value=isoToday();feedback('#saleFeedback','Venda registrada.');message('Venda salva!')}catch(e){feedback('#saleFeedback',e.message||'Erro ao registrar')}finally{b.disabled=false}});
function renderSales(){const list=$('#salesList');list.replaceChildren();if(!sales.length){list.textContent='Nenhuma venda registrada ainda.';return}sales.slice(0,250).forEach(s=>{const el=row(money(s.amount),fmtDate(s.date)+' · '+(s.note||'Venda confirmada')+' · Custo '+money(s.cost));el.append(action('Excluir',async()=>{if(!confirm('Excluir esta venda?'))return;try{await deleteDoc(doc(db,'sales',s.id));message('Venda excluída')}catch(e){message('Erro: '+e.code)}},true));list.append(el)})}
function renderOverview(){const current=isoToday().slice(0,7);const mine=sales.filter(s=>s.date?.startsWith(current));const total=mine.reduce((n,s)=>n+Number(s.amount||0),0);const costs=mine.reduce((n,s)=>n+Number(s.cost||0),0);
 $('#monthRevenue').textContent=money(total);$('#monthProfit').textContent=money(total-costs);$('#monthSales').textContent=mine.length;$('#productCount').textContent=products.length;$('#monthTitle').textContent=current.split('-').reverse().join('/');
 const months=Array.from({length:6},(_,i)=>{const d=new Date(Number(current.slice(0,4)),Number(current.slice(5))-1-i,1);return d.toISOString().slice(0,7)}).reverse();
 const vals=months.map(m=>sales.filter(s=>s.date?.startsWith(m)).reduce((n,s)=>n+Number(s.amount||0),0));const max=Math.max(1,...vals);const chart=$('#revenueChart');chart.replaceChildren();
 months.forEach((m,i)=>{const line=document.createElement('div');line.className='bar-line';const label=document.createElement('span');const [y,mo]=m.split('-');label.textContent=mo+'/'+y.slice(-2);const track=document.createElement('div');track.className='bar-track';const fill=document.createElement('div');fill.className='bar-fill';fill.style.width=(100*vals[i]/max)+'%';track.append(fill);const number=document.createElement('strong');number.textContent=money(vals[i]);line.append(label,track,number);chart.append(line)})}
