export function buildSelectedQuiz({ data, selectionMode, selectedUnits }) {
  if (!data) {
    return { tasks: [] }
  }

  const selectedSet = selectedUnits instanceof Set ? selectedUnits : new Set(selectedUnits ?? [])

  if (selectionMode === "custom") {
    const lessons = data.lessons ?? []
    const tasks = []

    lessons.forEach((lesson) => {
      const lessonTasks = lesson.tasks ?? []
      lessonTasks.forEach((unit) => {
        const key = `${lesson.url}:${unit.unit}`
        if (selectedSet.has(key)) {
          const passage = unit.passage ?? ""
          const questions = (unit.questions ?? []).map((question) => {
            if (question?.text === passage) {
              const { text, ...rest } = question
              return rest
            }
            return question
          })

          tasks.push({
            unit: unit.unit ?? null,
            passage,
            questions,
            lessonTitle: lesson.title ?? "",
            lessonUrl: lesson.url ?? "",
          })
        }
      })
    })

    return { tasks }
  }

  const tasks = (data.tasks ?? [])
    .filter((unit) => selectedSet.has(unit.unit))
    .map((unit) => {
      const passage = unit.passage ?? ""
      const questions = (unit.questions ?? []).map((question) => {
        if (question?.text === passage) {
          const { text, ...rest } = question
          return rest
        }
        return question
      })

      return {
        unit: unit.unit ?? null,
        passage,
        questions,
      }
    })

  return { tasks }
}
