import { useState } from "react";
import * as WebSocket from "websocket";
import "./style.scss";

interface ChatroomProps {
  socket: WebSocket.w3cwebsocket;
  originalWord: string;
  RoomID: string
  setSolved?: (solved: boolean) => void;
  messages: Array<string>;
  setMessages: (messages: Array<string>) => void;
  playerTurnDrawing: boolean;
}

export default function Chatroom({ socket, originalWord, RoomID, setSolved, messages, setMessages, playerTurnDrawing }: ChatroomProps) {
  const [message, setMessage] = useState<string>("");

  const handleSendMessage = () => {
    if (originalWord && originalWord === message) {
      setSolved?.(true);
      setMessages([...messages, `${localStorage.getItem("username")} has found the word !`]);
      socket.send(JSON.stringify({ type: "userFoundWord", Nickname: localStorage.getItem("username"), RoomID: parseInt(RoomID) }));
    } else {
      socket.send(JSON.stringify({ type: "text", message, Nickname: localStorage.getItem("username") }));
    }

    setMessage("");
  };

  return (
    <div className="chatroom-root">
      <div className="chatroom-messages">
        {messages.map((message, index) => (
          <div key={index} className="chatroom-message">
            {message}
          </div>
        ))}
      </div>
      {!playerTurnDrawing && <div className="chatroom-input">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button onClick={() => handleSendMessage()}>Send</button>
      </div>}
    
    </div>
  );
}
