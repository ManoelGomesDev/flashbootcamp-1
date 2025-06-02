import { Card, CardContent, CardHeader } from "../ui/card";


interface StatusCardProps {
    title: string;
    amount: number;
}

export default function StatusCard({ title, amount }: StatusCardProps) {
    return (
        <Card>
            <CardHeader className="text-lg ">
                {title}
            </CardHeader>
            <CardContent>
                <p className="text-xl font-bold">{amount}</p>
            </CardContent>
        </Card>
    )
}