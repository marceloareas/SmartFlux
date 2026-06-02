"use client";

import React, { useState } from 'react';
import '../page.css';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            if (!res.ok) {
                throw new Error('Erro ao processar solicitação.');
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
                <div className="phone">
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
                                        <rect x="3" y="11" width="18" height="11" rx="2" />
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                    </svg>
                                </div>
                                <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text)', marginBottom: '8px' }}>Recuperar acesso</h1>
                                <p style={{ color: 'var(--text-2)', fontSize: '14px' }}>
                                    Informe seu e-mail e enviaremos um link para redefinir sua senha.
                                </p>
                            </div>

                            {success ? (
                                <div style={{
                                    padding: '20px', background: 'rgba(94,196,167,0.1)',
                                    border: '1px solid var(--accent)', borderRadius: 'var(--radius)',
                                    textAlign: 'center'
                                }}>
                                    <div style={{ fontSize: '32px', marginBottom: '12px' }}>📬</div>
                                    <p style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '15px', marginBottom: '8px' }}>
                                        E-mail enviado!
                                    </p>
                                    <p style={{ color: 'var(--text-2)', fontSize: '13px', lineHeight: 1.6 }}>
                                        Se este endereço estiver cadastrado, você receberá um e-mail com as instruções em breve. Verifique também sua caixa de spam.
                                    </p>
                                    <a href="/login" style={{
                                        display: 'inline-block', marginTop: '20px',
                                        color: 'var(--accent)', fontSize: '14px',
                                        textDecoration: 'none', fontWeight: 600
                                    }}>
                                        ← Voltar para o login
                                    </a>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <div className="field">
                                        <label className="field-label">E-mail</label>
                                        <input
                                            type="email"
                                            placeholder="seu@email.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
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
                                        <button type="submit" className="btn btn-primary" disabled={loading} style={{ opacity: loading ? 0.7 : 1 }}>
                                            {loading ? 'Enviando...' : 'Enviar link de recuperação'}
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
