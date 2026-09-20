# Prompts de imágenes del sitio (para ChatGPT)

Este archivo reúne **140 imágenes** para generar: 14 del sitio (portada, áreas, páginas institucionales), 20 portadas de guía y 106 imágenes explicativas de guía. **No incluye** las 90 imágenes `prueba-prompt-0N` de las guías: son capturas reales de una conversación con una IA que solo puede hacer el autor.

## Cómo usarlo

1. Abre una conversación nueva de ChatGPT por lote (los lotes están numerados abajo) y pega primero el **bloque de instrucciones fijas**.
2. Pega después los prompts del lote, de 5 en 5 o de 10 en 10 (ChatGPT genera las imágenes de una en una).
3. Al terminar el lote, pídele: «Empaqueta todas las imágenes de este lote en un `.zip` plano, sin carpetas, con cada archivo nombrado por su ID (S01.png, H01.png, E001.png…)». Si no puede crear el `.zip`, descarga las imágenes una a una y renómbralas tú con su ID.
4. Pásame los `.zip` (o la carpeta). Yo los coloco en `public/images/…`, convierto a WebP donde haga falta y compruebo que cada espacio muestre su imagen.

**Nombres (obligatorio):** cada imagen se entrega con su **ID como nombre de archivo**: `S01.png`, `H01.png`, `E001.png`… (extensión `.png` o `.jpg`). El `.zip` es plano, sin carpetas. Yo asigno cada ID a su destino con el **Mapa de asignación** del final (nombre real de archivo, carpeta y espacio que lo usa) y convierto a `.webp` las de guías.

### Bloque de instrucciones fijas (pégalo al inicio de cada conversación)

```
Vas a generar una serie de imágenes para un sitio web editorial sobre IA práctica para pequeños negocios. Reglas para TODAS las imágenes:
- Sin texto legible, sin palabras, sin números y sin logotipos dentro de la imagen. Cuando haga falta representar texto, tablas o cifras, usa líneas, barras y bloques grises abstractos.
- Sin personas reales reconocibles. Si aparece un personaje, es el asistente de IA: cuerpo redondeado en forma de cápsula, dos ojos-pantalla, sin boca.
- Paleta común: menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6, marfil #F6F2E9 y tinta #0E2A2E. Usa el color de acento que indique cada prompt.
- Iluminación de estudio suave desde arriba a la izquierda; sombras suaves; acabado mate. Deja aire libre en el lado indicado para poder colocar texto encima.
- Respeta exactamente la relación de aspecto y el tamaño en píxeles de cada prompt.
- Cuando el prompt diga «transparente», entrega PNG con transparencia; si no puedes, sobre fondo blanco #FFFFFF liso, sin suelo ni sombra proyectada.
- Guarda cada imagen con el nombre exacto que indica el prompt (el ID: S01, H01, E001…, más la extensión). No añadas sufijos ni cambies mayúsculas.
- Genera una imagen por prompt. No expliques nada: solo confirma con el nombre del archivo.
```

### Lotes

| Lote | Contenido | Imágenes |
| --- | --- | --- |
| 1 | Sitio (portada, áreas, institucionales) | 14 |
| 2 | Portadas de las 20 guías | 20 |
| 3 | Explicativas de las guías de «analisis» | 21 |
| 4 | Explicativas de las guías de «clientes» | 18 |
| 5 | Explicativas de las guías de «marketing» | 37 |
| 6 | Explicativas de las guías de «negocio» | 15 |
| 7 | Explicativas de las guías de «ventas» | 15 |

> **Sobre las explicativas (lotes 3 a 7):** en cada guía estaban definidas como *capturas* de una hoja, una tabla o una conversación con datos ficticios. Una IA de imágenes no reproduce bien texto ni cifras, así que aquí se piden como **esquemas conceptuales** (bloques y líneas que representan la tabla o la pantalla). Sirven para orientar al lector, no para mostrar datos: si prefieres capturas reales, hazlas tú (la descripción de cada `data.ts` dice qué mostrar) y omite esos lotes.

---

## Lote 1 · Sitio (PNG transparente, 2400 px en el lado mayor)

### S01 · home-hero.png

- **Nombre a entregar:** `S01.png`  ·  **Destino final:** `public/images/site/home-hero.png`
- **Formato:** PNG transparente · 1920×2400 px (4/5)
- **Página:** /
- **Dónde se usa:** Portada · hero (a la derecha del título, sobresale por abajo)
- **Lo consume:** `app/(site)/page.tsx` → `FloatingIllustration file="home-hero.png"`

```
Genera la imagen y guárdala como «S01.png» (1920×2400 px, relación 4/5). Ilustración 3D de un asistente de IA amable de cuerpo redondeado en forma de cápsula, con dos ojos-pantalla y sin boca, que sostiene una ficha de papel con casillas sin texto. Alrededor flotan tres tarjetas translúcidas (una con líneas de texto abstractas, una con un gráfico de barras simple y una con un reloj) y una cinta de degradado menta→cian→violeta que las cruza en diagonal. Composición: el asistente ocupa el tercio inferior derecho, las tarjetas suben en arco hacia la izquierda; deja aire libre a la izquierda y arriba.
Estilo: ilustración 3D suave de acabado mate (arcilla/vinilo), formas redondeadas y simples, sin texto, sin logotipos, sin personas reales reconocibles. Paleta: menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6, marfil #F6F2E9 y tinta #0E2A2E. Iluminación de estudio suave desde arriba a la izquierda, reflejo de borde frío y sombras de contacto suaves.
Fondo: PNG con transparencia. Si no puedes exportar transparencia, entrégalo sobre un fondo blanco puro #FFFFFF completamente liso, sin degradado, sin suelo y sin sombra proyectada sobre el fondo (la sombra solo dentro del objeto), para poder recortarlo después.
Sin texto dentro de la imagen.
```

### S02 · home-metodo.png

- **Nombre a entregar:** `S02.png`  ·  **Destino final:** `public/images/site/home-metodo.png`
- **Formato:** PNG transparente · 2400×1500 px (16/10)
- **Página:** /
- **Dónde se usa:** Portada · método (franja oscura, columna derecha)
- **Lo consume:** `app/(site)/page.tsx` → `FloatingIllustration file="home-metodo.png"`

```
Genera la imagen y guárdala como «S02.png» (2400×1500 px, relación 16/10). Ilustración isométrica editorial de una mesa de trabajo con cuatro estaciones unidas por una línea luminosa menta: una libreta abierta, una hoja con un prompt (líneas abstractas, sin texto), una lupa sobre una lista y una casilla de verificación grande. Composición: recorrido en "S" de abajo-izquierda a arriba-derecha. Se colocará sobre un fondo casi negro verdoso, así que usa luz fría de borde y brillo menta en la línea, y colores claros en los objetos. Sin suelo ni plataforma que tape el fondo.
Estilo: ilustración 3D suave de acabado mate (arcilla/vinilo), formas redondeadas y simples, sin texto, sin logotipos, sin personas reales reconocibles. Paleta: menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6, marfil #F6F2E9 y tinta #0E2A2E. Iluminación de estudio suave desde arriba a la izquierda, reflejo de borde frío y sombras de contacto suaves.
Fondo: PNG con transparencia. Si no puedes exportar transparencia, entrégalo sobre un fondo blanco puro #FFFFFF completamente liso, sin degradado, sin suelo y sin sombra proyectada sobre el fondo (la sombra solo dentro del objeto), para poder recortarlo después.
Sin texto dentro de la imagen.
```

### S03 · home-criterio.png

- **Nombre a entregar:** `S03.png`  ·  **Destino final:** `public/images/site/home-criterio.png`
- **Formato:** PNG transparente · 2400×2400 px (1/1)
- **Página:** /
- **Dónde se usa:** Portada · cierre «La IA ayuda, pero no decide por ti»
- **Lo consume:** `app/(site)/page.tsx` → `FloatingIllustration file="home-criterio.png"`

```
Genera la imagen y guárdala como «S03.png» (2400×2400 px, relación 1/1). Silueta 3D de una balanza clásica en equilibrio: en un plato, un cubo con un destello (la IA); en el otro, una mano abierta estilizada sin rasgos (la persona). Composición centrada, con la base cortada por abajo para que pueda asomar bajo una sección. Iluminación cenital suave.
Estilo: ilustración 3D suave de acabado mate (arcilla/vinilo), formas redondeadas y simples, sin texto, sin logotipos, sin personas reales reconocibles. Paleta: menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6, marfil #F6F2E9 y tinta #0E2A2E. Iluminación de estudio suave desde arriba a la izquierda, reflejo de borde frío y sombras de contacto suaves.
Fondo: PNG con transparencia. Si no puedes exportar transparencia, entrégalo sobre un fondo blanco puro #FFFFFF completamente liso, sin degradado, sin suelo y sin sombra proyectada sobre el fondo (la sombra solo dentro del objeto), para poder recortarlo después.
Sin texto dentro de la imagen.
```

### S04 · area-marketing.png

- **Nombre a entregar:** `S04.png`  ·  **Destino final:** `public/images/site/area-marketing.png`
- **Formato:** PNG transparente · 2400×2400 px (1/1)
- **Página:** / y /marketing
- **Dónde se usa:** Portada · fila del área (miniatura) y cabecera de /marketing (grande)
- **Lo consume:** `app/(site)/page.tsx` y `app/(site)/[categoria]/page.tsx` → `area-marketing.png`

```
Genera la imagen y guárdala como «S04.png» (2400×2400 px, relación 1/1). Objeto 3D: un megáfono redondeado del que salen tres piezas planas (un cartel, un post cuadrado y una etiqueta), sin texto. Composición: el megáfono centrado y girado 15°; una pieza secundaria a la derecha. Acento de color: menta. Debe leerse como parte de una familia de cinco objetos de "áreas" (marketing, ventas, clientes, análisis, negocio) con el mismo estilo y escala.
Estilo: ilustración 3D suave de acabado mate (arcilla/vinilo), formas redondeadas y simples, sin texto, sin logotipos, sin personas reales reconocibles. Paleta: menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6, marfil #F6F2E9 y tinta #0E2A2E. Iluminación de estudio suave desde arriba a la izquierda, reflejo de borde frío y sombras de contacto suaves.
Fondo: PNG con transparencia. Si no puedes exportar transparencia, entrégalo sobre un fondo blanco puro #FFFFFF completamente liso, sin degradado, sin suelo y sin sombra proyectada sobre el fondo (la sombra solo dentro del objeto), para poder recortarlo después.
Sin texto dentro de la imagen.
```

### S05 · area-ventas.png

- **Nombre a entregar:** `S05.png`  ·  **Destino final:** `public/images/site/area-ventas.png`
- **Formato:** PNG transparente · 2400×2400 px (1/1)
- **Página:** / y /ventas
- **Dónde se usa:** Portada · fila del área y cabecera de /ventas
- **Lo consume:** `app/(site)/page.tsx` y `app/(site)/[categoria]/page.tsx` → `area-ventas.png`

```
Genera la imagen y guárdala como «S05.png» (2400×2400 px, relación 1/1). Objeto 3D: una caja registradora compacta con dos etiquetas de precio en blanco (sin números) y una bolsa de compra. Composición: objeto principal centrado y girado 15°, bolsa a la derecha. Acento de color: cian. Misma familia visual y escala que el resto de objetos de "áreas".
Estilo: ilustración 3D suave de acabado mate (arcilla/vinilo), formas redondeadas y simples, sin texto, sin logotipos, sin personas reales reconocibles. Paleta: menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6, marfil #F6F2E9 y tinta #0E2A2E. Iluminación de estudio suave desde arriba a la izquierda, reflejo de borde frío y sombras de contacto suaves.
Fondo: PNG con transparencia. Si no puedes exportar transparencia, entrégalo sobre un fondo blanco puro #FFFFFF completamente liso, sin degradado, sin suelo y sin sombra proyectada sobre el fondo (la sombra solo dentro del objeto), para poder recortarlo después.
Sin texto dentro de la imagen.
```

### S06 · area-clientes.png

- **Nombre a entregar:** `S06.png`  ·  **Destino final:** `public/images/site/area-clientes.png`
- **Formato:** PNG transparente · 2400×2400 px (1/1)
- **Página:** / y /clientes
- **Dónde se usa:** Portada · fila del área y cabecera de /clientes
- **Lo consume:** `app/(site)/page.tsx` y `app/(site)/[categoria]/page.tsx` → `area-clientes.png`

```
Genera la imagen y guárdala como «S06.png» (2400×2400 px, relación 1/1). Objeto 3D: dos burbujas de chat solapadas, una menta y otra marfil, con tres puntos de escritura en la más pequeña, sin texto. Composición: burbujas centradas y giradas 15°, una pieza pequeña (un corazón redondeado) a la derecha. Acento de color: violeta suave. Misma familia visual y escala que el resto de objetos de "áreas".
Estilo: ilustración 3D suave de acabado mate (arcilla/vinilo), formas redondeadas y simples, sin texto, sin logotipos, sin personas reales reconocibles. Paleta: menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6, marfil #F6F2E9 y tinta #0E2A2E. Iluminación de estudio suave desde arriba a la izquierda, reflejo de borde frío y sombras de contacto suaves.
Fondo: PNG con transparencia. Si no puedes exportar transparencia, entrégalo sobre un fondo blanco puro #FFFFFF completamente liso, sin degradado, sin suelo y sin sombra proyectada sobre el fondo (la sombra solo dentro del objeto), para poder recortarlo después.
Sin texto dentro de la imagen.
```

### S07 · area-analisis.png

- **Nombre a entregar:** `S07.png`  ·  **Destino final:** `public/images/site/area-analisis.png`
- **Formato:** PNG transparente · 2400×2400 px (1/1)
- **Página:** / y /analisis
- **Dónde se usa:** Portada · fila del área y cabecera de /analisis
- **Lo consume:** `app/(site)/page.tsx` y `app/(site)/[categoria]/page.tsx` → `area-analisis.png`

```
Genera la imagen y guárdala como «S07.png» (2400×2400 px, relación 1/1). Objeto 3D: un gráfico de barras y una línea de tendencia sobre una base redondeada, con una lupa que amplía uno de los puntos, sin números ni texto. Composición: gráfico centrado y girado 15°, lupa a la derecha. Acento de color: ámbar suave. Misma familia visual y escala que el resto de objetos de "áreas".
Estilo: ilustración 3D suave de acabado mate (arcilla/vinilo), formas redondeadas y simples, sin texto, sin logotipos, sin personas reales reconocibles. Paleta: menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6, marfil #F6F2E9 y tinta #0E2A2E. Iluminación de estudio suave desde arriba a la izquierda, reflejo de borde frío y sombras de contacto suaves.
Fondo: PNG con transparencia. Si no puedes exportar transparencia, entrégalo sobre un fondo blanco puro #FFFFFF completamente liso, sin degradado, sin suelo y sin sombra proyectada sobre el fondo (la sombra solo dentro del objeto), para poder recortarlo después.
Sin texto dentro de la imagen.
```

### S08 · area-negocio.png

- **Nombre a entregar:** `S08.png`  ·  **Destino final:** `public/images/site/area-negocio.png`
- **Formato:** PNG transparente · 2400×2400 px (1/1)
- **Página:** / y /negocio
- **Dónde se usa:** Portada · fila del área y cabecera de /negocio
- **Lo consume:** `app/(site)/page.tsx` y `app/(site)/[categoria]/page.tsx` → `area-negocio.png`

```
Genera la imagen y guárdala como «S08.png» (2400×2400 px, relación 1/1). Objeto 3D: un tablero de tareas con tres columnas de tarjetas sin texto y un reloj de pared pequeño. Composición: tablero centrado y girado 15°, reloj a la derecha. Acento de color: verde azulado. Misma familia visual y escala que el resto de objetos de "áreas".
Estilo: ilustración 3D suave de acabado mate (arcilla/vinilo), formas redondeadas y simples, sin texto, sin logotipos, sin personas reales reconocibles. Paleta: menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6, marfil #F6F2E9 y tinta #0E2A2E. Iluminación de estudio suave desde arriba a la izquierda, reflejo de borde frío y sombras de contacto suaves.
Fondo: PNG con transparencia. Si no puedes exportar transparencia, entrégalo sobre un fondo blanco puro #FFFFFF completamente liso, sin degradado, sin suelo y sin sombra proyectada sobre el fondo (la sombra solo dentro del objeto), para poder recortarlo después.
Sin texto dentro de la imagen.
```

### S09 · guias-cabecera.png

- **Nombre a entregar:** `S09.png`  ·  **Destino final:** `public/images/site/guias-cabecera.png`
- **Formato:** PNG transparente · 2400×1350 px (16/9)
- **Página:** /guias
- **Dónde se usa:** Biblioteca · cabecera (derecha)
- **Lo consume:** `app/(site)/guias/page.tsx` → `FloatingIllustration file="guias-cabecera.png"`

```
Genera la imagen y guárdala como «S09.png» (2400×1350 px, relación 16/9). Composición abstracta 3D: cinco libros o fichas de tamaños distintos, en abanico hacia la derecha, cada uno con un lomo de un color de la paleta (menta, cian, violeta, ámbar suave, verde azulado) y el libro menta al frente; una cinta de degradado menta→cian→violeta pasa por detrás. Sin texto en las cubiertas. Brillo suave en los cantos.
Estilo: ilustración 3D suave de acabado mate (arcilla/vinilo), formas redondeadas y simples, sin texto, sin logotipos, sin personas reales reconocibles. Paleta: menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6, marfil #F6F2E9 y tinta #0E2A2E. Iluminación de estudio suave desde arriba a la izquierda, reflejo de borde frío y sombras de contacto suaves.
Fondo: PNG con transparencia. Si no puedes exportar transparencia, entrégalo sobre un fondo blanco puro #FFFFFF completamente liso, sin degradado, sin suelo y sin sombra proyectada sobre el fondo (la sombra solo dentro del objeto), para poder recortarlo después.
Sin texto dentro de la imagen.
```

### S10 · guia-relacionadas.png

- **Nombre a entregar:** `S10.png`  ·  **Destino final:** `public/images/site/guia-relacionadas.png`
- **Formato:** PNG transparente · 2400×1800 px (4/3)
- **Página:** Todas las guías
- **Dónde se usa:** Bloque «Guías relacionadas» (esquina, asoma por el borde inferior)
- **Lo consume:** `components/guide/related-guides.tsx` → `FloatingIllustration file="guia-relacionadas.png"`

```
Genera la imagen y guárdala como «S10.png» (2400×1800 px, relación 4/3). Silueta 3D del mismo asistente de IA amable de la portada (cuerpo de cápsula, dos ojos-pantalla, sin boca) asomando desde el borde inferior con una mano apoyada en el margen y señalando hacia la izquierda con una ficha. Cortado por abajo: solo se ve la mitad superior del cuerpo. Debe funcionar sobre fondo claro y oscuro.
Estilo: ilustración 3D suave de acabado mate (arcilla/vinilo), formas redondeadas y simples, sin texto, sin logotipos, sin personas reales reconocibles. Paleta: menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6, marfil #F6F2E9 y tinta #0E2A2E. Iluminación de estudio suave desde arriba a la izquierda, reflejo de borde frío y sombras de contacto suaves.
Fondo: PNG con transparencia. Si no puedes exportar transparencia, entrégalo sobre un fondo blanco puro #FFFFFF completamente liso, sin degradado, sin suelo y sin sombra proyectada sobre el fondo (la sombra solo dentro del objeto), para poder recortarlo después.
Sin texto dentro de la imagen.
```

### S11 · sobre-cabecera.png

- **Nombre a entregar:** `S11.png`  ·  **Destino final:** `public/images/site/sobre-cabecera.png`
- **Formato:** PNG transparente · 2400×1800 px (4/3)
- **Página:** /sobre-nosotros
- **Dónde se usa:** Sobre nosotros · cabecera
- **Lo consume:** `app/(site)/sobre-nosotros/page.tsx` → `FloatingIllustration file="sobre-cabecera.png"`

```
Genera la imagen y guárdala como «S11.png» (2400×1800 px, relación 4/3). Ilustración editorial 3D de un cuaderno abierto con una casilla marcada, un lápiz, una lupa y una pequeña planta, sin texto. Composición: objetos en diagonal descendente. Iluminación cálida y suave.
Estilo: ilustración 3D suave de acabado mate (arcilla/vinilo), formas redondeadas y simples, sin texto, sin logotipos, sin personas reales reconocibles. Paleta: menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6, marfil #F6F2E9 y tinta #0E2A2E. Iluminación de estudio suave desde arriba a la izquierda, reflejo de borde frío y sombras de contacto suaves.
Fondo: PNG con transparencia. Si no puedes exportar transparencia, entrégalo sobre un fondo blanco puro #FFFFFF completamente liso, sin degradado, sin suelo y sin sombra proyectada sobre el fondo (la sombra solo dentro del objeto), para poder recortarlo después.
Sin texto dentro de la imagen.
```

### S12 · contacto-sobre.png

- **Nombre a entregar:** `S12.png`  ·  **Destino final:** `public/images/site/contacto-sobre.png`
- **Formato:** PNG transparente · 2400×2400 px (1/1)
- **Página:** /contacto
- **Dónde se usa:** Contacto · cabecera
- **Lo consume:** `app/(site)/contacto/page.tsx` → `FloatingIllustration file="contacto-sobre.png"`

```
Genera la imagen y guárdala como «S12.png» (2400×2400 px, relación 1/1). Objeto 3D: un sobre marfil abierto del que sale un avión de papel menta con una estela de degradado menta→cian. Composición: el avión sale hacia arriba a la derecha.
Estilo: ilustración 3D suave de acabado mate (arcilla/vinilo), formas redondeadas y simples, sin texto, sin logotipos, sin personas reales reconocibles. Paleta: menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6, marfil #F6F2E9 y tinta #0E2A2E. Iluminación de estudio suave desde arriba a la izquierda, reflejo de borde frío y sombras de contacto suaves.
Fondo: PNG con transparencia. Si no puedes exportar transparencia, entrégalo sobre un fondo blanco puro #FFFFFF completamente liso, sin degradado, sin suelo y sin sombra proyectada sobre el fondo (la sombra solo dentro del objeto), para poder recortarlo después.
Sin texto dentro de la imagen.
```

### S13 · legal-escudo.png

- **Nombre a entregar:** `S13.png`  ·  **Destino final:** `public/images/site/legal-escudo.png`
- **Formato:** PNG transparente · 2400×2400 px (1/1)
- **Página:** /politica-de-privacidad, /politica-de-cookies, /terminos-y-condiciones
- **Dónde se usa:** Páginas legales · cabecera (pequeña)
- **Lo consume:** `components/shared/legal-page.tsx` → `FloatingIllustration file="legal-escudo.png"`

