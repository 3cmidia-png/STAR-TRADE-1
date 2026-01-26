# Star Trade - Website & CMS PRD

## Original Problem Statement
Site profissional e minimalista para Star Trade, trading company de importação/exportação com dashboard administrativo completo.

## User Personas
1. **Visitante** - Empresário buscando serviços de comércio exterior
2. **Admin** - Equipe Star Trade gerenciando conteúdo do site

## Core Requirements (Static)
- Site corporativo com vídeo hero fullscreen
- Seções: Diferenciais, Quem Somos, Áreas de Atuação, Estatísticas, Blog, Contato, Footer
- Destaque especial para Rochas Ornamentais (badge dourado "NOSSA ESPECIALIDADE")
- Dashboard admin completo com CRUD para todas as seções
- Autenticação JWT
- Design responsivo mobile-first
- **Sistema multilíngue (PT, EN, ES) com gerenciamento via dashboard**

## What's Been Implemented ✅
**Date: January 26, 2026**

### Sistema Multilíngue ✅
- Seletor de idiomas no header (bandeiras PT 🇧🇷, EN 🇺🇸, ES 🇪🇸)
- Traduções dinâmicas do Hero (título, subtítulo, CTA)
- Traduções dinâmicas da seção Quem Somos
- Traduções do menu de navegação via i18next
- Dashboard com campos de edição para cada idioma
- Modelo TranslatableText no backend com {pt, en, es}

### Frontend (React)
- Landing page completa com todas as seções
- Vídeo de fundo no hero (FULLSCREEN - corrigido)
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
- **Configurações multilíngues no dashboard (Hero, About)**

### Backend (FastAPI + MongoDB)
- Autenticação JWT com bcrypt
- CRUD completo para áreas de atuação
- CRUD completo para posts do blog
- Gerenciamento de mensagens de contato
- Configurações do site editáveis
- Dashboard stats endpoint
- Media upload (mock)
- **Modelo TranslatableText para campos traduzíveis**
- **Migração automática de dados antigos**

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
- [x] Sistema multilíngue (PT/EN/ES)
- [x] Vídeo hero fullscreen

### P1 (Próximos)
- [ ] Redimensionamento de imagens das Áreas de Atuação no dashboard
- [ ] Upload de mídia multi-fonte (computador, Google Drive, biblioteca)
- [ ] Upload real de mídia (Cloudinary/S3)
- [ ] Integração real de email (SendGrid/Resend)

### P2 (Futuro)
- [ ] Completar módulo de Blog (páginas de listagem e post individual)
- [ ] Editor de imagem/vídeo após upload
- [ ] Editor WYSIWYG para textos
- [ ] SEO avançado (meta tags dinâmicas, sitemap)
- [ ] Analytics integrado
- [ ] 2FA no login admin
- [ ] Backup automático

## Tech Stack
- Frontend: React 19 + Tailwind CSS + Shadcn/UI + react-i18next
- Backend: FastAPI + Motor (MongoDB async)
- Auth: JWT + bcrypt
- Database: MongoDB
- i18n: i18next + react-i18next

## Access Credentials
- Admin: admin@startrade.com / StarTrade2024!
- Dashboard: /admin
- API: /api

## MOCKED Features
- ⚠️ Envio de emails está mockado (logs apenas)
- ⚠️ Upload de mídia está mockado (data URLs)
- ⚠️ Integração Google Drive não implementada

## Recent Fixes (January 26, 2026)
1. **Sistema de Tradução**: Corrigido para funcionar corretamente com campos TranslatableText
2. **Vídeo Hero Fullscreen**: CSS corrigido para ocupar 100% da viewport
3. **Dashboard Multilíngue**: Adicionados campos de edição para PT, EN e ES
4. **Migração de Dados**: Implementada conversão automática de strings para TranslatableText
