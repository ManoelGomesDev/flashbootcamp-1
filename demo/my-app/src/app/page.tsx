'use client'

import { useState, useEffect } from 'react'
import { getContract, createWalletClient, custom, Address } from 'viem'
import { anvil } from 'viem/chains'
import { contractAbi, contractAddress } from '@/lib/abi'
import { publicClient } from '@/lib/client'

export default function Home() {
  const [account, setAccount] = useState<Address>()
  const [taskId, setTaskId] = useState('0')
  const [title, setTitle] = useState('Minha primeira task')
  const [description, setDescription] = useState('Descrição da minha primeira task')
  const [dueDate, setDueDate] = useState(() => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().slice(0, 16)
  })

  const [walletClient, setWalletClient] = useState<any>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const client = createWalletClient({
        chain: anvil,
        transport: custom(window.ethereum)
      })
      setWalletClient(client)
    }
  }, [])

  const connectWallet = async () => {
    if (!walletClient) return
    const [address] = await walletClient.requestAddresses()
    setAccount(address)
  }

  const disconnectWallet = () => {
    setAccount(undefined)
  }

  const contract = getContract({
    address: contractAddress,
    abi: contractAbi,
    client: { public: publicClient, wallet: walletClient },
  })

  const handleCreateTask = async () => {
    if (!account || !walletClient) return
    try {
      console.log('Creating task with data:', {
        title,
        description,
        dueDate: new Date(dueDate).toLocaleString(),
        dueDateTimestamp: new Date(dueDate).getTime() / 1000
      })

      const { request } = await publicClient.simulateContract({
        account,
        address: contractAddress,
        abi: contractAbi,
        functionName: 'createTask',
        args: [title, description, BigInt(new Date(dueDate).getTime() / 1000)]
      })
      
      console.log('Transaction simulated successfully, sending transaction...')
      const hash = await walletClient.writeContract(request)
      console.log('Task created with hash:', hash)
      
      // Wait for the transaction to be mined
      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      console.log('Transaction receipt:', receipt)
      
      // After successful creation, try to get the task
      // We'll try to get task with ID 0 first
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

  const handleCompleteTask = async () => {
    if (!account || !walletClient || !taskId) return
    try {
      const { request } = await publicClient.simulateContract({
        account,
        address: contractAddress,
        abi: contractAbi,
        functionName: 'completeTask',
        args: [BigInt(taskId)]
      })
      const hash = await walletClient.writeContract(request)
      console.log('Task completed:', hash)
    } catch (error) {
      console.error('Error completing task:', error)
    }
  }

  const handleGetTask = async () => {
    if (!taskId) return
    try {
      console.log('Attempting to get task with ID:', taskId)
      
      // First verify if the contract is deployed and accessible
      const code = await publicClient.getBytecode({ address: contractAddress })
      if (!code || code === '0x') {
        throw new Error('Contract not deployed at the specified address')
      }
      
      // Try to get the task
      const task = await contract.read.getTasks([BigInt(taskId)])
      console.log('Task retrieved successfully:', task)
      
      // Display task details in a more readable format
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

  return (
    <div className="p-4 max-w-xl mx-auto">
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
