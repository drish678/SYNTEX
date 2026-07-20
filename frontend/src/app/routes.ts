import { createHashRouter as createBrowserRouter } from "react-router";
import { Home } from "./pages/Home";
import { Dashboard } from "./pages/Dashboard";
import { Insights } from "./pages/Insights";
import { Settings } from "./pages/Settings";
import { Calibration } from "./pages/Calibration";
import { Tasks } from "./pages/Tasks";
import { Circle } from "./pages/Circle";
import { Root } from "./pages/Root";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "calibration", Component: Calibration },
      { path: "dashboard", Component: Dashboard },
      { path: "tasks", Component: Tasks },
      { path: "insights", Component: Insights },
      { path: "circle", Component: Circle },
      { path: "settings", Component: Settings },
    ],
  },
]);