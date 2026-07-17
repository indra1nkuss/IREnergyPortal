const fs = require('fs');

function fixMojibake(filepath) {
    const buf = fs.readFileSync(filepath);
    let text = buf.toString('utf8');

    // Comprehensive mojibake map (double-encoded UTF-8 -> correct Unicode)
    const map = {
        // Box drawing characters (used in HTML comments)
        'Ã¢•Ã¢•Ã¢•': '═══',

        // Arrow character
        'Ã₠': '→',
        'Ã₹': '←',

        // Emojis (various mojibake patterns)
        'Ã¢¡': '⚡',    // ⚡
        'Ã‡': '✔',                    // ✔
        'Ã₢': '•',                    // •
        'Ãₔ': '—',                    // —
        'Ãₓ': '–',                    // –
        'Ã≥': '≥',                    // ≥

        // More common mojibake patterns for emojis
        'ð¡': '💡', // 💡
        'ðÊ': '📊', // 📊
        'ð': '📋', // 📋
        'ð§': '🔧', // 🔧
        'ð': '🏆', // 🏆
        'ð': '🎉', // 🎉
        'ð¤': '🤖', // 🤖
        'ðµ': '🎵', // 🎵
        'ð¬': '🎬', // 🎬
        'ð': '🔍', // 🔍
        'ð¸': '📸', // 📸
        'ðÈ': '📈', // 📈
        'ðÉ': '📉', // 📉
        'ð': '📞', // 📞
        'ð±': '📱', // 📱
        'ð': '😀', // 😀
        'ð': '😍', // 😍
        'ð¢': '😢', // 😢
        'ð®': '😎', // 😎

        // Sun/moon emoji
        'Ã': '☀',              // ☀
        'Ã': '☁',              // ☁
        'Ã°': '☰',              // ☰

        // Additional common patterns
        'Ã·': '·',              // ·
        'Ã© ': '’',              // '
        'Ã¨': '‘',                     // '
        'Ã ': '’',                     // '
    };

    let count = 0;
    for (const [bad, good] of Object.entries(map)) {
        while (text.includes(bad)) {
            text = text.replace(bad, good);
            count++;
        }
    }

    if (count > 0) {
        fs.writeFileSync(filepath, text, 'utf8');
        console.log('Fixed ' + filepath + ': ' + count + ' replacements');
    } else {
        console.log(filepath + ': no mojibake found');
    }
}

fixMojibake('index.html');
fixMojibake('style.css');
