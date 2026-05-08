import { DarkModeToggle } from "./DarkModeToggle";

export function Navbar({ timer }) {
    return (
        // Добавляем враппер с фиксированным позиционированием, чтобы контейнер не прыгал
        <div className="sticky top-0 z-50 w-full px-4 pt-4"> 
            <nav className="flex justify-between items-center container mx-auto bg-journal-mint/80 dark:bg-night-surface/80 backdrop-blur-sm rounded-lg shadow-soft p-4 transition-colors duration-500">
                <h1 className="text-xl font-bold">QUIZ</h1>
                
                {/* Центрируем таймер и скрываем div, если его нет */}
                {timer && (
                    <div className="font-mono font-bold text-journal-accent dark:text-night-neon-blue">
                        {timer}
                    </div>
                )}

                <div>
                    <DarkModeToggle />
                </div>
            </nav>
        </div>
    )
}
