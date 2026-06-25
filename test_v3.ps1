$ErrorActionPreference = 'Continue'
$html = Get-Content "E:\QClaw-Projects\cultivation-idle-game\index_v3.html" -Raw

$ids = @(
    'spiritStones','cultivationSpeed','cultivationValue','spiritValue','talentValue',
    'realmNameDisplay','cultivationNum','progressFill','breakthroughBtn',
    'townScene','caveScene','taijiPercent','taijiRing','taijiContainer',
    'shopList','skillsList','pillsList','achievementsList','encounterModal','beastCaptureModal',
    'beastHouse','artifactMaterials','herbGarden','caveUpgrade','sectPanel','storyPanel','cloudPanel'
)
$missing = @()
foreach ($id in $ids) {
    if ($html -notmatch ([regex]::Escape("id=`"$id`""))) { $missing += $id }
}
if ($missing.Count -gt 0) { Write-Host "MISSING IDs: $($missing -join ', ')" }
else { Write-Host "All $($ids.Count) IDs present." }

$allIds = [regex]::Matches($html, 'id="([^"]+)"') | ForEach-Object { $_.Groups[1].Value }
$dupes = $allIds | Group-Object | Where-Object { $_.Count -gt 1 } | ForEach-Object { $_.Name }
if ($dupes) { Write-Host "DUPLICATE IDs: $($dupes -join ', ')" }
else { Write-Host "No duplicate IDs. Total unique: $($allIds.Count)" }
