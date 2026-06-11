const html = require('fs').readFileSync('portfolio.html','utf8');
const cats = {};
const re = /data-category="([^"]+)"/g;
let m;
while (m = re.exec(html)) {
  cats[m[1]] = (cats[m[1]] || 0) + 1;
}
console.log('Images per category:');
for (const [k, v] of Object.entries(cats)) {
  console.log(`  ${k}: ${v}`);
}
console.log(`  TOTAL: ${Object.values(cats).reduce((a,b)=>a+b, 0)}`);
