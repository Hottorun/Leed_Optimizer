-- Insert 16 mock leads for team: b694424c-d844-4dd2-b059-f54bb951bd99
-- Uses UPSERT to handle existing records

-- Lead 001: Sarah Johnson - pending
WITH upsert_lead AS (
  INSERT INTO leads (name, phone, email, lead_count, is_loyal, auto_approved, created_at, updated_at, teams_id)
  VALUES ('Sarah Johnson', '+1 (555) 123-4567', 'sarah.johnson@email.com', 1, false, false, '2026-03-27T10:15:00Z', '2026-03-27T10:15:00Z', 'b694424c-d844-4dd2-b059-f54bb951bd99')
  ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name, phone=EXCLUDED.phone, lead_count=EXCLUDED.lead_count, is_loyal=EXCLUDED.is_loyal, auto_approved=EXCLUDED.auto_approved, updated_at=EXCLUDED.updated_at
  RETURNING id
)
INSERT INTO leads_sessions (created_at, teams_id, leads_id, status, current_step, collected_data, needs_more_info, rating, rating_reason, updated_at)
SELECT '2026-03-27T10:15:00Z', 'b694424c-d844-4dd2-b059-f54bb951bd99', upsert_lead.id, 'active', 'qualification', '{"name": "Sarah Johnson", "phone": "+1 (555) 123-4567", "email": "sarah.johnson@email.com", "location": "Los Angeles, CA", "workType": "Kitchen Renovation", "budget": "25000-35000", "timeline": "3 months", "message": "Customer is looking to renovate their kitchen. They want modern cabinets, quartz countertops, and new appliances."}', false, 5, 'Excellent lead! High budget, in our service area, and work type matches our expertise perfectly.', '2026-03-27T10:15:00Z'
FROM upsert_lead;

-- Lead 002: Michael Chen - manual
WITH upsert_lead AS (
  INSERT INTO leads (name, phone, email, lead_count, is_loyal, auto_approved, created_at, updated_at, teams_id)
  VALUES ('Michael Chen', '+1 (555) 234-5678', 'm.chen@business.com', 1, false, false, '2026-03-27T09:45:00Z', '2026-03-27T09:45:00Z', 'b694424c-d844-4dd2-b059-f54bb951bd99')
  ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name, phone=EXCLUDED.phone, lead_count=EXCLUDED.lead_count, is_loyal=EXCLUDED.is_loyal, auto_approved=EXCLUDED.auto_approved, updated_at=EXCLUDED.updated_at
  RETURNING id
)
INSERT INTO leads_sessions (created_at, teams_id, leads_id, status, current_step, collected_data, needs_more_info, rating, rating_reason, updated_at)
SELECT '2026-03-27T09:45:00Z', 'b694424c-d844-4dd2-b059-f54bb951bd99', upsert_lead.id, 'active', 'qualification', '{"name": "Michael Chen", "phone": "+1 (555) 234-5678", "email": "m.chen@business.com", "location": "San Francisco, CA", "workType": "Commercial Office Build-out", "budget": "150000", "timeline": "6 weeks", "message": "Business owner needs office space build-out for a new tech startup."}', false, 4, 'Great commercial opportunity. Tight timeline might be challenging but doable.', '2026-03-27T09:45:00Z'
FROM upsert_lead;

-- Lead 003: Emma Wilson - pending
WITH upsert_lead AS (
  INSERT INTO leads (name, phone, email, lead_count, is_loyal, auto_approved, created_at, updated_at, teams_id)
  VALUES ('Emma Wilson', '+1 (555) 345-6789', 'emma.w@gmail.com', 1, false, false, '2026-03-27T08:00:00Z', '2026-03-27T09:30:00Z', 'b694424c-d844-4dd2-b059-f54bb951bd99')
  ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name, phone=EXCLUDED.phone, lead_count=EXCLUDED.lead_count, is_loyal=EXCLUDED.is_loyal, auto_approved=EXCLUDED.auto_approved, updated_at=EXCLUDED.updated_at
  RETURNING id
)
INSERT INTO leads_sessions (created_at, teams_id, leads_id, status, current_step, collected_data, needs_more_info, rating, rating_reason, updated_at)
SELECT '2026-03-27T08:00:00Z', 'b694424c-d844-4dd2-b059-f54bb951bd99', upsert_lead.id, 'active', 'qualification', '{"name": "Emma Wilson", "phone": "+1 (555) 345-6789", "email": "emma.w@gmail.com", "location": "Austin, TX", "workType": "Bathroom Remodel", "budget": "15000-20000", "timeline": "flexible", "message": "Homeowner wants to remodel master bathroom. Interested in walk-in shower, double vanity, and heated floors."}', false, 2, 'Not in our service area - Austin, TX is outside our coverage zone.', '2026-03-27T09:30:00Z'
FROM upsert_lead;

