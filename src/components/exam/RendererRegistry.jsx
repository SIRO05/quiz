import React from 'react'
import MCQ from './MCQ'
import Cloze from './Cloze'

export function detectQuestionType(q) {
  if (!q) return 'fallback'
  if (q.textLeft && q.textRight && typeof q.starIndex !== 'undefined') return 'cloze'
  if (Array.isArray(q.options) && typeof q.answer !== 'undefined') return 'mcq'
  return 'fallback'
}

export default function QuestionRenderer(props) {
  const { question } = props
  const type = detectQuestionType(question)

  switch (type) {
    case 'mcq':
      return <MCQ {...props} />
    case 'cloze':
      return <Cloze {...props} />
    default:
      return (
        <div>
          <div className="text-base mb-2">{question.text || question.textLeft || 'No text available'}</div>
        </div>
      )
  }
}
