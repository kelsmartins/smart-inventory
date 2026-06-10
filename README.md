<div align="center">  
  
<!-- Substitua pelo caminho da sua logo SVG -->  
<img src="./public/logo.svg" alt="Smart Inventory Logo" width="200"/>  
  
# Smart Inventory  
  
**Plataforma integrada de gestão preventiva de estoque para pequenos e médios mercados.**  
  
[![Demo](https://img.shields.io/badge/Demo-Live-green)](https://smart-inventory-p5oe.vercel.app/)  
[![License](https://img.shields.io/badge/license-MIT-blue)](./LICENSE)  
  
</div>  
  
---  
  
## Visão Geral  
  
Smart Inventory é uma plataforma Web e Mobile para **gestão preventiva de estoque**, focada na redução de desperdício de alimentos por meio do monitoramento inteligente de datas de validade e lotes.  
  
---  
  
## Problemática e Solução  
  
A perda de produtos por vencimento representa cerca de **24% das perdas no varejo brasileiro** (ABRAPPE/KPMG). O processo atual depende de inspeções visuais manuais — lento, sujeito a erros e sem visibilidade financeira.  
  
| Problema | Solução Smart Inventory |  
|---|---|  
| Rastreamento manual de validade | Controle de lotes com datas de fabricação e vencimento obrigatórias |  
| Perdas por produtos vencidos | Algoritmo **FEFO** (First Expired, First Out) nas vendas |  
| Risco financeiro invisível | Dashboard de risco calculando capital em risco em tempo real |  
| Cadastro lento e com erros | Leitura de código de barras via câmera (ZXing) em < 2s |  
| Impacto ambiental | Relatórios de ações preventivas alinhados ao **ODS 12 da ONU** |  
  
---  
  
## Funcionalidades  
  
- **Gestão de Usuários:** Administrador com acesso a relatórios e cadastro de colaboradores; colaboradores com acesso a CRUD e vendas.  
- **Cadastro por Código de Barras:** Leitura via webcam ou dispositivo móvel com preenchimento automático do SKU.  
- **Controle de Lotes:** Vinculação de itens a datas de fabricação e vencimento, com bloqueio de datas retroativas (RN01).  
- **Algoritmo FEFO:** Baixa automática dos produtos com vencimento mais próximo nas vendas.  
- **Alertas Visuais:** Indicadores de proximidade de vencimento com classificação em **crítico** e **alerta**.  
- **Dashboard de Risco Financeiro:** Cálculo do valor em risco (quantidade × custo unitário) dos produtos críticos.  
- **Sugestão de Descontos:** Desconto automático sugerido para lotes classificados como críticos.  
- **Relatórios de Sustentabilidade:** Histórico de produtos cujo vencimento foi evitado por ações preventivas (ODS 12).  
- **Gráficos Interativos:** Visualização estatística da situação real do estoque.  
  
---  
  
## Tecnologias  
  
### Frontend  
| Tecnologia | Uso |  
|---|---|  
| [Next.js 16](https://nextjs.org/) | Framework React com SSR/SSG |  
| [React 19](https://react.dev/) | Biblioteca de interface |  
| [TypeScript](https://www.typescriptlang.org/) | Tipagem estática |  
| [Tailwind CSS 4](https://tailwindcss.com/) | Estilização responsiva |  
| [Axios](https://axios-http.com/) | Consumo de APIs REST |  
| [ZXing / react-zxing](https://github.com/zxing-js/library) | Leitura de código de barras |  
| [Recharts](https://recharts.org/) | Gráficos interativos |  
| [Supabase JS](https://supabase.com/) | Cliente do banco de dados |  
| [date-fns](https://date-fns.org/) | Manipulação de datas |  
| [Lucide React](https://lucide.dev/) | Ícones |  
| [Sonner](https://sonner.emilkowal.ski/) | Notificações toast |  
  
### Backend  
| Tecnologia | Uso |  
|---|---|  
| [Python 3](https://www.python.org/) | Linguagem principal |  
| [Flask 3](https://flask.palletsprojects.com/) | Framework da API REST |  
| [Supabase / PostgreSQL](https://supabase.com/) | Banco de dados |  
| JWT | Autenticação e autorização |  
  
---  
  
## Como Usar o Sistema  
  
1. Acesse a plataforma pelo link da demo ou rode localmente (veja abaixo).  
2. **Administrador:** Crie sua conta, cadastre colaboradores e acesse o dashboard de risco.  
3. **Colaborador:** Cadastre produtos via código de barras, gerencie lotes e registre vendas.  
4. Acompanhe os alertas de vencimento no dashboard e aplique descontos sugeridos para lotes críticos.  
5. Consulte os relatórios de ações preventivas para acompanhar o impacto sustentável.  
  
---  
  
## Links  
  
- **Demo ao vivo:** [https://smart-inventory-frontend-teal.vercel.app/](https://smart-inventory-frontend-teal.vercel.app/)
- **Repositório:** [https://github.com/kelsmartins/smart-inventory](https://github.com/kelsmartins/smart-inventory)  
  
---  
  
## Rodando Localmente  
  
### Pré-requisitos  
  
- [Node.js](https://nodejs.org/) >= 18  
- [Python](https://www.python.org/) >= 3.10  
- [pip](https://pip.pypa.io/)  
  
### Passo a passo  
  
```bash  
# 1. Clone o repositório  [header-1](#header-1)
git clone https://github.com/cnrnival/smart-inventory.git  
cd smart-inventory  
  
# 2. Instale as dependências do frontend  [header-2](#header-2)
npm run install:all  
  
# 3. Instale as dependências do backend  [header-3](#header-3)
cd backend  
pip install -r requirements.txt  
cd ..  
  
# 4. Configure as variáveis de ambiente  [header-4](#header-4)
# Crie um arquivo .env na pasta /frontend com:  [header-5](#header-5)
NEXT_PUBLIC_SUPABASE_URL=sua_url_supabase  
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_supabase  
NEXT_PUBLIC_API_URL=http://localhost:5000  
  
# Crie um arquivo .env na pasta /backend com:  [header-6](#header-6)
SUPABASE_URL=sua_url_supabase  
SUPABASE_KEY=sua_chave_supabase  
JWT_SECRET_KEY=sua_chave_secreta  
  
# 5. Rode o projeto completo (frontend + backend simultaneamente)  [header-7](#header-7)
npm run dev
Serviço	URL
Frontend	http://localhost:3000
Backend API	http://localhost:5000
Avisos:

Este projeto está em desenvolvimento e não deve ser usado em produção sem revisão.
Os dados disponíveis são apenas para fins de teste.
