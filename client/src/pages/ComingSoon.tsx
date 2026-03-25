import { Construction } from "lucide-react";
import { useLocation } from "react-router-dom";

export default function ComingSoon() {
  const location = useLocation();
  const pageName = location.pathname.split("/")[1] ?? "Page";
  const title = pageName.charAt(0).toUpperCase() + pageName.slice(1);

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent/10 mb-6">
        <Construction className="h-10 w-10 text-accent" />
      </div>
      <h2 className="text-2xl font-bold text-foreground mb-2">{title}</h2>
      <p className="text-muted-foreground max-w-md">
        This feature is under development and will be available in an upcoming sprint.
      </p>
      <span className="mt-4 inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
        Coming Soon
      </span>
    </div>
  );
}
