"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import '../page.css';

export default function Register() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const hasMinLength = password.length >= 6;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const isValidPassword = hasMinLength && hasUpper && hasLower && hasNumber;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!isValidPassword) {
            setError('A senha não atende aos requisitos mínimos.');
            return;
        }

        if (password !== confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password }),
            });

            if (!res.ok) {
                let errorMessage = 'Erro ao realizar cadastro. Tente outro e-mail.';
                try {
                    const data = await res.json();
                    if (data.message) errorMessage = data.message;
                } catch (e) { }
                throw new Error(errorMessage);
            }

            // Redireciona para login após cadastro
            router.push('/login');
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
                            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                                <div style={{
                                    width: '56px', height: '56px', background: 'var(--accent-glow)',
                                    borderRadius: '50%', display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', margin: '0 auto 16px', border: '1px solid var(--accent)'
                                }}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '28px', height: '28px' }}>
                                        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                                    </svg>
                                </div>
                                <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text)', marginBottom: '8px' }}>Criar Conta</h1>
                                <p style={{ color: 'var(--text-2)', fontSize: '13px' }}>Cadastre-se para começar a usar o SmartFlux</p>
                            </div>

                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                <div className="field">
                                    <label className="field-label">Nome Completo</label>
                                    <input
                                        type="text"
                                        placeholder="Seu nome"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </div>

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
                                    <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '11px', fontWeight: 600 }}>
                                        <div style={{ color: hasMinLength ? 'var(--credit)' : 'var(--text-3)', display: 'flex', alignItems: 'center', gap: '4px', transition: 'color 0.2s' }}>
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                            mínimo de 6 caracteres
                                        </div>
                                        <div style={{ color: hasUpper ? 'var(--credit)' : 'var(--text-3)', display: 'flex', alignItems: 'center', gap: '4px', transition: 'color 0.2s' }}>
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                            uma letra maiúscula
                                        </div>
                                        <div style={{ color: hasLower ? 'var(--credit)' : 'var(--text-3)', display: 'flex', alignItems: 'center', gap: '4px', transition: 'color 0.2s' }}>
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                            uma letra minúscula
                                        </div>
                                        <div style={{ color: hasNumber ? 'var(--credit)' : 'var(--text-3)', display: 'flex', alignItems: 'center', gap: '4px', transition: 'color 0.2s' }}>
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                            um número
                                        </div>
                                    </div>
                                </div>

                                <div className="field">
                                    <label className="field-label">Confirmar Senha</label>
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                </div>

                                {error && (
                                    <div style={{
                                        padding: '10px', background: 'var(--debit-bg)',
                                        border: '1px solid var(--debit-border)', borderRadius: 'var(--radius-sm)',
                                        color: 'var(--debit)', fontSize: '12px', textAlign: 'center'
                                    }}>
                                        {error}
                                    </div>
                                )}

                                <div className="sheet-actions" style={{ marginTop: '16px' }}>
                                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ opacity: loading ? 0.7 : 1 }}>
                                        {loading ? 'Cadastrando...' : 'Cadastrar'}
                                    </button>
                                </div>
                            </form>

                            <div style={{ textAlign: 'center', marginTop: '20px' }}>
                                <a href="/login" style={{ color: 'var(--accent)', fontSize: '13px', textDecoration: 'none', fontWeight: 600 }}>
                                    Já possui conta? Faça Login
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}