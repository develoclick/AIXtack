import faqJson from "@/content/faq.json";
import type { FaqEntry } from "@/lib/types";

const faq = faqJson as FaqEntry[];

export async function listFaq(): Promise<FaqEntry[]> {
  return faq;
}
