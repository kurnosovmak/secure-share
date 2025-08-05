<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UploadLink;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class UploadLinkController extends Controller
{
    /**
     * Создание новой одноразовой ссылки для загрузки.
     */
    public function create(): JsonResponse
    {
        $link = new UploadLink([
            'link_id' => Str::random(10),
            'user_id' => Auth::id(),
            'status' => 'waiting_for_upload',
            'expires_at' => now()->addDay(), // Ссылка действительна 24 часа
        ]);

        $link->save();

        return response()->json([
            'id' => $link->link_id,
            'upload_url' => $link->upload_url,
            'status' => $link->status,
            'created_at' => $link->created_at,
        ], 201);
    }

    /**
     * Получение списка ссылок текущего пользователя.
     */
    public function index(): JsonResponse
    {
        $links = UploadLink::where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($link) {
                return [
                    'id' => $link->link_id,
                    'upload_url' => $link->upload_url,
                    'status' => $link->status,
                    'created_at' => $link->created_at,
                ];
            });

        return response()->json($links);
    }

    /**
     * Получение статуса ссылки.
     */
    public function status(string $linkId): JsonResponse
    {
        $link = UploadLink::where('link_id', $linkId)->firstOrFail();

        return response()->json([
            'id' => $link->link_id,
            'upload_url' => $link->upload_url,
            'status' => $link->status,
            'created_at' => $link->created_at,
        ]);
    }
}