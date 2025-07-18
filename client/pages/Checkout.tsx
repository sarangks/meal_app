import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp, Order } from "../lib/AppContext";
import {
  openRazorpayCheckout,
  rupeesToPaise,
  generatePaymentDescription,
  isRazorpayAvailable,
} from "../lib/razorpayService";
import { createOrder } from "../lib/firestoreService";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { ArrowLeft, CreditCard, Wallet } from "lucide-react";
import { toast } from "sonner";

export default function Checkout() {
  const { cart, clearCart, orders, setOrders } = useApp();
  const navigate = useNavigate();

  const [studentName, setStudentName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<
    "razorpay" | "pay_now" | "add_to_account"
  >("razorpay");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalAmount = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const handleRazorpayPayment = async () => {
    if (!studentName.trim() || !rollNumber.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    if (!isRazorpayAvailable()) {
      toast.error("Payment service is not available. Please try again.");
      return;
    }

    setIsSubmitting(true);

    try {
      await openRazorpayCheckout(
        {
          amount: rupeesToPaise(totalAmount),
          currency: "INR",
          name: "College Canteen",
          description: generatePaymentDescription(
            cart.map((item) => `${item.name} x${item.quantity}`).join(", "),
            studentName,
          ),
          prefill: {
            name: studentName.trim(),
          },
          notes: {
            roll_number: rollNumber.trim(),
            items: JSON.stringify(cart),
          },
          theme: {
            color: "#22c55e",
          },
        },
        async (response) => {
          // Payment successful
          try {
            const newOrder: Order = {
              id: response.razorpay_payment_id,
              studentName: studentName.trim(),
              rollNumber: rollNumber.trim(),
              items: [...cart],
              total: totalAmount,
              paymentMethod: "razorpay",
              paymentStatus: "paid",
              timestamp: new Date(),
            };

            setOrders([...orders, newOrder]);
            clearCart();

            toast.success("Payment successful! Order placed.");
            navigate("/confirmation", { state: { order: newOrder } });
          } catch (error) {
            toast.error(
              "Payment successful but order failed to save. Please contact admin.",
            );
            console.error("Order creation error after payment:", error);
          }
          setIsSubmitting(false);
        },
        (error) => {
          console.error("Payment error:", error);
          if (error.error === "Payment cancelled by user") {
            toast.error("Payment cancelled");
          } else {
            toast.error("Payment failed. Please try again.");
          }
          setIsSubmitting(false);
        },
      );
    } catch (error) {
      toast.error("Failed to initialize payment. Please try again.");
      console.error("Razorpay initialization error:", error);
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (paymentMethod === "razorpay") {
      await handleRazorpayPayment();
      return;
    }

    if (!studentName.trim() || !rollNumber.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setIsSubmitting(true);

    // Simulate order processing delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const newOrder: Order = {
      id: Date.now().toString(),
      studentName: studentName.trim(),
      rollNumber: rollNumber.trim(),
      items: [...cart],
      total: totalAmount,
      paymentMethod,
      paymentStatus: paymentMethod === "pay_now" ? "paid" : "pending",
      timestamp: new Date(),
    };

    setOrders([...orders, newOrder]);
    clearCart();

    toast.success("Order placed successfully!");
    navigate("/confirmation", { state: { order: newOrder } });
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            No items to checkout
          </h2>
          <p className="text-muted-foreground mb-8">
            Add some items to your cart before proceeding to checkout.
          </p>
          <Link to="/">
            <Button className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Browse Menu
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Link to="/cart">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-foreground">Checkout</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Student Information */}
            <Card>
              <CardHeader>
                <CardTitle>Student Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="studentName">Full Name *</Label>
                  <Input
                    id="studentName"
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="rollNumber">Roll Number *</Label>
                  <Input
                    id="rollNumber"
                    type="text"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    placeholder="Enter your roll number"
                    required
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(value) =>
                    setPaymentMethod(value as typeof paymentMethod)
                  }
                  className="space-y-4"
                >
                  <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent transition-colors">
                    <RadioGroupItem value="razorpay" id="razorpay" />
                    <Label
                      htmlFor="razorpay"
                      className="flex items-center gap-3 cursor-pointer flex-1"
                    >
                      <CreditCard className="h-5 w-5 text-blue-600" />
                      <div>
                        <div className="font-medium">Pay with Razorpay</div>
                        <div className="text-sm text-muted-foreground">
                          UPI, Cards, Net Banking - Instant payment
                        </div>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent transition-colors">
                    <RadioGroupItem value="pay_now" id="pay_now" />
                    <Label
                      htmlFor="pay_now"
                      className="flex items-center gap-3 cursor-pointer flex-1"
                    >
                      <CreditCard className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-medium">Pay at Counter</div>
                        <div className="text-sm text-muted-foreground">
                          Pay immediately at canteen
                        </div>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent transition-colors">
                    <RadioGroupItem
                      value="add_to_account"
                      id="add_to_account"
                    />
                    <Label
                      htmlFor="add_to_account"
                      className="flex items-center gap-3 cursor-pointer flex-1"
                    >
                      <Wallet className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-medium">Add to Account</div>
                        <div className="text-sm text-muted-foreground">
                          Pay later at the canteen
                        </div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-muted-foreground">
                          ₹{item.price} × {item.quantity}
                        </div>
                      </div>
                      <div className="font-medium">
                        ₹{item.price * item.quantity}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">₹{totalAmount}</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  className={`w-full ${paymentMethod === "razorpay" ? "bg-blue-600 hover:bg-blue-700" : ""}`}
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      {paymentMethod === "razorpay"
                        ? "Processing Payment..."
                        : "Processing..."}
                    </div>
                  ) : paymentMethod === "razorpay" ? (
                    `Pay ₹${totalAmount} with Razorpay`
                  ) : (
                    "Place Order"
                  )}
                </Button>

                <div className="text-xs text-muted-foreground text-center">
                  By placing this order, you agree to pick up your food within
                  30 minutes.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
