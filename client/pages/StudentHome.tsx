import { useState } from "react";
import { useApp } from "../lib/AppContext";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Plus, Coffee, UtensilsCrossed, Cookie } from "lucide-react";
import { toast } from "sonner";

interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: "meal" | "chai" | "snacks";
  description?: string;
}

const menuItems: MenuItem[] = [
  // Meals
  {
    id: "meal-1",
    name: "Veg Meal",
    price: 40,
    category: "meal",
    description: "Rice, Dal, Vegetables, Curry, Pickle & Papad",
  },
  {
    id: "meal-2",
    name: "Non-Veg Meal",
    price: 40,
    category: "meal",
    description: "Rice, Dal, Chicken/Fish Curry, Vegetables & Pickle",
  },
  {
    id: "meal-3",
    name: "Special Thali",
    price: 40,
    category: "meal",
    description: "Complete meal with extra curry and sweet",
  },

  // Chai
  {
    id: "chai-1",
    name: "Regular Chai",
    price: 10,
    category: "chai",
    description: "Hot tea with milk and sugar",
  },
  {
    id: "chai-2",
    name: "Ginger Chai",
    price: 10,
    category: "chai",
    description: "Spiced tea with fresh ginger",
  },
  {
    id: "chai-3",
    name: "Cardamom Chai",
    price: 10,
    category: "chai",
    description: "Aromatic tea with cardamom",
  },

  // Snacks
  {
    id: "snack-1",
    name: "Samosa",
    price: 15,
    category: "snacks",
    description: "Deep fried pastry with potato filling",
  },
  {
    id: "snack-2",
    name: "Vada Pav",
    price: 20,
    category: "snacks",
    description: "Mumbai style potato fritter in bun",
  },
  {
    id: "snack-3",
    name: "Maggi",
    price: 25,
    category: "snacks",
    description: "Instant noodles with vegetables",
  },
  {
    id: "snack-4",
    name: "Pakoda",
    price: 15,
    category: "snacks",
    description: "Mixed vegetable fritters",
  },
  {
    id: "snack-5",
    name: "Sandwich",
    price: 25,
    category: "snacks",
    description: "Grilled vegetable sandwich",
  },
];

export default function StudentHome() {
  const { addToCart } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<
    "all" | "meal" | "chai" | "snacks"
  >("all");

  const categories = [
    { id: "all", name: "All Items", icon: UtensilsCrossed },
    { id: "meal", name: "Meals", icon: UtensilsCrossed },
    { id: "chai", name: "Chai", icon: Coffee },
    { id: "snacks", name: "Snacks", icon: Cookie },
  ];

  const filteredItems =
    selectedCategory === "all"
      ? menuItems
      : menuItems.filter((item) => item.category === selectedCategory);

  const handleAddToCart = (item: MenuItem) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      category: item.category,
    });
    toast.success(`${item.name} added to cart`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Welcome to College Canteen
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Order your favorite meals, chai, and snacks for quick pickup. Fresh
          food prepared with love by our canteen team.
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-3 mb-8 justify-center">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              onClick={() =>
                setSelectedCategory(category.id as typeof selectedCategory)
              }
              className="flex items-center gap-2"
            >
              <Icon className="h-4 w-4" />
              {category.name}
            </Button>
          );
        })}
      </div>

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <Card key={item.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{item.name}</CardTitle>
                  <Badge
                    variant="secondary"
                    className="mt-1 capitalize text-xs"
                  >
                    {item.category}
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">
                    ₹{item.price}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {item.description && (
                <p className="text-sm text-muted-foreground mb-4">
                  {item.description}
                </p>
              )}
              <Button
                onClick={() => handleAddToCart(item)}
                className="w-full flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add to Cart
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No items found in this category.
          </p>
        </div>
      )}
    </div>
  );
}
