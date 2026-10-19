# GestorTV - CRM & Cobrança Recorrente para TV por Assinatura (PWA)

Sistema web progressivo completo (PWA) de gestão de clientes, planos, cobranças via Pix com baixa automática, régua de mensagens WhatsApp e suporte com tutoriais por dispositivo.

> **Aviso Legal & Escopo:** O GestorTV é estritamente uma plataforma de gestão e relacionamento com clientes (CRM, cobrança, emissão de Pix e suporte). O sistema **não** hospeda, não distribui e não transmite nenhum conteúdo audiovisual ou sinal de transmissão.

---

## 🚀 Tecnologias

- **Frontend & App Shell:** React 19 + TypeScript + Vite + Tailwind CSS v4 + Lucide Icons + Recharts
- **Banco de Dados & Autenticação:** Supabase (PostgreSQL, Auth com Row Level Security)
- **Cobranças:** Arquitetura de provedor plugável (Pix QR Code e Copia e Cola via Mock interativo, Mercado Pago e Asaas) com simulador de webhook de baixa automática
- **Mensageria:** Régua de cobrança configurável (D-3, D-0, D+2) e fila compatível com WhatsApp Business Platform
- **PWA:** Manifest web app, responsividade total mobile-first (tabelas que viram cards) e funcionamento offline-ready
- **Privacidade & Conformidade:** Adequado à LGPD (consentimento, exportação de dados em JSON/CSV e anonimização/exclusão)

---

## 📁 Estrutura de Pastas

```text
├── public/
│   └── manifest.json          # Manifesto do PWA
├── src/
│   ├── components/            # Componentes reutilizáveis (UI, Modais, Navegação)
│   │   ├── Navbar.tsx         # Barra superior com troca de perfil (Admin/Revendedor/Atendente)
│   │   ├── Sidebar.tsx        # Navegação lateral responsiva e menu gaveta mobile
│   │   ├── LgpdModal.tsx      # Modal de privacidade e consentimento LGPD
│   │   └── PixModal.tsx       # Modal de pagamento Pix com QR Code e Copia e Cola
│   ├── features/
│   │   ├── auth/              # Módulo de Autenticação, perfis e permissões RLS
│   │   ├── customers/         # Cadastro, filtros, busca, badges, renovação com 1 clique e detalhes
│   │   ├── plans/             # CRUD de planos de TV e cupons de desconto
│   │   ├── billing/           # Cobranças, Pix plugável, webhook de baixa e registro manual
│   │   ├── dashboard/         # Métricas, gráficos (Recharts), churn e exportação CSV/PDF
│   │   ├── messages/          # Modelos de mensagens dinâmicas, régua e fila WhatsApp
│   │   ├── support/           # Chamados de suporte, histórico e tutoriais por dispositivo
│   │   └── settings/          # Dados da empresa, chave Pix, régua e gestão de usuários
│   ├── services/              # Provedor Pix plugável (Mercado Pago, Asaas, Mock) e WhatsApp
│   ├── store/                 # Gerenciamento de estado reativo e persistente (Storage + Supabase)
│   ├── types/                 # Tipos TypeScript centralizados do CRM
│   ├── App.tsx                # Roteador de módulos e casca principal
│   ├── main.tsx               # Ponto de entrada
│   └── index.css              # Estilos Tailwind e tipografia
├── supabase/
│   ├── schema.sql             # Migrations com tabelas, índices e políticas RLS
│   └── seed.sql               # 30 clientes fictícios, planos, cupons e templates
├── .env.example               # Exemplo de variáveis de ambiente
└── README.md                  # Documentação do projeto
```

---

## 🛠️ Configuração e Instalação Local

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/seu-usuario/gestortv.git
   cd gestortv
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente:**
   ```bash
   cp .env.example .env
   ```
   *Se quiser conectar ao seu banco Supabase, preencha `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`. Caso contrário, o sistema opera no modo simulador com banco de dados local com 30 clientes fictícios prontos para teste imediato.*

4. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```
   Acesse `http://localhost:3000` no seu navegador.

---

## 📦 Deploy na Vercel

1. Suba o projeto para um repositório no GitHub/GitLab.
2. Na [Vercel](https://vercel.com), clique em **New Project** e importe o repositório.
3. Configure o Framework Preset como **Vite**.
4. Em **Environment Variables**, adicione:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_PIX_PROVIDER` (ex: `mock` ou `mercadopago`)
5. Clique em **Deploy**.

---

## 🔒 Segurança e LGPD

- **Row Level Security (RLS):** Revendedores visualizam e gerenciam estritamente seus clientes e cobranças associadas.
- **Direitos do Titular (LGPD):** Botão na tela de detalhes do cliente para exportar os dados cadastrais em formato aberto (JSON/CSV) e opção de esquecimento (anonimização com remoção de telefone e e-mail).
