import { CheckIcon, TrashIcon } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";

interface TaskCardProps {
    title: string;
    description: string;
    createdAt: string;
    dueDate: string | number;
    amount: number;
    isCompleted?: boolean;
    onComplete?: () => void;
    status?: 'fazer agora' | 'agendar' | 'concluído' | 'delegar';
}

export function TaskCard({ 
    title, 
    description, 
    createdAt, 
    dueDate, 
    amount, 
    status,
    isCompleted,
    onComplete 
}: TaskCardProps) {
    const formattedDueDate = typeof dueDate === 'number' 
        ? new Date(dueDate * 1000).toLocaleDateString('pt-BR')
        : dueDate;

    return (
        <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex gap-2">
                    <p className="text-xl font-bold text-muted-foreground">{title}</p>
                    <Badge variant={isCompleted ? "secondary" : "default"}>
                        {isCompleted ? "Concluído" : status || "Pendente"}
                    </Badge>
                </div>

                <div className="flex flex-row gap-2">
                    {!isCompleted && (
                        <Button variant="outline" onClick={onComplete} className="cursor-pointer">
                            <CheckIcon />
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-2">
                    <p className="text-md text-muted-foreground">{description}</p>
                </div>
            </CardContent>
            <CardFooter className="flex flex-row justify-between items-center">
                <div className="flex flex-row gap-2">
                    <p className="text-sm text-muted-foreground">Criado em: {createdAt}</p>
                    <p className="text-sm text-muted-foreground">Vence em: {formattedDueDate}</p>
                </div>
                <p className="text-sm text-muted-foreground">
                    {amount ? `${amount} ETH` : '0 ETH'}
                </p>
            </CardFooter>
        </Card>
    )
}