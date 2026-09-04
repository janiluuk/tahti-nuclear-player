import { render } from '@testing-library/react';
import { AlertTriangleIcon } from 'lucide-react';

import { Alert } from './Alert';

describe('Alert', () => {
  it('(Snapshot) renders neutral by default', () => {
    const { container } = render(<Alert>Still processing.</Alert>);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('(Snapshot) renders every tone', () => {
    const { container } = render(
      <div className="flex flex-col gap-2">
        <Alert tone="neutral">Neutral message.</Alert>
        <Alert tone="info">Info message.</Alert>
        <Alert tone="warning">Warning message.</Alert>
        <Alert tone="success">Success message.</Alert>
        <Alert tone="error">Error message.</Alert>
      </div>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('(Snapshot) renders with a title and icon', () => {
    const { container } = render(
      <Alert
        tone="warning"
        icon={<AlertTriangleIcon size={16} aria-hidden />}
        title="Stripe is not connected"
      >
        Payouts cannot reach you until Connect shows payments ready.
      </Alert>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('defaults to role="alert" for the error tone', () => {
    const { getByRole } = render(<Alert tone="error">Failed.</Alert>);
    expect(getByRole('alert')).toBeInTheDocument();
  });

  it('defaults to role="status" for non-error tones', () => {
    const { getByRole } = render(<Alert tone="info">Heads up.</Alert>);
    expect(getByRole('status')).toBeInTheDocument();
  });

  it('allows an explicit role override', () => {
    const { getByRole } = render(
      <Alert tone="error" role="status">
        Failed, but not urgent.
      </Alert>,
    );
    expect(getByRole('status')).toBeInTheDocument();
  });
});
