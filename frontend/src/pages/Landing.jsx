import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Users,
  Clock,
  Shield,
  Wheat,
  Gem,
  ShoppingCart,
  Bike,
  MapPin,
  Phone,
  Mail,
  Linkedin,
  Instagram,
  Facebook,
  MessageCircle,
  Menu,
  X,
  ArrowRight,
  ChevronRight,
} from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const iconMap = {
  Users: Users,
  Clock: Clock,
  Shield: Shield,
  Wheat: Wheat,
  Gem: Gem,
  ShoppingCart: ShoppingCart,
  Bike: Bike,
};

export default function Landing() {
  const [settings, setSettings] = useState(null);
  const [areas, setAreas] = useState([]);
  const [blogPosts, setBlogPosts] = useState([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [animatedStats, setAnimatedStats] = useState({});
  const statsRef = useRef(null);
  const [statsVisible, setStatsVisible] = useState(false);

  useEffect(() => {
    fetchData();
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Stats animation observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !statsVisible) {
          setStatsVisible(true);
        }
      },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, [statsVisible]);

  // Animate stats when visible
  useEffect(() => {
    if (statsVisible && settings?.stats) {
      settings.stats.forEach((stat, index) => {
        const numValue = parseInt(stat.value.replace(/\D/g, "")) || 0;
        let current = 0;
        const increment = Math.ceil(numValue / 50);
        const timer = setInterval(() => {
          current += increment;
          if (current >= numValue) {
            current = numValue;
            clearInterval(timer);
          }
          setAnimatedStats((prev) => ({ ...prev, [index]: current }));
        }, 30);
      });
    }
  }, [statsVisible, settings?.stats]);

  const fetchData = async () => {
    try {
      const [settingsRes, areasRes, blogRes] = await Promise.all([
        axios.get(`${API}/settings`),
        axios.get(`${API}/areas`),
        axios.get(`${API}/blog?published_only=true`),
      ]);
      setSettings(settingsRes.data);
      setAreas(areasRes.data.filter((a) => a.is_active !== false));
      setBlogPosts(blogRes.data.slice(0, 3));
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post(`${API}/contact`, formData);
      toast.success("Mensagem enviada com sucesso! Entraremos em contato em breve.");
      setFormData({ name: "", email: "", phone: "", company: "", message: "" });
    } catch (error) {
      toast.error("Erro ao enviar mensagem. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  const getIcon = (iconName) => {
    const IconComponent = iconMap[iconName];
    return IconComponent ? <IconComponent className="w-8 h-8" /> : null;
  };

  if (!settings) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-[#1E3A8A] rounded-sm"></div>
          <p className="text-slate-500 font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav
        data-testid="main-navbar"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? "bg-white shadow-md py-3" : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <img
              src={settings.logo_url}
              alt="Star Trade"
              className="h-10 md:h-12 object-contain"
              data-testid="logo"
            />
          </a>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {["Home", "Quem Somos", "Áreas de Atuação", "Blog", "Contato"].map(
              (item) => (
                <button
                  key={item}
                  onClick={() =>
                    scrollToSection(item.toLowerCase().replace(/ /g, "-"))
                  }
                  className={`nav-link uppercase text-sm tracking-wider font-medium transition-colors ${
                    isScrolled ? "text-slate-700 hover:text-[#1E3A8A]" : "text-white hover:text-white/80"
                  }`}
                  data-testid={`nav-${item.toLowerCase().replace(/ /g, "-")}`}
                >
                  {item}
                </button>
              )
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="mobile-menu-btn"
          >
            {mobileMenuOpen ? (
              <X className={isScrolled ? "text-slate-700" : "text-white"} />
            ) : (
              <Menu className={isScrolled ? "text-slate-700" : "text-white"} />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg py-4">
            {["Home", "Quem Somos", "Áreas de Atuação", "Blog", "Contato"].map(
              (item) => (
                <button
                  key={item}
                  onClick={() =>
                    scrollToSection(item.toLowerCase().replace(/ /g, "-"))
                  }
                  className="block w-full text-left px-6 py-3 text-slate-700 hover:bg-slate-50 uppercase text-sm tracking-wider font-medium"
                >
                  {item}
                </button>
              )
            )}
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section
        id="home"
        className="relative min-h-screen flex items-center justify-center video-container"
        data-testid="hero-section"
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          poster="https://images.unsplash.com/photo-1524522173746-f628baad3644?w=1920&auto=format&fit=crop"
        >
          <source src={settings.hero.video_url} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70"></div>
        
        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          <h1
            className="font-['Oswald'] text-4xl md:text-6xl lg:text-7xl font-bold text-white uppercase tracking-tight mb-6 animate-fadeInUp"
            data-testid="hero-title"
          >
            {settings.hero.title}
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto animate-fadeInUp delay-200">
            {settings.hero.subtitle}
          </p>
          <Button
            onClick={() => scrollToSection("contato")}
            className="bg-[#1E3A8A] hover:bg-[#172554] text-white px-10 py-6 text-base uppercase tracking-wider rounded-sm animate-fadeInUp delay-300"
            data-testid="hero-cta"
          >
            {settings.hero.cta_text}
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center pt-2">
            <div className="w-1 h-2 bg-white/70 rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Differentials Section */}
      <section className="py-20 md:py-28 bg-white" data-testid="differentials-section">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {settings.differentials.map((diff, index) => (
              <div
                key={diff.id}
                className="text-center p-8 border border-slate-100 hover:border-[#1E3A8A]/20 hover:shadow-xl transition-all duration-500 card-hover"
                data-testid={`differential-${index}`}
              >
                <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center text-[#1E3A8A] bg-[#1E3A8A]/5 rounded-sm">
                  {getIcon(diff.icon)}
                </div>
                <h3 className="font-['Oswald'] text-xl font-semibold text-slate-900 uppercase tracking-wide mb-3">
                  {diff.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">{diff.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section
        id="quem-somos"
        className="py-20 md:py-28 bg-slate-50"
        data-testid="about-section"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <p className="text-sm font-medium tracking-widest uppercase text-[#1E3A8A] mb-4">
                Conheça nossa empresa
              </p>
              <h2 className="font-['Oswald'] text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 uppercase tracking-tight mb-8">
                {settings.about.title}
              </h2>
              <p className="text-slate-600 text-lg leading-relaxed mb-6">
                {settings.about.paragraph1}
              </p>
              <p className="text-slate-600 text-lg leading-relaxed mb-8">
                {settings.about.paragraph2}
              </p>
              <Button
                onClick={() => scrollToSection("contato")}
                variant="outline"
                className="border-[#1E3A8A] text-[#1E3A8A] hover:bg-[#1E3A8A] hover:text-white px-8 py-6 uppercase tracking-wider rounded-sm"
                data-testid="about-cta"
              >
                Entre em Contato
                <ChevronRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
            <div className="relative">
              <img
                src={settings.about.image_url}
                alt="Star Trade"
                className="w-full h-[400px] lg:h-[500px] object-cover"
              />
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-[#1E3A8A] hidden lg:block"></div>
              <div className="absolute -top-6 -right-6 w-32 h-32 border-4 border-[#D4AF37] hidden lg:block"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Areas Section */}
      <section
        id="áreas-de-atuação"
        className="py-20 md:py-28 bg-white"
        data-testid="areas-section"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-medium tracking-widest uppercase text-[#1E3A8A] mb-4">
              Especialistas em segmentos estratégicos
            </p>
            <h2 className="font-['Oswald'] text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 uppercase tracking-tight">
              Áreas de Atuação
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {areas.map((area, index) => (
              <div
                key={area.id}
                className="area-card relative h-[400px] overflow-hidden group cursor-pointer"
                data-testid={`area-card-${index}`}
              >
                <img
                  src={area.image_url}
                  alt={area.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                <div
                  className="overlay"
                  style={{ backgroundColor: area.overlay_color }}
                ></div>

                <div className="content absolute inset-0 p-8 flex flex-col justify-end">
                  {/* Badge */}
                  <span
                    className={`inline-block w-fit px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-sm mb-4 ${
                      area.is_specialty
                        ? "bg-[#D4AF37] text-white shadow-lg"
                        : "bg-[#1E3A8A] text-white"
                    }`}
                    data-testid={`area-badge-${index}`}
                  >
                    {area.badge_text}
                  </span>

                  {/* Icon & Title */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 flex items-center justify-center text-white bg-white/20 rounded-sm backdrop-blur-sm">
                      {getIcon(area.icon)}
                    </div>
                    <h3 className="font-['Oswald'] text-2xl md:text-3xl font-bold text-white uppercase tracking-wide">
                      {area.title}
                    </h3>
                  </div>

                  {/* Description */}
                  <p className="text-white/90 leading-relaxed mb-6 line-clamp-3">
                    {area.description}
                  </p>

                  {/* Button */}
                  <Button
                    className="w-fit bg-white text-[#1E3A8A] hover:bg-[#1E3A8A] hover:text-white px-6 py-3 uppercase tracking-wider rounded-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    data-testid={`area-btn-${index}`}
                  >
                    {area.button_text}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section
        ref={statsRef}
        className="py-20 md:py-28 relative overflow-hidden"
        data-testid="stats-section"
      >
        <div
          className="absolute inset-0 bg-cover bg-center bg-fixed"
          style={{
            backgroundImage:
              'url("https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=1920")',
          }}
        ></div>
        <div className="absolute inset-0 bg-[#0F172A]/90"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {settings.stats.map((stat, index) => (
              <div key={stat.id} className="text-center" data-testid={`stat-${index}`}>
                <div className="stat-number text-white mb-2">
                  {statsVisible
                    ? `${animatedStats[index] || 0}${stat.value.includes("+") ? "+" : ""}`
                    : "0"}
                </div>
                <p className="text-white/70 uppercase tracking-wider text-sm font-medium">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section
        id="blog"
        className="py-20 md:py-28 bg-slate-50"
        data-testid="blog-section"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-medium tracking-widest uppercase text-[#1E3A8A] mb-4">
              Fique por dentro
            </p>
            <h2 className="font-['Oswald'] text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 uppercase tracking-tight">
              Blog & Notícias
            </h2>
          </div>

          {blogPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {blogPosts.map((post, index) => (
                <a
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="blog-card bg-white overflow-hidden shadow-sm hover:shadow-xl"
                  data-testid={`blog-card-${index}`}
                >
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={
                        post.cover_image ||
                        "https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=600"
                      }
                      alt={post.title}
                      className="blog-image w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <p className="text-sm text-[#1E3A8A] font-medium mb-2">
                      {new Date(post.created_at).toLocaleDateString("pt-BR")}
                    </p>
                    <h3 className="font-['Oswald'] text-xl font-semibold text-slate-900 uppercase tracking-wide mb-3 line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-slate-600 line-clamp-3 mb-4">{post.excerpt}</p>
                    <span className="text-[#1E3A8A] font-medium uppercase text-sm tracking-wider inline-flex items-center">
                      Leia Mais
                      <ChevronRight className="ml-1 w-4 h-4" />
                    </span>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-500">Em breve, novidades no blog.</p>
            </div>
          )}

          {blogPosts.length > 0 && (
            <div className="text-center mt-12">
              <Button
                asChild
                variant="outline"
                className="border-[#1E3A8A] text-[#1E3A8A] hover:bg-[#1E3A8A] hover:text-white px-8 py-6 uppercase tracking-wider rounded-sm"
              >
                <a href="/blog" data-testid="blog-view-all">
                  Ver Todas as Notícias
                  <ArrowRight className="ml-2 w-4 h-4" />
                </a>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section
        id="contato"
        className="py-20 md:py-28 bg-white"
        data-testid="contact-section"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-medium tracking-widest uppercase text-[#1E3A8A] mb-4">
              Fale conosco
            </p>
            <h2 className="font-['Oswald'] text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 uppercase tracking-tight">
              Entre em Contato
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6" data-testid="contact-form">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Nome *
                  </label>
                  <Input
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="rounded-sm border-slate-200 focus:border-[#1E3A8A] h-12"
                    placeholder="Seu nome"
                    data-testid="contact-name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email *
                  </label>
                  <Input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="rounded-sm border-slate-200 focus:border-[#1E3A8A] h-12"
                    placeholder="seu@email.com"
                    data-testid="contact-email"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Telefone
                  </label>
                  <Input
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="rounded-sm border-slate-200 focus:border-[#1E3A8A] h-12"
                    placeholder="(11) 99999-9999"
                    data-testid="contact-phone"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Empresa
                  </label>
                  <Input
                    value={formData.company}
                    onChange={(e) =>
                      setFormData({ ...formData, company: e.target.value })
                    }
                    className="rounded-sm border-slate-200 focus:border-[#1E3A8A] h-12"
                    placeholder="Nome da empresa"
                    data-testid="contact-company"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Mensagem *
                </label>
                <Textarea
                  required
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  className="rounded-sm border-slate-200 focus:border-[#1E3A8A] min-h-[150px]"
                  placeholder="Como podemos ajudar?"
                  data-testid="contact-message"
                />
              </div>
              <Button
                type="submit"
                disabled={submitting}
                className="w-full md:w-auto bg-[#1E3A8A] hover:bg-[#172554] text-white px-10 py-6 uppercase tracking-wider rounded-sm"
                data-testid="contact-submit"
              >
                {submitting ? "Enviando..." : "Enviar Mensagem"}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </form>

            {/* Contact Info */}
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 flex items-center justify-center bg-[#1E3A8A]/5 text-[#1E3A8A] rounded-sm flex-shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">Endereço</h4>
                  <p className="text-slate-600">{settings.contact.address}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 flex items-center justify-center bg-[#1E3A8A]/5 text-[#1E3A8A] rounded-sm flex-shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">Telefone</h4>
                  <p className="text-slate-600">{settings.contact.phone}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 flex items-center justify-center bg-[#1E3A8A]/5 text-[#1E3A8A] rounded-sm flex-shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">Email</h4>
                  <p className="text-slate-600">{settings.contact.email}</p>
                </div>
              </div>

              {/* Social Links */}
              <div className="pt-6 border-t border-slate-200">
                <h4 className="font-semibold text-slate-900 mb-4">
                  Siga-nos nas Redes Sociais
                </h4>
                <div className="flex gap-4">
                  {settings.contact.linkedin && (
                    <a
                      href={settings.contact.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 flex items-center justify-center bg-[#1E3A8A] text-white rounded-sm hover:bg-[#172554] transition-colors"
                      data-testid="social-linkedin"
                    >
                      <Linkedin className="w-5 h-5" />
                    </a>
                  )}
                  {settings.contact.instagram && (
                    <a
                      href={settings.contact.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 flex items-center justify-center bg-[#1E3A8A] text-white rounded-sm hover:bg-[#172554] transition-colors"
                      data-testid="social-instagram"
                    >
                      <Instagram className="w-5 h-5" />
                    </a>
                  )}
                  {settings.contact.facebook && (
                    <a
                      href={settings.contact.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 flex items-center justify-center bg-[#1E3A8A] text-white rounded-sm hover:bg-[#172554] transition-colors"
                      data-testid="social-facebook"
                    >
                      <Facebook className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0F172A] text-white py-16" data-testid="footer">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            {/* Logo & Description */}
            <div>
              <img
                src={settings.logo_url}
                alt="Star Trade"
                className="h-12 mb-6 brightness-0 invert"
              />
              <p className="text-slate-400 leading-relaxed">
                Trading company especializada em soluções completas de importação e
                exportação, conectando empresas ao mercado global.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-['Oswald'] text-lg font-semibold uppercase tracking-wider mb-6">
                Links Rápidos
              </h4>
              <ul className="space-y-3">
                {["Home", "Quem Somos", "Áreas de Atuação", "Blog", "Contato"].map(
                  (item) => (
                    <li key={item}>
                      <button
                        onClick={() =>
                          scrollToSection(item.toLowerCase().replace(/ /g, "-"))
                        }
                        className="text-slate-400 hover:text-white transition-colors"
                      >
                        {item}
                      </button>
                    </li>
                  )
                )}
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="font-['Oswald'] text-lg font-semibold uppercase tracking-wider mb-6">
                Newsletter
              </h4>
              <p className="text-slate-400 mb-4">
                Receba novidades sobre comércio exterior.
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="Seu email"
                  className="bg-white/10 border-white/20 text-white placeholder:text-slate-500 rounded-sm"
                />
                <Button className="bg-[#1E3A8A] hover:bg-[#172554] rounded-sm px-6">
                  Assinar
                </Button>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-400 text-sm">
              © 2026 Star Trade. Todos os direitos reservados.
            </p>
            <div className="flex gap-4">
              {settings.contact.linkedin && (
                <a
                  href={settings.contact.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
              )}
              {settings.contact.instagram && (
                <a
                  href={settings.contact.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {settings.contact.facebook && (
                <a
                  href={settings.contact.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <Facebook className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>
        </div>
      </footer>

      {/* WhatsApp Button */}
      {settings.contact.whatsapp && (
        <a
          href={`https://wa.me/${settings.contact.whatsapp.replace(/\D/g, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-green-600 transition-colors whatsapp-pulse"
          data-testid="whatsapp-button"
        >
          <MessageCircle className="w-7 h-7" />
        </a>
      )}
    </div>
  );
}
