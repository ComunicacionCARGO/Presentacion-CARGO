param([string]$Carpeta = (Join-Path $PSScriptRoot '..\img\slides\nuestra-estructura'))
# Fondos de la pantalla partida de "Mejora continua" (Nuestra estructura), preparados
# como en la referencia de la persona, para que el navegador no tenga que difuminar
# ni mezclar en cada cuadro:
#   originales\calidad.webp        -> fondo-calidad.jpg        (foto ~42 % sobre crema, fundida hacia abajo y hacia la banda)
#   originales\capacitaciones.webp -> fondo-capacitaciones.jpg (foto en modo "aclarar" sobre gris, al 42 %)
# Cubren x -200..1800 y y 0..1000 del escenario, a media resolucion (1000 x 500 px).
# Posiciones medidas sobre la referencia (1921 px = 1600 del escenario, x 0,8329):
#   calidad: escala .94 de la foto, en x -365, y 5 de la referencia
#   capacitaciones: escala .815, en x 592, y 84
# Uso:  powershell -ExecutionPolicy Bypass -File herramientas\fondos-pantalla-partida.ps1
Add-Type -AssemblyName PresentationCore
Add-Type -AssemblyName System.Drawing

function Cargar([string]$ruta) {
  # lee jpg, png o webp (webp con WIC)
  $s = [IO.File]::OpenRead($ruta)
  $d = [System.Windows.Media.Imaging.BitmapDecoder]::Create($s, 'PreservePixelFormat', 'OnLoad')
  $enc = New-Object System.Windows.Media.Imaging.PngBitmapEncoder
  $enc.Frames.Add([System.Windows.Media.Imaging.BitmapFrame]::Create($d.Frames[0]))
  $ms = New-Object IO.MemoryStream
  $enc.Save($ms); $s.Close(); $ms.Position = 0
  $b = [System.Drawing.Bitmap]::FromStream($ms)
  $b.SetResolution(96, 96)
  return $b
}
function Escalar($bmp, [int]$w, [int]$h) {
  $r = New-Object System.Drawing.Bitmap($w, $h)
  $g = [System.Drawing.Graphics]::FromImage($r)
  $g.InterpolationMode = 'HighQualityBicubic'; $g.PixelOffsetMode = 'HighQuality'
  $at = New-Object System.Drawing.Imaging.ImageAttributes; $at.SetWrapMode('TileFlipXY')
  $g.DrawImage($bmp, (New-Object System.Drawing.Rectangle(0, 0, $w, $h)), 0, 0, $bmp.Width, $bmp.Height, [System.Drawing.GraphicsUnit]::Pixel, $at)
  $g.Dispose(); $r.SetResolution(96, 96)
  return $r
}
# difuminado: bajar a la mitad varias veces y volver a subir de a dobles (suave, sin cuadraditos)
function Difuminar($b) {
  $act = $b
  foreach ($w in 960, 480, 240, 120) { $n = Escalar $act $w ([int]($w * 9 / 16)); if ($act -ne $b) { $act.Dispose() }; $act = $n }
  foreach ($w in 240, 480, 960, 1600) { $n = Escalar $act $w ([int]($w * 9 / 16)); $act.Dispose(); $act = $n }
  return $act
}

