interface StatCardProps {
  value: string;
  label: string;
  suffix?: string;
}

export const StatCard = ({ value, label, suffix }: StatCardProps) => {
  return (
    <div className="text-center">
      <div className="text-4xl md:text-5xl font-bold text-gradient mb-2">
        {value}
        {suffix && <span className="text-primary">{suffix}</span>}
      </div>
      <div className="text-sm text-muted-foreground uppercase tracking-wider">
        {label}
      </div>
    </div>
  );
};
