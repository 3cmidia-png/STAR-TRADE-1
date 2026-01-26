import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MessageSquare,
  FileText,
  Map,
  Mail,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Dashboard() {
  const [stats, setStats] = useState({
    total_messages: 0,
    unread_messages: 0,
    total_posts: 0,
    total_areas: 0,
  });
  const [recentMessages, setRecentMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const [statsRes, messagesRes] = await Promise.all([
        axios.get(`${API}/stats/dashboard`, { headers }),
        axios.get(`${API}/messages`, { headers }),
      ]);

      setStats(statsRes.data);
      setRecentMessages(messagesRes.data.slice(0, 5));
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Mensagens Recebidas",
      value: stats.total_messages,
      icon: MessageSquare,
      color: "bg-blue-500",
      subtext: `${stats.unread_messages} não lidas`,
    },
    {
      title: "Posts do Blog",
      value: stats.total_posts,
      icon: FileText,
      color: "bg-green-500",
      subtext: "Total publicado",
    },
    {
      title: "Áreas de Atuação",
      value: stats.total_areas,
      icon: Map,
      color: "bg-purple-500",
      subtext: "Cadastradas",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-slate-500">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="dashboard-page">
      {/* Header */}
      <div>
        <h1 className="font-['Oswald'] text-2xl md:text-3xl font-bold text-slate-900 uppercase tracking-tight">
          Dashboard
        </h1>
        <p className="text-slate-500 mt-1">
          Visão geral do seu site Star Trade
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className="border-0 shadow-sm" data-testid={`stat-card-${index}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">
                    {stat.value}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">{stat.subtext}</p>
                </div>
                <div
                  className={`w-12 h-12 ${stat.color} rounded-sm flex items-center justify-center`}
                >
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Messages */}
      <Card className="border-0 shadow-sm" data-testid="recent-messages">
        <CardHeader className="border-b border-slate-100">
          <div className="flex items-center justify-between">
            <CardTitle className="font-['Oswald'] text-lg font-semibold uppercase tracking-wide">
              Mensagens Recentes
            </CardTitle>
            <a
              href="/admin/messages"
              className="text-sm text-[#1E3A8A] hover:underline flex items-center gap-1"
            >
              Ver todas
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {recentMessages.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {recentMessages.map((msg) => (
                <div
                  key={msg.id}
                  className="px-6 py-4 flex items-start gap-4 hover:bg-slate-50 transition-colors"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 ${
                      msg.is_read ? "bg-slate-300" : "bg-[#1E3A8A]"
                    }`}
                  >
                    {msg.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-900 truncate">
                        {msg.name}
                      </p>
                      {!msg.is_read && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 truncate">{msg.email}</p>
                    <p className="text-sm text-slate-600 mt-1 line-clamp-1">
                      {msg.message}
                    </p>
                  </div>
                  <p className="text-xs text-slate-400 flex-shrink-0">
                    {new Date(msg.created_at).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500">
              <Mail className="w-12 h-12 mx-auto mb-4 text-slate-300" />
              <p>Nenhuma mensagem recebida ainda.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <a
          href="/admin/areas"
          className="p-4 bg-white rounded-sm shadow-sm border border-slate-100 hover:border-[#1E3A8A]/20 hover:shadow-md transition-all group"
          data-testid="quick-action-areas"
        >
          <Map className="w-6 h-6 text-[#1E3A8A] mb-3" />
          <p className="font-medium text-slate-900 group-hover:text-[#1E3A8A]">
            Gerenciar Áreas
          </p>
          <p className="text-sm text-slate-500">Editar áreas de atuação</p>
        </a>

        <a
          href="/admin/blog"
          className="p-4 bg-white rounded-sm shadow-sm border border-slate-100 hover:border-[#1E3A8A]/20 hover:shadow-md transition-all group"
          data-testid="quick-action-blog"
        >
          <FileText className="w-6 h-6 text-[#1E3A8A] mb-3" />
          <p className="font-medium text-slate-900 group-hover:text-[#1E3A8A]">
            Novo Post
          </p>
          <p className="text-sm text-slate-500">Criar conteúdo para o blog</p>
        </a>

        <a
          href="/admin/messages"
          className="p-4 bg-white rounded-sm shadow-sm border border-slate-100 hover:border-[#1E3A8A]/20 hover:shadow-md transition-all group"
          data-testid="quick-action-messages"
        >
          <MessageSquare className="w-6 h-6 text-[#1E3A8A] mb-3" />
          <p className="font-medium text-slate-900 group-hover:text-[#1E3A8A]">
            Ver Mensagens
          </p>
          <p className="text-sm text-slate-500">
            {stats.unread_messages} aguardando resposta
          </p>
        </a>

        <a
          href="/admin/settings"
          className="p-4 bg-white rounded-sm shadow-sm border border-slate-100 hover:border-[#1E3A8A]/20 hover:shadow-md transition-all group"
          data-testid="quick-action-settings"
        >
          <TrendingUp className="w-6 h-6 text-[#1E3A8A] mb-3" />
          <p className="font-medium text-slate-900 group-hover:text-[#1E3A8A]">
            Configurações
          </p>
          <p className="text-sm text-slate-500">Personalizar o site</p>
        </a>
      </div>
    </div>
  );
}
