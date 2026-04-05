import React, { useState, useEffect, FormEvent } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate, useParams } from 'react-router-dom';
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
  EyeOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase, type Profile, type Video } from './lib/supabase';
import { cn } from './lib/utils';

// --- Components ---

const Navbar = ({ profile }: { profile: Profile | null }) => {
  const navigate = useNavigate();
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-gradient-to-b from-black/80 to-transparent px-4 md:px-12 py-4 flex items-center justify-between">
      <div className="flex items-center gap-8">
        <Link to="/maintenance" className="flex items-center">
          <img 
            src="https://i.ibb.co/DP8YRq1Y/logo-GRIDPLAY-2026.png" 
            alt="GRIDPLAY" 
            className="h-8 md:h-10 object-contain"
            referrerPolicy="no-referrer"
          />
        </Link>
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-300">
          <Link to="/maintenance" className="hover:text-white transition-colors">Home</Link>
          <Link to="/maintenance" className="hover:text-white transition-colors">Temporada 2026</Link>
          <Link to="/maintenance" className="hover:text-white transition-colors">Décadas</Link>
          <Link to="/maintenance" className="hover:text-white transition-colors">Documentários</Link>
          <Link to="/maintenance" className="hover:text-white transition-colors">Arquivos</Link>
          {profile?.role === 'admin' && (
            <Link to="/admin" className="text-citrus-yellow hover:opacity-80 transition-opacity">Painel Admin</Link>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="text-gray-300 hover:text-white"><Search size={20} /></button>
        {profile ? (
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-xs text-gray-400">{profile.email}</span>
            <Link to="/account" className="text-gray-300 hover:text-white flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
              <User size={18} />
              <span className="text-[10px] font-bold uppercase tracking-widest hidden lg:inline">Minha Conta</span>
            </Link>
            <button onClick={handleLogout} className="text-gray-300 hover:text-white"><LogOut size={20} /></button>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-white text-sm font-bold uppercase tracking-widest hover:opacity-80 transition-opacity">Entrar</Link>
            <Link to="/login" className="bg-white text-black px-6 py-2 rounded-sm text-sm font-black uppercase tracking-widest hover:bg-gray-200 transition-colors">Assine Agora</Link>
          </div>
        )}
      </div>
    </nav>
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
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {videos.map(video => <VideoCard key={video.id} video={video} />)}
      </div>
    </div>
  );
};

const AdBanner = ({ profile, type = 'normal' }: { profile: Profile | null, type?: 'normal' | 'discreet' }) => {
  const shouldShow = !profile || profile.plan === 'FREE';

  useEffect(() => {
    if (shouldShow) {
      try {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.error("AdSense error:", e);
      }
    }
  }, [shouldShow]);

  if (!shouldShow) return null;

  return (
    <div className={cn(
      "w-full flex justify-center my-12 px-4",
      type === 'discreet' ? "opacity-30 scale-95 hover:opacity-100 transition-opacity" : "opacity-100"
    )}>
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 w-full max-w-5xl flex flex-col items-center justify-center min-h-[100px] relative overflow-hidden backdrop-blur-sm">
        <span className="absolute top-2 right-4 text-[8px] text-gray-600 font-bold uppercase tracking-widest">Publicidade</span>
        <ins className="adsbygoogle"
             style={{ display: 'block', width: '100%', minWidth: '250px', minHeight: '90px' }}
             data-ad-client="ca-pub-7197376783143404"
             data-ad-slot="auto"
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
              Nós e nossas Afiliadas utilizamos terceiros para acessar e armazenar dados no seu dispositivo a fim de analisar o uso e aprimorar sua experiência, além de personalizar, mensurar e fornecer conteúdos e anúncios. Para obter mais informações, consulte nossa Política de Privacidade. Você pode Aceitar todos ou acessar Gerenciar cookies para mais opções.
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

const HighlightsSlider = () => {
  const highlights = [
    { title: "F2", subtitle: "O Caminho para a Glória", image: "https://i.ibb.co/35PQt9qN/f2-2026.jpg" },
    { title: "F3", subtitle: "Onde Nascem os Campeões", image: "https://i.ibb.co/BdqfmpS/f3-2026.jpg" },
    { title: "F1 Academy", subtitle: "A Nova Geração Feminina", image: "https://i.ibb.co/6RBN8gcW/f1academy-2026.jpg" },
    { title: "ONBOARD CAMERA", subtitle: "Sinta a Velocidade de Dentro", image: "https://i.ibb.co/ZzrBvMw7/onboad-camera-f1.jpg" },
    { title: "F1: O Filme", subtitle: "A Emoção das Telas", image: "https://i.ibb.co/nq4yMJvy/f1-filme.jpg" },
    { title: "Drive to Survive 8", subtitle: "Bastidores da Velocidade", image: "https://i.ibb.co/qYx9MvHv/dtv-8.jpg" },
    { title: "Temporada 2012", subtitle: "A Batalha Épica", image: "https://i.ibb.co/pBr66ZbP/f1-2012.jpg" },
    { title: "Temporada 2021", subtitle: "O Duelo Histórico", image: "https://i.ibb.co/1twFwN80/f1-2021.jpg" },
    { title: "Temporada 1950", subtitle: "O Início de Tudo", image: "https://i.ibb.co/DDS3cyTx/f1-1950.jpg" }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % highlights.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [highlights.length]);

  return (
    <div className="w-full py-24 bg-black overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-12">
        <h2 className="text-3xl font-black mb-12 italic uppercase tracking-tighter text-center md:text-left">Destaques Exclusivos</h2>
        
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
                  Em Breve / Disponível
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
      <div className="mt-12 flex gap-8 text-[10px] text-gray-600 uppercase font-bold tracking-tighter">
        <a href="#" className="hover:text-gray-400 transition-colors">Privacidade</a>
        <a href="#" className="hover:text-gray-400 transition-colors">Termos de Uso</a>
        <a href="#" className="hover:text-gray-400 transition-colors">Ajuda</a>
      </div>
      <p className="mt-8 text-[10px] text-gray-700">© 2026 GRIDPLAY. Todos os direitos reservados.</p>
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

const LandingPage = () => {
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
      {/* Hero Section with Background Image */}
      <div className="relative h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 opacity-40 pointer-events-none">
          <img 
            src="https://i.ibb.co/PZyYkyPt/capa-bh-hero-section-GRIDPLAY-F1.jpg" 
            alt="GridPlay Hero" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black" />

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 max-w-4xl"
        >
          <img 
            src="https://i.ibb.co/DP8YRq1Y/logo-GRIDPLAY-2026.png" 
            alt="GRIDPLAY" 
            className="h-16 md:h-24 object-contain mx-auto mb-8 drop-shadow-[0_0_30px_rgba(38,169,224,0.3)]"
            referrerPolicy="no-referrer"
          />
          <h1 className="text-4xl md:text-8xl font-black mb-6 italic tracking-tighter uppercase leading-none">
            O Maior Acervo de <span className="text-f1-blue">F1</span> do Mundo
          </h1>
          <p className="text-gray-300 text-sm md:text-xl mb-10 max-w-2xl mx-auto font-medium opacity-90">
            De 1950 a 2026. Todas as corridas, documentários e bastidores da maior categoria do automobilismo mundial em um só lugar.
          </p>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <Link to="/login" className="w-full md:w-auto bg-citrus-yellow text-black px-12 py-5 rounded-full font-black text-sm uppercase tracking-widest hover:scale-105 transition-transform shadow-lg shadow-citrus-yellow/20">
              Assinar Agora
            </Link>
            <Link to="/login" className="w-full md:w-auto bg-white/10 text-white px-12 py-5 rounded-full font-black text-sm uppercase tracking-widest hover:bg-white/20 transition-all backdrop-blur-md">
              Experimentar Grátis
            </Link>
          </div>
        </motion.div>
      </div>

      <AdBanner profile={null} type="discreet" />

      {/* Plans Section */}
      <div className="py-24 px-4 md:px-12 bg-black flex flex-col items-center">
        <h2 className="text-3xl md:text-5xl font-black mb-8 italic tracking-tighter uppercase text-center">Escolha o melhor plano para você</h2>
        
        {/* Billing Toggle */}
        <div className="flex items-center bg-white/5 p-1 rounded-full mb-16 border border-white/10">
          <button 
            onClick={() => setBillingCycle('monthly')}
            className={cn(
              "px-8 py-2 rounded-full text-sm font-bold uppercase tracking-widest transition-all",
              billingCycle === 'monthly' ? "bg-white text-black" : "text-gray-400 hover:text-white"
            )}
          >
            Mensal
          </button>
          <button 
            onClick={() => setBillingCycle('annual')}
            className={cn(
              "px-8 py-2 rounded-full text-sm font-bold uppercase tracking-widest transition-all",
              billingCycle === 'annual' ? "bg-white text-black" : "text-gray-400 hover:text-white"
            )}
          >
            Anual
          </button>
        </div>

        <div className="flex flex-wrap justify-center gap-8 w-full max-w-6xl mx-auto">
          {/* Free Plan */}
          <div className="p-8 rounded-[2rem] border border-white/5 bg-dark-card flex flex-col hover:border-white/10 transition-all group w-full md:w-[350px]">
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-1">Plano Free</h3>
              <p className="text-gray-500 text-[10px] uppercase font-black tracking-widest">Acesso Básico</p>
            </div>
            <div className="text-4xl font-black mb-8 uppercase tracking-tighter text-white italic">GRÁTIS</div>
            <ul className="space-y-4 mb-10 flex-1">
              <li className="flex items-center gap-3 text-xs text-gray-400 font-medium"><ChevronRight size={14} className="text-f1-blue" /> Comunidade Aberta no Telegram</li>
              <li className="flex items-center gap-3 text-xs text-gray-400 font-medium"><ChevronRight size={14} className="text-f1-blue" /> Temporada Atual (2024+) em HD</li>
              <li className="flex items-center gap-3 text-xs text-gray-400 font-medium"><ChevronRight size={14} className="text-f1-blue" /> Notícias e Destaques em Tempo Real</li>
              <li className="flex items-center gap-3 text-xs text-gray-400 font-medium"><ChevronRight size={14} className="text-f1-blue" /> Upgrade para Premium a qualquer momento</li>
            </ul>
            <Link to="/login" className="w-full border border-white/10 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-center hover:bg-white/5 transition-all">COMEÇAR GRÁTIS</Link>
          </div>

          {billingCycle === 'monthly' ? (
            /* Monthly Plan */
            <div className="p-8 rounded-[2rem] border border-f1-blue/30 bg-white/5 flex flex-col shadow-[0_0_50px_rgba(38,169,224,0.1)] relative overflow-hidden w-full md:w-[350px]">
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-1">Plano Mensal</h3>
                <p className="text-f1-blue text-[10px] uppercase font-black tracking-widest">Acesso Premium</p>
              </div>
              <div className="text-4xl font-black mb-8 italic tracking-tighter">R$ 30<span className="text-sm font-normal text-gray-500 not-italic ml-1">/mês</span></div>
              <ul className="space-y-4 mb-10 flex-1">
                <li className="flex items-center gap-3 text-xs text-gray-300 font-medium"><ChevronRight size={14} className="text-f1-blue" /> Acervo 1981 a atual</li>
                <li className="flex items-center gap-3 text-xs text-gray-300 font-medium"><ChevronRight size={14} className="text-f1-blue" /> Filmes, séries e documentários</li>
                <li className="flex items-center gap-3 text-xs text-gray-300 font-medium"><ChevronRight size={14} className="text-f1-blue" /> Sem anúncios em todo o site</li>
                <li className="flex items-center gap-3 text-xs text-gray-300 font-medium"><ChevronRight size={14} className="text-f1-blue" /> Canal VIP Telegram</li>
              </ul>
              <Link to="/login" className="w-full bg-f1-blue text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-center hover:opacity-90 transition-opacity shadow-lg shadow-f1-blue/20">SELECIONAR</Link>
            </div>
          ) : (
            /* Annual Plan */
            <div className="p-8 rounded-[2rem] border border-citrus-yellow/30 bg-white/5 flex flex-col relative overflow-hidden scale-105 z-10 shadow-[0_0_60px_rgba(255,230,0,0.15)] w-full md:w-[350px]">
              <div className="absolute top-4 right-6 bg-citrus-yellow text-black text-[10px] font-black px-4 py-1.5 rounded-full uppercase italic tracking-widest shadow-xl">Melhor Valor</div>
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-1">Plano Anual</h3>
                <p className="text-citrus-yellow text-[10px] uppercase font-black tracking-widest">Acesso Total</p>
              </div>
              <div className="mb-8">
                <div className="text-xs text-gray-500 line-through font-bold mb-1">12x R$ 28,00</div>
                <div className="text-4xl font-black text-citrus-yellow italic tracking-tighter">12x R$ 14,00<span className="text-sm font-normal text-gray-500 not-italic ml-1">/mês</span></div>
                <div className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-tighter">R$ 140,00 à vista (2 meses grátis)</div>
              </div>
              <ul className="space-y-4 mb-10 flex-1">
                <li className="flex items-center gap-3 text-xs text-gray-200 font-medium"><ChevronRight size={14} className="text-citrus-yellow" /> Acervo Completo 1950 até atual</li>
                <li className="flex items-center gap-3 text-xs text-gray-200 font-medium"><ChevronRight size={14} className="text-citrus-yellow" /> Tudo do plano mensal</li>
                <li className="flex items-center gap-3 text-xs text-gray-200 font-medium"><ChevronRight size={14} className="text-citrus-yellow" /> Prioridade em novos conteúdos</li>
              </ul>
              <Link to="/login" className="w-full bg-citrus-yellow text-black py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-center hover:opacity-90 transition-opacity shadow-lg shadow-citrus-yellow/20">SELECIONAR</Link>
            </div>
          )}
        </div>

        {/* Legal Footer */}
        <div className="mt-16 max-w-4xl text-center">
          <p className="text-[10px] text-gray-500 leading-relaxed">
            Acesso é dado exclusivamente no Telegram e Downloads podem ter restrições em algumas categorias de conteúdo. 
            Economia calculada com base no preço da assinatura anual vs. a assinatura mensal regular ao longo de 12 meses. 
            Promoção válida de 2 de abril a {promoDate}, somente para planos anuais. 
            <a href="#" className="underline hover:text-gray-300 ml-1">Aplicam-se os termos e condições</a>.
          </p>
        </div>
      </div>

      <HighlightsSlider />

      <FAQ />
    </div>
  );
};

// --- Pages ---

const Home = ({ profile }: { profile: Profile | null }) => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (data) setVideos(data);
      setLoading(false);
    };
    fetchVideos();
  }, []);

  if (loading) return <div className="h-screen flex items-center justify-center">Carregando GridPlay...</div>;

  // Render Landing Page for logged-out users
  if (!profile) {
    return <LandingPage />;
  }

  const featured = videos[0];
  const categories = Array.from(new Set(videos.map(v => v.category))) as string[];

  return (
    <div className="min-h-screen pb-20 pt-20 md:pt-24">
      {/* Hero */}
      {featured && (
        <div className="relative h-[60vh] md:h-[75vh] w-full overflow-hidden rounded-b-[2rem] md:rounded-b-[3rem] mx-auto max-w-[1440px]">
          <img 
            src={featured.thumbnail_url || `https://picsum.photos/seed/hero/1920/1080`} 
            className="w-full h-full object-cover"
            alt="Featured"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />
          <div className="absolute inset-0 streaming-gradient" />
          
          <div className="absolute bottom-12 left-4 md:left-12 max-w-2xl">
            <span className="text-citrus-yellow font-black tracking-widest text-[10px] md:text-xs mb-2 block uppercase">Destaque da Semana</span>
            <h1 className="text-3xl md:text-6xl font-black mb-4 italic tracking-tighter uppercase leading-none">{featured.title}</h1>
            <p className="text-gray-300 text-xs md:text-base mb-8 line-clamp-3 font-medium opacity-90">{featured.description}</p>
            <div className="flex items-center gap-3">
              <Link to={`/watch/${featured.id}`} className="bg-white text-black px-6 md:px-8 py-3 rounded-md font-bold text-sm flex items-center gap-2 hover:bg-gray-200 transition-colors">
                <Play size={18} fill="black" /> Assistir Agora
              </Link>
              <button className="bg-gray-500/30 text-white px-6 md:px-8 py-3 rounded-md font-bold text-sm flex items-center gap-2 hover:bg-gray-500/50 transition-colors backdrop-blur-md">
                <Info size={18} /> Detalhes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Carousels */}
      <div className="-mt-12 relative z-10">
        {categories.map((cat, idx) => (
          <React.Fragment key={cat}>
            <Carousel 
              title={cat} 
              videos={videos.filter(v => v.category === cat)} 
            />
            {idx === 0 && <AdBanner profile={profile} />}
          </React.Fragment>
        ))}
      </div>

      {/* Telegram CTA - Differentiated by Plan */}
      <div className="mx-4 md:mx-12 mt-16">
        <div className={cn(
          "p-8 md:p-12 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-8 border transition-all duration-500",
          profile.plan === 'FREE' 
            ? "bg-dark-card border-white/5 shadow-xl" 
            : "bg-gradient-to-br from-f1-blue/20 via-black to-transparent border-f1-blue/30 shadow-[0_0_50px_rgba(38,169,224,0.1)]"
        )}>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center",
                profile.plan === 'FREE' ? "bg-gray-800" : "bg-f1-blue/20"
              )}>
                <Users size={20} className={profile.plan === 'FREE' ? "text-gray-400" : "text-f1-blue"} />
              </div>
              <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter">
                {profile.plan === 'FREE' ? "Comunidade GridPlay" : "Canal VIP Telegram"}
              </h2>
            </div>
            
            <p className="text-gray-400 text-sm md:text-base max-w-xl leading-relaxed">
              {profile.plan === 'FREE' 
                ? "Como membro do Plano Grátis, você tem acesso à nossa comunidade aberta para discutir as corridas e acesso garantido a todas as transmissões da temporada atual em HD." 
                : "Seu acesso Premium inclui o Canal VIP com o acervo histórico completo (1950-2026), documentários exclusivos e downloads liberados."}
            </p>

            {profile.plan === 'FREE' && (
              <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <Link to="/checkout" className="text-citrus-yellow font-black text-xs uppercase tracking-widest flex items-center gap-2 group">
                  Quero o acervo histórico completo <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            )}
          </div>

          <div className="flex flex-col items-center gap-4 w-full md:w-auto">
            <a 
              href={profile.plan === 'FREE' ? "https://t.me/+D15DI9e0ckc0NTQx" : "https://t.me/+NkAHGmviP0kxYzZh"} 
              target="_blank" 
              rel="noreferrer" 
              className={cn(
                "w-full md:w-auto px-10 py-5 rounded-full font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-all hover:scale-105 active:scale-95 shadow-lg",
                profile.plan === 'FREE' 
                  ? "bg-white text-black hover:bg-gray-200" 
                  : "bg-[#24A1DE] text-white hover:bg-[#24A1DE]/90 shadow-[#24A1DE]/20"
              )}
            >
              <ExternalLink size={20} /> 
              {profile.plan === 'FREE' ? "Entre no grupo grátis" : "Acessar Canal VIP"}
            </a>
            {profile.plan === 'FREE' && (
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Acesso Gratuito Liberado</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Maintenance = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 7,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    // Set target date to 7 days from now
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 7);

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      if (distance < 0) {
        clearInterval(timer);
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-dark-bg px-4 py-20 text-center relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-f1-blue rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-citrus-yellow rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 max-w-4xl"
      >
        <img 
          src="https://i.ibb.co/DP8YRq1Y/logo-GRIDPLAY-2026.png" 
          alt="GRIDPLAY" 
          className="h-16 md:h-24 object-contain mx-auto mb-12"
          referrerPolicy="no-referrer"
        />
        
        <div className="inline-block bg-citrus-yellow text-black text-[10px] font-black px-4 py-1.5 rounded-full uppercase italic tracking-widest mb-8 shadow-xl">
          Grande Atualização em Curso
        </div>
        
        <h1 className="text-4xl md:text-7xl font-black mb-8 italic tracking-tighter uppercase leading-none">
          Algo <span className="text-f1-blue">Melhor</span> Está Chegando
        </h1>
        
        <p className="text-gray-400 text-sm md:text-xl mb-16 max-w-2xl mx-auto font-medium leading-relaxed">
          Estamos em processo de atualização para trazer uma plataforma <span className="text-white font-bold">mais rápida, moderna e completa</span> para todos os fãs. 
          Quem tiver paciência será recompensado com uma experiência sem precedentes no mundo da F1.
        </p>

        {/* Countdown Timer */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mb-16">
          {[
            { label: 'Dias', value: timeLeft.days },
            { label: 'Horas', value: timeLeft.hours },
            { label: 'Minutos', value: timeLeft.minutes },
            { label: 'Segundos', value: timeLeft.seconds }
          ].map((item, idx) => (
            <div key={idx} className="bg-white/5 backdrop-blur-md border border-white/10 p-6 md:p-8 rounded-3xl">
              <div className="text-4xl md:text-6xl font-black text-white italic tracking-tighter mb-2">
                {String(item.value).padStart(2, '0')}
              </div>
              <div className="text-[10px] md:text-xs text-gray-500 font-black uppercase tracking-[0.2em]">
                {item.label}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <Link to="/" className="text-white text-sm font-bold uppercase tracking-widest hover:text-citrus-yellow transition-colors">
            Voltar para a Home
          </Link>
          <div className="h-px w-12 bg-white/10 hidden sm:block" />
          <p className="text-gray-500 text-xs font-medium italic">
            "A paciência é a chave para a vitória."
          </p>
        </div>
      </motion.div>
    </div>
  );
};

const Watch = ({ profile }: { profile: Profile | null }) => {
  const { id } = useParams();
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVideo = async () => {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('id', id)
        .single();
      
      if (data) {
        // Check access based on plan and year
        if (data.status === 'PREMIUM') {
          if (!profile || profile.subscription_status === 'INACTIVE') {
            navigate('/checkout');
            return;
          }

          // Plan-specific restrictions
          const year = data.year;
          const plan = profile.plan;

          if (plan === 'FREE' && year < 2024) {
             // Free plan only gets current season (assuming 2024 is current)
             navigate('/checkout');
             return;
          }

          if (plan === 'MONTHLY' && year < 1981) {
             // Monthly plan gets 1981 onwards
             navigate('/checkout');
             return;
          }
          
          // Annual plan gets 1950 onwards (everything)
        }
        setVideo(data);
      }
      setLoading(false);
    };
    fetchVideo();
  }, [id, profile, navigate]);

  if (loading) return <div className="h-screen flex items-center justify-center">Carregando player...</div>;
  if (!video) return <div className="h-screen flex items-center justify-center">Vídeo não encontrado.</div>;

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="aspect-video w-full bg-dark-card rounded-lg overflow-hidden shadow-2xl mb-8">
          <iframe 
            src={video.embed_url} 
            className="w-full h-full"
            allowFullScreen
            title={video.title}
          />
        </div>
        
        <div className="flex flex-col md:flex-row justify-between gap-8 mb-12">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-f1-blue text-white text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider">{video.category}</span>
              <span className="text-gray-400 text-sm">{video.year}</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black mb-6 italic tracking-tighter">{video.title}</h1>
            <p className="text-gray-300 leading-relaxed text-lg">{video.description}</p>
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
      </div>
    </div>
  );
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
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
      navigate('/');
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
          phone: phone
        }
      }
    });
    if (error) setError(error.message);
    else navigate('/');
    setLoading(false);
  };

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

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-dark-card/90 backdrop-blur-xl p-8 rounded-2xl border border-white/10 z-10"
      >
        <div className="text-center mb-8 flex flex-col items-center">
          <img 
            src="https://i.ibb.co/DP8YRq1Y/logo-GRIDPLAY-2026.png" 
            alt="GRIDPLAY" 
            className="h-12 md:h-16 object-contain mb-4"
            referrerPolicy="no-referrer"
          />
          <p className="text-gray-400 text-sm">
            {isSignUp ? "Crie sua conta para acessar o acervo" : "Acesse o maior acervo histórico da F1"}
          </p>
        </div>

        {error && <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-md text-xs mb-6">{error}</div>}

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
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Senha</label>
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
            className="w-full bg-f1-blue text-white font-black py-4 rounded-md hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            {loading ? "Processando..." : (isSignUp ? "CRIAR CONTA" : "ENTRAR")}
          </button>
          
          <div className="text-center mt-6">
            <button 
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
              }}
              className="text-xs text-gray-400 hover:text-white transition-colors underline underline-offset-4"
            >
              {isSignUp ? "Já tem uma conta? Entrar" : "Não tem uma conta? Criar agora"}
            </button>
          </div>

          <p className="text-[10px] text-gray-500 text-center mt-4">
            *O Plano Grátis também requer a criação de uma conta para acesso.
          </p>
        </form>
      </motion.div>
    </div>
  );
};

