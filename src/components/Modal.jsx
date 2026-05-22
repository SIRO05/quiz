import React, { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from 'react-router-dom'
import { useExam } from '../contexts/ExamContext.jsx'
import { normalizeTaskFile, readJson } from "../utils/jsonReader"
import { buildSelectedQuiz } from "../utils/quizBuilder"

const resolveSource = (source, index) => {
  if (typeof source === "string") {
    const fileName = source.split('/').filter(Boolean).pop()
    return {
      url: source,
      title: fileName?.replace(/\.json$/i, '') ?? `Lesson ${index + 1}`,
      description: '',
    }
  }
  return {
    url: source?.url ?? '',
    title: source?.title ?? `Lesson ${index + 1}`,
    description: source?.description ?? '',
  }
}

export const Modal = ({ isOpen, onClose, url, title, children, preselectAll, selectionMode = "single" }) => {
  const [loadedState, setLoadedState] = useState({ url: null, data: null })
  const [selectedUnits, setSelectedUnits] = useState(new Set())
  const [expandedLessons, setExpandedLessons] = useState(new Set())
  const [randomizeQuestions, setRandomizeQuestions] = useState(false)
  const [randomizeAnswers, setRandomizeAnswers] = useState(false)
  const [showAnswers, setShowAnswers] = useState(false)
  
  const navigate = useNavigate()
  const { setExam } = useExam()

  // Ma'lumotlarni yuklash logikasi
  useEffect(() => {
    if (!isOpen || !url) return
    let isActive = true
    const fetchData = async () => {
      setLoadedState({ url, data: null })
      try {
        let jsonData
        if (selectionMode === "all" || selectionMode === "custom") {
          const results = await Promise.all(url.map(async (source, index) => {
            const resolvedSource = resolveSource(source, index)
            const data = await readJson(resolvedSource.url, normalizeTaskFile)
            return {
              url: resolvedSource.url,
              title: resolvedSource.title,
              description: resolvedSource.description ?? data?.description ?? '',
              tasks: data?.tasks ?? [],
            }
          }))
          jsonData = selectionMode === "all"
            ? { tasks: results.flatMap((r) => r.tasks), description: results.map((r) => r.description).filter(Boolean).join(' — ') }
            : { lessons: results, description: results.map((r) => r.description).filter(Boolean).join(' — ') }
        } else {
          jsonData = await readJson(url, normalizeTaskFile)
        }
        if (isActive) {
          setLoadedState({ url, data: jsonData })
          if (preselectAll) {
            const allIds = new Set((jsonData?.tasks ?? []).map((u) => u.unit))
            setSelectedUnits(allIds)
          } else {
            setSelectedUnits(new Set())
            setExpandedLessons(new Set())
          }
        }
      } catch {
        if (isActive) setLoadedState({ url, data: null })
      }
    }
    fetchData()
    return () => { isActive = false }
  }, [isOpen, url, preselectAll, selectionMode])

  // Esc klavishasini eshitish
  useEffect(() => {
    const handleKeyDown = (e) => { if (e.key === "Escape") onClose() }
    if (!isOpen) return
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  const hasLoadedData = loadedState.url === url && loadedState.data !== null
  const totalUnits = loadedState.data?.tasks?.length ?? 0
  const isAllSelected = selectedUnits.size === totalUnits && totalUnits > 0
  const isCustomExam = selectionMode === "custom"
  const isAllExam = selectionMode === "all"
  const hasSelection = selectedUnits.size > 0

  // Toggle funksiyalari
  const toggleUnit = (unitId) => {
    const newSelected = new Set(selectedUnits);
    newSelected.has(unitId) ? newSelected.delete(unitId) : newSelected.add(unitId);
    setSelectedUnits(newSelected);
  }

  const toggleLesson = (lessonId) => {
    const newExpanded = new Set(expandedLessons);
    newExpanded.has(lessonId) ? newExpanded.delete(lessonId) : newExpanded.add(lessonId);
    setExpandedLessons(newExpanded);
  }

  const toggleCustomUnit = (lessonId, unitId) => {
    const key = `${lessonId}:${unitId}`;
    const newSelected = new Set(selectedUnits);
    newSelected.has(key) ? newSelected.delete(key) : newSelected.add(key);
    setSelectedUnits(newSelected);
  }

  const toggleCustomLessonUnits = (lesson) => {
    const unitKeys = lesson.tasks.map((unit) => `${lesson.url}:${unit.unit}`)
    const allSelected = unitKeys.every((key) => selectedUnits.has(key))
    const newSelected = new Set(selectedUnits)
    allSelected ? unitKeys.forEach(k => newSelected.delete(k)) : unitKeys.forEach(k => newSelected.add(k));
    setSelectedUnits(newSelected)
  }

  const toggleAllUnits = () => {
    if (isAllSelected) {
      setSelectedUnits(new Set())
    } else {
      const allUnitIds = new Set(loadedState.data?.tasks?.map((unit) => unit.unit) ?? [])
      setSelectedUnits(allUnitIds)
    }
  }

  const handleSubmitForm = () => {
    const selectedQuiz = buildSelectedQuiz({ data: loadedState.data, selectionMode, selectedUnits })
    const payload = {
      mode: selectionMode, title, randomizeQuestions, randomizeAnswers, showAnswers, selectedQuiz,
      [isCustomExam ? 'selectedUnitKeys' : 'selectedUnitIds']: [...selectedUnits]
    }
    try {
      setExam(payload); onClose(); navigate('/testing');
    } catch (e) {
      window.open(URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })), '_blank');
    }
  }

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 backdrop-blur-md bg-night-bg/40 animate-in fade-in duration-300">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white dark:bg-night-surface w-full max-w-lg rounded-[32px] overflow-hidden shadow-lift border border-white/20 flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="px-8 py-6 border-b border-journal-lavender dark:border-white/5 flex justify-between items-center bg-journal-mint/30 dark:bg-night-bg/30">
          <h2 className="text-xl font-black text-journal-text dark:text-night-text uppercase tracking-tight truncate pr-4">
            {title}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-journal-rose rounded-xl transition-colors text-journal-text dark:text-night-text shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-8 overflow-y-auto hide-scrollbar">
          {isAllExam ? (
            <div className="text-center py-6">
              <p className="text-journal-text dark:text-night-text/70 mb-8 font-medium">
                Ushbu imtihon barcha mavjud testlardan avtomatik tarzda yig'iladi.
              </p>
              <button onClick={handleSubmitForm} className="w-full py-4 bg-journal-accent text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-journal-accent/20 transition-transform active:scale-95">
                Imtihonni boshlash
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {children}
              
              {/* Settings Switches (Toggles) */}
              <div className="grid grid-cols-3 gap-2 bg-journal-mint/20 dark:bg-night-bg/20 p-4 rounded-2xl">
                {[
                  { label: 'Savollar', state: randomizeQuestions, set: setRandomizeQuestions },
                  { label: 'Javoblar', state: randomizeAnswers, set: setRandomizeAnswers },
                  { label: 'Yechimlar', state: showAnswers, set: setShowAnswers }
                ].map((toggle, i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <button 
                      onClick={() => toggle.set(!toggle.state)}
                      className={`w-12 h-6 rounded-full transition-colors relative ${toggle.state ? 'bg-journal-accent' : 'bg-gray-300 dark:bg-slate-700'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${toggle.state ? 'left-7' : 'left-1'}`} />
                    </button>
                    <span className="text-[10px] font-bold uppercase text-gray-500 dark:text-night-text/50">{toggle.label}</span>
                  </div>
                ))}
              </div>

              {/* Custom Selection Mode */}
              {isCustomExam ? (
                <div className="space-y-3">
                  {loadedState.data?.lessons?.map((lesson) => {
                    const isExpanded = expandedLessons.has(lesson.url);
                    return (
                      <div key={lesson.url} className="rounded-2xl border border-journal-lavender dark:border-white/5 overflow-hidden">
                        <button onClick={() => toggleLesson(lesson.url)} className="w-full flex justify-between items-center p-4 bg-white dark:bg-night-surface">
                          <span className="font-bold text-sm dark:text-night-text">{lesson.title}</span>
                          <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" /></svg>
                        </button>
                        {isExpanded && (
                          <div className="p-4 bg-journal-mint/10 dark:bg-night-bg/30 border-t border-journal-lavender dark:border-white/5 grid grid-cols-2 gap-2">
                            {lesson.tasks.map(unit => (
                              <button 
                                key={unit.unit}
                                onClick={() => toggleCustomUnit(lesson.url, unit.unit)}
                                className={`p-2 rounded-xl text-xs font-bold transition-all border ${selectedUnits.has(`${lesson.url}:${unit.unit}`) ? 'bg-journal-accent text-white border-journal-accent' : 'bg-white dark:bg-night-surface dark:text-night-text border-journal-lavender dark:border-white/10'}`}
                              >
                                Unit {unit.unit}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                /* Single Selection Mode */
                <div className="space-y-2">
                   {totalUnits > 0 && (
                    <button onClick={toggleAllUnits} className="w-full p-3 rounded-xl border-2 border-dashed border-journal-lavender dark:border-white/10 text-sm font-black uppercase text-journal-accent">
                      {isAllSelected ? "Hammasini bekor qilish" : "Barcha unitlarni tanlash"}
                    </button>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    {loadedState.data?.tasks?.map((unit) => (
                      <button 
                        key={unit.unit}
                        onClick={() => toggleUnit(unit.unit)}
                        className={`p-3 rounded-xl text-sm font-bold transition-all border ${selectedUnits.has(unit.unit) ? 'bg-journal-accent text-white border-journal-accent' : 'bg-gray-50 dark:bg-night-bg/40 dark:text-night-text border-transparent'}`}
                      >
                        Unit {unit.unit}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Start Button */}
              <button 
                disabled={!hasSelection && !isAllExam}
                onClick={handleSubmitForm}
                className="w-full py-4 mt-4 bg-journal-accent disabled:bg-gray-300 dark:disabled:bg-slate-800 text-white rounded-2xl font-black uppercase tracking-widest transition-transform active:scale-95 shadow-lg shadow-journal-accent/20"
              >
                {hasSelection ? `Boshlash (${selectedUnits.size})` : 'Tanlang'}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>,
    document.body
  )
}