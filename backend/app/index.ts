import http from "http";
import { Server } from "socket.io";
import express, { Request, Response } from "express";
import cors from "cors";
import chatRouter from "./routers/chatRouter";

const app = express();
const server = http.createServer(app);
export const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:4402",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());
app.get("/ping", (req, res) => {
  res.send("We are live");
});
app.use("/api/chat", chatRouter);

server.listen(3000, () => console.log("Server is running on port 3000"));