-- Lead 004: David Park - manual
WITH upsert_lead AS (
  INSERT INTO leads (name, phone, email, lead_count, is_loyal, auto_approved, created_at, updated_at, teams_id)
  VALUES ('David Park', '+1 (555) 456-7890', 'david.park@outlook.com', 1, true, false, '2026-03-27T07:00:00Z', '2026-03-27T07:00:00Z', 'b694424c-d844-4dd2-b059-f54bb951bd99')
  ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name, phone=EXCLUDED.phone, lead_count=EXCLUDED.lead_count, is_loyal=EXCLUDED.is_loyal, auto_approved=EXCLUDED.auto_approved, updated_at=EXCLUDED.updated_at
  RETURNING id
)
INSERT INTO leads_sessions (created_at, teams_id, leads_id, status, current_step, collected_data, needs_more_info, rating, rating_reason, updated_at)
SELECT '2026-03-27T07:00:00Z', 'b694424c-d844-4dd2-b059-f54bb951bd99', upsert_lead.id, 'active', 'qualification', '{"name": "David Park", "phone": "+1 (555) 456-7890", "email": "david.park@outlook.com", "location": "Seattle, WA", "workType": "Deck Construction", "budget": "15000", "timeline": "spring", "message": "Customer wants a new composite deck built in their backyard. Approximately 400 sq ft with built-in seating and lighting."}', false, 3, 'Moderate fit - we do decks but it is not our specialty. Customer is well-prepared.', '2026-03-27T07:00:00Z'
FROM upsert_lead;

-- Lead 005: Lisa Anderson - declined
WITH upsert_lead AS (
  INSERT INTO leads (name, phone, email, lead_count, is_loyal, auto_approved, created_at, updated_at, teams_id)
  VALUES ('Lisa Anderson', '+1 (555) 567-8901', 'lisa.a@company.org', 1, false, false, '2026-03-26T10:00:00Z', '2026-03-26T22:00:00Z', 'b694424c-d844-4dd2-b059-f54bb951bd99')
  ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name, phone=EXCLUDED.phone, lead_count=EXCLUDED.lead_count, is_loyal=EXCLUDED.is_loyal, auto_approved=EXCLUDED.auto_approved, updated_at=EXCLUDED.updated_at
  RETURNING id
)
INSERT INTO leads_sessions (created_at, teams_id, leads_id, status, current_step, collected_data, needs_more_info, rating, rating_reason, forwarded_at, updated_at)
SELECT '2026-03-26T10:00:00Z', 'b694424c-d844-4dd2-b059-f54bb951bd99', upsert_lead.id, 'active', 'finished', '{"name": "Lisa Anderson", "phone": "+1 (555) 567-8901", "email": "lisa.a@company.org", "location": "Denver, CO", "workType": "Home Addition", "budget": "80000-100000", "timeline": "6 months"}', false, 1, 'Outside service area and we do not do home additions currently.', '2026-03-26T22:00:00Z', '2026-03-26T22:00:00Z'
FROM upsert_lead;

