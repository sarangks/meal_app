import { useLocation, Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { CheckCircle, Clock, Home } from "lucide-react";
import { Order } from "../lib/AppContext";

export default function Confirmation() {
  const location = useLocation();
  const order = location.state?.order as Order;

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Order not found
          </h2>
          <p className="text-muted-foreground mb-8">
            We couldn't find your order details.
          </p>
          <Link to="/">
            <Button>Go to Menu</Button>
          </Link>
        </div>
      </div>
    );
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const estimatedReadyTime = new Date(
    order.timestamp.getTime() + 15 * 60 * 1000,
  ); // 15 minutes

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Order Confirmed!
        </h1>
        <p className="text-lg text-muted-foreground">
          Thank you {order.studentName}, your order has been placed
          successfully.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Order Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Order Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Order ID</p>
                <p className="font-medium">#{order.id}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Roll Number</p>
                <p className="font-medium">{order.rollNumber}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Order Time</p>
                <p className="font-medium">{formatTime(order.timestamp)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Estimated Ready Time</p>
                <p className="font-medium text-primary">
                  {formatTime(estimatedReadyTime)}
                </p>
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-muted-foreground text-sm mb-2">
                Payment Method
              </p>
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    order.paymentStatus === "paid" ? "default" : "secondary"
                  }
                >
                  {order.paymentMethod === "pay_now"
                    ? "Pay Now"
                    : "Add to Account"}
                </Badge>
                <Badge
                  variant={
                    order.paymentStatus === "paid" ? "default" : "outline"
                  }
                >
                  {order.paymentStatus === "paid" ? "Paid" : "Pending"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card>
          <CardHeader>
            <CardTitle>Your Order</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {order.items.map((item) => (
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

            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">₹{order.total}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card className="mt-8">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold">What's Next?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-medium">
                  1
                </div>
                <p>Your order is being prepared</p>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-medium">
                  2
                </div>
                <p>Pick up at the canteen counter</p>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-medium">
                  3
                </div>
                <p>Show this order ID: #{order.id}</p>
              </div>
            </div>

            {order.paymentStatus === "pending" && (
              <div className="bg-accent p-4 rounded-lg mt-4">
                <p className="text-sm font-medium text-accent-foreground">
                  💡 Remember to pay ₹{order.total} at the canteen counter when
                  you pick up your order.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="text-center mt-8">
        <Link to="/">
          <Button className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Back to Menu
          </Button>
        </Link>
      </div>
    </div>
  );
}
