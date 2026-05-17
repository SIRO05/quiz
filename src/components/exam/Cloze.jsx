import React, { useState } from 'react'

const renderWithLineBreaks = (text) => {
  if (typeof text !== 'string') return text
  const parts = text.split('\n')
  return parts.flatMap((p, i) => (i < parts.length - 1 ? [p, <br key={i} />] : [p]))
}

function buildParts(text, hl) {
  const full = text ?? ''
  if (!hl || typeof hl.start !== 'number' || typeof hl.end !== 'number') return { before: full, highlight: null, after: '' }
  const start = Math.max(0, hl.start)
  const end = Math.min(full.length, hl.end)
  if (start >= end) return { before: full, highlight: null, after: '' }
  return { before: full.slice(0, start), highlight: full.slice(start, end), after: full.slice(end) }
}

export default function Cloze({ question, showAnswers = false, onAnswer }) {
  // If starIndex is present, treat as single-blank selection even if correctOrder exists.
  const hasStar = typeof question.starIndex === 'number'
  const isOrdering = !hasStar && Array.isArray(question.correctOrder) && question.correctOrder.length > 0
  const [selected, setSelected] = useState(isOrdering ? [] : null)

  const options = Array.isArray(question.options) ? question.options : []

  function handleSelectSingle(id) {
    setSelected(id)
    onAnswer?.(question.id, id)
  }

  function handleSelectOrder(id) {
    setSelected((prev) => {
      const exists = prev.includes(id)
      const next = exists ? prev.filter((x) => x !== id) : [...prev, id]
      onAnswer?.(question.id, next)
      return next
    })
  }

  const left = question.textLeft ?? ''
  const right = question.textRight ?? ''
  const star = typeof question.starIndex === 'number' ? question.starIndex : null

  return (
    <div className="max-w-2xl mx-auto">
      <div className="border rounded-lg p-6 bg-white dark:bg-night-surface shadow-sm">
        {question && (
          <div className="mb-3 text-sm text-gray-500 dark:text-night-text/60 text-left">{/* header could be injected by parent */}</div>
        )}

        <div className="min-h-[120px] flex flex-col items-center justify-center text-center">
          <div className="text-base leading-relaxed flex items-center justify-center gap-2">
            <span>{renderWithLineBreaks(left)}</span>

            <span className="inline-flex items-center gap-2">
              {Array.from({ length: question.underlinesCount ?? 4 }).map((_, i) => {
                const idx = i + 1
                const isStar = star === i
                return (
                  <span key={i} className="inline-block w-10 border-b border-gray-300 h-6 flex items-end justify-center">
                    <span className="text-sm">{isStar ? '*' : ''}</span>
                  </span>
                )
              })}
            </span>

            <span>{renderWithLineBreaks(right)}</span>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap justify-center gap-3">
          {options.map((opt) => {
            const o = buildParts(opt.text, opt.textHighlight)
            const isSelected = isOrdering ? selected.includes(opt.id) : selected === opt.id
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => (isOrdering ? handleSelectOrder(opt.id) : handleSelectSingle(opt.id))}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border transition ${isSelected ? 'bg-sky-100 border-sky-300' : 'bg-white dark:bg-night-surface border-gray-200 dark:border-white/10'}`}>
                  <span className="text-sm">
                  {renderWithLineBreaks(o.before)}
                  {o.highlight ? (
                    <>
                      {o.before && !/\s$/.test(o.before) ? ' ' : ''}
                      <span className="px-2 mx-1 underline decoration-yellow-300 decoration-2">{renderWithLineBreaks(o.highlight)}</span>
                      {o.after && !/^\s/.test(o.after) ? ' ' : ''}
                    </>
                  ) : null}
                  {renderWithLineBreaks(o.after)}
                </span>
                {showAnswers && question.answer === opt.id && <span className="ml-2 text-green-600">✓</span>}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
