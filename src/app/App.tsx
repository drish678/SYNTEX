import { RouterProvider } from "react-router";
import { router } from "./routes";
import { Toaster } from "./components/ui/sonner";
import { MonitoringProvider } from "./contexts/MonitoringContext";

function App() {
  return (
    <MonitoringProvider>
      <RouterProvider router={router} />
      <Toaster />
    </MonitoringProvider>
  );
}

export default App;