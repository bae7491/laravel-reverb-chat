<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class ChatMessage extends Model implements HasMedia
{
    use HasFactory;
    use InteractsWithMedia;

    protected $fillable = [
      'chatroom_id',
      'sender_id',
      'sender_name',
      'text',
    ];

    public function sender() {
      return $this->belongsTo(User::class, 'sender_id');
    }

    public function receiver() {
      return $this->belongsTo(User::class, 'receiver_id');
    }
}
