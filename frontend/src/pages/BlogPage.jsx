import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, ChevronRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await axios.get(`${API}/blog?published_only=true`);
      setPosts(response.data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-[#0F172A] text-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img
              src="https://customer-assets.emergentagent.com/job_star-trade-intl/artifacts/7zqbrzwt_star%20trade.png"
              alt="Star Trade"
              className="h-10 brightness-0 invert"
            />
          </Link>
          <Link
            to="/"
            className="text-sm text-white/80 hover:text-white flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Site
          </Link>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-[#1E3A8A] text-white py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="font-['Oswald'] text-4xl md:text-5xl font-bold uppercase tracking-tight mb-4">
            Blog & Notícias
          </h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            Fique por dentro das novidades do mercado de comércio exterior
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Search */}
        <div className="mb-8 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar posts..."
              className="pl-10 rounded-sm"
              data-testid="blog-search"
            />
          </div>
        </div>

        {/* Posts Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-pulse text-slate-500">Carregando...</div>
          </div>
        ) : filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post, index) => (
              <Link
                key={post.id}
                to={`/blog/${post.slug}`}
                className="bg-white overflow-hidden shadow-sm hover:shadow-xl transition-all group"
                data-testid={`blog-post-${index}`}
              >
                <div className="aspect-video overflow-hidden">
                  <img
                    src={
                      post.cover_image ||
                      "https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=600"
                    }
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
                    <Calendar className="w-4 h-4" />
                    {new Date(post.created_at).toLocaleDateString("pt-BR")}
                    {post.category && (
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-xs">
                        {post.category}
                      </span>
                    )}
                  </div>
                  <h2 className="font-['Oswald'] text-xl font-semibold text-slate-900 uppercase tracking-wide mb-3 line-clamp-2 group-hover:text-[#1E3A8A] transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-slate-600 line-clamp-3 mb-4">
                    {post.excerpt}
                  </p>
                  <span className="text-[#1E3A8A] font-medium uppercase text-sm tracking-wider inline-flex items-center">
                    Leia Mais
                    <ChevronRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-sm shadow-sm">
            <p className="text-slate-500">
              {searchTerm
                ? "Nenhum post encontrado para sua busca."
                : "Nenhum post publicado ainda."}
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-[#0F172A] text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-slate-400 text-sm">
            © 2026 Star Trade. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
