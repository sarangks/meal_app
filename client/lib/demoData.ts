import { CartItem, Order } from "./AppContext";

export const generateDemoOrders = (): Order[] => {
  const demoOrders: Order[] = [
    {
      id: "1001",
      studentName: "Rahul Sharma",
      rollNumber: "CS2021001",
      items: [
        {
          id: "meal-1",
          name: "Veg Meal",
          price: 40,
          category: "meal",
          quantity: 1,
        },
        {
          id: "chai-1",
          name: "Regular Chai",
          price: 10,
          category: "chai",
          quantity: 2,
        },
      ],
      total: 60,
      paymentMethod: "add_to_account",
      paymentStatus: "pending",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
    {
      id: "1002",
      studentName: "Priya Patel",
      rollNumber: "EC2020045",
      items: [
        {
          id: "meal-2",
          name: "Non-Veg Meal",
          price: 40,
          category: "meal",
          quantity: 1,
        },
      ],
      total: 40,
      paymentMethod: "razorpay",
      paymentStatus: "paid",
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    },
    {
      id: "1003",
      studentName: "Amit Kumar",
      rollNumber: "ME2021089",
      items: [
        {
          id: "snack-1",
          name: "Samosa",
          price: 15,
          category: "snacks",
          quantity: 3,
        },
        {
          id: "chai-2",
          name: "Ginger Chai",
          price: 10,
          category: "chai",
          quantity: 1,
        },
      ],
      total: 55,
      paymentMethod: "add_to_account",
      paymentStatus: "pending",
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    },
    {
      id: "1004",
      studentName: "Sneha Reddy",
      rollNumber: "IT2020012",
      items: [
        {
          id: "meal-3",
          name: "Special Thali",
          price: 40,
          category: "meal",
          quantity: 1,
        },
        {
          id: "snack-5",
          name: "Sandwich",
          price: 25,
          category: "snacks",
          quantity: 1,
        },
      ],
      total: 65,
      paymentMethod: "pay_now",
      paymentStatus: "paid",
      timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
    },
    {
      id: "1005",
      studentName: "Rahul Sharma",
      rollNumber: "CS2021001",
      items: [
        {
          id: "snack-3",
          name: "Maggi",
          price: 25,
          category: "snacks",
          quantity: 2,
        },
      ],
      total: 50,
      paymentMethod: "add_to_account",
      paymentStatus: "pending",
      timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    },
    {
      id: "1006",
      studentName: "Vikram Singh",
      rollNumber: "EE2021076",
      items: [
        {
          id: "meal-1",
          name: "Veg Meal",
          price: 40,
          category: "meal",
          quantity: 2,
        },
        {
          id: "chai-3",
          name: "Cardamom Chai",
          price: 10,
          category: "chai",
          quantity: 3,
        },
      ],
      total: 110,
      paymentMethod: "add_to_account",
      paymentStatus: "pending",
      timestamp: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
    },
    {
      id: "1007",
      studentName: "Anjali Joshi",
      rollNumber: "CE2020033",
      items: [
        {
          id: "chai-1",
          name: "Regular Chai",
          price: 10,
          category: "chai",
          quantity: 1,
        },
      ],
      total: 10,
      paymentMethod: "razorpay",
      paymentStatus: "paid",
      timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    },
    {
      id: "1008",
      studentName: "Amit Kumar",
      rollNumber: "ME2021089",
      items: [
        {
          id: "meal-2",
          name: "Non-Veg Meal",
          price: 40,
          category: "meal",
          quantity: 1,
        },
        {
          id: "snack-4",
          name: "Pakoda",
          price: 15,
          category: "snacks",
          quantity: 2,
        },
      ],
      total: 70,
      paymentMethod: "add_to_account",
      paymentStatus: "pending",
      timestamp: new Date(), // Just now
    },
  ];

  return demoOrders;
};

export const loadDemoData = (setOrders: (orders: Order[]) => void) => {
  const demoOrders = generateDemoOrders();
  setOrders(demoOrders);
};
