import express, { type Request, type Response, type NextFunction } from "express";
import { createServer } from "http";
import { registerRoutes } from "../server/routes";

const app = express();

app.use(
  express.json({
    verify: (req: any, _res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ extended: false }));

let initPromise: Promise<void> | null = null;

function ensureReady(): Promise<void> {
  if (!initPromise) {
    initPromise = (async () => {
      const httpServer = createServer(app);
      await registerRoutes(httpServer, app);

      app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
        if (res.headersSent) return next(err);
        const status = err.status || err.statusCode || 500;
        res.status(status).json({ message: err.message || "Internal Server Error" });
      });
    })();
  }
  return initPromise;
}

const handler = async (req: Request, res: Response): Promise<void> => {
  try {
    await ensureReady();
  } catch (err: any) {
    res.status(500).json({ message: "Server initialization failed", error: err?.message });
    return;
  }
  app(req, res);
};

export default handler;
module.exports = handler;
