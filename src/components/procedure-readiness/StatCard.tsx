interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'destructive';
}

export function StatCard({ title, value, subtitle }: StatCardProps) {
  return (
    <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
      <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold tracking-tight">{value}</p>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
