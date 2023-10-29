const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mysql = require('mysql');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  port: 8888,
  
  user: 'adminlc',
  password: 'adminlc',
  database: 'chat_app',
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed: ' + err.message);
  } else {
    console.log('Connected to the database');
  }
});

// Socket.io setup
io.on('connection', (socket) => {
  console.log('A user connected');

  // Handle chat messages
  socket.on('chat message', (data) => {
    const { username, message } = data;
    const sql = 'INSERT INTO messages (username, message) VALUES (?, ?)';
    db.query(sql, [username, message], (err, result) => {
      if (err) {
        console.error('Error inserting message: ' + err.message);
      } else {
        io.emit('chat message', data); // Broadcast the message to all connected clients
      }
    });
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
