import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
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
  Globe,
  ChevronDown,
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

const flagEmoji = {
  pt: "🇧🇷",
  en: "🇺🇸",
  es: "🇪🇸",
};

const langNames = {
  pt: "Português",
  en: "English",
  es: "Español",
};

export default function Landing() {
  const { t, i18n } = useTranslation();
  const [settings, setSettings] = useState(null);
  const [areas, setAreas] = useState([]);
  const [blogPosts, setBlogPosts] = useState([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
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

  const currentLang = i18n.language?.substring(0, 2) || "pt";

  // Helper to get translated text from settings
  const getText = (field) => {
    if (!field) return "";
    if (typeof field === "string") return field;
    return field[currentLang] || field.pt || "";
  };

  useEffect(() => {
    fetchData();
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
      toast.success(t("contact.success"));
      setFormData({ name: "", email: "", phone: "", company: "", message: "" });
    } catch (error) {
      toast.error(t("contact.error"));
    } finally {
      setSubmitting(false);
    }
  };

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    setLangMenuOpen(false);
  };

  const getIcon = (iconName) => {
    const IconComponent = iconMap[iconName];
    return IconComponent ? <IconComponent className="w-8 h-8" /> : null;
  };

  // Get hero styles from settings
  const getHeroStyles = () => {
    if (!settings?.hero) return {};
    const h = settings.hero;
    
    const verticalPosition = {
      top: "items-start pt-32",
      center: "items-center",
      bottom: "items-end pb-32",
    };

    const horizontalAlign = {
      left: "text-left items-start",
      center: "text-center items-center",
      right: "text-right items-end",
    };

    return {
      container: `${verticalPosition[h.vertical_align] || "items-center"} ${horizontalAlign[h.horizontal_align] || "text-center items-center"}`,
      titleSize: `text-[${h.title_size || 48}px]`,
      titleStyle: {
        fontSize: `${h.title_size || 48}px`,
        fontWeight: h.title_weight === "bold" ? 700 : h.title_weight === "semibold" ? 600 : h.title_weight === "medium" ? 500 : 400,
        textTransform: h.title_uppercase ? "uppercase" : "none",
        maxWidth: `${h.title_max_width || 800}px`,
        marginTop: `${h.vertical_offset || 0}px`,
      },
      subtitleStyle: {
        fontSize: `${h.subtitle_size || 20}px`,
        fontWeight: h.subtitle_weight === "semibold" ? 600 : h.subtitle_weight === "medium" ? 500 : 400,
        maxWidth: `${h.subtitle_max_width || 700}px`,
      },
      overlayStyle: {
        backgroundColor: h.overlay_color || "#000000",
        opacity: (h.overlay_opacity || 60) / 100,
      },
      ctaSize: {
        small: "px-6 py-3 text-sm",
        medium: "px-8 py-4 text-base",
        large: "px-10 py-5 text-base",
        xlarge: "px-12 py-6 text-lg",
      }[h.cta_size || "large"],
    };
  };

  // Get logo styles from settings
  const getLogoStyles = () => {
    if (!settings?.logo_settings) {
      return { width: isScrolled ? 120 : 180 };
    }
    const l = settings.logo_settings;
    const baseWidth = l.desktop_width || 180;
    const scrollWidth = l.scroll_width || 120;
    
    return {
      width: l.shrink_on_scroll && isScrolled ? scrollWidth : baseWidth,
      filter: `brightness(${l.brightness || 100}%)`,
      transition: "all 0.3s ease",
    };
  };

  const navItems = [
    { key: "home", id: "home" },
    { key: "about", id: "quem-somos" },
    { key: "areas", id: "areas-de-atuacao" },
    { key: "blog", id: "blog" },
    { key: "contact", id: "contato" },
  ];

  if (!settings) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-[#1E3A8A] rounded-sm"></div>
          <p className="text-slate-500 font-medium">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  const heroStyles = getHeroStyles();
  const logoStyles = getLogoStyles();

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
              className="object-contain transition-all duration-300"
              style={{ height: logoStyles.width * 0.4, ...logoStyles }}
              data-testid="logo"
            />
          </a>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => scrollToSection(item.id)}
                className={`nav-link uppercase text-sm tracking-wider font-medium transition-colors ${
                  isScrolled ? "text-slate-700 hover:text-[#1E3A8A]" : "text-white hover:text-white/80"
                }`}
                data-testid={`nav-${item.key}`}
              >
                {t(`nav.${item.key}`)}
              </button>
            ))}

            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className={`flex items-center gap-2 px-3 py-2 rounded-sm transition-colors ${
                  isScrolled ? "text-slate-700 hover:bg-slate-100" : "text-white hover:bg-white/10"
                }`}
                data-testid="lang-selector"
              >
                <span className="text-lg">{flagEmoji[currentLang]}</span>
                <span className="text-sm uppercase">{currentLang}</span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {langMenuOpen && (
                <div className="absolute right-0 top-full mt-2 bg-white shadow-lg rounded-sm py-2 min-w-[150px]">
                  {Object.keys(flagEmoji).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => changeLanguage(lang)}
                      className={`w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-slate-50 ${
                        currentLang === lang ? "bg-slate-50 text-[#1E3A8A]" : "text-slate-700"
                      }`}
                      data-testid={`lang-${lang}`}
                    >
                      <span className="text-lg">{flagEmoji[lang]}</span>
                      <span className="text-sm">{langNames[lang]}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-3">
            {/* Mobile Lang */}
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className={`p-2 ${isScrolled ? "text-slate-700" : "text-white"}`}
            >
              <Globe className="w-5 h-5" />
            </button>
            <button
              className="p-2"
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
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg py-4">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => scrollToSection(item.id)}
                className="block w-full text-left px-6 py-3 text-slate-700 hover:bg-slate-50 uppercase text-sm tracking-wider font-medium"
              >
                {t(`nav.${item.key}`)}
              </button>
            ))}
          </div>
        )}

        {/* Mobile Language Menu */}
        {langMenuOpen && (
          <div className="md:hidden absolute top-full right-4 mt-2 bg-white shadow-lg rounded-sm py-2 min-w-[150px]">
            {Object.keys(flagEmoji).map((lang) => (
              <button
                key={lang}
                onClick={() => changeLanguage(lang)}
                className={`w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-slate-50 ${
                  currentLang === lang ? "bg-slate-50 text-[#1E3A8A]" : "text-slate-700"
                }`}
              >
                <span className="text-lg">{flagEmoji[lang]}</span>
                <span className="text-sm">{langNames[lang]}</span>
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section
        id="home"
        className="relative w-full h-screen overflow-hidden flex flex-col justify-center"
        data-testid="hero-section"
      >
        {/* Video Background - Fullscreen */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
          poster="https://images.pexels.com/photos/1117210/pexels-photo-1117210.jpeg?auto=compress&cs=tinysrgb&w=1920"
        >
          <source src={settings.hero.video_url} type="video/mp4" />
        </video>
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70 z-10"></div>
        
        {/* Content */}
        <div className={`relative z-20 px-6 max-w-5xl mx-auto w-full flex flex-col ${
          settings.hero?.horizontal_align === "left" ? "items-start text-left" :
          settings.hero?.horizontal_align === "right" ? "items-end text-right" :
          "items-center text-center"
        }`}
        style={{ marginTop: `${settings.hero?.vertical_offset || 0}px` }}
        >
          <h1
            className="font-['Oswald'] text-4xl md:text-6xl lg:text-7xl font-bold text-white uppercase tracking-tight mb-6 animate-fadeInUp"
            style={{ maxWidth: `${settings.hero?.title_max_width || 800}px` }}
            data-testid="hero-title"
          >
            {getText(settings.hero.title)}
          </h1>
          <p 
            className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl animate-fadeInUp delay-200"
          >
            {getText(settings.hero.subtitle)}
          </p>
          <Button
            onClick={() => scrollToSection("contato")}
            className="bg-[#1E3A8A] hover:bg-[#172554] text-white px-10 py-6 text-base uppercase tracking-wider rounded-sm animate-fadeInUp delay-300"
            data-testid="hero-cta"
          >
            {getText(settings.hero.cta_text)}
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
                  {getText(diff.title)}
                </h3>
                <p className="text-slate-600 leading-relaxed">{getText(diff.description)}</p>
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
                {t("about.subtitle")}
              </p>
              <h2 className="font-['Oswald'] text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 uppercase tracking-tight mb-8">
                {getText(settings.about.title)}
              </h2>
              <p className="text-slate-600 text-lg leading-relaxed mb-6">
                {getText(settings.about.paragraph1)}
              </p>
              <p className="text-slate-600 text-lg leading-relaxed mb-8">
                {getText(settings.about.paragraph2)}
              </p>
              <Button
                onClick={() => scrollToSection("contato")}
                variant="outline"
                className="border-[#1E3A8A] text-[#1E3A8A] hover:bg-[#1E3A8A] hover:text-white px-8 py-6 uppercase tracking-wider rounded-sm"
                data-testid="about-cta"
              >
                {t("about.cta")}
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
        id="areas-de-atuacao"
        className="py-20 md:py-28 bg-white"
        data-testid="areas-section"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-medium tracking-widest uppercase text-[#1E3A8A] mb-4">
              {t("areas.subtitle")}
            </p>
            <h2 className="font-['Oswald'] text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 uppercase tracking-tight">
              {t("areas.title")}
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
                  <span
                    className={`inline-block w-fit px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-sm mb-4 ${
                      area.is_specialty
                        ? "bg-[#D4AF37] text-white shadow-lg"
                        : "bg-[#1E3A8A] text-white"
                    }`}
                    data-testid={`area-badge-${index}`}
                  >
                    {area.is_specialty ? t("areas.specialty") : area.badge_text}
                  </span>

                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 flex items-center justify-center text-white bg-white/20 rounded-sm backdrop-blur-sm">
                      {getIcon(area.icon)}
                    </div>
                    <h3 className="font-['Oswald'] text-2xl md:text-3xl font-bold text-white uppercase tracking-wide">
                      {area.title}
                    </h3>
                  </div>

                  <p className="text-white/90 leading-relaxed mb-6 line-clamp-3">
                    {area.description}
                  </p>

                  <Button
                    className="w-fit bg-white text-[#1E3A8A] hover:bg-[#1E3A8A] hover:text-white px-6 py-3 uppercase tracking-wider rounded-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    data-testid={`area-btn-${index}`}
                  >
                    {area.button_text || t("areas.learnMore")}
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
              {t("blog.subtitle")}
            </p>
            <h2 className="font-['Oswald'] text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 uppercase tracking-tight">
              {t("blog.title")}
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
                      {new Date(post.created_at).toLocaleDateString(currentLang === "en" ? "en-US" : currentLang === "es" ? "es-ES" : "pt-BR")}
                    </p>
                    <h3 className="font-['Oswald'] text-xl font-semibold text-slate-900 uppercase tracking-wide mb-3 line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-slate-600 line-clamp-3 mb-4">{post.excerpt}</p>
                    <span className="text-[#1E3A8A] font-medium uppercase text-sm tracking-wider inline-flex items-center">
                      {t("blog.readMore")}
                      <ChevronRight className="ml-1 w-4 h-4" />
                    </span>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-500">{t("blog.noNews")}</p>
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
                  {t("blog.viewAll")}
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
              {t("contact.subtitle")}
            </p>
            <h2 className="font-['Oswald'] text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 uppercase tracking-tight">
              {t("contact.title")}
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
            <form onSubmit={handleSubmit} className="space-y-6" data-testid="contact-form">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {t("contact.form.name")} *
                  </label>
                  <Input
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="rounded-sm border-slate-200 focus:border-[#1E3A8A] h-12"
                    placeholder={t("contact.form.namePlaceholder")}
                    data-testid="contact-name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {t("contact.form.email")} *
                  </label>
                  <Input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="rounded-sm border-slate-200 focus:border-[#1E3A8A] h-12"
                    placeholder={t("contact.form.emailPlaceholder")}
                    data-testid="contact-email"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {t("contact.form.phone")}
                  </label>
                  <Input
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="rounded-sm border-slate-200 focus:border-[#1E3A8A] h-12"
                    placeholder={t("contact.form.phonePlaceholder")}
                    data-testid="contact-phone"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {t("contact.form.company")}
                  </label>
                  <Input
                    value={formData.company}
                    onChange={(e) =>
                      setFormData({ ...formData, company: e.target.value })
                    }
                    className="rounded-sm border-slate-200 focus:border-[#1E3A8A] h-12"
                    placeholder={t("contact.form.companyPlaceholder")}
                    data-testid="contact-company"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t("contact.form.message")} *
                </label>
                <Textarea
                  required
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  className="rounded-sm border-slate-200 focus:border-[#1E3A8A] min-h-[150px]"
                  placeholder={t("contact.form.messagePlaceholder")}
                  data-testid="contact-message"
                />
              </div>
              <Button
                type="submit"
                disabled={submitting}
                className="w-full md:w-auto bg-[#1E3A8A] hover:bg-[#172554] text-white px-10 py-6 uppercase tracking-wider rounded-sm"
                data-testid="contact-submit"
              >
                {submitting ? t("contact.form.sending") : t("contact.form.submit")}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </form>

            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 flex items-center justify-center bg-[#1E3A8A]/5 text-[#1E3A8A] rounded-sm flex-shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">{t("contact.info.address")}</h4>
                  <p className="text-slate-600">{settings.contact.address}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 flex items-center justify-center bg-[#1E3A8A]/5 text-[#1E3A8A] rounded-sm flex-shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">{t("contact.info.phone")}</h4>
                  <p className="text-slate-600">{settings.contact.phone}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 flex items-center justify-center bg-[#1E3A8A]/5 text-[#1E3A8A] rounded-sm flex-shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">{t("contact.info.email")}</h4>
                  <p className="text-slate-600">{settings.contact.email}</p>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200">
                <h4 className="font-semibold text-slate-900 mb-4">
                  {t("contact.social")}
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
            <div>
              <img
                src={settings.logo_url}
                alt="Star Trade"
                className="h-12 mb-6 brightness-0 invert"
              />
              <p className="text-slate-400 leading-relaxed">
                {t("footer.description")}
              </p>
            </div>

            <div>
              <h4 className="font-['Oswald'] text-lg font-semibold uppercase tracking-wider mb-6">
                {t("footer.quickLinks")}
              </h4>
              <ul className="space-y-3">
                {navItems.map((item) => (
                  <li key={item.key}>
                    <button
                      onClick={() => scrollToSection(item.id)}
                      className="text-slate-400 hover:text-white transition-colors"
                    >
                      {t(`nav.${item.key}`)}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-['Oswald'] text-lg font-semibold uppercase tracking-wider mb-6">
                {t("footer.newsletter")}
              </h4>
              <p className="text-slate-400 mb-4">
                {t("footer.newsletterText")}
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder={t("footer.emailPlaceholder")}
                  className="bg-white/10 border-white/20 text-white placeholder:text-slate-500 rounded-sm"
                />
                <Button className="bg-[#1E3A8A] hover:bg-[#172554] rounded-sm px-6">
                  {t("footer.subscribe")}
                </Button>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-400 text-sm">
              {t("footer.copyright")}
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
