
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import AppLayout from "@/components/layout/AppLayout";
import LoginPage from "@/pages/auth/LoginPage";
import SignupPage from "@/pages/auth/SignupPage";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import SoftwareListPage from "@/pages/software/SoftwareListPage";
import CreateSoftwarePage from "@/pages/software/CreateSoftwarePage";
import RequestAccessPage from "@/pages/requests/RequestAccessPage";
import PendingRequestsPage from "@/pages/requests/PendingRequestsPage";
import NotFound from "./pages/NotFound";
import Index from "./pages/Index";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            
            {/* Protected routes */}
            <Route path="/" element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/software" element={<SoftwareListPage />} />
              <Route path="/create-software" element={<CreateSoftwarePage />} />
              <Route path="/request-access" element={<RequestAccessPage />} />
              <Route path="/pending-requests" element={<PendingRequestsPage />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
