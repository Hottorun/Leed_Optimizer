module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/lib/mock-data.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "mockLeads",
    ()=>mockLeads
]);
const mockLeads = [
    {
        id: "lead-001",
        name: "Sarah Johnson",
        phone: "+1 (555) 123-4567",
        email: "sarah.johnson@email.com",
        location: "Los Angeles, CA",
        workType: "Kitchen Renovation",
        conversationSummary: "Customer is looking to renovate their kitchen. They want modern cabinets, quartz countertops, and new appliances. Budget is around $25,000-$35,000. Timeline is flexible but preferably within 3 months.",
        approveMessage: "Hi Sarah! Thank you for reaching out. We'd love to help with your kitchen renovation. Our team specializes in modern kitchen designs and we can definitely work within your budget. Would you be available for a free consultation this week?",
        declineMessage: "Hi Sarah, thank you for your interest. Unfortunately, we're currently at full capacity for new kitchen projects. We recommend reaching out to [Alternative Company] who does excellent work in your area.",
        rating: 5,
        ratingReason: "Excellent lead! High budget, in our service area, and work type matches our expertise perfectly.",
        status: "pending",
        createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString()
    },
    {
        id: "lead-002",
        name: "Michael Chen",
        phone: "+1 (555) 234-5678",
        email: "m.chen@business.com",
        location: "San Francisco, CA",
        workType: "Commercial Office Build-out",
        conversationSummary: "Business owner needs office space build-out for a new tech startup. Looking for an open floor plan with 4 private offices, a conference room, and a break room. Space is approximately 3,500 sq ft. Needs completion within 6 weeks.",
        approveMessage: "Hello Michael! We're excited about your office build-out project. Our commercial team has extensive experience with tech startup spaces. We can definitely meet your 6-week timeline. Can we schedule a site visit this week to discuss details?",
        declineMessage: "Hello Michael, we appreciate you considering us for your office project. Unfortunately, our commercial team is fully booked for the next 2 months and won't be able to meet your timeline. We suggest contacting [Commercial Builders Inc] for faster availability.",
        rating: 4,
        ratingReason: "Great commercial opportunity. Tight timeline might be challenging but doable.",
        status: "pending",
        createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString()
    },
    {
        id: "lead-003",
        name: "Emma Wilson",
        phone: "+1 (555) 345-6789",
        email: "emma.w@gmail.com",
        location: "Austin, TX",
        workType: "Bathroom Remodel",
        conversationSummary: "Homeowner wants to remodel master bathroom. Interested in walk-in shower, double vanity, and heated floors. Has seen our previous work on Instagram and loves the modern aesthetic. Budget is $15,000-$20,000.",
        approveMessage: "Hi Emma! Thank you for reaching out and for the kind words about our Instagram portfolio! We'd be thrilled to help with your bathroom remodel. A walk-in shower with heated floors is one of our specialties. Let's set up a time to discuss your vision!",
        declineMessage: "Hi Emma, thank you for your interest in our services. Unfortunately, we don't currently serve the Austin, TX area. We recommend checking out [Local Austin Renovations] who has a similar design aesthetic.",
        rating: 2,
        ratingReason: "Not in our service area - Austin, TX is outside our coverage zone.",
        status: "pending",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString()
    },
    {
        id: "lead-004",
        name: "David Park",
        phone: "+1 (555) 456-7890",
        email: "david.park@outlook.com",
        location: "Seattle, WA",
        workType: "Deck Construction",
        conversationSummary: "Customer wants a new composite deck built in their backyard. Approximately 400 sq ft with built-in seating and lighting. Has HOA approval already. Looking to start in spring.",
        approveMessage: "Hi David! A composite deck with built-in seating sounds fantastic! We love that you've already gotten HOA approval - that makes things much smoother. Spring is a great time to start. Would you like to schedule a free estimate?",
        declineMessage: "Hi David, thank you for considering us for your deck project. Unfortunately, we're not taking on new deck construction projects at this time as we're focusing on interior renovations. We recommend [Outdoor Living Experts] for deck work.",
        rating: 3,
        ratingReason: "Moderate fit - we do decks but it's not our specialty. Customer is well-prepared.",
        status: "pending",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString()
    },
    {
        id: "lead-005",
        name: "Lisa Anderson",
        phone: "+1 (555) 567-8901",
        email: "lisa.a@company.org",
        location: "Denver, CO",
        workType: "Home Addition",
        conversationSummary: "Family needs a 600 sq ft home addition for a new nursery and home office. Want it to match existing home exterior. Have architectural plans already drawn up. Budget is $80,000-$100,000.",
        approveMessage: "Hello Lisa! Congratulations on the growing family! A home addition for a nursery and office is a wonderful project. Having architectural plans ready is a great start. We'd love to review them and provide a detailed estimate. When works best for you?",
        declineMessage: "Hello Lisa, thank you for reaching out about your home addition. Unfortunately, our schedule doesn't allow us to take on additions of this scope at the moment. We recommend contacting [Premier Home Additions] who specializes in this type of work.",
        rating: 1,
        ratingReason: "Outside service area and we don't do home additions currently.",
        status: "declined",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString()
    }
];
}),
"[project]/lib/supabase.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "addLead",
    ()=>addLead,
    "deleteLead",
    ()=>deleteLead,
    "getLeadById",
    ()=>getLeadById,
    "getLeads",
    ()=>getLeads,
    "updateLead",
    ()=>updateLead
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/index.mjs [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/mock-data.ts [app-route] (ecmascript)");
;
;
const supabaseUrl = ("TURBOPACK compile-time value", "https://icftxtidxqmvuqyjmrec.supabase.co");
const supabaseAnonKey = ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljZnR4dGlkeHFtdnVxeWptcmVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzOTE0NzQsImV4cCI6MjA4OTk2NzQ3NH0.HnGIJ3woiYWqwkojE4vll5N8vygxm633na8wvQmx39c");
// Check if Supabase is configured
const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);
// Create client only if configured
let supabase = null;
if ("TURBOPACK compile-time truthy", 1) {
    supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(supabaseUrl, supabaseAnonKey);
}
// In-memory store for mock mode
let inMemoryLeads = [
    ...__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["mockLeads"]
];
async function getLeads() {
    if (!supabase) {
        // Return mock data sorted by createdAt
        return inMemoryLeads.sort((a, b)=>new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    const { data, error } = await supabase.from("leads").select("*").order("created_at", {
        ascending: false
    });
    if (error) {
        console.error("Error fetching leads:", error);
        return [];
    }
    return data.map(mapDbLeadToLead);
}
async function getLeadById(id) {
    if (!supabase) {
        return inMemoryLeads.find((lead)=>lead.id === id) || null;
    }
    const { data, error } = await supabase.from("leads").select("*").eq("id", id).single();
    if (error) {
        console.error("Error fetching lead:", error);
        return null;
    }
    return mapDbLeadToLead(data);
}
async function addLead(lead) {
    if (!supabase) {
        const newLead = {
            id: `lead-${Date.now()}`,
            ...lead,
            status: "pending",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        inMemoryLeads.unshift(newLead);
        return newLead;
    }
    const { data, error } = await supabase.from("leads").insert({
        name: lead.name,
        phone: lead.phone,
        email: lead.email,
        location: lead.location,
        work_type: lead.workType,
        conversation_summary: lead.conversationSummary,
        approve_message: lead.approveMessage,
        decline_message: lead.declineMessage,
        rating: lead.rating,
        rating_reason: lead.ratingReason,
        status: "pending"
    }).select().single();
    if (error) {
        console.error("Error adding lead:", error);
        return null;
    }
    return mapDbLeadToLead(data);
}
async function updateLead(id, updates) {
    if (!supabase) {
        const index = inMemoryLeads.findIndex((lead)=>lead.id === id);
        if (index === -1) return null;
        inMemoryLeads[index] = {
            ...inMemoryLeads[index],
            ...updates,
            updatedAt: new Date().toISOString()
        };
        return inMemoryLeads[index];
    }
    const dbUpdates = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
    if (updates.email !== undefined) dbUpdates.email = updates.email;
    if (updates.location !== undefined) dbUpdates.location = updates.location;
    if (updates.workType !== undefined) dbUpdates.work_type = updates.workType;
    if (updates.conversationSummary !== undefined) dbUpdates.conversation_summary = updates.conversationSummary;
    if (updates.approveMessage !== undefined) dbUpdates.approve_message = updates.approveMessage;
    if (updates.declineMessage !== undefined) dbUpdates.decline_message = updates.declineMessage;
    if (updates.rating !== undefined) dbUpdates.rating = updates.rating;
    if (updates.ratingReason !== undefined) dbUpdates.rating_reason = updates.ratingReason;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    const { data, error } = await supabase.from("leads").update(dbUpdates).eq("id", id).select().single();
    if (error) {
        console.error("Error updating lead:", error);
        return null;
    }
    return mapDbLeadToLead(data);
}
async function deleteLead(id) {
    if (!supabase) {
        const index = inMemoryLeads.findIndex((lead)=>lead.id === id);
        if (index === -1) return false;
        inMemoryLeads.splice(index, 1);
        return true;
    }
    const { error } = await supabase.from("leads").delete().eq("id", id);
    if (error) {
        console.error("Error deleting lead:", error);
        return false;
    }
    return true;
}
// Map database row to Lead type
function mapDbLeadToLead(row) {
    return {
        id: row.id,
        name: row.name,
        phone: row.phone,
        email: row.email,
        location: row.location,
        workType: row.work_type,
        conversationSummary: row.conversation_summary,
        approveMessage: row.approve_message,
        declineMessage: row.decline_message,
        rating: row.rating,
        ratingReason: row.rating_reason,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at
    };
}
}),
"[project]/app/api/leads/[id]/send/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase.ts [app-route] (ecmascript)");
;
;
async function POST(request, { params }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { action, message } = body;
        if (!action || !message) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Action and message are required"
            }, {
                status: 400
            });
        }
        const lead = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getLeadById"])(id);
        if (!lead) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Lead not found"
            }, {
                status: 404
            });
        }
        // Prepare the response to send to the chatbot
        const chatbotPayload = {
            leadId: lead.id,
            action,
            message,
            phone: lead.phone
        };
        // Send POST request to n8n webhook
        const webhookUrl = process.env.CHATBOT_WEBHOOK_URL;
        if (!webhookUrl) {
            console.error("CHATBOT_WEBHOOK_URL environment variable is not set");
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Webhook URL not configured"
            }, {
                status: 500
            });
        }
        try {
            const webhookResponse = await fetch(webhookUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(chatbotPayload)
            });
            if (!webhookResponse.ok) {
                console.error("Webhook failed:", webhookResponse.status, await webhookResponse.text());
            }
        } catch (webhookError) {
            console.error("Failed to send to webhook:", webhookError);
        // Continue even if webhook fails - we still want to update the lead status
        }
        // Update lead status
        const newStatus = action === "approve" ? "approved" : "declined";
        const updatedLead = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["updateLead"])(id, {
            status: newStatus,
            ...action === "approve" ? {
                approveMessage: message
            } : {
                declineMessage: message
            }
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            lead: updatedLead,
            webhookSent: true
        });
    } catch  {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Invalid request body"
        }, {
            status: 400
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0w2mjhf._.js.map