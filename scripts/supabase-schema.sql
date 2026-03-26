-- Supabase Schema for WhatsApp Leads CRM
-- Run this in your Supabase SQL Editor to create the leads table

-- Create leads table
CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  location TEXT NOT NULL,
  work_type TEXT NOT NULL,
  conversation_summary TEXT NOT NULL,
  approve_message TEXT NOT NULL,
  decline_message TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  rating_reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_rating ON leads(rating);

-- Create function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for auto-updating updated_at
DROP TRIGGER IF EXISTS update_leads_updated_at ON leads;
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (optional - enable if you need user-based access)
-- ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Insert sample data (optional - remove in production)
INSERT INTO leads (name, phone, email, location, work_type, conversation_summary, approve_message, decline_message, rating, rating_reason, status)
VALUES 
  (
    'Sarah Johnson',
    '+1 (555) 123-4567',
    'sarah.johnson@email.com',
    'Los Angeles, CA',
    'Kitchen Renovation',
    'Customer is looking to renovate their kitchen. They want modern cabinets, quartz countertops, and new appliances. Budget is around $25,000-$35,000. Timeline is flexible but preferably within 3 months.',
    'Hi Sarah! Thank you for reaching out. We''d love to help with your kitchen renovation. Our team specializes in modern kitchen designs and we can definitely work within your budget. Would you be available for a free consultation this week?',
    'Hi Sarah, thank you for your interest. Unfortunately, we''re currently at full capacity for new kitchen projects. We recommend reaching out to [Alternative Company] who does excellent work in your area.',
    5,
    'Excellent lead! High budget, in our service area, and work type matches our expertise perfectly.',
    'pending'
  ),
  (
    'Michael Chen',
    '+1 (555) 234-5678',
    'm.chen@business.com',
    'San Francisco, CA',
    'Commercial Office Build-out',
    'Business owner needs office space build-out for a new tech startup. Looking for an open floor plan with 4 private offices, a conference room, and a break room. Space is approximately 3,500 sq ft. Needs completion within 6 weeks.',
    'Hello Michael! We''re excited about your office build-out project. Our commercial team has extensive experience with tech startup spaces. We can definitely meet your 6-week timeline. Can we schedule a site visit this week to discuss details?',
    'Hello Michael, we appreciate you considering us for your office project. Unfortunately, our commercial team is fully booked for the next 2 months and won''t be able to meet your timeline. We suggest contacting [Commercial Builders Inc] for faster availability.',
    4,
    'Great commercial opportunity. Tight timeline might be challenging but doable.',
    'pending'
  ),
  (
    'Emma Wilson',
    '+1 (555) 345-6789',
    'emma.w@gmail.com',
    'Austin, TX',
    'Bathroom Remodel',
    'Homeowner wants to remodel master bathroom. Interested in walk-in shower, double vanity, and heated floors. Has seen our previous work on Instagram and loves the modern aesthetic. Budget is $15,000-$20,000.',
    'Hi Emma! Thank you for reaching out and for the kind words about our Instagram portfolio! We''d be thrilled to help with your bathroom remodel. A walk-in shower with heated floors is one of our specialties. Let''s set up a time to discuss your vision!',
    'Hi Emma, thank you for your interest in our services. Unfortunately, we don''t currently serve the Austin, TX area. We recommend checking out [Local Austin Renovations] who has a similar design aesthetic.',
    2,
    'Not in our service area - Austin, TX is outside our coverage zone.',
    'pending'
  ),
  (
    'David Park',
    '+1 (555) 456-7890',
    'david.park@outlook.com',
    'Seattle, WA',
    'Deck Construction',
    'Customer wants a new composite deck built in their backyard. Approximately 400 sq ft with built-in seating and lighting. Has HOA approval already. Looking to start in spring.',
    'Hi David! A composite deck with built-in seating sounds fantastic! We love that you''ve already gotten HOA approval - that makes things much smoother. Spring is a great time to start. Would you like to schedule a free estimate?',
    'Hi David, thank you for considering us for your deck project. Unfortunately, we''re not taking on new deck construction projects at this time as we''re focusing on interior renovations. We recommend [Outdoor Living Experts] for deck work.',
    3,
    'Moderate fit - we do decks but it''s not our specialty. Customer is well-prepared.',
    'pending'
  );
