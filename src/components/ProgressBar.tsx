interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  showPercent?: boolean;
}

export default function ProgressBar({
  value,
  max,
  label,
  showPercent = true,
}: ProgressBarProps) {
  const percent = max > 0 ? Math.round((value / max) * 100) : 0;

  return (
    <div className="w-full">
      {(label || showPercent) && (
        <div className="flex justify-between text-sm mb-1 opacity-80">
          {label && <span>{label}</span>}
          {showPercent && (
            <span>
              {value}/{max} ({percent}%)
            </span>
          )}
        </div>
      )}
      <progress
        className="progress progress-primary w-full"
        value={value}
        max={max}
      />
    </div>
  );
}
