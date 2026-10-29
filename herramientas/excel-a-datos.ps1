# Lee datos/distribucion.xlsx y vuelve a escribir datos/distribucion.js
# (lo ejecuta "datos/Actualizar mapa de distribucion.bat" con doble clic).
# No necesita Excel instalado: lee el archivo directamente.
param([string]$Excel = "$PSScriptRoot\..\datos\distribucion.xlsx", [string]$Datos = "$PSScriptRoot\..\datos\distribucion.js")
$ErrorActionPreference = 'Stop'
. "$PSScriptRoot\comun-excel.ps1"
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$inv = [Globalization.CultureInfo]::InvariantCulture
$avisos = New-Object System.Collections.Generic.List[string]

# ---------- Leer el libro (aunque este abierto en Excel) ----------
$ruta = [IO.Path]::GetFullPath($Excel)
if (-not (Test-Path $ruta)) { throw "No se encuentra el Excel: $ruta" }
$fs = [IO.File]::Open($ruta, [IO.FileMode]::Open, [IO.FileAccess]::Read, [IO.FileShare]::ReadWrite)
$zip = New-Object IO.Compression.ZipArchive($fs, [IO.Compression.ZipArchiveMode]::Read)
function LeerXml([string]$nombre) {
  $e = $zip.GetEntry($nombre)
  if (-not $e) { return $null }
  $r = New-Object IO.StreamReader($e.Open(), [Text.Encoding]::UTF8)
  $x = New-Object Xml.XmlDocument
  $x.LoadXml($r.ReadToEnd()); $r.Close()
  return $x
}
$ns = New-Object Xml.XmlNamespaceManager((New-Object Xml.NameTable))
$ns.AddNamespace('m', 'http://schemas.openxmlformats.org/spreadsheetml/2006/main')
$ns.AddNamespace('r', 'http://schemas.openxmlformats.org/officeDocument/2006/relationships')
$ns.AddNamespace('p', 'http://schemas.openxmlformats.org/package/2006/relationships')

$compartidos = @()
$sst = LeerXml 'xl/sharedStrings.xml'
if ($sst) { $compartidos = @($sst.SelectNodes('//m:si', $ns) | ForEach-Object { ($_.SelectNodes('.//m:t', $ns) | ForEach-Object { $_.InnerText }) -join '' }) }

$libro = LeerXml 'xl/workbook.xml'
$rels = LeerXml 'xl/_rels/workbook.xml.rels'
$destinoDe = @{}
foreach ($r in $rels.SelectNodes('//p:Relationship', $ns)) { $destinoDe[$r.GetAttribute('Id')] = $r.GetAttribute('Target') }

# Devuelve las filas de una hoja como listas de textos (la primera fila son los titulos)
function Hoja([string]$nombre) {
  foreach ($s in $libro.SelectNodes('//m:sheet', $ns)) {
    if ((Normal $s.GetAttribute('name')) -ne (Normal $nombre)) { continue }
    $t = $destinoDe[$s.GetAttribute('id', 'http://schemas.openxmlformats.org/officeDocument/2006/relationships')]
    $t = $t.TrimStart('/')
    if (-not $t.StartsWith('xl/')) { $t = 'xl/' + $t }
    $x = LeerXml $t
    $filas = New-Object System.Collections.Generic.List[object]
    foreach ($row in $x.SelectNodes('//m:sheetData/m:row', $ns)) {
      $celdas = @{}; $max = -1
      foreach ($c in $row.SelectNodes('m:c', $ns)) {
        $i = ColIndice $c.GetAttribute('r')
        $tipo = $c.GetAttribute('t')
        $v = $c.SelectSingleNode('m:v', $ns)
        $txt = ''
        if ($tipo -eq 's' -and $v) { $txt = $compartidos[[int]$v.InnerText] }
        elseif ($tipo -eq 'inlineStr') { $txt = ($c.SelectNodes('.//m:t', $ns) | ForEach-Object { $_.InnerText }) -join '' }
        elseif ($v) { $txt = $v.InnerText }
        $celdas[$i] = ([string]$txt).Trim()
        if ($i -gt $max) { $max = $i }
      }
      $lista = @(); for ($i = 0; $i -le $max; $i++) { $lista += if ($celdas.ContainsKey($i)) { $celdas[$i] } else { '' } }
      $filas.Add($lista)
    }
    return ,$filas
  }
  throw "No se encuentra la hoja '$nombre' en el Excel."
}

