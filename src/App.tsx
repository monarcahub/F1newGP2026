import React, { useState, useEffect, FormEvent, useRef, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { 
  Play, 
  Info, 
  LogOut, 
  User, 
  Settings, 
  ChevronRight, 
  ChevronLeft, 
  Search,
  Lock,
  ExternalLink,
  Plus,
  Trash2,
  Edit,
  Users,
  Film,
  X,
  Eye,
  EyeOff,
  ThumbsUp,
  Heart,
  MessageSquare,
  Send,
  ChevronDown,
  CreditCard,
  History,
  Download,
  Trophy,
  Menu,
  FileText,
  Radio,
  CloudRain,
  Thermometer,
  Wind,
  Briefcase,
  Mail,
  Phone,
  UserCheck,
  Check,
  Gift,
  Sparkles,
  Crown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import rehypeRaw from 'rehype-raw';
import { supabase, type Profile, type Video, type Reaction, type Comment, type Post, type PostReaction, type PostComment, type Volunteer } from './lib/supabase';
import { cn } from './lib/utils';
import { openF1Service, type Session, type Weather, type RaceControl } from './services/openF1Service';

const CURRENT_YEAR = new Date().getFullYear();

declare global {
  interface Window {
    chatwootSettings: any;
    chatwootSDK: any;
    adsbygoogle: any[];
  }
}

const AdSense = ({ adSlot }: { adSlot: string }) => {
  const location = useLocation();

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const ads = document.querySelectorAll('.adsbygoogle:not([data-adsbygoogle-status])');
        if (ads.length > 0) {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        }
      } catch (e) {
        console.error('AdSense error:', e);
      }
    }, 500); // Wait a bit for DOM to stabilize

    return () => clearTimeout(timer);
  }, [location.pathname, adSlot]);

  return (
    <div className="my-12 overflow-hidden flex justify-center">
      <ins
        key={`${location.pathname}-${adSlot}`}
        className="adsbygoogle"
        style={{ display: 'block', width: '100%', minHeight: '90px' }}
        data-ad-client="ca-pub-7197376783143404"
        data-ad-slot={adSlot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};

const LiveRaceBanner = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [weather, setWeather] = useState<Weather | null>(null);
  const [raceControl, setRaceControl] = useState<RaceControl[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [showFull, setShowFull] = useState(false);

  useEffect(() => {
    const checkLive = async () => {
      const latest = await openF1Service.getLatestSession();
      if (latest) {
        const now = new Date();
        const start = new Date(latest.date_start);
        const end = latest.date_end ? new Date(latest.date_end) : new Date(start.getTime() + 3 * 60 * 60 * 1000);
        
        // Is live if now is between start and end (with 15 min buffer after end)
        // Undesired starting from Monday, so we restrict it to Friday (5), Saturday (6), and Sunday (0)
        const dayOfWeek = now.getDay();
        const isLiveDay = dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6;
        const live = isLiveDay && now >= start && now <= new Date(end.getTime() + 15 * 60 * 1000);
        setIsLive(live);
        setSession(latest);

        if (live) {
          const [w, rc] = await Promise.all([
            openF1Service.getWeather(latest.session_key),
            openF1Service.getRaceControlBySession(latest.session_key)
          ]);
          setWeather(w);
          setRaceControl(rc.slice(-3).reverse()); // Latest 3 messages
        }
      }
    };

    checkLive();
    const interval = setInterval(checkLive, 60000); // Poll every minute
    return () => clearInterval(interval);
  }, []);

  if (!isLive || !session) return null;

  return (
    <motion.div 
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      className="bg-f1-blue text-white relative z-[60] overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest italic">Acontecendo Agora</span>
          </div>
          <div className="h-4 w-px bg-white/20 hidden sm:block" />
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
            <span className="text-xs font-black uppercase tracking-tight italic">
              {session.country_name} - {session.session_name}
            </span>
            <span className="text-[10px] opacity-70 font-bold uppercase tracking-widest hidden md:inline">
              Circuit: {session.circuit_short_name}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {weather && (
            <div className="hidden lg:flex items-center gap-4 text-[10px] font-black uppercase tracking-widest">
              <div className="flex items-center gap-1.5">
                <Thermometer size={14} />
                <span>{weather.track_temperature}°C Track</span>
              </div>
              <div className="flex items-center gap-1.5 text-white/70">
                <Wind size={14} />
                <span>{weather.wind_speed}km/h</span>
              </div>
              {weather.rainfall > 0 && (
                <div className="flex items-center gap-1.5 text-blue-200">
                  <CloudRain size={14} />
                  <span>Chuva: {weather.rainfall}%</span>
                </div>
              )}
            </div>
          )}
          <button 
            onClick={() => setShowFull(!showFull)}
            className="p-1 hover:bg-white/10 rounded-md transition-colors"
          >
            <ChevronDown size={18} className={cn("transition-transform duration-300", showFull && "rotate-180")} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showFull && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="bg-black/20 border-t border-white/10"
          >
            <div className="max-w-7xl mx-auto px-4 py-4 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Race Control Feed */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <Radio size={16} className="text-white/50" />
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-white/50">Race Control</h4>
                </div>
                {raceControl.length > 0 ? (
                  raceControl.map((msg, i) => (
                    <div key={i} className="flex gap-3 text-xs">
                      <span className="text-white/30 font-mono">{new Date(msg.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <p className="font-bold leading-tight uppercase italic tracking-tighter">{msg.message}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-white/30 italic">Aguardando atualizações...</p>
                )}
              </div>

              {/* Weather & Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                  <span className="block text-[8px] font-black uppercase tracking-widest text-white/40 mb-2">Ar / Pista</span>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-black italic">{weather?.air_temperature || '--'}°</span>
                    <span className="text-lg font-black italic text-f1-blue">{weather?.track_temperature || '--'}°</span>
                  </div>
                </div>
                <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                  <span className="block text-[8px] font-black uppercase tracking-widest text-white/40 mb-2">Umidade</span>
                  <div className="text-lg font-black italic">{weather?.humidity || '--'}%</div>
                </div>
              </div>
            </div>
            <div className="px-4 pb-2 text-center">
              <Link to="/archives" className="text-[8px] font-black uppercase tracking-widest hover:text-white transition-colors underline underline-offset-4">Ver Acervo Completo</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const FeaturedDetailsModal = ({ isOpen, onClose, video }: { isOpen: boolean, onClose: () => void, video: Video }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [weather, setWeather] = useState<Weather | null>(null);
  const [raceControl, setRaceControl] = useState<RaceControl[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && video) {
      const fetchDetails = async () => {
        setLoading(true);
        setSession(null);
        setWeather(null);
        setRaceControl([]);

        const normalizeText = (text: string) => 
          text ? text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase() : '';

        // Simple keyword matching (e.g., GP name)
        const titleNormalized = normalizeText(video.title);
        const keywords = titleNormalized
          .split(/[\s-—_]+/)
          .map(k => k.trim())
          .filter(k => k.length > 2 && !['formula', 'grand', 'prix', 'video', 'corrida', 'etapa', 'treino', 'classificacao', 'gp', 'de', 'do', 'da', 'ao', 'tempo', 'real', 'vivo'].includes(k));

        // Maps Portuguese GP countries & locations to OpenF1 English values
        const countryMappings: { [key: string]: string[] } = {
          'canada': ['canada', 'montreal'],
          'monaco': ['monaco', 'monte carlo'],
          'espanha': ['spain', 'barcelona', 'catalunya'],
          'catalunha': ['spain', 'barcelona', 'catalunya'],
          'inglaterra': ['great britain', 'silverstone', 'united kingdom'],
          'gra-bretanha': ['great britain', 'silverstone', 'united kingdom'],
          'italia': ['italy', 'monza', 'imola', 'milan'],
          'belgica': ['belgium', 'spa', 'francorchamps'],
          'holanda': ['netherlands', 'zandvoort'],
          'austria': ['austria', 'spielberg', 'red bull ring'],
          'hungria': ['hungary', 'budapest', 'hungaroring'],
          'singapura': ['singapore', 'marina bay'],
          'cingapura': ['singapore', 'marina bay'],
          'japao': ['japan', 'suzuka'],
          'eua': ['united states', 'austin', 'miami', 'las vegas'],
          'estados unidos': ['united states', 'austin', 'miami', 'las vegas'],
          'azerbaijao': ['azerbaijan', 'baku'],
          'catar': ['qatar', 'lusail'],
          'arabia saudita': ['saudi arabia', 'jeddah'],
          'bahrein': ['bahrain', 'sakhir'],
          'emirados arabes': ['abu dhabi', 'yas marina'],
          'sao paulo': ['brazil', 'sao paulo', 'interlagos'],
          'brasil': ['brazil', 'sao paulo', 'interlagos'],
        };

        const searchTerms = [...keywords];
        keywords.forEach(k => {
          if (countryMappings[k]) {
            searchTerms.push(...countryMappings[k]);
          }
        });

        let bestSession: Session | null = null;

        // Try looking up the current live session first since a live race is happening right now!
        try {
          const liveSession = await openF1Service.getLatestSession();
          if (liveSession) {
            const locLoc = normalizeText(liveSession.location);
            const countryLoc = normalizeText(liveSession.country_name);
            const nameLoc = normalizeText(liveSession.session_name);
            
            const matchesLive = searchTerms.some(term => 
              locLoc.includes(term) || 
              countryLoc.includes(term) ||
              nameLoc.includes(term)
            );

            // If it matches by location, or if we have a live session right now and the video is the general featured one
            if (matchesLive || video.title.toLowerCase().includes('ao vivo')) {
              bestSession = liveSession;
            }
          }
        } catch (e) {
          console.error('Error finding live session fallback:', e);
        }

        // If no matches found in active live session cache, fallback sequentially across years
        if (!bestSession) {
          const yearsToSearch = [
            video.year,
            new Date().getFullYear(),
            2024,
            2023
          ];
          const uniqueYears = Array.from(new Set(yearsToSearch.filter(y => typeof y === 'number' && y > 1950)));

          for (const searchYear of uniqueYears) {
            try {
              const yearSessions = await openF1Service.getSessionsByYear(searchYear);
              if (yearSessions && yearSessions.length > 0) {
                const matched = yearSessions.filter(s => {
                  const locLoc = normalizeText(s.location);
                  const countryLoc = normalizeText(s.country_name);
                  const nameLoc = normalizeText(s.session_name);
                  return searchTerms.some(term => 
                    locLoc.includes(term) || 
                    countryLoc.includes(term) ||
                    nameLoc.includes(term)
                  );
                });
                
                if (matched.length > 0) {
                  // Prefer the race session, otherwise take first match
                  bestSession = matched.find(s => normalizeText(s.session_name).includes('race')) || matched[0];
                  break; 
                }
              }
            } catch (err) {
              console.error(`Error searching sessions for year ${searchYear}:`, err);
            }
          }
        }

        // Ultimate Fallback: Default to whatever latest session OpenF1 has if we really found nothing else
        if (!bestSession) {
          try {
            bestSession = await openF1Service.getLatestSession();
          } catch (e) {
            console.error('Final fallback failed:', e);
          }
        }

        if (bestSession) {
          setSession(bestSession);
          try {
            const [w, rc] = await Promise.all([
              openF1Service.getWeather(bestSession.session_key),
              openF1Service.getRaceControlBySession(bestSession.session_key)
            ]);
            setWeather(w);
            setRaceControl(rc.slice(0, 10)); // Top 10 events
          } catch (e) {
            console.error('Error loading session attributes:', e);
          }
        }
        setLoading(false);
      };
      fetchDetails();
    }
  }, [isOpen, video]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/90 backdrop-blur-md"
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-4xl bg-dark-card border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="p-8 border-b border-white/10 flex items-center justify-between bg-white/5">
            <div>
              <span className="text-f1-blue font-black tracking-widest text-[10px] uppercase block mb-1">Detalhes do Evento</span>
              <h2 className="text-2xl md:text-4xl font-black italic uppercase tracking-tighter text-white leading-none">
                {video.title}
              </h2>
            </div>
            <button 
              onClick={onClose}
              className="p-3 hover:bg-white/10 rounded-full transition-colors text-white/50 hover:text-white"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="w-8 h-8 border-3 border-f1-blue border-t-transparent rounded-full animate-spin" />
              </div>
            ) : session ? (
              <div className="space-y-12">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                    <div className="flex items-center gap-2 text-gray-500 mb-3">
                      <Radio size={14} />
                      <span className="text-[8px] font-black uppercase tracking-widest">Sessão</span>
                    </div>
                    <div className="text-lg font-black italic text-white uppercase tracking-tighter">{session.session_name}</div>
                  </div>
                  <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                    <div className="flex items-center gap-2 text-gray-500 mb-3">
                      <Thermometer size={14} />
                      <span className="text-[8px] font-black uppercase tracking-widest">Temp. Ar/Pista</span>
                    </div>
                    <div className="text-lg font-black italic text-white">{weather?.air_temperature || '--'}° / {weather?.track_temperature || '--'}°</div>
                  </div>
                  <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                    <div className="flex items-center gap-2 text-gray-500 mb-3">
                      <Wind size={14} />
                      <span className="text-[8px] font-black uppercase tracking-widest">Vento</span>
                    </div>
                    <div className="text-lg font-black italic text-white">{weather?.wind_speed || '--'} km/h</div>
                  </div>
                  <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                    <div className="flex items-center gap-2 text-gray-500 mb-3">
                      <CloudRain size={14} />
                      <span className="text-[8px] font-black uppercase tracking-widest">Chuva</span>
                    </div>
                    <div className="text-lg font-black italic text-white">{weather?.rainfall || 0}%</div>
                  </div>
                </div>

                {/* Circuit Info */}
                <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10 relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-f1-blue rounded-full blur-[60px] opacity-10" />
                   <h3 className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em] mb-6">Informações do Circuito</h3>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div>
                        <span className="block text-[8px] text-gray-400 font-black uppercase mb-1">Localização</span>
                        <span className="text-xl font-black italic text-white uppercase tracking-tighter">{session.location}, {session.country_name}</span>
                      </div>
                      <div>
                        <span className="block text-[8px] text-gray-400 font-black uppercase mb-1">Circuito</span>
                        <span className="text-xl font-black italic text-white uppercase tracking-tighter">{session.circuit_short_name}</span>
                      </div>
                      <div>
                        <span className="block text-[8px] text-gray-400 font-black uppercase mb-1">Data de Início</span>
                        <span className="text-xl font-black italic text-white uppercase tracking-tighter">
                          {new Date(session.date_start).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </span>
                      </div>
                   </div>
                </div>

                {/* Race Control Feed */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em]">Eventos da Sessão</h3>
                    <div className="px-3 py-1 bg-f1-blue/20 text-f1-blue rounded-full text-[8px] font-black uppercase tracking-widest">Race Control</div>
                  </div>
                  <div className="space-y-4">
                    {raceControl.length > 0 ? (
                      raceControl.map((rc, i) => (
                        <div key={i} className="flex gap-6 p-4 rounded-2xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5 group">
                           <span className="text-[10px] font-mono text-gray-500 mt-0.5">{new Date(rc.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                           <p className="text-sm font-bold uppercase italic tracking-tight text-gray-300 group-hover:text-white transition-colors">{rc.message}</p>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-gray-600 italic text-sm">
                        Nenhuma mensagem de controle de corrida registrada para esta sessão ainda.
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="pt-8 border-t border-white/10">
                   <h3 className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em] mb-4">Sobre o Episódio</h3>
                   <p className="text-gray-400 leading-relaxed font-medium">
                     {video.description}
                   </p>
                </div>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center space-y-4">
                 <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-gray-600">
                    <Info size={32} />
                 </div>
                 <div className="space-y-2">
                    <p className="text-white font-black italic uppercase tracking-tighter">Dados em tempo real indisponíveis</p>
                    <p className="text-gray-500 text-xs max-w-xs mx-auto font-medium">Não conseguimos localizar a telemetria específica para esta etapa na OpenF1 API no momento.</p>
                 </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-8 border-t border-white/10 bg-black/40 flex justify-end">
            <button 
              onClick={onClose}
              className="px-12 py-4 bg-white text-black rounded-full font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform"
            >
              Fechar Detalhes
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// --- Components ---

const generateSlug = (text: string) => {
  return text
    .toLowerCase()
    .normalize('NFD') // Remove accents
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '') // Remove special chars
    .trim()
    .split(/\s+/)
    .slice(0, 7)
    .join('-');
};

const Navbar = ({ profile }: { profile: Profile | null }) => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    sessionStorage.removeItem('upgrade_prompted_once');
    navigate('/login');
  };

  const menuItems = [
    { label: 'Home', path: '/' },
    { label: `Temporada ${CURRENT_YEAR}`, path: `/season/${CURRENT_YEAR}` },
    { label: 'PlayStream', path: '/playstream' },
    { label: 'Vídeos', path: '/archives' },
    { label: 'Blog', path: '/blog' },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 flex flex-col">
        {/* Live Race Banner */}
        <LiveRaceBanner />
        
        <nav className="w-full bg-gradient-to-b from-black/90 via-black/40 to-transparent px-4 md:px-12 py-4 grid grid-cols-2 md:grid-cols-3 items-center backdrop-blur-sm md:backdrop-blur-none border-b border-white/5 md:border-none">
        {/* Left Section: Mobile Menu + Logo */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden text-white p-1 hover:bg-white/10 rounded-md transition-colors"
          >
            <Menu size={24} />
          </button>
          
          <Link to="/" className="flex items-center">
            <img 
              src="https://i.ibb.co/DP8YRq1Y/logo-GRIDPLAY-2026.png" 
              alt="GRIDPLAY" 
              className="h-7 md:h-10 object-contain"
              referrerPolicy="no-referrer"
            />
          </Link>
        </div>

        {/* Center Section: Main Desktop Menu */}
        <div className="hidden md:flex justify-center">
          <div className="flex items-center gap-8 text-sm font-bold uppercase tracking-widest text-gray-400">
            {menuItems.map((item) => (
              <Link 
                key={item.path + item.label} 
                to={item.path} 
                className="hover:text-white transition-colors relative group py-2"
              >
                {item.label}
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-f1-blue transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              </Link>
            ))}
          </div>
        </div>

        {/* Right Section: Auth Action */}
        <div className="flex items-center justify-end gap-3 md:gap-4">
          {/* Desktop Search - Hidden on mobile as per request */}
          <button className="hidden md:block text-gray-400 hover:text-white p-2">
            <Search size={20} />
          </button>

          {profile ? (
            <div className="flex items-center gap-2 md:gap-4 relative group">
              <div className="flex items-center gap-2">
                <Link to="/account" className="text-gray-300 hover:text-white flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10 hover:bg-white/10 transition-all">
                  <User size={18} />
                  <span className="text-[10px] font-black uppercase tracking-widest hidden lg:inline">Minha Conta</span>
                </Link>
                <button 
                  onClick={handleLogout} 
                  className="text-gray-400 hover:text-red-500 transition-colors p-2"
                >
                  <LogOut size={20} />
                </button>
              </div>

              {/* Admin Dropdown - Hover Trigger */}
              {profile.role === 'admin' && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-dark-card border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all py-2 z-50">
                  <Link 
                    to="/admin" 
                    className="flex items-center gap-3 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                  >
                    <Settings size={14} />
                    Painel Admin
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login" className="hidden md:block text-white text-sm font-bold uppercase tracking-widest hover:opacity-80 transition-opacity">Entrar</Link>
              <button 
                onClick={() => {
                  if (window.location.pathname !== '/') {
                    window.location.href = '/#plans';
                  } else {
                    document.getElementById('plans')?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="bg-white text-black px-4 md:px-6 py-2 rounded-sm text-[10px] md:text-xs font-black uppercase tracking-widest hover:bg-gray-200 transition-colors"
              >
                Assine Agora
              </button>
            </div>
          )}
        </div>
      </nav>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60] md:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[80%] max-w-xs bg-dark-bg border-r border-white/10 z-[70] md:hidden p-8 flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between mb-12">
                <img 
                  src="https://i.ibb.co/DP8YRq1Y/logo-GRIDPLAY-2026.png" 
                  alt="GRIDPLAY" 
                  className="h-7 object-contain"
                  referrerPolicy="no-referrer"
                />
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-white">
                  <X size={24} />
                </button>
              </div>

              <div className="flex flex-col gap-8 flex-grow">
                {menuItems.map((item) => (
                  <Link 
                    key={item.label} 
                    to={item.path} 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-lg font-black italic uppercase tracking-tighter hover:text-f1-blue transition-colors flex items-center justify-between group"
                  >
                    {item.label}
                    <ChevronRight size={20} className="text-gray-600 group-hover:text-f1-blue" />
                  </Link>
                ))}
                
                {/* ENTRAR as last item in mobile menu if not logged in */}
                {!profile && (
                  <Link 
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="mt-4 pt-8 border-t border-white/10 text-lg font-black italic uppercase tracking-tighter text-citrus-yellow hover:opacity-80 transition-opacity flex items-center justify-between group"
                  >
                    ENTRAR
                    <ChevronRight size={20} />
                  </Link>
                )}
              </div>

              {profile && (
                <div className="mt-auto pt-8 border-t border-white/10 space-y-6">
                  <div className="flex items-center gap-4 text-gray-400">
                    <User size={20} />
                    <span className="text-sm font-bold uppercase tracking-widest truncate">{profile.email}</span>
                  </div>
                  {profile.role === 'admin' && (
                    <Link 
                      to="/admin" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-4 text-f1-blue font-bold uppercase tracking-widest text-sm"
                    >
                      <Settings size={20} />
                      Painel Admin
                    </Link>
                  )}
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-4 text-red-500 font-bold uppercase tracking-widest text-sm"
                  >
                    <LogOut size={20} />
                    Sair da Conta
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

const VideoCard = ({ video }: { video: Video, key?: string }) => {
  return (
    <Link 
      to={`/watch/${video.id}`}
      className="relative flex-shrink-0 w-40 md:w-64 aspect-video bg-dark-card rounded-md overflow-hidden group transition-transform duration-300 hover:scale-105"
    >
      <img 
        src={video.thumbnail_url || `https://picsum.photos/seed/${video.id}/400/225`} 
        alt={video.title}
        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
        referrerPolicy="no-referrer"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
        <h3 className="text-sm font-bold leading-tight">{video.title}</h3>
        <p className="text-[10px] text-gray-400 mt-1">{video.year} • {video.category}</p>
      </div>
      {video.status === 'PREMIUM' && (
        <div className="absolute top-2 right-2 bg-citrus-yellow text-black text-[8px] font-black px-1.5 py-0.5 rounded-sm">PREMIUM</div>
      )}
    </Link>
  );
};

const Carousel = ({ title, videos }: { title: string, videos: Video[], key?: string }) => {
  return (
    <div className="mb-8 px-4 md:px-12">
      <h2 className="text-lg md:text-xl font-bold mb-4 flex items-center gap-2">
        {title} <ChevronRight size={20} className="text-f1-blue" />
      </h2>
      <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
        {videos.map(video => <VideoCard key={video.id} video={video} />)}
      </div>
    </div>
  );
};

const AdBanner = ({ profile, type = 'normal', adSlot = '6214191157' }: { profile: Profile | null, type?: 'normal' | 'discreet', adSlot?: string }) => {
  // Completely hide ads for active premium subscribers
  // A subscriber is premium if: exists, plan is NOT FREE, and status is ACTIVE
  const isPremium = profile && profile.plan !== 'FREE' && profile.subscription_status === 'ACTIVE';
  const shouldShow = !isPremium;
  
  const adRef = useRef<HTMLModElement>(null);
  const pushedRef = useRef(false);

  useEffect(() => {
    if (shouldShow && adRef.current && !pushedRef.current) {
      const loadAd = () => {
        try {
          if (typeof window !== 'undefined' && adRef.current && !pushedRef.current) {
            // Check if ad is already loaded
            if (adRef.current.getAttribute('data-adsbygoogle-status') === 'done') {
              pushedRef.current = true;
              return;
            }

            // Ensure element is visible and has width
            const rect = adRef.current.getBoundingClientRect();
            if (rect.width > 0) {
              // @ts-ignore
              (window.adsbygoogle = window.adsbygoogle || []).push({});
              pushedRef.current = true;
              console.log(`AdSense: Ad pushed for slot ${adSlot}`);
            } else {
              // Retry in a bit if not ready
              setTimeout(loadAd, 500);
            }
          }
        } catch (e) {
          console.error("AdSense Error for slot " + adSlot + ":", e);
        }
      };

      // Delay initialization to ensure DOM is ready and styles are applied
      const timer = setTimeout(loadAd, 1000); 
      return () => clearTimeout(timer);
    }
  }, [shouldShow, adSlot]);

  if (!shouldShow) return null;

  return (
    <div className={cn(
      "w-full flex justify-center my-12 px-4 select-none",
      type === 'discreet' ? "opacity-60 scale-95 hover:opacity-100 transition-all duration-500" : "opacity-100"
    )}>
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 w-full max-w-5xl flex flex-col items-center justify-center min-h-[120px] relative overflow-hidden backdrop-blur-sm shadow-2xl">
        <span className="absolute top-2 right-4 text-[7px] text-gray-500 font-bold uppercase tracking-[0.2em] z-20">Espaço Publicitário</span>
        
        {/* Ad Placeholder (shimmer style) */}
        {!pushedRef.current && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/5 animate-pulse">
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/10 italic">Google AdSense</div>
          </div>
        )}

        <ins ref={adRef} 
             className="adsbygoogle"
             style={{ display: 'block', width: '100%', minHeight: '90px', position: 'relative', zIndex: 10 }}
             data-ad-client="ca-pub-7197376783143404"
             data-ad-slot={adSlot}
             data-ad-format="auto"
             data-full-width-responsive="true"></ins>
      </div>
    </div>
  );
};

const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <motion.div 
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 w-full z-[100] p-4 md:p-8"
    >
      <div className="max-w-5xl mx-auto bg-dark-card border border-white/10 rounded-2xl shadow-2xl p-6 md:p-8 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex-1">
            <h3 className="text-lg font-bold mb-2">Preferências de cookies</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Nós e nossas Afiliadas utilizamos terceiros para acessar e armazenar dados no seu dispositivo a fim de analisar o uso e aprimorar sua experiência, além de personalizar, mensurar e fornecer conteúdos e anúncios. Para obter mais informações, consulte nossa <a href="https://www.monarcahub.com/privacy-policy" target="_blank" rel="noopener noreferrer" className="underline hover:text-white transition-colors">Política de Privacidade</a>. Você pode Aceitar todos ou acessar Gerenciar cookies para mais opções.
            </p>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button 
              onClick={handleAccept}
              className="flex-1 md:flex-none bg-white text-black px-8 py-3 rounded-full font-bold text-sm hover:bg-gray-200 transition-colors"
            >
              Aceitar todos
            </button>
            <button className="flex-1 md:flex-none border border-white/20 text-white px-8 py-3 rounded-full font-bold text-sm hover:bg-white/5 transition-colors">
              Gerenciar cookies
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const PixelTracker = () => {
  const location = useLocation();

  useEffect(() => {
    // Meta Pixel Base Code
    const pixelId = import.meta.env.VITE_FB_PIXEL_ID;
    if (!pixelId) return;

    const w = window as any;
    if (!w.fbq) {
      w.fbq = function (...args: any[]) {
        if (w.fbq.callMethod) {
          w.fbq.callMethod.apply(w.fbq, args);
        } else {
          w.fbq.queue.push(args);
        }
      };
      w.fbq.push = w.fbq;
      w.fbq.loaded = true;
      w.fbq.version = "2.0";
      w.fbq.queue = [];

      const script = document.createElement("script");
      script.async = true;
      script.src = "https://connect.facebook.net/en_US/fbevents.js";
      const firstScript = document.getElementsByTagName("script")[0];
      if (firstScript && firstScript.parentNode) {
        firstScript.parentNode.insertBefore(script, firstScript);
      } else {
        document.head.appendChild(script);
      }

      w.fbq("init", pixelId);
    }
  }, []);

  useEffect(() => {
    const pixelId = import.meta.env.VITE_FB_PIXEL_ID;
    const w = window as any;
    if (pixelId && w.fbq) {
      w.fbq("track", "PageView");
    }
  }, [location.pathname]);

  return null;
};

const Chatwoot = ({ profile }: { profile: Profile | null }) => {
  useEffect(() => {
    if (!profile) return;

    // Check if already loaded
    if (window.chatwootSDK) {
      // If already loaded, make sure it's visible
      const bubble = document.querySelector('.woot-widget-bubble');
      if (bubble) (bubble as HTMLElement).style.display = 'flex';
      return;
    }

    window.chatwootSettings = {"position":"right","type":"expanded_bubble","launcherTitle":"Fale conosco no chat"};
    
    (function(d,t) {
      var BASE_URL="https://chat.monarcahub.com";
      var g=d.createElement(t) as HTMLScriptElement,s=d.getElementsByTagName(t)[0];
      g.src=BASE_URL+"/packs/js/sdk.js";
      g.defer = true;
      g.async = true;
      s.parentNode?.insertBefore(g,s);
      g.onload=function(){
        window.chatwootSDK.run({
          websiteToken: 'M6uqQFAF1VYPUEqupprYaHMP',
          baseUrl: BASE_URL
        })
      }
    })(document,"script");
  }, [profile]);

  useEffect(() => {
    if (!profile && window.chatwootSDK) {
      // If user logs out, hide the widget
      try {
        const bubble = document.querySelector('.woot-widget-bubble');
        if (bubble) (bubble as HTMLElement).style.display = 'none';
        const holder = document.querySelector('.woot-widget-holder');
        if (holder) (holder as HTMLElement).style.display = 'none';
      } catch (e) {
        console.error("Error hiding Chatwoot:", e);
      }
    }
  }, [profile]);

  return null;
};

const ReactionButton = ({ videoId, profile }: { videoId: string, profile: Profile | null }) => {
  const [userReaction, setUserReaction] = useState<'like' | 'love' | null>(null);
  const [showOptions, setShowOptions] = useState(false);
  const [counts, setCounts] = useState({ like: 0, love: 0 });

  useEffect(() => {
    fetchReactions();
  }, [videoId, profile]);

  const fetchReactions = async () => {
    const { data, error } = await supabase
      .from('f1reactions')
      .select('type, user_id')
      .eq('video_id', videoId);

    if (data) {
      const likeCount = data.filter(r => r.type === 'like').length;
      const loveCount = data.filter(r => r.type === 'love').length;
      setCounts({ like: likeCount, love: loveCount });

      if (profile) {
        const myReaction = data.find(r => r.user_id === profile.id);
        setUserReaction(myReaction?.type || null);
      }
    }
  };

  const handleReaction = async (type: 'like' | 'love') => {
    if (!profile) return;

    if (userReaction === type) {
      // Remove reaction
      await supabase
        .from('f1reactions')
        .delete()
        .eq('video_id', videoId)
        .eq('user_id', profile.id);
      setUserReaction(null);
    } else {
      // Upsert reaction
      await supabase
        .from('f1reactions')
        .upsert({ video_id: videoId, user_id: profile.id, type });
      setUserReaction(type);
    }
    setShowOptions(false);
    fetchReactions();
  };

  return (
    <div className="relative inline-block">
      <button 
        onMouseEnter={() => profile && setShowOptions(true)}
        onClick={() => {
          if (!profile) return;
          setShowOptions(!showOptions);
        }}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-full transition-all border",
          userReaction 
            ? "bg-f1-blue/10 border-f1-blue text-f1-blue" 
            : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
        )}
      >
        {userReaction === 'love' ? <Heart size={18} fill="currentColor" /> : <ThumbsUp size={18} fill={userReaction === 'like' ? "currentColor" : "none"} />}
        <span className="text-xs font-bold uppercase tracking-widest">
          {userReaction === 'love' ? 'Amei' : userReaction === 'like' ? 'Gostei' : 'Gostei'}
        </span>
        <span className="text-[10px] opacity-60 ml-1">{counts.like + counts.love}</span>
      </button>

      <AnimatePresence>
        {showOptions && profile && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            onMouseLeave={() => setShowOptions(false)}
            className="absolute bottom-full left-0 mb-2 bg-dark-card border border-white/10 rounded-full p-1 flex gap-1 shadow-2xl z-50 backdrop-blur-xl"
          >
            <button 
              onClick={() => handleReaction('like')}
              className={cn(
                "p-2 rounded-full transition-all hover:bg-white/10",
                userReaction === 'like' ? "text-f1-blue" : "text-gray-400"
              )}
              title="Gostei"
            >
              <ThumbsUp size={20} fill={userReaction === 'like' ? "currentColor" : "none"} />
            </button>
            <button 
              onClick={() => handleReaction('love')}
              className={cn(
                "p-2 rounded-full transition-all hover:bg-white/10",
                userReaction === 'love' ? "text-red-500" : "text-gray-400"
              )}
              title="Amei"
            >
              <Heart size={20} fill={userReaction === 'love' ? "currentColor" : "none"} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CommentSection = ({ videoId, profile }: { videoId: string, profile: Profile | null }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComments();
  }, [videoId]);

  const fetchComments = async () => {
    // 1. Fetch raw comments
    const { data: rawComments, error: commentsErr } = await supabase
      .from('f1comments')
      .select('*')
      .eq('video_id', videoId)
      .order('created_at', { ascending: true });

    if (commentsErr) {
      console.error("Erro ao carregar comentários do Supabase:", commentsErr);
      setLoading(false);
      return;
    }

    if (!rawComments || rawComments.length === 0) {
      setComments([]);
      setLoading(false);
      return;
    }

    // 2. Fetch profiles for distinct users who commented
    const userIds = Array.from(new Set(rawComments.map(c => c.user_id).filter(Boolean)));
    const profilesMap: Record<string, { full_name: string | null; email: string }> = {};

    if (userIds.length > 0) {
      const { data: profiles, error: profilesErr } = await supabase
        .from('f1profiles')
        .select('id, full_name, email')
        .in('id', userIds);

      if (profilesErr) {
        console.error("Erro ao carregar f1profiles para os comentários:", profilesErr);
      } else if (profiles) {
        profiles.forEach(p => {
          profilesMap[p.id] = {
            full_name: p.full_name,
            email: p.email
          };
        });
      }
    }

    // 3. Merge profiles data into the comments state
    const commentsWithProfiles: Comment[] = rawComments.map(c => ({
      ...c,
      f1profiles: profilesMap[c.user_id] || undefined
    }));

    setComments(commentsWithProfiles);
    setLoading(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!profile || !newComment.trim()) return;

    const { error } = await supabase
      .from('f1comments')
      .insert({
        video_id: videoId,
        user_id: profile.id,
        content: newComment,
        parent_id: replyTo
      });

    if (error) {
      console.error("Erro ao enviar comentário para o Supabase:", error);
    } else {
      setNewComment('');
      setReplyTo(null);
      fetchComments();
    }
  };

  return (
    <div id="comments" className="mt-16 max-w-4xl mx-auto px-4">
      <h3 className="text-xl font-black mb-8 italic uppercase tracking-tighter flex items-center gap-3">
        <MessageSquare size={20} className="text-f1-blue" />
        Comentários ({comments.length})
      </h3>

      {profile ? (
        <form onSubmit={handleSubmit} className="mb-12 bg-white/5 border border-white/10 rounded-2xl p-4">
          {replyTo && (
            <div className="flex items-center justify-between mb-2 px-2 py-1 bg-f1-blue/10 rounded-md">
              <span className="text-[10px] text-f1-blue font-bold uppercase tracking-widest">Respondendo comentário</span>
              <button onClick={() => setReplyTo(null)} className="text-gray-500 hover:text-white"><X size={14} /></button>
            </div>
          )}
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-f1-blue/20 flex items-center justify-center text-f1-blue font-bold shrink-0">
              {(profile.email?.[0] || 'U').toUpperCase()}
            </div>
            <div className="flex-1 relative">
              <textarea 
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="O que você achou dessa corrida?"
                className="w-full bg-transparent border-none focus:ring-0 text-sm resize-none h-20"
              />
              <button 
                type="submit"
                disabled={!newComment.trim()}
                className="absolute bottom-0 right-0 bg-f1-blue text-white p-2 rounded-full hover:scale-110 transition-transform disabled:opacity-50 disabled:scale-100"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-12 bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
          <p className="text-gray-400 text-sm mb-4">Você precisa estar logado para comentar e reagir.</p>
          <Link to="/login" className="inline-block bg-white text-black px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest hover:bg-gray-200 transition-colors">Entrar agora</Link>
        </div>
      )}

      <div className="space-y-6">
        {comments.filter(c => !c.parent_id).map(comment => (
          <div key={comment.id} className="group">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 font-bold shrink-0">
                {(comment.f1profiles?.email?.[0] || comment.f1profiles?.full_name?.[0] || '?').toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold">
                    {comment.f1profiles?.full_name || comment.f1profiles?.email?.split('@')?.[0] || 'Parceiro GRIDPLAY'}
                  </span>
                  <span className="text-[10px] text-gray-600 font-medium">{new Date(comment.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed">{comment.content}</p>
                {profile && (
                  <button 
                    onClick={() => {
                      setReplyTo(comment.id);
                      document.getElementById('comments')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-2 hover:text-f1-blue transition-colors"
                  >
                    Responder
                  </button>
                )}

                {/* Replies */}
                <div className="mt-4 space-y-4 ml-6 border-l border-white/5 pl-6">
                  {comments.filter(r => r.parent_id === comment.id).map(reply => (
                    <div key={reply.id}>
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-gray-500 text-xs font-bold shrink-0">
                          {(reply.f1profiles?.email?.[0] || reply.f1profiles?.full_name?.[0] || '?').toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold">
                              {reply.f1profiles?.full_name || reply.f1profiles?.email?.split('@')?.[0] || 'Parceiro GRIDPLAY'}
                            </span>
                            <span className="text-[10px] text-gray-700">{new Date(reply.created_at).toLocaleDateString()}</span>
                          </div>
                          <p className="text-xs text-gray-400 leading-relaxed">{reply.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
        {comments.length === 0 && !loading && (
          <p className="text-center text-gray-600 text-sm py-8 italic">Nenhum comentário ainda. Seja o primeiro!</p>
        )}
      </div>
    </div>
  );
};

const HighlightsSlider = ({ profile }: { profile: Profile | null }) => {
  const visitorHighlights = [
    { title: "F1 O Filme", subtitle: "As maiores produções do automobilismo", image: "https://i.ibb.co/nq4yMJvy/f1-filme.jpg" },
    { title: "Temporada 2021", subtitle: "O épico duelo pela coroa mundial", image: "https://i.ibb.co/1twFwN80/f1-2021.jpg" },
    { title: "Drive to Survive", subtitle: "Bastidores e dramas das pistas", image: "https://i.ibb.co/qYx9MvHv/dtv-8.jpg" },
    { title: "Formula 2", subtitle: "Onde o futuro da F1 começa", image: "https://i.ibb.co/35PQt9qN/f2-2026.jpg" },
    { title: "Onboard Camera", subtitle: "A visão mais extrema da velocidade", image: "https://i.ibb.co/ZzrBvMw7/onboad-camera-f1.jpg" },
    { title: "Temporada 2012", subtitle: "Uma das maiores temporadas da história", image: "https://i.ibb.co/pBr66ZbP/f1-2012.jpg" },
    { title: "F1 Academy", subtitle: "O futuro feminino nas pistas", image: "https://i.ibb.co/6RBN8gcW/f1academy-2026.jpg" },
    { title: "Formula 3", subtitle: "A base do automobilismo mundial", image: "https://i.ibb.co/BdqfmpS/f3-2026.jpg" },
    { title: "Temporada 1950", subtitle: "Onde tudo começou", image: "https://i.ibb.co/DDS3cyTx/f1-1950.jpg" }
  ];

  const loggedHighlights = [
    { title: "Filmes", subtitle: "As maiores produções do automobilismo", image: "https://i.ibb.co/nq4yMJvy/f1-filme.jpg" },
    { title: "Séries", subtitle: "Bastidores e dramas das pistas", image: "https://i.ibb.co/qYx9MvHv/dtv-8.jpg" },
    { title: "Documentários", subtitle: "A história real de lendas e equipes", image: "https://i.ibb.co/BdqfmpS/f3-2026.jpg" }
  ];

  const highlights = profile ? loggedHighlights : visitorHighlights;

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % highlights.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [highlights.length]);

  return (
    <div className="w-full py-24 bg-black overflow-hidden relative">
      {/* Premium Notification Belt */}
      <div className="absolute top-0 left-0 w-full bg-f1-blue py-3 z-30 overflow-hidden shadow-2xl">
        <div className="flex animate-marquee-fast whitespace-nowrap">
          {Array.from({ length: 10 }).map((_, i) => (
            <span key={i} className="text-[10px] font-black uppercase tracking-[0.2em] text-white mx-8">
              para ver filmes, series e documentários, é necessário login com uma conta Premium •
            </span>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-12 mt-8">
        <h2 className="text-3xl font-black mb-12 italic uppercase tracking-tighter text-center md:text-left">PlayStream Originals</h2>
        
        <div className="relative h-[400px] md:h-[500px] rounded-3xl overflow-hidden group">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="absolute inset-0"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent z-10" />
              <img 
                src={highlights[currentIndex].image} 
                alt={highlights[currentIndex].title}
                className="w-full h-full object-cover opacity-60"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-16 z-20">
                <motion.span 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-citrus-yellow font-black tracking-widest text-sm mb-4 uppercase"
                >
                  Exclusivo para Assinantes
                </motion.span>
                <motion.h3 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-5xl md:text-7xl font-black italic tracking-tighter mb-4 uppercase"
                >
                  {highlights[currentIndex].title}
                </motion.h3>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-xl text-gray-300 max-w-xl font-medium"
                >
                  {highlights[currentIndex].subtitle}
                </motion.p>
                
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="mt-8 text-f1-blue font-black uppercase text-[10px] tracking-[0.2em] bg-white/10 border border-white/20 px-6 py-2 rounded-full w-fit backdrop-blur-md"
                >
                  Para ver filmes, series e documentários, é necessário login com uma conta Premium
                </motion.p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Dots */}
          <div className="absolute bottom-8 right-8 z-30 flex gap-2">
            {highlights.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  currentIndex === i ? "w-8 bg-citrus-yellow" : "w-2 bg-white/20"
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const Footer = () => {
  return (
    <footer className="w-full py-16 bg-black border-t border-white/5 flex flex-col items-center text-center px-4">
      <img 
        src="https://i.ibb.co/DP8YRq1Y/logo-GRIDPLAY-2026.png" 
        alt="GRIDPLAY" 
        className="h-12 md:h-16 object-contain mb-6 opacity-80"
        referrerPolicy="no-referrer"
      />
      <p className="text-gray-500 text-xs md:text-sm max-w-md leading-relaxed uppercase tracking-widest font-medium">
        Projeto institucional em apoio a sustentabilidade, tecnologia e esporte - MonarcaHub
      </p>
      <div className="mt-12 flex flex-wrap justify-center gap-8 text-[10px] text-gray-600 uppercase font-bold tracking-tighter">
        <a href="https://www.monarcahub.com/privacy-policy" target="_blank" rel="noopener noreferrer" className="hover:text-gray-400 transition-colors">Privacidade</a>
        <a href="https://www.monarcahub.com/privacy-policy" target="_blank" rel="noopener noreferrer" className="hover:text-gray-400 transition-colors">Termos de Uso</a>
        <a href="#" className="hover:text-gray-400 transition-colors">Ajuda</a>
        <Link to="/seja-parceiro" className="hover:text-gray-400 transition-colors">Seja parceiro</Link>
      </div>
      <p className="mt-8 text-[10px] text-gray-700">© {CURRENT_YEAR} GRIDPLAY. Todos os direitos reservados.</p>
    </footer>
  );
};

const FAQ = () => {
  const faqs = [
    {
      q: "Como acesso o conteúdo do Telegram?",
      a: "Após a assinatura, você receberá um link exclusivo no seu e-mail e também poderá acessar diretamente pela sua área de membros no site."
    },
    {
      q: "Posso cancelar minha assinatura a qualquer momento?",
      a: "Sim! Você pode cancelar a renovação automática a qualquer momento nas configurações da sua conta, sem letras miúdas."
    },
    {
      q: "Quais são as formas de pagamento?",
      a: "Aceitamos cartões de crédito (com parcelamento em até 12x no plano anual), Pix e boleto bancário."
    },
    {
      q: "O acervo histórico está em qual qualidade?",
      a: "Todo o nosso acervo passa por um processo de remasterização digital para garantir a melhor experiência possível em telas modernas, respeitando o formato original."
    }
  ];

  return (
    <div className="max-w-3xl mx-auto py-24 px-4">
      <h2 className="text-3xl font-black mb-12 italic uppercase tracking-tighter text-center">Perguntas Frequentes</h2>
      <div className="space-y-6">
        {faqs.map((faq, i) => (
          <div key={i} className="bg-dark-card border border-white/5 rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-3 flex items-center gap-3">
              <span className="text-citrus-yellow">?</span> {faq.q}
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">{faq.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const LandingPage = ({ profile }: { profile: Profile | null }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');

  const getPromoDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    
    let promoDate = new Date(year, month, 4);
    if (now.getDate() > 4) {
      promoDate = new Date(year, month + 1, 4);
    }
    
    const months = [
      "janeiro", "fevereiro", "março", "abril", "maio", "junho",
      "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
    ];
    
    return `4 de ${months[promoDate.getMonth()]}`;
  };

  const promoDate = getPromoDate();

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section with Grid Background (Refined MAX Style) */}
      <div className="relative h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        {/* Cinematic Grid Background */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://i.ibb.co/PZyYkyPt/capa-bh-hero-section-GRIDPLAY-F1.jpg" 
            alt="GridPlay Library" 
            className="w-full h-full object-cover scale-105 opacity-60"
            referrerPolicy="no-referrer"
          />
          {/* Lighter gradients to see the titles better (as requested) */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/60" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black" />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="relative z-10 max-w-4xl flex flex-col items-center"
        >
          <span className="text-white font-black tracking-[0.4em] text-[10px] md:text-xs uppercase mb-8 drop-shadow-md">
            OFERTA POR TEMPO LIMITADO
          </span>
          
          <h1 className="text-4xl md:text-6xl font-black mb-8 italic tracking-tighter uppercase leading-tight text-white max-w-3xl">
            Plano Vitalício para quem for rápido
          </h1>
          
          <div className="flex flex-col items-center mb-10">
            <span className="text-white/80 text-[10px] uppercase font-black tracking-widest mb-2">APENAS</span>
            <div className="flex items-start text-white">
              <span className="text-2xl font-black mt-2 mr-1">R$</span>
              <span className="text-7xl md:text-8xl font-black italic tracking-tighter">50,00</span>
            </div>
            <span className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] mt-2">PAGUE UMA VEZ E TENHA ACESSO PARA SEMPRE</span>
          </div>
          
          <div className="flex flex-col items-center gap-6">
            <button 
              onClick={() => document.getElementById('plans')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-white text-black px-20 py-4 rounded-full font-black text-xs uppercase tracking-[0.2em] hover:scale-105 transition-transform shadow-2xl"
            >
              GARANTIR ACESSO VITALÍCIO
            </button>
            
            <p className="text-[9px] md:text-[10px] text-white/40 max-w-md font-bold uppercase tracking-wider">
              *Oferta por tempo limitado. Pague uma única vez e tenha acesso vitalício. <a href="#" className="underline">Aplicam termos</a>.
            </p>
          </div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div 
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/20"
        >
          <ChevronDown size={24} />
        </motion.div>
      </div>

      {/* Feature Section: What you find inside */}
      <div className="py-24 px-4 md:px-12 bg-black border-y border-white/5">
        <div className="max-w-7xl mx-auto space-y-20">
          <div className="text-center space-y-2">
            <span className="text-f1-blue font-black tracking-[0.4em] text-[10px] uppercase">Muito mais que corridas</span>
            <h2 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase">O QUE VOCÊ ENCONTRA</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "ACERVO HISTÓRICO",
                desc: "Todo o conteúdo da F1 de 1950 até a temporada atual. Corridas completas separadas por ano e GP.",
                icon: <History size={32} className="text-f1-blue" />
              },
              {
                title: "ORIGINAIS & DOCS",
                desc: "Séries exclusivas, documentários biográficos e bastidores que você não encontra em nenhum outro lugar.",
                icon: <Film size={32} className="text-f1-blue" />
              },
              {
                title: "DOWNLOADS LIBERADOS",
                desc: "Baixe suas corridas favoritas para assistir offline no avião ou onde estiver (Plano Premium).",
                icon: <Download size={32} className="text-f1-blue" />
              }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -5 }}
                className="p-8 rounded-[2rem] bg-dark-card border border-white/5 hover:border-f1-blue/20 transition-all text-center space-y-6"
              >
                <div className="mx-auto w-16 h-16 rounded-2xl bg-f1-blue/5 flex items-center justify-center border border-f1-blue/10">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-black italic tracking-tighter uppercase">{feature.title}</h3>
                <p className="text-gray-400 text-xs font-medium leading-relaxed opacity-70">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Plans Section */}
      <div id="plans" className="py-24 px-4 md:px-12 relative">
        <div className="relative z-10 flex flex-col items-center">
          <h2 className="text-3xl md:text-5xl font-black mb-4 italic tracking-tighter uppercase text-center">
            OFERTA INÉDITA E IMPERDÍVEL
          </h2>
          <span className="text-gray-500 mb-10 text-[10px] font-black uppercase tracking-[0.3em]">APROVEITE ENQUANTO É TEMPO</span>
          
          {/* Billing Cycle Toggle */}
          <div className="flex items-center bg-white/5 p-1 rounded-full mb-16 border border-white/10">
            <button 
              onClick={() => setBillingCycle('monthly')}
              className={cn(
                "px-10 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                billingCycle === 'monthly' ? "bg-white text-black shadow-lg" : "text-gray-500 hover:text-white"
              )}
            >
              MENSAL
            </button>
            <button 
              onClick={() => setBillingCycle('annual')}
              className={cn(
                "px-10 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                billingCycle === 'annual' ? "bg-white text-black shadow-lg" : "text-gray-500 hover:text-white"
              )}
            >
              VITALÍCIO
            </button>
          </div>

          <div className="flex flex-wrap justify-center gap-6 w-full max-w-6xl mx-auto">
            {/* Free */}
            <div className="p-8 rounded-[2.5rem] border border-white/5 bg-dark-card w-full md:w-[320px] flex flex-col transition-all hover:border-white/10 shrink-0">
               <div className="h-1 bg-white/5 rounded-full mb-6 overflow-hidden">
                  <div className="h-full bg-f1-blue w-1/3" />
               </div>
              <div className="mb-6 text-white text-left">
                <h3 className="text-xl font-bold mb-1">Plano Free</h3>
                <p className="text-gray-500 text-[10px] uppercase font-black tracking-widest">ACESSO BÁSICO COM ANÚNCIOS</p>
              </div>
              <ul className="space-y-4 mb-10 flex-1">
                <li className="flex items-start gap-3 text-xs text-gray-400 font-medium tracking-tight">
                  <ChevronRight size={14} className="text-f1-blue shrink-0 mt-0.5" /> 
                  Comunidade no Telegram
                </li>
                <li className="flex items-start gap-3 text-xs text-gray-400 font-medium tracking-tight">
                  <ChevronRight size={14} className="text-f1-blue shrink-0 mt-0.5" /> 
                  Apenas corridas em HD
                </li>
                <li className="flex items-start gap-3 text-xs text-gray-400 font-medium tracking-tight">
                  <ChevronRight size={14} className="text-f1-blue shrink-0 mt-0.5" /> 
                  Apenas temporada atual ({CURRENT_YEAR}+)
                </li>
                <li className="flex items-start gap-3 text-xs text-gray-400 font-medium tracking-tight">
                  <ChevronRight size={14} className="text-f1-blue shrink-0 mt-0.5" /> 
                  R$10 / temporada avulsa
                </li>
                <li className="flex items-start gap-3 text-xs text-gray-400 font-medium tracking-tight">
                  <ChevronRight size={14} className="text-f1-blue shrink-0 mt-0.5" /> 
                  Participação em Sorteios
                </li>
              </ul>
              <div className="text-3xl font-black italic tracking-tighter uppercase mb-6 text-white text-left">GRÁTIS</div>
              <Link to="/login" className="w-full bg-white/10 text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-widest text-center hover:bg-white/20 transition-all uppercase">MANTER PLANO ATUAL</Link>
            </div>

            {/* Monthly / Standard */}
            {billingCycle === 'monthly' && (
              <div className="p-8 rounded-[2.5rem] border border-f1-blue/20 bg-white/5 w-full md:w-[320px] flex flex-col shadow-2xl relative shrink-0">
                 <div className="h-1 bg-white/5 rounded-full mb-6 overflow-hidden">
                    <div className="h-full bg-f1-blue w-2/3" />
                 </div>
                <div className="mb-6 text-white text-left">
                  <h3 className="text-xl font-bold mb-1">Plano Mensal</h3>
                  <p className="text-f1-blue text-[10px] uppercase font-black tracking-widest">ACESSO PREMIUM</p>
                </div>
                <ul className="space-y-4 mb-10 flex-1">
                  <li className="flex items-start gap-3 text-xs text-gray-300 font-medium tracking-tight">
                    <ChevronRight size={14} className="text-f1-blue shrink-0 mt-0.5" /> 
                    Acervo 1981 - Atual
                  </li>
                  <li className="flex items-start gap-3 text-xs text-gray-300 font-medium tracking-tight">
                    <ChevronRight size={14} className="text-f1-blue shrink-0 mt-0.5" /> 
                    Filmes, Séries e Documentários
                  </li>
                  <li className="flex items-start gap-3 text-xs text-gray-300 font-medium tracking-tight">
                    <ChevronRight size={14} className="text-f1-blue shrink-0 mt-0.5" /> 
                    Sem anúncios em todo o site
                  </li>
                  <li className="flex items-start gap-3 text-xs text-gray-300 font-medium tracking-tight">
                    <ChevronRight size={14} className="text-f1-blue shrink-0 mt-0.5" /> 
                    Canal VIP Telegram
                  </li>
                  <li className="flex items-start gap-3 text-xs text-gray-300 font-medium tracking-tight">
                    <ChevronRight size={14} className="text-f1-blue shrink-0 mt-0.5" /> 
                    F1, F2, F3 e F1 Academy
                  </li>
                  <li className="flex items-start gap-3 text-xs text-gray-300 font-medium tracking-tight">
                    <ChevronRight size={14} className="text-f1-blue shrink-0 mt-0.5" /> 
                    Treinos Livres/ Sprints, etc
                  </li>
                  <li className="flex items-start gap-3 text-xs text-gray-300 font-medium tracking-tight">
                    <ChevronRight size={14} className="text-f1-blue shrink-0 mt-0.5" /> 
                    Onboards
                  </li>
                </ul>
                <div className="text-3xl font-black italic tracking-tighter uppercase mb-6 text-white text-left">
                  R$ 30,00<span className="text-sm font-normal text-gray-500 not-italic ml-1">/mês</span>
                </div>
                <a 
                  href="https://pay.hotmart.com/C102920427K?off=u3qbgrl1" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-f1-blue text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-widest text-center shadow-lg shadow-f1-blue/20 hover:opacity-90 transition-opacity"
                >
                  ASSINAR MENSAL
                </a>
              </div>
            )}

            {/* Platinum / Vitalício */}
            {billingCycle === 'annual' && (
              <div className="p-8 rounded-[2.5rem] border border-citrus-yellow/30 bg-white/5 w-full md:w-[320px] flex flex-col relative shrink-0 overflow-hidden">
                 <div className="absolute top-0 right-0 left-0 h-1 bg-citrus-yellow shadow-[0_0_15px_rgba(255,230,0,0.5)]" />
                 <div className="absolute top-4 right-4 bg-citrus-yellow text-black text-[8px] font-black px-3 py-1 rounded-full uppercase italic">OFERTA ESPECIAL</div>
                <div className="mb-6 text-white text-left mt-4">
                  <h3 className="text-xl font-bold mb-1 text-white">Plano Vitalício</h3>
                  <p className="text-citrus-yellow text-[10px] uppercase font-black tracking-widest">ACESSO COMPLETO E ETERNO</p>
                </div>
                <div className="mb-6 text-left">
                  <div className="text-gray-500 line-through text-xs font-bold mb-1">De R$ 140,00</div>
                  <div className="text-4xl font-black text-citrus-yellow italic tracking-tighter uppercase">
                    R$ 50,00
                  </div>
                  <div className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-1">PAGAMENTO ÚNICO - ASSISTA PARA SEMPRE</div>
                </div>
                <ul className="space-y-4 mb-10 flex-1 text-left">
                  <li className="flex items-start gap-3 text-xs text-gray-200 font-medium tracking-tight">
                    <ChevronRight size={14} className="text-citrus-yellow shrink-0 mt-0.5" /> 
                    Acervo Completo 1950 - Atual
                  </li>
                  <li className="flex items-start gap-3 text-xs text-gray-200 font-medium tracking-tight">
                    <ChevronRight size={14} className="text-citrus-yellow shrink-0 mt-0.5" /> 
                    Tudo do plano mensal
                  </li>
                  <li className="flex items-start gap-3 text-xs text-gray-200 font-medium tracking-tight">
                    <ChevronRight size={14} className="text-citrus-yellow shrink-0 mt-0.5" /> 
                    F1, F2, F3 e F1 Academy
                  </li>
                  <li className="flex items-start gap-3 text-xs text-gray-200 font-medium tracking-tight">
                    <ChevronRight size={14} className="text-citrus-yellow shrink-0 mt-0.5" /> 
                    Treinos Livres/ Sprints, etc
                  </li>
                  <li className="flex items-start gap-3 text-xs text-gray-200 font-medium tracking-tight">
                    <ChevronRight size={14} className="text-citrus-yellow shrink-0 mt-0.5" /> 
                    Onboards
                  </li>
                </ul>
                <a 
                  href="https://pay.hotmart.com/C102920427K?off=5b3hm4un&checkoutMode=0" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-citrus-yellow text-black py-4 rounded-xl font-black text-[10px] uppercase tracking-widest text-center hover:opacity-90 transition-opacity"
                >
                  ASSINAR VITALÍCIO
                </a>
              </div>
            )}
          </div>

          {/* Disclaimer text */}
          <div className="mt-12 text-center max-w-2xl px-4 relative z-10">
            <p className="text-[10px] md:text-xs text-gray-400 leading-relaxed font-semibold">
              ⚠️ <strong>Aviso Importante:</strong> Esta promoção de plano vitalício é válida por tempo limitado. 
              Após assinar uma vez, não haverá mais nenhuma cobrança (mensal ou anual) e o seu acesso é eterno enquanto a comunidade GridPlay existir.
            </p>
          </div>
        </div>
      </div>


      {/* Community Section: VIP Telegram */}
      <div className="py-24 bg-gradient-to-b from-black to-dark-bg border-t border-white/5">
        <div className="max-w-6xl mx-auto px-4 md:px-0">
          <div className="bg-gradient-to-br from-f1-blue/10 via-white/5 to-transparent p-12 md:p-20 rounded-[3rem] border border-white/10 flex flex-col md:flex-row items-center gap-16 relative overflow-hidden">
             {/* Decorative Elements */}
             <div className="absolute -top-20 -right-20 w-80 h-80 bg-f1-blue rounded-full blur-[150px] opacity-20" />
             
             <div className="flex-1 space-y-8 z-10 text-center md:text-left text-white">
                <span className="inline-flex items-center gap-2 bg-[#24A1DE]/20 text-[#24A1DE] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                   <div className="w-1.5 h-1.5 bg-[#24A1DE] rounded-full animate-pulse" /> CANAL VIP TELEGRAM
                </span>
                <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase leading-none">
                   SUA COMUNIDADE <br /> DE AUTOMOBILISMO
                </h2>
                <p className="text-gray-400 md:text-lg font-medium leading-relaxed opacity-80 max-w-xl">
                   Não é apenas sobre assistir. É sobre viver a F1. Tenha suporte prioritário e discuta cada Grande Prêmio com quem entende do assunto.
                </p>
                <div className="grid grid-cols-2 gap-8 py-4 border-y border-white/10">
                   <div>
                      <div className="text-3xl font-black text-white italic">1981+</div>
                      <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Corridas no Acervo</div>
                   </div>
                   <div>
                      <div className="text-3xl font-black text-white italic">24/7</div>
                      <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Comunidade Ativa</div>
                   </div>
                </div>
             </div>

             <div className="shrink-0 z-10 w-full md:w-auto">
               <div className="relative group">
                  <div className="absolute inset-0 bg-[#24A1DE] rounded-full blur-[30px] opacity-20 group-hover:opacity-40 transition-opacity" />
                  <a 
                    href="https://t.me/+D15DI9e0ckc0NTQx" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative flex flex-col items-center bg-white text-black p-10 md:p-12 rounded-[3.5rem] space-y-4 hover:scale-105 transition-all shadow-2xl"
                  >
                     <img src="https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg" className="w-16 h-16" alt="Telegram" />
                     <div className="text-center font-black uppercase tracking-widest text-[10px]">
                        Entrar no Grupo <br /> <span className="text-f1-blue">GRATUITO</span>
                     </div>
                  </a>
               </div>
             </div>
          </div>
        </div>
      </div>

      <HighlightsSlider profile={profile} />
      <FAQ />
      
      {/* Mini Legal Footer */}
      <footer className="py-20 border-t border-white/5 text-center px-4">
        <p className="text-[10px] text-gray-600 max-w-2xl mx-auto leading-relaxed uppercase tracking-widest font-bold">
          © {CURRENT_YEAR} GRIDPLAY. Este site não é oficial e não está associado de forma alguma ao grupo de empresas da Formula 1. F1, FORMULA ONE, FORMULA 1, FIA FORMULA ONE WORLD CHAMPIONSHIP, GRAND PRIX e marcas relacionadas são marcas comerciais da Formula One Licensing B.V.
        </p>
      </footer>
    </div>
  );
};

// --- Pages ---

const Home = ({ profile }: { profile: Profile | null }) => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showPlansModal, setShowPlansModal] = useState(false);
  const [showFeaturedDetails, setShowFeaturedDetails] = useState(false);
  const [showVitalGiftModal, setShowVitalGiftModal] = useState(false);
  const [hasPromptedUpgrade, setHasPromptedUpgrade] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleCloseModal = () => setShowPlansModal(false);
    window.addEventListener('closePlansModal', handleCloseModal);
    return () => window.removeEventListener('closePlansModal', handleCloseModal);
  }, []);

  useEffect(() => {
    const fetchVideos = async () => {
      // Filtering to only show current Season on Home page carousels/feed
      // "Hidden" seasons will only be accessible via Archives and SeasonPage
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('year', CURRENT_YEAR) // Only show current year on Home
        .order('created_at', { ascending: true });
      
      if (data) setVideos(data);
      setLoading(false);
    };
    fetchVideos();
  }, []);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-dark-bg">
      <div className="w-12 h-12 border-4 border-f1-blue border-t-transparent rounded-full animate-spin" />
    </div>
  );

  // Re-enable landing page as home for visitors as requested
  if (!profile) return <LandingPage profile={profile} />;

  const featured = videos[videos.length - 1];
  const categories = Array.from(new Set(videos.map(v => v.category))) as string[];

  const handleWatchClick = (videoId: string) => {
    if (!profile) {
      setShowLoginModal(true);
    } else {
      navigate(`/watch/${videoId}`);
    }
  };

  return (
    <div className="min-h-screen bg-black overflow-x-hidden">
      {featured && (
        <FeaturedDetailsModal 
          isOpen={showFeaturedDetails} 
          onClose={() => setShowFeaturedDetails(false)} 
          video={featured} 
        />
      )}
      {/* Hero Section - The "MAX" Experience */}
      {featured && (
        <div className="relative h-screen md:h-[90vh] w-full overflow-hidden">
          <img 
            src={featured.thumbnail_url || `https://i.ibb.co/PZyYkyPt/capa-bh-hero-section-GRIDPLAY-F1.jpg`} 
            className="w-full h-full object-cover"
            alt="Featured Content"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://i.ibb.co/PZyYkyPt/capa-bh-hero-section-GRIDPLAY-F1.jpg`;
            }}
          />
          
          {/* Gradients to match MAX style */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />
          <div className="absolute inset-0 streaming-gradient opacity-60" />
          
          <div className="absolute bottom-0 left-0 w-full p-6 md:p-16 z-20">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="max-w-4xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-citrus-yellow text-black text-[10px] md:text-xs font-black px-3 py-1 rounded-full uppercase italic tracking-widest shadow-lg">Destaque Premium</span>
                <span className="text-gray-400 text-xs md:text-sm font-bold uppercase tracking-widest">{featured.year} • {featured.category}</span>
              </div>
              
              <h1 className="text-4xl md:text-8xl font-black mb-4 italic tracking-tighter uppercase leading-[0.9] drop-shadow-2xl">
                {featured.title}
              </h1>
              
              {!(profile && profile.subscription_status === 'ACTIVE' && profile.plan !== 'FREE') && (
                <div className="flex items-center gap-4 mb-8">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-citrus-yellow font-black uppercase tracking-[0.2em]">A partir de</span>
                    <div className="text-3xl md:text-5xl font-black text-white italic tracking-tighter leading-none">
                      R$ 14,00<span className="text-sm md:text-lg font-normal text-gray-400 not-italic ml-1">/mês</span>
                    </div>
                  </div>
                  <div className="h-10 w-px bg-white/20 ml-4" />
                  <div className="flex flex-col ml-4">
                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">Plano Anual</span>
                    <span className="text-white font-bold text-xs uppercase tracking-widest">2 Meses Grátis</span>
                  </div>
                </div>
              )}

              <p className="text-gray-300 text-sm md:text-xl mb-10 max-w-2xl font-medium opacity-90 line-clamp-3 leading-relaxed">
                {featured.description}
              </p>
              
              <div className="flex flex-wrap items-center gap-4">
                {profile ? (
                  <>
                    <button 
                      onClick={() => handleWatchClick(featured.id)}
                      className="bg-white text-black px-12 py-5 rounded-full font-black text-sm uppercase tracking-widest flex items-center gap-3 hover:scale-105 transition-transform shadow-xl hover:bg-gray-200"
                    >
                      <Play size={20} fill="black" /> Assistir Agora
                    </button>
                    <button 
                      onClick={() => setShowFeaturedDetails(true)}
                      className="bg-white/10 text-white border border-white/20 px-8 py-5 rounded-full font-bold text-sm uppercase tracking-widest flex items-center gap-2 hover:bg-white/20 transition-all backdrop-blur-md"
                    >
                      <Info size={18} /> Detalhes
                    </button>
                  </>
                ) : (
                  <div className="flex flex-wrap gap-4">
                    <button 
                      onClick={() => setShowLoginModal(true)}
                      className="inline-flex items-center gap-3 bg-f1-blue text-white px-12 py-5 rounded-full font-black text-sm uppercase tracking-widest hover:scale-105 transition-transform shadow-[0_0_30px_rgba(38,169,224,0.3)]"
                    >
                      <User size={20} />
                      Entrar
                    </button>
                    <button 
                      onClick={() => setShowPlansModal(true)}
                      className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md text-white border border-white/20 px-12 py-5 rounded-full font-black text-sm uppercase tracking-widest hover:bg-white/20 transition-all shadow-xl"
                    >
                      <CreditCard size={20} />
                      Ver Planos
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* Main Content Area - Dark & Immersive */}
      <div className="relative z-10 mt-8 md:-mt-20 px-4 md:px-12 space-y-16 pb-24">
        
        {/* Premium Quick Access - Only for Paid Users */}
        {profile && profile.subscription_status === 'ACTIVE' && profile.plan !== 'FREE' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-[1440px] mx-auto"
          >
            <div className="bg-gradient-to-tr from-f1-blue/20 via-black to-citrus-yellow/5 p-8 md:p-12 rounded-[2.5rem] border border-f1-blue/20 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-f1-blue/10 rounded-full -mr-32 -mt-32 blur-3xl" />
              
              <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <Trophy className="text-citrus-yellow" size={24} />
                    <span className="text-f1-blue font-black tracking-widest text-[10px] uppercase">Acessos Premium Centralizados</span>
                  </div>
                  <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter mb-4">
                    Canais de <span className="text-f1-blue">Transmissão VIP</span>
                  </h2>
                  <p className="text-gray-400 max-w-xl text-sm md:text-base font-medium">
                    Assinante Premium tem acesso direto aos nossos centros de conteúdo no Telegram. Sem anúncios, com download liberado e alta definição.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full lg:w-auto">
                  <a 
                    href="https://t.me/c/3849731179/1"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-4 bg-white/5 hover:bg-white/10 border border-white/10 p-4 rounded-2xl transition-all group shadow-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-500">
                        <Film size={20} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest">Onboarding {CURRENT_YEAR}</span>
                    </div>
                    <ExternalLink size={14} className="opacity-40 group-hover:opacity-100 group-hover:text-f1-blue transition-all" />
                  </a>

                  <a 
                    href="https://t.me/+j1Kkc9CuBqkxNmVh"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-4 bg-white/5 hover:bg-white/10 border border-white/10 p-4 rounded-2xl transition-all group shadow-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-f1-blue/20 flex items-center justify-center text-f1-blue">
                        <span className="font-black italic text-xs">F2</span>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest">Acesso Formula 2</span>
                    </div>
                    <ExternalLink size={14} className="opacity-40 group-hover:opacity-100 group-hover:text-f1-blue transition-all" />
                  </a>

                  <a 
                    href="https://t.me/+j1Kkc9CuBqkxNmVh"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-4 bg-white/5 hover:bg-white/10 border border-white/10 p-4 rounded-2xl transition-all group shadow-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center text-yellow-500">
                        <span className="font-black italic text-xs">F3</span>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest">Acesso Formula 3</span>
                    </div>
                    <ExternalLink size={14} className="opacity-40 group-hover:opacity-100 group-hover:text-f1-blue transition-all" />
                  </a>

                  <a 
                    href="https://t.me/c/3450722716/723"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-4 bg-white/5 hover:bg-white/10 border border-white/10 p-4 rounded-2xl transition-all group shadow-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center text-pink-500">
                        <Users size={20} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest">F1 Academy</span>
                    </div>
                    <ExternalLink size={14} className="opacity-40 group-hover:opacity-100 group-hover:text-f1-blue transition-all" />
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Season Promo Banner */}
        <div className="max-w-[1440px] mx-auto">
          <Link 
            to={`/season/${CURRENT_YEAR}`}
            className="group relative block w-full h-48 md:h-72 rounded-[2.5rem] overflow-hidden border border-white/10 hover:border-f1-blue/50 transition-all duration-700 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] bg-dark-card"
          >
            <img 
              src="https://i.ibb.co/ZzrBvMw7/onboad-camera-f1.jpg" 
              alt={`Temporada ${CURRENT_YEAR}`}
              className="w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-1000 grayscale group-hover:grayscale-0"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-center p-8 md:p-16">
              <span className="text-f1-blue font-black tracking-[0.3em] text-[10px] mb-3 block uppercase">Exclusivo GridPlay</span>
              <h2 className="text-3xl md:text-6xl font-black italic tracking-tighter uppercase mb-4 leading-none">Temporada {CURRENT_YEAR}</h2>
              <p className="text-gray-400 text-xs md:text-base max-w-lg font-medium mb-8 opacity-80">Experimente a adrenalina pura com câmeras onboard exclusivas e telemetria em tempo real.</p>
              <div className="flex items-center gap-3 text-white font-black text-[10px] md:text-xs uppercase tracking-widest group-hover:gap-5 transition-all">
                EXPLORAR TEMPORADA <div className="w-10 h-px bg-f1-blue group-hover:w-16 transition-all" /> <ChevronRight size={16} />
              </div>
            </div>
          </Link>
        </div>

        <div className="max-w-[1440px] mx-auto mt-20">
           <LiveTrackingCard />
        </div>

        {/* Dynamic Carousels per Category */}
        {categories.map((cat, idx) => (
          <div key={cat} className="space-y-8">
            <div className="flex items-end justify-between">
              <h2 className="text-xl md:text-3xl font-black italic uppercase tracking-tighter flex items-center gap-4">
                <span className="w-2 h-10 bg-f1-blue rounded-full" />
                {cat}
              </h2>
              <button className="text-[10px] text-gray-500 font-bold uppercase tracking-widest border-b border-white/10 pb-1 hover:text-white transition-colors">
                Ver Tudo
              </button>
            </div>
            
            <CategoryCarousel 
              videos={videos.filter(v => v.category === cat)}
              onVideoClick={handleWatchClick}
            />
            {idx === 0 && <AdBanner profile={profile} />}
          </div>
        ))}

        {/* Highlights Section */}
        <div className="-mx-4 md:-mx-12">
          <HighlightsSlider profile={profile} />
        </div>

        {/* Telegram VIP Section - Polished */}
        {profile && (
          <div className={cn(
            "p-10 md:p-20 rounded-[3rem] flex flex-col md:flex-row items-center justify-between gap-12 border transition-all duration-1000",
            profile.plan === 'FREE' 
              ? "bg-dark-card border-white/5" 
              : "bg-gradient-to-tr from-f1-blue/10 via-black to-citrus-yellow/5 border-f1-blue/20 shadow-[0_0_100px_rgba(38,169,224,0.05)]"
          )}>
            <div className="flex-1 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-f1-blue/10 flex items-center justify-center rotate-3">
                  <span className="text-f1-blue text-xl">🚀</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter">
                  {profile.plan === 'FREE' ? "Comunidade GridPlay" : "Canal VIP Telegram"}
                </h2>
              </div>
              
              <p className="text-gray-400 text-sm md:text-xl max-w-2xl leading-relaxed font-medium opacity-80">
                {profile.plan === 'FREE' 
                  ? "Junte-se a milhares de fãs e discuta cada curva em tempo real. Acesse o conteúdo gratuito e receba alertas de novos uploads." 
                  : "Experiência definitiva ativada. No Canal VIP você tem o acervo histórico em mãos, suporte prioritário e downloads ilimitados."}
              </p>

              {profile.plan === 'FREE' && (
                <Link to="/checkout" className="inline-flex items-center gap-3 text-citrus-yellow font-black text-xs uppercase tracking-[0.2em] group">
                  DESBLOQUEAR ACERVO COMPLETO 1950-{CURRENT_YEAR} 
                  <ChevronRight size={16} className="group-hover:translate-x-2 transition-transform" />
                </Link>
              )}
            </div>

            <div className="shrink-0 w-full md:w-auto">
              <a 
                href={profile.plan === 'FREE' ? "https://t.me/+D15DI9e0ckc0NTQx" : "https://t.me/+NkAHGmviP0kxYzZh"} 
                target="_blank" 
                rel="noreferrer" 
                className={cn(
                  "w-full md:w-auto px-12 py-6 rounded-full font-black uppercase tracking-widest text-sm flex items-center justify-center gap-4 transition-all hover:scale-105 shadow-2xl",
                  profile.plan === 'FREE' 
                    ? "bg-white text-black hover:bg-gray-100" 
                    : "bg-[#24A1DE] text-white hover:shadow-[#24A1DE]/40"
                )}
              >
                <ExternalLink size={24} /> 
                {profile.plan === 'FREE' ? "Entrar no Grupo Grátis" : "Acessar Canal VIP"}
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Reused Modals Section for consistent logic */}
      <AnimatePresence>
        {showLoginModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLoginModal(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="relative w-full max-w-md bg-dark-card rounded-[2.5rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,1)] border border-white/10"
            >
              <button 
                onClick={() => setShowLoginModal(false)}
                className="absolute top-6 right-6 text-gray-500 hover:text-white z-20 transition-colors"
              >
                <X size={28} />
              </button>
              <div className="p-0">
                <Login isModal onLoginSuccess={() => setShowLoginModal(false)} />
              </div>
            </motion.div>
          </div>
        )}

        {showPlansModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPlansModal(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="relative w-full max-w-6xl bg-black rounded-[3rem] overflow-y-auto max-h-[95vh] shadow-[0_0_100px_rgba(0,0,0,1)] border border-white/10 p-8 md:p-20"
            >
              <button 
                onClick={() => setShowPlansModal(false)}
                className="absolute top-8 right-8 text-gray-500 hover:text-white z-20 transition-colors"
              >
                <X size={28} />
              </button>
              <Checkout isModal />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const LiveTrackingCard = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [weather, setWeather] = useState<Weather | null>(null);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    const fetchLive = async () => {
      let s: Session | null = null;
      let targetVideo: Video | null = null;

      try {
        const { data: latestVideos } = await supabase
          .from('videos')
          .select('*')
          .neq('status', 'ARCHIVED')
          .order('created_at', { ascending: false })
          .limit(1);
          
        if (latestVideos && latestVideos.length > 0) {
          targetVideo = latestVideos[0];
        }
      } catch (err) {
        console.error('Error fetching latest video from supabase for LiveTrackingCard:', err);
      }

      if (targetVideo) {
        const normalizeText = (text: string) => 
          text ? text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase() : '';

        // Simple keyword matching (e.g., GP name)
        const titleNormalized = normalizeText(targetVideo.title);
        const keywords = titleNormalized
          .split(/[\s-—_]+/)
          .map(k => k.trim())
          .filter(k => k.length > 2 && !['formula', 'grand', 'prix', 'video', 'corrida', 'etapa', 'treino', 'classificacao', 'gp', 'de', 'do', 'da', 'ao', 'tempo', 'real', 'vivo'].includes(k));

        // Maps Portuguese GP countries & locations to OpenF1 English values
        const countryMappings: { [key: string]: string[] } = {
          'canada': ['canada', 'montreal'],
          'monaco': ['monaco', 'monte carlo'],
          'espanha': ['spain', 'barcelona', 'catalunya'],
          'catalunha': ['spain', 'barcelona', 'catalunya'],
          'inglaterra': ['great britain', 'silverstone', 'united kingdom'],
          'gra-bretanha': ['great britain', 'silverstone', 'united kingdom'],
          'italia': ['italy', 'monza', 'imola', 'milan'],
          'belgica': ['belgium', 'spa', 'francorchamps'],
          'holanda': ['netherlands', 'zandvoort'],
          'austria': ['austria', 'spielberg', 'red bull ring'],
          'hungria': ['hungary', 'budapest', 'hungaroring'],
          'singapura': ['singapore', 'marina bay'],
          'cingapura': ['singapore', 'marina bay'],
          'japao': ['japan', 'suzuka'],
          'eua': ['united states', 'austin', 'miami', 'las vegas'],
          'estados unidos': ['united states', 'austin', 'miami', 'las vegas'],
          'azerbaijao': ['azerbaijan', 'baku'],
          'catar': ['qatar', 'lusail'],
          'arabia saudita': ['saudi arabia', 'jeddah'],
          'bahrein': ['bahrain', 'sakhir'],
          'emirados arabes': ['abu dhabi', 'yas marina'],
          'sao paulo': ['brazil', 'sao paulo', 'interlagos'],
          'brasil': ['brazil', 'sao paulo', 'interlagos'],
        };

        const searchTerms = [...keywords];
        keywords.forEach(k => {
          if (countryMappings[k]) {
            searchTerms.push(...countryMappings[k]);
          }
        });

        // Try looking up the current live session first
        try {
          const liveSession = await openF1Service.getLatestSession();
          if (liveSession) {
            const locLoc = normalizeText(liveSession.location);
            const countryLoc = normalizeText(liveSession.country_name);
            const nameLoc = normalizeText(liveSession.session_name);
            
            const matchesLive = searchTerms.some(term => 
              locLoc.includes(term) || 
              countryLoc.includes(term) ||
              nameLoc.includes(term)
            );

            if (matchesLive || targetVideo.title.toLowerCase().includes('ao vivo')) {
              s = liveSession;
            }
          }
        } catch (e) {
          console.error('Error finding live session in LiveTrackingCard:', e);
        }

        // If no matches found in active live session, fallback to search in the video's year or current year
        if (!s) {
          const yearsToSearch = [
            targetVideo.year,
            new Date().getFullYear(),
            2024,
            2023
          ];
          const uniqueYears = Array.from(new Set(yearsToSearch.filter(y => typeof y === 'number' && y > 1950)));

          for (const searchYear of uniqueYears) {
            try {
              const yearSessions = await openF1Service.getSessionsByYear(searchYear);
              if (yearSessions && yearSessions.length > 0) {
                const matched = yearSessions.filter(item => {
                  const locLoc = normalizeText(item.location);
                  const countryLoc = normalizeText(item.country_name);
                  const nameLoc = normalizeText(item.session_name);
                  return searchTerms.some(term => 
                    locLoc.includes(term) || 
                    countryLoc.includes(term) ||
                    nameLoc.includes(term)
                  );
                });
                
                if (matched.length > 0) {
                  // Prefer the race session, otherwise take first match
                  s = matched.find(item => normalizeText(item.session_name).includes('race')) || matched[0];
                  break; 
                }
              }
            } catch (err) {
              console.error(`Error searching sessions for year ${searchYear} in LiveTrackingCard:`, err);
            }
          }
        }
      }

      // Final fallback to standard latest session if we still don't have a session
      if (!s) {
        s = await openF1Service.getLatestSession();
      }

      if (s) {
        const now = new Date();
        const start = new Date(s.date_start);
        const end = s.date_end ? new Date(s.date_end) : new Date(start.getTime() + 3 * 60 * 60 * 1000);
        const live = now >= start && now <= new Date(end.getTime() + 15 * 60 * 1000);
        setIsLive(live);
        setSession(s);
        
        // Fetch weather data for this session (whether active or completed)
        const w = await openF1Service.getWeather(s.session_key);
        setWeather(w);
      }
    };
    fetchLive();
    const interval = setInterval(fetchLive, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!session) return null;

  return (
    <div className="mb-16">
      <div className="flex items-center gap-3 mb-8 px-4 md:px-0">
        <div className="w-1.5 h-8 bg-f1-blue" />
        <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter">Live Telemetry</h2>
        <span className="ml-auto bg-f1-blue/20 text-f1-blue text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-2">
          {isLive ? (
            <>
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" /> EM TEMPO REAL
            </>
          ) : (
            <>
              <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-pulse" /> ÚLTIMA ETAPA CONCLUÍDA
            </>
          )}
        </span>
      </div>

      <div className="bg-dark-card border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-white/10">
          <div className="p-8 space-y-4">
             <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Sessão Atual</span>
             <div className="space-y-1">
               <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white leading-none">{session.country_name}</h3>
               <p className="text-f1-blue font-black uppercase tracking-widest text-xs italic">{session.session_name}</p>
             </div>
             <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest pt-2">
               Circuito: <span className="text-gray-300">{session.circuit_short_name}</span>
             </p>
          </div>

          <div className="p-8 bg-white/5 space-y-6">
             <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                   <div className="flex items-center gap-2 text-gray-500">
                      <Thermometer size={14} />
                      <span className="text-[8px] font-black uppercase tracking-widest">Pista</span>
                   </div>
                   <div className="text-2xl font-black italic text-white leading-none">{weather?.track_temperature || '--'}°C</div>
                </div>
                <div className="space-y-2 text-right lg:text-left">
                   <div className="flex items-center gap-2 text-gray-500 justify-end lg:justify-start">
                      <CloudRain size={14} />
                      <span className="text-[8px] font-black uppercase tracking-widest">Precipitação</span>
                   </div>
                   <div className="text-2xl font-black italic text-white leading-none">{weather?.rainfall || 0}%</div>
                </div>
             </div>
             <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-widest text-gray-500">
                   <span>Umidade do Ar</span>
                   <span className="text-white">{weather?.humidity || '--'} %</span>
                </div>
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                   <div className="h-full bg-f1-blue transition-all duration-1000" style={{ width: `${weather?.humidity || 0}%` }} />
                </div>
             </div>
          </div>

          <div className="p-8 flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-f1-blue/5 to-transparent">
             <div className="text-center space-y-4 z-10">
                <span className={cn(
                  "inline-block py-1 px-3 rounded-full text-[8px] font-black uppercase tracking-[0.2em] mb-2",
                  isLive ? "bg-red-500/20 text-red-400 animate-pulse" : "bg-white/10 text-gray-400"
                )}>
                  {isLive ? "Race Active" : "Race Concluded"}
                </span>
                <img 
                  src="https://www.formula1.com/etc/designs/fom-website/images/f1_logo.svg" 
                  className="h-4 mx-auto invert opacity-50 grayscale" 
                  alt="F1"
                />
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
                  OpenF1 Real-time <br /> Telemetry Integration
                </p>
             </div>
             <div className="absolute top-0 right-0 w-32 h-32 bg-f1-blue rounded-full blur-[80px] opacity-10" />
          </div>
        </div>
      </div>
    </div>
  );
};

const SeasonSelector = ({ year, availableYears, onSelect }: { year: string | undefined, availableYears: number[], onSelect: (y: number) => void }) => {
  const [showSeasonDropdown, setShowSeasonDropdown] = useState(false);
  const [liveYear, setLiveYear] = useState<number | null>(null);

  useEffect(() => {
    const checkLiveYear = async () => {
      const s = await openF1Service.getLatestSession();
      if (s) {
        const start = new Date(s.date_start);
        setLiveYear(start.getFullYear());
      }
    };
    checkLiveYear();
  }, []);

  return (
    <div className="relative inline-block">
      <button 
        onClick={() => setShowSeasonDropdown(!showSeasonDropdown)}
        className="flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-3 rounded-xl hover:bg-white/10 transition-all group"
      >
        <span className="text-sm font-black italic uppercase tracking-tighter">Temporada {year || CURRENT_YEAR.toString()}</span>
        {liveYear === parseInt(year || CURRENT_YEAR.toString()) && (
          <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
        )}
        <ChevronDown size={18} className={cn("transition-transform duration-300", showSeasonDropdown ? "rotate-180" : "")} />
      </button>

      <AnimatePresence>
        {showSeasonDropdown && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full left-0 mt-2 w-48 bg-dark-card border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl"
          >
            {availableYears.map((y) => (
              <button
                key={y}
                onClick={() => {
                  onSelect(y);
                  setShowSeasonDropdown(false);
                }}
                className={cn(
                  "w-full text-left px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-white/5 transition-colors flex items-center justify-between",
                  parseInt(year || CURRENT_YEAR.toString()) === y ? "text-f1-blue bg-f1-blue/5" : "text-gray-400"
                )}
              >
                Temporada {y}
                {y === liveYear && (
                   <span className="w-1 h-1 bg-red-500 rounded-full animate-pulse" />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const HorizontalRaceSlider = ({ videos, currentVideoId, onVideoClick }: { videos: Video[], currentVideoId?: string, onVideoClick: (id: string) => void }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = window.innerWidth < 768 ? 300 : 500;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="relative group">
      {/* Scroll Buttons */}
      <div className="absolute top-1/2 -translate-y-1/2 -left-4 md:-left-6 z-20 opacity-0 group-hover:opacity-100 transition-all pointer-events-none">
        <button 
          onClick={() => scroll('left')}
          className="bg-black/80 hover:bg-f1-blue text-white p-3 rounded-full border border-white/10 shadow-2xl transition-all hover:scale-110 active:scale-95 pointer-events-auto"
        >
          <ChevronLeft size={20} />
        </button>
      </div>

      <div className="absolute top-1/2 -translate-y-1/2 -right-4 md:-right-6 z-20 opacity-0 group-hover:opacity-100 transition-all pointer-events-none">
        <button 
          onClick={() => scroll('right')}
          className="bg-black/80 hover:bg-f1-blue text-white p-3 rounded-full border border-white/10 shadow-2xl transition-all hover:scale-110 active:scale-95 pointer-events-auto"
        >
          <ChevronRight size={20} />
        </button>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-6 custom-scrollbar snap-x scroll-smooth"
      >
        {videos.map((video) => (
          <div 
            key={video.id}
            onClick={() => onVideoClick(video.id)}
            className={cn(
              "relative flex-shrink-0 w-64 md:w-80 aspect-video bg-dark-card rounded-xl overflow-hidden group/card transition-all duration-300 snap-start border cursor-pointer",
              currentVideoId === video.id ? "border-f1-blue scale-100 ring-2 ring-f1-blue/50" : "border-white/5 hover:border-f1-blue/50 hover:scale-[1.02]"
            )}
          >
            <img 
              src={video.thumbnail_url || `https://picsum.photos/seed/${video.id}/600/338`} 
              alt={video.title}
              className="w-full h-full object-cover opacity-70 group-hover/card:opacity-100 transition-opacity"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${video.id}/600/338`;
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent flex flex-col justify-end p-4">
              <h3 className="text-sm md:text-base font-bold leading-tight group-hover/card:text-f1-blue transition-colors line-clamp-2">{video.title}</h3>
              <div className="flex items-center justify-between mt-2">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{video.year}</p>
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md group-hover/card:bg-f1-blue group-hover/card:text-white transition-all">
                  <Play size={14} fill="currentColor" />
                </div>
              </div>
            </div>
            {video.status === 'PREMIUM' && (
              <div className="absolute top-3 right-3 bg-citrus-yellow text-black text-[8px] font-black px-2 py-1 rounded-sm uppercase tracking-widest shadow-lg">PREMIUM</div>
            )}
            {currentVideoId === video.id && (
              <div className="absolute inset-0 bg-f1-blue/10 pointer-events-none" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const CategoryCarousel = ({ videos, onVideoClick }: { videos: Video[], onVideoClick: (id: string) => void }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = window.innerWidth < 768 ? 300 : 700;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="relative group/carousel">
      {/* Scroll Buttons */}
      <div className="absolute top-1/2 -translate-y-1/2 -left-4 md:-left-10 z-20 opacity-0 group-hover/carousel:opacity-100 transition-all pointer-events-none">
        <button 
          onClick={() => scroll('left')}
          className="bg-black/90 hover:bg-f1-blue text-white p-5 rounded-full border border-white/10 shadow-2xl transition-all hover:scale-110 active:scale-95 pointer-events-auto"
        >
          <ChevronLeft size={28} />
        </button>
      </div>

      <div className="absolute top-1/2 -translate-y-1/2 -right-4 md:-right-10 z-20 opacity-0 group-hover/carousel:opacity-100 transition-all pointer-events-none">
        <button 
          onClick={() => scroll('right')}
          className="bg-black/90 hover:bg-f1-blue text-white p-5 rounded-full border border-white/10 shadow-2xl transition-all hover:scale-110 active:scale-95 pointer-events-auto"
        >
          <ChevronRight size={28} />
        </button>
      </div>

      <div 
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto pb-6 custom-scrollbar snap-x -mx-4 md:mx-0 px-4 md:px-0 scroll-smooth"
      >
        {videos.map((video) => (
          <div 
            key={video.id}
            onClick={() => onVideoClick(video.id)}
            className="relative flex-shrink-0 w-72 md:w-[450px] aspect-video bg-dark-card rounded-2xl overflow-hidden group/card transition-all duration-500 hover:scale-[1.03] snap-start border border-white/5 hover:border-f1-blue/30 cursor-pointer shadow-2xl"
          >
            <img 
              src={video.thumbnail_url || `https://picsum.photos/seed/${video.id}/800/450`} 
              alt={video.title}
              className="w-full h-full object-cover opacity-60 group-hover/card:opacity-100 transition-all duration-500 group-hover/card:scale-110"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${video.id}/800/450`;
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent flex flex-col justify-end p-8 translate-y-2 group-hover/card:translate-y-0 transition-transform">
              <span className="text-f1-blue font-black tracking-widest text-[10px] uppercase mb-2">EPISÓDIO</span>
              <h3 className="text-sm md:text-xl font-black italic uppercase tracking-tight group-hover/card:text-f1-blue transition-colors mb-3 leading-tight line-clamp-2">{video.title}</h3>
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{video.year} • {video.category}</p>
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md group-hover/card:bg-f1-blue group-hover/card:text-white transition-all shadow-lg">
                  <Play size={20} fill="currentColor" />
                </div>
              </div>
            </div>
            {video.status === 'PREMIUM' && (
              <div className="absolute top-4 right-4 bg-citrus-yellow text-black text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-xl">PREMIUM</div>
            )}
            <div className="absolute inset-0 border-[3px] border-transparent group-hover/card:border-f1-blue/20 rounded-2xl transition-colors pointer-events-none" />
          </div>
        ))}
      </div>
    </div>
  );
};

const SeasonPage = ({ profile }: { profile: Profile | null }) => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showPlansModal, setShowPlansModal] = useState(false);
  const { year } = useParams();
  const navigate = useNavigate();

  const currentYear = parseInt(year || CURRENT_YEAR.toString());

  useEffect(() => {
    const checkAccess = async () => {
      if (!profile) {
        setHasAccess(false);
        setLoading(false);
        return;
      }

      if (profile.role === 'admin') {
        setHasAccess(true);
        fetchVideos();
        return;
      }

      if (profile.subscription_status === 'ACTIVE' && profile.plan !== 'FREE') {
        setHasAccess(true);
        fetchVideos();
        return;
      }

      if (currentYear === CURRENT_YEAR) {
        setHasAccess(true);
        fetchVideos();
        return;
      }

      const { data: purchase } = await supabase
        .from('f1season_purchases')
        .select('*')
        .eq('user_id', profile.id)
        .eq('season_year', currentYear)
        .eq('status', 'ACTIVE')
        .maybeSingle();

      if (purchase) {
        setHasAccess(true);
        fetchVideos();
      } else {
        setHasAccess(false);
        setLoading(false);
      }
    };

    const fetchVideos = async () => {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('year', currentYear)
        .order('created_at', { ascending: true });

      if (error) {
        console.error("Error fetching season videos:", error);
      } else {
        setVideos(data || []);
      }
      setLoading(false);
    };

    checkAccess();
  }, [year, profile]);

  useEffect(() => {
    const fetchAvailableYears = async () => {
      const { data } = await supabase
        .from('videos')
        .select('year');
      
      if (data) {
        const years = Array.from(new Set(data.map(v => v.year))).sort((a, b) => b - a);
        setAvailableYears(years);
      }
    };
    fetchAvailableYears();
  }, []);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-dark-bg">
      <div className="w-12 h-12 border-4 border-f1-blue border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center px-4 pt-32">
        <div className="w-24 h-24 bg-f1-blue/10 rounded-full flex items-center justify-center mb-8 border border-f1-blue/20">
          <Lock className="text-f1-blue" size={40} />
        </div>
        <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-4">
          {!profile ? "CONTEÚDO EXCLUSIVO" : "Temporada Bloqueada"}
        </h2>
        <p className="text-gray-400 max-w-md mb-8 font-medium italic underline underline-offset-8 decoration-f1-blue/30">
          {!profile 
            ? "FAÇA LOGIN E CRIE CONTA GRÁTIS PARA VER - Se preferir sem anúncios e alta qualidade, torne-se Premium para liberar todo o acervo da temporada!"
            : "Você não tem acesso a esta temporada. Adquira o acesso individual ou torne-se Premium para liberar todo o acervo."
          }
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          {!profile ? (
            <Link 
              to="/login"
              className="bg-f1-blue text-white px-10 py-4 rounded-full font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform shadow-xl"
            >
              Fazer Login / Criar Conta
            </Link>
          ) : (
            <button 
              onClick={() => navigate('/archives')}
              className="bg-f1-blue text-white px-10 py-4 rounded-full font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform shadow-xl"
            >
              Ir para Arquivos
            </button>
          )}
          <button 
            onClick={() => document.getElementById('plans')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-white/10 text-white px-10 py-4 rounded-full font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all"
          >
            Ver Planos Premium
          </button>
        </div>
      </div>
    );
  }

  const featuredVideo = videos[videos.length - 1];
  const episodes = videos;

  const handleWatchClick = (videoId: string) => {
    if (!profile) {
      setShowLoginModal(true);
    } else {
      navigate(`/watch/${videoId}`);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg pt-20 pb-20">
      {featuredVideo ? (
        <div className="relative w-full h-[70vh] md:h-[85vh] overflow-hidden">
          <img 
            src={featuredVideo.thumbnail_url || `https://picsum.photos/seed/${featuredVideo.id}/1920/1080`} 
            alt={featuredVideo.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${featuredVideo.id}/1920/1080`;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-dark-bg/40 to-transparent" />
          
          <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-f1-blue text-white text-[10px] font-black px-2 py-1 rounded-sm uppercase tracking-widest">Destaque</span>
                <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">{featuredVideo.year} • {featuredVideo.category}</span>
              </div>
              <h1 className="text-4xl md:text-7xl font-black mb-6 italic tracking-tighter uppercase leading-tight drop-shadow-2xl">
                {featuredVideo.title}
              </h1>
              <p className="text-gray-300 text-sm md:text-lg mb-8 max-w-2xl font-medium opacity-90 line-clamp-3">
                {featuredVideo.description}
              </p>
              
              <div className="flex flex-wrap items-center gap-4">
                {profile ? (
                  <>
                    <button 
                      onClick={() => handleWatchClick(featuredVideo.id)}
                      className="inline-flex items-center gap-3 bg-white text-black px-10 py-4 rounded-full font-black text-sm uppercase tracking-widest hover:scale-105 transition-transform shadow-xl"
                    >
                      <Play size={20} fill="currentColor" />
                      Assistir Agora
                    </button>
                    <ReactionButton videoId={featuredVideo.id} profile={profile} />
                    <button 
                      onClick={() => document.getElementById('comments')?.scrollIntoView({ behavior: 'smooth' })}
                      className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 transition-all"
                    >
                      <MessageSquare size={18} />
                      <span className="text-xs font-bold uppercase tracking-widest">Comentar</span>
                    </button>
                  </>
                ) : (
                  <div className="flex flex-wrap gap-4">
                    <button 
                      onClick={() => setShowLoginModal(true)}
                      className="inline-flex items-center gap-3 bg-f1-blue text-white px-10 py-4 rounded-full font-black text-sm uppercase tracking-widest hover:scale-105 transition-transform shadow-xl"
                    >
                      <User size={20} />
                      Entrar
                    </button>
                    <button 
                      onClick={() => setShowPlansModal(true)}
                      className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md text-white border border-white/20 px-10 py-4 rounded-full font-black text-sm uppercase tracking-widest hover:bg-white/20 transition-all shadow-xl"
                    >
                      <CreditCard size={20} />
                      Ver Planos
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      ) : (
        <div className="h-[50vh] flex flex-col items-center justify-center text-center px-4">
          <History size={48} className="text-gray-700 mb-6" />
          <h2 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter text-gray-400 mb-2">
            VIDEOS SENDO CARREGADOS
          </h2>
          <p className="text-xs md:text-sm text-gray-600 max-w-md font-medium uppercase tracking-widest leading-relaxed">
            Se você adquiriu o acesso individual para este ano, por favor aguarde até <span className="text-f1-blue">24h</span> para que o acervo seja processado e disponibilizado para você aqui no site.
          </p>
        </div>
      )}

      <div className="px-4 md:px-12 mt-12 mb-8">
        <SeasonSelector 
          year={year} 
          availableYears={availableYears} 
          onSelect={(y) => navigate(`/season/${y}`)} 
        />
      </div>

      <AdBanner profile={profile} type="discreet" />

      <div className="px-4 md:px-12 mt-12">
        <h2 className="text-2xl md:text-3xl font-black mb-8 italic tracking-tighter uppercase flex items-center gap-3">
          <span className="w-2 h-8 bg-f1-blue" />
          Corridas Disponíveis
        </h2>
        
        <HorizontalRaceSlider 
          videos={episodes} 
          onVideoClick={handleWatchClick} 
        />
      </div>

      {featuredVideo && profile && (
        <div className="mt-12">
          <CommentSection videoId={featuredVideo.id} profile={profile} />
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {showLoginModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLoginModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-dark-card rounded-3xl overflow-hidden shadow-2xl border border-white/10"
            >
              <button 
                onClick={() => setShowLoginModal(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-white z-10"
              >
                <X size={24} />
              </button>
              <div className="p-0">
                <Login isModal onLoginSuccess={() => setShowLoginModal(false)} />
              </div>
            </motion.div>
          </div>
        )}

        {showPlansModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPlansModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-6xl bg-dark-bg rounded-3xl overflow-y-auto max-h-[90vh] shadow-2xl border border-white/10 p-8 md:p-12"
            >
              <button 
                onClick={() => setShowPlansModal(false)}
                className="absolute top-6 right-6 text-gray-500 hover:text-white z-10"
              >
                <X size={24} />
              </button>
              <Checkout isModal />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Archive = ({ profile }: { profile: Profile | null }) => {
  const [showPlansModal, setShowPlansModal] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [seasonLinks, setSeasonLinks] = useState<Record<number, string>>({});
  const [userPurchases, setUserPurchases] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  const seasons = Array.from({ length: 2025 - 1950 + 1 }, (_, i) => 2025 - i);
  const isPremium = profile?.subscription_status === 'ACTIVE' && profile?.plan !== 'FREE';

  useEffect(() => {
    const fetchData = async () => {
      // 1. Fetch official links
      const { data: links } = await supabase.from('f1season_links').select('year, telegram_link');
      if (links) {
        const linkMap = links.reduce((acc, curr) => ({ ...acc, [curr.year]: curr.telegram_link }), {});
        setSeasonLinks(linkMap);
      }

      // 2. Fetch user individual purchases
      if (profile) {
        const { data: purchases } = await supabase
          .from('f1season_purchases')
          .select('season_year')
          .eq('user_id', profile.id)
          .eq('status', 'ACTIVE');
        
        if (purchases) {
          setUserPurchases(purchases.map(p => p.season_year));
        }
      }
      setLoading(false);
    };
    fetchData();
  }, [profile]);

  return (
    <div className="min-h-screen bg-black pt-32 pb-24">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        <header className="mb-16">
          <div className="flex items-center gap-4 mb-4">
            <span className="h-px w-12 bg-f1-blue" />
            <span className="text-f1-blue font-black tracking-[0.4em] text-[10px] uppercase">Acervo Histórico</span>
          </div>
          <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter uppercase leading-[0.8] mb-8">
            Arquivos <br/> <span className="text-white/20">GridPlay</span>
          </h1>
          <p className="text-gray-400 max-w-2xl text-lg md:text-xl font-medium leading-relaxed">
            Acesso exclusivo a mais de 70 anos de história. Todas as eras da Fórmula 1 organizadas para você.
          </p>
        </header>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-f1-blue border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {seasons.map((year) => {
              const hasLink = !!seasonLinks[year];
              const hasIndividualAccess = userPurchases.includes(year);
              const canAccess = isPremium || hasIndividualAccess;
              
              return (
                <motion.div 
                  key={year}
                  whileHover={{ y: -10 }}
                  className="group relative bg-dark-card rounded-[2.5rem] border border-white/5 hover:border-f1-blue/40 transition-all duration-500 overflow-hidden shadow-2xl"
                >
                  <div className="aspect-[3.5/4] p-8 flex flex-col justify-between">
                    <div className="relative z-10">
                      <span className="text-f1-blue font-black tracking-widest text-[10px] uppercase block mb-2 opacity-60">Temporada</span>
                      <h3 className="text-5xl font-black italic tracking-tighter leading-none group-hover:text-f1-blue transition-colors">{year}</h3>
                      {hasIndividualAccess && (
                        <span className="inline-block mt-2 bg-green-500/10 text-green-500 text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-widest border border-green-500/20">Acesso Individual Ativo</span>
                      )}
                    </div>

                    <div className="relative z-10 space-y-4">
                      {canAccess ? (
                        <div className="space-y-3">
                          <button 
                            onClick={() => navigate(`/season/${year}`)}
                            className="w-full bg-f1-blue text-white py-4 rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:scale-105 transition-transform shadow-[0_15px_30px_rgba(38,169,224,0.3)]"
                          >
                            VER NO SITE
                          </button>

                          {isPremium && hasLink && (
                            <a 
                              href={seasonLinks[year]}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full bg-white/10 text-white py-4 rounded-full text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-white/20 transition-all border border-white/10"
                            >
                              ACESSAR TELEGRAM <ExternalLink size={14} />
                            </a>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-black text-citrus-yellow uppercase tracking-widest leading-none">Acesso Mensal</span>
                            <span className="text-xs font-bold text-white/60 leading-none">R$ 10,00 / temporada</span>
                          </div>
                          <button 
                            onClick={() => {
                              console.log("Opening Plans Modal for year:", year, "Profile:", profile?.id);
                              setSelectedYear(year);
                              setShowPlansModal(true);
                            }}
                            className="w-full bg-f1-blue text-white py-4 rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:scale-105 transition-transform shadow-[0_15px_30px_rgba(38,169,224,0.3)] block text-center"
                          >
                            ADQUIRIR ACESSO
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Background Number Accent */}
                  <div className="absolute -bottom-10 -right-10 text-[12rem] font-black italic text-white/[0.02] pointer-events-none group-hover:text-f1-blue/5 transition-colors leading-none tracking-tighter">
                    {year.toString().slice(-2)}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showPlansModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPlansModal(false)}
              className="absolute inset-0 bg-black/95 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="relative w-full max-w-6xl bg-black rounded-[3rem] overflow-y-auto max-h-[95vh] shadow-[0_0_100px_rgba(0,0,0,1)] border border-white/10 p-6 md:p-20 custom-scrollbar"
            >
              <button 
                onClick={() => setShowPlansModal(false)}
                className="absolute top-8 right-8 text-gray-500 hover:text-white z-20 transition-colors"
              >
                <X size={28} />
              </button>
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter mb-4">Escolha seu Acesso</h2>
                <p className="text-gray-400 max-w-xl mx-auto uppercase text-[10px] font-black tracking-[0.3em]">
                  {selectedYear 
                    ? `Você está adquirindo acesso à Temporada ${selectedYear}` 
                    : 'Torne-se premium para liberar todo o arquivo histórico.'}
                </p>
              </div>
              <Checkout isModal selectedYear={selectedYear} profile={profile} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const PlayStream = ({ profile }: { profile: Profile | null }) => {
  const navigate = useNavigate();
  const [contents, setContents] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const isPremium = profile && profile.subscription_status === 'ACTIVE' && profile.plan !== 'FREE';

  useEffect(() => {
    if (!isPremium) return;

    const fetchPlayStreamContent = async () => {
      setLoading(true);
      // Fetching contents categorized as Movies, Series, or Documentaries
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .in('category', ['Filmes', 'Séries', 'Documentários', 'Filme', 'Série', 'Documentário'])
        .order('created_at', { ascending: false });

      if (data) setContents(data);
      setLoading(false);
    };

    fetchPlayStreamContent();
  }, [isPremium]);

  if (!isPremium) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-dark-bg px-4 py-20 text-center relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-f1-blue rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-citrus-yellow rounded-full blur-[120px]" />
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 max-w-2xl bg-dark-card border border-white/10 p-12 rounded-[3rem] shadow-2xl backdrop-blur-xl"
        >
          <div className="w-20 h-20 bg-f1-blue/10 rounded-full flex items-center justify-center mb-8 mx-auto border border-f1-blue/20">
            <Lock className="text-f1-blue" size={32} />
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black mb-6 italic tracking-tighter uppercase leading-none">
            Acesso <span className="text-f1-blue">Premium</span>
          </h1>
          
          <p className="text-gray-400 text-sm md:text-lg mb-10 max-w-md mx-auto font-medium leading-relaxed italic">
            O PlayStream (filmes, séries e documentários) está disponível exclusivamente para nossos assinantes Premium.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => {
                if (!profile) {
                  navigate('/login');
                } else {
                  // Trigger plans modal or navigate to checkout
                  const event = new CustomEvent('openPlansModal');
                  window.dispatchEvent(event);
                }
              }}
              className="w-full sm:w-auto bg-white text-black px-10 py-4 rounded-full font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform shadow-xl"
            >
              ASSINAR AGORA
            </button>
            <Link to="/" className="text-gray-500 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors">
              Voltar para a Home
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  const handleWatch = (video: Video) => {
    if (video.telegram_url) {
      window.open(video.telegram_url, '_blank');
    } else {
      navigate(`/watch/${video.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-black pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <header className="mb-16">
          <div className="flex items-center gap-4 mb-4">
            <span className="h-px w-12 bg-f1-blue" />
            <span className="text-f1-blue font-black tracking-[0.4em] text-[10px] uppercase">Originals & Movies</span>
          </div>
          <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter uppercase leading-[0.8] mb-8">
            Play<span className="text-white/20">Stream</span>
          </h1>

          <div className="mb-10">
            <a 
              href="https://t.me/+ywjKVXYtGpMxY2Jh" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-[#0088cc] hover:bg-[#0088cc]/90 text-white px-8 py-4 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all hover:scale-105 shadow-[0_0_20px_rgba(0,136,204,0.3)] group"
            >
              <Send size={18} className="group-hover:translate-x-1 transition-transform" />
              PASSO 1 - ENTRAR NO GRUPO DE VIDEOS NO TELEGRAM
            </a>
          </div>

          <p className="text-gray-400 max-w-2xl text-lg md:text-xl font-medium leading-relaxed mb-12">
            Filmes, séries e documentários biográficos exclusivos. O melhor do cinema e televisão sobre automobilismo.
          </p>

          <div className="flex items-center gap-4">
            <span className="text-white font-black tracking-widest text-[10px] md:text-xs uppercase whitespace-nowrap bg-white/5 border border-white/10 px-4 py-2 rounded-full italic">
              PASSO 2 - escolha o vídeo disponível com base no catálogo abaixo:
            </span>
            <div className="h-px flex-1 bg-white/10" />
          </div>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-12 h-12 border-4 border-f1-blue/20 border-t-f1-blue rounded-full animate-spin" />
            <p className="text-gray-500 font-black text-[10px] uppercase tracking-widest">Carregando Acervo...</p>
          </div>
        ) : contents.length === 0 ? (
          <div className="py-24 text-center border border-white/10 rounded-[3rem] bg-white/5">
             <p className="text-gray-500 font-bold italic">Nenhum conteúdo disponível no momento. Volte em breve!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {contents.map((item) => (
              <motion.div 
                key={item.id}
                whileHover={{ y: -10 }}
                className="group cursor-pointer"
                onClick={() => handleWatch(item)}
              >
                <div className="relative aspect-[16/9] md:aspect-[2/3] rounded-3xl overflow-hidden mb-4 border border-white/10 group-hover:border-f1-blue/50 transition-all shadow-2xl">
                  <img 
                    src={item.thumbnail_url} 
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                  
                  {/* Category Badge */}
                  <div className="absolute top-4 left-4 bg-f1-blue text-white text-[8px] font-black px-3 py-1 rounded-full uppercase italic tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.category}
                  </div>

                  {/* Play Icon Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100">
                    <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20">
                      <Play className="text-white fill-current translate-x-0.5" size={24} />
                    </div>
                  </div>
                </div>
                
                <h3 className="text-white font-black italic tracking-tighter uppercase text-lg mb-1 group-hover:text-f1-blue transition-colors">
                  {item.title}
                </h3>
                <p className="text-gray-500 text-[10px] font-medium uppercase tracking-widest leading-none">
                  Lançamento {item.year}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const Watch = ({ profile }: { profile: Profile | null }) => {
  const { id } = useParams();
  const [video, setVideo] = useState<Video | null>(null);
  const [seasonVideos, setSeasonVideos] = useState<Video[]>([]);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [userPurchases, setUserPurchases] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showPlansModal, setShowPlansModal] = useState(false);
  const [showTelegramAlert, setShowTelegramAlert] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAvailableYears = async () => {
      const { data } = await supabase.from('videos').select('year');
      if (data) {
        const years = Array.from(new Set(data.map(v => v.year))).sort((a, b) => b - a);
        setAvailableYears(years);
      }
    };
    fetchAvailableYears();
  }, []);

  useEffect(() => {
    const fetchUserPurchases = async () => {
      if (profile) {
        const { data } = await supabase
          .from('f1season_purchases')
          .select('season_year')
          .eq('user_id', profile.id)
          .eq('status', 'ACTIVE');
        if (data) {
          setUserPurchases(data.map(p => p.season_year));
        }
      }
    };
    fetchUserPurchases();
  }, [profile]);

  useEffect(() => {
    const fetchVideo = async () => {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('id', id)
        .single();

      if (data) {
        setVideo(data);
        
        // Fetch other videos from the same season
        const { data: sVideos } = await supabase
          .from('videos')
          .select('*')
          .eq('year', data.year)
          .order('created_at', { ascending: true });
        
        if (sVideos) setSeasonVideos(sVideos);

        // Mostrar alerta do Telegram para usuários premium ativos
        if (profile?.subscription_status === 'ACTIVE' && profile?.plan !== 'FREE') {
          const hasSeenAlert = sessionStorage.getItem(`telegram-alert-${id}`);
          if (!hasSeenAlert) {
            setShowTelegramAlert(true);
            sessionStorage.setItem(`telegram-alert-${id}`, 'true');
          }
        }
      }
      setLoading(false);
    };
    fetchVideo();
  }, [id, profile]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-dark-bg">
      <div className="w-12 h-12 border-4 border-f1-blue border-t-transparent rounded-full animate-spin" />
    </div>
  );
  
  if (!video) return <div className="h-screen flex items-center justify-center bg-dark-bg text-white">Vídeo não encontrado.</div>;

  const hasAccess = () => {
    if (video.status === 'FREE') return true;
    if (!profile) return false;
    if (profile.role === 'admin') return true;

    const year = video.year;
    
    // Check individual purchase
    if (userPurchases.includes(year)) return true;

    if (profile.subscription_status === 'INACTIVE') return false;

    // Default Season access (Current year is public for any active user)
    if (year === CURRENT_YEAR) return true;

    const plan = profile.plan;
    if (plan === 'FREE' && year < CURRENT_YEAR) return false;
    if ((plan === 'MONTHLY' || plan === 'MENSAL') && year < 1981) return false;
    
    return true;
  };

  const accessGranted = hasAccess();

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="max-w-6xl mx-auto px-4 relative">
        {/* Alerta de Experiência Premium sem Anúncios no Telegram */}
        <AnimatePresence>
          {showTelegramAlert && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute -top-4 left-4 right-4 z-[60] md:left-auto md:right-4 md:w-96"
            >
              <div className="bg-f1-blue p-6 rounded-xl shadow-2xl border border-white/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                <button 
                  onClick={() => setShowTelegramAlert(false)}
                  className="absolute top-2 right-2 text-white/60 hover:text-white"
                >
                  <X size={18} />
                </button>
                <div className="flex gap-4">
                  <div className="mt-1">
                    <Trophy className="text-citrus-yellow" size={24} />
                  </div>
                  <div>
                    <h4 className="text-white font-black italic uppercase tracking-tighter text-lg leading-tight mb-2">
                      Experiência Premium Ativa
                    </h4>
                    <p className="text-white/80 text-xs font-medium leading-relaxed mb-4">
                      Como você é assinante, lembre-se que este vídeo também está disponível no nosso **Telegram Privado** sem nenhum anúncio e com download liberado!
                    </p>
                    <a 
                      href="https://t.me/+v_S5IeZ-K0xlMzYx" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-white text-f1-blue px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-colors"
                    >
                      Acessar Canal Telegram
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="mb-6">
          <SeasonSelector 
            year={video.year.toString()} 
            availableYears={availableYears} 
            onSelect={(y) => navigate(`/season/${y}`)} 
          />
        </div>

        <div className="aspect-video w-full bg-dark-card rounded-lg overflow-hidden shadow-2xl mb-8 relative group">
          {accessGranted ? (
            <div className="relative w-full h-full overflow-hidden bg-black flex items-center justify-center">
              {video.telegram_url && (video.embed_url === 'https://telegram.org' || !video.embed_url) ? (
                <div className="text-center p-8">
                  <div className="w-24 h-24 bg-f1-blue/20 rounded-full flex items-center justify-center mb-6 mx-auto border border-f1-blue/30">
                    <Send className="text-f1-blue" size={40} />
                  </div>
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-4">Disponível no Telegram</h3>
                  <p className="text-gray-400 mb-8 max-w-sm mx-auto text-sm">Este conteúdo é transmitido via Telegram para garantir a melhor qualidade e estabilidade.</p>
                  <a 
                    href={video.telegram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 bg-f1-blue text-white px-10 py-4 rounded-full font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform shadow-xl"
                  >
                    ABRIR NO TELEGRAM
                    <ExternalLink size={16} />
                  </a>
                </div>
              ) : (
                /* Container de recorte para ocultar controles superiores do player (botão de abrir em nova janela do Drive) */
                <div className="w-full h-full" style={{ marginTop: '-48px', height: 'calc(100% + 48px)' }}>
                  {video.embed_url.includes('<iframe') ? (
                    <div 
                      className="w-full h-full"
                      dangerouslySetInnerHTML={{ __html: video.embed_url.replace(/width="\d+"/, 'width="100%"').replace(/height="\d+"/, 'height="100%"').replace('<iframe', '<iframe allow="autoplay; fullscreen" style="border:none; width:100%; height:100%;"') }}
                    />
                  ) : (
                    <iframe 
                      src={video.embed_url.replace('/view', '/preview')} 
                      className="w-full h-full border-none"
                      allow="autoplay; fullscreen"
                      allowFullScreen
                      title={video.title}
                    />
                  )}
                </div>
              )}
              
              {/* Overlay de segurança extra no topo */}
              <div className="absolute top-0 left-0 w-full h-12 bg-transparent z-50" />

              {/* Logo sobre o vídeo */}
              <div className="absolute top-4 right-4 z-50 pointer-events-none opacity-80">
                <img 
                  src="https://i.ibb.co/DP8YRq1Y/logo-GRIDPLAY-2026.png" 
                  alt="GridPlay Logo" 
                  className="w-[140px] h-auto drop-shadow-2xl"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Botão de lembrete de progresso (Como o Drive não permite ler o tempo, o usuário pode marcar que parou aqui) */}
              <div className="absolute bottom-16 right-4 z-40 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => {
                    const time = prompt("Em que minuto você parou? (Ex: 12:30)");
                    if(time) {
                      localStorage.setItem(`progress-${video.id}`, time);
                      alert(`Progresso de ${time} salvo localmente.`);
                    }
                  }}
                  className="bg-black/60 backdrop-blur-md text-white text-[10px] px-3 py-1.5 rounded-full border border-white/10 hover:bg-f1-blue transition-colors uppercase font-black"
                >
                  Salvar Onde Parei
                </button>
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md p-8 text-center">
              <Lock size={48} className="text-f1-blue mb-6" />
              <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter mb-4">Conteúdo Premium</h2>
              <p className="text-gray-400 max-w-md mb-8 text-sm md:text-base">
                Este vídeo faz parte do nosso acervo exclusivo. Assine um de nossos planos para ter acesso total.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                {!profile ? (
                  <button 
                    onClick={() => setShowLoginModal(true)}
                    className="bg-f1-blue text-white px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform"
                  >
                    Entrar para Assistir
                  </button>
                ) : null}
                <button 
                  onClick={() => setShowPlansModal(true)}
                  className="bg-white text-black px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform"
                >
                  Ver Planos de Assinatura
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex flex-col md:flex-row justify-between gap-8 mb-12">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-f1-blue text-white text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider">{video.category}</span>
              <span className="text-gray-400 text-sm">{video.year}</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black mb-6 italic tracking-tighter">{video.title}</h1>
            <p className="text-gray-300 leading-relaxed text-lg mb-8">{video.description}</p>

            <div className="flex items-center gap-4 mb-12">
              <ReactionButton videoId={video.id} profile={profile} />
              <button 
                onClick={() => document.getElementById('comments')?.scrollIntoView({ behavior: 'smooth' })}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 transition-all"
              >
                <MessageSquare size={18} />
                <span className="text-xs font-bold uppercase tracking-widest">Comentar</span>
              </button>
            </div>
          </div>
          
          <div className="w-full md:w-80 bg-dark-card p-6 rounded-xl border border-white/5">
            <h3 className="font-bold mb-4 text-citrus-yellow uppercase text-xs tracking-widest">Metadados da Corrida</h3>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-gray-500">Temporada</span>
                <span className="font-medium">{video.year}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-gray-500">Categoria</span>
                <span className="font-medium">{video.category}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-gray-500">Acesso</span>
                <span className="font-medium text-citrus-yellow">{video.status}</span>
              </div>
            </div>
          </div>
        </div>

        <AdBanner profile={profile} />

        <div className="mt-16">
          <h2 className="text-2xl md:text-3xl font-black mb-8 italic tracking-tighter uppercase flex items-center gap-3">
            <span className="w-2 h-8 bg-f1-blue" />
            Corridas da Temporada {video.year}
          </h2>
          <HorizontalRaceSlider 
            videos={seasonVideos}
            currentVideoId={video.id}
            onVideoClick={(vidId) => navigate(`/watch/${vidId}`)}
          />
        </div>

        {profile && (
          <div className="mt-12">
            <CommentSection videoId={video.id} profile={profile} />
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showLoginModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLoginModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-dark-card rounded-3xl overflow-hidden shadow-2xl border border-white/10"
            >
              <button 
                onClick={() => setShowLoginModal(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-white z-10"
              >
                <X size={24} />
              </button>
              <div className="p-0">
                <Login isModal onLoginSuccess={() => setShowLoginModal(false)} />
              </div>
            </motion.div>
          </div>
        )}

        {showPlansModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPlansModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-6xl bg-dark-bg rounded-3xl overflow-y-auto max-h-[90vh] shadow-2xl border border-white/10 p-8 md:p-12"
            >
              <button 
                onClick={() => setShowPlansModal(false)}
                className="absolute top-6 right-6 text-gray-500 hover:text-white z-10"
              >
                <X size={24} />
              </button>
              <Checkout isModal />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Login = ({ isModal = false, onLoginSuccess }: { isModal?: boolean, onLoginSuccess?: () => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [recoverySent, setRecoverySent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
    
    if (loginError) {
      // Check if user is a subscriber from the old portal (case-insensitive)
      const { data: subscriber } = await supabase
        .from('f1subscribes')
        .select('email')
        .ilike('email', email.trim())
        .maybeSingle();

      if (subscriber) {
        setError("Identificamos sua assinatura do portal anterior! Por favor, use a opção 'CRIAR CONTA' para definir sua nova senha de acesso neste novo portal.");
        setIsSignUp(true);
      } else {
        setError("Credenciais de login inválidas. Se você é um assinante antigo, clique em criar conta com o mesmo e-mail e telefone da sua assinatura.");
      }
    } else {
      if (onLoginSuccess) {
        onLoginSuccess();
      } else {
        navigate('/');
      }
    }
    setLoading(false);
  };

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password || !phone) {
      setError("Por favor, preencha e-mail, senha e telefone para criar sua conta.");
      return;
    }
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: {
          phone: phone,
          full_name: email.split('@')[0]
        }
      }
    });
    if (error) {
      setError(error.message);
    } else {
      if (onLoginSuccess) {
        onLoginSuccess();
      } else {
        navigate('/');
      }
    }
    setLoading(false);
  };

  const handleRecovery = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Por favor, preencha seu e-mail.");
      return;
    }
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      setError(error.message);
    } else {
      setRecoverySent(true);
    }
    setLoading(false);
  };

  const content = (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "w-full bg-dark-card/90 backdrop-blur-xl p-8 rounded-2xl border border-white/10 z-10",
        !isModal && "max-w-md"
      )}
    >
      <div className="text-center mb-8 flex flex-col items-center">
        <img 
          src="https://i.ibb.co/DP8YRq1Y/logo-GRIDPLAY-2026.png" 
          alt="GRIDPLAY" 
          className="h-12 md:h-16 object-contain mb-4"
          referrerPolicy="no-referrer"
        />
        <p className="text-gray-400 text-sm">
          {isForgotPassword 
            ? "Recupere o acesso à sua conta" 
            : isSignUp 
              ? "Crie sua conta para acessar o acervo" 
              : "Acesse o maior acervo histórico da F1"}
        </p>
      </div>

      {error && <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-md text-xs mb-6">{error}</div>}

      {isForgotPassword ? (
        recoverySent ? (
          <div className="space-y-6 text-center">
            <div className="bg-green-500/10 border border-green-500/30 text-green-300 p-4 rounded-xl text-xs font-medium leading-relaxed">
              Link de recuperação enviado com sucesso! Verifique sua caixa de entrada e pasta de spam no e-mail <strong className="text-white">{email}</strong>.
            </div>
            <button 
              onClick={() => {
                setIsForgotPassword(false);
                setRecoverySent(false);
                setError(null);
              }}
              className="text-xs font-bold text-gray-400 hover:text-f1-blue transition-colors uppercase tracking-widest"
            >
              Voltar para o Login
            </button>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleRecovery}>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">E-mail</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-md px-4 py-3 text-white focus:border-f1-blue outline-none transition-colors"
                placeholder="seu@email.com"
                required
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-f1-blue text-white font-black py-4 rounded-xl text-xs uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-f1-blue/20 disabled:opacity-50"
            >
              {loading ? "Enviando..." : "Enviar Link de Recuperação"}
            </button>

            <div className="pt-4 text-center">
              <button 
                type="button"
                onClick={() => {
                  setIsForgotPassword(false);
                  setError(null);
                }}
                className="text-xs font-bold text-gray-400 hover:text-white transition-colors uppercase tracking-widest"
              >
                Voltar para o Login
              </button>
            </div>
          </form>
        )
      ) : (
        <>
          <form className="space-y-4" onSubmit={isSignUp ? handleSignUp : handleLogin}>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">E-mail</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-md px-4 py-3 text-white focus:border-f1-blue outline-none transition-colors"
                placeholder="seu@email.com"
                required
              />
            </div>
            
            {isSignUp && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
              >
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Telefone</label>
                <input 
                  type="tel" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-md px-4 py-3 text-white focus:border-f1-blue outline-none transition-colors mb-4"
                  placeholder="(00) 00000-0000"
                  required
                />
              </motion.div>
            )}

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-gray-500 uppercase">Senha</label>
                {!isSignUp && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(true);
                      setError(null);
                    }}
                    className="text-[10px] font-bold text-f1-blue hover:underline uppercase tracking-wider transition-colors"
                  >
                    Esqueceu a senha?
                  </button>
                )}
              </div>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-md px-4 py-3 text-white focus:border-f1-blue outline-none transition-colors pr-12"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-f1-blue text-white font-black py-4 rounded-xl text-xs uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-f1-blue/20 disabled:opacity-50"
            >
              {loading ? "Processando..." : (isSignUp ? "Criar Minha Conta" : "Entrar")}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <button 
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
              }}
              className="text-xs font-bold text-gray-400 hover:text-f1-blue transition-colors uppercase tracking-widest"
            >
              {isSignUp ? "Já tem uma conta? Faça login" : "Não tem conta? Crie uma agora"}
            </button>
          </div>
        </>
      )}
    </motion.div>
  );

  if (isModal) return content;

  return (
    <div className="h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img 
          src="https://picsum.photos/seed/f1-bg/1920/1080?blur=10" 
          className="w-full h-full object-cover opacity-30"
          alt="Background"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/60" />
      </div>
      {content}
    </div>
  );
};

const Checkout = ({ isModal = false, selectedYear = null, profile = null }: { isModal?: boolean, selectedYear?: number | null, profile?: Profile | null }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [isRedirecting, setIsRedirecting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Checkout Component Mounted/Updated", { isModal, selectedYear, hasProfile: !!profile });
  }, [isModal, selectedYear, profile]);

  const handleSeasonalPurchase = async () => {
    console.log("handleSeasonalPurchase CLICKED!");
    console.log("Full State:", { selectedYear, profileId: profile?.id });
    
    if (!profile) {
      console.log("Pre-purchase check failed: No profile. Redirecting to login.");
      navigate('/login');
      return;
    }

    if (!selectedYear) {
      console.log("Pre-purchase check failed: No selectedYear.");
      alert("Por favor, selecione uma temporada na página de Arquivos primeiro.");
      navigate('/archives');
      return;
    }

    setIsRedirecting(true);
    console.log("Starting Supabase upsert for PENDING purchase...");

    try {
      // 1. Create PENDING record for n8n to track
      // Adding a dummy expires_at just in case the SQL adjustment didn't run
      // This will be updated by his n8n later anyway.
      const { data, error } = await supabase
        .from('f1season_purchases')
        .upsert({
          user_id: profile.id,
          season_year: selectedYear,
          status: 'PENDING',
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24h as fallback
        }, { onConflict: 'user_id,season_year' })
        .select();

      if (error) {
        console.error("Supabase Error during seasonal purchase upsert:", error);
        // Even if DB fails, we might still want to redirect, 
        // but it's better to warn the developer in logs.
      } else {
        console.log("Supabase insert successful:", data);
      }

      // 2. Wait a bit to show the message
      console.log("Pre-redirect pause started...");
      setTimeout(() => {
        console.log("Redirecting to Hotmart now!");
        window.location.href = "https://pay.hotmart.com/C102920427K?off=wvkw08ju";
      }, 3000);
    } catch (err) {
      console.error("Fatal exception during handleSeasonalPurchase:", err);
      setIsRedirecting(false);
    }
  };

  const content = (
    <div className={cn("w-full max-w-6xl mx-auto", !isModal && "pt-32 pb-20 px-4")}>
      <AnimatePresence>
        {isRedirecting && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center text-center p-6"
          >
            <div className="w-20 h-20 border-4 border-f1-blue border-t-transparent rounded-full animate-spin mb-8" />
            <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-4">Quase lá!</h2>
            <p className="text-gray-400 max-w-md uppercase text-[10px] font-black tracking-[0.3em] leading-relaxed">
              Após confirmação do pagamento, a temporada estará disponível para você assistir aqui no site em até 2 minutos.
            </p>
            <p className="mt-8 text-f1-blue font-bold animate-pulse text-xs">Redirecionando para o Checkout Seguro...</p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-4xl md:text-6xl font-black mb-6 italic tracking-tighter uppercase">Escolha seu Plano</h1>
        <p className="text-gray-400 max-w-2xl mx-auto font-medium">
          Tenha acesso ilimitado ao maior acervo histórico da Fórmula 1. Assista a todas as corridas, documentários e conteúdos exclusivos.
        </p>
      </motion.div>
      
      {/* Individual Season Purchase - Featured Above */}
      <div className="flex justify-center mb-16">
        <div className="bg-gradient-to-tr from-white/5 to-white/10 p-8 md:p-12 rounded-[3.5rem] border border-white/10 flex flex-col md:flex-row items-center gap-8 md:gap-16 w-full max-w-4xl hover:border-f1-blue/30 transition-all group backdrop-blur-xl shadow-2xl relative overflow-hidden text-center md:text-left">
          <div className="absolute top-0 right-0 w-32 h-32 bg-f1-blue/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-f1-blue/20 transition-colors" />
          
          <div className="flex-1">
            <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
              <span className="bg-f1-blue/20 text-f1-blue text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Oferta Avulsa</span>
              <span className="w-8 h-px bg-white/10" />
            </div>
            <h3 className="text-2xl md:text-4xl font-black italic uppercase tracking-tighter mb-4">
              {selectedYear ? `Temporada ${selectedYear}` : 'Temporada Individual'}
            </h3>
            <div className="text-3xl font-black text-white italic tracking-tighter mb-4">
              R$ 10<span className="text-xs font-normal text-gray-500 not-italic ml-1">/por temporada</span>
            </div>
            <ul className="text-[10px] md:text-xs text-gray-400 space-y-2 font-medium">
              <li className="flex items-center justify-center md:justify-start gap-3"><ChevronRight size={14} className="text-f1-blue" /> Acesso VIP via Site/Player</li>
              <li className="flex items-center justify-center md:justify-start gap-3"><ChevronRight size={14} className="text-f1-blue" /> {selectedYear ? `Liberação de ${selectedYear}` : 'Uma temporada à sua escolha'}</li>
            </ul>
          </div>

          <div className="flex flex-col gap-3 w-full md:w-auto">
            <button 
              onClick={handleSeasonalPurchase}
              className="w-full md:w-auto bg-white text-black font-black px-12 py-6 rounded-full text-xs uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-[0_20px_40px_rgba(255,255,255,0.1)] text-center whitespace-nowrap"
            >
              ADQUIRIR {selectedYear || 'AGORA'}
            </button>
            <Link 
              to="/archives"
              onClick={() => {
                if (isModal) {
                  const event = new CustomEvent('closePlansModal');
                  window.dispatchEvent(event);
                }
              }}
              className="text-[10px] text-gray-500 font-bold uppercase tracking-widest hover:text-white transition-colors text-center"
            >
              Ver todas as temporadas
            </Link>
          </div>
        </div>
      </div>
      
      {/* Billing Toggle */}
      <div className="flex items-center bg-white/5 p-1.5 rounded-full mb-16 border border-white/10 w-fit mx-auto backdrop-blur-md">
        <button 
          onClick={() => setBillingCycle('monthly')}
          className={cn(
            "px-10 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300",
            billingCycle === 'monthly' ? "bg-white text-black shadow-lg" : "text-gray-500 hover:text-white"
          )}
        >
          Mensal
        </button>
        <button 
          onClick={() => setBillingCycle('annual')}
          className={cn(
            "px-10 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300",
            billingCycle === 'annual' ? "bg-white text-black shadow-lg" : "text-gray-500 hover:text-white"
          )}
        >
          Vitalício
        </button>
      </div>

      <div className="flex flex-wrap justify-center gap-8 w-full">
        {billingCycle === 'monthly' ? (
          /* Monthly */
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gradient-to-br from-f1-blue/10 to-black p-10 rounded-[2.5rem] border border-f1-blue/30 flex flex-col shadow-[0_0_60px_rgba(38,169,224,0.15)] w-full lg:w-[450px]"
          >
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-1">Plano Mensal</h3>
              <p className="text-f1-blue text-[10px] uppercase font-black tracking-widest leading-none">Acesso Premium Total</p>
            </div>
            <div className="text-4xl font-black text-white mb-8 italic tracking-tighter">
              R$ 30,00<span className="text-sm font-normal text-gray-500 not-italic ml-1">/mês</span>
            </div>
            <ul className="text-xs text-gray-300 space-y-4 mb-12 flex-1 font-medium">
              <li className="flex items-center gap-3"><ChevronRight size={14} className="text-f1-blue" /> Acervo 1981 - Atual</li>
              <li className="flex items-center gap-3"><ChevronRight size={14} className="text-f1-blue" /> Filmes e Documentários</li>
              <li className="flex items-center gap-3"><ChevronRight size={14} className="text-f1-blue" /> Sem anúncios no site</li>
              <li className="flex items-center gap-3"><ChevronRight size={14} className="text-f1-blue" /> Canal VIP Telegram</li>
              <li className="flex items-center gap-3"><ChevronRight size={14} className="text-f1-blue" /> F1, F2, F3 e F1 Academy</li>
              <li className="flex items-center gap-3"><ChevronRight size={14} className="text-f1-blue" /> Treinos Livres/ Sprints, etc</li>
              <li className="flex items-center gap-3"><ChevronRight size={14} className="text-f1-blue" /> Onboards</li>
            </ul>
            <a 
              href="https://pay.hotmart.com/C102920427K?off=u3qbgrl1"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-f1-blue text-white font-black py-5 rounded-2xl text-[10px] uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-f1-blue/20 text-center block"
            >
              Assinar Mensal
            </a>
          </motion.div>
        ) : (
          /* Annual -> Vitalício */
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gradient-to-br from-citrus-yellow/10 to-black p-10 rounded-[2.5rem] border border-citrus-yellow/30 relative flex flex-col scale-105 z-10 shadow-[0_0_80px_rgba(255,230,0,0.2)] w-full lg:w-[450px]"
          >
            <div className="absolute -top-4 right-8 bg-citrus-yellow text-black text-[10px] font-black px-4 py-1.5 rounded-full uppercase italic tracking-widest shadow-xl">Oferta Especial</div>
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-1">Plano Vitalício</h3>
              <p className="text-citrus-yellow text-[10px] uppercase font-black tracking-widest leading-none">Acesso Completo e Eterno</p>
            </div>
            <div className="mb-8">
              <div className="text-xs text-gray-500 line-through font-bold mb-1">De R$ 140,00</div>
              <div className="text-4xl font-black text-citrus-yellow italic tracking-tighter">
                R$ 50,00
              </div>
              <p className="text-[10px] text-gray-500 mt-2 font-bold uppercase tracking-tighter leading-none">Pagamento Único - Assista Para Sempre</p>
            </div>
            <ul className="text-xs text-gray-200 space-y-4 mb-12 flex-1 font-medium">
              <li className="flex items-center gap-3"><ChevronRight size={14} className="text-citrus-yellow" /> Acervo Completo 1950 - Atual</li>
              <li className="flex items-center gap-3"><ChevronRight size={14} className="text-citrus-yellow" /> Tudo do plano mensal</li>
              <li className="flex items-center gap-3"><ChevronRight size={14} className="text-citrus-yellow" /> F1, F2, F3 e F1 Academy</li>
              <li className="flex items-center gap-3"><ChevronRight size={14} className="text-citrus-yellow" /> Treinos Livres/ Sprints, etc</li>
              <li className="flex items-center gap-3"><ChevronRight size={14} className="text-citrus-yellow" /> Onboards</li>
            </ul>
            <a 
              href="https://pay.hotmart.com/C102920427K?off=5b3hm4un&checkoutMode=0"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-citrus-yellow text-black font-black py-5 rounded-2xl text-[10px] uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-citrus-yellow/20 text-center block"
            >
              Assinar Vitalício
            </a>
          </motion.div>
        )}
      </div>

      {/* Disclaimer text */}
      <div className="mt-12 text-center max-w-2xl mx-auto px-4 relative z-10">
        <p className="text-[10px] md:text-xs text-gray-400 leading-relaxed font-semibold">
          ⚠️ <strong>Aviso Importante:</strong> Esta promoção de plano vitalício é válida por tempo limitado. 
          Após assinar uma vez, não haverá mais nenhuma cobrança (mensal ou anual) e o seu acesso é eterno enquanto a comunidade GridPlay existir.
        </p>
      </div>
    </div>
  );

  if (isModal) return content;

  return (
    <div className="min-h-screen bg-dark-bg relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img 
          src="https://picsum.photos/seed/f1-plans/1920/1080?blur=10" 
          className="w-full h-full object-cover opacity-20"
          alt="Background"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
      </div>
      {content}
    </div>
  );
};

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    if (!password) {
      setMessage({ type: 'error', text: 'Por favor, insira uma nova senha.' });
      return;
    }
    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'As senhas não coincidem.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.updateUser({
      password: password
    });

    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ type: 'success', text: 'Senha atualizada com sucesso! Redirecionando para a página principal...' });
      setTimeout(() => {
        navigate('/');
      }, 3000);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-32 bg-dark-bg relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img 
          src="https://picsum.photos/seed/f1-reset/1920/1080?blur=10" 
          className="w-full h-full object-cover opacity-20"
          alt="Background"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md bg-dark-card/90 backdrop-blur-xl p-8 rounded-2xl border border-white/10 z-10"
      >
        <div className="text-center mb-8 flex flex-col items-center">
          <img 
            src="https://i.ibb.co/DP8YRq1Y/logo-GRIDPLAY-2026.png" 
            alt="GRIDPLAY" 
            className="h-12 md:h-16 object-contain mb-4"
            referrerPolicy="no-referrer"
          />
          <h1 className="text-xl font-black italic uppercase tracking-tighter">Nova Senha</h1>
          <p className="text-gray-400 text-xs mt-1">Defina sua nova senha de acesso</p>
        </div>

        {message && (
          <div className={cn(
            "p-4 rounded-xl text-xs mb-6 border font-medium leading-relaxed",
            message.type === 'success' 
              ? "bg-green-500/10 border-green-500/30 text-green-300" 
              : "bg-red-500/10 border-red-500/30 text-red-300"
          )}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nova Senha</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-md px-4 py-3 text-white focus:border-f1-blue outline-none transition-colors pr-12"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Confirmar Nova Senha</label>
            <input 
              type={showPassword ? "text" : "password"} 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-md px-4 py-3 text-white focus:border-f1-blue outline-none transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-f1-blue text-white font-black py-4 rounded-xl text-xs uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-f1-blue/20 disabled:opacity-50"
          >
            {loading ? "Processando..." : "Redefinir Senha"}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

const Account = ({ profile }: { profile: Profile | null }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [showPlansModal, setShowPlansModal] = useState(false);

  if (!profile) return <Navigate to="/login" />;

  const handleUpdatePassword = async (e: FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'As senhas não coincidem.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ type: 'success', text: 'Senha atualizada com sucesso!' });
      setNewPassword('');
      setConfirmPassword('');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen pt-32 pb-20 px-4">
      <div className="max-w-md mx-auto bg-dark-card border border-white/5 rounded-[2rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
        {/* Upgrade Badge for Free Users */}
        {profile.plan === 'FREE' && (
          <div className="absolute top-0 right-0 p-4">
            <button 
              onClick={() => setShowPlansModal(true)}
              className="bg-citrus-yellow text-black text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full animate-pulse"
            >
              UPGRADE PARA PREMIUM
            </button>
          </div>
        )}

        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-full bg-f1-blue/20 flex items-center justify-center">
            <User className="text-f1-blue" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black italic uppercase tracking-tighter">Minha Conta</h1>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">{profile.email}</p>
          </div>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-gray-400 mb-6 flex items-center gap-2">
              <Lock size={14} /> Alterar Senha
            </h2>
            
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"}
                  placeholder="Nova Senha"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-4 text-sm outline-none focus:border-f1-blue transition-colors"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <input 
                type={showPassword ? "text" : "password"}
                placeholder="Confirmar Nova Senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-black border border-white/10 rounded-xl px-4 py-4 text-sm outline-none focus:border-f1-blue transition-colors"
                required
              />

              {message && (
                <div className={cn(
                  "p-4 rounded-xl text-xs font-bold uppercase tracking-widest",
                  message.type === 'success' ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                )}>
                  {message.text}
                </div>
              )}

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-f1-blue text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-f1-blue/90 transition-colors disabled:opacity-50"
              >
                {loading ? "ATUALIZANDO..." : "SALVAR NOVA SENHA"}
              </button>
            </form>
          </section>

          <div className="pt-8 border-t border-white/5">
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-gray-500">
              <span>Plano Atual</span>
              <span className={cn("font-black", profile.plan === 'FREE' ? "text-gray-400" : "text-citrus-yellow")}>{profile.plan}</span>
            </div>
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-gray-500 mt-2">
              <span>Status</span>
              <span className={profile.subscription_status === 'ACTIVE' ? "text-green-500" : "text-red-500"}>
                {profile.subscription_status === 'ACTIVE' ? "ATIVO" : "INATIVO"}
              </span>
            </div>
            {profile.plan === 'FREE' && (
              <button 
                onClick={() => setShowPlansModal(true)}
                className="w-full mt-6 bg-white/5 border border-white/10 text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-colors"
              >
                SEJA PREMIUM - ACESSO COMPLETO
              </button>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showPlansModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPlansModal(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="relative w-full max-w-6xl bg-black rounded-[3rem] overflow-y-auto max-h-[95vh] shadow-[0_0_100px_rgba(0,0,0,1)] border border-white/10 p-8 md:p-20"
            >
              <button 
                onClick={() => setShowPlansModal(false)}
                className="absolute top-8 right-8 text-gray-500 hover:text-white z-20 transition-colors"
              >
                <X size={28} />
              </button>
              <Checkout isModal profile={profile} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Blog = ({ profile }: { profile: Profile | null }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      const { data } = await supabase
        .from('f1posts')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });
      
      if (data) setPosts(data);
      setLoading(false);
    };

    fetchPosts();
  }, []);

  return (
    <div className="pt-32 pb-24 px-4 md:px-12">
      <div className="max-w-7xl mx-auto">
        <header className="mb-20">
          <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter uppercase leading-[0.8] mb-8">
            Blog<span className="text-white/20">F1</span>
          </h1>
          <p className="text-gray-400 max-w-2xl text-lg md:text-xl font-medium leading-relaxed">
            Notícias, bastidores e análises detalhadas do mundo da Formula 1 e automobilismo.
          </p>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-dark-card rounded-3xl aspect-[16/10] border border-white/5" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map(post => (
              <motion.div 
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="group bg-dark-card rounded-3xl border border-white/5 overflow-hidden hover:border-f1-blue/30 transition-all shadow-2xl"
              >
                <Link to={`/blog/${post.slug}`}>
                  <div className="aspect-[16/9] overflow-hidden relative">
                    <img 
                      src={post.image_url} 
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                  </div>
                  <div className="p-8">
                    <div className="text-[10px] text-f1-blue font-black uppercase tracking-[0.2em] mb-4">
                      {new Date(post.created_at).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                    <h2 className="text-2xl font-black italic tracking-tighter text-white uppercase group-hover:text-f1-blue transition-colors mb-4 line-clamp-2">
                      {post.title}
                    </h2>
                    <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="mt-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white group-hover:gap-4 transition-all">
                      Ler Artigo <ChevronRight size={14} />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const BlogPost = ({ profile }: { profile: Profile | null }) => {
  const { slug } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [reactions, setReactions] = useState<PostReaction[]>([]);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchPostData = async () => {
      if (!slug) return;
      
      const [postRes] = await Promise.all([
        supabase.from('f1posts').select('*').eq('slug', slug).single()
      ]);
      
      if (postRes.data) {
        setPost(postRes.data);
        
        // Fetch reactions
        const { data: rData } = await supabase
          .from('f1post_reactions')
          .select('*')
          .eq('post_id', postRes.data.id);
        if (rData) setReactions(rData);

        // Fetch comments with split profiles
        const { data: cData, error: cErr } = await supabase
          .from('f1post_comments')
          .select('*')
          .eq('post_id', postRes.data.id)
          .order('created_at', { ascending: true });

        if (cErr) {
          console.error("Erro ao carregar comentários do blog:", cErr);
        } else if (cData) {
          const userIds = Array.from(new Set(cData.map(c => c.user_id).filter(Boolean)));
          const profilesMap: Record<string, { full_name: string | null; email: string }> = {};

          if (userIds.length > 0) {
            const { data: profiles, error: pErr } = await supabase
              .from('f1profiles')
              .select('id, full_name, email')
              .in('id', userIds);

            if (pErr) {
              console.error("Erro ao carregar perfis do blog:", pErr);
            } else if (profiles) {
              profiles.forEach(p => {
                profilesMap[p.id] = {
                  full_name: p.full_name,
                  email: p.email
                };
              });
            }
          }

          const commentsWithProfiles: PostComment[] = cData.map(c => ({
            ...c,
            f1profiles: profilesMap[c.user_id] || undefined
          }));

          setComments(commentsWithProfiles);
        }
      }
      setLoading(false);
    };

    fetchPostData();
  }, [slug]);

  const handleLike = async () => {
    if (!profile || !post) return;

    const existingReaction = reactions.find(r => r.user_id === profile.id);

    if (existingReaction) {
      const { error } = await supabase
        .from('f1post_reactions')
        .delete()
        .eq('id', existingReaction.id);
      
      if (!error) {
        setReactions(reactions.filter(r => r.id !== existingReaction.id));
      }
    } else {
      const { data, error } = await supabase
        .from('f1post_reactions')
        .insert([{ post_id: post.id, user_id: profile.id, type: 'like' }])
        .select()
        .single();
      
      if (data && !error) {
        setReactions([...reactions, data]);
      }
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !post || !newComment.trim()) return;

    setIsSubmitting(true);
    const { data: insertedComment, error } = await supabase
      .from('f1post_comments')
      .insert([{
        post_id: post.id,
        user_id: profile.id,
        content: newComment.trim()
      }])
      .select()
      .single();

    if (insertedComment && !error) {
      const completeComment: PostComment = {
        ...insertedComment,
        f1profiles: {
          full_name: profile.full_name,
          email: profile.email
        }
      };
      setComments([...comments, completeComment]);
      setNewComment('');
    } else if (error) {
      console.error("Erro ao adicionar comentário:", error);
    }
    setIsSubmitting(false);
  };

  const userLiked = profile ? reactions.some(r => r.user_id === profile.id) : false;

  if (loading) return (
    <div className="min-h-screen pt-32 flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-f1-blue border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!post) return <Navigate to="/blog" />;

  return (
    <div className="pt-32 pb-24">
      <div className="max-w-4xl mx-auto px-4">
        <Link 
          to="/blog"
          className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white mb-12 transition-colors"
        >
          <ChevronLeft size={16} /> Voltar para o Blog
        </Link>

        <div className="mb-12">
          <div className="text-[10px] text-f1-blue font-black uppercase tracking-[0.2em] mb-4">
            {new Date(post.created_at).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
          <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter text-white uppercase leading-[0.9]">
            {post.title}
          </h1>
        </div>

        <div className="aspect-[21/9] rounded-[2rem] overflow-hidden border border-white/5 mb-16 shadow-2xl">
          <img 
            src={post.image_url} 
            alt={post.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Ad Block */}
        <AdSense adSlot="6214191157" />

        <div className="prose prose-invert prose-blue max-w-none prose-p:text-gray-300 prose-headings:text-white prose-headings:font-black prose-headings:italic prose-headings:tracking-tighter prose-headings:uppercase prose-a:text-f1-blue prose-strong:text-white prose-img:rounded-3xl prose-img:border prose-img:border-white/5">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm, remarkBreaks]}
            rehypePlugins={[rehypeRaw]}
          >
            {post.content}
          </ReactMarkdown>
        </div>

        {/* Interaction Bar */}
        <div className="mt-16 pt-8 border-t border-white/5 flex items-center gap-8">
          <button 
            onClick={handleLike}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest",
              userLiked 
                ? "bg-f1-blue text-white shadow-[0_0_20px_rgba(255,24,1,0.3)]" 
                : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
            )}
          >
            <ThumbsUp size={16} />
            {reactions.length} Curtidas
          </button>
          
          <div className="flex items-center gap-2 text-gray-500 font-black text-[10px] uppercase tracking-widest">
            <MessageSquare size={16} />
            {comments.length} Comentários
          </div>
        </div>

        {/* Comments Section */}
        <div className="mt-16 space-y-12">
          <h3 className="text-2xl font-black italic tracking-tighter uppercase text-white">Comentários</h3>
          
          {profile ? (
            <form onSubmit={handleAddComment} className="relative group">
              <textarea 
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="O que você achou deste artigo?"
                className="w-full bg-dark-card border border-white/5 rounded-2xl p-6 text-white placeholder-gray-600 focus:outline-none focus:border-f1-blue/50 transition-all min-h-[120px] resize-none"
              />
              <div className="absolute bottom-4 right-4">
                <button 
                  disabled={isSubmitting || !newComment.trim()}
                  className="bg-f1-blue hover:bg-red-700 disabled:opacity-50 disabled:hover:bg-f1-blue text-white px-6 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2"
                >
                  {isSubmitting ? 'Enviando...' : (
                    <>Enviar <Send size={14} /></>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="bg-dark-card border border-white/5 rounded-2xl p-8 text-center">
              <p className="text-gray-400 font-medium mb-4">Você precisa estar logado para comentar.</p>
              <Link 
                to="/admin" 
                className="inline-block bg-f1-blue text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-700 transition-all"
              >
                Fazer Login
              </Link>
            </div>
          )}

          <div className="space-y-6">
            {comments.length === 0 ? (
              <p className="text-gray-500 italic text-center py-8">Nenhum comentário ainda. Seja o primeiro!</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="bg-dark-card border border-white/5 rounded-2xl p-6 flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                    <User size={20} className="text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-black text-[10px] uppercase tracking-widest">
                        {comment.f1profiles?.full_name || 'Usuário'}
                      </span>
                      <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminPanel = ({ profile }: { profile: Profile | null }) => {
  const [activeTab, setActiveTab] = useState<'cms' | 'crm' | 'stats' | 'blog' | 'voluntarios'>('stats');
  const [videos, setVideos] = useState<Video[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [newVideo, setNewVideo] = useState({
    title: '',
    year: CURRENT_YEAR,
    description: '',
    category: 'Temporada',
    embed_url: '',
    telegram_url: '',
    status: 'PREMIUM' as Video['status'],
    thumbnail_url: ''
  });

  const [newPost, setNewPost] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    image_url: '',
    published: false
  });

  useEffect(() => {
    if (profile?.role !== 'admin') return;
    
    const fetchData = async () => {
      const [vRes, uRes, pRes] = await Promise.all([
        supabase.from('videos').select('*').order('created_at', { ascending: false }),
        supabase.from('f1profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('f1posts').select('*').order('created_at', { ascending: false })
      ]);
      if (vRes.data) setVideos(vRes.data);
      if (uRes.data) setUsers(uRes.data);
      if (pRes.data) setPosts(pRes.data);
      
      // Fetch volunteers from Supabase 'f1volunteers' with a fallback to localStorage
      let fetchedVolunteers: any[] = [];
      try {
        const { data, error } = await supabase.from('f1volunteers').select('*').order('created_at', { ascending: false });
        if (error) {
          throw error;
        }
        if (data) {
          fetchedVolunteers = data;
        }
      } catch (err) {
        console.warn("Failed to fetch f1volunteers from Supabase. Falling back to localStorage:", err);
        try {
          const stored = localStorage.getItem('gridplay-volunteers');
          if (stored) {
            fetchedVolunteers = JSON.parse(stored).map((item: any) => ({
              ...item,
              created_at: item.submittedAt || item.created_at
            }));
          }
        } catch (localErr) {
          console.error("Failed to parse local volunteers:", localErr);
        }
      }
      setVolunteers(fetchedVolunteers);
      
      setLoading(false);
    };
    fetchData();
  }, [profile, activeTab]);

  // Statistics calculation logic
  const stats = useMemo(() => {
    const totalRevenue = users.reduce((acc, u) => {
      if (u.subscription_status !== 'ACTIVE') return acc;
      // Use the net value from DB (which should already account for Hotmart fees and historical prices)
      // If not set, we don't assume a value to keep the data clean per user
      return acc + (Number(u.net_subscription_value) || 0);
    }, 0);

    const totalPending = users.reduce((acc, u) => acc + (Number(u.pending_balance) || 0), 0);

    return {
      totalUsers: users.length,
      activeSubscribers: users.filter(u => u.subscription_status === 'ACTIVE' && u.plan !== 'FREE').length,
      estimatedMonthlyRevenue: totalRevenue,
      totalPending: totalPending,
      annualSubscribers: users.filter(u => (u.plan === 'ANNUAL' || u.plan === 'ANUAL') && u.subscription_status === 'ACTIVE').length,
      monthlySubscribers: users.filter(u => (u.plan === 'MONTHLY' || u.plan === 'MENSAL') && u.subscription_status === 'ACTIVE').length,
    };
  }, [users]);

  // Chart data simulation (in a real app, this would be grouped by month from database)
  const chartData = [
    { name: 'Jan', revenue: stats.estimatedMonthlyRevenue * 0.7 },
    { name: 'Fev', revenue: stats.estimatedMonthlyRevenue * 0.8 },
    { name: 'Mar', revenue: stats.estimatedMonthlyRevenue * 0.9 },
    { name: 'Abr', revenue: stats.estimatedMonthlyRevenue * 1.0 },
    { name: 'Mai', revenue: stats.estimatedMonthlyRevenue * 1.1 },
    { name: 'Jun', revenue: stats.estimatedMonthlyRevenue },
  ];

  const admins = users.filter(u => u.role === 'admin');
  
  const getNextPayoutDate = () => {
    const today = new Date();
    let payoutDate = new Date(today.getFullYear(), today.getMonth(), 25);
    if (today.getDate() > 25) {
      payoutDate = new Date(today.getFullYear(), today.getMonth() + 1, 25);
    }
    return payoutDate.toLocaleDateString('pt-BR');
  };

  const handleAddVideo = async (e: FormEvent) => {
    e.preventDefault();
    
    // Fallback for embed_url if empty to avoid DB constraints if not yet nullable
    const videoData = {
      ...newVideo,
      embed_url: newVideo.embed_url || 'https://telegram.org' // Useful placeholder if NULL is not allowed
    };

    const { data, error } = await supabase.from('videos').insert([videoData]).select();
    if (error) {
      console.error("Erro ao adicionar vídeo:", error.message);
      alert("Erro ao adicionar vídeo: " + error.message);
      return;
    }
    if (data) {
      setVideos([data[0], ...videos]);
      setNewVideo({ title: '', year: CURRENT_YEAR, description: '', category: 'Temporada', embed_url: '', telegram_url: '', status: 'PREMIUM', thumbnail_url: '' });
      alert("Vídeo adicionado com sucesso!");
    }
  };

  const handleDeleteVideo = async (id: string) => {
    await supabase.from('videos').delete().eq('id', id);
    setVideos(videos.filter(v => v.id !== id));
  };

  const handleUpdateUserStatus = async (userId: string, status: Profile['subscription_status']) => {
    await supabase.from('f1profiles').update({ subscription_status: status }).eq('id', userId);
    setUsers(users.map(u => u.id === userId ? { ...u, subscription_status: status } : u));
  };

  const handleUpdateUserPlan = async (userId: string, plan: Profile['plan']) => {
    await supabase.from('f1profiles').update({ plan }).eq('id', userId);
    setUsers(users.map(u => u.id === userId ? { ...u, plan } : u));
  };

  const handleUpdateAdminPartnership = async (userId: string, updates: Partial<Profile>) => {
    await supabase.from('f1profiles').update(updates).eq('id', userId);
    setUsers(users.map(u => u.id === userId ? { ...u, ...updates } : u));
  };

  const handleAddPost = async (e: FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    const { data, error } = await supabase
      .from('f1posts')
      .insert([{
        ...newPost,
        author_id: profile.id
      }])
      .select()
      .single();

    if (error) {
      alert('Erro ao criar post: ' + error.message);
    } else if (data) {
      setPosts([data, ...posts]);
      setNewPost({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        image_url: '',
        published: false
      });
      alert('Post criado com sucesso!');
    }
  };

  const handleTogglePostPublish = async (postId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('f1posts')
      .update({ published: !currentStatus })
      .eq('id', postId);

    if (error) {
      alert('Erro ao atualizar status: ' + error.message);
    } else {
      setPosts(posts.map(p => p.id === postId ? { ...p, published: !currentStatus } : p));
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta postagem?')) return;
    
    const { error } = await supabase
      .from('f1posts')
      .delete()
      .eq('id', postId);

    if (error) {
      alert('Erro ao excluir: ' + error.message);
    } else {
      setPosts(posts.filter(p => p.id !== postId));
    }
  };

  if (profile?.role !== 'admin') return <Navigate to="/" />;

  return (
    <div className="min-h-screen pt-24 px-4 md:px-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black italic uppercase tracking-tighter">Painel de Controle</h1>
        <div className="flex bg-dark-card rounded-lg p-1">
          <button 
            onClick={() => setActiveTab('stats')}
            className={cn("px-6 py-2 rounded-md text-sm font-bold transition-colors", activeTab === 'stats' ? "bg-f1-blue text-white" : "text-gray-400 hover:text-white")}
          >
            <Trophy size={16} className="inline mr-2" /> Dash
          </button>
          <button 
            onClick={() => setActiveTab('cms')}
            className={cn("px-6 py-2 rounded-md text-sm font-bold transition-colors", activeTab === 'cms' ? "bg-f1-blue text-white" : "text-gray-400 hover:text-white")}
          >
            <Film size={16} className="inline mr-2" /> CMS
          </button>
          <button 
            onClick={() => setActiveTab('crm')}
            className={cn("px-6 py-2 rounded-md text-sm font-bold transition-colors", activeTab === 'crm' ? "bg-f1-blue text-white" : "text-gray-400 hover:text-white")}
          >
            <Users size={16} className="inline mr-2" /> CRM
          </button>
          <button 
            onClick={() => setActiveTab('blog')}
            className={cn("px-6 py-2 rounded-md text-sm font-bold transition-colors", activeTab === 'blog' ? "bg-f1-blue text-white" : "text-gray-400 hover:text-white")}
          >
            <FileText size={16} className="inline mr-2" /> Blog
          </button>
          <button 
            onClick={() => setActiveTab('voluntarios')}
            className={cn("px-6 py-2 rounded-md text-sm font-bold transition-colors", activeTab === 'voluntarios' ? "bg-f1-blue text-white" : "text-gray-400 hover:text-white")}
          >
            <UserCheck size={16} className="inline mr-2" /> Voluntários
          </button>
        </div>
      </div>

      {activeTab === 'stats' ? (
        <div className="space-y-12 pb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-dark-card p-8 rounded-3xl border border-white/5 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Assinantes Ativos</span>
                <Users size={18} className="text-f1-blue" />
              </div>
              <div className="text-4xl font-black italic tracking-tighter text-white">{stats.activeSubscribers}</div>
              <div className="text-[10px] text-gray-500 mt-2 font-bold uppercase tracking-widest">Total de {stats.totalUsers} cadastrados</div>
            </div>
            
            <div className="bg-dark-card p-8 rounded-3xl border border-white/5 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Total Líquido (MRR)</span>
                <CreditCard size={18} className="text-citrus-yellow" />
              </div>
              <div className="text-4xl font-black italic tracking-tighter text-white">R$ {Number(stats.estimatedMonthlyRevenue).toFixed(2)}</div>
              <div className="text-[10px] text-gray-500 mt-2 font-bold uppercase tracking-widest">Baseado no valor líquido individual</div>
            </div>

            <div className="bg-dark-card p-8 rounded-3xl border border-white/5 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Total em Aberto</span>
                <Plus size={18} className="text-f1-blue" />
              </div>
              <div className="text-4xl font-black italic tracking-tighter text-white">R$ {Number(stats.totalPending).toFixed(2)}</div>
              <div className="text-[10px] text-gray-500 mt-2 font-bold uppercase tracking-widest">Pendentes de Comissões</div>
            </div>

            <div className="bg-dark-card p-8 rounded-3xl border border-white/5 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Próximo Repasse</span>
                <History size={18} className="text-citrus-yellow" />
              </div>
              <div className="text-2xl font-black italic tracking-tighter text-white uppercase">{getNextPayoutDate()}</div>
              <div className="text-[10px] text-gray-500 mt-2 font-bold uppercase tracking-widest">Todo Dia 25</div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Revenue Chart */}
            <div className="lg:col-span-2 bg-dark-card p-8 rounded-[2rem] border border-white/5">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-sm font-black uppercase tracking-widest italic">Crescimento de Faturamento</h3>
                <div className="flex gap-2">
                  <span className="w-3 h-3 bg-f1-blue rounded-full"></span>
                  <span className="text-[10px] text-gray-500 font-bold uppercase">Estimado</span>
                </div>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#e10600" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#e10600" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      stroke="#4b5563" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="#4b5563" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false}
                      tickFormatter={(value) => `R$${value}`}
                    />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: '#111', border: '1px solid #ffffff10', borderRadius: '12px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#e10600" fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Admin Profit Sharing Info */}
            <div className="bg-dark-card p-8 rounded-[2rem] border border-white/5">
              <h3 className="text-sm font-black uppercase tracking-widest italic mb-8">Divisão de Lucros</h3>
              <div className="space-y-6">
                {admins.map(admin => (
                  <div key={admin.id} className="group border-b border-white/5 pb-6 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-bold text-sm">{admin.full_name || admin.email}</span>
                      <span className="bg-f1-blue/20 text-f1-blue text-[10px] font-black px-2 py-0.5 rounded-full">{admin.partnership_percentage || 0}%</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                      <span>Pendente: <span className="text-white">R$ {Number(admin.pending_balance || 0).toFixed(2)}</span></span>
                      <span>Acumulado: <span className="text-citrus-yellow">R$ {Number(admin.accumulated_balance || 0).toFixed(2)}</span></span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Individual Admin View if the current user has partnership */}
              {profile && profile.partnership_percentage && (
                <div className="mt-12 p-6 bg-f1-blue/10 border border-f1-blue/20 rounded-2xl">
                  <div className="flex items-center gap-3 mb-4">
                    <Trophy className="text-f1-blue" size={20} />
                    <span className="text-xs font-black uppercase tracking-widest text-white">Sua Participação</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-[8px] text-gray-500 uppercase font-black tracking-widest mb-1">Comissão Aberta</div>
                      <div className="text-2xl font-black text-white italic">R$ {Number(profile.pending_balance || 0).toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-[8px] text-gray-500 uppercase font-black tracking-widest mb-1">Cota Fixa</div>
                      <div className="text-2xl font-black text-f1-blue italic">{profile.partnership_percentage}%</div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-f1-blue/10">
                    <p className="text-[8px] text-gray-400 italic">Próximo repasse agendado para {getNextPayoutDate()}.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : activeTab === 'cms' ? (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Add Video Form */}
          <div className="lg:col-span-1">
            <div className="bg-dark-card p-6 rounded-xl border border-white/5 sticky top-24">
              <h2 className="text-lg font-bold mb-6 flex items-center gap-2"><Plus size={20} className="text-citrus-yellow" /> Adicionar Conteúdo</h2>
              <form onSubmit={handleAddVideo} className="space-y-4">
                <input 
                  placeholder="Título do Vídeo"
                  value={newVideo.title}
                  onChange={e => setNewVideo({...newVideo, title: e.target.value})}
                  className="w-full bg-black border border-white/10 rounded-md px-4 py-2 text-sm"
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <input 
                    type="number"
                    placeholder="Ano"
                    value={newVideo.year}
                    onChange={e => setNewVideo({...newVideo, year: parseInt(e.target.value)})}
                    className="w-full bg-black border border-white/10 rounded-md px-4 py-2 text-sm"
                    required
                  />
                  <select 
                    value={newVideo.category}
                    onChange={e => setNewVideo({...newVideo, category: e.target.value})}
                    className="w-full bg-black border border-white/10 rounded-md px-4 py-2 text-sm"
                  >
                    <option>Temporada</option>
                    <option>Documentário</option>
                    <option>Entrevista</option>
                    <option>Especial</option>
                  </select>
                </div>
                <textarea 
                  placeholder="Descrição / Sinopse"
                  value={newVideo.description}
                  onChange={e => setNewVideo({...newVideo, description: e.target.value})}
                  className="w-full bg-black border border-white/10 rounded-md px-4 py-2 text-sm h-24"
                />
                <input 
                  placeholder="Embed URL (Vimeo/YouTube)"
                  value={newVideo.embed_url}
                  onChange={e => setNewVideo({...newVideo, embed_url: e.target.value})}
                  className="w-full bg-black border border-white/10 rounded-md px-4 py-2 text-sm"
                />
                <input 
                  placeholder="Telegram URL (Para Filmes/Séries)"
                  value={newVideo.telegram_url}
                  onChange={e => setNewVideo({...newVideo, telegram_url: e.target.value})}
                  className="w-full bg-black border border-white/10 rounded-md px-4 py-2 text-sm"
                />
                <input 
                  placeholder="Thumbnail URL"
                  value={newVideo.thumbnail_url}
                  onChange={e => setNewVideo({...newVideo, thumbnail_url: e.target.value})}
                  className="w-full bg-black border border-white/10 rounded-md px-4 py-2 text-sm"
                />
                <select 
                  value={newVideo.status}
                  onChange={e => setNewVideo({...newVideo, status: e.target.value as Video['status']})}
                  className="w-full bg-black border border-white/10 rounded-md px-4 py-2 text-sm"
                >
                  <option value="PREMIUM">Premium</option>
                  <option value="FREE">Gratuito</option>
                  <option value="ARCHIVED">Arquivado</option>
                </select>
                <button type="submit" className="w-full bg-citrus-yellow text-black font-black py-3 rounded-md hover:opacity-90">PUBLICAR</button>
              </form>
            </div>
          </div>

          {/* Video List */}
          <div className="lg:col-span-2">
            <div className="bg-dark-card rounded-xl border border-white/5 overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 text-gray-400 uppercase text-[10px] font-black tracking-widest">
                  <tr>
                    <th className="px-6 py-4">Vídeo</th>
                    <th className="px-6 py-4">Ano</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {videos.map(v => (
                    <tr key={v.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={v.thumbnail_url || `https://picsum.photos/seed/${v.id}/100/60`} className="w-16 aspect-video object-cover rounded" alt="" referrerPolicy="no-referrer" />
                          <div>
                            <div className="font-bold">{v.title}</div>
                            <div className="text-[10px] text-gray-500">{v.category}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-400">{v.year}</td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "text-[10px] font-black px-2 py-0.5 rounded-full",
                          v.status === 'PREMIUM' ? "bg-citrus-yellow text-black" : 
                          v.status === 'FREE' ? "bg-green-500 text-white" : "bg-gray-700 text-gray-300"
                        )}>
                          {v.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button className="text-gray-400 hover:text-white"><Edit size={16} /></button>
                        <button onClick={() => handleDeleteVideo(v.id)} className="text-red-500 hover:text-red-400"><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : activeTab === 'crm' ? (
        <div className="bg-dark-card rounded-xl border border-white/5 overflow-hidden shadow-2xl">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-gray-400 uppercase text-[10px] font-black tracking-widest">
              <tr>
                <th className="px-6 py-4">Usuário</th>
                <th className="px-6 py-4">Plano</th>
                <th className="px-6 py-4">Valor Líquido</th>
                <th className="px-6 py-4">Status / Parceria</th>
                <th className="px-6 py-4">Comissões / Cadastro</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold">{u.full_name || u.email}</div>
                    <div className="text-[10px] text-gray-500 uppercase">{u.role} {u.phone && `• ${u.phone}`}</div>
                    <div className="text-[8px] text-gray-600 truncate max-w-[150px]">{u.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <select 
                      value={u.plan}
                      onChange={(e) => handleUpdateUserPlan(u.id, e.target.value as Profile['plan'])}
                      className="text-[10px] font-black px-2 py-1 rounded-md bg-black border border-white/10 outline-none text-gray-300"
                    >
                      <option value="FREE">FREE</option>
                      <option value="MONTHLY">MENSAL (EN)</option>
                      <option value="MENSAL">MENSAL (PT)</option>
                      <option value="ANNUAL">ANUAL (EN)</option>
                      <option value="ANUAL">ANUAL (PT)</option>
                      <option value="VITAL">VITALÍCIO</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-white">R$ {Number(u.net_subscription_value || 0).toFixed(2)}</span>
                      <span className="text-[8px] text-gray-500 uppercase">Líquido (Hotmart)</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-2">
                      <select 
                        value={u.subscription_status}
                        onChange={(e) => handleUpdateUserStatus(u.id, e.target.value as Profile['subscription_status'])}
                        className={cn(
                          "text-[10px] font-black px-2 py-1 rounded-md bg-black border outline-none",
                          u.subscription_status === 'ACTIVE' ? "border-green-500 text-green-500" : "border-white/10 text-gray-500"
                        )}
                      >
                        <option value="ACTIVE">ATIVO</option>
                        <option value="INACTIVE">INATIVO</option>
                        <option value="TEST">TESTE</option>
                      </select>

                      {u.role === 'admin' && (
                        <div className="flex items-center gap-1 border-t border-white/5 pt-2">
                          <span className="text-[8px] text-gray-500 uppercase">Ganhos:</span>
                          <input 
                            type="number" 
                            step="1"
                            value={u.partnership_percentage || 0}
                            onChange={(e) => handleUpdateAdminPartnership(u.id, { partnership_percentage: parseInt(e.target.value) || 0 })}
                            className="w-10 bg-transparent border-b border-white/10 text-[10px] text-white focus:outline-none"
                          />
                          <span className="text-[8px] text-gray-500">%</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {u.role === 'admin' ? (
                      <div className="flex flex-col gap-2">
                        <div className="flex flex-col">
                          <span className="text-[8px] text-gray-500 uppercase">Pendente (R$)</span>
                          <input 
                            type="number" 
                            step="0.01"
                            value={u.pending_balance || 0}
                            onChange={(e) => handleUpdateAdminPartnership(u.id, { pending_balance: parseFloat(e.target.value) || 0 })}
                            className="bg-transparent border-b border-white/10 text-[10px] text-white focus:outline-none w-20"
                          />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[8px] text-gray-500 uppercase">Acumulado (R$)</span>
                          <input 
                            type="number" 
                            step="0.01"
                            value={u.accumulated_balance || 0}
                            onChange={(e) => handleUpdateAdminPartnership(u.id, { accumulated_balance: parseFloat(e.target.value) || 0 })}
                            className="bg-transparent border-b border-white/10 text-[10px] text-white focus:outline-none w-20"
                          />
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-500 text-[10px]">{new Date(u.created_at).toLocaleDateString('pt-BR')}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-red-500 hover:text-red-400 text-xs font-bold uppercase tracking-widest">Bloquear</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : activeTab === 'voluntarios' ? (
        <div className="bg-dark-card rounded-3xl border border-white/5 overflow-hidden shadow-2xl p-8 pb-16">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-white/5 pb-6">
            <div>
              <h2 className="text-xl font-black italic uppercase tracking-tighter text-white flex items-center gap-2">
                <UserCheck className="text-f1-blue animate-pulse" size={24} /> Candidatos a Voluntariado
              </h2>
              <p className="text-xs text-gray-500 uppercase font-black tracking-widest mt-1">Total de {volunteers.length} inscrições recebidas</p>
            </div>
            {volunteers.length > 0 && (
              <button 
                onClick={() => {
                  if (window.confirm("Deseja realmente limpar todos os candidatos salvos localmente?")) {
                    localStorage.removeItem('gridplay-volunteers');
                    setVolunteers([]);
                  }
                }}
                className="text-[10px] text-red-500 hover:text-white hover:bg-red-500 border border-red-500/30 font-black uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all duration-300 cursor-pointer"
              >
                Limpar Tudo
              </button>
            )}
          </div>
          {volunteers.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <div className="w-16 h-16 bg-white/[0.02] border border-white/5 rounded-full flex items-center justify-center mb-6 mx-auto">
                <Users size={32} className="text-gray-600 animate-pulse" />
              </div>
              <p className="text-sm font-black uppercase tracking-widest text-gray-500 mb-1">Nenhum candidato voluntário registrado ainda</p>
              <p className="text-xs text-gray-500">O formulário público "Seja parceiro" preenchido por candidatos aparecerá aqui.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {[...volunteers]
                .sort((a, b) => new Date(b.created_at || b.submittedAt || 0).getTime() - new Date(a.created_at || a.submittedAt || 0).getTime())
                .map((vol, index) => (
                  <div key={vol.id || index} className="p-6 bg-black/45 border border-white/5 rounded-2xl space-y-4 hover:border-white/10 transition-all duration-300 shadow-xl shadow-black/10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-4">
                      <div>
                        <h3 className="text-lg font-black text-white italic tracking-tight">{vol.name}</h3>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-1.5 text-xs text-gray-400">
                          <span className="flex items-center gap-1.5"><Mail size={12} className="text-f1-blue" /> {vol.email}</span>
                          <span className="text-gray-700 hidden md:inline">•</span>
                          <span className="flex items-center gap-1.5"><Phone size={12} className="text-citrus-yellow" /> {vol.phone}</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-gray-500 font-mono bg-white/[0.03] px-3 py-1 rounded-md border border-white/5 self-start md:self-auto">
                        {new Date(vol.created_at || vol.submittedAt || Date.now()).toLocaleString('pt-BR')}
                      </span>
                    </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Funções de Interesse:</h4>
                    <div className="flex flex-wrap gap-2">
                      {vol.roles && vol.roles.map((role: string) => (
                        <span key={role} className="text-[10px] bg-f1-blue/10 border border-f1-blue/20 text-f1-blue font-black px-2.5 py-1 rounded-md tracking-wide">
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Carta de Apresentação &amp; Experiência:</h4>
                    <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap bg-black border border-white/5 p-4 rounded-xl font-medium">
                      {vol.about}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8 pb-24">
          <div className="lg:col-span-1">
            <div className="bg-dark-card p-8 rounded-3xl border border-white/5 sticky top-32">
              <h2 className="text-xl font-black italic uppercase tracking-tighter mb-8 bg-f1-blue text-white px-4 py-2 inline-block skew-x-[-12deg]">
                Nova Postagem
              </h2>
              <form onSubmit={handleAddPost} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Título</label>
                  <input 
                    type="text" 
                    required
                    value={newPost.title}
                    onChange={e => {
                      const title = e.target.value;
                      setNewPost({ 
                        ...newPost, 
                        title,
                        slug: generateSlug(title)
                      });
                    }}
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-f1-blue outline-none transition-all"
                    placeholder="Título do artigo"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Slug Personalizado</label>
                  <input 
                    type="text" 
                    required
                    value={newPost.slug}
                    onChange={e => setNewPost({ ...newPost, slug: e.target.value })}
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-f1-blue outline-none transition-all"
                    placeholder="slug-do-artigo"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Resumo (Excerpt)</label>
                  <textarea 
                    required
                    value={newPost.excerpt}
                    onChange={e => setNewPost({ ...newPost, excerpt: e.target.value })}
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-f1-blue outline-none transition-all h-24"
                    placeholder="Um breve resumo para a listagem"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">URL da Imagem</label>
                  <input 
                    type="url" 
                    required
                    value={newPost.image_url}
                    onChange={e => setNewPost({ ...newPost, image_url: e.target.value })}
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-f1-blue outline-none transition-all"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Conteúdo (Markdown)</label>
                  <textarea 
                    required
                    value={newPost.content}
                    onChange={e => setNewPost({ ...newPost, content: e.target.value })}
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm font-mono focus:border-f1-blue outline-none transition-all h-64"
                    placeholder="# Meu Título\n\nConteúdo em markdown..."
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="published"
                    checked={newPost.published}
                    onChange={e => setNewPost({ ...newPost, published: e.target.checked })}
                    className="w-5 h-5 bg-black border border-white/10 rounded accent-f1-blue"
                  />
                  <label htmlFor="published" className="text-sm font-bold text-gray-300">Publicar imediatamente</label>
                </div>
                <button 
                  type="submit" 
                  className="w-full bg-f1-blue hover:bg-red-700 text-white font-black italic uppercase tracking-tighter py-4 rounded-xl transition-all shadow-lg"
                >
                  Criar Postagem
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            {posts.map(post => (
              <div key={post.id} className="bg-dark-card p-6 rounded-2xl border border-white/5 flex gap-6">
                <img 
                  src={post.image_url} 
                  alt={post.title}
                  className="w-32 h-20 object-cover rounded-xl"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-black uppercase italic tracking-tighter">{post.title}</h3>
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => handleTogglePostPublish(post.id, post.published)}
                        className={cn("text-[10px] font-black uppercase tracking-widest transition-colors", post.published ? "text-green-500 hover:text-green-400" : "text-gray-500 hover:text-gray-400")}
                        title={post.published ? "Desativar" : "Publicar"}
                      >
                        {post.published ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                      <button 
                        onClick={() => handleDeletePost(post.id)}
                        className="text-red-500 hover:text-red-400 transition-colors"
                        title="Excluir"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-500 line-clamp-2 italic">{post.excerpt}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// --- Seja Parceiro Public Page ---
const SejaParceiro = ({ profile }: { profile: Profile | null }) => {
  const [name, setName] = useState(profile?.full_name || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [about, setAbout] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const rolesList = [
    "Gestor estratégico de marca",
    "Social Media (faz postagens)",
    "Designer pra redes sociais",
    "Atendimento",
    "Vendas",
    "TI e Inteligência Artificial",
    "Quero aprender sobre tudo!"
  ];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleRoleToggle = (role: string) => {
    setSelectedRoles(prev => 
      prev.includes(role) 
        ? prev.filter(r => r !== role) 
        : [...prev, role]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRoles.length === 0) {
      setErrorMsg("Por favor, selecione pelo menos uma função de interesse.");
      return;
    }
    setIsSubmitting(true);
    setErrorMsg(null);

    // Generate accurate client-side UUID v4 to send same ID to DB, local, and Webhook
    const applicationId = (() => {
      if (typeof crypto !== "undefined" && crypto.randomUUID) {
        try {
          return crypto.randomUUID();
        } catch (e) {}
      }
      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    })();

    const submittedAtStr = new Date().toISOString();

    try {
      // 1. Save directly to Supabase table 'f1volunteers', providing our calculated uuid
      // We don't use .select() here because otherwise Postgres requires SELECT privileges for anon users,
      // which triggers an RLS violation. By omitting .select(), the insert only executes INSERT RLS.
      const { error } = await supabase.from('f1volunteers').insert([
        {
          id: applicationId,
          name,
          email,
          phone,
          about,
          roles: selectedRoles,
          created_at: submittedAtStr
        }
      ]);

      if (error) {
        throw error;
      }

      // 2. Also keep a local backup in localStorage so user has immediate feedback if needed
      const newSubmission = {
        id: applicationId,
        name,
        email,
        phone,
        about,
        roles: selectedRoles,
        submittedAt: submittedAtStr
      };

      try {
        const existing = localStorage.getItem('gridplay-volunteers');
        const submissions = existing ? JSON.parse(existing) : [];
        submissions.push(newSubmission);
        localStorage.setItem('gridplay-volunteers', JSON.stringify(submissions));
      } catch (err) {
        console.error("Local storage write failed:", err);
      }

      // 3. Fire-and-forget/best-effort post request to the specified webhooks URL
      try {
        await fetch('https://webhook.monarcahub.com/webhook/parceiros-f1', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            event: 'new_volunteer_application',
            id: applicationId,
            name,
            email,
            phone,
            about,
            roles: selectedRoles,
            submittedAt: submittedAtStr
          }),
        });
      } catch (webhookErr) {
        console.error("Warning: webhook delivery failed but database persist succeeded:", webhookErr);
      }

      setSubmitted(true);
    } catch (err: any) {
      console.error("Error submitting volunteer application to Supabase:", err);
      setErrorMsg(err?.message || "Erro desconhecido. Verifique se o script SQL foi executado.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-dark-bg text-white pt-32 pb-24 px-4 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-25">
          <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] bg-f1-blue rounded-full blur-[150px]" />
          <div className="absolute bottom-[-20%] right-[-20%] w-[50%] h-[50%] bg-citrus-yellow rounded-full blur-[150px]" />
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 w-full max-w-lg bg-dark-card border border-white/5 p-8 md:p-12 rounded-[2.5rem] shadow-2xl text-center backdrop-blur-xl"
        >
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-8 mx-auto border border-emerald-500/20">
            <Check className="text-emerald-400" size={36} />
          </div>

          <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter mb-4 text-white">
            Inscrição Recebida!
          </h2>
          <p className="text-gray-400 text-sm md:text-base leading-relaxed mb-8">
            Obrigado pelo seu interesse em fazer parte do nosso time voluntário! Seus dados foram salvos com sucesso. Nossa equipe analisará seu perfil com carinho e entrará em contato em breve através do e-mail ou telefone informado.
          </p>

          <Link 
            to="/" 
            className="inline-block bg-f1-blue hover:bg-f1-blue/90 text-white font-bold uppercase tracking-widest text-xs px-8 py-4 rounded-xl transition-all duration-300 shadow-lg shadow-f1-blue/30 hover:shadow-f1-blue/50"
          >
            Voltar para a Home
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg text-white pt-32 pb-24 px-4 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-f1-blue rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-citrus-yellow rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-[10px] bg-f1-blue/10 text-f1-blue border border-f1-blue/20 px-3 py-1.5 rounded-full font-black uppercase tracking-[0.2em] inline-block mb-4">
            Embarque nessa velocidade
          </span>
          <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter mb-6 leading-none">
            seja voluntário do projeto
          </h1>
          <p className="text-gray-300 text-sm md:text-base leading-relaxed max-w-3xl mx-auto font-medium">
            Você ama velocidade, tecnologia, comunicação e sustentabilidade? O nosso projeto institucional é para você! Coloque F1 no seu currículo, se destaque e tenha a possibilidade de ser nosso colaborador efetivo, e também faturar no mercado de automobilismo, traga suas ideias!
          </p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-dark-card border border-white/5 rounded-[2.5rem] shadow-2xl p-6 md:p-12 backdrop-blur-md"
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            <h2 className="text-lg font-black italic uppercase tracking-tight text-white mb-6 border-b border-white/5 pb-4 flex items-center gap-2">
              <UserCheck className="text-f1-blue" size={20} /> Seus Dados Cadastrais
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Nome Completo</label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-gray-500">
                    <User size={16} />
                  </span>
                  <input 
                    type="text" 
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm focus:border-f1-blue focus:ring-1 focus:ring-f1-blue outline-none transition-all"
                    placeholder="Seu nome"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Seu E-mail</label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-gray-500">
                    <Mail size={16} />
                  </span>
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm focus:border-f1-blue focus:ring-1 focus:ring-f1-blue outline-none transition-all"
                    placeholder="seu@email.com"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Telefone com DDD</label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-gray-500">
                    <Phone size={16} />
                  </span>
                  <input 
                    type="tel" 
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm focus:border-f1-blue focus:ring-1 focus:ring-f1-blue outline-none transition-all"
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Status</label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-gray-500">
                    <Briefcase size={16} />
                  </span>
                  <input 
                    type="text"
                    value="Inscrição de Voluntariado"
                    disabled
                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-xs text-gray-500 outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 font-black">Escreva sobre si mesmo e sua experiência</label>
              <textarea 
                required
                value={about}
                onChange={e => setAbout(e.target.value)}
                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-f1-blue focus:ring-1 focus:ring-f1-blue outline-none transition-all h-36 resize-y"
                placeholder="Conte um pouco sobre você, seu background, sonhos, suas ideias e como você pode agregar ao GRIDPLAY..."
              />
            </div>

            <div className="space-y-4">
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400">
                Funções de Interesse (Selecione uma ou mais)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {rolesList.map((role) => {
                  const isChecked = selectedRoles.includes(role);
                  return (
                    <div 
                      key={role} 
                      onClick={() => handleRoleToggle(role)}
                      className={cn(
                        "flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all duration-200 select-none",
                        isChecked 
                          ? "bg-f1-blue/15 border-f1-blue text-white" 
                          : "bg-black/40 border-white/5 hover:border-white/15 text-gray-400 hover:text-white"
                      )}
                    >
                      <div className={cn(
                        "w-5 h-5 rounded flex items-center justify-center border transition-all duration-200",
                        isChecked ? "bg-f1-blue border-f1-blue" : "border-gray-600"
                      )}>
                        {isChecked && <Check size={12} className="text-white font-black" />}
                      </div>
                      <span className="text-sm font-bold">{role}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {errorMsg && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl font-bold uppercase tracking-wide">
                ⚠️ Erro ao salvar candidatura no banco de dados: {errorMsg}
                <p className="mt-1 font-normal lowercase normal-case text-gray-400">Certifique-se de executar o script SQL para a tabela 'f1volunteers' no editor do Supabase.</p>
              </div>
            )}

            <div className="pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-[10px] text-gray-500 italic max-w-md text-center md:text-left">
                Ao enviar suas informações, você concorda que o GRIDPLAY entre em contato com você para tratar de oportunidade de voluntariado institucional.
              </p>
              <button 
                type="submit" 
                disabled={isSubmitting || selectedRoles.length === 0}
                className={cn(
                  "w-full md:w-auto bg-f1-blue text-white font-bold uppercase tracking-widest text-xs px-10 py-4 rounded-xl transition-all duration-300 shadow-xl",
                  selectedRoles.length === 0 
                    ? "opacity-50 cursor-not-allowed bg-gray-700 shadow-none text-gray-400" 
                    : "hover:bg-f1-blue/90 hover:shadow-f1-blue/30 cursor-pointer"
                )}
              >
                {isSubmitting ? "Enviando proposta..." : "Enviar Candidatura"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNonSubscriberModal, setShowNonSubscriberModal] = useState(false);

  useEffect(() => {
    if (!loading) {
      const isNonSubscriber = !profile || profile.plan === 'FREE' || profile.subscription_status !== 'ACTIVE';
      if (isNonSubscriber) {
        const hasSeen = localStorage.getItem('vital_50_promo_seen_v1');
        if (!hasSeen) {
          const timer = setTimeout(() => {
            setShowNonSubscriberModal(true);
          }, 1000);
          return () => clearTimeout(timer);
        }
      }
    }
  }, [loading, profile]);

  useEffect(() => {
    // Initializing standard state
  }, []);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchProfile(session.user.id, session.user);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!profile?.id) return;

    // Use a unique channel name to avoid conflicts
    const channelName = `profile-${profile.id}-${Date.now()}`;
    const subscription = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'f1profiles',
          filter: `id=eq.${profile.id}`
        },
        (payload) => {
          console.log('Profile updated in real-time:', payload.new);
          setProfile(payload.new as Profile);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [profile?.id]);

  const fetchProfile = async (uid: string, authUser?: any) => {
    try {
      console.log("Fetching profile for UID:", uid);
      const { data: existingProfile, error: fetchError } = await supabase
        .from('f1profiles')
        .select('*')
        .eq('id', uid)
        .maybeSingle();
      
      if (fetchError) console.error("Error fetching existing profile:", fetchError);

      const user = authUser || (await supabase.auth.getUser()).data.user;
      if (!user) {
        console.warn("No authenticated user found in fetchProfile");
        setLoading(false);
        return;
      }

      const userEmail = user.email || '';
      const userPhone = user.user_metadata?.phone || '';
      console.log("User data:", { email: userEmail, phone: userPhone });

      // Check if user is a subscriber for auto-upgrade
      // Try email first, then phone
      let subscriber = null;
      
      if (userEmail) {
        const { data: subByEmail } = await supabase
          .from('f1subscribes')
          .select('*')
          .ilike('email', userEmail.trim())
          .maybeSingle();
        if (subByEmail) subscriber = subByEmail;
      }

      if (!subscriber && userPhone) {
        const { data: subByPhone } = await supabase
          .from('f1subscribes')
          .select('*')
          .eq('phone', userPhone.trim())
          .maybeSingle();
        if (subByPhone) subscriber = subByPhone;
      }

      if (subscriber) console.log("Subscriber found:", subscriber);

      if (existingProfile) {
        console.log("Existing profile found:", existingProfile);
        // If profile exists but subscriber data suggests an upgrade is needed
        if (subscriber && (existingProfile.plan === 'FREE' || existingProfile.subscription_status === 'INACTIVE')) {
          console.log("Upgrading existing profile to plan:", subscriber.plan);
          const updatedData = {
            subscription_status: 'ACTIVE' as const,
            plan: subscriber.plan as Profile['plan'],
            phone: userPhone || existingProfile.phone
          };
          
          const { data: updatedProfile, error: updateError } = await supabase
            .from('f1profiles')
            .update(updatedData)
            .eq('id', uid)
            .select()
            .maybeSingle();
          
          if (updateError) console.error("Error updating profile:", updateError);
          if (updatedProfile) setProfile(updatedProfile);
          else setProfile(existingProfile);
        } else {
          setProfile(existingProfile);
        }
        setLoading(false);
        return;
      }

      // If profile doesn't exist, create it
      console.log("Creating new profile for UID:", uid);
      const newProfile = {
        id: uid,
        email: userEmail,
        phone: userPhone,
        subscription_status: 'ACTIVE',
        plan: subscriber ? subscriber.plan : 'FREE',
        role: 'user'
      };

      const { data: createdProfile, error: insertError } = await supabase
        .from('f1profiles')
        .insert([newProfile])
        .select()
        .maybeSingle();

      if (insertError) console.error("Error creating profile:", insertError);
      if (createdProfile) {
        console.log("Profile created successfully:", createdProfile);
        setProfile(createdProfile);
      } else {
        // Fallback: set a local profile state if insert failed but we have user data
        setProfile(newProfile as Profile);
      }
      setLoading(false);
    } catch (err) {
      console.error("Fatal error in fetchProfile:", err);
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-dark-bg text-white">
      <img 
        src="https://i.ibb.co/DP8YRq1Y/logo-GRIDPLAY-2026.png" 
        alt="GRIDPLAY" 
        className="h-16 md:h-24 object-contain animate-pulse"
        referrerPolicy="no-referrer"
      />
    </div>
  );

  return (
    <BrowserRouter>
      <PixelTracker />
      <div className="min-h-screen bg-dark-bg text-white font-sans flex flex-col">
        <Navbar profile={profile} />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home profile={profile} />} />
            <Route path="/login" element={profile ? <Navigate to="/" /> : <Login />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/watch/:id" element={<Watch profile={profile} />} />
            <Route path="/checkout" element={<Checkout profile={profile} />} />
            <Route path="/account" element={<Account profile={profile} />} />
            <Route path="/season/:year" element={<SeasonPage profile={profile} />} />
            <Route path="/admin" element={<AdminPanel profile={profile} />} />
            <Route path="/archives" element={<Archive profile={profile} />} />
            <Route path="/playstream" element={<PlayStream profile={profile} />} />
            <Route path="/blog" element={<Blog profile={profile} />} />
            <Route path="/blog/:slug" element={<BlogPost profile={profile} />} />
            <Route path="/seja-parceiro" element={<SejaParceiro profile={profile} />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <Footer />
        <CookieBanner />
        <Chatwoot profile={profile} />

        <AnimatePresence>
          {showNonSubscriberModal && (
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => {
                  setShowNonSubscriberModal(false);
                  localStorage.setItem('vital_50_promo_seen_v1', 'true');
                }}
                className="absolute inset-0 bg-black/90 backdrop-blur-md"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 30 }}
                transition={{ type: "spring", damping: 25, stiffness: 180 }}
                className="relative w-full max-w-lg bg-[#0e0e0e] rounded-[2rem] overflow-hidden border border-white/10 shadow-[0_0_80px_rgba(240,210,40,0.15)] flex flex-col z-10"
              >
                <button 
                  onClick={() => {
                    setShowNonSubscriberModal(false);
                    localStorage.setItem('vital_50_promo_seen_v1', 'true');
                  }}
                  className="absolute top-4 right-4 bg-black/60 text-gray-400 hover:text-white p-2 rounded-full transition-colors z-20"
                  aria-label="Fechar"
                >
                  <X size={20} />
                </button>

                <div className="p-0 overflow-hidden flex flex-col">
                  <img 
                    src="https://i.ibb.co/R4zkm1gj/VITAL-50-1782224386154.png" 
                    alt="Plano Vitalício GridPlay" 
                    className="w-full h-auto object-contain bg-[#0e0e0e] max-h-[55vh] md:max-h-[65vh]"
                    referrerPolicy="no-referrer"
                  />
                  
                  <div className="p-6 bg-[#0e0e0e] flex flex-col items-center justify-center gap-4 border-t border-white/5">
                    <a 
                      href="https://hotm.io/Vital50f1"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => {
                        setShowNonSubscriberModal(false);
                        localStorage.setItem('vital_50_promo_seen_v1', 'true');
                      }}
                      className="w-full py-4 bg-citrus-yellow text-black font-black text-xs uppercase tracking-widest rounded-full hover:scale-105 transition-all shadow-[0_0_20px_rgba(240,210,40,0.3)] hover:shadow-[0_0_35px_rgba(240,210,40,0.6)] text-center flex items-center justify-center gap-2"
                    >
                      <Gift size={16} /> Fazer volta rápida
                    </a>
                    
                    <button
                      onClick={() => {
                        setShowNonSubscriberModal(false);
                        localStorage.setItem('vital_50_promo_seen_v1', 'true');
                      }}
                      className="text-[10px] text-gray-500 hover:text-gray-300 font-bold uppercase tracking-widest transition-colors"
                    >
                      Talvez mais tarde
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </BrowserRouter>
  );
}
