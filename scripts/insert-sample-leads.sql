-- Insert sample leads for team: b694424c-d844-4dd2-b059-f54bb951bd99
-- Run this in your Supabase SQL Editor

-- Lead 1: Sarah Johnson - Kitchen Renovation
INSERT INTO leads (name, phone, email, lead_count, is_loyal, auto_approved, created_at, updated_at, teams_id)
VALUES (
  'Sarah Johnson',
  '+49 30 12345678',
  'sarah.johnson@email.com',
  1,
  false,
  false,
  '2026-03-27T10:00:00Z',
  '2026-03-27T10:00:00Z',
  'b694424c-d844-4dd2-b059-f54bb951bd99'
);

INSERT INTO leads_sessions (created_at, teams_id, leads_id, status, current_step, collected_data, needs_more_info, rating, rating_reason, updated_at)
VALUES (
  '2026-03-27T10:00:00Z',
  'b694424c-d844-4dd2-b059-f54bb951bd99',
  (SELECT id FROM leads WHERE phone = '+49 30 12345678' LIMIT 1),
  'active',
  'qualification',
  '{"name": "Sarah Johnson", "phone": "+49 30 12345678", "email": "sarah.johnson@email.com", "location": "Berlin", "workType": "Kitchen Renovation", "budget": "25000-35000", "timeline": "3 months", "message": "Customer is looking to renovate their kitchen. They want modern cabinets, quartz countertops, and new appliances."}',
  false,
  4,
  'Excellent lead! High budget, in our service area, and work type matches our expertise perfectly.',
  '2026-03-27T10:00:00Z'
);

-- Lead 2: Michael Chen - Commercial Office
INSERT INTO leads (name, phone, email, lead_count, is_loyal, auto_approved, created_at, updated_at, teams_id)
VALUES (
  'Michael Chen',
  '+49 40 23456789',
  'm.chen@business.com',
  1,
  false,
  false,
  '2026-03-26T15:00:00Z',
  '2026-03-26T15:00:00Z',
  'b694424c-d844-4dd2-b059-f54bb951bd99'
);

INSERT INTO leads_sessions (created_at, teams_id, leads_id, status, current_step, collected_data, needs_more_info, rating, rating_reason, updated_at)
VALUES (
  '2026-03-26T15:00:00Z',
  'b694424c-d844-4dd2-b059-f54bb951bd99',
  (SELECT id FROM leads WHERE phone = '+49 40 23456789' LIMIT 1),
  'active',
  'qualification',
  '{"name": "Michael Chen", "phone": "+49 40 23456789", "email": "m.chen@business.com", "location": "Hamburg", "workType": "Commercial Office Build-out", "budget": "150000", "timeline": "6 weeks", "message": "Business owner needs office space build-out for a new tech startup."}',
  false,
  3,
  'Good commercial opportunity but tight timeline may be challenging.',
  '2026-03-26T15:00:00Z'
);

-- Lead 3: Emma Wilson - Bathroom Remodel
INSERT INTO leads (name, phone, email, lead_count, is_loyal, auto_approved, created_at, updated_at, teams_id)
VALUES (
  'Emma Wilson',
  '+49 89 34567890',
  'emma.w@gmail.com',
  1,
  false,
  false,
  '2026-03-25T09:00:00Z',
  '2026-03-25T09:00:00Z',
  'b694424c-d844-4dd2-b059-f54bb951bd99'
);

INSERT INTO leads_sessions (created_at, teams_id, leads_id, status, current_step, collected_data, needs_more_info, rating, rating_reason, updated_at)
VALUES (
  '2026-03-25T09:00:00Z',
  'b694424c-d844-4dd2-b059-f54bb951bd99',
  (SELECT id FROM leads WHERE phone = '+49 89 34567890' LIMIT 1),
  'active',
  'qualification',
  '{"name": "Emma Wilson", "phone": "+49 89 34567890", "email": "emma.w@gmail.com", "location": "München", "workType": "Bathroom Remodel", "budget": "15000-20000", "timeline": "flexible", "message": "Homeowner wants to remodel master bathroom."}',
  false,
  2,
  'Located in our service area - München. Good budget for bathroom remodel.',
  '2026-03-25T09:00:00Z'
);

