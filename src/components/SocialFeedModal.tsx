import React, { useState } from 'react';
import { X, Heart, MessageCircle, Send, Share2, Sparkles, CheckCircle2 } from 'lucide-react';
import { AvatarConfig, SocialPost, SocialReply } from '../types/game';
import { playSound } from '../utils/audio';

interface SocialFeedModalProps {
  isOpen: boolean;
  onClose: () => void;
  avatar: AvatarConfig;
  posts: SocialPost[];
  onAddReply: (postId: string, reply: SocialReply) => void;
}

const QUICK_REPLIES = [
  'Foco total na vitória! Vamos lutar pelos 3 pontos! 🦁',
  'Agradeço o apoio de cada torcedor! Seguimos firmes! 🔥',
  'Muito treino e dedicação. O gol vai sair na hora certa! ⚽',
  'A união do nosso time é o segredo do sucesso! 💪',
];

const FAN_AUTO_RESPONSES = [
  'Monstro sagrado! É essa postura de campeão que a torcida quer ver!',
  'Humildade de gigante! Tem o meu respeito e da arquibancada inteira! 👏',
  'Pra cima deles artilheiro! Hoje tem gol com curva no ângulo! ⚽🔥',
  'O melhor camisa 9 que já passou pelo nosso clube!',
  'Vamooooos! O troféu da Taça Samba vai ser nosso com você decidindo!',
];

export const SocialFeedModal: React.FC<SocialFeedModalProps> = ({
  isOpen,
  onClose,
  avatar,
  posts,
  onAddReply,
}) => {
  const [activeReplyPostId, setActiveReplyPostId] = useState<string | null>(null);
  const [customText, setCustomText] = useState<string>('');
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const toggleLike = (postId: string) => {
    playSound('click');
    setLikedPosts((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const submitReply = (postId: string, text: string) => {
    if (!text.trim()) return;
    playSound('whistle');

    const newReply: SocialReply = {
      id: `rep_${Date.now()}`,
      author: `${avatar.name || 'Gabriel M.'} #${avatar.number || 9}`,
      authorAvatar: '⭐',
      isHero: true,
      content: text,
      likes: 18,
      timeAgo: 'Agora mesmo',
    };

    onAddReply(postId, newReply);
    setCustomText('');
    setActiveReplyPostId(null);

    // Dynamic Fan response back to the player after a brief delay
    setTimeout(() => {
      playSound('cheer');
      const randomFanResponse =
        FAN_AUTO_RESPONSES[Math.floor(Math.random() * FAN_AUTO_RESPONSES.length)];
      const fanReply: SocialReply = {
        id: `fan_rep_${Date.now()}`,
        author: 'Torcedor Ouro',
        authorAvatar: '🦁',
        isHero: false,
        content: randomFanResponse,
        likes: 35,
        timeAgo: 'Agora mesmo',
      };
      onAddReply(postId, fanReply);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl max-h-[90vh] bg-[#0A1329] border border-blue-500/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-white">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 border-b border-blue-500/20">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
              <MessageCircle className="w-5 h-5" />
            </span>
            <div>
              <h2 className="font-heading text-lg font-bold text-white flex items-center gap-1.5">
                Rede da Torcida · GolSocial
              </h2>
              <p className="text-[11px] text-slate-400">
                O que os torcedores e jornalistas estão falando de você e do time
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              playSound('click');
              onClose();
            }}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feed List */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          {posts.map((post) => {
            const isLiked = likedPosts[post.id];
            const isReplying = activeReplyPostId === post.id;

            return (
              <div
                key={post.id}
                className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3 shadow-md"
              >
                {/* Author Info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-lg">
                      {post.avatarIcon}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white">{post.author}</span>
                        {post.badge && (
                          <span className="px-1.5 py-0.2 bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded text-[9px] font-bold">
                            {post.badge}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {post.authorHandle} · {post.timeAgo}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
                  {post.content}
                </p>

                {/* Action buttons (Like, Reply, Retweet) */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs text-slate-400">
                  <button
                    type="button"
                    onClick={() => toggleLike(post.id)}
                    className={`flex items-center gap-1.5 transition-colors ${
                      isLiked ? 'text-rose-400 font-bold' : 'hover:text-rose-400'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isLiked ? 'fill-current text-rose-500' : ''}`} />
                    <span>{post.likes + (isLiked ? 1 : 0)}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      playSound('click');
                      setActiveReplyPostId(isReplying ? null : post.id);
                    }}
                    className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Responder ({post.replies.length})</span>
                  </button>

                  <div className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors cursor-pointer">
                    <Share2 className="w-4 h-4" />
                    <span>{post.retweets}</span>
                  </div>
                </div>

                {/* Existing Replies */}
                {post.replies.length > 0 && (
                  <div className="mt-2 space-y-2 border-l-2 border-blue-500/30 pl-3 pt-1">
                    {post.replies.map((reply) => (
                      <div
                        key={reply.id}
                        className={`p-2.5 rounded-xl text-xs flex flex-col gap-1 ${
                          reply.isHero
                            ? 'bg-amber-950/30 border border-amber-500/40'
                            : 'bg-slate-800/60 border border-slate-700/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm">{reply.authorAvatar}</span>
                            <span
                              className={`font-bold ${
                                reply.isHero ? 'text-amber-300' : 'text-slate-200'
                              }`}
                            >
                              {reply.author}
                            </span>
                            {reply.isHero && (
                              <span className="px-1 py-0.2 bg-amber-500 text-slate-950 rounded text-[9px] font-black uppercase">
                                Você
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400">{reply.timeAgo}</span>
                        </div>
                        <p className="text-slate-200">{reply.content}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply Form */}
                {isReplying && (
                  <div className="mt-3 p-3 bg-slate-950/80 rounded-xl border border-cyan-500/30 flex flex-col gap-2.5 animate-fade-in">
                    <span className="text-[11px] font-bold text-cyan-400 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      Responder como {avatar.name || 'Gabriel M.'}:
                    </span>

                    {/* Quick Reply Pills */}
                    <div className="flex flex-wrap gap-1.5">
                      {QUICK_REPLIES.map((quick, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => submitReply(post.id, quick)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-blue-600 text-[11px] text-slate-200 hover:text-white rounded-lg transition-colors text-left"
                        >
                          {quick}
                        </button>
                      ))}
                    </div>

                    {/* Custom text input */}
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="text"
                        placeholder="Escreva sua mensagem para a torcida..."
                        value={customText}
                        onChange={(e) => setCustomText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') submitReply(post.id, customText);
                        }}
                        className="flex-1 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400"
                      />
                      <button
                        type="button"
                        onClick={() => submitReply(post.id, customText)}
                        className="p-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-white font-bold transition-colors"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-900 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={() => {
              playSound('click');
              onClose();
            }}
            className="px-5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm font-bold text-white"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
