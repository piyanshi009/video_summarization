import React, { useState, useEffect, useCallback } from 'react';
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
  RotateCcw,
  Sparkles,
  BookOpen,
  HelpCircle,
  Award
} from 'lucide-react';

/**
 * Normalize text line endings
 */
function normalizeText(str) {
  if (!str) return '';
  return str.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

/**
 * Universal Flashcard Parser supporting:
 * - 1. **Question:** ... \n **Answer:** ... (Standard Gemini format)
 * - **Flashcard 1** / Flashcard 1: ...
 * - ### Card 1 / Front: ... Back: ...
 * - Numbered Q&A lists and Term - Definition
 */
export function parseFlashcards(raw) {
  if (!raw || typeof raw !== 'string' || !raw.trim()) return [];
  const text = normalizeText(raw).trim();
  const cards = [];

  // Strategy 1: Explicit Flashcard Blocks or Numbered Blocks with Question & Answer
  // Matches "Flashcard 1", "**Flashcard 1**", "### Flashcard 1", "Card 1", "1.", "1)", etc.
  const blockSplitter = /(?:^|\n)\s*(?:(?:\*{1,3}|#{1,4})?\s*(?:Flashcard|Card)\s*\d*[:.]?(?:\*{1,3})?|\d+[\.)])\s+/i;

  if (blockSplitter.test(text)) {
    const parts = text.split(blockSplitter).filter(Boolean);
    for (const part of parts) {
      const trimmed = part.trim();
      if (!trimmed) continue;
      // Skip introductory text like "Here are the flashcards for..."
      if (/^Here (?:are|is) (?:the )?flashcards/i.test(trimmed) || /^Flashcards:?$/i.test(trimmed)) continue;

      const lines = trimmed.split('\n').map((l) => l.trim()).filter(Boolean);
      let q = '';
      let a = '';

      for (const line of lines) {
        // Strip list bullets
        const clean = line.replace(/^[-*•]\s*/, '').trim();

        // Question pattern: "Question:", "**Question:**", "Q:", "**Q1:**", "Front:"
        const qMatch = clean.match(/^(?:\*{1,3})?(?:Question|Q|Front)\s*\d*[:.]?(?:\*{1,3})?\s*(.*)$/i);
        if (qMatch) {
          q = qMatch[1].replace(/^\*\*(.*)\*\*$/, '$1').trim();
          continue;
        }

        // Answer pattern: "Answer:", "**Answer:**", "A:", "**A1:**", "Back:"
        const aMatch = clean.match(/^(?:\*{1,3})?(?:Answer|A|Back)\s*\d*[:.]?(?:\*{1,3})?\s*(.*)$/i);
        if (aMatch) {
          a = aMatch[1].replace(/^\*\*(.*)\*\*$/, '$1').trim();
          continue;
        }

        // Term - Definition format
        const termMatch = clean.match(/^([^-–—:]+?)\s*[-–—:]\s*(.+)$/);
        if (termMatch && !q && !a) {
          q = termMatch[1].replace(/[*_]/g, '').trim();
          a = termMatch[2].trim();
          continue;
        }

        // Multiline continuations
        if (q && !a) {
          q += ' ' + clean;
        } else if (a) {
          a += ' ' + clean;
        } else if (!q) {
          q = clean;
        }
      }

      if (q && a) {
        cards.push({
          question: q.replace(/^[*_~`]+|[*_~`]+$/g, '').trim(),
          answer: a.replace(/^[*_~`]+|[*_~`]+$/g, '').trim(),
        });
      }
    }

    if (cards.length > 0) return cards;
  }

  // Strategy 2: Blank line separated sections
  const sections = text.split(/\n\s*\n+/);
  for (const sec of sections) {
    const lines = sec.split('\n').map((l) => l.trim()).filter(Boolean);
    let q = '';
    let a = '';

    for (const rawLine of lines) {
      const line = rawLine
        .replace(/^\d+[\.)]\s*/, '')
        .replace(/^[-*•]\s*/, '')
        .trim();

      const qMatch = line.match(/^(?:\*{1,3})?(?:Question|Q|Front)\s*\d*[:.]?(?:\*{1,3})?\s*(.*)$/i);
      if (qMatch) {
        q = qMatch[1].replace(/^\*\*(.*)\*\*$/, '$1').trim();
        continue;
      }

      const aMatch = line.match(/^(?:\*{1,3})?(?:Answer|A|Back)\s*\d*[:.]?(?:\*{1,3})?\s*(.*)$/i);
      if (aMatch) {
        a = aMatch[1].replace(/^\*\*(.*)\*\*$/, '$1').trim();
        continue;
      }

      if (q && !a) {
        q += ' ' + line;
      } else if (a) {
        a += ' ' + line;
      }
    }

    if (q && a) {
      cards.push({
        question: q.replace(/^[*_~`]+|[*_~`]+$/g, '').trim(),
        answer: a.replace(/^[*_~`]+|[*_~`]+$/g, '').trim(),
      });
    }
  }
  if (cards.length > 0) return cards;

  // Strategy 3: Global line-by-line pairing
  const allLines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  let pendingQ = '';

  for (const rawLine of allLines) {
    const line = rawLine
      .replace(/^\d+[\.)]\s*/, '')
      .replace(/^[-*•]\s*/, '')
      .trim();

    const qMatch = line.match(/^(?:\*{1,3})?(?:Question|Q|Front)\s*\d*[:.]?(?:\*{1,3})?\s*(.*)$/i);
    if (qMatch) {
      pendingQ = qMatch[1].replace(/^\*\*(.*)\*\*$/, '$1').trim();
      continue;
    }

    const aMatch = line.match(/^(?:\*{1,3})?(?:Answer|A|Back)\s*\d*[:.]?(?:\*{1,3})?\s*(.*)$/i);
    if (aMatch && pendingQ) {
      const ans = aMatch[1].replace(/^\*\*(.*)\*\*$/, '$1').trim();
      cards.push({
        question: pendingQ.replace(/^[*_~`]+|[*_~`]+$/g, '').trim(),
        answer: ans.replace(/^[*_~`]+|[*_~`]+$/g, '').trim(),
      });
      pendingQ = '';
    }
  }

  return cards;
}

export default function FlashcardViewer({ rawContent, onRegenerate, loading = false }) {
  const [initialCards, setInitialCards] = useState([]);
  const [cards, setCards] = useState([]);
  const [index, setIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [mastered, setMastered] = useState({}); // { [cardIndex]: 'know' | 'review' }

  // Parse cards whenever rawContent changes
  useEffect(() => {
    const parsed = parseFlashcards(rawContent || '');
    setInitialCards(parsed);
    setCards(parsed);
    setIndex(0);
    setIsFlipped(false);
    setMastered({});
  }, [rawContent]);

  // Session counts
  const knownCount = Object.values(mastered).filter((v) => v === 'know').length;
  const reviewCount = Object.values(mastered).filter((v) => v === 'review').length;

  const handleNext = useCallback(() => {
    setIsFlipped(false);
    setIndex((prev) => Math.min(prev + 1, cards.length - 1));
  }, [cards.length]);

  const handlePrev = useCallback(() => {
    setIsFlipped(false);
    setIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const handleShuffle = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setIndex(0);
    setIsFlipped(false);
    setMastered({});
  };

  const handleReset = () => {
    setCards([...initialCards]);
    setIndex(0);
    setIsFlipped(false);
    setMastered({});
  };

  const markKnown = useCallback(() => {
    setMastered((prev) => ({ ...prev, [index]: 'know' }));
    if (index < cards.length - 1) {
      setTimeout(handleNext, 180);
    }
  }, [index, cards.length, handleNext]);

  const markReview = useCallback(() => {
    setMastered((prev) => ({ ...prev, [index]: 'review' }));
    if (index < cards.length - 1) {
      setTimeout(handleNext, 180);
    }
  }, [index, cards.length, handleNext]);

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if user is in an input or textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

      if (e.code === 'Space' || e.key === 'Enter') {
        e.preventDefault();
        handleFlip();
      } else if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'j') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'k') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === '1') {
        markReview();
      } else if (e.key === '2') {
        markKnown();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlip, handleNext, handlePrev, markKnown, markReview]);

  // Clean Fallback UI when parsing fails - NEVER dump raw response as primary UI
  if (!cards.length) {
    return (
      <div
        className="lumio-card"
        style={{
          padding: '3rem 2rem',
          textAlign: 'center',
          maxWidth: '680px',
          margin: '1rem auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.25rem',
        }}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.12)',
            color: '#EF4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <HelpCircle size={28} />
        </div>

        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--color-text-primary)' }}>
            Unable to Structure Flashcards Automatically
          </h3>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', maxWidth: '480px', margin: '0 auto' }}>
            The generated response did not match standard question-answer flashcard patterns. You can regenerate fresh cards or inspect the raw response below.
          </p>
        </div>

        {onRegenerate && (
          <button
            type="button"
            onClick={onRegenerate}
            disabled={loading}
            className="lumio-btn-primary"
            style={{ padding: '0.75rem 1.6rem', fontSize: '0.95rem' }}
          >
            <RefreshCw size={16} className={loading ? 'lumio-spin' : ''} />
            <span>{loading ? 'Regenerating Flashcards…' : 'Regenerate Flashcards'}</span>
          </button>
        )}

        {/* Retain original content safely inside collapsed details */}
        <details
          style={{
            width: '100%',
            textAlign: 'left',
            marginTop: '1rem',
            background: 'var(--color-bg)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius)',
            padding: '0.75rem 1rem',
          }}
        >
          <summary
            style={{
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.88rem',
              color: 'var(--color-text-secondary)',
              userSelect: 'none',
            }}
          >
            Inspect Original Generated Response
          </summary>
          <div
            className="lumio-study-markdown"
            style={{
              marginTop: '0.85rem',
              paddingTop: '0.85rem',
              borderTop: '1px solid var(--color-border-subtle)',
              fontSize: '0.92rem',
              maxHeight: '320px',
              overflowY: 'auto',
            }}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {rawContent || 'No content provided.'}
            </ReactMarkdown>
          </div>
        </details>
      </div>
    );
  }

  const current = cards[index];
  const progressPercent = Math.round(((index + 1) / cards.length) * 100);
  const status = mastered[index];

  return (
    <div
      style={{
        maxWidth: '720px',
        margin: '0.5rem auto',
        userSelect: 'none',
      }}
    >
      {/* Deck Controls Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.85rem',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        {/* Progress & Session Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--color-primary)' }}>
            Card {index + 1} of {cards.length}
          </span>

          {status && (
            <span
              className={`lumio-badge ${status === 'know' ? 'lumio-badge-success' : 'lumio-badge-neutral'}`}
              style={{
                background: status === 'know' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.12)',
                color: status === 'know' ? '#10B981' : '#EF4444',
                fontWeight: 700,
              }}
            >
              {status === 'know' ? '✓ Mastered' : '⟳ Review again'}
            </span>
          )}

          {knownCount > 0 && (
            <span
              style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                color: '#10B981',
                background: 'rgba(16, 185, 129, 0.1)',
                padding: '0.2rem 0.55rem',
                borderRadius: '999px',
              }}
            >
              {knownCount} Mastered
            </span>
          )}

          {reviewCount > 0 && (
            <span
              style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                color: '#EF4444',
                background: 'rgba(239, 68, 68, 0.1)',
                padding: '0.2rem 0.55rem',
                borderRadius: '999px',
              }}
            >
              {reviewCount} Review
            </span>
          )}
        </div>

        {/* Action Controls: Shuffle & Reset */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            type="button"
            onClick={handleShuffle}
            className="lumio-btn-secondary"
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem' }}
            title="Shuffle flashcards"
          >
            <Shuffle size={14} />
            <span>Shuffle</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="lumio-btn-secondary"
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem' }}
            title="Reset deck to original order and clear review states"
          >
            <RotateCcw size={14} />
            <span>Reset Deck</span>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div
        style={{
          height: '6px',
          width: '100%',
          background: 'var(--color-surface-hover)',
          border: '1px solid var(--color-border)',
          borderRadius: '999px',
          overflow: 'hidden',
          marginBottom: '1.75rem',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${progressPercent}%`,
            background: 'var(--gradient-primary)',
            borderRadius: '999px',
            transition: 'width 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />
      </div>

      {/* Interactive 3D Flip Card */}
      <div
        role="button"
        tabIndex={0}
        aria-label={`Flashcard ${index + 1}: ${isFlipped ? 'Answer side' : 'Question side'}. Press Space to flip.`}
        onClick={handleFlip}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleFlip();
          }
        }}
        style={{
          minHeight: '290px',
          background: isFlipped ? 'var(--color-bg)' : 'var(--color-surface)',
          border: `2px solid ${isFlipped ? 'var(--color-primary)' : 'var(--color-border)'}`,
          borderRadius: 'var(--radius-lg)',
          padding: '2.25rem 2rem',
          cursor: 'pointer',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxShadow: isFlipped
            ? '0 12px 32px -4px var(--color-primary-glow), var(--shadow-md)'
            : 'var(--shadow-md)',
          transition: 'all 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
          marginBottom: '1.75rem',
          outline: 'none',
        }}
      >
        {/* Card Header Label */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span
            style={{
              fontSize: '0.8rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: isFlipped ? 'var(--color-primary)' : 'var(--color-lavender)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: isFlipped ? 'var(--color-primary)' : 'var(--color-lavender)',
              }}
            />
            {isFlipped ? 'Answer / Back' : 'Question / Front'}
          </span>

          <span
            style={{
              fontSize: '0.8rem',
              fontWeight: 600,
              color: 'var(--color-text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'var(--color-surface-hover)',
              padding: '0.25rem 0.65rem',
              borderRadius: '999px',
            }}
          >
            <RotateCw size={13} />
            <span>Click or press Space to flip</span>
          </span>
        </div>

        {/* Card Main Body */}
        <div
          style={{
            margin: '2rem 0',
            fontSize: '1.25rem',
            fontWeight: 600,
            lineHeight: 1.6,
            color: 'var(--color-text-primary)',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '110px',
          }}
        >
          <div className="lumio-study-markdown" style={{ textAlign: 'center', width: '100%' }}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {isFlipped ? current.answer : current.question}
            </ReactMarkdown>
          </div>
        </div>

        {/* Card Bottom Prompt */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px solid var(--color-border-subtle)',
            paddingTop: '0.85rem',
            fontSize: '0.82rem',
            color: 'var(--color-text-muted)',
          }}
        >
          <span>
            {isFlipped ? 'Answer revealed — test your mastery below' : 'Think of the answer, then flip'}
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
            Keys: Space (flip) • ←/→ (nav) • 1/2 (rate)
          </span>
        </div>
      </div>

      {/* Navigation & Self-Assessment Controls Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        {/* Navigation: Prev / Next */}
        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <button
            type="button"
            onClick={handlePrev}
            disabled={index === 0}
            className="lumio-btn-secondary"
            style={{
              padding: '0.65rem 1.15rem',
              opacity: index === 0 ? 0.45 : 1,
              cursor: index === 0 ? 'not-allowed' : 'pointer',
            }}
            aria-label="Previous flashcard"
          >
            <ChevronLeft size={18} />
            <span>Prev</span>
          </button>

          <button
            type="button"
            onClick={handleNext}
            disabled={index === cards.length - 1}
            className="lumio-btn-secondary"
            style={{
              padding: '0.65rem 1.15rem',
              opacity: index === cards.length - 1 ? 0.45 : 1,
              cursor: index === cards.length - 1 ? 'not-allowed' : 'pointer',
            }}
            aria-label="Next flashcard"
          >
            <span>Next</span>
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Self-Assessment: Review Again & Know It */}
        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <button
            type="button"
            onClick={markReview}
            style={{
              background: status === 'review' ? '#EF4444' : 'rgba(239, 68, 68, 0.1)',
              color: status === 'review' ? '#FFFFFF' : '#EF4444',
              border: '1.5px solid #EF4444',
              padding: '0.65rem 1.25rem',
              borderRadius: 'var(--radius)',
              fontWeight: 700,
              fontSize: '0.92rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
              boxShadow: status === 'review' ? '0 4px 12px rgba(239, 68, 68, 0.3)' : 'none',
            }}
            title="Mark card for review (Key: 1)"
          >
            <RefreshCw size={15} />
            <span>Review again</span>
          </button>

          <button
            type="button"
            onClick={markKnown}
            style={{
              background: status === 'know' ? '#10B981' : 'rgba(16, 185, 129, 0.12)',
              color: status === 'know' ? '#FFFFFF' : '#10B981',
              border: '1.5px solid #10B981',
              padding: '0.65rem 1.25rem',
              borderRadius: 'var(--radius)',
              fontWeight: 700,
              fontSize: '0.92rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
              boxShadow: status === 'know' ? '0 4px 12px rgba(16, 185, 129, 0.3)' : 'none',
            }}
            title="Mark card as known (Key: 2)"
          >
            <CheckCircle2 size={16} />
            <span>Know it</span>
          </button>
        </div>
      </div>
    </div>
  );
}