```
Genera la imagen y guárdala como «S13.png» (2400×2400 px, relación 1/1). Objeto 3D: un escudo redondeado con una casilla de verificación en relieve, apoyado sobre una hoja de papel sin texto. Sobrio y sencillo.
Estilo: ilustración 3D suave de acabado mate (arcilla/vinilo), formas redondeadas y simples, sin texto, sin logotipos, sin personas reales reconocibles. Paleta: menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6, marfil #F6F2E9 y tinta #0E2A2E. Iluminación de estudio suave desde arriba a la izquierda, reflejo de borde frío y sombras de contacto suaves.
Fondo: PNG con transparencia. Si no puedes exportar transparencia, entrégalo sobre un fondo blanco puro #FFFFFF completamente liso, sin degradado, sin suelo y sin sombra proyectada sobre el fondo (la sombra solo dentro del objeto), para poder recortarlo después.
Sin texto dentro de la imagen.
```

### S14 · error-404.png

- **Nombre a entregar:** `S14.png`  ·  **Destino final:** `public/images/site/error-404.png`
- **Formato:** PNG transparente · 2400×2400 px (1/1)
- **Página:** 404
- **Dónde se usa:** Página no encontrada · centro
- **Lo consume:** `app/not-found.tsx` → `FloatingIllustration file="error-404.png"`

```
Genera la imagen y guárdala como «S14.png» (2400×2400 px, relación 1/1). Personaje 3D: el mismo asistente de IA amable de la portada (cuerpo de cápsula, dos ojos-pantalla, sin boca) con una lupa, mirando un mapa doblado del que asoma una ficha en blanco. De tres cuartos, con un signo de interrogación pequeño hecho como forma abstracta (sin texto).
Estilo: ilustración 3D suave de acabado mate (arcilla/vinilo), formas redondeadas y simples, sin texto, sin logotipos, sin personas reales reconocibles. Paleta: menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6, marfil #F6F2E9 y tinta #0E2A2E. Iluminación de estudio suave desde arriba a la izquierda, reflejo de borde frío y sombras de contacto suaves.
Fondo: PNG con transparencia. Si no puedes exportar transparencia, entrégalo sobre un fondo blanco puro #FFFFFF completamente liso, sin degradado, sin suelo y sin sombra proyectada sobre el fondo (la sombra solo dentro del objeto), para poder recortarlo después.
Sin texto dentro de la imagen.
```

---

## Lote 2 · Portadas de las 20 guías (16:9, 1600×900 px, fondo opaco)

### H01 · portada — Analizar ofertas de proveedores con IA

- **Nombre a entregar:** `H01.png`  ·  **Destino final:** `public/images/guias/analisis/analizar-ofertas-de-proveedores-con-ia/hero.webp`
- **Formato:** PNG o JPG opaco · 1600×900 px (16/9); yo lo convierto a WebP
- **Guía:** /analisis/guias/analizar-ofertas-de-proveedores-con-ia  ·  **Sección:** cabecera (hero)

```
Genera la imagen y guárdala como «H01.png» (1600×900 px, relación 16/9): portada editorial para la guía «Analizar ofertas de proveedores con IA». Escena: A la izquierda, tres ofertas ficticias con formatos distintos (una por millar, una por paquete, una por unidad); a la derecha, una hoja con una sola columna de costo por unidad necesaria y la más baja resaltada. Sin logos ni datos de contacto reales.
Estilo: ilustración 3D suave de acabado mate, formas redondeadas y simples, sobre un fondo marfil #F6F2E9 con un degradado sutil hacia menta #15B38C; paleta menta, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Iluminación de estudio suave desde arriba a la izquierda. Composición con el interés visual hacia la derecha y aire libre a la izquierda. Sin texto legible, sin números, sin logotipos; el texto y las tablas se representan con líneas y bloques abstractos.
```

### H02 · portada — Analizar tus ventas con IA sin tomar hipótesis por hechos

- **Nombre a entregar:** `H02.png`  ·  **Destino final:** `public/images/guias/analisis/analizar-ventas-con-ia/hero.webp`
- **Formato:** PNG o JPG opaco · 1600×900 px (16/9); yo lo convierto a WebP
- **Guía:** /analisis/guias/analizar-ventas-con-ia  ·  **Sección:** cabecera (hero)

```
Genera la imagen y guárdala como «H02.png» (1600×900 px, relación 16/9): portada editorial para la guía «Analizar tus ventas con IA sin tomar hipótesis por hechos». Escena: Debe verse que los totales son una fórmula y no un número escrito a mano.
Estilo: ilustración 3D suave de acabado mate, formas redondeadas y simples, sobre un fondo marfil #F6F2E9 con un degradado sutil hacia menta #15B38C; paleta menta, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Iluminación de estudio suave desde arriba a la izquierda. Composición con el interés visual hacia la derecha y aire libre a la izquierda. Sin texto legible, sin números, sin logotipos; el texto y las tablas se representan con líneas y bloques abstractos.
```

### H03 · portada — Ideas de nuevos productos o servicios con IA

- **Nombre a entregar:** `H03.png`  ·  **Destino final:** `public/images/guias/analisis/ideas-de-nuevos-productos-con-ia/hero.webp`
- **Formato:** PNG o JPG opaco · 1600×900 px (16/9); yo lo convierto a WebP
- **Guía:** /analisis/guias/ideas-de-nuevos-productos-con-ia  ·  **Sección:** cabecera (hero)

```
Genera la imagen y guárdala como «H03.png» (1600×900 px, relación 16/9): portada editorial para la guía «Ideas de nuevos productos o servicios con IA». Escena: Tres bloques de izquierda a derecha: frases de clientes con su número de veces, una tabla de hipótesis que cita esos problemas y un plan de prueba con un criterio de éxito. Sin logos ni nombres reales.
Estilo: ilustración 3D suave de acabado mate, formas redondeadas y simples, sobre un fondo marfil #F6F2E9 con un degradado sutil hacia menta #15B38C; paleta menta, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Iluminación de estudio suave desde arriba a la izquierda. Composición con el interés visual hacia la derecha y aire libre a la izquierda. Sin texto legible, sin números, sin logotipos; el texto y las tablas se representan con líneas y bloques abstractos.
```

### H04 · portada — Investigar competidores con IA

- **Nombre a entregar:** `H04.png`  ·  **Destino final:** `public/images/guias/analisis/investigar-competidores-con-ia/hero.webp`
- **Formato:** PNG o JPG opaco · 1600×900 px (16/9); yo lo convierto a WebP
- **Guía:** /analisis/guias/investigar-competidores-con-ia  ·  **Sección:** cabecera (hero)

```
Genera la imagen y guárdala como «H04.png» (1600×900 px, relación 16/9): portada editorial para la guía «Investigar competidores con IA». Escena: A la izquierda, una tabla de evidencia con una columna de fuente y otra de fecha resaltadas; a la derecha, una tabla de comparación cuyas celdas llevan identificadores entre corchetes. Sin logos ni nombres reales.
Estilo: ilustración 3D suave de acabado mate, formas redondeadas y simples, sobre un fondo marfil #F6F2E9 con un degradado sutil hacia menta #15B38C; paleta menta, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Iluminación de estudio suave desde arriba a la izquierda. Composición con el interés visual hacia la derecha y aire libre a la izquierda. Sin texto legible, sin números, sin logotipos; el texto y las tablas se representan con líneas y bloques abstractos.
```

### H05 · portada — Analizar opiniones de clientes con IA

- **Nombre a entregar:** `H05.png`  ·  **Destino final:** `public/images/guias/clientes/analizar-opiniones-de-clientes-con-ia/hero.webp`
- **Formato:** PNG o JPG opaco · 1600×900 px (16/9); yo lo convierto a WebP
- **Guía:** /clientes/guias/analizar-opiniones-de-clientes-con-ia  ·  **Sección:** cabecera (hero)

```
Genera la imagen y guárdala como «H05.png» (1600×900 px, relación 16/9): portada editorial para la guía «Analizar opiniones de clientes con IA». Escena: Una hoja de cálculo con las reseñas ficticias del caso a la izquierda, con su tema y valencia, y a la derecha el conteo por tema con las menciones positivas y negativas. Resaltar el tema con más menciones negativas. Sin datos personales.
Estilo: ilustración 3D suave de acabado mate, formas redondeadas y simples, sobre un fondo marfil #F6F2E9 con un degradado sutil hacia menta #15B38C; paleta menta, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Iluminación de estudio suave desde arriba a la izquierda. Composición con el interés visual hacia la derecha y aire libre a la izquierda. Sin texto legible, sin números, sin logotipos; el texto y las tablas se representan con líneas y bloques abstractos.
```

### H06 · portada — Responder consultas de clientes con IA sin prometer de más

- **Nombre a entregar:** `H06.png`  ·  **Destino final:** `public/images/guias/clientes/responder-consultas-de-clientes-con-ia/hero.webp`
- **Formato:** PNG o JPG opaco · 1600×900 px (16/9); yo lo convierto a WebP
- **Guía:** /clientes/guias/responder-consultas-de-clientes-con-ia  ·  **Sección:** cabecera (hero)

```
Genera la imagen y guárdala como «H06.png» (1600×900 px, relación 16/9): portada editorial para la guía «Responder consultas de clientes con IA sin prometer de más». Escena: Una conversación de mensajería anonimizada (sin nombres, teléfonos ni patentes): a un lado la consulta del cliente del caso ficticio y al otro el borrador ya revisado, con una marca en cada dato que sale de la base. Sin datos personales.
Estilo: ilustración 3D suave de acabado mate, formas redondeadas y simples, sobre un fondo marfil #F6F2E9 con un degradado sutil hacia menta #15B38C; paleta menta, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Iluminación de estudio suave desde arriba a la izquierda. Composición con el interés visual hacia la derecha y aire libre a la izquierda. Sin texto legible, sin números, sin logotipos; el texto y las tablas se representan con líneas y bloques abstractos.
```

### H07 · portada — Responder reclamos de clientes con IA

- **Nombre a entregar:** `H07.png`  ·  **Destino final:** `public/images/guias/clientes/responder-reclamos-con-ia/hero.webp`
- **Formato:** PNG o JPG opaco · 1600×900 px (16/9); yo lo convierto a WebP
- **Guía:** /clientes/guias/responder-reclamos-con-ia  ·  **Sección:** cabecera (hero)

```
Genera la imagen y guárdala como «H07.png» (1600×900 px, relación 16/9): portada editorial para la guía «Responder reclamos de clientes con IA». Escena: Una composición de tres columnas: a la izquierda un mensaje de reclamo ficticio en un chat, en el centro una tabla con hechos y estados (Confirmado, Parcial, No confirmado) y a la derecha una respuesta corta. Sin nombres ni teléfonos reales.
Estilo: ilustración 3D suave de acabado mate, formas redondeadas y simples, sobre un fondo marfil #F6F2E9 con un degradado sutil hacia menta #15B38C; paleta menta, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Iluminación de estudio suave desde arriba a la izquierda. Composición con el interés visual hacia la derecha y aire libre a la izquierda. Sin texto legible, sin números, sin logotipos; el texto y las tablas se representan con líneas y bloques abstractos.
```

### H08 · portada — Crear un calendario de contenido con IA que cabe en tu tiempo

- **Nombre a entregar:** `H08.png`  ·  **Destino final:** `public/images/guias/marketing/calendario-de-contenido-con-ia/hero.webp`
- **Formato:** PNG o JPG opaco · 1600×900 px (16/9); yo lo convierto a WebP
- **Guía:** /marketing/guias/calendario-de-contenido-con-ia  ·  **Sección:** cabecera (hero)

```
Genera la imagen y guárdala como «H08.png» (1600×900 px, relación 16/9): portada editorial para la guía «Crear un calendario de contenido con IA que cabe en tu tiempo». Escena: Una hoja de cálculo con el calendario de cuatro semanas del caso ficticio, con una columna de minutos por pieza y, debajo de cada semana, el total frente a los minutos usables. Resaltar con un color los totales que caben. Sin datos personales.
Estilo: ilustración 3D suave de acabado mate, formas redondeadas y simples, sobre un fondo marfil #F6F2E9 con un degradado sutil hacia menta #15B38C; paleta menta, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Iluminación de estudio suave desde arriba a la izquierda. Composición con el interés visual hacia la derecha y aire libre a la izquierda. Sin texto legible, sin números, sin logotipos; el texto y las tablas se representan con líneas y bloques abstractos.
```

### H09 · portada — Crear afiches con IA que se entienden de un vistazo

- **Nombre a entregar:** `H09.png`  ·  **Destino final:** `public/images/guias/marketing/crear-afiches-con-ia/hero.webp`
- **Formato:** PNG o JPG opaco · 1600×900 px (16/9); yo lo convierto a WebP
- **Guía:** /marketing/guias/crear-afiches-con-ia  ·  **Sección:** cabecera (hero)

```
Genera la imagen y guárdala como «H09.png» (1600×900 px, relación 16/9): portada editorial para la guía «Crear afiches con IA que se entienden de un vistazo». Escena: Foto de un afiche real del negocio pegado en su vitrina, mostrador o poste, tomada desde donde lo leería un cliente que pasa. Debe distinguirse a simple vista qué se ofrece. Sin rostros identificables ni datos personales.
Estilo: ilustración 3D suave de acabado mate, formas redondeadas y simples, sobre un fondo marfil #F6F2E9 con un degradado sutil hacia menta #15B38C; paleta menta, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Iluminación de estudio suave desde arriba a la izquierda. Composición con el interés visual hacia la derecha y aire libre a la izquierda. Sin texto legible, sin números, sin logotipos; el texto y las tablas se representan con líneas y bloques abstractos.
```

### H10 · portada — Crear anuncios para tu negocio con IA

- **Nombre a entregar:** `H10.png`  ·  **Destino final:** `public/images/guias/marketing/crear-anuncios-con-ia/hero.webp`
- **Formato:** PNG o JPG opaco · 1600×900 px (16/9); yo lo convierto a WebP
- **Guía:** /marketing/guias/crear-anuncios-con-ia  ·  **Sección:** cabecera (hero)

```
Genera la imagen y guárdala como «H10.png» (1600×900 px, relación 16/9): portada editorial para la guía «Crear anuncios para tu negocio con IA». Escena: A la izquierda, la ficha del anuncio completa (caso ficticio de una ferretería). A la derecha, el anuncio final en una tarjeta con imagen y texto. Unir con una línea las condiciones de la ficha con la frase del anuncio que las contiene. Sin logotipos reales ni datos de personas.
Estilo: ilustración 3D suave de acabado mate, formas redondeadas y simples, sobre un fondo marfil #F6F2E9 con un degradado sutil hacia menta #15B38C; paleta menta, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Iluminación de estudio suave desde arriba a la izquierda. Composición con el interés visual hacia la derecha y aire libre a la izquierda. Sin texto legible, sin números, sin logotipos; el texto y las tablas se representan con líneas y bloques abstractos.
```

### H11 · portada — Crear una campaña promocional completa con IA

- **Nombre a entregar:** `H11.png`  ·  **Destino final:** `public/images/guias/marketing/crear-campanas-promocionales-con-ia/hero.webp`
- **Formato:** PNG o JPG opaco · 1600×900 px (16/9); yo lo convierto a WebP
- **Guía:** /marketing/guias/crear-campanas-promocionales-con-ia  ·  **Sección:** cabecera (hero)

```
Genera la imagen y guárdala como «H11.png» (1600×900 px, relación 16/9): portada editorial para la guía «Crear una campaña promocional completa con IA». Escena: Una hoja de cálculo dividida en dos: a la izquierda la ficha de campaña del caso ficticio (campo, valor y «Aparece en») y a la derecha la matriz de coherencia con las cinco piezas como columnas y las marcas ✓ y ✗. Resaltar con un color una celda ✗. Sin datos personales.
Estilo: ilustración 3D suave de acabado mate, formas redondeadas y simples, sobre un fondo marfil #F6F2E9 con un degradado sutil hacia menta #15B38C; paleta menta, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Iluminación de estudio suave desde arriba a la izquierda. Composición con el interés visual hacia la derecha y aire libre a la izquierda. Sin texto legible, sin números, sin logotipos; el texto y las tablas se representan con líneas y bloques abstractos.
```

### H12 · portada — Crear promociones con IA: diseña ofertas que sí te convienen

- **Nombre a entregar:** `H12.png`  ·  **Destino final:** `public/images/guias/marketing/crear-promociones-con-ia/hero.webp`
- **Formato:** PNG o JPG opaco · 1600×900 px (16/9); yo lo convierto a WebP
- **Guía:** /marketing/guias/crear-promociones-con-ia  ·  **Sección:** cabecera (hero)

```
Genera la imagen y guárdala como «H12.png» (1600×900 px, relación 16/9): portada editorial para la guía «Crear promociones con IA: diseña ofertas que sí te convienen». Escena: Una mesa de trabajo de cafetería (caso ficticio) con una laptop que muestra, a un lado, la hoja con margen y descuento real de cuatro promociones y, al otro, una conversación con un asistente de IA. Una libreta con el objetivo y los límites escritos a mano. Sin logotipos reales ni datos de personas.
Estilo: ilustración 3D suave de acabado mate, formas redondeadas y simples, sobre un fondo marfil #F6F2E9 con un degradado sutil hacia menta #15B38C; paleta menta, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Iluminación de estudio suave desde arriba a la izquierda. Composición con el interés visual hacia la derecha y aire libre a la izquierda. Sin texto legible, sin números, sin logotipos; el texto y las tablas se representan con líneas y bloques abstractos.
```

### H13 · portada — Crear publicaciones para redes sociales con IA

- **Nombre a entregar:** `H13.png`  ·  **Destino final:** `public/images/guias/marketing/crear-publicaciones-para-redes-sociales-con-ia/hero.webp`
- **Formato:** PNG o JPG opaco · 1600×900 px (16/9); yo lo convierto a WebP
- **Guía:** /marketing/guias/crear-publicaciones-para-redes-sociales-con-ia  ·  **Sección:** cabecera (hero)

```
Genera la imagen y guárdala como «H13.png» (1600×900 px, relación 16/9): portada editorial para la guía «Crear publicaciones para redes sociales con IA». Escena: A la izquierda, la plantilla del brief de siete campos ya completa (caso ficticio de la peluquería). A la derecha, la publicación final en una tarjeta de imagen con texto. Unir con una línea el campo «Producto u oferta» con la frase de la tarjeta que sale de él. Sin logotipos reales ni datos de personas.
Estilo: ilustración 3D suave de acabado mate, formas redondeadas y simples, sobre un fondo marfil #F6F2E9 con un degradado sutil hacia menta #15B38C; paleta menta, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Iluminación de estudio suave desde arriba a la izquierda. Composición con el interés visual hacia la derecha y aire libre a la izquierda. Sin texto legible, sin números, sin logotipos; el texto y las tablas se representan con líneas y bloques abstractos.
```

### H14 · portada — Ideas de contenido para tu negocio con IA que no suenan genéricas

- **Nombre a entregar:** `H14.png`  ·  **Destino final:** `public/images/guias/marketing/ideas-de-contenido-para-tu-negocio-con-ia/hero.webp`
- **Formato:** PNG o JPG opaco · 1600×900 px (16/9); yo lo convierto a WebP
- **Guía:** /marketing/guias/ideas-de-contenido-para-tu-negocio-con-ia  ·  **Sección:** cabecera (hero)

```
Genera la imagen y guárdala como «H14.png» (1600×900 px, relación 16/9): portada editorial para la guía «Ideas de contenido para tu negocio con IA que no suenan genéricas». Escena: Resaltar con un recuadro la columna «De dónde sale». Sin datos personales de clientes.
Estilo: ilustración 3D suave de acabado mate, formas redondeadas y simples, sobre un fondo marfil #F6F2E9 con un degradado sutil hacia menta #15B38C; paleta menta, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Iluminación de estudio suave desde arriba a la izquierda. Composición con el interés visual hacia la derecha y aire libre a la izquierda. Sin texto legible, sin números, sin logotipos; el texto y las tablas se representan con líneas y bloques abstractos.
```

### H15 · portada — Documentar procesos de tu negocio con IA

- **Nombre a entregar:** `H15.png`  ·  **Destino final:** `public/images/guias/negocio/documentar-procesos-con-ia/hero.webp`
- **Formato:** PNG o JPG opaco · 1600×900 px (16/9); yo lo convierto a WebP
- **Guía:** /negocio/guias/documentar-procesos-con-ia  ·  **Sección:** cabecera (hero)

```
Genera la imagen y guárdala como «H15.png» (1600×900 px, relación 16/9): portada editorial para la guía «Documentar procesos de tu negocio con IA». Escena: Tres bloques de izquierda a derecha: unas notas de siete líneas, una conversación de preguntas y respuestas y una lista de pasos con casillas, con una segunda persona marcándolas. Sin logos ni nombres reales.
Estilo: ilustración 3D suave de acabado mate, formas redondeadas y simples, sobre un fondo marfil #F6F2E9 con un degradado sutil hacia menta #15B38C; paleta menta, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Iluminación de estudio suave desde arriba a la izquierda. Composición con el interés visual hacia la derecha y aire libre a la izquierda. Sin texto legible, sin números, sin logotipos; el texto y las tablas se representan con líneas y bloques abstractos.
```

### H16 · portada — Organizar las tareas de tu negocio con IA

- **Nombre a entregar:** `H16.png`  ·  **Destino final:** `public/images/guias/negocio/organizar-tareas-del-negocio-con-ia/hero.webp`
- **Formato:** PNG o JPG opaco · 1600×900 px (16/9); yo lo convierto a WebP
- **Guía:** /negocio/guias/organizar-tareas-del-negocio-con-ia  ·  **Sección:** cabecera (hero)

```
Genera la imagen y guárdala como «H16.png» (1600×900 px, relación 16/9): portada editorial para la guía «Organizar las tareas de tu negocio con IA». Escena: Tres bloques de izquierda a derecha: notas sueltas de pendientes, una tabla con columnas de impacto, fecha y responsable y un calendario de cinco días con tareas repartidas entre tres personas. Sin logos ni nombres reales.
Estilo: ilustración 3D suave de acabado mate, formas redondeadas y simples, sobre un fondo marfil #F6F2E9 con un degradado sutil hacia menta #15B38C; paleta menta, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Iluminación de estudio suave desde arriba a la izquierda. Composición con el interés visual hacia la derecha y aire libre a la izquierda. Sin texto legible, sin números, sin logotipos; el texto y las tablas se representan con líneas y bloques abstractos.
```