-- Lead 006: James Rodriguez - approved
WITH upsert_lead AS (
  INSERT INTO leads (name, phone, email, lead_count, is_loyal, auto_approved, created_at, updated_at, teams_id)
  VALUES ('James Rodriguez', '+1 (555) 678-9012', 'j.rodriguez@techstart.io', 1, true, true, '2026-03-27T10:30:00Z', '2026-03-27T10:50:00Z', 'b694424c-d844-4dd2-b059-f54bb951bd99')
  ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name, phone=EXCLUDED.phone, lead_count=EXCLUDED.lead_count, is_loyal=EXCLUDED.is_loyal, auto_approved=EXCLUDED.auto_approved, updated_at=EXCLUDED.updated_at
  RETURNING id
)
INSERT INTO leads_sessions (created_at, teams_id, leads_id, status, current_step, collected_data, needs_more_info, rating, rating_reason, forwarded_at, updated_at)
SELECT '2026-03-27T10:30:00Z', 'b694424c-d844-4dd2-b059-f54bb951bd99', upsert_lead.id, 'active', 'finished', '{"name": "James Rodriguez", "phone": "+1 (555) 678-9012", "email": "j.rodriguez@techstart.io", "location": "Portland, OR", "workType": "Full Home Renovation", "budget": "200000+", "timeline": "12 months"}', false, 5, 'Premium client with substantial budget and clear vision. Perfect fit for our expertise.', '2026-03-27T10:50:00Z', '2026-03-27T10:50:00Z'
FROM upsert_lead;

-- Lead 007: Amanda Foster - approved
WITH upsert_lead AS (
  INSERT INTO leads (name, phone, email, lead_count, is_loyal, auto_approved, created_at, updated_at, teams_id)
  VALUES ('Amanda Foster', '+1 (555) 789-0123', 'amanda.f@designco.com', 1, false, true, '2026-03-27T05:00:00Z', '2026-03-27T08:00:00Z', 'b694424c-d844-4dd2-b059-f54bb951bd99')
  ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name, phone=EXCLUDED.phone, lead_count=EXCLUDED.lead_count, is_loyal=EXCLUDED.is_loyal, auto_approved=EXCLUDED.auto_approved, updated_at=EXCLUDED.updated_at
  RETURNING id
)
INSERT INTO leads_sessions (created_at, teams_id, leads_id, status, current_step, collected_data, needs_more_info, rating, rating_reason, forwarded_at, updated_at)
SELECT '2026-03-27T05:00:00Z', 'b694424c-d844-4dd2-b059-f54bb951bd99', upsert_lead.id, 'active', 'finished', '{"name": "Amanda Foster", "phone": "+1 (555) 789-0123", "email": "amanda.f@designco.com", "location": "Miami, FL", "workType": "Office Interior Design", "budget": "75000", "timeline": "3 months"}', false, 4, 'Strong project with good potential for ongoing work.', '2026-03-27T08:00:00Z', '2026-03-27T08:00:00Z'
FROM upsert_lead;

-- Lead 008: Robert Kim - approved
WITH upsert_lead AS (
  INSERT INTO leads (name, phone, email, lead_count, is_loyal, auto_approved, created_at, updated_at, teams_id)
  VALUES ('Robert Kim', '+1 (555) 890-1234', 'robert.kim@email.com', 1, true, true, '2026-03-26T16:00:00Z', '2026-03-26T18:00:00Z', 'b694424c-d844-4dd2-b059-f54bb951bd99')
  ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name, phone=EXCLUDED.phone, lead_count=EXCLUDED.lead_count, is_loyal=EXCLUDED.is_loyal, auto_approved=EXCLUDED.auto_approved, updated_at=EXCLUDED.updated_at
  RETURNING id
)
INSERT INTO leads_sessions (created_at, teams_id, leads_id, status, current_step, collected_data, needs_more_info, rating, rating_reason, forwarded_at, updated_at)
SELECT '2026-03-26T16:00:00Z', 'b694424c-d844-4dd2-b059-f54bb951bd99', upsert_lead.id, 'active', 'finished', '{"name": "Robert Kim", "phone": "+1 (555) 890-1234", "email": "robert.kim@email.com", "location": "San Diego, CA", "workType": "Bathroom Upgrade", "budget": "25000", "timeline": "2 months"}', false, 4, 'Clear project scope and reasonable expectations.', '2026-03-26T18:00:00Z', '2026-03-26T18:00:00Z'
FROM upsert_lead;

