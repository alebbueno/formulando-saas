
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Manually parse .env.local
const envPath = path.resolve(process.cwd(), ".env.local");
const envContent = fs.readFileSync(envPath, "utf8");
const env: any = {};
envContent.split("\n").forEach(line => {
    const [key, value] = line.split("=");
    if (key && value) {
        env[key.trim()] = value.trim();
    }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugLeads() {
    console.log("Connecting to:", supabaseUrl);

    // 1. Fetch all leads
    const { data: leads, error } = await supabase
        .from("leads")
        .select("id, name, created_at, workspace_id");

    if (error) {
        console.error("Error fetching leads:", error);
        return;
    }

    console.log(`Total Leads Found: ${leads.length}`);

    // 2. Fetch Workspaces
    const { data: workspaces } = await supabase.from("workspaces").select("id, name");
    const wsMap = new Map((workspaces || []).map((w: any) => [w.id, w.name]));

    // 3. Analyze
    const now = new Date();
    const startOfMonth = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1)).toISOString();

    console.log(`\nStart of Month (UTC): ${startOfMonth}`);

    leads.forEach((l: any) => {
        const wsName = wsMap.get(l.workspace_id) || "UNKNOWN";
        const isThisMonth = l.created_at >= startOfMonth;
        console.log(`[${l.id}] ${l.name} | WS: ${wsName} (${l.workspace_id}) | Created: ${l.created_at} | ThisMonth? ${isThisMonth}`);
    });
}

debugLeads();
