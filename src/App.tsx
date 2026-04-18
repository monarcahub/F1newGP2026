import React, { useState, useEffect, FormEvent, useRef } from 'react';
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
  Menu
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase, type Profile, type Video, type Reaction, type Comment } from './lib/supabase';
import { cn } from './lib/utils';

declare global {
  interface Window {
    chatwootSettings: any;
    chatwootSDK: any;
  }
}

// --- Components ---

const Navbar = ({ profile }: { profile: Profile | null }) => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const menuItems = [
    { label: 'Home', path: '/' },
    { label: 'Temporada 2026', path: '/season/2026' },
    { label: 'Documentários', path: '/maintenance' },
    { label: 'Arquivos', path: '/maintenance' },
  ];

  if (profile?.role === 'admin') {
    menuItems.push({ label: 'Painel Admin', path: '/admin' });
  }

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-gradient-to-b from-black/90 via-black/40 to-transparent px-4 md:px-12 py-4 grid grid-cols-2 md:grid-cols-3 items-center backdrop-blur-sm md:backdrop-blur-none border-b border-white/5 md:border-none">
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
            <div className="flex items-center gap-2 md:gap-4">
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
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login" className="hidden md:block text-white text-sm font-bold uppercase tracking-widest hover:opacity-80 transition-opacity">Entrar</Link>
              <Link 
                to="/login" 
                className="bg-white text-black px-4 md:px-6 py-2 rounded-sm text-[10px] md:text-xs font-black uppercase tracking-widest hover:bg-gray-200 transition-colors"
              >
                Assine Agora
              </Link>
            </div>
          )}
        </div>
      </nav>

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
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {videos.map(video => <VideoCard key={video.id} video={video} />)}
      </div>
    </div>
  );
};

