'use client';

// 1. Importamos a tipagem oficial do projeto (Fonte Única da Verdade)
import { ProductStatus } from '@/types/ProductType'; 

interface StatusBadgeProps {
  status: ProductStatus | string; // aceita string para capturar valores inesperados
}

const statusConfig: Record<ProductStatus, { label: string; className: string }> = {
  valid: { label: 'Válido', className: 'bg-green-100 text-green-800 border-green-200' },
  alert: { label: 'Alerta', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  critical: { label: 'Crítico', className: 'bg-red-100 text-red-800 border-red-200' },
  expired: { label: 'Vencido', className: 'bg-gray-100 text-gray-800 border-gray-300' },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  // Normaliza o texto para evitar quebras por espaços ou letras maiúsculas
  const normalizedStatus = String(status).trim().toLowerCase() as ProductStatus;

  // Busca no dicionário ou usa o fallback "Desconhecido"
  const { label, className } = statusConfig[normalizedStatus] ?? {
    label: 'Desconhecido',
    className: 'bg-gray-200 text-gray-600 border-gray-400',
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}