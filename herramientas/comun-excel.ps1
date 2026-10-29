# Funciones compartidas por datos-a-excel.ps1 y excel-a-datos.ps1
# (Este archivo es solo ASCII: los acentos se escriben con codigos, ver Txt.)

# Txt: convierte codigos en letras acentuadas ('#a' -> a con tilde, '#n' -> enie, etc.)
function Txt([string]$s) {
  # Lista de pares (las tablas de PowerShell no distinguen mayusculas)
  $m = @(@('#a', 0xE1), @('#e', 0xE9), @('#i', 0xED), @('#o', 0xF3), @('#u', 0xFA), @('#n', 0xF1), @('#N', 0xD1), @('#U', 0xDA),
    @('#E', 0xC9), @('#O', 0xD3), @('#A', 0xC1), @('#I', 0xCD), @('#?', 0xBF), @('#!', 0xA1), @('#<', 0xAB), @('#>', 0xBB), @('#*', 0x2022), @('#-', 0x2014))
  foreach ($p in $m) { $s = $s.Replace([string]$p[0], [string][char]$p[1]) }
  return $s
}

# Normaliza para comparar: sin acentos, minusculas, sin espacios de mas
function Normal([string]$s) {
  if ($null -eq $s) { return '' }
  $d = $s.Trim().ToLowerInvariant().Normalize([Text.NormalizationForm]::FormD)
  $sb = New-Object System.Text.StringBuilder
  foreach ($ch in $d.ToCharArray()) {
    if ([Globalization.CharUnicodeInfo]::GetUnicodeCategory($ch) -ne [Globalization.UnicodeCategory]::NonSpacingMark) { [void]$sb.Append($ch) }
  }
  return ($sb.ToString() -replace '\s+', ' ')
}

function XmlEsc([string]$s) { return [Security.SecurityElement]::Escape($s) }

function JsonTxt([string]$s) {
  if ($null -eq $s) { $s = '' }
  $sb = New-Object System.Text.StringBuilder
  [void]$sb.Append('"')
  foreach ($ch in $s.ToCharArray()) {
    $c = [int]$ch
    if ($ch -eq '"') { [void]$sb.Append('\"') }
    elseif ($ch -eq '\') { [void]$sb.Append('\\') }
    elseif ($c -eq 10) { [void]$sb.Append('\n') }
    elseif ($c -lt 32) { }
    else { [void]$sb.Append($ch) }
  }
  [void]$sb.Append('"')
  return $sb.ToString()
}

function JsonNum($n) { return ([double]$n).ToString('0.######', [Globalization.CultureInfo]::InvariantCulture) }

# Columnas de Excel: 0 -> A, 1 -> B ...
function ColLetra([int]$i) {
  $s = ''
  $i++
  while ($i -gt 0) { $r = ($i - 1) % 26; $s = [string][char](65 + $r) + $s; $i = [int][Math]::Floor(($i - 1) / 26) }
  return $s
}
function ColIndice([string]$ref) {
  $letras = ($ref -replace '[0-9]', '')
  $n = 0
  foreach ($ch in $letras.ToCharArray()) { $n = $n * 26 + ([int]$ch - 64) }
  return $n - 1
}

# Escribe datos/distribucion.js a partir del objeto de datos
function EscribirDatosJs($d, [string]$salida) {
  $sb = New-Object System.Text.StringBuilder
  $l = { param($t) [void]$sb.Append($t).Append("`n") }
  & $l '/* ====================================================================='
  & $l (Txt '   MAPA DE DISTRIBUCI#ON - datos')
  & $l '   ---------------------------------------------------------------------'
  & $l '   NO EDITES ESTE ARCHIVO A MANO.'
  & $l (Txt '   Los datos se cambian en el Excel  datos/distribucion.xlsx  y despu#es')
  & $l '   se hace doble clic en  datos/Actualizar mapa de distribucion.bat ,'
  & $l '   que vuelve a escribir este archivo.'
  & $l '   ===================================================================== */'
  & $l 'window.DISTRIBUCION = {'
  & $l '  "textos": {'
  $claves = @('sello', 'antetitulo', 'titulo', 'bajada')
  for ($i = 0; $i -lt $claves.Count; $i++) {
    $coma = if ($i -lt $claves.Count - 1) { ',' } else { '' }
    & $l ('    "' + $claves[$i] + '": ' + (JsonTxt $d.textos[$claves[$i]]) + $coma)
  }
  & $l '  },'
  & $l '  "bases": ['
  for ($i = 0; $i -lt $d.bases.Count; $i++) {
    $b = $d.bases[$i]; $coma = if ($i -lt $d.bases.Count - 1) { ',' } else { '' }
    & $l ('    { "nombre": ' + (JsonTxt $b.nombre) + ', "provincia": ' + (JsonTxt $b.provincia) + ', "lat": ' + (JsonNum $b.lat) + ', "lon": ' + (JsonNum $b.lon) + ', "detalle": ' + (JsonTxt $b.detalle) + ' }' + $coma)
  }
  & $l '  ],'
  & $l '  "entreBases": ['
  for ($i = 0; $i -lt $d.entreBases.Count; $i++) {
    $e = $d.entreBases[$i]; $coma = if ($i -lt $d.entreBases.Count - 1) { ',' } else { '' }
    $iv = if ($e.idaYVuelta) { 'true' } else { 'false' }
    & $l ('    { "desde": ' + (JsonTxt $e.desde) + ', "hasta": ' + (JsonTxt $e.hasta) + ', "idaYVuelta": ' + $iv + ' }' + $coma)
  }
  & $l '  ],'
  & $l '  "destinos": ['
  for ($i = 0; $i -lt $d.destinos.Count; $i++) {
    $e = $d.destinos[$i]; $coma = if ($i -lt $d.destinos.Count - 1) { ',' } else { '' }
    & $l ('    { "ciudad": ' + (JsonTxt $e.ciudad) + ', "provincia": ' + (JsonTxt $e.provincia) + ', "lat": ' + (JsonNum $e.lat) + ', "lon": ' + (JsonNum $e.lon) + ', "desde": ' + (JsonTxt $e.desde) + ', "tipo": ' + (JsonTxt $e.tipo) + ' }' + $coma)
  }
  & $l '  ],'
  & $l '  "regiones": ['
  for ($i = 0; $i -lt $d.regiones.Count; $i++) {
    $r = $d.regiones[$i]; $coma = if ($i -lt $d.regiones.Count - 1) { ',' } else { '' }
    & $l ('    { "nombre": ' + (JsonTxt $r.nombre) + ', "desde": ' + (JsonNum $r.desde) + ', "hasta": ' + (JsonNum $r.hasta) + ', "color": ' + (JsonTxt $r.color) + ' }' + $coma)
  }
  & $l '  ],'
  & $l '  "provincias": ['
  for ($i = 0; $i -lt $d.provincias.Count; $i++) {
    $p = $d.provincias[$i]; $coma = if ($i -lt $d.provincias.Count - 1) { ',' } else { '' }
    & $l ('    { "nombre": ' + (JsonTxt $p.nombre) + ', "region": ' + (JsonTxt $p.region) + ' }' + $coma)
  }
  & $l '  ]'
  & $l '};'
  [IO.File]::WriteAllText($salida, $sb.ToString(), (New-Object System.Text.UTF8Encoding($false)))
}
