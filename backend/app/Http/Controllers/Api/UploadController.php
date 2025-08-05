<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UploadLink;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class UploadController extends Controller
{
    /**
     * Загрузка файла по одноразовой ссылке.
     */
    public function upload(Request $request, string $linkId): JsonResponse
    {
        $link = UploadLink::where('link_id', $linkId)->firstOrFail();

        // Проверка статуса ссылки
        if ($link->status !== 'waiting_for_upload') {
            if ($link->status === 'uploaded') {
                return response()->json(['error' => 'Файл уже загружен'], 409);
            }
            return response()->json(['error' => 'Недействительная или просроченная ссылка'], 400);
        }

        // Проверка срока действия
        if ($link->expires_at && $link->expires_at->isPast()) {
            $link->status = 'expired';
            $link->save();
            return response()->json(['error' => 'Срок действия ссылки истек'], 400);
        }

        // Валидация файла
        $request->validate([
            'file' => 'required|file|max:104857600', // Максимум 100MB
        ]);

        $file = $request->file('file');
        $originalFilename = $file->getClientOriginalName();
        $filename = $linkId . '_' . time() . '.' . $file->getClientOriginalExtension();

        // Сохранение файла
        $path = $file->storeAs('uploads', $filename, 'private');

        // Обновление информации о ссылке
        $link->filename = $filename;
        $link->original_filename = $originalFilename;
        $link->mime_type = $file->getMimeType();
        $link->file_size = $file->getSize();
        $link->status = 'uploaded';
        $link->save();

        return response()->json(['message' => 'Файл успешно загружен']);
    }
}