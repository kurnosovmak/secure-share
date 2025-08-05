<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UploadLink;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DownloadController extends Controller
{
    /**
     * Скачивание файла по одноразовой ссылке.
     */
    public function download(string $linkId): Response|StreamedResponse
    {
        $link = UploadLink::where('link_id', $linkId)->firstOrFail();

        // Проверка наличия файла
        if ($link->status !== 'uploaded') {
            if ($link->status === 'downloaded') {
                return response()->json(['error' => 'Ссылка уже использована'], 410);
            }
            if ($link->status === 'expired') {
                return response()->json(['error' => 'Срок действия ссылки истек'], 410);
            }
            return response()->json(['error' => 'Файл не найден'], 404);
        }

        // Проверка существования файла
        $filePath = 'uploads/' . $link->filename;
        if (!Storage::disk('private')->exists($filePath)) {
            return response()->json(['error' => 'Файл не найден'], 404);
        }

        // Обновление статуса ссылки
        $link->status = 'downloaded';
        $link->save();

        // Отправка файла
        return Storage::disk('private')->download(
            $filePath,
            $link->original_filename,
            ['Content-Type' => $link->mime_type]
        );
    }

    /**
     * Получение информации о файле по одноразовой ссылке.
     */
    public function info(string $linkId): JsonResponse
    {
        $link = UploadLink::where('link_id', $linkId)->first();

        if ($link === null) {
            return response()->json(['error' => 'Ссылка не найдена или файл не существует'], 404);
        }

        // Проверка наличия файла
        if ($link->status === 'waiting_for_upload') {
            return response()->json(['error' => 'Файл еще не загружен'], 401);
        }

        if ($link->status === 'expired') {
            return response()->json(['error' => 'Срок действия ссылки истек'], 410);
        }

        // Проверка существования файла
        $filePath = 'uploads/' . $link->filename;
        if (!Storage::disk('private')->exists($filePath)) {
            return response()->json(['error' => 'Файл не найден'], 404);
        }

        return response()->json([
            'id' => $link->link_id,
            'status' => $link->status,
            'created_at' => $link->created_at,
            'expired_at' => $link->expires_at,
            'filename' => $link->original_filename,
            'file_size' => $link->file_size,
            'mime_type' => $link->mime_type
        ]);
    }
}
