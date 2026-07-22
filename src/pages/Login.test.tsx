import { describe, expect, it } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../test/utils';
import { Login } from './Login';
import { DEMO_PASSWORD } from '../lib/demoAccounts';

describe('Login', () => {
  it('shows an error for the wrong password', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Login />);

    await user.type(screen.getByLabelText('Correo'), 'admin@vulkangym.com');
    await user.type(screen.getByLabelText('Contraseña'), 'contraseña-incorrecta');
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    expect(await screen.findByText(/correo o contraseña incorrectos/i)).toBeInTheDocument();
  });

  it('logs a known demo account in and leaves the login form', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Login />);

    await user.type(screen.getByLabelText('Correo'), 'admin@vulkangym.com');
    await user.type(screen.getByLabelText('Contraseña'), DEMO_PASSWORD);
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    await waitFor(() => expect(screen.queryByLabelText('Correo')).not.toBeInTheDocument());
  });

  it('rejects an email that has no demo account', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Login />);

    await user.type(screen.getByLabelText('Correo'), 'nadie@nunca.com');
    await user.type(screen.getByLabelText('Contraseña'), DEMO_PASSWORD);
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    expect(await screen.findByText(/correo o contraseña incorrectos/i)).toBeInTheDocument();
  });
});