### H17 · portada — Un sistema diario de trabajo con IA para tu negocio

- **Nombre a entregar:** `H17.png`  ·  **Destino final:** `public/images/guias/negocio/sistema-diario-de-trabajo-con-ia/hero.webp`
- **Formato:** PNG o JPG opaco · 1600×900 px (16/9); yo lo convierto a WebP
- **Guía:** /negocio/guias/sistema-diario-de-trabajo-con-ia  ·  **Sección:** cabecera (hero)

```
Genera la imagen y guárdala como «H17.png» (1600×900 px, relación 16/9): portada editorial para la guía «Un sistema diario de trabajo con IA para tu negocio». Escena: Una línea de tiempo de un día con una ficha de contexto a la izquierda, una apertura por la mañana, cuatro bloques en el medio y una nota de traspaso que sale por la derecha hacia el día siguiente. Sin logos ni nombres reales.
Estilo: ilustración 3D suave de acabado mate, formas redondeadas y simples, sobre un fondo marfil #F6F2E9 con un degradado sutil hacia menta #15B38C; paleta menta, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Iluminación de estudio suave desde arriba a la izquierda. Composición con el interés visual hacia la derecha y aire libre a la izquierda. Sin texto legible, sin números, sin logotipos; el texto y las tablas se representan con líneas y bloques abstractos.
```

### H18 · portada — Crear cotizaciones y propuestas comerciales con IA

- **Nombre a entregar:** `H18.png`  ·  **Destino final:** `public/images/guias/ventas/crear-cotizaciones-y-propuestas-con-ia/hero.webp`
- **Formato:** PNG o JPG opaco · 1600×900 px (16/9); yo lo convierto a WebP
- **Guía:** /ventas/guias/crear-cotizaciones-y-propuestas-con-ia  ·  **Sección:** cabecera (hero)

```
Genera la imagen y guárdala como «H18.png» (1600×900 px, relación 16/9): portada editorial para la guía «Crear cotizaciones y propuestas comerciales con IA». Escena: Una hoja de cálculo con la calculadora del caso ficticio (partidas, subtotal, descuento, impuesto, total, anticipo y saldo) a la izquierda y, a la derecha, la cotización redactada con los mismos totales. Resaltar el total en ambos lados. Sin datos personales.
Estilo: ilustración 3D suave de acabado mate, formas redondeadas y simples, sobre un fondo marfil #F6F2E9 con un degradado sutil hacia menta #15B38C; paleta menta, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Iluminación de estudio suave desde arriba a la izquierda. Composición con el interés visual hacia la derecha y aire libre a la izquierda. Sin texto legible, sin números, sin logotipos; el texto y las tablas se representan con líneas y bloques abstractos.
```

### H19 · portada — Crear descripciones de productos con IA sin inventar datos

- **Nombre a entregar:** `H19.png`  ·  **Destino final:** `public/images/guias/ventas/crear-descripciones-de-productos-con-ia/hero.webp`
- **Formato:** PNG o JPG opaco · 1600×900 px (16/9); yo lo convierto a WebP
- **Guía:** /ventas/guias/crear-descripciones-de-productos-con-ia  ·  **Sección:** cabecera (hero)

```
Genera la imagen y guárdala como «H19.png» (1600×900 px, relación 16/9): portada editorial para la guía «Crear descripciones de productos con IA sin inventar datos». Escena: Una hoja de cálculo dividida en dos: a la izquierda la ficha del caso ficticio (campo, dato, estado y origen) con dos filas «Sin confirmar» resaltadas y, a la derecha, la descripción corta que se obtiene de ella. Sin datos personales.
Estilo: ilustración 3D suave de acabado mate, formas redondeadas y simples, sobre un fondo marfil #F6F2E9 con un degradado sutil hacia menta #15B38C; paleta menta, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Iluminación de estudio suave desde arriba a la izquierda. Composición con el interés visual hacia la derecha y aire libre a la izquierda. Sin texto legible, sin números, sin logotipos; el texto y las tablas se representan con líneas y bloques abstractos.
```

### H20 · portada — Definir precios y márgenes con apoyo de la IA

- **Nombre a entregar:** `H20.png`  ·  **Destino final:** `public/images/guias/ventas/definir-precios-y-margenes-con-ia/hero.webp`
- **Formato:** PNG o JPG opaco · 1600×900 px (16/9); yo lo convierto a WebP
- **Guía:** /ventas/guias/definir-precios-y-margenes-con-ia  ·  **Sección:** cabecera (hero)

```
Genera la imagen y guárdala como «H20.png» (1600×900 px, relación 16/9): portada editorial para la guía «Definir precios y márgenes con apoyo de la IA». Escena: Una hoja de cálculo con la calculadora del caso ficticio (costo por caja, precio objetivo, ganancia, recargo y margen real) a la izquierda y, a la derecha, la lectura del asistente con «Lo que dice la hoja» y «Preguntas para aclarar». Resaltar el costo total. Sin datos personales.
Estilo: ilustración 3D suave de acabado mate, formas redondeadas y simples, sobre un fondo marfil #F6F2E9 con un degradado sutil hacia menta #15B38C; paleta menta, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Iluminación de estudio suave desde arriba a la izquierda. Composición con el interés visual hacia la derecha y aire libre a la izquierda. Sin texto legible, sin números, sin logotipos; el texto y las tablas se representan con líneas y bloques abstractos.
```

---

## Lote 3 · Explicativas · «analisis»

#### Analizar ofertas de proveedores con IA (`guias/analisis/analizar-ofertas-de-proveedores-con-ia/`)

##### E001 · ofertas-recibidas

- **Nombre a entregar:** `E001.png`  ·  **Destino final:** `public/images/guias/analisis/analizar-ofertas-de-proveedores-con-ia/ofertas-recibidas.webp`
- **Formato:** PNG o JPG opaco · 1600×1200 px (4/3)  ·  **Sección de la guía:** datos
- **Texto alternativo previsto:** Tres ofertas de proveedores con sus datos de precio, unidad, impuesto, mínimo, envío, entrega y pago resaltados.

```
Genera la imagen y guárdala como «E001.png» (1600×1200 px, relación 4/3): esquema conceptual editorial para la guía «Analizar ofertas de proveedores con IA». Contenido a representar: Las tres ofertas del caso una junto a otra, con resaltados de colores sobre el precio, la unidad de venta, el impuesto, el pedido mínimo, el envío, la entrega y el pago. Sin datos de contacto.
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

##### E002 · hoja-comparadora

- **Nombre a entregar:** `E002.png`  ·  **Destino final:** `public/images/guias/analisis/analizar-ofertas-de-proveedores-con-ia/hoja-comparadora.webp`
- **Formato:** PNG o JPG opaco · 1600×1200 px (4/3)  ·  **Sección de la guía:** hoja
- **Texto alternativo previsto:** Hoja de cálculo con cuatro opciones de proveedores y las fórmulas de costo total y costo por unidad.

```
Genera la imagen y guárdala como «E002.png» (1600×1200 px, relación 4/3): esquema conceptual editorial para la guía «Analizar ofertas de proveedores con IA». Contenido a representar: La hoja con la necesidad en B1, el umbral en B2, los encabezados en la fila 3 y las cuatro opciones en las filas 4 a 7. Resaltar la barra de fórmulas con la de «Costo total» y la columna «Costo por set que necesito».
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

##### E003 · extraccion-inicial

- **Nombre a entregar:** `E003.png`  ·  **Destino final:** `public/images/guias/analisis/analizar-ofertas-de-proveedores-con-ia/extraccion-inicial.webp`
- **Formato:** PNG o JPG opaco · 1600×900 px (16/9)  ·  **Sección de la guía:** primer-resultado
- **Texto alternativo previsto:** Tabla de datos extraídos de ofertas con dos celdas resaltadas junto a los textos originales.

```
Genera la imagen y guárdala como «E003.png» (1600×900 px, relación 16/9): esquema conceptual editorial para la guía «Analizar ofertas de proveedores con IA». Contenido a representar: La tabla de extracción con las cuatro opciones y las celdas del precio de B y del envío de C resaltadas; al lado, los fragmentos de las ofertas originales.
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

##### E004 · contraste-con-la-oferta

- **Nombre a entregar:** `E004.png`  ·  **Destino final:** `public/images/guias/analisis/analizar-ofertas-de-proveedores-con-ia/contraste-con-la-oferta.webp`
- **Formato:** PNG o JPG opaco · 1600×900 px (16/9)  ·  **Sección de la guía:** analisis
- **Texto alternativo previsto:** Tabla de extracción con cada cifra conectada a su oferta original y una alerta de la hoja en una fila.

```
Genera la imagen y guárdala como «E004.png» (1600×900 px, relación 16/9): esquema conceptual editorial para la guía «Analizar ofertas de proveedores con IA». Contenido a representar: Cada celda de la tabla unida por una línea a su fragmento en la oferta original; las dos que no coinciden en rojo. Al lado, la hoja con «Revisar» en la fila de B.
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

##### E005 · resultado-corregido

- **Nombre a entregar:** `E005.png`  ·  **Destino final:** `public/images/guias/analisis/analizar-ofertas-de-proveedores-con-ia/resultado-corregido.webp`
- **Formato:** PNG o JPG opaco · 1600×900 px (16/9)  ·  **Sección de la guía:** resultado-final
- **Texto alternativo previsto:** Hoja con el costo real por unidad de cuatro opciones, antes y después de corregir dos cifras.

```
Genera la imagen y guárdala como «E005.png» (1600×900 px, relación 16/9): esquema conceptual editorial para la guía «Analizar ofertas de proveedores con IA». Contenido a representar: La hoja con las columnas de resultado para las cuatro opciones, la más barata resaltada y, a un lado, los costos por unidad de la primera extracción con las diferencias marcadas.
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

##### E006 · preguntas-a-proveedores

- **Nombre a entregar:** `E006.png`  ·  **Destino final:** `public/images/guias/analisis/analizar-ofertas-de-proveedores-con-ia/preguntas-a-proveedores.webp`
- **Formato:** PNG o JPG opaco · 1600×900 px (16/9)  ·  **Sección de la guía:** adaptacion
- **Texto alternativo previsto:** Tabla de preguntas para aclarar con cada proveedor, con su motivo y el dato que las origina.

```
Genera la imagen y guárdala como «E006.png» (1600×900 px, relación 16/9): esquema conceptual editorial para la guía «Analizar ofertas de proveedores con IA». Contenido a representar: La tabla de preguntas por proveedor con su motivo y el dato de la oferta que la origina, y debajo «Lo que la hoja no puede decir».
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

#### Analizar tus ventas con IA sin tomar hipótesis por hechos (`guias/analisis/analizar-ventas-con-ia/`)

##### E007 · datos-necesarios

- **Nombre a entregar:** `E007.png`  ·  **Destino final:** `public/images/guias/analisis/analizar-ventas-con-ia/datos-necesarios.webp`
- **Formato:** PNG o JPG opaco · 1600×900 px (16/9)  ·  **Sección de la guía:** datos
- **Texto alternativo previsto:** Dos tablas de ventas comparadas: una desordenada, con formatos mezclados, y otra limpia con una columna por dato.

```
Genera la imagen y guárdala como «E007.png» (1600×900 px, relación 16/9): esquema conceptual editorial para la guía «Analizar tus ventas con IA sin tomar hipótesis por hechos». Contenido a representar: Dos tablas lado a lado con las mismas ventas: a la izquierda una versión desordenada (fechas escritas de distintas formas, unidades y precios en la misma celda, el mismo producto con nombres distintos) y a la derecha la versión limpia con columnas de fecha, producto, unidades, precio y total. Marcar con flechas dos correcciones.
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

##### E008 · tabla-resumen

- **Nombre a entregar:** `E008.png`  ·  **Destino final:** `public/images/guias/analisis/analizar-ventas-con-ia/tabla-resumen.webp`
- **Formato:** PNG o JPG opaco · 1600×1200 px (4/3)  ·  **Sección de la guía:** hoja
- **Texto alternativo previsto:** Hoja Resumen de ventas con una fórmula de suma condicional en la barra de fórmulas y la celda de control en cero.

```
Genera la imagen y guárdala como «E008.png» (1600×1200 px, relación 4/3): esquema conceptual editorial para la guía «Analizar tus ventas con IA sin tomar hipótesis por hechos». Contenido a representar: La hoja Resumen con los cinco productos por mes, la fila de totales, las filas de compras, ticket promedio y variación, y al final la celda de control con un 0 resaltado en verde. Mostrar en la barra de fórmulas la fórmula de SUMAR.SI.CONJUNTO de una celda.
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

##### E009 · primera-lectura

- **Nombre a entregar:** `E009.png`  ·  **Destino final:** `public/images/guias/analisis/analizar-ventas-con-ia/primera-lectura.webp`
- **Formato:** PNG o JPG opaco · 1600×900 px (16/9)  ·  **Sección de la guía:** primer-resultado
- **Texto alternativo previsto:** Tabla de observaciones e hipótesis devuelta por un asistente, con tres celdas resaltadas junto al resumen de ventas.

```
Genera la imagen y guárdala como «E009.png» (1600×900 px, relación 16/9): esquema conceptual editorial para la guía «Analizar tus ventas con IA sin tomar hipótesis por hechos». Contenido a representar: La tabla que devolvió el asistente con tres celdas resaltadas: la comparación por totales, la frase «se explica en buena parte» y «Analizar más datos de ventas». Al lado, el resumen de Verde Hogar.
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

##### E010 · comprobacion-de-cifras

- **Nombre a entregar:** `E010.png`  ·  **Destino final:** `public/images/guias/analisis/analizar-ventas-con-ia/comprobacion-de-cifras.webp`
- **Formato:** PNG o JPG opaco · 1600×900 px (16/9)  ·  **Sección de la guía:** analisis
- **Texto alternativo previsto:** Comparación entre frases de una lectura de la IA y las celdas de la hoja que las respaldan o las contradicen.

```
Genera la imagen y guárdala como «E010.png» (1600×900 px, relación 16/9): esquema conceptual editorial para la guía «Analizar tus ventas con IA sin tomar hipótesis por hechos». Contenido a representar: Dos columnas: a la izquierda tres frases de la lectura con una cifra o un peso cada una; a la derecha la celda de la hoja que las respalda o las contradice. Marcar en verde la que coincide y en rojo las que no. Usar las cifras ficticias del caso.
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

##### E011 · hipotesis-y-comprobaciones

- **Nombre a entregar:** `E011.png`  ·  **Destino final:** `public/images/guias/analisis/analizar-ventas-con-ia/hipotesis-y-comprobaciones.webp`
- **Formato:** PNG o JPG opaco · 1600×900 px (16/9)  ·  **Sección de la guía:** resultado-final
- **Texto alternativo previsto:** Tabla con cuatro columnas: observación de las ventas, hipótesis, qué la apoya o la debilita y cómo comprobarla.

```
Genera la imagen y guárdala como «E011.png» (1600×900 px, relación 16/9): esquema conceptual editorial para la guía «Analizar tus ventas con IA sin tomar hipótesis por hechos». Contenido a representar: La tabla final con cuatro columnas (observación, hipótesis, qué la apoya o la debilita, cómo comprobarla) y tres filas ficticias. Resaltar con un recuadro la columna «Cómo comprobarla» y con otro la palabra «hipótesis». Sin datos personales.
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

#### Ideas de nuevos productos o servicios con IA (`guias/analisis/ideas-de-nuevos-productos-con-ia/`)

##### E012 · ficha-de-problemas

- **Nombre a entregar:** `E012.png`  ·  **Destino final:** `public/images/guias/analisis/ideas-de-nuevos-productos-con-ia/ficha-de-problemas.webp`
- **Formato:** PNG o JPG opaco · 1600×1200 px (4/3)  ·  **Sección de la guía:** datos
- **Texto alternativo previsto:** Tabla de problemas de clientes con la frase textual, las veces que se dijo y dónde, junto a la capacidad del negocio.

```
Genera la imagen y guárdala como «E012.png» (1600×1200 px, relación 4/3): esquema conceptual editorial para la guía «Ideas de nuevos productos o servicios con IA». Contenido a representar: La ficha con siete problemas con un id, la frase del cliente entre comillas, las veces que se repitió y dónde se dijo. Resaltar la columna de veces y una frase textual. Debajo, la capacidad del negocio.
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

##### E013 · primeras-ideas

- **Nombre a entregar:** `E013.png`  ·  **Destino final:** `public/images/guias/analisis/ideas-de-nuevos-productos-con-ia/primeras-ideas.webp`
- **Formato:** PNG o JPG opaco · 1600×900 px (16/9)  ·  **Sección de la guía:** primer-resultado
- **Texto alternativo previsto:** Tabla de seis hipótesis de producto con tres celdas resaltadas junto a la capacidad del negocio.

```
Genera la imagen y guárdala como «E013.png» (1600×900 px, relación 16/9): esquema conceptual editorial para la guía «Ideas de nuevos productos o servicios con IA». Contenido a representar: La tabla de seis ideas con tres celdas resaltadas: la idea de las galletas sin gluten, el supuesto «Hay demanda suficiente» y la prueba «Hacer una encuesta». Al lado, la capacidad del negocio.
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

##### E014 · contraste-con-la-ficha

- **Nombre a entregar:** `E014.png`  ·  **Destino final:** `public/images/guias/analisis/ideas-de-nuevos-productos-con-ia/contraste-con-la-ficha.webp`
- **Formato:** PNG o JPG opaco · 1600×900 px (16/9)  ·  **Sección de la guía:** analisis
- **Texto alternativo previsto:** Ideas de producto conectadas con los problemas de la ficha y con la capacidad, con la rúbrica puntuada.

```
Genera la imagen y guárdala como «E014.png» (1600×900 px, relación 16/9): esquema conceptual editorial para la guía «Ideas de nuevos productos o servicios con IA». Contenido a representar: Cada idea unida por una línea a los problemas que cita y a la capacidad; la de las galletas sin gluten en rojo contra «no hay zona separada». Al lado, la rúbrica puntuada (9 de 12).
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

##### E015 · matriz-de-decision

- **Nombre a entregar:** `E015.png`  ·  **Destino final:** `public/images/guias/analisis/ideas-de-nuevos-productos-con-ia/matriz-de-decision.webp`
- **Formato:** PNG o JPG opaco · 1600×900 px (16/9)  ·  **Sección de la guía:** comparativa
- **Texto alternativo previsto:** Tabla que puntúa seis ideas de producto en cinco criterios, con el motivo de cada puntuación.

```
Genera la imagen y guárdala como «E015.png» (1600×900 px, relación 16/9): esquema conceptual editorial para la guía «Ideas de nuevos productos o servicios con IA». Contenido a representar: La tabla de seis ideas por cinco criterios con la puntuación de cada celda y la columna «Por qué» con los ids de los problemas. Resaltar que el total lo suma la persona.
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

##### E016 · plan-de-validacion

- **Nombre a entregar:** `E016.png`  ·  **Destino final:** `public/images/guias/analisis/ideas-de-nuevos-productos-con-ia/plan-de-validacion.webp`
- **Formato:** PNG o JPG opaco · 1600×900 px (16/9)  ·  **Sección de la guía:** medicion
- **Texto alternativo previsto:** Plan de prueba de cuatro pasos con criterios de éxito y de parada, y un registro de resultados vacío.

```
Genera la imagen y guárdala como «E016.png» (1600×900 px, relación 16/9): esquema conceptual editorial para la guía «Ideas de nuevos productos o servicios con IA». Contenido a representar: La tabla de cuatro pasos con el criterio de éxito y el de parada de cada uno, y debajo un registro de resultados con las columnas vacías.
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

#### Investigar competidores con IA (`guias/analisis/investigar-competidores-con-ia/`)

##### E017 · ficha-de-evidencia

- **Nombre a entregar:** `E017.png`  ·  **Destino final:** `public/images/guias/analisis/investigar-competidores-con-ia/ficha-de-evidencia.webp`
- **Formato:** PNG o JPG opaco · 1600×900 px (16/9)  ·  **Sección de la guía:** entrevista
- **Texto alternativo previsto:** Tabla de evidencia con doce datos, cada uno con su fuente, su fecha y su tipo, y dos filas marcadas.

```
Genera la imagen y guárdala como «E017.png» (1600×900 px, relación 16/9): esquema conceptual editorial para la guía «Investigar competidores con IA». Contenido a representar: La ficha con doce filas de tres negocios inventados y el tuyo. Resaltar las columnas «Tipo de dato», «Fuente» y «Fecha de consulta», y marcar con un recuadro las dos filas con un defecto (una sin fecha y una con el tipo equivocado).
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

##### E018 · revision-de-la-ficha

- **Nombre a entregar:** `E018.png`  ·  **Destino final:** `public/images/guias/analisis/investigar-competidores-con-ia/revision-de-la-ficha.webp`
- **Formato:** PNG o JPG opaco · 1600×900 px (16/9)  ·  **Sección de la guía:** prompt
- **Texto alternativo previsto:** Tabla de problemas detectados en una ficha de evidencia junto a las filas de la ficha que señala.

```
Genera la imagen y guárdala como «E018.png» (1600×900 px, relación 16/9): esquema conceptual editorial para la guía «Investigar competidores con IA». Contenido a representar: La tabla de problemas de la revisión al lado de las tres filas de la ficha que señala, con la corrección de cada una escrita debajo.
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

##### E019 · primera-comparacion

- **Nombre a entregar:** `E019.png`  ·  **Destino final:** `public/images/guias/analisis/investigar-competidores-con-ia/primera-comparacion.webp`
- **Formato:** PNG o JPG opaco · 1600×900 px (16/9)  ·  **Sección de la guía:** primer-resultado
- **Texto alternativo previsto:** Tablas de comparación e hipótesis devueltas por un asistente, con tres celdas resaltadas.

```
Genera la imagen y guárdala como «E019.png» (1600×900 px, relación 16/9): esquema conceptual editorial para la guía «Investigar competidores con IA». Contenido a representar: La tabla de comparación y la de hipótesis que devolvió el asistente, con tres celdas resaltadas: la hipótesis del precio intermedio, la de limpieza y la comprobación «Investigar más sobre C».
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

##### E020 · contraste-con-la-ficha

- **Nombre a entregar:** `E020.png`  ·  **Destino final:** `public/images/guias/analisis/investigar-competidores-con-ia/contraste-con-la-ficha.webp`
- **Formato:** PNG o JPG opaco · 1600×900 px (16/9)  ·  **Sección de la guía:** analisis
- **Texto alternativo previsto:** Hipótesis de una comparación conectadas con las filas de la ficha que las respaldan, con la rúbrica puntuada.

```
Genera la imagen y guárdala como «E020.png» (1600×900 px, relación 16/9): esquema conceptual editorial para la guía «Investigar competidores con IA». Contenido a representar: Cada hipótesis unida por una línea a las filas de la ficha que cita; las que no respaldan lo que dice, en rojo. Al lado, la rúbrica puntuada (9 de 12).
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

