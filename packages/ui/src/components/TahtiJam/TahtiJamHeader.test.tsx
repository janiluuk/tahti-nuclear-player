import { render, screen } from '@testing-library/react';

import { TahtiJamHeader } from './TahtiJamHeader';

const labels = {
  connecting: 'Connecting',
  connected: 'Connected',
  reconnecting: 'Reconnecting',
  failed: 'Disconnected',
};

describe('TahtiJamHeader', () => {
  it('(Snapshot) renders the connected header', () => {
    const { container } = render(
      <TahtiJamHeader
        connectionStatus="connected"
        connectionStatusLabels={labels}
      />,
    );
    expect(container).toMatchSnapshot();
  });

  it('shows the label for the current connection status', () => {
    render(
      <TahtiJamHeader
        connectionStatus="reconnecting"
        connectionStatusLabels={labels}
      />,
    );

    expect(screen.getByTestId('connection-status-badge')).toHaveTextContent(
      'Reconnecting',
    );
  });

  it('shows the failed label when disconnected', () => {
    render(
      <TahtiJamHeader
        connectionStatus="failed"
        connectionStatusLabels={labels}
      />,
    );

    expect(screen.getByTestId('connection-status-badge')).toHaveTextContent(
      'Disconnected',
    );
  });
});
