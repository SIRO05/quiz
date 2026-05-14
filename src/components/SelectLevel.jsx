import { useEffect, useRef, useState } from "react"

export function SelectLevel({ levels, value, onChange }) {
    const hasLevels = Array.isArray(levels) && levels.length > 0
    const [isOpen, setIsOpen] = useState(false)
    const wrapperRef = useRef(null)

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!wrapperRef.current || wrapperRef.current.contains(event.target)) {
                return
            }
            setIsOpen(false)
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const currentValue = value ?? (hasLevels ? levels[0] : "")

    const handleSelect = (nextValue) => {
        onChange?.(nextValue)
        setIsOpen(false)
    }

    return (
        <div className="flex items-center gap-3" ref={wrapperRef}>
            <div className="relative">
                <button
                    type="button"
                    onClick={() => hasLevels && setIsOpen((open) => !open)}
                    disabled={!hasLevels}
                    aria-haspopup="listbox"
                    aria-expanded={isOpen}
                    className="inline-flex items-center gap-3 rounded-full border border-black/10 bg-journal-cream px-4 py-2 text-sm font-semibold text-journal-text shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift focus:outline-none focus:ring-2 focus:ring-journal-accent/60 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 dark:border-white/10 dark:bg-night-surface dark:text-night-text"
                >
                    <span>{currentValue || "No levels"}</span>
                    <svg className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {isOpen ? (
                    <div
                        className="absolute left-0 mt-2 w-full min-w-[140px] overflow-hidden rounded-2xl border border-black/10 bg-white shadow-lift dark:border-white/10 dark:bg-night-surface"
                        role="listbox"
                    >
                        {levels.map((level) => (
                            <button
                                key={level}
                                type="button"
                                onClick={() => handleSelect(level)}
                                className={[
                                    "flex w-full items-center justify-between px-4 py-2 text-sm transition-colors text-journal-text dark:text-night-text",
                                    level === currentValue
                                        ? "bg-journal-peach/60 dark:bg-night-neon-blue/10"
                                        : "hover:bg-journal-cream dark:hover:bg-night-bg",
                                ].join(" ")}
                                role="option"
                                aria-selected={level === currentValue}
                            >
                                <span>{level}</span>
                                {level === currentValue ? (
                                    <span className="text-xs text-journal-text/60 dark:text-night-text/60">active</span>
                                ) : null}
                            </button>
                        ))}
                    </div>
                ) : null}
            </div>
        </div>
    )
}