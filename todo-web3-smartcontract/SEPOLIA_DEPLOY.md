# Deploy no Sepolia Testnet

## 📋 Pré-requisitos

1. **Conta MetaMask** com ETH de teste na Sepolia
2. **RPC Provider** (Infura, Alchemy, etc.)
3. **Private Key** da sua carteira

## 🚀 Passos para Deploy

### 1. Criar arquivo `.env`

Crie um arquivo `.env` na pasta `todo-web3-smartcontract/` com:

```bash
# Sepolia RPC URL (substitua YOUR_PROJECT_ID)
SEPOLIA_RPC_URL="https://sepolia.infura.io/v3/YOUR_PROJECT_ID"

# Sua private key (substitua pela sua)
PRIVATE_KEY="0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"

# Etherscan API Key (opcional, para verificação)
ETHERSCAN_API_KEY="YOUR_ETHERSCAN_API_KEY"
```

### 2. Obter ETH de Teste

- Acesse: https://sepoliafaucet.com/
- Ou: https://faucets.chain.link/sepolia
- Solicite ETH de teste para sua carteira

### 3. Configurar RPC Provider

#### Usando Infura:
1. Acesse: https://infura.io/
2. Crie um projeto
3. Copie o endpoint Sepolia

#### Usando Alchemy:
1. Acesse: https://www.alchemy.com/
2. Crie um app para Sepolia
3. Copie a URL

### 4. Obter Private Key

⚠️ **CUIDADO**: Nunca compartilhe sua private key!

1. MetaMask → Clique nos 3 pontos
2. Account Details → Export Private Key
3. Digite sua senha
4. Copie a private key

### 5. Fazer Deploy

```bash
# Entrar na pasta do smart contract
cd todo-web3-smartcontract

# Fazer deploy
forge script script/DeployTodoList.s.sol --rpc-url $SEPOLIA_RPC_URL --private-key $PRIVATE_KEY --broadcast

# Ou usando o alias configurado no foundry.toml
forge script script/DeployTodoList.s.sol --rpc-url sepolia --private-key $PRIVATE_KEY --broadcast
```

### 6. Verificar Contrato (Opcional)

```bash
forge verify-contract --chain-id 11155111 --num-of-optimizations 200 --watch --constructor-args $(cast abi-encode "constructor()") <CONTRACT_ADDRESS> src/TodoList.sol:TodoList --etherscan-api-key $ETHERSCAN_API_KEY
```

## 📝 Exemplo de Saída Esperada

```
[⠊] Compiling...
[⠢] Compiling 1 files with 0.8.19
[⠆] Solc 0.8.19 finished in 1.23s
Compiler run successful!

Script ran successfully.

== Logs ==
TodoList deployed to: 0x1234567890123456789012345678901234567890

## Setting up 1 EVM.
==========================
Simulating...

Chain 11155111

Estimated gas price: 20.000000001 gwei

Estimated total gas used for script: 567890

========================== 
BROADCASTING
```

## 🔧 Troubleshooting

### Erro: "insufficient funds"
- Verifique se tem ETH de teste suficiente na carteira
- Solicite mais ETH nos faucets

### Erro: "invalid private key"
- Verifique se a private key está correta
- Certifique-se de incluir o "0x" no início

### Erro: "connection refused"
- Verifique se a RPC URL está correta
- Teste a conectividade com o provider

## 🌐 Redes Úteis

- **Sepolia Chain ID**: 11155111
- **Sepolia Explorer**: https://sepolia.etherscan.io/
- **Sepolia Faucets**: 
  - https://sepoliafaucet.com/
  - https://faucets.chain.link/sepolia 