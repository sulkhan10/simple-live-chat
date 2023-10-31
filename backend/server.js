const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const mysql = require("mysql");
const cors = require("cors");
const formatMessage = require("./utils/messages");
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
    cors: {
      origin: "http://localhost:4000", // Replace with your client's origin URL
      methods: ["GET", "POST"],
      allowedHeaders: ["Content-Type", "Authorization"],
    }
  }); // Add this closing parenthesis
  
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "websocket",
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed: " + err.message);
  } else {
    console.log("Connected to the database");
  }
});

// Set static folder
app.use(express.static(path.join(__dirname, "public")));

const botName = "ChatCord Bot";

// Rest of your code...

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
