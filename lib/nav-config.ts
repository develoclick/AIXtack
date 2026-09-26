import { categoriasDisponibles } from "@/content/categorias";

export interface NavLink {
  label: string;
  href: string;
}

/** Navegación principal de la cabecera. */
export const primaryNav: NavLink[] = [
  { label: "Categorías", href: "/#categorias" },
  ...categoriasDisponibles.map((c) => ({ label: c.nombre, href: `/${c.slug}` })),
  { label: "Sobre el sitio", href: "/sobre-nosotros" },
];

/** Pie de página: categorías abiertas, el sitio y las páginas legales. */
export const footerNav: { title: string; links: NavLink[] }[] = [
  {
    title: "Prompts",
    links: categoriasDisponibles.map((c) => ({ label: c.nombre, href: `/${c.slug}` })),
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
