import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ForumTopic, ForumReply } from '../types';
import { ScrollableFilterBar } from './ScrollableFilterBar';
import { formatRelativeDate } from '../utils/dateUtils';

interface CommunityForumViewProps {
  onOpenAuthorProfile?: (authorId: string) => void;
}

export const CommunityForumView: React.FC<CommunityForumViewProps> = ({
  onOpenAuthorProfile,
}) => {
  const {
    currentUser,
    allUsers,
    forumTopics,
    forumReplies,
    createForumTopic,
    createForumReply,
    toggleForumReplyLike,
    markBestAnswer,
    followUserToggle,
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('todas');
  const [forumSearch, setForumSearch] = useState('');
  const [activeTopic, setActiveTopic] = useState<ForumTopic | null>(null);
  const [isCreatingTopic, setIsCreatingTopic] = useState(false);

  // New topic form state
  const [newTopicCategory, setNewTopicCategory] = useState<ForumTopic['category']>('tecnicas');
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicContent, setNewTopicContent] = useState('');
  const [newTopicTags, setNewTopicTags] = useState('MasaMadre, Consejos');

  // New reply form state
  const [replyContent, setReplyContent] = useState('');

  // Topic like state
  const [likedTopicIds, setLikedTopicIds] = useState<string[]>([]);
  const [savedTopicIds, setSavedTopicIds] = useState<string[]>([]);

  const toggleTopicLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedTopicIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleTopicSave = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedTopicIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const categories = [
    { id: 'todas', label: 'Todas las discusiones' },
    { id: 'tecnicas', label: 'Técnicas culinarias' },
    { id: 'dietas', label: 'Ingredientes & Sustituciones' },
    { id: 'panaderia', label: 'Panadería & Repostería' },
    { id: 'preguntas', label: 'Secretos de chefs' },
  ];

  const filteredTopics = forumTopics.filter((topic) => {
    const matchesCategory = selectedCategory === 'todas' || topic.category === selectedCategory;
    const matchesSearch =
      topic.title.toLowerCase().includes(forumSearch.toLowerCase()) ||
      topic.content.toLowerCase().includes(forumSearch.toLowerCase()) ||
      topic.tags.some((t) => t.toLowerCase().includes(forumSearch.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleCreateTopicSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicTitle.trim() || !newTopicContent.trim()) return;

    const tagsArray = newTopicTags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const newId = createForumTopic(newTopicCategory, newTopicTitle, newTopicContent, tagsArray);
    setIsCreatingTopic(false);
    setNewTopicTitle('');
    setNewTopicContent('');

    const created = forumTopics.find((t) => t.id === newId);
    if (created) setActiveTopic(created);
  };

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTopic || !replyContent.trim()) return;
    createForumReply(activeTopic.id, replyContent);
    setReplyContent('');
  };

  const currentTopicReplies = activeTopic
    ? forumReplies.filter((r) => r.topicId === activeTopic.id)
    : [];

  return (
    <div className="w-full flex flex-col gap-8 pb-16">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <span
                className="material-symbols-outlined text-[17px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                forum
              </span>
            </span>
            <span className="text-xs uppercase tracking-wider text-amber-400 font-bold">
              Comunidad Gusto
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-zinc-100 tracking-tight font-display mb-2">
            Foro & Comunidad Gastronómica
          </h1>
          <p className="text-sm md:text-base text-zinc-400 leading-relaxed">
            Comparte tus secretos, técnicas de cocina, pide consejos y debate con apasionados del sabor.
          </p>
        </div>

        <div className="shrink-0">
          <button
            type="button"
            onClick={() => setIsCreatingTopic(true)}
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-sm font-bold px-6 py-3.5 rounded-full shadow-lg shadow-amber-500/20 transition-all duration-200 transform hover:-translate-y-0.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            <span>Nueva publicación / Iniciar debate</span>
          </button>
        </div>
      </div>

      {/* Toolbar & Category Filter Chips with left/right overflow scroll arrows */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-zinc-900/90 p-3 rounded-2xl shadow-xl border border-zinc-800">
        <ScrollableFilterBar className="flex-1 min-w-0">
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                setSelectedCategory(c.id);
                setActiveTopic(null);
              }}
              className={`shrink-0 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === c.id
                  ? 'bg-amber-500 text-zinc-950 font-bold shadow-md shadow-amber-500/20'
                  : 'bg-zinc-950 text-zinc-400 border border-zinc-800 hover:text-zinc-200 hover:border-zinc-700'
              }`}
            >
              {c.label}
            </button>
          ))}
        </ScrollableFilterBar>

        <div className="flex items-center gap-2 px-2 border-t lg:border-t-0 border-zinc-800 pt-3 lg:pt-0">
          <div className="relative w-full lg:w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-zinc-500">
              search
            </span>
            <input
              type="text"
              value={forumSearch}
              onChange={(e) => setForumSearch(e.target.value)}
              placeholder="Buscar en el foro..."
              className="w-full pl-9 pr-4 py-2 bg-zinc-950 border border-zinc-800 rounded-full text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Main Grid: Discussion feed (8 cols) + Sidebar (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* If a topic is opened for viewing and replying */}
          {activeTopic ? (
            <div className="bg-zinc-900 rounded-3xl p-6 sm:p-8 shadow-xl border border-zinc-800 space-y-6 text-zinc-100">
              <button
                type="button"
                onClick={() => setActiveTopic(null)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 hover:underline cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                Volver a la lista de debates
              </button>

              <div className="border-b border-zinc-800 pb-5">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  {activeTopic.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30"
                    >
                      #{tag}
                    </span>
                  ))}
                  <span className="text-xs text-zinc-400">• {formatRelativeDate(activeTopic.createdAt)}</span>
                </div>
                <h2 className="font-display text-2xl font-bold text-zinc-100 mb-3">
                  {activeTopic.title}
                </h2>
                <p className="text-sm sm:text-base text-zinc-300 leading-relaxed whitespace-pre-line">
                  {activeTopic.content}
                </p>

                <div 
                  onClick={() => onOpenAuthorProfile?.(activeTopic.authorId)}
                  className="flex items-center gap-3 mt-4 pt-4 border-t border-zinc-800 cursor-pointer group hover:opacity-90 transition-opacity"
                >
                  <div className="w-10 h-10 rounded-full bg-amber-500 text-zinc-950 flex items-center justify-center font-bold text-sm ring-2 ring-amber-500/40 group-hover:ring-amber-400 transition-all">
                    {activeTopic.authorName.charAt(0)}
                  </div>
                  <div>
                    <span className="text-sm font-bold text-zinc-100 block leading-tight group-hover:text-amber-400 transition-colors">
                      {activeTopic.authorName}
                    </span>
                    <span className="text-xs text-amber-400 font-medium">Autor del debate</span>
                  </div>
                </div>
              </div>

              {/* Replies Section */}
              <div className="space-y-4">
                <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-400 text-[20px]">
                    chat_bubble_outline
                  </span>
                  Respuestas de la comunidad ({currentTopicReplies.length})
                </h3>

                {currentTopicReplies.length === 0 ? (
                  <p className="text-xs text-zinc-500 py-3">
                    Aún no hay respuestas en este debate. ¡Sé el primero en compartir tu experiencia!
                  </p>
                ) : (
                  currentTopicReplies.map((reply) => (
                    <div
                      key={reply.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        reply.isBestAnswer
                          ? 'bg-amber-500/10 border-amber-500/40 text-zinc-100'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div 
                          onClick={() => onOpenAuthorProfile?.(reply.authorId)}
                          className="flex items-center gap-2 cursor-pointer group hover:opacity-90 transition-opacity"
                        >
                          <img
                            src={reply.authorAvatar}
                            alt={reply.authorName}
                            className="w-7 h-7 rounded-full object-cover ring-1 ring-zinc-700 group-hover:ring-amber-400 transition-all"
                          />
                          <span className="text-xs font-bold text-zinc-100 group-hover:text-amber-400 transition-colors">
                            {reply.authorName}
                          </span>
                          <span className="text-[10px] text-zinc-400">
                            • {formatRelativeDate(reply.createdAt)}
                          </span>
                        </div>

                        {reply.isBestAnswer && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-500/40 shadow-xs">
                            <span className="material-symbols-outlined text-[14px]">verified</span>
                            Mejor Respuesta
                          </span>
                        )}
                      </div>

                      <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed mb-3">
                        {reply.content}
                      </p>

                      <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-xs">
                        <button
                          type="button"
                          onClick={() => toggleForumReplyLike(reply.id)}
                          className="flex items-center gap-1 text-zinc-400 hover:text-amber-400 font-medium cursor-pointer transition-colors"
                        >
                          <span className="material-symbols-outlined text-[16px]">thumb_up</span>
                          <span>{reply.likesCount} me gusta</span>
                        </button>

                        {!reply.isBestAnswer &&
                          currentUser &&
                          (currentUser.id === activeTopic.authorId ||
                            currentUser.role === 'admin' ||
                            currentUser.role === 'editor') && (
                            <button
                              type="button"
                              onClick={() => markBestAnswer(reply.id)}
                              className="text-[11px] font-semibold text-amber-400 hover:underline cursor-pointer"
                            >
                              Marcar como mejor respuesta
                            </button>
                          )}
                      </div>
                    </div>
                  ))
                )}

                {/* Reply Form */}
                <form onSubmit={handleReplySubmit} className="pt-3 border-t border-zinc-800 space-y-2">
                  <label className="block text-xs font-bold text-zinc-200">
                    Tu aporte o consejo para la comunidad:
                  </label>
                  <textarea
                    rows={3}
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Escribe tu respuesta con proporciones, tiempos o explicaciones claras..."
                    className="w-full px-4 py-3 rounded-2xl bg-zinc-950 text-sm text-zinc-100 border border-zinc-800 focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 outline-none resize-none placeholder:text-zinc-500"
                    required
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-full bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                    >
                      Enviar respuesta
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            // Feed of Horizontal Cards
            <>
              {filteredTopics.map((topic, index) => {
                const isLiked = likedTopicIds.includes(topic.id);
                const isSaved = savedTopicIds.includes(topic.id);
                const replies = forumReplies.filter((r) => r.topicId === topic.id);

                return (
                  <article
                    key={topic.id}
                    onClick={() => setActiveTopic(topic)}
                    className="group bg-zinc-900 rounded-3xl p-5 sm:p-6 shadow-xl hover:shadow-2xl hover:border-amber-500/40 hover:-translate-y-1 transition-all duration-300 border border-zinc-800 cursor-pointer"
                  >
                    <div className="flex flex-col sm:flex-row gap-5">
                      {/* Left Thumbnail */}
                      <div className="sm:w-52 h-44 sm:h-auto shrink-0 rounded-2xl overflow-hidden relative bg-zinc-950">
                        <img
                          src={
                            index === 0
                              ? 'https://lh3.googleusercontent.com/aida-public/AB6AXuAcleyCcXLcRDGMJCCeS34Dszy09dXqd3fvfT3Vs4o5Riv0bW6GfZtnHpTscp5cqMSYj4AUlTjOwZef655yN_PsUmoXHEgxn3AmKlaxH-zerWT6EhRctzRjVcqqV2blXTtbce_2xm3AEpfhHzw--8nb_uA9PZYduq_ZaRe3ygQwDTk6lPv_4yapO6sSM2GfC1CcoyF9pR1c8Wau5d0lt1LFxKXB1VfRZ2DilyChUXAuG8BklA7qcg'
                              : index === 1
                              ? 'https://lh3.googleusercontent.com/aida-public/AB6AXuAZRic3mYLxTNQ5liSXshTF6mL71lmCko0ki4T0ggWsnElgZ7NXk_DFarbXrXmFU98M-1lMZPH1WIvh3oGKpwhiiCvnlmmi8e8rez-iabZOKzBm7R_opXxwaSEl4hk5khbV4VsqXN250-wi-QkDGmtGgPIX3tGbLX9MS7On1t1_Efin6ocvzOFQUL7OH555GdSl6n3l7X0qPq6qZ2JSnGIYExoYXlrveXvaljwu6tTj9rnDFpkU6A'
                              : index === 2
                              ? 'https://lh3.googleusercontent.com/aida-public/AB6AXuD6qMHMwskWm-oVXY2QBsv34x8s_UqE5zZvgVesG7l6vfdYkDhAtdkhnGOprQHUFKsxUHYWKzM4SHaxnBSwFJ5AAB35s9YybUrjIwav50l-3alShP4dwnweUDPCaYVPNciCBaE9DjXBNKGeDYOzn9j6tdtW8HeYKZwE9xXGtpwu_q3-WnnJ8XQZRfHWcq9wq_iMTOdUFgfQRNQCJVfjp_1sfFCEDphCCD2f9Kh6t3TDLhjNX5uc_Q'
                              : 'https://lh3.googleusercontent.com/aida-public/AB6AXuBN0GgSv15n4V8NZs9l2IxfTETfLpq-Dtgq0ZCovfp5j4e_HUwulYAUJ-f2x0oBbkpor-7-55E7l0lpKUwekTRsAwoqNYa6yulTHZUboJiiNusfOuq19EuIDk7-HNGLpI5A4BPQoQ9_H09BiLgTogTxDzFw4zkurC_ctYD1uwlyT-MrLCokKb8CEg1b73ckvmfqof8xUoqdn051X0t4wgYm690nJyn75cEBqEagZf7qZKcZmju5vQ'
                          }
                          alt={topic.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {topic.isPinned && (
                          <div className="absolute top-2.5 left-2.5">
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500 text-zinc-950 shadow-md">
                              Destacado
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Content Area */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            {topic.tags.map((tag) => (
                              <span
                                key={tag}
                                className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30"
                              >
                                #{tag}
                              </span>
                            ))}
                            <span className="text-xs text-zinc-500">• {formatRelativeDate(topic.createdAt)}</span>
                          </div>

                          <h3 className="text-lg sm:text-xl font-bold text-zinc-100 group-hover:text-amber-400 transition-colors mb-2 font-display leading-snug">
                            {topic.title}
                          </h3>

                          <p className="text-xs sm:text-sm text-zinc-400 line-clamp-2 leading-relaxed">
                            {topic.content}
                          </p>
                        </div>

                        {/* Author & Metrics Footer */}
                        <div className="pt-3 mt-3 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <div className="relative">
                              <div className="w-8 h-8 rounded-full bg-amber-500 text-zinc-950 flex items-center justify-center font-bold text-xs ring-2 ring-amber-500/30">
                                {topic.authorName.charAt(0)}
                              </div>
                            </div>
                            <div>
                              <span className="text-xs font-bold text-zinc-100 block leading-tight">
                                {topic.authorName}
                              </span>
                              <span className="text-[10px] text-amber-400 font-medium block">
                                Cocinero Comunitario
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-zinc-400">
                            <span className="flex items-center gap-1.5 text-xs text-zinc-400">
                              <span className="material-symbols-outlined text-[18px]">
                                chat_bubble_outline
                              </span>
                              <span>{replies.length} comentarios</span>
                            </span>

                            <button
                              type="button"
                              onClick={(e) => toggleTopicLike(topic.id, e)}
                              className={`flex items-center gap-1 text-xs cursor-pointer ${
                                isLiked ? 'text-rose-400 font-bold' : 'hover:text-rose-400'
                              }`}
                            >
                              <span
                                className="material-symbols-outlined text-[18px]"
                                style={isLiked ? { fontVariationSettings: "'FILL' 1" } : {}}
                              >
                                favorite
                              </span>
                              <span>{topic.repliesCount * 3 + (isLiked ? 1 : 0)}</span>
                            </button>

                            <button
                              type="button"
                              onClick={(e) => toggleTopicSave(topic.id, e)}
                              className={`p-1 rounded-full transition-colors cursor-pointer ${
                                isSaved
                                  ? 'text-amber-400'
                                  : 'text-zinc-500 hover:text-amber-400'
                              }`}
                              title="Guardar discusión"
                            >
                              <span
                                className="material-symbols-outlined text-[19px]"
                                style={isSaved ? { fontVariationSettings: "'FILL' 1" } : {}}
                              >
                                bookmark
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </>
          )}
        </div>

        {/* Right Column: Sidebar (4 cols) */}
        <aside className="lg:col-span-4 flex flex-col gap-6">
          {/* Widget: Temas en Tendencia */}
          <div className="bg-zinc-900 rounded-3xl p-6 shadow-xl border border-zinc-800">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-400 text-[24px]">
                  local_fire_department
                </span>
                <h3 className="text-base font-bold text-zinc-100 font-display">
                  Temas en tendencia
                </h3>
              </div>
              <span className="text-[11px] text-zinc-500 font-medium">Esta semana</span>
            </div>

            <div className="flex flex-col divide-y divide-zinc-800 text-xs">
              <div className="py-2.5">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-amber-400">#MasaMadre</span>
                  <span className="text-zinc-500 text-[10px]">1.4k posts</span>
                </div>
                <h4 className="font-semibold text-zinc-200 leading-snug">
                  ¿Miga abierta o cerrada? La gran controversia del alveolado
                </h4>
                <p className="text-zinc-400 mt-0.5 line-clamp-1">
                  Técnicas de autólisis vs fermentación en bloque.
                </p>
              </div>

              <div className="py-2.5">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-amber-400">#SousVide</span>
                  <span className="text-zinc-500 text-[10px]">892 posts</span>
                </div>
                <h4 className="font-semibold text-zinc-200 leading-snug">
                  Puntos de cocción exacta en carnes magras
                </h4>
                <p className="text-zinc-400 mt-0.5 line-clamp-1">
                  Sellado final con mantequilla avellanada y hierbas.
                </p>
              </div>

              <div className="py-2.5">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-amber-400">#CocinaItaliana</span>
                  <span className="text-zinc-500 text-[10px]">745 posts</span>
                </div>
                <h4 className="font-semibold text-zinc-200 leading-snug">
                  Harina tipo 00 vs sémola de trigo duro
                </h4>
                <p className="text-zinc-400 mt-0.5 line-clamp-1">
                  Estructura de gluten y elasticidad en pastas caseras.
                </p>
              </div>
            </div>
          </div>

          {/* Widget: Chefs destacados del mes */}
          <div className="bg-zinc-900 rounded-3xl p-6 shadow-xl border border-zinc-800">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-400 text-[24px]">
                  workspace_premium
                </span>
                <h3 className="text-base font-bold text-zinc-100 font-display">
                  Chefs destacados
                </h3>
              </div>
              <span className="text-xs font-bold text-amber-400">Ranking</span>
            </div>

            <div className="flex flex-col gap-3.5">
              {allUsers.slice(0, 3).map((chef, idx) => {
                const isFollowing = currentUser ? currentUser.followingUserIds.includes(chef.id) : false;

                return (
                  <div key={chef.id} className="flex items-center justify-between gap-3">
                    <div 
                      onClick={() => onOpenAuthorProfile?.(chef.id)}
                      className="flex items-center gap-2.5 min-w-0 cursor-pointer group hover:opacity-90 transition-opacity"
                    >
                      <div className="relative shrink-0">
                        <img
                          src={chef.avatar}
                          alt={chef.name}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-amber-500/60 group-hover:ring-amber-400 transition-all"
                        />
                        <span className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-amber-500 text-zinc-950 text-[10px] flex items-center justify-center font-bold">
                          {idx + 1}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-zinc-100 truncate group-hover:text-amber-400 transition-colors">{chef.name}</h4>
                        <p className="text-[11px] text-amber-400 truncate">
                          {chef.specialties[0] || 'Maestro Culinario'}
                        </p>
                      </div>
                    </div>

                    {(!currentUser || chef.id !== currentUser.id) && (
                      <button
                        type="button"
                        onClick={() => followUserToggle(chef.id)}
                        className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                          isFollowing
                            ? 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                            : 'border border-zinc-700 text-zinc-300 hover:bg-amber-500 hover:text-zinc-950 hover:border-amber-500'
                        }`}
                      >
                        {isFollowing ? 'Siguiendo' : 'Seguir'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Widget: Reglas de la comunidad */}
          <div className="bg-zinc-900 rounded-3xl p-6 shadow-xl border border-amber-500/30">
            <div className="flex items-center gap-2 text-amber-400 mb-2">
              <span className="material-symbols-outlined text-[22px]">verified</span>
              <h4 className="text-sm font-bold text-zinc-100 font-display">
                Reglas de la comunidad
              </h4>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed mb-3">
              En Gusto valoramos la crítica constructiva, el respeto mutuo a las tradiciones culinarias y la generosidad al compartir técnicas gastronómicas.
            </p>
            <div className="inline-flex items-center gap-1 text-xs font-bold text-amber-400">
              <span>Gusto • Pasión culinaria compartida</span>
            </div>
          </div>
        </aside>
      </div>

      {/* Modal: Crear Nueva Publicación / Debate */}
      {isCreatingTopic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-900 text-zinc-100 w-full max-w-xl rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto border border-zinc-800">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-5">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-400 text-[26px]">
                  drive_file_rename_outline
                </span>
                <h3 className="text-xl font-bold text-zinc-100 font-display">
                  Subir nueva idea o debate
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreatingTopic(false)}
                className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[24px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateTopicSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-200 mb-1.5">
                  Título del debate o técnica
                </label>
                <input
                  type="text"
                  value={newTopicTitle}
                  onChange={(e) => setNewTopicTitle(e.target.value)}
                  placeholder="Ej: Mi método infalible para emulsionar mayonesa sin que se corte"
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-500 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-200 mb-1.5">
                  Categoría culinaria
                </label>
                <select
                  value={newTopicCategory}
                  onChange={(e) => setNewTopicCategory(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none cursor-pointer"
                >
                  <option value="tecnicas">Técnicas culinarias</option>
                  <option value="dietas">Ingredientes & Sustituciones</option>
                  <option value="panaderia">Panadería & Repostería</option>
                  <option value="preguntas">Secretos de chefs & Preguntas</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-200 mb-1.5">
                  Descripción / Pregunta detallada
                </label>
                <textarea
                  rows={4}
                  value={newTopicContent}
                  onChange={(e) => setNewTopicContent(e.target.value)}
                  placeholder="Explica los ingredientes, tiempos, proporciones o la duda que deseas debatir..."
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-500 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-200 mb-1.5">
                  Etiquetas (separadas por coma)
                </label>
                <input
                  type="text"
                  value={newTopicTags}
                  onChange={(e) => setNewTopicTags(e.target.value)}
                  placeholder="MasaMadre, SousVide, CocinaItaliana"
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-500 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsCreatingTopic(false)}
                  className="px-5 py-2 rounded-full text-xs font-semibold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full text-xs font-bold bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                >
                  Publicar en la comunidad
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
