import { useEffect, useState } from 'react'

import { Navbar } from "../components/Navbar";
import { div } from 'framer-motion/client';
import { ModalSettings } from '../components/ModalSettings';

const HomePage = () => {
    const [data, setData] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedTask, setSelectedTask] = useState(null)

    useEffect(() => {
        const fetchData = async () => {
            const response = await fetch('data/index.json')
            const jsonData = await response.json()
            setData(jsonData)
        }

        fetchData()
    }, [])

    return (
        <>
            <Navbar />
            {data && data.length > 0 ? (
                <div className='container mx-auto mt-5 px-4'> 
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center'>
                        {data.map((item) => (
                            <div 
                                key={item.task} 
                                className='w-full max-w-sm p-4 rounded-xl bg-journal-mint dark:bg-night-surface shadow-soft border border-black/5 transition-transform hover:scale-[1.02] cursor-pointer'
                                onClick={() => {
                                    setSelectedTask(item)
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
            >
                <p className="text-gray-700">{selectedTask?.description}</p>
            </ModalSettings>
        </>
    )
}

export default HomePage