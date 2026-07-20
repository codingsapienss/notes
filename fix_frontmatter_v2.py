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

        # Extract title from first H1 if present
        h1_match = re.search(r'^# (.+)$', content, re.MULTILINE)
        title = h1_match.group(1).strip() if h1_match else filename.replace(".md", "").replace("-", " ").title()

        # Position from filename
        pos_match = re.match(r'^(\d+)-', filename)
        position = int(pos_match.group(1)) if pos_match else 1

        sidebar_label = title

        # Check if frontmatter exists
        if content.startswith("---"):
            fm_end = content.find("---", 3)
            if fm_end != -1:
                old_fm = content[3:fm_end]
                rest = content[fm_end+3:]
                # Strip old frontmatter completely and replace with clean one
                new_content = f"---\nsidebar_label: {sidebar_label}\nsidebar_position: {position}\n---\n{rest}"
            else:
                # Malformed, replace everything before first H1
                new_content = f"---\nsidebar_label: {sidebar_label}\nsidebar_position: {position}\n---\n{content}"
        else:
            # No frontmatter, prepend it
            new_content = f"---\nsidebar_label: {sidebar_label}\nsidebar_position: {position}\n---\n{content}"

        with open(filepath, "w", encoding="utf-8") as f:
            f.write(new_content)
        print(f"Fixed: {filepath}")

print("Done.")
