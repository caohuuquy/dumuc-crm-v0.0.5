import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Download,
  Trash2,
  Settings,
  Search,
  ChevronDown,
  FilePlus2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X,
  ArrowLeft,
} from 'lucide-react';

export interface CategoryWarehouseRecord {
  id: string;
  code: string;
  name: string;
  accountCode: string;
  manager: string;
  address: string;
  capacity?: string;
  isLocked: boolean;
  parentId?: string | null;
}

type DropPosition = 'before' | 'inside' | 'after';

const WAREHOUSE_MANAGER_OPTIONS = [
  'LÊ XUÂN NGUYÊN',
  'Chế Công Vinh',
  'Lê Thanh Trí',
  'Phạm Ngọc Lâm',
  'Nguyễn Hoàng Phúc',
  'Đặng Văn Lâm',
  'Nguyễn Hữu Ý',
  'Phan Khánh Tường',
];

const WAREHOUSE_ACCOUNT_OPTIONS = [
  { code: '152', label: '152 - Nguyên liệu, vật liệu' },
  { code: '1531', label: '1531 - Công cụ, dụng cụ' },
  { code: '155', label: '155 - Thành phẩm' },
  { code: '1561', label: '1561 - Giá mua hàng hóa' },
  { code: '1562', label: '1562 - Chi phí thu mua hàng hóa' },
  { code: '157', label: '157 - Hàng gửi đi bán' },
];

const STORAGE_KEY = 'category_warehouses_v1';

export const INITIAL_CATEGORY_WAREHOUSES: CategoryWarehouseRecord[] = [
  {
    id: 'wh-1',
    code: 'KHOCCDC',
    name: 'Kho CCDC',
    accountCode: '1531',
    manager: '',
    address: '',
    isLocked: false,
  },
  {
    id: 'wh-2',
    code: 'KHOVATTU',
    name: 'Kho vật tư',
    accountCode: '1561',
    manager: '',
    address: '',
    isLocked: false,
  },
];

