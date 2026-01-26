# Star Trade - Website & CMS PRD

## Original Problem Statement
Site profissional e minimalista para Star Trade, trading company de importação/exportação com dashboard administrativo completo.

## User Personas
1. **Visitante** - Empresário buscando serviços de comércio exterior
2. **Admin** - Equipe Star Trade gerenciando conteúdo do site

## Core Requirements (Static)
- Site corporativo com vídeo hero
- Seções: Diferenciais, Quem Somos, Áreas de Atuação, Estatísticas, Blog, Contato, Footer
- Destaque especial para Rochas Ornamentais (badge dourado "NOSSA ESPECIALIDADE")
- Dashboard admin completo com CRUD para todas as seções
- Autenticação JWT
- Design responsivo mobile-first

## What's Been Implemented ✅
**Date: January 26, 2026**

### Frontend (React)
- Landing page completa com todas as seções
- Vídeo de fundo no hero (containers/logística)
- Navegação fixa com scroll suave
- Cards de diferenciais (Equipe, Agilidade, Segurança)
- Seção Quem Somos (layout 50/50)
- 4 áreas de atuação com hover effects e badges
- Estatísticas animadas com contadores
- Seção Blog com cards
- Formulário de contato funcional
- Footer com newsletter
- Botão WhatsApp flutuante
- Página de login/cadastro
- Dashboard admin com sidebar
- Gerenciamento de Áreas de Atuação (CRUD completo)
- Gerenciamento de Blog (CRUD completo)
- Visualização de mensagens recebidas
- Configurações do site (Hero, About, Diferenciais, Stats, Contato, Cores)

### Backend (FastAPI + MongoDB)
- Autenticação JWT com bcrypt
- CRUD completo para áreas de atuação
- CRUD completo para posts do blog
- Gerenciamento de mensagens de contato
- Configurações do site editáveis
- Dashboard stats endpoint
- Media upload (mock)

### Design
- Paleta: Azul corporativo (#1E3A8A), Dourado (#D4AF37), Branco
- Tipografia: Oswald (headings) + Inter (body)
- Cards com hover effects e overlays
- Animações suaves ao scroll

## Prioritized Backlog

### P0 (Concluído) ✅
- [x] Site público completo
- [x] Dashboard admin funcional
- [x] CRUD de áreas e blog
- [x] Autenticação JWT

### P1 (Próximos)
- [ ] Upload real de mídia (Cloudinary/S3)
- [ ] Integração real de email (SendGrid/Resend)
- [ ] SEO avançado (meta tags dinâmicas, sitemap)
- [ ] Analytics integrado

### P2 (Futuro)
- [ ] Página de detalhes por área de atuação
- [ ] Sistema de tags/categorias no blog
- [ ] Busca avançada no blog
- [ ] Multi-idioma (PT/EN/ES)
- [ ] 2FA no login admin
- [ ] Backup automático

## Tech Stack
- Frontend: React 19 + Tailwind CSS + Shadcn/UI
- Backend: FastAPI + Motor (MongoDB async)
- Auth: JWT + bcrypt
- Database: MongoDB

## Access Credentials
- Admin: admin@startrade.com / StarTrade2024!
- Dashboard: /admin
- API: /api

## MOCKED Features
- ⚠️ Envio de emails está mockado (logs apenas)
- ⚠️ Upload de mídia está mockado (data URLs)
