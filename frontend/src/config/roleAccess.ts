import { UserRole } from "@/types/erp.types";

export type AppRouteKey =
  | "dashboard"
  | "store-operations"
  | "pos"
  | "deadstock"
  | "store-performance"
  | "inventory"
  | "warehouse-transfers"
  | "invoices"
  | "recommendations"
  | "decision-lab"
  | "insights"
  | "import"
  | "settings"
  | "help"
  | "logout";

export type RouteAccess = {
  key: AppRouteKey;
  name: string;
  href: string;
  description: string;
  keywords: string[];
  navGroup: "operations" | "analytics" | "general";
  roles: UserRole[];
};

export const adminRoles: UserRole[] = ["OWNER", "ADMIN"];

export const appRoutes: RouteAccess[] = [
  {
    key: "dashboard",
    name: "Dashboard",
    href: "/dashboard",
    description: "Company KPIs, live ERP analytics, and executive intelligence",
    keywords: ["home", "overview", "revenue", "profit", "kpi", "sales", "gross margin"],
    navGroup: "analytics",
    roles: ["OWNER", "ADMIN", "STORE_MANAGER", "ANALYST"],
  },
  {
    key: "store-operations",
    name: "Store Ops",
    href: "/store-operations",
    description: "Store command center, low stock alerts, and shift workflows",
    keywords: ["store", "operations", "alerts", "shift", "command", "low stock"],
    navGroup: "operations",
    roles: ["OWNER", "ADMIN", "STORE_MANAGER"],
  },
  {
    key: "pos",
    name: "POS Billing",
    href: "/pos",
    description: "Cashier checkout, barcode workflow, GST, and payment capture",
    keywords: ["pos", "billing", "cart", "barcode", "invoice", "cashier", "sell"],
    navGroup: "operations",
    roles: ["OWNER", "ADMIN", "STORE_MANAGER", "CASHIER"],
  },
  {
    key: "deadstock",
    name: "Deadstock",
    href: "/deadstock",
    description: "Aging inventory, deadstock exposure, and risk analytics",
    keywords: ["aging", "risk", "inventory", "stock", "dead stock", "capital exposure"],
    navGroup: "analytics",
    roles: ["OWNER", "ADMIN", "ANALYST"],
  },
  {
    key: "store-performance",
    name: "Store Performance",
    href: "/store-performance",
    description: "Store ranking, margin, revenue, and trend analysis",
    keywords: ["store", "performance", "profit", "revenue", "ranking", "trend", "branch"],
    navGroup: "analytics",
    roles: ["OWNER", "ADMIN", "STORE_MANAGER", "ANALYST"],
  },
  {
    key: "inventory",
    name: "Inventory",
    href: "/inventory",
    description: "Inventory health, availability, reorder pressure, and movements",
    keywords: ["stock", "inventory", "category", "aging", "units", "stock value", "availability"],
    navGroup: "operations",
    roles: ["OWNER", "ADMIN", "STORE_MANAGER", "WAREHOUSE_MANAGER", "ANALYST"],
  },
  {
    key: "warehouse-transfers",
    name: "Warehouse",
    href: "/warehouse-transfers",
    description: "Transfer allocation, dispatch, receiving, and warehouse workflow",
    keywords: ["warehouse", "transfer", "dispatch", "delivery", "receiving", "replenishment"],
    navGroup: "operations",
    roles: ["OWNER", "ADMIN", "STORE_MANAGER", "WAREHOUSE_MANAGER"],
  },
  {
    key: "invoices",
    name: "Invoices",
    href: "/invoices",
    description: "GST invoice archive, reprint, preview, and export",
    keywords: ["invoice", "gst", "billing", "payments", "reprint"],
    navGroup: "operations",
    roles: ["OWNER", "ADMIN", "STORE_MANAGER", "CASHIER", "ANALYST"],
  },
  {
    key: "recommendations",
    name: "Recommender",
    href: "/recommendations",
    description: "Replenishment, redistribution, deadstock, and demand alerts",
    keywords: ["recommender", "transfer", "moves", "reallocation", "coverage", "redistribution", "suggestions"],
    navGroup: "analytics",
    roles: ["OWNER", "ADMIN", "ANALYST"],
  },
  {
    key: "decision-lab",
    name: "Forecasting",
    href: "/decision-lab",
    description: "Forecasting visualizations, simulations, and model comparison",
    keywords: ["forecast", "forecasting", "simulation", "model", "demand", "seasonality"],
    navGroup: "analytics",
    roles: ["OWNER", "ADMIN", "ANALYST"],
  },
  {
    key: "insights",
    name: "Insights",
    href: "/insights",
    description: "Executive summary, AI insights, and operational explanations",
    keywords: ["ai", "summary", "executive", "insight", "questions", "analysis", "assistant"],
    navGroup: "analytics",
    roles: ["OWNER", "ADMIN", "ANALYST"],
  },
  {
    key: "import",
    name: "Import",
    href: "/import",
    description: "Upload and import business data",
    keywords: ["upload", "csv", "import", "data"],
    navGroup: "general",
    roles: ["OWNER", "ADMIN"],
  },
  {
    key: "settings",
    name: "Settings",
    href: "/settings",
    description: "Workspace and application settings",
    keywords: ["config", "preferences", "settings"],
    navGroup: "general",
    roles: ["OWNER", "ADMIN"],
  },
  {
    key: "help",
    name: "Help",
    href: "/help",
    description: "Support, documentation, and FAQ",
    keywords: ["faq", "support", "help", "docs"],
    navGroup: "general",
    roles: ["OWNER", "ADMIN", "STORE_MANAGER", "CASHIER", "WAREHOUSE_MANAGER", "ANALYST"],
  },
  {
    key: "logout",
    name: "Logout",
    href: "/logout",
    description: "End the current session",
    keywords: ["logout", "sign out", "exit"],
    navGroup: "general",
    roles: ["OWNER", "ADMIN", "STORE_MANAGER", "CASHIER", "WAREHOUSE_MANAGER", "ANALYST"],
  },
];

export const defaultRouteByRole: Record<UserRole, string> = {
  OWNER: "/dashboard",
  ADMIN: "/dashboard",
  STORE_MANAGER: "/store-operations",
  CASHIER: "/pos",
  WAREHOUSE_MANAGER: "/warehouse-transfers",
  ANALYST: "/dashboard",
};

export const routesForRole = (role: UserRole) =>
  appRoutes.filter((route) => route.roles.includes(role));

export const canAccessRoute = (role: UserRole, pathname: string) => {
  const route = appRoutes.find((item) =>
    pathname === item.href || pathname.startsWith(`${item.href}/`)
  );

  return !route || route.roles.includes(role);
};