##### E021 · hipotesis-corregidas

- **Nombre a entregar:** `E021.png`  ·  **Destino final:** `public/images/guias/analisis/investigar-competidores-con-ia/hipotesis-corregidas.webp`
- **Formato:** PNG o JPG opaco · 1600×900 px (16/9)  ·  **Sección de la guía:** resultado-final
- **Texto alternativo previsto:** Tabla con tres cambios en una comparación de competidores: la frase anterior, la nueva y el motivo.

```
Genera la imagen y guárdala como «E021.png» (1600×900 px, relación 16/9): esquema conceptual editorial para la guía «Investigar competidores con IA». Contenido a representar: La tabla de cambios con el antes y el después de cada frase y el motivo, con las frases nuevas resaltadas.
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

---

## Lote 4 · Explicativas · «clientes»

#### Analizar opiniones de clientes con IA (`guias/clientes/analizar-opiniones-de-clientes-con-ia/`)

##### E022 · resenas-anonimizadas

- **Nombre a entregar:** `E022.png`  ·  **Destino final:** `public/images/guias/clientes/analizar-opiniones-de-clientes-con-ia/resenas-anonimizadas.webp`
- **Formato:** PNG o JPG opaco · 1600×1200 px (4/3)  ·  **Sección de la guía:** datos
- **Texto alternativo previsto:** Hoja con reseñas numeradas y anonimizadas, con una nota de los datos personales que se quitaron.

```
Genera la imagen y guárdala como «E022.png» (1600×1200 px, relación 4/3): esquema conceptual editorial para la guía «Analizar opiniones de clientes con IA». Contenido a representar: Una hoja con las reseñas ficticias del caso: una columna con el id (R01, R02…) y otra con el texto. Un recuadro marca las cosas que se quitaron antes (nombres, teléfonos, cuentas de redes).
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

##### E023 · hoja-de-conteo

- **Nombre a entregar:** `E023.png`  ·  **Destino final:** `public/images/guias/clientes/analizar-opiniones-de-clientes-con-ia/hoja-de-conteo.webp`
- **Formato:** PNG o JPG opaco · 1600×1200 px (4/3)  ·  **Sección de la guía:** hoja
- **Texto alternativo previsto:** Hoja con un conteo de menciones por tema y la fórmula de conteo en la barra de fórmulas.

```
Genera la imagen y guárdala como «E023.png» (1600×1200 px, relación 4/3): esquema conceptual editorial para la guía «Analizar opiniones de clientes con IA». Contenido a representar: El bloque de conteo pegado en J1: seis temas con sus menciones, positivas y negativas, el total y las citas no encontradas. Resaltar la barra de fórmulas con la de CONTAR.SI.CONJUNTO.
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

##### E024 · clasificacion-inicial

- **Nombre a entregar:** `E024.png`  ·  **Destino final:** `public/images/guias/clientes/analizar-opiniones-de-clientes-con-ia/clasificacion-inicial.webp`
- **Formato:** PNG o JPG opaco · 1600×900 px (16/9)  ·  **Sección de la guía:** primer-resultado
- **Texto alternativo previsto:** Tabla de reseñas clasificadas por un asistente con tres filas resaltadas junto al texto de cada reseña.

```
Genera la imagen y guárdala como «E024.png» (1600×900 px, relación 16/9): esquema conceptual editorial para la guía «Analizar opiniones de clientes con IA». Contenido a representar: La tabla que devolvió el asistente, con sus 25 filas y las tres filas de R06, R15 y R18 resaltadas. Al lado, el texto de cada reseña.
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

##### E025 · verificacion-de-citas

- **Nombre a entregar:** `E025.png`  ·  **Destino final:** `public/images/guias/clientes/analizar-opiniones-de-clientes-con-ia/verificacion-de-citas.webp`
- **Formato:** PNG o JPG opaco · 1600×900 px (16/9)  ·  **Sección de la guía:** analisis
- **Texto alternativo previsto:** Hoja con una columna que marca «Sí» cuando la cita aparece en la reseña y un conteo de citas no encontradas.

```
Genera la imagen y guárdala como «E025.png» (1600×900 px, relación 16/9): esquema conceptual editorial para la guía «Analizar opiniones de clientes con IA». Contenido a representar: La hoja con la columna «Cita verificada» llena de «Sí» y, a un lado, «Citas no encontradas: 0». Debajo, un ejemplo con una cita cambiada que da «No».
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

##### E026 · conteos-antes-y-despues

- **Nombre a entregar:** `E026.png`  ·  **Destino final:** `public/images/guias/clientes/analizar-opiniones-de-clientes-con-ia/conteos-antes-y-despues.webp`
- **Formato:** PNG o JPG opaco · 1600×900 px (16/9)  ·  **Sección de la guía:** resultado-final
- **Texto alternativo previsto:** Tabla que compara los conteos por tema de la primera clasificación con los conteos finales.

```
Genera la imagen y guárdala como «E026.png» (1600×900 px, relación 16/9): esquema conceptual editorial para la guía «Analizar opiniones de clientes con IA». Contenido a representar: La tabla con los conteos según la IA y los finales por tema, con las tres diferencias resaltadas. Debajo, las tres filas corregidas.
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

##### E027 · lectura-de-patrones

- **Nombre a entregar:** `E027.png`  ·  **Destino final:** `public/images/guias/clientes/analizar-opiniones-de-clientes-con-ia/lectura-de-patrones.webp`
- **Formato:** PNG o JPG opaco · 1600×900 px (16/9)  ·  **Sección de la guía:** adaptacion
- **Texto alternativo previsto:** Lectura de patrones de opiniones con tabla de hallazgos, oportunidades y límites de lo que se puede afirmar.

```
Genera la imagen y guárdala como «E027.png» (1600×900 px, relación 16/9): esquema conceptual editorial para la guía «Analizar opiniones de clientes con IA». Contenido a representar: La respuesta del prompt de lectura: la tabla de hallazgos con sus reseñas y citas, las oportunidades a explorar y «Con estos datos no se puede afirmar».
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

#### Responder consultas de clientes con IA sin prometer de más (`guias/clientes/responder-consultas-de-clientes-con-ia/`)

##### E028 · base-de-respuestas

- **Nombre a entregar:** `E028.png`  ·  **Destino final:** `public/images/guias/clientes/responder-consultas-de-clientes-con-ia/base-de-respuestas.webp`
- **Formato:** PNG o JPG opaco · 1600×900 px (16/9)  ·  **Sección de la guía:** entrevista
- **Texto alternativo previsto:** Hoja de cálculo con una fila por consulta frecuente y columnas para la respuesta aprobada, el dato que cambia y cuándo responde una persona.

```
Genera la imagen y guárdala como «E028.png» (1600×900 px, relación 16/9): esquema conceptual editorial para la guía «Responder consultas de clientes con IA sin prometer de más». Contenido a representar: La base del caso pegada en una hoja de cálculo: una fila por consulta frecuente y las columnas de respuesta aprobada, dato que cambia y «Responde una persona si…». Resaltar las dos celdas «Pendiente», si las hay.
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

##### E029 · borrador-inicial

- **Nombre a entregar:** `E029.png`  ·  **Destino final:** `public/images/guias/clientes/responder-consultas-de-clientes-con-ia/borrador-inicial.webp`
- **Formato:** PNG o JPG opaco · 1600×900 px (16/9)  ·  **Sección de la guía:** primer-resultado
- **Texto alternativo previsto:** Borrador de respuesta a un cliente con tres frases subrayadas frente a la base.

```
Genera la imagen y guárdala como «E029.png» (1600×900 px, relación 16/9): esquema conceptual editorial para la guía «Responder consultas de clientes con IA sin prometer de más». Contenido a representar: La respuesta del asistente con sus cuatro partes (borrador, usado, falta y escalar), con subrayadas la frase de la garantía, la pregunta por el modelo y, al lado, la fila de la base que corresponde.
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

##### E030 · revision-de-promesas

- **Nombre a entregar:** `E030.png`  ·  **Destino final:** `public/images/guias/clientes/responder-consultas-de-clientes-con-ia/revision-de-promesas.webp`
- **Formato:** PNG o JPG opaco · 1600×900 px (16/9)  ·  **Sección de la guía:** analisis
- **Texto alternativo previsto:** Revisión de un borrador con tabla de frases con problema y rúbrica puntuada.

```
Genera la imagen y guárdala como «E030.png» (1600×900 px, relación 16/9): esquema conceptual editorial para la guía «Responder consultas de clientes con IA sin prometer de más». Contenido a representar: La respuesta del prompt de revisión: la tabla «Frases con problema», los apartados de preguntas sin atender y datos que no pidió, y la rúbrica con sus cinco puntajes.
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

##### E031 · borrador-corregido

- **Nombre a entregar:** `E031.png`  ·  **Destino final:** `public/images/guias/clientes/responder-consultas-de-clientes-con-ia/borrador-corregido.webp`
- **Formato:** PNG o JPG opaco · 1600×900 px (16/9)  ·  **Sección de la guía:** resultado-final
- **Texto alternativo previsto:** Tabla de cambios y borrador final de una respuesta a un cliente.

```
Genera la imagen y guárdala como «E031.png» (1600×900 px, relación 16/9): esquema conceptual editorial para la guía «Responder consultas de clientes con IA sin prometer de más». Contenido a representar: La tabla «Cambios» con sus tres filas y, debajo, el borrador final con las frases corregidas resaltadas.
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

##### E032 · version-por-correo

- **Nombre a entregar:** `E032.png`  ·  **Destino final:** `public/images/guias/clientes/responder-consultas-de-clientes-con-ia/version-por-correo.webp`
- **Formato:** PNG o JPG opaco · 1600×900 px (16/9)  ·  **Sección de la guía:** adaptacion
- **Texto alternativo previsto:** Borrador de WhatsApp y su versión por correo lado a lado, con los mismos datos resaltados.

```
Genera la imagen y guárdala como «E032.png» (1600×900 px, relación 16/9): esquema conceptual editorial para la guía «Responder consultas de clientes con IA sin prometer de más». Contenido a representar: El borrador final de WhatsApp a la izquierda y su versión por correo a la derecha, con asunto, saludo y firma. Resaltar el precio, los turnos y la garantía en ambos lados para ver que no cambian.
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

#### Responder reclamos de clientes con IA (`guias/clientes/responder-reclamos-con-ia/`)

##### E033 · registro-de-hechos

- **Nombre a entregar:** `E033.png`  ·  **Destino final:** `public/images/guias/clientes/responder-reclamos-con-ia/registro-de-hechos.webp`
- **Formato:** PNG o JPG opaco · 1600×1200 px (4/3)  ·  **Sección de la guía:** datos
- **Texto alternativo previsto:** Tabla con ocho líneas de hechos con fecha, hora y fuente, junto a un mensaje de cliente sin datos personales.

```
Genera la imagen y guárdala como «E033.png» (1600×1200 px, relación 4/3): esquema conceptual editorial para la guía «Responder reclamos de clientes con IA». Contenido a representar: La tabla del registro con fecha y hora, qué pasó y la fuente de cada línea, y al lado el mensaje del cliente ya anonimizado. Un recuadro marca lo que se quitó (nombre, teléfono, dirección, número de pedido).
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

##### E034 · ficha-del-reclamo

- **Nombre a entregar:** `E034.png`  ·  **Destino final:** `public/images/guias/clientes/responder-reclamos-con-ia/ficha-del-reclamo.webp`
- **Formato:** PNG o JPG opaco · 1600×900 px (16/9)  ·  **Sección de la guía:** entrevista
- **Texto alternativo previsto:** Tabla de puntos de un reclamo con su estado de confirmación y apartados de emociones y petición.

```
Genera la imagen y guárdala como «E034.png» (1600×900 px, relación 16/9): esquema conceptual editorial para la guía «Responder reclamos de clientes con IA». Contenido a representar: La ficha del caso con sus cinco puntos, cada uno con el color de su estado, y debajo los apartados «Emociones y juicios» y «Lo que pide». Resaltar el punto «No confirmado».
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

##### E035 · tarjeta-de-decision

- **Nombre a entregar:** `E035.png`  ·  **Destino final:** `public/images/guias/clientes/responder-reclamos-con-ia/tarjeta-de-decision.webp`
- **Formato:** PNG o JPG opaco · 1600×1200 px (4/3)  ·  **Sección de la guía:** prompt
- **Texto alternativo previsto:** Tabla con la decisión de un negocio ante un reclamo: qué reconoce, qué ofrece y qué no.

```
Genera la imagen y guárdala como «E035.png» (1600×1200 px, relación 4/3): esquema conceptual editorial para la guía «Responder reclamos de clientes con IA». Contenido a representar: La tarjeta con sus nueve campos rellenos con el caso: lo que se reconoce, lo que se ofrece con su condición y plazo, lo que no se ofrece, cómo se dice y el siguiente paso. Resaltar «Ofrezco» y «No ofrezco».
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

##### E036 · borrador-inicial

- **Nombre a entregar:** `E036.png`  ·  **Destino final:** `public/images/guias/clientes/responder-reclamos-con-ia/borrador-inicial.webp`
- **Formato:** PNG o JPG opaco · 1600×900 px (16/9)  ·  **Sección de la guía:** primer-resultado
- **Texto alternativo previsto:** Borrador de respuesta a un reclamo con una frase resaltada y la ficha del caso al lado.

```
Genera la imagen y guárdala como «E036.png» (1600×900 px, relación 16/9): esquema conceptual editorial para la guía «Responder reclamos de clientes con IA». Contenido a representar: El borrador de respuesta con la primera frase y la ausencia del párrafo sobre los mensajes marcadas, y al lado la ficha para comparar.
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

##### E037 · contraste-con-la-tarjeta

- **Nombre a entregar:** `E037.png`  ·  **Destino final:** `public/images/guias/clientes/responder-reclamos-con-ia/contraste-con-la-tarjeta.webp`
- **Formato:** PNG o JPG opaco · 1600×900 px (16/9)  ·  **Sección de la guía:** analisis
- **Texto alternativo previsto:** Borrador de respuesta con cada frase conectada a la fila de la ficha o al campo de la tarjeta que la respalda.

```
Genera la imagen y guárdala como «E037.png» (1600×900 px, relación 16/9): esquema conceptual editorial para la guía «Responder reclamos de clientes con IA». Contenido a representar: El borrador con cada frase enlazada por una línea a la fila de la ficha o al campo de la tarjeta de donde sale, y la rúbrica puntuada al lado (8 de 10). Marcar la frase sin origen.
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

##### E038 · respuesta-corregida

- **Nombre a entregar:** `E038.png`  ·  **Destino final:** `public/images/guias/clientes/responder-reclamos-con-ia/respuesta-corregida.webp`
- **Formato:** PNG o JPG opaco · 1600×900 px (16/9)  ·  **Sección de la guía:** resultado-final
- **Texto alternativo previsto:** Respuesta a un reclamo con dos partes resaltadas y una tabla con los cambios respecto al borrador.

```
Genera la imagen y guárdala como «E038.png» (1600×900 px, relación 16/9): esquema conceptual editorial para la guía «Responder reclamos de clientes con IA». Contenido a representar: La respuesta corregida con las dos partes nuevas resaltadas: la apertura concreta y el párrafo sobre los mensajes. Debajo, la tabla de cambios.
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

##### E039 · respuesta-publica

- **Nombre a entregar:** `E039.png`  ·  **Destino final:** `public/images/guias/clientes/responder-reclamos-con-ia/respuesta-publica.webp`
- **Formato:** PNG o JPG opaco · 1600×900 px (16/9)  ·  **Sección de la guía:** adaptacion
- **Texto alternativo previsto:** Una reseña negativa con una respuesta pública corta debajo y una lista de lo que se dejó fuera.

```
Genera la imagen y guárdala como «E039.png» (1600×900 px, relación 16/9): esquema conceptual editorial para la guía «Responder reclamos de clientes con IA». Contenido a representar: La reseña de una estrella (ficticia) con la respuesta pública debajo, y un recuadro con «Lo que dejé fuera»: fechas, oferta, la palabra «estafa» y el motivo. Sin nombres reales.
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

---

## Lote 5 · Explicativas · «marketing»

#### Crear un calendario de contenido con IA que cabe en tu tiempo (`guias/marketing/calendario-de-contenido-con-ia/`)

##### E040 · datos-necesarios

- **Nombre a entregar:** `E040.png`  ·  **Destino final:** `public/images/guias/marketing/calendario-de-contenido-con-ia/datos-necesarios.webp`
- **Formato:** PNG o JPG opaco · 1600×1200 px (4/3)  ·  **Sección de la guía:** datos
- **Texto alternativo previsto:** Hoja con un banco de ideas, los tiempos por formato y las fechas propias de un restaurante ficticio.

```
Genera la imagen y guárdala como «E040.png» (1600×1200 px, relación 4/3): esquema conceptual editorial para la guía «Crear un calendario de contenido con IA que cabe en tu tiempo». Contenido a representar: Una hoja con tres bloques: el banco de ideas (código, idea, formato, recurrencia), los tiempos por formato (producción y publicación) y las fechas propias con los días sin publicar.
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

##### E041 · calculadora-de-capacidad

- **Nombre a entregar:** `E041.png`  ·  **Destino final:** `public/images/guias/marketing/calendario-de-contenido-con-ia/calculadora-de-capacidad.webp`
- **Formato:** PNG o JPG opaco · 1600×1200 px (4/3)  ·  **Sección de la guía:** hoja
- **Texto alternativo previsto:** Hoja de cálculo con la calculadora de capacidad pegada, con 130 minutos planificados, 144 usables y un «Sí» en la fila de cabe.

```
Genera la imagen y guárdala como «E041.png» (1600×1200 px, relación 4/3): esquema conceptual editorial para la guía «Crear un calendario de contenido con IA que cabe en tu tiempo». Contenido a representar: La calculadora pegada en la celda A1: tres formatos, sus piezas de la semana, el total de 130 minutos, los 144 usables y un «Sí» en la última fila. Resaltar la barra de fórmulas con la fórmula de minutos usables.
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

##### E042 · calendario-inicial

- **Nombre a entregar:** `E042.png`  ·  **Destino final:** `public/images/guias/marketing/calendario-de-contenido-con-ia/calendario-inicial.webp`
- **Formato:** PNG o JPG opaco · 1600×900 px (16/9)  ·  **Sección de la guía:** primer-resultado
- **Texto alternativo previsto:** Calendario de cuatro semanas devuelto por un asistente con la línea de totales de la semana 3 marcada.

```
Genera la imagen y guárdala como «E042.png» (1600×900 px, relación 16/9): esquema conceptual editorial para la guía «Crear un calendario de contenido con IA que cabe en tu tiempo». Contenido a representar: El primer calendario devuelto por el asistente, con la tabla de las cuatro semanas y la lista de totales. Marcar con un recuadro la línea de totales de la semana 3 y, al lado, los 145 minutos reales.
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

##### E043 · la-hoja-detecta-la-diferencia

- **Nombre a entregar:** `E043.png`  ·  **Destino final:** `public/images/guias/marketing/calendario-de-contenido-con-ia/la-hoja-detecta-la-diferencia.webp`
- **Formato:** PNG o JPG opaco · 1600×900 px (16/9)  ·  **Sección de la guía:** analisis
- **Texto alternativo previsto:** Calculadora con 145 minutos y un «No» junto a la línea de totales del asistente que declara 130.

```
Genera la imagen y guárdala como «E043.png» (1600×900 px, relación 16/9): esquema conceptual editorial para la guía «Crear un calendario de contenido con IA que cabe en tu tiempo». Contenido a representar: La calculadora con las piezas de la semana 3 (tres imágenes con texto, una serie y ningún mensaje breve), que da 145 minutos y un «No» en la fila «¿Cabe?». Al lado, la línea de totales de la IA. Resaltar la diferencia.
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

##### E044 · calendario-final

- **Nombre a entregar:** `E044.png`  ·  **Destino final:** `public/images/guias/marketing/calendario-de-contenido-con-ia/calendario-final.webp`
- **Formato:** PNG o JPG opaco · 1600×900 px (16/9)  ·  **Sección de la guía:** resultado-final
- **Texto alternativo previsto:** Calendario final de cuatro semanas con una pieza movida resaltada y los totales por semana dentro del límite.

```
Genera la imagen y guárdala como «E044.png» (1600×900 px, relación 16/9): esquema conceptual editorial para la guía «Crear un calendario de contenido con IA que cabe en tu tiempo». Contenido a representar: La tabla del calendario final de cuatro semanas con la fila de la pieza movida resaltada y, debajo, los totales por semana (130, 130, 90 y 115) frente a los 144 minutos usables.
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

#### Crear afiches con IA que se entienden de un vistazo (`guias/marketing/crear-afiches-con-ia/`)

##### E045 · ficha-de-niveles

- **Nombre a entregar:** `E045.png`  ·  **Destino final:** `public/images/guias/marketing/crear-afiches-con-ia/ficha-de-niveles.webp`
- **Formato:** PNG o JPG opaco · 1600×1200 px (4/3)  ·  **Sección de la guía:** datos
- **Texto alternativo previsto:** Hoja de cálculo con la ficha de los cuatro niveles de un afiche rellena para una panadería ficticia.

```
Genera la imagen y guárdala como «E045.png» (1600×1200 px, relación 4/3): esquema conceptual editorial para la guía «Crear afiches con IA que se entienden de un vistazo». Contenido a representar: La ficha de los cuatro niveles pegada en una hoja de cálculo, con la columna «Tu texto» completa con el caso ficticio de la panadería. Resaltar la fila del nivel 1. Sin datos personales.
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

##### E046 · jerarquia

- **Nombre a entregar:** `E046.png`  ·  **Destino final:** `public/images/guias/marketing/crear-afiches-con-ia/jerarquia.webp`
- **Formato:** PNG o JPG opaco · 1600×1200 px (4/3)  ·  **Sección de la guía:** marco
- **Texto alternativo previsto:** Afiche con cuatro zonas numeradas encima: titular, apoyo, acción y contacto, y letra pequeña.

```
Genera la imagen y guárdala como «E046.png» (1600×1200 px, relación 4/3): esquema conceptual editorial para la guía «Crear afiches con IA que se entienden de un vistazo». Contenido a representar: Un afiche de oferta con cuatro zonas numeradas superpuestas: titular, apoyo, acción y contacto, y letra pequeña. Cada número con un color distinto y una etiqueta corta.
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

