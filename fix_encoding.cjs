const fs = require('fs');
const files = ['index.html', 'admin.html', 'js/admin.js'];

const map = {
  'ðŸ”§': '🔧',
  'âš¡': '⚡',
  'ðŸ“‹': '📋',
  'ðŸ—“': '📅',
  'ðŸ“ˆ': '📈',
  'ðŸ”’': '🔒',
  'ðŸ“½': '📸',
  'ðŸ‘¥': '👥',
  'ðŸ †': '🏆',
  'â˜€ï¸ ': '☀️',
  'ðŸ’¡': '💡',
  'âœ…': '✅',
  'âš ï¸ ': '⚠️',
  'â Œ': '❌',
  'ðŸ’¾': '💾',
  'ðŸ—‘ï¸ ': '🗑️',
  'ðŸ“¥': '📥',
  'âœ ï¸ ': '✏️',
  'â–¼': '▼',
  'â–¶': '▶'
};

for (const file of files) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;
    for (const [bad, good] of Object.entries(map)) {
      if (content.includes(bad)) {
        content = content.split(bad).join(good);
        changed = true;
      }
    }
    // Also check for the generic decode if needed:
    // Some are missed by the map, we can decode using buffers:
    // But map is safer.
    if (changed) {
      fs.writeFileSync(file, content, 'utf8');
      console.log('Fixed mojibake in', file);
    } else {
      console.log('No mojibake found in', file);
    }
  }
}
