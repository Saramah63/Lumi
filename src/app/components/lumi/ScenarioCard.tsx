import { ButtonHTMLAttributes } from "react";
import { Zap, Sprout } from "lucide-react";

interface ScenarioCardProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  title: string;
  type: "quick" | "deep";
  selected?: boolean;
}

export function ScenarioCard({ 
  title, 
  type, 
  selected = false,
  className = "", 
  ...props 
}: ScenarioCardProps) {
  return (
    <button
      className={`
        relative
        flex items-center gap-3
        min-h-[4rem]
        px-4 py-3
        bg-white
        border-2
        ${selected ? 'border-[var(--lumi-sky-blue)] shadow-[0_10px_24px_rgba(58,124,168,0.2)]' : 'border-[var(--lumi-border)]'}
        rounded-[1rem]
        hover:border-[var(--lumi-sky-blue-light)]
        hover:bg-[#f7fcff]
        active:scale-[0.98]
        transition-all
        focus-visible:ring-4 focus-visible:ring-[#0a7ec2]/25
        text-left
        ${className}
      `}
      {...props}
    >
      <div className={`
        flex items-center justify-center
        w-8 h-8
        rounded-full
        ${type === 'quick' ? 'bg-amber-100' : 'bg-emerald-100'}
      `}>
      {type === 'quick' ? (
          <Zap className="w-4 h-4 text-amber-700" />
      ) : (
          <Sprout className="w-4 h-4 text-emerald-700" />
      )}
      </div>
      
      <span className="flex-1 text-[var(--lumi-text-primary)]">{title}</span>
      
      {selected && (
        <div className="w-2 h-2 rounded-full bg-[var(--lumi-sky-blue)]" />
      )}
    </button>
  );
}