-- Lead 009: Michelle Torres - manual
WITH upsert_lead AS (
  INSERT INTO leads (name, phone, email, lead_count, is_loyal, auto_approved, created_at, updated_at, teams_id)
  VALUES ('Michelle Torres', '+1 (555) 234-5678', 'michelle.t@startup.co', 1, false, false, '2026-03-27T10:55:00Z', '2026-03-27T10:55:00Z', 'b694424c-d844-4dd2-b059-f54bb951bd99')
  ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name, phone=EXCLUDED.phone, lead_count=EXCLUDED.lead_count, is_loyal=EXCLUDED.is_loyal, auto_approved=EXCLUDED.auto_approved, updated_at=EXCLUDED.updated_at
  RETURNING id
)
INSERT INTO leads_sessions (created_at, teams_id, leads_id, status, current_step, collected_data, needs_more_info, rating, rating_reason, updated_at)
SELECT '2026-03-27T10:55:00Z', 'b694424c-d844-4dd2-b059-f54bb951bd99', upsert_lead.id, 'active', 'qualification', '{"name": "Michelle Torres", "phone": "+1 (555) 234-5678", "email": "michelle.t@startup.co", "location": "New York, NY", "workType": "Retail Store Build", "budget": "60000", "timeline": "8 weeks", "message": "Opening a new boutique fitness studio. Need 1,500 sq ft renovation with mirrored walls, rubber flooring, and reception area."}', false, 3, 'Good fit but tight timeline may be challenging.', '2026-03-27T10:55:00Z'
FROM upsert_lead;

-- Lead 010: Kevin O'Brien - pending
WITH upsert_lead AS (
  INSERT INTO leads (name, phone, email, lead_count, is_loyal, auto_approved, created_at, updated_at, teams_id)
  VALUES ('Kevin O''Brien', '+1 (555) 345-6789', 'kevin.obrien@lawfirm.com', 1, false, false, '2026-03-27T08:30:00Z', '2026-03-27T08:30:00Z', 'b694424c-d844-4dd2-b059-f54bb951bd99')
  ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name, phone=EXCLUDED.phone, lead_count=EXCLUDED.lead_count, is_loyal=EXCLUDED.is_loyal, auto_approved=EXCLUDED.auto_approved, updated_at=EXCLUDED.updated_at
  RETURNING id
)
INSERT INTO leads_sessions (created_at, teams_id, leads_id, status, current_step, collected_data, needs_more_info, rating, rating_reason, updated_at)
SELECT '2026-03-27T08:30:00Z', 'b694424c-d844-4dd2-b059-f54bb951bd99', upsert_lead.id, 'active', 'qualification', '{"name": "Kevin O''Brien", "phone": "+1 (555) 345-6789", "email": "kevin.obrien@lawfirm.com", "location": "Chicago, IL", "workType": "Law Office Renovation", "budget": "150000", "timeline": "4 months", "message": "Established law firm upgrading their conference rooms and private offices. Need modern AV systems, soundproofing, and ergonomic furniture."}', false, 4, 'Professional client with clear requirements and good budget.', '2026-03-27T08:30:00Z'
FROM upsert_lead;

-- Lead 011: Priya Sharma - pending
WITH upsert_lead AS (
  INSERT INTO leads (name, phone, email, lead_count, is_loyal, auto_approved, created_at, updated_at, teams_id)
  VALUES ('Priya Sharma', '+1 (555) 456-7890', 'priya.s@designstudio.net', 1, false, false, '2026-03-27T06:00:00Z', '2026-03-27T06:00:00Z', 'b694424c-d844-4dd2-b059-f54bb951bd99')
  ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name, phone=EXCLUDED.phone, lead_count=EXCLUDED.lead_count, is_loyal=EXCLUDED.is_loyal, auto_approved=EXCLUDED.auto_approved, updated_at=EXCLUDED.updated_at
  RETURNING id
)
INSERT INTO leads_sessions (created_at, teams_id, leads_id, status, current_step, collected_data, needs_more_info, rating, rating_reason, updated_at)
SELECT '2026-03-27T06:00:00Z', 'b694424c-d844-4dd2-b059-f54bb951bd99', upsert_lead.id, 'active', 'qualification', '{"name": "Priya Sharma", "phone": "+1 (555) 456-7890", "email": "priya.s@designstudio.net", "location": "Boston, MA", "workType": "Studio Apartment Remodel", "budget": "40000", "timeline": "3 months", "message": "Interior designer looking to gut renovate her own studio apartment. Needs creative storage solutions, Murphy bed, and home office corner."}', false, 3, 'Creative project but budget is on the lower end.', '2026-03-27T06:00:00Z'
FROM upsert_lead;

