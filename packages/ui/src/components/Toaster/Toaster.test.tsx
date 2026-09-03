import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { showNotificationToast, toast, Toaster } from './Toaster';

describe('Toaster', () => {
  it('(Snapshot) renders the host', () => {
    const { container } = render(<Toaster />);
    expect(container).toMatchSnapshot();
  });

  it('shows a toast message', async () => {
    render(<Toaster />);
    toast('Saved playlist');
    expect(await screen.findByText('Saved playlist')).toBeInTheDocument();
  });

  it('keeps a sticky toast until it is acknowledged', async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    render(<Toaster />);
    showNotificationToast('Theme is in review', {
      id: 'sticky-theme',
      description: 'An admin will decide soon.',
      sticky: true,
      actionLabel: 'Acknowledge',
      onAction,
    });

    expect(await screen.findByText('Theme is in review')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Acknowledge' }));
    expect(onAction).toHaveBeenCalledOnce();
  });
});
