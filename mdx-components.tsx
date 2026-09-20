import type { MDXComponents } from "mdx/types";
import { AudienceSection } from "@/components/guide/audience-section";
import { FrameworkSection } from "@/components/guide/framework-section";
import { GlossarySection, Term } from "@/components/guide/glossary";
import { PromptBuilder } from "@/components/guide/prompt-builder";
import { QuickFacts } from "@/components/guide/quick-facts";
import { Rubric } from "@/components/guide/rubric";
import { BeforeAfter } from "@/components/guide/before-after";
import { EvidenceBlock } from "@/components/guide/evidence-block";
import { SourcesSection } from "@/components/guide/sources-section";
import { BeforeSection } from "@/components/guide/before-section";
import { Callout, WarningBox } from "@/components/guide/callout";
import { CaseStudy } from "@/components/guide/case-study";
import { ComparisonTable, ToolComparison } from "@/components/guide/comparison-table";
import { DataPreparation, ToolsSection } from "@/components/guide/data-preparation";
import { ExamplesSection } from "@/components/guide/examples-section";
import { GuideAdSlot } from "@/components/guide/guide-ad-slot";
import { GuideSection } from "@/components/guide/guide-section";
import { FAQ, HumanVerification, InteractiveChecklist } from "@/components/guide/checklists";
import { GuideImage } from "@/components/guide/guide-image";
import { ImageBlock } from "@/components/guide/image-block";
import { OutcomeSection, ProblemSection } from "@/components/guide/problem-section";
import { ApplicationSteps, CommonMistakes, Conclusion, Limitations, Personalization, Variations } from "@/components/guide/practice-sections";
import { PromptBlock } from "@/components/guide/prompt-block";
import { PromptCard } from "@/components/guide/prompt-card";
import { PromptExplanation } from "@/components/guide/prompt-explanation";
import { IterationBlock, ResultAnalysis, ResultBlock } from "@/components/guide/result-block";
import { StepSection } from "@/components/guide/step-section";
import { VideoSection } from "@/components/guide/video-section";

/**
 * Componentes disponibles dentro de cualquier guía guide.mdx sin importarlos. Todos son
 * genéricos: reciben los datos de la guía (`data.<seccion>`) y no contienen contenido propio.
 * La cabecera, el índice, las guías relacionadas y anterior/siguiente los pone la página.
 */
const components: MDXComponents = {
  GuideSection,
  ProblemSection,
  OutcomeSection,
  AudienceSection,
  QuickFacts,
  FrameworkSection,
  Rubric,
  PromptBuilder,
  Term,
  GlossarySection,
  CaseStudy,
  BeforeSection,
  DataPreparation,
  ToolsSection,
  StepSection,
  PromptBlock,
  PromptCard,
  PromptExplanation,
  ResultBlock,
  ResultAnalysis,
  IterationBlock,
  BeforeAfter,
  ExamplesSection,
  ComparisonTable,
  ToolComparison,
  CommonMistakes,
  Personalization,
  HumanVerification,
  ApplicationSteps,
  InteractiveChecklist,
  Variations,
  Limitations,
  Conclusion,
  FAQ,
  SourcesSection,
  EvidenceBlock,
  VideoSection,
  ImageBlock,
  GuideImage,
  Callout,
  WarningBox,
  GuideAdSlot,
};

export function useMDXComponents(): MDXComponents {
  return components;
}