# Indice de la columna cuyo titulo empieza con alguna de las palabras dadas
function Columna($titulos, [string[]]$claves, [int]$porDefecto) {
  for ($i = 0; $i -lt $titulos.Count; $i++) {
    $t = Normal $titulos[$i]
    foreach ($k in $claves) { if ($t.StartsWith($k)) { return $i } }
  }
  return $porDefecto
}
function Celda($fila, [int]$i) { if ($i -lt $fila.Count) { return [string]$fila[$i] } else { return '' } }
function Numero([string]$s, [string]$que) {
  $s = $s.Trim().Replace(' ', '')
  if ($s -match '^-?\d+,\d+$') { $s = $s.Replace(',', '.') }
  $n = 0.0
  if (-not [double]::TryParse($s, [Globalization.NumberStyles]::Float, $inv, [ref]$n)) { $avisos.Add("Numero no valido en $que : '$s'"); return $null }
  return $n
}
function Coordenadas($lat, $lon, [string]$que) {
  if ($null -eq $lat -or $null -eq $lon) { return $null }
  # Si vinieron al reves (longitud primero), se acomodan
  if ($lat -lt -60 -and $lon -gt -60) { $t = $lat; $lat = $lon; $lon = $t; $avisos.Add("En $que la latitud y la longitud estaban invertidas: se acomodaron.") }
  if ($lat -gt 0) { $lat = -$lat }
  if ($lon -gt 0) { $lon = -$lon }
  if ($lat -lt -56 -or $lat -gt -21 -or $lon -lt -74 -or $lon -gt -53) { $avisos.Add("En $que las coordenadas ($lat, $lon) quedan fuera de Argentina: revisalas.") }
  return @($lat, $lon)
}
function Vacia($fila) { foreach ($c in $fila) { if ([string]$c -ne '') { return $false } }; return $true }

$d = @{}

# Textos
$f = Hoja 'Textos'
$d.textos = @{ sello = ''; antetitulo = ''; titulo = ''; bajada = '' }
$cc = Columna $f[0] @('campo') 0; $ct = Columna $f[0] @('texto') 1
for ($i = 1; $i -lt $f.Count; $i++) { $k = Normal (Celda $f[$i] $cc); if ($d.textos.ContainsKey($k)) { $d.textos[$k] = Celda $f[$i] $ct } }

# Provincias y regiones
$f = Hoja 'Regiones'
$cn = Columna $f[0] @('region') 0; $cd = Columna $f[0] @('lead time desde', 'desde') 1; $ch = Columna $f[0] @('lead time hasta', 'hasta') 2; $cco = Columna $f[0] @('color') 3
$d.regiones = New-Object System.Collections.Generic.List[object]
for ($i = 1; $i -lt $f.Count; $i++) {
  if (Vacia $f[$i]) { continue }
  $col = (Celda $f[$i] $cco).Trim()
  if ($col -notmatch '^#?[0-9A-Fa-f]{6}$') { $avisos.Add("Color no valido en la region '$(Celda $f[$i] $cn)': '$col' (se usa gris)."); $col = '#8C8E96' }
  if (-not $col.StartsWith('#')) { $col = '#' + $col }
  $d.regiones.Add(@{ nombre = Celda $f[$i] $cn; desde = (Numero (Celda $f[$i] $cd) 'Regiones'); hasta = (Numero (Celda $f[$i] $ch) 'Regiones'); color = $col.ToUpperInvariant() })
}
$regionesNorm = @($d.regiones | ForEach-Object { Normal $_.nombre })

$f = Hoja 'Provincias'
$cp = Columna $f[0] @('provincia') 0; $cr = Columna $f[0] @('region') 1
$d.provincias = New-Object System.Collections.Generic.List[object]
for ($i = 1; $i -lt $f.Count; $i++) {
  if (Vacia $f[$i]) { continue }
  $reg = Celda $f[$i] $cr
  if ($reg -and ($regionesNorm -notcontains (Normal $reg))) { $avisos.Add("La provincia '$(Celda $f[$i] $cp)' tiene una region que no existe: '$reg'.") }
  $d.provincias.Add(@{ nombre = Celda $f[$i] $cp; region = $reg })
}
$provNorm = @($d.provincias | ForEach-Object { Normal $_.nombre })
function RevisarProvincia([string]$p, [string]$que) {
  if (($provNorm -notcontains (Normal $p)) -and (Normal $p) -notmatch 'ciudad|caba|capital federal') { $avisos.Add("En $que la provincia '$p' no figura en la hoja Provincias.") }
}

