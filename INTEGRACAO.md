# 🔄 Integração Backend-Frontend - Smart Inventory

## ✅ Alterações Realizadas

### 1. Configuração de Variáveis de Ambiente
- **Arquivo**: `frontend/.env.local`
- **Descrição**: Criado arquivo com a URL da API backend
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 2. API Axios Configurada
- **Arquivo**: `frontend/src/api/axios_api.ts`
- **Alterações**:
  - baseURL dinâmica usando variável de ambiente
  - Interceptor para adicionar token JWT automaticamente
  - Fallback para `http://localhost:5000`

### 3. AuthContext Atualizado
- **Arquivo**: `frontend/src/contexts/AuthContext.tsx`
- **Alterações**:
  - Integração completa com API Flask `/auth/login` e `/auth/register`
  - Armazenamento de token JWT no localStorage
  - Tipos atualizados para corresponder ao backend
  - Métodos `login()` e `register()` implementados

### 4. ProductsContext Atualizado
- **Arquivo**: `frontend/src/contexts/ProductsContext.tsx`
- **Alterações**:
  - Integração com endpoints Flask de produtos
  - Transformação de dados do backend para formato do frontend
  - Suporte a produtos com múltiplos lotes
  - Métodos `getProducts()`, `addProduct()`, `deleteProduct()` implementados

### 5. Tipos TypeScript Atualizados
- **Arquivo**: `frontend/src/types/ProductType.tsx`
- **Alterações**:
  - `id` agora aceita `string | number`
  - `batch` agora aceita `string | number`
  - Adicionado `ProductStatus` type

### 6. Server.js Corrigido
- **Arquivo**: `frontend/server.js`
- **Alterações**:
  - Removidos todos os conflitos de merge
  - API Express simplificada (apenas fallback)
  - Exclusão do tsconfig.json para evitar erros ESLint

### 7. Scripts de Desenvolvimento
- **Arquivo**: `package.json` (raiz)
- **Scripts**:
  - `npm run dev` - Roda backend e frontend simultaneamente
  - `npm run dev:backend` - Apenas backend Flask
  - `npm run dev:frontend` - Apenas frontend Next.js
  - `npm run install:all` - Instala dependências de tudo

### 8. Páginas de Autenticação Atualizadas
- **Arquivos**: 
  - `frontend/src/app/login/page.tsx`
  - `frontend/src/components/Forms/userform.tsx`
- **Alterações**:
  - Usando novo AuthContext com API Flask
  - Estados de loading
  - Login automático após registro

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
1. **Python 3.8+** instalado
2. **Node.js 18+** instalado
3. **MySQL** rodando (ou outro banco configurado)

### Passo a Passo

#### 1. Instalar Dependências
```bash
# Instalar dependências do backend (Python)
cd backend
pip install -r requirements.txt

# Voltar para raiz e instalar dependências do frontend (Node)
cd ..
npm install
cd frontend
npm install
```

#### 2. Configurar Banco de Dados
- Criar banco de dados `smart_inventory` no MySQL
- Atualizar `backend/.env` com credenciais corretas
- Executar migrations:
```bash
cd backend
flask db init  # (apenas na primeira vez)
flask db migrate
flask db upgrade
```

#### 3. Criar Usuário Admin (Opcional)
```bash
cd backend
python user.py create "Admin" "admin@smartinventory.com" "admin123" admin "00000000000"
```

#### 4. Executar o Projeto

**Opção A: Tudo junto (recomendado)**
```bash
# Na raiz do projeto
npm run dev
```
Isso iniciará:
- Backend Flask em `http://localhost:5000`
- Frontend Next.js em `http://localhost:3000`

**Opção B: Separado (para desenvolvimento)**

