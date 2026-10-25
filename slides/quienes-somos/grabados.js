/* =========================================================
   ILUSTRACIONES ESTILO GRABADO (provisorias de la línea de tiempo)
   Dibujos en vector con tramas de líneas, como los grabados antiguos.
   En datos/quienes-somos.js cada año puede elegir uno con  dibujo: "nombre".
   Disponibles: camion-clasico, fabrica, alimentos, autoelevador,
                contenedor, camion-moderno
   ========================================================= */
(function () {
  const T = '#2B2B2B', P = '#FFFBF3';   // tinta y papel

  // Tramas compartidas + filtro que convierte las fotos en grabado
  const celda = encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' width='6' height='6'>" +
    "<defs><linearGradient id='g' x1='0' y1='0' x2='.5' y2='.5' spreadMethod='reflect'>" +
    "<stop offset='0' stop-color='#000'/><stop offset='1' stop-color='#fff'/></linearGradient></defs>" +
    "<rect width='6' height='6' fill='url(#g)'/></svg>");
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  defs.setAttribute('width', 0);
  defs.setAttribute('height', 0);
  defs.style.position = 'absolute';
  defs.innerHTML = `<defs>
    <pattern id="gr-l" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(40)"><line x1="0" y1="0" x2="0" y2="5" stroke="${T}" stroke-width=".7"/></pattern>
    <pattern id="gr-m" width="3.2" height="3.2" patternUnits="userSpaceOnUse" patternTransform="rotate(40)"><line x1="0" y1="0" x2="0" y2="3.2" stroke="${T}" stroke-width="1"/></pattern>
    <pattern id="gr-x" width="3.2" height="3.2" patternUnits="userSpaceOnUse" patternTransform="rotate(40)"><path d="M0 0V3.2M0 0H3.2" stroke="${T}" stroke-width="1"/></pattern>
    <pattern id="gr-v" width="3" height="3" patternUnits="userSpaceOnUse"><line x1=".5" y1="0" x2=".5" y2="3" stroke="${T}" stroke-width=".8"/></pattern>
    <pattern id="gr-h" width="3" height="3" patternUnits="userSpaceOnUse"><line x1="0" y1=".5" x2="3" y2=".5" stroke="${T}" stroke-width=".8"/></pattern>
    <filter id="gr-foto" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
      <feColorMatrix type="matrix" values=".3 .59 .11 0 0  .3 .59 .11 0 0  .3 .59 .11 0 0  0 0 0 1 0" result="gris"/>
      <feComponentTransfer in="gris" result="contraste">
        <feFuncR type="linear" slope="1.45" intercept="-.18"/><feFuncG type="linear" slope="1.45" intercept="-.18"/><feFuncB type="linear" slope="1.45" intercept="-.18"/>
      </feComponentTransfer>
      <feImage href="data:image/svg+xml;utf8,${celda}" x="0" y="0" width="6" height="6" preserveAspectRatio="none" result="celda"/>
      <feTile in="celda" result="trama"/>
      <feComposite in="contraste" in2="trama" operator="arithmetic" k1="0" k2="1" k3="1" k4="-.5" result="suma"/>
      <feComponentTransfer in="suma" result="bn">
        <feFuncR type="discrete" tableValues="0 1"/><feFuncG type="discrete" tableValues="0 1"/><feFuncB type="discrete" tableValues="0 1"/>
      </feComponentTransfer>
      <feColorMatrix in="bn" type="matrix" values="0 0 0 0 .17  0 0 0 0 .17  0 0 0 0 .17  -1 0 0 0 1" result="tinta"/>
      <feComposite in="tinta" in2="SourceGraphic" operator="in"/>
    </filter>
  </defs>`;
  document.body.appendChild(defs);

  const rueda = (cx, cy, r) =>
    `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${T}"/>` +
    `<circle cx="${cx}" cy="${cy}" r="${r * .74}" fill="url(#gr-x)" stroke="${T}" stroke-width="1.6"/>` +
    `<circle cx="${cx}" cy="${cy}" r="${r * .44}" fill="${P}" stroke="${T}" stroke-width="1.5"/>` +
    `<circle cx="${cx}" cy="${cy}" r="${r * .15}" fill="${T}"/>`;
  const sombraPiso = (cx, cy, rx) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="8" fill="url(#gr-l)"/>`;
  const L = `stroke="${T}" stroke-linejoin="round"`;

  window.GRABADOS = {
    'camion-clasico':
      sombraPiso(185, 206, 168) +
      `<rect x="128" y="44" width="206" height="128" fill="${P}" ${L} stroke-width="2.2"/>` +
      `<path d="M162 48V168M196 48V168M230 48V168M264 48V168M298 48V168" stroke="${T}" stroke-width=".7" opacity=".5"/>` +
      `<rect x="128" y="144" width="206" height="28" fill="url(#gr-m)"/>` +
      `<rect x="306" y="44" width="28" height="128" fill="url(#gr-l)"/>` +
      `<text x="226" y="104" text-anchor="middle" font-family="Oswald" font-weight="700" font-size="23" letter-spacing="2" fill="${T}">EXPRESO</text>` +
      `<text x="226" y="131" text-anchor="middle" font-family="Oswald" font-weight="700" font-size="23" letter-spacing="2" fill="${T}">CARGO</text>` +
      `<path d="M30 172V118Q32 96 54 92L112 88Q122 88 122 98V172Z" fill="${P}" ${L} stroke-width="2.2"/>` +
      `<path d="M44 118L52 100Q54 97 58 97L104 95V120Z" fill="url(#gr-x)" ${L} stroke-width="1.6"/>` +
      `<path d="M30 140H122M86 98V170" stroke="${T}" stroke-width="1"/>` +
      `<path d="M30 156Q70 146 122 154V172H30Z" fill="url(#gr-l)"/>` +
      `<rect x="22" y="144" width="10" height="24" fill="url(#gr-m)" ${L} stroke-width="1.2"/>` +
      `<rect x="20" y="168" width="318" height="10" fill="${T}"/>` +
      `<path d="M48 172A26 26 0 0 1 100 172M236 172A26 26 0 0 1 330 172" fill="none" stroke="${T}" stroke-width="2"/>` +
      rueda(74, 186, 22) + rueda(262, 186, 22) + rueda(304, 186, 22),

    'fabrica':
      `<rect x="10" y="196" width="340" height="12" fill="url(#gr-l)"/>` +
      `<path d="M40 196V108L82 78V108L124 78V108L166 78V108L208 78V196Z" fill="${P}" ${L} stroke-width="2.2"/>` +
      `<path d="M40 108L82 78V108ZM82 108L124 78V108ZM124 108L166 78V108ZM166 108L208 78V108Z" fill="url(#gr-m)" ${L} stroke-width="1.2"/>` +
      [52, 82, 112, 142, 172].map((x) => `<rect x="${x}" y="120" width="20" height="22" fill="url(#gr-x)" ${L} stroke-width="1.2"/>`).join('') +
      `<rect x="96" y="152" width="52" height="44" fill="url(#gr-h)" ${L} stroke-width="1.8"/>` +
      `<rect x="208" y="118" width="122" height="78" fill="${P}" ${L} stroke-width="2.2"/>` +
      `<rect x="208" y="118" width="122" height="9" fill="${T}"/>` +
      [222, 254, 286].map((x) => `<rect x="${x}" y="136" width="22" height="18" fill="url(#gr-x)" ${L} stroke-width="1.2"/><rect x="${x}" y="164" width="22" height="18" fill="url(#gr-x)" ${L} stroke-width="1.2"/>`).join('') +
      `<rect x="312" y="127" width="18" height="69" fill="url(#gr-l)"/>` +
      `<rect x="240" y="34" width="18" height="84" fill="url(#gr-v)" ${L} stroke-width="2"/>` +
      `<rect x="236" y="28" width="26" height="8" fill="${T}"/>` +
      `<circle cx="256" cy="16" r="9" fill="url(#gr-l)" stroke="${T}" stroke-width=".8"/>` +
      `<circle cx="273" cy="8" r="7" fill="url(#gr-l)" stroke="${T}" stroke-width=".7"/>` +
      `<circle cx="287" cy="3" r="5" fill="url(#gr-l)" stroke="${T}" stroke-width=".6"/>`,

    'alimentos':
      sombraPiso(185, 204, 160) +
      `<rect x="44" y="182" width="190" height="8" fill="${P}" ${L} stroke-width="1.6"/>` +
      `<rect x="44" y="190" width="190" height="5" fill="url(#gr-m)" ${L} stroke-width="1"/>` +
      [50, 132, 214].map((x) => `<rect x="${x}" y="195" width="14" height="8" fill="url(#gr-x)" ${L} stroke-width="1.2"/>`).join('') +
      // dos cajas abajo y una arriba
      [[50, 112], [134, 112], [92, 44]].map(([x, y]) =>
        `<path d="M${x} ${y}L${x + 18} ${y - 14}H${x + 98}L${x + 80} ${y}Z" fill="url(#gr-l)" ${L} stroke-width="1.6"/>` +
        `<path d="M${x + 80} ${y}L${x + 98} ${y - 14}V${y + 54}L${x + 80} ${y + 68}Z" fill="url(#gr-m)" ${L} stroke-width="1.6"/>` +
        `<rect x="${x}" y="${y}" width="80" height="68" fill="${P}" ${L} stroke-width="1.8"/>` +
        `<path d="M${x + 40} ${y}V${y + 22}" stroke="${T}" stroke-width="5" opacity=".18"/>` +
        `<path d="M${x + 12} ${y + 50}h22M${x + 12} ${y + 56}h14" stroke="${T}" stroke-width="1.2"/>`
      ).join('') +
      // botellas en cajón
      [252, 274, 296, 318].map((x) =>
        `<path d="M${x - 4} 86h8v10q7 6 7 16v30h-22v-30q0-10 7-16z" fill="url(#gr-v)" ${L} stroke-width="1.5"/>` +
        `<rect x="${x - 5}" y="80" width="10" height="7" fill="${T}"/>`
      ).join('') +
      `<rect x="238" y="128" width="96" height="68" fill="${P}" ${L} stroke-width="2"/>` +
      `<path d="M238 146H334M238 164H334M238 182H334" stroke="${T}" stroke-width="1"/>` +
      `<rect x="318" y="128" width="16" height="68" fill="url(#gr-l)"/>` +
      `<rect x="266" y="134" width="40" height="8" rx="4" fill="${T}"/>`,

    'autoelevador':
      `<rect x="10" y="196" width="340" height="10" fill="url(#gr-l)"/>` +
      `<path d="M196 24V196M266 24V196M336 24V196" stroke="${T}" stroke-width="3.5"/>` +
      `<path d="M196 82H336M196 140H336" stroke="${T}" stroke-width="4"/>` +
      `<rect x="204" y="44" width="54" height="38" fill="url(#gr-l)" ${L} stroke-width="1.4"/>` +
      `<rect x="272" y="52" width="56" height="30" fill="url(#gr-m)" ${L} stroke-width="1.4"/>` +
      `<rect x="272" y="102" width="56" height="38" fill="url(#gr-l)" ${L} stroke-width="1.4"/>` +
      `<rect x="272" y="160" width="56" height="36" fill="url(#gr-m)" ${L} stroke-width="1.4"/>` +
      `<rect x="134" y="40" width="10" height="152" fill="url(#gr-v)" ${L} stroke-width="1.8"/>` +
      `<rect x="146" y="58" width="5" height="134" fill="${T}"/>` +
      `<path d="M150 166H206V172H150Z" fill="${T}"/>` +
      `<rect x="154" y="122" width="54" height="44" fill="${P}" ${L} stroke-width="1.8"/>` +
      `<path d="M181 122V136" stroke="${T}" stroke-width="5" opacity=".18"/>` +
      `<path d="M40 190V138H62L76 98H128V190Z" fill="${P}" ${L} stroke-width="2.2"/>` +
      `<path d="M76 98L72 60M66 58H122M122 58V136" stroke="${T}" stroke-width="2.4" fill="none"/>` +
      `<path d="M84 126Q96 108 112 112L112 136H84Z" fill="url(#gr-x)" ${L} stroke-width="1.4"/>` +
      `<rect x="28" y="142" width="30" height="44" fill="url(#gr-x)" ${L} stroke-width="1.8"/>` +
      `<path d="M40 166Q84 156 128 162V190H40Z" fill="url(#gr-l)"/>` +
      rueda(68, 190, 17) + rueda(118, 192, 12),

    'contenedor':
      sombraPiso(180, 206, 120) +
      `<path d="M180 0V20" stroke="${T}" stroke-width="2.5"/>` +
      `<path d="M172 20h16l-2 6h-12z" fill="${T}"/>` +
      `<rect x="86" y="26" width="188" height="7" fill="${T}"/>` +
      `<path d="M96 33L80 54M264 33L280 54" stroke="${T}" stroke-width="1.6"/>` +
      `<rect x="70" y="54" width="220" height="108" fill="${P}" ${L} stroke-width="2.4"/>` +
      `<rect x="74" y="58" width="168" height="100" fill="url(#gr-v)" opacity=".55"/>` +
      `<rect x="70" y="140" width="220" height="22" fill="url(#gr-m)"/>` +
      `<path d="M246 56V160" stroke="${T}" stroke-width="2"/>` +
      `<path d="M258 58V158M276 58V158" stroke="${T}" stroke-width="3"/>` +
      `<path d="M252 92h12M270 92h12M252 124h12M270 124h12" stroke="${T}" stroke-width="2"/>` +
      `<rect x="70" y="54" width="10" height="10" fill="${T}"/><rect x="280" y="54" width="10" height="10" fill="${T}"/>` +
      `<rect x="70" y="152" width="10" height="10" fill="${T}"/><rect x="280" y="152" width="10" height="10" fill="${T}"/>` +
      `<rect x="118" y="88" width="88" height="32" fill="${P}" ${L} stroke-width="1.4"/>` +
      `<text x="162" y="113" text-anchor="middle" font-family="Oswald" font-weight="700" font-size="22" letter-spacing="2" fill="${T}">CARGO</text>`,

    'camion-moderno':
      sombraPiso(185, 206, 170) +
      `<defs><clipPath id="gr-remolque"><rect x="124" y="50" width="222" height="108"/></clipPath></defs>` +
      `<rect x="124" y="50" width="222" height="108" fill="${P}" ${L} stroke-width="2.2"/>` +
      `<g clip-path="url(#gr-remolque)" fill="none" stroke-linejoin="round" stroke-width="9">` +
      `<path d="M244 40L276 104L244 168" stroke="${T}"/>` +
      `<path d="M262 40L294 104L262 168" stroke="#EF4529"/>` +
      `<path d="M280 40L312 104L280 168" stroke="#EF4529"/></g>` +
      `<rect x="124" y="136" width="222" height="22" fill="url(#gr-l)"/>` +
      `<rect x="150" y="70" width="40" height="18" fill="none" stroke="${T}" stroke-width="1.4"/>` +
      `<path d="M150 74h40M150 84h40" stroke="#EF4529" stroke-width="3"/>` +
      `<rect x="124" y="158" width="222" height="7" fill="${T}"/>` +
      `<path d="M222 165v20M216 185h12" stroke="${T}" stroke-width="2.5"/>` +
      rueda(292, 182, 16) + rueda(326, 182, 16) +
      `<path d="M28 172V96Q30 72 58 68H102Q114 68 116 82L118 172Z" fill="${P}" ${L} stroke-width="2.2"/>` +
      `<path d="M40 70Q66 46 110 54L112 68H58Q44 68 40 70Z" fill="url(#gr-m)" ${L} stroke-width="1.6"/>` +
      `<path d="M38 104L44 84Q46 80 50 80H104V106Z" fill="url(#gr-x)" ${L} stroke-width="1.6"/>` +
      `<rect x="20" y="118" width="12" height="40" fill="url(#gr-h)" ${L} stroke-width="1.4"/>` +
      `<rect x="72" y="142" width="40" height="18" rx="4" fill="url(#gr-v)" ${L} stroke-width="1.4"/>` +
      `<rect x="18" y="164" width="130" height="9" fill="${T}"/>` +
      rueda(56, 182, 17) + rueda(104, 182, 17)
  };

  window.GRABADOS_ORDEN = ['camion-clasico', 'fabrica', 'alimentos', 'autoelevador', 'contenedor', 'camion-moderno'];
})();
