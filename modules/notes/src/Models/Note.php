<?php

namespace Notes\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Attributes\UseFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Notes\Database\Factories\NoteFactory;

#[Fillable(['session_id', 'title'])]
#[Hidden(['session_id'])]
#[UseFactory(NoteFactory::class)]
class Note extends Model
{
    /** @use HasFactory<NoteFactory> */
    use HasFactory;
}
