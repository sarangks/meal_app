import { Link, useLocation, useNavigate } from "react-router-dom";
import { useApp } from "../lib/AppContext";
import { Button } from "./ui/button";
import { ShoppingCart, User, BarChart3 } from "lucide-react";
import { Badge } from "./ui/badge";
import { useEffect } from "react";

export default function Navigation() {
  const { userRole, setUserRole, cart } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleRoleChange = (newRole: "student" | "admin") => {
    setUserRole(newRole);
    if (newRole === "admin") {
      navigate("/admin");
    } else {
      navigate("/");
    }
  };

  return (
    <nav className="border-b bg-card shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link
              to={userRole === "admin" ? "/admin" : "/"}
              className="text-xl font-bold text-primary"
            >
              College Canteen
            </Link>

            {userRole === "student" && (
              <div className="hidden md:flex space-x-6">
                <Link
                  to="/"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === "/"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Menu
                </Link>
              </div>
            )}

            {userRole === "admin" && (
              <div className="hidden md:flex space-x-6">
                <Link
                  to="/admin"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                    location.pathname === "/admin"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <BarChart3 className="h-4 w-4" />
                  Dashboard
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {userRole === "student" && (
              <Link to="/cart">
                <Button variant="outline" size="sm" className="relative">
                  <ShoppingCart className="h-4 w-4" />
                  {totalItems > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                      {totalItems}
                    </Badge>
                  )}
                </Button>
              </Link>
            )}

            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <select
                value={userRole}
                onChange={(e) =>
                  handleRoleChange(e.target.value as "student" | "admin")
                }
                className="text-sm border rounded-md px-2 py-1 bg-background"
              >
                <option value="student">Student</option>
                <option value="admin">Chandrettan (Admin)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
