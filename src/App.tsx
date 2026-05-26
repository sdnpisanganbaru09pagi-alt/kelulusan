/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
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
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Student, QueryState } from './types';
import { fetchStudents } from './utils';

// Simple Floating Confetti Particles Component (pure CSS and motion, no extra packages)
function ConfettiEffect() {
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; size: number; color: string; delay: number }[]>([]);

  useEffect(() => {
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#10B981'];
    const p = Array.from({ length: 45 }).map((_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 360,
      y: (Math.random() - 0.5) * 360 - 40,
      size: Math.random() * 8 + 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 0.4
    }));
    setParticles(p);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-sm"
          initial={{ x: 0, y: 0, opacity: 1, scale: 0, rotate: 0 }}
          animate={{
            x: p.x,
            y: p.y + 160,
            opacity: [1, 1, 0],
            scale: [0, 1.3, 0.4],
            rotate: Math.random() * 360 + 270
          }}
          transition={{
            duration: 2.5,
            ease: "easeOut",
            delay: p.delay
          }}
          style={{
            width: p.size,
            height: p.size,
            backgroundColor: p.color
          }}
        />
      ))}
    </div>
  );
}

export default function App() {
  // Application state
  const [students, setStudents] = useState<Student[]>([]);
  const [nisn, setNisn] = useState('');
  const [queryState, setQueryState] = useState<QueryState>('idle');
  const [result, setResult] = useState<Student | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [logoError, setLogoError] = useState(false);

  // Background dataset fetch state
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);

  // FAQ Accordion states
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Load database on mount
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

  // Cycle loading messages for high fidelity experience
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

  // Loading indicator helper texts
  const getLoadingText = () => {
    switch (loadingStep) {
      case 0: return 'Menghubungkan ke database kelulusan...';
      case 1: return 'Memvalidasi Nomor Induk Siswa Nasional (NISN)...';
      case 2: return 'Sinkronisasi Surat Keputusan Kelulusan...';
      default: return 'Sedang mencari data...';
    }
  };

  // Perform search
  const handleCheck = async () => {
    const trimmedNisn = nisn.trim();
    if (!trimmedNisn) {
      setErrorMsg('⚠️ Silakan masukkan NISN terlebih dahulu.');
      setQueryState('error');
      setResult(null);
      return;
    }

    // Must be numeric and logical
    if (!/^\d+$/.test(trimmedNisn)) {
      setErrorMsg('⚠️ NISN harus berupa angka penuh (10 digit).');
      setQueryState('error');
      setResult(null);
      return;
    }

    setQueryState('loading');
    setErrorMsg('');
    setResult(null);

    // Simulate official secure verification process (800ms delay)
    setTimeout(() => {
      // If there was a loading error initially, try one more time to fetch live
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
      setQueryState('success');
    } else {
      setQueryState('not_found');
    }
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
  };

  // Pre-configured official FAQs
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
    <div id="main-container" className="min-h-screen py-10 px-4 flex flex-col items-center justify-start font-sans bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "linear-gradient(rgba(248,250,252,0.86), rgba(248,250,252,0.9)), url(/assets/bg-sekolah.jpg)" }}>
      <div className="w-full max-w-xl flex flex-col gap-6">
        
        {/* School Header Banner */}
        <div id="school-header" className="text-center flex flex-col items-center">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-slate-300 border border-slate-200 mb-4 overflow-hidden"
          >
            {!logoError ? (
              <img
                src="/assets/logo-sdn.png"
                alt="Logo SDN Pisangan Baru 09"
                className="w-full h-full object-contain p-1"
                onError={() => setLogoError(true)}
              />
            ) : (
              <GraduationCap className="w-11 h-11 text-blue-600" />
            )}
          </motion.div>
          <motion.h1 
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 uppercase"
          >
            SDN Pisangan Baru 09 Pagi
          </motion.h1>
          <motion.p 
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="text-xs md:text-sm font-semibold tracking-wider text-blue-600 uppercase mt-1 flex items-center gap-1.5 justify-center"
          >
            <Building className="w-4 h-4 inline" /> DKI Jakarta
          </motion.p>
          <motion.p
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="text-xs text-slate-500 font-medium mt-1.5 flex items-center gap-1 justify-center bg-white px-3 py-1 rounded-full border border-slate-200/80 shadow-sm"
          >
            <Calendar className="w-3.5 h-3.5 text-blue-500" /> Tahun Ajaran 2025/2026
          </motion.p>
        </div>

        {/* Database Sync Status Indicator (Discreet top bar) */}
        {!isDataLoaded && !loadError && (
          <div className="h-1 bg-blue-100 overflow-hidden rounded-full w-full">
            <div className="h-full bg-blue-600 animate-pulse w-2/3"></div>
          </div>
        )}

        {/* Main Checker Form and Result Container */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          id="checker-card" 
          className="bg-white rounded-3xl shadow-xl shadow-slate-200/70 border border-slate-100 overflow-hidden relative"
        >
          {/* Header Card Gradient Strip */}
          <div className="h-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500"></div>

          <div className="p-6 md:p-8">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <span>📋 Cek Status Kelulusan</span>
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Masukkan Nomor Induk Siswa Nasional (NISN) resmi Anda di bawah ini.
            </p>

            {/* Input Panel */}
            <div className="mt-6 flex flex-col gap-2">
              <label htmlFor="nisn-input" className="text-xs font-bold text-slate-700 tracking-wider uppercase block">
                Nomor Induk Siswa Nasional (NISN)
              </label>
              <div className="relative">
                <input
                  id="nisn-input"
                  type="text"
                  placeholder="Contoh: 10 digit NISN Anda"
                  maxLength={10}
                  value={nisn}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, ''); // Numeric only
                    setNisn(val);
                    if (queryState === 'error' || queryState === 'not_found') {
                      setQueryState('idle');
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCheck();
                  }}
                  disabled={queryState === 'loading'}
                  className="w-full text-slate-900 bg-slate-50 placeholder-slate-400 border-2 border-slate-200 focus:border-blue-500 focus:bg-white rounded-2xl px-4 py-3.5 pl-11 text-lg font-mono font-medium transition duration-200 outline-none shadow-inner"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Search className="w-5 h-5" />
                </div>
              </div>
              <p className="text-[11px] text-slate-400 pl-1 font-medium">
                * NISN terdiri dari 10 digit angka unik kemendikbud.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="mt-5 flex gap-3">
              <button
                id="btn-cek"
                onClick={handleCheck}
                disabled={queryState === 'loading' || !nisn}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl px-6 py-4 font-semibold text-base transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-blue-200 flex items-center justify-center gap-2 cursor-pointer"
              >
                {queryState === 'loading' ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Memverifikasi...</span>
                  </>
                ) : (
                  <>
                    <span>Cek Kelulusan</span>
                  </>
                )}
              </button>

              {(queryState === 'success' || queryState === 'not_found' || queryState === 'error') && (
                <button
                  id="btn-reset"
                  onClick={handleReset}
                  aria-label="Cari Kembali"
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl p-4 transition-all active:scale-[0.98] border border-slate-200 flex items-center justify-center cursor-pointer"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Simulated Loading Status Message */}
            {queryState === 'loading' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 text-center py-2 px-4 bg-blue-50 text-blue-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 border border-blue-100"
              >
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
                <span>{getLoadingText()}</span>
              </motion.div>
            )}

            {/* Results Animation Segment */}
            <AnimatePresence mode="wait">
              {queryState === 'success' && result && (
                <motion.div
                  key="success-result"
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -15, scale: 0.95 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  className="mt-6 border-2 border-emerald-500 bg-emerald-50/50 rounded-2xl p-6 relative overflow-hidden"
                >
                  <ConfettiEffect />
                  
                  {/* Decorative Sparkle Graphic */}
                  <div className="absolute right-3 top-3 opacity-20 text-emerald-600 pointer-events-none">
                    <Award className="w-24 h-24" />
                  </div>

                  <div className="flex items-start gap-4 z-10 relative">
                    <div className="p-3 bg-emerald-500 rounded-xl text-white shadow-md shadow-emerald-200 self-start">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xs font-extrabold text-emerald-800 tracking-wider uppercase">PENGUMUMAN HASIL KELULUSAN</h3>
                      
                      {/* Name display */}
                      <p className="text-2xl font-black text-slate-900 mt-2 tracking-tight line-clamp-2">
                        {result.nama}
                      </p>
                      
                      {/* NISN tag */}
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-sm font-mono font-semibold text-slate-500">
                          NISN: {result.nisn}
                        </p>
                        <button
                          onClick={copyToClipboard}
                          title="Salin Status"
                          className="p-1 hover:bg-slate-200/60 rounded text-slate-400 hover:text-slate-600 transition"
                        >
                          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      {/* Lulus status badge */}
                      <div className="mt-4 inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm uppercase px-4 py-1.5 rounded-full shadow-md shadow-emerald-200 tracking-wider">
                        🎓 {result.status}
                      </div>

                      <p className="text-xs text-slate-600 font-medium mt-4 leading-relaxed">
                        Selamat atas hasil kerja kerasmu selama ini! Silakan buka Surat Keterangan Kelulusan resmi Anda secara daring melalui tautan aman di bawah ini.
                      </p>

                      {/* PDF Download Button */}
                      {result.pdf ? (
                        <div className="mt-5 pt-4 border-t border-emerald-200/50">
                          <a
                            id="pdf-download-btn"
                            href={result.pdf}
                            target="_blank"
                            referrerPolicy="no-referrer"
                            rel="noopener noreferrer"
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-3 px-4 font-bold text-sm text-center transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-200"
                          >
                            <FileText className="w-4 h-4" />
                            <span>Buka Surat Kelulusan (PDF)</span>
                            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                          </a>
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-400 italic mt-3">
                          * Berkas Surat Kelulusan digital tidak terlampir di database. Silakan laporkan ke panitia sekolah.
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {queryState === 'not_found' && (
                <motion.div
                  key="not-found-result"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="mt-6 bg-red-50 border-2 border-red-200 rounded-2xl p-5 flex items-start gap-3"
                >
                  <div className="p-2.5 bg-red-100 rounded-xl text-red-600">
                    <AlertCircle className="w-5.5 h-5.5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-red-800">NISN Tidak Ditemukan</h3>
                    <p className="text-xs text-red-700/90 mt-1 leading-relaxed">
                      Nomor NISN: <strong className="font-mono text-slate-800 font-bold bg-white px-1.5 py-0.5 rounded border border-red-200">{nisn}</strong> tidak terdaftar dalam database kelulusan SDN Pisangan Baru 09 Pagi.
                    </p>
                    <p className="text-xs text-red-700/80 mt-2.5">
                      💡 <strong>Solusi:</strong> Periksa kembali digit NISN Anda, atau silakan hubungi Wali Kelas VI untuk verifikasi lebih lanjut.
                    </p>
                  </div>
                </motion.div>
              )}

              {queryState === 'error' && errorMsg && (
                <motion.div
                  key="error-result"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="mt-6 bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3 text-amber-900"
                >
                  <div className="p-2 bg-amber-100 rounded-lg text-amber-600 self-start">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-amber-800">Pemberitahuan</h3>
                    <p className="text-xs text-amber-800/90 mt-1">
                      {errorMsg}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </motion.div>

        {/* Informational FAQ Accordion Module */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          id="faq-section"
          className="bg-white rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/50 p-6 md:p-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <HelpCircle className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-extrabold text-slate-800 tracking-tight">Pertanyaan yang Sering Diajukan (FAQ)</h3>
          </div>
          <div className="flex flex-col gap-2.5">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-slate-100 last:border-none pb-2.5 last:pb-0">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex justify-between items-center text-left py-2 text-sm font-bold text-slate-700 hover:text-blue-600 transition duration-150 cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {openFaq === index ? (
                    <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
                <AnimatePresence initial={false}>
                  {openFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Footer Credit Layer */}
        <div id="footer" className="text-center pt-2">
          <p className="text-xs text-slate-400 font-medium">
            &copy; 2026 SDN Pisangan Baru 09 Pagi. All Rights Reserved.
          </p>
          <p className="text-[10px] text-slate-400/80 mt-1">
            Sistem Kelulusan Mandiri terintegrasi langsung dengan Layanan Data Cloud Google Sheets.
          </p>
        </div>

      </div>
    </div>
  );
}
