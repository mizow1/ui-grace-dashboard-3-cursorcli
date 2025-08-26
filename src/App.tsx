import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AdminLayout } from "@/components/AdminLayout";
import { DomainProvider } from "@/contexts/DomainContext";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Domains from "./pages/Domains";
import SiteAnalytics from "./pages/SiteAnalytics";
import ContentSuggestions from "./pages/ContentSuggestions";
import ArticleCreation from "./pages/ArticleCreation";
import CompetitorAnalysis from "./pages/CompetitorAnalysis";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <DomainProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AdminLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/users" element={<Users />} />
              <Route path="/domains" element={<Domains />} />
              <Route path="/site-analytics" element={<SiteAnalytics />} />
              <Route path="/content-suggestions" element={<ContentSuggestions />} />
              <Route path="/article-creation" element={<ArticleCreation />} />
              <Route path="/competitor-analysis" element={<CompetitorAnalysis />} />
              <Route path="/settings" element={<Settings />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AdminLayout>
        </BrowserRouter>
      </DomainProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
