import type { ReactElement, ReactNode } from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { DataProvider } from '../context/DataContext';
import { ToastProvider } from '../context/ToastContext';
import { AuthProvider } from '../context/AuthContext';

function AllProviders({ children }: { children: ReactNode }) {
  return (
    <MemoryRouter>
      <DataProvider>
        <ToastProvider>
          <AuthProvider>{children}</AuthProvider>
        </ToastProvider>
      </DataProvider>
    </MemoryRouter>
  );
}

export function renderWithProviders(ui: ReactElement) {
  return render(ui, { wrapper: AllProviders });
}

export * from '@testing-library/react';
