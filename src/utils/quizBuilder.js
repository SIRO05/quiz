export function buildSelectedQuiz({ data, selectionMode, selectedUnits }) {
  if (!data) {
    return { tasks: [] }
  }

  // Безопасное создание Set для быстрой проверки
  const selectedSet = selectedUnits instanceof Set 
    ? selectedUnits 
    : new Set(selectedUnits ?? [])

  // Вспомогательная функция для очистки вопросов от дубликатов текста
  const cleanQuestions = (questions, passage) => {
    return (questions ?? []).map((question) => {
      if (question?.text === passage) {
        const { text, ...rest } = question
        return rest
      }
      return { ...question }
    })
  }

  // РЕЖИМ: Custom
  if (selectionMode === "custom") {
    const lessons = data.lessons ?? []

    const tasks = lessons.flatMap((lesson) => {
      const lessonTasks = lesson.tasks ?? []

      return lessonTasks
        .filter((unit) => {
          const key = `${lesson.url}:${unit.unit}`
          return selectedSet.has(key)
        })
        .map((unit) => {
          const passage = unit.passage ?? ""
          return {
            unit: unit.unit ?? null,
            passage,
            questions: cleanQuestions(unit.questions, passage),
            lessonTitle: lesson.title ?? "",
            lessonUrl: lesson.url ?? "",
          }
        })
    })

    return { tasks }
  }

  // РЕЖИМ: Стандартный
  const tasks = (data.tasks ?? [])
    .filter((unit) => selectedSet.has(unit.unit))
    .map((unit) => {
      const passage = unit.passage ?? ""
      return {
        unit: unit.unit ?? null,
        passage,
        questions: cleanQuestions(unit.questions, passage),
      }
    })

  return { tasks }
}