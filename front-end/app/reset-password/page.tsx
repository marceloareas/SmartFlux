"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import '../page.css';

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!token) {
            setError('Link inválido. Verifique se você usou o link correto do e-mail.');
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (newPassword.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword }),
            });

            const text = await res.text();

            if (!res.ok) {
                throw new Error(text || 'Erro ao redefinir a senha.');
            }

            setSuccess(true);
        } catch (err: any) {
            setError(err.message || 'Falha na conexão com o servidor.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="bg">
                <div className="bg-grid"></div>
                <div className="bg-glow bg-glow-1"></div>
                <div className="bg-glow bg-glow-2"></div>
            </div>
            <div className="shell">
                <div className="phone auth-card">
                    <div className="screen" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 24px' }}>

                            {/* Icon + Title */}
                            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                                <div style={{
                                    width: '64px', height: '64px', background: 'var(--accent-glow)',
                                    borderRadius: '50%', display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', margin: '0 auto 16px', border: '1px solid var(--accent)'
                                }}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '32px', height: '32px' }}>
                                        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                                    </svg>
                                </div>
                                <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text)', marginBottom: '8px' }}>Nova senha</h1>
                                <p style={{ color: 'var(--text-2)', fontSize: '14px' }}>
                                    Digite sua nova senha abaixo.
                                </p>
                            </div>

                            {success ? (
                                <div style={{
                                    padding: '20px', background: 'rgba(94,196,167,0.1)',
                                    border: '1px solid var(--accent)', borderRadius: 'var(--radius)',
                                    textAlign: 'center'
                                }}>
                                    <div style={{ fontSize: '32px', marginBottom: '12px' }}>✅</div>
                                    <p style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '15px', marginBottom: '8px' }}>
                                        Senha redefinida com sucesso!
                                    </p>
                                    <p style={{ color: 'var(--text-2)', fontSize: '13px', lineHeight: 1.6 }}>
                                        Você já pode entrar com a sua nova senha.
                                    </p>
                                    <a href="/login" style={{
                                        display: 'inline-block', marginTop: '20px',
                                        color: 'var(--accent)', fontSize: '14px',
                                        textDecoration: 'none', fontWeight: 600
                                    }}>
                                        Ir para o login →
                                    </a>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <div className="field">
                                        <label className="field-label">Nova senha</label>
                                        <input
                                            type="password"
                                            placeholder="Mínimo 6 caracteres"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            required
                                            disabled={!token}
                                        />
                                    </div>

                                    <div className="field">
                                        <label className="field-label">Confirmar nova senha</label>
                                        <input
                                            type="password"
                                            placeholder="••••••••"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                            disabled={!token}
                                        />
                                    </div>

                                    {error && (
                                        <div style={{
                                            padding: '12px', background: 'var(--debit-bg)',
                                            border: '1px solid var(--debit-border)', borderRadius: 'var(--radius-sm)',
                                            color: 'var(--debit)', fontSize: '13px', textAlign: 'center'
                                        }}>
                                            {error}
                                        </div>
                                    )}

                                    <div className="sheet-actions" style={{ marginTop: '8px' }}>
                                        <button
                                            type="submit"
                                            className="btn btn-primary"
                                            disabled={loading || !token}
                                            style={{ opacity: (loading || !token) ? 0.7 : 1 }}
                                        >
                                            {loading ? 'Salvando...' : 'Redefinir senha'}
                                        </button>
                                    </div>

                                    <div style={{ textAlign: 'center', marginTop: '8px' }}>
                                        <a href="/login" style={{ color: 'var(--text-3)', fontSize: '13px', textDecoration: 'none' }}>
                                            ← Voltar para o login
                                        </a>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default function ResetPassword() {
    return (
        <Suspense fallback={<div />}>
            <ResetPasswordForm />
        </Suspense>
    );
}
