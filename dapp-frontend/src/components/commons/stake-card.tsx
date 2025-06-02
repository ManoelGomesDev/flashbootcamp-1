"use client"

import { useState } from "react";

interface StakeCardProps {
    option: string;
    stake: number;
    onSelect: (option: string, value: string) => void;
    selected?: boolean;
}

export function StakeCard({ option, stake, onSelect, selected = false }: StakeCardProps) {
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

    // Configuração de cores para cada opção
    const getCardStyle = (option: string, selected: boolean) => {
        const baseClasses = "cursor-pointer flex flex-col items-center justify-center p-4 min-h-[100px] gap-2 rounded-lg border-2 transition-all duration-200 transform hover:scale-105";
        
        switch (option) {
            case 'fazer agora':
                return `${baseClasses} text-red-600 ${
                    selected 
                        ? 'bg-red-100 border-red-400 shadow-lg' 
                        : 'bg-red-50 hover:bg-red-100 border-red-200 hover:border-red-300 hover:shadow-md'
                }`;
            case 'agendar':
                return `${baseClasses} text-blue-600 ${
                    selected 
                        ? 'bg-blue-100 border-blue-400 shadow-lg' 
                        : 'bg-blue-50 hover:bg-blue-100 border-blue-200 hover:border-blue-300 hover:shadow-md'
                }`;
            case 'delegar':
                return `${baseClasses} text-yellow-600 ${
                    selected 
                        ? 'bg-yellow-100 border-yellow-400 shadow-lg' 
                        : 'bg-yellow-50 hover:bg-yellow-100 border-yellow-200 hover:border-yellow-300 hover:shadow-md'
                }`;
            case 'eliminar':
                return `${baseClasses} text-gray-600 ${
                    selected 
                        ? 'bg-gray-100 border-gray-400 shadow-lg' 
                        : 'bg-gray-50 hover:bg-gray-100 border-gray-200 hover:border-gray-300 hover:shadow-md'
                }`;
            default:
                return `${baseClasses} text-gray-600 bg-gray-50 hover:bg-gray-100 border-gray-200`;
        }
    };

    return (
        <div 
            className={getCardStyle(option, selected)}
            onClick={handleClick}
        >
            <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">Stake:</p>
                <p className="font-bold text-sm">{stake} ETH</p>
            </div>
            <div className="font-medium text-sm capitalize">
                {option}
            </div>
        </div>
    );
}