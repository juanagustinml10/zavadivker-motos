import * as React from 'react';
import { MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WhatsAppButtonProps {
  phone: string;
  message: string;
  label?: string;
  className?: string;
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  phone,
  message,
  label = 'Consultar por WhatsApp',
  className,
}) => {
  const cleanPhone = phone.replace(/\s/g, '');
  const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn('btn btn-orange px-6', className)}
    >
      <MessageCircle size={17} />
      <span>{label}</span>
    </a>
  );
};
