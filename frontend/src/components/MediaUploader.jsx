import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Link as LinkIcon,
  Crop,
  RotateCw,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  CloudIcon,
  HardDrive,
  Filter,
  SortAsc,
  Clock,
  FileText,
} from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Google Drive Icon Component
const GoogleDriveIcon = () => (
  <svg viewBox="0 0 87.3 78" className="w-5 h-5">
    <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
    <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z" fill="#00ac47"/>
    <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335"/>
    <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d"/>
    <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc"/>
    <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
  </svg>
);

export default function MediaUploader({
  open,
  onClose,
  onSelect,
  accept = "image/*,video/*",
  multiple = false,
  title = "Selecionar Mídia",
  currentValue = "",
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
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [compressImages, setCompressImages] = useState(true);
  
  // Image Editor State
  const [showEditor, setShowEditor] = useState(false);
  const [editingImage, setEditingImage] = useState(null);
  const [editSettings, setEditSettings] = useState({
    rotation: 0,
    brightness: 100,
    contrast: 100,
    quality: 80,
  });
  
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
      setLibrary(response.data || []);
    } catch (error) {
      console.error("Error fetching library:", error);
      setLibrary([]);
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

    // Validate files
    const maxSize = 50 * 1024 * 1024; // 50MB
    const validFiles = files.filter(file => {
      if (file.size > maxSize) {
        toast.error(`${file.name} excede 50MB`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const token = localStorage.getItem("token");
      const uploadedFiles = [];

      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i];
        const formData = new FormData();
        formData.append("file", file);
        formData.append("compress", compressImages.toString());

        const response = await axios.post(`${API}/media/upload`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round(
              ((i + progressEvent.loaded / progressEvent.total) / validFiles.length) * 100
            );
            setUploadProgress(progress);
          },
        });

        if (response.data.file) {
          uploadedFiles.push(response.data.file);
        }
      }

      toast.success(`${validFiles.length} arquivo(s) enviado(s)!`);
      
      // Show editor for images
      if (uploadedFiles.length === 1 && uploadedFiles[0].file_type?.startsWith("image/")) {
        setEditingImage(uploadedFiles[0]);
        setShowEditor(true);
      } else if (uploadedFiles.length > 0) {
        const urls = uploadedFiles.map(f => f.url);
        onSelect(multiple ? urls : urls[0]);
        onClose();
      }
      
      fetchLibrary();
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

  const applyImageEdit = () => {
    if (editingImage) {
      onSelect(editingImage.url);
      setShowEditor(false);
      setEditingImage(null);
      onClose();
    }
  };

  const skipImageEdit = () => {
    if (editingImage) {
      onSelect(editingImage.url);
      setShowEditor(false);
      setEditingImage(null);
      onClose();
    }
  };

  // Filter and sort library
  const filteredLibrary = library
    .filter((item) => {
      const matchesSearch = item.filename?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === "all" ||
        (filterType === "images" && item.file_type?.startsWith("image/")) ||
        (filterType === "videos" && item.file_type?.startsWith("video/"));
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      if (sortBy === "recent") return new Date(b.created_at) - new Date(a.created_at);
      if (sortBy === "name") return (a.filename || "").localeCompare(b.filename || "");
      if (sortBy === "size") return (b.size || 0) - (a.size || 0);
      return 0;
    });

  const getFileIcon = (fileType) => {
    if (fileType?.startsWith("image/")) return <Image className="w-5 h-5" />;
    if (fileType?.startsWith("video/")) return <Video className="w-5 h-5" />;
    return <File className="w-5 h-5" />;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "—";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  // Image Editor Modal
  if (showEditor && editingImage) {
    return (
      <Dialog open={true} onOpenChange={() => skipImageEdit()}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="font-['Oswald'] text-xl uppercase">
              Editar Imagem
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-6">
            {/* Preview */}
            <div className="bg-slate-100 rounded-lg p-4 flex items-center justify-center min-h-[300px]">
              <img
                src={editingImage.url}
                alt="Preview"
                className="max-w-full max-h-[300px] object-contain rounded"
                style={{
                  transform: `rotate(${editSettings.rotation}deg)`,
                  filter: `brightness(${editSettings.brightness}%) contrast(${editSettings.contrast}%)`,
                }}
              />
            </div>

            {/* Controls */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Rotação: {editSettings.rotation}°
                </label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditSettings(s => ({ ...s, rotation: (s.rotation - 90) % 360 }))}
                  >
                    <RotateCw className="w-4 h-4 rotate-180" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditSettings(s => ({ ...s, rotation: (s.rotation + 90) % 360 }))}
                  >
                    <RotateCw className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditSettings(s => ({ ...s, rotation: 0 }))}
                  >
                    Reset
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Brilho: {editSettings.brightness}%
                </label>
                <Slider
                  value={[editSettings.brightness]}
                  onValueChange={([v]) => setEditSettings(s => ({ ...s, brightness: v }))}
                  min={50}
                  max={150}
                  step={5}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Contraste: {editSettings.contrast}%
                </label>
                <Slider
                  value={[editSettings.contrast]}
                  onValueChange={([v]) => setEditSettings(s => ({ ...s, contrast: v }))}
                  min={50}
                  max={150}
                  step={5}
                />
              </div>

              <div className="pt-4 border-t flex gap-3">
                <Button
                  variant="outline"
                  onClick={skipImageEdit}
                  className="flex-1"
                >
                  Usar Original
                </Button>
                <Button
                  onClick={applyImageEdit}
                  className="flex-1 bg-[#1E3A8A] hover:bg-[#172554]"
                >
                  Aplicar e Usar
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-['Oswald'] text-xl uppercase flex items-center gap-2">
            <Upload className="w-5 h-5" />
            {title}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="upload" className="gap-2">
              <HardDrive className="w-4 h-4" />
              Computador
            </TabsTrigger>
            <TabsTrigger value="drive" className="gap-2">
              <GoogleDriveIcon />
              Google Drive
            </TabsTrigger>
            <TabsTrigger value="library" className="gap-2">
              <FolderOpen className="w-4 h-4" />
              Biblioteca
            </TabsTrigger>
          </TabsList>

          {/* Upload from Computer */}
          <TabsContent value="upload" className="flex-1 overflow-auto">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                isDragging
                  ? "border-[#1E3A8A] bg-[#1E3A8A]/5 scale-[1.02]"
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
                <div className="space-y-4 py-8">
                  <div className="w-20 h-20 mx-auto rounded-full border-4 border-[#1E3A8A] border-t-transparent animate-spin"></div>
                  <p className="text-lg text-slate-700">Enviando... {uploadProgress}%</p>
                  <div className="w-full max-w-md mx-auto bg-slate-200 rounded-full h-3">
                    <div
                      className="bg-[#1E3A8A] h-3 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-20 h-20 mx-auto bg-[#1E3A8A]/10 rounded-full flex items-center justify-center mb-4">
                    <Upload className="w-10 h-10 text-[#1E3A8A]" />
                  </div>
                  <p className="text-xl font-medium text-slate-800 mb-2">
                    Arraste arquivos aqui
                  </p>
                  <p className="text-slate-500 mb-6">
                    ou clique para selecionar do computador
                  </p>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-[#1E3A8A] hover:bg-[#172554] px-8"
                  >
                    Selecionar Arquivos
                  </Button>
                  <p className="text-xs text-slate-400 mt-4">
                    JPG, PNG, WebP, GIF, MP4, WebM • Máximo 50MB
                  </p>
                </>
              )}
            </div>

            {/* Options */}
            <div className="mt-4 p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-700">Comprimir Imagens</p>
                  <p className="text-sm text-slate-500">Reduz o tamanho automaticamente</p>
                </div>
                <Switch
                  checked={compressImages}
                  onCheckedChange={setCompressImages}
                />
              </div>
            </div>

            {/* URL Input Alternative */}
            <div className="mt-4 p-4 border rounded-lg">
              <p className="font-medium text-slate-700 mb-3 flex items-center gap-2">
                <LinkIcon className="w-4 h-4" />
                Ou use uma URL externa
              </p>
              <div className="flex gap-2">
                <Input
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://exemplo.com/imagem.jpg"
                  className="flex-1"
                />
                <Button
                  onClick={handleUrlSubmit}
                  disabled={!urlInput.trim()}
                  variant="outline"
                >
                  Usar URL
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Google Drive */}
          <TabsContent value="drive" className="flex-1 overflow-auto">
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-6">
                <GoogleDriveIcon />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">
                Google Drive
              </h3>
              <p className="text-slate-500 mb-6 max-w-md mx-auto">
                Conecte sua conta Google para acessar arquivos diretamente do Drive.
              </p>
              
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 max-w-md mx-auto mb-6">
                <p className="text-sm text-amber-800">
                  <strong>Configuração necessária:</strong> Para usar o Google Drive, 
                  configure as credenciais OAuth em Configurações → Integrações.
                </p>
              </div>

              <Button
                variant="outline"
                className="gap-2"
                onClick={() => toast.info("Configure as credenciais OAuth do Google em Configurações → Integrações")}
              >
                <GoogleDriveIcon />
                Conectar Google Drive
              </Button>

              <div className="mt-8 p-4 bg-slate-50 rounded-lg max-w-md mx-auto text-left">
                <p className="font-medium text-slate-700 mb-2">Benefícios:</p>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>• Acesse arquivos sem baixar</li>
                  <li>• Sincronize automaticamente</li>
                  <li>• Economize espaço no servidor</li>
                  <li>• Compartilhe facilmente</li>
                </ul>
              </div>
            </div>
          </TabsContent>

          {/* Library */}
          <TabsContent value="library" className="flex-1 flex flex-col overflow-hidden">
            {/* Filters & Search */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar arquivos..."
                  className="pl-10"
                />
              </div>
              
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[130px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="images">Imagens</SelectItem>
                  <SelectItem value="videos">Vídeos</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[130px]">
                  <SortAsc className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Recentes</SelectItem>
                  <SelectItem value="name">Nome</SelectItem>
                  <SelectItem value="size">Tamanho</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex border rounded-md">
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

              <Button variant="outline" size="sm" onClick={fetchLibrary}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>

            {/* Files Grid/List */}
            <div className="flex-1 overflow-auto">
              {loadingLibrary ? (
                <div className="flex items-center justify-center h-48">
                  <div className="animate-spin w-8 h-8 border-4 border-[#1E3A8A] border-t-transparent rounded-full"></div>
                </div>
              ) : filteredLibrary.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-slate-500">
                  <FolderOpen className="w-16 h-16 mb-4 text-slate-300" />
                  <p className="text-lg font-medium">Biblioteca vazia</p>
                  <p className="text-sm">Faça upload de arquivos para começar</p>
                </div>
              ) : viewMode === "grid" ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {filteredLibrary.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleLibrarySelect(item)}
                      className={`relative group cursor-pointer border-2 rounded-lg overflow-hidden transition-all hover:shadow-lg ${
                        selectedItems.includes(item.id)
                          ? "border-[#1E3A8A] ring-2 ring-[#1E3A8A]/20"
                          : "border-transparent hover:border-slate-300"
                      }`}
                    >
                      <div className="aspect-square bg-slate-100 flex items-center justify-center">
                        {item.file_type?.startsWith("image/") ? (
                          <img
                            src={item.url}
                            alt={item.filename}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : item.file_type?.startsWith("video/") ? (
                          <div className="flex flex-col items-center text-slate-400">
                            <Video className="w-10 h-10 mb-2" />
                            <span className="text-xs">Vídeo</span>
                          </div>
                        ) : (
                          <File className="w-10 h-10 text-slate-400" />
                        )}
                      </div>
                      
                      {/* Hover info */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                        <p className="text-white text-xs truncate font-medium">
                          {item.filename}
                        </p>
                        <p className="text-white/70 text-xs">
                          {formatFileSize(item.size)}
                        </p>
                      </div>

                      {selectedItems.includes(item.id) && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-[#1E3A8A] rounded-full flex items-center justify-center shadow-lg">
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
                      className={`flex items-center gap-4 p-3 border rounded-lg cursor-pointer transition-all ${
                        selectedItems.includes(item.id)
                          ? "border-[#1E3A8A] bg-[#1E3A8A]/5"
                          : "hover:bg-slate-50 hover:border-slate-300"
                      }`}
                    >
                      <div className="w-14 h-14 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {item.file_type?.startsWith("image/") ? (
                          <img
                            src={item.url}
                            alt={item.filename}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          getFileIcon(item.file_type)
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 truncate">
                          {item.filename}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span>{formatFileSize(item.size)}</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(item.created_at).toLocaleDateString("pt-BR")}
                          </span>
                        </div>
                      </div>
                      {selectedItems.includes(item.id) && (
                        <Check className="w-5 h-5 text-[#1E3A8A] flex-shrink-0" />
                      )}
                      <button
                        onClick={(e) => handleDeleteMedia(item.id, e)}
                        className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Selection Actions */}
            {multiple && selectedItems.length > 0 && (
              <div className="border-t pt-4 mt-4 flex items-center justify-between bg-slate-50 -mx-6 -mb-6 px-6 pb-4">
                <p className="text-sm font-medium text-slate-700">
                  {selectedItems.length} arquivo(s) selecionado(s)
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedItems([])}
                  >
                    Limpar
                  </Button>
                  <Button
                    onClick={confirmLibrarySelection}
                    className="bg-[#1E3A8A] hover:bg-[#172554]"
                  >
                    Usar Selecionados
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

// Simplified button to trigger media uploader
export function MediaUploadButton({ 
  value, 
  onChange, 
  accept = "image/*",
  label = "Selecionar",
  preview = true,
  className = "",
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className={`space-y-2 ${className}`}>
        {preview && value && (
          <div className="relative rounded-lg overflow-hidden bg-slate-100">
            {value.match(/\.(mp4|webm|mov)$/i) ? (
              <video
                src={value}
                className="w-full h-32 object-cover"
              />
            ) : (
              <img
                src={value}
                alt="Preview"
                className="w-full h-32 object-cover"
              />
            )}
            <button
              onClick={() => onChange("")}
              className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        <Button
          type="button"
          variant="outline"
          onClick={() => setOpen(true)}
          className="w-full gap-2"
        >
          <Upload className="w-4 h-4" />
          {value ? "Alterar" : label}
        </Button>
      </div>

      <MediaUploader
        open={open}
        onClose={() => setOpen(false)}
        onSelect={onChange}
        accept={accept}
        currentValue={value}
      />
    </>
  );
}
