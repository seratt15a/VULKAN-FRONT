import { useEffect } from 'react';
import { describe, expect, it } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../test/utils';
import { useAuth } from '../../context/AuthContext';
import { DEMO_PASSWORD } from '../../lib/demoAccounts';
import { MemberClasses } from './MemberClasses';

function LoggedInMemberClasses() {
  const { session, login } = useAuth();
  useEffect(() => {
    login('andres.reyes@gmail.com', DEMO_PASSWORD);
  }, [login]);
  if (!session) return null;
  return <MemberClasses />;
}

describe('MemberClasses booking', () => {
  it('lets a logged-in member reserve and cancel a class spot', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoggedInMemberClasses />);

    const card = (await screen.findByText('Hipertrofia Piernas')).closest('.gym-class-card');
    if (!card) throw new Error('class card not found');

    const reserveButton = () => (card.querySelector('button') as HTMLButtonElement);

    expect(reserveButton()).toHaveTextContent(/reservar/i);

    await user.click(reserveButton());
    expect(reserveButton()).toHaveTextContent(/cancelar reserva/i);

    await user.click(reserveButton());
    expect(reserveButton()).toHaveTextContent(/reservar/i);
  });
});
