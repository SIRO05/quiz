import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import { normalizeTaskFile, readJson } from "../utils/jsonReader"
import { buildSelectedQuiz } from "../utils/quizBuilder"
import { useNavigate } from 'react-router-dom'
import { useExam } from '../contexts/ExamContext.jsx'

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

export function ModalSettings({ isOpen, onClose, url, title, children, preselectAll, selectionMode = "single" }) {
  const [loadedState, setLoadedState] = useState({ url: null, data: null })
  const [selectedUnits, setSelectedUnits] = useState(new Set())
  const [expandedLessons, setExpandedLessons] = useState(new Set())
  const [randomizeQuestions, setRandomizeQuestions] = useState(false)
  const [randomizeAnswers, setRandomizeAnswers] = useState(false)
  const [showAnswers, setShowAnswers] = useState(false)
  const navigate = useNavigate()
  const { setExam } = useExam()

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
            ? {
                tasks: results.flatMap((r) => r.tasks),
                description: results.map((r) => r.description).filter(Boolean).join(' — '),
              }
            : {
                lessons: results,
                description: results.map((r) => r.description).filter(Boolean).join(' — '),
              }
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
        if (isActive) {
          setLoadedState({ url, data: null })
        }
      }
    }

    fetchData()

    return () => {
      isActive = false
    }
  }, [isOpen, url, preselectAll])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose()
    }

    if (!isOpen) return

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  const hasLoadedData = loadedState.url === url && loadedState.data !== null

  const totalUnits = loadedState.data?.tasks?.length ?? 0
  const isAllSelected = selectedUnits.size === totalUnits && totalUnits > 0
  const isCustomExam = selectionMode === "custom"
  const isAllExam = selectionMode === "all"

  const toggleUnit = (unitId) => {
    const newSelected = new Set(selectedUnits)
    if (newSelected.has(unitId)) {
      newSelected.delete(unitId)
    } else {
      newSelected.add(unitId)
    }
    setSelectedUnits(newSelected)
  }

  const toggleLesson = (lessonId) => {
    const newExpanded = new Set(expandedLessons)
    if (newExpanded.has(lessonId)) {
      newExpanded.delete(lessonId)
    } else {
      newExpanded.add(lessonId)
    }
    setExpandedLessons(newExpanded)
  }

  const toggleCustomUnit = (lessonId, unitId) => {
    const key = `${lessonId}:${unitId}`
    const newSelected = new Set(selectedUnits)
    if (newSelected.has(key)) {
      newSelected.delete(key)
    } else {
      newSelected.add(key)
    }
    setSelectedUnits(newSelected)
  }

  const toggleCustomLessonUnits = (lesson) => {
    const unitKeys = lesson.tasks.map((unit) => `${lesson.url}:${unit.unit}`)
    const allSelected = unitKeys.every((key) => selectedUnits.has(key))
    const newSelected = new Set(selectedUnits)

    if (allSelected) {
      unitKeys.forEach((key) => newSelected.delete(key))
    } else {
      unitKeys.forEach((key) => newSelected.add(key))
    }

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

  const getSubmissionPayload = () => {
    const selectedQuiz = buildSelectedQuiz({
      data: loadedState.data,
      selectionMode,
      selectedUnits,
    })

    const basePayload = {
      mode: selectionMode,
      title,
      randomizeQuestions,
      randomizeAnswers,
      showAnswers,
      selectedQuiz,
    }

    if (isCustomExam) {
      return {
        ...basePayload,
        selectedUnitKeys: [...selectedUnits],
      }
    }

    return {
      ...basePayload,
      selectedUnitIds: [...selectedUnits],
    }
  }

  const handleSubmitForm = () => {
    const payload = getSubmissionPayload()
    // save into exam context and navigate to the runner
    try {
      setExam(payload)
      onClose()
      navigate('/testing')
    } catch (e) {
      // fallback: still offer download if something fails
      const jsonString = JSON.stringify(payload, null, 2)
      const blob = new Blob([jsonString], { type: 'application/json' })
      const blobUrl = URL.createObjectURL(blob)
      window.open(blobUrl, '_blank')
    }
  }

  const hasSelection = selectedUnits.size > 0

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-2 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-lg max-h-[92vh] overflow-hidden rounded-t-2xl sm:rounded-xl bg-white dark:bg-night-surface p-4 sm:p-6 shadow-2xl border border-gray-100 dark:border-white/10"
          >
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/10 pb-4 mb-4 gap-3">
              <h3 className="text-lg sm:text-xl font-medium text-gray-800 dark:text-night-text break-words">{title}</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:text-night-text/60 dark:hover:text-night-text transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="text-gray-600 dark:text-night-text/80 leading-relaxed max-h-[calc(92vh-88px)] overflow-y-auto pr-1 pb-4">
              {isAllExam ? (
                <div className="flex min-h-[220px] flex-col justify-between pt-4 pb-1">
                  <div className="flex flex-1 items-center justify-center px-4 text-center">
                    <p className="text-sm sm:text-base text-gray-500 dark:text-night-text/70">
                      Экзамен будет собран автоматически из всех доступных заданий.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleSubmitForm}
                    className="cursor-pointer inline-flex w-full items-center justify-center rounded-lg px-4 py-3 text-sm font-medium transition-all hover:scale-[1.01] active:scale-[0.99] bg-journal-accent text-white hover:opacity-90 animate-pulse"
                  >
                    Начать экзамен
                  </button>
                </div>
              ) : (
                <>
                  {children}
                  {selectionMode !== "single" && !hasLoadedData && url ? (
                    <p className="mt-2 text-sm text-gray-400 dark:text-night-text/60">Loading...</p>
                  ) : null}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                <div className="flex flex-col items-center">
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={randomizeQuestions}
                      onChange={() => setRandomizeQuestions(!randomizeQuestions)}
                      className="sr-only peer"
                      title="Рандомный порядок вопросов"
                    />
                    <div className="relative w-9 h-5 bg-gray-300 dark:bg-night-bg peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-400 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500"></div>
                  </label>
                  <span className="text-xs text-gray-500 dark:text-night-text/60 mt-1">Рандомные вопросы</span>
                </div>
                <div className="flex flex-col items-center">
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={randomizeAnswers}
                      onChange={() => setRandomizeAnswers(!randomizeAnswers)}
                      className="sr-only peer"
                      title="Рандомный порядок ответов"
                    />
                    <div className="relative w-9 h-5 bg-gray-300 dark:bg-night-bg peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-400 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500"></div>
                  </label>
                  <span className="text-xs text-gray-500 dark:text-night-text/60 mt-1">Рандомные ответы</span>
                </div>
                <div className="flex flex-col items-center">
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showAnswers}
                      onChange={() => setShowAnswers(!showAnswers)}
                      className="sr-only peer"
                      title="Показать ответы"
                    />
                    <div className="relative w-9 h-5 bg-gray-300 dark:bg-night-bg peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-400 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500"></div>
                  </label>
                  <span className="text-xs text-gray-500 dark:text-night-text/60 mt-1">Показать ответы</span>
                </div>
              </div>
              {isCustomExam ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-500 dark:text-night-text/60">Нажмите на урок, чтобы раскрыть юниты.</p>
                  {loadedState.data?.lessons?.map((lesson) => {
                    const lessonKey = lesson.url
                    const isExpanded = expandedLessons.has(lessonKey)

                    return (
                      <div key={lessonKey} className="rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-night-bg/40 overflow-hidden">
                        <button
                          type="button"
                          onClick={() => toggleLesson(lessonKey)}
                          className="flex w-full items-center justify-between gap-3 px-3 py-3 text-left"
                        >
                          <div className="min-w-0">
                            <p className="font-medium text-gray-800 dark:text-night-text truncate">{lesson.title}</p>
                            {lesson.description ? (
                              <p className="text-xs text-gray-500 dark:text-night-text/60 truncate">{lesson.description}</p>
                            ) : null}
                          </div>
                          <svg
                            className={`h-4 w-4 shrink-0 text-gray-500 dark:text-night-text/60 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>

                        {isExpanded ? (
                          <div className="border-t border-gray-200 dark:border-white/10 bg-white dark:bg-night-bg/60 px-3 py-3">
                            <div className="mb-4 p-3 border border-gray-200 dark:border-white/10 rounded-lg bg-gray-50 dark:bg-night-surface/60">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={lesson.tasks.every((unit) => selectedUnits.has(`${lessonKey}:${unit.unit}`))}
                                  onChange={() => toggleCustomLessonUnits(lesson)}
                                  className="w-4 h-4"
                                />
                                <span className="font-medium text-gray-700 dark:text-night-text cursor-pointer">Все юниты</span>
                              </label>
                            </div>
                            <div className="space-y-2">
                              {lesson.tasks.map((unit) => {
                                const unitKey = `${lessonKey}:${unit.unit}`
                                return (
                                  <label key={unitKey} className="flex items-center gap-2 cursor-pointer rounded-md px-2 py-2 hover:bg-gray-50 dark:hover:bg-night-bg">
                                    <input
                                      type="checkbox"
                                      checked={selectedUnits.has(unitKey)}
                                      onChange={() => toggleCustomUnit(lessonKey, unit.unit)}
                                      className="w-4 h-4"
                                    />
                                    <span className="text-sm text-gray-700 dark:text-night-text">Unit {unit.unit}</span>
                                  </label>
                                )
                              })}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    )
                  })}
                  <AnimatePresence>
                    {hasSelection ? (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="sticky bottom-0 pt-3 pb-1 bg-white/95 dark:bg-night-surface/90 backdrop-blur-sm"
                      >
                        <button
                          type="button"
                          onClick={handleSubmitForm}
                          className="cursor-pointer inline-flex w-full items-center justify-center rounded-lg px-4 py-3 text-sm font-medium transition-all hover:scale-[1.01] active:scale-[0.99] bg-journal-accent text-white hover:opacity-90 animate-pulse"
                        >
                          Нажми на меня
                        </button>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              ) : isAllExam || selectionMode === "single" ? (
                <form action="">
                  {totalUnits > 0 && (
                    <div className="mb-4 p-3 border border-gray-200 dark:border-white/10 rounded-lg bg-gray-50 dark:bg-night-bg/40">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isAllSelected}
                          onChange={toggleAllUnits}
                          className="w-4 h-4"
                        />
                        <span className="font-medium text-gray-700 dark:text-night-text cursor-pointer">Все юниты</span>
                      </label>
                    </div>
                  )}
                  {loadedState.data?.tasks?.map((unit) => (
                      <div key={unit.unit} className="mb-2 p-2 flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-night-bg rounded cursor-pointer">
                          <input
                            type="checkbox"
                            id={`unit-${unit.unit}`}
                            checked={selectedUnits.has(unit.unit)}
                            onChange={() => toggleUnit(unit.unit)}
                            className="w-4 h-4"
                          />
                          <label htmlFor={`unit-${unit.unit}`} className="cursor-pointer flex-1 dark:text-night-text">
                            Unit {unit.unit}
                          </label>
                       </div>
                          ))}
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={handleSubmitForm}
                      disabled={!hasSelection}
                      className="cursor-pointer inline-flex w-full items-center justify-center rounded-lg px-4 py-3 text-sm font-medium transition-all hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 bg-journal-accent text-white hover:opacity-90 animate-pulse disabled:animate-none"
                    >
                      Нажми на меня
                    </button>
                  </div>
                </form>
              ) : null}
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}