import { ExternalLink } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export function AffiliateCta({
  affiliateSlug,
  websiteUrl,
  label = "Visitar sitio web",
}: {
  affiliateSlug: string | null;
  websiteUrl: string;
  label?: string;
}) {
  const href = affiliateSlug ? `/go/${affiliateSlug}` : websiteUrl;

  return (
    <a
      href={href}
      target="_blank"
      rel={affiliateSlug ? "sponsored nofollow noopener" : "noopener"}
      className={buttonVariants({ size: "lg", className: "gap-2" })}
    >
      {label}
      <ExternalLink className="size-4" />
    </a>
  );
}
