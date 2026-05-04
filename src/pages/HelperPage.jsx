import { useState } from 'react';

export default function IndexHelper() {
  const [text, setText] = useState("");
  const [word, setWord] = useState("");

  const getResult = () => {
    const start = text.indexOf(word);
    if (start === -1 || word === "") return null;
    return { start, end: start + word.length };
  };

  const res = getResult();

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <input 
        className="w-full p-2 mb-2 border" 
        placeholder="Весь текст..." 
        onChange={e => setText(e.target.value)} 
      />
      <input 
        className="w-full p-2 mb-2 border" 
        placeholder="Слово, которое нужно выделить..." 
        onChange={e => setWord(e.target.value)} 
      />
      
      {res && (
        <div className="bg-black text-green-400 p-3 rounded">
          <code>"textHighlight": {JSON.stringify(res)}</code>
          <p className="text-xs mt-2 text-white">Проверка: {text.slice(res.start, res.end)}</p>
        </div>
      )}
    </div>
  );
}