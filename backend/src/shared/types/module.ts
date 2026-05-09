import { Router } from "express";

export type ModuleDefinition = {
  name: string;
  basePath: string;
  router?: Router;
  description?: string;
};
