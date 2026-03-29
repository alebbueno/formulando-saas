"use server"

import { createClient } from "@/lib/supabase/server";
import { resend } from "@/lib/resend";
import { revalidatePath } from "next/cache";

export async function addDomain(workspaceId: string, domainName: string) {
    try {
        const supabase = await createClient();
        
        // 1. Check if user is owner of the workspace
        const { data: workspace, error: workspaceError } = await supabase
            .from("workspaces")
            .select("owner_id")
            .eq("id", workspaceId)
            .single();

        if (workspaceError || !workspace) {
            throw new Error("Workspace não encontrado.");
        }

        // 2. Create domain in Resend
        const { data: resendDomain, error: resendError } = await resend.domains.create({
            name: domainName,
        });

        if (resendError) {
            console.error("Resend Error:", resendError);
            throw new Error(`Erro no Resend: ${resendError.message}`);
        }

        if (!resendDomain) {
            throw new Error("Falha ao criar domínio no Resend.");
        }

        // 3. Save to database
        const { data, error: dbError } = await supabase
            .from("domains")
            .insert({
                workspace_id: workspaceId,
                domain: domainName,
                resend_domain_id: resendDomain.id,
                dns_records: resendDomain.records,
                status: "pending",
            })
            .select()
            .single();

        if (dbError) {
            console.error("Database Error:", dbError);
            // Consider cleaning up Resend if DB fails
            throw new Error("Erro ao salvar domínio no banco de dados.");
        }

        revalidatePath("/dashboard/settings/domains");
        return { success: true, data };
    } catch (error) {
        console.error("addDomain Error:", error);
        return { 
            success: false, 
            error: error instanceof Error ? error.message : "Erro desconhecido ao adicionar domínio." 
        };
    }
}

export async function verifyDomain(domainId: string) {
    try {
        const supabase = await createClient();

        // 1. Get domain info from our database
        const { data: domain, error: domainError } = await supabase
            .from("domains")
            .select("*")
            .eq("id", domainId)
            .single();

        if (domainError || !domain) {
            throw new Error("Domínio não encontrado no banco de dados.");
        }

        if (!domain.resend_domain_id) {
            throw new Error("ID do Resend não encontrado para este domínio.");
        }

        console.log(`[verifyDomain] Checking status for ${domain.domain} (${domain.resend_domain_id})`);

        // 2. Trigger verification in Resend (optional but recommended to refresh)
        try {
            await resend.domains.verify(domain.resend_domain_id);
        } catch (vErr) {
            console.warn(`[verifyDomain] Resend Verify Trigger Warning for ${domain.domain}:`, vErr);
        }

        // 3. Get updated status from Resend for the specific ID
        const response = await resend.domains.get(domain.resend_domain_id);
        
        console.log(`[verifyDomain] Resend response for ${domain.domain}:`, JSON.stringify(response.data?.status));

        let resendDomain = response.data;
        let getError = response.error;
        let currentStatus = (resendDomain?.status || "pending").toLowerCase();
        let isVerified = currentStatus === "verified";
        let finalResendId = domain.resend_domain_id;
        let finalRecords = resendDomain?.records || domain.dns_records;

        // --- INTELLIGENT FALLBACK ---
        // If the specific ID is not verified, search all domains in the Resend account
        // to see if this domain name exists under a different ID and IS verified.
        if (!isVerified) {
            console.log(`[verifyDomain] ID ${domain.resend_domain_id} is still pending. Searching across account...`);
            const allDomainsResponse = await resend.domains.list();
            
            // The SDK might return the array directly in .data or inside .data.data depending on version/structure
            const domainsListData = allDomainsResponse.data;
            let domainsArray: any[] = [];
            
            if (Array.isArray(domainsListData)) {
                domainsArray = domainsListData;
            } else if (domainsListData && typeof domainsListData === 'object' && 'data' in domainsListData && Array.isArray((domainsListData as any).data)) {
                domainsArray = (domainsListData as any).data;
            }

            if (domainsArray.length > 0) {
                const matchedVerifiedDomain = domainsArray.find((d: any) => 
                    d.name.toLowerCase() === domain.domain.toLowerCase() && 
                    (d.status || "").toLowerCase() === "verified"
                );

                if (matchedVerifiedDomain) {
                    console.log(`[verifyDomain] Found a VERIFIED entry for ${domain.domain} with NEW ID: ${matchedVerifiedDomain.id}`);
                    
                    // Fetch full details for the new verified ID
                    const verifiedDetails = await resend.domains.get(matchedVerifiedDomain.id);
                    if (verifiedDetails.data) {
                        currentStatus = "verified";
                        isVerified = true;
                        finalResendId = matchedVerifiedDomain.id;
                        finalRecords = (verifiedDetails.data as any).records || [];
                        resendDomain = verifiedDetails.data as any;
                    }
                }
            }
        }

        if (getError && !isVerified) {
            console.error(`[verifyDomain] Failed to get domain from Resend:`, getError);
            throw new Error("Não foi possível buscar o status no Resend e nenhum fallback verificado foi encontrado.");
        }

        console.log(`[verifyDomain] Final Resolved Status for ${domain.domain}:`, currentStatus);

        // 4. Update database with resolved status and potentially the new ID
        const { data: updatedDomain, error: updateError } = await supabase
            .from("domains")
            .update({
                status: currentStatus,
                resend_domain_id: finalResendId, // Sync the ID in case it changed
                dns_records: finalRecords,
                verified_at: isVerified ? new Date().toISOString() : domain.verified_at,
                updated_at: new Date().toISOString()
            })
            .eq("id", domainId)
            .select()
            .single();

        if (updateError) {
            console.error(`[verifyDomain] DB Update Error for ${domain.domain}:`, updateError);
            throw new Error("Erro ao atualizar status no banco de dados.");
        }

        // Revalidate multiple paths
        revalidatePath("/dashboard/settings/domains");
        revalidatePath("/dashboard/integrations");
        revalidatePath("/(dashboard)", "layout");
        
        return { 
            success: true, 
            verified: isVerified,
            status: currentStatus,
            data: updatedDomain 
        };
    } catch (error) {
        console.error("verifyDomain Error:", error);
        return { 
            success: false, 
            error: error instanceof Error ? error.message : "Erro ao verificar domínio." 
        };
    }
}

