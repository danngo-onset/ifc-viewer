import { CrossButton } from "@/components/ui/buttons";

import { useUiStore } from "@/store";

type Props = {
  title: string;
};

export const PanelHeader = ({ title }: Props) => {
  const closeNavRailPanel = useUiStore(s => s.closeNavRailPanel);

  return (
    <section className="flex items-center justify-between p-4 border-b bg-gray-50">
      <h2 className="text-sm font-semibold text-gray-700">{title}</h2>

      <CrossButton onClick={closeNavRailPanel} />
    </section>
  );
};