# Bases
$f = Hoja 'Bases'
$cn = Columna $f[0] @('nombre') 0; $cp = Columna $f[0] @('provincia') 1; $cla = Columna $f[0] @('lat') 2; $clo = Columna $f[0] @('lon') 3; $cde = Columna $f[0] @('detalle') 4
$d.bases = New-Object System.Collections.Generic.List[object]
for ($i = 1; $i -lt $f.Count; $i++) {
  if (Vacia $f[$i]) { continue }
  $n = Celda $f[$i] $cn
  $c = Coordenadas (Numero (Celda $f[$i] $cla) "la base '$n'") (Numero (Celda $f[$i] $clo) "la base '$n'") "la base '$n'"
  if (-not $c) { continue }
  RevisarProvincia (Celda $f[$i] $cp) "la base '$n'"
  $d.bases.Add(@{ nombre = $n; provincia = Celda $f[$i] $cp; lat = $c[0]; lon = $c[1]; detalle = Celda $f[$i] $cde })
}
$basesNorm = @($d.bases | ForEach-Object { Normal $_.nombre })

# Conexiones entre bases
$f = Hoja 'Entre bases'
$cd = Columna $f[0] @('desde') 0; $ch = Columna $f[0] @('hasta') 1; $ci = Columna $f[0] @('ida') 2
$d.entreBases = New-Object System.Collections.Generic.List[object]
for ($i = 1; $i -lt $f.Count; $i++) {
  if (Vacia $f[$i]) { continue }
  $a = Celda $f[$i] $cd; $b = Celda $f[$i] $ch
  if ($basesNorm -notcontains (Normal $a) -or $basesNorm -notcontains (Normal $b)) { $avisos.Add("La conexion '$a' -> '$b' usa una base que no esta en la hoja Bases (se omite)."); continue }
  $iv = (Normal (Celda $f[$i] $ci)) -match '^(si|s|x|1|true|verdadero)$'
  $d.entreBases.Add(@{ desde = $a; hasta = $b; idaYVuelta = $iv })
}

# Destinos
$f = Hoja 'Destinos'
$cc = Columna $f[0] @('ciudad') 0; $cp = Columna $f[0] @('provincia') 1; $cla = Columna $f[0] @('lat') 2; $clo = Columna $f[0] @('lon') 3; $cs = Columna $f[0] @('sale', 'desde') 4; $ct = Columna $f[0] @('tipo') 5
$d.destinos = New-Object System.Collections.Generic.List[object]
for ($i = 1; $i -lt $f.Count; $i++) {
  if (Vacia $f[$i]) { continue }
  $n = Celda $f[$i] $cc
  $c = Coordenadas (Numero (Celda $f[$i] $cla) "el destino '$n'") (Numero (Celda $f[$i] $clo) "el destino '$n'") "el destino '$n'"
  if (-not $c) { continue }
  $desde = Celda $f[$i] $cs
  if ($basesNorm -notcontains (Normal $desde)) { $avisos.Add("El destino '$n' sale desde '$desde', que no esta en la hoja Bases (se omite)."); continue }
  RevisarProvincia (Celda $f[$i] $cp) "el destino '$n'"
  $tipo = if ((Normal (Celda $f[$i] $ct)).StartsWith('prop')) { 'propio' } else { 'redespacho' }
  $d.destinos.Add(@{ ciudad = $n; provincia = Celda $f[$i] $cp; lat = $c[0]; lon = $c[1]; desde = $desde; tipo = $tipo })
}

$zip.Dispose(); $fs.Dispose()

EscribirDatosJs $d ([IO.Path]::GetFullPath($Datos))
$prop = @($d.destinos | Where-Object { $_.tipo -eq 'propio' }).Count
''
'Listo: mapa de distribucion actualizado.'
"  $($d.bases.Count) bases, $($d.entreBases.Count) conexiones entre bases"
"  $prop destinos propios, $($d.destinos.Count - $prop) destinos con redespacho"
"  $($d.regiones.Count) regiones, $($d.provincias.Count) provincias"
if ($avisos.Count) {
  ''
  'ATENCION, revisa esto en el Excel:'
  foreach ($a in $avisos) { '  - ' + $a }
}
