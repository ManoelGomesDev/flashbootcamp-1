import { Injectable } from '@nestjs/common';
import { createPublicClient, createWalletClient, http, parseAbi } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { anvil } from 'viem/chains';

// Definir o ABI diretamente para garantir o tipo correto
const todoListAbi = [
  {
    type: "function",
    name: "createTask",
    inputs: [
      { name: "_title", type: "string", internalType: "string" },
      { name: "_description", type: "string", internalType: "string" },
      { name: "_dueDate", type: "uint256", internalType: "uint256" },
      { name: "_priority", type: "uint256", internalType: "uint256" },
      { name: "_isCompleted", type: "bool", internalType: "bool" }
    ],
    outputs: [],
    stateMutability: "payable"
  },
  {
    type: "function",
    name: "completeTask",
    inputs: [{ name: "_taskId", type: "uint256", internalType: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "getTaskCount",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "tasks",
    inputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    outputs: [
      { name: "title", type: "string", internalType: "string" },
      { name: "description", type: "string", internalType: "string" },
      { name: "dueDate", type: "uint256", internalType: "uint256" },
      { name: "priority", type: "uint256", internalType: "uint256" },
      { name: "isCompleted", type: "bool", internalType: "bool" },
      { name: "owner", type: "address", internalType: "address" }
    ],
    stateMutability: "view"
  }
] as const;

@Injectable()
export class Web3Service {
  private readonly contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
  private readonly publicClient = createPublicClient({
    chain: anvil,
    transport: http('http://127.0.0.1:8545'),
  });
  private readonly walletClient = createWalletClient({
    chain: anvil,
    transport: http('http://127.0.0.1:8545'),
  });
  private readonly account = privateKeyToAccount('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80');

  async getTaskCount(): Promise<number> {
    try {
      const count = await this.publicClient.readContract({
        address: this.contractAddress,
        abi: todoListAbi,
        functionName: 'getTaskCount',
      }) as bigint;
      return Number(count);
    } catch (error) {
      console.error('Erro ao obter contagem de tarefas:', error);
      throw error;
    }
  }

  async getTask(id: number): Promise<{
    title: string;
    description: string;
    dueDate: number;
    priority: number;
    isCompleted: boolean;
    owner: string;
    value: string;
  }> {
    try {
      const task = await this.publicClient.readContract({
        address: this.contractAddress,
        abi: todoListAbi,
        functionName: 'tasks',
        args: [BigInt(id)],
      }) as [string, string, bigint, bigint, boolean, string];

      // Mapear prioridade para valor
      const getValueFromPriority = (priority: number): string => {
        switch (priority) {
          case 0: return '100';  // Alta
          case 1: return '50';   // Media
          case 2: return '25';   // Baixa
          case 3: return '10';   // Muito baixa
          default: return '100';
        }
      };

      return {
        title: task[0],
        description: task[1],
        dueDate: Number(task[2]),
        priority: Number(task[3]),
        isCompleted: task[4],
        owner: task[5],
        value: getValueFromPriority(Number(task[3]))
      };
    } catch (error) {
      console.error('Erro ao obter tarefa:', error);
      throw error;
    }
  }

  async addTask(
    title: string,
    description: string,
    dueDate: number,
    priority: number,
    value: string,
  ): Promise<void> {
    try {
      console.log('Criando tarefa com os seguintes dados:', {
        title,
        description,
        dueDate,
        priority,
        value
      });

      const hash = await this.walletClient.writeContract({
        account: this.account,
        address: this.contractAddress,
        abi: todoListAbi,
        functionName: 'createTask',
        args: [title, description, BigInt(dueDate), BigInt(priority), false],
        value: BigInt(value),
      });

      console.log('Hash da transação:', hash);
      const receipt = await this.publicClient.waitForTransactionReceipt({ hash });
      console.log('Recibo da transação:', receipt);
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      throw error;
    }
  }

  async completeTask(taskId: number): Promise<void> {
    try {
      const hash = await this.walletClient.writeContract({
        account: this.account,
        address: this.contractAddress,
        abi: todoListAbi,
        functionName: 'completeTask',
        args: [BigInt(taskId)],
      });
      await this.publicClient.waitForTransactionReceipt({ hash });
    } catch (error) {
      console.error('Erro ao completar tarefa:', error);
      throw error;
    }
  }
}