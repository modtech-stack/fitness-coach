export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ProfileSex =
  | "female"
  | "male"
  | "other"
  | "prefer_not_to_say";

export type TrainingExperience =
  | "beginner"
  | "intermediate"
  | "advanced";

export type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "very_active";

export type GoalType =
  | "weight_loss"
  | "muscle_gain"
  | "recomposition"
  | "endurance"
  | "general_fitness";

export type GoalStatus = "active" | "paused" | "completed";

export type ConstraintType =
  | "health"
  | "injury"
  | "schedule"
  | "equipment"
  | "preference"
  | "other";

export type ConstraintSeverity = "low" | "medium" | "high";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          birth_date: string;
          sex: ProfileSex;
          height_cm: number;
          weight_kg: number;
          training_experience: TrainingExperience;
          activity_level: ActivityLevel;
          onboarding_completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          birth_date: string;
          sex: ProfileSex;
          height_cm: number;
          weight_kg: number;
          training_experience: TrainingExperience;
          activity_level: ActivityLevel;
          onboarding_completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          birth_date?: string;
          sex?: ProfileSex;
          height_cm?: number;
          weight_kg?: number;
          training_experience?: TrainingExperience;
          activity_level?: ActivityLevel;
          onboarding_completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      goals: {
        Row: {
          id: string;
          user_id: string;
          goal_type: GoalType;
          description: string;
          priority: number;
          status: GoalStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          goal_type: GoalType;
          description: string;
          priority: number;
          status?: GoalStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          goal_type?: GoalType;
          description?: string;
          priority?: number;
          status?: GoalStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      constraints: {
        Row: {
          id: string;
          user_id: string;
          type: ConstraintType;
          description: string;
          severity: ConstraintSeverity;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: ConstraintType;
          description: string;
          severity: ConstraintSeverity;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: ConstraintType;
          description?: string;
          severity?: ConstraintSeverity;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      profile_sex: ProfileSex;
      training_experience: TrainingExperience;
      activity_level: ActivityLevel;
      goal_type: GoalType;
      goal_status: GoalStatus;
      constraint_type: ConstraintType;
      constraint_severity: ConstraintSeverity;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Goal = Database["public"]["Tables"]["goals"]["Row"];
export type Constraint =
  Database["public"]["Tables"]["constraints"]["Row"];
