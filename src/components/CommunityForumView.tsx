import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ForumTopic, ForumReply } from '../types';
import {
  MessageSquare,
  Plus,
  ThumbsUp,
  CheckCircle,
  Pin,
  Eye,
  Tag,
  Search,
  Sparkles,
  X,
  Share2,
  Send,
  ChefHat
} from 'lucide-react';

export const CommunityForumView: React.FC = () => {
  const {
    currentUser,
    forumTopics,
    forumReplies,
    createForumTopic,
    createForumReply,
    toggleForumReplyLike,
    markBestAnswer,
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('todas');
  const [forumSearch, setForumSearch] = useState('');
  const [activeTopic, setActiveTopic] = useState<ForumTopic | null>(null);
  const [isCreatingTopic, setIsCreatingTopic] = useState(false);

  // New topic state
  const [newTopicCategory, setNewTopicCategory] = useState<ForumTopic['category']>('panaderia');
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicContent, setNewTopicContent] = useState('');
  const [newTopicTags, setNewTopicTags] = useState('Masa Madre, Consejos');

  // New reply state
  const [replyContent, setReplyContent] = useState('');

  const categories = [
    { id: 'todas', label: 'Todos los Canales' },
    { id: 'panaderia', label: '🥖 Panadería & Fermentación' },
    { id: 'dietas', label: '🥑 Dietas & Sustituciones (Sin TACC / Vegano)' },
    { id: 'tecnicas', label: '🔪 Técnicas & Equipamiento' },
    { id: 'preguntas', label: '❓ Preguntas & Dudas Rápidas' },
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

    // Open newly created topic
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
    <div className="space-y-6">
      {/* Forum Header Banner */}
      <div className="bg-gradient-to-r from-stone-900 to-amber-950 text-white p-6 sm:p-8 rounded-3xl shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold uppercase mb-2 border border-amber-500/30">
            <MessageSquare className="w-3.5 h-3.5" />
            Comunidad & Foros de Debate
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-serif-display">
            Foro Culinario de Gusto
          </h2>
          <p className="text-stone-300 text-xs sm:text-sm mt-1 max-w-xl leading-relaxed">
            Pregunta dudas sobre fermentación, comparte sustituciones de ingredientes sin gluten o veganos, y debate técnicas con chefs y aficionados.
          </p>
        </div>

        <button
          onClick={() => setIsCreatingTopic(true)}
          className="px-5 py-3 bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-md transition-all flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Crear Nuevo Debate
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Buscar hilos por palabras clave, ingredientes o etiquetas..."
            value={forumSearch}
            onChange={(e) => setForumSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                selectedCategory === cat.id
                  ? 'bg-amber-700 text-white border-amber-700 shadow-xs'
                  : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Topics List */}
      <div className="space-y-3">
        {filteredTopics.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 text-stone-500 text-xs sm:text-sm">
            No se encontraron debates con los criterios seleccionados. ¡Anímate a iniciar uno nuevo!
          </div>
        ) : (
          filteredTopics.map((topic) => {
            const repliesCount = forumReplies.filter((r) => r.topicId === topic.id).length;
            return (
              <div
                key={topic.id}
                onClick={() => setActiveTopic(topic)}
                className="bg-white p-5 rounded-3xl border border-stone-200/90 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {topic.isPinned && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-500 text-stone-900 shadow-xs">
                        <Pin className="w-3 h-3 fill-stone-900" />
                        Fijado por Moderación
                      </span>
                    )}
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 uppercase">
                      {topic.category}
                    </span>
                    <span className="text-[10px] text-stone-400">
                      Publicado por <strong>{topic.authorName}</strong> • {new Date(topic.createdAt).toLocaleDateString('es-ES')}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-stone-900 group-hover:text-amber-700 transition-colors leading-snug">
                    {topic.title}
                  </h3>

                  <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                    {topic.content}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {topic.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200/80"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 sm:border-l sm:border-stone-100 sm:pl-5">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200 text-xs font-semibold text-stone-700">
                    <MessageSquare className="w-4 h-4 text-amber-600" />
                    <span>{repliesCount} respuestas</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Active Topic Thread Modal */}
      {activeTopic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 bg-stone-900 text-white flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold text-amber-400">
                  {activeTopic.category}
                </span>
                <span>•</span>
                <span className="text-xs text-stone-300">
                  Hilo de Discusión
                </span>
              </div>
              <button
                onClick={() => setActiveTopic(null)}
                className="text-stone-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Thread Content */}
            <div className="overflow-y-auto p-6 sm:p-8 space-y-6">
              {/* OP Post */}
              <div className="p-6 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-3">
                <div className="flex items-center gap-3">
                  <img
                    src={activeTopic.authorAvatar}
                    alt={activeTopic.authorName}
                    className="w-10 h-10 rounded-full object-cover border border-amber-300"
                  />
                  <div>
                    <div className="font-bold text-sm text-stone-900">{activeTopic.authorName}</div>
                    <div className="text-[11px] text-stone-500">
                      {new Date(activeTopic.createdAt).toLocaleDateString('es-ES', { dateStyle: 'long' })}
                    </div>
                  </div>
                </div>

                <h2 className="text-xl font-bold font-serif-display text-stone-900">
                  {activeTopic.title}
                </h2>

                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed whitespace-pre-line">
                  {activeTopic.content}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-2">
                  {activeTopic.tags.map((tag) => (
                    <span key={tag} className="text-xs px-2.5 py-0.5 rounded-lg bg-white border border-amber-200 text-amber-900 font-semibold">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Replies Section */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-stone-900 uppercase tracking-wide">
                  Respuestas de la Comunidad ({currentTopicReplies.length})
                </h4>

                {currentTopicReplies.map((reply) => (
                  <div
                    key={reply.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      reply.isBestAnswer
                        ? 'bg-emerald-50/70 border-emerald-300 shadow-xs'
                        : 'bg-stone-50 border-stone-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={reply.authorAvatar}
                          alt={reply.authorName}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div>
                          <div className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                            <span>{reply.authorName}</span>
                            {reply.isBestAnswer && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white">
                                <CheckCircle className="w-3 h-3" />
                                Mejor Respuesta
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-stone-400">
                            {new Date(reply.createdAt).toLocaleDateString('es-ES')}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Upvote button */}
                        <button
                          onClick={() => toggleForumReplyLike(reply.id)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-100"
                        >
                          <ThumbsUp className="w-3.5 h-3.5 text-amber-600" />
                          <span>{reply.likesCount}</span>
                        </button>

                        {/* Best answer toggle if OP or Editor/Admin */}
                        {(activeTopic.authorId === currentUser.id || currentUser.role === 'admin' || currentUser.role === 'editor') && (
                          <button
                            onClick={() => markBestAnswer(reply.id)}
                            title="Marcar o desmarcar como mejor respuesta comunitaria"
                            className={`p-1.5 rounded-xl border transition-colors ${
                              reply.isBestAnswer
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : 'bg-white text-stone-400 hover:text-emerald-600 border-stone-200'
                            }`}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-stone-700 leading-relaxed mt-3 pl-10">
                      {reply.content}
                    </p>
                  </div>
                ))}
              </div>

              {/* Reply Form */}
              <form onSubmit={handleReplySubmit} className="pt-4 border-t border-stone-200 space-y-3">
                <label className="block text-xs font-bold text-stone-700 uppercase">
                  Aportar tu respuesta o consejo culinario:
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder={`Escribe tu aporte como ${currentUser.name}...`}
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-stone-300 text-xs sm:text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden resize-none"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Publicar Respuesta
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Create Topic Modal */}
      {isCreatingTopic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden">
            <div className="px-6 py-4 bg-amber-600 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">Iniciar Nuevo Hilo de Debate en el Foro</h3>
              <button onClick={() => setIsCreatingTopic(false)} className="text-amber-200 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTopicSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  Canal / Categoría
                </label>
                <select
                  value={newTopicCategory}
                  onChange={(e) => setNewTopicCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-semibold bg-white"
                >
                  <option value="panaderia">🥖 Panadería & Fermentación</option>
                  <option value="dietas">🥑 Dietas Especiales & Sustituciones (Sin TACC / Vegano)</option>
                  <option value="tecnicas">🔪 Técnicas & Equipamiento</option>
                  <option value="preguntas">❓ Preguntas & Dudas Rápidas</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  Título del Debate
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. ¿Cómo conservar masa madre si viajo 2 semanas?"
                  value={newTopicTitle}
                  onChange={(e) => setNewTopicTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-semibold focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  Contenido / Pregunta Detallada
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Detalla tu duda, contexto o técnica para que otros cocineros puedan ayudarte..."
                  value={newTopicContent}
                  onChange={(e) => setNewTopicContent(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm focus:ring-2 focus:ring-amber-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  Etiquetas (separadas por coma)
                </label>
                <input
                  type="text"
                  placeholder="Masa Madre, Consejos, Horneado"
                  value={newTopicTags}
                  onChange={(e) => setNewTopicTags(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingTopic(false)}
                  className="px-4 py-2 text-stone-600 hover:text-stone-800 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  Publicar Debate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
