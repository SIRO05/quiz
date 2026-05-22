import React from 'react';

const Card = ({ item, onClick }) => {
  const getStyles = (mode) => {
    switch (mode) {
      case 'all': return 'border-cat-purple/30 bg-journal-lavender/10 text-cat-purple';
      case 'custom': return 'border-cat-blue/30 bg-journal-sky/10 text-cat-blue';
      default: return 'border-journal-accent/30 bg-journal-rose/10 text-journal-accent';
    }
  };

  return (
    <div 
      onClick={onClick}
      className="group relative w-full flex items-center p-5 rounded-[24px] cursor-pointer transition-all duration-500
                 bg-white dark:bg-night-surface border border-journal-lavender dark:border-white/5 shadow-soft
                 hover:shadow-lift hover:-translate-y-1 active:scale-[0.98]"
    >
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 shrink-0 transition-transform group-hover:rotate-6 ${getStyles(item.selectionMode)}`}>
         <span className="text-xs font-black uppercase tracking-tighter">
            {item.selectionMode === 'all' ? 'All' : item.selectionMode === 'custom' ? 'Mix' : 'JLPT'}
         </span>
      </div>

      <div className="ml-5 flex-grow">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg text-journal-text dark:text-night-text group-hover:text-journal-accent dark:group-hover:text-night-neon-blue transition-colors">
            {item.title}
          </h3>
          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-50 dark:bg-night-bg opacity-0 group-hover:opacity-100 transition-all">
            <svg className="w-4 h-4 text-journal-accent dark:text-night-neon-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
          </div>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-1 italic font-medium">
          {item.description}
        </p>
      </div>
    </div>
  );
};

export default Card;