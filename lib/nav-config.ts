export interface NavLink {
  label: string;
  href: string;
  description?: string;
}

export const primaryNav: NavLink[] = [
  { label: "Herramientas IA", href: "/herramientas-ia", description: "Directorio de herramientas de inteligencia artificial" },
  { label: "Prompts", href: "/prompts", description: "Biblioteca de prompts listos para usar" },
  { label: "Comparativas", href: "/comparativas", description: "Comparativas entre herramientas de IA" },
  { label: "Noticias", href: "/noticias", description: "Actualidad del sector de la IA" },
  { label: "Tutoriales", href: "/tutoriales", description: "Aprende a usar IA paso a paso" },
  { label: "Guías", href: "/guias", description: "Guías completas sobre inteligencia artificial" },
];

export const footerNav: { title: string; links: NavLink[] }[] = [
  {
    title: "Contenido",
    links: [
      { label: "Herramientas IA", href: "/herramientas-ia" },
      { label: "Alternativas", href: "/alternativas" },
      { label: "Prompts", href: "/prompts" },
      { label: "Comparativas", href: "/comparativas" },
      { label: "Noticias", href: "/noticias" },
      { label: "Tutoriales", href: "/tutoriales" },
      { label: "Guías", href: "/guias" },
    ],
  },
  {
    title: "Compañía",
    links: [
      { label: "Sobre nosotros", href: "/sobre-nosotros" },
      { label: "Autores", href: "/autores" },
      { label: "Política editorial", href: "/politica-editorial" },
      { label: "Preguntas frecuentes", href: "/faq" },
      { label: "Contacto", href: "/contacto" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacidad", href: "/privacidad" },
      { label: "Cookies", href: "/cookies" },
      { label: "Términos y condiciones", href: "/terminos-y-condiciones" },
      { label: "Aviso de afiliados", href: "/aviso-afiliados" },
      { label: "Créditos de imágenes", href: "/creditos-de-imagenes" },
      { label: "Mapa del sitio", href: "/mapa-del-sitio" },
    ],
  },
];
