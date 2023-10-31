import { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:4000');

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [roomName] = useState(''); // Set your room name here
  const [isTyping, setIsTyping] = useState(false);
  const messagesRef = useRef(null);

  useEffect(() => {
    messagesRef.current.scrollTop = messagesRef.current.scrollHeight;

    socket.on('chat-message', (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    socket.on('typing', (data) => {
      setIsTyping(data.typing);
    });
  }, []);

  const handleSendMessage = () => {
    if (username && message) {
      socket.emit('message', { username, message, roomName });
      setMessage('');
    }
  };

  const handleTyping = () => {
    if (message) {
      socket.emit('typing', { typing: true, username, roomName });
    } else {
      socket.emit('typing', { typing: false, username, roomName });
    }
  };

  return (
    <div className="flex h-screen bg-gray-300">
      <div className="w-1/2 mx-auto mt-4 p-4 border border-gray-300 rounded shadow bg-gray-200">
        <div className='flex justify-center items-center gap-4 mb-2'>
          <p className="w-1/3 p-2 font-extrabold text-xl rounded text-cyan-800">
            CHAT APP SUGOI
          </p>
          <input
            type="text"
            className="w-1/3 p-2 border border-gray-300 rounded text-cyan-600"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="h-[80vh] border border-gray-300 p-4 rounded overflow-y-auto" ref={messagesRef}>
          {messages.map((msg, index) => (
            <div key={index} className={`my-2 ${msg.username === username ? 'justify-end' : 'justify-start'}`}>
              <div className={`rounded p-2 ${msg.username === username ? 'bg-green-100' : 'bg-blue-100'}`}>
                <p className={`font-bold ${msg.username === username ? 'text-green-900' : 'text-blue-900'}`}>{msg.username}</p>
                <p className={`${msg.username === username ? 'text-green-900' : 'text-blue-900'}`}>{msg.message}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex">
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded text-cyan-900"
            placeholder="Message"
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              handleTyping();
            }}
          />
          <button
            className="p-2 bg-blue-500 text-white rounded ml-2"
            onClick={handleSendMessage}
          >
            Send
          </button>
        </div>
        {isTyping && <p className="text-gray-500 mt-2">{username} is typing...</p>}
      </div>
    </div>
  );
}
