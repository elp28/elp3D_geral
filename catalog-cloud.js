import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js';
import { getFirestore, collection, onSnapshot, query, orderBy } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js';
const config=window.ELP3D_FIREBASE_CONFIG;
if(config?.projectId&&config?.apiKey){
 try {
  const db=getFirestore(initializeApp(config,'elp3d-public'));
  onSnapshot(query(collection(db,'products'),orderBy('sortOrder','asc')),snap=>{
   if(snap.empty)return; // mantém produtos originais até o administrador publicar um catálogo
   const items=snap.docs.map(d=>({...d.data(),id:d.id})).filter(p=>p.active!==false);
   if(typeof window.elp3dApplyCatalog==='function')window.elp3dApplyCatalog(items);
  },err=>console.warn('Catálogo temporariamente indisponível.',err.code));
 } catch(err){console.warn('Catálogo local ativo.',err.message)}
}
