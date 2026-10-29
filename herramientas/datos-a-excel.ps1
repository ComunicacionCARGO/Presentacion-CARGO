# Crea datos/distribucion.xlsx a partir de datos/distribucion.js
# (sirve para generar el Excel la primera vez, o para rehacerlo si se rompe).
#   powershell -ExecutionPolicy Bypass -File herramientas\datos-a-excel.ps1
param([string]$Datos = "$PSScriptRoot\..\datos\distribucion.js", [string]$Excel = "$PSScriptRoot\..\datos\distribucion.xlsx")
$ErrorActionPreference = 'Stop'
. "$PSScriptRoot\comun-excel.ps1"
Add-Type -AssemblyName System.Web.Extensions
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$js = [IO.File]::ReadAllText((Resolve-Path $Datos), [Text.Encoding]::UTF8)
$ini = $js.IndexOf('{', $js.IndexOf('window.DISTRIBUCION'))
$fin = $js.LastIndexOf('}')
$ser = New-Object System.Web.Script.Serialization.JavaScriptSerializer
$d = $ser.DeserializeObject($js.Substring($ini, $fin - $ini + 1))

# ---------- Hojas ----------
$hojas = New-Object System.Collections.Generic.List[object]

$instr = @(
  (Txt 'MAPA DE DISTRIBUCI#ON #- C#OMO EDITAR'),
  '',
  (Txt '1. Cambi#a los datos en las hojas de este archivo: Bases, Destinos, Entre bases, Regiones, Provincias y Textos.'),
  (Txt '2. Guard#a el Excel (Ctrl+G) y cerralo.'),
  (Txt '3. Hac#e doble clic en #<Actualizar mapa de distribucion.bat#> (est#a en esta misma carpeta). Se abre una ventana que avisa si encontr#o alg#un problema.'),
  (Txt '4. Recarg#a la presentaci#on (F5) para ver los cambios.'),
  '',
  'CONSEJOS',
  (Txt '#* Latitud y longitud: en Google Maps hac#e clic derecho sobre el lugar y despu#es clic en los n#umeros (se copian como #<-31.4135, -64.1811#>). El primero es la latitud y el segundo la longitud.'),
  (Txt '#* En Argentina la latitud y la longitud siempre son negativas.'),
  (Txt '#* #<Sale desde#> tiene que ser el nombre exacto de una base de la hoja Bases (hay una lista desplegable).'),
  (Txt '#* Tipo: #<Propio#> (red propia, se ve en rojo) o #<Redespacho#> (con redespachantes, se ve en naranja).'),
  (Txt '#* Para agregar una fila, escrib#ila debajo de la #ultima. Para quitarla, borr#a la fila entera.'),
  (Txt '#* Los colores de las regiones van en formato #RRGGBB (por ejemplo #759AAB).'),
  (Txt '#* No cambies el nombre de las hojas ni el orden de las columnas.')
)
$hojas.Add(@{ nombre = 'Instrucciones'; columnas = @(@{ t = ''; ancho = 120 }); filas = @($instr | ForEach-Object { ,@($_) }); estilo = 'instrucciones' })

$filas = @(
  ,@('sello', $d['textos']['sello'], (Txt 'Etiqueta de arriba a la derecha'))
  ,@('antetitulo', $d['textos']['antetitulo'], (Txt 'L#inea chica sobre el t#itulo'))
  ,@('titulo', $d['textos']['titulo'], (Txt 'T#itulo grande del panel'))
  ,@('bajada', $d['textos']['bajada'], (Txt 'Texto debajo del t#itulo'))
)
$hojas.Add(@{ nombre = 'Textos'; columnas = @(@{ t = 'Campo'; ancho = 14 }, @{ t = 'Texto'; ancho = 90 }, @{ t = (Txt 'D#onde aparece'); ancho = 34 }); filas = $filas })

$filas = @($d['bases'] | ForEach-Object { ,@($_['nombre'], $_['provincia'], [double]$_['lat'], [double]$_['lon'], $_['detalle']) })
$hojas.Add(@{ nombre = 'Bases'; columnas = @(@{ t = 'Nombre'; ancho = 22 }, @{ t = 'Provincia'; ancho = 22 }, @{ t = 'Latitud'; ancho = 12 }, @{ t = 'Longitud'; ancho = 12 }, @{ t = 'Detalle'; ancho = 50 })
  filas = $filas; validar = @(@{ r = 'B2:B200'; f = 'Provincias!$A$2:$A$40' }) })