-- Lead 4: David Park - Deck Construction
INSERT INTO leads (name, phone, email, lead_count, is_loyal, auto_approved, created_at, updated_at, teams_id)
VALUES (
  'David Park',
  '+49 89 45678901',
  'david.park@outlook.com',
  1,
  false,
  false,
  '2026-03-24T14:00:00Z',
  '2026-03-24T14:00:00Z',
  'b694424c-d844-4dd2-b059-f54bb951bd99'
);

INSERT INTO leads_sessions (created_at, teams_id, leads_id, status, current_step, collected_data, needs_more_info, rating, rating_reason, updated_at)
VALUES (
  '2026-03-24T14:00:00Z',
  'b694424c-d844-4dd2-b059-f54bb951bd99',
  (SELECT id FROM leads WHERE phone = '+49 89 45678901' LIMIT 1),
  'active',
  'qualification',
  '{"name": "David Park", "phone": "+49 89 45678901", "email": "david.park@outlook.com", "location": "Stuttgart", "workType": "Deck Construction", "budget": "8000", "timeline": "spring", "message": "Customer wants a new composite deck built in their backyard."}',
  false,
  3,
  'Moderate fit - we do decks but it is not our specialty. Customer is well-prepared.',
  '2026-03-24T14:00:00Z'
);

-- Lead 5: Anna Schmidt - Loyalty Customer (returning)
INSERT INTO leads (name, phone, email, lead_count, is_loyal, auto_approved, created_at, updated_at, teams_id)
VALUES (
  'Anna Schmidt',
  '+49 30 98765432',
  'anna.schmidt@web.de',
  3,
  true,
  true,
  '2026-03-23T11:00:00Z',
  '2026-03-27T08:00:00Z',
  'b694424c-d844-4dd2-b059-f54bb951bd99'
);

INSERT INTO leads_sessions (created_at, teams_id, leads_id, status, current_step, collected_data, needs_more_info, rating, rating_reason, forwarded_at, updated_at)
VALUES (
  '2026-03-23T11:00:00Z',
  'b694424c-d844-4dd2-b059-f54bb951bd99',
  (SELECT id FROM leads WHERE phone = '+49 30 98765432' LIMIT 1),
  'closed',
  'finished',
  '{"name": "Anna Schmidt", "phone": "+49 30 98765432", "email": "anna.schmidt@web.de", "location": "Berlin", "workType": "Living Room Renovation", "budget": "12000", "timeline": "2 months"}',
  false,
  5,
  'Excellent loyalty customer! Previously completed 2 projects with us.',
  '2026-03-25T16:00:00Z',
  '2026-03-25T16:00:00Z'
);

-- Lead 6: Thomas Müller - Windows Replacement (pending review)
INSERT INTO leads (name, phone, email, lead_count, is_loyal, auto_approved, created_at, updated_at, teams_id)
VALUES (
  'Thomas Müller',
  '+49 40 56789012',
  't.mueller@gmx.de',
  1,
  false,
  false,
  '2026-03-27T12:00:00Z',
  '2026-03-27T12:00:00Z',
  'b694424c-d844-4dd2-b059-f54bb951bd99'
);

INSERT INTO leads_sessions (created_at, teams_id, leads_id, status, current_step, collected_data, needs_more_info, rating, rating_reason, updated_at)
VALUES (
  '2026-03-27T12:00:00Z',
  'b694424c-d844-4dd2-b059-f54bb951bd99',
  (SELECT id FROM leads WHERE phone = '+49 40 56789012' LIMIT 1),
  'active',
  'rating',
  '{"name": "Thomas Müller", "phone": "+49 40 56789012", "email": "t.mueller@gmx.de", "location": "Hamburg", "workType": "Windows Replacement", "budget": "unknown", "timeline": "as soon as possible", "message": "Customer needs all windows replaced in their 1980s apartment building."}',
  true,
  NULL,
  NULL,
  '2026-03-27T12:00:00Z'
);

