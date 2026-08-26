import type { Meta, StoryObj } from '@storybook/react-vite';
import { MermaidDiagram } from '@tahti-web/components/MermaidDiagram';

const meta: Meta<typeof MermaidDiagram> = {
  title: 'Tahti/Widgets/MermaidDiagram',
  component: MermaidDiagram,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Flowchart: Story = {
  args: {
    chart: `flowchart TD
  A[Listener opens Tahti] --> B{Signed in?}
  B -- No --> C[Sign up / log in]
  B -- Yes --> D[Browse channel directory]
  D --> E[Play a live channel]
  E --> F[Follow the artist]`,
  },
};

export const InvalidChart: Story = {
  name: 'Invalid chart (error state)',
  args: {
    chart: 'this is not a valid mermaid diagram {{{',
  },
};