##### E047 · antes-despues

- **Nombre a entregar:** `E047.png`  ·  **Destino final:** `public/images/guias/marketing/crear-afiches-con-ia/antes-despues.webp`
- **Formato:** PNG o JPG opaco · 1600×900 px (16/9)  ·  **Sección de la guía:** resultado-final
- **Texto alternativo previsto:** Dos versiones de un mismo afiche: a la izquierda la cargada de texto y a la derecha la recortada y ordenada por niveles.

```
Genera la imagen y guárdala como «E047.png» (1600×900 px, relación 16/9): esquema conceptual editorial para la guía «Crear afiches con IA que se entienden de un vistazo». Contenido a representar: Dos maquetas del mismo afiche: a la izquierda con el contenido del primer resultado (oferta repetida, unas cuarenta palabras) y a la derecha con el contenido recortado. Mismo tamaño y misma imagen en ambas.
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

##### E048 · brief-de-diseno

- **Nombre a entregar:** `E048.png`  ·  **Destino final:** `public/images/guias/marketing/crear-afiches-con-ia/brief-de-diseno.webp`
- **Formato:** PNG o JPG opaco · 1600×900 px (16/9)  ·  **Sección de la guía:** adaptacion
- **Texto alternativo previsto:** Tabla del brief de diseño de un afiche junto a su maqueta en una herramienta de diseño.

```
Genera la imagen y guárdala como «E048.png» (1600×900 px, relación 16/9): esquema conceptual editorial para la guía «Crear afiches con IA que se entienden de un vistazo». Contenido a representar: A la izquierda, la tabla del brief de diseño; a la derecha, la maqueta en una herramienta de diseño siguiendo esas indicaciones, con el nivel 1 resaltado.
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

##### E049 · prueba-de-distancia

- **Nombre a entregar:** `E049.png`  ·  **Destino final:** `public/images/guias/marketing/crear-afiches-con-ia/prueba-de-distancia.webp`
- **Formato:** PNG o JPG opaco · 1600×900 px (16/9)  ·  **Sección de la guía:** verificacion
- **Texto alternativo previsto:** Dos fotos del mismo afiche, una de cerca y otra desde lejos, donde solo se lee el titular.

```
Genera la imagen y guárdala como «E049.png» (1600×900 px, relación 16/9): esquema conceptual editorial para la guía «Crear afiches con IA que se entienden de un vistazo». Contenido a representar: Dos fotos del mismo afiche impreso: una de cerca y otra tomada desde la distancia real de lectura, con una flecha que marque la distancia. Resaltar que en la segunda solo se lee el nivel 1.
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

#### Crear anuncios para tu negocio con IA (`guias/marketing/crear-anuncios-con-ia/`)

##### E050 · ficha-completa

- **Nombre a entregar:** `E050.png`  ·  **Destino final:** `public/images/guias/marketing/crear-anuncios-con-ia/ficha-completa.webp`
- **Formato:** PNG o JPG opaco · 1600×1200 px (4/3)  ·  **Sección de la guía:** datos
- **Texto alternativo previsto:** Hoja de cálculo con la ficha del anuncio de siete campos rellena para una ferretería ficticia.

```
Genera la imagen y guárdala como «E050.png» (1600×1200 px, relación 4/3): esquema conceptual editorial para la guía «Crear anuncios para tu negocio con IA». Contenido a representar: La plantilla de la ficha pegada en una hoja de cálculo, con las siete filas y la columna «Tu respuesta» completa con el caso ficticio. Resaltar la fila de condiciones. Sin datos personales.
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

##### E051 · dos-enfoques

- **Nombre a entregar:** `E051.png`  ·  **Destino final:** `public/images/guias/marketing/crear-anuncios-con-ia/dos-enfoques.webp`
- **Formato:** PNG o JPG opaco · 1600×900 px (16/9)  ·  **Sección de la guía:** primer-resultado
- **Texto alternativo previsto:** Dos versiones de un anuncio con sus listas de datos usados, con recuadros sobre un gancho genérico y una frase de trayectoria.

```
Genera la imagen y guárdala como «E051.png» (1600×900 px, relación 16/9): esquema conceptual editorial para la guía «Crear anuncios para tu negocio con IA». Contenido a representar: La primera respuesta del asistente con las dos versiones y sus listas «Datos de la ficha usados» y «Supuestos». Marcar con un recuadro el gancho genérico de la primera y la frase sobre la trayectoria de la segunda.
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

##### E052 · rubrica-aplicada

- **Nombre a entregar:** `E052.png`  ·  **Destino final:** `public/images/guias/marketing/crear-anuncios-con-ia/rubrica-aplicada.webp`
- **Formato:** PNG o JPG opaco · 1600×1200 px (4/3)  ·  **Sección de la guía:** analisis
- **Texto alternativo previsto:** Tabla de puntuación de un anuncio con seis criterios y el total sobre 12.

```
Genera la imagen y guárdala como «E052.png» (1600×1200 px, relación 4/3): esquema conceptual editorial para la guía «Crear anuncios para tu negocio con IA». Contenido a representar: Una tabla con los seis criterios, un puntaje de 0, 1 o 2 en cada uno y el total sobre 12, aplicada a la primera versión del caso. Resaltar la fila «Afirmaciones respaldadas».
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

##### E053 · persuasion-con-respaldo

- **Nombre a entregar:** `E053.png`  ·  **Destino final:** `public/images/guias/marketing/crear-anuncios-con-ia/persuasion-con-respaldo.webp`
- **Formato:** PNG o JPG opaco · 1600×900 px (16/9)  ·  **Sección de la guía:** iteracion
- **Texto alternativo previsto:** Tabla de cambios de un anuncio con la frase original, la nueva, la palanca y el dato de la ficha que la respalda.

```
Genera la imagen y guárdala como «E053.png» (1600×900 px, relación 16/9): esquema conceptual editorial para la guía «Crear anuncios para tu negocio con IA». Contenido a representar: La tabla «Cambios» del refuerzo, con frase original, frase nueva, palanca y dato de la ficha, y debajo «Lo que no cambié». Resaltar con un mismo color la condición de la ficha y la frase nueva que la usa.
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

##### E054 · canales

- **Nombre a entregar:** `E054.png`  ·  **Destino final:** `public/images/guias/marketing/crear-anuncios-con-ia/canales.webp`
- **Formato:** PNG o JPG opaco · 1600×900 px (16/9)  ·  **Sección de la guía:** adaptacion
- **Texto alternativo previsto:** El mismo anuncio en tres piezas: texto sobre imagen, texto de anuncio y mensaje directo, con las condiciones resaltadas.

```
Genera la imagen y guárdala como «E054.png» (1600×900 px, relación 16/9): esquema conceptual editorial para la guía «Crear anuncios para tu negocio con IA». Contenido a representar: Tres piezas lado a lado: el texto sobre una imagen, el texto del anuncio en una red social y un mensaje directo. Resaltar en las tres las mismas condiciones de la oferta.
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

##### E055 · hoja-de-afirmaciones

- **Nombre a entregar:** `E055.png`  ·  **Destino final:** `public/images/guias/marketing/crear-anuncios-con-ia/hoja-de-afirmaciones.webp`
- **Formato:** PNG o JPG opaco · 1600×900 px (16/9)  ·  **Sección de la guía:** verificacion
- **Texto alternativo previsto:** Hoja de cálculo con las afirmaciones de un anuncio, su tipo, si están en la ficha y qué debe comprobar la persona.

```
Genera la imagen y guárdala como «E055.png» (1600×900 px, relación 16/9): esquema conceptual editorial para la guía «Crear anuncios para tu negocio con IA». Contenido a representar: La hoja de afirmaciones del anuncio final en una hoja de cálculo, con las columnas afirmación, tipo, si está en la ficha y qué comprobar. Resaltar la columna de lo que debe comprobar la persona.
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

#### Crear una campaña promocional completa con IA (`guias/marketing/crear-campanas-promocionales-con-ia/`)

##### E056 · datos-necesarios

- **Nombre a entregar:** `E056.png`  ·  **Destino final:** `public/images/guias/marketing/crear-campanas-promocionales-con-ia/datos-necesarios.webp`
- **Formato:** PNG o JPG opaco · 1600×1200 px (4/3)  ·  **Sección de la guía:** datos
- **Texto alternativo previsto:** Documento con la promoción decidida, las piezas y canales, lo que se puede contar y los permisos de un negocio ficticio.

```
Genera la imagen y guárdala como «E056.png» (1600×1200 px, relación 4/3): esquema conceptual editorial para la guía «Crear una campaña promocional completa con IA». Contenido a representar: Un documento con cuatro bloques: la promoción decidida (descuento, productos y fechas), las piezas y sus canales, lo que se puede contar (cuaderno de ventas, chat) y los permisos y límites.
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

##### E057 · ficha-de-campana

- **Nombre a entregar:** `E057.png`  ·  **Destino final:** `public/images/guias/marketing/crear-campanas-promocionales-con-ia/ficha-de-campana.webp`
- **Formato:** PNG o JPG opaco · 1600×1200 px (4/3)  ·  **Sección de la guía:** entrevista
- **Texto alternativo previsto:** Hoja con la ficha de una campaña promocional de diez campos y su columna «Aparece en».

```
Genera la imagen y guárdala como «E057.png» (1600×1200 px, relación 4/3): esquema conceptual editorial para la guía «Crear una campaña promocional completa con IA». Contenido a representar: La ficha de campaña del caso pegada en una hoja de cálculo: diez filas, con las columnas Campo, Valor y Aparece en. Resaltar la columna «Aparece en» y la fila de condiciones.
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

##### E058 · piezas-iniciales

- **Nombre a entregar:** `E058.png`  ·  **Destino final:** `public/images/guias/marketing/crear-campanas-promocionales-con-ia/piezas-iniciales.webp`
- **Formato:** PNG o JPG opaco · 1600×900 px (16/9)  ·  **Sección de la guía:** primer-resultado
- **Texto alternativo previsto:** Tabla con cinco piezas de una campaña promocional, con su momento y su texto, y tres frases subrayadas.

```
Genera la imagen y guárdala como «E058.png» (1600×900 px, relación 16/9): esquema conceptual editorial para la guía «Crear una campaña promocional completa con IA». Contenido a representar: La tabla de las cinco piezas devuelta por el asistente, con sus momentos y textos. Subrayar en cada pieza la frase que después resultará no coincidir con la ficha.
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

##### E059 · matriz-de-coherencia

- **Nombre a entregar:** `E059.png`  ·  **Destino final:** `public/images/guias/marketing/crear-campanas-promocionales-con-ia/matriz-de-coherencia.webp`
- **Formato:** PNG o JPG opaco · 1600×900 px (16/9)  ·  **Sección de la guía:** analisis
- **Texto alternativo previsto:** Matriz de coherencia con tres celdas marcadas ✗ frente a los campos de la ficha.

```
Genera la imagen y guárdala como «E059.png» (1600×900 px, relación 16/9): esquema conceptual editorial para la guía «Crear una campaña promocional completa con IA». Contenido a representar: La matriz de coherencia del primer resultado, con ocho filas y cinco columnas de piezas. Resaltar las tres celdas ✗ y mostrar al lado la frase de la ficha que corresponde a cada una.
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

##### E060 · matriz-final

- **Nombre a entregar:** `E060.png`  ·  **Destino final:** `public/images/guias/marketing/crear-campanas-promocionales-con-ia/matriz-final.webp`
- **Formato:** PNG o JPG opaco · 1600×900 px (16/9)  ·  **Sección de la guía:** resultado-final
- **Texto alternativo previsto:** Matriz de coherencia sin ninguna diferencia después de corregir tres piezas.

```
Genera la imagen y guárdala como «E060.png» (1600×900 px, relación 16/9): esquema conceptual editorial para la guía «Crear una campaña promocional completa con IA». Contenido a representar: La matriz de coherencia después del ajuste, con todas las celdas aplicables en ✓ y las tres piezas corregidas resaltadas en el encabezado. Al lado, la rúbrica con su total.
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

##### E061 · plan-de-medicion

- **Nombre a entregar:** `E061.png`  ·  **Destino final:** `public/images/guias/marketing/crear-campanas-promocionales-con-ia/plan-de-medicion.webp`
- **Formato:** PNG o JPG opaco · 1600×1200 px (4/3)  ·  **Sección de la guía:** medicion
- **Texto alternativo previsto:** Hoja con un plan de medición de tres indicadores y la cuenta de los días abiertos de cada período.

```
Genera la imagen y guárdala como «E061.png» (1600×1200 px, relación 4/3): esquema conceptual editorial para la guía «Crear una campaña promocional completa con IA». Contenido a representar: El plan de medición pegado en una hoja: las tres filas de indicadores con sus cinco columnas y, debajo, la cuenta de días abiertos de cada período. Resaltar la columna «Se compara con».
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

#### Crear promociones con IA: diseña ofertas que sí te convienen (`guias/marketing/crear-promociones-con-ia/`)

##### E062 · datos-necesarios

- **Nombre a entregar:** `E062.png`  ·  **Destino final:** `public/images/guias/marketing/crear-promociones-con-ia/datos-necesarios.webp`
- **Formato:** PNG o JPG opaco · 1600×1200 px (4/3)  ·  **Sección de la guía:** datos
- **Texto alternativo previsto:** Hoja de cálculo con producto, precio, costo y margen de cuatro productos de una cafetería, y el objetivo y los límites debajo.

```
Genera la imagen y guárdala como «E062.png» (1600×1200 px, relación 4/3): esquema conceptual editorial para la guía «Crear promociones con IA: diseña ofertas que sí te convienen». Contenido a representar: Una hoja de cálculo con cuatro columnas (producto, precio, costo y margen) para los cuatro productos del caso ficticio. Resaltar la columna de costo. Debajo, dos líneas con el objetivo y los límites. Sin datos personales.
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

##### E063 · calculadora-de-promociones

- **Nombre a entregar:** `E063.png`  ·  **Destino final:** `public/images/guias/marketing/crear-promociones-con-ia/calculadora-de-promociones.webp`
- **Formato:** PNG o JPG opaco · 1600×1200 px (4/3)  ·  **Sección de la guía:** hoja
- **Texto alternativo previsto:** Hoja de cálculo con la calculadora de promociones pegada, cuatro filas de resultados y la fórmula de ventas necesarias en la barra de fórmulas.

```
Genera la imagen y guárdala como «E063.png» (1600×1200 px, relación 4/3): esquema conceptual editorial para la guía «Crear promociones con IA: diseña ofertas que sí te convienen». Contenido a representar: La calculadora pegada en la celda A1 de una hoja: cuatro filas de promociones, con los resultados en las columnas de margen, descuento real y ventas necesarias. Resaltar con un recuadro la barra de fórmulas mostrando la fórmula de ventas necesarias.
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

##### E064 · cuatro-promociones

- **Nombre a entregar:** `E064.png`  ·  **Destino final:** `public/images/guias/marketing/crear-promociones-con-ia/cuatro-promociones.webp`
- **Formato:** PNG o JPG opaco · 1600×900 px (16/9)  ·  **Sección de la guía:** primer-resultado
- **Texto alternativo previsto:** Cuatro promociones propuestas por un asistente, cada una con su canasta, su riesgo para el margen y el dato que falta.

```
Genera la imagen y guárdala como «E064.png» (1600×900 px, relación 16/9): esquema conceptual editorial para la guía «Crear promociones con IA: diseña ofertas que sí te convienen». Contenido a representar: La primera respuesta del asistente con las cuatro promociones (A a D), cada una con su canasta, su riesgo y su dato faltante. Marcar con un recuadro los campos «Qué compra el cliente» y «Dato que me falta».
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

##### E065 · cuentas-de-la-ia-y-mi-hoja

- **Nombre a entregar:** `E065.png`  ·  **Destino final:** `public/images/guias/marketing/crear-promociones-con-ia/cuentas-de-la-ia-y-mi-hoja.webp`
- **Formato:** PNG o JPG opaco · 1600×900 px (16/9)  ·  **Sección de la guía:** analisis
- **Texto alternativo previsto:** Tabla de cuentas de un asistente junto a la calculadora del lector, con la fila C resaltada porque sus cifras no coinciden.

```
Genera la imagen y guárdala como «E065.png» (1600×900 px, relación 16/9): esquema conceptual editorial para la guía «Crear promociones con IA: diseña ofertas que sí te convienen». Contenido a representar: A la izquierda, la tabla de cuentas devuelta por el asistente; a la derecha, la calculadora del lector con las mismas cuatro filas. Resaltar en rojo la celda de margen después y de ventas necesarias de la fila C, que difieren.
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

##### E066 · decision-con-tus-cifras

- **Nombre a entregar:** `E066.png`  ·  **Destino final:** `public/images/guias/marketing/crear-promociones-con-ia/decision-con-tus-cifras.webp`
- **Formato:** PNG o JPG opaco · 1600×900 px (16/9)  ·  **Sección de la guía:** resultado-final
- **Texto alternativo previsto:** Respuesta de un asistente con una recomendación de promoción, la cuenta semanal, qué medir y la condición de parada.

```
Genera la imagen y guárdala como «E066.png» (1600×900 px, relación 16/9): esquema conceptual editorial para la guía «Crear promociones con IA: diseña ofertas que sí te convienen». Contenido a representar: La respuesta del asistente con las secciones diferencias, descartadas, recomendación, qué medir, duración y parada, y «Para comprobar tú». Resaltar la condición de parada escrita por el dueño.
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

#### Crear publicaciones para redes sociales con IA (`guias/marketing/crear-publicaciones-para-redes-sociales-con-ia/`)

##### E067 · brief-completo

- **Nombre a entregar:** `E067.png`  ·  **Destino final:** `public/images/guias/marketing/crear-publicaciones-para-redes-sociales-con-ia/brief-completo.webp`
- **Formato:** PNG o JPG opaco · 1600×1200 px (4/3)  ·  **Sección de la guía:** datos
- **Texto alternativo previsto:** Hoja de cálculo con la plantilla del brief de siete campos rellena para una peluquería ficticia.

```
Genera la imagen y guárdala como «E067.png» (1600×1200 px, relación 4/3): esquema conceptual editorial para la guía «Crear publicaciones para redes sociales con IA». Contenido a representar: La plantilla del brief pegada en una hoja de cálculo, con las siete filas y la columna «Tu respuesta» completa con el caso ficticio. Resaltar la fila de la oferta y la de la llamada a la acción. Sin datos personales.
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

##### E068 · tres-opciones

- **Nombre a entregar:** `E068.png`  ·  **Destino final:** `public/images/guias/marketing/crear-publicaciones-para-redes-sociales-con-ia/tres-opciones.webp`
- **Formato:** PNG o JPG opaco · 1600×900 px (16/9)  ·  **Sección de la guía:** primer-resultado
- **Texto alternativo previsto:** Tres opciones de publicación con sus listas de datos usados y supuestos, con recuadros sobre lo que cada opción omitió.

```
Genera la imagen y guárdala como «E068.png» (1600×900 px, relación 16/9): esquema conceptual editorial para la guía «Crear publicaciones para redes sociales con IA». Contenido a representar: La primera respuesta del asistente con las tres opciones y sus listas «Datos del brief usados» y «Supuestos». Marcar con un recuadro lo que cada opción omitió y el [FALTA] de la tercera.
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

##### E069 · rubrica-aplicada

- **Nombre a entregar:** `E069.png`  ·  **Destino final:** `public/images/guias/marketing/crear-publicaciones-para-redes-sociales-con-ia/rubrica-aplicada.webp`
- **Formato:** PNG o JPG opaco · 1600×1200 px (4/3)  ·  **Sección de la guía:** analisis
- **Texto alternativo previsto:** Tabla de puntuación con seis criterios, sus fragmentos de apoyo y el total sobre 12.

```
Genera la imagen y guárdala como «E069.png» (1600×1200 px, relación 4/3): esquema conceptual editorial para la guía «Crear publicaciones para redes sociales con IA». Contenido a representar: Una tabla con los seis criterios, un puntaje de 0, 1 o 2 en cada uno, el fragmento literal que lo justifica y el total sobre 12. Resaltar la fila de «Usa solo datos del brief». Datos del caso ficticio.
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

##### E070 · ajuste-de-tono

- **Nombre a entregar:** `E070.png`  ·  **Destino final:** `public/images/guias/marketing/crear-publicaciones-para-redes-sociales-con-ia/ajuste-de-tono.webp`
- **Formato:** PNG o JPG opaco · 1600×900 px (16/9)  ·  **Sección de la guía:** iteracion
- **Texto alternativo previsto:** Tabla de cambios de tono con la frase original, la frase nueva y el motivo, y una lista de los datos que no cambiaron.

```
Genera la imagen y guárdala como «E070.png» (1600×900 px, relación 16/9): esquema conceptual editorial para la guía «Crear publicaciones para redes sociales con IA». Contenido a representar: La tabla «Cambios» del ajuste de tono con sus filas (frase original, frase nueva, motivo) y debajo la lista «Lo que no cambié». Resaltar en el mismo color los datos que aparecen en las dos versiones.
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

##### E071 · versiones-por-formato

- **Nombre a entregar:** `E071.png`  ·  **Destino final:** `public/images/guias/marketing/crear-publicaciones-para-redes-sociales-con-ia/versiones-por-formato.webp`
- **Formato:** PNG o JPG opaco · 1600×900 px (16/9)  ·  **Sección de la guía:** adaptacion
- **Texto alternativo previsto:** La misma publicación en una imagen con texto, en una serie de tres imágenes y en un mensaje breve, con los días y la fecha resaltados.

```
Genera la imagen y guárdala como «E071.png» (1600×900 px, relación 16/9): esquema conceptual editorial para la guía «Crear publicaciones para redes sociales con IA». Contenido a representar: La publicación final en una imagen con texto y, al lado, sus dos versiones: una serie de tres imágenes y un mensaje breve para mensajería. Resaltar en las tres la frase con los días y la fecha límite.
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

##### E072 · antes-despues

- **Nombre a entregar:** `E072.png`  ·  **Destino final:** `public/images/guias/marketing/crear-publicaciones-para-redes-sociales-con-ia/antes-despues.webp`
- **Formato:** PNG o JPG opaco · 1600×900 px (16/9)  ·  **Sección de la guía:** antes-despues
- **Texto alternativo previsto:** Dos tarjetas comparadas: un texto genérico de peluquería y la publicación final con los datos exactos de la oferta.

```
Genera la imagen y guárdala como «E072.png» (1600×900 px, relación 16/9): esquema conceptual editorial para la guía «Crear publicaciones para redes sociales con IA». Contenido a representar: Dos tarjetas comparadas: a la izquierda el texto del pedido sin brief, a la derecha la publicación final. Subrayar en la izquierda lo que promete y en la derecha los datos exactos de la oferta.
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

