import { Link, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { UtensilsCrossed, BarChart3 } from "lucide-react";

export default function SimpleNavigation() {
  const location = useLocation();

  return (
    <nav className="border-b bg-card shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-xl font-bold text-primary">
              College Canteen
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link to="/student">
              <Button
                variant={
                  location.pathname === "/" || location.pathname === "/student"
                    ? "default"
                    : "outline"
                }
                size="sm"
                className="flex items-center gap-2"
              >
                <UtensilsCrossed className="h-4 w-4" />
                Student Order
              </Button>
            </Link>

            <Link to="/admin">
              <Button
                variant={location.pathname === "/admin" ? "default" : "outline"}
                size="sm"
                className="flex items-center gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                Admin Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
