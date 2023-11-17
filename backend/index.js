const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const mysql = require("mysql");
const cors = require("cors");
const { v4: uuidV4 } = require("uuid");
const md5 = require("md5");
const axios = require("axios").default;
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*", // Replace with your client's origin URL
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  },
});

// MySQL connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB,
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
  socket.removeAllListeners();
  console.log("A user connected  " + socket.id);

  const sql =
    "SELECT lokasi_lemasmil_id, nama_lokasi_lemasmil FROM lokasi_lemasmil";
  // const sql = "SELECT * FROM roomchat";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Couldn't fetch room chat data from database", err);
    } else {
      // console.log(results);
      socket.emit("connected", results);
    }
  });

  // Handle joining a room
  socket.on("joinRoom", (roomName) => {
    socket.join(roomName);
    // console.log(`User ${socket.id} joined room: ${roomName.roomName}`);

    const sql = "SELECT DISTINCT * FROM messages WHERE roomName = ?"; // Define your SQL query
    db.query(sql, [roomName], (err, result) => {
      if (err) {
        console.error("Error fetching messages: " + err.message);
      } else {
        // Emit the result to the client
        io.to(roomName).emit("roomMessages", result);
      }
    });
  });

  // Handle chat messages in a specific room
  socket.on("message", (data) => {
    const { username, message, roomName, file, fileName } = data; // Extract roomName from the data
    const message_id = uuidV4();
    console.log(typeof file);
    if (typeof file === "undefined") {
      console.log("insert to db");
      const sql =
        "INSERT INTO messages (id, username, message, roomName) VALUES (?, ?, ?)"; // Include roomName in the query
      db.query(
        sql,
        [message_id, username, message, roomName],
        (err, result) => {
          if (err) {
            console.error("Error inserting message: " + err.message);
          } else {
            // Emit the message to all clients in the same room
          }
        }
      );
      io.to(data.roomName).emit("chat-message", data);
    } else {
      const messages_file_id = uuidV4();
      const extension = "." + fileName.split(".").pop();
      const fileBase64 = Buffer.from(file).toString("base64");
      const serverPath = process.env.SAVE_PATH + md5(fileName) + extension;
      const dbPath = process.env.DB_PATH + md5(fileName) + extension;
      // console.log(serverPath);
      axios
        .post(
          "https://dev.transforme.co.id/siram_admin_api/siram_api/message_file_upload.php",
          {
            messages_file_id: messages_file_id,
            message_id: message_id,
            username: username,
            message: message,
            roomName: roomName,
            fileBase64: fileBase64,
            fileName: fileName,
            serverPath: serverPath,
            dbPath: dbPath,
          }
        )
        .then((response) => {
          console.log(response.data);
        })
        .catch((err) => {
          console.error(err);
        });
    }
  });

  // Handle typing event in a specific room
  // socket.on("typing", (data, roomName) => {
  //   socket.to(roomName).emit("typing", data);
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
  console.log("Server is running on port 4000");
});
