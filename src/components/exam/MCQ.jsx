import { useMemo } from 'react';
import { shuffleArray } from '../../utils/shuffle';

// 1. Утилита для рендера переносов строк
const renderWithLineBreaks = (text) => {
  if (typeof text !== 'string') return text;
  const parts = text.split('\n');
  return parts.flatMap((p, i) => (i < parts.length - 1 ? [p, <br key={i} />] : [p]));
};

// 2. Универсальная функция для вычисления подсветки текста (Dry принцип)
const getHighlightedParts = (item) => {
  // Убрали мертвый код textLeft/textRight, так как для MCQ есть только text
  const full = item?.text || ''; 
  const hl = item?.textHighlight;

  if (!hl || typeof hl.start !== 'number' || typeof hl.end !== 'number') {
    return { before: full, highlight: null, after: '' };
  }

  const start = Math.max(0, hl.start);
  const end = Math.min(full.length, hl.end);

  if (start >= end) {
    return { before: full, highlight: null, after: '' };
  }

  return {
    before: full.slice(0, start),
    highlight: full.slice(start, end),
    after: full.slice(end),
  };
};

// 3. Мини-компонент для рендера текста с возможной подсветкой (делает JSX чистым)
const HighlightedText = ({ item }) => {
  const parts = getHighlightedParts(item);

  if (!parts.highlight) {
    return <>{renderWithLineBreaks(parts.before)}</>;
  }

  return (
    <>
      {renderWithLineBreaks(parts.before)}
      {parts.before && !/\s$/.test(parts.before) ? ' ' : ''}
      <span className="px-2 mx-1 underline decoration-white-300 decoration-2 underline-offset-4">
        {renderWithLineBreaks(parts.highlight)}
      </span>
      {parts.after && !/^\s/.test(parts.after) ? ' ' : ''}
      {renderWithLineBreaks(parts.after)}
    </>
  );
};

// 4. Основной компонент MCQ
export default function MCQ({ 
  question, 
  globalRandomizeAnswers = false, 
  showAnswers = false, 
  value = null,
  onChange, 
  headerText 
}) {
  const options = useMemo(() => {
    if (!Array.isArray(question.options)) return [];
    return globalRandomizeAnswers ? shuffleArray([...question.options]) : question.options;
  }, [question.options, globalRandomizeAnswers]);

  function handleSelect(id) {
    onChange?.(id);
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="border rounded-lg p-6 bg-white dark:bg-night-surface shadow-sm">
        
        {/* Заголовок */}
        {headerText && (
          <div className="mb-3 text-sm text-gray-500 dark:text-night-text/60 text-left">
            {headerText}
          </div>
        )}

        {/* Текст вопроса */}
        <div className="min-h-[120px] flex flex-col items-center justify-center text-center">
          <div className="text-base leading-relaxed">
            <HighlightedText item={question} />
          </div>
        </div>

        {/* Варианты ответов */}
        <ul className="mt-4 flex flex-wrap justify-center gap-3">
          {options.map((opt) => (
            <li key={opt.id}>
              <label 
                className={`inline-flex items-center gap-3 px-4 py-2 rounded-full border transition-colors cursor-pointer ${
                  value === opt.id 
                    ? 'bg-sky-100 border-sky-300' 
                    : 'bg-white dark:bg-night-surface border-gray-200 dark:border-white/10'
                }`}
              >
                <input
                  type="radio"
                  name={`question-${question.id}-${headerText}`}
                  value={opt.id}
                  checked={value === opt.id}
                  onChange={() => handleSelect(opt.id)}
                  className="sr-only"
                />
                
                <span className="text-sm">
                  <HighlightedText item={opt} />
                </span>

                {/* Галочка правильного ответа */}
                {showAnswers && question.answer === opt.id && (
                  <span className="ml-2 text-green-600">✓</span>
                )}
              </label>
            </li>
          ))}
        </ul>
        
      </div>
    </div>
  );
}