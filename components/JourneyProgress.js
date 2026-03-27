'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

const STEPS_TOP = [
  { label: 'Beliefs', path: '/doctrine', number: 1 },
  { label: 'Threshold', path: '/threshold', number: 2 },
  { label: 'Braid', path: '/braid', number: 3 },
  { label: 'SNL', path: '/snl', number: 4 },
];

const STEPS_BOTTOM = [
  { label: 'Deprogramming', path: null, number: 5 },
  { label: 'Magic Show', path: null, number: 6 },
  { label: 'JOB Board', path: null, number: 7 },
  { label: 'Hold Co', path: null, number: 8 },
];

export default function JourneyProgress({ completedSteps = [] }) {
  const pathname = usePathname();
  const allSteps = [...STEPS_TOP, ...STEPS_BOTTOM];
  const currentIndex = allSteps.findIndex(s => s.path === pathname);

  function renderRow(steps) {
    return steps.map((step, i) => {
      const globalIndex = allSteps.indexOf(step);
      const isCompleted = completedSteps.includes(step.number);
      const isCurrent = globalIndex === currentIndex;
      const isFuture = !isCompleted && !isCurrent;
      const isLocked = step.path === null;

      let className = 'journey-step';
      if (isCompleted) className += ' journey-step-completed';
      if (isCurrent) className += ' journey-step-active';
      if (isFuture) className += ' journey-step-future';
      if (isLocked) className += ' journey-step-locked';

      const dot = (
        <div className={className}>
          <div className="journey-dot-progress">
            {isCompleted ? '✓' : isLocked ? '·' : step.number}
          </div>
          <span className="journey-step-label">{step.label}</span>
        </div>
      );

      const wrapped = step.path && !isLocked ? (
        <Link href={step.path} style={{ textDecoration: 'none' }}>
          {dot}
        </Link>
      ) : dot;

      return (
        <div key={step.number} className="journey-step-wrapper">
          {wrapped}
          {i < steps.length - 1 && (
            <div className={`journey-line ${isCompleted ? 'journey-line-completed' : ''} ${isLocked ? 'journey-line-locked' : ''}`} />
          )}
        </div>
      );
    });
  }

  return (
    <div className="journey-container">
      <div className="journey-progress">
        {renderRow(STEPS_TOP)}
      </div>
      <div className="journey-progress journey-progress-bottom">
        {renderRow(STEPS_BOTTOM)}
      </div>
    </div>
  );
}
