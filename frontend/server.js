// frontend/server.js - API Express para desenvolvimento (opcional)
// Este arquivo pode ser removido se estiver usando apenas o backend Flask

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3333;

// Caminhos dos arquivos JSON (apenas para fallback/desenvolvimento)
const productsPath = path.join(__dirname, 'products.json');
const usersPath = path.join(__dirname, 'users.json');

// Funções auxiliares para ler/escrever JSON
function readJSON(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Erro ao ler ${filePath}:`, error);
    return null;
  }
}

function writeJSON(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Erro ao escrever ${filePath}:`, error);
    return false;
  }
}

// Rota raiz
app.get('/', (req, res) => {
  res.send('Smart Inventory API - Use o backend Flask em http://localhost:5000');
});

// Rotas de usuários (fallback)
app.get('/users', (req, res) => {
  const data = readJSON(usersPath);
  if (data && data.users) {
    res.json(data.users);
  } else {
    res.json([]);
  }
});

app.post('/users', (req, res) => {
  const data = readJSON(usersPath);
  if (data && data.users) {
    const newUser = { 
      id: Math.random().toString(36).substr(2, 9), 
      ...req.body 
    };
    data.users.push(newUser);
    writeJSON(usersPath, data);
    res.status(201).json(newUser);
  } else {
    res.status(500).json({ error: 'Erro ao salvar usuário' });
  }
});

// Rotas de produtos (fallback)
app.get('/products', (req, res) => {
  const data = readJSON(productsPath);
  if (data && data.products) {
    res.json(data.products);
  } else {
    res.json([]);
  }
});

app.post('/products', (req, res) => {
  const data = readJSON(productsPath);
  if (data && data.products) {
    const newProduct = { 
      id: Math.random().toString(36).substr(2, 9), 
      ...req.body 
    };
    data.products.push(newProduct);
    writeJSON(productsPath, data);
    res.status(201).json(newProduct);
  } else {
    res.status(500).json({ error: 'Erro ao salvar produto' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ API de fallback rodando na porta ${PORT}`);
  console.log(`📦 Nota: Para produção, use o backend Flask em http://localhost:5000`);
});