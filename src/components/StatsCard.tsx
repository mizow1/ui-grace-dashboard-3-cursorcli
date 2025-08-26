import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  changeType: "increase" | "decrease" | "neutral";
  icon: LucideIcon;
  iconColor?: string;
}

export function StatsCard({ 
  title, 
  value, 
  change, 
  changeType, 
  icon: Icon,
  iconColor = "text-primary"
}: StatsCardProps) {
  const getChangeColor = () => {
    switch (changeType) {
      case "increase":
        return "text-success";
      case "decrease":
        return "text-destructive";
      default:
        return "text-muted-foreground";
    }
  };

  const getChangeSymbol = () => {
    switch (changeType) {
      case "increase":
        return "↗";
      case "decrease":
        return "↘";
      default:
        return "→";
    }
  };

  return (
    <Card className="relative overflow-hidden bg-gradient-card border-border shadow-admin-md hover:shadow-admin-lg transition-all duration-200 group">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            <div className="flex items-center gap-1">
              <span className={`text-sm font-medium ${getChangeColor()}`}>
                {getChangeSymbol()} {change}
              </span>
            </div>
          </div>
          <div className={`h-12 w-12 rounded-lg bg-muted/50 flex items-center justify-center group-hover:bg-muted transition-colors ${iconColor}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
        
        {/* Decorative gradient overlay */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-primary opacity-5 rounded-full -translate-y-6 translate-x-6"></div>
      </CardContent>
    </Card>
  );
}