#### Ideas de contenido para tu negocio con IA que no suenan genéricas (`guias/marketing/ideas-de-contenido-para-tu-negocio-con-ia/`)

##### E073 · datos-necesarios

- **Nombre a entregar:** `E073.png`  ·  **Destino final:** `public/images/guias/marketing/ideas-de-contenido-para-tu-negocio-con-ia/datos-necesarios.webp`
- **Formato:** PNG o JPG opaco · 1600×1200 px (4/3)  ·  **Sección de la guía:** datos
- **Texto alternativo previsto:** Hoja de cálculo con seis listas de materia prima de una tienda de mascotas ficticia: preguntas, problemas, productos, temporada, límites y tiempo.

```
Genera la imagen y guárdala como «E073.png» (1600×1200 px, relación 4/3): esquema conceptual editorial para la guía «Ideas de contenido para tu negocio con IA que no suenan genéricas». Contenido a representar: La ficha de materia prima pegada en una hoja de cálculo, con las seis listas completas con el caso ficticio y escritas con palabras de cliente, no de marketing. Resaltar la lista de lo que no se publica. Sin nombres ni teléfonos.
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

##### E074 · primer-resultado

- **Nombre a entregar:** `E074.png`  ·  **Destino final:** `public/images/guias/marketing/ideas-de-contenido-para-tu-negocio-con-ia/primer-resultado.webp`
- **Formato:** PNG o JPG opaco · 1600×900 px (16/9)  ·  **Sección de la guía:** primer-resultado
- **Texto alternativo previsto:** Tabla con las primeras ideas propuestas por una IA, con tres marcadas por un origen forzado o una acción que no lleva al objetivo.

```
Genera la imagen y guárdala como «E074.png» (1600×900 px, relación 16/9): esquema conceptual editorial para la guía «Ideas de contenido para tu negocio con IA que no suenan genéricas». Contenido a representar: La primera respuesta del asistente con la tabla de ideas, sin editar. Marcar con recuadros una idea con su origen forzado y dos con una acción que no lleva al objetivo. Negocio ficticio, sin datos personales.
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

##### E075 · rubrica

- **Nombre a entregar:** `E075.png`  ·  **Destino final:** `public/images/guias/marketing/ideas-de-contenido-para-tu-negocio-con-ia/rubrica.webp`
- **Formato:** PNG o JPG opaco · 1600×1200 px (4/3)  ·  **Sección de la guía:** analisis
- **Texto alternativo previsto:** Tabla de puntuación con tres ideas de contenido y cinco criterios, con el total por idea resaltado.

```
Genera la imagen y guárdala como «E075.png» (1600×1200 px, relación 4/3): esquema conceptual editorial para la guía «Ideas de contenido para tu negocio con IA que no suenan genéricas». Contenido a representar: Una tabla con tres ideas y los cinco criterios como columnas, con un puntaje de 0, 1 o 2 en cada celda y el total al final. Resaltar la fila de una idea con 10 y la de una con menos de 6.
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

##### E076 · banco-de-ideas

- **Nombre a entregar:** `E076.png`  ·  **Destino final:** `public/images/guias/marketing/ideas-de-contenido-para-tu-negocio-con-ia/banco-de-ideas.webp`
- **Formato:** PNG o JPG opaco · 1600×900 px (16/9)  ·  **Sección de la guía:** resultado-final
- **Texto alternativo previsto:** Hoja con el banco de ideas ordenado por prioridad, con su origen, formato, acción, puntaje y estado.

```
Genera la imagen y guárdala como «E076.png» (1600×900 px, relación 16/9): esquema conceptual editorial para la guía «Ideas de contenido para tu negocio con IA que no suenan genéricas». Contenido a representar: La hoja final del banco de ideas ordenada por prioridad, con las columnas de la tabla de la guía y el estado en «por hacer», salvo dos filas marcadas como publicadas. Siete filas ficticias.
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

---

## Lote 6 · Explicativas · «negocio»

#### Documentar procesos de tu negocio con IA (`guias/negocio/documentar-procesos-con-ia/`)

##### E077 · notas-del-recorrido

- **Nombre a entregar:** `E077.png`  ·  **Destino final:** `public/images/guias/negocio/documentar-procesos-con-ia/notas-del-recorrido.webp`
- **Formato:** PNG o JPG opaco · 1600×1200 px (4/3)  ·  **Sección de la guía:** datos
- **Texto alternativo previsto:** Siete líneas de notas de un recorrido, junto a una pantalla de pedidos.

```
Genera la imagen y guárdala como «E077.png» (1600×1200 px, relación 4/3): esquema conceptual editorial para la guía «Documentar procesos de tu negocio con IA». Contenido a representar: Las siete líneas de notas escritas a mano o en un bloc, junto a la pantalla del panel de la tienda en pequeño. Resaltar que algunas acciones, como revisar la dirección, no están anotadas.
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

##### E078 · primer-procedimiento

- **Nombre a entregar:** `E078.png`  ·  **Destino final:** `public/images/guias/negocio/documentar-procesos-con-ia/primer-procedimiento.webp`
- **Formato:** PNG o JPG opaco · 1600×900 px (16/9)  ·  **Sección de la guía:** primer-resultado
- **Texto alternativo previsto:** Tabla de doce pasos con tres celdas resaltadas para revisar.

```
Genera la imagen y guárdala como «E078.png» (1600×900 px, relación 16/9): esquema conceptual editorial para la guía «Documentar procesos de tu negocio con IA». Contenido a representar: La tabla de 12 pasos con tres celdas resaltadas: la excepción del paso 4, la señal del paso 7 y la excepción del paso 10. Al lado, el apartado «FALTA».
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

##### E079 · contraste-con-tus-respuestas

- **Nombre a entregar:** `E079.png`  ·  **Destino final:** `public/images/guias/negocio/documentar-procesos-con-ia/contraste-con-tus-respuestas.webp`
- **Formato:** PNG o JPG opaco · 1600×900 px (16/9)  ·  **Sección de la guía:** analisis
- **Texto alternativo previsto:** Respuestas de la entrevista conectadas con cada paso del procedimiento y la rúbrica puntuada.

```
Genera la imagen y guárdala como «E079.png» (1600×900 px, relación 16/9): esquema conceptual editorial para la guía «Documentar procesos de tu negocio con IA». Contenido a representar: Las respuestas de la entrevista a la izquierda y la tabla a la derecha, con líneas que unen cada paso con su respuesta; en rojo, los tres pasos que dicen menos que la respuesta. Debajo, la rúbrica puntuada (9 de 12).
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

##### E080 · version-para-quien-empieza

- **Nombre a entregar:** `E080.png`  ·  **Destino final:** `public/images/guias/negocio/documentar-procesos-con-ia/version-para-quien-empieza.webp`
- **Formato:** PNG o JPG opaco · 1600×900 px (16/9)  ·  **Sección de la guía:** adaptacion
- **Texto alternativo previsto:** Hoja con casillas para marcar doce pasos y una comprobación en cada uno.

```
Genera la imagen y guárdala como «E080.png» (1600×900 px, relación 16/9): esquema conceptual editorial para la guía «Documentar procesos de tu negocio con IA». Contenido a representar: Una hoja con «Antes de empezar», doce casillas con su comprobación y, debajo, «Terminé cuando». Una mano marca dos casillas.
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

##### E081 · registro-de-la-prueba

- **Nombre a entregar:** `E081.png`  ·  **Destino final:** `public/images/guias/negocio/documentar-procesos-con-ia/registro-de-la-prueba.webp`
- **Formato:** PNG o JPG opaco · 1600×900 px (16/9)  ·  **Sección de la guía:** medicion
- **Texto alternativo previsto:** Tabla vacía para anotar dónde se traba una persona que prueba un procedimiento.

```
Genera la imagen y guárdala como «E081.png» (1600×900 px, relación 16/9): esquema conceptual editorial para la guía «Documentar procesos de tu negocio con IA». Contenido a representar: La tabla del registro con una fila por paso y las columnas «¿Lo hizo sin ayuda?», «¿Dónde dudó o se equivocó?» y «Cambio que hago», sin rellenar. A un lado, una libreta y un reloj.
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

#### Organizar las tareas de tu negocio con IA (`guias/negocio/organizar-tareas-del-negocio-con-ia/`)

##### E082 · lista-de-pendientes

- **Nombre a entregar:** `E082.png`  ·  **Destino final:** `public/images/guias/negocio/organizar-tareas-del-negocio-con-ia/lista-de-pendientes.webp`
- **Formato:** PNG o JPG opaco · 1600×1200 px (4/3)  ·  **Sección de la guía:** datos
- **Texto alternativo previsto:** Lista numerada de pendientes con fechas y minutos, junto a la disponibilidad de tres personas.

```
Genera la imagen y guárdala como «E082.png» (1600×1200 px, relación 4/3): esquema conceptual editorial para la guía «Organizar las tareas de tu negocio con IA». Contenido a representar: La lista de 25 pendientes numerados de T01 a T25 escritos a mano, con la fecha y los minutos donde existen y tres líneas sin minutos resaltadas. A un lado, los minutos disponibles de tres personas por día.
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

##### E083 · hoja-con-prioridad

- **Nombre a entregar:** `E083.png`  ·  **Destino final:** `public/images/guias/negocio/organizar-tareas-del-negocio-con-ia/hoja-con-prioridad.webp`
- **Formato:** PNG o JPG opaco · 1600×900 px (16/9)  ·  **Sección de la guía:** hoja
- **Texto alternativo previsto:** Hoja de cálculo con tareas y tres columnas calculadas: días, urgencia y prioridad.

```
Genera la imagen y guárdala como «E083.png» (1600×900 px, relación 16/9): esquema conceptual editorial para la guía «Organizar las tareas de tu negocio con IA». Contenido a representar: Hoja de cálculo con tareas y tres columnas calculadas: días, urgencia y prioridad.
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

##### E084 · primera-tabla

- **Nombre a entregar:** `E084.png`  ·  **Destino final:** `public/images/guias/negocio/organizar-tareas-del-negocio-con-ia/primera-tabla.webp`
- **Formato:** PNG o JPG opaco · 1600×900 px (16/9)  ·  **Sección de la guía:** primer-resultado
- **Texto alternativo previsto:** Tabla de pendientes con dos celdas resaltadas para revisar y tres marcadas como [FALTA].

```
Genera la imagen y guárdala como «E084.png» (1600×900 px, relación 16/9): esquema conceptual editorial para la guía «Organizar las tareas de tu negocio con IA». Contenido a representar: La tabla de 25 filas con dos celdas resaltadas: el impacto Alto del letrero (T07) y la dependencia vacía de la lista de precios (T05). Al lado, tres celdas con [FALTA].
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

##### E085 · contraste-con-la-lista

- **Nombre a entregar:** `E085.png`  ·  **Destino final:** `public/images/guias/negocio/organizar-tareas-del-negocio-con-ia/contraste-con-la-lista.webp`
- **Formato:** PNG o JPG opaco · 1600×900 px (16/9)  ·  **Sección de la guía:** analisis
- **Texto alternativo previsto:** Lista original y tabla de la IA conectadas fila a fila, con la rúbrica puntuada.

```
Genera la imagen y guárdala como «E085.png» (1600×900 px, relación 16/9): esquema conceptual editorial para la guía «Organizar las tareas de tu negocio con IA». Contenido a representar: La lista original a la izquierda y la tabla a la derecha, con líneas que unen cada fila con su texto; en rojo T07 frente a la definición de impacto Alto. Debajo, la rúbrica puntuada (10 de 12).
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

##### E086 · plan-de-la-semana

- **Nombre a entregar:** `E086.png`  ·  **Destino final:** `public/images/guias/negocio/organizar-tareas-del-negocio-con-ia/plan-de-la-semana.webp`
- **Formato:** PNG o JPG opaco · 1600×900 px (16/9)  ·  **Sección de la guía:** adaptacion
- **Texto alternativo previsto:** Plan semanal de tres personas con la comprobación de minutos planificados y disponibles.

```
Genera la imagen y guárdala como «E086.png» (1600×900 px, relación 16/9): esquema conceptual editorial para la guía «Organizar las tareas de tu negocio con IA». Contenido a representar: Un calendario de lunes a viernes con las tareas repartidas entre tres personas y, debajo, la hoja Capacidad con los minutos planificados, los disponibles y el exceso en cero. Resaltar los días al límite.
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

#### Un sistema diario de trabajo con IA para tu negocio (`guias/negocio/sistema-diario-de-trabajo-con-ia/`)

##### E087 · ficha-de-contexto

- **Nombre a entregar:** `E087.png`  ·  **Destino final:** `public/images/guias/negocio/sistema-diario-de-trabajo-con-ia/ficha-de-contexto.webp`
- **Formato:** PNG o JPG opaco · 1600×1200 px (4/3)  ·  **Sección de la guía:** entrevista
- **Texto alternativo previsto:** Ficha de contexto de nueve campos pegada al inicio de una conversación con un asistente.

```
Genera la imagen y guárdala como «E087.png» (1600×1200 px, relación 4/3): esquema conceptual editorial para la guía «Un sistema diario de trabajo con IA para tu negocio». Contenido a representar: Una hoja con los nueve campos de la ficha y su contenido, con el campo «Lo que no he decidido» resaltado. Debajo, una conversación de chat cuyo primer mensaje es la ficha pegada.
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

##### E088 · apertura-primera-version

- **Nombre a entregar:** `E088.png`  ·  **Destino final:** `public/images/guias/negocio/sistema-diario-de-trabajo-con-ia/apertura-primera-version.webp`
- **Formato:** PNG o JPG opaco · 1600×900 px (16/9)  ·  **Sección de la guía:** primer-resultado
- **Texto alternativo previsto:** Una nota de traspaso y la apertura del día siguiente con tres celdas resaltadas para revisar.

```
Genera la imagen y guárdala como «E088.png» (1600×900 px, relación 16/9): esquema conceptual editorial para la guía «Un sistema diario de trabajo con IA para tu negocio». Contenido a representar: La nota de traspaso del lunes a la izquierda y la apertura del martes a la derecha, con tres celdas resaltadas: la prioridad 1, la prioridad 3 y el motivo del pantalón.
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

##### E089 · contraste-con-la-nota

- **Nombre a entregar:** `E089.png`  ·  **Destino final:** `public/images/guias/negocio/sistema-diario-de-trabajo-con-ia/contraste-con-la-nota.webp`
- **Formato:** PNG o JPG opaco · 1600×900 px (16/9)  ·  **Sección de la guía:** analisis
- **Texto alternativo previsto:** Nota de traspaso y apertura conectadas fila a fila, con la rúbrica puntuada.

```
Genera la imagen y guárdala como «E089.png» (1600×900 px, relación 16/9): esquema conceptual editorial para la guía «Un sistema diario de trabajo con IA para tu negocio». Contenido a representar: La nota de traspaso y la apertura unidas por líneas: cada prioridad con la fila de la nota de la que sale, y en rojo la prioridad 1 frente a «espera que Iván diga si hay tela». Debajo, la rúbrica puntuada (9 de 12).
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

##### E090 · nota-de-traspaso

- **Nombre a entregar:** `E090.png`  ·  **Destino final:** `public/images/guias/negocio/sistema-diario-de-trabajo-con-ia/nota-de-traspaso.webp`
- **Formato:** PNG o JPG opaco · 1600×900 px (16/9)  ·  **Sección de la guía:** adaptacion
- **Texto alternativo previsto:** Apuntes desordenados de un día convertidos en una nota de traspaso con cuatro tipos de fila.

```
Genera la imagen y guárdala como «E090.png» (1600×900 px, relación 16/9): esquema conceptual editorial para la guía «Un sistema diario de trabajo con IA para tu negocio». Contenido a representar: Los apuntes del lunes, en un párrafo desordenado, a la izquierda y la tabla de traspaso a la derecha con Hecho, Pendiente, Decisión y Pregunta abierta. Resaltar un pendiente con [FALTA: motivo].
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

##### E091 · un-dia-de-la-tienda

- **Nombre a entregar:** `E091.png`  ·  **Destino final:** `public/images/guias/negocio/sistema-diario-de-trabajo-con-ia/un-dia-de-la-tienda.webp`
- **Formato:** PNG o JPG opaco · 1600×900 px (16/9)  ·  **Sección de la guía:** comparativa
- **Texto alternativo previsto:** Cuadrícula semanal de una tienda con los seis bloques del sistema repartidos por días.

```
Genera la imagen y guárdala como «E091.png» (1600×900 px, relación 16/9): esquema conceptual editorial para la guía «Un sistema diario de trabajo con IA para tu negocio». Contenido a representar: Una cuadrícula de lunes a sábado con los bloques de cada día: apertura, durante el día y cierre en todos, y ventas, marketing, administración y revisión en su día.
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

---

## Lote 7 · Explicativas · «ventas»

#### Crear cotizaciones y propuestas comerciales con IA (`guias/ventas/crear-cotizaciones-y-propuestas-con-ia/`)

##### E092 · datos-necesarios

- **Nombre a entregar:** `E092.png`  ·  **Destino final:** `public/images/guias/ventas/crear-cotizaciones-y-propuestas-con-ia/datos-necesarios.webp`
- **Formato:** PNG o JPG opaco · 1600×1200 px (4/3)  ·  **Sección de la guía:** datos
- **Texto alternativo previsto:** Documento con las partidas, los porcentajes, las condiciones y el pedido de un cliente ficticio.

```
Genera la imagen y guárdala como «E092.png» (1600×1200 px, relación 4/3): esquema conceptual editorial para la guía «Crear cotizaciones y propuestas comerciales con IA». Contenido a representar: Un documento con cuatro bloques: las partidas con cantidad, unidad y precio; los tres porcentajes (descuento y a qué líneas se aplica, impuesto y anticipo); las condiciones ya decididas y lo que pidió el cliente.
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

##### E093 · calculadora-de-cotizacion

- **Nombre a entregar:** `E093.png`  ·  **Destino final:** `public/images/guias/ventas/crear-cotizaciones-y-propuestas-con-ia/calculadora-de-cotizacion.webp`
- **Formato:** PNG o JPG opaco · 1600×1200 px (4/3)  ·  **Sección de la guía:** hoja
- **Texto alternativo previsto:** Hoja de cálculo con la calculadora de cotización, sus totales y la fórmula de la base del descuento en la barra.

```
Genera la imagen y guárdala como «E093.png» (1600×1200 px, relación 4/3): esquema conceptual editorial para la guía «Crear cotizaciones y propuestas comerciales con IA». Contenido a representar: La calculadora pegada en la celda A1: cuatro partidas con su importe, subtotal 2950, descuento 195, total 3306, anticipo 1322 y saldo 1984. Resaltar la barra de fórmulas con la fórmula de la base del descuento.
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

##### E094 · borrador-de-cotizacion

- **Nombre a entregar:** `E094.png`  ·  **Destino final:** `public/images/guias/ventas/crear-cotizaciones-y-propuestas-con-ia/borrador-de-cotizacion.webp`
- **Formato:** PNG o JPG opaco · 1600×900 px (16/9)  ·  **Sección de la guía:** primer-resultado
- **Texto alternativo previsto:** Cotización redactada por un asistente con dos frases subrayadas.

```
Genera la imagen y guárdala como «E094.png» (1600×900 px, relación 16/9): esquema conceptual editorial para la guía «Crear cotizaciones y propuestas comerciales con IA». Contenido a representar: La cotización devuelta por el asistente, con la frase del anticipo «sobre el subtotal» y la de «materiales de primera calidad» subrayadas.
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

##### E095 · revision-de-cifras

- **Nombre a entregar:** `E095.png`  ·  **Destino final:** `public/images/guias/ventas/crear-cotizaciones-y-propuestas-con-ia/revision-de-cifras.webp`
- **Formato:** PNG o JPG opaco · 1600×900 px (16/9)  ·  **Sección de la guía:** analisis
- **Texto alternativo previsto:** Hoja y documento lado a lado con cada cifra enlazada y una diferencia marcada en el anticipo.

```
Genera la imagen y guárdala como «E095.png» (1600×900 px, relación 16/9): esquema conceptual editorial para la guía «Crear cotizaciones y propuestas comerciales con IA». Contenido a representar: La hoja y el documento lado a lado, con una línea entre cada cifra y su equivalente y una marca en el anticipo: 40 % de 2950 sería 1180, no 1322.
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

##### E096 · cotizacion-final

- **Nombre a entregar:** `E096.png`  ·  **Destino final:** `public/images/guias/ventas/crear-cotizaciones-y-propuestas-con-ia/cotizacion-final.webp`
- **Formato:** PNG o JPG opaco · 1600×900 px (16/9)  ·  **Sección de la guía:** resultado-final
- **Texto alternativo previsto:** Cotización final con las frases corregidas y la lista de condiciones pendientes.

```
Genera la imagen y guárdala como «E096.png» (1600×900 px, relación 16/9): esquema conceptual editorial para la guía «Crear cotizaciones y propuestas comerciales con IA». Contenido a representar: La cotización final con las dos frases corregidas resaltadas y, debajo, la lista «FALTA» con el plazo y la garantía por decidir.
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

#### Crear descripciones de productos con IA sin inventar datos (`guias/ventas/crear-descripciones-de-productos-con-ia/`)

##### E097 · datos-necesarios

- **Nombre a entregar:** `E097.png`  ·  **Destino final:** `public/images/guias/ventas/crear-descripciones-de-productos-con-ia/datos-necesarios.webp`
- **Formato:** PNG o JPG opaco · 1600×1200 px (4/3)  ·  **Sección de la guía:** datos
- **Texto alternativo previsto:** Documento con notas de etiqueta, medidas, preguntas de clientes y límites de un canal de venta.

