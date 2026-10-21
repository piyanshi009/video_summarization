import React, { useState } from 'react';
import PropTypes from 'prop-types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/**
 * Utility to strip markdown formatting characters from edges of strings
 */
function cleanLine(line) {
  if (!line) return '';
  return line.replace(/^[*_~`#]+|[*_~`#]+$/g, '').trim();
}

/**
 * Parse options from raw text lines and identify the correct option.
 */
function parseOptions(optionLines, correctAnsText) {
  const options = [];
  if (!optionLines || !optionLines.length) return options;

  let correctLetter = null;
  const letterMatch = correctAnsText ? correctAnsText.match(/^([A-D])(?:[\.)\s]|$)/i) : null;
  if (letterMatch) {
    correctLetter = letterMatch[1].toUpperCase();
  }

  for (const raw of optionLines) {
    // Check checklist items: "- [ ] Option" or "- [x] Option"
    const checkMatch = raw.match(/^[-*]\s*\[([ xX])\]\s*(.*)$/i);
    if (checkMatch) {
      options.push({
        label: '',
        text: checkMatch[2].trim(),
        isCorrect: checkMatch[1].toLowerCase() === 'x',
      });
      continue;
    }

    // Check lettered options: "A) Option" or "A. Option" or "* A) Option"
    const letterOptionMatch = raw.match(/^(?:[-*]\s*)?([A-D])[\.)]\s*(.*)$/i);
    if (letterOptionMatch) {
      const letter = letterOptionMatch[1].toUpperCase();
      const text = letterOptionMatch[2].trim();
      const isCorrect =
        correctLetter === letter ||
        (correctAnsText && cleanLine(text).toLowerCase() === cleanLine(correctAnsText).toLowerCase());

      options.push({
        label: letter,
        text: text,
        isCorrect: Boolean(isCorrect),
      });
      continue;
    }
  }

  // If a correct letter was provided (e.g. "B") but no option was marked correct yet
  if (correctLetter && options.length && !options.some((o) => o.isCorrect)) {
    options.forEach((opt) => {
      if (opt.label === correctLetter) opt.isCorrect = true;
    });
  }

  return options;
}

/**
 * Parse quizzes where Questions and Answers are in separate sections,
 * e.g. "**Questions:**" ... "**Answers:**" (standard Gemini Flash output).
 */
