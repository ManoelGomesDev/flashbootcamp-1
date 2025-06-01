"use client"

import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Button } from "../ui/button";

interface StakeCardProps {
    option: string;
    stake: number;
    onSelect: (option: string, value: string) => void;
    selected?: boolean;
}

export function StakeCard({ option, stake, onSelect, selected = false }: StakeCardProps) {

    const [selectedOption, setSelectedOption] = useState<string>('fazer agora');
    const [stakeValue, setStakeValue] = useState<number>(0.1);

    const handleOptionSelect = (option: string, stake: number) => {
        setSelectedOption(option);
        setStakeValue(stake);
      };

    const getStakeValue = (option: string): string => {
        switch (option) {
            case 'fazer agora': return '100000';
            case 'agendar': return '50000';
            case 'delegar': return '10000';
            case 'eliminar': return '1000';
            default: return '100000';
        }
    };

    const handleClick = () => {
        onSelect(option, getStakeValue(option));
    };

    switch (option) {
        case 'fazer agora':
            return <Button 
                variant="default" 
                className={`cursor-pointer text-red-500 ${
                    selected ? 'bg-red-500/30' : 'bg-red-500/10 hover:bg-red-500/20'
                }`} 
                onClick={handleClick}
            >
                <p className="text-sm text-muted-foreground">Stake:</p>
                <p className="text-primary font-bold">{stake} ETH</p>
                Fazer Agora
            </Button>
        case 'agendar':
            return <Button 
                variant="default" 
                className={`cursor-pointer text-blue-500 ${
                    selected ? 'bg-blue-500/30' : 'bg-blue-500/10 hover:bg-blue-500/20'
                }`}
                onClick={handleClick}
            >
                <p className="text-sm text-muted-foreground">Stake:</p>
                <p className="text-primary font-bold">{stake} ETH</p>
                Agendar
            </Button>
        case 'delegar':
            return <Button 
                variant="default" 
                className={`cursor-pointer text-yellow-500 ${
                    selected ? 'bg-yellow-500/30' : 'bg-yellow-500/10 hover:bg-yellow-500/20'
                }`}
                onClick={handleClick}
            >
                <p className="text-sm text-muted-foreground">Stake:</p>
                <p className="text-primary font-bold">{stake} ETH</p>
                Delegar
            </Button>
        case 'eliminar':
            return <Button 
                variant="default" 
                className={`cursor-pointer text-black ${
                    selected ? 'bg-black/30' : 'bg-black/10 hover:bg-black/20'
                }`}
                onClick={handleClick}
            >
                <p className="text-sm text-muted-foreground">Stake:</p>
                <p className="text-primary font-bold">{stake} ETH</p>
                Eliminar
            </Button>
    }

    return (
        <div
        onClick={() => handleOptionSelect('fazer agora', 0.1)}
        className={`cursor-pointer rounded-xl border ${
          selectedOption === 'fazer agora' ? 'border-primary' : ''
        }`}
      >
        <label className="flex flex-col items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <div className={`w-4 h-4 border rounded-full flex items-center justify-center ${
              selectedOption === 'fazer agora' ? 'bg-primary' : ''
            }`}>
              <div className={`w-2 h-2 rounded-full bg-white ${
                selectedOption === 'fazer agora' ? 'block' : 'hidden'
              }`} />
            </div>
            {option}
          </div>
          <div className="text-center mt-4">
            <p className="text-sm text-muted-foreground">Stake:</p>
            <p className="text-primary font-bold">{stake} ETH</p>
          </div>
        </label>
      </div>
    )
}