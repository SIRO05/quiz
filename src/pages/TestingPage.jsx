import React from 'react'
import { Link } from 'react-router-dom'
import QuestionRenderer from '../components/exam/RendererRegistry'
import { useExam } from '../contexts/ExamContext'
import { Navbar } from '../components/Navbar'

const TestingPage = () => {
    const { exam, clearExam } = useExam()

    if (!exam || !exam.selectedQuiz) {
        return (
            <div className="p-6">
                <h2 className="text-2xl mb-4">No exam loaded</h2>
                <p className="mb-4">Start an exam from the Home page (open modal and submit configuration).</p>
                <Link to="/" className="px-4 py-2 rounded bg-sky-500 text-white">Go Home</Link>
            </div>
        )
    }

    const { selectedQuiz, randomizeQuestions, randomizeAnswers, showAnswers, title } = exam

    // flatten tasks -> questions for single-page rendering
    const items = []
    selectedQuiz.tasks.forEach((task) => {
        (task.questions || []).forEach((q) => items.push({ ...q, unit: task.unit, passage: task.passage }))
    })

    return (
        <div className="p-6">
            {/* <header className="mb-6">
                <h1 className="text-2xl">{title || 'Exam'}</h1>
                <div className="flex gap-2 mt-3">
                    <button
                        type="button"
                        className="px-3 py-1 rounded bg-red-100"
                        onClick={() => {
                            clearExam()
                        }}>
                        End Exam
                    </button>
                    <Link to="/" className="px-3 py-1 rounded bg-gray-100">Home</Link>
                </div>
            </header> */}
            <Navbar />

            <main className='container mx-auto mt-5 px-4'>
                {items.map((question, idx) => (
                    <div key={`${question.unit}-${question.id}-${idx}`} className="mb-6">
                        <QuestionRenderer
                            question={question}
                            headerText={`Q${idx + 1} • Unit ${question.unit}`}
                            globalRandomizeAnswers={!!randomizeAnswers}
                            showAnswers={!!showAnswers}
                        />
                    </div>
                ))}
            </main>
        </div>
    )
}

export default TestingPage