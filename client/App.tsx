import { BrowserRouter, Routes, Route } from "react-router-dom";
import StudentHome from "./pages/StudentHome";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Confirmation from "./pages/Confirmation";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import Navigation from "./components/Navigation";
import { AppProvider } from "./lib/AppContext";
import { Toaster } from "sonner";

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-background">
          <Navigation />
          <main>
            <Routes>
              <Route path="/" element={<StudentHome />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/confirmation" element={<Confirmation />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Toaster position="top-center" />
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
