import os
import re

docs_root = "docs/devops"

for root, dirs, files in os.walk(docs_root):
    for filename in files:
        if not filename.endswith(".md"):
            continue
        filepath = os.path.join(root, filename)
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()

        h1_match = re.search(r'^# (.+)$', content, re.MULTILINE)
        title = h1_match.group(1).strip() if h1_match else filename.replace(".md", "").replace("-", " ").title()
        pos_match = re.match(r'^(\d+)-', filename)
        position = int(pos_match.group(1)) if pos_match else 1
        sidebar_label = title

        if content.startswith("---"):
            fm_end = content.find("---", 3)
            if fm_end != -1:
                rest = content[fm_end+3:]
                new_content = f"---\nsidebar_label: {sidebar_label}\nsidebar_position: {position}\n---\n{rest}"
            else:
                new_content = f"---\nsidebar_label: {sidebar_label}\nsidebar_position: {position}\n---\n{content}"
        else:
            new_content = f"---\nsidebar_label: {sidebar_label}\nsidebar_position: {position}\n---\n{content}"

        with open(filepath, "w", encoding="utf-8") as f:
            f.write(new_content)
        print(f"Fixed: {filepath}")

print("Done.")
