<?php

use App\Models\ChatRoom;
use Illuminate\Support\Facades\Broadcast;

// Broadcast::channel('chatroom.{id}', function ($user, $id) {
//     return (int) $user->id === (int) $id;
// });

Broadcast::channel('chatroom.{id}', function ($user, $id) {
    // 사용자가 채팅방에 참가할 권한이 있는지 확인
    return ChatRoom::find($id) ? ['id' => $user->id, 'name' => $user->name] : false;
});

// Broadcast::channel('chatroom.{id}', function ($user, $id) {
//     return ChatRoom::find($id) ? true : false; // 인증된 사용자가 채팅방에 접근 가능
// });
