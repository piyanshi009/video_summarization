import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  RotateCw, 
  ChevronLeft, 
  ChevronRight, 
  Shuffle, 
  CheckCircle2, 
  RefreshCw, 
  Eye, 
  EyeOff,
  Sparkles
} from 'lucide-react';

/**
 * Robust Flashcard Parser
 */
function parseFlashcards(raw) {
  if (!raw || typeof raw !== 'string') return [];
  const cards = [];

  // Try splitting by blank lines
  const sections = raw.split(/\n\s*\n/);
  
  sections.forEach((section) => {
    const lines = section.split('\n').map((l) => l.trim()).filter(Boolean);
    let q = '';
    let a = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Format: "Question: ..." / "Q: ..."
      if (/^(?:\*{1,3})?(?:Question|Q|Front)[:\s](?:\*{1,3})?/i.test(line)) {
        q = line.replace(/^(?:\*{1,3})?(?:Question|Q|Front)[:\s]*(?:\*{1,3})?/i, '').trim();
      } 
      // Format: "Answer: ..." / "A: ..." / "Back: ..."
      else if (/^(?:\*{1,3})?(?:Answer|A|Back)[:\s](?:\*{1,3})?/i.test(line)) {
        a = line.replace(/^(?:\*{1,3})?(?:Answer|A|Back)[:\s]*(?:\*{1,3})?/i, '').trim();
      }
      // Format: "1. Term - Definition"
      else if (/^\d+[\.)]\s*(.+?)\s*[-–—:]\s*(.+)$/i.test(line) && !q && !a) {
        const m = line.match(/^\d+[\.)]\s*(.+?)\s*[-–—:]\s*(.+)$/i);
        if (m) {
          q = m[1].trim();
          a = m[2].trim();
        }
      }
    }

    if (q && a) {
      cards.push({ question: q, answer: a });
    }
  });

  // Fallback: If blank line split produced nothing, parse line by line
  if (!cards.length) {
    const allLines = raw.split('\n').map((l) => l.trim()).filter(Boolean);
    let currentQ = '';

    allLines.forEach((line) => {
      if (/^(?:\*{1,3})?(?:Question|Q|Front|\d+[\.)])[:\s]/i.test(line)) {
        currentQ = line.replace(/^(?:\*{1,3})?(?:Question|Q|Front|\d+[\.)])[:\s]*(?:\*{1,3})?/i, '').trim();
      } else if (/^(?:\*{1,3})?(?:Answer|A|Back)[:\s]/i.test(line) && currentQ) {
        const ans = line.replace(/^(?:\*{1,3})?(?:Answer|A|Back)[:\s]*(?:\*{1,3})?/i, '').trim();
        cards.push({ question: currentQ, answer: ans });
        currentQ = '';
      }
    });
  }

  return cards;
}

