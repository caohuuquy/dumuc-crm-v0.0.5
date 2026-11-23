import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Download,
  Trash2,
  Settings,
  ChevronDown,
  FilePlus2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Plus,
  X,
  HelpCircle,
} from 'lucide-react';
import { useFirestoreCollection } from '../firebase';

export interface DocumentTypeItem {
  id: string;
  name: string;
  note: string;
}

export interface DocumentStorageCategoryRecord {
  id: string;
  groupName: string;
  note: string;
  documentTypes: DocumentTypeItem[];
}

const STORAGE_KEY = 'document_storage_categories_v1';

export const INITIAL_DOCUMENT_STORAGE_CATEGORIES: DocumentStorageCategoryRecord[] = [
  {
    id: 'doc-cat-1',
    groupName: 'Hồ sơ Môi trường',
    note: '',
    documentTypes: [
      { id: 'dt-1-1', name: 'Giấy phép môi trường', note: '' },
      { id: 'dt-1-2', name: 'Báo cáo công tác bảo vệ môi trường định kỳ', note: '' },
      { id: 'dt-1-3', name: 'Sổ đăng ký chủ nguồn thải chất thải nguy hại', note: '' },
      { id: 'dt-1-4', name: 'Hợp đồng thu gom, vận chuyển & xử lý chất thải nguy hại', note: '' },
      { id: 'dt-1-5', name: 'Kết quả quan trắc môi trường định kỳ', note: '' },
    ],
  },
  {
    id: 'doc-cat-2',
    groupName: 'Hồ sơ Phòng cháy Chữa cháy',
    note: '',
    documentTypes: [
      { id: 'dt-2-1', name: 'Giấy chứng nhận thẩm duyệt thiết kế về PCCC', note: '' },
      { id: 'dt-2-2', name: 'Văn bản chấp thuận kết quả nghiệm thu về PCCC', note: '' },
      { id: 'dt-2-3', name: 'Phương án chữa cháy của cơ sở', note: '' },
      { id: 'dt-2-4', name: 'Biên bản kiểm tra an toàn PCCC định kỳ', note: '' },
      { id: 'dt-2-5', name: 'Chứng nhận huấn luyện nghiệp vụ PCCC & CNCH', note: '' },
    ],
  },
  {
    id: 'doc-cat-3',
    groupName: 'Hồ sơ thành lập',
    note: '',
    documentTypes: [
      { id: 'dt-3-1', name: 'Giấy chứng nhận đăng ký doanh nghiệp (GPKD)', note: '' },
      { id: 'dt-3-2', name: 'Điều lệ công ty', note: '' },
      { id: 'dt-3-3', name: 'Thông báo mẫu dấu & Tài khoản ngân hàng', note: '' },
    ],
  },
  {
    id: 'doc-cat-4',
    groupName: 'Hợp đồng',
    note: '',
    documentTypes: [
      { id: 'dt-4-1', name: 'Hợp đồng thuê mặt bằng / nhà xưởng', note: '' },
      { id: 'dt-4-2', name: 'Hợp đồng cung cấp phụ tùng & vật tư', note: '' },
      { id: 'dt-4-3', name: 'Hợp đồng liên kết đơn vị bảo hiểm', note: '' },
      { id: 'dt-4-4', name: 'Hợp đồng dịch vụ sửa chữa khách hàng doanh nghiệp', note: '' },
    ],
  },
  {
    id: 'doc-cat-5',
    groupName: 'Tài liệu HR',
    note: 'HR tài liệu',
    documentTypes: [
      { id: 'dt-5-1', name: 'Nội quy lao động & Quy chế công ty', note: 'HR tài liệu' },
    ],
  },
];