$filas = @($d['destinos'] | ForEach-Object { $tipo = if ($_['tipo'] -eq 'propio') { 'Propio' } else { 'Redespacho' }; ,@($_['ciudad'], $_['provincia'], [double]$_['lat'], [double]$_['lon'], $_['desde'], $tipo) })
$hojas.Add(@{ nombre = 'Destinos'; columnas = @(@{ t = 'Ciudad'; ancho = 28 }, @{ t = 'Provincia'; ancho = 22 }, @{ t = 'Latitud'; ancho = 12 }, @{ t = 'Longitud'; ancho = 12 }, @{ t = 'Sale desde'; ancho = 18 }, @{ t = 'Tipo'; ancho = 14 })
  filas = $filas; validar = @(@{ r = 'B2:B500'; f = 'Provincias!$A$2:$A$40' }, @{ r = 'E2:E500'; f = 'Bases!$A$2:$A$100' }, @{ r = 'F2:F500'; f = '"Propio,Redespacho"' }) })

$si = Txt 'S#i'
$filas = @($d['entreBases'] | ForEach-Object { $iv = if ($_['idaYVuelta']) { $si } else { 'No' }; ,@($_['desde'], $_['hasta'], $iv) })
$hojas.Add(@{ nombre = 'Entre bases'; columnas = @(@{ t = 'Desde'; ancho = 22 }, @{ t = 'Hasta'; ancho = 22 }, @{ t = 'Ida y vuelta'; ancho = 14 })
  filas = $filas; validar = @(@{ r = 'A2:B200'; f = 'Bases!$A$2:$A$100' }, @{ r = 'C2:C200'; f = ('"' + $si + ',No"') }) })

$filas = @($d['regiones'] | ForEach-Object { ,@($_['nombre'], [double]$_['desde'], [double]$_['hasta'], $_['color']) })
$hojas.Add(@{ nombre = 'Regiones'; columnas = @(@{ t = (Txt 'Regi#on'); ancho = 18 }, @{ t = 'Lead time desde (h)'; ancho = 20 }, @{ t = 'Lead time hasta (h)'; ancho = 20 }, @{ t = 'Color'; ancho = 12 }); filas = $filas })

$filas = @($d['provincias'] | ForEach-Object { ,@($_['nombre'], $_['region']) })
$hojas.Add(@{ nombre = 'Provincias'; columnas = @(@{ t = 'Provincia'; ancho = 24 }, @{ t = (Txt 'Regi#on'); ancho = 18 })
  filas = $filas; validar = @(@{ r = 'B2:B40'; f = 'Regiones!$A$2:$A$30' }) })

# ---------- XML ----------
function HojaXml($h) {
  $sb = New-Object System.Text.StringBuilder
  [void]$sb.Append('<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">')
  $instr = $h.estilo -eq 'instrucciones'
  if (-not $instr) { [void]$sb.Append('<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>') }
  [void]$sb.Append('<sheetFormatPr defaultRowHeight="18"/><cols>')
  for ($i = 0; $i -lt $h.columnas.Count; $i++) { [void]$sb.Append('<col min="' + ($i + 1) + '" max="' + ($i + 1) + '" width="' + $h.columnas[$i].ancho + '" customWidth="1"/>') }
  [void]$sb.Append('</cols><sheetData>')
  $fila = 1
  if (-not $instr) {
    [void]$sb.Append('<row r="1" ht="24" customHeight="1">')
    for ($i = 0; $i -lt $h.columnas.Count; $i++) { [void]$sb.Append('<c r="' + (ColLetra $i) + '1" s="1" t="inlineStr"><is><t>' + (XmlEsc $h.columnas[$i].t) + '</t></is></c>') }
    [void]$sb.Append('</row>')
    $fila = 2
  }
  foreach ($f in $h.filas) {
    [void]$sb.Append('<row r="' + $fila + '">')
    for ($i = 0; $i -lt $f.Count; $i++) {
      $v = $f[$i]; $ref = (ColLetra $i) + $fila
      if ($v -is [double]) { [void]$sb.Append('<c r="' + $ref + '" s="3"><v>' + (JsonNum $v) + '</v></c>') }
      else {
        $s = if ($instr) { if ($fila -eq 1 -or $v -eq 'CONSEJOS') { 4 } else { 2 } } else { 0 }
        [void]$sb.Append('<c r="' + $ref + '" s="' + $s + '" t="inlineStr"><is><t xml:space="preserve">' + (XmlEsc ([string]$v)) + '</t></is></c>')
      }
    }
    [void]$sb.Append('</row>')
    $fila++
  }
  [void]$sb.Append('</sheetData>')
  if ($h.validar) {
    [void]$sb.Append('<dataValidations count="' + $h.validar.Count + '">')
    foreach ($v in $h.validar) { [void]$sb.Append('<dataValidation type="list" allowBlank="1" showErrorMessage="1" sqref="' + $v.r + '"><formula1>' + (XmlEsc $v.f) + '</formula1></dataValidation>') }
    [void]$sb.Append('</dataValidations>')
  }
  [void]$sb.Append('<pageMargins left="0.7" right="0.7" top="0.75" bottom="0.75" header="0.3" footer="0.3"/></worksheet>')
  return $sb.ToString()
}