```
Genera la imagen y guárdala como «E097.png» (1600×1200 px, relación 4/3): esquema conceptual editorial para la guía «Crear descripciones de productos con IA sin inventar datos». Contenido a representar: Un documento con cuatro bloques: notas de la etiqueta del proveedor, medidas anotadas con su método, las tres preguntas que más hacen los clientes y el canal con sus límites copiados.
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

##### E098 · ficha-de-producto

- **Nombre a entregar:** `E098.png`  ·  **Destino final:** `public/images/guias/ventas/crear-descripciones-de-productos-con-ia/ficha-de-producto.webp`
- **Formato:** PNG o JPG opaco · 1600×1200 px (4/3)  ·  **Sección de la guía:** entrevista
- **Texto alternativo previsto:** Hoja con la ficha de un producto: campo, dato, estado y origen, con dos filas sin confirmar resaltadas.

```
Genera la imagen y guárdala como «E098.png» (1600×1200 px, relación 4/3): esquema conceptual editorial para la guía «Crear descripciones de productos con IA sin inventar datos». Contenido a representar: La ficha del caso pegada en una hoja: once filas con las columnas Campo, Dato, Estado y De dónde sale. Resaltar en un color las dos filas «Sin confirmar».
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

##### E099 · borrador-inicial

- **Nombre a entregar:** `E099.png`  ·  **Destino final:** `public/images/guias/ventas/crear-descripciones-de-productos-con-ia/borrador-inicial.webp`
- **Formato:** PNG o JPG opaco · 1600×900 px (16/9)  ·  **Sección de la guía:** primer-resultado
- **Texto alternativo previsto:** Descripción corta y larga de una vela con dos frases subrayadas junto a las filas de la ficha.

```
Genera la imagen y guárdala como «E099.png» (1600×900 px, relación 16/9): esquema conceptual editorial para la guía «Crear descripciones de productos con IA sin inventar datos». Contenido a representar: Las dos versiones que devolvió el asistente, con la frase sobre «muchas tardes» y la de «unas 3 horas cada vez» subrayadas y, al lado, la fila de la ficha que corresponde a cada una.
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

##### E100 · auditoria-de-frases

- **Nombre a entregar:** `E100.png`  ·  **Destino final:** `public/images/guias/ventas/crear-descripciones-de-productos-con-ia/auditoria-de-frases.webp`
- **Formato:** PNG o JPG opaco · 1600×900 px (16/9)  ·  **Sección de la guía:** analisis
- **Texto alternativo previsto:** Tabla de frases con problema y rúbrica puntuada de una descripción de producto.

```
Genera la imagen y guárdala como «E100.png» (1600×900 px, relación 16/9): esquema conceptual editorial para la guía «Crear descripciones de productos con IA sin inventar datos». Contenido a representar: La respuesta del prompt de auditoría: la tabla «Frases con problema» con sus tres filas, la rúbrica con los cinco puntajes y el total.
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

##### E101 · descripcion-final

- **Nombre a entregar:** `E101.png`  ·  **Destino final:** `public/images/guias/ventas/crear-descripciones-de-productos-con-ia/descripcion-final.webp`
- **Formato:** PNG o JPG opaco · 1600×900 px (16/9)  ·  **Sección de la guía:** resultado-final
- **Texto alternativo previsto:** Tabla de cambios y versiones finales, corta y larga, de la descripción de una vela.

```
Genera la imagen y guárdala como «E101.png» (1600×900 px, relación 16/9): esquema conceptual editorial para la guía «Crear descripciones de productos con IA sin inventar datos». Contenido a representar: La tabla «Cambios» con sus tres filas y, debajo, la versión corta y la larga finales con las frases corregidas resaltadas.
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

#### Definir precios y márgenes con apoyo de la IA (`guias/ventas/definir-precios-y-margenes-con-ia/`)

##### E102 · datos-necesarios

- **Nombre a entregar:** `E102.png`  ·  **Destino final:** `public/images/guias/ventas/definir-precios-y-margenes-con-ia/datos-necesarios.webp`
- **Formato:** PNG o JPG opaco · 1600×1200 px (4/3)  ·  **Sección de la guía:** datos
- **Texto alternativo previsto:** Documento con facturas de ingredientes, tiempos de una tanda, gastos fijos y ventas de un negocio ficticio.

```
Genera la imagen y guárdala como «E102.png» (1600×1200 px, relación 4/3): esquema conceptual editorial para la guía «Definir precios y márgenes con apoyo de la IA». Contenido a representar: Un documento con cuatro bloques: facturas de ingredientes con su precio, el tiempo cronometrado de una tanda, los gastos fijos del mes y las ventas de un mes normal.
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

##### E103 · calculadora-de-precio

- **Nombre a entregar:** `E103.png`  ·  **Destino final:** `public/images/guias/ventas/definir-precios-y-margenes-con-ia/calculadora-de-precio.webp`
- **Formato:** PNG o JPG opaco · 1600×1200 px (4/3)  ·  **Sección de la guía:** hoja
- **Texto alternativo previsto:** Hoja de cálculo con la calculadora de costo y precio, con costo total, precio objetivo y margen real, y la fórmula del precio en la barra.

```
Genera la imagen y guárdala como «E103.png» (1600×1200 px, relación 4/3): esquema conceptual editorial para la guía «Definir precios y márgenes con apoyo de la IA». Contenido a representar: La calculadora pegada en la celda A1: datos en la columna B y resultados en la C, con costo total 24, precio objetivo 40 y margen real 40 %. Resaltar la barra de fórmulas con la fórmula del precio objetivo.
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

##### E104 · lectura-inicial

- **Nombre a entregar:** `E104.png`  ·  **Destino final:** `public/images/guias/ventas/definir-precios-y-margenes-con-ia/lectura-inicial.webp`
- **Formato:** PNG o JPG opaco · 1600×900 px (16/9)  ·  **Sección de la guía:** primer-resultado
- **Texto alternativo previsto:** Lectura de una hoja de costos con dos frases subrayadas.

```
Genera la imagen y guárdala como «E104.png» (1600×900 px, relación 16/9): esquema conceptual editorial para la guía «Definir precios y márgenes con apoyo de la IA». Contenido a representar: La lectura devuelta por el asistente, con la frase «ganas 40 por cada 100 que te cuesta la caja» y la de «espacio para cubrir imprevistos» subrayadas.
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

##### E105 · contraste-con-la-hoja

- **Nombre a entregar:** `E105.png`  ·  **Destino final:** `public/images/guias/ventas/definir-precios-y-margenes-con-ia/contraste-con-la-hoja.webp`
- **Formato:** PNG o JPG opaco · 1600×900 px (16/9)  ·  **Sección de la guía:** analisis
- **Texto alternativo previsto:** Hoja y lectura lado a lado con cada cifra enlazada y la diferencia entre margen y recargo marcada.

