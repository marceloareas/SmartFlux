"use client";
import React, { useState, useEffect } from 'react';
import './page.css';
import { fetchApi } from "../lib/api";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [reportTab, setReportTab] = useState('cashflow');
  const [selectedMonthIdx, setSelectedMonthIdx] = useState(5);
  const [reportPeriod, setReportPeriod] = useState<'monthly' | '6months'>('monthly');
  const [exportStart, setExportStart] = useState(() => {
    const d = new Date(); d.setDate(1); return d.toISOString().split('T')[0];
  });
  const [exportEnd, setExportEnd] = useState(() => {
    const d = new Date(); d.setMonth(d.getMonth() + 1, 0); return d.toISOString().split('T')[0];
  });
  const [exportFormat, setExportFormat] = useState('csv');

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

  const fetchCategories = async (uid: string) => {
    try {
      const res = await fetchApi('/api/categories');
      const data = await res.json();
      setCategories(data.filter((c: any) => c.user?.id === uid).map((c: any) => ({
        value: c.id,
        label: c.name,
        color: c.color,
        icon: c.icon
      })));
    } catch (e) { console.error('Error fetching categories:', e); }
  };

  const fetchTransactions = async (accId: string) => {
    try {
      const res = await fetchApi('/api/transactions');
      const data = await res.json();

      const myTxs = data.filter((t: any) => t.account?.id === accId);
      myTxs.sort((a: any, b: any) => new Date(b.competenceDate).getTime() - new Date(a.competenceDate).getTime());

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let currentMonth = '';
      const grouped: any[] = [];
      let total = 0;

      myTxs.forEach((t: any) => {
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
    } catch (e) { console.error('Error fetching txs:', e); }
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && (!localStorage.getItem('accessToken') || !localStorage.getItem('refreshToken'))) {
      window.location.href = '/login';
      return;
    }
    
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam) {
        const parsed = parseInt(tabParam, 10);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 3) {
          setActiveTab(parsed);
        }
      }
    }

    const loadData = async () => {
      try {
        const usersRes = await fetchApi('/api/users/me');
        const user = await usersRes.json();
        if (user && user.id) setCurrentUser(user);

        const accRes = await fetchApi('/api/accounts');
        const accs = await accRes.json();
        const myAcc = accs.find((a: any) => a.user?.id === user.id);
        if (myAcc) setAccount(myAcc);

        await fetchCategories(user.id);
        if (myAcc) await fetchTransactions(myAcc.id);
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
    if (!account || !sheetAmount) return;

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
        await fetchApi('/api/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(transaction)
        });
      } else {
        await fetchApi(`/api/transactions/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(transaction)
        });
      }
      setSheetOpen(false);
      if (account) fetchTransactions(account.id);
    } catch (e) { console.error("Error saving tx", e); }
  };

  const handleDeleteTx = async () => {
    try {
      await fetchApi(`/api/transactions/${editingId}`, { method: 'DELETE' });
      setConfirmOpen(false);
      if (account) fetchTransactions(account.id);
    } catch (e) { console.error("Error deleting tx", e); }
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

  const handleCreateCategory = async () => {
    if (!newCatName.trim() || !currentUser) return;

    const newCatObj = {
      user: { id: currentUser.id },
      name: newCatName.trim(),
      color: newCatColor
    };

    try {
      const res = await fetchApi('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCatObj)
      });
      await fetchCategories(currentUser.id);
      const loc = res.headers.get('Location');
      if (loc) {
        const id = loc.substring(loc.lastIndexOf('/') + 1);
        setSelectedCategory(id);
      }
      setNewCatOpen(false);
      setNewCatName('');
    } catch (e) { console.error("Error creating category", e); }
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

  const getAnimalAvatar = (name: string) => {
    const animals = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐧', '🦉', '🐺', '🐗', '🦄', '🐝', '🐛', '🦋', '🐢', '🐍', '🦖', '🦕', '🐙', '🦑', '🦀', '🐡', '🐠', '🐬', '🐳', '🦈', '🐊', '🐅', '🐆', '🦓', '🦍', '🐘', '🦛', '🦏', '🐫', '🦒', '🦘', '🦙', '🦝', '🦨', '🦡', '🦦', '🦥'];
    if (!name) return '🐶';
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return animals[Math.abs(hash) % animals.length];
  };

  const handleExportCsv = async () => {
    try {
      const res = await fetchApi(`/api/transactions/export?startDate=${exportStart}&endDate=${exportEnd}&t=${Date.now()}`);
      const blob = await res.blob();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relatorio_transacoes_${exportStart}_${exportEnd}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url); setExportMenuOpen(false);
    } catch (e) {
      console.error('Erro ao exportar CSV', e);
      alert('Erro ao exportar o relatório');
    }
  };

  const handleExportPdf = () => {
    try {
      const startDate = new Date(exportStart + 'T00:00:00');
      const endDate = new Date(exportEnd + 'T23:59:59');

      const periodTxs = txs.filter((t: any) => {
        if (t.type !== 'tx' || t.isPending) return false;
        const td = new Date(t.dateObj);
        return td >= startDate && td <= endDate;
      });

      const income = periodTxs.filter((t: any) => t.dir === 'credit').reduce((acc: number, t: any) => acc + t.rawAmount, 0);
      const expense = periodTxs.filter((t: any) => t.dir === 'debit').reduce((acc: number, t: any) => acc + t.rawAmount, 0);
      const net = income - expense;

      const doc = new jsPDF();

      doc.setFontSize(18);
      const formatLabelDate = (dStr: string) => {
        const parts = dStr.split('-');
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      };
      doc.text(`Relatório de Transações - ${formatLabelDate(exportStart)} até ${formatLabelDate(exportEnd)}`, 14, 22);

      doc.setFontSize(11);
      doc.text(`Receitas: R$ ${income.toFixed(2).replace('.', ',')}`, 14, 30);
      doc.text(`Despesas: R$ ${expense.toFixed(2).replace('.', ',')}`, 14, 36);
      doc.text(`Líquido: R$ ${net.toFixed(2).replace('.', ',')}`, 14, 42);

      const tableData = periodTxs.map((t: any) => [
        new Date(t.dateObj).toLocaleDateString('pt-BR'),
        t.desc || 'Sem descrição',
        t.category || 'Sem categoria',
        (t.dir === 'debit' ? '-' : '+') + ' R$ ' + t.rawAmount.toFixed(2).replace('.', ',')
      ]);

      autoTable(doc, {
        startY: 50,
        head: [['Data', 'Descrição', 'Categoria', 'Valor']],
        body: tableData,
        headStyles: { fillColor: [3, 13, 8] },
      });

      doc.save(`relatorio_transacoes_${exportStart}_${exportEnd}.pdf`);
      setExportMenuOpen(false);
    } catch (e) {
      console.error('Erro ao exportar PDF', e);
      alert('Erro ao exportar o relatório PDF');
    }
  };


  const allTxs = txs.filter((t: any) => t.type === 'tx' && !t.isPending);
  const today = new Date();
  const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const currentMonthTxs = allTxs.filter((t: any) => new Date(t.dateObj) >= currentMonthStart);
  
  const currentIncome = currentMonthTxs.filter((t: any) => t.dir === 'credit').reduce((acc, t) => acc + t.rawAmount, 0);
  const currentExpense = currentMonthTxs.filter((t: any) => t.dir === 'debit').reduce((acc, t) => acc + t.rawAmount, 0);
  const currentNet = currentIncome - currentExpense;

  const upcomingTxs = txs.filter((t: any) => t.type === 'tx' && t.isPending)
                         .sort((a: any, b: any) => new Date(a.dateObj).getTime() - new Date(b.dateObj).getTime())
                         .slice(0, 3);
  const recentTxs = txs.filter((t: any) => t.type === 'tx' && !t.isPending)
                       .sort((a: any, b: any) => new Date(b.dateObj).getTime() - new Date(a.dateObj).getTime())
                       .slice(0, 4);

  const last6Months = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth() - 5 + i, 1);
    const monthName = d.toLocaleDateString('pt-BR', { month: 'short' });
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    const monthTxs = allTxs.filter((t: any) => {
      const td = new Date(t.dateObj);
      return td >= d && td <= end;
    });
    const income = monthTxs.filter((t: any) => t.dir === 'credit').reduce((acc, t) => acc + t.rawAmount, 0);
    const expense = monthTxs.filter((t: any) => t.dir === 'debit').reduce((acc, t) => acc + t.rawAmount, 0);
    return { month: monthName, income, expense, net: income - expense };
  });
  const maxChartVal = Math.max(1, ...last6Months.map(m => Math.max(m.income, m.expense)));

  let activeMonthData;
  let activeMonthLabel;
  let activeMonthTxs;

  if (reportPeriod === 'monthly') {
    activeMonthData = last6Months[selectedMonthIdx];
    const activeMonthDate = new Date(today.getFullYear(), today.getMonth() - 5 + selectedMonthIdx, 1);
    activeMonthLabel = activeMonthDate.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }).replace('.', '');
    const activeMonthEnd = new Date(activeMonthDate.getFullYear(), activeMonthDate.getMonth() + 1, 0, 23, 59, 59);
    activeMonthTxs = allTxs.filter((t: any) => {
      const td = new Date(t.dateObj);
      return td >= activeMonthDate && td <= activeMonthEnd;
    });
  } else {
    const income = last6Months.reduce((acc, m) => acc + m.income, 0);
    const expense = last6Months.reduce((acc, m) => acc + m.expense, 0);
    activeMonthData = { income, expense, net: income - expense };
    activeMonthLabel = 'Últimos 6 meses';
    const startD = new Date(today.getFullYear(), today.getMonth() - 5, 1);
    const endD = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);
    activeMonthTxs = allTxs.filter((t: any) => {
      const td = new Date(t.dateObj);
      return td >= startD && td <= endD;
    });
  }

  const catTotals: Record<string, any> = {};
  activeMonthTxs.filter((t: any) => t.dir === 'debit').forEach((t: any) => {
    const key = t.categoryId || 'none';
    if (!catTotals[key]) catTotals[key] = { name: t.category || 'Sem categoria', icon: t.icon, color: t.color, bg: t.bg, total: 0, count: 0 };
    catTotals[key].total += t.rawAmount;
    catTotals[key].count += 1;
  });
  const sortedCats = Object.values(catTotals).sort((a: any, b: any) => b.total - a.total);

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
          
          <button className="sidebar-add-btn" onClick={openAddSheet}>
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" stroke="currentColor" style={{ width: 16, height: 16 }}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            Nova transação
          </button>

          <nav className="sidebar-nav">
            <div className={`sidebar-nav-item ${activeTab === 0 ? 'active' : ''}`} onClick={() => setActiveTab(0)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" /><path d="M9 21V12h6v9" /></svg>
              <span>Início</span>
            </div>
            <div className={`sidebar-nav-item ${activeTab === 1 ? 'active' : ''}`} onClick={() => setActiveTab(1)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>
              <span>Transações</span>
            </div>
            <div className={`sidebar-nav-item ${activeTab === 2 ? 'active' : ''}`} onClick={() => setActiveTab(2)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
              <span>Futuro</span>
            </div>
            <div className={`sidebar-nav-item ${activeTab === 3 ? 'active' : ''}`} onClick={() => setActiveTab(3)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
              <span>Relatórios</span>
            </div>
          </nav>

          <div className="sidebar-footer">
            <div className="sidebar-user" onClick={() => window.location.href = "/profile"}>
              <div className="avatar-btn" style={{ fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface2)', border: '2px solid var(--accent)', borderRadius: '50%', width: '32px', height: '32px', userSelect: 'none', overflow: 'hidden', cursor: 'pointer', flexShrink: 0 }}>
                {currentUser?.avatarUrl ? (
                  <img src={currentUser.avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ lineHeight: 1 }}>{currentUser?.name ? getAnimalAvatar(currentUser.name) : '🐶'}</span>
                )}
              </div>
              <div className="sidebar-user-info">
                <div className="sidebar-user-name">{currentUser?.name || 'SmartUser'}</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <span className="sidebar-user-email" style={{ flex: 1 }}>{currentUser?.email || ''}</span>
                  <span onClick={(e) => { e.stopPropagation(); handleLogout(); }} style={{ fontSize: '11px', color: 'var(--debit)', cursor: 'pointer', fontWeight: 600, marginLeft: '8px', textDecoration: 'underline' }}>Sair</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <main className="main-content" id="phone">
          <div className="topbar">
            <div className="logo">
              <div className="logo-mark">
                <svg viewBox="0 0 24 24" fill="none" stroke="#030D08" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>
              </div>
              <span className="logo-name">SmartFlux</span>
            </div>
            <div className="avatar-btn" onClick={() => window.location.href = "/profile"} style={{ fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface2)', border: '2px solid var(--accent)', borderRadius: '50%', width: '36px', height: '36px', userSelect: 'none', overflow: 'hidden', cursor: 'pointer', flexShrink: 0 }}>
              {currentUser?.avatarUrl ? (
                <img src={currentUser.avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ lineHeight: 1 }}>{currentUser?.name ? getAnimalAvatar(currentUser.name) : '🐶'}</span>
              )}
            </div>
          </div>

          <div className="screen">
            {activeTab === 0 ? (
              <div className="screen-scroll">
                <div className="balance-hero">
                  <div className="balance-period">
                    <span className="period-dot"></span>
                    <span style={{textTransform:'capitalize'}}>{today.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).replace('.', '')}</span>
                  </div>
                  <div className="balance-label">Fluxo de caixa líquido</div>
                  <div className={`balance-amount ${currentNet >= 0 ? 'positive' : 'negative'}`}>
                    {currentNet >= 0 ? '+ ' : '- '}R$ {Math.abs(currentNet).toFixed(2).replace('.', ',')}
                  </div>
                  <div className="balance-split">
                    <div className="split-item">
                      <div className="split-label">Receitas</div>
                      <div className="split-val in">+ R$ {currentIncome.toFixed(2).replace('.', ',')}</div>
                    </div>
                    <div className="split-item">
                      <div className="split-label">Despesas</div>
                      <div className="split-val out">- R$ {currentExpense.toFixed(2).replace('.', ',')}</div>
                    </div>
                  </div>
                </div>

                <div className="dashboard-grid">
                  <div className="section">
                    <div className="section-header">
                      <div className="section-title">Próximos vencimentos</div>
                      <a className="section-link" onClick={() => setActiveTab(2)}>Ver tudo →</a>
                    </div>
                    <div className="upcoming-list">
                      {upcomingTxs.map((t: any) => {
                        const overdue = new Date(t.dateObj).setHours(0,0,0,0) < new Date().setHours(0,0,0,0);
                        return (
                          <div key={t.id} className={`upcoming-card ${overdue ? 'overdue' : t.dir}`} onClick={() => { setDetail(t); setDetailOpen(true); }}>
                            <div className="uc-icon" style={{ background: t.bg, color: t.color }}>{t.icon}</div>
                            <div className="uc-body">
                              <div className="uc-desc">{t.desc}</div>
                              <div className="uc-meta">{t.category ? `${t.category} · ` : ''}{new Date(t.dateObj).toLocaleDateString('pt-BR', {day:'2-digit', month:'2-digit'})}</div>
                            </div>
                            {overdue && <div className="overdue-pill">Atrasada</div>}
                            <div className="uc-amount" style={{ color: overdue ? 'var(--warning)' : t.dir === 'debit' ? 'var(--debit)' : 'var(--credit)' }}>
                              {t.dir === 'debit' ? '- ' : '+ '}R$ {t.rawAmount.toFixed(2).replace('.', ',')}
                            </div>
                          </div>
                        )
                      })}
                      {upcomingTxs.length === 0 && <div style={{textAlign: 'center', color: 'var(--text-3)', padding: '10px', fontSize: '13px'}}>Nenhum vencimento futuro.</div>}
                    </div>
                  </div>

                  <div className="section" style={{ marginTop: '20px', paddingBottom: '20px' }}>
                    <div className="section-header">
                      <div className="section-title">Transações recentes</div>
                      <a className="section-link" onClick={() => setActiveTab(1)}>Ver tudo →</a>
                    </div>
                    <div className="recent-list">
                      {recentTxs.map((t: any) => (
                        <div key={t.id} className={`tx-card ${t.dir}`} onClick={() => { setDetail(t); setDetailOpen(true); }}>
                          <div className="tx-card-icon" style={{ background: t.bg, color: t.color }}>{t.icon}</div>
                          <div className="tx-card-body">
                            <div className="tx-card-desc">{t.desc}</div>
                            <div className="tx-card-meta">{t.category ? `${t.category} · ` : ''}{new Date(t.dateObj).toLocaleDateString('pt-BR', {day:'2-digit', month:'2-digit'})}</div>
                          </div>
                          <div className="tx-card-amount">
                            {t.dir === 'debit' ? '- ' : '+ '}{t.amount.replace('R$ ', '')}
                          </div>
                        </div>
                      ))}
                      {recentTxs.length === 0 && <div style={{textAlign: 'center', color: 'var(--text-3)', padding: '10px', fontSize: '13px'}}>Nenhuma transação recente.</div>}
                    </div>
                  </div>
                </div>
              </div>
            ) : activeTab === 3 ? (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
                <div className="page-header" style={{ paddingBottom: '16px' }}>
                  <div className="page-title">Relatórios</div>
                </div>
                <div className="sub-nav">
                  <div className={`sub-tab ${reportTab === 'cashflow' ? 'active' : ''}`} onClick={() => setReportTab('cashflow')}>Fluxo de caixa</div>
                  <div className={`sub-tab ${reportTab === 'categories' ? 'active' : ''}`} onClick={() => setReportTab('categories')}>Por categoria</div>
                  <div className={`sub-tab ${reportTab === 'export' ? 'active' : ''}`} onClick={() => setReportTab('export')}>Exportar</div>
                </div>
                
                {reportTab === 'cashflow' && (
                  <div className="panel active">
                    <div className="period-bar">
                      <button className={`period-btn ${reportPeriod === 'monthly' ? 'active' : ''}`} style={{ opacity: reportPeriod === 'monthly' ? 1 : 0.5 }} onClick={() => setReportPeriod('monthly')}>Mensal</button>
                      <button className={`period-btn ${reportPeriod === '6months' ? 'active' : ''}`} style={{ opacity: reportPeriod === '6months' ? 1 : 0.5 }} onClick={() => setReportPeriod('6months')}>6 meses</button>
                      <div className="period-nav">
                        {reportPeriod === 'monthly' && (
                          <div className="period-current" style={{textTransform:'capitalize'}}>{activeMonthLabel}</div>
                        )}
                      </div>
                    </div>

                    <div className="summary-strip">
                      <div className="summary-item">
                        <div className="summary-lbl">Líquido</div>
                        <div className="summary-val" style={{ color: activeMonthData.net >= 0 ? 'var(--accent)' : 'var(--debit)' }}>
                          {activeMonthData.net >= 0 ? '+' : '-'}R$ {Math.abs(activeMonthData.net).toFixed(2).replace('.', ',')}
                        </div>
                      </div>
                      <div className="summary-item">
                        <div className="summary-lbl">Receitas</div>
                        <div className="summary-val" style={{ color: 'var(--credit)' }}>R$ {activeMonthData.income.toFixed(2).replace('.', ',')}</div>
                      </div>
                      <div className="summary-item">
                        <div className="summary-lbl">Despesas</div>
                        <div className="summary-val" style={{ color: 'var(--debit)' }}>R$ {activeMonthData.expense.toFixed(2).replace('.', ',')}</div>
                      </div>
                    </div>

                    <div className="report-desktop-split">
                      <div className="chart-wrap">
                        <div className="chart-title">Receitas vs despesas (6 meses)</div>
                        <div className="bar-chart">
                          {last6Months.map((m, i) => (
                            <div key={i} className={`bar-col ${reportPeriod === '6months' || i === selectedMonthIdx ? 'current' : ''}`} onClick={() => { setReportPeriod('monthly'); setSelectedMonthIdx(i); }} style={{ cursor: 'pointer' }}>
                              <div className="bar-wrap">
                                <div className="bar-seg income" style={{ height: `${Math.max(4, (m.income / maxChartVal) * 70)}px` }}></div>
                                <div className="bar-seg expense" style={{ height: `${Math.max(4, (m.expense / maxChartVal) * 70)}px` }}></div>
                              </div>
                              <div className="bar-month" style={{textTransform:'capitalize'}}>{m.month.replace('.','')}</div>
                            </div>
                          ))}
                        </div>
                        <div className="chart-legend">
                          <div className="legend-item"><div className="legend-dot" style={{ background: 'var(--credit)' }}></div>Receitas</div>
                          <div className="legend-item"><div className="legend-dot" style={{ background: 'var(--debit)' }}></div>Despesas</div>
                        </div>
                      </div>

                      {reportPeriod === '6months' && (
                        <div className="breakdown-list">
                          <div style={{fontSize:'11px',fontWeight:600,letterSpacing:'.07em',textTransform:'uppercase',color:'var(--text-3)',marginBottom:'2px'}}>Líquido por mês</div>
                          {last6Months.slice().reverse().map((m, i) => {
                            const maxNet = Math.max(1, ...last6Months.map(x => Math.abs(x.net)));
                            const pct = Math.max(2, (Math.abs(m.net) / maxNet) * 100);
                            const isPos = m.net >= 0;
                            return (
                              <div key={i} className="breakdown-row">
                                <div className="breakdown-month" style={{textTransform:'capitalize'}}>{m.month.replace('.','')}</div>
                                <div className="breakdown-bar-wrap"><div className="breakdown-bar-fill" style={{ width: `${pct}%`, background: isPos ? 'var(--accent)' : 'var(--debit)' }}></div></div>
                                <div className="breakdown-val" style={{ color: isPos ? 'var(--accent)' : 'var(--debit)' }}>
                                  {isPos ? '+' : '-'}R$ {Math.abs(m.net).toFixed(2).replace('.', ',')}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {reportTab === 'categories' && (
                  <div className="panel active">
                    <div className="cat-summary">
                      <div className="cat-total-label">Total gasto — <span style={{textTransform:'capitalize'}}>{activeMonthLabel}</span></div>
                      <div className="cat-total-val">R$ {activeMonthData.expense.toFixed(2).replace('.', ',')}</div>
                    </div>
                    <div className="cat-list" style={{ marginTop: '16px' }}>
                      {sortedCats.map((cat, i) => (
                        <div key={i} className="cat-row">
                          <div className="cat-icon" style={{ background: cat.bg, color: cat.color }}>{cat.icon}</div>
                          <div className="cat-info">
                            <div className="cat-name">{cat.name}</div>
                            <div className="cat-bar-wrap">
                              <div className="cat-bar-fill" style={{ width: `${Math.max(2, (cat.total / Math.max(1, activeMonthData.expense)) * 100)}%`, background: cat.color }}></div>
                            </div>
                          </div>
                          <div className="cat-count">{cat.count} trans</div>
                          <div className="cat-amount">R$ {cat.total.toFixed(2).replace('.', ',')}</div>
                        </div>
                      ))}
                      {sortedCats.length === 0 && <div style={{textAlign: 'center', color: 'var(--text-3)', padding: '20px'}}>Nenhuma despesa neste mês.</div>}
                    </div>
                  </div>
                )}

                {reportTab === 'export' && (
                  <div className="panel active">
                    <div className="export-wrap">
                      <div className="field-row">
                        <div className="field">
                          <div className="field-label">De</div>
                          <input type="date" value={exportStart} onChange={e => setExportStart(e.target.value)} />
                        </div>
                        <div className="field">
                          <div className="field-label">Até</div>
                          <input type="date" value={exportEnd} onChange={e => setExportEnd(e.target.value)} />
                        </div>
                      </div>
                      <div className="field">
                        <div className="field-label">Incluir</div>
                        <select>
                          <option>Todas as transações</option>
                          <option>Apenas concluídas</option>
                        </select>
                      </div>
                      <div className="field">
                        <div className="field-label">Formato</div>
                        <select value={exportFormat} onChange={e => setExportFormat(e.target.value)}>
                          <option value="csv">CSV (.csv)</option>
                          <option value="pdf">PDF (.pdf)</option>
                        </select>
                      </div>
                      <button className="btn-export" onClick={() => exportFormat === 'pdf' ? handleExportPdf() : handleExportCsv()}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        Baixar relatório
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
                <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div className="page-title">{activeTab === 0 ? 'Início' : activeTab === 2 ? 'Futuro' : activeTab === 3 ? 'Relatórios' : 'Transações'}</div>
                <div className="flow-summary">
                  <span className="flow-label">Fluxo atual:</span>
                  <span className={`flow-value ${flowTotal >= 0 ? 'positive' : 'negative'}`}>
                    R$ {Math.abs(flowTotal).toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>
              <div style={{ position: 'relative' }}>
              </div>
            </div>

            {activeTab !== 2 && (
              <div className="filter-bar">
                <button className={`chip ${currentFilter === 'all' ? 'active' : ''}`} onClick={() => setCurrentFilter('all')}>Todas</button>
                <button className={`chip debit-chip ${currentFilter === 'debit' ? 'active' : ''}`} onClick={() => setCurrentFilter('debit')}>Despesas</button>
                <button className={`chip credit-chip ${currentFilter === 'credit' ? 'active' : ''}`} onClick={() => setCurrentFilter('credit')}>Receitas</button>
              </div>
            )}

            <div className="tx-list" id="txList">
              {txs.filter((t: any) => {
                if (t.type === 'month') return true;
                if (activeTab === 2) return t.isPending;
                if (t.isPending) return false;
                if (currentFilter === 'all') return true;
                return t.dir === currentFilter;
              }).map((t: any) => {
                if (t.type === 'month') {
                  // Find this month's index in the ORIGINAL txs array to get the correct section
                  const fullIdx = txs.findIndex(x => x === t);
                  const nextMonthIdx = txs.slice(fullIdx + 1).findIndex(x => x.type === 'month');
                  const sectionTxs = txs.slice(fullIdx + 1, nextMonthIdx === -1 ? undefined : fullIdx + 1 + nextMonthIdx);

                  let show = false;
                  if (activeTab === 2) {
                    show = sectionTxs.some(x => x.type === 'tx' && x.isPending);
                  } else {
                    if (currentFilter === 'all') show = sectionTxs.some(x => x.type === 'tx' && !x.isPending);
                    else show = sectionTxs.some(x => x.type === 'tx' && x.dir === currentFilter && !x.isPending);
                  }

                  if (!show) return null;
                  return <div key={`month-${t.label}`} className="month-label">{t.label}</div>;
                }
                return (
                  <div key={t.id} className={`tx-card ${t.dir}`} onClick={() => { setDetail(t); setDetailOpen(true); }}>
                    <div className="tx-card-icon" style={{ background: t.bg, color: t.color }}>{t.icon}</div>
                    <div className="tx-card-body">
                      <div className="tx-card-desc">{t.desc}</div>
                      <div className="tx-card-meta">{t.category ? `${t.category} · ${t.date.slice(0, 5)}` : `${t.date.slice(0, 5)} · Sem categoria`}</div>
                    </div>
                    <div className="tx-card-amount">{t.dir === 'debit' ? '- ' : '+ '}{t.amount.replace('R$ ', '')}</div>
                  </div>
                );
              })}
            </div>
              </div>
            )}
          </div>

          <div className="tabbar">
            <div className={`tab-item ${activeTab === 0 ? 'active' : ''}`} onClick={() => setActiveTab(0)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" /><path d="M9 21V12h6v9" /></svg>
              <span className="tab-label">Início</span>
            </div>
            <div className={`tab-item ${activeTab === 1 ? 'active' : ''}`} onClick={() => setActiveTab(1)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>
              <span className="tab-label">Transações</span>
            </div>
            <div className="tab-fab" onClick={openAddSheet}>
              <div className="fab-circle">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              </div>
              <span className="tab-label">Adicionar</span>
            </div>
            <div className={`tab-item ${activeTab === 2 ? 'active' : ''}`} onClick={() => setActiveTab(2)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
              <span className="tab-label">Futuro</span>
            </div>
            <div className={`tab-item ${activeTab === 3 ? 'active' : ''}`} onClick={() => setActiveTab(3)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
              <span className="tab-label">Relatórios</span>
            </div>
          </div>

          <div className={`overlay-backdrop ${detailOpen ? 'open' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) setDetailOpen(false); }}>
            <div className={`detail-card ${detail.dir}`}>
              <div className="detail-close" onClick={() => setDetailOpen(false)}>
                <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 1l10 10M11 1L1 11" /></svg>
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
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                Editar transação
              </button>
            </div>
          </div>

          <div className={`sheet-backdrop ${sheetOpen ? 'open' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) setSheetOpen(false); }}>
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
                <div style={{ position: 'relative' }}>
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

          <div className={`sheet-backdrop ${confirmOpen ? 'open' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) setConfirmOpen(false); }}>
            <div className="confirm-box">
              <div className="confirm-title">Tem certeza?</div>
              <div className="confirm-body">Isso irá <strong>cancelar a transação</strong> permanentemente. O registro será mantido para auditoria, mas excluído de todos os cálculos. Isso não pode ser desfeito.</div>
              <div className="sheet-actions">
                <button className="btn btn-ghost" onClick={() => setConfirmOpen(false)}>Voltar</button>
                <button className="btn btn-danger" onClick={handleDeleteTx}>Sim, cancelar</button>
              </div>
            </div>
          </div>

          <div className={`sheet-backdrop ${newCatOpen ? 'open' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) setNewCatOpen(false); }}>
            <div className="sheet">
              <div className="sheet-handle"></div>
              <div className="sheet-title">Nova categoria</div>

              <div className="field">
                <label className="field-label">Nome</label>
                <input type="text" placeholder="ex: Combustível" value={newCatName} onChange={e => setNewCatName(e.target.value)} />
              </div>

              <div style={{ marginBottom: 16 }}>
                <div className="field-label" style={{ marginBottom: 10 }}>Cor</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {['#5EC4A7', '#F5A623', '#8A6EED', '#37B9DD', '#E8893C', '#FF5C6A', '#A78BFA', '#34D399', '#FB7185', '#DC6450'].map(c => (
                    <div key={c} className={`nc-swatch ${newCatColor === c ? 'active' : ''}`} style={{ background: c }} onClick={() => setNewCatColor(c)}></div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 13px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', marginBottom: 18 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Roboto",sans-serif', fontSize: 12, fontWeight: 700, background: hexToRgba(newCatColor, 0.18), color: newCatColor, flexShrink: 0 }}>
                  {newCatName ? newCatName[0].toUpperCase() : '#'}
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: newCatName ? 'var(--text)' : 'var(--text-2)' }}>{newCatName || 'Pré-visualização'}</span>
              </div>

              <div className="sheet-actions">
                <button className="btn btn-ghost" onClick={() => setNewCatOpen(false)}>Cancelar</button>
                <button className="btn btn-primary" style={{ flex: 2 }} onClick={handleCreateCategory}>Criar e selecionar</button>
              </div>
            </div>
          </div>

        </main>
      </div>
    </>
  );
}
