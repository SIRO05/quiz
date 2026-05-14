import { useEffect, useState } from 'react'

import { Navbar } from "../components/Navbar";
import { ModalSettings } from '../components/ModalSettings';
import { normalizeIndexTask, readJson } from "../utils/jsonReader";

const INDEX_KEY = "N2"
const TASK_DATA_DIR = `data/${INDEX_KEY}`

const resolveTaskUrl = (taskUrl) => {
    const fileName = taskUrl?.split('/').filter(Boolean).pop()
    return fileName ? `${TASK_DATA_DIR}/${fileName}` : ''
}

const HomePage = () => {
    const [data, setData] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedTask, setSelectedTask] = useState(null)

    useEffect(() => {
        const fetchData = async () => {
            const jsonData = await readJson('data/index.json')
            const tasks = Array.isArray(jsonData?.[INDEX_KEY])
                ? jsonData[INDEX_KEY].map((task) => ({
                    ...normalizeIndexTask(task),
                    url: resolveTaskUrl(task.url),
                }))
                : []

            setData(tasks)
        }

        fetchData()
    }, [])
    
    const allTasks = data ?? []

    return (
        <>
            <Navbar />
            {data && data.length > 0 ? (
                <div className='container mx-auto mt-5 px-4'> 
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center'>
                        <div 
                            key="exam-all-tests"
                            className='w-full max-w-sm p-4 rounded-xl bg-journal-mint dark:bg-night-surface shadow-soft border border-black/5 transition-transform hover:scale-[1.02] cursor-pointer'
                            onClick={() => {
                                setSelectedTask({
                                    title: 'Exam: All Tests',
                                    description: 'Run all available tests in one exam.',
                                    url: allTasks,
                                    preselectAll: true,
                                    selectionMode: 'all'
                                })
                                setIsModalOpen(true)
                            }}
                        >
                            <p className="font-bold text-journal-text dark:text-night-text">Exam: All Tests</p>
                            <p className="text-muted-500 break-all text-sm">Run all available tests in one exam.</p>
                        </div>

                        <div 
                            key="custom-exam"
                            className='w-full max-w-sm p-4 rounded-xl bg-journal-mint dark:bg-night-surface shadow-soft border border-black/5 transition-transform hover:scale-[1.02] cursor-pointer'
                            onClick={() => {
                                setSelectedTask({
                                    title: 'Custom Exam',
                                    description: 'Choose which tasks to include in the exam.',
                                    url: allTasks,
                                    preselectAll: false,
                                    selectionMode: 'custom'
                                })
                                setIsModalOpen(true)
                            }}
                        >
                            <p className="font-bold text-journal-text dark:text-night-text">Custom Exam</p>
                            <p className="text-muted-500 break-all text-sm">Choose which tasks to include in the exam.</p>
                        </div>

                        {data.map((item) => (
                            <div 
                                key={item.task ?? item.url ?? item.title}
                                className='w-full max-w-sm p-4 rounded-xl bg-journal-mint dark:bg-night-surface shadow-soft border border-black/5 transition-transform hover:scale-[1.02] cursor-pointer'
                                onClick={() => {
                                    setSelectedTask({ ...item, selectionMode: 'single' })
                                    setIsModalOpen(true)
                                }}
                            >
                                <p className="font-bold text-journal-text dark:text-night-text">
                                    {item.title}
                                </p>
                                <p className="text-muted-500 break-all text-sm">
                                    {item.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="flex justify-center mt-10">
                    <p className="animate-pulse text-journal-accent">Loading...</p>
                </div>
            )}
            <ModalSettings
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={selectedTask?.title || "Task Details"}
                url={selectedTask?.url}
                preselectAll={selectedTask?.preselectAll}
                selectionMode={selectedTask?.selectionMode}
            >
                <p className="text-gray-700">{selectedTask?.description}</p>
            </ModalSettings>
        </>
    )
}

export default HomePage