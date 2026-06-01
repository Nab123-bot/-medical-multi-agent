export default function StepIndicator({ steps, currentStep }) {
  return (
    <div className="steps">
      {steps.map((label, i) => (
        <span
          key={label}
          className={`step ${i === currentStep ? "active" : ""} ${i < currentStep ? "done" : ""}`}
        >
          {i + 1}. {label}
        </span>
      ))}
    </div>
  );
}
