import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Download,
  Trash2,
  Settings,
  Search,
  ChevronDown,
  FilePlus2,
  Printer,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X,
  KeyRound,
  AlertCircle,
} from 'lucide-react';

export interface CategoryVehicleTypeRecord {
  id: string;
  name: string;
}

const STORAGE_KEY = 'category_vehicle_types_v1';

const INITIAL_VEHICLE_TYPE_NAMES: string[] = [
  '4 chỗ',
  '5 chỗ',
  'Sedan',
  'SUV',
];

export const INITIAL_CATEGORY_VEHICLE_TYPES: CategoryVehicleTypeRecord[] =
  INITIAL_VEHICLE_TYPE_NAMES.map((name, index) => ({
    id: `vehicle-type-${index + 1}`,
    name,
  }));

export const CategoryVehicleTypesList: React.FC = () => {
  const [items, setItems] = useState<CategoryVehicleTypeRecord[]>(() => {
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
    return INITIAL_CATEGORY_VEHICLE_TYPES;
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
  const [newVehicleTypeName, setNewVehicleTypeName] = useState('');
  const [addError, setAddError] = useState('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => item.name.toLowerCase().includes(q));
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

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    setItems((prev) => prev.filter((item) => !selectedIds.includes(item.id)));
    setSelectedIds([]);
  };

  const handleExportExcel = () => {
    const headers = ['Loại xe'];
    const rows = filteredItems.map((row) => [
      `"${row.name.replace(/"/g, '""')}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([new Uint8Array([0xef, 0xbb, 0xbf]), csvContent], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'loai_xe.csv');
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
      const imported: CategoryVehicleTypeRecord[] = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map((c) => c.replace(/^"|"$/g, '').trim());
        if (cols[0]) {
          imported.push({
            id: `vehicle-type-imp-${Date.now()}-${i}`,
            name: cols[0],
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

  const normalizeName = (val: string) =>
    val.trim().replace(/\s+/g, ' ').toLowerCase();

  const findDuplicateVehicleType = (val: string): CategoryVehicleTypeRecord | null => {
    const normalized = normalizeName(val);
    if (!normalized) return null;
    return (
      items.find((item) => normalizeName(item.name) === normalized) || null
    );
  };

  const duplicateVehicleType = useMemo(
    () => findDuplicateVehicleType(newVehicleTypeName),
    [newVehicleTypeName, items]
  );

  const handleOpenAddModal = () => {
    setNewVehicleTypeName('');
    setAddError('');
    setIsAddModalOpen(true);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newVehicleTypeName.trim().replace(/\s+/g, ' ');
    if (!trimmed) {
      setAddError('Vui lòng nhập Loại xe.');
      return;
    }
    const dup = findDuplicateVehicleType(trimmed);
    if (dup) {
      setAddError(`Loại xe "${dup.name}" đã tồn tại. Không được trùng.`);
      return;
    }
    const newItem: CategoryVehicleTypeRecord = {
      id: `vehicle-type-${Date.now()}`,
      name: trimmed,
    };
    setItems((prev) => [newItem, ...prev]);
    setCurrentPage(1);
    setIsAddModalOpen(false);
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
            onClick={() => window.print()}
            className="bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded-[6px] text-[13px] flex items-center gap-1.5 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-gray-600" />
            <span>In</span>
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
              placeholder="Tìm mã, tên"
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
              <th className="w-[180px] py-2.5 px-3 border-r border-b border-gray-200 text-left">
                Loại xe
              </th>
              <th className="py-2.5 px-3 border-b border-gray-200"></th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
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
                      {row.name}
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
            className="w-7 h-7 flex items-center justify-center rounded-[6px] text-gray-600 hover:bg-gray-100 disabled:opacity-40 cursor-pointer border border-gray-200"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setCurrentPage(totalPages)}
            disabled={safeCurrentPage === totalPages}
            className="w-7 h-7 flex items-center justify-center rounded-[6px] text-gray-600 hover:bg-gray-100 disabled:opacity-40 cursor-pointer border border-gray-200"
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

      {/* Add Vehicle Type Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 select-text">
          <div className="bg-white rounded-lg border border-gray-200 shadow-xl w-full max-w-[420px] overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-[15px] font-semibold text-gray-900">
                Thêm loại xe
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-gray-500 hover:text-gray-800 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-4 space-y-4">
              <div>
                <label className="flex items-center gap-1.5 text-[12.5px] font-medium text-gray-800 mb-1">
                  <span>
                    Loại xe <span className="text-red-500">*</span>
                  </span>
                  <span
                    className="relative group inline-flex items-center text-amber-600 cursor-help"
                    title="Không được trùng (giá trị duy nhất)"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-[11px] font-normal text-white shadow-sm z-20">
                      Không được trùng
                    </span>
                  </span>
                </label>
                <input
                  type="text"
                  autoFocus
                  value={newVehicleTypeName}
                  onChange={(e) => {
                    const val = e.target.value;
                    setNewVehicleTypeName(val);
                    const dup = findDuplicateVehicleType(val);
                    if (dup) {
                      setAddError(
                        `Loại xe "${dup.name}" đã tồn tại. Không được trùng.`
                      );
                    } else if (addError) {
                      setAddError('');
                    }
                  }}
                  placeholder="Nhập loại xe"
                  className={`w-full border rounded-[6px] px-3 py-1.5 text-[13px] text-gray-800 focus:outline-none ${
                    addError
                      ? 'border-red-400 focus:border-red-500'
                      : 'border-gray-300 focus:border-[#1677FF]'
                  }`}
                />
                {addError && (
                  <p className="mt-1 flex items-start gap-1 text-[11.5px] text-red-500 leading-snug">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>{addError}</span>
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-[6px] text-[13px] font-medium cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  disabled={Boolean(duplicateVehicleType)}
                  className={`px-4 py-1.5 rounded-[6px] text-[13px] font-medium transition-colors ${
                    duplicateVehicleType
                      ? 'bg-blue-300 text-white cursor-not-allowed'
                      : 'bg-[#1677FF] hover:bg-blue-600 text-white cursor-pointer'
                  }`}
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
