<?php

use App\Events\MessageSent;
use App\Http\Controllers\ProfileController;
use App\Models\ChatMessage;
use App\Models\ChatRoom;
use Illuminate\Foundation\Application;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard', [
      'chatRooms' => ChatRoom::all(),
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::get('/chatroom/{chatRoom}', function (ChatRoom $chatRoom) {
    return Inertia::render('Chat/Chat', [
        'chatRoom' => $chatRoom,
        'currentUser' => Auth::user(),
    ]);
})->middleware(['auth'])->name('chat');

Route::get('/messages/{chatRoom}', function (ChatRoom $chatRoom) {
  return ChatMessage::query()
    ->where(function ($query) use ($chatRoom) {
      $query->where('chatroom_id', $chatRoom->id);
    })
    ->with(['sender', 'receiver']) 
    ->orderBy('id', 'asc')
    ->get();
})->middleware(['auth']);

Route::post('/messages/{chatRoom}', function (ChatRoom $chatRoom) {
  $message = ChatMessage::create([
    'chatroom_id' => $chatRoom->id,
    'sender_id' => Auth::id(),
    'sender_name' => Auth::user()->name,
    'text' => request()->input('message'),
  ]);

  broadcast(new MessageSent($message));

  return $message;
});

Route::get('/createchatroom', function() {
  return Inertia::render('Chat/CreateChatRoom');
});

Route::post('/chatroom', function (Request $request) {
  $request->validate([
    'name' => 'required|string|max:255',
    'password' => 'required|string|min:4|max:25',
  ]);

  $chatRoom = ChatRoom::create([
    'name' => $request->name,
    'password' => Hash::make($request->password),
  ]);

  return response()->json(['chatRoom' => $chatRoom], 201);
});

Route::get('/joinchatroom/{chatRoom}', function(ChatRoom $chatRoom) {
  return Inertia::render('Chat/JoinChatRoom', [
    'chatRoom' => $chatRoom,
  ]);
});

Route::post('chatroom/join', function (Request $request) {
  $request->validate([
    'name' => 'required|string',
    'password' => 'required|string',
  ]);

  $chatRoom = ChatRoom::where('name', $request->name)->first();

  if (!$chatRoom || !Hash::check($request->password, $chatRoom->password)) {
    return response()->json(['error' => 'Invalid room name or password'], 401);
  }

  return response()->json(['message' => 'Access grated', 'chatRoom' => $chatRoom]);
});

require __DIR__.'/auth.php';
