import { Injectable } from '@nestjs/common';
import { Web3Service } from './web3.service';

@Injectable()
export class AppService {
  constructor(private readonly web3Service: Web3Service) {}

  async getTaskCount(): Promise<number> {
    return this.web3Service.getTaskCount();
  }

  async getTask(id: number): Promise<{
    title: string;
    description: string;
    dueDate: number;
    priority: number;
    isCompleted: boolean;
    owner: string;
  }> {
    return this.web3Service.getTask(id);
  }

  async addTask(
    title: string,
    description: string,
    dueDate: number,
    priority: number,
    value: string,
  ): Promise<void> {
    return this.web3Service.addTask(title, description, dueDate, priority, value);
  }

  async completeTask(taskId: number): Promise<void> {
    return this.web3Service.completeTask(taskId);
  }

  async getTasks(): Promise<any[]> {
    const taskCount = await this.web3Service.getTaskCount();
    const tasks: {
      id: number;
      title: string;
      description: string;
      dueDate: number;
      priority: number;
      isCompleted: boolean;
      owner: string;
    }[] = [];
    
    for (let i = 0; i < taskCount; i++) {
      try {
        const task = await this.web3Service.getTask(i);
        if (task && task.title) {
          tasks.push({ id: i, ...task });
        }
      } catch (error) {
        console.error(`Error fetching task ${i}:`, error);
        continue;
      }
    }
    
    return tasks;
  }
}