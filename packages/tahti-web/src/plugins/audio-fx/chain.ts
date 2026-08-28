import type { EditList, ProEditorPluginId } from '../../api/studio-types';

export function addPluginToChain(
  editList: EditList,
  pluginId: ProEditorPluginId,
): EditList {
  const pluginChain = editList.pluginChain ?? [];
  if (pluginChain.includes(pluginId)) {
    return editList;
  }
  return {
    ...editList,
    pluginChain: [...pluginChain, pluginId],
    [pluginId]: { ...editList[pluginId], enabled: true },
  };
}

export function removePluginFromChain(
  editList: EditList,
  pluginId: ProEditorPluginId,
): EditList {
  return {
    ...editList,
    pluginChain: (editList.pluginChain ?? []).filter((id) => id !== pluginId),
    [pluginId]: { ...editList[pluginId], enabled: false },
  };
}

export function reorderPluginChain(
  editList: EditList,
  draggedId: ProEditorPluginId,
  targetId: ProEditorPluginId,
): EditList {
  if (draggedId === targetId) {
    return editList;
  }
  const pluginChain = [...(editList.pluginChain ?? [])];
  const draggedIndex = pluginChain.indexOf(draggedId);
  const targetIndex = pluginChain.indexOf(targetId);
  if (draggedIndex === -1 || targetIndex === -1) {
    return editList;
  }
  pluginChain.splice(draggedIndex, 1);
  pluginChain.splice(targetIndex, 0, draggedId);
  return { ...editList, pluginChain };
}
