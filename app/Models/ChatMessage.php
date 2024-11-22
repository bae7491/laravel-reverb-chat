<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChatMessage extends Model
{
    use HasFactory;

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
