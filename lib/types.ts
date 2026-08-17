/**
 * Tipos compartidos por toda la capa de contenido y los componentes.
 * El contenido en content/*.json se tipa contra estas interfaces al
 * cargarse en lib/content/*.ts.
 */

export type ContentStatus = "DRAFT" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED";

export type PostType =
  | "ARTICLE"
  | "NEWS"
  | "TUTORIAL"
  | "GUIDE"
  | "REVIEW"
  | "COMPARISON";

export type PricingModel = "FREE" | "FREEMIUM" | "PAID" | "SUBSCRIPTION";

export interface TaxonomyRef {
  id: string;
  slug: string;
  name: string;
}

export interface Author {
  id: string;
  name: string | null;
  image: string | null;
  bio: string | null;
}

export interface AuthorProfile extends Author {
  role: "ADMIN" | "EDITOR";
  publishedPostCount: number;
}

export interface InlineFaqEntry {
  question: string;
  answer: string;
}

/** Atribución obligatoria para fotos hotlinked desde Unsplash. */
export interface ImageCredit {
  photographerName: string;
  photographerUrl: string;
  photoPageUrl: string;
}

export interface CategorySummary extends TaxonomyRef {
  description: string | null;
  icon: string | null;
  parentId: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string[];
  faqItems: InlineFaqEntry[];
  conclusion: string | null;
}

export interface PostSummary {
  id: string;
  slug: string;
  type: PostType;
  title: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  coverImageAlt: string | null;
  coverImageCredit: ImageCredit | null;
  author: Author;
  categories: TaxonomyRef[];
  tags: TaxonomyRef[];
  featured: boolean;
  readingTimeMin: number | null;
  publishedAt: Date | null;
  updatedAt?: string | Date | null;
}

export interface PostDetail extends PostSummary {
  content: string;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string[];
  canonicalUrl: string | null;
  ogImage: string | null;
  faqItems: InlineFaqEntry[];
  viewCount: number;
}

export interface ToolSummary {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  logoUrl: string | null;
  logoCredit: ImageCredit | null;
  pricingModel: PricingModel;
  pricingFrom: number | null;
  currency: string;
  rating: number;
  reviewCount: number;
  category: TaxonomyRef | null;
  tags: TaxonomyRef[];
}

export interface ToolDetail extends ToolSummary {
  description: string;
  websiteUrl: string;
  features: string[];
  pros: string[];
  cons: string[];
  screenshots: string[];
  affiliateSlug: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string[];
  ogImage: string | null;
  faqItems: InlineFaqEntry[];
  conclusion: string | null;
}

export interface PromptSummary {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  useCase: string | null;
  isPremium: boolean;
  targetModels: string[];
  category: TaxonomyRef | null;
  tags: TaxonomyRef[];
}

export interface PromptDetail extends PromptSummary {
  content: string;
  article: string | null;
  copyCount: number;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string[];
  ogImage: string | null;
  faqItems: InlineFaqEntry[];
  conclusion: string | null;
}

export interface FaqEntry {
  id: string;
  question: string;
  answer: string;
  category: string | null;
}

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface SearchResultItem {
  kind: "post" | "tool" | "prompt";
  slug: string;
  title: string;
  excerpt: string | null;
  href: string;
}

export type NewsletterSource = "footer" | "post-cta" | "home" | "other";

export interface ProfessionSummary {
  id: string;
  slug: string;
  name: string;
  icon: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  promptCount: number;
}

export interface ProfessionPrompt {
  id: string;
  professionSlug: string;
  title: string;
  description: string;
  content: string;
  article: string | null;
  tools: string[];
  category: string;
  difficulty: string;
  premium: boolean;
}
