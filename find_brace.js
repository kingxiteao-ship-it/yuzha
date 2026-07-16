const fs = require('fs');
const lines = fs.readFileSync('E:/AI/记事本客户端/renderer/index.html', 'utf8').split('\n');
let s, e;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].trim() === '<script>') s = i;
  if (lines[i].trim() === '</script>') { e = i; break; }
}
const js = lines.slice(s + 1, e);
let stack = [];
for (let i = 0; i < js.length; i++) {
  const line = js[i];
  for (let j = 0; j < line.length; j++) {
    const ch = line[j];
    const pair = { '(': ')', '{': '}', '[': ']' };
    const close = { ')': true, '}': true, ']': true };
    if (pair[ch]) {
      stack.push({ ch, i: i + 1, ln: line });
    } else if (close[ch]) {
      if (stack.length === 0 || pair[stack[stack.length - 1].ch] !== ch) {
        console.log('UNEXPECTED ' + ch + ' at line ' + (i + 1));
        process.exit(0);
      } else {
        stack.pop();
      }
    }
  }
}
console.log('Remaining stack (' + stack.length + '):');
stack.forEach(x => console.log(x.ch + ' at line ' + x.i + ': ' + x.ln.substring(0, 60)));
