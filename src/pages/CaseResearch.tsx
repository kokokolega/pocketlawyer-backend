import { storage } from "../firebase";
import { uploadBytesResumable } from "firebase/storage";
import AiAssistant from "./AiAssistant";
import { deleteObject, ref as storageRef } from "firebase/storage";
import { deleteDoc } from "firebase/firestore";
import { collection, getDocs, query, where, addDoc } from "firebase/firestore";
import { login, signup } from "../auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAuth } from "firebase/auth";
import React, { useState } from 'react';
import { signOut } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect } from "react";
import { motion, AnimatePresence } from 'motion/react';
import {
  Scale, Menu, X, FileText, Search, Brain, LogOut,
  Plus, ChevronRight, Upload, User,
  Briefcase, Shield, Clock, CheckCircle, AlertCircle,
  Eye, Trash2, MessageSquare, FolderOpen, Hash
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────
type Screen = 'auth' | 'dashboard';
type AuthTab = 'login' | 'signup';
type DashTab = 'overview' | 'my-cases' | 'evidence' | 'ai-assistant';

interface Case {
  id: string;
  title: string;
  client: string;
  type: string;
  court: string;
  status: 'active' | 'pending' | 'closed' | 'hearing';
  date: string;
  nextHearing?: string;
  priority: 'high' | 'medium' | 'low';
}

interface Evidence {
  id: string;
  caseId: string;
  name: string;
  type: string;
  size: string;
  uploaded: string;
  tag: string;
  url?: string;
  path?: string;
}

interface Message {
  role: 'user' | 'ai';
  content: string;
  time: string;
}

// ─── Dummy Data ───────────────────────────────────────────────────────────────
const DUMMY_CASES: Case[] = [
  { id: 'C001', title: 'Sharma vs. State of UP', client: 'Rajesh Sharma', type: 'Criminal', court: 'Allahabad High Court', status: 'active', date: '2024-11-10', nextHearing: '2025-04-18', priority: 'high' },
  { id: 'C002', title: 'Property Dispute — Mehta Family', client: 'Sunita Mehta', type: 'Civil', court: 'District Court, Lucknow', status: 'hearing', date: '2024-12-01', nextHearing: '2025-04-22', priority: 'high' },
  { id: 'C003', title: 'Consumer Complaint — TechMart', client: 'Anil Verma', type: 'Consumer', court: 'Consumer Forum', status: 'pending', date: '2025-01-15', priority: 'medium' },
  { id: 'C004', title: 'Labour Dispute — ABC Mills', client: 'Workers Union', type: 'Labour', court: 'Labour Court, Kanpur', status: 'active', date: '2025-02-03', nextHearing: '2025-05-01', priority: 'medium' },
  { id: 'C005', title: 'Divorce Petition — Singh', client: 'Priya Singh', type: 'Family', court: 'Family Court, Lucknow', status: 'closed', date: '2024-08-20', priority: 'low' },
];

const DUMMY_EVIDENCE: Evidence[] = [
  { id: 'E001', caseId: 'C001', name: 'FIR_Copy_Sharma.pdf', type: 'PDF', size: '2.4 MB', uploaded: '2024-11-12', tag: 'FIR' },
  { id: 'E002', caseId: 'C001', name: 'Witness_Statement_1.pdf', type: 'PDF', size: '1.1 MB', uploaded: '2024-11-18', tag: 'Witness' },
  { id: 'E003', caseId: 'C002', name: 'Land_Registry_Doc.jpg', type: 'Image', size: '3.7 MB', uploaded: '2024-12-05', tag: 'Property' },
  { id: 'E004', caseId: 'C002', name: 'Sale_Agreement_1998.pdf', type: 'PDF', size: '0.9 MB', uploaded: '2024-12-07', tag: 'Agreement' },
  { id: 'E005', caseId: 'C003', name: 'Bill_Invoice_TechMart.pdf', type: 'PDF', size: '0.5 MB', uploaded: '2025-01-16', tag: 'Invoice' },
  { id: 'E006', caseId: 'C004', name: 'Employment_Contract.pdf', type: 'PDF', size: '1.8 MB', uploaded: '2025-02-05', tag: 'Contract' },
];

const AI_SUGGESTIONS = [
  'Summarize Sharma vs. State of UP',
  'What evidence is strongest for C002?',
  'Next hearing dates for all active cases',
  'Draft a bail application for C001',
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const statusColor: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700',
  pending: 'bg-amber-100 text-amber-700',
  closed: 'bg-slate-100 text-slate-500',
  hearing: 'bg-orange-100 text-orange-600',
};

const statusDot: Record<string, string> = {
  active: 'bg-emerald-500',
  pending: 'bg-amber-500',
  closed: 'bg-slate-400',
  hearing: 'bg-orange-500',
};

const priorityDot: Record<string, string> = {
  high: 'bg-rose-500',
  medium: 'bg-amber-400',
  low: 'bg-slate-300',
};

const getAIReply = (msg: string): string => {
  const m = msg.toLowerCase();
  if (m.includes('sharma') || m.includes('c001')) {
    return '📁 Case C001 — Sharma vs. State of UP\n\n• Court: Allahabad High Court\n• Type: Criminal\n• Next Hearing: 18 April 2025\n• Evidence on file: FIR Copy, Witness Statement\n\nSuggested action: File bail application at least 7 days before the next hearing. The FIR copy and witness statement support the defence narrative. Shall I draft the bail application?';
  }
  if (m.includes('evidence') || m.includes('strongest')) {
    return '🔍 Strongest Evidence for Mehta Property Dispute (C002):\n\n1. Sale Agreement 1998 — establishes original ownership chain\n2. Land Registry Doc — government-stamped proof\n\nRecommendation: Present the Sale Agreement first as the primary document.';
  }
  if (m.includes('hearing') || m.includes('date')) {
    return '📅 Upcoming Hearings:\n\n• C001 – Sharma vs UP → 18 Apr 2025 (Allahabad HC)\n• C002 – Mehta Property → 22 Apr 2025 (District Court, Lucknow)\n• C004 – Labour Dispute → 01 May 2025 (Labour Court, Kanpur)';
  }
  if (m.includes('bail') || m.includes('application')) {
    return '📝 Bail Application Draft — Sharma vs. State of UP\n\nIN THE HON\'BLE HIGH COURT OF JUDICATURE AT ALLAHABAD\nBail Application No. ___ of 2025\n\nGROUNDS:\n1. The applicant has no prior criminal record.\n2. The FIR is based on circumstantial evidence only.\n\n[Full draft ready — shall I complete and export it?]';
  }
  return '⚖️ I have access to all your cases and evidence. You can ask me to summarize cases, find evidence, draft applications, or check hearing dates.';
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export const CaseResearch = () => {
  const handleTestLogin = async () => {
    try {
      await login("test@gmail.com", "123456");
      alert("Login success 🚀");
    } catch (err) {
      console.error(err);
      alert((err as any).message);
    }
  };

  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [screen, setScreen] = useState<Screen>('auth');
  const [authTab, setAuthTab] = useState<AuthTab>('login');
  const [dashTab, setDashTab] = useState<DashTab>('overview');
  const [lawyer, setLawyer] = useState({ name: 'Adv. Priya Kapoor', email: '' });
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({ name: '', email: '', bar: '', password: '' });
  const [cases, setCases] = useState<Case[]>([]);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [filterType, setFilterType] = useState("all");
  const [preview, setPreview] = useState<{ url: string; type: string } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  // FIX 1: Renamed state to `showNewCase` to avoid shadowing the local `caseData` variable in addCase
  const [showNewCase, setShowNewCase] = useState(false);
  const [nc, setNc] = useState({ title: '', client: '', type: '', court: '' });

  const loadUserData = async (user: any) => {
    try {
      const docRef = doc(db, "users", user.uid);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        setLawyer({ name: data.name || "User", email: data.email || user.email || "" });
      } else {
        setLawyer({ name: user.email || "User", email: user.email || "" });
      }
    } catch (_) {}
    try {
      const evSnap = await getDocs(query(collection(db, "evidence"), where("userId", "==", user.uid)));
      setEvidence(evSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Evidence[]);
    } catch (_) {}
    try {
      const snapshot = await getDocs(query(collection(db, "cases"), where("userId", "==", user.uid)));
      setCases(snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Case[]);
    } catch (_) {}
  };

  useEffect(() => {}, []);

  const doSignup = async () => {
    try {
      if (!signupForm.email || !signupForm.password) { alert("Please fill all fields"); return; }
      const userCred = await signup(signupForm.email, signupForm.password);
      await setDoc(doc(db, "users", userCred.user.uid), {
        email: userCred.user.email,
        name: signupForm.name || "New User",
        createdAt: new Date()
      });
      alert("Account created 🚀");
      setAuthTab("login");
    } catch (err) { alert((err as any).message); }
  };

  const doLogin = async () => {
    try {
      if (!loginForm.email || !loginForm.password) { alert("Please fill all fields"); return; }
      await login(loginForm.email, loginForm.password);
      const user = getAuth().currentUser;
      if (!user) { alert("Login failed, please try again"); return; }
      setScreen('dashboard');
      loadUserData(user);
    } catch (err) { alert((err as any).message); }
  };

  const handleLogout = async () => {
    try {
      await signOut(getAuth());
      setLawyer({ name: '', email: '' });
      setScreen('auth');
      alert("Logged out 👋");
    } catch (err) { alert((err as any).message); }
  };

  // FIX 2: saveEvidence now also writes to Firestore so evidence persists on refresh
  const saveEvidence = async (caseId: string, file: File) => {
    try {
      const user = getAuth().currentUser;
      if (!user) return;
      const storageRef = ref(storage, `evidence/${user.uid}/${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on("state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(Math.round(progress));
        },
        (error) => { console.error(error); alert("Upload failed"); },
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          setUploadProgress(null);
          const evData = {
            caseId,
            name: file.name,
            type: file.type,
            size: (file.size / 1024).toFixed(1) + " KB",
            tag: file.type.includes("image") ? "photo evidence"
              : file.type.includes("pdf") ? "legal document"
              : file.type.includes("audio") ? "audio proof"
              : file.type.includes("video") ? "video evidence"
              : "file",
            uploaded: new Date().toISOString().slice(0, 10),
            url,
            path: uploadTask.snapshot.ref.fullPath,
            userId: user.uid,
          };
          // Persist to Firestore
          const docRef = await addDoc(collection(db, "evidence"), evData);
          setEvidence(prev => [{ id: docRef.id, ...evData }, ...prev]);
        }
      );
    } catch (err) { alert((err as any).message); }
  };

  // FIX 3: deleteEvidence gracefully handles missing storage path or Firestore doc
  const deleteEvidence = async (ev: any) => {
    try {
      if (ev.path) {
        const fileRef = storageRef(storage, ev.path);
        await deleteObject(fileRef).catch(() => {
          // File may already be gone from storage — continue anyway
        });
      }
      await deleteDoc(doc(db, "evidence", ev.id)).catch(() => {
        // Doc may not exist in Firestore — continue anyway
      });
      setEvidence(prev => prev.filter(e => e.id !== ev.id));
      alert("Deleted successfully");
    } catch (err) { console.error(err); alert("Delete failed"); }
  };

  // FIX 1 (continued): renamed local variable from `newCase` to `caseData`
  // so it no longer shadows the `showNewCase` state, and setShowNewCase(false) works correctly
  const addCase = async () => {
    if (!nc.title) return;
    try {
      const user = getAuth().currentUser;
      if (!user) { alert("Not logged in"); return; }
      const caseData = {
        title: nc.title, client: nc.client, type: nc.type || "Civil",
        court: nc.court, status: "pending",
        date: new Date().toISOString().slice(0, 10), priority: "medium", userId: user.uid,
      };
      const docRef = await addDoc(collection(db, "cases"), caseData);
      alert("Case saved 🚀");
      setCases(p => [{ id: docRef.id, ...caseData } as any, ...p]);
      setNc({ title: "", client: "", type: "", court: "" });
      setShowNewCase(false);
    } catch (err) { alert((err as any).message); }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // AUTH SCREEN
  // ═══════════════════════════════════════════════════════════════════════════
  if (screen === 'auth') {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #fff7ed 0%, #ffedd5 45%, #fed7aa 100%)' }}
      >
        {/* Decorative floating orbs — matching reference image 1 */}
        <div className="absolute pointer-events-none"
          style={{ top: '-120px', left: '-60px', width: '420px', height: '420px', borderRadius: '50%', background: 'radial-gradient(circle at 40% 40%, #f97316 0%, #ea580c 55%, #9a3412 100%)', opacity: 0.75 }} />
        <div className="absolute pointer-events-none"
          style={{ top: '-60px', left: '180px', width: '180px', height: '180px', borderRadius: '50%', background: 'radial-gradient(circle, #fed7aa 0%, #fb923c 100%)', opacity: 0.7 }} />
        <div className="absolute pointer-events-none"
          style={{ top: '60px', left: '30px', width: '100px', height: '100px', borderRadius: '50%', background: 'radial-gradient(circle, #ea580c 0%, #7c2d12 100%)', opacity: 0.8 }} />
        <div className="absolute pointer-events-none"
          style={{ bottom: '-80px', right: '5%', width: '320px', height: '320px', borderRadius: '50%', background: 'radial-gradient(circle, #f97316 0%, #ea580c 70%)', opacity: 0.35 }} />
        <div className="absolute pointer-events-none"
          style={{ bottom: '15%', right: '-20px', width: '140px', height: '140px', borderRadius: '50%', background: 'radial-gradient(circle, #fed7aa 0%, #f97316 100%)', opacity: 0.4 }} />

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-sm relative z-10"
        >
          {/* Back button */}
          <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="mb-5">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); window.location.href = '/'; }}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 text-sm font-semibold transition-all group"
              style={{ position: 'relative', zIndex: 50 }}
            >
              <div className="w-8 h-8 bg-white/80 rounded-xl shadow-sm flex items-center justify-center group-hover:bg-white transition-colors backdrop-blur-sm">
                <span className="text-slate-600 text-sm">‹</span>
              </div>
              Back
            </button>
          </motion.div>

          {/* Auth Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.45 }}
            className="bg-white overflow-hidden"
            style={{ borderRadius: '28px', boxShadow: '0 40px 100px rgba(234,88,12,0.18), 0 8px 32px rgba(0,0,0,0.1)' }}
          >
            {/* Decorative header with orbs */}
            <div className="relative h-28 overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #7c2d12 0%, #c2410c 50%, #ea580c 100%)' }}>
              <div className="absolute pointer-events-none"
                style={{ top: '-40px', right: '-40px', width: '130px', height: '130px', borderRadius: '50%', background: 'radial-gradient(circle, #fb923c 0%, #ea580c 100%)', opacity: 0.55 }} />
              <div className="absolute pointer-events-none"
                style={{ top: '-20px', right: '50px', width: '70px', height: '70px', borderRadius: '50%', background: 'radial-gradient(circle, #fed7aa 0%, #fb923c 100%)', opacity: 0.7 }} />
              <div className="absolute pointer-events-none"
                style={{ bottom: '-20px', left: '-20px', width: '90px', height: '90px', borderRadius: '50%', background: 'radial-gradient(circle, #ea580c 0%, #7c2d12 100%)', opacity: 0.6 }} />
              <div className="absolute pointer-events-none"
                style={{ bottom: '5px', left: '35%', width: '45px', height: '45px', borderRadius: '50%', background: 'radial-gradient(circle, #ffffff 0%, #c8d8ff 100%)', opacity: 0.35 }} />
              <div className="relative z-10 flex flex-col items-center justify-center h-full gap-1">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.25)' }}>
                  <img src="/favicon.ico" alt="logo" className="h-6 w-6 object-contain" />
                </div>
                <p className="text-white/70 text-[11px] font-semibold tracking-widest uppercase">PocketLawyer</p>
              </div>
            </div>

            <div className="px-7 pt-6 pb-8">
              <AnimatePresence mode="wait">
                {authTab === 'login' ? (
                  <motion.div key="lh" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                    <h1 className="text-[26px] font-bold text-slate-800 mb-1 tracking-tight">Welcome back</h1>
                    <p className="text-slate-400 text-sm mb-6">Enter your credentials to continue</p>
                  </motion.div>
                ) : (
                  <motion.div key="sh" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                    <h1 className="text-[26px] font-bold text-slate-800 mb-1 tracking-tight">Get Started</h1>
                    <p className="text-slate-400 text-sm mb-6">Create your advocate account</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence mode="wait">
                {authTab === 'login' ? (
                  <motion.div key="login" initial={{ opacity: 0, x: -18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 18 }} transition={{ duration: 0.25 }} className="space-y-4">
                    <div>
                      <label className="text-slate-500 text-xs font-semibold mb-1.5 block">Email</label>
                      <input
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-800 placeholder-slate-300 text-sm focus:outline-none focus:border-orange-400 focus:ring-3 focus:ring-orange-100 transition-all"
                        placeholder="advocate@email.com"
                        value={loginForm.email}
                        onChange={e => setLoginForm(p => ({ ...p, email: e.target.value }))}
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-slate-500 text-xs font-semibold">Password</label>
                        <button className="text-orange-500 text-xs hover:text-orange-700 font-medium">Forgot password?</button>
                      </div>
                      <input
                        type="password"
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-800 placeholder-slate-300 text-sm focus:outline-none focus:border-orange-400 focus:ring-3 focus:ring-orange-100 transition-all"
                        placeholder="••••••••••"
                        value={loginForm.password}
                        onChange={e => setLoginForm(p => ({ ...p, password: e.target.value }))}
                      />
                    </div>
                    <button
                      onClick={doLogin}
                      className="w-full text-white py-3.5 rounded-2xl font-bold text-sm transition-all mt-2 active:scale-[0.98] hover:shadow-xl"
                      style={{ background: 'linear-gradient(135deg, #c2410c 0%, #f97316 100%)', boxShadow: '0 8px 28px rgba(234,88,12,0.38)' }}
                    >
                      Sign in
                    </button>
                    <p className="text-center text-slate-400 text-sm pt-1">
                      Don't have an account?{' '}
                      <button onClick={() => setAuthTab('signup')} className="text-orange-600 font-bold hover:text-orange-800">Sign up</button>
                    </p>
                  </motion.div>
                ) : (
                  <motion.div key="signup" initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }} transition={{ duration: 0.25 }} className="space-y-4">
                    <div>
                      <label className="text-slate-500 text-xs font-semibold mb-1.5 block">Full Name</label>
                      <input className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-800 placeholder-slate-300 text-sm focus:outline-none focus:border-orange-400 focus:ring-3 focus:ring-orange-100 transition-all" placeholder="Adv. Your Name" value={signupForm.name} onChange={e => setSignupForm(p => ({ ...p, name: e.target.value }))} />
                    </div>
                    <div>
                      <label className="text-slate-500 text-xs font-semibold mb-1.5 block">Email</label>
                      <input className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-800 placeholder-slate-300 text-sm focus:outline-none focus:border-orange-400 focus:ring-3 focus:ring-orange-100 transition-all" placeholder="advocate@email.com" value={signupForm.email} onChange={e => setSignupForm(p => ({ ...p, email: e.target.value }))} />
                    </div>
                    <div>
                      <label className="text-slate-500 text-xs font-semibold mb-1.5 block">Bar Council ID</label>
                      <input className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-800 placeholder-slate-300 text-sm focus:outline-none focus:border-orange-400 focus:ring-3 focus:ring-orange-100 transition-all" placeholder="UP/1234/2020" value={signupForm.bar} onChange={e => setSignupForm(p => ({ ...p, bar: e.target.value }))} />
                    </div>
                    <div>
                      <label className="text-slate-500 text-xs font-semibold mb-1.5 block">Password</label>
                      <input type="password" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-800 placeholder-slate-300 text-sm focus:outline-none focus:border-orange-400 focus:ring-3 focus:ring-orange-100 transition-all" placeholder="••••••••••" value={signupForm.password} onChange={e => setSignupForm(p => ({ ...p, password: e.target.value }))} />
                    </div>
                    <button
                      onClick={doSignup}
                      className="w-full text-white py-3.5 rounded-2xl font-bold text-sm transition-all mt-2 active:scale-[0.98] hover:shadow-xl"
                      style={{ background: 'linear-gradient(135deg, #c2410c 0%, #f97316 100%)', boxShadow: '0 8px 28px rgba(234,88,12,0.38)' }}
                    >
                      Sign up
                    </button>
                    <p className="text-center text-slate-400 text-sm pt-1">
                      Already have an account?{' '}
                      <button onClick={() => setAuthTab('login')} className="text-orange-600 font-bold hover:text-orange-800">Sign in</button>
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // DASHBOARD SCREEN
  // ═══════════════════════════════════════════════════════════════════════════
  const activeCases = cases.filter(c => c.status === 'active' || c.status === 'hearing').length;
  const pendingCases = cases.filter(c => c.status === 'pending').length;
  const totalEvidence = evidence.length;

  const navItems = [
    { id: 'overview', icon: Hash, label: 'Overview' },
    { id: 'my-cases', icon: Briefcase, label: 'My Cases' },
    { id: 'evidence', icon: FolderOpen, label: 'Evidence Vault' },
    { id: 'ai-assistant', icon: Brain, label: 'AI Assistant' },
  ];

  return (
    <div className="fixed inset-0 z-[9999] flex overflow-hidden" style={{ background: '#fafaf9', fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── Sidebar ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -264 }}
            animate={{ x: 0 }}
            exit={{ x: -264 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="w-64 flex flex-col fixed h-full z-40"
            style={{
              background: 'linear-gradient(180deg, #18181b 0%, #1c1917 50%, #111827 100%)',
              boxShadow: '4px 0 32px rgba(0,0,0,0.4)'
            }}
          >
            {/* Logo */}
            <div className="px-5 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #ea580c, #f97316)', boxShadow: '0 4px 16px rgba(234,88,12,0.5)' }}>
                  <Scale className="h-5 w-5 text-white" />
                </div>
                <div>
                  <span className="font-bold text-white text-[15px] tracking-tight">PocketLawyer</span>
                  <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 600 }}>Pro Dashboard</p>
                </div>
              </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-5 space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest px-3 mb-4" style={{ color: 'rgba(253,186,116,0.45)' }}>Menu</p>
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setDashTab(item.id as DashTab)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                    dashTab === item.id ? 'text-white' : 'hover:text-white'
                  }`}
                  style={dashTab === item.id ? {
                    background: 'linear-gradient(135deg, #ea580c, #f97316)',
                    color: 'white',
                    boxShadow: '0 6px 20px rgba(234,88,12,0.45)'
                  } : { color: 'rgba(253,186,116,0.65)' }}
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  {item.label}
                </button>
              ))}
            </nav>

            {/* User info */}
            <div className="px-4 py-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
              <div className="flex items-center gap-3 p-3 rounded-2xl mb-2" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #ea580c, #f97316)' }}>
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-white text-xs font-bold truncate">{lawyer.name}</p>
                  <p className="text-xs truncate" style={{ color: 'rgba(253,186,116,0.55)' }}>{lawyer.email || 'Verified Advocate'}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 text-xs py-2 px-3 rounded-xl transition-all"
                style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 600 }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#f87171'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.1)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.75)'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
              >
                <LogOut className="h-3.5 w-3.5" /> Sign Out
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Main ── */}
      <div className={`flex-1 transition-all duration-300 overflow-y-auto ${sidebarOpen ? "md:ml-64" : "ml-0"} min-w-0`}>

        {/* Topbar */}
        <div className="bg-white border-b border-slate-100 px-5 py-4 flex items-center justify-between sticky top-0 z-30"
          style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(p => !p)}
              className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
              <Menu className="h-5 w-5 text-slate-500" />
            </button>
            <div>
              <h1 className="font-bold text-slate-800 text-[15px]">
                {dashTab === 'overview' && 'Dashboard Overview'}
                {dashTab === 'my-cases' && 'My Cases'}
                {dashTab === 'evidence' && 'Evidence Vault'}
                {dashTab === 'ai-assistant' && 'AI Legal Assistant'}
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">Welcome back, {lawyer.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl border border-orange-200 bg-orange-50">
              <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse flex-shrink-0" />
              <span className="text-xs text-orange-700 font-bold">AI Active</span>
            </div>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #ea580c, #f97316)' }}>
              <User className="h-4 w-4 text-white" />
            </div>
          </div>
        </div>

        <div className="p-4 md:p-6">
          <AnimatePresence mode="wait">

            {/* ════ OVERVIEW ════ */}
            {dashTab === 'overview' && (
              <motion.div key="overview" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">

                {/* Stat cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Cases', value: cases.length, icon: Briefcase, gradient: 'linear-gradient(135deg, #fff7ed, #fed7aa)', iconColor: '#ea580c', accent: '#fff7ed' },
                    { label: 'Active / Hearing', value: activeCases, icon: CheckCircle, gradient: 'linear-gradient(135deg, #d1fae5, #a7f3d0)', iconColor: '#059669', accent: '#d1fae5' },
                    { label: 'Pending', value: pendingCases, icon: Clock, gradient: 'linear-gradient(135deg, #fef3c7, #fde68a)', iconColor: '#d97706', accent: '#fef3c7' },
                    { label: 'Evidence Files', value: totalEvidence, icon: Shield, gradient: 'linear-gradient(135deg, #fee2e2, #fecaca)', iconColor: '#dc2626', accent: '#fee2e2' },
                  ].map((s, idx) => (
                    <motion.div
                      key={s.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.07 }}
                      className="bg-white rounded-2xl p-5 hover:shadow-md transition-all cursor-default"
                      style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: `1px solid ${s.accent}` }}
                    >
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                        style={{ background: s.gradient, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                        <s.icon className="h-5 w-5" style={{ color: s.iconColor }} />
                      </div>
                      <p className="text-2xl font-bold text-slate-800">{String(s.value).padStart(2, '0')}</p>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">{s.label}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Grid: recent cases + upcoming hearings */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {/* Recent cases */}
                  <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
                    <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
                      <h2 className="font-bold text-slate-700 text-sm">Recent Cases</h2>
                      <button onClick={() => setDashTab('my-cases')} className="text-xs text-orange-600 font-bold hover:text-orange-800 flex items-center gap-1">
                        View all <ChevronRight className="h-3 w-3" />
                      </button>
                    </div>
                    <div className="divide-y divide-slate-50">
                      {cases.slice(0, 4).map(c => (
                        <div key={c.id}
                          className="px-5 py-3.5 flex items-center gap-3 hover:bg-slate-50 transition-colors cursor-pointer"
                          onClick={() => { setSelectedCase(c); setDashTab('my-cases'); }}
                        >
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${priorityDot[c.priority]}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-700 truncate">{c.title}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{c.client} · {c.court}</p>
                          </div>
                          <span className={`text-xs px-2.5 py-1 rounded-full font-bold flex-shrink-0 flex items-center gap-1.5 ${statusColor[c.status]}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusDot[c.status]}`} />
                            {c.status}
                          </span>
                        </div>
                      ))}
                      {cases.length === 0 && <div className="px-5 py-8 text-center text-slate-400 text-sm">No cases yet</div>}
                    </div>
                  </div>

                  {/* Upcoming hearings */}
                  <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
                    <div className="px-5 py-4 border-b border-slate-50">
                      <h2 className="font-bold text-slate-700 text-sm">Upcoming Hearings</h2>
                    </div>
                    <div className="p-4 space-y-3">
                      {cases.filter(c => c.nextHearing).map(c => (
                        <div key={c.id} className="flex items-center gap-4 p-4 rounded-2xl border"
                          style={{ background: 'linear-gradient(135deg, #fff7ed, #ffedd5)', borderColor: '#fed7aa' }}>
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
                            style={{ background: 'linear-gradient(135deg, #ea580c, #f97316)', boxShadow: '0 4px 12px rgba(234,88,12,0.3)' }}>
                            <Clock className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-700 truncate">{c.title}</p>
                            <p className="text-xs text-orange-600 font-semibold mt-0.5">{c.nextHearing} · {c.court}</p>
                          </div>
                        </div>
                      ))}
                      {cases.filter(c => c.nextHearing).length === 0 && (
                        <p className="text-center text-slate-400 text-sm py-6">No upcoming hearings</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick AI */}
                <div className="rounded-2xl p-6 text-white relative overflow-hidden"
                  style={{ background: 'linear-gradient(135deg, #7c2d12 0%, #c2410c 50%, #ea580c 100%)', boxShadow: '0 12px 40px rgba(194,65,12,0.35)' }}>
                  <div className="absolute -right-12 -top-12 w-56 h-56 rounded-full pointer-events-none"
                    style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)' }} />
                  <div className="flex items-center gap-3 mb-5 relative z-10">
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
                      style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.18)' }}>
                      <Brain className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="font-bold text-[15px]">Quick AI Query</h2>
                      <p className="text-[12px]" style={{ color: 'rgba(148,175,255,0.7)' }}>Ask anything about your cases</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 relative z-10">
                    {AI_SUGGESTIONS.map(s => (
                      <button key={s} onClick={() => setDashTab('ai-assistant')}
                        className="text-left text-xs px-4 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
                        style={{ background: 'rgba(255,255,255,0.09)', border: '1px solid rgba(255,255,255,0.13)', backdropFilter: 'blur(4px)' }}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ════ MY CASES ════ */}
            {dashTab === 'my-cases' && (
              <motion.div key="cases" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">

                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-500 font-medium">{cases.length} cases registered</p>
                  <button
                    onClick={() => setShowNewCase(true)}
                    className="flex items-center gap-2 text-white px-5 py-2.5 rounded-2xl text-sm font-bold transition-all active:scale-[0.97]"
                    style={{ background: 'linear-gradient(135deg, #ea580c, #f97316)', boxShadow: '0 6px 20px rgba(234,88,12,0.35)' }}
                  >
                    <Plus className="h-4 w-4" /> New Case
                  </button>
                </div>

                {/* New case modal */}
                <AnimatePresence>
                  {showNewCase && (
                    <motion.div
                      initial={{ opacity: 0, y: -12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      className="bg-white rounded-2xl p-6 border border-orange-100"
                      style={{ boxShadow: '0 8px 32px rgba(234,88,12,0.12)' }}
                    >
                      <h3 className="font-bold text-slate-700 text-sm mb-4">Register New Case</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input className="border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 bg-slate-50 text-slate-800 placeholder-slate-400" placeholder="Case Title *" value={nc.title} onChange={e => setNc(p => ({ ...p, title: e.target.value }))} />
                        <input className="border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 bg-slate-50 text-slate-800 placeholder-slate-400" placeholder="Client Name" value={nc.client} onChange={e => setNc(p => ({ ...p, client: e.target.value }))} />
                        <input className="border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 bg-slate-50 text-slate-800 placeholder-slate-400" placeholder="Case Type (Civil/Criminal...)" value={nc.type} onChange={e => setNc(p => ({ ...p, type: e.target.value }))} />
                        <input className="border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 bg-slate-50 text-slate-800 placeholder-slate-400" placeholder="Court Name" value={nc.court} onChange={e => setNc(p => ({ ...p, court: e.target.value }))} />
                      </div>
                      <div className="flex gap-3 mt-4">
                        <button onClick={addCase}
                          className="text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all"
                          style={{ background: 'linear-gradient(135deg, #ea580c, #f97316)' }}>
                          Add Case
                        </button>
                        <button onClick={() => setShowNewCase(false)} className="text-slate-500 px-6 py-2.5 rounded-xl text-sm hover:bg-slate-100 transition-all font-medium">Cancel</button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Case list */}
                <div className="space-y-3">
                  {cases.map((c, idx) => (
                    <motion.div
                      key={c.id}
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      className={`bg-white rounded-2xl p-5 cursor-pointer transition-all ${selectedCase?.id === c.id ? 'ring-2 ring-orange-300' : ''}`}
                      style={{
                        boxShadow: selectedCase?.id === c.id ? '0 8px 28px rgba(234,88,12,0.14)' : '0 2px 12px rgba(0,0,0,0.06)',
                        border: selectedCase?.id === c.id ? '1px solid #93c5fd' : '1px solid #f1f5f9'
                      }}
                      onClick={() => setSelectedCase(selectedCase?.id === c.id ? null : c)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <span className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${priorityDot[c.priority]}`} />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="text-xs text-slate-400 font-mono bg-slate-100 px-2 py-0.5 rounded-lg">{c.id}</span>
                              <h3 className="font-bold text-slate-800 text-sm">{c.title}</h3>
                            </div>
                            <p className="text-xs text-slate-400">{c.client} · {c.type} · {c.court}</p>
                            {c.nextHearing && (
                              <p className="text-xs text-orange-600 font-semibold mt-1.5 flex items-center gap-1">
                                <Clock className="h-3 w-3" /> Next Hearing: {c.nextHearing}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`text-xs px-3 py-1.5 rounded-full font-bold flex items-center gap-1.5 ${statusColor[c.status]}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusDot[c.status]}`} />
                            {c.status}
                          </span>
                          <button
                            onClick={e => { e.stopPropagation(); setDashTab('ai-assistant'); }}
                            className="p-2 rounded-xl hover:bg-orange-50 text-slate-400 hover:text-orange-600 transition-colors"
                            title="Ask AI"
                          >
                            <Brain className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <AnimatePresence>
                        {selectedCase?.id === c.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 pt-4 border-t border-slate-100 overflow-hidden"
                          >
                            <p className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wide">Evidence on file</p>
                            {evidence.filter(e => e.caseId === c.id).length > 0 ? (
                              <div className="space-y-2">
                                {evidence.filter(e => e.caseId === c.id).map(ev => (
                                  <div key={ev.id} className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-2.5 border border-slate-100">
                                    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                                      style={{ background: 'linear-gradient(135deg, #fff7ed, #fed7aa)' }}>
                                      <FileText className="h-4 w-4 text-orange-600" />
                                    </div>
                                    <span className="text-xs text-slate-700 flex-1 truncate font-semibold">{ev.name}</span>
                                    <span className="text-xs bg-orange-100 text-orange-600 px-2.5 py-0.5 rounded-full font-bold">{ev.tag}</span>
                                    <span className="text-xs text-slate-400 font-medium">{ev.size}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-slate-400">No evidence uploaded yet. <button onClick={() => setDashTab('evidence')} className="text-orange-600 font-bold hover:underline">Upload now</button></p>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                  {cases.length === 0 && (
                    <div className="bg-white rounded-2xl p-12 text-center" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'linear-gradient(135deg, #fff7ed, #fed7aa)' }}>
                        <Briefcase className="h-8 w-8 text-orange-500" />
                      </div>
                      <p className="text-slate-500 font-semibold">No cases yet</p>
                      <p className="text-slate-400 text-sm mt-1">Click "New Case" to get started</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* ════ EVIDENCE ════ */}
            {dashTab === 'evidence' && (
              <motion.div key="evidence" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">

                {/* Upload box */}
                <div className="bg-white rounded-2xl p-6" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
                  <div className="border-2 border-dashed border-orange-200 rounded-2xl p-8 text-center transition-all hover:border-orange-400"
                    style={{ background: 'linear-gradient(135deg, #fffbf7, #fff7ed)' }}>
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                      style={{ background: 'linear-gradient(135deg, #fff7ed, #fed7aa)', boxShadow: '0 4px 16px rgba(59,130,246,0.2)' }}>
                      <Upload className="h-6 w-6 text-orange-600" />
                    </div>
                    <p className="font-bold text-slate-700 text-base mb-1">Upload Evidence</p>
                    <p className="text-xs text-slate-400 mb-5">PDF, Images, Word docs — up to 25MB per file</p>

                    {/* Case selector */}
                    <div className="max-w-xs mx-auto mb-4">
                      <select
                        value={selectedCase?.id || ""}
                        onChange={(e) => {
                          const caseObj = cases.find(c => c.id === e.target.value);
                          setSelectedCase(caseObj || null);
                        }}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 shadow-sm"
                      >
                        <option value="">— Select Case —</option>
                        {cases.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                      </select>
                    </div>

                    {/* Filter chips */}
                    <div className="flex gap-2 justify-center mb-5 flex-wrap">
                      {["all", "image", "video", "audio"].map(type => (
                        <button
                          key={type}
                          onClick={() => setFilterType(type)}
                          className="px-4 py-1.5 text-xs rounded-full font-bold transition-all border"
                          style={filterType === type ? {
                            background: 'linear-gradient(135deg, #ea580c, #f97316)',
                            color: 'white',
                            border: 'transparent',
                            boxShadow: '0 4px 12px rgba(234,88,12,0.3)'
                          } : { background: 'white', color: '#64748b', borderColor: '#e2e8f0' }}
                        >
                          {type}
                        </button>
                      ))}
                    </div>

                    {/* Progress */}
                    {uploadProgress !== null && (
                      <div className="max-w-xs mx-auto mb-4">
                        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                          <motion.div
                            className="h-2 rounded-full"
                            style={{ background: 'linear-gradient(90deg, #ea580c, #f97316)' }}
                            initial={{ width: 0 }}
                            animate={{ width: `${uploadProgress}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                        <p className="text-xs mt-2 text-slate-500 font-semibold">Uploading: {uploadProgress}%</p>
                      </div>
                    )}

                    <label className="cursor-pointer inline-flex items-center gap-2 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all active:scale-[0.97]"
                      style={{ background: 'linear-gradient(135deg, #ea580c, #f97316)', boxShadow: '0 8px 20px rgba(234,88,12,0.35)' }}>
                      <Upload className="h-4 w-4" />
                      Choose Files
                      <input type="file" multiple className="hidden"
                        onChange={(e) => {
                          const files = e.target.files;
                          if (!files) return;
                          if (!selectedCase) { alert("Please select a case first"); return; }
                          (async () => {
                            for (const file of Array.from(files)) {
                              await saveEvidence(selectedCase.id, file);
                            }
                          })();
                        }}
                      />
                    </label>
                  </div>
                </div>

                {/* Evidence list grouped by case */}
                {cases.map(c => {
                  const cEv = evidence.filter(e => {
                    if (e.caseId !== c.id) return false;
                    if (filterType === "all") return true;
                    return e.type.toLowerCase().includes(filterType);
                  });
                  if (cEv.length === 0) return null;
                  return (
                    <div key={c.id} className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
                      <div className="px-5 py-4 border-b border-slate-50 flex items-center gap-3"
                        style={{ background: 'linear-gradient(90deg, #fffbf7, white)' }}>
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #fff7ed, #fed7aa)' }}>
                          <Briefcase className="h-4 w-4 text-orange-600" />
                        </div>
                        <span className="font-bold text-slate-700 text-sm">{c.title}</span>
                        <span className="text-xs text-slate-400 font-mono">({c.id})</span>
                        <span className="ml-auto text-xs bg-orange-50 text-orange-600 px-2.5 py-1 rounded-full font-bold">{cEv.length} file{cEv.length > 1 ? 's' : ''}</span>
                      </div>
                      <div className="divide-y divide-slate-50">
                        {cEv.map(ev => (
                          <div key={ev.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #fff7ed, #fed7aa)' }}>
                              <FileText className="h-4 w-4 text-orange-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-slate-700 truncate">{ev.name}</p>
                              <p className="text-xs text-slate-400 mt-0.5">{ev.size} · Uploaded {ev.uploaded}</p>
                              {ev.type.toLowerCase().includes("image") && ev.url && (
                                <img src={ev.url} onClick={() => setPreview({ url: ev.url!, type: ev.type })}
                                  className="mt-2 w-20 h-20 object-cover rounded-xl cursor-pointer hover:scale-105 transition-transform shadow-sm" />
                              )}
                              {preview && (
                                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm" onClick={() => setPreview(null)}>
                                  <div className="bg-white rounded-2xl p-4 max-w-3xl w-full relative mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                                    <button onClick={() => setPreview(null)} className="absolute top-3 right-3 w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center text-slate-600 transition-colors">
                                      <X className="h-4 w-4" />
                                    </button>
                                    {preview.type.includes("image") && <img src={preview.url} className="w-full max-h-[80vh] object-contain rounded-xl" />}
                                    {preview.type.includes("pdf") && <iframe src={preview.url} className="w-full h-[80vh] rounded-xl" />}
                                  </div>
                                </div>
                              )}
                            </div>
                            <span className="text-xs bg-orange-50 text-orange-600 px-2.5 py-1 rounded-full font-bold">{ev.tag}</span>
                            <div className="flex items-center gap-2">
                              <button onClick={() => deleteEvidence(ev)}
                                className="text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-xl font-bold hover:bg-red-100 transition-colors">
                                Delete
                              </button>
                              <a href={ev.url} target="_blank" download
                                className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl font-bold hover:bg-emerald-100 transition-colors">
                                Download
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            )}

            {dashTab === "ai-assistant" && (
              <AiAssistant cases={cases as any} evidence={evidence as any} selectedCase={selectedCase as any} />
            )}

          </AnimatePresence>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { font-family: 'Inter', system-ui, sans-serif; -webkit-font-smoothing: antialiased; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 100px; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        @media (max-width: 640px) {
          .grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>
    </div>
  );
};