export const DocumentStorageCategoriesList: React.FC = () => {
  const loadInitialCategories = (): DocumentStorageCategoryRecord[] => {
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
    return INITIAL_DOCUMENT_STORAGE_CATEGORIES;
  };

  const [items, setItems] = useFirestoreCollection<DocumentStorageCategoryRecord>(
    'document_storage_categories_items',
    loadInitialCategories,
    'id',
    (syncedItems) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(syncedItems));
      } catch {
        // Ignore storage write errors
      }
    }
  );

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeRowId, setActiveRowId] = useState<string | null>(null);
  const [rowsPerPage, setRowsPerPage] = useState('20');
  const [currentPage, setCurrentPage] = useState(1);

  // Add / Edit modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formGroupName, setFormGroupName] = useState('');
  const [formNote, setFormNote] = useState('');
  const [formDocTypes, setFormDocTypes] = useState<DocumentTypeItem[]>([]);
  const [formError, setFormError] = useState('');
  const [detailError, setDetailError] = useState('');
  const [focusRowId, setFocusRowId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const pageSize = Number(rowsPerPage) || 20;
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedItems = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, safeCurrentPage, pageSize]);

  const activeRow = useMemo(
    () => items.find((item) => item.id === activeRowId) || null,
    [items, activeRowId]
  );

  const displayStart = items.length === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1;
  const displayEnd = Math.min(safeCurrentPage * pageSize, items.length);

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

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    setItems((prev) => prev.filter((item) => !selectedIds.includes(item.id)));
    if (activeRowId && selectedIds.includes(activeRowId)) {
      setActiveRowId(null);
    }
    setSelectedIds([]);
  };

  const handleExportExcel = () => {
    const headers = ['Tên nhóm', 'Số loại giấy tờ', 'Ghi chú'];
    const escapeCsv = (val: string) => `"${(val || '').replace(/"/g, '""')}"`;
    const rows = items.map((row) => [
      escapeCsv(row.groupName),
      String(row.documentTypes.length),
      escapeCsv(row.note),
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([new Uint8Array([0xef, 0xbb, 0xbf]), csvContent], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'phan_loai_luu_tru.csv');
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
      const imported: DocumentStorageCategoryRecord[] = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map((c) => c.replace(/^"|"$/g, '').trim());
        if (cols[0]) {
          imported.push({
            id: `doc-cat-imp-${Date.now()}-${i}`,
            groupName: cols[0].slice(0, 200),
            note: (cols[2] || '').slice(0, 1000),
            documentTypes: [],
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

  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormGroupName('');
    setFormNote('');
    setFormDocTypes([]);
    setFormError('');
    setDetailError('');
    setFocusRowId(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (record: DocumentStorageCategoryRecord) => {
    setEditingId(record.id);
    setFormGroupName(record.groupName || '');
    setFormNote(record.note || '');
    setFormDocTypes((record.documentTypes || []).map((dt) => ({ ...dt })));
    setFormError('');
    setDetailError('');
    setFocusRowId(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleAddDocTypeRow = () => {
    const newId = `draft-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setFormDocTypes((prev) => [...prev, { id: newId, name: '', note: '' }]);
    setFocusRowId(newId);
    if (detailError) setDetailError('');
  };

  useEffect(() => {
    if (!isModalOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'F2') {
        event.preventDefault();
        handleAddDocTypeRow();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  const handleRemoveDocTypeRow = (id: string) => {
    setFormDocTypes((prev) => prev.filter((r) => r.id !== id));
    if (detailError) setDetailError('');
  };

  const handleClearAllDocTypes = () => {
    setFormDocTypes([]);
    if (detailError) setDetailError('');
  };

  const saveModalRecord = (keepOpen: boolean) => {
    const trimmedName = formGroupName.trim();
    if (!trimmedName) {
      setFormError('Vui lòng nhập Tên nhóm.');
      return;
    }

    const hasIncompleteRow = formDocTypes.some(
      (dt) => !dt.name.trim() && dt.note.trim().length > 0
    );
    if (hasIncompleteRow) {
      setDetailError('Vui lòng nhập Tên loại tài liệu cho dòng đã điền mô tả.');
      return;
    }

    const cleanedDocTypes = formDocTypes
      .map((dt, idx) => ({
        id:
          dt.id && !dt.id.startsWith('draft-')
            ? dt.id.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128)
            : `dt-${Date.now()}-${idx}`,
        name: dt.name.trim().slice(0, 200),
        note: dt.note.trim().slice(0, 500),
      }))
      .filter((dt) => dt.name.length > 0)
      .slice(0, 100);

    if (editingId) {
      const updatedRecord: DocumentStorageCategoryRecord = {
        id: editingId,
        groupName: trimmedName.slice(0, 200),
        note: formNote.trim().slice(0, 1000),
        documentTypes: cleanedDocTypes,
      };
      setItems((prev) =>
        prev.map((item) => (item.id === editingId ? updatedRecord : item))
      );
    } else {
      const newRecord: DocumentStorageCategoryRecord = {
        id: `doc-cat-${Date.now()}`,
        groupName: trimmedName.slice(0, 200),
        note: formNote.trim().slice(0, 1000),
        documentTypes: cleanedDocTypes,
      };
      setItems((prev) => [newRecord, ...prev]);
      setCurrentPage(1);
    }

    if (keepOpen) {
      setEditingId(null);
      setFormGroupName('');
      setFormNote('');
      setFormDocTypes([]);
      setFormError('');
      setDetailError('');
      setFocusRowId(null);
    } else {
      handleCloseModal();
    }
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    saveModalRecord(false);
  };

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

      {/* Split Master-Detail Content */}
      <div className="flex-1 flex flex-col min-h-0 p-2">
        {/* Top Master Table Pane */}
        <div className="flex-1 min-h-0 bg-white rounded-[8px] border border-gray-200 overflow-auto">
          <table className="w-full border-collapse text-[13px] table-fixed min-w-[780px]">
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
                <th className="w-[195px] py-2.5 px-3 border-r border-b border-gray-200 text-left">
                  Tên nhóm
                </th>
                <th className="w-[120px] py-2.5 px-3 border-r border-b border-gray-200 text-center">
                  Số loại giấy tờ
                </th>
                <th className="w-[290px] py-2.5 px-3 border-r border-b border-gray-200 text-left">
                  Ghi chú
                </th>
                <th className="py-2.5 px-3 border-b border-gray-200"></th>
              </tr>
            </thead>
            <tbody>
              {paginatedItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-10 text-center text-gray-400 text-[13px]"
                  >
                    Không có dữ liệu phù hợp
                  </td>
                </tr>
              ) : (
                paginatedItems.map((row) => {
                  const isSelected = selectedIds.includes(row.id);
                  const isActive = activeRowId === row.id;
                  return (
                    <tr
                      key={row.id}
                      onClick={() => {
                        setActiveRowId(row.id);
                        handleOpenEditModal(row);
                      }}
                      className={`border-b border-gray-100 hover:bg-[#F4F7FA] transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-[#EFF6FF]'
                          : isSelected
                          ? 'bg-blue-50/40'
                          : 'bg-white'
                      }`}
                    >
                      <td
                        className="py-2.5 px-2 border-r border-gray-100 text-center align-middle"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleRow(row.id)}
                          className="w-3.5 h-3.5 rounded border-gray-300 cursor-pointer accent-[#1677FF]"
                        />
                      </td>
                      <td className="py-2.5 px-3 border-r border-gray-100 text-gray-800 align-middle whitespace-normal break-words">
                        {row.groupName}
                      </td>
                      <td className="py-2.5 px-3 border-r border-gray-100 text-gray-800 text-center align-middle tabular-nums">
                        {row.documentTypes.length}
                      </td>
                      <td className="py-2.5 px-3 border-r border-gray-100 text-gray-800 align-middle whitespace-normal break-words">
                        {row.note}
                      </td>
                      <td className="py-2.5 px-3"></td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Center Splitter Handle */}
        <div className="h-3 flex items-center justify-center shrink-0">
          <div className="flex flex-col items-center gap-[2px]">
            <span className="block w-8 h-[2px] rounded-full bg-[#2563EB]" />
            <span className="block w-12 h-[2px] rounded-full bg-[#2563EB]" />
          </div>
        </div>

        {/* Bottom Detail Pane */}
        <div className="h-[225px] shrink-0 bg-white rounded-[8px] border border-gray-200 flex flex-col overflow-hidden">
          {!activeRow ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
              <svg
                className="w-12 h-12 text-[#CBD5E1]"
                viewBox="0 0 64 56"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="4"
                  y="6"
                  width="56"
                  height="44"
                  rx="6"
                  stroke="currentColor"
                  strokeWidth="3.5"
                />
                <line
                  x1="4"
                  y1="18"
                  x2="60"
                  y2="18"
                  stroke="currentColor"
                  strokeWidth="3.5"
                />
                <circle cx="12" cy="12" r="2" fill="currentColor" />
                <circle cx="19" cy="12" r="2" fill="currentColor" />
                <circle cx="26" cy="12" r="2" fill="currentColor" />
                <path
                  d="M21 26L26 31M26 26L21 31"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <path
                  d="M38 26L43 31M43 26L38 31"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <path
                  d="M25 40C27.5 37 36.5 37 39 40"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
              <span className="mt-2.5 text-[13px] font-medium text-gray-700">
                Chọn một dòng bên trên
              </span>
            </div>
          ) : (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="px-3 py-2 bg-[#F8FAFC] border-b border-gray-200 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-[12.5px] font-semibold text-gray-800">
                    Danh sách loại giấy tờ — {activeRow.groupName}
                  </span>
                  <span className="text-[11.5px] text-gray-500">
                    ({activeRow.documentTypes.length} loại giấy tờ)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveRowId(null)}
                  className="text-gray-400 hover:text-gray-600 p-0.5 rounded cursor-pointer"
                  title="Đóng chi tiết"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex-1 overflow-auto">
                <table className="w-full border-collapse text-[13px]">
                  <thead className="bg-[#F8FAFC] sticky top-0">
                    <tr className="text-gray-700 font-semibold text-[12px]">
                      <th className="w-[54px] py-2 px-3 border-r border-b border-gray-200 text-center">
                        STT
                      </th>
                      <th className="w-[380px] py-2 px-3 border-r border-b border-gray-200 text-left">
                        Tên loại giấy tờ
                      </th>
                      <th className="py-2 px-3 border-b border-gray-200 text-left">
                        Ghi chú
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeRow.documentTypes.length === 0 ? (
                      <tr>
                        <td
                          colSpan={3}
                          className="py-8 text-center text-gray-400 text-[12.5px]"
                        >
                          Chưa có loại giấy tờ nào trong nhóm này
                        </td>
                      </tr>
                    ) : (
                      activeRow.documentTypes.map((dt, index) => (
                        <tr
                          key={dt.id}
                          className="border-b border-gray-100 hover:bg-[#F8FAFC]"
                        >
                          <td className="py-2 px-3 border-r border-gray-100 text-center text-gray-600 tabular-nums">
                            {index + 1}
                          </td>
                          <td className="py-2 px-3 border-r border-gray-100 text-gray-800">
                            {dt.name}
                          </td>
                          <td className="py-2 px-3 text-gray-600">{dt.note}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
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
            className="w-7 h-7 flex items-center justify-center rounded-[6px] text-gray-400 hover:text-gray-700 disabled:opacity-40 cursor-pointer"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setCurrentPage(totalPages)}
            disabled={safeCurrentPage === totalPages}
            className="w-7 h-7 flex items-center justify-center rounded-[6px] text-gray-400 hover:text-gray-700 disabled:opacity-40 cursor-pointer"
          >
            <ChevronsRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="border border-gray-200 rounded-[6px] px-3 py-1 bg-white text-[12px] text-gray-600">
          Hiển thị{' '}
          <strong className="font-semibold text-gray-800">
            {items.length === 0 ? '0' : `${displayStart}–${displayEnd}`}
          </strong>{' '}
          /{' '}
          <strong className="font-semibold text-gray-800">{items.length}</strong>{' '}
          kết quả
        </div>
      </div>

      {/* Add Group Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 select-text">
          <div className="bg-[#F8FAFC] rounded-xl border border-gray-200 shadow-2xl w-full max-w-[780px] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 pt-4 pb-3">
              <h2 className="text-[18px] font-semibold text-[#1E293B]">
                {editingId ? 'Chỉnh sửa phân loại lưu trữ' : 'Thêm phân loại lưu trữ'}
              </h2>
              <button
                type="button"
                onClick={handleCloseModal}
                className="w-9 h-9 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                title="Đóng"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="px-6 pb-5 pt-2 space-y-3.5" noValidate>
              {/* Tên nhóm */}
              <div>
                <label className="block text-[13px] font-semibold text-[#1E293B] mb-1.5">
                  Tên nhóm
                </label>
                <input
                  type="text"
                  maxLength={200}
                  value={formGroupName}
                  onChange={(e) => {
                    setFormGroupName(e.target.value);
                    if (formError) setFormError('');
                  }}
                  placeholder="Nhập tên nhóm tài liệu"
                  className={`w-full bg-white border rounded-[8px] px-3.5 py-2 text-[13.5px] text-gray-800 placeholder-[#94A3B8] focus:outline-none ${
                    formError
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-gray-200 focus:border-[#2563EB]'
                  }`}
                  autoFocus
                />
                {formError && (
                  <p className="text-[12px] text-red-500 mt-1">{formError}</p>
                )}
              </div>

              {/* Ghi chú */}
              <div>
                <label className="block text-[13px] font-semibold text-[#1E293B] mb-1.5">
                  Ghi chú
                </label>
                <textarea
                  value={formNote}
                  maxLength={1000}
                  onChange={(e) => setFormNote(e.target.value)}
                  rows={3}
                  className="w-full bg-white border border-gray-200 rounded-[8px] px-3.5 py-2 text-[13.5px] text-gray-800 placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB] resize-none overflow-hidden"
                />
              </div>

              {/* Chi tiết các loại giấy tờ */}
              <div>
                <label className="block text-[13px] font-semibold text-[#1E293B] mb-1.5">
                  Chi tiết các loại giấy tờ
                </label>

                <div className="bg-white border border-gray-200 rounded-[10px] overflow-hidden">
                  <table className="w-full table-fixed border-collapse text-[13px]">
                    <thead className="bg-[#F1F5F9]">
                      <tr className="text-[#1E293B] font-semibold border-b border-[#BFDBFE]">
                        <th className="w-[46px] py-2.5 px-2 border-r border-gray-200"></th>
                        <th className="w-[48px] py-2.5 px-2 border-r border-gray-200 text-center">
                          #
                        </th>
                        <th className="w-[54%] py-2.5 px-3 border-r border-[#93C5FD]/70 text-left">
                          Tên loại tài liệu <span className="text-red-500">*</span>
                        </th>
                        <th className="py-2.5 px-3 text-left">Mô tả</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formDocTypes.map((dt, idx) => (
                        <tr
                          key={dt.id}
                          className="border-b border-gray-100 hover:bg-[#F8FAFC]"
                        >
                          <td className="py-1.5 px-2 border-r border-dashed border-gray-200 text-center align-middle">
                            <button
                              type="button"
                              onClick={() => handleRemoveDocTypeRow(dt.id)}
                              className="p-1 text-gray-400 hover:text-red-500 rounded cursor-pointer"
                              title="Xóa dòng"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                          <td className="py-1.5 px-2 border-r border-dashed border-gray-200 text-center text-gray-600 tabular-nums align-middle">
                            {idx + 1}
                          </td>
                          <td className="py-1 px-2 border-r border-dashed border-gray-200 align-middle">
                            <input
                              type="text"
                              maxLength={200}
                              autoFocus={focusRowId === dt.id}
                              value={dt.name}
                              onChange={(e) => {
                                const val = e.target.value;
                                setFormDocTypes((prev) =>
                                  prev.map((row) =>
                                    row.id === dt.id ? { ...row, name: val } : row
                                  )
                                );
                                if (detailError) setDetailError('');
                              }}
                              placeholder="Nhập tên loại tài liệu"
                              className="w-full bg-transparent px-1.5 py-1 text-[13px] text-gray-800 placeholder-[#94A3B8] focus:outline-none focus:bg-[#EFF6FF]/40 rounded"
                            />
                          </td>
                          <td className="py-1 px-2 align-middle">
                            <input
                              type="text"
                              maxLength={500}
                              value={dt.note}
                              onChange={(e) => {
                                const val = e.target.value;
                                setFormDocTypes((prev) =>
                                  prev.map((row) =>
                                    row.id === dt.id ? { ...row, note: val } : row
                                  )
                                );
                              }}
                              placeholder="Nhập mô tả"
                              className="w-full bg-transparent px-1.5 py-1 text-[13px] text-gray-800 placeholder-[#94A3B8] focus:outline-none focus:bg-[#EFF6FF]/40 rounded"
                            />
                          </td>
                        </tr>
                      ))}

                      {/* Inline Quick-Add Row */}
                      <tr className="bg-white">
                        <td className="py-2.5 px-2 border-r border-dashed border-gray-200"></td>
                        <td className="py-2.5 px-2 border-r border-dashed border-gray-200"></td>
                        <td className="py-2.5 px-3 border-r border-dashed border-gray-200">
                          <button
                            type="button"
                            onClick={handleAddDocTypeRow}
                            className="inline-flex items-center gap-1.5 text-[13px] italic text-gray-500 hover:text-[#1D63ED] transition-colors cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5 not-italic" />
                            <span>Bấm vào đây để thêm dòng mới</span>
                          </button>
                        </td>
                        <td className="py-2.5 px-3"></td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Table Footer Toolbar */}
                  <div className="border-t border-gray-200 bg-white px-3 py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={handleAddDocTypeRow}
                        className="bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#1E293B] px-3 py-1.5 rounded-[8px] text-[13px] font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Thêm dòng (F2)</span>
                      </button>

                      <button
                        type="button"
                        disabled={formDocTypes.length === 0}
                        onClick={handleClearAllDocTypes}
                        className={`inline-flex items-center gap-1.5 px-2 py-1.5 rounded-[6px] text-[13px] transition-colors ${
                          formDocTypes.length > 0
                            ? 'text-red-500 hover:bg-red-50 cursor-pointer'
                            : 'text-[#94A3B8] cursor-not-allowed'
                        }`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Xóa tất cả</span>
                      </button>
                    </div>

                    <span
                      className="text-[#334155] cursor-help inline-flex items-center"
                      title="Nhấn F2 hoặc bấm vào dòng trống để thêm nhanh loại giấy tờ mới"
                    >
                      <HelpCircle className="w-4 h-4" />
                    </span>
                  </div>
                </div>

                {detailError && (
                  <p className="text-[12px] text-red-500 mt-1">{detailError}</p>
                )}
              </div>

              {/* Modal Footer Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-[13.5px] font-medium text-[#334155] hover:text-gray-900 cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={() => saveModalRecord(true)}
                  className="px-5 py-2 rounded-[8px] border border-[#2563EB] bg-white hover:bg-[#EFF6FF] text-[#2563EB] text-[13.5px] font-medium transition-colors cursor-pointer"
                >
                  Lưu &amp; thêm
                </button>
                <button
                  type="submit"
                  className="px-7 py-2 rounded-[8px] bg-[#1D63ED] hover:bg-[#1552CC] text-white text-[13.5px] font-medium transition-colors cursor-pointer"
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
