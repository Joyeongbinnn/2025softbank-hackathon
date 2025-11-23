import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "@/components/layout/Header";
import Landing from "./views/Landing";
import NewProject from "./views/NewProject";
import Dashboard from "./views/Dashboard";
import MetricsDashboard from "./views/MetricsDashboard";
import PipelineDetail from "./views/PipelineDetail";
import Settings from "./views/Settings";
import NotFound from "./views/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/new-project" element={<NewProject />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/metrics" element={<MetricsDashboard />} />
          <Route path="/pipeline/:deployId" element={<PipelineDetail />} />
          <Route path="/settings" element={<Settings />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
