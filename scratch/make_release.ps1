$zipPath = 'SGC-Command-v023.zip'
if (Test-Path $zipPath) { Remove-Item $zipPath -Force }

$includeDirs = @('game', 'content', 'blog', 'wiki', 'references', 'Switch-Angel', 'midi')
$includeFiles = @('index.html', 'hub.html', 'README.md', 'LICENSE', 'ROADMAP.md', 'HANDOFF.md', 'test-browser.js')

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$zip = [System.IO.Compression.ZipFile]::Open($zipPath, [System.IO.Compression.ZipArchiveMode]::Create)

$rootLen = (Get-Item .).FullName.Length + 1

foreach ($f in $includeFiles) {
  if (Test-Path $f) {
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, (Resolve-Path $f).Path, $f, [System.IO.Compression.CompressionLevel]::Optimal) | Out-Null
  }
}

foreach ($d in $includeDirs) {
  if (Test-Path $d) {
    $files = Get-ChildItem -Path $d -Recurse -File
    foreach ($file in $files) {
      $relPath = $file.FullName.Substring($rootLen)
      [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $file.FullName, $relPath, [System.IO.Compression.CompressionLevel]::Optimal) | Out-Null
    }
  }
}

$zip.Dispose()
$zipItem = Get-Item $zipPath
[PSCustomObject]@{
  Name = $zipItem.Name
  SizeKB = [math]::Round($zipItem.Length / 1KB, 2)
  SizeMB = [math]::Round($zipItem.Length / 1MB, 2)
} | Format-List
