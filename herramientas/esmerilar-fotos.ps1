param([string]$Carpeta = (Join-Path $PSScriptRoot '..\img\cartas'))
# Crea la version "esmerilada" (desenfocada) de cada foto de carta: foto.jpg -> foto-borrosa.jpg
# La portada la muestra asi en reposo y pasa a la foto nitida al poner el cursor sobre la carta.
# Lee JPG, PNG y WEBP (los webp con WIC / PresentationCore). Uso:
#   powershell -ExecutionPolicy Bypass -File herramientas\esmerilar-fotos.ps1
Add-Type -AssemblyName PresentationCore
Add-Type -AssemblyName System.Drawing

function Cargar([string]$ruta) {
  $s = [IO.File]::OpenRead($ruta)
  $d = [System.Windows.Media.Imaging.BitmapDecoder]::Create($s, 'PreservePixelFormat', 'OnLoad')
  $enc = New-Object System.Windows.Media.Imaging.PngBitmapEncoder
  $enc.Frames.Add([System.Windows.Media.Imaging.BitmapFrame]::Create($d.Frames[0]))
  $ms = New-Object IO.MemoryStream
  $enc.Save($ms); $s.Close()
  $ms.Position = 0
  return [System.Drawing.Bitmap]::FromStream($ms)
}

function Escalar($bmp, [int]$w, [int]$h) {
  $r = New-Object System.Drawing.Bitmap($w, $h)
  $g = [System.Drawing.Graphics]::FromImage($r)
  $g.InterpolationMode = 'HighQualityBicubic'
  $g.PixelOffsetMode = 'HighQuality'
  $at = New-Object System.Drawing.Imaging.ImageAttributes
  $at.SetWrapMode('TileFlipXY')   # sin bordes oscuros al escalar
  $g.DrawImage($bmp, (New-Object System.Drawing.Rectangle(0, 0, $w, $h)), 0, 0, $bmp.Width, $bmp.Height, 'Pixel', $at)
  $g.Dispose()
  return $r
}

$jpg = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$par = New-Object System.Drawing.Imaging.EncoderParameters(1)
$par.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]80)

Get-ChildItem $Carpeta -File | Where-Object { $_.Extension -match '^\.(jpe?g|png|webp)$' -and $_.BaseName -notmatch '-borrosa$' } | ForEach-Object {
  $b = Cargar $_.FullName
  $alto = { param($w) [int][Math]::Round($w * $b.Height / $b.Width) }
  # achicar mucho y volver a agrandar en dos pasos = desenfoque suave y parejo
  $chica = Escalar $b 90 (& $alto 90)
  $media = Escalar $chica 240 (& $alto 240)
  $borrosa = Escalar $media 480 (& $alto 480)
  $sal = Join-Path $_.DirectoryName ($_.BaseName + '-borrosa.jpg')
  $borrosa.Save($sal, $jpg, $par)
  "{0} -> {1}" -f $_.Name, (Split-Path $sal -Leaf)
  $b.Dispose(); $chica.Dispose(); $media.Dispose(); $borrosa.Dispose()
}
