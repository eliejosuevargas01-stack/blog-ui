"use client";

import React, { useState, useEffect } from "react";
import { MessageSquare, LogOut, Trash2, ShieldAlert } from "lucide-react";

interface CommentUser {
  id: string;
  name: string;
}

interface Comment {
  id: string;
  content: string;
  postId: number | string;
  userId: string;
  createdAt: string;
  user: CommentUser;
}

interface User {
  id: string;
  name: string;
  email: string;
}

interface CommentsSectionProps {
  postId: number | string;
}

export default function CommentsSection({ postId }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authError, setAuthError] = useState("");
  const [commentError, setCommentError] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    fetchSession();
    fetchComments();
  }, [postId]);

  const fetchSession = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (e) {
      console.error("Erro ao obter sessão:", e);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/comments?postId=${postId}`);
      const data = await res.json();
      if (data.comments) {
        setComments(data.comments);
      }
    } catch (e) {
      console.error("Erro ao buscar comentários:", e);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setLoading(true);

    const endpoint = authMode === "login" ? "/api/auth/login" : "/api/auth/register";
    const payload = authMode === "login" 
      ? { email, password }
      : { name, email, password };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.error) {
        setAuthError(data.error);
      } else if (data.success) {
        setUser(data.user);
        setName("");
        setEmail("");
        setPassword("");
      }
    } catch (err) {
      setAuthError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        setUser(null);
      }
    } catch (err) {
      console.error("Erro no logout:", err);
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    setCommentError("");
    
    if (!content.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, postId })
      });
      const data = await res.json();

      if (data.error) {
        setCommentError(data.error);
      } else if (data.success && data.comment) {
        setComments((prev) => [...prev, data.comment]);
        setContent("");
      }
    } catch (err) {
      setCommentError("Não foi possível enviar o comentário.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Deseja deletar seu comentário?")) return;

    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (data.success) {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
      } else {
        alert(data.error || "Erro ao deletar comentário.");
      }
    } catch (err) {
      alert("Erro de conexão ao deletar comentário.");
    }
  };

  const getAvatarChar = (nameStr: string) => {
    return nameStr ? nameStr.trim().charAt(0).toUpperCase() : "?";
  };

  const formatCommentDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch (e) {
      return "";
    }
  };

  return (
    <div className="border-t border-slate-800 mt-14 pt-10">
      <div className="flex items-center gap-3 mb-8">
        <span className="block w-1.5 h-7 bg-gradient-to-b from-cyan-400 to-blue-600 rounded-full" />
        <h3 className="text-2xl font-bold uppercase tracking-wider text-white flex items-center gap-2">
          Comentários ({comments.length})
        </h3>
      </div>

      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 mb-10 backdrop-blur-md">
        {user ? (
          <form onSubmit={handlePostComment} className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span>Logado como <strong className="text-white">{user.name}</strong> ({user.email})</span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1 text-cyan-400 hover:underline uppercase tracking-wider font-bold"
              >
                <LogOut size={12} /> Sair
              </button>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Escreva seu comentário</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="O que você achou desse post? Deixe sua opinião..."
                rows={4}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl text-sm p-4 outline-none focus:border-cyan-500/50 text-slate-200 resize-none transition-colors"
                maxLength={1000}
              />
            </div>

            {commentError && (
              <div className="text-pink-400 text-xs flex items-center gap-1.5 bg-pink-500/10 border border-pink-500/20 p-3 rounded-xl">
                <ShieldAlert size={14} /> {commentError}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !content.trim()}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-xl transition-all shadow-md shadow-cyan-500/20 disabled:opacity-40"
            >
              {loading ? "Enviando..." : "Publicar Comentário"}
            </button>
          </form>
        ) : (
          <div>
            <div className="text-center mb-6">
              <h4 className="text-xl font-bold uppercase tracking-wide text-white mb-1">
                Participe da discussão
              </h4>
              <p className="text-xs text-slate-400 max-w-[400px] mx-auto">
                Faça login ou cadastre-se rapidamente para enviar seu comentário.
              </p>
            </div>

            <div className="flex border-b border-slate-800 mb-6">
              <button
                onClick={() => { setAuthMode("login"); setAuthError(""); }}
                className={`flex-1 py-2.5 text-center text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${
                  authMode === "login" 
                    ? "border-cyan-400 text-cyan-400" 
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                Entrar
              </button>
              <button
                onClick={() => { setAuthMode("register"); setAuthError(""); }}
                className={`flex-1 py-2.5 text-center text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${
                  authMode === "register" 
                    ? "border-cyan-400 text-cyan-400" 
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                Criar Conta
              </button>
            </div>

            <form onSubmit={handleAuth} className="space-y-4 max-w-[380px] mx-auto">
              {authMode === "register" && (
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 uppercase font-bold tracking-wider block">Nome</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl text-sm px-3.5 py-2.5 outline-none focus:border-cyan-500/50 text-slate-200 transition-colors"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[11px] text-slate-400 uppercase font-bold tracking-wider block">E-mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl text-sm px-3.5 py-2.5 outline-none focus:border-cyan-500/50 text-slate-200 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-400 uppercase font-bold tracking-wider block">Senha</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Sua senha"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl text-sm px-3.5 py-2.5 outline-none focus:border-cyan-500/50 text-slate-200 transition-colors"
                />
              </div>

              {authError && (
                <div className="text-pink-400 text-xs flex items-center gap-1.5 bg-pink-500/10 border border-pink-500/20 p-2.5 rounded-xl">
                  <ShieldAlert size={14} /> {authError}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold uppercase tracking-wider py-3 rounded-xl transition-all shadow-md shadow-cyan-500/20"
              >
                {loading ? "Aguarde..." : authMode === "login" ? "Entrar e Comentar" : "Cadastrar e Comentar"}
              </button>
            </form>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-slate-800 rounded-2xl">
            <MessageSquare size={32} className="text-slate-600 mx-auto mb-3" />
            <p className="text-xs text-slate-400">Nenhum comentário por enquanto. Seja o primeiro a opinar!</p>
          </div>
        ) : (
          comments.map((comment) => {
            const isOwner = user && user.id === comment.userId;
            return (
              <div 
                key={comment.id} 
                className="flex items-start gap-4 p-5 border border-slate-800 bg-slate-900/60 rounded-2xl hover:border-slate-700 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shrink-0 text-white font-bold shadow-md shadow-cyan-500/20">
                  {getAvatarChar(comment.user?.name)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-sm font-bold text-white">{comment.user?.name || "Usuário"}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-slate-400">{formatCommentDate(comment.createdAt)}</span>
                      {isOwner && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-slate-400 hover:text-pink-400 transition-colors p-1"
                          title="Excluir Comentário"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed break-words">
                    {comment.content}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
