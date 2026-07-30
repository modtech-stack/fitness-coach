import { describe, expect, it } from "vitest";

import {
  constraintSchema,
  goalSchema,
  profileSchema,
} from "@/features/onboarding/schemas";

describe("primary setup schemas", () => {
  it("accepts a complete profile", () => {
    const result = profileSchema.safeParse({
      name: "Test User",
      birth_date: "1990-01-01",
      sex: "prefer_not_to_say",
      height_cm: "175",
      weight_kg: "75.5",
      training_experience: "under_6_months",
      activity_level: "moderate",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.height_cm).toBe(175);
      expect(result.data.weight_kg).toBe(75.5);
    }
  });

  it("rejects an impossible profile", () => {
    const result = profileSchema.safeParse({
      name: "A",
      birth_date: "2990-01-01",
      sex: "prefer_not_to_say",
      height_cm: "25",
      weight_kg: "10",
      training_experience: "none",
      activity_level: "moderate",
    });

    expect(result.success).toBe(false);
  });

  it("accepts a prioritized goal", () => {
    const result = goalSchema.safeParse({
      goal_type: "general_fitness",
      description: "Train consistently three times per week",
      priority: "1",
      status: "active",
    });

    expect(result.success).toBe(true);
  });

  it.each(["3", "4", "5"])(
    "rejects legacy goal priority %s",
    (priority) => {
      const result = goalSchema.safeParse({
        goal_type: "general_fitness",
        description: "Train consistently three times per week",
        priority,
        status: "active",
      });

      expect(result.success).toBe(false);
    },
  );

  it("accepts a constraint without a severity selected by the user", () => {
    const result = constraintSchema.safeParse({
      type: "schedule",
      description: "Weekday sessions are limited to one hour",
    });

    expect(result.success).toBe(true);
  });
});
