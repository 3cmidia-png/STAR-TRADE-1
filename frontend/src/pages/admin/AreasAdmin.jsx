import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Plus,
  Pencil,
  Trash2,
  GripVertical,
  Eye,
  EyeOff,
  Gem,
  Wheat,
  ShoppingCart,
  Bike,
  Users,
  Clock,
  Shield,
  Globe,
  Building,
  Truck,
} from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const iconOptions = [
  { value: "Wheat", label: "Trigo (Alimentos)", icon: Wheat },
  { value: "Gem", label: "Gema (Rochas)", icon: Gem },
  { value: "ShoppingCart", label: "Carrinho (E-commerce)", icon: ShoppingCart },
  { value: "Bike", label: "Bicicleta", icon: Bike },
  { value: "Users", label: "Pessoas", icon: Users },
  { value: "Clock", label: "Relógio", icon: Clock },
  { value: "Shield", label: "Escudo", icon: Shield },
  { value: "Globe", label: "Globo", icon: Globe },
  { value: "Building", label: "Prédio", icon: Building },
  { value: "Truck", label: "Caminhão", icon: Truck },
];

const iconMap = {
  Wheat,
  Gem,
  ShoppingCart,
  Bike,
  Users,
  Clock,
  Shield,
  Globe,
  Building,
  Truck,
};

const defaultArea = {
  title: "",
  description: "",
  image_url: "",
  icon: "Globe",
  is_specialty: false,
  badge_text: "Setor",
  badge_color: "#1E3A8A",
  overlay_color: "rgba(30, 58, 138, 0.7)",
  button_text: "Saiba Mais",
  button_link: "",
  is_active: true,
  order: 0,
};

