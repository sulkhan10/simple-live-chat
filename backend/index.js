const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const mysql = require("mysql");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000", // Replace with your client's origin URL
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  },
});

// Allow specific origins and headers
// app.use(cors({
//     origin: 'http://localhost:3000', // Replace with the address of your client application
//     methods: 'GET,POST',
//     allowedHeaders: 'Content-Type,Authorization',
//   }));

//   app.use((req, res, next) => {
//     res.header('Access-Control-Allow-Origin', 'http://localhost:3000'); // Replace with the address of your client application
//     res.header('Access-Control-Allow-Methods', 'GET, POST');
//     res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//     next();
//   });

// MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  port: 8889,

  user: "adminlc",
  password: "adminlc",
  database: "chat_app",
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed: " + err.message);
  } else {
    console.log("Connected to the database");
  }
});

// Socket.io setup
io.on("connection", (socket) => {
  console.log("A user connected  " + socket.id);

  // Handle chat messages
  socket.on("message", (data) => {
    // console.log('Received message: ' + JSON.stringify(data));
    console.log("Received message: " + data);
    const { username, message } = data;
    const sql = "INSERT INTO messages (username, message) VALUES (?, ?)";
    db.query(sql, [username, message], (err, result) => {
      if (err) {
        console.error("Error inserting message: " + err.message);
      } else {
        // socket.broadcast.emit("chat-message", data); // Broadcast the message to all connected clients
        io.emit("chat-message", data); // Broadcast the message to all connected clients
      }
    });
  });

  // Handle typing event
  socket.on("typing", (data) => {
    socket.broadcast.emit("typing", data);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

server.listen(4000, () => {
  console.log("Server is running on http://localhost:4000");
});
