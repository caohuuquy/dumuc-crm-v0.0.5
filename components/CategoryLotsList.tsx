import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Download,
  Trash2,
  Settings,
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
  Search,
} from 'lucide-react';
import { useFirestoreCollection } from '../firebase';
import { INITIAL_SPARE_PARTS, SparePartRecord } from './SparePartsList';

export interface CategoryLotRecord {
  id: string;
  lotCode: string;
  lotName: string;
  materialCode: string;
  materialName: string;
  expiryDate: string;
  warrantyPeriod: string;
}

const STORAGE_KEY = 'category_lots_v1';

export const INITIAL_CATEGORY_LOTS: CategoryLotRecord[] = [
  {
    id: 'lot-1',
    lotCode: '',
    lotName: '',
    materialCode: 'SP00000092',
    materialName: 'TEST FIFO',
    expiryDate: '',
    warrantyPeriod: '',
  },
  {
    id: 'lot-2',
    lotCode: '',
    lotName: '',
    materialCode: 'VOXE026',
    materialName: 'Vỏ xe Kumho 235/55 R19 101H Crugen HP71',
    expiryDate: '',
    warrantyPeriod: '',
  },
  {
    id: 'lot-3',
    lotCode: 'ABC',
    lotName: 'ABC',
    materialCode: 'LOCNHOT011',
    materialName: 'Lọc nhớt Isuzu - 98165071',
    expiryDate: '08/06/2040',
    warrantyPeriod: '',
  },
  {
    id: 'lot-4',
    lotCode: 'BANGKEO556X',
    lotName: 'bangkeo556x',
    materialCode: 'BANGKEO',
    materialName: 'Băng keo',
    expiryDate: '16/08/2035',
    warrantyPeriod: '',
  },
  {
    id: 'lot-5',
    lotCode: 'HCK098',
    lotName: 'HCK098',
    materialCode: 'NHOTHS004',
    materialName: 'Nhớt hộp số MTF',
    expiryDate: '05/05/2040',
    warrantyPeriod: '',
  },
  {
    id: 'lot-6',
    lotCode: 'LO0001',
    lotName: 'LO0001',
    materialCode: 'BAMDTL001',
    materialName: 'Bấm đầu thắng lực',
    expiryDate: '08/03/2030',
    warrantyPeriod: '',
  },
  {
    id: 'lot-7',
    lotCode: 'TEST',
    lotName: 'test',
    materialCode: 'BAMDTL001',
    materialName: 'Bấm đầu thắng lực',
    expiryDate: '26/06/2026',
    warrantyPeriod: '',
  },
  {
    id: 'lot-8',
    lotCode: 'TEST2',
    lotName: 'TEST2',
    materialCode: 'BAMDTL001',
    materialName: 'Bấm đầu thắng lực',
    expiryDate: '26/06/2026',
    warrantyPeriod: '',
  },
  {
    id: 'lot-9',
    lotCode: 'TEST2',
    lotName: 'Test 2',
    materialCode: 'BANGKEO',
    materialName: 'Băng keo',
    expiryDate: '30/06/2026',
    warrantyPeriod: '',
  },
];

