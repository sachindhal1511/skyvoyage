import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { AppLayout } from "@/components/layout/AppLayout";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Weather from "@/pages/weather";
import Destinations from "@/pages/destinations";
import Planner from "@/pages/planner";
import Itinerary from "@/pages/itinerary";
import Packing from "@/pages/packing";
import Analytics from "@/pages/analytics";
import Saved from "@/pages/saved";
import Settings from "@/pages/settings";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Login} />
      <Route path="/forgot-password" component={Login} />
      
      {/* Authenticated Routes */}
      <Route path="/">
        {() => <AppLayout><Dashboard /></AppLayout>}
      </Route>
      <Route path="/weather">
        {() => <AppLayout><Weather /></AppLayout>}
      </Route>
      <Route path="/destinations">
        {() => <AppLayout><Destinations /></AppLayout>}
      </Route>
      <Route path="/planner">
        {() => <AppLayout><Planner /></AppLayout>}
      </Route>
      <Route path="/itinerary">
        {() => <AppLayout><Itinerary /></AppLayout>}
      </Route>
      <Route path="/packing">
        {() => <AppLayout><Packing /></AppLayout>}
      </Route>
      <Route path="/analytics">
        {() => <AppLayout><Analytics /></AppLayout>}
      </Route>
      <Route path="/saved">
        {() => <AppLayout><Saved /></AppLayout>}
      </Route>
      <Route path="/settings">
        {() => <AppLayout><Settings /></AppLayout>}
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
