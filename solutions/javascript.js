export default {
  'js-01': 'function toFahrenheit(c){return c*9/5+32}\nconst fullName=(a,b)=>`${a} ${b}`',
  'js-02': `function remark(s){ if(typeof s!=='number'||s<0||s>100) return 'Invalid'; if(s>=90) return 'Excellent'; if(s>=75) return 'Passed'; return 'Failed' }`,
  'js-03': `const itemNames=c=>c.map(i=>i.name); const affordable=(c,m)=>c.filter(i=>i.price<=m); const cartTotal=c=>c.reduce((s,i)=>s+i.price*i.qty,0)`,
  'js-04': `function wordCount(t){const o={};t.toLowerCase().replace(/[.,!?]/g,'').split(/\\s+/).filter(Boolean).forEach(w=>o[w]=(o[w]||0)+1);return o}
function topWord(t){return Object.entries(wordCount(t)).sort((a,b)=>b[1]-a[1])[0][0]}`,
  'js-05': `const c=document.querySelector('#count');let n=0;const show=()=>{c.textContent=n;c.classList.toggle('high',n>=5)};
document.querySelector('#add').addEventListener('click',()=>{n++;show()});document.querySelector('#reset').addEventListener('click',()=>{n=0;show()})`,
  'js-06': `async function getName(id){try{const s=await fetchStudent(id);return s.name.toUpperCase()}catch{return 'Unknown'}}
async function getNames(ids){return Promise.all(ids.map(getName))}`,
}
