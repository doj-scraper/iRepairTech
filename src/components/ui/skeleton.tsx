import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-sheen rounded-[1.25rem] bg-[linear-gradient(110deg,rgba(233,228,219,0.92),rgba(247,244,238,0.96),rgba(233,228,219,0.92))] bg-[length:200%_100%]",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
