import authorsJson from "@/content/authors.json";
import postsJson from "@/content/posts.json";
import type { AuthorProfile } from "@/lib/types";

interface AuthorRaw {
  id: string;
  name: string | null;
  image: string | null;
  bio: string | null;
  role: "ADMIN" | "EDITOR";
}

const authors = authorsJson as AuthorRaw[];
const posts = postsJson as { authorId: string }[];

export async function listAuthors(): Promise<AuthorProfile[]> {
  return authors
    .filter((author) => author.bio)
    .map((author) => ({
      ...author,
      publishedPostCount: posts.filter((post) => post.authorId === author.id).length,
    }));
}
