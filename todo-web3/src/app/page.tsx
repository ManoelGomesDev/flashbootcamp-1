'use client'

import { StakeCard } from "@/components/commons/stake-card";
import StatusCard from "@/components/commons/status-card";
import { TaskCard } from "@/components/commons/task-card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PlusIcon, WalletIcon, CheckIcon, XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { taskService, type Task, type CreateTaskDTO } from "@/services/api";
import { useWallet } from "@/hooks/useWallet";

export default function Home() {
  const wallet = useWallet();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskCount, setTaskCount] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [totalStakeInCustody, setTotalStakeInCustody] = useState(0);
  const [formData, setFormData] = useState<CreateTaskDTO>({
    title: '',
    description: '',
    dueDate: 0,
    priority: 0,
    value: '100000'
  });

  useEffect(() => {
    loadTasks();
  }, []);

  // Mostrar erro da carteira se houver
  useEffect(() => {
    if (wallet.error) {
      alert(wallet.error);
    }
  }, [wallet.error]);

  const loadTasks = async () => {
    try {
      const [tasksData, count] = await Promise.all([
        taskService.getTasks(),
        taskService.getTaskCount()
      ]);
      setTasks(tasksData);
      setTaskCount(count);
      const completed = tasksData.filter(task => task.isCompleted).length;
      setCompletedTasks(completed);
      
      // Calcular total em ETH das tarefas não concluídas
      const uncompletedTasks = tasksData.filter(task => !task.isCompleted);
      const totalStake = uncompletedTasks.reduce((total, task) => {
        // Mapear prioridade para valores corretos em ETH
        const getEthFromPriority = (priority: number): number => {
          switch (priority) {
            case 0: return 0.1;   // fazer agora - 100000 wei
            case 1: return 0.05;  // agendar - 50000 wei  
            case 2: return 0.00001;  // delegar - 10000 wei
            case 3: return 0.001;  // eliminar - 1000 wei
            default: return 0.1;
          }
        };
        
        return total + getEthFromPriority(task.priority);
      }, 0);
      setTotalStakeInCustody(totalStake);
      
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async () => {
    try {
      // Verificar se carteira está conectada
      if (!wallet.isClient || !wallet.isConnected) {
        alert('Por favor, conecte sua carteira primeiro');
        return;
      }

      // Validações
      if (!formData.title || !formData.description || !formData.dueDate) {
        alert('Por favor, preencha todos os campos');
        return;
      }

      const currentTimestamp = Math.floor(Date.now() / 1000);
      if (formData.dueDate <= currentTimestamp) {
        alert('A data de vencimento deve estar no futuro');
        return;
      }

      // Validar se um valor válido foi selecionado
      const validValues = ['100000', '50000', '10000', '1000'];
      if (!validValues.includes(formData.value)) {
        alert('Por favor, selecione uma opção de stake válida');
        return;
      }

      // Debug: mostrar valores que serão enviados
      console.log('Dados que serão enviados:', formData);

      await taskService.createTask(formData);
      await loadTasks();
      setIsDialogOpen(false);
      // Reset form
      setFormData({
        title: '',
        description: '',
        dueDate: 0,
        priority: 0,
        value: '100000'
      });
    } catch (error: any) {
      console.error('Error creating task:', error);
      alert(error.response?.data?.message || 'Erro ao criar tarefa');
    }
  };

  const handleCompleteTask = async (id: number) => {
    try {
      if (!wallet.isClient || !wallet.isConnected) {
        alert('Por favor, conecte sua carteira primeiro');
        return;
      }
      
      await taskService.completeTask(id);
      await loadTasks();
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const handleStakeSelect = (option: string, value: string) => {
    let priority = 0;
    switch (option) {
      case 'fazer agora':
        priority = 0;
        break;
      case 'agendar':
        priority = 1;
        break;
      case 'delegar':
        priority = 2;
        break;
      case 'eliminar':
        priority = 3;
        break;
    }
    setFormData(prev => ({ ...prev, value, priority }));
  };

  // Renderizar botão da carteira
  const renderWalletButton = () => {
    // Mostrar botão padrão durante hidratação
    if (!wallet.isClient) {
      return (
        <Button disabled>
          <WalletIcon />
          Conectar Wallet
        </Button>
      );
    }

    if (!wallet.isMetaMaskInstalled) {
      return (
        <Button 
          onClick={() => window.open('https://metamask.io/', '_blank')}
          className="bg-orange-500 hover:bg-orange-600"
        >
          <WalletIcon />
          Instalar MetaMask
        </Button>
      );
    }

    if (wallet.isLoading) {
      return (
        <Button disabled>
          <WalletIcon className="animate-spin" />
          Conectando...
        </Button>
      );
    }

    if (wallet.isConnected) {
      return (
        <Button 
          onClick={wallet.disconnectWallet}
          className="bg-green-500 hover:bg-green-600 gap-2"
        >
          <CheckIcon size={16} />
          <span className="font-mono text-sm">{wallet.formatAddress}</span>
          <XIcon size={14} className="ml-1" />
        </Button>
      );
    }

    return (
      <Button onClick={wallet.connectWallet}>
        <WalletIcon />
        Conectar Wallet
      </Button>
    );
  };

  return (
    <div className="flex flex-col gap-4 max-w-7xl mx-auto pt-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Web3 Todo</h1>
          <h2 className="text-sm text-muted-foreground">Gerencie suas tarefas com Web3</h2>
        </div>
        {renderWalletButton()}
      </div>

      {/* Status de conexão */}
      {wallet.isClient && wallet.isConnected && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-green-700 text-sm">
            ✅ Carteira conectada: <span className="font-mono">{wallet.address}</span>
          </p>
        </div>
      )}

      <div className="grid grid-cols-4 gap-4">
        <StatusCard title="Total de Tarefas" amount={taskCount} />
        <StatusCard title="Tarefas Concluídas" amount={completedTasks} />
        <StatusCard title="Tarefas Pendentes" amount={taskCount - completedTasks} />
        <StatusCard title="ETH em Stake" amount={parseFloat(totalStakeInCustody.toFixed(6))} />
      </div>
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Tarefas</h2>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="cursor-pointer" 
              onClick={() => {
                if (!wallet.isClient || !wallet.isConnected) {
                  alert('Por favor, conecte sua carteira primeiro');
                  return;
                }
                
                setIsDialogOpen(true);
                // Reset form com valores padrão válidos
                setFormData({
                  title: '',
                  description: '',
                  dueDate: 0,
                  priority: 0,
                  value: '100000'
                });
              }}
            >
              <PlusIcon />
              Nova Tarefa
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Tarefa</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <Input 
                type="text" 
                placeholder="Título" 
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
              <Textarea 
                placeholder="Descrição" 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
              <Input 
                type="datetime-local" 
                placeholder="Data de vencimento"
                onChange={(e) => {
                  const date = new Date(e.target.value);
                  setFormData({...formData, dueDate: Math.floor(date.getTime() / 1000)});
                }}
              />
              <div className="mb-2">
                <p className="text-sm font-medium mb-2">Selecione o nível de prioridade:</p>
                <p className="text-xs text-muted-foreground">
                  Selecionado: {formData.priority === 0 ? 'Fazer Agora' : 
                              formData.priority === 1 ? 'Agendar' :
                              formData.priority === 2 ? 'Delegar' : 'Eliminar'} 
                  ({formData.value} wei)
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <StakeCard 
                  option="fazer agora" 
                  stake={0.1} 
                  onSelect={handleStakeSelect}
                  selected={formData.priority === 0}
                />
                <StakeCard 
                  option="agendar" 
                  stake={0.05} 
                  onSelect={handleStakeSelect}
                  selected={formData.priority === 1}
                />
                <StakeCard 
                  option="delegar" 
                  stake={0.00001}
                  onSelect={handleStakeSelect}
                  selected={formData.priority === 2}
                />
                <StakeCard 
                  option="eliminar" 
                  stake={0.001} 
                  onSelect={handleStakeSelect}
                  selected={formData.priority === 3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button className="cursor-pointer" onClick={handleCreateTask}>
                Salvar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div className="flex flex-col gap-4 mt-4 max-h-[600px] overflow-y-auto border-2 border-gray-200 rounded-md p-4">
        {loading ? (
          <p>Carregando...</p>
        ) : tasks.length > 0 ? (
          tasks.map((task) => {
            // Mapear prioridade para valores amigáveis em ETH
            const getAmountFromPriority = (priority: number): number => {
              switch (priority) {
                case 0: return 0.1;   // fazer agora
                case 1: return 0.05;  // agendar  
                case 2: return 0.00001;  // delegar
                case 3: return 0.001;  // eliminar
                default: return 0.1;
              }
            };

            return (
              <TaskCard 
                key={task.id} 
                {...task} 
                onComplete={() => handleCompleteTask(task.id)}
                createdAt={new Date().toLocaleDateString('pt-BR')}
                amount={getAmountFromPriority(task.priority)}
              />
            );
          })
        ) : (
          <div className="flex flex-col gap-4">
            <p className="text-muted-foreground">Nenhuma tarefa encontrada</p>
          </div>
        )}
      </div>
    </div>
  );
}
