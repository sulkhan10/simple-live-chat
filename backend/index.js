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

// MySQL connection
const db = mysql.createConnection({
  // host: "localhost",
  // port: 8889,
  // // port: 3306,
  // user: "root",
  // password: "",
  // database: "websocket",
  host: "localhost",
  port: 3306,

  user: "root",
  password: "",
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

  const sql = "SELECT * FROM roomChat";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Couldn't fetch room chat data from database", err);
    } else {
      socket.emit("connected", results);
    }
  }); 

  socket.on('join', (data) => {
    socket.join(data.room_id);
    console.log("you're joining room id " + data.room_id);
  });

  // Handle joining a room
  socket.on("joinRoom", (roomName) => {
    socket.join(roomName);
    console.log(`User ${socket.id} joined room: ${roomName}`);

    const sql = "SELECT DISTINCT * FROM messages WHERE roomName = ?"; // Define your SQL query
    db.query(sql, [roomName], (err, result) => {
      if (err) {
        console.error("Error fetching messages: " + err.message);
      } else {
        // Emit the result to the client
        socket.emit("roomMessages", result);
      }
    });
  });

  // Handle chat messages in a specific room
  // Handle chat messages in a specific room
  socket.on("message", (data) => {
  const { username, message, roomName } = data; // Extract roomName from the data
  console.log("Received message in room: " + message);
  const sql = "INSERT INTO messages (username, message, roomName) VALUES (?, ?, ?)"; // Include roomName in the query
  db.query(sql, [username, message, roomName], (err, result) => {
      if (err) {
          console.error("Error inserting message: " + err.message);
      } else {
          // Emit the message to all clients in the same room
            // io.to(roomName).emit("chat-message", data);
          io.to(data.roomName).emit("chat-message", data);  
      }
  });
  // const sql2 = "SELECT * FROM messages WHERE roomName = ?"; // Define your SQL query
});


  // Handle typing event in a specific room
  socket.on("typing", (data, roomName) => {
    socket.to(roomName).emit("typing", data);
  });

  // socket.on('fetchRoom', () => {
  //   const sql = 'SELECT DISTINCT roomName FROM messages '; // Define your SQL query
  
  //   db.query(sql, (err, result) => {
  //       if (err) {
  //           console.error("Error fetching messages: " + err.message);
  //       } else {
  //           // Emit the result to the client
  //           io.emit('roomData', result);
  //       }
  //   });

  // });

  // Handle leaving a room
  socket.on("leaveRoom", (roomName) => {
    socket.leave(roomName);
    console.log(`User ${socket.id} left room: ${roomName}`);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

server.listen(4000, () => {
  console.log("Server is running on http://localhost:4000");
});

