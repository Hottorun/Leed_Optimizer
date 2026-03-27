-- Migration: Add AI and additional settings columns to settings table
-- Run this in your Supabase SQL Editor

-- Add AI-related columns
ALTER TABLE settings ADD COLUMN IF NOT EXISTS ai_enabled BOOLEAN DEFAULT true;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS auto_approve BOOLEAN DEFAULT false;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS auto_decline BOOLEAN DEFAULT false;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS auto_manual_review BOOLEAN DEFAULT true;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS min_rating_threshold INTEGER DEFAULT 3 CHECK (min_rating_threshold >= 1 AND min_rating_threshold <= 5);
ALTER TABLE settings ADD COLUMN IF NOT EXISTS auto_response_enabled BOOLEAN DEFAULT false;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS sentiment_analysis BOOLEAN DEFAULT true;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS priority_detection BOOLEAN DEFAULT true;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS duplicate_detection BOOLEAN DEFAULT true;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS ai_instructions TEXT DEFAULT '';

-- Add additional workflow columns
ALTER TABLE settings ADD COLUMN IF NOT EXISTS auto_delete_declined_days INTEGER DEFAULT 0;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS auto_approve_enabled BOOLEAN DEFAULT false;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS auto_approve_min_rating INTEGER DEFAULT 4;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS auto_decline_unrelated BOOLEAN DEFAULT false;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS follow_up_days INTEGER DEFAULT 3;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS follow_up_message TEXT DEFAULT 'Hi {name}, just checking in on your inquiry. Are you still interested?';
ALTER TABLE settings ADD COLUMN IF NOT EXISTS default_approve_message TEXT DEFAULT 'Thank you for your interest! We''d love to work with you.';
ALTER TABLE settings ADD COLUMN IF NOT EXISTS default_decline_message TEXT DEFAULT 'Thank you for reaching out. Unfortunately, we''re not able to help at this time.';
ALTER TABLE settings ADD COLUMN IF NOT EXISTS default_unrelated_message TEXT DEFAULT 'This message doesn''t seem to be related to our services.';

-- Add theme and language settings
ALTER TABLE settings ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark'));
ALTER TABLE settings ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'de' CHECK (language IN ('de', 'en'));

-- Add notification settings
ALTER TABLE settings ADD COLUMN IF NOT EXISTS notifications_enabled BOOLEAN DEFAULT true;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS notify_new_leads BOOLEAN DEFAULT true;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS notify_lead_approved BOOLEAN DEFAULT true;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS notify_lead_declined BOOLEAN DEFAULT true;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS notify_manual_review BOOLEAN DEFAULT true;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS notify_daily_summary BOOLEAN DEFAULT false;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS notify_weekly_report BOOLEAN DEFAULT true;

-- Add webhook URL (if not exists)
ALTER TABLE settings ADD COLUMN IF NOT EXISTS webhook_url TEXT DEFAULT '';

-- Update existing settings rows with default values
UPDATE settings SET 
  ai_enabled = COALESCE(ai_enabled, true),
  auto_approve = COALESCE(auto_approve, false),
  auto_decline = COALESCE(auto_decline, false),
  auto_manual_review = COALESCE(auto_manual_review, true),
  min_rating_threshold = COALESCE(min_rating_threshold, 3),
  auto_response_enabled = COALESCE(auto_response_enabled, false),
  sentiment_analysis = COALESCE(sentiment_analysis, true),
  priority_detection = COALESCE(priority_detection, true),
  duplicate_detection = COALESCE(duplicate_detection, true),
  ai_instructions = COALESCE(ai_instructions, ''),
  auto_delete_declined_days = COALESCE(auto_delete_declined_days, 0),
  auto_approve_enabled = COALESCE(auto_approve_enabled, false),
  auto_approve_min_rating = COALESCE(auto_approve_min_rating, 4),
  auto_decline_unrelated = COALESCE(auto_decline_unrelated, false),
  follow_up_days = COALESCE(follow_up_days, 3),
  follow_up_message = COALESCE(follow_up_message, 'Hi {name}, just checking in on your inquiry. Are you still interested?'),
  default_approve_message = COALESCE(default_approve_message, 'Thank you for your interest! We''d love to work with you.'),
  default_decline_message = COALESCE(default_decline_message, 'Thank you for reaching out. Unfortunately, we''re not able to help at this time.'),
  default_unrelated_message = COALESCE(default_unrelated_message, 'This message doesn''t seem to be related to our services.'),
  theme = COALESCE(theme, 'light'),
  language = COALESCE(language, 'de'),
  notifications_enabled = COALESCE(notifications_enabled, true),
  notify_new_leads = COALESCE(notify_new_leads, true),
  notify_lead_approved = COALESCE(notify_lead_approved, true),
  notify_lead_declined = COALESCE(notify_lead_declined, true),
  notify_manual_review = COALESCE(notify_manual_review, true),
  notify_daily_summary = COALESCE(notify_daily_summary, false),
  notify_weekly_report = COALESCE(notify_weekly_report, true),
  webhook_url = COALESCE(webhook_url, '')
WHERE ai_enabled IS NULL 
   OR auto_approve IS NULL 
   OR auto_decline IS NULL 
   OR auto_manual_review IS NULL 
   OR min_rating_threshold IS NULL 
   OR auto_response_enabled IS NULL 
   OR sentiment_analysis IS NULL 
   OR priority_detection IS NULL 
   OR duplicate_detection IS NULL 
   OR ai_instructions IS NULL 
   OR auto_delete_declined_days IS NULL 
   OR auto_approve_enabled IS NULL 
   OR auto_approve_min_rating IS NULL 
   OR auto_decline_unrelated IS NULL 
   OR follow_up_days IS NULL 
   OR follow_up_message IS NULL 
   OR default_approve_message IS NULL 
   OR default_decline_message IS NULL 
   OR default_unrelated_message IS NULL 
   OR theme IS NULL 
   OR language IS NULL 
   OR notifications_enabled IS NULL 
   OR notify_new_leads IS NULL 
   OR notify_lead_approved IS NULL 
   OR notify_lead_declined IS NULL 
   OR notify_manual_review IS NULL 
   OR notify_daily_summary IS NULL 
   OR notify_weekly_report IS NULL 
   OR webhook_url IS NULL;