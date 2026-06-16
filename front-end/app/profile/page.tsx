"use client";

import React, { useState, useEffect, useRef } from 'react';
import { fetchApi } from "../../lib/api";
import '../page.css';

export default function Profile() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Avatar state
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarMessage, setAvatarMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);
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
          setAvatarUrl(u.avatarUrl || null);
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

    if (password && password !== confirmPassword) {
      setMessage({ type: 'error', text: 'As senhas não coincidem' });
      return;
    }

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
      setPassword('');
      setConfirmPassword('');
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
    } catch (e) { }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
  };

  const getAnimalAvatar = (name: string) => {
    const animals = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐧', '🦉', '🐺', '🐗', '🦄', '🐝', '🐛', '🦋', '🐢', '🐍', '🦖', '🦕', '🐙', '🦑', '🦀', '🐡', '🐠', '🐬', '🐳', '🦈', '🐊', '🐅', '🐆', '🦓', '🦍', '🐘', '🦛', '🦏', '🐫', '🦒', '🦘', '🦙', '🦝', '🦨', '🦡', '🦦', '🦥'];
    if (!name) return '🐶';
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return animals[Math.abs(hash) % animals.length];
  };

  // --- Avatar handlers ---

  const handleAvatarClick = () => {
    if (avatarUploading) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarMessage(null);

    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setAvatarMessage({ type: 'error', text: 'Formato inválido. Use JPG, PNG ou WebP.' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setAvatarMessage({ type: 'error', text: 'Arquivo muito grande. Máximo 5 MB.' });
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    e.target.value = '';
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;
    setAvatarUploading(true);
    setAvatarMessage(null);

    try {
      const formData = new FormData();
      formData.append('image', avatarFile);

      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/users/me/avatar', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Erro ao enviar imagem');
      }

      const data = await res.json();
      setAvatarUrl(data.avatarUrl + '?t=' + Date.now());
      setAvatarPreview(null);
      setAvatarFile(null);
      setAvatarMessage({ type: 'success', text: 'Foto atualizada com sucesso!' });
    } catch (err: any) {
      setAvatarMessage({ type: 'error', text: err.message || 'Falha ao enviar imagem' });
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleAvatarDelete = async () => {
    if (!confirm('Deseja realmente remover sua foto de perfil?')) return;
    setAvatarUploading(true);
    setAvatarMessage(null);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/users/me/avatar', {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Erro ao remover imagem');
      }
      setAvatarUrl(null);
      setAvatarPreview(null);
      setAvatarFile(null);
      setAvatarMessage({ type: 'success', text: 'Foto removida com sucesso!' });
    } catch (err: any) {
      setAvatarMessage({ type: 'error', text: err.message || 'Falha ao remover imagem' });
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleAvatarCancel = () => {
    setAvatarPreview(null);
    setAvatarFile(null);
    setAvatarMessage(null);
  };

  // avatarUrl from the backend already starts with "/api/avatars/..."
  // so we use it directly — no extra prefix needed.
  const displaySrc = avatarPreview || avatarUrl || null;

  return (
    <>
      <div className="bg">
        <div className="bg-grid"></div>
        <div className="bg-glow bg-glow-1"></div>
        <div className="bg-glow bg-glow-2"></div>
      </div>
      <div className="app-container">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-brand">
            <div className="logo-mark">
              <svg viewBox="0 0 24 24" fill="none" stroke="#030D08" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>
            </div>
            <span className="logo-name">SmartFlux</span>
          </div>
          
          <button className="sidebar-add-btn" onClick={() => window.location.href = "/?tab=0"}>
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" stroke="currentColor" style={{ width: 16, height: 16 }}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            Nova transação
          </button>

          <nav className="sidebar-nav">
            <div className="sidebar-nav-item" onClick={() => window.location.href = "/?tab=0"}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" /><path d="M9 21V12h6v9" /></svg>
              <span>Início</span>
            </div>
            <div className="sidebar-nav-item" onClick={() => window.location.href = "/?tab=1"}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>
              <span>Transações</span>
            </div>
            <div className="sidebar-nav-item" onClick={() => window.location.href = "/?tab=2"}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
              <span>Futuro</span>
            </div>
            <div className="sidebar-nav-item" onClick={() => window.location.href = "/?tab=3"}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
              <span>Relatórios</span>
            </div>
          </nav>

          <div className="sidebar-footer">
            <div className="sidebar-user active" onClick={() => window.location.href = "/profile"}>
              <div className="avatar-btn" style={{ fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface2)', border: '2px solid var(--accent)', borderRadius: '50%', width: '32px', height: '32px', userSelect: 'none', overflow: 'hidden', cursor: 'pointer', flexShrink: 0 }}>
                {displaySrc ? (
                  <img src={displaySrc} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ lineHeight: 1 }}>{name ? getAnimalAvatar(name) : '🐶'}</span>
                )}
              </div>
              <div className="sidebar-user-info">
                <div className="sidebar-user-name">{name || 'SmartUser'}</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <span className="sidebar-user-email" style={{ flex: 1 }}>{email || ''}</span>
                  <span onClick={(e) => { e.stopPropagation(); handleLogout(); }} style={{ fontSize: '11px', color: 'var(--debit)', cursor: 'pointer', fontWeight: 600, marginLeft: '8px', textDecoration: 'underline' }}>Sair</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <main className="main-content" id="phone">
          <div className="topbar" style={{ justifyContent: 'space-between', padding: '0 24px' }}>
            <div className="logo" onClick={() => window.location.href = "/"} style={{ cursor: 'pointer' }}>
              <div className="logo-mark">
                <svg viewBox="0 0 24 24" fill="none" stroke="#030D08" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
              </div>
              <span className="logo-name" style={{ fontSize: '15px' }}>Voltar</span>
            </div>

            <button onClick={handleLogout} className="btn" style={{ padding: '6px 12px', background: 'var(--debit-bg)', color: 'var(--debit)', border: '1px solid var(--debit-border)', fontSize: '13px', flex: 'none', marginLeft: '16px' }}>
              Sair da conta
            </button>
          </div>

          <div className="screen" style={{ padding: '24px', overflowY: 'auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px', marginTop: '20px' }}>

              {/* ── Avatar upload area ── */}
              <div style={{ position: 'relative', display: 'inline-block', marginBottom: '16px' }}>
                <input
                  id="avatar-file-input"
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />

                {/* Avatar circle */}
                <div
                  onClick={handleAvatarClick}
                  title="Clique para alterar a foto"
                  className="avatar-circle"
                  style={{
                    width: '88px',
                    height: '88px',
                    borderRadius: '50%',
                    border: '2.5px solid var(--accent)',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--surface2)',
                    cursor: avatarUploading ? 'default' : 'pointer',
                    position: 'relative',
                    transition: 'box-shadow 0.2s',
                  }}
                >
                  {displaySrc ? (
                    <img
                      src={displaySrc}
                      alt="Avatar"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <span style={{ fontSize: '44px', userSelect: 'none' }}>
                      {name ? getAnimalAvatar(name) : '🐶'}
                    </span>
                  )}

                  {/* Hover overlay */}
                  {!avatarUploading && (
                    <div className="avatar-overlay" style={{
                      position: 'absolute', inset: 0, borderRadius: '50%',
                      background: 'rgba(0,0,0,0.45)', display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center',
                      transition: 'opacity 0.2s', pointerEvents: 'none',
                    }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                        <circle cx="12" cy="13" r="4" />
                      </svg>
                      <span style={{ color: 'white', fontSize: '10px', marginTop: '4px', fontWeight: 600 }}>Alterar</span>
                    </div>
                  )}

                  {/* Spinner during upload */}
                  {avatarUploading && (
                    <div style={{
                      position: 'absolute', inset: 0, borderRadius: '50%',
                      background: 'rgba(0,0,0,0.55)', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                      <div className="avatar-spinner" />
                    </div>
                  )}
                </div>

                {/* Camera badge */}
                {!avatarFile && !avatarUploading && (
                  <div
                    onClick={handleAvatarClick}
                    className="avatar-badge"
                    style={{
                      position: 'absolute', bottom: 0, right: 0,
                      width: '26px', height: '26px', borderRadius: '50%',
                      background: 'var(--accent)', border: '2px solid var(--surface)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', transition: 'transform 0.15s',
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#030D08" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Remove Photo */}
              {!avatarFile && !avatarUploading && avatarUrl && (
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px', marginTop: '8px' }}>
                  <button
                    onClick={handleAvatarDelete}
                    className="btn"
                    style={{ padding: '4px 12px', fontSize: '12px', background: 'transparent', color: 'var(--text-muted)', border: 'none', boxShadow: 'none', textDecoration: 'underline' }}
                  >
                    Remover foto
                  </button>
                </div>
              )}

              {/* Confirm / Cancel when a file is staged */}
              {avatarFile && !avatarUploading && (
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '8px' }}>
                  <button
                    onClick={handleAvatarUpload}
                    className="btn btn-primary"
                    style={{ padding: '6px 16px', fontSize: '13px', flex: 'none' }}
                  >
                    ✓ Confirmar foto
                  </button>
                  <button
                    onClick={handleAvatarCancel}
                    className="btn"
                    style={{ padding: '6px 16px', fontSize: '13px', flex: 'none', background: 'var(--surface2)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
                  >
                    ✕ Cancelar
                  </button>
                </div>
              )}

              {/* Avatar feedback */}
              {avatarMessage && (
                <div style={{
                  fontSize: '12px', marginBottom: '8px',
                  color: avatarMessage.type === 'error' ? 'var(--debit)' : 'var(--credit)',
                }}>
                  {avatarMessage.text}
                </div>
              )}

              <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text)', marginBottom: '4px' }}>Meu Perfil</h1>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                Clique na foto para alterar
              </p>
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

              {password.length > 0 && (
                <div className="field">
                  <label className="field-label">Confirmar Nova Senha</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              )}

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
        </main>
      </div>

      {/* Micro-styles for avatar hover/spinner */}
      <style>{`
        .avatar-overlay { opacity: 0; }
        .avatar-circle:hover .avatar-overlay { opacity: 1; }
        .avatar-badge:hover { transform: scale(1.15); }
        .avatar-spinner {
          width: 24px; height: 24px;
          border: 3px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}
