const page = (body, css) => `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>P</title><style>${css}</style></head><body>${body}</body></html>`
export default {
  'css-01': page('<h1>Campus News</h1><p class="lead">Enrollment opens on Monday.</p><p id="note">Bring your ID.</p>', 'h1{color:navy;text-align:center}.lead{font-size:20px}#note{background-color:yellow}'),
  'css-02': page('<div class="card"><h2>Ana</h2><p>BSCS</p></div>', '.card{width:300px;padding:16px;border:2px solid #333;margin:24px auto;border-radius:12px;box-sizing:border-box}'),
  'css-03': page('<nav class="nav"><strong class="logo">WebPath</strong><ul class="links"><li><a href="#">Home</a></li><li><a href="#">Tracks</a></li><li><a href="#">Profile</a></li></ul></nav>', '.nav{display:flex;justify-content:space-between;align-items:center}.links{display:flex;gap:16px;list-style:none;padding:0}'),
  'css-04': page('<div class="gallery"><div class="item wide">1</div><div class="item">2</div><div class="item">3</div><div class="item">4</div><div class="item">5</div></div>', '.item{background:#dbeafe;padding:20px}.gallery{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.wide{grid-column:span 2}'),
  'css-05': page('<button class="btn">Enroll now</button>', '.btn{background-color:green;color:white;border:none;border-radius:8px;cursor:pointer;transition:background-color .2s}.btn:hover{background-color:darkgreen}'),
  'css-06': page('<h1 class="title">Web Programming</h1><div class="cols"><section>Lecture</section><section>Laboratory</section></div>', ':root{--brand:#0a7a5a}.title{color:var(--brand)}.cols{display:flex;gap:20px}@media (max-width: 600px){.cols{flex-direction:column}}'),
}
