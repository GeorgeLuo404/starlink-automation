"use client";

import { startTransition, useId, useState } from "react";
import {
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type Announcements,
  type DndContextProps,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { toast } from "sonner";
import type { ActionState } from "@/lib/admin-actions";

/**
 * Drag-to-reorder for an admin list (dnd-kit): keeps a local copy so a drop
 * shows at once, saves the whole order, and puts it back if saving fails.
 * Mouse, touch and keyboard (space, arrows, space), announced in Chinese.
 * Spread `dndProps` on <DndContext> and wrap the items in a <SortableContext>.
 */
export function useReorder<T>({
  rows,
  getId,
  label,
  save,
}: {
  rows: T[];
  getId: (row: T) => string;
  /** What a row is called in the announcements. */
  label: (row: T) => string;
  /** Saves the order, ids top to bottom; leave it out to turn dragging off. */
  save?: (ids: string[]) => Promise<ActionState>;
}) {
  // Replaced whenever the server sends fresh rows (after any save, through revalidation).
  const [items, setItems] = useState(rows);
  const [synced, setSynced] = useState(rows);
  if (rows !== synced) {
    setSynced(rows);
    setItems(rows);
  }

  const id = useId();
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const position = (key: UniqueIdentifier) => items.findIndex((item) => getId(item) === key) + 1;
  const nameOf = (key: UniqueIdentifier) => {
    const item = items.find((row) => getId(row) === key);
    return item ? label(item) : "";
  };
  const announcements: Announcements = {
    onDragStart: ({ active }) => `已拿起「${nameOf(active.id)}」，当前第 ${position(active.id)} 位`,
    onDragOver: ({ active, over }) => (over ? `「${nameOf(active.id)}」移到第 ${position(over.id)} 位` : "不在列表内"),
    onDragEnd: ({ active, over }) => (over ? `「${nameOf(active.id)}」已放到第 ${position(over.id)} 位` : "已放下"),
    onDragCancel: () => "已取消拖动，顺序未改变",
  };

  function onDragEnd({ active, over }: DragEndEvent) {
    if (!save || !over || active.id === over.id) return;
    const before = items;
    const next = arrayMove(items, position(active.id) - 1, position(over.id) - 1);
    setItems(next);
    startTransition(async () => {
      const result = await save(next.map(getId));
      if (result.ok) {
        toast.success("顺序已保存");
      } else {
        setItems(before);
        toast.error(result.message ?? "顺序保存失败");
      }
    });
  }

  const dndProps: DndContextProps = {
    id,
    sensors,
    collisionDetection: closestCenter,
    onDragEnd,
    accessibility: {
      announcements,
      screenReaderInstructions: { draggable: "按空格键拿起，用方向键移动，再按空格键放下；按 Esc 取消。" },
    },
  };

  return { items, setItems, dndProps };
}
