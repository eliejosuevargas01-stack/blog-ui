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

import { type Language } from "@/lib/i18n";

interface CommentsSectionProps {
  postId: number | string;
  lang?: Language;
}

const commentTranslations = {
  pt: {
    title: "Comentários",
    loggedInAs: "Logado como",
    logout: "Sair",
    writeLabel: "Escreva seu comentário",
    placeholder: "O que você achou desse post? Deixe sua opinião...",
    submitting: "Enviando...",
    publish: "Publicar Comentário",
    joinTitle: "Participe da discussão",
    joinSub: "Faça login ou cadastre-se rapidamente para enviar seu comentário.",
    loginTab: "Entrar",
    registerTab: "Criar Conta",
    nameLabel: "Nome",
    emailLabel: "E-mail",
    passwordLabel: "Senha",
    namePlaceholder: "Seu nome",
    emailPlaceholder: "seu@email.com",
    passwordPlaceholder: "Sua senha",
    loginSubmit: "Entrar e Comentar",
    registerSubmit: "Cadastrar e Comentar",
    pleaseWait: "Aguarde...",
    empty: "Nenhum comentário por enquanto. Seja o primeiro a opinar!",
    deleteConfirm: "Deseja deletar seu comentário?",
    userFallback: "Usuário",
  },
  en: {
    title: "Comments",
    loggedInAs: "Logged in as",
    logout: "Log out",
    writeLabel: "Write your comment",
    placeholder: "What did you think of this post? Share your thoughts...",
    submitting: "Submitting...",
    publish: "Post Comment",
    joinTitle: "Join the discussion",
    joinSub: "Log in or sign up quickly to post your comment.",
    loginTab: "Log In",
    registerTab: "Sign Up",
    nameLabel: "Name",
    emailLabel: "Email",
    passwordLabel: "Password",
    namePlaceholder: "Your name",
    emailPlaceholder: "your@email.com",
    passwordPlaceholder: "Your password",
    loginSubmit: "Log In & Comment",
    registerSubmit: "Sign Up & Comment",
    pleaseWait: "Please wait...",
    empty: "No comments yet. Be the first to share your opinion!",
    deleteConfirm: "Do you want to delete your comment?",
    userFallback: "User",
  },
  es: {
    title: "Comentarios",
    loggedInAs: "Conectado como",
    logout: "Cerrar sesión",
    writeLabel: "Escribe tu comentario",
    placeholder: "¿Qué te pareció este post? Deja tu opinión...",
    submitting: "Enviando...",
    publish: "Publicar Comentario",
    joinTitle: "Únete a la conversación",
    joinSub: "Inicia sesión o regístrate para enviar tu comentario.",
    loginTab: "Iniciar Sesión",
    registerTab: "Crear Cuenta",
    nameLabel: "Nombre",
    emailLabel: "Correo electrónico",
    passwordLabel: "Contraseña",
    namePlaceholder: "Tu nombre",
    emailPlaceholder: "tu@email.com",
    passwordPlaceholder: "Tu contraseña",
    loginSubmit: "Iniciar Sesión y Comentar",
    registerSubmit: "Registrarse y Comentar",
    pleaseWait: "Espere por favor...",
    empty: "¡Sin comentarios por ahora. Sé el primero en opinar!",
    deleteConfirm: "¿Deseas eliminar tu comentario?",
    userFallback: "Usuario",
  },
};

