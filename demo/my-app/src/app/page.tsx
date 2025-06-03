// Indica que este é um componente do lado do cliente
'use client'

// Importações necessárias do React e bibliotecas relacionadas
import { useState, useEffect } from 'react'
import { getContract, createWalletClient, custom, Address } from 'viem'
import { anvil } from 'viem/chains'
import { contractAbi, contractAddress } from '@/lib/abi'
import { publicClient } from '@/lib/client'

export default function Home() {
  // Estados para gerenciar a conta do usuário e dados da tarefa
  
  // Endereço da carteira conectada
  const [account, setAccount] = useState<Address>()
  // ID da tarefa para leitura/compleção
  const [taskId, setTaskId] = useState('0')
  // Título da tarefa
  const [title, setTitle] = useState('Minha primeira task')
  // Descrição da tarefa
  const [description, setDescription] = useState('Descrição da minha primeira task')
  const [dueDate, setDueDate] = useState(() => {
    // Define a data de vencimento padrão para amanhã
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().slice(0, 16)
  })

  // Estado para armazenar o cliente da carteira
  const [walletClient, setWalletClient] = useState<any>(null)

  // Efeito para inicializar o cliente da carteira quando o componente montar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const client = createWalletClient({
        chain: anvil,
        transport: custom(window.ethereum)
      })
      setWalletClient(client)
    }
  }, [])

  // Função para conectar a carteira do usuário
  const connectWallet = async () => {
    if (!walletClient) return
    const [address] = await walletClient.requestAddresses()
    setAccount(address)
  }

  // Função para desconectar a carteira
  const disconnectWallet = () => {
    setAccount(undefined)
  }

  // Inicializa o contrato com o endereço e ABI fornecidos
  const contract = getContract({
    address: contractAddress,
    abi: contractAbi,
    client: { public: publicClient, wallet: walletClient },
  })

  // Função para criar uma nova tarefa
  const handleCreateTask = async () => {
    if (!account || !walletClient) return
    try {
      // Log dos dados da tarefa que será criada
      console.log('Creating task with data:', {
        title,
        description,
        dueDate: new Date(dueDate).toLocaleString(),
        dueDateTimestamp: new Date(dueDate).getTime() / 1000
      })

      // Simula a transação antes de executá-la
      const { request } = await publicClient.simulateContract({
        account,
        address: contractAddress,
        abi: contractAbi,
        functionName: 'createTask',
        args: [title, description, BigInt(new Date(dueDate).getTime() / 1000)]
      })
      
      console.log('Transaction simulated successfully, sending transaction...')
      // Envia a transação para a blockchain
      const hash = await walletClient.writeContract(request)
      console.log('Task created with hash:', hash)
      
      // Aguarda a confirmação da transação
      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      console.log('Transaction receipt:', receipt)
      
      // Tenta recuperar a tarefa recém-criada
      console.log('Attempting to get task with ID: 0')
      try {
        const task = await contract.read.getTasks([BigInt(0)])
        console.log('Task retrieved:', task)
      } catch (error) {
        console.error('Error retrieving task:', error)
      }
    } catch (error) {
      console.error('Error creating task:', error)
      if (error instanceof Error) {
        console.error('Error details:', error.message)
      }
    }
  }

  // Função para marcar uma tarefa como concluída
  const handleCompleteTask = async () => {
    if (!account || !walletClient || !taskId) return
    try {
      // Simula a transação de conclusão
      const { request } = await publicClient.simulateContract({
        account,
        address: contractAddress,
        abi: contractAbi,
        functionName: 'completeTask',
        args: [BigInt(taskId)]
      })
      // Envia a transação para a blockchain
      const hash = await walletClient.writeContract(request)
      console.log('Task completed:', hash)
    } catch (error) {
      console.error('Error completing task:', error)
    }
  }

  // Função para recuperar os detalhes de uma tarefa
  const handleGetTask = async () => {
    if (!taskId) return
    try {
      console.log('Attempting to get task with ID:', taskId)
      const task = await contract.read.getTasks([BigInt(taskId)])
      console.log('Task retrieved successfully:', task)
      
      // Formata e exibe os detalhes da tarefa de forma mais legível
      if (task) {
        console.log('Task Details:', {
          id: task.id.toString(),
          title: task.title,
          description: task.description,
          owner: task.owner,
          completed: task.completed,
          createdAt: new Date(Number(task.createdAt) * 1000).toLocaleString(),
          dueDate: new Date(Number(task.dueDate) * 1000).toLocaleString(),
          completedAt: task.completedAt ? new Date(Number(task.completedAt) * 1000).toLocaleString() : 'Not completed'
        })
      }
    } catch (error) {
      console.error('Error getting task:', error)
      if (error instanceof Error) {
        console.error('Error details:', error.message)
      }
    }
  }

  // Interface do usuário
  return (
    <div className="p-4 max-w-xl mx-auto">
      {/* Seção de conexão da carteira */}
      <div className="mb-8">
        {!account ? (
          <button
            onClick={connectWallet}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Connect Wallet
          </button>
        ) : (
          <button
            onClick={disconnectWallet}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Disconnect {account.slice(0, 6)}...{account.slice(-4)}
          </button>
        )}
      </div>

      {/* Formulário de criação de tarefa */}
      {account && (
        <>
          <div className="mb-8 space-y-4">
            <h1>ESCRITA</h1>
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border rounded"
            />
            <input
              type="text"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border rounded"
            />
            <input
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full p-2 border rounded"
            />
            <button
              onClick={handleCreateTask}
              className="w-full bg-green-500 text-white px-4 py-2 rounded"
            >
              Create Task
            </button>
          </div>

          {/* Seção de leitura e conclusão de tarefas */}
          <div className="mb-8 space-y-4">
            <h1>LEITURA</h1>
            <input
              type="number"
              placeholder="Task ID"
              value={taskId}
              onChange={(e) => setTaskId(e.target.value)}
              className="w-full p-2 border rounded"
            />
            <div className="flex gap-2">
              <button
                onClick={handleGetTask}
                className="flex-1 bg-gray-500 text-white px-4 py-2 rounded"
              >
                Get Task
              </button>
              <button
                onClick={handleCompleteTask}
                className="flex-1 bg-yellow-500 text-white px-4 py-2 rounded"
              >
                Complete Task
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}