Terminal 1 - Backend:
```bash
cd backend
python run.py
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

---

## 📡 Endpoints da API (Backend Flask)

### Autenticação
- `POST /auth/register` - Criar nova conta
- `POST /auth/login` - Fazer login
- `GET /auth/me` - Obter usuário atual (requer token)

### Produtos
- `GET /products` - Listar todos os produtos
- `GET /products/<id>` - Obter produto específico
- `POST /products` - Criar produto (admin)
- `PUT /products/<id>` - Atualizar produto (admin)
- `DELETE /products/<id>` - Deletar produto (admin)

### Inventário
- `POST /inventory/in` - Registrar entrada de estoque
- `POST /inventory/out` - Registrar saída de estoque (FEFO)
- `GET /inventory/fefo` - Listar estoque ordenado por validade
- `GET /inventory/movements` - Histórico de movimentações

### Vendas
- `POST /sales` - Criar venda
- `GET /sales` - Listar vendas
- `GET /sales/<id>` - Obter venda específica

### Dashboard
- `GET /dashboard/risk` - Relatório de produtos em risco
- `GET /dashboard/expiring` - Produtos próximos ao vencimento
- `GET /dashboard/summary` - Resumo geral do estoque

---

## 🔑 Credenciais de Teste

Após criar o usuário admin (passo 3):
- **Email**: `admin@smartinventory.com`
- **Senha**: `admin123`

Ou crie sua própria conta através da página `/create-account`.

---

## 🐛 Solução de Problemas

### Backend não inicia
1. Verifique se o MySQL está rodando
2. Confira as credenciais no `backend/.env`
3. Execute `pip install -r requirements.txt` novamente

### Frontend não conecta ao backend
1. Verifique se `frontend/.env.local` existe e contém `NEXT_PUBLIC_API_URL=http://localhost:5000`
2. Certifique-se de que o backend está rodando na porta 5000
3. Limpe o cache do navegador

### Erro de CORS
- O backend já está configurado com `Flask-CORS` para aceitar requisições do frontend
- Se persistir, verifique se ambos estão rodando

### Produtos não aparecem
1. Cadastre produtos através da API ou interface
2. Verifique se há lotes vinculados aos produtos
3. Consulte os logs do backend para erros

---

## 📝 Notas Importantes

1. **Ambiente de Desenvolvimento**: 
   - Backend em `http://localhost:5000`
   - Frontend em `http://localhost:3000`
   - CORS habilitado para comunicação entre portas

2. **Banco de Dados**:
   - Configure conforme necessário no `backend/.env`
   - Migrations são gerenciadas pelo Flask-Migrate

3. **Tokens JWT**:
   - Armazenados no localStorage do navegador
   - Enviados automaticamente pelo interceptor do axios
   - Válidos por 15 minutos (configurável no backend)

4. **Arquivos Mock**:
   - `frontend/products.json` e `frontend/users.json` não são mais usados
   - Podem ser removidos após testes

5. **Produção**:
   - Altere `NEXT_PUBLIC_API_URL` no `.env.local` do frontend
   - Use variáveis de ambiente no backend para produção
   - Configure HTTPS e domínios adequados

---

## ✅ Checklist de Integração

- [x] Backend Flask configurado e funcional
- [x] Frontend Next.js configurado
- [x] Variáveis de ambiente criadas
- [x] AuthContext integrado com API Flask
- [x] ProductsContext integrado com API Flask
- [x] Tipos TypeScript atualizados
- [x] Páginas de login/cadastro atualizadas
- [x] Scripts de desenvolvimento criados
- [x] Documentação de integração criada

---

## 🔄 Próximos Passos (Opcionais)

1. **Implementar upload de imagens** de produtos
2. **Adicionar sistema de promoções** para produtos próximos do vencimento
3. **Criar relatórios PDF** de produtos em risco
4. **Implementar notificações** por email para vencimentos
5. **Adicionar testes automatizados** (backend e frontend)
6. **Configurar CI/CD** para deploy automático

---

**Status**: ✅ Integração Backend-Frontend Concluída

O sistema agora está totalmente integrado e funcional. Backend e frontend se comunicam através da API REST do Flask, com autenticação JWT e gerenciamento de estado via Context API.