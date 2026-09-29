export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      allowed_emails: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: 'participant' | 'admin' | 'tester' | 'mentor';
          is_active: boolean;
          added_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          full_name?: string | null;
          role?: 'participant' | 'admin' | 'tester' | 'mentor';
          is_active?: boolean;
          added_by?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          role?: 'participant' | 'admin' | 'tester' | 'mentor';
          is_active?: boolean;
          added_by?: string;
          created_at?: string;
        };
      };
      user_progress: {
        Row: {
          id: string;
          email: string;
          session_id: string;
          video_completed: boolean;
          quiz_score: number;
          quiz_passed: boolean;
          quiz_attempts: number;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          session_id: string;
          video_completed?: boolean;
          quiz_score?: number;
          quiz_passed?: boolean;
          quiz_attempts?: number;
          completed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          session_id?: string;
          video_completed?: boolean;
          quiz_score?: number;
          quiz_passed?: boolean;
          quiz_attempts?: number;
          completed_at?: string | null;
          created_at?: string;
        };
      };
      competition_submissions: {
        Row: {
          id: string;
          email: string;
          competition_type: 'reels' | 'poster' | 'essay';
          submission_url: string;
          submission_title: string | null;
          notes: string | null;
          status: 'submitted' | 'reviewed' | 'shortlisted';
          submitted_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          competition_type: 'reels' | 'poster' | 'essay';
          submission_url: string;
          submission_title?: string | null;
          notes?: string | null;
          status?: 'submitted' | 'reviewed' | 'shortlisted';
          submitted_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          competition_type?: 'reels' | 'poster' | 'essay';
          submission_url?: string;
          submission_title?: string | null;
          notes?: string | null;
          status?: 'submitted' | 'reviewed' | 'shortlisted';
          submitted_at?: string;
        };
      };
      hackathon_teams: {
        Row: {
          id: string;
          name: string;
          lead_email: string;
          lead_name: string;
          vertical: string;
          problem_statement_id: string;
          github_repo_url: string | null;
          submission_notes: string | null;
          submitted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          lead_email: string;
          lead_name: string;
          vertical: string;
          problem_statement_id: string;
          github_repo_url?: string | null;
          submission_notes?: string | null;
          submitted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          lead_email?: string;
          lead_name?: string;
          vertical?: string;
          problem_statement_id?: string;
          github_repo_url?: string | null;
          submission_notes?: string | null;
          submitted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      team_members: {
        Row: {
          id: string;
          team_id: string;
          email: string;
          full_name: string;
          role: 'leader' | 'member';
          status: 'invited' | 'accepted' | 'declined';
          invited_at: string;
          responded_at: string | null;
        };
        Insert: {
          id?: string;
          team_id: string;
          email: string;
          full_name: string;
          role?: 'leader' | 'member';
          status?: 'invited' | 'accepted' | 'declined';
          invited_at?: string;
          responded_at?: string | null;
        };
        Update: {
          id?: string;
          team_id?: string;
          email?: string;
          full_name?: string;
          role?: 'leader' | 'member';
          status?: 'invited' | 'accepted' | 'declined';
          invited_at?: string;
          responded_at?: string | null;
        };
      };
      platform_config: {
        Row: {
          key: string;
          value: Json;
          updated_at: string;
        };
        Insert: {
          key: string;
          value: Json;
          updated_at?: string;
        };
        Update: {
          key?: string;
          value?: Json;
          updated_at?: string;
        };
      };
      registrations: {
        Row: {
          id: string;
          name: string;
          email: string;
          institution: string | null;
          role: string | null;
          interests: string[] | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          institution?: string | null;
          role?: string | null;
          interests?: string[] | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          institution?: string | null;
          role?: string | null;
          interests?: string[] | null;
          created_at?: string;
        };
      };
    };
  };
}
