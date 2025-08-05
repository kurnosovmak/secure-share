<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('upload_links', function (Blueprint $table) {
            $table->id();
            $table->string('link_id')->unique();
            $table->foreignId('user_id')->constrained();
            $table->string('filename')->nullable();
            $table->string('original_filename')->nullable();
            $table->string('mime_type')->nullable();
            $table->bigInteger('file_size')->nullable();
            $table->enum('status', ['waiting_for_upload', 'uploaded', 'expired', 'downloaded'])->default('waiting_for_upload');
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('upload_links');
    }
};