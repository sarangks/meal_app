import { useState } from "react";
import { createOrder } from "../lib/firestoreService";
import {
  openRazorpayCheckout,
  rupeesToPaise,
  generatePaymentDescription,
  isRazorpayAvailable,
} from "../lib/razorpayService";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { toast } from "sonner";
import {
  UtensilsCrossed,
  Coffee,
  Cookie,
  CreditCard,
  Wallet,
} from "lucide-react";

const menuItems = [
  { name: "Veg Meal", price: 40, category: "meal" },
  { name: "Non-Veg Meal", price: 40, category: "meal" },
  { name: "Special Thali", price: 40, category: "meal" },
  { name: "Regular Chai", price: 10, category: "chai" },
  { name: "Ginger Chai", price: 10, category: "chai" },
  { name: "Cardamom Chai", price: 10, category: "chai" },
  { name: "Samosa", price: 15, category: "snack" },
  { name: "Vada Pav", price: 20, category: "snack" },
  { name: "Maggi", price: 25, category: "snack" },
  { name: "Pakoda", price: 15, category: "snack" },
  { name: "Sandwich", price: 25, category: "snack" },
];

export default function StudentOrder() {
  const [formData, setFormData] = useState({
    name: "",
    roll: "",
    item: "",
    paymentMethod: "Account" as "Razorpay" | "Account",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);

  const selectedItem = menuItems.find((item) => item.name === formData.item);
  const price = selectedItem?.price || 0;

  const handleRazorpayPayment = async () => {
    if (!formData.name.trim() || !formData.roll.trim() || !formData.item) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!isRazorpayAvailable()) {
      toast.error("Payment service is not available. Please try again.");
      return;
    }

    setIsPaymentProcessing(true);

    try {
      await openRazorpayCheckout(
        {
          amount: rupeesToPaise(price),
          currency: "INR",
          name: "College Canteen",
          description: generatePaymentDescription(formData.item, formData.name),
          prefill: {
            name: formData.name.trim(),
          },
          notes: {
            roll_number: formData.roll.trim(),
            item: formData.item,
          },
          theme: {
            color: "#22c55e",
          },
        },
        async (response) => {
          // Payment successful
          try {
            const result = await createOrder({
              name: formData.name.trim(),
              roll: formData.roll.trim(),
              item: formData.item,
              price,
              paymentStatus: "Paid",
              paymentMethod: "Razorpay",
              payment_id: response.razorpay_payment_id,
            });

            if (result.success) {
              toast.success("Payment successful! Order placed.");
              setFormData({
                name: "",
                roll: "",
                item: "",
                paymentMethod: "Account",
              });
            } else {
              toast.error(
                "Payment successful but order failed to save. Please contact admin.",
              );
            }
          } catch (error) {
            toast.error(
              "Payment successful but order failed to save. Please contact admin.",
            );
            console.error("Order creation error after payment:", error);
          }
          setIsPaymentProcessing(false);
        },
        (error) => {
          // Payment failed or cancelled
          console.error("Payment error:", error);
          if (error.error === "Payment cancelled by user") {
            toast.error("Payment cancelled");
          } else {
            toast.error("Payment failed. Please try again.");
          }
          setIsPaymentProcessing(false);
        },
      );
    } catch (error) {
      toast.error("Failed to initialize payment. Please try again.");
      console.error("Razorpay initialization error:", error);
      setIsPaymentProcessing(false);
    }
  };

  const handleAccountOrder = async () => {
    if (!formData.name.trim() || !formData.roll.trim() || !formData.item) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createOrder({
        name: formData.name.trim(),
        roll: formData.roll.trim(),
        item: formData.item,
        price,
        paymentStatus: "Unpaid",
        paymentMethod: "Account",
      });

      if (result.success) {
        toast.success("Order submitted! Pay at the counter.");
        setFormData({
          name: "",
          roll: "",
          item: "",
          paymentMethod: "Account",
        });
      } else {
        toast.error(result.error || "Failed to submit order");
      }
    } catch (error) {
      toast.error("Failed to submit order");
      console.error("Order submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.paymentMethod === "Razorpay") {
      await handleRazorpayPayment();
    } else {
      await handleAccountOrder();
    }
  };

  const getItemIcon = (category: string) => {
    switch (category) {
      case "meal":
        return <UtensilsCrossed className="h-4 w-4" />;
      case "chai":
        return <Coffee className="h-4 w-4" />;
      case "snack":
        return <Cookie className="h-4 w-4" />;
      default:
        return <UtensilsCrossed className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            College Canteen Order
          </h1>
          <p className="text-muted-foreground">
            Place your order for quick pickup
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Order Form</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Student Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Enter your name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="roll">Roll Number *</Label>
                  <Input
                    id="roll"
                    type="text"
                    value={formData.roll}
                    onChange={(e) =>
                      setFormData({ ...formData, roll: e.target.value })
                    }
                    placeholder="Enter roll number"
                    required
                  />
                </div>
              </div>

              {/* Item Selection */}
              <div>
                <Label htmlFor="item">Select Item *</Label>
                <Select
                  value={formData.item}
                  onValueChange={(value) =>
                    setFormData({ ...formData, item: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an item" />
                  </SelectTrigger>
                  <SelectContent>
                    {menuItems.map((item) => (
                      <SelectItem key={item.name} value={item.name}>
                        <div className="flex items-center gap-2">
                          {getItemIcon(item.category)}
                          <span>{item.name}</span>
                          <span className="text-primary font-semibold">
                            ₹{item.price}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Price Display */}
              {selectedItem && (
                <div className="p-4 bg-accent rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Selected Item:</span>
                    <span>{selectedItem.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Price:</span>
                    <span className="text-2xl font-bold text-primary">
                      ₹{price}
                    </span>
                  </div>
                </div>
              )}

              {/* Payment Method */}
              <div>
                <Label>Payment Method</Label>
                <RadioGroup
                  value={formData.paymentMethod}
                  onValueChange={(value: "Razorpay" | "Account") =>
                    setFormData({ ...formData, paymentMethod: value })
                  }
                  className="mt-2 space-y-3"
                >
                  <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-accent transition-colors">
                    <RadioGroupItem value="Razorpay" id="razorpay" />
                    <Label
                      htmlFor="razorpay"
                      className="flex items-center gap-3 cursor-pointer flex-1"
                    >
                      <CreditCard className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-medium">Pay with Razorpay</div>
                        <div className="text-sm text-muted-foreground">
                          UPI, Cards, Netbanking - Instant payment
                        </div>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-accent transition-colors">
                    <RadioGroupItem value="Account" id="account" />
                    <Label
                      htmlFor="account"
                      className="flex items-center gap-3 cursor-pointer flex-1"
                    >
                      <Wallet className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-medium">
                          Add to Account (Pay Later)
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Pay at the canteen counter
                        </div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Submit Buttons */}
              {formData.paymentMethod === "Razorpay" ? (
                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  size="lg"
                  disabled={isPaymentProcessing || !selectedItem}
                >
                  {isPaymentProcessing ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Processing Payment...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Pay ₹{price} with Razorpay
                    </div>
                  )}
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isSubmitting || !selectedItem}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Submitting...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Wallet className="h-4 w-4" />
                      Add to Account - ₹{price}
                    </div>
                  )}
                </Button>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Quick Info */}
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>
            Orders are processed in real-time. Please collect your order from
            the canteen counter.
          </p>
        </div>
      </div>
    </div>
  );
}
