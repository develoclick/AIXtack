import { categories } from "@/content/categorias";

export interface NavLink {
  label: string;
  href: string;
}

/** Navegación principal: cabecera y menú móvil. */
export const primaryNav: NavLink[] = [
  { label: "Inicio", href: "/" },
  { label: "Guías", href: "/guias" },
  ...categories.map((category) => ({ label: category.name, href: `/${category.slug}` })),
  { label: "Sobre el sitio", href: "/sobre-nosotros" },
];

/** Pie de página: guías por área, el sitio y las páginas legales. */
export const footerNav: { title: string; links: NavLink[] }[] = [
  {
    title: "Guías por área",
    links: [
      ...categories.map((category) => ({ label: category.name, href: `/${category.slug}` })),
      { label: "Todas las guías", href: "/guias" },
    ],
  },
  {
    title: "El sitio",
    links: [
      { label: "Sobre nosotros", href: "/sobre-nosotros" },
      { label: "Contacto", href: "/contacto" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Política de privacidad", href: "/politica-de-privacidad" },
      { label: "Política de cookies", href: "/politica-de-cookies" },
      { label: "Términos y condiciones", href: "/terminos-y-condiciones" },
    ],
  },
];