-- Lead 7: Lisa Berger - Solar Panel Installation
INSERT INTO leads (name, phone, email, lead_count, is_loyal, auto_approved, created_at, updated_at, teams_id)
VALUES (
  'Lisa Berger',
  '+49 89 67890123',
  'lisa.berger@yahoo.de',
  1,
  false,
  false,
  '2026-03-26T16:00:00Z',
  '2026-03-26T16:00:00Z',
  'b694424c-d844-4dd2-b059-f54bb951bd99'
);

INSERT INTO leads_sessions (created_at, teams_id, leads_id, status, current_step, collected_data, needs_more_info, rating, rating_reason, updated_at)
VALUES (
  '2026-03-26T16:00:00Z',
  'b694424c-d844-4dd2-b059-f54bb951bd99',
  (SELECT id FROM leads WHERE phone = '+49 89 67890123' LIMIT 1),
  'active',
  'qualification',
  '{"name": "Lisa Berger", "phone": "+49 89 67890123", "email": "lisa.berger@yahoo.de", "location": "München", "workType": "Solar Panel Installation", "budget": "20000", "timeline": "summer 2026", "message": "Homeowner interested in installing solar panels on their roof."}',
  false,
  4,
  'Good lead - growing market for solar, good budget, clear timeline.',
  '2026-03-26T16:00:00Z'
);

-- Lead 8: Hans Weber - Approved lead
INSERT INTO leads (name, phone, email, lead_count, is_loyal, auto_approved, created_at, updated_at, teams_id)
VALUES (
  'Hans Weber',
  '+49 30 11111111',
  'hans.weber@email.de',
  1,
  false,
  true,
  '2026-03-20T10:00:00Z',
  '2026-03-22T14:00:00Z',
  'b694424c-d844-4dd2-b059-f54bb951bd99'
);

INSERT INTO leads_sessions (created_at, teams_id, leads_id, status, current_step, collected_data, needs_more_info, rating, rating_reason, forwarded_at, updated_at)
VALUES (
  '2026-03-20T10:00:00Z',
  'b694424c-d844-4dd2-b059-f54bb951bd99',
  (SELECT id FROM leads WHERE phone = '+49 30 11111111' LIMIT 1),
  'active',
  'finished',
  '{"name": "Hans Weber", "phone": "+49 30 11111111", "email": "hans.weber@email.de", "location": "Berlin", "workType": "Kitchen Renovation", "budget": "45000", "timeline": "2 months"}',
  false,
  5,
  'High value lead, ready for conversion.',
  '2026-03-22T14:00:00Z',
  '2026-03-22T14:00:00Z'
);

-- Lead 9: Julia Fischer - Declined lead
INSERT INTO leads (name, phone, email, lead_count, is_loyal, auto_approved, created_at, updated_at, teams_id)
VALUES (
  'Julia Fischer',
  '+49 40 22222222',
  'julia.fischer@gmx.de',
  1,
  false,
  false,
  '2026-03-18T09:00:00Z',
  '2026-03-19T11:00:00Z',
  'b694424c-d844-4dd2-b059-f54bb951bd99'
);

INSERT INTO leads_sessions (created_at, teams_id, leads_id, status, current_step, collected_data, needs_more_info, rating, rating_reason, forwarded_at, updated_at)
VALUES (
  '2026-03-18T09:00:00Z',
  'b694424c-d844-4dd2-b059-f54bb951bd99',
  (SELECT id FROM leads WHERE phone = '+49 40 22222222' LIMIT 1),
  'active',
  'finished',
  '{"name": "Julia Fischer", "phone": "+49 40 22222222", "email": "julia.fischer@gmx.de", "location": "Dresden", "workType": "Pool Construction", "budget": "5000", "timeline": "summer"}',
  false,
  1,
  'Too small budget, outside our typical service area.',
  '2026-03-19T11:00:00Z',
  '2026-03-19T11:00:00Z'
);

-- Lead 10: Marcus Schulz - Manual review
INSERT INTO leads (name, phone, email, lead_count, is_loyal, auto_approved, created_at, updated_at, teams_id)
VALUES (
  'Marcus Schulz',
  '+49 89 33333333',
  'marcus.schulz@web.de',
  1,
  false,
  false,
  '2026-03-27T08:00:00Z',
  '2026-03-27T08:00:00Z',
  'b694424c-d844-4dd2-b059-f54bb951bd99'
);

