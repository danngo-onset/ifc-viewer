import { CrossButton } from "@/components/UI/buttons";

type Props = {
  title    : string;
  callback : () => void;
}

export const PanelHeader = ({ title, callback }: Props) => {
  return (
    <section className="flex items-center justify-between p-4 border-b bg-gray-50">
      <h2 className="text-sm font-semibold text-gray-700">{title}</h2>

      <CrossButton onClick={callback} />
    </section>
  );
};
