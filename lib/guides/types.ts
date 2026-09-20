import type { ComponentType } from "react";
import type { CategorySlug } from "../../content/categorias";
import type { Difficulty, GuideData, GuideStatus } from "./model";

export interface GuideSectionInfo {
  /** Identificador de la sección (SectionId) y ancla de la página. */
  id: string;
  /** Título propio de la guía para esta sección. */
  title: string;
  /** Etiqueta corta del catálogo (índice de contenidos). */
  label: string;
  /** Parte del índice: si alguna sección la declara, el índice muestra partes y no secciones sueltas. */
  part?: string;
}

export interface GuideSummary {
  slug: string;
  category: CategorySlug;
  title: string;
  description: string;
  status: GuideStatus;
  publishedAt: string | null;
  updatedAt: string;
  readingMinutes: number;
  difficulty: Difficulty;
}

export interface Guide extends GuideSummary {
  data: GuideData;
  sections: GuideSectionInfo[];
  wordCount: number;
  Content: ComponentType;
}
