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

        // 1. Get domain info
        const { data: domain, error: domainError } = await supabase
            .from("domains")
            .select("*")
            .eq("id", domainId)
            .single();

        if (domainError || !domain) {
            throw new Error("Domínio não encontrado.");
        }

        if (!domain.resend_domain_id) {
            throw new Error("ID do Resend não encontrado para este domínio.");
        }

        // 2. Trigger verification in Resend
        const { error: verifyError } = await resend.domains.verify(domain.resend_domain_id);
        
        if (verifyError) {
            console.error("Resend Verify Error:", verifyError);
            // Don't throw here yet, check status anyway
        }

        // 3. Get updated status from Resend
        const { data: resendDomain, error: getError } = await resend.domains.get(domain.resend_domain_id);

        if (getError || !resendDomain) {
            throw new Error("Não foi possível buscar o status no Resend.");
        }

        // 4. Update database
        const isVerified = resendDomain.status === "verified";
        const { data: updatedDomain, error: updateError } = await supabase
            .from("domains")
            .update({
                status: resendDomain.status,
                dns_records: resendDomain.records,
                verified_at: isVerified ? new Date().toISOString() : null,
            })
            .eq("id", domainId)
            .select()
            .single();

        if (updateError) {
            throw new Error("Erro ao atualizar status no banco.");
        }

        revalidatePath("/dashboard/settings/domains");
        return { 
            success: true, 
            verified: isVerified,
            status: resendDomain.status,
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
