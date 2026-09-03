import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { DropdownButton } from './DropdownButton';

describe('DropdownButton', () => {
  it('(Snapshot) renders the trigger, menu closed', () => {
    const { container } = render(
      <DropdownButton
        label="More"
        items={[{ id: 'a', label: 'Do A', onClick: vi.fn() }]}
      />,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('opens the menu and shows items on trigger click', async () => {
    const user = userEvent.setup();
    render(
      <DropdownButton
        label="More"
        items={[
          { id: 'a', label: 'Do A', onClick: vi.fn() },
          { id: 'b', label: 'Do B', onClick: vi.fn() },
        ]}
      />,
    );

    await user.click(screen.getByRole('button', { name: /more/i }));

    expect(screen.getByText('Do A')).toBeInTheDocument();
    expect(screen.getByText('Do B')).toBeInTheDocument();
  });

  it('calls the item onClick when an item is clicked', async () => {
    const user = userEvent.setup();
    const onClickA = vi.fn();
    render(
      <DropdownButton
        label="More"
        items={[{ id: 'a', label: 'Do A', onClick: onClickA }]}
      />,
    );

    await user.click(screen.getByRole('button', { name: /more/i }));
    await user.click(screen.getByText('Do A'));

    expect(onClickA).toHaveBeenCalledOnce();
  });

  it('disables an item when disabled is set', async () => {
    const user = userEvent.setup();
    const onClickA = vi.fn();
    render(
      <DropdownButton
        label="More"
        items={[{ id: 'a', label: 'Do A', onClick: onClickA, disabled: true }]}
      />,
    );

    await user.click(screen.getByRole('button', { name: /more/i }));
    const item = screen.getByText('Do A').closest('button')!;
    expect(item).toBeDisabled();
  });
});
