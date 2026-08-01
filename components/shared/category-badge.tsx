import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { TaxonomyRef } from "@/lib/types";

export function CategoryBadge({ category, prefix = "/categoria" }: { category: TaxonomyRef; prefix?: string }) {
  return (
    <Link href={`${prefix}/${category.slug}`}>
      <Badge variant="outline" className="hover:border-brand/60 hover:text-brand">
        {category.name}
      </Badge>
    </Link>
  );
}
