import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import axios from "axios";
import {
  Upload,
  FolderOpen,
  Image,
  Video,
  File,
  X,
  Check,
  Trash2,
  Search,
  Grid,
  List,
  ExternalLink,
  Link as LinkIcon,
} from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function MediaUploader({
  open,
  onClose,
  onSelect,
  accept = "image/*,video/*",
  multiple = false,
  title = "Selecionar Mídia",
}) {
  const [activeTab, setActiveTab] = useState("upload");
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [library, setLibrary] = useState([]);
  const [loadingLibrary, setLoadingLibrary] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [selectedItems, setSelectedItems] = useState([]);
  const [urlInput, setUrlInput] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (open && activeTab === "library") {
      fetchLibrary();
    }
  }, [open, activeTab]);

  const fetchLibrary = async () => {
    setLoadingLibrary(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API}/media`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLibrary(response.data);
    } catch (error) {
      console.error("Error fetching library:", error);
    } finally {
      setLoadingLibrary(false);
    }
  };

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleFiles = async (files) => {
    if (files.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const token = localStorage.getItem("token");
      const uploadedUrls = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);

        const response = await axios.post(`${API}/media/upload`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round(
              ((i + progressEvent.loaded / progressEvent.total) / files.length) * 100
            );
            setUploadProgress(progress);
          },
        });

        if (response.data.file?.url) {
          uploadedUrls.push(response.data.file.url);
        }
      }

      toast.success(`${files.length} arquivo(s) enviado(s)!`);
      
      if (uploadedUrls.length > 0) {
        onSelect(multiple ? uploadedUrls : uploadedUrls[0]);
        onClose();
      }
    } catch (error) {
      toast.error("Erro ao enviar arquivo(s)");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleUrlSubmit = () => {
    if (!urlInput.trim()) {
      toast.error("Digite uma URL válida");
      return;
    }
    onSelect(urlInput.trim());
    onClose();
  };

  const handleLibrarySelect = (item) => {
    if (multiple) {
      setSelectedItems((prev) =>
        prev.includes(item.id)
          ? prev.filter((id) => id !== item.id)
          : [...prev, item.id]
      );
    } else {
      onSelect(item.url);
      onClose();
    }
  };

  const confirmLibrarySelection = () => {
    const selectedUrls = library
      .filter((item) => selectedItems.includes(item.id))
      .map((item) => item.url);
    onSelect(multiple ? selectedUrls : selectedUrls[0]);
    onClose();
  };

  const handleDeleteMedia = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Excluir este arquivo?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API}/media/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Arquivo excluído!");
      fetchLibrary();
    } catch (error) {
      toast.error("Erro ao excluir arquivo");
    }
  };

  const filteredLibrary = library.filter((item) =>
    item.filename.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getFileIcon = (fileType) => {
    if (fileType?.startsWith("image/")) return <Image className="w-5 h-5" />;
    if (fileType?.startsWith("video/")) return <Video className="w-5 h-5" />;
    return <File className="w-5 h-5" />;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-['Oswald'] text-xl uppercase">
            {title}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="upload" className="gap-2">
              <Upload className="w-4 h-4" />
              Computador
            </TabsTrigger>
            <TabsTrigger value="url" className="gap-2">
              <LinkIcon className="w-4 h-4" />
              URL Externa
            </TabsTrigger>
            <TabsTrigger value="library" className="gap-2">
              <FolderOpen className="w-4 h-4" />
              Biblioteca
            </TabsTrigger>
          </TabsList>

          {/* Upload from Computer */}
          <TabsContent value="upload" className="flex-1">
            <div
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                isDragging
                  ? "border-[#1E3A8A] bg-[#1E3A8A]/5"
                  : "border-slate-300 hover:border-slate-400"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                multiple={multiple}
                onChange={handleFileSelect}
                className="hidden"
              />

              {uploading ? (
                <div className="space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full border-4 border-[#1E3A8A] border-t-transparent animate-spin"></div>
                  <p className="text-slate-600">Enviando... {uploadProgress}%</p>
                  <div className="w-full max-w-xs mx-auto bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-[#1E3A8A] h-2 rounded-full transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              ) : (
                <>
                  <Upload className="w-16 h-16 mx-auto text-slate-400 mb-4" />
                  <p className="text-lg text-slate-700 mb-2">
                    Arraste arquivos aqui ou clique para selecionar
                  </p>
                  <p className="text-sm text-slate-500 mb-4">
                    Formatos aceitos: JPG, PNG, WebP, MP4, WebM
                  </p>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-[#1E3A8A] hover:bg-[#172554]"
                  >
                    Selecionar Arquivo
                  </Button>
                </>
              )}
            </div>
          </TabsContent>

          {/* External URL */}
          <TabsContent value="url" className="flex-1">
            <div className="space-y-6 p-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Cole a URL da imagem ou vídeo
                </label>
                <Input
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://exemplo.com/imagem.jpg"
                  className="rounded-sm"
                />
              </div>

              {urlInput && (
                <div className="border rounded-sm p-4">
                  <p className="text-sm text-slate-500 mb-2">Preview:</p>
                  {urlInput.match(/\.(mp4|webm|mov)$/i) ? (
                    <video
                      src={urlInput}
                      className="max-h-48 mx-auto rounded"
                      controls
                    />
                  ) : (
                    <img
                      src={urlInput}
                      alt="Preview"
                      className="max-h-48 mx-auto rounded"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  )}
                </div>
              )}

              <div className="bg-amber-50 border border-amber-200 rounded-sm p-4">
                <p className="text-sm text-amber-800">
                  <strong>Dica:</strong> Use URLs de serviços como Pexels, Unsplash ou seu próprio servidor.
                </p>
              </div>

              <Button
                onClick={handleUrlSubmit}
                disabled={!urlInput.trim()}
                className="w-full bg-[#1E3A8A] hover:bg-[#172554]"
              >
                Usar Esta URL
              </Button>
            </div>
          </TabsContent>

          {/* Library */}
          <TabsContent value="library" className="flex-1 flex flex-col overflow-hidden">
            {/* Search & View Toggle */}
            <div className="flex items-center gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar arquivos..."
                  className="pl-10 rounded-sm"
                />
              </div>
              <div className="flex border rounded-sm">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 ${viewMode === "grid" ? "bg-slate-100" : ""}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 ${viewMode === "list" ? "bg-slate-100" : ""}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Files Grid/List */}
            <div className="flex-1 overflow-auto">
              {loadingLibrary ? (
                <div className="flex items-center justify-center h-48">
                  <div className="animate-pulse text-slate-500">Carregando...</div>
                </div>
              ) : filteredLibrary.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-slate-500">
                  <FolderOpen className="w-12 h-12 mb-4 text-slate-300" />
                  <p>Nenhum arquivo na biblioteca</p>
                  <p className="text-sm">Faça upload para começar</p>
                </div>
              ) : viewMode === "grid" ? (
                <div className="grid grid-cols-4 gap-4">
                  {filteredLibrary.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleLibrarySelect(item)}
                      className={`relative group cursor-pointer border rounded-sm overflow-hidden ${
                        selectedItems.includes(item.id)
                          ? "ring-2 ring-[#1E3A8A]"
                          : "hover:border-slate-400"
                      }`}
                    >
                      <div className="aspect-square bg-slate-100 flex items-center justify-center">
                        {item.file_type?.startsWith("image/") ? (
                          <img
                            src={item.url}
                            alt={item.filename}
                            className="w-full h-full object-cover"
                          />
                        ) : item.file_type?.startsWith("video/") ? (
                          <Video className="w-8 h-8 text-slate-400" />
                        ) : (
                          <File className="w-8 h-8 text-slate-400" />
                        )}
                      </div>
                      <div className="p-2">
                        <p className="text-xs text-slate-600 truncate">
                          {item.filename}
                        </p>
                      </div>
                      {selectedItems.includes(item.id) && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-[#1E3A8A] rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <button
                        onClick={(e) => handleDeleteMedia(item.id, e)}
                        className="absolute top-2 left-2 w-6 h-6 bg-red-500 rounded-full items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hidden group-hover:flex"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredLibrary.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleLibrarySelect(item)}
                      className={`flex items-center gap-4 p-3 border rounded-sm cursor-pointer ${
                        selectedItems.includes(item.id)
                          ? "ring-2 ring-[#1E3A8A] bg-[#1E3A8A]/5"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      <div className="w-12 h-12 bg-slate-100 rounded flex items-center justify-center flex-shrink-0">
                        {item.file_type?.startsWith("image/") ? (
                          <img
                            src={item.url}
                            alt={item.filename}
                            className="w-full h-full object-cover rounded"
                          />
                        ) : (
                          getFileIcon(item.file_type)
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {item.filename}
                        </p>
                        <p className="text-xs text-slate-500">
                          {new Date(item.created_at).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      {selectedItems.includes(item.id) && (
                        <Check className="w-5 h-5 text-[#1E3A8A]" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Selection Actions */}
            {multiple && selectedItems.length > 0 && (
              <div className="border-t pt-4 mt-4 flex items-center justify-between">
                <p className="text-sm text-slate-600">
                  {selectedItems.length} arquivo(s) selecionado(s)
                </p>
                <Button
                  onClick={confirmLibrarySelection}
                  className="bg-[#1E3A8A] hover:bg-[#172554]"
                >
                  Usar Selecionados
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
