import React from 'react';

const Stepper = ({ currentPhase }) => {
  const steps = ['Plan de Tesis', 'Ejecución', 'Borrador Final', 'Sustentación'];

  return (
    <div className="stepper">
      {steps.map((label, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentPhase;
        const isCompleted = stepNumber < currentPhase;
        
        let statusClass = '';
        if (isActive) statusClass = 'active';
        else if (isCompleted) statusClass = 'completed';

        return (
          <div key={index} className={`step ${statusClass}`}>
            <div className="step-circle">
              {isCompleted ? <i className="fa-solid fa-check"></i> : stepNumber}
            </div>
            <div className="step-label">{label}</div>
          </div>
        );
      })}
    </div>
  );
};

export default Stepper;