/**
 * Cuenta palabras. Es la ÚNICA función de conteo del sitio: la usan el validador (palabras editoriales de cada página) y las
 * herramientas que limitan el texto (por ejemplo, los afiches). La cuenta la hace la página, no la IA (estándar 9).
 *
 * Qué cuenta como palabra: cada trozo de texto separado por espacios (o saltos de línea) que contiene al menos una letra o un
 * número de cualquier idioma. Por eso:
 *  - «$6» cuenta 1 (tiene un número), «7:00» cuenta 1, «13:00» cuenta 1, «2» cuenta 1, «1.500» cuenta 1;
 *  - «Av.» cuenta 1 y «pan-dulce» cuenta 1 (el guion no separa palabras);
 *  - «·», «—», «-», «&» o «…» solos NO cuentan (no tienen letras ni números);
 *  - «7 : 00» cuenta 2 (dos números; los dos puntos solos no cuentan);
 *  - «Combo:» cuenta 1 (la puntuación pegada a una palabra no la separa).
 * Un texto vacío o solo de espacios cuenta 0. Acepta un texto o una lista de textos (se cuentan como si fueran uno solo).
 */
export function contarPalabras(textos: string | readonly string[]): number {
  const texto = typeof textos === "string" ? textos : textos.join(" ");
  return texto.split(/\s+/).filter((trozo) => /[\p{L}\p{N}]/u.test(trozo)).length;
}
