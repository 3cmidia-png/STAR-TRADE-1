import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Mail,
  Phone,
  Building,
  Trash2,
  CheckCircle,
  Circle,
  Calendar,
  X,
} from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function MessagesAdmin() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(response.data);
    } catch (error) {
      toast.error("Erro ao carregar mensagens");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API}/messages/${id}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchMessages();
    } catch (error) {
      toast.error("Erro ao marcar como lida");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir esta mensagem?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API}/messages/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Mensagem excluída!");
      setSelectedMessage(null);
      fetchMessages();
    } catch (error) {
      toast.error("Erro ao excluir mensagem");
    }
  };

  const handleOpenMessage = (message) => {
    setSelectedMessage(message);
    if (!message.is_read) {
      handleMarkAsRead(message.id);
    }
  };

  const unreadCount = messages.filter((m) => !m.is_read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-slate-500">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="messages-admin-page">
      {/* Header */}
      <div>
        <h1 className="font-['Oswald'] text-2xl md:text-3xl font-bold text-slate-900 uppercase tracking-tight">
          Mensagens
        </h1>
        <p className="text-slate-500 mt-1">
          {unreadCount > 0
            ? `${unreadCount} mensagem${unreadCount > 1 ? "s" : ""} não lida${
                unreadCount > 1 ? "s" : ""
              }`
            : "Todas as mensagens foram lidas"}
        </p>
      </div>

      {/* Messages List */}
      <div className="grid gap-3">
        {messages.map((message, index) => (
          <Card
            key={message.id}
            className={`border-0 shadow-sm cursor-pointer transition-all hover:shadow-md ${
              !message.is_read ? "bg-blue-50/50 border-l-4 border-l-[#1E3A8A]" : ""
            }`}
            onClick={() => handleOpenMessage(message)}
            data-testid={`message-item-${index}`}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 ${
                    message.is_read ? "bg-slate-300" : "bg-[#1E3A8A]"
                  }`}
                >
                  {message.name.charAt(0).toUpperCase()}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-slate-900">{message.name}</p>
                    {!message.is_read && (
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500">{message.email}</p>
                  <p className="text-sm text-slate-600 mt-2 line-clamp-2">
                    {message.message}
                  </p>
                </div>

                {/* Date */}
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-slate-400">
                    {new Date(message.created_at).toLocaleDateString("pt-BR")}
                  </p>
                  <p className="text-xs text-slate-400">
                    {new Date(message.created_at).toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {messages.length === 0 && (
        <div className="text-center py-12 bg-white rounded-sm shadow-sm">
          <Mail className="w-12 h-12 mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500">Nenhuma mensagem recebida ainda.</p>
        </div>
      )}

      {/* Message Detail Dialog */}
      <Dialog
        open={!!selectedMessage}
        onOpenChange={() => setSelectedMessage(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-['Oswald'] text-xl uppercase flex items-center gap-2">
              Mensagem de {selectedMessage?.name}
              {selectedMessage?.is_read ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <Circle className="w-5 h-5 text-blue-500" />
              )}
            </DialogTitle>
          </DialogHeader>

          {selectedMessage && (
            <div className="space-y-6 py-4">
              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-sm">
                  <Mail className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Email</p>
                    <a
                      href={`mailto:${selectedMessage.email}`}
                      className="text-[#1E3A8A] hover:underline"
                    >
                      {selectedMessage.email}
                    </a>
                  </div>
                </div>

                {selectedMessage.phone && (
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-sm">
                    <Phone className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500">Telefone</p>
                      <a
                        href={`tel:${selectedMessage.phone}`}
                        className="text-[#1E3A8A] hover:underline"
                      >
                        {selectedMessage.phone}
                      </a>
                    </div>
                  </div>
                )}

                {selectedMessage.company && (
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-sm">
                    <Building className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500">Empresa</p>
                      <p className="text-slate-900">{selectedMessage.company}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-sm">
                  <Calendar className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Recebida em</p>
                    <p className="text-slate-900">
                      {new Date(selectedMessage.created_at).toLocaleString("pt-BR")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Message Content */}
              <div>
                <p className="text-sm font-medium text-slate-700 mb-2">
                  Mensagem
                </p>
                <div className="p-4 bg-slate-50 rounded-sm whitespace-pre-wrap text-slate-700">
                  {selectedMessage.message}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between border-t pt-4">
                <Button
                  variant="outline"
                  className="rounded-sm text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={() => handleDelete(selectedMessage.id)}
                  data-testid="delete-message-btn"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir
                </Button>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="rounded-sm"
                    asChild
                  >
                    <a href={`mailto:${selectedMessage.email}`}>
                      <Mail className="w-4 h-4 mr-2" />
                      Responder por Email
                    </a>
                  </Button>
                  {selectedMessage.phone && (
                    <Button
                      className="bg-green-500 hover:bg-green-600 rounded-sm"
                      asChild
                    >
                      <a
                        href={`https://wa.me/${selectedMessage.phone.replace(
                          /\D/g,
                          ""
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        WhatsApp
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
