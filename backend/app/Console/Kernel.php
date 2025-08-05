<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Определение команд приложения.
     */
    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');
    }

    /**
     * Определение расписания команд приложения.
     */
    protected function schedule(Schedule $schedule): void
    {
        // Запуск команды очистки файлов каждый день в 00:00
        $schedule->command('files:cleanup')->everyTenMinutes();
    }
}