const Checkout = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black pt-32 pb-20 px-4">
      <div className="max-w-6xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Lock size={48} className="text-citrus-yellow mx-auto mb-6" />
          <h1 className="text-4xl md:text-7xl font-black mb-6 italic tracking-tighter uppercase leading-none">Escolha seu Plano</h1>
          <p className="text-gray-400 text-sm md:text-xl mb-12 max-w-2xl mx-auto font-medium">
            Desbloqueie o acesso total ao maior acervo de Fórmula 1 do mundo. Escolha o plano que melhor se adapta à sua paixão.
          </p>
        </motion.div>
        
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
            Anual
          </button>
        </div>

        <div className="flex flex-wrap justify-center gap-8 w-full max-w-6xl mx-auto">
          {/* Free Plan (Always Visible as secondary) */}
          <div className="bg-dark-card/50 p-10 rounded-[2.5rem] border border-white/5 flex flex-col backdrop-blur-sm hover:border-white/10 transition-colors w-full md:w-[380px]">
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-1">Plano Free</h3>
              <p className="text-gray-500 text-[10px] uppercase font-black tracking-widest">Acesso Básico</p>
            </div>
            <div className="text-4xl font-black text-white mb-8 uppercase tracking-tighter italic">GRÁTIS</div>
            <ul className="text-xs text-gray-400 space-y-4 mb-12 flex-1 font-medium">
              <li className="flex items-center gap-3"><ChevronRight size={14} className="text-f1-blue" /> Comunidade no Telegram</li>
              <li className="flex items-center gap-3"><ChevronRight size={14} className="text-f1-blue" /> Apenas corridas em HD</li>
              <li className="flex items-center gap-3"><ChevronRight size={14} className="text-f1-blue" /> Apenas temporada atual (2024+)</li>
              <li className="flex items-center gap-3"><ChevronRight size={14} className="text-f1-blue" /> R$10 / temporada avulsa</li>
            </ul>
            <button 
              onClick={() => navigate('/')}
              className="w-full border border-white/10 text-white font-black py-4 rounded-2xl text-xs uppercase tracking-widest hover:bg-white/5 transition-all"
            >
              Manter Plano Atual
            </button>
          </div>

          {billingCycle === 'monthly' ? (
            /* Monthly */
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gradient-to-br from-f1-blue/10 to-black p-10 rounded-[2.5rem] border border-f1-blue/30 flex flex-col shadow-[0_0_60px_rgba(38,169,224,0.15)] w-full md:w-[380px]"
            >
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-1">Plano Mensal</h3>
                <p className="text-f1-blue text-[10px] uppercase font-black tracking-widest">Acesso Premium</p>
              </div>
              <div className="text-4xl font-black text-white mb-8 italic tracking-tighter">
                R$ 30<span className="text-sm font-normal text-gray-500 not-italic ml-1">/mês</span>
              </div>
              <ul className="text-xs text-gray-300 space-y-4 mb-12 flex-1 font-medium">
                <li className="flex items-center gap-3"><ChevronRight size={14} className="text-f1-blue" /> Acervo 1981 - Atual</li>
                <li className="flex items-center gap-3"><ChevronRight size={14} className="text-f1-blue" /> Filmes, Séries e Documentários</li>
                <li className="flex items-center gap-3"><ChevronRight size={14} className="text-f1-blue" /> Sem anúncios em todo o site</li>
                <li className="flex items-center gap-3"><ChevronRight size={14} className="text-f1-blue" /> Canal VIP Telegram</li>
              </ul>
              <button className="w-full bg-f1-blue text-white font-black py-5 rounded-2xl text-xs uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-f1-blue/20">
                Assinar Mensal
              </button>
            </motion.div>
          ) : (
            /* Annual */
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gradient-to-br from-citrus-yellow/10 to-black p-10 rounded-[2.5rem] border border-citrus-yellow/30 relative flex flex-col scale-105 z-10 shadow-[0_0_80px_rgba(255,230,0,0.2)] w-full md:w-[380px]"
            >
              <div className="absolute -top-4 right-8 bg-citrus-yellow text-black text-[10px] font-black px-4 py-1.5 rounded-full uppercase italic tracking-widest shadow-xl">Melhor Valor</div>
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-1">Plano Anual</h3>
                <p className="text-citrus-yellow text-[10px] uppercase font-black tracking-widest">Acesso Total</p>
              </div>
              <div className="mb-8">
                <div className="text-xs text-gray-500 line-through font-bold mb-1">12x R$ 28,00</div>
                <div className="text-4xl font-black text-citrus-yellow italic tracking-tighter">
                  12x R$ 14,00<span className="text-sm font-normal text-gray-500 not-italic ml-1">/mês</span>
                </div>
                <p className="text-[10px] text-gray-500 mt-2 font-bold uppercase tracking-tighter">R$ 140,00 à vista (2 meses grátis)</p>
              </div>
              <ul className="text-xs text-gray-200 space-y-4 mb-12 flex-1 font-medium">
                <li className="flex items-center gap-3"><ChevronRight size={14} className="text-citrus-yellow" /> Acervo Completo 1950 - Atual</li>
                <li className="flex items-center gap-3"><ChevronRight size={14} className="text-citrus-yellow" /> Tudo do plano mensal</li>
                <li className="flex items-center gap-3"><ChevronRight size={14} className="text-citrus-yellow" /> Prioridade em novos conteúdos</li>
              </ul>
              <button className="w-full bg-citrus-yellow text-black font-black py-5 rounded-2xl text-xs uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-citrus-yellow/20">
                Assinar Anual
              </button>
            </motion.div>
          )}
        </div>

        <button 
          onClick={() => navigate('/')}
          className="mt-16 text-gray-500 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2 mx-auto"
        >
          <ChevronLeft size={16} /> Voltar para a Home
        </button>
      </div>
    </div>
  );
};

