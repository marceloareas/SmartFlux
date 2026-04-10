"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import '../page.css';

export default function Login() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Erro ao realizar login');
            }

            // Salva os tokens na localStorage
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken);

            // Redireciona para o app
            router.push('/');
        } catch (err: any) {
            setError(err.message || 'Falha na conexão com o servidor');
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
                                <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text)', marginBottom: '8px' }}>SmartFlux</h1>
                                <p style={{ color: 'var(--text-2)', fontSize: '14px' }}>Bem-vindo de volta!</p>
                            </div>

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

                                <div className="field">
                                    <label className="field-label">Senha</label>
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
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

                                <div className="sheet-actions" style={{ marginTop: '24px' }}>
                                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ opacity: loading ? 0.7 : 1 }}>
                                        {loading ? 'Entrando...' : 'Entrar'}
                                    </button>
                                </div>
                            </form>

                            <div style={{ textAlign: 'center', marginTop: '24px' }}>
                                <a href="/register" style={{ color: 'var(--accent)', fontSize: '14px', textDecoration: 'none', fontWeight: 600 }}>
                                    Ainda não tem conta? Cadastre-se
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}