import type { ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Botón nativo con las clases del sistema de diseño (app/globals.css): 44 px de alto como mínimo, foco visible y estados
 * hover, active y disabled. Sin librerías de componentes: no añade JavaScript a la carga.
 */
const buttonVariants = cva("btn", {
  variants: {
    variant: {
      default: "btn-primario",
      outline: "btn-secundario",
      ghost: "btn-fantasma",
    },
    size: {
      default: "",
      icon: "size-11 !p-0",
    },
  },
  defaultVariants: { variant: "default", size: "default" },
});

function Button({ className, variant, size, type = "button", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>) {
  return <button type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

export { Button, buttonVariants };
