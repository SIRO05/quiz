const identity = (value) => value

const isPlainObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value)

export async function readJson(url, normalize = identity) {
  if (!url) return null

  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to load JSON from ${url}`)
    }

    const data = await response.json()
    return normalizeJson(data, normalize)
  } catch (error) {
    console.error(`Error reading JSON from ${url}:`, error)
    return null 
  }
}

export function normalizeJson(data, normalize = identity) {
  if (Array.isArray(data)) {
    return data.map((item) => normalize(item)) 
  }

  if (isPlainObject(data)) {
    return normalize(data)
  }

  return data
}

export function normalizeIndexTask(task = {}) {
  const taskNumber = task.task ?? null

  return {
    task: taskNumber,
    url: task.url ?? "",
    title: task.title ?? (taskNumber ? `Task ${taskNumber}` : "Task"),
    description: task.description ?? "",
  }
}

export function normalizeTaskFile(taskFile = {}) {
  return {
    description: taskFile.description ?? "",
    grade: taskFile.grade ?? null,
    tasks: Array.isArray(taskFile.tasks)
      ? taskFile.tasks.map(normalizeUnit)
      : [],
  }
}

function normalizeUnit(unit = {}) {
  const unitPassage = unit.passage ?? ""

  return {
    unit: unit.unit ?? null,
    passage: unitPassage,
    questions: Array.isArray(unit.questions)
      ? unit.questions.map((q) => normalizeQuestion(q, unitPassage))
      : [],
  }
}

function normalizeQuestion(question = {}, unitPassage = "") {
  return {
    id: question.id ?? null,
    text: question.text ?? unitPassage,
    textLeft: question.textLeft ?? "",
    textRight: question.textRight ?? "",
    starIndex: question.starIndex ?? null,
    textHighlight: normalizeTextHighlight(question.textHighlight),
    options: Array.isArray(question.options)
      ? question.options.map(normalizeOption)
      : [],
    answer: question.answer ?? null,
    correctOrder: Array.isArray(question.correctOrder)
      ? [...question.correctOrder]
      : null,
  }
}

function normalizeOption(option = {}) {
  return {
    id: option.id ?? null,
    text: option.text ?? "",
    textHighlight: normalizeTextHighlight(option.textHighlight),
  }
}

function normalizeTextHighlight(textHighlight) {
  if (!isPlainObject(textHighlight)) {
    return null
  }

  return {
    start: textHighlight.start ?? null,
    end: textHighlight.end ?? null,
  }
}