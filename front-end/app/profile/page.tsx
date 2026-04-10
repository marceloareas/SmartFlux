"use client";

import React, { useState, useEffect } from 'react';
import { fetchApi } from "../../lib/api";
import '../page.css';

export default function Profile() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [message, setMessage] = useState<{type: 'error' | 'success', text: string} | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const usersRes = await fetchApi('/api/users/me');
        const u = await usersRes.json();
        if (u && u.id) {
          setCurrentUser(u);
          setName(u.name || '');
          setEmail(u.email || '');
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadUser();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    
    setMessage(null);
    setLoading(true);

    try {
      const payload = {
        name,
        email,
        passwordHash: password || currentUser.passwordHash,
        timezone: currentUser.timezone
      };

      const res = await fetchApi(`/api/users/${currentUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Erro ao atualizar perfil');
      }

      setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
      setPassword(''); // clear pass field
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Falha ao atualizar perfil' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetchApi('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: localStorage.getItem('refreshToken') })
      });
    } catch(e) {}
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
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
          <div className="topbar" style={{ justifyContent: 'space-between', padding: '0 24px' }}>
            <div className="logo" onClick={() => window.location.href="/"} style={{ cursor: 'pointer' }}>
              <div className="logo-mark">
                <svg viewBox="0 0 24 24" fill="none" stroke="#030D08" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
              </div>
              <span className="logo-name" style={{ fontSize: '15px' }}>Voltar</span>
            </div>
            
            <button onClick={handleLogout} className="btn" style={{ padding: '6px 12px', background: 'var(--debit-bg)', color: 'var(--debit)', border: '1px solid var(--debit-border)', fontSize: '13px', flex: 'none', marginLeft: '16px' }}>
              Sair da conta
            </button>
          </div>

          <div className="screen" style={{ padding: '24px', overflowY: 'auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px', marginTop: '20px' }}>
              <div style={{ 
                width: '64px', height: '64px', background: 'var(--accent-glow)', 
                borderRadius: '50%', display: 'flex', alignItems: 'center', 
                justifyContent: 'center', margin: '0 auto 16px', border: '1px solid var(--accent)'
              }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: '32px', height: '32px' }}>
                  <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                </svg>
              </div>
              <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text)', marginBottom: '8px' }}>Meu Perfil</h1>
            </div>

            <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="field">
                <label className="field-label">Nome</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              
              <div className="field">
                <label className="field-label">E-mail</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="field">
                <label className="field-label">Nova Senha (opcional)</label>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {message && (
                <div style={{ 
                  padding: '12px', 
                  background: message.type === 'error' ? 'var(--debit-bg)' : 'var(--credit-bg)', 
                  border: `1px solid ${message.type === 'error' ? 'var(--debit-border)' : 'var(--credit-border)'}`, 
                  borderRadius: 'var(--radius-sm)',
                  color: message.type === 'error' ? 'var(--debit)' : 'var(--credit)', 
                  fontSize: '13px', textAlign: 'center'
                }}>
                  {message.text}
                </div>
              )}

              <div className="sheet-actions" style={{ marginTop: '12px' }}>
                <button type="submit" className="btn btn-primary" disabled={loading} style={{ opacity: loading ? 0.7 : 1 }}>
                  {loading ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
