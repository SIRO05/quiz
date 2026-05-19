// Утилита переноса строк
const renderWithLineBreaks = (text) => {
  if (typeof text !== 'string') return text
  const parts = text.split('\n')
  return parts.flatMap((p, i) => (i < parts.length - 1 ? [p, <br key={i} />] : [p]))
}

// Утилита для парсинга подсветки
function buildParts(text, hl) {
  const full = text ?? ''
  if (!hl || typeof hl.start !== 'number' || typeof hl.end !== 'number') {
    return { before: full, highlight: null, after: '' }
  }
  const start = Math.max(0, hl.start)
  const end = Math.min(full.length, hl.end)
  if (start >= end) return { before: full, highlight: null, after: '' }
  
  return { 
    before: full.slice(0, start), 
    highlight: full.slice(start, end), 
    after: full.slice(end) 
  }
}

export default function Cloze({ question, showAnswers = false, value = null, onChange, headerText }) {
  if (!question) return null

  const options = Array.isArray(question.options) ? question.options : []

  // Простая функция выбора (без сайд-эффектов внутри setState)
  function handleSelect(id) {
    onChange?.(id)
  }

  const left = question.textLeft ?? ''
  const right = question.textRight ?? ''
  const star = typeof question.starIndex === 'number' ? question.starIndex : null

  return (
    <div className="max-w-2xl mx-auto">
      <div className="border rounded-lg p-6 bg-white dark:bg-night-surface shadow-sm">
        {/* Заголовок */}
        {headerText && (
          <div className="mb-3 text-sm text-gray-500 dark:text-night-text/60 text-left">
            {headerText}
          </div>
        )}
        
        {/* Текст с пропусками (блочный вывод, чтобы текст не ломался) */}
        <div className="min-h-[120px] flex flex-col items-center justify-center text-center">
          <div className="text-base leading-relaxed text-center">
            <span>{renderWithLineBreaks(left)}</span>

            <span className="inline-flex items-center gap-1 mx-2 align-middle">
              {Array.from({ length: question.underlinesCount ?? 4 }).map((_, i) => {
                const isStar = star === i
                return (
                  <span key={i} className="inline-block w-8 border-b-2 border-gray-400 h-6 text-center text-sm font-bold text-sky-500">
                    {isStar ? '*' : ''}
                  </span>
                )
              })}
            </span>

            <span>{renderWithLineBreaks(right)}</span>
          </div>
        </div>

        {/* Варианты ответов */}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {options.map((opt) => {
            const o = buildParts(opt.text, opt.textHighlight)
            const isSelected = value === opt.id
            
            // Если showAnswers активен, ищем правильный ответ либо в correctOrder, либо в answer
            const isCorrect = Array.isArray(question.correctOrder)
              ? question.correctOrder.includes(opt.id)
              : question.answer === opt.id

            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleSelect(opt.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border transition cursor-pointer text-sm ${
                  isSelected 
                    ? 'bg-sky-100 border-sky-300 font-medium' 
                    : 'bg-white dark:bg-night-surface border-gray-200 dark:border-white/10'
                }`}
              >
                <span>
                  {renderWithLineBreaks(o.before)}
                  {o.highlight && (
                    <>
                      {o.before && !/\s$/.test(o.before) ? ' ' : ''}
                      <span className="px-1 mx-0.5 underline decoration-yellow-400 decoration-2 font-semibold">
                        {renderWithLineBreaks(o.highlight)}
                      </span>
                      {o.after && !/^\s/.test(o.after) ? ' ' : ''}
                    </>
                  )}
                  {renderWithLineBreaks(o.after)}
                </span>

                {/* Галочка правильного ответа */}
                {showAnswers && isCorrect && (
                  <span className="ml-1 text-green-600 font-bold">✓</span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}