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
            <div className="auth-layout">
                <div className="auth-form-side">
                    <div className="auth-form-inner">
                        <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                                <div style={{
                                    width: '40px', height: '40px', background: 'var(--accent-glow)',
                                    borderRadius: '50%', display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', border: '1px solid var(--accent)'
                                }}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '22px', height: '22px' }}>
                                        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                                    </svg>
                                </div>
                                <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text)', margin: 0 }}>Criar Conta</h1>
                            </div>
                            <p style={{ color: 'var(--text-2)', fontSize: '13px', margin: 0 }}>Cadastre-se para começar a usar o SmartFlux</p>
                        </div>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
                                <div style={{ marginTop: '8px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 8px', fontSize: '11px', fontWeight: 600 }}>
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

                            <div className="sheet-actions" style={{ marginTop: '12px' }}>
                                <button type="submit" className="btn btn-primary" disabled={loading} style={{ opacity: loading ? 0.7 : 1, width: '100%' }}>
                                    {loading ? 'Cadastrando...' : 'Cadastrar'}
                                </button>
                            </div>
                        </form>

                        <div style={{ textAlign: 'center', marginTop: '16px' }}>
                            <a href="/login" style={{ color: 'var(--accent)', fontSize: '13px', textDecoration: 'none', fontWeight: 600 }}>
                                Já possui conta? Faça Login
                            </a>
                        </div>
                    </div>
                </div>

                <div className="auth-hero-side">
                    <div className="bg-glow bg-glow-1"></div>
                    <div className="bg-glow bg-glow-2"></div>
                    <div className="auth-hero-glass">
                        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'center' }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="var(--text)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '48px', height: '48px', opacity: 0.8 }}>
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                                <line x1="12" y1="18" x2="12" y2="12"></line>
                                <line x1="9" y1="15" x2="15" y2="15"></line>
                            </svg>
                        </div>
                        <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text)', marginBottom: '16px' }}>Tudo Começa Aqui</h2>
                        <p style={{ color: 'var(--text-2)', fontSize: '15px', lineHeight: 1.6 }}>Crie sua conta gratuitamente e experimente um novo nível de controle financeiro. Suas informações estarão protegidas e acessíveis em qualquer dispositivo.</p>
                    </div>
                </div>
            </div>
        </>
    );
}