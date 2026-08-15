import { request } from './base'

export const SessionKey = ['session']

// ─── Types ──────────────────────────────────────────────────────────────────

export type SignInResult = { data: Session } | { data: { requiresMfa: true; mfaToken: string } }

export interface MfaSetupResponse {
    secret: string
    uri: string
}

export interface MfaEnableResponse {
    backupCodes: string[]
}

export interface MfaStatusResponse {
    enabled: boolean
}

export interface Session {
    user: {
        id: string
        name: string
        email: string
        emailVerified: boolean
        panel: string
        image: string | null
        phone: string | null
        banned: boolean
        isDefault: boolean
        isManager: boolean
        role: string | null
        permissions: Array<{
            module: string
            permissions: string[]
        }> | null
    }
    session: {
        id: string
        expiresAt: string
    }
}

// ─── Request payloads ──────────────────────────────────────────────────────

export interface SignInPayload {
    email: string
    panel: 'owner'
    password: string
}
export interface ForgotPasswordPayload {
    email: string
    panel: 'owner'
}
export interface VerifyResetOtpPayload {
    email: string
    panel: 'owner'
    otp: string
}
export interface ResetPasswordPayload {
    token: string
    password: string
}
export interface VerifyEmailPayload {
    email: string
    panel: 'owner'
    otp: string
}
export interface ResendVerificationPayload {
    email: string
    panel: 'owner'
}
export interface UpdateMePayload {
    name?: string
    image?: string
    phone?: string
}
export interface MfaVerifyPayload {
    mfaToken: string
    code: string
}

export interface MfaEnablePayload {
    code: string
}

export interface MfaDisablePayload {
    password: string
    code: string
}

export interface ChangePasswordPayload {
    currentPassword: string
    newPassword: string
    revokeOtherSessions?: boolean
}

// ─── API methods ───────────────────────────────────────────────────────────

export const authApi = {
    signIn: (payload: SignInPayload) =>
        request<SignInResult>('/auth/sign-in', {
            method: 'POST',
            body: JSON.stringify(payload),
        }),

    mfaVerify: (payload: MfaVerifyPayload) =>
        request<{ data: Session }>('/auth/mfa/verify', {
            method: 'POST',
            body: JSON.stringify(payload),
        }).then((r) => r.data),

    mfaSetup: () =>
        request<{ data: MfaSetupResponse }>('/auth/mfa/setup', {
            method: 'POST',
        }).then((r) => r.data),

    mfaEnable: (payload: MfaEnablePayload) =>
        request<{ data: MfaEnableResponse }>('/auth/mfa/enable', {
            method: 'POST',
            body: JSON.stringify(payload),
        }).then((r) => r.data),

    mfaDisable: (payload: MfaDisablePayload) =>
        request<{ message: string }>('/auth/mfa/disable', {
            method: 'POST',
            body: JSON.stringify(payload),
        }),

    mfaStatus: () => request<{ data: MfaStatusResponse }>('/auth/mfa/status').then((r) => r.data),

    signOut: () => request<void>('/auth/sign-out', { method: 'POST' }),

    getSession: () => request<{ data: Session }>('/auth/session').then((r) => r.data),

    forgotPassword: (payload: ForgotPasswordPayload) =>
        request<{ message: string }>('/auth/forgot-password', {
            method: 'POST',
            body: JSON.stringify(payload),
        }),

    verifyResetOtp: (payload: VerifyResetOtpPayload) =>
        request<{ message: string; data: { token: string; expiresAt: string } }>('/auth/verify-reset-otp', {
            method: 'POST',
            body: JSON.stringify(payload),
        }),

    resetPassword: (payload: ResetPasswordPayload) =>
        request<{ message: string }>('/auth/reset-password', {
            method: 'POST',
            body: JSON.stringify(payload),
        }),

    verifyEmail: (payload: VerifyEmailPayload) =>
        request<{ data: Session }>('/auth/verify-email', {
            method: 'POST',
            body: JSON.stringify(payload),
        }).then((r) => r.data),

    resendVerification: (payload: ResendVerificationPayload) =>
        request<{ message: string }>('/auth/resend-verification', {
            method: 'POST',
            body: JSON.stringify(payload),
        }),

    updateUser: (payload: UpdateMePayload) =>
        request<{ data: Session }>('/auth/update-user', {
            method: 'PATCH',
            body: JSON.stringify(payload),
        }).then((r) => r.data),

    changePassword: (payload: ChangePasswordPayload) =>
        request<{ message: string }>('/auth/change-password', {
            method: 'POST',
            body: JSON.stringify(payload),
        }),
}
