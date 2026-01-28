import { createApp } from "./app.js";

const PORT = process.env.APP_PORT || 3000;

const app = createApp();

app.listen(PORT, "0.0.0.0", () => {
  console.log(`API running on port ${PORT}`);
});
