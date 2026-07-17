import os

# Fix index.html
filepath = os.path.join(os.path.dirname(__file__), 'index.html')
with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
    content = f.read()

# Map corrupted sequences to correct characters
fixes = {
    'â¢': '•',   # bullet
    'â': '—',   # em dash
    'â¥': '≥',   # greater or equal
    'ð¡': '\U0001f4a1',  # 💡
    'ð': '\U0001f4ca',  # 📊
    'ð': '\U0001f4cb',  # 📋
    'ð§': '\U0001f527',  # 🔧
    'ð': '\U0001f3c6',  # 🏆
    'ð': '\U0001f389',  # 🎉
    'ð¤': '\U0001f916',  # 🤖
    'ðµ': '\U0001f3b5',  # 🎵
    'ð¬': '\U0001f3ac',  # 🎬
    'ð': '\U0001f50d',  # 🔍
    'ð¸': '\U0001f4f8',  # 📸
    'ð°': '\U0001f4c8',  # 📈
    'ð±': '\U0001f4c9',  # 📉
    'ð¥': '\U0001f44d',  # 👍
    'ðº': '\U0001f5fa',  # 🗺️
    'ð': '\U0001f451',  # 👑
    'ð¢': '\U0001f4a2',  # 💢
}

for bad, good in fixes.items():
    content = content.replace(bad, good)

# Also fix standalone broken sequences
content = content.replace('â¢', '•')
content = content.replace('â', '—')
content = content.replace('â¥', '≥')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

remaining = 0
for seq in fixes.values():
    remaining += content.count(seq)

print(f'Fixed index.html ({len(content)} bytes)')

# Fix style.css
filepath2 = os.path.join(os.path.dirname(__file__), 'style.css')
with open(filepath2, 'r', encoding='utf-8', errors='replace') as f:
    css = f.read()

for bad, good in fixes.items():
    css = css.replace(bad, good)
css = css.replace('â¢', '•')
css = css.replace('â', '—')
css = css.replace('â¥', '≥')

with open(filepath2, 'w', encoding='utf-8') as f:
    f.write(css)

print(f'Fixed style.css ({len(css)} bytes)')
print('Done!')
