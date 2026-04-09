"use client";
import React, { useState, useEffect } from 'react';
import './page.css';

export default function Component() {
  const [activeTab, setActiveTab] = useState(1);
  const [currentFilter, setCurrentFilter] = useState('all');

  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState<any>({ id: null, dir: 'debit', amount: '', rawAmount: 0, category: '', categoryId: '', date: '', dateObj: '', desc: '' });

  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState('add');
  const [direction, setDirection] = useState('debit');
  const [sheetAmount, setSheetAmount] = useState('');
  const [sheetDate, setSheetDate] = useState('');
  const [sheetDesc, setSheetDesc] = useState('');
  const [editingId, setEditingId] = useState<any>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);

  const [newCatOpen, setNewCatOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#5EC4A7');
  const [selectedCategory, setSelectedCategory] = useState('');

  const [categories, setCategories] = useState<any[]>([]);
  const [txs, setTxs] = useState<any[]>([]);
  const [account, setAccount] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  const [flowTotal, setFlowTotal] = useState(0);

  const hexToRgba = (hex: string, a: number) => {
    if (!hex) return `rgba(122,147,168,${a})`;
    const r = parseInt(hex.slice(1, 3), 16),
      g = parseInt(hex.slice(3, 5), 16),
      b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${a})`;
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data.map((c: any) => ({
        value: c.id,
        label: c.name,
        color: c.color,
        icon: c.icon
      })));
    } catch(e) { console.error('Error fetching categories:', e); }
  };

  const fetchTransactions = async () => {
    try {
      const res = await fetch('/api/transactions');
      const data = await res.json();
      
      data.sort((a: any, b: any) => new Date(b.competenceDate).getTime() - new Date(a.competenceDate).getTime());
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let currentMonth = '';
      const grouped: any[] = [];
      let total = 0;
      
      data.forEach((t: any) => {
        const d = new Date(t.competenceDate);
        const isPending = d > today;
        const monthName = d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
        const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);
        
        if (monthName !== currentMonth) {
          grouped.push({ type: 'month', label: capitalizedMonth });
          currentMonth = monthName;
        }
        
        const isDebit = t.direction === false;
        
        if (!isPending) {
          if (isDebit) total -= t.amount;
          else total += t.amount;
        }
        
        grouped.push({
          id: t.id,
          type: 'tx',
          dir: isDebit ? 'debit' : 'credit',
          amount: `R$ ${t.amount.toFixed(2).replace('.', ',')}`,
          rawAmount: t.amount,
          category: t.category ? t.category.name : null,
          categoryId: t.category ? t.category.id : null,
          dateObj: t.competenceDate,
          date: d.toLocaleDateString('pt-BR'),
          desc: t.description,
          isPending: isPending,
          icon: t.category && t.category.icon ? (t.category.icon.length === 1 ? t.category.icon : t.category.name.charAt(0).toUpperCase()) : (t.category ? t.category.name.charAt(0).toUpperCase() : '#'),
          color: t.category?.color || '#7A93A8',
          bg: hexToRgba(t.category?.color, 0.18)
        });
      });
      
      setTxs(grouped as any);
      setFlowTotal(total);
    } catch(e) { console.error('Error fetching txs:', e); }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const usersRes = await fetch('/api/users');
        const users = await usersRes.json();
        if (users.length > 0) setCurrentUser(users[0]);

        const accRes = await fetch('/api/accounts');
        const accs = await accRes.json();
        if (accs.length > 0) setAccount(accs[0]);
        
        await fetchCategories();
        await fetchTransactions();
      } catch (err) {
        console.error(err);
      }
    };
    loadData();

    const keydown = (e: any) => {
      if (e.key === 'Escape') {
        setDetailOpen(false);
        setSheetOpen(false);
        setConfirmOpen(false);
        setNewCatOpen(false);
      }
    };
    document.addEventListener('keydown', keydown);
    return () => document.removeEventListener('keydown', keydown);
  }, []);

  const handleSaveTx = async () => {
    if(!account || !sheetAmount) return;
    
    const transaction = {
      account: { id: account.id },
      category: selectedCategory && selectedCategory !== '__new__' ? { id: selectedCategory } : null,
      amount: parseFloat(sheetAmount),
      direction: direction === 'credit',
      competenceDate: sheetDate + "T00:00:00",
      status: 1,
      description: sheetDesc
    };
    
    try {
      if (sheetMode === 'add') {
        await fetch('/api/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(transaction)
        });
      } else {
        await fetch(`/api/transactions/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(transaction)
        });
      }
      setSheetOpen(false);
      fetchTransactions();
    } catch(e) { console.error("Error saving tx", e); }
  };

  const handleDeleteTx = async () => {
    try {
      await fetch(`/api/transactions/${editingId}`, { method: 'DELETE' });
      setConfirmOpen(false);
      fetchTransactions();
    } catch(e) { console.error("Error deleting tx", e); }
  };

  const handleCreateCategory = async () => {
    if(!newCatName.trim() || !currentUser) return;
    
    const newCatObj = {
      user: { id: currentUser.id },
      name: newCatName.trim(),
      color: newCatColor
    };
    
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCatObj)
      });
      await fetchCategories();
      const loc = res.headers.get('Location');
      if (loc) {
        const id = loc.substring(loc.lastIndexOf('/') + 1);
        setSelectedCategory(id);
      }
      setNewCatOpen(false);
      setNewCatName('');
    } catch(e) { console.error("Error creating category", e); }
  };

  const openAddSheet = () => {
    setSheetMode('add');
    setDirection('debit');
    setEditingId(null);
    setSheetAmount('');
    setSheetDate(new Date().toISOString().split('T')[0]);
    setSheetDesc('');
    setSelectedCategory('');
    setSheetOpen(true);
  };

  const openEditSheet = () => {
    setDetailOpen(false);
    setSheetMode('edit');
    setEditingId(detail.id);
    setDirection(detail.dir);
    setSheetAmount(detail.rawAmount.toString());
    setSheetDate(detail.dateObj.split('T')[0]);
    setSheetDesc(detail.desc || '');
    setSelectedCategory(detail.categoryId || '');
    setSheetOpen(true);
  };

  return (
    <>
      <div className="bg">
        <div className="bg-grid"></div>
        <div className="bg-glow bg-glow-1"></div>
        <div className="bg-glow bg-glow-2"></div>
      </div>
      <div className="shell">
        <div className="phone" id="phone">
          <div className="topbar">
            <div className="logo">
              <div className="logo-mark">
                <svg viewBox="0 0 24 24" fill="none" stroke="#030D08" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
              </div>
              <span className="logo-name">SmartFlux</span>
            </div>
            <div className="avatar-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
            </div>
          </div>

          <div className="screen">
            <div className="page-header">
              <div className="page-title">Transações</div>
              <div className="flow-summary">
                <span className="flow-label">Fluxo atual:</span>
                <span className={`flow-value ${flowTotal >= 0 ? 'positive' : 'negative'}`}>
                  R$ {Math.abs(flowTotal).toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>

            <div className="filter-bar">
              <button className={`chip ${currentFilter === 'all' ? 'active' : ''}`} onClick={() => setCurrentFilter('all')}>Todas</button>
              <button className={`chip debit-chip ${currentFilter === 'debit' ? 'active' : ''}`} onClick={() => setCurrentFilter('debit')}>Despesas</button>
              <button className={`chip credit-chip ${currentFilter === 'credit' ? 'active' : ''}`} onClick={() => setCurrentFilter('credit')}>Receitas</button>
              <button className={`chip ${currentFilter === 'pending' ? 'active' : ''}`} onClick={() => setCurrentFilter('pending')}>Pendentes</button>
            </div>

            <div className="tx-list" id="txList">
              {txs.filter((t: any) => {
                if (t.type === 'month') return true;
                if (currentFilter === 'all') return !t.isPending;
                if (currentFilter === 'pending') return t.isPending;
                return t.dir === currentFilter && !t.isPending;
              }).map((t: any) => {
                if (t.type === 'month') {
                  // Find this month's index in the ORIGINAL txs array to get the correct section
                  const fullIdx = txs.findIndex(x => x === t);
                  const nextMonthIdx = txs.slice(fullIdx + 1).findIndex(x => x.type === 'month');
                  const sectionTxs = txs.slice(fullIdx + 1, nextMonthIdx === -1 ? undefined : fullIdx + 1 + nextMonthIdx);
                  
                  let show = false;
                  if (currentFilter === 'all') show = sectionTxs.some(x => x.type === 'tx' && !x.isPending);
                  else if (currentFilter === 'pending') show = sectionTxs.some(x => x.type === 'tx' && x.isPending);
                  else show = sectionTxs.some(x => x.type === 'tx' && x.dir === currentFilter && !x.isPending);

                  if(!show) return null;
                  return <div key={`month-${t.label}`} className="month-label">{t.label}</div>;
                }
                return (
                  <div key={t.id} className={`tx-card ${t.dir}`} onClick={() => { setDetail(t); setDetailOpen(true); }}>
                    <div className="tx-card-icon" style={{ background: t.bg, color: t.color }}>{t.icon}</div>
                    <div className="tx-card-body">
                      <div className="tx-card-desc">{t.desc}</div>
                      <div className="tx-card-meta">{t.category ? `${t.category} · ${t.date.slice(0,5)}` : `${t.date.slice(0,5)} · Sem categoria`}</div>
                    </div>
                    <div className="tx-card-amount">{t.dir === 'debit' ? '- ' : '+ '}{t.amount.replace('R$ ', '')}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="tabbar">
            <div className={`tab-item ${activeTab === 0 ? 'active' : ''}`} onClick={() => setActiveTab(0)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>
              <span className="tab-label">Início</span>
            </div>
            <div className={`tab-item ${activeTab === 1 ? 'active' : ''}`} onClick={() => setActiveTab(1)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
              <span className="tab-label">Transações</span>
            </div>
            <div className="tab-fab" onClick={openAddSheet}>
              <div className="fab-circle">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </div>
              <span className="tab-label">Adicionar</span>
            </div>
            <div className={`tab-item ${activeTab === 2 ? 'active' : ''}`} onClick={() => setActiveTab(2)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
              <span className="tab-label">Futuro</span>
            </div>
            <div className={`tab-item ${activeTab === 3 ? 'active' : ''}`} onClick={() => setActiveTab(3)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              <span className="tab-label">Relatórios</span>
            </div>
          </div>

          <div className={`overlay-backdrop ${detailOpen ? 'open' : ''}`} onClick={(e) => { if(e.target === e.currentTarget) setDetailOpen(false); }}>
            <div className={`detail-card ${detail.dir}`}>
              <div className="detail-close" onClick={() => setDetailOpen(false)}>
                <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 1l10 10M11 1L1 11"/></svg>
              </div>
              <div className="detail-amount">{detail.dir === 'debit' ? '- ' : '+ '}{detail.amount}</div>
              <div className="detail-rows">
                <div className="detail-row">
                  <div className="detail-row-label">Categoria</div>
                  <div className={`detail-row-value ${!detail.category ? 'empty' : ''}`}>{detail.category || '—'}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-row-label">Data de competência</div>
                  <div className="detail-row-value">{detail.date || '—'}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-row-label">Descrição</div>
                  <div className={`detail-row-value ${!detail.desc ? 'empty' : ''}`}>{detail.desc || 'Sem descrição'}</div>
                </div>
              </div>
              <button className="detail-edit-btn" onClick={openEditSheet}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                Editar transação
              </button>
            </div>
          </div>

          <div className={`sheet-backdrop ${sheetOpen ? 'open' : ''}`} onClick={(e) => { if(e.target === e.currentTarget) setSheetOpen(false); }}>
            <div className="sheet">
              <div className="sheet-handle"></div>
              <div className="sheet-title">{sheetMode === 'add' ? 'Nova transação' : 'Editar transação'}</div>
              
              <div className="dir-toggle">
                <button className={`dir-btn ${direction === 'debit' ? 'active-debit' : ''}`} onClick={() => setDirection('debit')}>↓ Débito</button>
                <div className="dir-separator"></div>
                <button className={`dir-btn ${direction === 'credit' ? 'active-credit' : ''}`} onClick={() => setDirection('credit')}>↑ Crédito</button>
              </div>

              <div className="field">
                <label className="field-label">Valor <span className="field-required">*</span></label>
                <div className="amount-wrap">
                  <span className="amount-prefix">R$</span>
                  <input type="number" placeholder="0.00" step="0.01" min="0" value={sheetAmount} onChange={e => setSheetAmount(e.target.value)} />
                </div>
              </div>

              <div className="field">
                <label className="field-label">Categoria</label>
                <div style={{position:'relative'}}>
                  <select 
                    value={selectedCategory} 
                    onChange={(e) => {
                      if (e.target.value === '__new__') setNewCatOpen(true);
                      else setSelectedCategory(e.target.value);
                    }}
                  >
                    <option value="">Sem categoria</option>
                    {categories.map((c: any) => <option key={c.value} value={c.value}>{c.label}</option>)}
                    <option value="__new__">+ Adicionar nova categoria…</option>
                  </select>
                </div>
              </div>

              <div className="field">
                <label className="field-label">Data de competência</label>
                <input type="date" value={sheetDate} onChange={e => setSheetDate(e.target.value)} />
              </div>

              <div className="field">
                <label className="field-label">Descrição</label>
                <textarea placeholder="Nota opcional…" value={sheetDesc} onChange={e => setSheetDesc(e.target.value)}></textarea>
              </div>

              <div className="sheet-actions">
                {sheetMode === 'edit' && <button className="btn btn-danger" onClick={() => { setSheetOpen(false); setTimeout(() => setConfirmOpen(true), 180); }}>Excluir</button>}
                <button className="btn btn-primary" onClick={handleSaveTx}>{sheetMode === 'add' ? 'Adicionar' : 'Salvar'}</button>
              </div>
            </div>
          </div>

          <div className={`sheet-backdrop ${confirmOpen ? 'open' : ''}`} onClick={(e) => { if(e.target === e.currentTarget) setConfirmOpen(false); }}>
            <div className="confirm-box">
              <div className="confirm-title">Tem certeza?</div>
              <div className="confirm-body">Isso irá <strong>cancelar a transação</strong> permanentemente. O registro será mantido para auditoria, mas excluído de todos os cálculos. Isso não pode ser desfeito.</div>
              <div className="sheet-actions">
                <button className="btn btn-ghost" onClick={() => setConfirmOpen(false)}>Voltar</button>
                <button className="btn btn-danger" onClick={handleDeleteTx}>Sim, cancelar</button>
              </div>
            </div>
          </div>

          <div className={`sheet-backdrop ${newCatOpen ? 'open' : ''}`} onClick={(e) => { if(e.target === e.currentTarget) setNewCatOpen(false); }}>
            <div className="sheet">
              <div className="sheet-handle"></div>
              <div className="sheet-title">Nova categoria</div>

              <div className="field">
                <label className="field-label">Nome</label>
                <input type="text" placeholder="ex: Combustível" value={newCatName} onChange={e => setNewCatName(e.target.value)} />
              </div>

              <div style={{marginBottom:16}}>
                <div className="field-label" style={{marginBottom:10}}>Cor</div>
                <div style={{display:'flex',flexWrap:'wrap',gap:10}}>
                  {['#5EC4A7','#F5A623','#8A6EED','#37B9DD','#E8893C','#FF5C6A','#A78BFA','#34D399','#FB7185','#DC6450'].map(c => (
                    <div key={c} className={`nc-swatch ${newCatColor === c ? 'active' : ''}`} style={{background: c}} onClick={() => setNewCatColor(c)}></div>
                  ))}
                </div>
              </div>

              <div style={{display:'flex',alignItems:'center',gap:10,padding:'11px 13px',background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:'var(--radius-sm)',marginBottom:18}}>
                <div style={{width:30,height:30,borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'"Roboto",sans-serif',fontSize:12,fontWeight:700,background:hexToRgba(newCatColor, 0.18),color:newCatColor,flexShrink:0}}>
                  {newCatName ? newCatName[0].toUpperCase() : '#'}
                </div>
                <span style={{fontSize:13,fontWeight:600,color:newCatName?'var(--text)':'var(--text-2)'}}>{newCatName || 'Pré-visualização'}</span>
              </div>

              <div className="sheet-actions">
                <button className="btn btn-ghost" onClick={() => setNewCatOpen(false)}>Cancelar</button>
                <button className="btn btn-primary" style={{flex:2}} onClick={handleCreateCategory}>Criar e selecionar</button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
