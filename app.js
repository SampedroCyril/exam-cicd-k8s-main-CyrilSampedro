import express from "express";

export function createApp() {
  const app = express();

  const PORT = process.env.APP_PORT || 3000;
  const VERSION = process.env.APP_VERSION || "dev";

  app.use(express.json());

  app.get("/health", (req, res) => {
    res.status(200).json({
      status: "UP",
      version: VERSION
    });
  });

  app.get("/api/info", (req, res) => {
    res.json({
      app: "exam-devops",
      version: VERSION,
      timestamp: new Date().toISOString()
    });
  });

  return app;
}
