import { shuffleArray } from './shuffle'

// Вспомогательная функция для очистки вопросов от дубликатов текста
// (если text вопроса совпадает с passage — убираем его, чтобы не дублировать в рендере)
function cleanQuestions(questions, passage) {
  return (questions ?? []).map((question) => {
    if (question?.text === passage) {
      const { text, ...rest } = question
      return rest
    }
    return { ...question }
  })
}

// Находит наиболее часто встречающееся значение в массиве чисел
// (используется, чтобы понять "стандартное" число вопросов в одном раунде задания)
function mostCommonCount(counts) {
  if (!counts.length) return null

  const freq = new Map()
  let best = counts[0]
  let bestFreq = 0

  counts.forEach((count) => {
    const freqCount = (freq.get(count) ?? 0) + 1
    freq.set(count, freqCount)
    if (freqCount > bestFreq) {
      bestFreq = freqCount
      best = count
    }
  })

  return best
}

export function buildSelectedQuiz({ data, selectionMode, selectedUnits }) {
  if (!data) {
    return { tasks: [] }
  }

  // Безопасное создание Set для быстрой проверки
  const selectedSet = selectedUnits instanceof Set 
    ? selectedUnits 
    : new Set(selectedUnits ?? [])

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

// РЕЖИМ: Экзамен (selectionMode: "all")
// Собирает один "псевдо-полный" экзамен из всех 9 типов заданий (問題1...問題9).
// Для каждого типа задания берётся "стандартное" количество вопросов на раунд
// (наиболее частое среди всех юнитов этого типа):
//  - flat-тип (нет общего passage, вопросы независимы друг от друга, напр. 漢字読み) —
//    вопросы случайно набираются из ОБЩЕГО пула всех юнитов этого типа и перемешиваются,
//    то есть вопрос №1 может быть взят из юнита 4, а вопрос №2 — из юнита 7.
//  - passage-тип (вопросы — это пронумерованные пропуски внутри одного текста, напр. 文章の文法) —
//    нельзя смешивать вопросы из разных юнитов, т.к. они привязаны к конкретному тексту,
//    поэтому случайно выбирается один целый юнит (текст + все его вопросы) целиком.
export function buildExamQuiz({ data }) {
  const lessons = data?.lessons ?? []

  if (!lessons.length) {
    return { tasks: [] }
  }

  const tasks = lessons
    .map((lesson) => {
      const lessonUnits = lesson.tasks ?? []
      if (!lessonUnits.length) return null

      const isPassageBased = lessonUnits.some((unit) => unit.passage)

      if (isPassageBased) {
        const unit = lessonUnits[Math.floor(Math.random() * lessonUnits.length)]
        const passage = unit.passage ?? ""

        return {
          unit: unit.unit ?? null,
          passage,
          questions: cleanQuestions(unit.questions, passage),
          lessonTitle: lesson.title ?? "",
          lessonUrl: lesson.url ?? "",
        }
      }

      // Пул всех вопросов этого типа задания по всем юнитам, с пометкой исходного юнита
      const pool = lessonUnits.flatMap((unit) =>
        (unit.questions ?? []).map((question) => ({ ...question, sourceUnit: unit.unit ?? null }))
      )

      if (!pool.length) return null

      const counts = lessonUnits.map((unit) => (unit.questions ?? []).length).filter(Boolean)
      const targetCount = mostCommonCount(counts) ?? pool.length
      const sampleSize = Math.min(targetCount, pool.length)

      const sampled = shuffleArray([...pool]).slice(0, sampleSize)

      return {
        unit: null,
        passage: "",
        questions: sampled,
        lessonTitle: lesson.title ?? "",
        lessonUrl: lesson.url ?? "",
      }
    })
    .filter(Boolean)

  return { tasks }
}