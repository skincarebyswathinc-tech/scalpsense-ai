import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { SubscriptionProvider } from "@/hooks/useSubscription";
import Index from "./pages/Index";
import Quiz from "./pages/Quiz";
import Report from "./pages/Report";
import Protocol from "./pages/Protocol";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import ProgressPage from "./pages/Progress";
import HabitTracker from "./pages/HabitTracker";
import PhotoTimeline from "./pages/PhotoTimeline";
import Upgrade from "./pages/Upgrade";
import Referrals from "./pages/Referrals";
import Recommendations from "./pages/Recommendations";
import AdminProducts from "./pages/AdminProducts";
import AdminDashboard from "./pages/AdminDashboard";
import AdminScalpQuiz from "./pages/AdminScalpQuiz";
import AdminReviews from "./pages/AdminReviews";
import AdminFAQs from "./pages/AdminFAQs";
import AdminLeads from "./pages/AdminLeads";
import AdminUsers from "./pages/AdminUsers";
import Profile from "./pages/Profile";
import KitsPage from "./pages/Kits";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <SubscriptionProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/quiz" element={<Quiz />} />
              <Route path="/report" element={<Report />} />
              <Route path="/protocol" element={<Protocol />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/progress" element={<ProgressPage />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/habits" element={<HabitTracker />} />
              <Route path="/photos" element={<PhotoTimeline />} />
              <Route path="/upgrade" element={<Upgrade />} />
              <Route path="/referrals" element={<Referrals />} />
              <Route path="/recommendations" element={<Recommendations />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/products" element={<AdminProducts />} />
              <Route path="/admin/scalp-quiz" element={<AdminScalpQuiz />} />
              <Route path="/admin/reviews" element={<AdminReviews />} />
              <Route path="/admin/faqs" element={<AdminFAQs />} />
              <Route path="/admin/leads" element={<AdminLeads />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/kits" element={<KitsPage />} />
              <Route path="/kits/:slug" element={<KitsPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </SubscriptionProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
