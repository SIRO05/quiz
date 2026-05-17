import React, { createContext, useContext, useEffect, useState } from 'react'

const ExamContext = createContext(null)

export function ExamProvider({ children }) {
  const [exam, setExam] = useState(() => {
    try {
      const raw = sessionStorage.getItem('exam.payload')
      return raw ? JSON.parse(raw) : null
    } catch (e) {
      return null
    }
  })

  useEffect(() => {
    try {
      if (exam) sessionStorage.setItem('exam.payload', JSON.stringify(exam))
      else sessionStorage.removeItem('exam.payload')
    } catch (e) {
      // ignore
    }
  }, [exam])

  const clearExam = () => setExam(null)

  return (
    <ExamContext.Provider value={{ exam, setExam, clearExam }}>
      {children}
    </ExamContext.Provider>
  )
}

export function useExam() {
  const ctx = useContext(ExamContext)
  if (!ctx) throw new Error('useExam must be used inside ExamProvider')
  return ctx
}

export default ExamContext
