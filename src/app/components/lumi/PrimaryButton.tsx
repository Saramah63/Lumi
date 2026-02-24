import { ButtonHTMLAttributes, ReactNode } from "react";

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  size?: "md" | "lg";
}

export function PrimaryButton({ 
  children, 
  size = "lg", 
  className = "", 
  ...props 
}: PrimaryButtonProps) {
  const sizeClasses = {
    md: "h-14 px-6",
    lg: "h-16 px-8"
  };

  return (
    <button
      className={`
        ${sizeClasses[size]}
        bg-[var(--lumi-sky-blue)] 
        text-white 
        rounded-[1.5rem]
        hover:bg-[var(--lumi-sky-blue-dark)]
        active:scale-[0.98]
        transition-all
        disabled:opacity-50 
        disabled:cursor-not-allowed
        shadow-sm
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}