-- Lead 012: Thomas Wright - approved
WITH upsert_lead AS (
  INSERT INTO leads (name, phone, email, lead_count, is_loyal, auto_approved, created_at, updated_at, teams_id)
  VALUES ('Thomas Wright', '+1 (555) 567-8901', 't.wright@corp.com', 1, true, true, '2026-03-27T02:00:00Z', '2026-03-27T04:00:00Z', 'b694424c-d844-4dd2-b059-f54bb951bd99')
  ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name, phone=EXCLUDED.phone, lead_count=EXCLUDED.lead_count, is_loyal=EXCLUDED.is_loyal, auto_approved=EXCLUDED.auto_approved, updated_at=EXCLUDED.updated_at
  RETURNING id
)
INSERT INTO leads_sessions (created_at, teams_id, leads_id, status, current_step, collected_data, needs_more_info, rating, rating_reason, forwarded_at, updated_at)
SELECT '2026-03-27T02:00:00Z', 'b694424c-d844-4dd2-b059-f54bb951bd99', upsert_lead.id, 'active', 'finished', '{"name": "Thomas Wright", "phone": "+1 (555) 567-8901", "email": "t.wright@corp.com", "location": "Dallas, TX", "workType": "Corporate HQ Refresh", "budget": "300000", "timeline": "12 months"}', false, 5, 'Major corporate project with substantial budget and long-term potential.', '2026-03-27T04:00:00Z', '2026-03-27T04:00:00Z'
FROM upsert_lead;

-- Lead 013: Rachel Green - manual
WITH upsert_lead AS (
  INSERT INTO leads (name, phone, email, lead_count, is_loyal, auto_approved, created_at, updated_at, teams_id)
  VALUES ('Rachel Green', '+1 (555) 678-9012', 'rachel.g@boutique.com', 1, false, false, '2026-03-27T09:35:00Z', '2026-03-27T09:35:00Z', 'b694424c-d844-4dd2-b059-f54bb951bd99')
  ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name, phone=EXCLUDED.phone, lead_count=EXCLUDED.lead_count, is_loyal=EXCLUDED.is_loyal, auto_approved=EXCLUDED.auto_approved, updated_at=EXCLUDED.updated_at
  RETURNING id
)
INSERT INTO leads_sessions (created_at, teams_id, leads_id, status, current_step, collected_data, needs_more_info, rating, rating_reason, updated_at)
SELECT '2026-03-27T09:35:00Z', 'b694424c-d844-4dd2-b059-f54bb951bd99', upsert_lead.id, 'active', 'qualification', '{"name": "Rachel Green", "phone": "+1 (555) 678-9012", "email": "rachel.g@boutique.com", "location": "Nashville, TN", "workType": "Boutique Store Design", "budget": "50000-75000", "timeline": "4 months", "message": "Entrepreneur opening a boutique clothing store. Needs vintage-modern aesthetic, custom fixtures, and eye-catching window displays."}', false, 4, 'Creative project with good budget. Customer has clear vision.', '2026-03-27T09:35:00Z'
FROM upsert_lead;

