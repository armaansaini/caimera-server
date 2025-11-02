import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import { evaluateExpression, generateExpression } from "./utils/index.js";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for development, restrict in production
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 5000;

const roomMembers = [];
const scores = {};

let question = generateExpression();
let currentAnswer = evaluateExpression(question);

let questionAnswered = false;

const checkCorrect = (userAnswer) => {
  if (userAnswer == currentAnswer) return true;
  return false;
};

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("join:room", (data) => {
    socket.user = data.user;
    if (!roomMembers.includes(data.user)) {
      roomMembers.push(data.user);
      scores[data.user] = 0;
    }

    socket.emit("question:current", {
      question,
    });

    socket.emit("room:status", {
      question,
      winner: false,
    });

    io.emit("users:list", {
      users: roomMembers.map((m) => ({ name: m, score: scores[m] })),
    });
  });

  socket.on("answer", (data) => {
    const answerReceivedTime = new Date().getTime();

    if (checkCorrect(data.answer) && !questionAnswered) {
      questionAnswered = true;
      scores[data.user] = (scores[data.user] || 0) + 10;

      io.emit("user:answer", {
        user: data.user,
        answer: data.answer,
        isCorrect: true,
        timestamp: answerReceivedTime,
      });

      io.emit("room:status", {
        question,
        scores,
      });

      setTimeout(() => {
        question = generateExpression();
        currentAnswer = evaluateExpression(question);
        questionAnswered = false;
        io.emit("question:current", { question });
        console.log({ currentAnswer });
      }, 1500);
    } else {
      io.emit("user:answer", {
        user: data.user,
        answer: data.answer,
        isCorrect: false,
        timestamp: answerReceivedTime,
      });
    }
  });

  socket.on("disconnect", () => {
    const index = roomMembers.indexOf(socket.user);
    if (index !== -1) roomMembers.splice(index, 1);
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