$estilos = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
  '<numFmts count="1"><numFmt numFmtId="164" formatCode="0.0000"/></numFmts>' +
  '<fonts count="4"><font><sz val="11"/><color rgb="FF3A3A3A"/><name val="Calibri"/><family val="2"/></font>' +
  '<font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/><family val="2"/></font>' +
  '<font><sz val="11"/><color rgb="FF3A3A3A"/><name val="Calibri"/><family val="2"/></font>' +
  '<font><b/><sz val="14"/><color rgb="FFEF4529"/><name val="Calibri"/><family val="2"/></font></fonts>' +
  '<fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill>' +
  '<fill><patternFill patternType="solid"><fgColor rgb="FFEF4529"/><bgColor indexed="64"/></patternFill></fill></fills>' +
  '<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>' +
  '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>' +
  '<cellXfs count="5"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>' +
  '<xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment vertical="center"/></xf>' +
  '<xf numFmtId="0" fontId="2" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment wrapText="1" vertical="top"/></xf>' +
  '<xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>' +
  '<xf numFmtId="0" fontId="3" fillId="0" borderId="0" xfId="0" applyFont="1"/></cellXfs>' +
  '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>'

$libro = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>'
$rels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
$tipos = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>'
for ($i = 0; $i -lt $hojas.Count; $i++) {
  $n = $i + 1
  $libro += '<sheet name="' + (XmlEsc $hojas[$i].nombre) + '" sheetId="' + $n + '" r:id="rId' + $n + '"/>'
  $rels += '<Relationship Id="rId' + $n + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet' + $n + '.xml"/>'
  $tipos += '<Override PartName="/xl/worksheets/sheet' + $n + '.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'
}
$libro += '</sheets></workbook>'
$rels += '<Relationship Id="rId99" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>'
$tipos += '</Types>'
$raiz = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>'

$destino = [IO.Path]::GetFullPath($Excel)
if (Test-Path $destino) { Remove-Item $destino -Force }
$zip = [IO.Compression.ZipFile]::Open($destino, [IO.Compression.ZipArchiveMode]::Create)
$utf8 = New-Object System.Text.UTF8Encoding($false)
function Entrada($ruta, $texto) {
  $e = $zip.CreateEntry($ruta, [IO.Compression.CompressionLevel]::Optimal)
  $w = New-Object IO.StreamWriter($e.Open(), $utf8)
  $w.Write($texto); $w.Close()
}
Entrada '[Content_Types].xml' $tipos
Entrada '_rels/.rels' $raiz
Entrada 'xl/workbook.xml' $libro
Entrada 'xl/_rels/workbook.xml.rels' $rels
Entrada 'xl/styles.xml' $estilos
for ($i = 0; $i -lt $hojas.Count; $i++) { Entrada ('xl/worksheets/sheet' + ($i + 1) + '.xml') (HojaXml $hojas[$i]) }
$zip.Dispose()
'Excel creado: ' + $destino
