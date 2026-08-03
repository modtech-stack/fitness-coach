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
  | "none"
  | "under_6_months"
  | "six_months_to_two_years"
  | "over_two_years";

export type ActivityLevel = "low" | "moderate" | "high";

export type GoalType =
  | "weight_loss"
  | "muscle_gain"
  | "recomposition"
  | "endurance"
  | "general_fitness";

export type GoalStatus = "active" | "paused" | "completed";

export type ConstraintType =
  | "pain"
  | "injury"
  | "health"
  | "schedule"
  | "equipment"
  | "other";

export type ConstraintSeverity = "low" | "medium" | "high";

export type TrainingProgramStatus =
  | "draft"
  | "under_review"
  | "approved"
  | "active"
  | "needs_adjustment"
  | "completed"
  | "archived";

export type WorkoutSessionStatus = "in_progress" | "completed";

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
          severity: ConstraintSeverity | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: ConstraintType;
          description: string;
          severity?: ConstraintSeverity | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: ConstraintType;
          description?: string;
          severity?: ConstraintSeverity | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      training_programs: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string;
          status: TrainingProgramStatus;
          start_date: string;
          end_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description: string;
          status?: TrainingProgramStatus;
          start_date: string;
          end_date: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string;
          status?: TrainingProgramStatus;
          start_date?: string;
          end_date?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      program_phases: {
        Row: {
          id: string;
          user_id: string;
          program_id: string;
          name: string;
          description: string;
          phase_number: number;
          start_date: string;
          end_date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          program_id: string;
          name: string;
          description: string;
          phase_number: number;
          start_date: string;
          end_date: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          program_id?: string;
          name?: string;
          description?: string;
          phase_number?: number;
          start_date?: string;
          end_date?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      program_weeks: {
        Row: {
          id: string;
          user_id: string;
          phase_id: string;
          week_number: number;
          start_date: string;
          end_date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          phase_id: string;
          week_number: number;
          start_date: string;
          end_date: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          phase_id?: string;
          week_number?: number;
          start_date?: string;
          end_date?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      planned_workouts: {
        Row: {
          id: string;
          user_id: string;
          week_id: string;
          name: string;
          focus: string;
          instructions: string;
          scheduled_date: string;
          estimated_minutes: number;
          workout_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          week_id: string;
          name: string;
          focus: string;
          instructions: string;
          scheduled_date: string;
          estimated_minutes: number;
          workout_order: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          week_id?: string;
          name?: string;
          focus?: string;
          instructions?: string;
          scheduled_date?: string;
          estimated_minutes?: number;
          workout_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      planned_exercises: {
        Row: {
          id: string;
          user_id: string;
          planned_workout_id: string;
          name: string;
          planned_sets: number;
          planned_reps: string;
          target_weight_kg: number | null;
          target_rpe: number | null;
          notes: string | null;
          exercise_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          planned_workout_id: string;
          name: string;
          planned_sets: number;
          planned_reps: string;
          target_weight_kg?: number | null;
          target_rpe?: number | null;
          notes?: string | null;
          exercise_order: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          planned_workout_id?: string;
          name?: string;
          planned_sets?: number;
          planned_reps?: string;
          target_weight_kg?: number | null;
          target_rpe?: number | null;
          notes?: string | null;
          exercise_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      workout_sessions: {
        Row: {
          id: string;
          user_id: string;
          planned_workout_id: string;
          status: WorkoutSessionStatus;
          comment: string | null;
          started_at: string;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          planned_workout_id: string;
          status?: WorkoutSessionStatus;
          comment?: string | null;
          started_at?: string;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          planned_workout_id?: string;
          status?: WorkoutSessionStatus;
          comment?: string | null;
          started_at?: string;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      actual_sets: {
        Row: {
          id: string;
          user_id: string;
          workout_session_id: string;
          planned_workout_id: string;
          planned_exercise_id: string;
          set_number: number;
          reps: number;
          weight_kg: number | null;
          rpe: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          workout_session_id: string;
          planned_workout_id: string;
          planned_exercise_id: string;
          set_number: number;
          reps: number;
          weight_kg?: number | null;
          rpe: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          workout_session_id?: string;
          planned_workout_id?: string;
          planned_exercise_id?: string;
          set_number?: number;
          reps?: number;
          weight_kg?: number | null;
          rpe?: number;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      create_starter_program: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      complete_workout: {
        Args: {
          p_planned_workout_id: string;
          p_comment: string | null;
          p_sets: Json;
        };
        Returns: string;
      };
    };
    Enums: {
      profile_sex: ProfileSex;
      training_experience: TrainingExperience;
      activity_level: ActivityLevel;
      goal_type: GoalType;
      goal_status: GoalStatus;
      constraint_type: ConstraintType;
      constraint_severity: ConstraintSeverity;
      training_program_status: TrainingProgramStatus;
      workout_session_status: WorkoutSessionStatus;
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
export type TrainingProgram =
  Database["public"]["Tables"]["training_programs"]["Row"];
export type ProgramPhase =
  Database["public"]["Tables"]["program_phases"]["Row"];
export type ProgramWeek =
  Database["public"]["Tables"]["program_weeks"]["Row"];
export type PlannedWorkout =
  Database["public"]["Tables"]["planned_workouts"]["Row"];
export type PlannedExercise =
  Database["public"]["Tables"]["planned_exercises"]["Row"];
export type WorkoutSession =
  Database["public"]["Tables"]["workout_sessions"]["Row"];
export type ActualSet =
  Database["public"]["Tables"]["actual_sets"]["Row"];
