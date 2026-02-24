import { Clock } from "lucide-react";

interface TeacherHUDProps {
  elapsed?: string;
  step?: string;
  className?: string;
}

export function TeacherHUD({ 
  elapsed = "0:00", 
  step,
  className = "" 
}: TeacherHUDProps) {
  return (
    <div className={`flex items-center gap-4 text-[var(--lumi-text-secondary)] text-sm ${className}`}>
      <div className="flex items-center gap-2 bg-white/80 px-3 py-1.5 rounded-full">
        <Clock className="w-4 h-4" />
        <span>{elapsed}</span>
      </div>
      
      {step && (
        <div className="bg-white/80 px-3 py-1.5 rounded-full">
          {step}
        </div>
      )}
    </div>
  );
}
