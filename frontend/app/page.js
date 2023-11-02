"use client";
import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:4000");

export default function Home() {
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  // const [room, setRoom] = useState([1, 2]);
  const [room, setRoom] = useState([]);
  const [roomName] = useState("satu");
  const [roomMessages, setRoomMessages] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const messagesRef = useRef(null);
  let room_id = "1";

  useEffect(() => {
    messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    // socket.emit("fetchRoom", null);

    socket.on("connected", async (results) => {
      console.log(results, "room connected");
      setRoom(results);
    })

    socket.on("roomData", async (data) => {
      console.log(data, "roomData");
      await setRoom(data);
      await console.log(room, "room");
    });
    socket.on("chat-message", (data) => {
      // // console.log(data, "chat-message cihuauaha");
      // console.log(data.selectedRoom, "selectedRoom");
      // console.log(selectedRoom, "selectedRoom apasi");
      // console.log(roomMessages, "roomMessages");
      // console.log(data, "data");
      // console.log(roomMessages, "roomMessages");
      if (data.selectedRoom == selectedRoom) {
        setRoomMessages((prevMessages) => [...prevMessages, data]);
        // let prevdata = roomMessages;
        // console.log(prevdata, "prevdata");
        // prevdata.push(data);
        // setRoomMessages(prevdata);
      // socket.emit("joinRoom", selectedRoom);
      }
    });
    socket.on("roomMessages", (data) => {
      console.log(data, "roomMessages");
      // setRoomMessages(data);
    });
  }, [roomName]);

  const handleSendMessage = () => {
    if (username && message) {
      socket.emit("message", { username, message, roomName: selectedRoom });
      setMessage("");
      socket.emit("joinRoom", selectedRoom);
    }
  };

  return (
    <div className="flex h-screen bg-gray-300">
      <div className="w-3/4 mx-auto mt-4 p-4 border border-gray-300 rounded shadow bg-gray-200">
        <div className="flex justify-center items-center gap-4 mb-2">
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
        <div className="flex gap-4">
          <div
            className="h-[80vh] w-1/3  border-4 border-gray-500 p-4 rounded overflow-y-auto"
            ref={messagesRef}
          >
            {room.map((data, index) => (
              <p
                className={`${
                  data == selectedRoom ? "bg-green-200" : ""
                } p-2 font-extrabold text-lg rounded text-cyan-800 cursor-pointer hover:bg-green-300 ease-in-out w-full  `}
                onClick={(e) => {
                  e.preventDefault();
                  setSelectedRoom(data.roomChat_id);
                  socket.emit("joinRoom", data.roomChat_id);
                  console.log(data.roomChat_name, "clicked");
                  // socket.emit("fetchRoom", null);
                  // console.log(data.roomName, "roomName");
                }}
              >
                {data.roomChat_name}
              </p>
            ))}
          </div>
          <div
            className="h-[80vh] w-2/3 border-4 border-gray-300 p-4 rounded overflow-y-auto"
            ref={messagesRef}
          >
            {roomMessages.map((roomMessage, index) => (
              <div
                key={index}
                className={`my-2 ${
                  roomMessage.username === username ? "justify-end text-right" : "justify-start"
                }`}
              >
                <div
                  className={`rounded p-2 ${
                    roomMessage.username === username ? "bg-green-100 text-right" : "bg-blue-100"
                  }`}
                >
                  <p
                    className={`font-bold ${
                      roomMessage.username === username
                        ? "text-green-900"
                        : "text-blue-900"
                    }`}
                  >
                    {roomMessage.username}
                  </p>
                  <p
                    className={`${
                      roomMessage.username === username
                        ? "text-green-900"
                        : "text-blue-900"
                    }`}
                  >
                    {roomMessage.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* {room_id === room && ( // Conditionally render based on room_id
          <div id='chat_screen' className="h-[80vh] border border-gray-300 p-4 rounded overflow-y-auto" ref={messagesRef}>
            {messages.map((msg, index) => (
              <div key={index} className={`my-2 ${msg.username === username ? 'text-right' : 'text-left'}`}>
                <div className={`rounded p-2 bg-${msg.username === username ? 'green' : 'blue'}-100`}>
                  <p className={`font-bold text-gray-900`}>{msg.username}</p>
                  <p className={`text-gray-900`}>{msg.message}</p>
                </div>
              </div>
            ))}
          </div>
        )} */}
        <div className="mt-4 flex">
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded text-cyan-900"
            placeholder="Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button
            className="p-2 bg-blue-500 text-white rounded ml-2"
            onClick={handleSendMessage}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
