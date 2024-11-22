import React, { useState } from "react";
import axios from "axios";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";

export default function CreateChatRoom() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("/chatroom", { name, password });
      alert(`"${response.data.chatRoom.name}" 채팅 방이 생성되었습니다!`);
      router.visit('dashboard');
    } catch (error) {
      alert("Error creating chat room: " + error.response.data.message);
    }
  };

  return (
    <AuthenticatedLayout
      header={
        <h2 className="text-xl font-semibold leading-tight text-gray-800">
          채팅방 추가하기
        </h2>
      }
    >
      <Head title="CreateChatRoom" />

      <div className="py-12">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
            <div className="p-6 text-gray-900">
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label className="sm:px-6">방 이름:</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-6">
                  <label className="sm:px-6">비밀번호:</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <button
                  className='px-4 py-1 ml-2 text-white bg-blue-500 rounded-lg'
                  type="submit"
                >
                  채팅방 생성
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>


    </AuthenticatedLayout>

  );
}
