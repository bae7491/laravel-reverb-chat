import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

import Video from "./Video";

export default function ChatComponent({ chatRoom, currentUser }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [deleteCompleted, setDeleteCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesContainer = useRef(null);

  // Scroll to the bottom whenever messages update
  useEffect(() => {
    if (messagesContainer.current) {
      messagesContainer.current.scrollTo({
        top: messagesContainer.current.scrollHeight,
        behavior: "smooth",
      });
    }

    const handleVideoLoaded = () => {
      if (messagesContainer.current) {
        messagesContainer.current.scrollTo({
          top: messagesContainer.current.scrollHeight,
          behavior: "smooth",
        });
      }
    };

    // 메시지에 포함된 모든 비디오에 로드 이벤트 리스너 추가
    const videos = messagesContainer.current?.querySelectorAll("video");
    videos?.forEach((video) => {
      video.addEventListener("loadeddata", handleVideoLoaded);
    });

    // Cleanup 이벤트 리스너
    return () => {
      videos?.forEach((video) => {
        video.removeEventListener("loadeddata", handleVideoLoaded);
      });
    };
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

  const sendMessageWithFiles = () => {
    if (newMessage.trim() === "") {
      alert("메시지를 입력해주세요!");
      return;
    }

    const formData = new FormData();
    formData.append("message", newMessage);
    formData.append("chat_room_id", chatRoom.id);

    selectedFiles.forEach((file, index) => {
      formData.append(`files[${index}]`, file);
    });

    setLoading(true);

    axios
      .post(`/messages/${chatRoom.id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        setMessages((prevMessages) => [...prevMessages, response.data.message]);
        setNewMessage("");
        setSelectedFiles([]);
        setLoading(false);
      })
      .catch((error) => {
        console.error("파일 업로드 중 오류 발생:", error);
        setLoading(false);
      });
  };


  const handleFileChange = (e) => {
    setSelectedFiles((prevFiles) => [...prevFiles, ...Array.from(e.target.files)]);
  };

  const onDeleteClick = (index) => {
    if (window.confirm("삭제하시겠습니까?")) {
      setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
      setDeleteCompleted(true);
    }
  }

  const onDeleteAllClick = () => {
    if (window.confirm("전체 삭제하시겠습니까?")) {
      setSelectedFiles([]);
      setDeleteCompleted(true);
    }
  }

  useEffect(() => {
    if (deleteCompleted) {
      alert("삭제되었습니다.")
      setDeleteCompleted(false);
    }
  });

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
                  {message.media && message.media.length > 0 && (
                    <div className="flex flex-col items-end space-y-2 mb-2">
                      {message.media.map((file, fileIndex) => (
                        <div
                          key={fileIndex}
                          className="flex justify-end"
                        >
                          {file.mime_type.startsWith("image/") ? (
                            // 이미지의 썸네일을 표시
                            <img
                              src={file.custom_properties.original_url}
                              alt={file.file_name}
                              className="max-w-[40%] p-2 object-contain block border rounded"
                            />
                          ) : file.mime_type.startsWith("video/") ? (
                            // <video className="p-2 object-contain block border rounded" controls>
                            //   <source src={file.custom_properties.original_url} />
                            // </video>
                            <Video src={file.custom_properties.original_url} />
                          ) : (
                            <div className="flex items-end gap-2 p-2 rounded border">
                              <span className="max-w-[600px] overflow-hidden text-ellipsis whitespace-nowrap">
                                {file.file_name}
                              </span>
                              <a
                                href={`/download/${file.id}`}
                                className="material-icons-outlined align-middle cursor-pointer"
                              >
                                download
                              </a>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="p-2 text-white bg-blue-500 rounded-lg max-w-[600px]">
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
                  {message.media && message.media.length > 0 && (
                    <div className="flex flex-col items-start space-y-1 mb-2">
                      {message.media.map((file, fileIndex) => (
                        <div
                          key={fileIndex}
                          className="flex justify-start"
                        >
                          {file.mime_type.startsWith("image/") ? (
                            // 이미지의 썸네일을 표시
                            <img
                              src={file.custom_properties.original_url}
                              alt={file.file_name}
                              className="max-w-[40%] p-2 object-contain block border rounded"
                            />
                          ) : file.mime_type.startsWith("video/") ? (
                            <video className="p-2 object-contain block border rounded" controls>
                              <source src={file.custom_properties.original_url} />
                            </video>
                          )
                            : (
                              <div className="flex items-end gap-2 p-2 rounded border">
                                <span className="max-w-[600px] overflow-hidden text-ellipsis whitespace-nowrap">
                                  {file.file_name}
                                </span>
                                <a
                                  href={`/download/${file.id}`}
                                  className="material-icons-outlined align-middle cursor-pointer"
                                >
                                  download
                                </a>
                              </div>
                            )}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="p-2 bg-gray-200 rounded-lg max-w-[600px] break-words">
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
      <div className="flex items-center pt-6">
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
              sendMessageWithFiles();
            }
          }}
          placeholder="메시지를 입력"
          className="flex-1 px-2 py-1 border rounded-lg"
        />
        <button
          onClick={sendMessageWithFiles}
          className={
            `px-4 py-1 ml-2 rounded-lg text-white ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500"}`
          }
          disabled={loading}
        >
          전송
        </button>
      </div>
      {loading ? (
        <div>
          <a>
            {loading ? "전송 중..." : ""}
          </a>
        </div>
      ) : null}
    </div>
  );
}
