import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Task {
  id: number;
  title: string;
  description: string;
  dueDate: number;
  priority: number;
  isCompleted: boolean;
  owner: string;
  value: string;
}

export interface CreateTaskDTO {
  title: string;
  description: string;
  dueDate: number;
  priority: number;
  value: string;
}

export const taskService = {
  async getTasks(): Promise<Task[]> {
    const response = await api.get('/tasks');
    return response.data;
  },

  async getTask(id: number): Promise<Task> {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },

  async createTask(task: CreateTaskDTO): Promise<void> {
    await api.post('/tasks', task);
  },

  async completeTask(id: number): Promise<void> {
    await api.post(`/tasks/${id}/complete`);
  },

  async getTaskCount(): Promise<number> {
    const response = await api.get('/tasks/count');
    return response.data;
  }
}; 