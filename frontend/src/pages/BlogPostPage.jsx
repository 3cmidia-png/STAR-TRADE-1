import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Tag, User } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function BlogPostPage() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPost();
  }, [slug]);

  const fetchPost = async () => {
    try {
      const response = await axios.get(`${API}/blog/${slug}`);
      setPost(response.data);
    } catch (error) {
      console.error("Error fetching post:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-pulse text-slate-500">Carregando...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Post não encontrado</h1>
        <Button asChild>
          <Link to="/blog">Voltar ao Blog</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-[#0F172A] text-white py-4">
        <div className="max-w-4xl mx-auto px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img
              src="https://customer-assets.emergentagent.com/job_star-trade-intl/artifacts/7zqbrzwt_star%20trade.png"
              alt="Star Trade"
              className="h-8 brightness-0 invert"
            />
          </Link>
          <Link
            to="/blog"
            className="text-sm text-white/80 hover:text-white flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Blog
          </Link>
        </div>
      </header>

      {/* Cover Image */}
      {post.cover_image && (
        <div className="w-full h-[400px] relative">
          <img
            src={post.cover_image}
            alt={post.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      )}

      {/* Content */}
      <article className="max-w-4xl mx-auto px-6 py-12">
        {/* Meta */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-6">
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {new Date(post.created_at).toLocaleDateString("pt-BR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
          {post.author_name && (
            <span className="flex items-center gap-1">
              <User className="w-4 h-4" />
              {post.author_name}
            </span>
          )}
          {post.category && (
            <span className="px-2 py-1 bg-[#1E3A8A]/10 text-[#1E3A8A] rounded-sm">
              {post.category}
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="font-['Oswald'] text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 uppercase tracking-tight mb-6">
          {post.title}
        </h1>

        {/* Excerpt */}
        <p className="text-xl text-slate-600 mb-8 leading-relaxed border-l-4 border-[#1E3A8A] pl-4">
          {post.excerpt}
        </p>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {post.tags.map((tag, index) => (
              <span
                key={index}
                className="flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-600 text-sm rounded-sm"
              >
                <Tag className="w-3 h-3" />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          {post.content.split("\n").map((paragraph, index) => (
            <p key={index} className="mb-4 text-slate-700 leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 p-8 bg-slate-50 rounded-sm text-center">
          <h3 className="font-['Oswald'] text-2xl font-bold text-slate-900 uppercase mb-4">
            Precisa de ajuda com importação ou exportação?
          </h3>
          <p className="text-slate-600 mb-6">
            Entre em contato conosco e descubra como podemos ajudar sua empresa.
          </p>
          <Button
            asChild
            className="bg-[#1E3A8A] hover:bg-[#172554] rounded-sm px-8 py-6 uppercase tracking-wider"
          >
            <Link to="/#contato">Fale Conosco</Link>
          </Button>
        </div>
      </article>

      {/* Footer */}
      <footer className="bg-[#0F172A] text-white py-8">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-slate-400 text-sm">
            © 2026 Star Trade. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
