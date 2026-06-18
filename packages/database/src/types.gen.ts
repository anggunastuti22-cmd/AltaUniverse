// GENERATED FILE — do not edit by hand.
// Regenerate with: pnpm db:types (Supabase CLI) or pnpm db:types:local (psql).

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      audit_events: {
        Row: {
          id: string;
          actor_user_id: string | null;
          actor_role: string | null;
          action: string;
          target_table: string | null;
          target_id: string | null;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_user_id?: string | null;
          actor_role?: string | null;
          action: string;
          target_table?: string | null;
          target_id?: string | null;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          actor_user_id?: string | null;
          actor_role?: string | null;
          action?: string;
          target_table?: string | null;
          target_id?: string | null;
          metadata?: Json | null;
          created_at?: string;
        };
        Relationships: [];
      };
      lab_experiments: {
        Row: {
          id: string;
          user_id: string;
          hypothesis: string;
          user_product_id: string | null;
          status: "planned" | "active" | "concluded" | "abandoned";
          started_on: string | null;
          ended_on: string | null;
          outcome: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          hypothesis: string;
          user_product_id?: string | null;
          status?: "planned" | "active" | "concluded" | "abandoned";
          started_on?: string | null;
          ended_on?: string | null;
          outcome?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          hypothesis?: string;
          user_product_id?: string | null;
          status?: "planned" | "active" | "concluded" | "abandoned";
          started_on?: string | null;
          ended_on?: string | null;
          outcome?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      lab_products: {
        Row: {
          id: string;
          name: string;
          brand: string | null;
          category: string;
          key_ingredients: string[];
          is_published: boolean;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          brand?: string | null;
          category: string;
          key_ingredients?: string[];
          is_published?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          brand?: string | null;
          category?: string;
          key_ingredients?: string[];
          is_published?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      lab_routine_steps: {
        Row: {
          id: string;
          user_id: string;
          routine_id: string;
          user_product_id: string | null;
          step_order: number;
          instruction: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          routine_id: string;
          user_product_id?: string | null;
          step_order: number;
          instruction?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          routine_id?: string;
          user_product_id?: string | null;
          step_order?: number;
          instruction?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      lab_routines: {
        Row: {
          id: string;
          user_id: string;
          time_of_day: "am" | "pm";
          name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          time_of_day: "am" | "pm";
          name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          time_of_day?: "am" | "pm";
          name?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      lab_skin_logs: {
        Row: {
          id: string;
          user_id: string;
          observed_on: string;
          note: string | null;
          image_path: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          observed_on?: string;
          note?: string | null;
          image_path?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          observed_on?: string;
          note?: string | null;
          image_path?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      lab_skin_profiles: {
        Row: {
          user_id: string;
          skin_type: "dry" | "oily" | "combination" | "normal" | "sensitive" | null;
          concerns: string[];
          sensitivities: string[];
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          skin_type?: "dry" | "oily" | "combination" | "normal" | "sensitive" | null;
          concerns?: string[];
          sensitivities?: string[];
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          skin_type?: "dry" | "oily" | "combination" | "normal" | "sensitive" | null;
          concerns?: string[];
          sensitivities?: string[];
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      lab_user_products: {
        Row: {
          id: string;
          user_id: string;
          product_id: string | null;
          custom_name: string | null;
          opened_on: string | null;
          price_paid: number | null;
          currency: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id?: string | null;
          custom_name?: string | null;
          opened_on?: string | null;
          price_paid?: number | null;
          currency?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          product_id?: string | null;
          custom_name?: string | null;
          opened_on?: string | null;
          price_paid?: number | null;
          currency?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      media_assets: {
        Row: {
          id: string;
          user_id: string | null;
          bucket: "avatars" | "wardrobe-images" | "skin-images" | "content-assets";
          path: string;
          content_type: string | null;
          byte_size: number | null;
          is_published: boolean;
          title: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          bucket: "avatars" | "wardrobe-images" | "skin-images" | "content-assets";
          path: string;
          content_type?: string | null;
          byte_size?: number | null;
          is_published?: boolean;
          title?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          bucket?: "avatars" | "wardrobe-images" | "skin-images" | "content-assets";
          path?: string;
          content_type?: string | null;
          byte_size?: number | null;
          is_published?: boolean;
          title?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      mind_checkins: {
        Row: {
          id: string;
          user_id: string;
          checkin_date: string;
          mood: number | null;
          energy: number | null;
          note: string | null;
          created_at: string;
          updated_at: string;
          focus: number | null;
          mental_load: number | null;
          primary_need: "rest" | "space" | "connection" | "focus" | "movement" | "comfort" | "direction" | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          checkin_date?: string;
          mood?: number | null;
          energy?: number | null;
          note?: string | null;
          created_at?: string;
          updated_at?: string;
          focus?: number | null;
          mental_load?: number | null;
          primary_need?: "rest" | "space" | "connection" | "focus" | "movement" | "comfort" | "direction" | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          checkin_date?: string;
          mood?: number | null;
          energy?: number | null;
          note?: string | null;
          created_at?: string;
          updated_at?: string;
          focus?: number | null;
          mental_load?: number | null;
          primary_need?: "rest" | "space" | "connection" | "focus" | "movement" | "comfort" | "direction" | null;
        };
        Relationships: [];
      };
      mind_decisions: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          context: string | null;
          options: Json;
          factors: Json;
          reflection: string | null;
          status: "open" | "resolved" | "archived";
          resolved_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          context?: string | null;
          options?: Json;
          factors?: Json;
          reflection?: string | null;
          status?: "open" | "resolved" | "archived";
          resolved_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          context?: string | null;
          options?: Json;
          factors?: Json;
          reflection?: string | null;
          status?: "open" | "resolved" | "archived";
          resolved_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      mind_goals: {
        Row: {
          id: string;
          user_id: string;
          life_domain_id: string | null;
          title: string;
          detail: string | null;
          status: "active" | "paused" | "achieved" | "dropped";
          target_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          life_domain_id?: string | null;
          title: string;
          detail?: string | null;
          status?: "active" | "paused" | "achieved" | "dropped";
          target_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          life_domain_id?: string | null;
          title?: string;
          detail?: string | null;
          status?: "active" | "paused" | "achieved" | "dropped";
          target_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      mind_journal_entries: {
        Row: {
          id: string;
          user_id: string;
          entry_date: string;
          body: string;
          tags: string[];
          life_domain_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          entry_date?: string;
          body: string;
          tags?: string[];
          life_domain_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          entry_date?: string;
          body?: string;
          tags?: string[];
          life_domain_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      mind_life_domains: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      mind_weekly_reviews: {
        Row: {
          id: string;
          user_id: string;
          week_start: string;
          wins: string | null;
          friction: string | null;
          intention: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          week_start: string;
          wins?: string | null;
          friction?: string | null;
          intention?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          week_start?: string;
          wins?: string | null;
          friction?: string | null;
          intention?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: "routine_reminder" | "weekly_review" | "system";
          title: string;
          body: string | null;
          read_at: string | null;
          scheduled_for: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: "routine_reminder" | "weekly_review" | "system";
          title: string;
          body?: string | null;
          read_at?: string | null;
          scheduled_for?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: "routine_reminder" | "weekly_review" | "system";
          title?: string;
          body?: string | null;
          read_at?: string | null;
          scheduled_for?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          display_name: string;
          locale: string;
          timezone: string;
          avatar_path: string | null;
          onboarded_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name: string;
          locale?: string;
          timezone?: string;
          avatar_path?: string | null;
          onboarded_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string;
          locale?: string;
          timezone?: string;
          avatar_path?: string | null;
          onboarded_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_consents: {
        Row: {
          id: string;
          user_id: string;
          consent_type: "ai_processing" | "analytics" | "notifications";
          granted: boolean;
          granted_at: string | null;
          revoked_at: string | null;
          policy_version: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          consent_type: "ai_processing" | "analytics" | "notifications";
          granted?: boolean;
          granted_at?: string | null;
          revoked_at?: string | null;
          policy_version?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          consent_type?: "ai_processing" | "analytics" | "notifications";
          granted?: boolean;
          granted_at?: string | null;
          revoked_at?: string | null;
          policy_version?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_preferences: {
        Row: {
          user_id: string;
          theme: "system" | "light" | "dark";
          measurement_units: "metric" | "imperial";
          notify_routine_reminders: boolean;
          notify_weekly_review: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          theme?: "system" | "light" | "dark";
          measurement_units?: "metric" | "imperial";
          notify_routine_reminders?: boolean;
          notify_weekly_review?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          theme?: "system" | "light" | "dark";
          measurement_units?: "metric" | "imperial";
          notify_routine_reminders?: boolean;
          notify_weekly_review?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          id: string;
          user_id: string;
          role: "admin";
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role: "admin";
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          role?: "admin";
          created_at?: string;
        };
        Relationships: [];
      };
      wear_item_images: {
        Row: {
          id: string;
          user_id: string;
          item_id: string;
          storage_path: string;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          item_id: string;
          storage_path: string;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          item_id?: string;
          storage_path?: string;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      wear_items: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          category: string;
          brand: string | null;
          color: string | null;
          material: string | null;
          price: number | null;
          currency: string;
          acquired_on: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          category: string;
          brand?: string | null;
          color?: string | null;
          material?: string | null;
          price?: number | null;
          currency?: string;
          acquired_on?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          category?: string;
          brand?: string | null;
          color?: string | null;
          material?: string | null;
          price?: number | null;
          currency?: string;
          acquired_on?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      wear_outfit_items: {
        Row: {
          id: string;
          user_id: string;
          outfit_id: string;
          item_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          outfit_id: string;
          item_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          outfit_id?: string;
          item_id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      wear_outfits: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          occasion: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          occasion?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          occasion?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      wear_style_profiles: {
        Row: {
          user_id: string;
          preferred_colors: string[];
          preferred_fits: string[];
          occasions: string[];
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          preferred_colors?: string[];
          preferred_fits?: string[];
          occasions?: string[];
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          preferred_colors?: string[];
          preferred_fits?: string[];
          occasions?: string[];
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      wear_usage_logs: {
        Row: {
          id: string;
          user_id: string;
          worn_on: string;
          outfit_id: string | null;
          item_id: string | null;
          note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          worn_on?: string;
          outfit_id?: string | null;
          item_id?: string | null;
          note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          worn_on?: string;
          outfit_id?: string | null;
          item_id?: string | null;
          note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      wear_wishlist: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          reason: string | null;
          status: "considering" | "purchased" | "dismissed";
          est_price: number | null;
          currency: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          reason?: string | null;
          status?: "considering" | "purchased" | "dismissed";
          est_price?: number | null;
          currency?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          reason?: string | null;
          status?: "considering" | "purchased" | "dismissed";
          est_price?: number | null;
          currency?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      app_role: "admin";
      consent_type: "ai_processing" | "analytics" | "notifications";
      decision_status: "open" | "resolved" | "archived";
      experiment_status: "planned" | "active" | "concluded" | "abandoned";
      goal_status: "active" | "paused" | "achieved" | "dropped";
      measurement_units: "metric" | "imperial";
      notification_type: "routine_reminder" | "weekly_review" | "system";
      primary_need: "rest" | "space" | "connection" | "focus" | "movement" | "comfort" | "direction";
      routine_time: "am" | "pm";
      skin_type: "dry" | "oily" | "combination" | "normal" | "sensitive";
      storage_bucket: "avatars" | "wardrobe-images" | "skin-images" | "content-assets";
      theme_preference: "system" | "light" | "dark";
      wishlist_status: "considering" | "purchased" | "dismissed";
    };
    CompositeTypes: Record<string, never>;
  };
}
