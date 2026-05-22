import React, { useState } from 'react';
import Card from '../components/Card';
import { Navbar } from '../components/Navbar';
import { Modal } from '../components/Modal';

const DevPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('list'); // 'list' yoki 'test'

    const staticData = [
        { title: 'N5 Kanji Basics', description: 'Beginner level vocabulary and characters', selectionMode: 'single' },
        { title: 'Grammar Mix', description: 'Particles and verb conjugations test', selectionMode: 'custom' },
        { title: 'Final Marathon', description: 'Comprehensive exam for all levels', selectionMode: 'all' }
    ];

    return (
        <div className="min-h-screen pb-20 bg-journal-mint dark:bg-night-bg transition-colors duration-500">
            <Navbar />
            
            <div className="container mx-auto px-6 mt-16 max-w-4xl">
                <header className="mb-16 text-center">
                    <h1 className="text-5xl font-black text-journal-text dark:text-night-text uppercase tracking-tighter">
                        DEV<span className="text-journal-accent italic">ZONE</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-4 font-medium italic">Testing the Nihongo Experience</p>
                </header>

                <div className="grid gap-5">
                    {staticData.map((item, index) => (
                        <Card 
                            key={index} 
                            item={item} 
                            onClick={() => setIsModalOpen(true)} 
                        />
                    ))}
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Start Testing">
                <div className="text-center">
                    <p className="text-journal-text dark:text-night-text font-medium mb-8">Ready to begin your Japanese challenge?</p>
                    <div className="flex gap-4">
                        <button className="flex-1 py-4 rounded-2xl bg-journal-mint text-journal-text font-black uppercase text-xs tracking-widest">Review</button>
                        <button className="flex-1 py-4 rounded-2xl bg-journal-accent text-white font-black uppercase text-xs tracking-widest">Start Now</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default DevPage;