import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BioMetrix Pro - Sistema de Nutrición y Entrenamiento',
  description: 'Gestión nutricional clínica, expediente biométrico e hipertrofia deportiva con permalinks protegidos.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="h-full">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Geist:wght@100..900&family=Inter:wght@100..900&display=swap"
        />
      </head>
      <body className="min-h-full bg-background font-sans text-on-surface antialiased">
        {children}
      </body>
    </html>
  );
}
