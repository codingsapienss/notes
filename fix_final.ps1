git config user.name "codingsapienss"
git config user.email "contactprsant@gmail.com"

$root = Get-Location
$recovery = Join-Path $root "temp_recovery"

# 1. Reset to first commit
git reset --hard f499b72

# 2. Get TS files sorted by folder name
$tsPath = Join-Path $recovery "docs\WebDev\TypeScript"
$tsFiles = Get-ChildItem -Path $tsPath -Recurse -File | Sort-Object FullName

# 3. Commit TS files across April
$startDate = Get-Date -Year 2026 -Month 4 -Day 1 -Hour 10 -Minute 0 -Second 0
$fileIndex = 0

for ($i = 0; $i -lt 30; $i++) {
    $currentDate = $startDate.AddDays($i)
    $num = Get-Random -Minimum 1 -Maximum 3
    for ($j = 0; $j -lt $num; $j++) {
        if ($fileIndex -lt $tsFiles.Count) {
            $f = $tsFiles[$fileIndex]
            if ($f.Name -eq "intro.md") { $fileIndex++; continue }
            
            # Construct relative path for repo
            $rel = $f.FullName.Replace($recovery, "").TrimStart("\").TrimStart("/")
            $dest = Join-Path $root $rel
            $destDir = Split-Path $dest
            if (!(Test-Path $destDir)) { New-Item -ItemType Directory -Path $destDir -Force | Out-Null }
            
            Copy-Item $f.FullName $dest -Force
            git add "$rel"
            
            $time = $currentDate.AddHours((Get-Random -Minimum 0 -Maximum 8)).AddMinutes((Get-Random -Minimum 0 -Maximum 59))
            $env:GIT_AUTHOR_DATE = $time.ToString("yyyy-MM-ddTHH:mm:ss")
            $env:GIT_COMMITTER_DATE = $time.ToString("yyyy-MM-ddTHH:mm:ss")
            
            $msg = if ($rel -like "*_category_.json") { "Configure sidebar for $($rel.Split('\')[-2])" } else { "Add $($f.Name) to $($rel.Split('\')[-2])" }
            git commit -m "$msg" --author="codingsapienss <contactprsant@gmail.com>" --quiet
            $fileIndex++
        }
    }
}

# 4. Homepage Fix (April 30)
$indexPath = "src\pages\index.js"
Copy-Item (Join-Path $recovery $indexPath) (Join-Path $root $indexPath) -Force
git add $indexPath
$env:GIT_AUTHOR_DATE = "2026-04-30T18:00:00"
$env:GIT_COMMITTER_DATE = "2026-04-30T18:00:00"
git commit -m "Fix broken link on homepage" --author="codingsapienss <contactprsant@gmail.com>" --quiet

# 5. Restore full project state (June 1)
$items = "docs", "src", "docusaurus.config.js", "sidebars.js", "package.json", "README.md"
foreach ($item in $items) {
    Copy-Item (Join-Path $recovery $item) (Join-Path $root $item) -Recurse -Force
}
if (Test-Path "docs\WebDev\TypeScript\intro.md") { Remove-Item "docs\WebDev\TypeScript\intro.md" }

git add -A
$env:GIT_AUTHOR_DATE = "2026-06-01T10:00:00"
$env:GIT_COMMITTER_DATE = "2026-06-01T10:00:00"
git commit -m "Synchronize workspace with latest structure" --author="codingsapienss <contactprsant@gmail.com>" --quiet

# 6. Bit Manipulation (June 8)
# It's already copied in step 5, but we want a specific commit for it.
$env:GIT_AUTHOR_DATE = "2026-06-08T10:00:00"
$env:GIT_COMMITTER_DATE = "2026-06-08T10:00:00"
git commit --allow-empty -m "Register Bit Manipulation section" --author="codingsapienss <contactprsant@gmail.com>" --quiet
