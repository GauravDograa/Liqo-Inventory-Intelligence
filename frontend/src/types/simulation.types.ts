/* ===============================
   SIMULATION TRANSFER ITEM
================================= */

export interface SimulationTransferItem {
  product: string;
  category: string;

  fromStore: string;
  toStore: string;

  quantity: number;

  stockAgeDays: number;
  expectedRevenueImpact: number;
  expectedMarginImpact: number;
}


/* ===============================
   SIMULATION RESPONSE
================================= */

export interface SimulationResponse {
  success: boolean;
  data: SimulationTransferItem[];
}