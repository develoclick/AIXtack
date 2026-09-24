"""
Genera la og:image propia (1200×630, .webp) de cada herramienta: gráfico con el H1 de la página, el área y la marca sobre el
color de marca. NO usa capturas ni imita chats. Lo llama `npm run og` (scripts/generar-og.ts) pasando los datos por stdin (JSON).

Fuentes: Segoe UI / Arial en Windows; DejaVu Sans como respaldo. Requiere Pillow.
"""
import io
import json
import os
import sys

from PIL import Image, ImageDraw, ImageFont

RAIZ = os.getcwd()
W, H = 1200, 630
MARCA = (0, 164, 139)  # verde de la marca (el del logotipo)
BLANCO = (255, 255, 255)
TINTA = (10, 60, 52)  # verde muy oscuro para el texto del panel


def fuente(negrita: bool, tam: int):
    candidatos = (
        ["segoeuib.ttf", "arialbd.ttf", "DejaVuSans-Bold.ttf"] if negrita else ["segoeui.ttf", "arial.ttf", "DejaVuSans.ttf"]
    )
    for nombre in candidatos:
        for base in (r"C:\Windows\Fonts", "/usr/share/fonts/truetype/dejavu", "/Library/Fonts"):
            ruta = os.path.join(base, nombre)
            if os.path.exists(ruta):
                return ImageFont.truetype(ruta, tam)
    return ImageFont.load_default()


def envolver(dibujo, texto, f, ancho_max):
    lineas, actual = [], ""
    for palabra in texto.split():
        prueba = (actual + " " + palabra).strip()
        if dibujo.textlength(prueba, font=f) <= ancho_max:
            actual = prueba
        else:
            lineas.append(actual)
            actual = palabra
    if actual:
        lineas.append(actual)
    return lineas


def crear(item):
    img = Image.new("RGB", (W, H), MARCA)
    d = ImageDraw.Draw(img)

    # etiqueta del área
    area = item["area"].upper()
    f_area = fuente(True, 30)
    ancho_area = d.textlength(area, font=f_area)
    d.rounded_rectangle((70, 60, 70 + ancho_area + 48, 60 + 56), radius=28, fill=BLANCO)
    d.text((70 + 24, 60 + 8), area, font=f_area, fill=TINTA)

    # H1: se reduce la letra hasta que quepa en 3 líneas (sin chocar con el panel del logotipo)
    tam = 74
    while True:
        f = fuente(True, tam)
        lineas = envolver(d, item["titulo"], f, W - 140)
        if len(lineas) <= 3 or tam <= 40:
            break
        tam -= 4
    y = 160
    for linea in lineas:
        d.text((70, y), linea, font=f, fill=BLANCO)
        y += int(tam * 1.18)

    # panel inferior con el logotipo y el nombre del sitio
    logo = Image.open(os.path.join(RAIZ, "public", "images", "site", "logo-claro.png")).convert("RGBA")
    alto_logo = 62
    logo = logo.resize((round(logo.width * alto_logo / logo.height), alto_logo), Image.LANCZOS)
    panel_w = logo.width + 56
    d.rounded_rectangle((70, H - 70 - 92, 70 + panel_w, H - 70), radius=24, fill=BLANCO)
    img.paste(logo, (70 + 28, H - 70 - 92 + (92 - alto_logo) // 2), logo)
    f_sitio = fuente(False, 28)
    d.text((70 + panel_w + 28, H - 70 - 46 - 16), item["sitio"], font=f_sitio, fill=BLANCO)

    destino = os.path.join(RAIZ, "public", "img", item["area_id"], item["slug"])
    os.makedirs(destino, exist_ok=True)
    img.save(os.path.join(destino, "og.webp"), "WEBP", quality=88, method=6)
    return os.path.join(item["area_id"], item["slug"], "og.webp")


if __name__ == "__main__":
    datos = json.load(io.TextIOWrapper(sys.stdin.buffer, encoding="utf-8"))  # UTF-8 también en Windows
    for it in datos:
        print("ok", crear(it))
