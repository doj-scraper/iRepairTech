import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold ring-offset-background transition-[transform,background-color,border-color,color,box-shadow,opacity] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.985] [&_svg]:pointer-events-none [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "gradient-primary px-1 text-primary-foreground shadow-elegant hover:-translate-y-0.5 hover:shadow-glow",
        destructive: "bg-destructive text-destructive-foreground shadow-soft hover:bg-destructive/92 hover:-translate-y-0.5",
        outline:
          "border border-border/80 bg-background/90 text-foreground shadow-soft hover:border-accent/40 hover:bg-secondary/70 hover:text-primary",
        secondary: "bg-secondary text-secondary-foreground shadow-soft hover:bg-secondary/80 hover:-translate-y-0.5",
        ghost: "text-foreground hover:bg-secondary/75 hover:text-primary",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm: "h-9 px-3.5 text-xs",
        lg: "h-12 px-6 text-sm md:px-7 md:text-base",
        icon: "h-11 w-11 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp 
        className={cn(buttonVariants({ variant, size, className }))} 
        ref={ref} 
        disabled={asChild ? undefined : disabled || loading} 
        {...props}
      >
        {asChild ? children : (
          <>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {children}
          </>
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
