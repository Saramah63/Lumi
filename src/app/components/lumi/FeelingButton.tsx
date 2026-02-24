import { ButtonHTMLAttributes } from "react";

interface FeelingButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  emoji: string;
  label: string;
  votes?: number;
  selected?: boolean;
}

export function FeelingButton({ 
  emoji, 
  label, 
  votes = 0, 
  selected = false,
  className = "", 
  ...props 
}: FeelingButtonProps) {
  return (
    <button
      className={`
        relative
        flex flex-col items-center justify-center
        min-h-[7rem]
        px-8 py-6
        bg-white
        border-4
        ${selected ? 'border-[var(--lumi-sky-blue)]' : 'border-[var(--lumi-border)]'}
        rounded-[1.5rem]
        hover:border-[var(--lumi-sky-blue-light)]
        hover:shadow-md
        active:scale-[0.98]
        transition-all
        ${className}
      `}
      {...props}
    >
      <span className="text-5xl mb-2">{emoji}</span>
      <span className="text-[var(--lumi-text-primary)]">{label}</span>
      
      {votes > 0 && (
        <div className="absolute -top-3 -right-3 min-w-[2.5rem] h-10 px-3 bg-[var(--lumi-sky-blue)] text-white rounded-full flex items-center justify-center shadow-md">
          {votes}
        </div>
      )}
    </button>
  );
}