export const CategoryWarehousesList: React.FC = () => {
  const [items, setItems] = useState<CategoryWarehouseRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Ignore storage read errors
    }
    return INITIAL_CATEGORY_WAREHOUSES;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore storage write errors
    }
  }, [items]);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState('20');
  const [currentPage, setCurrentPage] = useState(1);

  // Add modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    code: '',
    name: '',
    accountCode: '',
    manager: '',
    capacity: '',
    address: '',
    isLocked: false,
  });
  const [addError, setAddError] = useState('');

  // Warehouse Diagram (Sơ đồ kho) view & drag-and-drop state
  const [isDiagramOpen, setIsDiagramOpen] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<{
    id: string;
    position: DropPosition;
  } | null>(null);
  const [isRootDropActive, setIsRootDropActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.code.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q)
    );
  }, [items, searchQuery]);

  const pageSize = Number(rowsPerPage) || 20;
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedItems = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, safeCurrentPage, pageSize]);

  const displayStart =
    filteredItems.length === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1;
  const displayEnd = Math.min(safeCurrentPage * pageSize, filteredItems.length);

  const isAllPageSelected =
    paginatedItems.length > 0 &&
    paginatedItems.every((item) => selectedIds.includes(item.id));

  const handleToggleAll = () => {
    if (isAllPageSelected) {
      const pageIds = new Set(paginatedItems.map((i) => i.id));
      setSelectedIds((prev) => prev.filter((id) => !pageIds.has(id)));
    } else {
      const merged = new Set([...selectedIds, ...paginatedItems.map((i) => i.id)]);
      setSelectedIds(Array.from(merged));
    }
  };

  const handleToggleRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleLocked = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isLocked: !item.isLocked } : item
      )
    );
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    const deletedSet = new Set(selectedIds);
    setItems((prev) =>
      prev
        .filter((item) => !deletedSet.has(item.id))
        .map((item) =>
          item.parentId && deletedSet.has(item.parentId)
            ? { ...item, parentId: null }
            : item
        )
    );
    setSelectedIds([]);
  };

  const handleExportExcel = () => {
    const headers = ['Mã', 'Tên', 'TK kho', 'Người quản lý', 'Địa chỉ', 'Khóa'];
    const rows = filteredItems.map((row) => [
      `"${row.code.replace(/"/g, '""')}"`,
      `"${row.name.replace(/"/g, '""')}"`,
      `"${row.accountCode.replace(/"/g, '""')}"`,
      `"${row.manager.replace(/"/g, '""')}"`,
      `"${row.address.replace(/"/g, '""')}"`,
      row.isLocked ? 'Có' : 'Không',
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([new Uint8Array([0xef, 0xbb, 0xbf]), csvContent], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'danh_sach_kho.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportExcelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;
      const lines = text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);
      if (lines.length <= 1) return;
      const imported: CategoryWarehouseRecord[] = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map((c) => c.replace(/^"|"$/g, '').trim());
        if (cols[0] || cols[1]) {
          imported.push({
            id: `wh-imp-${Date.now()}-${i}`,
            code: cols[0] || `KHO${Date.now()}${i}`,
            name: cols[1] || '',
            accountCode: cols[2] || '',
            manager: cols[3] || '',
            address: cols[4] || '',
            isLocked:
              cols[5]?.toLowerCase() === 'có' || cols[5]?.toLowerCase() === 'true',
          });
        }
      }
      if (imported.length > 0) {
        setItems((prev) => [...imported, ...prev]);
        setCurrentPage(1);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const resetAddForm = () => {
    setAddForm({
      code: '',
      name: '',
      accountCode: '',
      manager: '',
      capacity: '',
      address: '',
      isLocked: false,
    });
    setAddError('');
  };

  const handleOpenAddModal = () => {
    resetAddForm();
    setIsAddModalOpen(true);
  };

  const saveWarehouse = (keepOpen: boolean) => {
    if (!addForm.name.trim()) {
      setAddError('Vui lòng nhập Tên kho.');
      return;
    }
    const newItem: CategoryWarehouseRecord = {
      id: `wh-${Date.now()}`,
      code: addForm.code.trim() || `KHO${String(Date.now()).slice(-4)}`,
      name: addForm.name.trim(),
      accountCode: addForm.accountCode.trim(),
      manager: addForm.manager.trim(),
      capacity: addForm.capacity.trim(),
      address: addForm.address.trim(),
      isLocked: addForm.isLocked,
    };
    setItems((prev) => [newItem, ...prev]);
    setCurrentPage(1);
    if (keepOpen) {
      resetAddForm();
    } else {
      setIsAddModalOpen(false);
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveWarehouse(false);
  };

  // --- Warehouse Diagram (Sơ đồ kho) helpers ---
  const itemIdsSet = useMemo(() => new Set(items.map((i) => i.id)), [items]);

  const getNormalizedParentId = (item: CategoryWarehouseRecord): string | null => {
    if (!item.parentId || !itemIdsSet.has(item.parentId) || item.parentId === item.id) {
      return null;
    }
    return item.parentId;
  };

  const isDescendant = (potentialDescendantId: string, ancestorId: string): boolean => {
    const byId = new Map<string, CategoryWarehouseRecord>(
      items.map((item) => [item.id, item])
    );
    const visited = new Set<string>();
    let current = byId.get(potentialDescendantId);
    while (current && current.parentId && !visited.has(current.id)) {
      visited.add(current.id);
      if (current.parentId === ancestorId) return true;
      current = byId.get(current.parentId);
    }
    return false;
  };

  const childrenMap = useMemo(() => {
    const map = new Map<string | null, CategoryWarehouseRecord[]>();
    for (const item of items) {
      const pid =
        item.parentId && itemIdsSet.has(item.parentId) && item.parentId !== item.id
          ? item.parentId
          : null;
      const list = map.get(pid) || [];
      list.push(item);
      map.set(pid, list);
    }
    return map;
  }, [items, itemIdsSet]);

  const draggingItem = useMemo(
    () => (draggingId ? items.find((i) => i.id === draggingId) || null : null),
    [draggingId, items]
  );

  const clearDragState = () => {
    setDraggingId(null);
    setDropTarget(null);
    setIsRootDropActive(false);
  };

  const handleDropOnNode = (
    dragId: string,
    targetId: string,
    position: DropPosition
  ) => {
    if (!dragId || dragId === targetId || isDescendant(targetId, dragId)) {
      clearDragState();
      return;
    }

    setItems((prev) => {
      const dragNode = prev.find((i) => i.id === dragId);
      const targetNode = prev.find((i) => i.id === targetId);
      if (!dragNode || !targetNode) return prev;

      const validIds = new Set(prev.map((i) => i.id));
      const targetParentId =
        targetNode.parentId &&
        validIds.has(targetNode.parentId) &&
        targetNode.parentId !== targetNode.id
          ? targetNode.parentId
          : null;

      const newParentId = position === 'inside' ? targetNode.id : targetParentId;
      const updatedDragNode: CategoryWarehouseRecord = {
        ...dragNode,
        parentId: newParentId,
      };

      const withoutDragged = prev.filter((i) => i.id !== dragId);
      if (position === 'inside') {
        return [...withoutDragged, updatedDragNode];
      }

      const targetIdx = withoutDragged.findIndex((i) => i.id === targetId);
      if (targetIdx === -1) {
        return [...withoutDragged, updatedDragNode];
      }

      const insertIdx = position === 'before' ? targetIdx : targetIdx + 1;
      const next = [...withoutDragged];
      next.splice(insertIdx, 0, updatedDragNode);
      return next;
    });

    clearDragState();
  };

  const handleDropToRoot = (dragId: string) => {
    if (!dragId) {
      clearDragState();
      return;
    }
    setItems((prev) => {
      const dragNode = prev.find((i) => i.id === dragId);
      if (!dragNode) return prev;
      const updatedDragNode: CategoryWarehouseRecord = {
        ...dragNode,
        parentId: null,
      };
      return [...prev.filter((i) => i.id !== dragId), updatedDragNode];
    });
    clearDragState();
  };

  const renderDiagramNodes = (
    nodes: CategoryWarehouseRecord[]
  ): React.ReactNode => {
    if (nodes.length === 0) return null;
    const multipleSiblings = nodes.length > 1;

    return (
      <div className="flex items-start justify-center">
        {nodes.map((node, idx) => {
          const children = childrenMap.get(node.id) || [];
          const isFirst = idx === 0;
          const isLast = idx === nodes.length - 1;
          const isDraggingThis = draggingId === node.id;
          const isDropInside =
            dropTarget?.id === node.id && dropTarget.position === 'inside';
          const isDropBefore =
            dropTarget?.id === node.id && dropTarget.position === 'before';
          const isDropAfter =
            dropTarget?.id === node.id && dropTarget.position === 'after';

          return (
            <div
              key={node.id}
              className="flex flex-col items-center relative px-2.5"
            >
              {/* Top connector bar (matching screenshot rounded elbows) */}
              {multipleSiblings && (
                <div className="relative w-full h-5">
                  {isFirst && (
                    <div className="absolute top-0 left-1/2 right-0 bottom-0 border-t-[1.5px] border-l-[1.5px] border-[#CBD5E1] rounded-tl-[6px]" />
                  )}
                  {isLast && (
                    <div className="absolute top-0 left-0 right-1/2 bottom-0 border-t-[1.5px] border-r-[1.5px] border-[#CBD5E1] rounded-tr-[6px]" />
                  )}
                  {!isFirst && !isLast && (
                    <>
                      <div className="absolute top-0 left-0 right-0 border-t-[1.5px] border-[#CBD5E1]" />
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1.5px] h-full bg-[#CBD5E1]" />
                    </>
                  )}
                </div>
              )}

              {/* Draggable Warehouse Card */}
              <div className="relative flex items-center">
                {/* Left sibling drop indicator */}
                {isDropBefore && (
                  <div className="absolute -left-2 top-1 bottom-1 w-1 rounded-full bg-[#1677FF] shadow-[0_0_8px_rgba(22,119,255,0.6)] z-20 pointer-events-none" />
                )}

                <div
                  draggable
                  onDragStart={(e) => {
                    e.stopPropagation();
                    setDraggingId(node.id);
                    e.dataTransfer.effectAllowed = 'move';
                    e.dataTransfer.setData('text/plain', node.id);
                  }}
                  onDragEnd={() => {
                    clearDragState();
                  }}
                  onDragOver={(e) => {
                    if (
                      !draggingId ||
                      draggingId === node.id ||
                      isDescendant(node.id, draggingId)
                    ) {
                      return;
                    }
                    e.preventDefault();
                    e.stopPropagation();
                    e.dataTransfer.dropEffect = 'move';
                    setIsRootDropActive(false);

                    const rect = e.currentTarget.getBoundingClientRect();
                    const relX = (e.clientX - rect.left) / rect.width;
                    let position: DropPosition = 'inside';
                    if (relX < 0.24) {
                      position = 'before';
                    } else if (relX > 0.76) {
                      position = 'after';
                    }
                    if (
                      dropTarget?.id !== node.id ||
                      dropTarget?.position !== position
                    ) {
                      setDropTarget({ id: node.id, position });
                    }
                  }}
                  onDragLeave={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                      setDropTarget((prev) =>
                        prev?.id === node.id ? null : prev
                      );
                    }
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const dragId =
                      draggingId || e.dataTransfer.getData('text/plain');
                    const position =
                      dropTarget?.id === node.id
                        ? dropTarget.position
                        : 'inside';
                    handleDropOnNode(dragId, node.id, position);
                  }}
                  className={`w-[154px] min-h-[76px] bg-white rounded-[12px] px-3 py-3 flex flex-col items-center justify-center text-center transition-all select-none cursor-grab active:cursor-grabbing ${
                    isDraggingThis
                      ? 'opacity-45 scale-95 border border-dashed border-[#1677FF] shadow-none'
                      : isDropInside
                      ? 'border-2 border-[#1677FF] bg-[#F0F7FF] shadow-[0_6px_18px_rgba(22,119,255,0.18)] scale-[1.03]'
                      : 'border border-gray-100 shadow-[0_3px_12px_rgba(15,23,42,0.08)] hover:shadow-[0_6px_16px_rgba(15,23,42,0.12)] hover:border-blue-200'
                  }`}
                  title="Kéo thả để thay đổi vị trí hoặc cấp kho"
                >
                  {/* Blue archive/warehouse box icon matching screenshot */}
                  <svg
                    className="w-[15px] h-[15px] text-[#1D6FE2] shrink-0 mb-1.5"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                  >
                    <rect x="1.5" y="2" width="13" height="3" rx="0.8" />
                    <path d="M2.5 6h11v7a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1V6zm3.5 2a.6.6 0 0 0 0 1.2h4a.6.6 0 0 0 0-1.2H6z" />
                  </svg>
                  <div className="text-[12.5px] font-semibold text-[#1E293B] leading-snug break-words w-full">
                    {node.name}
                  </div>
                  <div className="text-[11px] font-medium text-[#64748B] mt-0.5 break-all w-full">
                    {node.code}
                  </div>
                </div>

                {/* Right sibling drop indicator */}
                {isDropAfter && (
                  <div className="absolute -right-2 top-1 bottom-1 w-1 rounded-full bg-[#1677FF] shadow-[0_0_8px_rgba(22,119,255,0.6)] z-20 pointer-events-none" />
                )}
              </div>

              {/* Vertical stem down to children */}
              {children.length > 0 && (
                <>
                  <div
                    className={`w-[1.5px] bg-[#CBD5E1] ${
                      children.length === 1 ? 'h-6' : 'h-5'
                    }`}
                  />
                  {renderDiagramNodes(children)}
                </>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  if (isDiagramOpen) {
    const rootNodes = childrenMap.get(null) || [];
    const canDropToRoot = Boolean(
      draggingItem && getNormalizedParentId(draggingItem) !== null
    );

    return (
      <div className="flex flex-col h-[calc(100vh-64px)] bg-white text-[13px] text-gray-800 px-4 pt-3 pb-5 overflow-hidden">
        {/* Diagram Header */}
        <div className="flex items-center justify-between mb-3 shrink-0">
          <h2 className="text-[18px] font-semibold text-[#1E293B] tracking-tight">
            Sơ đồ kho
          </h2>
          <button
            type="button"
            onClick={() => {
              clearDragState();
              setIsDiagramOpen(false);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] border border-gray-200 bg-white hover:bg-gray-50 text-[13px] font-medium text-gray-700 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-gray-500" />
            <span>Quay lại danh sách</span>
          </button>
        </div>

        {/* Diagram Canvas */}
        <div
          onDragOver={(e) => {
            if (!canDropToRoot) return;
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            setDropTarget(null);
            if (!isRootDropActive) setIsRootDropActive(true);
          }}
          onDragLeave={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node)) {
              setIsRootDropActive(false);
            }
          }}
          onDrop={(e) => {
            if (!canDropToRoot) return;
            e.preventDefault();
            const dragId = draggingId || e.dataTransfer.getData('text/plain');
            handleDropToRoot(dragId);
          }}
          className={`flex-1 rounded-[14px] overflow-auto px-8 py-10 relative transition-colors ${
            isRootDropActive
              ? 'bg-[#EFF6FF] ring-2 ring-inset ring-[#1677FF]/40'
              : 'bg-[#F8F9FB]'
          }`}
        >
          {canDropToRoot && (
            <div className="flex justify-center mb-6">
              <div
                className={`px-4 py-1.5 rounded-full text-[12px] font-medium border border-dashed transition-colors ${
                  isRootDropActive
                    ? 'bg-[#1677FF] text-white border-[#1677FF]'
                    : 'bg-white text-[#1677FF] border-[#93C5FD]'
                }`}
              >
                Thả vào vùng trống để đưa kho lên cấp cao nhất
              </div>
            </div>
          )}

          {rootNodes.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-400 text-[13.5px]">
              Chưa có dữ liệu kho để hiển thị sơ đồ
            </div>
          ) : (
            <div className="min-w-max flex justify-center">
              {renderDiagramNodes(rootNodes)}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-[#EEF2F6] text-[13px] text-gray-800 select-none">
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.xlsx,.xls"
        className="hidden"
        onChange={handleImportExcelChange}
      />

      {/* Top Action Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-white border-b border-gray-200 shrink-0 gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="bg-[#1677FF] hover:bg-blue-600 text-white px-3 py-1.5 rounded-[6px] text-[13px] font-medium flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <span className="w-4 h-4 rounded-full bg-white text-[#1677FF] inline-flex items-center justify-center font-bold text-xs leading-none">
              +
            </span>
            <span>Thêm</span>
          </button>

          <button
            type="button"
            onClick={() => setIsDiagramOpen(true)}
            className="bg-[#163E96] hover:bg-[#102E73] text-white px-3 py-1.5 rounded-[6px] text-[13px] font-medium flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <svg
              className="w-3.5 h-3.5 text-white shrink-0"
              viewBox="0 0 16 16"
              fill="currentColor"
            >
              <rect x="1.5" y="1.5" width="5.5" height="5.5" rx="1" />
              <rect x="9" y="1.5" width="5.5" height="5.5" rx="1" />
              <rect x="1.5" y="9" width="5.5" height="5.5" rx="1" />
            </svg>
            <span>Sơ đồ kho</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded-[6px] text-[13px] flex items-center gap-1.5 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <FilePlus2 className="w-3.5 h-3.5 text-gray-500" />
            <span>Nhập excel</span>
          </button>

          <button
            type="button"
            onClick={handleExportExcel}
            className="bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded-[6px] text-[13px] flex items-center gap-1.5 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-gray-600" />
            <span>Xuất excel</span>
          </button>

          <button
            type="button"
            disabled={selectedIds.length === 0}
            onClick={handleDeleteSelected}
            className={`p-1.5 rounded-[6px] transition-colors ${
              selectedIds.length > 0
                ? 'text-red-500 hover:bg-red-50 cursor-pointer'
                : 'text-gray-400 cursor-not-allowed'
            }`}
            title="Xóa"
          >
            <Trash2 className="w-4 h-4 fill-current" />
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Tìm mã, tên kho"
              className="w-[220px] bg-white border border-gray-200 rounded-[6px] pl-3 pr-8 py-1.5 text-[13px] text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#1677FF]"
            />
            <Search className="w-4 h-4 text-gray-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <button
            type="button"
            className="w-8 h-8 bg-white border border-gray-300 rounded-[6px] flex items-center justify-center text-[#1E3A8A] hover:bg-gray-50 transition-colors cursor-pointer"
            title="Cài đặt"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            type="button"
            className="w-8 h-8 bg-white border border-gray-300 rounded-[6px] flex items-center justify-center text-[#1E3A8A] hover:bg-gray-50 transition-colors cursor-pointer"
            title="Tùy chỉnh cột"
          >
            <svg
              className="w-4 h-4 text-[#1E3A8A]"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <rect x="4" y="5" width="4" height="14" rx="1" />
              <rect x="10" y="5" width="4" height="14" rx="1" />
              <rect x="16" y="5" width="4" height="14" rx="1" />
            </svg>
          </button>
        </div>
      </div>

      {/* Table Area */}
      <div className="flex-1 overflow-auto bg-white">
        <table className="w-full border-collapse text-[13px]">
          <thead className="bg-[#F8FAFC] sticky top-0 z-10">
            <tr className="text-gray-700 font-semibold text-[12.5px]">
              <th className="w-[44px] py-2.5 px-2 border-r border-b border-gray-200 text-center">
                <input
                  type="checkbox"
                  checked={isAllPageSelected}
                  onChange={handleToggleAll}
                  className="w-3.5 h-3.5 rounded border-gray-300 cursor-pointer accent-[#1677FF]"
                />
              </th>
              <th className="w-[110px] py-2.5 px-3 border-r border-b border-gray-200 text-left">
                Mã
              </th>
              <th className="w-[165px] py-2.5 px-3 border-r border-b border-gray-200 text-left">
                Tên
              </th>
              <th className="w-[115px] py-2.5 px-3 border-r border-b border-gray-200 text-left">
                TK kho
              </th>
              <th className="w-[140px] py-2.5 px-3 border-r border-b border-gray-200 text-left">
                Người quản lý
              </th>
              <th className="w-[230px] py-2.5 px-3 border-r border-b border-gray-200 text-left">
                Địa chỉ
              </th>
              <th className="w-[110px] py-2.5 px-3 border-r border-b border-gray-200 text-center">
                Khóa
              </th>
              <th className="py-2.5 px-3 border-b border-gray-200"></th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="py-10 text-center text-gray-400 text-[13px]"
                >
                  Không có dữ liệu phù hợp
                </td>
              </tr>
            ) : (
              paginatedItems.map((row) => {
                const isSelected = selectedIds.includes(row.id);
                return (
                  <tr
                    key={row.id}
                    className={`border-b border-gray-100 hover:bg-[#F4F7FA] transition-colors ${
                      isSelected ? 'bg-blue-50/40' : 'bg-white'
                    }`}
                  >
                    <td className="py-2.5 px-2 border-r border-gray-100 text-center align-middle">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleRow(row.id)}
                        className="w-3.5 h-3.5 rounded border-gray-300 cursor-pointer accent-[#1677FF]"
                      />
                    </td>
                    <td className="py-2.5 px-3 border-r border-gray-100 text-gray-800 align-middle">
                      {row.code}
                    </td>
                    <td className="py-2.5 px-3 border-r border-gray-100 text-gray-800 align-middle">
                      {row.name}
                    </td>
                    <td className="py-2.5 px-3 border-r border-gray-100 text-gray-800 align-middle">
                      {row.accountCode}
                    </td>
                    <td className="py-2.5 px-3 border-r border-gray-100 text-gray-800 align-middle">
                      {row.manager}
                    </td>
                    <td className="py-2.5 px-3 border-r border-gray-100 text-gray-800 align-middle">
                      {row.address}
                    </td>
                    <td className="py-2.5 px-3 border-r border-gray-100 text-center align-middle">
                      <input
                        type="checkbox"
                        checked={row.isLocked}
                        onChange={() => handleToggleLocked(row.id)}
                        className="w-3.5 h-3.5 rounded border-gray-300 cursor-pointer accent-[#1D4ED8]"
                      />
                    </td>
                    <td className="py-2.5 px-3"></td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Bottom Pagination Bar */}
      <div className="bg-white border-t border-gray-200 px-3 py-2 flex items-center justify-between shrink-0 text-[12px] text-gray-600">
        <div className="flex items-center gap-2">
          <span>Số dòng:</span>
          <div className="relative">
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(e.target.value);
                setCurrentPage(1);
              }}
              className="border border-gray-200 rounded-[6px] py-1 pl-2.5 pr-7 text-[12px] text-gray-700 bg-white appearance-none focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="20">20 Dòng</option>
              <option value="50">50 Dòng</option>
              <option value="100">100 Dòng</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setCurrentPage(1)}
            disabled={safeCurrentPage === 1}
            className="w-7 h-7 flex items-center justify-center rounded-[6px] text-gray-400 hover:text-gray-700 disabled:opacity-40 cursor-pointer"
          >
            <ChevronsLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={safeCurrentPage === 1}
            className="w-7 h-7 flex items-center justify-center rounded-[6px] text-gray-400 hover:text-gray-700 disabled:opacity-40 cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => setCurrentPage(page)}
              className={`w-7 h-7 flex items-center justify-center rounded-[6px] text-[12px] font-medium transition-colors cursor-pointer ${
                safeCurrentPage === page
                  ? 'border border-[#1677FF] text-[#1677FF] bg-[#EFF6FF] font-semibold'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {page}
            </button>
          ))}

          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={safeCurrentPage === totalPages}
            className="w-7 h-7 flex items-center justify-center rounded-[6px] text-gray-600 hover:bg-gray-100 disabled:opacity-40 cursor-pointer"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setCurrentPage(totalPages)}
            disabled={safeCurrentPage === totalPages}
            className="w-7 h-7 flex items-center justify-center rounded-[6px] text-gray-600 hover:bg-gray-100 disabled:opacity-40 cursor-pointer"
          >
            <ChevronsRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="border border-gray-200 rounded-[6px] px-3 py-1 bg-white text-[12px] text-gray-600">
          Hiển thị{' '}
          <strong className="font-semibold text-gray-800">
            {filteredItems.length === 0 ? '0' : `${displayStart}–${displayEnd}`}
          </strong>{' '}
          /{' '}
          <strong className="font-semibold text-gray-800">
            {filteredItems.length}
          </strong>{' '}
          kết quả
        </div>
      </div>

      {/* Add Warehouse Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 select-text">
          <div className="bg-[#FAFBFC] rounded-xl border border-gray-200 shadow-2xl w-full max-w-[660px] overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 pt-5 pb-3 flex items-center justify-between">
              <h3 className="text-[18px] font-semibold text-[#1E293B] leading-none">
                Kho
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="w-9 h-9 rounded-full border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
                title="Đóng"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleAddSubmit} className="px-6 pt-3 pb-6">
              <div className="grid grid-cols-12 gap-x-4 gap-y-4">
                {/* Row 1: Tên kho * | Mã kho */}
                <div className="col-span-12 sm:col-span-8">
                  <label className="block text-[13.5px] font-medium text-[#1E293B] mb-1.5">
                    Tên kho <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    autoFocus
                    value={addForm.name}
                    onChange={(e) => {
                      setAddForm({ ...addForm, name: e.target.value });
                      if (addError) setAddError('');
                    }}
                    placeholder="VD: Kho công ty"
                    className={`w-full bg-white border rounded-[8px] px-3.5 py-2 text-[14px] text-gray-800 placeholder-gray-400 focus:outline-none transition-shadow ${
                      addError
                        ? 'border-red-500 focus:ring-2 focus:ring-red-200'
                        : 'border-gray-200 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20'
                    }`}
                  />
                  {addError && (
                    <p className="mt-1 text-[12px] text-red-500">{addError}</p>
                  )}
                </div>

                <div className="col-span-12 sm:col-span-4">
                  <label className="block text-[13.5px] font-medium text-[#1E293B] mb-1.5">
                    Mã kho
                  </label>
                  <input
                    type="text"
                    value={addForm.code}
                    onChange={(e) =>
                      setAddForm({ ...addForm, code: e.target.value })
                    }
                    placeholder="Nhập hoặc tạo tự động"
                    className="w-full bg-white border border-gray-200 rounded-[8px] px-3.5 py-2 text-[14px] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 transition-shadow"
                  />
                </div>

                {/* Row 2: Người quản lý | Sức chứa (số lượng) */}
                <div className="col-span-12 sm:col-span-8">
                  <label className="block text-[13.5px] font-medium text-[#1E293B] mb-1.5">
                    Người quản lý
                  </label>
                  <div className="relative">
                    <select
                      value={addForm.manager}
                      onChange={(e) =>
                        setAddForm({ ...addForm, manager: e.target.value })
                      }
                      className="w-full bg-white border border-gray-200 rounded-[8px] pl-3.5 pr-9 py-2 text-[14px] text-gray-800 appearance-none focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 cursor-pointer"
                    >
                      <option value=""></option>
                      {WAREHOUSE_MANAGER_OPTIONS.map((mgr) => (
                        <option key={mgr} value={mgr}>
                          {mgr}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div className="col-span-12 sm:col-span-4">
                  <label className="block text-[13.5px] font-medium text-[#1E293B] mb-1.5">
                    Sức chứa (số lượng)
                  </label>
                  <input
                    type="text"
                    value={addForm.capacity}
                    onChange={(e) =>
                      setAddForm({ ...addForm, capacity: e.target.value })
                    }
                    className="w-full bg-white border border-gray-200 rounded-[8px] px-3.5 py-2 text-[14px] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 transition-shadow"
                  />
                </div>

                {/* Row 3: Địa chỉ / vị trí | Tài khoản kho */}
                <div className="col-span-12 sm:col-span-8">
                  <label className="block text-[13.5px] font-medium text-[#1E293B] mb-1.5">
                    Địa chỉ / vị trí
                  </label>
                  <input
                    type="text"
                    value={addForm.address}
                    onChange={(e) =>
                      setAddForm({ ...addForm, address: e.target.value })
                    }
                    className="w-full bg-white border border-gray-200 rounded-[8px] px-3.5 py-2 text-[14px] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 transition-shadow"
                  />
                </div>

                <div className="col-span-12 sm:col-span-4">
                  <label className="block text-[13.5px] font-medium text-[#1E293B] mb-1.5">
                    Tài khoản kho
                  </label>
                  <div className="relative">
                    <select
                      value={addForm.accountCode}
                      onChange={(e) =>
                        setAddForm({ ...addForm, accountCode: e.target.value })
                      }
                      className="w-full bg-white border border-gray-200 rounded-[8px] pl-3.5 pr-9 py-2 text-[14px] text-gray-800 appearance-none focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 cursor-pointer"
                    >
                      <option value=""></option>
                      {WAREHOUSE_ACCOUNT_OPTIONS.map((acc) => (
                        <option key={acc.code} value={acc.code}>
                          {acc.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-[14px] font-medium text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={() => saveWarehouse(true)}
                  className="px-5 py-2 bg-white border border-[#93C5FD] hover:bg-blue-50 text-[#2563EB] rounded-[8px] text-[14px] font-medium transition-colors cursor-pointer"
                >
                  Lưu &amp; thêm
                </button>
                <button
                  type="submit"
                  className="px-9 py-2 bg-[#2563EB] hover:bg-blue-700 text-white rounded-[8px] text-[14px] font-medium transition-colors shadow-xs cursor-pointer"
                >
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
