import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:3000'); // Make sure the server URL matches your setup

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    socket.on('chat message', (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });
  }, []);

  const handleSendMessage = () => {
    if (username && message) {
      socket.emit('chat message', { username, message });
      setMessage('');
    }
  };

  return (
    <div>
      <ul>
        {messages.map((msg, index) => (
          <li key={index}>{msg.username}: {msg.message}</li>
        ))}
      </ul>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="text"
        placeholder="Message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={handleSendMessage}>Send</button>
    </div>
  );
}
