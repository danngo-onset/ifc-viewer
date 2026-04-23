import { useBimComponent } from "@/hooks/bim";

import { BimComponent } from "@/domain/enums/bim/BimComponent";

export const HistoryMenu = () => {
  const [fragmentsManager] = useBimComponent(BimComponent.FragmentsManager);
  const model = fragmentsManager.core.models.list.values().toArray()[0];

  let selectedRequestIndex: number = null;

  const updateHistoryMenu = async () => {
  const { requests, undoneRequests } = await fragmentsManager.core.editor.getModelRequests(
    model.modelId,
  );

  };

  return <div>HistoryMenu</div>;
};