-- Lead 014: Marcus Johnson - manual
WITH upsert_lead AS (
  INSERT INTO leads (name, phone, email, lead_count, is_loyal, auto_approved, created_at, updated_at, teams_id)
  VALUES ('Marcus Johnson', '+1 (555) 789-0123', 'marcus.j@restaurant.com', 1, false, false, '2026-03-27T09:25:00Z', '2026-03-27T09:25:00Z', 'b694424c-d844-4dd2-b059-f54bb951bd99')
  ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name, phone=EXCLUDED.phone, lead_count=EXCLUDED.lead_count, is_loyal=EXCLUDED.is_loyal, auto_approved=EXCLUDED.auto_approved, updated_at=EXCLUDED.updated_at
  RETURNING id
)
INSERT INTO leads_sessions (created_at, teams_id, leads_id, status, current_step, collected_data, needs_more_info, rating, rating_reason, updated_at)
SELECT '2026-03-27T09:25:00Z', 'b694424c-d844-4dd2-b059-f54bb951bd99', upsert_lead.id, 'active', 'qualification', '{"name": "Marcus Johnson", "phone": "+1 (555) 789-0123", "email": "marcus.j@restaurant.com", "location": "Phoenix, AZ", "workType": "Restaurant Interior", "budget": "120000", "timeline": "3 months", "message": "Chef opening a farm-to-table restaurant. Needs warm rustic design, open kitchen concept, and custom bar area."}', false, 2, 'Large project but restaurant work is not our primary focus.', '2026-03-27T09:25:00Z'
FROM upsert_lead;

-- Lead 015: Sophia Martinez - manual
WITH upsert_lead AS (
  INSERT INTO leads (name, phone, email, lead_count, is_loyal, auto_approved, created_at, updated_at, teams_id)
  VALUES ('Sophia Martinez', '+1 (555) 890-1234', 'sophia.m@wellness.io', 1, true, false, '2026-03-27T09:10:00Z', '2026-03-27T09:10:00Z', 'b694424c-d844-4dd2-b059-f54bb951bd99')
  ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name, phone=EXCLUDED.phone, lead_count=EXCLUDED.lead_count, is_loyal=EXCLUDED.is_loyal, auto_approved=EXCLUDED.auto_approved, updated_at=EXCLUDED.updated_at
  RETURNING id
)
INSERT INTO leads_sessions (created_at, teams_id, leads_id, status, current_step, collected_data, needs_more_info, rating, rating_reason, updated_at)
SELECT '2026-03-27T09:10:00Z', 'b694424c-d844-4dd2-b059-f54bb951bd99', upsert_lead.id, 'active', 'qualification', '{"name": "Sophia Martinez", "phone": "+1 (555) 890-1234", "email": "sophia.m@wellness.io", "location": "San Diego, CA", "workType": "Spa Renovation", "budget": "80000-100000", "timeline": "4 months", "message": "Wellness center upgrading to a luxury spa. Needs serene atmosphere, treatment rooms, and meditation space."}', false, 3, 'Good budget but requires specialized spa experience we do not have in-house.', '2026-03-27T09:10:00Z'
FROM upsert_lead;

-- Lead 016: Daniel Lee - manual
WITH upsert_lead AS (
  INSERT INTO leads (name, phone, email, lead_count, is_loyal, auto_approved, created_at, updated_at, teams_id)
  VALUES ('Daniel Lee', '+1 (555) 901-2345', 'daniel.lee@startup.com', 1, false, false, '2026-03-27T09:00:00Z', '2026-03-27T09:00:00Z', 'b694424c-d844-4dd2-b059-f54bb951bd99')
  ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name, phone=EXCLUDED.phone, lead_count=EXCLUDED.lead_count, is_loyal=EXCLUDED.is_loyal, auto_approved=EXCLUDED.auto_approved, updated_at=EXCLUDED.updated_at
  RETURNING id
)
INSERT INTO leads_sessions (created_at, teams_id, leads_id, status, current_step, collected_data, needs_more_info, rating, rating_reason, updated_at)
SELECT '2026-03-27T09:00:00Z', 'b694424c-d844-4dd2-b059-f54bb951bd99', upsert_lead.id, 'active', 'qualification', '{"name": "Daniel Lee", "phone": "+1 (555) 901-2345", "email": "daniel.lee@startup.com", "location": "Austin, TX", "workType": "Co-working Space", "budget": "100000", "timeline": "3 months", "message": "Building a modern co-working space for freelancers. Needs flexible workstations, phone booths, and communal lounge."}', false, 4, 'Moderate fit - commercial work but timeline is tight.', '2026-03-27T09:00:00Z'
FROM upsert_lead;