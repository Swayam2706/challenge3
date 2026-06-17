import { cn } from "@/lib/cn";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: keyof JSX.IntrinsicElements;
}

/** A surface container with consistent radius, border, and shadow. */
export function Card({ className, as: Tag = "div", ...props }: CardProps) {
  const Component = Tag as React.ElementType;
  return <Component className={cn("card", className)} {...props} />;
}

/** Standard padded card body. */
export function CardBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6", className)} {...props} />;
}
