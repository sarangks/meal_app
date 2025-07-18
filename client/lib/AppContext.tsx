import { createContext, useContext, useState } from "react";

export type UserRole = "student" | "admin";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  category: "meal" | "chai" | "snacks";
  quantity: number;
}

export interface Order {
  id: string;
  studentName: string;
  rollNumber: string;
  items: CartItem[];
  total: number;
  paymentMethod: "pay_now" | "add_to_account";
  paymentStatus: "paid" | "pending";
  timestamp: Date;
}

interface AppContextType {
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  cart: CartItem[];
  setCart: (cart: CartItem[]) => void;
  orders: Order[];
  setOrders: (orders: Order[]) => void;
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
};

interface AppProviderProps {
  children: React.ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [userRole, setUserRole] = useState<UserRole>("student");

  // Initialize cart from localStorage
  const [cart, setCartState] = useState<CartItem[]>(() => {
    if (typeof window !== "undefined") {
      const savedCart = localStorage.getItem("canteen_cart");
      return savedCart ? JSON.parse(savedCart) : [];
    }
    return [];
  });

  // Initialize orders from localStorage
  const [orders, setOrdersState] = useState<Order[]>(() => {
    if (typeof window !== "undefined") {
      const savedOrders = localStorage.getItem("canteen_orders");
      if (savedOrders) {
        const parsedOrders = JSON.parse(savedOrders);
        // Convert timestamp strings back to Date objects
        return parsedOrders.map((order: any) => ({
          ...order,
          timestamp: new Date(order.timestamp),
        }));
      }
    }
    return [];
  });

  // Wrapper function to save cart to localStorage
  const setCart = (newCart: CartItem[]) => {
    setCartState(newCart);
    if (typeof window !== "undefined") {
      localStorage.setItem("canteen_cart", JSON.stringify(newCart));
    }
  };

  // Wrapper function to save orders to localStorage
  const setOrders = (newOrders: Order[]) => {
    setOrdersState(newOrders);
    if (typeof window !== "undefined") {
      localStorage.setItem("canteen_orders", JSON.stringify(newOrders));
    }
  };

  const addToCart = (item: Omit<CartItem, "quantity">) => {
    const newCart = (() => {
      const existingItem = cart.find((cartItem) => cartItem.id === item.id);
      if (existingItem) {
        return cart.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem,
        );
      }
      return [...cart, { ...item, quantity: 1 }];
    })();
    setCart(newCart);
  };

  const removeFromCart = (itemId: string) => {
    const newCart = cart.filter((item) => item.id !== itemId);
    setCart(newCart);
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    const newCart = cart.map((item) =>
      item.id === itemId ? { ...item, quantity } : item,
    );
    setCart(newCart);
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <AppContext.Provider
      value={{
        userRole,
        setUserRole,
        cart,
        setCart,
        orders,
        setOrders,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