export const CategoryLotsList: React.FC = () => {
  const [items, setItems] = useState<CategoryLotRecord[]>(() => {
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
    return INITIAL_CATEGORY_LOTS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore storage write errors
    }
  }, [items]);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeRowId, setActiveRowId] = useState<string | null>(null);
  const [rowsPerPage, setRowsPerPage] = useState('20');
  const [currentPage, setCurrentPage] = useState(1);

  // Materials from "Danh mục > Vật tư, Hàng hóa"
  const [spareParts] = useFirestoreCollection<SparePartRecord>(
    'spare_parts_items',
    INITIAL_SPARE_PARTS,
    'id'
  );

  // Add modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    lotCode: '',
    lotName: '',
    materialCode: '',
    materialName: '',
    expiryDate: '',
    warrantyPeriod: '',
  });
  const [materialQuery, setMaterialQuery] = useState('');
  const [isMaterialDropdownOpen, setIsMaterialDropdownOpen] = useState(false);
  const [addError, setAddError] = useState('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const materialDropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        materialDropdownRef.current &&
        !materialDropdownRef.current.contains(e.target as Node)
      ) {
        setIsMaterialDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const pageSize = Number(rowsPerPage) || 20;
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedItems = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, safeCurrentPage, pageSize]);

  const displayStart =
    items.length === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1;
  const displayEnd = Math.min(safeCurrentPage * pageSize, items.length);

  const activeRow = useMemo(
    () => (activeRowId ? items.find((i) => i.id === activeRowId) || null : null),
    [activeRowId, items]
  );

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
    if (activeRowId && selectedIds.includes(activeRowId)) {
      setActiveRowId(null);
    }
    setItems((prev) => prev.filter((item) => !selectedIds.includes(item.id)));
    setSelectedIds([]);
  };

  const handleExportExcel = () => {
    const headers = [
      'Mã lô',
      'Tên lô',
      'Vật tư',
      'Tên vật tư',
      'Hạn sử dụng',
      'Thời gian bảo hành',
    ];
    const rows = items.map((row) => [
      `"${row.lotCode.replace(/"/g, '""')}"`,
      `"${row.lotName.replace(/"/g, '""')}"`,
      `"${row.materialCode.replace(/"/g, '""')}"`,
      `"${row.materialName.replace(/"/g, '""')}"`,
      `"${row.expiryDate.replace(/"/g, '""')}"`,
      `"${row.warrantyPeriod.replace(/"/g, '""')}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([new Uint8Array([0xef, 0xbb, 0xbf]), csvContent], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'danh_muc_lo.csv');
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
      const imported: CategoryLotRecord[] = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map((c) => c.replace(/^"|"$/g, '').trim());
        if (cols[0] || cols[1] || cols[2] || cols[3]) {
          imported.push({
            id: `lot-imp-${Date.now()}-${i}`,
            lotCode: cols[0] || '',
            lotName: cols[1] || '',
            materialCode: cols[2] || '',
            materialName: cols[3] || '',
            expiryDate: cols[4] || '',
            warrantyPeriod: cols[5] || '',
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

  const normalizeText = (val: string) =>
    val.trim().replace(/\s+/g, ' ').toLowerCase();

  const duplicateCombination = useMemo(() => {
    const normLotCode = normalizeText(addForm.lotCode);
    const normLotName = normalizeText(addForm.lotName);
    const normMaterialName = normalizeText(addForm.materialName);
    if (!normLotCode && !normLotName && !normMaterialName) return null;
    return (
      items.find(
        (i) =>
          normalizeText(i.lotCode) === normLotCode &&
          normalizeText(i.lotName) === normLotName &&
          normalizeText(i.materialName) === normMaterialName
      ) || null
    );
  }, [addForm.lotCode, addForm.lotName, addForm.materialName, items]);

  const filteredSpareParts = useMemo(() => {
    const selectedLabel =
      addForm.materialName && addForm.materialCode
        ? `${addForm.materialName} (${addForm.materialCode})`
        : '';
    const q = normalizeText(materialQuery);
    if (!q || (selectedLabel && materialQuery === selectedLabel)) {
      return spareParts;
    }
    return spareParts.filter(
      (sp) =>
        normalizeText(sp.name).includes(q) ||
        normalizeText(sp.code).includes(q) ||
        normalizeText(`${sp.name} ${sp.code}`).includes(q)
    );
  }, [spareParts, materialQuery, addForm.materialName, addForm.materialCode]);

  const handleOpenAddModal = () => {
    setAddForm({
      lotCode: '',
      lotName: '',
      materialCode: '',
      materialName: '',
      expiryDate: '',
      warrantyPeriod: '',
    });
    setMaterialQuery('');
    setIsMaterialDropdownOpen(false);
    setAddError('');
    setIsAddModalOpen(true);
  };

  const handleSelectMaterial = (part: SparePartRecord) => {
    setAddForm((prev) => ({
      ...prev,
      materialCode: part.code,
      materialName: part.name,
    }));
    setMaterialQuery(`${part.name} (${part.code})`);
    setIsMaterialDropdownOpen(false);
    if (addError) setAddError('');
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lotCode = addForm.lotCode.trim().replace(/\s+/g, ' ');
    const lotName = addForm.lotName.trim().replace(/\s+/g, ' ');
    const materialName = addForm.materialName.trim().replace(/\s+/g, ' ');
    const materialCode = addForm.materialCode.trim();

    if (materialQuery.trim() && !materialName) {
      setAddError('Vui lòng chọn Tên vật tư từ danh sách Vật tư, Hàng hóa.');
      return;
    }

    if (!lotCode && !lotName && !materialName) {
      setAddError('Vui lòng nhập Mã lô, Tên lô hoặc chọn Tên vật tư.');
      return;
    }

    if (duplicateCombination) {
      setAddError(
        'Tổ hợp Mã lô, Tên lô và Tên vật tư đã tồn tại. Không được trùng đồng thời cả 3 trường.'
      );
      return;
    }

    const newItem: CategoryLotRecord = {
      id: `lot-${Date.now()}`,
      lotCode,
      lotName,
      materialCode,
      materialName,
      expiryDate: addForm.expiryDate.trim(),
      warrantyPeriod: addForm.warrantyPeriod.trim(),
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

      {/* Main Split Container (Top Table + Divider + Bottom Detail Panel) */}
      <div className="flex-1 flex flex-col min-h-0 px-1.5 pt-1.5 pb-1.5 gap-0 overflow-hidden">
        {/* Top Table Pane */}
        <div className="flex-[65] min-h-0 bg-white border border-gray-200 rounded-[6px] overflow-auto">
          <table className="w-full border-collapse text-[13px] table-fixed">
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
                <th className="w-[100px] py-2.5 px-3 border-r border-b border-gray-200 text-left">
                  Mã lô
                </th>
                <th className="w-[180px] py-2.5 px-3 border-r border-b border-gray-200 text-left">
                  Tên lô
                </th>
                <th className="w-[130px] py-2.5 px-3 border-r border-b border-gray-200 text-left">
                  Vật tư
                </th>
                <th className="w-[175px] py-2.5 px-3 border-r border-b border-gray-200 text-left">
                  Tên vật tư
                </th>
                <th className="w-[135px] py-2.5 px-3 border-r border-b border-gray-200 text-left">
                  Hạn sử dụng
                </th>
                <th className="w-[160px] py-2.5 px-3 border-r border-b border-gray-200 text-left">
                  Thời gian bảo hành
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
                  const isActive = activeRowId === row.id;
                  return (
                    <tr
                      key={row.id}
                      onClick={() =>
                        setActiveRowId((prev) => (prev === row.id ? null : row.id))
                      }
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
                      <td
                        className="py-2.5 px-3 border-r border-gray-100 text-gray-800 align-middle truncate"
                        title={row.lotCode}
                      >
                        {row.lotCode}
                      </td>
                      <td
                        className="py-2.5 px-3 border-r border-gray-100 text-gray-800 align-middle truncate"
                        title={row.lotName}
                      >
                        {row.lotName}
                      </td>
                      <td
                        className="py-2.5 px-3 border-r border-gray-100 text-gray-800 align-middle truncate"
                        title={row.materialCode}
                      >
                        {row.materialCode}
                      </td>
                      <td
                        className="py-2.5 px-3 border-r border-gray-100 text-gray-800 align-middle truncate"
                        title={row.materialName}
                      >
                        {row.materialName}
                      </td>
                      <td className="py-2.5 px-3 border-r border-gray-100 text-gray-800 align-middle">
                        {row.expiryDate}
                      </td>
                      <td className="py-2.5 px-3 border-r border-gray-100 text-gray-800 align-middle">
                        {row.warrantyPeriod}
                      </td>
                      <td className="py-2.5 px-3"></td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Center Split Handle */}
        <div className="h-2.5 flex flex-col items-center justify-center shrink-0">
          <div className="w-9 h-[2px] rounded-full bg-[#2563EB]/80 mb-[2px]" />
          <div className="w-14 h-[2px] rounded-full bg-[#2563EB]" />
        </div>

        {/* Bottom Detail Pane */}
        <div className="flex-[35] min-h-[150px] bg-white border border-gray-200 rounded-[6px] overflow-auto flex flex-col">
          {!activeRow ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
              <svg
                className="w-12 h-12 text-[#CBD5E1] mb-2"
                viewBox="0 0 48 48"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="6" y="10" width="36" height="28" rx="4" />
                <line x1="6" y1="18" x2="42" y2="18" />
                <circle cx="11.5" cy="14" r="1" fill="currentColor" stroke="none" />
                <circle cx="15.5" cy="14" r="1" fill="currentColor" stroke="none" />
                <circle cx="19.5" cy="14" r="1" fill="currentColor" stroke="none" />
                <path d="M17.5 24.5l3 3m0-3l-3 3" />
                <path d="M27.5 24.5l3 3m0-3l-3 3" />
                <path d="M19 33c1.5-1.8 8.5-1.8 10 0" />
              </svg>
              <span className="text-[13px] font-medium text-[#1E293B]">
                Chọn một dòng bên trên
              </span>
            </div>
          ) : (
            <div className="p-4 flex-1">
              <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-gray-100">
                <h3 className="text-[13.5px] font-semibold text-[#1E293B]">
                  Chi tiết lô {activeRow.lotCode || activeRow.materialCode}
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveRowId(null)}
                  className="text-gray-400 hover:text-gray-700 p-1 rounded cursor-pointer"
                  title="Đóng chi tiết"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3 text-[13px]">
                <div>
                  <span className="block text-[12px] text-gray-500">Mã lô</span>
                  <span className="font-medium text-gray-800">
                    {activeRow.lotCode || '—'}
                  </span>
                </div>
                <div>
                  <span className="block text-[12px] text-gray-500">Tên lô</span>
                  <span className="font-medium text-gray-800">
                    {activeRow.lotName || '—'}
                  </span>
                </div>
                <div>
                  <span className="block text-[12px] text-gray-500">Vật tư</span>
                  <span className="font-medium text-gray-800">
                    {activeRow.materialCode || '—'}
                  </span>
                </div>
                <div>
                  <span className="block text-[12px] text-gray-500">Tên vật tư</span>
                  <span className="font-medium text-gray-800">
                    {activeRow.materialName || '—'}
                  </span>
                </div>
                <div>
                  <span className="block text-[12px] text-gray-500">Hạn sử dụng</span>
                  <span className="font-medium text-gray-800">
                    {activeRow.expiryDate || '—'}
                  </span>
                </div>
                <div>
                  <span className="block text-[12px] text-gray-500">
                    Thời gian bảo hành
                  </span>
                  <span className="font-medium text-gray-800">
                    {activeRow.warrantyPeriod || '—'}
                  </span>
                </div>
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
            {items.length === 0 ? '0' : `${displayStart}–${displayEnd}`}
          </strong>{' '}
          /{' '}
          <strong className="font-semibold text-gray-800">{items.length}</strong>{' '}
          kết quả
        </div>
      </div>

      {/* Add Lot Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 select-text">
          <div className="bg-white rounded-lg border border-gray-200 shadow-xl w-full max-w-[1060px] overflow-visible">
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between rounded-t-lg">
              <h3 className="text-[15px] font-semibold text-gray-900">
                Thêm lô mới
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
              {/* Single horizontal row of fields */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
                {/* Mã lô (Composite Unique) */}
                <div className="md:col-span-2">
                  <label className="flex items-center gap-1.5 text-[12.5px] font-medium text-gray-800 mb-1">
                    <span>Mã lô</span>
                    <span
                      className="relative group inline-flex items-center text-amber-600 cursor-help"
                      title="Không được trùng đồng thời cả 3 trường (Mã lô, Tên lô, Tên vật tư)"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-[11px] font-normal text-white shadow-sm z-30">
                        Không trùng đồng thời 3 trường
                      </span>
                    </span>
                  </label>
                  <input
                    type="text"
                    autoFocus
                    value={addForm.lotCode}
                    onChange={(e) => {
                      setAddForm({ ...addForm, lotCode: e.target.value });
                      if (addError) setAddError('');
                    }}
                    placeholder="VD: LO0002"
                    className={`w-full border rounded-[6px] px-3 py-1.5 text-[13px] text-gray-800 focus:outline-none ${
                      duplicateCombination
                        ? 'border-red-400 focus:border-red-500'
                        : 'border-gray-300 focus:border-[#1677FF]'
                    }`}
                  />
                </div>

                {/* Tên lô (Composite Unique) */}
                <div className="md:col-span-2">
                  <label className="flex items-center gap-1.5 text-[12.5px] font-medium text-gray-800 mb-1">
                    <span>Tên lô</span>
                    <span
                      className="relative group inline-flex items-center text-amber-600 cursor-help"
                      title="Không được trùng đồng thời cả 3 trường (Mã lô, Tên lô, Tên vật tư)"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-[11px] font-normal text-white shadow-sm z-30">
                        Không trùng đồng thời 3 trường
                      </span>
                    </span>
                  </label>
                  <input
                    type="text"
                    value={addForm.lotName}
                    onChange={(e) => {
                      setAddForm({ ...addForm, lotName: e.target.value });
                      if (addError) setAddError('');
                    }}
                    placeholder="Nhập tên lô"
                    className={`w-full border rounded-[6px] px-3 py-1.5 text-[13px] text-gray-800 focus:outline-none ${
                      duplicateCombination
                        ? 'border-red-400 focus:border-red-500'
                        : 'border-gray-300 focus:border-[#1677FF]'
                    }`}
                  />
                </div>

                {/* Tên vật tư (Searchable List from Danh mục > Vật tư, Hàng hóa + Composite Unique) */}
                <div className="md:col-span-4 relative" ref={materialDropdownRef}>
                  <label className="flex items-center gap-1.5 text-[12.5px] font-medium text-gray-800 mb-1">
                    <span>Tên vật tư</span>
                    <span
                      className="relative group inline-flex items-center text-amber-600 cursor-help"
                      title="Không được trùng đồng thời cả 3 trường (Mã lô, Tên lô, Tên vật tư)"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-[11px] font-normal text-white shadow-sm z-30">
                        Không trùng đồng thời 3 trường
                      </span>
                    </span>
                  </label>

                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={materialQuery}
                      onFocus={() => setIsMaterialDropdownOpen(true)}
                      onChange={(e) => {
                        const val = e.target.value;
                        setMaterialQuery(val);
                        setIsMaterialDropdownOpen(true);
                        if (addForm.materialName || addForm.materialCode) {
                          setAddForm((prev) => ({
                            ...prev,
                            materialCode: '',
                            materialName: '',
                          }));
                        }
                        if (addError) setAddError('');
                      }}
                      placeholder="Tìm tên vật tư hoặc mã..."
                      className={`w-full border rounded-[6px] pl-8 pr-14 py-1.5 text-[13px] text-gray-800 focus:outline-none ${
                        duplicateCombination
                          ? 'border-red-400 focus:border-red-500'
                          : 'border-gray-300 focus:border-[#1677FF]'
                      }`}
                    />
                    {materialQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setMaterialQuery('');
                          setAddForm((prev) => ({
                            ...prev,
                            materialCode: '',
                            materialName: '',
                          }));
                          setIsMaterialDropdownOpen(true);
                        }}
                        className="absolute right-7 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-0.5 cursor-pointer"
                        title="Xóa chọn"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setIsMaterialDropdownOpen((prev) => !prev)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-0.5 cursor-pointer"
                      tabIndex={-1}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Dropdown options displaying both Tên vật tư and Mã */}
                  {isMaterialDropdownOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-[6px] shadow-lg max-h-60 overflow-y-auto z-40">
                      {filteredSpareParts.length === 0 ? (
                        <div className="px-3 py-3 text-[12.5px] text-gray-400 text-center">
                          Không tìm thấy vật tư trong Danh mục Vật tư, Hàng hóa
                        </div>
                      ) : (
                        filteredSpareParts.map((part) => {
                          const isChosen =
                            addForm.materialName === part.name &&
                            addForm.materialCode === part.code;
                          return (
                            <button
                              key={part.id}
                              type="button"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                handleSelectMaterial(part);
                              }}
                              className={`w-full text-left px-3 py-2 flex items-center justify-between gap-2 border-b border-gray-50 last:border-b-0 hover:bg-[#EFF6FF] transition-colors cursor-pointer ${
                                isChosen ? 'bg-[#EFF6FF]' : 'bg-white'
                              }`}
                            >
                              <span className="text-[13px] font-medium text-gray-800 truncate">
                                {part.name}
                              </span>
                              <span className="text-[11.5px] font-mono text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded shrink-0">
                                {part.code}
                              </span>
                            </button>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>

                {/* Hạn sử dụng */}
                <div className="md:col-span-2">
                  <label className="block text-[12.5px] font-medium text-gray-800 mb-1">
                    Hạn sử dụng
                  </label>
                  <input
                    type="text"
                    value={addForm.expiryDate}
                    onChange={(e) =>
                      setAddForm({ ...addForm, expiryDate: e.target.value })
                    }
                    placeholder="DD/MM/YYYY"
                    className="w-full border border-gray-300 rounded-[6px] px-3 py-1.5 text-[13px] text-gray-800 focus:outline-none focus:border-[#1677FF]"
                  />
                </div>

                {/* Thời gian bảo hành */}
                <div className="md:col-span-2">
                  <label className="block text-[12.5px] font-medium text-gray-800 mb-1">
                    Thời gian bảo hành
                  </label>
                  <input
                    type="text"
                    value={addForm.warrantyPeriod}
                    onChange={(e) =>
                      setAddForm({ ...addForm, warrantyPeriod: e.target.value })
                    }
                    placeholder="VD: 12 tháng"
                    className="w-full border border-gray-300 rounded-[6px] px-3 py-1.5 text-[13px] text-gray-800 focus:outline-none focus:border-[#1677FF]"
                  />
                </div>
              </div>

              {duplicateCombination && (
                <div className="flex items-start gap-1.5 rounded-[6px] border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-600">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    Tổ hợp <strong>Mã lô</strong>, <strong>Tên lô</strong> và{' '}
                    <strong>Tên vật tư</strong> đã tồn tại trong danh sách. Không
                    được trùng đồng thời cả 3 trường.
                  </span>
                </div>
              )}

              {addError && !duplicateCombination && (
                <p className="flex items-start gap-1 text-[12px] text-red-500">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{addError}</span>
                </p>
              )}

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
                  disabled={Boolean(duplicateCombination)}
                  className={`px-4 py-1.5 rounded-[6px] text-[13px] font-medium transition-colors ${
                    duplicateCombination
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
