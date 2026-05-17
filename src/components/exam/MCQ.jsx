import React, { useMemo, useState } from 'react'
import { shuffleArray } from '../../utils/shuffle'

const renderWithLineBreaks = (text) => {
  if (typeof text !== 'string') return text
  const parts = text.split('\n')
  return parts.flatMap((p, i) => (i < parts.length - 1 ? [p, <br key={i} />] : [p]))
}

export default function MCQ({ question, globalRandomizeAnswers = false, showAnswers = false, onAnswer, headerText }) {
  const [selected, setSelected] = useState(null)

  const options = useMemo(() => {
    if (!Array.isArray(question.options)) return []
    // shallow copy so shuffle doesn't mutate original
    return globalRandomizeAnswers ? shuffleArray([...question.options]) : question.options
  }, [question.options, globalRandomizeAnswers])

  function handleSelect(id) {
    setSelected(id)
    onAnswer?.(question.id, id)
  }

  const buildTextParts = () => {
    const full = question.text ?? `${question.textLeft || ''}${question.textRight || ''}`
    const hl = question.textHighlight
    if (!hl || typeof hl.start !== 'number' || typeof hl.end !== 'number') return { before: full, highlight: null, after: '' }

    const start = Math.max(0, hl.start)
    const end = Math.min(full.length, hl.end)
    if (start >= end) return { before: full, highlight: null, after: '' }

    return {
      before: full.slice(0, start),
      highlight: full.slice(start, end),
      after: full.slice(end),
    }
  }

  const parts = buildTextParts()

  const buildOptionParts = (opt) => {
    const full = opt?.text ?? ''
    const hl = opt?.textHighlight
    if (!hl || typeof hl.start !== 'number' || typeof hl.end !== 'number') return { before: full, highlight: null, after: '' }

    const start = Math.max(0, hl.start)
    const end = Math.min(full.length, hl.end)
    if (start >= end) return { before: full, highlight: null, after: '' }

    return {
      before: full.slice(0, start),
      highlight: full.slice(start, end),
      after: full.slice(end),
    }
  }

    return (
      <div className="max-w-2xl mx-auto">
        <div className="border rounded-lg p-6 bg-white dark:bg-night-surface shadow-sm">
              {headerText ? (
                <div className="mb-3 text-sm text-gray-500 dark:text-night-text/60 text-left">
                  {headerText}
                </div>
              ) : null}

              <div className="min-h-[120px] flex flex-col items-center justify-center text-center">
                <div className="text-base leading-relaxed">
                  {renderWithLineBreaks(parts.before)}
                    {parts.highlight ? (
                      <>
                        {parts.before && !/\s$/.test(parts.before) ? ' ' : ''}
                        <span className="px-2 mx-1 underline decoration-white-300 decoration-2 underline-offset-4">{renderWithLineBreaks(parts.highlight)}</span>
                        {parts.after && !/^\s/.test(parts.after) ? ' ' : ''}
                      </>
                    ) : null}
                    {renderWithLineBreaks(parts.after)}
                </div>
              </div>

          <ul className="mt-4 flex flex-wrap justify-center gap-3">
        {options.map((opt) => (
          <li key={opt.id}>
                <label className={`inline-flex items-center gap-3 px-4 py-2 rounded-full border transition-colors ${selected === opt.id ? 'bg-sky-100 border-sky-300' : 'bg-white dark:bg-night-surface border-gray-200 dark:border-white/10'}`}>
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    value={opt.id}
                    checked={selected === opt.id}
                    onChange={() => handleSelect(opt.id)}
                    className="sr-only"
                  />
                  {(() => {
                    const o = buildOptionParts(opt)
                    if (!o.highlight) return <span className="text-sm">{renderWithLineBreaks(o.before)}</span>
                    return (
                      <span className="text-sm">
                        {renderWithLineBreaks(o.before)}
                          {o.before && !/\s$/.test(o.before) ? ' ' : ''}
                          <span className="px-2 mx-1 underline decoration-white-300 decoration-2 underline-offset-4">{renderWithLineBreaks(o.highlight)}</span>
                          {o.after && !/^\s/.test(o.after) ? ' ' : ''}
                          {renderWithLineBreaks(o.after)}
                      </span>
                    )
                  })()}
                  {showAnswers && question.answer === opt.id && (
                    <span className="ml-2 text-green-600">✓</span>
                  )}
                </label>
          </li>
        ))}
      </ul>
      </div>
    </div>
  )
}
