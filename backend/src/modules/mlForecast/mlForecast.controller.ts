import { Request, Response } from "express";
import { AuthRequest } from "../../types/auth.types";
import * as service from "./mlForecast.service";

export const getContract = async (
  _req: Request,
  res: Response
) => {
  res.json({
    success: true,
    data: service.getForecastContract(),
  });
};

export const predictMock = async (
  req: Request,
  res: Response
) => {
  const data = await service.predictMockForecast(req.body);

  res.json({
    success: true,
    data,
  });
};

export const getTrainingDataset = async (
  req: AuthRequest,
  res: Response
) => {
  const historyWindowDays = Number(req.query.historyWindowDays || 180);
  const horizonDays = Number(req.query.horizonDays || 30);
  const stepDays = Number(req.query.stepDays || 30);
  const data = await service.getTrainingDataset({
    organizationId: req.user!.organizationId,
    historyWindowDays,
    horizonDays,
    stepDays,
  });

  res.json({
    success: true,
    data,
  });
};

export const getModelSelection = async (
  _req: Request,
  res: Response
) => {
  const data = await service.getModelSelection();

  res.json({
    success: true,
    data,
  });
};

export const getModelHistory = async (
  _req: Request,
  res: Response
) => {
  const data = await service.getModelHistory();

  res.json({
    success: true,
    data,
  });
};