export async function deleteDomain(domainId: string) {
    try {
        const supabase = await createClient();

        // 1. Get domain info
        const { data: domain, error: domainError } = await supabase
            .from("domains")
            .select("resend_domain_id")
            .eq("id", domainId)
            .single();

        if (domainError || !domain) {
            throw new Error("Domínio não encontrado.");
        }

        // 2. Delete from Resend if id exists
        if (domain.resend_domain_id) {
            const { error: resendError } = await resend.domains.remove(domain.resend_domain_id);
            if (resendError) {
                console.warn("Could not delete from Resend:", resendError);
                // We proceed to delete from DB anyway, or handle accordingly
            }
        }

        // 3. Delete from database
        const { error: dbError } = await supabase
            .from("domains")
            .delete()
            .eq("id", domainId);

        if (dbError) {
            throw new Error("Erro ao excluir domínio do banco.");
        }

        revalidatePath("/dashboard/settings/domains");
        return { success: true };
    } catch (error) {
        console.error("deleteDomain Error:", error);
        return { 
            success: false, 
            error: error instanceof Error ? error.message : "Erro ao excluir domínio." 
        };
    }
}

export async function getDomains(workspaceId: string) {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from("domains")
            .select("*")
            .eq("workspace_id", workspaceId)
            .order("created_at", { ascending: false });

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error("getDomains Error:", error);
        return { success: false, error: "Erro ao buscar domínios." };
    }
}

export async function setDefaultDomain(domainId: string, workspaceId: string) {
    try {
        const supabase = await createClient();

        // 1. Remove default from all other domains in this workspace
        await supabase
            .from("domains")
            .update({ is_default: false })
            .eq("workspace_id", workspaceId);

        // 2. Set this one as default
        const { data, error } = await supabase
            .from("domains")
            .update({ is_default: true })
            .eq("id", domainId)
            .select()
            .single();

        if (error) throw error;

        revalidatePath("/dashboard/settings/domains");
        return { success: true, data };
    } catch (error) {
        console.error("setDefaultDomain Error:", error);
        return { success: false, error: "Erro ao definir domínio padrão." };
    }
}
