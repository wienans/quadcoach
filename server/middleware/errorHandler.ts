import { Request, Response, NextFunction } from "express";
import { logEvents } from "./logger";
import {
  CollectionQueryInfrastructureError,
  CollectionQueryValidationError,
} from "../collectionQuery";

const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logEvents(
    `${err.name}: ${err.message}\t${req.method}\t${req.url}\t${req.headers.origin}`,
    "errLog.log"
  );
  console.error(err.stack);

  if (err instanceof CollectionQueryValidationError) {
    res.status(err.statusCode).json(err.serialize());
    return;
  }

  if (err instanceof CollectionQueryInfrastructureError) {
    res.status(err.statusCode).json({ message: err.message });
    return;
  }

  const status = res.statusCode >= 400 ? res.statusCode : 500;
  res.status(status).json({ message: err.message });
};

export default errorHandler;
