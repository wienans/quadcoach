import { format } from "date-fns";
import { v4 as uuid } from "uuid";
import fs from "fs";
import fsPromises from "fs/promises";
import path from "path";
import { Request, Response, NextFunction } from "express";

const logEvents = async (
  message: string,
  logFileName: string
): Promise<void> => {
  const dateTime: string = format(new Date(), "yyyy-MM-dd\tHH:mm:ss");
  const logItem: string = `${dateTime}\t${uuid()}\t${message}\n`;

  try {
    const logDirectory = path.join(__dirname, "..", "logs");
    if (!fs.existsSync(logDirectory)) {
      await fsPromises.mkdir(logDirectory);
    }
    await fsPromises.appendFile(path.join(logDirectory, logFileName), logItem);
  } catch (err) {
    console.log(err);
  }
};

const logger = (req: Request, res: Response, next: NextFunction): void => {
  logEvents(`${req.method}\t${req.url}\t${req.headers.origin}`, "reqLog.log");
  console.log(`${req.method} ${req.path}`);
  next();
};
export default logger;
export { logEvents, logger };
