import "./env.js";
import { createServer } from "http";
import { initSocket } from "./services/notificationService.js";
import connectdb from "./config/db.js";
import app from "./app.js";

const PORT = process.env.PORT || 3000;
const server = createServer(app);

connectdb();
initSocket(server);

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
