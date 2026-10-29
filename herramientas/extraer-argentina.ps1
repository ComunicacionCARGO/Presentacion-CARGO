# Extrae las provincias argentinas de ne_10m_admin_1_states_provinces.geojson (Natural Earth)
# y genera el archivo de contornos para el mapa de distribucion.
#   -Tolerancia: cuanto se simplifican los bordes (grados). Mas alto = mas estilizado.
#   -AreaMinima: islas mas chicas que esto (grados cuadrados) se descartan.
# Los limites entre provincias se simplifican UNA sola vez por tramo (como en una topologia),
# asi las provincias vecinas siguen encajando sin rendijas.
# La Ciudad de Buenos Aires queda cubierta por la provincia de Buenos Aires (se quitan los huecos).
param([string]$Entrada, [string]$Salida, [double]$Tolerancia = 0.06, [double]$AreaMinima = 0.08)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Web.Extensions
$ser = New-Object System.Web.Script.Serialization.JavaScriptSerializer
$ser.MaxJsonLength = [int]::MaxValue
$ser.RecursionLimit = 1000
$geo = $ser.DeserializeObject([IO.File]::ReadAllText($Entrada))
$inv = [Globalization.CultureInfo]::InvariantCulture

function Clave($p) { return ([double]$p[0]).ToString('F6', $inv) + ',' + ([double]$p[1]).ToString('F6', $inv) }

function Area($r) {
  $a = 0
  for ($j = 0; $j -lt $r.Count - 1; $j++) { $a += $r[$j][0] * $r[$j + 1][1] - $r[$j + 1][0] * $r[$j][1] }
  return [Math]::Abs($a / 2)
}

# Douglas-Peucker
function Simplificar($pts, [double]$tol) {
  $n = $pts.Count
  if ($n -lt 3) { return ,$pts }
  $keep = New-Object bool[] $n
  $keep[0] = $true; $keep[$n - 1] = $true
  $pila = New-Object System.Collections.Generic.Stack[int[]]
  $pila.Push(@(0, ($n - 1)))
  while ($pila.Count -gt 0) {
    $s = $pila.Pop(); $a = $s[0]; $b = $s[1]
    $ax = $pts[$a][0]; $ay = $pts[$a][1]; $bx = $pts[$b][0]; $by = $pts[$b][1]
    $dx = $bx - $ax; $dy = $by - $ay; $len = [Math]::Sqrt($dx * $dx + $dy * $dy)
    $max = -1; $idx = -1
    for ($i = $a + 1; $i -lt $b; $i++) {
      $px = $pts[$i][0]; $py = $pts[$i][1]
      if ($len -eq 0) { $d = [Math]::Sqrt(($px - $ax) * ($px - $ax) + ($py - $ay) * ($py - $ay)) }
      else { $d = [Math]::Abs($dy * $px - $dx * $py + $bx * $ay - $by * $ax) / $len }
      if ($d -gt $max) { $max = $d; $idx = $i }
    }
    if ($max -gt $tol) { $keep[$idx] = $true; $pila.Push(@($a, $idx)); $pila.Push(@($idx, $b)) }
  }
  $r = New-Object System.Collections.Generic.List[object]
  for ($i = 0; $i -lt $n; $i++) { if ($keep[$i]) { $r.Add($pts[$i]) } }
  return ,$r
}

# 1. Anillos exteriores de cada provincia (sin huecos ni islas chicas)
$provs = New-Object System.Collections.Generic.List[object]
foreach ($f in $geo['features']) {
  $p = $f['properties']
  if ($p['adm0_a3'] -ne 'ARG') { continue }
  $cod = ([string]$p['iso_3166_2']).Replace('AR-', '')
  if ($cod -eq 'C') { continue }
  $g = $f['geometry']
  if ($g['type'] -eq 'Polygon') { $polys = @(,$g['coordinates']) } else { $polys = $g['coordinates'] }
  $anillos = New-Object System.Collections.Generic.List[object]
  foreach ($poly in $polys) {
    $ext = $poly[0]
    if ((Area $ext) -lt $AreaMinima) { continue }
    $r = New-Object System.Collections.Generic.List[object]
    foreach ($pt in $ext) { $r.Add(@([double]$pt[0], [double]$pt[1])) }
    if ((Clave $r[0]) -eq (Clave $r[$r.Count - 1])) { $r.RemoveAt($r.Count - 1) }
    $anillos.Add($r)
  }
  $provs.Add(@{ cod = $cod; nombre = [string]$p['name']; anillos = $anillos })
}

