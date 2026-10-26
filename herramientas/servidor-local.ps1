param([string]$Root, [int]$Port = 5500)
$mime = @{
  '.html'='text/html; charset=utf-8'; '.css'='text/css; charset=utf-8'; '.js'='text/javascript; charset=utf-8'
  '.json'='application/json'; '.png'='image/png'; '.jpg'='image/jpeg'; '.jpeg'='image/jpeg'; '.webp'='image/webp'
  '.svg'='image/svg+xml'; '.pdf'='application/pdf'; '.woff2'='font/woff2'; '.csv'='text/csv; charset=utf-8'
  '.mp4'='video/mp4'; '.webm'='video/webm'
}
$l = New-Object System.Net.HttpListener
$l.Prefixes.Add("http://localhost:$Port/")
$l.Start()
Write-Output "Sirviendo $Root en http://localhost:$Port/"
while ($l.IsListening) {
  $ctx = $l.GetContext()
  $path = [Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath).TrimStart('/')
  $file = Join-Path $Root $path
  if (Test-Path $file -PathType Container) { $file = Join-Path $file 'index.html' }
  $res = $ctx.Response
  $res.Headers.Add('Cache-Control', 'no-store')
  if (Test-Path $file -PathType Leaf) {
    $bytes = [IO.File]::ReadAllBytes($file)
    $ext = [IO.Path]::GetExtension($file).ToLower()
    $res.ContentType = if ($mime[$ext]) { $mime[$ext] } else { 'application/octet-stream' }
    $res.Headers.Add('Accept-Ranges', 'bytes')
    # Pedidos por partes (los videos los usan para avanzar y repetir)
    $rango = $ctx.Request.Headers['Range']
    if ($rango -match '^bytes=(\d*)-(\d*)$') {
      $total = $bytes.Length
      $desde = if ($matches[1]) { [long]$matches[1] } else { $total - [long]$matches[2] }
      $hasta = if ($matches[1] -and $matches[2]) { [Math]::Min([long]$matches[2], $total - 1) } else { $total - 1 }
      $res.StatusCode = 206
      $res.Headers.Add('Content-Range', "bytes $desde-$hasta/$total")
      $res.OutputStream.Write($bytes, $desde, $hasta - $desde + 1)
    } else {
      $res.OutputStream.Write($bytes, 0, $bytes.Length)
    }
  } else { $res.StatusCode = 404 }
  $res.Close()
}
