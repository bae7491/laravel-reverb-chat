import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage, Link } from '@inertiajs/react';

export default function Dashboard() {
  // Inertia에서 전달된 props 가져오기
  const { props } = usePage();
  const { chatRooms } = props;

  return (
    <AuthenticatedLayout
      header={
        <h2 className="text-xl font-semibold leading-tight text-gray-800">
          Dashboard
        </h2>
      }
    >
      <Head title="Dashboard" />

      <div className="py-12">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex justify-end mb-6">
            <Link
              className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
              type="button"
              href={'/createchatroom'}
            >
              채팅방 생성
            </Link>
          </div>
          <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
            <div className="p-6 text-gray-900">
              {chatRooms != null
                ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {chatRooms.slice().reverse().map((chatroom) => (
                    <Link
                      key={chatroom.id}
                      href={`/joinchatroom/${chatroom.id}`}
                      className="block"
                    >
                      <div
                        key={chatroom.id}
                        className="p-4 bg-white shadow-sm rounded-lg border border-gray-200"
                      >
                        <h2 className="font-semibold text-lg text-gray-800">{chatroom.name}</h2>
                      </div>
                    </Link>
                  ))}
                </div>
                : <div className="text-center text-xl text-gray-700">
                  생성된 채팅방이 없습니다!
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