function parseSplitSections(qSection, aSection) {
  const qLines = qSection.split('\n');
  const rawQBlocks = [];
  let currentQBlock = null;

  const itemRegex = /^\s*(?:(\d+)[\.)]|(?:Q|Question)\s*(\d+)[:.]?)\s*(.*)/i;

  for (const raw of qLines) {
    const line = raw.trim();
    if (!line || line === '---' || line === '***') continue;
    // Skip section headers like "**Questions:**" or quiz titles
    if (/^(?:\*{1,3}|#{1,4})?\s*questions?:?\s*(?:\*{1,3})?$/i.test(line)) continue;
    if (/^(?:\*{1,3}|#{1,4})?.*quiz.*(?:\*{1,3})?$/i.test(line) && !itemRegex.test(line)) continue;

    const match = line.match(itemRegex);
    if (match) {
      if (currentQBlock) rawQBlocks.push(currentQBlock);
      const num = parseInt(match[1] || match[2], 10);
      currentQBlock = { num, lines: [match[3] || ''] };
    } else if (currentQBlock) {
      currentQBlock.lines.push(line);
    }
  }
  if (currentQBlock) rawQBlocks.push(currentQBlock);

  // Extract answers from aSection
  const aLines = aSection.split('\n');
  const answerMap = new Map();
  let currentNum = null;
  let currentAnsLines = [];

  for (const raw of aLines) {
    const line = raw.trim();
    if (!line || line === '---' || line === '***') continue;
    if (/^(?:\*{1,3}|#{1,4})?\s*answers?:?\s*(?:\*{1,3})?$/i.test(line)) continue;

    const match = line.match(itemRegex);
    if (match) {
      if (currentNum !== null) {
        answerMap.set(currentNum, currentAnsLines.join('\n').trim());
      }
      currentNum = parseInt(match[1] || match[2], 10);
      currentAnsLines = [match[3] || ''];
    } else if (currentNum !== null) {
      currentAnsLines.push(line);
    }
  }
  if (currentNum !== null) {
    answerMap.set(currentNum, currentAnsLines.join('\n').trim());
  }

  if (rawQBlocks.length === 0) return [];

  const questions = [];

  rawQBlocks.forEach((block, idx) => {
    const qNum = block.num || idx + 1;
    const fullTextLines = block.lines.map((l) => l.trim()).filter(Boolean);
    if (!fullTextLines.length) return;

    let questionText = fullTextLines[0];
    const optionLines = [];

    for (let i = 1; i < fullTextLines.length; i++) {
      const ln = fullTextLines[i];
      if (/^(?:[A-D][\.)]|[-*]\s*\[[ xX]\]|[-*]\s*[A-D][\.)])/i.test(ln)) {
        optionLines.push(ln);
      } else if (optionLines.length === 0) {
        questionText += ' ' + ln;
      } else {
        optionLines.push(ln);
      }
    }

    // Clean question formatting
    questionText = questionText.replace(/^\*\*(.*)\*\*$/, '$1').trim();
    questionText = questionText.replace(/^(?:Question|Q)\s*\d*[:.]?\s*/i, '').trim();

    const rawAns = answerMap.get(qNum) || answerMap.get(idx + 1) || '';
    const cleanAns = rawAns
      .replace(/^(?:Answer|Ans)[:.]?\s*/i, '')
      .replace(/^\*\*(?:Answer|Ans)[:.]?\*\*\s*/i, '')
      .trim();

    const options = parseOptions(optionLines, cleanAns);

    if (questionText) {
      questions.push({
        id: qNum,
        question: questionText,
        options,
        rawAnswer: cleanAns,
        explanation: '',
      });
    }
  });

  return questions;
}

/**
 * Parse quizzes where each question is inline (followed by its options and/or answer).
 */
function parseInlineQuestions(text) {
  const lines = text.split('\n');
  const blocks = [];
  let currentBlock = [];

  const headingStart = /^#{1,4}\s+/;
  const numStart = /^\s*(?:\d+[\.)]|(?:Q|Question)\s*\d*[:.]?)\s+/i;
  const hasHeadings = lines.some((l) => headingStart.test(l.trim()) && /question|\d/i.test(l));

  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line === '---' || line === '***') continue;

    // Skip preamble before first question block
    if (!currentBlock.length && !hasHeadings && !numStart.test(line)) continue;
    if (!currentBlock.length && hasHeadings && !headingStart.test(line)) continue;

    let isNewQuestion = false;
    if (hasHeadings) {
      if (headingStart.test(line)) isNewQuestion = true;
    } else {
      if (numStart.test(line) && !/^(?:answer|ans|explanation)[:.]/i.test(line)) {
        isNewQuestion = true;
      }
    }

    if (isNewQuestion && currentBlock.length) {
      blocks.push(currentBlock);
      currentBlock = [line];
    } else if (isNewQuestion) {
      currentBlock = [line];
    } else if (currentBlock.length) {
      currentBlock.push(line);
    }
  }
  if (currentBlock.length) blocks.push(currentBlock);

  const questions = [];

  blocks.forEach((blk, idx) => {
    let questionLine = blk[0]
      .replace(/^#{1,4}\s+/, '')
      .replace(/^\s*(?:\d+[\.)]|(?:Q|Question)\s*\d*[:.]?)\s+/i, '')
      .replace(/^\*\*(.*)\*\*$/, '$1')
      .replace(/^(?:Question|Q)\s*\d*[:.]?\s*/i, '')
      .trim();

    const optionLines = [];
    let answer = '';
    let explanation = '';
    let foundAnswer = false;

    for (let i = 1; i < blk.length; i++) {
      const ln = blk[i];
      const ansMatch = ln.match(/^(?:\*{1,3})?(?:Answer|Ans)[:.]?(?:\*{1,3})?\s*(.*)$/i);
      if (ansMatch) {
        answer = ansMatch[1].trim();
        foundAnswer = true;
        continue;
      }

      const expMatch = ln.match(/^(?:\*{1,3})?Explanation[:.]?(?:\*{1,3})?\s*(.*)$/i);
      if (expMatch) {
        explanation = expMatch[1].trim();
        continue;
      }

      if (!foundAnswer && /^(?:[A-D][\.)]|[-*]\s*\[[ xX]\]|[-*]\s*[A-D][\.)])/i.test(ln)) {
        optionLines.push(ln);
      } else if (!foundAnswer && optionLines.length === 0) {
        questionLine += ' ' + ln;
      } else if (foundAnswer) {
        explanation += (explanation ? ' ' : '') + ln;
      }
    }

    questionLine = questionLine.replace(/^(?:Question|Q)\s*\d*[:.]?\s*/i, '').trim();

    if (!questionLine) return;

    const options = parseOptions(optionLines, answer);

    questions.push({
      id: idx + 1,
      question: questionLine,
      options,
      rawAnswer: answer,
      explanation,
    });
  });

  return questions;
}

