'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

export async function login(prevState: any, formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        console.error('Login error:', error)
        return { error: error.message }
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard/account')
}

export async function signup(prevState: any, formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('fullName') as string

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
            },
        },
    })

    if (error) {
        return { error: error.message }
    }

    return { success: true }
}

export async function forgotPassword(prevState: any, formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const headersList = await import("next/headers");
    const headers = await headersList.headers();
    const origin = headers.get('origin');

    // Default to a safe origin if not found, though origin should exist in server actions usually called from browser
    // Or use process.env.NEXT_PUBLIC_SITE_URL
    const callbackUrl = origin ? `${origin}/auth/callback?next=/update-password` : '/auth/callback?next=/update-password'

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: callbackUrl,
    })

    if (error) {
        return { error: error.message }
    }

    return { success: "Verifique seu email para redefinir a senha." }
}

export async function updatePassword(prevState: any, formData: FormData) {
    const supabase = await createClient()

    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (!password || !confirmPassword) {
        return { error: 'Preencha todos os campos' }
    }

    if (password !== confirmPassword) {
        return { error: 'As senhas não coincidem' }
    }

    const { error } = await supabase.auth.updateUser({
        password: password,
    })

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
}
