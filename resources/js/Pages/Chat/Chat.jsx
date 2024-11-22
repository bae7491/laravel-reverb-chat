import ChatComponent from "@/Components/ChatComponent";
import Dropdown from "@/Components/Dropdown";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, usePage } from '@inertiajs/react';

export default function Chat() {
  // Inertia에서 전달된 props 가져오기
  const { props } = usePage();
  const { chatRoom, currentUser } = props;

  return (
    <AuthenticatedLayout
      header={
        <h2 className="text-xl font-semibold leading-tight text-gray-800">
          {chatRoom.name}
        </h2>
      }
    >
      <Head title="ChatRoom" />

      <div className="py-12">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
            <div className="p-6 text-gray-900">
              <ChatComponent chatRoom={chatRoom} currentUser={currentUser} />
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
