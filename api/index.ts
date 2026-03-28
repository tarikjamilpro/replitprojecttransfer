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

// Begin initialization immediately on cold start
const initPromise = (async () => {
  const httpServer = createServer(app);
  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    if (res.headersSent) return next(err);
    const status = err.status || err.statusCode || 500;
    res.status(status).json({ message: err.message || "Internal Server Error" });
  });
})();

async function handler(req: Request, res: Response) {
  try {
    await initPromise;
  } catch (err: any) {
    res.status(500).json({ error: "Server initialization failed", message: err?.message });
    return;
  }
  app(req, res);
}

export default handler;