export default function FlashcardViewer({ rawContent }) {
  const [initialCards, setInitialCards] = useState([]);
  const [cards, setCards] = useState([]);
  const [index, setIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [mastered, setMastered] = useState({}); // { [cardIndex]: 'know' | 'review' }

  useEffect(() => {
    const parsed = parseFlashcards(rawContent || '');
    setInitialCards(parsed);
    setCards(parsed);
    setIndex(0);
    setIsFlipped(false);
    setMastered({});
  }, [rawContent]);

  if (!cards.length) {
    return (
      <div style={{ color: 'var(--color-text-primary)', padding: '1rem' }}>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
          Unable to parse structured flashcards. Raw generated content:
        </p>
        <div style={{ background: 'var(--color-bg)', padding: '1.25rem', borderRadius: 'var(--radius)' }}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{rawContent || 'No content.'}</ReactMarkdown>
        </div>
      </div>
    );
  }

  const current = cards[index];
  const progressPercent = Math.round(((index + 1) / cards.length) * 100);
  const status = mastered[index];

  const handleNext = () => {
    setIsFlipped(false);
    setIndex((prev) => Math.min(prev + 1, cards.length - 1));
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleShuffle = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setIndex(0);
    setIsFlipped(false);
    setMastered({});
  };

  const markKnown = () => {
    setMastered((prev) => ({ ...prev, [index]: 'know' }));
    if (index < cards.length - 1) {
      setTimeout(handleNext, 200);
    }
  };

  const markReview = () => {
    setMastered((prev) => ({ ...prev, [index]: 'review' }));
    if (index < cards.length - 1) {
      setTimeout(handleNext, 200);
    }
  };

  return (
    <div style={{ maxWidth: '680px', margin: '0.5rem auto' }}>
      {/* Top Header: Progress & Shuffle */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <span style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--color-primary)' }}>
            Card {index + 1} of {cards.length}
          </span>
          {status && (
            <span
              className={`lumio-badge ${status === 'know' ? 'lumio-badge-success' : 'lumio-badge-neutral'}`}
            >
              {status === 'know' ? '✓ Mastered' : '⟳ Review again'}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleShuffle}
          className="lumio-btn-secondary"
          style={{ padding: '0.4rem 0.85rem', fontSize: '0.82rem' }}
          title="Shuffle flashcard deck"
        >
          <Shuffle size={14} />
          <span>Shuffle</span>
        </button>
      </div>

      {/* Progress Bar */}
      <div
        style={{
          height: '5px',
          width: '100%',
          background: 'var(--color-border)',
          borderRadius: '999px',
          overflow: 'hidden',
          marginBottom: '1.5rem',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${progressPercent}%`,
            background: 'var(--color-primary)',
            borderRadius: '999px',
            transition: 'width 0.3s ease',
          }}
        />
      </div>

      {/* Interactive 3D Flip Card Container */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        style={{
          minHeight: '260px',
          background: isFlipped ? 'var(--color-bg)' : 'var(--color-surface)',
          border: `1.5px solid ${isFlipped ? 'var(--color-primary)' : 'var(--color-border)'}`,
          borderRadius: 'var(--radius-lg)',
          padding: '2rem',
          cursor: 'pointer',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxShadow: isFlipped ? 'var(--shadow-glow)' : 'var(--shadow-md)',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          marginBottom: '1.5rem',
        }}
      >
        {/* Card Header Label */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span
            style={{
              fontSize: '0.78rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: isFlipped ? 'var(--color-primary)' : 'var(--color-lavender)',
            }}
          >
            {isFlipped ? 'Answer / Back' : 'Question / Front'}
          </span>

          <span
            style={{
              fontSize: '0.78rem',
              color: 'var(--color-text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <RotateCw size={12} />
            <span>Click to flip</span>
          </span>
        </div>

        {/* Card Body */}
        <div
          style={{
            margin: '1.5rem 0',
            fontSize: '1.2rem',
            fontWeight: 600,
            lineHeight: 1.5,
            color: 'var(--color-text-primary)',
            textAlign: 'center',
          }}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {isFlipped ? current.answer : current.question}
          </ReactMarkdown>
        </div>

        {/* Card Bottom Hint */}
        <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
          {isFlipped ? 'Click card again to flip back' : 'Reveal answer to test your memory'}
        </div>
      </div>

      {/* Self-Assessment & Navigation Buttons */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        {/* Previous / Next buttons */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={handlePrev}
            disabled={index === 0}
            className="lumio-btn-secondary"
            style={{ padding: '0.65rem 1rem', opacity: index === 0 ? 0.5 : 1 }}
          >
            <ChevronLeft size={17} />
            <span>Prev</span>
          </button>

          <button
            type="button"
            onClick={handleNext}
            disabled={index === cards.length - 1}
            className="lumio-btn-secondary"
            style={{ padding: '0.65rem 1rem', opacity: index === cards.length - 1 ? 0.5 : 1 }}
          >
            <span>Next</span>
            <ChevronRight size={17} />
          </button>
        </div>

        {/* Assessment buttons: Know it & Review again */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={markReview}
            style={{
              background: status === 'review' ? '#EF4444' : 'rgba(239, 68, 68, 0.1)',
              color: status === 'review' ? '#fff' : '#EF4444',
              border: '1.5px solid #EF4444',
              padding: '0.65rem 1.15rem',
              borderRadius: 'var(--radius)',
              fontWeight: 700,
              fontSize: '0.88rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <RefreshCw size={15} />
            <span>Review again</span>
          </button>

          <button
            type="button"
            onClick={markKnown}
            style={{
              background: status === 'know' ? '#10B981' : 'rgba(16, 185, 129, 0.12)',
              color: status === 'know' ? '#fff' : '#10B981',
              border: '1.5px solid #10B981',
              padding: '0.65rem 1.15rem',
              borderRadius: 'var(--radius)',
              fontWeight: 700,
              fontSize: '0.88rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <CheckCircle2 size={16} />
            <span>Know it</span>
          </button>
        </div>
      </div>
    </div>
  );
}