export default function CommentsSection({ postId, lang = "pt" }: CommentsSectionProps) {
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

  const t = commentTranslations[lang] ?? commentTranslations.pt;

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
    if (!confirm(t.deleteConfirm)) return;

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
      const locale = lang === "en" ? "en-US" : lang === "es" ? "es-ES" : "pt-BR";
      return new Date(dateStr).toLocaleString(locale, {
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
    <div className="border-t border-border mt-14 pt-10">
      <div className="flex items-center gap-3 mb-8">
        <span className="block w-1.5 h-6 bg-secondary rounded-full" />
        <h3 className="text-xl font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
          {t.title} ({comments.length})
        </h3>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 mb-10 shadow-sm">
        {user ? (
          <form onSubmit={handlePostComment} className="space-y-4">
            <div className="flex items-center justify-between text-xs text-foreground/70 border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                <span>{t.loggedInAs} <strong className="text-foreground">{user.name}</strong> ({user.email})</span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1 text-secondary hover:underline uppercase tracking-wider font-bold"
              >
                <LogOut size={12} /> {t.logout}
              </button>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[11px] text-foreground/70 uppercase font-bold tracking-wider">{t.writeLabel}</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={t.placeholder}
                rows={4}
                className="w-full bg-muted/60 border border-border rounded-xl text-sm p-4 outline-none focus:border-secondary text-foreground resize-none transition-colors"
                maxLength={1000}
              />
            </div>

            {commentError && (
              <div className="text-destructive text-xs flex items-center gap-1.5 bg-destructive/10 border border-destructive/20 p-3 rounded-xl">
                <ShieldAlert size={14} /> {commentError}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !content.trim()}
              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-xl transition-all shadow-sm disabled:opacity-40"
            >
              {loading ? t.submitting : t.publish}
            </button>
          </form>
        ) : (
          <div>
            <div className="text-center mb-6">
              <h4 className="text-lg font-bold uppercase tracking-wide text-foreground mb-1">
                {t.joinTitle}
              </h4>
              <p className="text-xs text-foreground/70 max-w-[400px] mx-auto">
                {t.joinSub}
              </p>
            </div>

            <div className="flex border-b border-border mb-6">
              <button
                onClick={() => { setAuthMode("login"); setAuthError(""); }}
                className={`flex-1 py-2.5 text-center text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${
                  authMode === "login" 
                    ? "border-secondary text-secondary" 
                    : "border-transparent text-foreground/70 hover:text-foreground"
                }`}
              >
                {t.loginTab}
              </button>
              <button
                onClick={() => { setAuthMode("register"); setAuthError(""); }}
                className={`flex-1 py-2.5 text-center text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${
                  authMode === "register" 
                    ? "border-secondary text-secondary" 
                    : "border-transparent text-foreground/70 hover:text-foreground"
                }`}
              >
                {t.registerTab}
              </button>
            </div>

            <form onSubmit={handleAuth} className="space-y-4 max-w-[380px] mx-auto">
              {authMode === "register" && (
                <div className="space-y-1">
                  <label className="text-[11px] text-foreground/70 uppercase font-bold tracking-wider block">{t.nameLabel}</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t.namePlaceholder}
                    required
                    className="w-full bg-muted/60 border border-border rounded-xl text-sm px-3.5 py-2.5 outline-none focus:border-secondary text-foreground transition-colors"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[11px] text-foreground/70 uppercase font-bold tracking-wider block">{t.emailLabel}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.emailPlaceholder}
                  required
                  className="w-full bg-muted/60 border border-border rounded-xl text-sm px-3.5 py-2.5 outline-none focus:border-secondary text-foreground transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-foreground/70 uppercase font-bold tracking-wider block">{t.passwordLabel}</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.passwordPlaceholder}
                  required
                  className="w-full bg-muted/60 border border-border rounded-xl text-sm px-3.5 py-2.5 outline-none focus:border-secondary text-foreground transition-colors"
                />
              </div>

              {authError && (
                <div className="text-destructive text-xs flex items-center gap-1.5 bg-destructive/10 border border-destructive/20 p-2.5 rounded-xl">
                  <ShieldAlert size={14} /> {authError}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground text-xs font-bold uppercase tracking-wider py-3 rounded-xl transition-all shadow-sm"
              >
                {loading ? t.pleaseWait : authMode === "login" ? t.loginSubmit : t.registerSubmit}
              </button>
            </form>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-border rounded-2xl">
            <MessageSquare size={32} className="text-foreground/30 mx-auto mb-3" />
            <p className="text-xs text-foreground/70">{t.empty}</p>
          </div>
        ) : (
          comments.map((comment) => {
            const isOwner = user && user.id === comment.userId;
            return (
              <div 
                key={comment.id} 
                className="flex items-start gap-4 p-5 border border-border bg-card/60 rounded-2xl transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-full bg-secondary/20 border border-secondary/40 flex items-center justify-center shrink-0 text-secondary font-bold">
                  {getAvatarChar(comment.user?.name)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-sm font-bold text-foreground">{comment.user?.name || t.userFallback}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-foreground/70">{formatCommentDate(comment.createdAt)}</span>
                      {isOwner && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-foreground/50 hover:text-destructive transition-colors p-1"
                          title="Excluir Comentário"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed break-words">
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