/**
 * Universal quiz parser supporting sectioned, numbered, checklist, and plain Q&A formats.
 */
export function parseQuiz(rawText) {
  if (!rawText || typeof rawText !== 'string' || !rawText.trim()) {
    return [];
  }
  const text = rawText.trim();

  // 1. Check for split Questions / Answers sections
  const sectionSplitRegex = /(?:^|\n)\s*(?:#{1,4}\s*|\*{1,3}|_{1,3})?\s*(?:Answers|Answer Key|Solutions)[:\s]*(?:\*{1,3}|_{1,3})?\s*(?:\n|$)/i;
  if (sectionSplitRegex.test(text)) {
    const parts = text.split(sectionSplitRegex);
    if (parts.length >= 2) {
      const parsed = parseSplitSections(parts[0], parts.slice(1).join('\n'));
      if (parsed && parsed.length > 0) return parsed;
    }
  }

  // 2. Otherwise parse inline question blocks
  return parseInlineQuestions(text);
}

/**
 * EnhancedQuizViewer Component
 */
const EnhancedQuizViewer = ({ rawContent, onRegenerate, loading = false }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  // answers map: { [questionIdx]: { selectedOption, isSubmitted, isRevealed, selfScore } }
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  const quiz = parseQuiz(rawContent || '');

  // Calculate current score
  const totalScore = Object.values(answers).reduce((acc, curr) => {
    if (curr.isCorrect === true || curr.selfScore === 1) return acc + 1;
    return acc;
  }, 0);

  // If no questions could be parsed
  if (!quiz.length) {
    return (
      <div
        style={{
          background: 'var(--color-surface)',
          padding: '1.5rem',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--color-border)',
          marginTop: '1rem',
          textAlign: 'center',
        }}
      >
        <h3 style={{ color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>
          No structured quiz questions found
        </h3>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
          The quiz content may be incomplete or in an unrecognized format. You can regenerate the quiz below:
        </p>
        {onRegenerate && (
          <button
            onClick={onRegenerate}
            disabled={loading}
            style={{
              background: 'var(--color-primary)',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--radius)',
              padding: '0.65rem 1.25rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              marginBottom: '1.5rem',
            }}
          >
            {loading ? 'Regenerating Quiz…' : 'Regenerate Quiz'}
          </button>
        )}
        <details style={{ textAlign: 'left', marginTop: '1rem', color: 'var(--color-text-secondary)' }}>
          <summary style={{ cursor: 'pointer', fontWeight: 600 }}>View Raw Quiz Text</summary>
          <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'var(--color-bg)', borderRadius: '8px' }}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{rawContent || 'No content provided.'}</ReactMarkdown>
          </div>
        </details>
      </div>
    );
  }

  const currentQ = quiz[currentIndex];
  const currentAnswer = answers[currentIndex] || {};
  const isMultipleChoice = currentQ.options && currentQ.options.length >= 2;
  const progressPercent = Math.round(((currentIndex + 1) / quiz.length) * 100);

  // Handlers for Multiple Choice
  const handleSelectOption = (optIdx) => {
    if (currentAnswer.isSubmitted) return; // locked once submitted
    setAnswers((prev) => ({
      ...prev,
      [currentIndex]: {
        ...prev[currentIndex],
        selectedOption: optIdx,
      },
    }));
  };

  const handleSubmitMCQ = () => {
    if (currentAnswer.selectedOption === undefined || currentAnswer.isSubmitted) return;
    const isCorrect = Boolean(currentQ.options[currentAnswer.selectedOption]?.isCorrect);
    setAnswers((prev) => ({
      ...prev,
      [currentIndex]: {
        ...prev[currentIndex],
        isSubmitted: true,
        isCorrect,
      },
    }));
  };

  // Handlers for Reveal Answer (Self-Assessment)
  const handleRevealAnswer = () => {
    setAnswers((prev) => ({
      ...prev,
      [currentIndex]: {
        ...prev[currentIndex],
        isRevealed: true,
      },
    }));
  };

  const handleSelfGrade = (scoreValue) => {
    setAnswers((prev) => ({
      ...prev,
      [currentIndex]: {
        ...prev[currentIndex],
        selfScore: scoreValue,
        isSubmitted: true,
      },
    }));
  };

  // Navigation
  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  };

  const handleNext = () => {
    if (currentIndex < quiz.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      setShowResults(true);
    }
  };

  const handleRestart = () => {
    setAnswers({});
    setCurrentIndex(0);
    setShowResults(false);
  };

  // Final Results Screen
  if (showResults) {
    const percentage = Math.round((totalScore / quiz.length) * 100);
    let feedback = 'Keep practicing to master this topic!';
    if (percentage === 100) feedback = 'Perfect score! Outstanding mastery of the video material!';
    else if (percentage >= 75) feedback = 'Great work! You have a solid grasp of this topic.';
    else if (percentage >= 50) feedback = 'Good effort! Review the questions below to strengthen key areas.';

    return (
      <div
        style={{
          background: 'var(--color-surface)',
          padding: '2rem',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--color-border)',
          maxWidth: '700px',
          margin: '1.5rem auto',
          textAlign: 'center',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
          {percentage >= 75 ? '🎉' : percentage >= 50 ? '👏' : '📚'}
        </div>
        <h2 style={{ color: 'var(--color-primary)', marginBottom: '0.5rem' }}>Quiz Completed!</h2>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>{feedback}</p>

        <div
          style={{
            display: 'inline-block',
            padding: '1.25rem 2.5rem',
            background: 'var(--color-primary-light)',
            borderRadius: 'var(--radius)',
            marginBottom: '2rem',
          }}
        >
          <div style={{ fontSize: '2.2rem', fontWeight: 700, color: 'var(--color-primary)' }}>
            {totalScore} / {quiz.length}
          </div>
          <div style={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>{percentage}% Score</div>
        </div>

        {/* Question Review List */}
        <div style={{ textAlign: 'left', marginBottom: '2rem' }}>
          <h4 style={{ color: 'var(--color-text-primary)', marginBottom: '0.75rem' }}>Question Review:</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {quiz.map((q, idx) => {
              const a = answers[idx] || {};
              const correct = a.isCorrect === true || a.selfScore === 1;
              const answered = a.isSubmitted || a.selfScore !== undefined;

              return (
                <div
                  key={idx}
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-bg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ maxWidth: '80%' }}>
                    <span style={{ fontWeight: 600, marginRight: '0.5rem', color: 'var(--color-text-primary)' }}>
                      Q{idx + 1}:
                    </span>
                    <span style={{ color: 'var(--color-text-secondary)' }}>{q.question}</span>
                  </div>
                  <div>
                    {!answered ? (
                      <span style={{ color: '#9ca3af', fontSize: '0.9rem', fontWeight: 600 }}>Skipped</span>
                    ) : correct ? (
                      <span style={{ color: '#10b981', fontSize: '0.9rem', fontWeight: 700 }}>✓ Correct</span>
                    ) : (
                      <span style={{ color: '#ef4444', fontSize: '0.9rem', fontWeight: 700 }}>✗ Review</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleRestart}
            style={{
              background: 'var(--color-primary)',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--radius)',
              padding: '0.75rem 1.5rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Restart Quiz
          </button>
          {onRegenerate && (
            <button
              onClick={onRegenerate}
              disabled={loading}
              style={{
                background: 'var(--color-surface)',
                color: 'var(--color-primary)',
                border: '1px solid var(--color-primary)',
                borderRadius: 'var(--radius)',
                padding: '0.75rem 1.5rem',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Regenerating…' : 'Generate New Quiz'}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: '720px',
        margin: '1rem auto',
        color: 'var(--color-text-primary)',
      }}
    >
      {/* Top Header: Progress & Score Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span
            style={{
              fontWeight: 700,
              fontSize: '1.05rem',
              color: 'var(--color-primary)',
            }}
          >
            Question {currentIndex + 1} of {quiz.length}
          </span>
          <span
            style={{
              fontSize: '0.75rem',
              padding: '0.2rem 0.5rem',
              borderRadius: '999px',
              background: isMultipleChoice ? 'var(--color-primary-light)' : '#FEF3C7',
              color: isMultipleChoice ? 'var(--color-primary)' : '#92400E',
              fontWeight: 600,
            }}
          >
            {isMultipleChoice ? 'Multiple Choice' : 'Concept Recall'}
          </span>
        </div>

        <div
          style={{
            fontWeight: 700,
            background: 'var(--color-primary-light)',
            color: 'var(--color-primary)',
            padding: '0.35rem 0.75rem',
            borderRadius: '999px',
            fontSize: '0.9rem',
          }}
        >
          Score: {totalScore} / {quiz.length}
        </div>
      </div>

      {/* Progress Bar */}
      <div
        style={{
          height: '6px',
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

      {/* Question Card */}
      <div
        style={{
          background: 'var(--color-surface)',
          padding: '1.5rem',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '1.25rem',
        }}
      >
        <h3
          style={{
            fontSize: '1.25rem',
            fontWeight: 600,
            lineHeight: 1.5,
            color: 'var(--color-text-primary)',
            marginBottom: '1.25rem',
          }}
        >
          {currentQ.question}
        </h3>

        {/* Case 1: Multiple Choice Options */}
        {isMultipleChoice && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {currentQ.options.map((opt, optIdx) => {
              const isSelected = currentAnswer.selectedOption === optIdx;
              const isSubmitted = currentAnswer.isSubmitted;
              const isCorrectOpt = opt.isCorrect;

              let btnBg = 'var(--color-surface)';
              let btnBorder = 'var(--color-border)';
              let textColor = 'var(--color-text-primary)';
              let badgeBg = 'var(--color-border)';
              let badgeColor = 'var(--color-text-secondary)';

              if (isSelected && !isSubmitted) {
                btnBg = 'var(--color-primary-light)';
                btnBorder = 'var(--color-primary)';
                badgeBg = 'var(--color-primary)';
                badgeColor = '#fff';
              } else if (isSubmitted) {
                if (isCorrectOpt) {
                  btnBg = '#D1FAE5';
                  btnBorder = '#10B981';
                  textColor = '#065F46';
                  badgeBg = '#10B981';
                  badgeColor = '#fff';
                } else if (isSelected && !isCorrectOpt) {
                  btnBg = '#FEE2E2';
                  btnBorder = '#EF4444';
                  textColor = '#991B1B';
                  badgeBg = '#EF4444';
                  badgeColor = '#fff';
                }
              }

              return (
                <button
                  key={optIdx}
                  type="button"
                  onClick={() => handleSelectOption(optIdx)}
                  disabled={isSubmitted}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    textAlign: 'left',
                    borderRadius: '8px',
                    border: `1.5px solid ${btnBorder}`,
                    background: btnBg,
                    color: textColor,
                    cursor: isSubmitted ? 'default' : 'pointer',
                    transition: 'all 0.15s ease',
                    fontSize: '1rem',
                  }}
                >
                  <span
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: badgeBg,
                      color: badgeColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      flexShrink: 0,
                    }}
                  >
                    {opt.label || String.fromCharCode(65 + optIdx)}
                  </span>
                  <span style={{ flex: 1 }}>{opt.text}</span>
                  {isSubmitted && isCorrectOpt && (
                    <span style={{ color: '#10B981', fontWeight: 700, fontSize: '1.1rem' }}>✓</span>
                  )}
                  {isSubmitted && isSelected && !isCorrectOpt && (
                    <span style={{ color: '#EF4444', fontWeight: 700, fontSize: '1.1rem' }}>✗</span>
                  )}
                </button>
              );
            })}

            {/* MCQ Submit Button */}
            {!currentAnswer.isSubmitted && (
              <div style={{ marginTop: '0.75rem' }}>
                <button
                  type="button"
                  onClick={handleSubmitMCQ}
                  disabled={currentAnswer.selectedOption === undefined}
                  style={{
                    background: currentAnswer.selectedOption === undefined ? '#D1D5DB' : 'var(--color-primary)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 'var(--radius)',
                    padding: '0.65rem 1.25rem',
                    fontWeight: 600,
                    cursor: currentAnswer.selectedOption === undefined ? 'not-allowed' : 'pointer',
                    transition: 'background 0.2s ease',
                  }}
                >
                  Submit Answer
                </button>
              </div>
            )}
          </div>
        )}

        {/* Case 2: Concept Recall / Reveal Answer */}
        {!isMultipleChoice && (
          <div>
            {!currentAnswer.isRevealed ? (
              <button
                type="button"
                onClick={handleRevealAnswer}
                style={{
                  background: 'var(--color-primary)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 'var(--radius)',
                  padding: '0.65rem 1.25rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                👁️ Reveal Answer
              </button>
            ) : (
              <div
                style={{
                  marginTop: '0.5rem',
                  padding: '1.25rem',
                  background: 'var(--color-bg)',
                  borderRadius: 'var(--radius)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <div
                  style={{
                    fontWeight: 700,
                    color: 'var(--color-primary)',
                    marginBottom: '0.5rem',
                    fontSize: '0.95rem',
                  }}
                >
                  Model Answer:
                </div>
                <div style={{ lineHeight: 1.6, color: 'var(--color-text-primary)' }}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{currentQ.rawAnswer || 'No answer recorded.'}</ReactMarkdown>
                </div>

                {/* Self-Assessment buttons */}
                <div
                  style={{
                    marginTop: '1.25rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid var(--color-border)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    flexWrap: 'wrap',
                  }}
                >
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                    Did you know this?
                  </span>
                  <button
                    type="button"
                    onClick={() => handleSelfGrade(1)}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      border: '1.5px solid #10B981',
                      background: currentAnswer.selfScore === 1 ? '#10B981' : '#ECFDF5',
                      color: currentAnswer.selfScore === 1 ? '#fff' : '#065F46',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                    }}
                  >
                    ✓ Got it right (+1)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelfGrade(0)}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      border: '1.5px solid #6B7280',
                      background: currentAnswer.selfScore === 0 ? '#6B7280' : '#F3F4F6',
                      color: currentAnswer.selfScore === 0 ? '#fff' : '#374151',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                    }}
                  >
                    ✗ Need to review (0)
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Explanation section if available */}
        {currentAnswer.isSubmitted && currentQ.explanation && (
          <div
            style={{
              marginTop: '1rem',
              padding: '1rem',
              background: 'var(--color-bg)',
              borderRadius: '8px',
              borderLeft: '4px solid var(--color-primary)',
            }}
          >
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-primary)' }}>Explanation:</div>
            <div style={{ marginTop: '0.35rem', color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{currentQ.explanation}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation Buttons */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <button
          type="button"
          onClick={handlePrev}
          disabled={currentIndex === 0}
          style={{
            background: 'var(--color-surface)',
            color: currentIndex === 0 ? '#9CA3AF' : 'var(--color-text-primary)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius)',
            padding: '0.65rem 1.25rem',
            fontWeight: 600,
            cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
          }}
        >
          ← Previous
        </button>

        {/* Question dots indicator */}
        <div style={{ display: 'flex', gap: '0.35rem' }}>
          {quiz.map((_, i) => {
            const a = answers[i] || {};
            const isAnswered = a.isSubmitted || a.selfScore !== undefined;
            const isCorrect = a.isCorrect === true || a.selfScore === 1;

            let dotBg = 'var(--color-border)';
            if (i === currentIndex) dotBg = 'var(--color-primary)';
            else if (isAnswered && isCorrect) dotBg = '#10B981';
            else if (isAnswered && !isCorrect) dotBg = '#EF4444';

            return (
              <button
                key={i}
                type="button"
                onClick={() => setCurrentIndex(i)}
                style={{
                  width: i === currentIndex ? '22px' : '10px',
                  height: '10px',
                  borderRadius: '5px',
                  background: dotBg,
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'all 0.2s ease',
                }}
                title={`Question ${i + 1}`}
              />
            );
          })}
        </div>

        <button
          type="button"
          onClick={handleNext}
          style={{
            background: 'var(--color-primary)',
            color: '#fff',
            border: 'none',
            borderRadius: 'var(--radius)',
            padding: '0.65rem 1.25rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {currentIndex === quiz.length - 1 ? 'Finish Quiz →' : 'Next →'}
        </button>
      </div>
    </div>
  );
};

EnhancedQuizViewer.propTypes = {
  rawContent: PropTypes.string.isRequired,
  onRegenerate: PropTypes.func,
  loading: PropTypes.bool,
};

export default EnhancedQuizViewer;