const Account = ({ profile }: { profile: Profile | null }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);

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
      <div className="max-w-md mx-auto bg-dark-card border border-white/5 rounded-[2rem] p-8 md:p-12 shadow-2xl">
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
              <span className="text-citrus-yellow">{profile.plan}</span>
            </div>
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-gray-500 mt-2">
              <span>Status</span>
              <span className={profile.subscription_status === 'ACTIVE' ? "text-green-500" : "text-red-500"}>
                {profile.subscription_status === 'ACTIVE' ? "ATIVO" : "INATIVO"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminPanel = ({ profile }: { profile: Profile | null }) => {
  const [activeTab, setActiveTab] = useState<'cms' | 'crm'>('cms');
  const [videos, setVideos] = useState<Video[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [newVideo, setNewVideo] = useState({
    title: '',
    year: 2024,
    description: '',
    category: 'Temporada',
    embed_url: '',
    status: 'PREMIUM' as Video['status'],
    thumbnail_url: ''
  });

  useEffect(() => {
    if (profile?.role !== 'admin') return;
    
    const fetchData = async () => {
      const [vRes, uRes] = await Promise.all([
        supabase.from('videos').select('*').order('created_at', { ascending: false }),
        supabase.from('f1profiles').select('*').order('created_at', { ascending: false })
      ]);
      if (vRes.data) setVideos(vRes.data);
      if (uRes.data) setUsers(uRes.data);
      setLoading(false);
    };
    fetchData();
  }, [profile]);

  const handleAddVideo = async (e: FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase.from('videos').insert([newVideo]).select();
    if (data) {
      setVideos([data[0], ...videos]);
      setNewVideo({ title: '', year: 2024, description: '', category: 'Temporada', embed_url: '', status: 'PREMIUM', thumbnail_url: '' });
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

  if (profile?.role !== 'admin') return <Navigate to="/" />;

  return (
    <div className="min-h-screen pt-24 px-4 md:px-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black italic uppercase tracking-tighter">Painel de Controle</h1>
        <div className="flex bg-dark-card rounded-lg p-1">
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
        </div>
      </div>

      {activeTab === 'cms' ? (
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
                  required
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
      ) : (
        <div className="bg-dark-card rounded-xl border border-white/5 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-gray-400 uppercase text-[10px] font-black tracking-widest">
              <tr>
                <th className="px-6 py-4">Usuário</th>
                <th className="px-6 py-4">Plano</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Data Cadastro</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold">{u.email}</div>
                    <div className="text-[10px] text-gray-500 uppercase">{u.role} {u.phone && `• ${u.phone}`}</div>
                  </td>
                  <td className="px-6 py-4">
                    <select 
                      value={u.plan}
                      onChange={(e) => handleUpdateUserPlan(u.id, e.target.value as Profile['plan'])}
                      className="text-[10px] font-black px-2 py-1 rounded-md bg-black border border-white/10 outline-none text-gray-300"
                    >
                      <option value="FREE">FREE</option>
                      <option value="MONTHLY">MENSAL</option>
                      <option value="ANNUAL">ANUAL</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <select 
                      value={u.subscription_status}
                      onChange={(e) => handleUpdateUserStatus(u.id, e.target.value as Profile['subscription_status'])}
                      className={cn(
                        "text-[10px] font-black px-2 py-1 rounded-md bg-black border border-white/10 outline-none",
                        u.subscription_status === 'ACTIVE' ? "text-green-500" : 
                        u.subscription_status === 'TEST' ? "text-citrus-yellow" : "text-red-500"
                      )}
                    >
                      <option value="ACTIVE">ATIVO</option>
                      <option value="INACTIVE">INATIVO</option>
                      <option value="TEST">TESTE</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-gray-400">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-red-500 hover:text-red-400 text-xs font-bold uppercase tracking-widest">Bloquear</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

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

    return () => subscription.unsubscribe();
  }, []);

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
      <div className="min-h-screen bg-dark-bg text-white font-sans flex flex-col">
        <Navbar profile={profile} />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home profile={profile} />} />
            <Route path="/login" element={profile ? <Navigate to="/" /> : <Login />} />
            <Route path="/watch/:id" element={<Watch profile={profile} />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/account" element={<Account profile={profile} />} />
            <Route path="/admin" element={<AdminPanel profile={profile} />} />
            <Route path="/maintenance" element={<Maintenance />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <Footer />
        <CookieBanner />
      </div>
    </BrowserRouter>
  );
}
