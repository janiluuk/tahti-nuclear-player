import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import '@nuclearplayer/tailwind-config';

import { FilePicker } from '.';

const labels = {
  title: 'Audio file',
  description: 'MP3, WAV, FLAC, or AIFF',
  browse: 'Choose audio',
};

describe('FilePicker', () => {
  it('(Snapshot) renders empty and selected states', () => {
    const { container, rerender } = render(
      <FilePicker labels={labels} accept="audio/*" />,
    );
    expect(container.firstChild).toMatchSnapshot();

    rerender(
      <FilePicker
        labels={labels}
        accept="audio/*"
        selectedFiles={[new File(['audio'], 'demo.flac')]}
      />,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('passes selected files to a controlled picker', async () => {
    const onFiles = vi.fn();

    const ControlledPicker = () => {
      const [files, setFiles] = useState<readonly File[]>([]);
      return (
        <FilePicker
          labels={labels}
          accept="audio/*"
          selectedFiles={files}
          onFiles={(nextFiles) => {
            setFiles(nextFiles);
            onFiles(nextFiles);
          }}
        />
      );
    };

    render(<ControlledPicker />);
    const file = new File(['audio'], 'session.wav', { type: 'audio/wav' });
    await userEvent.upload(screen.getByLabelText('Audio file'), file);

    expect(onFiles).toHaveBeenCalledWith([file]);
    expect(screen.getByText('session.wav')).toBeInTheDocument();
  });
});
