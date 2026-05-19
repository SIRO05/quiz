import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import QuestionRenderer from '../components/exam/RendererRegistry'
import { useExam } from '../contexts/ExamContext'
import { Navbar } from '../components/Navbar'
import ExamControls from '../components/exam/ExamControls'

const TestingPage = () => {
    const { exam, clearExam } = useExam()
    const [userAnswers, setUserAnswers] = useState({})
    const [showResultModal, setShowResultModal] = useState(false)
    const [resultData, setResultData] = useState(null)
    const [isFinished, setIsFinished] = useState(false)

    // flatten tasks -> questions for single-page rendering
    const items = useMemo(() => {
        const flat = []
        if (exam && exam.selectedQuiz && exam.selectedQuiz.tasks) {
            exam.selectedQuiz.tasks.forEach((task) => {
                (task.questions || []).forEach((q) => flat.push({ ...q, unit: task.unit, passage: task.passage }))
            })
        }
        return flat
    }, [exam])

    if (!exam || !exam.selectedQuiz) {
        return (
            <div className="p-6">
                <h2 className="text-2xl mb-4">No exam loaded</h2>
                <p className="mb-4">Start an exam from the Home page (open modal and submit configuration).</p>
                <Link to="/" className="px-4 py-2 rounded bg-sky-500 text-white">Go Home</Link>
            </div>
        )
    }

    const { selectedQuiz, randomizeAnswers, showAnswers } = exam

    const handleAnswerChange = (questionKey, answerId) => {
        setUserAnswers(prev => ({ ...prev, [questionKey]: answerId }))
    }

    const handleFinish = ({ isOvertime, timeValue, totalMaxTime }) => {
        let correctCount = 0
        
        items.forEach((item, idx) => {
            const key = `${item.unit}-${item.id}-${idx}`
            const selected = userAnswers[key]
            const isCorrect = item.answer === selected

            if (isCorrect) {
                correctCount++
            }
        })

        setResultData({
            correct: correctCount,
            total: items.length,
            isOvertime,
            timeValue,
            totalMaxTime
        })
        setIsFinished(true)
        setShowResultModal(true)
    }

    const formatTimeInterval = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0')
        const s = (seconds % 60).toString().padStart(2, '0')
        return `${m}:${s}`
    }

    return (
        <div className="p-6 pb-32">
            <Navbar control={<Link to="/" className="px-3 py-1 rounded bg-gray-100">Home</Link>}/>

            <main className='container mx-auto mt-5 px-4'>
                {items.map((question, idx) => {
                    const qKey = `${question.unit}-${question.id}-${idx}`
                    return (
                        <div key={qKey} className="mb-6">
                            <QuestionRenderer
                                question={question}
                                headerText={`Q${idx + 1} • Unit ${question.unit}`}
                                globalRandomizeAnswers={!!randomizeAnswers}
                                showAnswers={!!showAnswers}
                                value={userAnswers[qKey]}
                                onChange={(val) => handleAnswerChange(qKey, val)}
                                isFinished={isFinished}
                            />
                        </div>
                    )
                })}
            </main>

            <ExamControls 
                mode={exam.mode || 'custom'} 
                tasksLength={selectedQuiz.tasks.length} 
                onFinish={handleFinish}
                isFinished={isFinished}
                onShowResults={() => setShowResultModal(true)}
            />

            {showResultModal && resultData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-night-surface rounded-xl p-8 max-w-md w-full shadow-2xl relative">
                        <h2 className="text-2xl font-bold mb-6 text-center">Итоги теста</h2>
                        
                        <div className="flex justify-center gap-12 text-center mb-8">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Правильно</p>
                                <p className="text-3xl font-bold text-green-500">{resultData.correct}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Ошибок</p>
                                <p className="text-3xl font-bold text-red-500">{resultData.total - resultData.correct}</p>
                            </div>
                        </div>

                        <div className="bg-gray-50 dark:bg-white/5 rounded-lg p-4 mb-8">
                            <ul className="text-sm space-y-2">
                                <li className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-300">Всего вопросов:</span>
                                    <span className="font-semibold">{resultData.total}</span>
                                </li>
                                <li className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-300">Потрачено времени:</span>
                                    <span className="font-semibold">
                                        {resultData.isOvertime 
                                            ? `${formatTimeInterval(resultData.totalMaxTime)} ` 
                                            : formatTimeInterval(resultData.totalMaxTime - resultData.timeValue)}
                                        {resultData.isOvertime && (
                                            <span className="text-red-500">(+{formatTimeInterval(resultData.timeValue)})</span>
                                        )}
                                    </span>
                                </li>
                            </ul>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowResultModal(false)}
                                className="flex-1 py-3 px-4 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 font-medium transition"
                            >
                                Закрыть
                            </button>
                            <Link
                                to="/"
                                onClick={() => clearExam()}
                                className="flex-1 py-3 px-4 rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-medium text-center transition"
                            >
                                На главную
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default TestingPage