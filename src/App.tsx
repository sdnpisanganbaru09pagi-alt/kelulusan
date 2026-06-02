/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, type RefObject } from 'react';
import { 
  GraduationCap, 
  Search, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  ExternalLink, 
  RotateCcw,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Calendar,
  Building,
  Copy,
  Check,
  Award,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Student, QueryState } from './types';
import { fetchStudents } from './utils';

const logoSrc = '/logo.png';

// Full-screen canvas confetti cannon
function ConfettiEffect({ originRef }: { originRef?: RefObject<HTMLElement | null> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cssWidth = window.innerWidth;
    const cssHeight = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.floor(cssWidth * dpr);
    canvas.height = Math.floor(cssHeight * dpr);
    canvas.style.width = `${cssWidth}px`;
    canvas.style.height = `${cssHeight}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const COLORS = [
      '#3B82F6', '#60A5FA',
      '#10B981', '#34D399',
      '#F59E0B', '#FCD34D',
      '#EF4444', '#F87171',
      '#8B5CF6', '#C084FC',
      '#EC4899', '#F472B6',
      '#06B6D4', '#67E8F9',
    ];

    type Piece = {
      x: number; y: number;
      vx: number; vy: number;
      w: number; h: number;
      color: string;
      rotation: number;
      rotSpeed: number;
      opacity: number;
      shape: number;
      wobble: number; wobbleSpeed: number;
    };

    const pieces: Piece[] = [];
    const total = 180;
    const targetRect = originRef?.current?.getBoundingClientRect();
    const originY = targetRect
      ? Math.min(Math.max(targetRect.top + Math.min(targetRect.height * 0.32, 96), 96), cssHeight - 80)
      : cssHeight * 0.35;
    const leftOriginX = targetRect
      ? Math.min(Math.max(targetRect.left + 24, 24), cssWidth - 24)
      : cssWidth * 0.2;
    const rightOriginX = targetRect
      ? Math.min(Math.max(targetRect.right - 24, 24), cssWidth - 24)
      : cssWidth * 0.8;

    for (let i = 0; i < total; i++) {
      const side = i < total / 2 ? 0 : 1;
      const angle = side === 0
        ? (Math.random() * 55 + 38) * (Math.PI / 180)
        : (Math.random() * 55 + 87) * (Math.PI / 180);
      const speed = Math.random() * 13 + 9;
      pieces.push({
        x: side === 0 ? leftOriginX : rightOriginX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: -Math.sin(angle) * speed,
        w: Math.random() * 10 + 5,
        h: Math.random() * 5 + 3,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.3,
        opacity: 1,
        shape: Math.floor(Math.random() * 3),
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: Math.random() * 0.1 + 0.05,
      });
    }

    let raf: number;
    let frame = 0;

    const draw = () => {
      ctx.clearRect(0, 0, cssWidth, cssHeight);
      frame++;
      let allFaded = true;

      for (const p of pieces) {
        p.vy += 0.45;
        p.vx *= 0.99;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotSpeed;
        p.wobble += p.wobbleSpeed;
        p.opacity = Math.max(0, p.opacity - 0.007);
        if (p.opacity > 0) allFaded = false;

        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;

        if (p.shape === 1) {
          ctx.beginPath();
          ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.shape === 2) {
          ctx.scale(Math.sin(p.wobble), 1);
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w * 2, p.h);
        } else {
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        }
        ctx.restore();
      }

      if (!allFaded && frame < 300) {
        raf = requestAnimationFrame(draw);
      } else {
        ctx.clearRect(0, 0, cssWidth, cssHeight);
      }
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [originRef]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ width: '100vw', height: '100vh' }}
    />
  );
}

// Animated Gradient Background Orbs for Hero
function GradientOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute -top-20 -left-20 w-72 h-72 rounded-full opacity-30"
        style={{ background: 'radial-gradient(circle, #60A5FA, #3B82F6, transparent)' }}
        animate={{ x: [0, 20, 0], y: [0, -15, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full opacity-25"
        style={{ background: 'radial-gradient(circle, #818CF8, #6366F1, transparent)' }}
        animate={{ x: [0, -18, 0], y: [0, 12, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full opacity-15"
        style={{ background: 'radial-gradient(circle, #38BDF8, #0EA5E9, transparent)' }}
        animate={{ scale: [1, 1.12, 1], rotate: [0, 45, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />
    </div>
  );
}

export default function App() {
  const [students, setStudents] = useState<Student[]>([]);
  const [nisn, setNisn] = useState('');
  const [queryState, setQueryState] = useState<QueryState>('idle');
  const [result, setResult] = useState<Student | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [logoError, setLogoError] = useState(false);
  const [pdfPendingNotice, setPdfPendingNotice] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  // Refs for smooth scroll and focus to result
  const resultRef = useRef<HTMLDivElement>(null);
  const successCardRef = useRef<HTMLDivElement>(null);
  const studentInfoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchStudents();
        setStudents(data);
        setIsDataLoaded(true);
      } catch (err: any) {
        console.error("Gagal memuat database kelulusan:", err);
        setLoadError(true);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    let interval: any;
    if (queryState === 'loading') {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev < 2 ? prev + 1 : prev));
      }, 500);
    }
    return () => clearInterval(interval);
  }, [queryState]);

  // Smooth scroll to result, then focus the student's name section on success.
  useEffect(() => {
    const shouldRevealResult = queryState === 'success' || queryState === 'not_found' || queryState === 'error';
    setShowConfetti(false);

    if (!shouldRevealResult || !resultRef.current) return;

    let confettiTimer: number | undefined;
    const scrollTimer = window.setTimeout(() => {
      const targetElement = queryState === 'success' ? studentInfoRef.current : resultRef.current;
      targetElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });

      if (queryState === 'success' && studentInfoRef.current) {
        confettiTimer = window.setTimeout(() => {
          studentInfoRef.current?.focus({ preventScroll: true });
          setShowConfetti(true);
        }, 650);
      }
    }, 350);

    return () => {
      window.clearTimeout(scrollTimer);
      if (confettiTimer) window.clearTimeout(confettiTimer);
    };
  }, [queryState, result?.nisn]);

  const getLoadingText = () => {
    switch (loadingStep) {
      case 0: return 'Menghubungkan ke database kelulusan...';
      case 1: return 'Memvalidasi Nomor Induk Siswa Nasional (NISN)...';
      case 2: return 'Sinkronisasi Surat Keputusan Kelulusan...';
      default: return 'Sedang mencari data...';
    }
  };

  const handleCheck = async () => {
    const trimmedNisn = nisn.trim();
    if (!trimmedNisn) {
      setErrorMsg('⚠️ Silakan masukkan NISN terlebih dahulu.');
      setQueryState('error');
      setResult(null);
      return;
    }

    if (!/^\d+$/.test(trimmedNisn)) {
      setErrorMsg('⚠️ NISN harus berupa angka penuh (10 digit).');
      setQueryState('error');
      setResult(null);
      return;
    }

    setQueryState('loading');
    setErrorMsg('');
    setResult(null);

    setTimeout(() => {
      if (students.length === 0) {
        fetchStudents().then((liveData) => {
          setStudents(liveData);
          setLoadError(false);
          const found = liveData.find(s => s.nisn === trimmedNisn);
          finalizeSearchResult(found);
        }).catch((err) => {
          console.error("Gagal melakukan fetch ulang:", err);
          setQueryState('error');
          setErrorMsg('⚠️ Tidak dapat terhubung ke server database Google Sheets. Periksa koneksi internet Anda atau coba kembali beberapa saat lagi.');
        });
      } else {
        const found = students.find(s => s.nisn === trimmedNisn);
        finalizeSearchResult(found);
      }
    }, 1200);
  };

  const finalizeSearchResult = (found: Student | undefined) => {
    if (found) {
      setResult(found);
      setPdfPendingNotice(false);
      setQueryState('success');
    } else {
      setQueryState('not_found');
    }
  };

  const isPdfLinkAvailable = (pdf: string) => {
    const normalizedPdf = pdf.trim().toLowerCase();
    return Boolean(normalizedPdf && normalizedPdf !== 'null');
  };

  const showPendingPdfNotice = () => {
    setPdfPendingNotice(true);
  };

  const copyToClipboard = () => {
    if (!result) return;
    const shareText = `Status Kelulusan SDN Pisangan Baru 09 Pagi\nNama: ${result.nama}\nNISN: ${result.nisn}\nStatus: ${result.status}`;
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setNisn('');
    setQueryState('idle');
    setResult(null);
    setErrorMsg('');
    setPdfPendingNotice(false);
  };

  const faqs = [
    {
      q: "Bagaimana jika NISN saya tidak ditemukan?",
      a: "Pastikan nomor NISN yang dimasukkan tepat 10 digit dan hanya terdiri dari angka. Periksa kartu ujian atau rapor Anda. Jika masih tidak ditemukan, silakan hubungi Wali Kelas Kelas VI Anda."
    },
    {
      q: "Bagaimana cara mengunduh dan mencetak Surat Kelulusan?",
      a: "Setelah data Anda ditemukan dan dinyatakan LULUS, klik tombol '📄 Buka Surat Kelulusan (PDF)'. Anda akan diarahkan ke Google Drive berisi berkas PDF Surat Kelulusan Anda untuk diunduh dan dicetak."
    },
    {
      q: "Kapan Surat Kelulusan asli dan Ijazah fisik dapat diambil?",
      a: "Pengambilan dokumen fisik asli (Ijazah, SKHUN, dan SKL cetak resmi) dilayani langsung di loket tata usaha SDN Pisangan Baru 09 Pagi sesuai jadwal kloter kelas yang ditentukan sekolah."
    }
  ];

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div
      className="min-h-screen py-10 px-4 flex flex-col items-center justify-start font-sans"
      style={{ background: 'linear-gradient(135deg, #EFF6FF 0%, #F0F4FF 50%, #F5F3FF 100%)' }}
    >
      {/* Full-screen confetti on success */}
      {showConfetti && queryState === 'success' && result && <ConfettiEffect originRef={successCardRef} />}

      <div className="w-full max-w-xl flex flex-col gap-6">

        {/* ─── HERO CARD ─── */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative rounded-3xl overflow-hidden shadow-2xl shadow-blue-200/60"
          style={{
            background: 'linear-gradient(135deg, #1D4ED8 0%, #4338CA 40%, #7C3AED 75%, #2563EB 100%)',
            backgroundSize: '200% 200%',
          }}
        >
          {/* Animated gradient overlay */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(135deg, rgba(59,130,246,0.5) 0%, rgba(99,102,241,0.3) 50%, rgba(139,92,246,0.5) 100%)',
            }}
            animate={{
              background: [
                'linear-gradient(135deg, rgba(59,130,246,0.5) 0%, rgba(99,102,241,0.3) 50%, rgba(139,92,246,0.5) 100%)',
                'linear-gradient(135deg, rgba(139,92,246,0.4) 0%, rgba(59,130,246,0.4) 50%, rgba(99,102,241,0.5) 100%)',
                'linear-gradient(135deg, rgba(99,102,241,0.5) 0%, rgba(139,92,246,0.3) 50%, rgba(59,130,246,0.4) 100%)',
                'linear-gradient(135deg, rgba(59,130,246,0.5) 0%, rgba(99,102,241,0.3) 50%, rgba(139,92,246,0.5) 100%)',
              ]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />

          <GradientOrbs />

          {/* Mesh pattern overlay */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)`,
              backgroundSize: '28px 28px'
            }}
          />

          {/* Shining sweep animation */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.12) 50%, transparent 60%)',
            }}
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 3.5, repeat: Infinity, repeatDelay: 4, ease: 'easeInOut' }}
          />

          <div className="relative z-10 px-7 py-8 flex flex-col items-center text-center">
            {/* Logo */}
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-24 h-24 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-xl shadow-black/20 border border-white/30 mb-5 overflow-hidden"
            >
              {!logoError ? (
                <img
                  src={logoSrc}
                  alt="Logo SDN Pisangan Baru 09"
                  className="w-full h-full object-contain p-1.5"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <GraduationCap className="w-12 h-12 text-white" />
              )}
            </motion.div>

            <motion.div
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="flex items-center gap-1.5 mb-1"
            >
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span className="text-xs font-bold tracking-widest text-blue-200 uppercase">
                Pengumuman Resmi Kelulusan
              </span>
              <Sparkles className="w-4 h-4 text-yellow-300" />
            </motion.div>

            <motion.h1
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.35 }}
              className="text-2xl md:text-3xl font-extrabold tracking-tight text-white uppercase drop-shadow-sm"
            >
              SDN Pisangan Baru 09 Pagi
            </motion.h1>

            <motion.div
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.45 }}
              className="flex items-center gap-4 mt-4"
            >
              <div className="flex items-center gap-1.5 bg-white/15 px-3 py-1.5 rounded-full border border-white/20">
                <Building className="w-3.5 h-3.5 text-blue-200" />
                <span className="text-xs font-semibold text-blue-100">DKI Jakarta</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/15 px-3 py-1.5 rounded-full border border-white/20">
                <Calendar className="w-3.5 h-3.5 text-blue-200" />
                <span className="text-xs font-semibold text-blue-100">T.A. 2025/2026</span>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Database loading bar */}
        {!isDataLoaded && !loadError && (
          <div className="h-1 bg-blue-100 overflow-hidden rounded-full w-full -mt-2">
            <motion.div
              className="h-full bg-blue-600 rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: ['0%', '70%', '85%'] }}
              transition={{ duration: 2.5, ease: 'easeOut' }}
            />
          </div>
        )}

        {/* ─── CHECKER CARD ─── */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="bg-white rounded-3xl shadow-xl shadow-slate-200/70 border border-slate-100 overflow-hidden"
        >
          {/* Gradient strip */}
          <div className="h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />

          <div className="p-6 md:p-8">
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 bg-blue-50 rounded-xl">
                <Search className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">Cek Status Kelulusan</h2>
                <p className="text-xs text-slate-500">Masukkan NISN 10 digit resmi Anda</p>
              </div>
            </div>

            {/* Input */}
            <div className="mt-6 flex flex-col gap-2">
              <label htmlFor="nisn-input" className="text-xs font-bold text-slate-600 tracking-wider uppercase block">
                Nomor Induk Siswa Nasional (NISN)
              </label>
              <div className="relative">
                <input
                  id="nisn-input"
                  type="text"
                  inputMode="numeric"
                  placeholder="Masukkan 10 digit NISN Anda"
                  maxLength={10}
                  value={nisn}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setNisn(val);
                    if (queryState === 'error' || queryState === 'not_found') {
                      setQueryState('idle');
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCheck();
                  }}
                  disabled={queryState === 'loading'}
                  className="w-full text-slate-900 bg-slate-50 placeholder-slate-300 border-2 border-slate-200 focus:border-blue-500 focus:bg-white rounded-2xl px-4 py-4 pl-12 text-lg font-mono font-semibold transition duration-200 outline-none"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">
                  <Search className="w-5 h-5" />
                </div>
                {nisn.length > 0 && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <span className={`text-xs font-bold tabular-nums ${nisn.length === 10 ? 'text-emerald-500' : 'text-slate-400'}`}>
                      {nisn.length}/10
                    </span>
                  </div>
                )}
              </div>
              <p className="text-[11px] text-slate-400 pl-1 font-medium">
                * NISN terdiri dari 10 digit angka unik kemendikbud
              </p>
            </div>

            {/* Action Buttons */}
            <div className="mt-5 flex gap-3">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCheck}
                disabled={queryState === 'loading' || !nisn}
                className="flex-1 text-white rounded-2xl px-6 py-4 font-bold text-base transition-all disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-blue-200/60 flex items-center justify-center gap-2 cursor-pointer"
                style={{
                  background: queryState === 'loading'
                    ? 'linear-gradient(135deg, #3B82F6, #6366F1)'
                    : 'linear-gradient(135deg, #2563EB, #4F46E5)'
                }}
              >
                {queryState === 'loading' ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Memverifikasi...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    <span>Cek Kelulusan</span>
                  </>
                )}
              </motion.button>

              {(queryState === 'success' || queryState === 'not_found' || queryState === 'error') && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleReset}
                  aria-label="Cari Kembali"
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl p-4 transition-all border border-slate-200 flex items-center justify-center cursor-pointer"
                >
                  <RotateCcw className="w-5 h-5" />
                </motion.button>
              )}
            </div>

            {/* Loading status message */}
            <AnimatePresence>
              {queryState === 'loading' && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-4 text-center py-3 px-4 bg-blue-50 text-blue-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 border border-blue-100"
                >
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping flex-shrink-0" />
                  <span>{getLoadingText()}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ─── RESULTS ─── */}
            <AnimatePresence mode="wait">
              {queryState === 'success' && result && (
                <div ref={resultRef}>
                <motion.div
                  key="success-result"
                  initial={{ opacity: 0, y: 20, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.97 }}
                  transition={{ duration: 0.45, ease: 'easeOut' }}
                  className="mt-6 relative overflow-hidden rounded-2xl"
                >
                  {/* Gradient border frame */}
                  <div
                    ref={successCardRef}
                    className="p-0.5 rounded-2xl"
                    style={{ background: 'linear-gradient(135deg, #10B981, #059669, #34D399)' }}
                  >
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-[14px] p-6 relative overflow-hidden">

                      {/* Decorative background award */}
                      <div className="absolute right-2 top-2 opacity-[0.07] pointer-events-none">
                        <Award className="w-32 h-32 text-emerald-600" />
                      </div>

                      {/* Top badge */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 bg-emerald-500 text-white text-[11px] font-black tracking-widest uppercase px-3 py-1.5 rounded-full shadow-md shadow-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          PENGUMUMAN KELULUSAN
                        </div>
                        <button
                          onClick={copyToClipboard}
                          title="Salin Status"
                          className="p-2 hover:bg-emerald-100 rounded-xl text-emerald-500 hover:text-emerald-700 transition"
                        >
                          {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>

                      {/* Student info */}
                      <div
                        ref={studentInfoRef}
                        tabIndex={-1}
                        className="space-y-1 relative z-10 -mx-2 rounded-2xl px-2 py-1 transition focus:outline-none focus:ring-4 focus:ring-emerald-300/70 focus:ring-offset-2 focus:ring-offset-emerald-50"
                      >
                        <p className="text-xs font-semibold text-emerald-700/70 tracking-wide uppercase">Nama Siswa</p>
                        <p className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
                          {result.nama}
                        </p>
                        <p className="text-sm font-mono font-semibold text-slate-500 mt-1">
                          NISN: <span className="text-slate-700">{result.nisn}</span>
                        </p>
                      </div>

                      {/* Status pill */}
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.3, type: 'spring', stiffness: 250 }}
                        className="mt-5 inline-flex items-center gap-2.5 font-black text-base uppercase px-5 py-2.5 rounded-2xl shadow-lg shadow-emerald-200/60 text-white"
                        style={{ background: 'linear-gradient(135deg, #059669, #10B981)' }}
                      >
                        🎓 {result.status}
                      </motion.div>

                      <p className="text-xs text-slate-600 font-medium mt-4 leading-relaxed">
                        Selamat atas hasil kerja kerasmu selama ini! Silakan buka Surat Keterangan Kelulusan resmi Anda secara daring melalui tautan aman di bawah ini.
                      </p>

                      {/* PDF Button */}
                      <div className="mt-5 pt-4 border-t border-emerald-200/60">
                        {isPdfLinkAvailable(result.pdf) ? (
                          <a
                            href={result.pdf}
                            target="_blank"
                            referrerPolicy="no-referrer"
                            rel="noopener noreferrer"
                            className="w-full text-white rounded-xl py-3.5 px-4 font-bold text-sm text-center transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-200/70 hover:opacity-90 active:scale-[0.98]"
                            style={{ background: 'linear-gradient(135deg, #059669, #10B981)' }}
                          >
                            <FileText className="w-4 h-4" />
                            <span>Buka Surat Kelulusan (PDF)</span>
                            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                          </a>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={showPendingPdfNotice}
                              className="w-full text-white rounded-xl py-3.5 px-4 font-bold text-sm text-center transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-200/70 hover:opacity-90 cursor-pointer"
                              style={{ background: 'linear-gradient(135deg, #059669, #10B981)' }}
                            >
                              <FileText className="w-4 h-4" />
                              <span>Buka Surat Kelulusan (PDF)</span>
                            </button>

                            <AnimatePresence>
                              {pdfPendingNotice && (
                                <motion.div
                                  initial={{ opacity: 0, y: -6 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0 }}
                                  className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold leading-relaxed text-amber-800 flex items-start gap-2"
                                  role="status"
                                >
                                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-500" />
                                  <span>Surat Keterangan Lulus sedang dalam proses pengesahan. Mohon dicek secara berkala.</span>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
                </div>
              )}

              {queryState === 'not_found' && (
                <div ref={resultRef}>
                <motion.div
                  key="not-found-result"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35 }}
                  className="mt-6 bg-red-50 border-2 border-red-200 rounded-2xl p-5 flex items-start gap-3"
                >
                  <div className="p-2.5 bg-red-100 rounded-xl text-red-500 flex-shrink-0">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-red-800">NISN Tidak Ditemukan</h3>
                    <p className="text-xs text-red-700/90 mt-1 leading-relaxed">
                      Nomor NISN:{' '}
                      <strong className="font-mono text-slate-800 font-bold bg-white px-1.5 py-0.5 rounded border border-red-200">
                        {nisn}
                      </strong>{' '}
                      tidak terdaftar dalam database kelulusan SDN Pisangan Baru 09 Pagi.
                    </p>
                    <p className="text-xs text-red-700/80 mt-2.5">
                      💡 <strong>Solusi:</strong> Periksa kembali digit NISN Anda, atau hubungi Wali Kelas VI untuk verifikasi lebih lanjut.
                    </p>
                  </div>
                </motion.div>
                </div>
              )}

              {queryState === 'error' && errorMsg && (
                <div ref={resultRef}>
                <motion.div
                  key="error-result"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35 }}
                  className="mt-6 bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3 text-amber-900"
                >
                  <div className="p-2 bg-amber-100 rounded-lg text-amber-500 self-start flex-shrink-0">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-amber-800">Pemberitahuan</h3>
                    <p className="text-xs text-amber-800/90 mt-1">{errorMsg}</p>
                  </div>
                </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* ─── FAQ ─── */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="bg-white rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/50 p-6 md:p-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 bg-blue-50 rounded-lg">
              <HelpCircle className="w-4.5 h-4.5 text-blue-600" />
            </div>
            <h3 className="text-base font-extrabold text-slate-800 tracking-tight">Pertanyaan yang Sering Diajukan</h3>
          </div>
          <div className="flex flex-col gap-2">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-slate-100 last:border-none pb-2 last:pb-0">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex justify-between items-center text-left py-2.5 text-sm font-bold text-slate-700 hover:text-blue-600 transition duration-150 cursor-pointer gap-3"
                >
                  <span>{faq.q}</span>
                  <span className="flex-shrink-0">
                    {openFaq === index
                      ? <ChevronUp className="w-4 h-4 text-slate-400" />
                      : <ChevronDown className="w-4 h-4 text-slate-400" />
                    }
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {openFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22 }}
                      className="overflow-hidden"
                    >
                      <p className="text-xs text-slate-500 mt-1 mb-2 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Footer */}
        <div className="text-center pt-1 pb-4">
          <p className="text-xs text-slate-400 font-medium">
            &copy; 2026 SDN Pisangan Baru 09 Pagi. All Rights Reserved.
          </p>
          <p className="text-[10px] text-slate-400/70 mt-1">
            Sistem Kelulusan Mandiri terintegrasi dengan Layanan Data Cloud Google Sheets.
          </p>
        </div>

      </div>
    </div>
  );
}
