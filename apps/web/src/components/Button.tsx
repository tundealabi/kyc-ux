import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  fullWidth?: boolean;
};

const variants = {
  primary:
    "bg-accent text-white disabled:bg-accent-disabled disabled:text-white",
  secondary: "bg-accent-soft text-accent",
  ghost: "bg-transparent px-2 text-muted",
} as const;

export function Button({
  variant = "primary",
  fullWidth,
  className = "",
  ...rest
}: Props) {
  return (
    <button
      className={[
        "appearance-none cursor-pointer rounded-xl border-none px-[1.15rem] py-[0.9rem] text-[0.95rem] font-bold transition-[background,transform,opacity] duration-150",
        "active:enabled:translate-y-px disabled:cursor-not-allowed",
        variants[variant],
        fullWidth ? "w-full" : "",
        className,
      ].join(" ")}
      {...rest}
    />
  );
}
