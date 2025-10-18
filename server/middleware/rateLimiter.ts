import { Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";
import { logEvents } from "./logger";

const loginRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // Limit each IP to 5 login requests per `window` per minute
  message: {
    message:
      "Too many attempts from this IP, please try again after a 60 second pause",
  },
  handler: (req: Request, res: Response, next: NextFunction, options: any) => {
    logEvents(
      `Too Many Requests: ${options.message.message}\t${req.method}\t${req.url}\t${req.headers.origin}`,
      "errLog.log"
    );
    res.status(options.statusCode).send(options.message);
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

const ddosLimiter = rateLimit({
  windowMs: 10 * 1000, // 10 second
  max: 30,
  message: {
    message:
      "Too many requests from this IP, please try again after a 10 second pause",
  },
  handler: (req: Request, res: Response, next: NextFunction, options: any) => {
    logEvents(
      `Too Many Requests: ${options.message.message}\t${req.method}\t${req.url}\t${req.headers.origin}`,
      "errLog.log"
    );
    res.status(options.statusCode).send(options.message);
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

export { loginRateLimiter, ddosLimiter };
