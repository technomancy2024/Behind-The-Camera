# Run on Windows after changing the text field in lib/watermark-outline.js.
# The generated SVG outlines render without installed fonts in production.
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$outputPath = Join-Path $PSScriptRoot '../lib/watermark-outline.js'
$source = Get-Content -LiteralPath $outputPath -Raw
$data = [regex]::Match($source, 'const watermarkOutline = (.*);').Groups[1].Value | ConvertFrom-Json
$outline = New-Object System.Drawing.Drawing2D.GraphicsPath
$font = New-Object System.Drawing.FontFamily('Arial')
try {
    $outline.AddString($data.text, $font, [int][System.Drawing.FontStyle]::Bold, 100, [System.Drawing.PointF]::Empty, [System.Drawing.StringFormat]::GenericTypographic)
    $bounds = $outline.GetBounds()
    $points = $outline.PathPoints
    $types = $outline.PathTypes
    $commands = New-Object 'System.Collections.Generic.List[string]'
    function Format-Point($point) {
        return $point.X.ToString('0.###', [cultureinfo]::InvariantCulture) + ' ' + $point.Y.ToString('0.###', [cultureinfo]::InvariantCulture)
    }
    for ($i = 0; $i -lt $points.Length; $i++) {
        switch ($types[$i] -band 7) {
            0 { $commands.Add('M' + (Format-Point $points[$i])) }
            1 { $commands.Add('L' + (Format-Point $points[$i])) }
            3 {
                $commands.Add('C' + (Format-Point $points[$i]) + ' ' + (Format-Point $points[$i + 1]) + ' ' + (Format-Point $points[$i + 2]))
                $i += 2
            }
            default { throw 'Unsupported outline point type' }
        }
        if ($types[$i] -band 128) { $commands.Add('Z') }
    }
    $data.width = $bounds.Width
    $data.height = $bounds.Height
    $data.x = $bounds.X
    $data.y = $bounds.Y
    $data.fontSize = 100
    $data.path = $commands -join ' '
    $json = $data | ConvertTo-Json -Compress
    $content = "// Generated Arial Bold outlines. After editing text, run: powershell -File scripts/generate-watermark.ps1`nconst watermarkOutline = $json;`nexport default watermarkOutline;`n"
    [System.IO.File]::WriteAllText($outputPath, $content, (New-Object System.Text.UTF8Encoding($false)))
} finally {
    $outline.Dispose()
    $font.Dispose()
}
