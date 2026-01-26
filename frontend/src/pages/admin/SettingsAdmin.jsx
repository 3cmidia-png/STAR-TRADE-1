import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
      setSettings(response.data);
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

        {/* Hero Tab */}
        <TabsContent value="hero">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Seção Hero</CardTitle>
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
                  data-testid="hero-subtitle-input"
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
              <CardTitle className="text-lg">Aparência</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  URL do Logo
                </label>
                <Input
                  value={settings.logo_url}
                  onChange={(e) => updateField("logo_url", e.target.value)}
                  className="rounded-sm"
                  placeholder="https://..."
                  data-testid="logo-url-input"
                />
                {settings.logo_url && (
                  <img
                    src={settings.logo_url}
                    alt="Logo Preview"
                    className="mt-2 h-16 object-contain"
                  />
                )}
              </div>

              <div className="border-t pt-6">
                <p className="font-medium text-slate-900 mb-4">Cores</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">
                      Primária
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
                      Secundária (Dourado)
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
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
