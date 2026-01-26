import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Lock, Mail, User, ArrowRight } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Login() {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isRegister ? "/auth/register" : "/auth/login";
      const payload = isRegister
        ? formData
        : { email: formData.email, password: formData.password };

      const response = await axios.post(`${API}${endpoint}`, payload);

      localStorage.setItem("token", response.data.access_token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      toast.success(isRegister ? "Conta criada com sucesso!" : "Login realizado!");
      navigate("/admin");
    } catch (error) {
      const message =
        error.response?.data?.detail || "Erro ao processar. Tente novamente.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <a href="/">
            <img
              src="https://customer-assets.emergentagent.com/job_star-trade-intl/artifacts/7zqbrzwt_star%20trade.png"
              alt="Star Trade"
              className="h-16 mx-auto mb-4"
              data-testid="login-logo"
            />
          </a>
          <h1 className="font-['Oswald'] text-2xl font-bold text-slate-900 uppercase tracking-wide">
            {isRegister ? "Criar Conta" : "Acesso ao Painel"}
          </h1>
          <p className="text-slate-500 mt-2">
            {isRegister
              ? "Crie sua conta para acessar o dashboard"
              : "Entre com suas credenciais"}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white p-8 shadow-xl" data-testid="login-form-container">
          <form onSubmit={handleSubmit} className="space-y-5">
            {isRegister && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nome
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="pl-11 h-12 rounded-sm border-slate-200"
                    placeholder="Seu nome"
                    data-testid="register-name"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="pl-11 h-12 rounded-sm border-slate-200"
                  placeholder="seu@email.com"
                  data-testid="login-email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  required
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="pl-11 h-12 rounded-sm border-slate-200"
                  placeholder="••••••••"
                  data-testid="login-password"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1E3A8A] hover:bg-[#172554] text-white h-12 uppercase tracking-wider rounded-sm"
              data-testid="login-submit"
            >
              {loading
                ? "Processando..."
                : isRegister
                ? "Criar Conta"
                : "Entrar"}
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="text-[#1E3A8A] hover:underline text-sm font-medium"
              data-testid="toggle-auth-mode"
            >
              {isRegister
                ? "Já tem uma conta? Faça login"
                : "Não tem conta? Cadastre-se"}
            </button>
          </div>
        </div>

        {/* Back to site */}
        <div className="mt-6 text-center">
          <a
            href="/"
            className="text-slate-500 hover:text-slate-700 text-sm"
            data-testid="back-to-site"
          >
            ← Voltar para o site
          </a>
        </div>
      </div>
    </div>
  );
}
