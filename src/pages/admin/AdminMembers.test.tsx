import { useEffect } from 'react';
import { describe, expect, it } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../test/utils';
import { useAuth } from '../../context/AuthContext';
import { DEMO_PASSWORD } from '../../lib/demoAccounts';
import { AdminMembers } from './AdminMembers';

function LoggedInAdminMembers() {
  const { session, login } = useAuth();
  useEffect(() => {
    login('admin@vulkangym.com', DEMO_PASSWORD);
  }, [login]);
  if (!session) return null;
  return <AdminMembers />;
}

describe('AdminMembers', () => {
  it('adds a new member through the modal form', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoggedInAdminMembers />);

    await user.click(await screen.findByRole('button', { name: /nuevo miembro/i }));
    await user.type(screen.getByLabelText('Nombre'), 'Nueva Persona');
    await user.type(screen.getByLabelText('Correo'), 'nueva.persona@example.com');
    await user.click(screen.getByRole('button', { name: /agregar miembro/i }));

    expect(await screen.findByText('Nueva Persona')).toBeInTheDocument();
  });

  it('asks for confirmation before deleting a member', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoggedInAdminMembers />);

    await user.click((await screen.findAllByLabelText('Eliminar'))[0]);
    expect(await screen.findByText(/esta acción no se puede deshacer/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /cancelar/i }));
    expect(screen.queryByText(/esta acción no se puede deshacer/i)).not.toBeInTheDocument();
  });
});
