import os
import re
import json

docs_root = "docs/devops"

# Step 1: Create _category_.json for each subfolder
for root, dirs, files in os.walk(docs_root):
    # Only process immediate subdirectories of devops
    if root == docs_root:
        for d in dirs:
            cat_path = os.path.join(root, d, "_category_.json")
            if not os.path.exists(cat_path):
                label = d.replace("-", " ").replace("_", " ").title()
                # Map specific folder names to nicer labels
                label_map = {
                    "part-00-cheatsheet": "Cheatsheet",
                    "part-01-foundations": "Foundations",
                    "part-02-linux-administration": "Linux Administration",
                    "part-03-networking": "Networking",
                    "part-04-security": "Security",
                    "part-05-development-environment": "Development Environment",
                    "part-06-nginx": "Nginx",
                    "part-07-cloud": "Cloud",
                    "part-08-deployment": "Deployment",
                    "part-09-monitoring": "Monitoring",
                    "part-10-troubleshooting": "Troubleshooting",
                    "part-11-reference": "Reference",
                    "part-12-interview": "Interview Prep",
                }
                if d in label_map:
                    label = label_map[d]
                with open(cat_path, "w", encoding="utf-8") as f:
                    json.dump({"label": label, "position": int(d.split("-")[1])}, f, indent=2)
                    f.write("\n")
                print(f"Created _category_.json: {cat_path}")

# Step 2: Fix frontmatter in all devops md files
for root, dirs, files in os.walk(docs_root):
    for filename in files:
        if not filename.endswith(".md"):
            continue
        filepath = os.path.join(root, filename)
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()

        # Extract title from first H1 if no frontmatter
        h1_match = re.search(r'^# (.+)$', content, re.MULTILINE)
        title = h1_match.group(1).strip() if h1_match else filename.replace(".md", "").replace("-", " ").title()

        # Determine position from filename (e.g., 01-why-linux.md -> 1)
        pos_match = re.match(r'^(\d+)-', filename)
        position = int(pos_match.group(1)) if pos_match else 1

        sidebar_label = title

        # Check if frontmatter exists
        if content.startswith("---"):
            # Find end of frontmatter
            fm_end = content.find("---", 3)
            if fm_end != -1:
                old_fm = content[3:fm_end]
                rest = content[fm_end+3:]
                # Fix keywords YAML if present
                new_fm = re.sub(r'keywords:\s*\n\s*\n', 'keywords: []\n', old_fm)
                # Remove empty keywords lists with bare * items
                new_fm = re.sub(r'keywords: \[\]\s*\n', '', new_fm)
                # Add sidebar_label and sidebar_position
                if 'sidebar_label' not in new_fm:
                    new_fm = f"sidebar_label: {sidebar_label}\n" + new_fm
                if 'sidebar_position' not in new_fm:
                    new_fm = f"sidebar_position: {position}\n" + new_fm
                new_content = f"---{new_fm}---{rest}"
            else:
                # Malformed frontmatter, replace entirely
                new_content = f"---\nsidebar_label: {sidebar_label}\nsidebar_position: {position}\n---\n{content}"
        else:
            # No frontmatter, add it
            # Remove the H1 from content since Docusaurus uses frontmatter title
            new_content = f"---\nsidebar_label: {sidebar_label}\nsidebar_position: {position}\n---\n{content}"

        with open(filepath, "w", encoding="utf-8") as f:
            f.write(new_content)
        print(f"Fixed frontmatter: {filepath}")

print("Done fixing frontmatter and creating categories.")
