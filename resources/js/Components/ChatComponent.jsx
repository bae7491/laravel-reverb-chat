import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

export default function ChatComponent({ chatRoom, currentUser }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const messagesContainer = useRef(null);

  console.log(selectedFiles);

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

  const handleFileChange = (e) => {
    setSelectedFiles((prevFiles) => [...prevFiles, ...Array.from(e.target.files)]);
  };

  const sendFile = () => {
    console.log('sendFile');
  }

  const onDeleteClick = (index) => {
    console.log('deleted Clicked');
    console.log(index);
    setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  }

  const onDeleteAllClick = () => {
    setSelectedFiles([]);
  }

  return (
    <div>
      <div className="flex flex-col justify-end h-full max-h-[calc(100vh-400px)]">
        <div
          ref={messagesContainer}
          className="overflow-y-auto max-h-fit px-5"
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
      {selectedFiles != ""
        ? <div className="flex items-center justify-between">
          <div className="flex gap-4 py-2 overflow-x-auto whitespace-nowrap items-center">
            {/* 파일 목록 */}
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-2 border p-2 rounded"
              >
                <span className="text-gray-700">{file.name}</span>
                <button
                  onClick={() => onDeleteClick(index)}
                  className="material-icons-outlined align-middle cursor-pointer text-red-500"
                >
                  delete
                </button>
              </div>
            ))}
          </div>
          {/* 전체 삭제 버튼 */}
          <div className="flex-shrink-0 items-center">
            <button
              onClick={onDeleteAllClick}
              className="ml-4 px-4 py-2 bg-red-500 text-white rounded-lg cursor-pointer"
            >
              전체 삭제
            </button>
          </div>
        </div>
        : null
      }
      <div className="flex items-center pt-2">
        <input
          type="file"
          multiple
          onChange={handleFileChange}
          className="hidden"
          id="file-input"
        />
        <label htmlFor="file-input" className="material-icons-outlined pr-2 py-1 cursor-pointer">
          upload_file
        </label>
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