const AdBanner = ({ profile, type = 'normal', adSlot = 'auto' }: { profile: Profile | null, type?: 'normal' | 'discreet', adSlot?: string }) => {
  // Discreet banners show for everyone (including paid), normal banners only for FREE/Guest
  const shouldShow = type === 'discreet' ? true : (!profile || profile.plan === 'FREE');
  const adRef = useRef<HTMLModElement>(null);
  const pushedRef = useRef(false);

  useEffect(() => {
    if (shouldShow && adRef.current && !pushedRef.current) {
      const timer = setTimeout(() => {
        try {
          if (adRef.current && !pushedRef.current) {
            const status = adRef.current.getAttribute('data-adsbygoogle-status');
            if (status === 'done') {
              pushedRef.current = true;
              return;
            }

            const width = adRef.current.offsetWidth;
            if (width > 0) {
              // @ts-ignore
              (window.adsbygoogle = window.adsbygoogle || []).push({});
              pushedRef.current = true;
            }
          }
        } catch (e) {
          console.error("AdSense error:", e);
        }
      }, 1000); // Increased delay to ensure layout is ready

      return () => clearTimeout(timer);
    }
  }, [shouldShow]);

  if (!shouldShow) return null;

  return (
    <div className={cn(
      "w-full flex justify-center my-12 px-4",
      type === 'discreet' ? "opacity-60 scale-95 hover:opacity-100 transition-opacity" : "opacity-100"
    )}>
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 w-full max-w-5xl flex flex-col items-center justify-center min-h-[120px] relative overflow-hidden backdrop-blur-sm">
        <span className="absolute top-2 right-4 text-[8px] text-gray-600 font-bold uppercase tracking-widest">Publicidade</span>
        
        {/* Placeholder for when ad is loading or not available */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
          <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">Espaço Publicitário</div>
        </div>

        <ins ref={adRef} className="adsbygoogle"
             style={{ display: 'block', width: '100%', minWidth: '250px', minHeight: '90px', position: 'relative', zIndex: 1 }}
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
    const { data, error } = await supabase
      .from('f1comments')
      .select('*, f1profiles(full_name, email)')
      .eq('video_id', videoId)
      .order('created_at', { ascending: true });

    if (data) setComments(data);
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

    if (!error) {
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
              {profile.email[0].toUpperCase()}
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
                {comment.f1profiles?.email[0].toUpperCase() || '?'}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold">{comment.f1profiles?.full_name || comment.f1profiles?.email.split('@')[0]}</span>
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
                          {reply.f1profiles?.email[0].toUpperCase() || '?'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold">{reply.f1profiles?.full_name || reply.f1profiles?.email.split('@')[0]}</span>
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
            O MAIOR ACERVO DE <span className="text-f1-blue">F1</span> DO BRASIL
          </h1>
          
          <div className="flex flex-col items-center mb-10">
            <span className="text-white/80 text-[10px] uppercase font-black tracking-widest mb-2">A PARTIR DE</span>
            <div className="flex items-start text-white">
              <span className="text-2xl font-black mt-2 mr-1">R$</span>
              <span className="text-7xl md:text-8xl font-black italic tracking-tighter">14,95</span>
              <span className="text-xl font-bold mt-4 md:mt-6 ml-1 opacity-70">/MÊS*</span>
            </div>
            <span className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] mt-2">SÓ PARA PLANOS ANUAIS</span>
          </div>
          
          <div className="flex flex-col items-center gap-6">
            <Link 
              to="/login" 
              className="bg-white text-black px-20 py-4 rounded-full font-black text-xs uppercase tracking-[0.2em] hover:scale-105 transition-transform shadow-2xl"
            >
              ASSINE AGORA
            </Link>
            
            <p className="text-[9px] md:text-[10px] text-white/40 max-w-md font-bold uppercase tracking-wider">
              *Oferta válida até {promoDate}. Desconto válido para o primeiro ano. <a href="#" className="underline">Aplicam termos</a>.
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
      <div className="py-24 px-4 md:px-12 relative">
        <div className="relative z-10 flex flex-col items-center">
          <h2 className="text-3xl md:text-5xl font-black mb-4 italic tracking-tighter uppercase text-center">
            ESCOLHA O MELHOR PLANO PARA VOCÊ
          </h2>
          <span className="text-gray-500 mb-10 text-[10px] font-black uppercase tracking-[0.3em]">ECONOMIZE ATE 50%</span>
          
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
              ANUAL
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
                  Apenas temporada atual (2024+)
                </li>
                <li className="flex items-start gap-3 text-xs text-gray-400 font-medium tracking-tight">
                  <ChevronRight size={14} className="text-f1-blue shrink-0 mt-0.5" /> 
                  R$10 / temporada avulsa
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
                </ul>
                <div className="text-3xl font-black italic tracking-tighter uppercase mb-6 text-white text-left">
                  R$ 30<span className="text-sm font-normal text-gray-500 not-italic ml-1">/mês</span>
                </div>
                <Link to="/login" className="w-full bg-f1-blue text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-widest text-center shadow-lg shadow-f1-blue/20 hover:opacity-90 transition-opacity">ASSINAR MENSAL</Link>
              </div>
            )}

            {/* Platinum / Anual */}
            {billingCycle === 'annual' && (
              <div className="p-8 rounded-[2.5rem] border border-citrus-yellow/30 bg-white/5 w-full md:w-[320px] flex flex-col relative shrink-0 overflow-hidden">
                 <div className="absolute top-0 right-0 left-0 h-1 bg-citrus-yellow shadow-[0_0_15px_rgba(255,230,0,0.5)]" />
                 <div className="absolute top-4 right-4 bg-citrus-yellow text-black text-[8px] font-black px-3 py-1 rounded-full uppercase italic">MELHOR VALOR</div>
                <div className="mb-6 text-white text-left mt-4">
                  <h3 className="text-xl font-bold mb-1 text-white">Plano Anual</h3>
                  <p className="text-gray-500 text-[10px] uppercase font-black tracking-widest">ACESSO TOTAL</p>
                </div>
                <div className="mb-6 text-left">
                  <div className="text-gray-500 line-through text-xs font-bold mb-1">12x R$ 28,00</div>
                  <div className="text-4xl font-black text-citrus-yellow italic tracking-tighter uppercase">
                    12x R$ 14,00<span className="text-xs font-normal text-gray-500 not-italic ml-1">/mês</span>
                  </div>
                  <div className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-1">R$ 140,00 À VISTA (2 MESES GRÁTIS)</div>
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
                    Prioridade em novos conteúdos
                  </li>
                </ul>
                <Link to="/login" className="w-full bg-citrus-yellow text-black py-4 rounded-xl font-black text-[10px] uppercase tracking-widest text-center hover:opacity-90 transition-opacity">ASSINAR ANUAL</Link>
              </div>
            )}
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

      <HighlightsSlider />
      <FAQ />
      
      {/* Mini Legal Footer */}
      <footer className="py-20 border-t border-white/5 text-center px-4">
        <p className="text-[10px] text-gray-600 max-w-2xl mx-auto leading-relaxed uppercase tracking-widest font-bold">
          © 2026 GRIDPLAY. Este site não é oficial e não está associado de forma alguma ao grupo de empresas da Formula 1. F1, FORMULA ONE, FORMULA 1, FIA FORMULA ONE WORLD CHAMPIONSHIP, GRAND PRIX e marcas relacionadas são marcas comerciais da Formula One Licensing B.V.
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
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVideos = async () => {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
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
  if (!profile) return <LandingPage />;

  const featured = videos[0];
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
              
              <h1 className="text-4xl md:text-8xl font-black mb-6 italic tracking-tighter uppercase leading-[0.9] drop-shadow-2xl">
                {featured.title}
              </h1>
              
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
                    <button className="bg-white/10 text-white border border-white/20 px-8 py-5 rounded-full font-bold text-sm uppercase tracking-widest flex items-center gap-2 hover:bg-white/20 transition-all backdrop-blur-md">
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
      <div className="relative z-10 -mt-20 px-4 md:px-12 space-y-16 pb-24">
        
        {/* Season 2026 Promo Banner */}
        <div className="max-w-[1440px] mx-auto">
          <Link 
            to="/season/2026"
            className="group relative block w-full h-48 md:h-72 rounded-[2.5rem] overflow-hidden border border-white/10 hover:border-f1-blue/50 transition-all duration-700 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] bg-dark-card"
          >
            <img 
              src="https://i.ibb.co/ZzrBvMw7/onboad-camera-f1.jpg" 
              alt="Temporada 2026"
              className="w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-1000 grayscale group-hover:grayscale-0"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-center p-8 md:p-16">
              <span className="text-f1-blue font-black tracking-[0.3em] text-[10px] mb-3 block uppercase">Exclusivo GridPlay</span>
              <h2 className="text-3xl md:text-6xl font-black italic tracking-tighter uppercase mb-4 leading-none">Temporada 2026</h2>
              <p className="text-gray-400 text-xs md:text-base max-w-lg font-medium mb-8 opacity-80">Experimente a adrenalina pura com câmeras onboard exclusivas e telemetria em tempo real.</p>
              <div className="flex items-center gap-3 text-white font-black text-[10px] md:text-xs uppercase tracking-widest group-hover:gap-5 transition-all">
                EXPLORAR TEMPORADA <div className="w-10 h-px bg-f1-blue group-hover:w-16 transition-all" /> <ChevronRight size={16} />
              </div>
            </div>
          </Link>
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
            
            <div className="flex gap-6 overflow-x-auto pb-10 scrollbar-hide snap-x -mx-4 md:mx-0 px-4 md:px-0">
              {videos.filter(v => v.category === cat).map((video) => (
                <div 
                  key={video.id}
                  onClick={() => handleWatchClick(video.id)}
                  className="relative flex-shrink-0 w-72 md:w-[400px] aspect-video bg-dark-card rounded-2xl overflow-hidden group transition-all duration-500 hover:scale-105 snap-start border border-white/5 hover:border-f1-blue/30 cursor-pointer shadow-2xl"
                >
                  <img 
                    src={video.thumbnail_url || `https://picsum.photos/seed/${video.id}/800/450`} 
                    alt={video.title}
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-500 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${video.id}/800/450`;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent flex flex-col justify-end p-6 translate-y-2 group-hover:translate-y-0 transition-transform">
                    <h3 className="text-sm md:text-lg font-black italic uppercase tracking-tight group-hover:text-f1-blue transition-colors mb-2">{video.title}</h3>
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{video.year}</p>
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md group-hover:bg-f1-blue group-hover:text-white transition-all shadow-lg">
                        <Play size={16} fill="currentColor" />
                      </div>
                    </div>
                  </div>
                  {video.status === 'PREMIUM' && (
                    <div className="absolute top-4 right-4 bg-citrus-yellow text-black text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-xl">PREMIUM</div>
                  )}
                  <div className="absolute inset-0 border-[3px] border-transparent group-hover:border-f1-blue/20 rounded-2xl transition-colors pointer-events-none" />
                </div>
              ))}
            </div>
            {idx === 0 && <AdBanner profile={profile} />}
          </div>
        ))}

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
                  DESBLOQUEAR ACERVO COMPLETO 1950-2026 
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

const SeasonSelector = ({ year, availableYears, onSelect }: { year: string | undefined, availableYears: number[], onSelect: (y: number) => void }) => {
  const [showSeasonDropdown, setShowSeasonDropdown] = useState(false);

  return (
    <div className="relative inline-block">
      <button 
        onClick={() => setShowSeasonDropdown(!showSeasonDropdown)}
        className="flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-3 rounded-xl hover:bg-white/10 transition-all group"
      >
        <span className="text-sm font-black italic uppercase tracking-tighter">Temporada {year || '2026'}</span>
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
                  "w-full text-left px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-white/5 transition-colors",
                  parseInt(year || '2026') === y ? "text-f1-blue bg-f1-blue/5" : "text-gray-400"
                )}
              >
                Temporada {y}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SeasonPage = ({ profile }: { profile: Profile | null }) => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showPlansModal, setShowPlansModal] = useState(false);
  const { year } = useParams();
  const navigate = useNavigate();

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

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('year', parseInt(year || '2026'))
        .order('created_at', { ascending: true });

      if (error) {
        console.error("Error fetching season videos:", error);
      } else {
        setVideos(data || []);
      }
      setLoading(false);
    };

    fetchVideos();
  }, [year]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-dark-bg">
      <div className="w-12 h-12 border-4 border-f1-blue border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const featuredVideo = videos[0];
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
        <div className="h-[40vh] flex items-center justify-center text-gray-500 font-bold uppercase tracking-widest">
          Nenhum vídeo disponível para esta temporada ainda.
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
        
        <div className="flex gap-4 overflow-x-auto pb-8 scrollbar-hide snap-x">
          {episodes.map((video) => (
            <div 
              key={video.id}
              onClick={() => handleWatchClick(video.id)}
              className="relative flex-shrink-0 w-64 md:w-80 aspect-video bg-dark-card rounded-xl overflow-hidden group transition-all duration-300 hover:scale-105 snap-start border border-white/5 hover:border-f1-blue/50 cursor-pointer"
            >
              <img 
                src={video.thumbnail_url || `https://picsum.photos/seed/${video.id}/600/338`} 
                alt={video.title}
                className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${video.id}/600/338`;
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent flex flex-col justify-end p-4">
                <h3 className="text-sm md:text-base font-bold leading-tight group-hover:text-f1-blue transition-colors">{video.title}</h3>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{video.year}</p>
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md group-hover:bg-f1-blue group-hover:text-white transition-all">
                    <Play size={14} fill="currentColor" />
                  </div>
                </div>
              </div>
              {video.status === 'PREMIUM' && (
                <div className="absolute top-3 right-3 bg-citrus-yellow text-black text-[8px] font-black px-2 py-1 rounded-sm uppercase tracking-widest shadow-lg">PREMIUM</div>
              )}
            </div>
          ))}
        </div>
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

const Maintenance = () => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [targetDate, setTargetDate] = useState<Date | null>(null);

  useEffect(() => {
    const fetchTargetDate = async () => {
      // Clear legacy localStorage
      localStorage.removeItem('maintenance_target_date');
      
      // Default fixed fallback (e.g., June 30, 2026) to avoid "resetting" on every F5
      const FIXED_FALLBACK = new Date('2026-06-30T00:00:00Z');
      
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'maintenance_end_date')
          .maybeSingle();

        if (error) {
          // If error 205 (Schema cache), we catch it here
          console.error("Supabase API cannot find the table yet. Error:", error.message);
          setTargetDate(FIXED_FALLBACK);
          return;
        }

        if (data && data.value) {
          console.log("Success! Date fetched from Supabase:", data.value);
          setTargetDate(new Date(data.value));
        } else {
          console.warn("Table exists but key 'maintenance_end_date' is missing. Using fixed fallback.");
          setTargetDate(FIXED_FALLBACK);
        }
      } catch (err) {
        console.error("Connection failed. Using fixed fallback:", err);
        setTargetDate(FIXED_FALLBACK);
      }
    };

    fetchTargetDate();
  }, []);

  useEffect(() => {
    if (!targetDate) return;

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      if (distance < 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);
      
      if (newTimeLeft.days === 0 && newTimeLeft.hours === 0 && newTimeLeft.minutes === 0 && newTimeLeft.seconds === 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

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
  const [availableYears, setAvailableYears] = useState<number[]>([]);
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
    const fetchVideo = async () => {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('id', id)
        .single();

      if (data) {
        setVideo(data);
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
  }, [id]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-dark-bg">
      <div className="w-12 h-12 border-4 border-f1-blue border-t-transparent rounded-full animate-spin" />
    </div>
  );
  
  if (!video) return <div className="h-screen flex items-center justify-center bg-dark-bg text-white">Vídeo não encontrado.</div>;

  const hasAccess = () => {
    if (video.status === 'FREE') return true;
    if (!profile || profile.subscription_status === 'INACTIVE') return false;

    const year = video.year;
    const plan = profile.plan;

    if (plan === 'FREE' && year < 2026) return false;
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
            <div className="relative w-full h-full overflow-hidden bg-black">
              {/* Ocultador de Barra Superior (Apenas no topo para não bloquear o botão de Fullscreen que fica embaixo) */}
              <div className="absolute top-0 left-0 w-full h-14 bg-transparent z-10 pointer-events-none" />
              
              {video.embed_url.includes('<iframe') ? (
                <div 
                  className="w-full h-full"
                  dangerouslySetInnerHTML={{ __html: video.embed_url.replace(/width="\d+"/, 'width="100%"').replace(/height="\d+"/, 'height="100%"').replace('<iframe', '<iframe allow="autoplay; fullscreen"') }}
                />
              ) : (
                <iframe 
                  src={video.embed_url.replace('/view', '/preview')} 
                  className="w-full h-full"
                  allow="autoplay; fullscreen"
                  allowFullScreen
                  title={video.title}
                />
              )}

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
          className="w-full bg-f1-blue text-white font-black py-4 rounded-xl text-xs uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-f1-blue/20 disabled:opacity-50"
        >
          {loading ? "Processando..." : (isSignUp ? "Criar Minha Conta" : "Entrar")}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-white/5 text-center">
        <button 
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-xs font-bold text-gray-400 hover:text-f1-blue transition-colors uppercase tracking-widest"
        >
          {isSignUp ? "Já tem uma conta? Faça login" : "Não tem conta? Crie uma agora"}
        </button>
      </div>
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

const Checkout = ({ isModal = false }: { isModal?: boolean }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const navigate = useNavigate();

  const content = (
    <div className={cn("w-full max-w-6xl mx-auto", !isModal && "pt-32 pb-20 px-4")}>
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

      <div className="flex flex-wrap justify-center gap-8 w-full">
        {/* Free Plan (Always Visible as secondary) */}
        <div className="bg-dark-card/50 p-10 rounded-[2.5rem] border border-white/5 flex flex-col backdrop-blur-sm hover:border-white/10 transition-colors w-full md:w-[380px]">
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-1">Plano Free</h3>
            <p className="text-gray-500 text-[10px] uppercase font-black tracking-widest">Acesso Básico com anúncios</p>
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
                      <option value="MONTHLY">MENSAL (EN)</option>
                      <option value="MENSAL">MENSAL (PT)</option>
                      <option value="ANNUAL">ANUAL (EN)</option>
                      <option value="ANUAL">ANUAL (PT)</option>
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
      <div className="min-h-screen bg-dark-bg text-white font-sans flex flex-col">
        <Navbar profile={profile} />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home profile={profile} />} />
            <Route path="/login" element={profile ? <Navigate to="/" /> : <Login />} />
            <Route path="/watch/:id" element={<Watch profile={profile} />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/account" element={<Account profile={profile} />} />
            <Route path="/season/:year" element={<SeasonPage profile={profile} />} />
            <Route path="/admin" element={<AdminPanel profile={profile} />} />
            <Route path="/maintenance" element={<Maintenance />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <Footer />
        <CookieBanner />
        <Chatwoot profile={profile} />
      </div>
    </BrowserRouter>
  );
}
