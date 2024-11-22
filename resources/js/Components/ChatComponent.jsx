import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

export default function ChatComponent({ chatRoom, currentUser }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesContainer = useRef(null);

  // Scroll to the bottom whenever messages update
  useEffect(() => {
    if (messagesContainer.current) {
      messagesContainer.current.scrollTo({
        top: messagesContainer.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  // Fetch initial messages and setup Echo listeners
  useEffect(() => {
    axios.get(`/messages/${chatRoom.id}`).then((response) => {
      setMessages(response.data);
    });

    const channel = window.Echo.private(`chatroom.${chatRoom.id}`);

    channel.listen("MessageSent", (response) => {
      if (response.message.sender_id !== currentUser.id) {
        setMessages((prevMessages) => [...prevMessages, response.message]);
      }
    });

    // Cleanup Echo listeners on component unmount
    return () => {
      channel.stopListening("MessageSent");
    };
  }, [chatRoom.id]);

  // Handle sending a new message
  const sendMessage = () => {
    if (newMessage.trim() === "") {
      alert("메시지를 입력해주세요!");
      return;
    }

    axios
      .post(`/messages/${chatRoom.id}`, {
        message: newMessage,
      })
      .then((response) => {
        setMessages((prevMessages) => [...prevMessages, response.data]);
        setNewMessage("");
      });
  };

  return (
    <div>
      <div className="flex flex-col justify-end h-80">
        <div
          ref={messagesContainer}
          className="p-4 overflow-y-auto max-h-fit"
        >
          {messages.map((message, index) => (
            <div
              key={`${message.id}-${index}`}
              className={`flex items-center mb-2 ${message.sender_id === currentUser.id ? "justify-end" : ""
                }`}
            >
              {message.sender_id === currentUser.id ? (
                <div className="flex flex-col items-end mb-2">
                  <div className="p-2 text-white bg-blue-500 rounded-lg">
                    {message.text}
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(message.created_at).toLocaleString()}
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-start mb-2">
                  <strong className="text-sm text-gray-700">
                    {message.sender_name}
                  </strong>
                  <div className="p-2 bg-gray-200 rounded-lg max-w-max break-words">
                    {message.text}
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(message.created_at).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.nativeEvent.isComposing) {
              sendMessage();
            }
          }}
          placeholder="메시지를 입력"
          className="flex-1 px-2 py-1 border rounded-lg"
        />
        <button
          onClick={sendMessage}
          className="px-4 py-1 ml-2 text-white bg-blue-500 rounded-lg"
        >
          전송
        </button>
      </div>
    </div>
  );
}
