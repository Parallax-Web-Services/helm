<?php

namespace App\Modules\Notes\Models;

use App\Modules\Notes\Database\Factories\NoteFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Attributes\UseFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['session_id', 'title'])]
#[Hidden(['session_id'])]
#[UseFactory(NoteFactory::class)]
class Note extends Model
{
    /** @use HasFactory<NoteFactory> */
    use HasFactory;
}
