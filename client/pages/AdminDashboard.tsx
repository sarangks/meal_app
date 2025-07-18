import { useState, useEffect } from "react";
import { useApp } from "../lib/AppContext";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Users,
  DollarSign,
  UtensilsCrossed,
  AlertCircle,
  TrendingUp,
  Clock,
  CheckCircle,
  CreditCard,
  Calendar,
  Search,
  UserX,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { loadDemoData } from "../lib/demoData";

export default function AdminDashboard() {
  const { orders, setOrders } = useApp();
  const [filter, setFilter] = useState<"all" | "paid" | "pending">("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [pendingSearch, setPendingSearch] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split("T")[0]; // Today's date
  });

  // Filter orders by selected date
  const dateFilteredOrders = orders.filter((order) => {
    const orderDate = order.timestamp.toISOString().split("T")[0];
    return orderDate === selectedDate;
  });

  // Apply payment status filter and search filter to date-filtered orders
  const filteredOrders = dateFilteredOrders.filter((order) => {
    // Payment status filter
    const statusMatch = filter === "all" || order.paymentStatus === filter;

    // Search filter (by student name or roll number)
    const searchMatch =
      searchTerm === "" ||
      order.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.rollNumber.toLowerCase().includes(searchTerm.toLowerCase());

    return statusMatch && searchMatch;
  });

  // Calculate statistics for selected date
  const totalOrdersForDate = dateFilteredOrders.length;

  const totalMealsForDate = dateFilteredOrders.reduce(
    (sum, order) =>
      sum +
      order.items
        .filter((item) => item.category === "meal")
        .reduce((itemSum, item) => itemSum + item.quantity, 0),
    0,
  );

  const totalRevenueForDate = dateFilteredOrders
    .filter((order) => order.paymentStatus === "paid")
    .reduce((sum, order) => sum + order.total, 0);

  const pendingPaymentsForDate = dateFilteredOrders
    .filter((order) => order.paymentStatus === "pending")
    .reduce((sum, order) => sum + order.total, 0);

  // Calculate Razorpay-specific statistics for selected date
  const razorpayOrdersForDate = dateFilteredOrders.filter(
    (order) => order.paymentMethod === "razorpay",
  );
  const razorpayRevenueForDate = razorpayOrdersForDate
    .filter((order) => order.paymentStatus === "paid")
    .reduce((sum, order) => sum + order.total, 0);

  // Calculate item rankings for selected date
  const itemRankings = (() => {
    const itemCounts: Record<
      string,
      {
        name: string;
        quantity: number;
        category: string;
        revenue: number;
      }
    > = {};

    dateFilteredOrders.forEach((order) => {
      order.items.forEach((item) => {
        if (itemCounts[item.id]) {
          itemCounts[item.id].quantity += item.quantity;
          itemCounts[item.id].revenue += item.price * item.quantity;
        } else {
          itemCounts[item.id] = {
            name: item.name,
            quantity: item.quantity,
            category: item.category,
            revenue: item.price * item.quantity,
          };
        }
      });
    });

    return Object.values(itemCounts)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10); // Top 10 items
  })();

  const totalItemsOrdered = itemRankings.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );

  // Calculate pending payments by student for selected date
  const pendingPaymentsByStudent = (() => {
    const studentPending: Record<
      string,
      {
        name: string;
        rollNumber: string;
        totalPending: number;
        orderCount: number;
        orders: Array<{
          id: string;
          items: string;
          total: number;
          timestamp: Date;
        }>;
      }
    > = {};

    dateFilteredOrders
      .filter((order) => order.paymentStatus === "pending")
      .forEach((order) => {
        const key = `${order.studentName}-${order.rollNumber}`;
        if (studentPending[key]) {
          studentPending[key].totalPending += order.total;
          studentPending[key].orderCount += 1;
          studentPending[key].orders.push({
            id: order.id,
            items: order.items
              .map((item) => `${item.name} x${item.quantity}`)
              .join(", "),
            total: order.total,
            timestamp: order.timestamp,
          });
        } else {
          studentPending[key] = {
            name: order.studentName,
            rollNumber: order.rollNumber,
            totalPending: order.total,
            orderCount: 1,
            orders: [
              {
                id: order.id,
                items: order.items
                  .map((item) => `${item.name} x${item.quantity}`)
                  .join(", "),
                total: order.total,
                timestamp: order.timestamp,
              },
            ],
          };
        }
      });

    return Object.values(studentPending).sort(
      (a, b) => b.totalPending - a.totalPending,
    );
  })();

  // Filter pending payments by search term
  const filteredPendingPayments = pendingPaymentsByStudent.filter((student) => {
    if (pendingSearch === "") return true;
    return (
      student.name.toLowerCase().includes(pendingSearch.toLowerCase()) ||
      student.rollNumber.toLowerCase().includes(pendingSearch.toLowerCase())
    );
  });

  const markAsPaid = (orderId: string) => {
    setOrders(
      orders.map((order) =>
        order.id === orderId ? { ...order, paymentStatus: "paid" } : order,
      ),
    );
    toast.success("Payment marked as received");
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const isToday = selectedDate === new Date().toISOString().split("T")[0];

  // Auto-refresh dashboard every 30 seconds for today's data
  useEffect(() => {
    if (!isToday) return;

    const interval = setInterval(() => {
      // This would typically fetch new orders from a server
      // For now, we just trigger a re-render
    }, 30000);

    return () => clearInterval(interval);
  }, [isToday]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Chandrettan's Dashboard
            </h1>
            <p className="text-muted-foreground">
              College canteen orders and analytics
            </p>
          </div>
          {orders.length === 0 && (
            <Button
              variant="outline"
              onClick={() => {
                loadDemoData(setOrders);
                toast.success("Demo data loaded!");
              }}
              className="text-sm"
            >
              Load Demo Data
            </Button>
          )}
        </div>
      </div>

      {/* Date Selector */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Select Date to View Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1 max-w-xs">
              <Label htmlFor="date-picker">Date</Label>
              <Input
                id="date-picker"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              <div className="font-medium">
                {isToday ? "Today's Data" : formatDate(selectedDate)}
              </div>
              <div>
                {totalOrdersForDate} orders • ₹{totalRevenueForDate} revenue
              </div>
            </div>
            {!isToday && (
              <Button
                variant="outline"
                onClick={() =>
                  setSelectedDate(new Date().toISOString().split("T")[0])
                }
              >
                Go to Today
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="xl:col-span-3 space-y-8">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Orders
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalOrdersForDate}</div>
                <p className="text-xs text-muted-foreground">
                  {isToday ? "Today's orders" : "Orders for selected date"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Meals Served
                </CardTitle>
                <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalMealsForDate}</div>
                <p className="text-xs text-muted-foreground">
                  {isToday && totalMealsForDate >= 180 ? (
                    <span className="text-orange-500">⚠️ Near capacity</span>
                  ) : isToday ? (
                    `${200 - totalMealsForDate} remaining`
                  ) : (
                    "Meals served"
                  )}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{totalRevenueForDate}</div>
                <p className="text-xs text-muted-foreground">Collected</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Pending Amount
                </CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₹{pendingPaymentsForDate}
                </div>
                <p className="text-xs text-muted-foreground">To be collected</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Online Revenue
                </CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  ₹{razorpayRevenueForDate}
                </div>
                <p className="text-xs text-muted-foreground">
                  {razorpayOrdersForDate.length} Razorpay orders
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Item Rankings */}
          {itemRankings.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Most Ordered Items{" "}
                  {isToday ? "Today" : `on ${formatDate(selectedDate)}`}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Ranked by quantity ordered - helps prioritize preparation
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {itemRankings.map((item, index) => {
                    const percentage =
                      totalItemsOrdered > 0
                        ? (item.quantity / totalItemsOrdered) * 100
                        : 0;

                    return (
                      <div
                        key={item.name}
                        className="flex items-center space-x-4"
                      >
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-medium text-foreground truncate">
                                {item.name}
                              </h4>
                              <Badge
                                variant="secondary"
                                className="text-xs capitalize"
                              >
                                {item.category}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                              <span className="font-semibold text-primary">
                                {item.quantity} orders
                              </span>
                              <span className="text-muted-foreground">
                                ₹{item.revenue}
                              </span>
                            </div>
                          </div>

                          <div className="w-full bg-secondary rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all duration-300"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>

                          <div className="flex justify-between items-center mt-1">
                            <span className="text-xs text-muted-foreground">
                              {percentage.toFixed(1)}% of total orders
                            </span>
                            {index === 0 && item.quantity > 0 && (
                              <Badge variant="default" className="text-xs">
                                🔥 Most Popular
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Orders Management */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Orders for {isToday ? "Today" : formatDate(selectedDate)} (
                  {filteredOrders.length})
                </CardTitle>

                {/* Search and Filters */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name or roll number..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Select
                    value={filter}
                    onValueChange={(v: any) => setFilter(v)}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                  {isToday && (
                    <Badge variant="outline" className="text-xs">
                      Auto-refresh: 30s
                    </Badge>
                  )}
                  {searchTerm && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSearchTerm("")}
                      className="text-xs"
                    >
                      Clear Search
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredOrders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <UtensilsCrossed className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>
                    {searchTerm
                      ? `No orders found matching "${searchTerm}" for the selected date and filter.`
                      : "No orders found for the selected date and filter."}
                  </p>
                  {searchTerm && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSearchTerm("")}
                      className="mt-4"
                    >
                      Clear Search
                    </Button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Student</TableHead>
                        <TableHead>Roll No.</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.map((order) => (
                        <TableRow
                          key={order.id}
                          className={
                            order.paymentStatus === "pending"
                              ? "bg-red-50 dark:bg-red-950/10"
                              : ""
                          }
                        >
                          <TableCell className="font-mono text-sm">
                            #{order.id}
                          </TableCell>
                          <TableCell className="font-medium">
                            {searchTerm &&
                            order.studentName
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase()) ? (
                              <span className="bg-yellow-200 dark:bg-yellow-900 px-1 rounded">
                                {order.studentName}
                              </span>
                            ) : (
                              order.studentName
                            )}
                          </TableCell>
                          <TableCell>
                            {searchTerm &&
                            order.rollNumber
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase()) ? (
                              <span className="bg-yellow-200 dark:bg-yellow-900 px-1 rounded">
                                {order.rollNumber}
                              </span>
                            ) : (
                              order.rollNumber
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {order.items.map((item, index) => (
                                <div key={index} className="text-sm">
                                  {item.name} × {item.quantity}
                                </div>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold">
                            ₹{order.total}
                          </TableCell>
                          <TableCell className="text-sm">
                            {formatTime(order.timestamp)}
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <Badge
                                variant={
                                  order.paymentStatus === "paid"
                                    ? "default"
                                    : "secondary"
                                }
                                className="flex items-center gap-1 w-fit"
                              >
                                {order.paymentStatus === "paid" ? (
                                  <CheckCircle className="h-3 w-3" />
                                ) : (
                                  <Clock className="h-3 w-3" />
                                )}
                                {order.paymentStatus === "paid"
                                  ? "Paid"
                                  : "Pending"}
                              </Badge>
                              {order.paymentMethod === "razorpay" && (
                                <Badge variant="outline" className="text-xs">
                                  Razorpay
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {order.paymentStatus === "pending" && (
                              <Button
                                size="sm"
                                onClick={() => markAsPaid(order.id)}
                                className="text-xs"
                              >
                                Mark Paid
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Pending Payments Sidebar */}
        <div className="xl:col-span-1">
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <UserX className="h-5 w-5 text-red-500" />
                Pending Payments
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {isToday
                  ? "Students who owe money today"
                  : `Outstanding debts from ${formatDate(selectedDate)}`}
              </p>

              {/* Search for Pending Payments */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or roll..."
                  value={pendingSearch}
                  onChange={(e) => setPendingSearch(e.target.value)}
                  className="pl-10"
                />
                {pendingSearch && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPendingSearch("")}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {filteredPendingPayments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {pendingPaymentsByStudent.length === 0 ? (
                    <>
                      <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                      <p className="text-sm">All payments cleared!</p>
                    </>
                  ) : (
                    <>
                      <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">
                        No matches for "{pendingSearch}"
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPendingSearch("")}
                        className="text-xs mt-2"
                      >
                        Clear search
                      </Button>
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredPendingPayments.map((student, index) => (
                    <Card
                      key={`${student.name}-${student.rollNumber}`}
                      className="border-l-4 border-l-red-500"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                                index === 0
                                  ? "bg-red-500"
                                  : index === 1
                                    ? "bg-orange-500"
                                    : index === 2
                                      ? "bg-yellow-500"
                                      : "bg-gray-500"
                              }`}
                            >
                              {index + 1}
                            </div>
                            <div>
                              <div
                                className={`font-medium text-sm ${
                                  pendingSearch &&
                                  student.name
                                    .toLowerCase()
                                    .includes(pendingSearch.toLowerCase())
                                    ? "bg-yellow-200 dark:bg-yellow-900 px-1 rounded"
                                    : ""
                                }`}
                              >
                                {student.name}
                              </div>
                              <div
                                className={`text-xs text-muted-foreground ${
                                  pendingSearch &&
                                  student.rollNumber
                                    .toLowerCase()
                                    .includes(pendingSearch.toLowerCase())
                                    ? "bg-yellow-200 dark:bg-yellow-900 px-1 rounded"
                                    : ""
                                }`}
                              >
                                {student.rollNumber}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-red-600">
                              ₹{student.totalPending}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {student.orderCount} order
                              {student.orderCount > 1 ? "s" : ""}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          {student.orders.map((order) => (
                            <div
                              key={order.id}
                              className="p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs"
                            >
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-mono">#{order.id}</span>
                                <span className="font-semibold">
                                  ₹{order.total}
                                </span>
                              </div>
                              <div className="text-muted-foreground text-xs mb-2">
                                {order.items}
                              </div>
                              <Button
                                size="sm"
                                onClick={() => markAsPaid(order.id)}
                                className="w-full text-xs h-6"
                              >
                                Mark as Paid
                              </Button>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {pendingPaymentsByStudent.length > 0 && (
                <div className="pt-4 border-t">
                  <div className="text-center">
                    <div className="text-lg font-bold text-red-600">
                      ₹
                      {pendingPaymentsByStudent.reduce(
                        (sum, student) => sum + student.totalPending,
                        0,
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Total Pending from {pendingPaymentsByStudent.length}{" "}
                      student{pendingPaymentsByStudent.length > 1 ? "s" : ""}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
