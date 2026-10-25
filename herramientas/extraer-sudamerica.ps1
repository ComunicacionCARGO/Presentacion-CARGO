# Extrae America del Sur del archivo countries-50m.json (world-atlas / Natural Earth)
# y genera slides/quienes-somos/mapa-sudamerica.js
#   -Tolerancia: cuanto se simplifican los bordes (grados). Mas alto = mas estilizado.
#   -AreaMinima: islas mas chicas que esto (grados cuadrados) se descartan.
# Se simplifica cada tramo de frontera una sola vez, asi los paises vecinos siguen encajando.
param([string]$Entrada, [string]$Salida, [double]$Tolerancia = 0.3, [double]$AreaMinima = 1.5)
$ErrorActionPreference = 'Stop'
$topo = Get-Content -Raw -Encoding UTF8 $Entrada | ConvertFrom-Json
$sx = [double]$topo.transform.scale[0]; $sy = [double]$topo.transform.scale[1]
$tx = [double]$topo.transform.translate[0]; $ty = [double]$topo.transform.translate[1]

$cache = @{}
function ArcoDecodificado([int]$i) {
  $k = if ($i -lt 0) { -bnot $i } else { $i }
  if (-not $cache.ContainsKey($k)) {
    $x = 0; $y = 0; $pts = New-Object System.Collections.Generic.List[double[]]
    foreach ($p in $topo.arcs[$k]) {
      $x += [int]$p[0]; $y += [int]$p[1]
      $pts.Add([double[]]@(($x * $sx + $tx), ($y * $sy + $ty)))
    }
    $cache[$k] = Simplificar $pts $Tolerancia
  }
  $a = $cache[$k]
  if ($i -lt 0) { $r = [System.Collections.Generic.List[double[]]]::new(); $r.AddRange($a); $r.Reverse(); return ,$r }
  return ,$a
}

function Anillo($indices) {
  $ring = New-Object System.Collections.Generic.List[double[]]
  $primero = $true
  foreach ($i in $indices) {
    $a = ArcoDecodificado ([int]$i)
    if ($primero) { $ring.AddRange($a); $primero = $false }
    else { for ($j = 1; $j -lt $a.Count; $j++) { $ring.Add($a[$j]) } }
  }
  return ,$ring
}

# Douglas-Peucker
function Simplificar($pts, [double]$tol) {
  $n = $pts.Count
  if ($n -lt 4) { return ,$pts }
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
  $r = New-Object System.Collections.Generic.List[double[]]
  for ($i = 0; $i -lt $n; $i++) { if ($keep[$i]) { $r.Add($pts[$i]) } }
  return ,$r
}

# PaÃ­ses de AmÃ©rica del Sur (cÃ³digos ISO numÃ©ricos) + Guayana Francesa dentro de Francia (250)
$ids = @{ '032'='AR'; '076'='BR'; '152'='CL'; '858'='UY'; '600'='PY'; '068'='BO'; '604'='PE'; '218'='EC'; '170'='CO'; '862'='VE'; '328'='GY'; '740'='SR'; '250'='GF'; '238'='FK' }
$sb = New-Object System.Text.StringBuilder
[void]$sb.Append("/* Contornos de America del Sur - Natural Earth (dominio publico), via world-atlas 50m.`n   Archivo generado automaticamente: no hace falta editarlo. */`nwindow.MAPA_SUDAMERICA = {`n")
foreach ($g in $topo.objects.countries.geometries) {
  $id = [string]$g.id
  if (-not $ids.ContainsKey($id)) { continue }
  if ($g.type -eq 'Polygon') { $polys = @(,$g.arcs) } else { $polys = $g.arcs }
  $anillos = @()
  foreach ($poly in $polys) {
    $ring = Anillo $poly[0]
    # centro aproximado para descartar territorios fuera de SudamÃ©rica (Francia europea, etc.)
    $cx = ($ring | ForEach-Object { $_[0] } | Measure-Object -Average).Average
    $cy = ($ring | ForEach-Object { $_[1] } | Measure-Object -Average).Average
    if ($cx -lt -83 -or $cx -gt -33 -or $cy -gt 14 -or $cy -lt -57) { continue }
    # area (formula del cordon) para descartar islas muy chicas
    $area = 0
    for ($j = 0; $j -lt $ring.Count - 1; $j++) { $area += $ring[$j][0] * $ring[$j + 1][1] - $ring[$j + 1][0] * $ring[$j][1] }
    if ([Math]::Abs($area / 2) -lt $AreaMinima) { continue }
    $simp = $ring
    if ($simp.Count -lt 4) { continue }
    $txt = ($simp | ForEach-Object { '[' + [Math]::Round($_[0], 2).ToString([Globalization.CultureInfo]::InvariantCulture) + ',' + [Math]::Round($_[1], 2).ToString([Globalization.CultureInfo]::InvariantCulture) + ']' }) -join ','
    $anillos += "[$txt]"
  }
  if ($anillos.Count) { [void]$sb.Append("  $($ids[$id]): [" + ($anillos -join ",`n    ") + "],`n") }
}
[void]$sb.Append("};`n")
[IO.File]::WriteAllText($Salida, $sb.ToString(), (New-Object System.Text.UTF8Encoding($false)))
"OK " + (Get-Item $Salida).Length + " bytes"

