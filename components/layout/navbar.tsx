import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { MenuMovil } from "@/components/layout/menu-movil";
import { primaryNav } from "@/lib/nav-config";
import { siteName } from "@/lib/site";
import { RUTA_CV } from "@/content/prompts";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-h-11 items-center gap-2.5 font-semibold tracking-tight" aria-label={`${siteName}: inicio`}>
          <Image src="/logo.png" alt="" width={32} height={32} className="size-8 rounded-lg" priority />
          <span className="text-lg">{siteName}</span>
        </Link>

        <nav aria-label="Principal" className="ml-6 hidden items-center gap-1 lg:flex">
          {primaryNav.map((l) => (
            <Link key={l.href} href={l.href} className="flex min-h-11 items-center rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <Link href={RUTA_CV} className="btn btn-primario hidden sm:inline-flex">
            Crear mi CV gratis
          </Link>
          <ThemeToggle />
          <MenuMovil links={primaryNav} />
        </div>
      </div>
    </header>
  );
}
