import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Eye, Star, Calendar } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const defaultPost = {
  title: "",
  excerpt: "",
  content: "",
  cover_image: "",
  category: "",
  tags: [],
  is_featured: false,
  is_published: true,
  meta_title: "",
  meta_description: "",
};

export default function BlogAdmin() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [formData, setFormData] = useState(defaultPost);
  const [saving, setSaving] = useState(false);
  const [tagsInput, setTagsInput] = useState("");

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API}/blog`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts(response.data);
    } catch (error) {
      toast.error("Erro ao carregar posts");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (post = null) => {
    if (post) {
      setEditingPost(post);
      setFormData(post);
      setTagsInput(post.tags?.join(", ") || "");
    } else {
      setEditingPost(null);
      setFormData(defaultPost);
      setTagsInput("");
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.excerpt || !formData.content) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const dataToSave = {
        ...formData,
        tags: tagsInput
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      };

      if (editingPost) {
        await axios.put(`${API}/blog/${editingPost.id}`, dataToSave, { headers });
        toast.success("Post atualizado!");
      } else {
        await axios.post(`${API}/blog`, dataToSave, { headers });
        toast.success("Post criado!");
      }

      fetchPosts();
      setDialogOpen(false);
    } catch (error) {
      toast.error("Erro ao salvar post");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir este post?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API}/blog/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Post excluído!");
      fetchPosts();
    } catch (error) {
      toast.error("Erro ao excluir post");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-slate-500">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="blog-admin-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-['Oswald'] text-2xl md:text-3xl font-bold text-slate-900 uppercase tracking-tight">
            Blog
          </h1>
          <p className="text-slate-500 mt-1">
            Gerencie os posts do seu blog
          </p>
        </div>
        <Button
          onClick={() => handleOpenDialog()}
          className="bg-[#1E3A8A] hover:bg-[#172554] rounded-sm"
          data-testid="add-post-btn"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Post
        </Button>
      </div>

      {/* Posts List */}
      <div className="grid gap-4">
        {posts.map((post, index) => (
          <Card key={post.id} className="border-0 shadow-sm" data-testid={`post-item-${index}`}>
            <CardContent className="p-4">
              <div className="flex gap-4">
                {/* Thumbnail */}
                <div className="w-32 h-24 flex-shrink-0 bg-slate-100 rounded-sm overflow-hidden">
                  {post.cover_image ? (
                    <img
                      src={post.cover_image}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <Eye className="w-8 h-8" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-slate-900 truncate">
                          {post.title}
                        </h3>
                        {post.is_featured && (
                          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        )}
                        {!post.is_published && (
                          <span className="px-2 py-0.5 bg-slate-200 text-slate-600 text-xs rounded">
                            Rascunho
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 line-clamp-2">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(post.created_at).toLocaleDateString("pt-BR")}
                        </span>
                        {post.category && (
                          <span className="px-2 py-0.5 bg-slate-100 rounded">
                            {post.category}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDialog(post)}
                        data-testid={`edit-post-${index}`}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                      >
                        <a href={`/blog/${post.slug}`} target="_blank" rel="noreferrer">
                          <Eye className="w-4 h-4" />
                        </a>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(post.id)}
                        data-testid={`delete-post-${index}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {posts.length === 0 && (
        <div className="text-center py-12 bg-white rounded-sm shadow-sm">
          <Eye className="w-12 h-12 mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500">Nenhum post publicado ainda.</p>
          <Button
            onClick={() => handleOpenDialog()}
            className="mt-4 bg-[#1E3A8A]"
          >
            Criar primeiro post
          </Button>
        </div>
      )}

      {/* Edit/Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-['Oswald'] text-xl uppercase">
              {editingPost ? "Editar Post" : "Novo Post"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Título *
              </label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Título do post"
                className="rounded-sm"
                data-testid="post-title-input"
              />
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Resumo *
              </label>
              <Textarea
                value={formData.excerpt}
                onChange={(e) =>
                  setFormData({ ...formData, excerpt: e.target.value })
                }
                placeholder="Breve descrição do post..."
                className="rounded-sm"
                rows={2}
                data-testid="post-excerpt-input"
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Conteúdo *
              </label>
              <Textarea
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                placeholder="Conteúdo completo do post... (suporta Markdown)"
                className="rounded-sm min-h-[200px] font-mono text-sm"
                data-testid="post-content-input"
              />
            </div>

            {/* Cover Image */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Imagem de Capa
              </label>
              <Input
                value={formData.cover_image}
                onChange={(e) =>
                  setFormData({ ...formData, cover_image: e.target.value })
                }
                placeholder="https://..."
                className="rounded-sm"
                data-testid="post-image-input"
              />
              {formData.cover_image && (
                <img
                  src={formData.cover_image}
                  alt="Preview"
                  className="mt-2 h-32 w-full object-cover rounded-sm"
                />
              )}
            </div>

            {/* Category & Tags */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Categoria
                </label>
                <Input
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  placeholder="Ex: Comércio Exterior"
                  className="rounded-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tags (separadas por vírgula)
                </label>
                <Input
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="importação, exportação, logística"
                  className="rounded-sm"
                />
              </div>
            </div>

            {/* SEO */}
            <div className="border-t pt-4">
              <p className="text-sm font-medium text-slate-700 mb-4">SEO</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-600 mb-1">
                    Meta Title
                  </label>
                  <Input
                    value={formData.meta_title}
                    onChange={(e) =>
                      setFormData({ ...formData, meta_title: e.target.value })
                    }
                    placeholder="Título para SEO (deixe vazio para usar o título)"
                    className="rounded-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1">
                    Meta Description
                  </label>
                  <Textarea
                    value={formData.meta_description}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        meta_description: e.target.value,
                      })
                    }
                    placeholder="Descrição para SEO..."
                    className="rounded-sm"
                    rows={2}
                  />
                </div>
              </div>
            </div>

            {/* Toggles */}
            <div className="flex gap-6 border-t pt-4">
              <div className="flex items-center gap-3">
                <Switch
                  checked={formData.is_published}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_published: checked })
                  }
                  data-testid="post-published-switch"
                />
                <span className="text-sm text-slate-700">Publicado</span>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={formData.is_featured}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_featured: checked })
                  }
                  data-testid="post-featured-switch"
                />
                <span className="text-sm text-slate-700">Destaque</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="rounded-sm"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#1E3A8A] hover:bg-[#172554] rounded-sm"
              data-testid="save-post-btn"
            >
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
