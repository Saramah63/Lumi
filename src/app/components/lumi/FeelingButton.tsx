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
        min-h-[7.5rem]
        px-8 py-6
        bg-white
        border-4
        ${selected ? 'border-[var(--lumi-sky-blue)] shadow-[0_12px_26px_rgba(58,124,168,0.2)]' : 'border-[var(--lumi-border)]'}
        rounded-[1.5rem]
        hover:border-[var(--lumi-sky-blue-light)]
        hover:bg-[#f7fcff]
        active:scale-[0.98]
        transition-all
        focus-visible:ring-4 focus-visible:ring-[#0a7ec2]/25
        ${className}
      `}
      {...props}
    >
      <span className="text-5xl mb-2">{emoji}</span>
      <span className="text-[var(--lumi-text-primary)] font-semibold">{label}</span>
      
      {votes > 0 && (
        <div className="absolute -top-3 -right-3 min-w-[2.5rem] h-10 px-3 bg-[var(--lumi-sky-blue)] text-white font-bold rounded-full flex items-center justify-center shadow-md border-2 border-white">
          {votes}
        </div>
      )}
    </button>
  );
}