INSERT INTO leads_sessions (created_at, teams_id, leads_id, status, current_step, collected_data, needs_more_info, rating, rating_reason, updated_at)
VALUES (
  '2026-03-27T08:00:00Z',
  'b694424c-d844-4dd2-b059-f54bb951bd99',
  (SELECT id FROM leads WHERE phone = '+49 89 33333333' LIMIT 1),
  'active',
  'review',
  '{"name": "Marcus Schulz", "phone": "+49 89 33333333", "email": "marcus.schulz@web.de", "location": "München", "workType": "Home Extension", "budget": "80000", "timeline": "6 months", "message": "Looking to add a second floor to their house. Complex project requiring structural engineering."}',
  true,
  NULL,
  NULL,
  '2026-03-27T08:00:00Z'
);

-- Lead 11: Nadine Krause - Another pending
INSERT INTO leads (name, phone, email, lead_count, is_loyal, auto_approved, created_at, updated_at, teams_id)
VALUES (
  'Nadine Krause',
  '+49 30 44444444',
  'nadine.krause@email.com',
  1,
  false,
  false,
  '2026-03-27T06:00:00Z',
  '2026-03-27T06:00:00Z',
  'b694424c-d844-4dd2-b059-f54bb951bd99'
);

INSERT INTO leads_sessions (created_at, teams_id, leads_id, status, current_step, collected_data, needs_more_info, rating, rating_reason, updated_at)
VALUES (
  '2026-03-27T06:00:00Z',
  'b694424c-d844-4dd2-b059-f54bb951bd99',
  (SELECT id FROM leads WHERE phone = '+49 30 44444444' LIMIT 1),
  'active',
  'qualification',
  '{"name": "Nadine Krause", "phone": "+49 30 44444444", "email": "nadine.krause@email.com", "location": "Berlin", "workType": "Bathroom Renovation", "budget": "18000", "timeline": "1 month"}',
  true,
  NULL,
  NULL,
  '2026-03-27T06:00:00Z'
);

-- Lead 12: Oliver Schmidt - High priority urgent
INSERT INTO leads (name, phone, email, lead_count, is_loyal, auto_approved, created_at, updated_at, teams_id)
VALUES (
  'Oliver Schmidt',
  '+49 40 55555555',
  'oliver.schmidt@business.de',
  2,
  true,
  false,
  '2026-03-25T14:00:00Z',
  '2026-03-27T09:00:00Z',
  'b694424c-d844-4dd2-b059-f54bb951bd99'
);

INSERT INTO leads_sessions (created_at, teams_id, leads_id, status, current_step, collected_data, needs_more_info, rating, rating_reason, updated_at)
VALUES (
  '2026-03-25T14:00:00Z',
  'b694424c-d844-4dd2-b059-f54bb951bd99',
  (SELECT id FROM leads WHERE phone = '+49 40 55555555' LIMIT 1),
  'active',
  'qualification',
  '{"name": "Oliver Schmidt", "phone": "+49 40 55555555", "email": "oliver.schmidt@business.de", "location": "Hamburg", "workType": "Full House Renovation", "budget": "120000", "timeline": "4 months", "message": "Complete renovation of a 1970s house. Previously worked with us on bathroom remodel."}',
  false,
  5,
  'Excellent loyalty customer! Very high budget project. Contact immediately.',
  '2026-03-27T09:00:00Z'
);

-- Lead 13: Petra Hoffmann - Low rating nurture
INSERT INTO leads (name, phone, email, lead_count, is_loyal, auto_approved, created_at, updated_at, teams_id)
VALUES (
  'Petra Hoffmann',
  '+49 89 66666666',
  'petra.hoffmann@gmx.de',
  1,
  false,
  false,
  '2026-03-15T11:00:00Z',
  '2026-03-15T11:00:00Z',
  'b694424c-d844-4dd2-b059-f54bb951bd99'
);

