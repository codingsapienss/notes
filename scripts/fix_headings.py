import os
import re

directories = [
    r"docs/dsa/basics/hashing",
    r"docs/web-dev/javascript/Prototypes & Inheritance",
    r"docs/devops"
]

def fix_file(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    lines = content.splitlines()
    first_heading_idx = -1
    has_h1 = False
    
    # First pass: find the first heading and check if there are any H1s
    for idx, line in enumerate(lines):
        if line.startswith("#"):
            parts = line.split(" ", 1)
            if len(parts) > 1 and all(c == "#" for c in parts[0]):
                if first_heading_idx == -1:
                    first_heading_idx = idx
                if parts[0] == "#":
                    has_h1 = True

    if first_heading_idx == -1:
        # No headings in file
        return False

    new_lines = []
    heading_count = 0
    modified = False

    for idx, line in enumerate(lines):
        is_heading = False
        if line.startswith("#"):
            parts = line.split(" ", 1)
            if len(parts) > 1 and all(c == "#" for c in parts[0]):
                is_heading = True
                level = len(parts[0])
                content_text = parts[1]
                
                if idx == first_heading_idx:
                    # This is the page title heading
                    if level != 1:
                        # Change first heading to H1 if it isn't already
                        new_line = "# " + content_text
                        new_lines.append(new_line)
                        modified = True
                    else:
                        new_lines.append(line)
                else:
                    # For subsequent headings
                    if has_h1:
                        # Shift level down (increment # count)
                        new_level = level + 1
                        new_line = "#" * new_level + " " + content_text
                        new_lines.append(new_line)
                        modified = True
                    else:
                        # If there were no H1s, keep the H2s as is
                        new_lines.append(line)
            else:
                new_lines.append(line)
        else:
            new_lines.append(line)

    if modified:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write("\n".join(new_lines) + "\n")
        print(f"Updated: {filepath}")
        return True
    return False

def main():
    updated_count = 0
    # Determine the script directory to run relatively from repository root
    script_dir = os.path.dirname(os.path.abspath(__file__))
    repo_root = os.path.dirname(script_dir)
    
    for relative_dir in directories:
        directory = os.path.join(repo_root, relative_dir)
        if not os.path.exists(directory):
            continue
        for root, _, files in os.walk(directory):
            for file in files:
                if file.endswith(".md"):
                    filepath = os.path.join(root, file)
                    if fix_file(filepath):
                        updated_count += 1
    print(f"Total files updated: {updated_count}")

if __name__ == "__main__":
    main()
