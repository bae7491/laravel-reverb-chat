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
use App\Http\Controllers\MediaController;
use Illuminate\Support\Facades\Storage;
use ProtoneMedia\LaravelFFMpeg\Filters\WatermarkFactory;
use ProtoneMedia\LaravelFFMpeg\Support\FFMpeg;

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
    ->with(['sender', 'receiver', 'media']) 
    ->orderBy('id', 'asc')
    ->get();
})->middleware(['auth']);

Route::post('/messages/{chatRoom}', function (ChatRoom $chatRoom, Request $request) {
    $message = ChatMessage::create([
        'chatroom_id' => $chatRoom->id,
        'sender_id' => Auth::id(),
        'sender_name' => Auth::user()->name,
        'text' => request()->input('message'),
    ]);

    if ($request->hasFile('files')) {
      foreach ($request->file('files') as $file) {
        if (str_starts_with($file->getMimeType(), 'video/')) {
          // 파일 temp에 ㅋ저장
          $file->storeAs('temp', $file->getClientOriginalName(), 'local');

          // 변환 후 저장 경로
          $outputFileName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME) . '_converted.mp4';
          $outputPath = "temp/{$outputFileName}";

          // FFmpeg 변환
          FFMpeg::fromDisk('local')
            ->open('temp/' . $file->getClientOriginalName())
            ->export()
            ->toDisk('local')
            ->addFilter('-vf', 'scale=720:480') // 비디오 리사이즈 필터 추가
            ->inFormat(new \FFMpeg\Format\Video\X264('aac', 'libx264'))
            ->addWatermark(function (WatermarkFactory $watermark) {
              $watermark->fromDisk('public')
                ->open('logo.png')
                ->right(25)
                ->bottom(25);
            })
            ->save($outputPath);

          $videoPath = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME) . '.mp4';
            
          // // 원본 파일 덮어쓰기
          Storage::disk('local')->delete('temp/' . $file->getClientOriginalName());
          Storage::disk('local')->move($outputPath, "temp/{$videoPath}");

          // Media Library에 파일 추가
          $media = $message->addMedia(storage_path("app/private/temp/{$videoPath}"))
            ->toMediaCollection('attachments');

          // 파일 URL을 custom_properties에 추가
          $media->setCustomProperty('original_url', $media->getUrl())
            ->save();
        } else {
          $media = $message->addMedia($file)
            ->toMediaCollection('attachments');
    
          // 파일 URL을 custom_properties에 추가
          $media->setCustomProperty('original_url', $media->getUrl())
            ->save();
        }
      }
    }

    $messageWithMedia = $message->load('media');

    broadcast(new MessageSent($messageWithMedia))->toOthers();

    return response()->json([
        'message' => $messageWithMedia,
    ]);
});

Route::get('/download/{media}', [MediaController::class, 'download'])->name('media.download');

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
    return response()->json(['error' => '잘못된 방 이름이나 비밀번호를 입력했습니다! 다시 확인해주세요.'], 401);
  }

  return response()->json(['message' => '접속을 환영합니다!', 'chatRoom' => $chatRoom]);
});

require __DIR__.'/auth.php';
