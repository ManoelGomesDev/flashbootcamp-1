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
import { useNotifications } from "@/hooks/useNotifications";
import { Label } from "@/components/ui/label";

export default function Home() {
  const wallet = useWallet();
  const notify = useNotifications();
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
    value: '100'
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
      
      // Calcular total em Wei das tarefas não concluídas
      const uncompletedTasks = tasksData.filter(task => !task.isCompleted);
      const totalStake = uncompletedTasks.reduce((total, task) => {
        // Mapear prioridade para valores corretos em Wei
        const getWeiFromPriority = (priority: number): number => {
          switch (priority) {
            case 0: return 100;  // Alta - 100 wei
            case 1: return 50;   // Media - 50 wei  
            case 2: return 25;   // Baixa - 25 wei
            case 3: return 10;   // Muito baixa - 10 wei
            default: return 100;
          }
        };
        
        return total + getWeiFromPriority(task.priority);
      }, 0);
      setTotalStakeInCustody(totalStake);
      
    } catch (error) {
      console.error('Error loading tasks:', error);
      notify.error('Erro ao carregar tarefas', 'Não foi possível carregar as tarefas');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async () => {
    // Verificar se carteira está conectada
    if (!wallet.isClient || !wallet.isConnected) {
      notify.warning('Carteira não conectada', 'Por favor, conecte sua carteira primeiro');
      return;
    }

    // Validações
    if (!formData.title || !formData.description || !formData.dueDate) {
      notify.error('Campos obrigatórios', 'Por favor, preencha todos os campos');
      return;
    }

    const currentTimestamp = Math.floor(Date.now() / 1000);
    if (formData.dueDate <= currentTimestamp) {
      notify.error('Data inválida', 'A data de vencimento deve estar no futuro');
      return;
    }

    // Validar se um valor válido foi selecionado
    const validValues = ['100', '50', '25', '10'];
    if (!validValues.includes(formData.value)) {
      notify.error('Stake inválido', 'Por favor, selecione uma opção de stake válida');
      return;
    }

    try {
      const createPromise = taskService.createTask(formData);
      
      await notify.promise(createPromise, {
        loading: 'Criando tarefa...',
        success: 'Tarefa criada com sucesso!',
        error: 'Erro ao criar tarefa'
      });

      await loadTasks();
      setIsDialogOpen(false);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        dueDate: 0,
        priority: 0,
        value: '100'
      });

      notify.taskCreated(formData.title);
      
    } catch (error: any) {
      console.error('Error creating task:', error);
      notify.contractError(error.response?.data?.message);
    }
  };

  const handleCompleteTask = async (id: number) => {
    if (!canCreateTask()) {
      notify.warning('Carteira não conectada', 'Por favor, conecte sua carteira primeiro');
      return;
    }

    try {
      const task = tasks.find(t => t.id === id);
      const completePromise = taskService.completeTask(id);
      
      await notify.promise(completePromise, {
        loading: 'Completando tarefa...',
        success: 'Tarefa completada! Stake recuperado',
        error: 'Erro ao completar tarefa'
      });

      await loadTasks();
      
      if (task) {
        notify.taskCompleted(task.title);
      }
      
    } catch (error) {
      console.error('Error completing task:', error);
      notify.contractError('Erro ao completar tarefa. Tente novamente.');
    }
  };

  const handleStakeSelect = (option: string, value: string) => {
    let priority = 0;
    switch (option) {
      case 'alta':
        priority = 0;
        break;
      case 'media':
        priority = 1;
        break;
      case 'baixa':
        priority = 2;
        break;
      case 'muito baixa':
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
        <Button disabled className="cursor-pointer">
          <WalletIcon />
          Conectar Wallet
        </Button>
      );
    }

    if (!wallet.isMetaMaskInstalled) {
      return (
        <Button 
          onClick={() => {
            notify.info('Redirecionando...', 'Você será redirecionado para instalar o MetaMask');
            setTimeout(() => window.open('https://metamask.io/', '_blank'), 1000);
          }}
          className="bg-orange-500 hover:bg-orange-600 cursor-pointer"
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
          title="Clique para desconectar a carteira"
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

  // Função para verificar se pode criar tarefa
  const canCreateTask = () => {
    return wallet.isClient && wallet.isConnected && wallet.isMetaMaskInstalled;
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

      {/* Aviso quando carteira não está conectada */}
      {wallet.isClient && !wallet.isConnected && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-yellow-700 text-sm">
            ⚠️ Conecte sua carteira MetaMask para criar e gerenciar tarefas
          </p>
        </div>
      )}

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
        <StatusCard title="Wei em Stake" amount={totalStakeInCustody} />
      </div>
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Tarefas</h2>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              disabled={!canCreateTask()}
              className={`cursor-pointer ${!canCreateTask() ? 'opacity-50 cursor-not-allowed' : ''}`} 
              onClick={() => {
                if (!canCreateTask()) {
                  notify.warning('Carteira necessária', 'Por favor, conecte sua carteira primeiro');
                  return;
                }
                
                setIsDialogOpen(true);
                // Reset form com valores padrão válidos
                setFormData({
                  title: '',
                  description: '',
                  dueDate: 0,
                  priority: 0,
                  value: '100'
                });
              }}
              title={!canCreateTask() ? 'Conecte sua carteira para criar tarefas' : 'Criar nova tarefa'}
            >
              <PlusIcon />
              Nova Tarefa
              {!canCreateTask() && (
                <span className="ml-2 text-xs opacity-70">(Carteira necessária)</span>
              )}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Tarefa</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <Label>Título</Label>
              <Input 
                type="text" 
                placeholder="Título" 
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
              <Label>Descrição</Label>
              <Textarea 
                placeholder="Descrição" 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
              <Label>Data de vencimento</Label>
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
                  Selecionado: {formData.priority === 0 ? 'Alta' : 
                              formData.priority === 1 ? 'Media' :
                              formData.priority === 2 ? 'Baixa' : 'Muito baixa'} 
                  ({formData.value} wei)
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <StakeCard 
                  option="alta" 
                  stake={100} 
                  onSelect={handleStakeSelect}
                  selected={formData.priority === 0}
                />
                <StakeCard 
                  option="media" 
                  stake={50} 
                  onSelect={handleStakeSelect}
                  selected={formData.priority === 1}
                />
                <StakeCard 
                  option="baixa" 
                  stake={25}
                  onSelect={handleStakeSelect}
                  selected={formData.priority === 2}
                />
                <StakeCard 
                  option="muito baixa" 
                  stake={10} 
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
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <span className="ml-2">Carregando tarefas...</span>
          </div>
        ) : tasks.length > 0 ? (
          tasks.map((task) => {
            // Mapear prioridade para valores em Wei
            const getAmountFromPriority = (priority: number): number => {
              switch (priority) {
                case 0: return 100;  // Alta
                case 1: return 50;   // Media  
                case 2: return 25;   // Baixa
                case 3: return 10;   // Muito baixa
                default: return 100;
              }
            };

            return (
              <TaskCard 
                key={task.id} 
                {...task} 
                onComplete={() => handleCompleteTask(task.id)}
                createdAt={new Date().toLocaleDateString('pt-BR')}
                amount={getAmountFromPriority(task.priority)}
                walletConnected={canCreateTask()}
              />
            );
          })
        ) : (
          <div className="flex flex-col gap-4 items-center justify-center p-8">
            <p className="text-muted-foreground">Nenhuma tarefa encontrada</p>
            <p className="text-sm text-muted-foreground">
              Crie sua primeira tarefa para começar a usar o Web3 Todo!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
