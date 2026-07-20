import os
import subprocess
import random
from datetime import datetime, timedelta

# Usage:
#   python create_backdated_commits.py --start-date 2026-06-26 --end-date 2026-07-20 --min-per-day 5 --max-per-day 8
#
# This script stages actual changed files and creates real commits with backdated timestamps.
# It does NOT create empty commits. Each commit corresponds to a real file change in the working tree.

import argparse

parser = argparse.ArgumentParser()
parser.add_argument("--start-date", required=True, help="Start date YYYY-MM-DD")
parser.add_argument("--end-date", required=True, help="End date YYYY-MM-DD")
parser.add_argument("--min-per-day", type=int, default=5, help="Minimum commits per day")
parser.add_argument("--max-per-day", type=int, default=8, help="Maximum commits per day")
args = parser.parse_args()

start_date = datetime.strptime(args.start_date, "%Y-%m-%d")
end_date = datetime.strptime(args.end_date, "%Y-%m-%d")
min_per_day = args.min_per_day
max_per_day = args.max_per_day

# Collect real changed files (untracked + modified)
result = subprocess.run(["git", "status", "--porcelain"], capture_output=True, text=True, check=True)
lines = result.stdout.strip().splitlines()
files = []
for line in lines:
    status = line[:2]
    path = line[3:]
    if status == "??":  # untracked
        files.append((path, f"Add {os.path.basename(path)}"))
    elif status == " M":  # modified
        basename = os.path.basename(path)
        folder = os.path.basename(os.path.dirname(path))
        files.append((path, f"Update {basename} in {folder}"))
    elif status == "A ":
        files.append((path, f"Add {os.path.basename(path)}"))

if not files:
    print("No changed files to commit. Make changes first.")
    exit(1)

random.seed(42)
random.shuffle(files)

total_days = (end_date - start_date).days + 1
dates = [start_date + timedelta(days=i) for i in range(total_days)]

commits_per_day = []
remaining = len(files)
idx = 0

for day_idx, date in enumerate(dates):
    days_left = total_days - day_idx
    if days_left == 1:
        today_count = remaining
    else:
        avg = remaining / days_left
        today_count = random.randint(max(min_per_day, int(avg - 1.5)), min(max_per_day, int(avg + 1.5)))
        today_count = max(min_per_day, min(max_per_day, today_count))
        today_count = min(today_count, remaining)
    commits_per_day.append(today_count)
    remaining -= today_count

while remaining > 0:
    for i in range(len(commits_per_day)-1, -1, -1):
        if remaining <= 0:
            break
        if commits_per_day[i] < max_per_day:
            commits_per_day[i] += 1
            remaining -= 1

print(f"Total commits: {len(files)}")
print(f"Distribution: {commits_per_day}")

commit_idx = 0
for day_idx, date in enumerate(dates):
    num_commits = commits_per_day[day_idx]
    for c in range(num_commits):
        if commit_idx >= len(files):
            break
        filepath, msg = files[commit_idx]
        hour = random.randint(9, 21)
        minute = random.randint(0, 59)
        second = random.randint(0, 59)
        timestamp = date.replace(hour=hour, minute=minute, second=second)
        iso_time = timestamp.strftime("%Y-%m-%dT%H:%M:%S+05:30")

        subprocess.run(["git", "add", filepath], check=True, capture_output=True)
        env = {
            "GIT_AUTHOR_DATE": iso_time,
            "GIT_COMMITTER_DATE": iso_time,
        }
        subprocess.run(
            ["git", "commit", "-m", msg],
            check=True,
            capture_output=True,
            env={**os.environ, **env}
        )
        print(f"[{iso_time}] {msg}")
        commit_idx += 1

print(f"\nCreated {commit_idx} commits.")
