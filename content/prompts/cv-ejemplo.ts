import { EJEMPLOS_CV } from "@/content/ejemplos/cv-harvard";

/**
 * EJEMPLO ILUSTRATIVO que se muestra en la guía de la página (persona, empresas y cifras ficticias, escritos por el autor del
 * sitio: no es la salida de ninguna IA ni un caso real). Es el perfil semi senior de content/ejemplos/cv-harvard.ts.
 */
export const CV_EJEMPLO_RESPUESTA = EJEMPLOS_CV.find((e) => e.id === "semi-senior-marketing")!.respuesta;
