const fs = require('fs');
const path = require('path');

function fixFile(filename) {
    const filepath = path.join(process.cwd(), filename);
    let content = fs.readFileSync(filepath, 'utf8');
    const fixes = {
        'â¢¡':'⚡',
        'â':'☀',
        'â°':'☰',
        'â¼':'▼',
        'â¶':'▶',
        'â¥':'≥',
        'â¢':'•',
        'â':'—',
        'â':'‘',
        'â':'’',
        'â':'“',
        'â':'”',
    };
    let count = 0;
    for (const [bad, good] of Object.entries(fixes)) {
        while (content.includes(bad)) { content = content.replace(bad, good); count++; }
    }
    if (count > 0) { fs.writeFileSync(filepath, content, 'utf8'); console.log('Fixed ' + filename + ': ' + count); }
    else console.log(filename + ': clean');
}
fixFile('index.html');
fixFile('style.css');
console.log('Done');
