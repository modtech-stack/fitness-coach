import { describe, expect, it } from "vitest";

import {
  parsePlannedWorkoutEditFormData,
  parseProductFeedbackFormData,
  parseProgramEditFormData,
  parseWorkoutCompletionFormData,
} from "@/features/training/schemas";

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

describe("training plan editing", () => {
  it("parses program name, start date, and duration", () => {
    const formData = new FormData();
    formData.set("program_id", workoutId);
    formData.set("name", "Мой тренировочный цикл");
    formData.set("start_date", "2026-08-03");
    formData.set("week_count", "4");

    const result = parseProgramEditFormData(formData);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.week_count).toBe(4);
    }
  });

  it("rejects an impossible program date", () => {
    const formData = new FormData();
    formData.set("program_id", workoutId);
    formData.set("name", "Мой тренировочный цикл");
    formData.set("start_date", "2026-02-31");
    formData.set("week_count", "4");

    expect(parseProgramEditFormData(formData).success).toBe(false);
  });

  it("parses exercise plan, working weight, and target RPE", () => {
    const formData = new FormData();
    formData.set("workout_id", workoutId);
    formData.set("instructions", "Работайте спокойно и контролируйте технику.");
    formData.append("exercise_id", exerciseId);
    formData.append("exercise_name", "Приседание с гантелью");
    formData.append("planned_sets", "3");
    formData.append("planned_reps", "10");
    formData.append("target_weight_kg", "40");
    formData.append("target_rpe", "7");
    formData.append("exercise_notes", "Без отказа");

    const result = parsePlannedWorkoutEditFormData(formData);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.exercises[0]).toMatchObject({
        target_weight_kg: 40,
        target_rpe: 7,
      });
    }
  });

  it("rejects misaligned exercise edit fields", () => {
    const formData = new FormData();
    formData.set("workout_id", workoutId);
    formData.set("instructions", "Работайте спокойно.");
    formData.append("exercise_id", exerciseId);
    formData.append("exercise_name", "Приседание");

    expect(parsePlannedWorkoutEditFormData(formData).success).toBe(false);
  });
});

describe("product feedback", () => {
  it("accepts feedback from an internal page", () => {
    const formData = new FormData();
    formData.set("page_url", "/workouts/123");
    formData.set("message", "Сделайте рабочий вес заметнее.");

    expect(parseProductFeedbackFormData(formData).success).toBe(true);
  });

  it("rejects an external feedback URL", () => {
    const formData = new FormData();
    formData.set("page_url", "https://unsafe.example");
    formData.set("message", "Сообщение");

    expect(parseProductFeedbackFormData(formData).success).toBe(false);
  });
});
