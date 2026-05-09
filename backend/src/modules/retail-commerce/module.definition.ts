import { ModuleDefinition } from "../../shared/types/module";

export const retailCommerceModules: ModuleDefinition[] = [
  {
    name: "brands",
    basePath: "/retail/brands",
    description: "Brand master data boundary.",
  },
  {
    name: "categories",
    basePath: "/retail/categories",
    description: "Category hierarchy boundary.",
  },
  {
    name: "products",
    basePath: "/retail/products",
    description: "Product master data and GST attributes boundary.",
  },
  {
    name: "stores",
    basePath: "/retail/stores",
    description: "Retail store master data boundary.",
  },
  {
    name: "inventory",
    basePath: "/retail/inventory",
    description: "Store-wise inventory and reorder level boundary.",
  },
  {
    name: "customers",
    basePath: "/retail/customers",
    description: "Customer profile and GST billing boundary.",
  },
  {
    name: "transactions",
    basePath: "/retail/transactions",
    description: "Transaction, line item, invoice, and payment boundary.",
  },
];
