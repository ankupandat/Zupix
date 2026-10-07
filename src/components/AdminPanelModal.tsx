import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldAlert, 
  Users, 
  Briefcase, 
  DollarSign, 
  Trash2, 
  Ban, 
  CheckCircle, 
  AlertTriangle,
  RefreshCw,
  Search,
  Lock,
  Smartphone,
  Plus,
  ShieldCheck
} from 'lucide-react';
import type { WorkerProfile, AdminStats, BannedIdentifier } from '../types';
import { ApiService } from '../api';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataChanged: () => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  onDataChanged
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [passError, setPassError] = useState('');
  const [activeTab, setActiveTab] = useState<'workers' | 'banned'>('workers');
  
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalWorkers: 0,
    activeWorkers: 0,
    blockedWorkers: 0,
    totalBookings: 0,
    tokenRevenue: 0,
    commissionRevenue: 0,
    bannedIdentifiersCount: 0
  });

  const [workers, setWorkers] = useState<WorkerProfile[]>([]);
  const [bannedList, setBannedList] = useState<BannedIdentifier[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [warningText, setWarningText] = useState<{ [workerId: string]: string }>({});
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // New Ban Form State
  const [newBanIdentifier, setNewBanIdentifier] = useState('');
  const [newBanType, setNewBanType] = useState<'phone' | 'device' | 'both'>('phone');
  const [newBanReason, setNewBanReason] = useState('');

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      loadAdminData();
    }
  }, [isOpen, isAuthenticated]);

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      const [adminStats, allWorkers, allBanned] = await Promise.all([
        ApiService.getAdminStats(),
        ApiService.getAllWorkersForAdmin(),
        ApiService.getBannedIdentifiers()
      ]);
      setStats(adminStats);
      setWorkers(allWorkers);
      setBannedList(allBanned);
    } catch (e) {
      console.error('Error loading admin stats:', e);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const handlePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === 'zupixadmin' || passcode === '9306315807' || passcode === 'admin123' || passcode === 'admin') {
      setIsAuthenticated(true);
      setPassError('');
    } else {
      setPassError('Invalid admin passcode. Access denied.');
    }
  };

  // Instant Block / Unblock Action Handler
  const handleToggleBlock = async (workerId: string, currentBlockedStatus: boolean) => {
    const nextStatus = !currentBlockedStatus;
    setWorkers(prev => prev.map(w => w.id === workerId ? { ...w, isBlocked: nextStatus } : w));
    await ApiService.toggleBlockWorker(workerId, nextStatus);
    
    setActionSuccessMsg(`Worker ${nextStatus ? 'BLOCKED' : 'UNBLOCKED'} successfully.`);
    setTimeout(() => setActionSuccessMsg(''), 3500);
    onDataChanged();
    loadAdminData();
  };

  // Instant Delete Action Handler
  const handleDeleteWorker = async (workerId: string, workerName: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete ${workerName}'s profile? This cannot be undone.`)) {
      return;
    }

    setWorkers(prev => prev.filter(w => w.id !== workerId));
    await ApiService.deleteWorkerProfile(workerId);
    
    setActionSuccessMsg(`Profile of ${workerName} permanently removed from system.`);
    setTimeout(() => setActionSuccessMsg(''), 3500);
    onDataChanged();
    loadAdminData();
  };

  // Warning Message Dispatch Handler
  const handleSendWarning = async (workerId: string, workerName: string) => {
    const text = warningText[workerId]?.trim();
    if (!text) {
      alert('Please enter warning message text first.');
      return;
    }

    await ApiService.sendWorkerWarning(workerId, text);
    setWarningText(prev => ({ ...prev, [workerId]: '' }));
    setActionSuccessMsg(`Strict warning dispatched to ${workerName}.`);
    setTimeout(() => setActionSuccessMsg(''), 3500);
    loadAdminData();
  };

  // Manual Ban Handler
  const handleCreateBan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBanIdentifier.trim()) {
      alert('Please enter a phone number or device ID to ban.');
      return;
    }

    if (!newBanReason.trim()) {
      alert('Please enter the reason for banning.');
      return;
    }

    setIsLoading(true);
    await ApiService.banIdentifier(
      newBanIdentifier.trim(),
      newBanType,
      newBanReason.trim(),
      'Master Admin Console'
    );

    setNewBanIdentifier('');
    setNewBanReason('');
    setActionSuccessMsg(`Identifier "${newBanIdentifier}" permanently suspended.`);
    setTimeout(() => setActionSuccessMsg(''), 3500);
    await loadAdminData();
    onDataChanged();
  };

  // Unban Handler
  const handleUnban = async (banId: string, identifier: string) => {
    if (!window.confirm(`Remove suspension for ${identifier}?`)) return;

    await ApiService.unbanIdentifier(banId);
    setActionSuccessMsg(`Suspension lifted for ${identifier}.`);
    setTimeout(() => setActionSuccessMsg(''), 3500);
    await loadAdminData();
    onDataChanged();
  };

  const filteredWorkers = workers.filter(w => 
    w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.pincode.includes(searchQuery) ||
    w.phone.includes(searchQuery)
  );

  const filteredBanned = bannedList.filter(b => 
    b.identifier.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.reason.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-4">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 p-5 text-white flex items-center justify-between border-b border-rose-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-lg sm:text-xl">Zupix Master Admin Console</h2>
                <span className="px-2 py-0.5 bg-rose-500/30 text-rose-300 text-[10px] font-mono font-bold rounded-md border border-rose-500/40">
                  SECURITY & RESTRICTIONS ROOT
                </span>
              </div>
              <p className="text-xs text-slate-400">
                1-Account-Per-Device Rule • Banned IDs Database • Specialist Management • Revenue Logs
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        {!isAuthenticated ? (
          <div className="p-8 max-w-sm mx-auto text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-lg">Protected Admin Access</h3>
            <p className="text-xs text-slate-500">
              Enter the master console passcode to access platform controls.
            </p>

            <form onSubmit={handlePasscodeSubmit} className="space-y-3">
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter passcode (e.g. zupixadmin)"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-rose-500 focus:bg-white text-center"
                autoFocus
              />
              {passError && (
                <p className="text-xs text-rose-600 font-bold">{passError}</p>
              )}
              <button
                type="submit"
                className="w-full py-2.5 bg-slate-900 hover:bg-black text-white font-bold rounded-xl text-xs transition-colors shadow-md"
              >
                Authenticate Root Access
              </button>
            </form>
          </div>
        ) : (
          <div className="p-5 space-y-5 max-h-[80vh] overflow-y-auto">
            
            {/* Action Alert Banner */}
            {actionSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-bold flex items-center gap-2 animate-fade-in shadow-xs">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{actionSuccessMsg}</span>
              </div>
            )}

            {/* Metrics Dashboard */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                  <span>Registered Pros</span>
                  <Briefcase className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-xl font-extrabold text-slate-900 mt-1">
                  {stats.totalWorkers}
                </div>
                <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                  {stats.activeWorkers} Active • {stats.blockedWorkers} Blocked
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                  <span>Total Users</span>
                  <Users className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="text-xl font-extrabold text-slate-900 mt-1">
                  {stats.totalUsers}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Verified Accounts
                </div>
              </div>

              <div className="p-3.5 bg-rose-50 rounded-xl border border-rose-200">
                <div className="flex items-center justify-between text-rose-700 text-xs font-medium">
                  <span>Banned IDs</span>
                  <Ban className="w-4 h-4 text-rose-600" />
                </div>
                <div className="text-xl font-extrabold text-rose-900 mt-1">
                  {bannedList.length}
                </div>
                <div className="text-[10px] text-rose-700 font-semibold mt-0.5">
                  Strict Blacklisted
                </div>
              </div>

              <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200">
                <div className="flex items-center justify-between text-emerald-700 text-xs font-medium">
                  <span>Platform Fee</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-xl font-extrabold text-emerald-800 mt-1">
                  100% Free
                </div>
                <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                  0% Commission Policy
                </div>
              </div>

              <div className="p-3.5 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-center justify-between text-blue-700 text-xs font-medium">
                  <span>Total Direct Calls</span>
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-xl font-extrabold text-blue-800 mt-1">
                  {stats.totalBookings || 0}
                </div>
                <div className="text-[10px] text-blue-700 font-semibold mt-0.5">
                  Direct Connections
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-slate-200 text-xs font-bold gap-2">
              <button
                onClick={() => setActiveTab('workers')}
                className={`pb-2.5 px-4 border-b-2 transition-all flex items-center gap-2 ${
                  activeTab === 'workers'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Specialists Database ({workers.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('banned')}
                className={`pb-2.5 px-4 border-b-2 transition-all flex items-center gap-2 ${
                  activeTab === 'banned'
                    ? 'border-rose-600 text-rose-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <Ban className="w-3.5 h-3.5 text-rose-500" />
                <span>Suspended / Banned IDs Database ({bannedList.length})</span>
              </button>
            </div>

            {/* TAB 1: WORKERS DATABASE */}
            {activeTab === 'workers' && (
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-sm">
                      Active Service Providers ({filteredWorkers.length})
                    </h3>
                    <button
                      onClick={loadAdminData}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded-md transition-colors"
                      title="Refresh List"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                  </div>

                  <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search providers..."
                      className="w-full pl-8 pr-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-xs focus:bg-white focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {filteredWorkers.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500">
                    No service providers found matching your criteria.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredWorkers.map((worker) => (
                      <div
                        key={worker.id}
                        className={`p-4 rounded-xl border transition-all ${
                          worker.isBlocked
                            ? 'bg-rose-50/70 border-rose-300'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={worker.avatar || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80'}
                              alt={worker.name}
                              className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-slate-900 text-sm">{worker.name}</h4>
                                {worker.isBlocked ? (
                                  <span className="px-2 py-0.5 bg-rose-600 text-white font-bold text-[10px] rounded-md">
                                    BLOCKED
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-md">
                                    ACTIVE
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-500">
                                {worker.category} • Pincode: <strong>{worker.pincode}</strong> • Phone: {worker.phone}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap">
                            <button
                              type="button"
                              onClick={() => handleToggleBlock(worker.id, Boolean(worker.isBlocked))}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs ${
                                worker.isBlocked
                                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                  : 'bg-rose-100 hover:bg-rose-200 text-rose-800'
                              }`}
                            >
                              <Ban className="w-3.5 h-3.5" />
                              {worker.isBlocked ? 'Unblock Profile' : 'Block Profile'}
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setNewBanIdentifier(worker.phone);
                                setNewBanType('both');
                                setNewBanReason(`Abusive behavior / Unpaid dues by specialist ${worker.name}`);
                                setActiveTab('banned');
                              }}
                              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
                            >
                              <ShieldAlert className="w-3.5 h-3.5" />
                              Permanent Ban
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteWorker(worker.id, worker.name)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-rose-600 hover:text-white text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Delete
                            </button>
                          </div>
                        </div>

                        {/* Warning Box */}
                        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-2">
                          <input
                            type="text"
                            value={warningText[worker.id] || ''}
                            onChange={(e) => setWarningText({ ...warningText, [worker.id]: e.target.value })}
                            placeholder="Send official warning..."
                            className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-rose-500 focus:bg-white"
                          />
                          <button
                            type="button"
                            onClick={() => handleSendWarning(worker.id, worker.name)}
                            className="w-full sm:w-auto px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1 shrink-0"
                          >
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Send Warning
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: BANNED / SUSPENDED IDENTIFIERS DATABASE */}
            {activeTab === 'banned' && (
              <div className="space-y-5">
                
                {/* Add New Permanent Ban Box */}
                <div className="p-4 bg-rose-50/80 border border-rose-200 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 text-rose-900 font-bold text-sm">
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                    <span>Permanently Ban a Mobile Number or Device ID</span>
                  </div>
                  <p className="text-xs text-rose-800 leading-relaxed">
                    Adding an ID or Device here permanently locks login, signup, and booking access across Zupix.
                  </p>

                  <form onSubmit={handleCreateBan} className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Identifier (10-Digit Mobile or Device ID)
                      </label>
                      <input
                        type="text"
                        required
                        value={newBanIdentifier}
                        onChange={(e) => setNewBanIdentifier(e.target.value)}
                        placeholder="e.g. 9876543210 or DEV-..."
                        className="w-full px-3 py-2 bg-white border border-rose-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-rose-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Restriction Target
                      </label>
                      <select
                        value={newBanType}
                        onChange={(e) => setNewBanType(e.target.value as any)}
                        className="w-full px-3 py-2 bg-white border border-rose-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-rose-500"
                      >
                        <option value="phone">Mobile Number Only</option>
                        <option value="device">Device ID Only</option>
                        <option value="both">Both (Account + Device)</option>
                      </select>
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Official Reason for Permanent Suspension
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          required
                          value={newBanReason}
                          onChange={(e) => setNewBanReason(e.target.value)}
                          placeholder="e.g. Multiple fake bookings / Fraudulent UPI payment proof / Customer harassment"
                          className="flex-1 px-3 py-2 bg-white border border-rose-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-rose-500"
                        />
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl text-xs shadow-md shadow-rose-600/30 flex items-center gap-1.5 shrink-0"
                        >
                          <Ban className="w-3.5 h-3.5" />
                          <span>Enforce Permanent Ban</span>
                        </button>
                      </div>
                    </div>
                  </form>
                </div>

                {/* Banned IDs List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 text-sm">
                      Restricted & Banned Database ({filteredBanned.length})
                    </h3>
                    <div className="relative w-60">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search banned list..."
                        className="w-full pl-8 pr-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  {filteredBanned.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500">
                      No suspended mobile numbers or device IDs currently on file.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {filteredBanned.map((ban) => (
                        <div
                          key={ban.id}
                          className="p-3.5 bg-slate-900 text-white rounded-xl border border-rose-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 text-[10px] font-mono font-bold rounded-md border border-rose-500/30 uppercase">
                                {ban.type} BAN
                              </span>
                              <span className="font-mono text-xs font-black text-rose-400">
                                {ban.identifier}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                ({ban.id})
                              </span>
                            </div>
                            <p className="text-xs text-slate-300">
                              Reason: <span className="italic font-medium text-white">"{ban.reason}"</span>
                            </p>
                            <p className="text-[10px] text-slate-400">
                              Banned On: {new Date(ban.bannedAt).toLocaleString()} by {ban.bannedBy}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleUnban(ban.id, ban.identifier)}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-emerald-700 text-slate-200 hover:text-white text-xs font-bold rounded-lg border border-slate-700 transition-colors flex items-center gap-1 shrink-0"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Lift Suspension
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
