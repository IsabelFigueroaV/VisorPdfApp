import React from 'react';

const HistoryList = ({ history, onSelect }) => {
  if (!history || history.length === 0) return null;

  return (
    <section className="mb-6">
      <h2 className="text-xl font-semibold mb-3 text-gray-800 flex items-center gap-2">
        <span role="img" aria-label="Historial">📂</span> Archivos recientes
      </h2>
      <ul className="space-y-2">
        {history.map((filePath, index) => {
          const fileName = filePath.split(/[\\/]/).pop();
          return (
            <li key={index}>
              <button
                onClick={() => onSelect(filePath)}
                className="text-blue-600 hover:underline text-left truncate w-full"
                title={filePath}
              >
                {fileName}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default HistoryList;

