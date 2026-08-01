import { PostCard } from "@/components/content/post-card";
import { EmptyState } from "@/components/shared/empty-state";
import type { PostSummary } from "@/lib/types";

export function PostGrid({ posts }: { posts: PostSummary[] }) {
  if (posts.length === 0) {
    return <EmptyState title="Todavía no hay publicaciones" description="Vuelve pronto para ver contenido nuevo." />;
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7">
      {posts.map((post, index) => (
        <PostCard key={post.id} post={post} priority={index < 3} />
      ))}
    </div>
  );
}