export default function AreasAdmin() {
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingArea, setEditingArea] = useState(null);
  const [formData, setFormData] = useState(defaultArea);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAreas();
  }, []);

  const fetchAreas = async () => {
    try {
      const response = await axios.get(`${API}/areas`);
      setAreas(response.data);
    } catch (error) {
      toast.error("Erro ao carregar áreas");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (area = null) => {
    if (area) {
      setEditingArea(area);
      setFormData(area);
    } else {
      setEditingArea(null);
      setFormData({ ...defaultArea, order: areas.length });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.description) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      // Auto-adjust badge for specialty
      const dataToSave = {
        ...formData,
        badge_text: formData.is_specialty ? "NOSSA ESPECIALIDADE" : formData.badge_text,
        badge_color: formData.is_specialty ? "#D4AF37" : formData.badge_color,
        overlay_color: formData.is_specialty
          ? "rgba(212, 175, 55, 0.7)"
          : formData.overlay_color,
      };

      if (editingArea) {
        await axios.put(`${API}/areas/${editingArea.id}`, dataToSave, { headers });
        toast.success("Área atualizada!");
      } else {
        await axios.post(`${API}/areas`, dataToSave, { headers });
        toast.success("Área criada!");
      }

      fetchAreas();
      setDialogOpen(false);
    } catch (error) {
      toast.error("Erro ao salvar área");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir esta área?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API}/areas/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Área excluída!");
      fetchAreas();
    } catch (error) {
      toast.error("Erro ao excluir área");
    }
  };

  const handleToggleActive = async (area) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API}/areas/${area.id}`,
        { ...area, is_active: !area.is_active },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchAreas();
      toast.success(area.is_active ? "Área desativada" : "Área ativada");
    } catch (error) {
      toast.error("Erro ao atualizar área");
    }
  };

  const getIcon = (iconName) => {
    const IconComponent = iconMap[iconName];
    return IconComponent ? <IconComponent className="w-5 h-5" /> : null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-slate-500">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="areas-admin-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-['Oswald'] text-2xl md:text-3xl font-bold text-slate-900 uppercase tracking-tight">
            Áreas de Atuação
          </h1>
          <p className="text-slate-500 mt-1">
            Gerencie os setores em que sua empresa atua
          </p>
        </div>
        <Button
          onClick={() => handleOpenDialog()}
          className="bg-[#1E3A8A] hover:bg-[#172554] rounded-sm"
          disabled={areas.length >= 8}
          data-testid="add-area-btn"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Área
        </Button>
      </div>

      {/* Areas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {areas.map((area, index) => (
          <Card
            key={area.id}
            className={`border-0 shadow-sm overflow-hidden ${
              !area.is_active ? "opacity-60" : ""
            }`}
            data-testid={`area-item-${index}`}
          >
            <div className="relative h-48">
              <img
                src={area.image_url || "https://via.placeholder.com/600x400"}
                alt={area.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              
              {/* Badge */}
              <span
                className="absolute top-4 left-4 px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-sm text-white"
                style={{ backgroundColor: area.badge_color }}
              >
                {area.badge_text}
              </span>

              {/* Status indicator */}
              {!area.is_active && (
                <span className="absolute top-4 right-4 px-2 py-1 bg-red-500 text-white text-xs rounded-sm">
                  Inativo
                </span>
              )}

              {/* Title overlay */}
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-sm flex items-center justify-center text-white">
                    {getIcon(area.icon)}
                  </div>
                  <h3 className="font-['Oswald'] text-xl font-bold text-white uppercase">
                    {area.title}
                  </h3>
                </div>
              </div>
            </div>

            <CardContent className="p-4">
              <p className="text-slate-600 text-sm line-clamp-2 mb-4">
                {area.description}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenDialog(area)}
                    data-testid={`edit-area-${index}`}
                  >
                    <Pencil className="w-4 h-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleActive(area)}
                    data-testid={`toggle-area-${index}`}
                  >
                    {area.is_active ? (
                      <>
                        <EyeOff className="w-4 h-4 mr-1" />
                        Desativar
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4 mr-1" />
                        Ativar
                      </>
                    )}
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={() => handleDelete(area.id)}
                  data-testid={`delete-area-${index}`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {areas.length === 0 && (
        <div className="text-center py-12 bg-white rounded-sm shadow-sm">
          <Globe className="w-12 h-12 mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500">Nenhuma área cadastrada ainda.</p>
          <Button
            onClick={() => handleOpenDialog()}
            className="mt-4 bg-[#1E3A8A]"
          >
            Criar primeira área
          </Button>
        </div>
      )}

      {/* Edit/Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-['Oswald'] text-xl uppercase">
              {editingArea ? "Editar Área" : "Nova Área de Atuação"}
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
                placeholder="Ex: Rochas Ornamentais"
                className="rounded-sm"
                data-testid="area-title-input"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Descrição *
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Descreva esta área de atuação..."
                className="rounded-sm min-h-[100px]"
                maxLength={500}
                data-testid="area-description-input"
              />
              <p className="text-xs text-slate-400 mt-1">
                {formData.description.length}/500 caracteres
              </p>
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                URL da Imagem
              </label>
              <Input
                value={formData.image_url}
                onChange={(e) =>
                  setFormData({ ...formData, image_url: e.target.value })
                }
                placeholder="https://..."
                className="rounded-sm"
                data-testid="area-image-input"
              />
              {formData.image_url && (
                <img
                  src={formData.image_url}
                  alt="Preview"
                  className="mt-2 h-32 w-full object-cover rounded-sm"
                />
              )}
            </div>

            {/* Icon */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Ícone
              </label>
              <Select
                value={formData.icon}
                onValueChange={(value) =>
                  setFormData({ ...formData, icon: value })
                }
              >
                <SelectTrigger className="rounded-sm" data-testid="area-icon-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {iconOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div className="flex items-center gap-2">
                        <opt.icon className="w-4 h-4" />
                        {opt.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Is Specialty */}
            <div className="flex items-center justify-between p-4 bg-amber-50 rounded-sm border border-amber-200">
              <div>
                <p className="font-medium text-slate-900">
                  Marcar como Especialidade
                </p>
                <p className="text-sm text-slate-500">
                  Destaca esta área com badge dourado
                </p>
              </div>
              <Switch
                checked={formData.is_specialty}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_specialty: checked })
                }
                data-testid="area-specialty-switch"
              />
            </div>

            {/* Badge Text (if not specialty) */}
            {!formData.is_specialty && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Texto do Badge
                </label>
                <Input
                  value={formData.badge_text}
                  onChange={(e) =>
                    setFormData({ ...formData, badge_text: e.target.value })
                  }
                  placeholder="Setor"
                  className="rounded-sm"
                  data-testid="area-badge-input"
                />
              </div>
            )}

            {/* Button Text */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Texto do Botão
                </label>
                <Input
                  value={formData.button_text}
                  onChange={(e) =>
                    setFormData({ ...formData, button_text: e.target.value })
                  }
                  placeholder="Saiba Mais"
                  className="rounded-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Link do Botão
                </label>
                <Input
                  value={formData.button_link}
                  onChange={(e) =>
                    setFormData({ ...formData, button_link: e.target.value })
                  }
                  placeholder="/contato"
                  className="rounded-sm"
                />
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
              data-testid="save-area-btn"
            >
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
