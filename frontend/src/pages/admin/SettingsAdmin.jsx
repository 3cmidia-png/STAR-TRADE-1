import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Save,
  Image,
  Type,
  Video,
  Users,
  BarChart3,
  Phone,
  Palette,
  Move,
  Maximize,
  Globe,
} from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function SettingsAdmin() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API}/settings`);
      // Ensure logo_settings exists
      const data = response.data;
      if (!data.logo_settings) {
        data.logo_settings = {
          desktop_width: 180,
          desktop_height: 0,
          tablet_width: 150,
          mobile_width: 120,
          position: "left",
          margin_left: 24,
          margin_right: 24,
          shrink_on_scroll: true,
          scroll_width: 120,
          brightness: 100,
          hover_effect: "none",
        };
      }
      // Ensure hero has all new fields
      if (!data.hero.vertical_align) {
        data.hero = {
          ...data.hero,
          vertical_align: "center",
          vertical_offset: 0,
          horizontal_align: "center",
          title_size: 48,
          title_weight: "bold",
          title_uppercase: true,
          title_max_width: 800,
          subtitle_size: 20,
          subtitle_weight: "normal",
          subtitle_max_width: 700,
          cta_size: "large",
          cta_style: "filled",
          overlay_opacity: 60,
          overlay_color: "#000000",
          video_zoom: 100,
          animation_enabled: true,
          animation_type: "fade-up",
        };
      }
      setSettings(data);
    } catch (error) {
      toast.error("Erro ao carregar configurações");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API}/settings`, settings, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Configurações salvas!");
    } catch (error) {
      toast.error("Erro ao salvar configurações");
    } finally {
      setSaving(false);
    }
  };

  const updateField = (path, value) => {
    const keys = path.split(".");
    setSettings((prev) => {
      const newSettings = { ...prev };
      let current = newSettings;
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newSettings;
    });
  };

  const updateDifferential = (index, field, value) => {
    setSettings((prev) => {
      const newDifferentials = [...prev.differentials];
      newDifferentials[index] = { ...newDifferentials[index], [field]: value };
      return { ...prev, differentials: newDifferentials };
    });
  };

  const updateStat = (index, field, value) => {
    setSettings((prev) => {
      const newStats = [...prev.stats];
      newStats[index] = { ...newStats[index], [field]: value };
      return { ...prev, stats: newStats };
    });
  };

  if (loading || !settings) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-slate-500">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="settings-admin-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-['Oswald'] text-2xl md:text-3xl font-bold text-slate-900 uppercase tracking-tight">
            Configurações
          </h1>
          <p className="text-slate-500 mt-1">
            Personalize seu site Star Trade
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#1E3A8A] hover:bg-[#172554] rounded-sm"
          data-testid="save-settings-btn"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="hero" className="space-y-6">
        <TabsList className="bg-white border p-1 h-auto flex-wrap">
          <TabsTrigger value="hero" className="gap-2">
            <Video className="w-4 h-4" />
            Hero
          </TabsTrigger>
          <TabsTrigger value="logo" className="gap-2">
            <Image className="w-4 h-4" />
            Logo
          </TabsTrigger>
          <TabsTrigger value="about" className="gap-2">
            <Users className="w-4 h-4" />
            Quem Somos
          </TabsTrigger>
          <TabsTrigger value="differentials" className="gap-2">
            <Type className="w-4 h-4" />
            Diferenciais
          </TabsTrigger>
          <TabsTrigger value="stats" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            Estatísticas
          </TabsTrigger>
          <TabsTrigger value="contact" className="gap-2">
            <Phone className="w-4 h-4" />
            Contato
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2">
            <Palette className="w-4 h-4" />
            Aparência
          </TabsTrigger>
        </TabsList>

        {/* Hero Tab - EXPANDED */}
        <TabsContent value="hero">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Content Settings */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Type className="w-5 h-5" />
                  Conteúdo do Hero
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Título Principal
                  </label>
                  <Input
                    value={settings.hero.title}
                    onChange={(e) => updateField("hero.title", e.target.value)}
                    className="rounded-sm"
                    data-testid="hero-title-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Subtítulo
                  </label>
                  <Input
                    value={settings.hero.subtitle}
                    onChange={(e) => updateField("hero.subtitle", e.target.value)}
                    className="rounded-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Texto do Botão CTA
                  </label>
                  <Input
                    value={settings.hero.cta_text}
                    onChange={(e) => updateField("hero.cta_text", e.target.value)}
                    className="rounded-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    URL do Vídeo (MP4)
                  </label>
                  <Input
                    value={settings.hero.video_url}
                    onChange={(e) => updateField("hero.video_url", e.target.value)}
                    className="rounded-sm"
                    placeholder="https://..."
                    data-testid="hero-video-input"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Positioning Settings */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Move className="w-5 h-5" />
                  Posicionamento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Alinhamento Vertical
                  </label>
                  <Select
                    value={settings.hero.vertical_align || "center"}
                    onValueChange={(v) => updateField("hero.vertical_align", v)}
                  >
                    <SelectTrigger className="rounded-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="top">Topo</SelectItem>
                      <SelectItem value="center">Centro</SelectItem>
                      <SelectItem value="bottom">Inferior</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Ajuste Fino Vertical: {settings.hero.vertical_offset || 0}px
                  </label>
                  <Slider
                    value={[settings.hero.vertical_offset || 0]}
                    onValueChange={([v]) => updateField("hero.vertical_offset", v)}
                    min={-200}
                    max={200}
                    step={10}
                    className="mt-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Alinhamento Horizontal
                  </label>
                  <Select
                    value={settings.hero.horizontal_align || "center"}
                    onValueChange={(v) => updateField("hero.horizontal_align", v)}
                  >
                    <SelectTrigger className="rounded-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">Esquerda</SelectItem>
                      <SelectItem value="center">Centro</SelectItem>
                      <SelectItem value="right">Direita</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Typography Settings */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Maximize className="w-5 h-5" />
                  Tamanhos e Estilos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Tamanho do Título: {settings.hero.title_size || 48}px
                  </label>
                  <Slider
                    value={[settings.hero.title_size || 48]}
                    onValueChange={([v]) => updateField("hero.title_size", v)}
                    min={24}
                    max={72}
                    step={2}
                    className="mt-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Peso do Título
                  </label>
                  <Select
                    value={settings.hero.title_weight || "bold"}
                    onValueChange={(v) => updateField("hero.title_weight", v)}
                  >
                    <SelectTrigger className="rounded-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="medium">Médio</SelectItem>
                      <SelectItem value="semibold">Semibold</SelectItem>
                      <SelectItem value="bold">Bold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">
                    Título em MAIÚSCULAS
                  </span>
                  <Switch
                    checked={settings.hero.title_uppercase !== false}
                    onCheckedChange={(v) => updateField("hero.title_uppercase", v)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Tamanho do Subtítulo: {settings.hero.subtitle_size || 20}px
                  </label>
                  <Slider
                    value={[settings.hero.subtitle_size || 20]}
                    onValueChange={([v]) => updateField("hero.subtitle_size", v)}
                    min={14}
                    max={32}
                    step={1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Tamanho do Botão CTA
                  </label>
                  <Select
                    value={settings.hero.cta_size || "large"}
                    onValueChange={(v) => updateField("hero.cta_size", v)}
                  >
                    <SelectTrigger className="rounded-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Pequeno</SelectItem>
                      <SelectItem value="medium">Médio</SelectItem>
                      <SelectItem value="large">Grande</SelectItem>
                      <SelectItem value="xlarge">Extra Grande</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Overlay/Video Settings */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Video className="w-5 h-5" />
                  Vídeo e Overlay
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Opacidade do Overlay: {settings.hero.overlay_opacity || 60}%
                  </label>
                  <Slider
                    value={[settings.hero.overlay_opacity || 60]}
                    onValueChange={([v]) => updateField("hero.overlay_opacity", v)}
                    min={0}
                    max={100}
                    step={5}
                    className="mt-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Cor do Overlay
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={settings.hero.overlay_color || "#000000"}
                      onChange={(e) => updateField("hero.overlay_color", e.target.value)}
                      className="w-10 h-10 rounded-sm cursor-pointer"
                    />
                    <Input
                      value={settings.hero.overlay_color || "#000000"}
                      onChange={(e) => updateField("hero.overlay_color", e.target.value)}
                      className="rounded-sm flex-1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Zoom do Vídeo: {settings.hero.video_zoom || 100}%
                  </label>
                  <Slider
                    value={[settings.hero.video_zoom || 100]}
                    onValueChange={([v]) => updateField("hero.video_zoom", v)}
                    min={100}
                    max={150}
                    step={5}
                    className="mt-2"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">
                    Animação de Entrada
                  </span>
                  <Switch
                    checked={settings.hero.animation_enabled !== false}
                    onCheckedChange={(v) => updateField("hero.animation_enabled", v)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Logo Tab - NEW */}
        <TabsContent value="logo">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Logo Upload */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Upload de Logo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    URL do Logo Principal
                  </label>
                  <Input
                    value={settings.logo_url}
                    onChange={(e) => updateField("logo_url", e.target.value)}
                    className="rounded-sm"
                    placeholder="https://..."
                    data-testid="logo-url-input"
                  />
                  {settings.logo_url && (
                    <div className="mt-4 p-4 bg-slate-100 rounded-sm">
                      <img
                        src={settings.logo_url}
                        alt="Logo Preview"
                        className="max-h-20 object-contain"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Logo Alternativa (fundo claro)
                  </label>
                  <Input
                    value={settings.logo_dark_url || ""}
                    onChange={(e) => updateField("logo_dark_url", e.target.value)}
                    className="rounded-sm"
                    placeholder="https://..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Logo Sizing */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Maximize className="w-5 h-5" />
                  Tamanho da Logo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Largura Desktop: {settings.logo_settings?.desktop_width || 180}px
                  </label>
                  <Slider
                    value={[settings.logo_settings?.desktop_width || 180]}
                    onValueChange={([v]) => updateField("logo_settings.desktop_width", v)}
                    min={50}
                    max={400}
                    step={10}
                    className="mt-2"
                  />
                  <div className="flex justify-between text-xs text-slate-400 mt-1">
                    <span>50px</span>
                    <span>400px</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Largura Tablet: {settings.logo_settings?.tablet_width || 150}px
                  </label>
                  <Slider
                    value={[settings.logo_settings?.tablet_width || 150]}
                    onValueChange={([v]) => updateField("logo_settings.tablet_width", v)}
                    min={50}
                    max={300}
                    step={10}
                    className="mt-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Largura Mobile: {settings.logo_settings?.mobile_width || 120}px
                  </label>
                  <Slider
                    value={[settings.logo_settings?.mobile_width || 120]}
                    onValueChange={([v]) => updateField("logo_settings.mobile_width", v)}
                    min={40}
                    max={200}
                    step={10}
                    className="mt-2"
                  />
                </div>

                {/* Quick Presets */}
                <div className="pt-4 border-t">
                  <p className="text-sm font-medium text-slate-700 mb-3">Presets Rápidos</p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        updateField("logo_settings.desktop_width", 120);
                        updateField("logo_settings.tablet_width", 100);
                        updateField("logo_settings.mobile_width", 80);
                      }}
                    >
                      Pequena
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        updateField("logo_settings.desktop_width", 180);
                        updateField("logo_settings.tablet_width", 150);
                        updateField("logo_settings.mobile_width", 120);
                      }}
                    >
                      Média
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        updateField("logo_settings.desktop_width", 250);
                        updateField("logo_settings.tablet_width", 200);
                        updateField("logo_settings.mobile_width", 160);
                      }}
                    >
                      Grande
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        updateField("logo_settings.desktop_width", 350);
                        updateField("logo_settings.tablet_width", 280);
                        updateField("logo_settings.mobile_width", 180);
                      }}
                    >
                      Extra Grande
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Scroll Behavior */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Comportamento ao Scroll</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900">Reduzir ao Rolar</p>
                    <p className="text-sm text-slate-500">Logo diminui quando rola a página</p>
                  </div>
                  <Switch
                    checked={settings.logo_settings?.shrink_on_scroll !== false}
                    onCheckedChange={(v) => updateField("logo_settings.shrink_on_scroll", v)}
                  />
                </div>

                {settings.logo_settings?.shrink_on_scroll !== false && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Largura Após Scroll: {settings.logo_settings?.scroll_width || 120}px
                    </label>
                    <Slider
                      value={[settings.logo_settings?.scroll_width || 120]}
                      onValueChange={([v]) => updateField("logo_settings.scroll_width", v)}
                      min={50}
                      max={200}
                      step={10}
                      className="mt-2"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Effects */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Efeitos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Brilho: {settings.logo_settings?.brightness || 100}%
                  </label>
                  <Slider
                    value={[settings.logo_settings?.brightness || 100]}
                    onValueChange={([v]) => updateField("logo_settings.brightness", v)}
                    min={50}
                    max={150}
                    step={5}
                    className="mt-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Efeito ao Hover
                  </label>
                  <Select
                    value={settings.logo_settings?.hover_effect || "none"}
                    onValueChange={(v) => updateField("logo_settings.hover_effect", v)}
                  >
                    <SelectTrigger className="rounded-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum</SelectItem>
                      <SelectItem value="grow">Crescer</SelectItem>
                      <SelectItem value="glow">Brilhar</SelectItem>
                      <SelectItem value="rotate">Rotação Suave</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* About Tab */}
        <TabsContent value="about">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Seção Quem Somos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Título
                </label>
                <Input
                  value={settings.about.title}
                  onChange={(e) => updateField("about.title", e.target.value)}
                  className="rounded-sm"
                  data-testid="about-title-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Parágrafo 1
                </label>
                <Textarea
                  value={settings.about.paragraph1}
                  onChange={(e) =>
                    updateField("about.paragraph1", e.target.value)
                  }
                  className="rounded-sm min-h-[100px]"
                  data-testid="about-p1-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Parágrafo 2
                </label>
                <Textarea
                  value={settings.about.paragraph2}
                  onChange={(e) =>
                    updateField("about.paragraph2", e.target.value)
                  }
                  className="rounded-sm min-h-[100px]"
                  data-testid="about-p2-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  URL da Imagem
                </label>
                <Input
                  value={settings.about.image_url}
                  onChange={(e) =>
                    updateField("about.image_url", e.target.value)
                  }
                  className="rounded-sm"
                  placeholder="https://..."
                />
                {settings.about.image_url && (
                  <img
                    src={settings.about.image_url}
                    alt="Preview"
                    className="mt-2 h-32 w-full object-cover rounded-sm"
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Differentials Tab */}
        <TabsContent value="differentials">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Cards de Diferenciais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {settings.differentials.map((diff, index) => (
                <div
                  key={diff.id}
                  className="p-4 border border-slate-200 rounded-sm space-y-4"
                >
                  <p className="font-medium text-slate-900">
                    Diferencial {index + 1}
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-slate-600 mb-1">
                        Ícone
                      </label>
                      <Input
                        value={diff.icon}
                        onChange={(e) =>
                          updateDifferential(index, "icon", e.target.value)
                        }
                        className="rounded-sm"
                        placeholder="Users, Clock, Shield..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-600 mb-1">
                        Título
                      </label>
                      <Input
                        value={diff.title}
                        onChange={(e) =>
                          updateDifferential(index, "title", e.target.value)
                        }
                        className="rounded-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">
                      Descrição
                    </label>
                    <Textarea
                      value={diff.description}
                      onChange={(e) =>
                        updateDifferential(index, "description", e.target.value)
                      }
                      className="rounded-sm"
                      rows={2}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stats Tab */}
        <TabsContent value="stats">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Estatísticas/Números</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {settings.stats.map((stat, index) => (
                <div
                  key={stat.id}
                  className="p-4 border border-slate-200 rounded-sm"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-slate-600 mb-1">
                        Valor (ex: 500+)
                      </label>
                      <Input
                        value={stat.value}
                        onChange={(e) =>
                          updateStat(index, "value", e.target.value)
                        }
                        className="rounded-sm"
                        data-testid={`stat-value-${index}`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-600 mb-1">
                        Label
                      </label>
                      <Input
                        value={stat.label}
                        onChange={(e) =>
                          updateStat(index, "label", e.target.value)
                        }
                        className="rounded-sm"
                        data-testid={`stat-label-${index}`}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Tab */}
        <TabsContent value="contact">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Informações de Contato</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Endereço
                  </label>
                  <Input
                    value={settings.contact.address}
                    onChange={(e) =>
                      updateField("contact.address", e.target.value)
                    }
                    className="rounded-sm"
                    data-testid="contact-address-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Telefone
                  </label>
                  <Input
                    value={settings.contact.phone}
                    onChange={(e) =>
                      updateField("contact.phone", e.target.value)
                    }
                    className="rounded-sm"
                    data-testid="contact-phone-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email
                  </label>
                  <Input
                    value={settings.contact.email}
                    onChange={(e) =>
                      updateField("contact.email", e.target.value)
                    }
                    className="rounded-sm"
                    data-testid="contact-email-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    WhatsApp (com código do país)
                  </label>
                  <Input
                    value={settings.contact.whatsapp}
                    onChange={(e) =>
                      updateField("contact.whatsapp", e.target.value)
                    }
                    className="rounded-sm"
                    placeholder="+5511999999999"
                    data-testid="contact-whatsapp-input"
                  />
                </div>
              </div>

              <div className="border-t pt-6">
                <p className="font-medium text-slate-900 mb-4">Redes Sociais</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">
                      LinkedIn
                    </label>
                    <Input
                      value={settings.contact.linkedin}
                      onChange={(e) =>
                        updateField("contact.linkedin", e.target.value)
                      }
                      className="rounded-sm"
                      placeholder="https://linkedin.com/..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">
                      Instagram
                    </label>
                    <Input
                      value={settings.contact.instagram}
                      onChange={(e) =>
                        updateField("contact.instagram", e.target.value)
                      }
                      className="rounded-sm"
                      placeholder="https://instagram.com/..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">
                      Facebook
                    </label>
                    <Input
                      value={settings.contact.facebook}
                      onChange={(e) =>
                        updateField("contact.facebook", e.target.value)
                      }
                      className="rounded-sm"
                      placeholder="https://facebook.com/..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">
                      YouTube
                    </label>
                    <Input
                      value={settings.contact.youtube}
                      onChange={(e) =>
                        updateField("contact.youtube", e.target.value)
                      }
                      className="rounded-sm"
                      placeholder="https://youtube.com/..."
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Cores e Aparência</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm text-slate-600 mb-1">
                    Cor Primária
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={settings.colors.primary}
                      onChange={(e) =>
                        updateField("colors.primary", e.target.value)
                      }
                      className="w-10 h-10 rounded-sm cursor-pointer"
                    />
                    <Input
                      value={settings.colors.primary}
                      onChange={(e) =>
                        updateField("colors.primary", e.target.value)
                      }
                      className="rounded-sm flex-1"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1">
                    Cor Secundária (Dourado)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={settings.colors.secondary}
                      onChange={(e) =>
                        updateField("colors.secondary", e.target.value)
                      }
                      className="w-10 h-10 rounded-sm cursor-pointer"
                    />
                    <Input
                      value={settings.colors.secondary}
                      onChange={(e) =>
                        updateField("colors.secondary", e.target.value)
                      }
                      className="rounded-sm flex-1"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <p className="font-medium text-slate-900 mb-4">Idioma Padrão</p>
                <Select
                  value={settings.default_language || "pt"}
                  onValueChange={(v) => updateField("default_language", v)}
                >
                  <SelectTrigger className="rounded-sm w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt">🇧🇷 Português</SelectItem>
                    <SelectItem value="en">🇺🇸 English</SelectItem>
                    <SelectItem value="es">🇪🇸 Español</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
