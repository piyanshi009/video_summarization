import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/**
 * Parses raw flashcard content into an array of {question, answer} objects.
 * Expected formats (best‑effort parsing):
 *   Question: What is X?
 *   Answer: Y
 *   \n   Question: ...
 *   Answer: ...
 *   or lines starting with Q: / A:
 */
function parseFlashcards(raw) {
  if (!raw) return [];
  const cards = [];
  const sections = raw.split(/\n\s*\n/); // split by blank lines
  sections.forEach(section => {
    const lines = section.split('\n').map(l => l.trim()).filter(Boolean);
    let q = '';
    let a = '';
    lines.forEach(line => {
      if (/^(question|q)[:\s]/i.test(line)) {
        q = line.replace(/^(question|q)[:\s]*/i, '').trim();
      } else if (/^(answer|a)[:\s]/i.test(line)) {
        a = line.replace(/^(answer|a)[:\s]*/i, '').trim();
      }
    });
    if (q && a) {
      cards.push({ question: q, answer: a });
    }
  });
  return cards;
}

export default function FlashcardViewer({ rawContent }) {
  const cards = parseFlashcards(rawContent);
  const [index, setIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  if (!cards.length) {
    // Fallback: render raw markdown if parsing fails
    return (
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{rawContent}</ReactMarkdown>
    );
  }

  const { question, answer } = cards[index];

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1rem' }}>
        <strong>Card {index + 1} of {cards.length}</strong>
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <h3>Question</h3>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{question}</ReactMarkdown>
      </div>
      {showAnswer && (
        <div style={{ marginBottom: '1rem' }}>
          <h3>Answer</h3>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{answer}</ReactMarkdown>
        </div>
      )}
      <button
        onClick={() => setShowAnswer(!showAnswer)}
        style={{
          background: 'var(--color-primary)',
          color: '#fff',
          border: 'none',
          borderRadius: 'var(--radius)',
          padding: '0.5rem 1rem',
          cursor: 'pointer',
          marginRight: '0.5rem',
        }}
      >
        {showAnswer ? 'Hide Answer' : 'Show Answer'}
      </button>
      <button
        onClick={() => {
          setIndex(prev => Math.max(prev - 1, 0));
          setShowAnswer(false);
        }}
        disabled={index === 0}
        style={{
          background: index === 0 ? '#ccc' : 'var(--color-primary)',
          color: '#fff',
          border: 'none',
          borderRadius: 'var(--radius)',
          padding: '0.5rem 1rem',
          cursor: index === 0 ? 'default' : 'pointer',
          marginRight: '0.5rem',
        }}
      >
        Previous
      </button>
      <button
        onClick={() => {
          setIndex(prev => Math.min(prev + 1, cards.length - 1));
          setShowAnswer(false);
        }}
        disabled={index === cards.length - 1}
        style={{
          background: index === cards.length - 1 ? '#ccc' : 'var(--color-primary)',
          color: '#fff',
          border: 'none',
          borderRadius: 'var(--radius)',
          padding: '0.5rem 1rem',
          cursor: index === cards.length - 1 ? 'default' : 'pointer',
        }}
      >
        Next
      </button>
    </div>
  );
}
