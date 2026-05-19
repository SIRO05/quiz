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

export default function Cloze({ question, showAnswers = false, value = null, onChange, headerText, isFinished }) {
  if (!question) return null

  const options = Array.isArray(question.options) ? question.options : []

  const hasAnswered = value !== null;
  const shouldShowFeedback = isFinished || (showAnswers && hasAnswered);
  const isInputDisabled = isFinished || (showAnswers && hasAnswered);

  // Простая функция выбора (без сайд-эффектов внутри setState)
  function handleSelect(id) {
    if (isInputDisabled) return;
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
            
            // answer holds the correct option ID for the starred position
            const isCorrect = question.answer === opt.id

            let itemClass = 'bg-white dark:bg-night-surface border-gray-200 dark:border-white/10 text-sm';

            if (shouldShowFeedback) {
              if (isCorrect) {
                itemClass = 'bg-green-100 border-green-500 text-green-900 shadow-sm text-sm';
              } else if (isSelected) {
                itemClass = 'bg-red-100 border-red-500 text-red-900 shadow-sm text-sm';
              }
            } else if (isSelected) {
              itemClass = 'bg-sky-100 border-sky-300 font-medium text-sm';
            }

            return (
              <label
                key={opt.id}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border transition-colors ${
                  isInputDisabled ? 'cursor-default opacity-90' : 'cursor-pointer'
                } ${itemClass}`}
              >
                <input
                  type="radio"
                  name={`cloze-${question.id}-${headerText}`}
                  value={opt.id}
                  checked={isSelected}
                  onChange={() => handleSelect(opt.id)}
                  disabled={isInputDisabled}
                  className="sr-only"
                />
                
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
                {shouldShowFeedback && isCorrect && (
                  <span className="ml-1 text-green-700 font-bold">✓</span>
                )}
              </label>
            )
          })}
        </div>

        {/* Правильное предложение (собирается по correctOrder) */}
        {shouldShowFeedback && Array.isArray(question.correctOrder) && question.correctOrder.length > 0 && (
          <div className="mt-8 p-4 bg-green-50 dark:bg-green-900/10 rounded-lg text-center border border-green-100 dark:border-green-800">
            <div className="text-xs text-green-600 dark:text-green-400 font-semibold mb-3 uppercase tracking-wider">
              Правильное предложение
            </div>
            <div className="text-base text-gray-800 dark:text-gray-200 leading-relaxed block">
              <span>{renderWithLineBreaks(left)}</span>
              
              <span className="inline-flex gap-1 mx-2 align-middle flex-wrap justify-center">
                {question.correctOrder.map((id, index) => {
                  const opt = options.find((o) => o.id === id)
                  const isStar = star === index
                  return (
                    <span 
                      key={id} 
                      className={`px-2 py-0.5 rounded border text-sm font-medium mx-0.5 ${
                        isStar 
                          ? 'bg-yellow-100 border-yellow-400 text-yellow-900 dark:bg-yellow-900/30 dark:text-yellow-200 dark:border-yellow-700' 
                          : 'bg-white border-green-300 text-green-800 dark:bg-night-surface dark:text-green-300 dark:border-green-800'
                      }`}
                    >
                      {opt ? opt.text : ''}
                    </span>
                  )
                })}
              </span>

              <span>{renderWithLineBreaks(right)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}