$R = 0.5; $W = 1000; $H = 500; $X0 = -200
function Suave($a, $b, $x) { $t = [Math]::Max(0.0, [Math]::Min(1.0, [double]($x - $a) / ($b - $a))); return $t * $t * (3 - 2 * $t) }
function Tramos($xs, $ys, $x) {
  if ($x -le $xs[0]) { return $ys[0] }
  for ($i = 1; $i -lt $xs.Count; $i++) { if ($x -le $xs[$i]) { return $ys[$i - 1] + ($ys[$i] - $ys[$i - 1]) * ($x - $xs[$i - 1]) / ($xs[$i] - $xs[$i - 1]) } }
  return $ys[-1]
}
function Hornear($fuente, $salida, $tipo, $fx, $fy, $fw, $fh) {
  $orig = Cargar $fuente
  $src = Difuminar $orig; $orig.Dispose()
  $lienzo = New-Object System.Drawing.Bitmap($W, $H, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
  $g = [System.Drawing.Graphics]::FromImage($lienzo)
  if ($tipo -eq 0) { $g.Clear([System.Drawing.Color]::FromArgb(255, 251, 243)) } else { $g.Clear([System.Drawing.Color]::FromArgb(58, 58, 58)) }
  $g.InterpolationMode = 'HighQualityBicubic'; $g.PixelOffsetMode = 'HighQuality'
  $at = New-Object System.Drawing.Imaging.ImageAttributes; $at.SetWrapMode('TileFlipXY')
  $g.DrawImage($src, (New-Object System.Drawing.Rectangle([int](($fx - $X0) * $R), [int]($fy * $R), [int]($fw * $R), [int]($fh * $R))), 0, 0, $src.Width, $src.Height, [System.Drawing.GraphicsUnit]::Pixel, $at)
  $g.Dispose(); $src.Dispose()
  $datos = $lienzo.LockBits((New-Object System.Drawing.Rectangle(0, 0, $W, $H)), 'ReadWrite', 'Format24bppRgb')
  $st = $datos.Stride
  $b = New-Object byte[] ($st * $H)
  [Runtime.InteropServices.Marshal]::Copy($datos.Scan0, $b, 0, $b.Length)
  $fondo = if ($tipo -eq 0) { @(243, 251, 255) } else { @(58, 58, 58) }   # BGR
  # opacidad de la foto de Calidad por altura (medida fila por fila en la referencia)
  $mvX = @(0, 250, 333, 416, 500, 583, 666, 750, 791, 833); $mvY = @(.42, .46, .41, .33, .25, .18, .11, .06, .02, 0)
  for ($y = 0; $y -lt $H; $y++) {
    $sy = $y / $R
    if ($tipo -eq 0) { $fyA = Tramos $mvX $mvY $sy } else { $fyA = (Suave 190 262 $sy) * (1 - (Suave ($fy + $fh - 60) ($fy + $fh) $sy)) }
    $filaDentro = ($sy -ge $fy -and $sy -lt $fy + $fh)
    for ($x = 0; $x -lt $W; $x++) {
      $sx = $x / $R + $X0
      $a = 0
      if ($filaDentro -and $fyA -gt 0 -and $sx -ge $fx -and $sx -lt $fx + $fw) {
        # Calidad: se apaga hacia la banda, espejo del fundido de Capacitaciones (que aparece de x 870 a 1060
        # alrededor de la diagonal en x 781,6): entera hasta x 502, desaparece en x 692
        if ($tipo -eq 0) { $a = $fyA * (Suave $fx ($fx + 110) $sx) * (1 - (Suave 502 692 $sx)) }
        else { $a = 0.42 * $fyA * (Suave 870 1060 $sx) * (1 - (Suave ($fx + $fw - 100) ($fx + $fw) $sx)) }
      }
      $i = $y * $st + $x * 3
      for ($c = 0; $c -lt 3; $c++) {
        $p = $b[$i + $c]; $f = $fondo[$c]
        if ($tipo -eq 0) { $v = $f * (1 - $a) + $p * $a }
        else { $v = $f * (1 - $a) + [Math]::Max([double]$p, [double]$f) * $a }          # aclarar
        $b[$i + $c] = [byte][Math]::Round([Math]::Max(0.0, [Math]::Min(255.0, [double]$v)))
      }
    }
  }
  [Runtime.InteropServices.Marshal]::Copy($b, 0, $datos.Scan0, $b.Length)
  $lienzo.UnlockBits($datos)
  $jpg = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
  $par = New-Object System.Drawing.Imaging.EncoderParameters(1)
  $par.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]86)
  $lienzo.Save($salida, $jpg, $par); $lienzo.Dispose()
  "{0}  {1} KB" -f (Split-Path $salida -Leaf), [int]((Get-Item $salida).Length / 1kb)
}
$k = 0.83290
$o = Join-Path $Carpeta 'originales'
# la escala se aplica sobre una foto de 1919 x 1079 (las originales)
Hornear (Join-Path $o 'calidad.webp') (Join-Path $Carpeta 'fondo-calidad.jpg') 0 (-365 * $k) (5 * $k) (1919 * 0.94 * $k) (1079 * 0.94 * $k)
Hornear (Join-Path $o 'capacitaciones.webp') (Join-Path $Carpeta 'fondo-capacitaciones.jpg') 1 (592 * $k) (84 * $k) (1919 * 0.815 * $k) (1079 * 0.815 * $k)
