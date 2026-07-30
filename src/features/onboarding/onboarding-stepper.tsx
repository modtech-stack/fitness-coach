const steps = ["Профиль", "Цель", "Ограничения"];

export function OnboardingStepper({
  currentStep,
}: {
  currentStep: 1 | 2 | 3;
}) {
  return (
    <ol
      aria-label="Этапы первичной настройки"
      className="grid grid-cols-3 gap-2"
    >
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isCurrent = stepNumber === currentStep;
        const isComplete = stepNumber < currentStep;

        return (
          <li
            aria-current={isCurrent ? "step" : undefined}
            className={`rounded-xl border px-3 py-2 text-center text-xs font-semibold sm:text-sm ${
              isCurrent
                ? "border-teal-600 bg-teal-50 text-teal-900"
                : isComplete
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-slate-200 bg-white text-slate-500"
            }`}
            key={step}
          >
            {stepNumber}. {step}
          </li>
        );
      })}
    </ol>
  );
}
