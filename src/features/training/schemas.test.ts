import { describe, expect, it } from "vitest";

import { parseWorkoutCompletionFormData } from "@/features/training/schemas";

const workoutId = "11111111-1111-4111-8111-111111111111";
const exerciseId = "22222222-2222-4222-8222-222222222222";

function createCompletionFormData(overrides?: {
  reps?: string;
  weight?: string;
  rpe?: string;
}) {
  const formData = new FormData();
  formData.set("workout_id", workoutId);
  formData.set("comment", "Работал спокойно");
  formData.append("planned_exercise_id", exerciseId);
  formData.append("set_number", "1");
  formData.append("reps", overrides?.reps ?? "10");
  formData.append("weight_kg", overrides?.weight ?? "12.5");
  formData.append("rpe", overrides?.rpe ?? "7");
  return formData;
}

describe("workout completion form", () => {
  it("parses an actual set with repetitions, weight, and RPE", () => {
    const result = parseWorkoutCompletionFormData(
      createCompletionFormData(),
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.sets).toEqual([
        {
          planned_exercise_id: exerciseId,
          set_number: 1,
          reps: 10,
          weight_kg: 12.5,
          rpe: 7,
        },
      ]);
    }
  });

  it("allows bodyweight work without an external weight", () => {
    const result = parseWorkoutCompletionFormData(
      createCompletionFormData({ weight: "" }),
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.sets[0]?.weight_kg).toBeNull();
    }
  });

  it("rejects RPE outside the 1–10 scale", () => {
    const result = parseWorkoutCompletionFormData(
      createCompletionFormData({ rpe: "11" }),
    );

    expect(result.success).toBe(false);
  });

  it("rejects incomplete repeated fields", () => {
    const formData = createCompletionFormData();
    formData.delete("rpe");

    const result = parseWorkoutCompletionFormData(formData);

    expect(result.success).toBe(false);
  });

  it("stores only rows that represent completed sets", () => {
    const formData = createCompletionFormData();
    formData.append("planned_exercise_id", exerciseId);
    formData.append("set_number", "2");
    formData.append("reps", "");
    formData.append("weight_kg", "");
    formData.append("rpe", "");

    const result = parseWorkoutCompletionFormData(formData);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.sets).toHaveLength(1);
    }
  });

  it("rejects a partially filled actual set", () => {
    const result = parseWorkoutCompletionFormData(
      createCompletionFormData({ rpe: "" }),
    );

    expect(result.success).toBe(false);
  });
});