```
Genera la imagen y guárdala como «E105.png» (1600×900 px, relación 16/9): esquema conceptual editorial para la guía «Definir precios y márgenes con apoyo de la IA». Contenido a representar: La hoja junto a la lectura, con una línea entre cada cifra y su celda y una marca en el margen: 16 de 40 es 40 %, mientras que 16 de 24 es 66,7 %.
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

##### E106 · tabla-de-escenarios

- **Nombre a entregar:** `E106.png`  ·  **Destino final:** `public/images/guias/ventas/definir-precios-y-margenes-con-ia/tabla-de-escenarios.webp`
- **Formato:** PNG o JPG opaco · 1600×1200 px (4/3)  ·  **Sección de la guía:** adaptacion
- **Texto alternativo previsto:** Tabla con un caso base y tres escenarios de costos, con su margen y el precio para mantener el margen deseado.

```
Genera la imagen y guárdala como «E106.png» (1600×1200 px, relación 4/3): esquema conceptual editorial para la guía «Definir precios y márgenes con apoyo de la IA». Contenido a representar: Una tabla con el caso base y los tres escenarios (ingredientes +25 %, 100 cajas al mes y ambos), con el costo total, el margen real y el precio para mantener el 40 %. Resaltar los que bajan de 35 %.
Estilo: diagrama editorial limpio de estilo plano o isométrico suave, sobre fondo marfil #F6F2E9; paleta menta #15B38C, cian #3FB6D8, violeta suave #8B7CF6 y tinta #0E2A2E. Resalta en menta lo que la descripción pida destacar. IMPORTANTE: no escribas texto, palabras ni cifras legibles; representa el texto, las tablas y los números con barras y líneas grises. Sin logotipos ni personas reales.
```

---

## Mapa de asignación (lo uso yo cuando me pases los zips)

| ID | Archivo | Destino en el proyecto | Lo consume |
| --- | --- | --- | --- |
| S01 | `home-hero.png` | `public/images/site/home-hero.png` | `app/(site)/page.tsx` → `FloatingIllustration file="home-hero.png"` |
| S02 | `home-metodo.png` | `public/images/site/home-metodo.png` | `app/(site)/page.tsx` → `FloatingIllustration file="home-metodo.png"` |
| S03 | `home-criterio.png` | `public/images/site/home-criterio.png` | `app/(site)/page.tsx` → `FloatingIllustration file="home-criterio.png"` |
| S04 | `area-marketing.png` | `public/images/site/area-marketing.png` | `app/(site)/page.tsx` y `app/(site)/[categoria]/page.tsx` → `area-marketing.png` |
| S05 | `area-ventas.png` | `public/images/site/area-ventas.png` | `app/(site)/page.tsx` y `app/(site)/[categoria]/page.tsx` → `area-ventas.png` |
| S06 | `area-clientes.png` | `public/images/site/area-clientes.png` | `app/(site)/page.tsx` y `app/(site)/[categoria]/page.tsx` → `area-clientes.png` |
| S07 | `area-analisis.png` | `public/images/site/area-analisis.png` | `app/(site)/page.tsx` y `app/(site)/[categoria]/page.tsx` → `area-analisis.png` |
| S08 | `area-negocio.png` | `public/images/site/area-negocio.png` | `app/(site)/page.tsx` y `app/(site)/[categoria]/page.tsx` → `area-negocio.png` |
| S09 | `guias-cabecera.png` | `public/images/site/guias-cabecera.png` | `app/(site)/guias/page.tsx` → `FloatingIllustration file="guias-cabecera.png"` |
| S10 | `guia-relacionadas.png` | `public/images/site/guia-relacionadas.png` | `components/guide/related-guides.tsx` → `FloatingIllustration file="guia-relacionadas.png"` |
| S11 | `sobre-cabecera.png` | `public/images/site/sobre-cabecera.png` | `app/(site)/sobre-nosotros/page.tsx` → `FloatingIllustration file="sobre-cabecera.png"` |
| S12 | `contacto-sobre.png` | `public/images/site/contacto-sobre.png` | `app/(site)/contacto/page.tsx` → `FloatingIllustration file="contacto-sobre.png"` |
| S13 | `legal-escudo.png` | `public/images/site/legal-escudo.png` | `components/shared/legal-page.tsx` → `FloatingIllustration file="legal-escudo.png"` |
| S14 | `error-404.png` | `public/images/site/error-404.png` | `app/not-found.tsx` → `FloatingIllustration file="error-404.png"` |
| H01 | `hero.webp` | `public/images/guias/analisis/analizar-ofertas-de-proveedores-con-ia/hero.webp` | `images.hero` en `content/guias/analisis/analizar-ofertas-de-proveedores-con-ia/data.ts` (hero) y tarjetas de guía |
| H02 | `hero.webp` | `public/images/guias/analisis/analizar-ventas-con-ia/hero.webp` | `images.hero` en `content/guias/analisis/analizar-ventas-con-ia/data.ts` (hero) y tarjetas de guía |
| H03 | `hero.webp` | `public/images/guias/analisis/ideas-de-nuevos-productos-con-ia/hero.webp` | `images.hero` en `content/guias/analisis/ideas-de-nuevos-productos-con-ia/data.ts` (hero) y tarjetas de guía |
| H04 | `hero.webp` | `public/images/guias/analisis/investigar-competidores-con-ia/hero.webp` | `images.hero` en `content/guias/analisis/investigar-competidores-con-ia/data.ts` (hero) y tarjetas de guía |
| H05 | `hero.webp` | `public/images/guias/clientes/analizar-opiniones-de-clientes-con-ia/hero.webp` | `images.hero` en `content/guias/clientes/analizar-opiniones-de-clientes-con-ia/data.ts` (hero) y tarjetas de guía |
| H06 | `hero.webp` | `public/images/guias/clientes/responder-consultas-de-clientes-con-ia/hero.webp` | `images.hero` en `content/guias/clientes/responder-consultas-de-clientes-con-ia/data.ts` (hero) y tarjetas de guía |
| H07 | `hero.webp` | `public/images/guias/clientes/responder-reclamos-con-ia/hero.webp` | `images.hero` en `content/guias/clientes/responder-reclamos-con-ia/data.ts` (hero) y tarjetas de guía |
| H08 | `hero.webp` | `public/images/guias/marketing/calendario-de-contenido-con-ia/hero.webp` | `images.hero` en `content/guias/marketing/calendario-de-contenido-con-ia/data.ts` (hero) y tarjetas de guía |
| H09 | `hero.webp` | `public/images/guias/marketing/crear-afiches-con-ia/hero.webp` | `images.hero` en `content/guias/marketing/crear-afiches-con-ia/data.ts` (hero) y tarjetas de guía |
| H10 | `hero.webp` | `public/images/guias/marketing/crear-anuncios-con-ia/hero.webp` | `images.hero` en `content/guias/marketing/crear-anuncios-con-ia/data.ts` (hero) y tarjetas de guía |
| H11 | `hero.webp` | `public/images/guias/marketing/crear-campanas-promocionales-con-ia/hero.webp` | `images.hero` en `content/guias/marketing/crear-campanas-promocionales-con-ia/data.ts` (hero) y tarjetas de guía |
| H12 | `hero.webp` | `public/images/guias/marketing/crear-promociones-con-ia/hero.webp` | `images.hero` en `content/guias/marketing/crear-promociones-con-ia/data.ts` (hero) y tarjetas de guía |
| H13 | `hero.webp` | `public/images/guias/marketing/crear-publicaciones-para-redes-sociales-con-ia/hero.webp` | `images.hero` en `content/guias/marketing/crear-publicaciones-para-redes-sociales-con-ia/data.ts` (hero) y tarjetas de guía |
| H14 | `hero.webp` | `public/images/guias/marketing/ideas-de-contenido-para-tu-negocio-con-ia/hero.webp` | `images.hero` en `content/guias/marketing/ideas-de-contenido-para-tu-negocio-con-ia/data.ts` (hero) y tarjetas de guía |
| H15 | `hero.webp` | `public/images/guias/negocio/documentar-procesos-con-ia/hero.webp` | `images.hero` en `content/guias/negocio/documentar-procesos-con-ia/data.ts` (hero) y tarjetas de guía |
| H16 | `hero.webp` | `public/images/guias/negocio/organizar-tareas-del-negocio-con-ia/hero.webp` | `images.hero` en `content/guias/negocio/organizar-tareas-del-negocio-con-ia/data.ts` (hero) y tarjetas de guía |
| H17 | `hero.webp` | `public/images/guias/negocio/sistema-diario-de-trabajo-con-ia/hero.webp` | `images.hero` en `content/guias/negocio/sistema-diario-de-trabajo-con-ia/data.ts` (hero) y tarjetas de guía |
| H18 | `hero.webp` | `public/images/guias/ventas/crear-cotizaciones-y-propuestas-con-ia/hero.webp` | `images.hero` en `content/guias/ventas/crear-cotizaciones-y-propuestas-con-ia/data.ts` (hero) y tarjetas de guía |
| H19 | `hero.webp` | `public/images/guias/ventas/crear-descripciones-de-productos-con-ia/hero.webp` | `images.hero` en `content/guias/ventas/crear-descripciones-de-productos-con-ia/data.ts` (hero) y tarjetas de guía |
| H20 | `hero.webp` | `public/images/guias/ventas/definir-precios-y-margenes-con-ia/hero.webp` | `images.hero` en `content/guias/ventas/definir-precios-y-margenes-con-ia/data.ts` (hero) y tarjetas de guía |
| E001 | `ofertas-recibidas.webp` | `public/images/guias/analisis/analizar-ofertas-de-proveedores-con-ia/ofertas-recibidas.webp` | `images.ofertas` en `content/guias/analisis/analizar-ofertas-de-proveedores-con-ia/data.ts` (sección «datos») |
| E002 | `hoja-comparadora.webp` | `public/images/guias/analisis/analizar-ofertas-de-proveedores-con-ia/hoja-comparadora.webp` | `images.hoja` en `content/guias/analisis/analizar-ofertas-de-proveedores-con-ia/data.ts` (sección «hoja») |
| E003 | `extraccion-inicial.webp` | `public/images/guias/analisis/analizar-ofertas-de-proveedores-con-ia/extraccion-inicial.webp` | `images.primerResultado` en `content/guias/analisis/analizar-ofertas-de-proveedores-con-ia/data.ts` (sección «primer-resultado») |
| E004 | `contraste-con-la-oferta.webp` | `public/images/guias/analisis/analizar-ofertas-de-proveedores-con-ia/contraste-con-la-oferta.webp` | `images.contraste` en `content/guias/analisis/analizar-ofertas-de-proveedores-con-ia/data.ts` (sección «analisis») |
| E005 | `resultado-corregido.webp` | `public/images/guias/analisis/analizar-ofertas-de-proveedores-con-ia/resultado-corregido.webp` | `images.final` en `content/guias/analisis/analizar-ofertas-de-proveedores-con-ia/data.ts` (sección «resultado-final») |
| E006 | `preguntas-a-proveedores.webp` | `public/images/guias/analisis/analizar-ofertas-de-proveedores-con-ia/preguntas-a-proveedores.webp` | `images.preguntas` en `content/guias/analisis/analizar-ofertas-de-proveedores-con-ia/data.ts` (sección «adaptacion») |
| E007 | `datos-necesarios.webp` | `public/images/guias/analisis/analizar-ventas-con-ia/datos-necesarios.webp` | `images.datos` en `content/guias/analisis/analizar-ventas-con-ia/data.ts` (sección «datos») |
| E008 | `tabla-resumen.webp` | `public/images/guias/analisis/analizar-ventas-con-ia/tabla-resumen.webp` | `images.resumen` en `content/guias/analisis/analizar-ventas-con-ia/data.ts` (sección «hoja») |
| E009 | `primera-lectura.webp` | `public/images/guias/analisis/analizar-ventas-con-ia/primera-lectura.webp` | `images.primerResultado` en `content/guias/analisis/analizar-ventas-con-ia/data.ts` (sección «primer-resultado») |
| E010 | `comprobacion-de-cifras.webp` | `public/images/guias/analisis/analizar-ventas-con-ia/comprobacion-de-cifras.webp` | `images.comprobacion` en `content/guias/analisis/analizar-ventas-con-ia/data.ts` (sección «analisis») |
| E011 | `hipotesis-y-comprobaciones.webp` | `public/images/guias/analisis/analizar-ventas-con-ia/hipotesis-y-comprobaciones.webp` | `images.hipotesis` en `content/guias/analisis/analizar-ventas-con-ia/data.ts` (sección «resultado-final») |
| E012 | `ficha-de-problemas.webp` | `public/images/guias/analisis/ideas-de-nuevos-productos-con-ia/ficha-de-problemas.webp` | `images.ficha` en `content/guias/analisis/ideas-de-nuevos-productos-con-ia/data.ts` (sección «datos») |
| E013 | `primeras-ideas.webp` | `public/images/guias/analisis/ideas-de-nuevos-productos-con-ia/primeras-ideas.webp` | `images.primerResultado` en `content/guias/analisis/ideas-de-nuevos-productos-con-ia/data.ts` (sección «primer-resultado») |
| E014 | `contraste-con-la-ficha.webp` | `public/images/guias/analisis/ideas-de-nuevos-productos-con-ia/contraste-con-la-ficha.webp` | `images.contraste` en `content/guias/analisis/ideas-de-nuevos-productos-con-ia/data.ts` (sección «analisis») |
| E015 | `matriz-de-decision.webp` | `public/images/guias/analisis/ideas-de-nuevos-productos-con-ia/matriz-de-decision.webp` | `images.matriz` en `content/guias/analisis/ideas-de-nuevos-productos-con-ia/data.ts` (sección «comparativa») |
| E016 | `plan-de-validacion.webp` | `public/images/guias/analisis/ideas-de-nuevos-productos-con-ia/plan-de-validacion.webp` | `images.plan` en `content/guias/analisis/ideas-de-nuevos-productos-con-ia/data.ts` (sección «medicion») |
| E017 | `ficha-de-evidencia.webp` | `public/images/guias/analisis/investigar-competidores-con-ia/ficha-de-evidencia.webp` | `images.ficha` en `content/guias/analisis/investigar-competidores-con-ia/data.ts` (sección «entrevista») |
| E018 | `revision-de-la-ficha.webp` | `public/images/guias/analisis/investigar-competidores-con-ia/revision-de-la-ficha.webp` | `images.revision` en `content/guias/analisis/investigar-competidores-con-ia/data.ts` (sección «prompt») |
| E019 | `primera-comparacion.webp` | `public/images/guias/analisis/investigar-competidores-con-ia/primera-comparacion.webp` | `images.primerResultado` en `content/guias/analisis/investigar-competidores-con-ia/data.ts` (sección «primer-resultado») |
| E020 | `contraste-con-la-ficha.webp` | `public/images/guias/analisis/investigar-competidores-con-ia/contraste-con-la-ficha.webp` | `images.contraste` en `content/guias/analisis/investigar-competidores-con-ia/data.ts` (sección «analisis») |
| E021 | `hipotesis-corregidas.webp` | `public/images/guias/analisis/investigar-competidores-con-ia/hipotesis-corregidas.webp` | `images.final` en `content/guias/analisis/investigar-competidores-con-ia/data.ts` (sección «resultado-final») |
| E022 | `resenas-anonimizadas.webp` | `public/images/guias/clientes/analizar-opiniones-de-clientes-con-ia/resenas-anonimizadas.webp` | `images.datos` en `content/guias/clientes/analizar-opiniones-de-clientes-con-ia/data.ts` (sección «datos») |
| E023 | `hoja-de-conteo.webp` | `public/images/guias/clientes/analizar-opiniones-de-clientes-con-ia/hoja-de-conteo.webp` | `images.hoja` en `content/guias/clientes/analizar-opiniones-de-clientes-con-ia/data.ts` (sección «hoja») |
| E024 | `clasificacion-inicial.webp` | `public/images/guias/clientes/analizar-opiniones-de-clientes-con-ia/clasificacion-inicial.webp` | `images.primerResultado` en `content/guias/clientes/analizar-opiniones-de-clientes-con-ia/data.ts` (sección «primer-resultado») |
| E025 | `verificacion-de-citas.webp` | `public/images/guias/clientes/analizar-opiniones-de-clientes-con-ia/verificacion-de-citas.webp` | `images.verificacion` en `content/guias/clientes/analizar-opiniones-de-clientes-con-ia/data.ts` (sección «analisis») |
| E026 | `conteos-antes-y-despues.webp` | `public/images/guias/clientes/analizar-opiniones-de-clientes-con-ia/conteos-antes-y-despues.webp` | `images.final` en `content/guias/clientes/analizar-opiniones-de-clientes-con-ia/data.ts` (sección «resultado-final») |
| E027 | `lectura-de-patrones.webp` | `public/images/guias/clientes/analizar-opiniones-de-clientes-con-ia/lectura-de-patrones.webp` | `images.lectura` en `content/guias/clientes/analizar-opiniones-de-clientes-con-ia/data.ts` (sección «adaptacion») |
| E028 | `base-de-respuestas.webp` | `public/images/guias/clientes/responder-consultas-de-clientes-con-ia/base-de-respuestas.webp` | `images.base` en `content/guias/clientes/responder-consultas-de-clientes-con-ia/data.ts` (sección «entrevista») |
| E029 | `borrador-inicial.webp` | `public/images/guias/clientes/responder-consultas-de-clientes-con-ia/borrador-inicial.webp` | `images.primerResultado` en `content/guias/clientes/responder-consultas-de-clientes-con-ia/data.ts` (sección «primer-resultado») |
| E030 | `revision-de-promesas.webp` | `public/images/guias/clientes/responder-consultas-de-clientes-con-ia/revision-de-promesas.webp` | `images.revision` en `content/guias/clientes/responder-consultas-de-clientes-con-ia/data.ts` (sección «analisis») |
| E031 | `borrador-corregido.webp` | `public/images/guias/clientes/responder-consultas-de-clientes-con-ia/borrador-corregido.webp` | `images.final` en `content/guias/clientes/responder-consultas-de-clientes-con-ia/data.ts` (sección «resultado-final») |
| E032 | `version-por-correo.webp` | `public/images/guias/clientes/responder-consultas-de-clientes-con-ia/version-por-correo.webp` | `images.correo` en `content/guias/clientes/responder-consultas-de-clientes-con-ia/data.ts` (sección «adaptacion») |
| E033 | `registro-de-hechos.webp` | `public/images/guias/clientes/responder-reclamos-con-ia/registro-de-hechos.webp` | `images.registro` en `content/guias/clientes/responder-reclamos-con-ia/data.ts` (sección «datos») |
| E034 | `ficha-del-reclamo.webp` | `public/images/guias/clientes/responder-reclamos-con-ia/ficha-del-reclamo.webp` | `images.ficha` en `content/guias/clientes/responder-reclamos-con-ia/data.ts` (sección «entrevista») |
| E035 | `tarjeta-de-decision.webp` | `public/images/guias/clientes/responder-reclamos-con-ia/tarjeta-de-decision.webp` | `images.tarjeta` en `content/guias/clientes/responder-reclamos-con-ia/data.ts` (sección «prompt») |
| E036 | `borrador-inicial.webp` | `public/images/guias/clientes/responder-reclamos-con-ia/borrador-inicial.webp` | `images.primerResultado` en `content/guias/clientes/responder-reclamos-con-ia/data.ts` (sección «primer-resultado») |
| E037 | `contraste-con-la-tarjeta.webp` | `public/images/guias/clientes/responder-reclamos-con-ia/contraste-con-la-tarjeta.webp` | `images.contraste` en `content/guias/clientes/responder-reclamos-con-ia/data.ts` (sección «analisis») |
| E038 | `respuesta-corregida.webp` | `public/images/guias/clientes/responder-reclamos-con-ia/respuesta-corregida.webp` | `images.final` en `content/guias/clientes/responder-reclamos-con-ia/data.ts` (sección «resultado-final») |
| E039 | `respuesta-publica.webp` | `public/images/guias/clientes/responder-reclamos-con-ia/respuesta-publica.webp` | `images.publica` en `content/guias/clientes/responder-reclamos-con-ia/data.ts` (sección «adaptacion») |
| E040 | `datos-necesarios.webp` | `public/images/guias/marketing/calendario-de-contenido-con-ia/datos-necesarios.webp` | `images.datos` en `content/guias/marketing/calendario-de-contenido-con-ia/data.ts` (sección «datos») |
| E041 | `calculadora-de-capacidad.webp` | `public/images/guias/marketing/calendario-de-contenido-con-ia/calculadora-de-capacidad.webp` | `images.hoja` en `content/guias/marketing/calendario-de-contenido-con-ia/data.ts` (sección «hoja») |
| E042 | `calendario-inicial.webp` | `public/images/guias/marketing/calendario-de-contenido-con-ia/calendario-inicial.webp` | `images.primerResultado` en `content/guias/marketing/calendario-de-contenido-con-ia/data.ts` (sección «primer-resultado») |
| E043 | `la-hoja-detecta-la-diferencia.webp` | `public/images/guias/marketing/calendario-de-contenido-con-ia/la-hoja-detecta-la-diferencia.webp` | `images.detecta` en `content/guias/marketing/calendario-de-contenido-con-ia/data.ts` (sección «analisis») |
| E044 | `calendario-final.webp` | `public/images/guias/marketing/calendario-de-contenido-con-ia/calendario-final.webp` | `images.final` en `content/guias/marketing/calendario-de-contenido-con-ia/data.ts` (sección «resultado-final») |
| E045 | `ficha-de-niveles.webp` | `public/images/guias/marketing/crear-afiches-con-ia/ficha-de-niveles.webp` | `images.ficha` en `content/guias/marketing/crear-afiches-con-ia/data.ts` (sección «datos») |
| E046 | `jerarquia.webp` | `public/images/guias/marketing/crear-afiches-con-ia/jerarquia.webp` | `images.jerarquia` en `content/guias/marketing/crear-afiches-con-ia/data.ts` (sección «marco») |
| E047 | `antes-despues.webp` | `public/images/guias/marketing/crear-afiches-con-ia/antes-despues.webp` | `images.antesDespues` en `content/guias/marketing/crear-afiches-con-ia/data.ts` (sección «resultado-final») |
| E048 | `brief-de-diseno.webp` | `public/images/guias/marketing/crear-afiches-con-ia/brief-de-diseno.webp` | `images.brief` en `content/guias/marketing/crear-afiches-con-ia/data.ts` (sección «adaptacion») |
| E049 | `prueba-de-distancia.webp` | `public/images/guias/marketing/crear-afiches-con-ia/prueba-de-distancia.webp` | `images.distancia` en `content/guias/marketing/crear-afiches-con-ia/data.ts` (sección «verificacion») |
| E050 | `ficha-completa.webp` | `public/images/guias/marketing/crear-anuncios-con-ia/ficha-completa.webp` | `images.ficha` en `content/guias/marketing/crear-anuncios-con-ia/data.ts` (sección «datos») |
| E051 | `dos-enfoques.webp` | `public/images/guias/marketing/crear-anuncios-con-ia/dos-enfoques.webp` | `images.dosEnfoques` en `content/guias/marketing/crear-anuncios-con-ia/data.ts` (sección «primer-resultado») |
| E052 | `rubrica-aplicada.webp` | `public/images/guias/marketing/crear-anuncios-con-ia/rubrica-aplicada.webp` | `images.rubrica` en `content/guias/marketing/crear-anuncios-con-ia/data.ts` (sección «analisis») |
| E053 | `persuasion-con-respaldo.webp` | `public/images/guias/marketing/crear-anuncios-con-ia/persuasion-con-respaldo.webp` | `images.persuasion` en `content/guias/marketing/crear-anuncios-con-ia/data.ts` (sección «iteracion») |
| E054 | `canales.webp` | `public/images/guias/marketing/crear-anuncios-con-ia/canales.webp` | `images.canales` en `content/guias/marketing/crear-anuncios-con-ia/data.ts` (sección «adaptacion») |
| E055 | `hoja-de-afirmaciones.webp` | `public/images/guias/marketing/crear-anuncios-con-ia/hoja-de-afirmaciones.webp` | `images.afirmaciones` en `content/guias/marketing/crear-anuncios-con-ia/data.ts` (sección «verificacion») |
| E056 | `datos-necesarios.webp` | `public/images/guias/marketing/crear-campanas-promocionales-con-ia/datos-necesarios.webp` | `images.datos` en `content/guias/marketing/crear-campanas-promocionales-con-ia/data.ts` (sección «datos») |
| E057 | `ficha-de-campana.webp` | `public/images/guias/marketing/crear-campanas-promocionales-con-ia/ficha-de-campana.webp` | `images.ficha` en `content/guias/marketing/crear-campanas-promocionales-con-ia/data.ts` (sección «entrevista») |
| E058 | `piezas-iniciales.webp` | `public/images/guias/marketing/crear-campanas-promocionales-con-ia/piezas-iniciales.webp` | `images.primerResultado` en `content/guias/marketing/crear-campanas-promocionales-con-ia/data.ts` (sección «primer-resultado») |
| E059 | `matriz-de-coherencia.webp` | `public/images/guias/marketing/crear-campanas-promocionales-con-ia/matriz-de-coherencia.webp` | `images.matriz` en `content/guias/marketing/crear-campanas-promocionales-con-ia/data.ts` (sección «analisis») |
| E060 | `matriz-final.webp` | `public/images/guias/marketing/crear-campanas-promocionales-con-ia/matriz-final.webp` | `images.final` en `content/guias/marketing/crear-campanas-promocionales-con-ia/data.ts` (sección «resultado-final») |
| E061 | `plan-de-medicion.webp` | `public/images/guias/marketing/crear-campanas-promocionales-con-ia/plan-de-medicion.webp` | `images.medicion` en `content/guias/marketing/crear-campanas-promocionales-con-ia/data.ts` (sección «medicion») |
| E062 | `datos-necesarios.webp` | `public/images/guias/marketing/crear-promociones-con-ia/datos-necesarios.webp` | `images.datos` en `content/guias/marketing/crear-promociones-con-ia/data.ts` (sección «datos») |
| E063 | `calculadora-de-promociones.webp` | `public/images/guias/marketing/crear-promociones-con-ia/calculadora-de-promociones.webp` | `images.hoja` en `content/guias/marketing/crear-promociones-con-ia/data.ts` (sección «hoja») |
| E064 | `cuatro-promociones.webp` | `public/images/guias/marketing/crear-promociones-con-ia/cuatro-promociones.webp` | `images.alternativas` en `content/guias/marketing/crear-promociones-con-ia/data.ts` (sección «primer-resultado») |
| E065 | `cuentas-de-la-ia-y-mi-hoja.webp` | `public/images/guias/marketing/crear-promociones-con-ia/cuentas-de-la-ia-y-mi-hoja.webp` | `images.cuentas` en `content/guias/marketing/crear-promociones-con-ia/data.ts` (sección «analisis») |
| E066 | `decision-con-tus-cifras.webp` | `public/images/guias/marketing/crear-promociones-con-ia/decision-con-tus-cifras.webp` | `images.decision` en `content/guias/marketing/crear-promociones-con-ia/data.ts` (sección «resultado-final») |
| E067 | `brief-completo.webp` | `public/images/guias/marketing/crear-publicaciones-para-redes-sociales-con-ia/brief-completo.webp` | `images.brief` en `content/guias/marketing/crear-publicaciones-para-redes-sociales-con-ia/data.ts` (sección «datos») |
| E068 | `tres-opciones.webp` | `public/images/guias/marketing/crear-publicaciones-para-redes-sociales-con-ia/tres-opciones.webp` | `images.tresOpciones` en `content/guias/marketing/crear-publicaciones-para-redes-sociales-con-ia/data.ts` (sección «primer-resultado») |
| E069 | `rubrica-aplicada.webp` | `public/images/guias/marketing/crear-publicaciones-para-redes-sociales-con-ia/rubrica-aplicada.webp` | `images.rubrica` en `content/guias/marketing/crear-publicaciones-para-redes-sociales-con-ia/data.ts` (sección «analisis») |
| E070 | `ajuste-de-tono.webp` | `public/images/guias/marketing/crear-publicaciones-para-redes-sociales-con-ia/ajuste-de-tono.webp` | `images.tono` en `content/guias/marketing/crear-publicaciones-para-redes-sociales-con-ia/data.ts` (sección «iteracion») |
| E071 | `versiones-por-formato.webp` | `public/images/guias/marketing/crear-publicaciones-para-redes-sociales-con-ia/versiones-por-formato.webp` | `images.formatos` en `content/guias/marketing/crear-publicaciones-para-redes-sociales-con-ia/data.ts` (sección «adaptacion») |
| E072 | `antes-despues.webp` | `public/images/guias/marketing/crear-publicaciones-para-redes-sociales-con-ia/antes-despues.webp` | `images.antesDespues` en `content/guias/marketing/crear-publicaciones-para-redes-sociales-con-ia/data.ts` (sección «antes-despues») |
| E073 | `datos-necesarios.webp` | `public/images/guias/marketing/ideas-de-contenido-para-tu-negocio-con-ia/datos-necesarios.webp` | `images.datos` en `content/guias/marketing/ideas-de-contenido-para-tu-negocio-con-ia/data.ts` (sección «datos») |
| E074 | `primer-resultado.webp` | `public/images/guias/marketing/ideas-de-contenido-para-tu-negocio-con-ia/primer-resultado.webp` | `images.primerResultado` en `content/guias/marketing/ideas-de-contenido-para-tu-negocio-con-ia/data.ts` (sección «primer-resultado») |
| E075 | `rubrica.webp` | `public/images/guias/marketing/ideas-de-contenido-para-tu-negocio-con-ia/rubrica.webp` | `images.rubrica` en `content/guias/marketing/ideas-de-contenido-para-tu-negocio-con-ia/data.ts` (sección «analisis») |
| E076 | `banco-de-ideas.webp` | `public/images/guias/marketing/ideas-de-contenido-para-tu-negocio-con-ia/banco-de-ideas.webp` | `images.banco` en `content/guias/marketing/ideas-de-contenido-para-tu-negocio-con-ia/data.ts` (sección «resultado-final») |
| E077 | `notas-del-recorrido.webp` | `public/images/guias/negocio/documentar-procesos-con-ia/notas-del-recorrido.webp` | `images.recorrido` en `content/guias/negocio/documentar-procesos-con-ia/data.ts` (sección «datos») |
| E078 | `primer-procedimiento.webp` | `public/images/guias/negocio/documentar-procesos-con-ia/primer-procedimiento.webp` | `images.primerResultado` en `content/guias/negocio/documentar-procesos-con-ia/data.ts` (sección «primer-resultado») |
| E079 | `contraste-con-tus-respuestas.webp` | `public/images/guias/negocio/documentar-procesos-con-ia/contraste-con-tus-respuestas.webp` | `images.contraste` en `content/guias/negocio/documentar-procesos-con-ia/data.ts` (sección «analisis») |
| E080 | `version-para-quien-empieza.webp` | `public/images/guias/negocio/documentar-procesos-con-ia/version-para-quien-empieza.webp` | `images.checklist` en `content/guias/negocio/documentar-procesos-con-ia/data.ts` (sección «adaptacion») |
| E081 | `registro-de-la-prueba.webp` | `public/images/guias/negocio/documentar-procesos-con-ia/registro-de-la-prueba.webp` | `images.registro` en `content/guias/negocio/documentar-procesos-con-ia/data.ts` (sección «medicion») |
| E082 | `lista-de-pendientes.webp` | `public/images/guias/negocio/organizar-tareas-del-negocio-con-ia/lista-de-pendientes.webp` | `images.lista` en `content/guias/negocio/organizar-tareas-del-negocio-con-ia/data.ts` (sección «datos») |
| E083 | `hoja-con-prioridad.webp` | `public/images/guias/negocio/organizar-tareas-del-negocio-con-ia/hoja-con-prioridad.webp` | `images.hoja` en `content/guias/negocio/organizar-tareas-del-negocio-con-ia/data.ts` (sección «hoja») |
| E084 | `primera-tabla.webp` | `public/images/guias/negocio/organizar-tareas-del-negocio-con-ia/primera-tabla.webp` | `images.primerResultado` en `content/guias/negocio/organizar-tareas-del-negocio-con-ia/data.ts` (sección «primer-resultado») |
| E085 | `contraste-con-la-lista.webp` | `public/images/guias/negocio/organizar-tareas-del-negocio-con-ia/contraste-con-la-lista.webp` | `images.contraste` en `content/guias/negocio/organizar-tareas-del-negocio-con-ia/data.ts` (sección «analisis») |
| E086 | `plan-de-la-semana.webp` | `public/images/guias/negocio/organizar-tareas-del-negocio-con-ia/plan-de-la-semana.webp` | `images.plan` en `content/guias/negocio/organizar-tareas-del-negocio-con-ia/data.ts` (sección «adaptacion») |
| E087 | `ficha-de-contexto.webp` | `public/images/guias/negocio/sistema-diario-de-trabajo-con-ia/ficha-de-contexto.webp` | `images.ficha` en `content/guias/negocio/sistema-diario-de-trabajo-con-ia/data.ts` (sección «entrevista») |
| E088 | `apertura-primera-version.webp` | `public/images/guias/negocio/sistema-diario-de-trabajo-con-ia/apertura-primera-version.webp` | `images.primerResultado` en `content/guias/negocio/sistema-diario-de-trabajo-con-ia/data.ts` (sección «primer-resultado») |
| E089 | `contraste-con-la-nota.webp` | `public/images/guias/negocio/sistema-diario-de-trabajo-con-ia/contraste-con-la-nota.webp` | `images.contraste` en `content/guias/negocio/sistema-diario-de-trabajo-con-ia/data.ts` (sección «analisis») |
| E090 | `nota-de-traspaso.webp` | `public/images/guias/negocio/sistema-diario-de-trabajo-con-ia/nota-de-traspaso.webp` | `images.traspaso` en `content/guias/negocio/sistema-diario-de-trabajo-con-ia/data.ts` (sección «adaptacion») |
| E091 | `un-dia-de-la-tienda.webp` | `public/images/guias/negocio/sistema-diario-de-trabajo-con-ia/un-dia-de-la-tienda.webp` | `images.dia` en `content/guias/negocio/sistema-diario-de-trabajo-con-ia/data.ts` (sección «comparativa») |
| E092 | `datos-necesarios.webp` | `public/images/guias/ventas/crear-cotizaciones-y-propuestas-con-ia/datos-necesarios.webp` | `images.datos` en `content/guias/ventas/crear-cotizaciones-y-propuestas-con-ia/data.ts` (sección «datos») |
| E093 | `calculadora-de-cotizacion.webp` | `public/images/guias/ventas/crear-cotizaciones-y-propuestas-con-ia/calculadora-de-cotizacion.webp` | `images.hoja` en `content/guias/ventas/crear-cotizaciones-y-propuestas-con-ia/data.ts` (sección «hoja») |
| E094 | `borrador-de-cotizacion.webp` | `public/images/guias/ventas/crear-cotizaciones-y-propuestas-con-ia/borrador-de-cotizacion.webp` | `images.primerResultado` en `content/guias/ventas/crear-cotizaciones-y-propuestas-con-ia/data.ts` (sección «primer-resultado») |
| E095 | `revision-de-cifras.webp` | `public/images/guias/ventas/crear-cotizaciones-y-propuestas-con-ia/revision-de-cifras.webp` | `images.revision` en `content/guias/ventas/crear-cotizaciones-y-propuestas-con-ia/data.ts` (sección «analisis») |
| E096 | `cotizacion-final.webp` | `public/images/guias/ventas/crear-cotizaciones-y-propuestas-con-ia/cotizacion-final.webp` | `images.final` en `content/guias/ventas/crear-cotizaciones-y-propuestas-con-ia/data.ts` (sección «resultado-final») |
| E097 | `datos-necesarios.webp` | `public/images/guias/ventas/crear-descripciones-de-productos-con-ia/datos-necesarios.webp` | `images.datos` en `content/guias/ventas/crear-descripciones-de-productos-con-ia/data.ts` (sección «datos») |
| E098 | `ficha-de-producto.webp` | `public/images/guias/ventas/crear-descripciones-de-productos-con-ia/ficha-de-producto.webp` | `images.ficha` en `content/guias/ventas/crear-descripciones-de-productos-con-ia/data.ts` (sección «entrevista») |
| E099 | `borrador-inicial.webp` | `public/images/guias/ventas/crear-descripciones-de-productos-con-ia/borrador-inicial.webp` | `images.primerResultado` en `content/guias/ventas/crear-descripciones-de-productos-con-ia/data.ts` (sección «primer-resultado») |
| E100 | `auditoria-de-frases.webp` | `public/images/guias/ventas/crear-descripciones-de-productos-con-ia/auditoria-de-frases.webp` | `images.auditoria` en `content/guias/ventas/crear-descripciones-de-productos-con-ia/data.ts` (sección «analisis») |
| E101 | `descripcion-final.webp` | `public/images/guias/ventas/crear-descripciones-de-productos-con-ia/descripcion-final.webp` | `images.final` en `content/guias/ventas/crear-descripciones-de-productos-con-ia/data.ts` (sección «resultado-final») |
| E102 | `datos-necesarios.webp` | `public/images/guias/ventas/definir-precios-y-margenes-con-ia/datos-necesarios.webp` | `images.datos` en `content/guias/ventas/definir-precios-y-margenes-con-ia/data.ts` (sección «datos») |
| E103 | `calculadora-de-precio.webp` | `public/images/guias/ventas/definir-precios-y-margenes-con-ia/calculadora-de-precio.webp` | `images.hoja` en `content/guias/ventas/definir-precios-y-margenes-con-ia/data.ts` (sección «hoja») |
| E104 | `lectura-inicial.webp` | `public/images/guias/ventas/definir-precios-y-margenes-con-ia/lectura-inicial.webp` | `images.primerResultado` en `content/guias/ventas/definir-precios-y-margenes-con-ia/data.ts` (sección «primer-resultado») |
| E105 | `contraste-con-la-hoja.webp` | `public/images/guias/ventas/definir-precios-y-margenes-con-ia/contraste-con-la-hoja.webp` | `images.contraste` en `content/guias/ventas/definir-precios-y-margenes-con-ia/data.ts` (sección «analisis») |
| E106 | `tabla-de-escenarios.webp` | `public/images/guias/ventas/definir-precios-y-margenes-con-ia/tabla-de-escenarios.webp` | `images.escenarios` en `content/guias/ventas/definir-precios-y-margenes-con-ia/data.ts` (sección «adaptacion») |

## No incluidas (las hace el autor)

Las 90 imágenes `prueba-prompt-01…05.webp` de las guías (4 o 5 por guía, cada una con su `promptId`) son capturas reales de una prueba del prompt en un asistente, con la fecha y la herramienta. Se quedan como espacios vacíos hasta que las hagas; el componente «Prueba real» solo aparece cuando existen.
