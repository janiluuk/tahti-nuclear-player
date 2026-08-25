import type { DiscoWidgetRenderItem } from '../../api/disco-widgets';
import { DiscoWidgetFrame } from './DiscoWidgetFrame';

export function DiscoWidgetsSection({
  widgets,
}: {
  widgets: DiscoWidgetRenderItem[];
}) {
  if (widgets.length === 0) {
    return null;
  }

  return (
    <section className="flex w-full flex-col gap-3">
      {widgets.map((widget) => (
        <DiscoWidgetFrame
          key={widget.installId}
          sandboxUrl={widget.sandboxUrl}
          name={widget.name}
          context={widget.context}
          config={widget.config}
        />
      ))}
    </section>
  );
}