# 2. Que anillos usan cada coordenada
$uso = @{}
$idAnillo = 0
foreach ($pv in $provs) {
  foreach ($r in $pv.anillos) {
    foreach ($pt in $r) {
      $k = Clave $pt
      if (-not $uso.ContainsKey($k)) { $uso[$k] = New-Object System.Collections.Generic.SortedSet[int] }
      [void]$uso[$k].Add($idAnillo)
    }
    $idAnillo++
  }
}
function Firma($pt) { return ($uso[(Clave $pt)] -join '-') }

# 3. Cortar cada anillo en tramos entre puntos de union y simplificar cada tramo una vez
$cache = @{}
function TramoSimplificado($tramo) {
  $k0 = Clave $tramo[0]; $k1 = Clave $tramo[$tramo.Count - 1]
  $invertir = [string]::CompareOrdinal($k0, $k1) -gt 0
  $canon = New-Object System.Collections.Generic.List[object]
  $canon.AddRange($tramo)
  if ($invertir) { $canon.Reverse() }
  $id = (Clave $canon[0]) + '|' + (Clave $canon[$canon.Count - 1]) + '|' + $canon.Count + '|' + (Clave $canon[[int]($canon.Count / 2)])
  if (-not $cache.ContainsKey($id)) { $cache[$id] = Simplificar $canon $Tolerancia }
  $res = New-Object System.Collections.Generic.List[object]
  $res.AddRange($cache[$id])
  if ($invertir) { $res.Reverse() }
  return ,$res
}

$sb = New-Object System.Text.StringBuilder
[void]$sb.Append("/* Contornos de las provincias argentinas - Natural Earth 10m (dominio publico).`n   Archivo generado con herramientas/extraer-argentina.ps1: no hace falta editarlo. */`nwindow.MAPA_ARGENTINA = {`n")
$totalPts = 0
foreach ($pv in $provs) {
  $salidaAnillos = @()
  foreach ($r in $pv.anillos) {
    $n = $r.Count
    $firmas = New-Object string[] $n
    for ($i = 0; $i -lt $n; $i++) { $firmas[$i] = Firma $r[$i] }
    $uniones = New-Object System.Collections.Generic.List[int]
    for ($i = 0; $i -lt $n; $i++) {
      $a = $firmas[($i - 1 + $n) % $n]; $b = $firmas[($i + 1) % $n]
      if ($firmas[$i] -ne $a -or $firmas[$i] -ne $b) { $uniones.Add($i) }
    }
    $nuevo = New-Object System.Collections.Generic.List[object]
    if ($uniones.Count -eq 0) {
      $cerrado = New-Object System.Collections.Generic.List[object]
      $cerrado.AddRange($r); $cerrado.Add($r[0])
      $s = Simplificar $cerrado $Tolerancia
      for ($i = 0; $i -lt $s.Count - 1; $i++) { $nuevo.Add($s[$i]) }
    } else {
      for ($u = 0; $u -lt $uniones.Count; $u++) {
        $desde = $uniones[$u]; $hasta = $uniones[($u + 1) % $uniones.Count]
        $tramo = New-Object System.Collections.Generic.List[object]
        $i = $desde
        while ($true) { $tramo.Add($r[$i]); if ($i -eq $hasta -and $tramo.Count -gt 1) { break }; $i = ($i + 1) % $n }
        $s = TramoSimplificado $tramo
        for ($j = 0; $j -lt $s.Count - 1; $j++) { $nuevo.Add($s[$j]) }
      }
    }
    if ($nuevo.Count -lt 3) { continue }
    $totalPts += $nuevo.Count
    $txt = ($nuevo | ForEach-Object { '[' + [Math]::Round($_[0], 3).ToString($inv) + ',' + [Math]::Round($_[1], 3).ToString($inv) + ']' }) -join ','
    $salidaAnillos += "[$txt]"
  }
  [void]$sb.Append("  $($pv.cod): { nombre: `"$($pv.nombre)`", anillos: [" + ($salidaAnillos -join ",`n    ") + "] },`n")
}
[void]$sb.Append("};`n")
[IO.File]::WriteAllText($Salida, $sb.ToString(), (New-Object System.Text.UTF8Encoding($false)))
"OK " + (Get-Item $Salida).Length + " bytes, " + $provs.Count + " provincias, " + $totalPts + " puntos"
