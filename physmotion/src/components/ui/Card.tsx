import type { HTMLAttributes } from 'react';

export default function Card({ className = '', ...rest }: HTMLAttributes<HTMLElement>) {
  return (
    <section className={`rounded-lg border border-ink/10 bg-white p-4 ${className}`} {...rest} />
  );
}
