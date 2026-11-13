const S = `[{ id: 1, name: 'Ana', course: 'BSCS' },{ id: 2, name: 'Ben', course: 'BSIT' },{ id: 3, name: 'Cara', course: 'BSCS' }]`
export default {
  'node-01': `const add=(a,b)=>a+b; const isEven=n=>n%2===0; const average=a=>a.length?a.reduce((s,n)=>s+n,0)/a.length:0; module.exports={add,isEven,average}`,
  'node-02': `const fs=require('fs');
const nums=p=>fs.readFileSync(p,'utf8').split('\\n').map(Number);
const countLines=p=>nums(p).length; const averageGrade=p=>nums(p).reduce((a,b)=>a+b,0)/nums(p).length;
const saveReport=(i,o)=>fs.writeFileSync(o,'Average: '+averageGrade(i));
const safeRead=p=>{try{return fs.readFileSync(p,'utf8')}catch{return null}};
module.exports={countLines,averageGrade,saveReport,safeRead}`,
  'node-03': `const EventEmitter=require('events'); const registrar=new EventEmitter(); const enrolled=[];
registrar.on('enroll',n=>{ if(!enrolled.includes(n)) enrolled.push(n) });
registrar.on('drop',n=>{ const i=enrolled.indexOf(n); if(i>=0) enrolled.splice(i,1) });
module.exports={registrar,enrolled}`,
  'node-04': `const http=require('http');
const server=http.createServer((req,res)=>{ const send=(c,o)=>{res.writeHead(c,{'Content-Type':'application/json'});res.end(JSON.stringify(o))};
 if(req.method==='GET'&&req.url==='/hello') return send(200,{message:'Hello, Node!'});
 if(req.method==='GET'&&req.url==='/time') return send(200,{year:new Date().getFullYear()});
 send(404,{error:'Not found'}) });
module.exports=server`,
  'node-05': `const express=require('express'); const app=express(); const students=${S};
app.get('/api/students',(req,res)=>{ const c=req.query.course; res.json(c?students.filter(s=>s.course===c):students) });
app.get('/api/students/:id',(req,res)=>{ const s=students.find(s=>s.id===Number(req.params.id)); if(!s) return res.status(404).json({error:'Student not found'}); res.json(s) });
module.exports=app`,
  'node-06': `const express=require('express'); const app=express(); app.use(express.json()); let students=${S};
app.get('/api/students',(req,res)=>res.json(students));
app.post('/api/students',(req,res)=>{ const {name,course}=req.body; if(!name||!course) return res.status(400).json({error:'name and course are required'}); const s={id:Math.max(...students.map(s=>s.id))+1,name,course}; students.push(s); res.status(201).json(s) });
app.put('/api/students/:id',(req,res)=>{ const s=students.find(s=>s.id===Number(req.params.id)); if(!s) return res.status(404).json({error:'Student not found'}); Object.assign(s,req.body); res.json(s) });
app.delete('/api/students/:id',(req,res)=>{ const n=students.length; students=students.filter(s=>s.id!==Number(req.params.id)); if(students.length===n) return res.status(404).json({error:'Student not found'}); res.status(204).end() });
module.exports=app`,
}