INSERT INTO leads_sessions (created_at, teams_id, leads_id, status, current_step, collected_data, needs_more_info, rating, rating_reason, updated_at)
VALUES (
  '2026-03-15T11:00:00Z',
  'b694424c-d844-4dd2-b059-f54bb951bd99',
  (SELECT id FROM leads WHERE phone = '+49 89 66666666' LIMIT 1),
  'active',
  'qualification',
  '{"name": "Petra Hoffmann", "phone": "+49 89 66666666", "email": "petra.hoffmann@gmx.de", "location": "Nürnberg", "workType": "Garage Door Replacement", "budget": "2500", "timeline": "whenever"}',
  false,
  1,
  'Very low budget, niche work. Add to newsletter list.',
  '2026-03-15T11:00:00Z'
);

-- Lead 14: Stefan Wolf - Medium priority
INSERT INTO leads (name, phone, email, lead_count, is_loyal, auto_approved, created_at, updated_at, teams_id)
VALUES (
  'Stefan Wolf',
  '+49 30 77777777',
  'stefan.wolf@email.de',
  1,
  false,
  false,
  '2026-03-26T12:00:00Z',
  '2026-03-26T12:00:00Z',
  'b694424c-d844-4dd2-b059-f54bb951bd99'
);

INSERT INTO leads_sessions (created_at, teams_id, leads_id, status, current_step, collected_data, needs_more_info, rating, rating_reason, updated_at)
VALUES (
  '2026-03-26T12:00:00Z',
  'b694424c-d844-4dd2-b059-f54bb951bd99',
  (SELECT id FROM leads WHERE phone = '+49 30 77777777' LIMIT 1),
  'active',
  'qualification',
  '{"name": "Stefan Wolf", "phone": "+49 30 77777777", "email": "stefan.wolf@email.de", "location": "Berlin", "workType": "Flooring Installation", "budget": "9000", "timeline": "2 weeks"}',
  false,
  3,
  'Good medium budget lead in our area. Schedule follow-up.',
  '2026-03-26T12:00:00Z'
);

-- Lead 15: Christina Meyer - Another approved
INSERT INTO leads (name, phone, email, lead_count, is_loyal, auto_approved, created_at, updated_at, teams_id)
VALUES (
  'Christina Meyer',
  '+49 40 88888888',
  'christina.meyer@web.de',
  1,
  false,
  true,
  '2026-03-21T15:00:00Z',
  '2026-03-23T10:00:00Z',
  'b694424c-d844-4dd2-b059-f54bb951bd99'
);

INSERT INTO leads_sessions (created_at, teams_id, leads_id, status, current_step, collected_data, needs_more_info, rating, rating_reason, forwarded_at, updated_at)
VALUES (
  '2026-03-21T15:00:00Z',
  'b694424c-d844-4dd2-b059-f54bb951bd99',
  (SELECT id FROM leads WHERE phone = '+49 40 88888888' LIMIT 1),
  'active',
  'finished',
  '{"name": "Christina Meyer", "phone": "+49 40 88888888", "email": "christina.meyer@web.de", "location": "Hamburg", "workType": "Kitchen Modernization", "budget": "35000", "timeline": "3 months"}',
  false,
  4,
  'Good lead, approved for follow-up.',
  '2026-03-23T10:00:00Z',
  '2026-03-23T10:00:00Z'
);

-- Lead 16: Andreas Koch - New today
INSERT INTO leads (name, phone, email, lead_count, is_loyal, auto_approved, created_at, updated_at, teams_id)
VALUES (
  'Andreas Koch',
  '+49 89 99999999',
  'andreas.koch@email.com',
  1,
  false,
  false,
  '2026-03-27T13:00:00Z',
  '2026-03-27T13:00:00Z',
  'b694424c-d844-4dd2-b059-f54bb951bd99'
);

INSERT INTO leads_sessions (created_at, teams_id, leads_id, status, current_step, collected_data, needs_more_info, rating, rating_reason, updated_at)
VALUES (
  '2026-03-27T13:00:00Z',
  'b694424c-d844-4dd2-b059-f54bb951bd99',
  (SELECT id FROM leads WHERE phone = '+49 89 99999999' LIMIT 1),
  'active',
  'welcome',
  '{"name": "Andreas Koch", "phone": "+49 89 99999999", "email": "andreas.koch@email.com", "location": "München", "workType": "Roof Repair", "budget": "15000", "timeline": "urgent"}',
  true,
  NULL,
  NULL,
  '2026-03-27T13:00:00Z'
);