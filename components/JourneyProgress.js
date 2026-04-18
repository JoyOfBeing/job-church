'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from './AuthProvider';

const STEPS_TOP = [
  { label: 'Beliefs', path: '/doctrine', number: 1 },
  { label: '(Re)Membership', path: '/membership', number: 2 },
  { label: 'SNL Service', path: '/snl', number: 3 },
  { label: 'Braids (Small Groups)', path: '/braid', number: 4 },
];

export default function JourneyProgress({ completedSteps = [] }) {
  const { member } = useAuth();

  // Unlock Deprogramming when committed, keep others locked for now
  const STEPS_BOTTOM = [
    { label: 'Deprogramming', path: member?.is_committed ? '/deprogramming' : null, number: 5 },
    { label: 'Elder Path', path: '/elder-path', number: 6 },
    { label: 'Magic Show', path: null, number: 7 },
    { label: 'Resources', path: null, number: 8 },
  ];
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
