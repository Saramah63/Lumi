import { createBrowserRouter } from "react-router";
import { Root } from "./pages/Root";
import { TeacherDashboard } from "./pages/TeacherDashboard";
import { FeelingsCheckIn } from "./pages/FeelingsCheckIn";
import { BreathSync } from "./pages/BreathSync";
import { ScenarioStep } from "./pages/ScenarioStep";
import { ClosingRitual } from "./pages/ClosingRitual";
import { ComponentLibrary } from "./pages/ComponentLibrary";
import { DesignSystem } from "./pages/DesignSystem";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: TeacherDashboard },
      { path: "teacher", Component: TeacherDashboard },
      { path: "check-in", Component: FeelingsCheckIn },
      { path: "breath", Component: BreathSync },
      { path: "scenario", Component: ScenarioStep },
      { path: "closing", Component: ClosingRitual },
      { path: "components", Component: ComponentLibrary },
      { path: "design-system", Component: DesignSystem },
    ],
  },
]);