export default function Passage({ text }) {
  if (!text) return null;

  const parseRuby = (lineText) => {
    const rubyRegex = /\[([^\]]+)\]\{([^}]+)\}/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = rubyRegex.exec(lineText)) !== null) {
      if (match.index > lastIndex) {
        parts.push(lineText.substring(lastIndex, match.index));
      }
      parts.push(
        <ruby key={`ruby-${match.index}`} className="mx-0.5">
          {match[1]}
          <rt className="text-[0.6em] text-gray-500 font-medium">{match[2]}</rt>
        </ruby>
      );
      lastIndex = rubyRegex.lastIndex;
    }

    if (lastIndex < lineText.length) {
      parts.push(lineText.substring(lastIndex));
    }

    return parts.length > 0 ? parts : lineText;
  };

  const lines = text.split('\n');

  return (
    <div className="text-gray-800 dark:text-gray-200">
      {lines.map((line, index) => (
        <p key={index} className="text-[1.1rem] md:text-xl leading-[2.5] mb-4 last:mb-0">
          {line.trim() === '' ? <br /> : parseRuby(line)}
        </p>
      ))}
    </div>
  );
}
