import { toast } from "sonner";

export const useNotifications = () => {
  const success = (message: string, description?: string) => {
    toast.success(message, { description, duration: 4000 });
  };

  const error = (message: string, description?: string) => {
    toast.error(message, { description, duration: 5000 });
  };

  const warning = (message: string, description?: string) => {
    toast.warning(message, { description, duration: 4000 });
  };

  const info = (message: string, description?: string) => {
    toast.info(message, { description, duration: 3000 });
  };

  const loading = (message: string) => {
    return toast.loading(message);
  };

  const promise = <T,>(
    promise: Promise<T>,
    opts: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ) => {
    return toast.promise(promise, opts);
  };

  const dismiss = (toastId?: string | number) => {
    toast.dismiss(toastId);
  };

  const taskCreated = (taskTitle: string) => {
    success("Tarefa criada!", `"${taskTitle}" foi adicionada com stake`);
  };

  const taskCompleted = (taskTitle: string) => {
    success("Tarefa completada!", `"${taskTitle}" - Stake recuperado`);
  };

  const contractError = (errorMessage?: string) => {
    error("Erro no contrato", errorMessage || "Erro ao interagir com o smart contract");
  };

  const walletConnected = (address: string) => {
    success("Carteira conectada!", `${address.slice(0, 6)}...${address.slice(-4)}`);
  };

  const walletDisconnected = () => {
    info("Carteira desconectada");
  };

  return {
    success, error, warning, info, loading, promise, dismiss,
    taskCreated, taskCompleted, contractError, walletConnected, walletDisconnected
  };
};