<?php

namespace App\Console\Commands;

use App\Models\UploadLink;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class CleanupFilesCommand extends Command
{
    /**
     * Имя и сигнатура консольной команды.
     *
     * @var string
     */
    protected $signature = 'files:cleanup';

    /**
     * Описание консольной команды.
     *
     * @var string
     */
    protected $description = 'Удаление файлов старше 1 дня';

    /**
     * Выполнение консольной команды.
     */
    public function handle()
    {
        $this->info('Начало очистки старых файлов...');
        
        // Получаем дату, которая была 1 день назад
        $oneDayAgo = Carbon::now()->subDay();
        
        // Находим все записи, созданные более 1 дня назад
        $oldLinks = UploadLink::where('created_at', '<', $oneDayAgo)        
            ->get();
        
        $this->info("Найдено {$oldLinks->count()} файлов для удаления.");
        
        $deletedCount = 0;
        $errorCount = 0;
        
        foreach ($oldLinks as $link) {
            $filePath = 'uploads/' . $link->filename ?? 'none.none';
            
            // Проверяем существование файла
            if (Storage::disk('private')->exists($filePath)) {
                try {
                    // Удаляем файл
                    Storage::disk('private')->delete($filePath);
                    
                    // Обновляем статус ссылки
                    $link->status = 'expired';
                    $link->delete();
                    
                    $deletedCount++;
                    $this->line("Удален файл: {$link->original_filename}");
                } catch (\Exception $e) {
                    $errorCount++;
                    $this->error("Ошибка при удалении файла {$link->original_filename}: {$e->getMessage()}");
                    Log::error("Ошибка при удалении файла", [
                        'file' => $link->original_filename,
                        'error' => $e->getMessage()
                    ]);
                }
            } else {
                // Файл не существует, но обновляем статус ссылки
                $link->status = 'expired';
                $link->delete();
                $this->line("Файл не найден, статус обновлен: {$link->original_filename}");
            }
        }
        
        $this->info("Очистка завершена. Удалено файлов: {$deletedCount}, ошибок: {$errorCount}");
        
        return 0;
    }
}