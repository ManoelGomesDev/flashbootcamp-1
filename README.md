# Flash Bootcamp - Todo Web3 Application

Uma aplicação de lista de tarefas descentralizada que usa blockchain para gerenciar stakes em tarefas. Os usuários depositam ETH como garantia ao criar tarefas e recuperam o valor quando completam antes do prazo.

## 📋 Índice

- [Pré-requisitos](#pré-requisitos)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Instalação](#instalação)
- [Configuração e Execução](#configuração-e-execução)
- [Como Usar](#como-usar)
- [Troubleshooting](#troubleshooting)

## 🛠 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** (versão 18 ou superior)
- **npm** ou **yarn**
- **Foundry** (para smart contracts)
- **Git**

### Instalando Foundry

```bash
# Instalar Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

### Verificando Instalações

```bash
node --version  # >= 18.0.0
npm --version
forge --version
```

## 📁 Estrutura do Projeto

```
flashbootcamp/
├── backend/                    # API NestJS
├── todo-web3/                 # Frontend Next.js
├── todo-web3-smartcontract/   # Smart Contracts Solidity
└── README.md
```

## 🚀 Instalação

### 1. Clone o Repositório

```bash
git clone https://github.com/ManoelGomesDev/flashbootcamp-1.git
cd flashbootcamp
```

### 2. Instalar Dependências do Smart Contract

```bash
cd todo-web3-smartcontract
forge install
cd ..
```

### 3. Instalar Dependências do Backend

```bash
cd backend
npm install
cd ..
```

### 4. Instalar Dependências do Frontend

```bash
cd todo-web3
npm install
cd ..
```

## ⚙️ Configuração e Execução

### Passo 1: Subir a Blockchain Local (Anvil)

Em um terminal dedicado, execute:

```bash
anvil
```

**Saída esperada:**
```
Anvil running at http://127.0.0.1:8545
Private Keys:
- 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
- ...
```

⚠️ **Mantenha este terminal aberto durante todo o processo**

### Passo 2: Compilar e Fazer Deploy do Smart Contract

```bash
cd todo-web3-smartcontract

# Compilar o contrato
forge build

# Fazer deploy na blockchain local
forge script script/DeployTodoList.s.sol \
  --rpc-url http://127.0.0.1:8545 \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
  --broadcast

# Copiar ABI para o backend
cp out/TodoList.sol/TodoList.json ../backend/src/todo-list.abi.json
```

**📝 Anote o endereço do contrato** que aparecerá no output:
```
Contract deployed at: 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

### Passo 3: Configurar o Backend

```bash
cd ../backend

# Editar o arquivo web3.service.ts com o endereço do contrato
# Substitua o endereço na linha:
# private readonly contractAddress = 'SEU_ENDERECO_AQUI';
```

**Edite o arquivo `backend/src/web3.service.ts`:**
```typescript
private readonly contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3'; // Seu endereço
```

### Passo 4: Subir o Backend

```bash
# Ainda no diretório backend/
npm run start:dev
```

**Saída esperada:**
```
[Nest] Application successfully started +1ms
Listening on port 3001
```

### Passo 5: Subir o Frontend

Em um novo terminal:

```bash
cd todo-web3
npm run dev
```

**Saída esperada:**
```
▲ Next.js 14.x.x
- Local: http://localhost:3000
```

## 🎯 Como Usar

### 1. Acessar a Aplicação

Abra seu navegador em: `http://localhost:3000`

### 2. Criar uma Nova Tarefa

1. Clique em **"Nova Tarefa"**
2. Preencha:
   - **Título**: Nome da tarefa
   - **Descrição**: Detalhes da tarefa
   - **Data de vencimento**: Quando a tarefa deve ser concluída
3. Selecione o nível de prioridade (stake):
   - **Fazer Agora**: 0.1 ETH
   - **Agendar**: 0.05 ETH
   - **Delegar**: 0.00001 ETH
   - **Eliminar**: 0.001 ETH
4. Clique em **"Salvar"**

### 3. Completar uma Tarefa

- Clique no botão ✅ ao lado da tarefa
- Você deve completar **antes** do vencimento para recuperar o stake
- Após o vencimento, a tarefa expira e você perde o stake

### 4. Monitorar Informações

No dashboard você pode ver:
- **Total de Tarefas**: Quantidade total criada
- **Tarefas Concluídas**: Quantidade completada com sucesso
- **Tarefas Pendentes**: Quantidade ainda não concluída
- **ETH em Stake**: Valor total depositado em tarefas pendentes

## 🐛 Troubleshooting

### Problemas Comuns

**1. Erro "Cannot find module './todo-list.abi.json'"**
```bash
cd todo-web3-smartcontract
cp out/TodoList.sol/TodoList.json ../backend/src/todo-list.abi.json
```

**2. Erro "Connection refused" no backend**
- Verifique se o Anvil está rodando em `http://127.0.0.1:8545`
- Reinicie o Anvil se necessário

**3. Erro "Invalid payment amount"**
- Certifique-se de selecionar uma opção de stake antes de criar a tarefa
- Verifique se o contrato foi deployado corretamente

**4. Erro "Task has expired" ao completar**
- A tarefa passou do prazo de vencimento
- Você só pode completar tarefas antes do vencimento

**5. Frontend não conecta com backend**
- Verifique se o backend está rodando na porta 3001
- Verifique se não há erro de CORS

### Comandos de Reset

**Resetar blockchain (limpar todas as transações):**
```bash
# Parar Anvil (Ctrl+C) e rodar novamente
anvil
```

**Recompilar e redeploy do contrato:**
```bash
cd todo-web3-smartcontract
forge clean
forge build
# Repetir o comando de deploy
```

**Reinstalar dependências:**
```bash
# Em cada pasta do projeto
rm -rf node_modules package-lock.json
npm install
```

## 📚 APIs Disponíveis

### Backend Endpoints

- `GET /tasks` - Listar todas as tarefas
- `GET /tasks/count` - Contar total de tarefas
- `GET /tasks/:id` - Obter tarefa específica
- `POST /tasks` - Criar nova tarefa
- `POST /tasks/:id/complete` - Completar tarefa

### Swagger Documentation

Acesse: `http://localhost:3001/api`

## 🔧 Tecnologias Utilizadas

- **Frontend**: Next.js 14, TypeScript, TailwindCSS, Shadcn/ui
- **Backend**: NestJS, TypeScript
- **Blockchain**: Solidity, Foundry, Anvil
- **Web3**: Viem, Ethereum

## 💡 Funcionalidades

- ✅ Criação de tarefas com stake em ETH
- ✅ Sistema de prioridades com valores diferentes
- ✅ Recuperação do stake ao completar tarefas
- ✅ Perda do stake se não completar no prazo
- ✅ Dashboard com estatísticas em tempo real
- ✅ Interface responsiva e moderna
- ✅ API RESTful documentada com Swagger

## 📄 Licença

Este projeto é licenciado sob a MIT License.

---

**Desenvolvido durante o Flash Bootcamp** 🚀