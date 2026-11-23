import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Download,
  Trash2,
  Settings,
  FilePlus2,
  ArrowUpDown,
  Check,
  X,
  ChevronDown,
  Calendar,
  Plus,
  HelpCircle,
  Upload,
} from 'lucide-react';
import { useFirestoreCollection } from '../firebase';
import {
  DocumentStorageCategoryRecord,
  INITIAL_DOCUMENT_STORAGE_CATEGORIES,
} from './DocumentStorageCategoriesList';

export interface DocumentCabinetFileItem {
  id: string;
  description: string;
  link: string;
  fileName: string;
}

export interface DocumentCabinetRecord {
  id: string;
  documentGroup: string;
  documentType: string;
  storageType: string;
  location: string;
  effectiveDate: string;
  expiryDate: string;
  isValid: boolean;
  files: DocumentCabinetFileItem[];
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'document_cabinet_v1';
const CATEGORIES_STORAGE_KEY = 'document_storage_categories_v1';

const STORAGE_TYPE_OPTIONS = ['Bản Cứng', 'Bản Mềm', 'Bản Cứng/ bản Mềm'];

export const INITIAL_DOCUMENT_CABINET_RECORDS: DocumentCabinetRecord[] = [
  {
    id: 'doc-cab-1',
    documentGroup: 'Hồ sơ thành lập',
    documentType: 'Giấy chứng nhận đăng ký mã số thuế',
    storageType: 'Bản Cứng',
    location: 'Tủ 1 (Tháng 12)',
    effectiveDate: '',
    expiryDate: '',
    isValid: true,
    files: [],
    createdAt: '14:45 18/12/2025',
    updatedAt: '16:34 18/12/2025',
  },
  {
    id: 'doc-cab-2',
    documentGroup: 'Hồ sơ thành lập',
    documentType: 'Giấy chứng nhận đăng ký kinh doanh',
    storageType: 'Bản Mềm',
    location: '',
    effectiveDate: '',
    expiryDate: '',
    isValid: true,
    files: [],
    createdAt: '14:43 18/12/2025',
    updatedAt: '16:33 18/12/2025',
  },
  {
    id: 'doc-cab-3',
    documentGroup: 'Hợp đồng',
    documentType: 'Phụ lục hợp đồng',
    storageType: 'Bản Cứng/ bản Mềm',
    location: 'abc',
    effectiveDate: '01/12/2025',
    expiryDate: '31/12/2025',
    isValid: true,
    files: [],
    createdAt: '14:42 18/12/2025',
    updatedAt: '14:42 18/12/2025',
  },
];

type SortField = 'documentGroup' | 'createdAt' | 'updatedAt';
type SortDirection = 'asc' | 'desc';

const parseVnDateTime = (value: string): number => {
  const match = value.trim().match(/^(\d{2}):(\d{2})\s+(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return 0;
  const [, hh, mm, dd, mo, yyyy] = match;
  return new Date(
    Number(yyyy),
    Number(mo) - 1,
    Number(dd),
    Number(hh),
    Number(mm)
  ).getTime();
};

const formatNowVnDateTime = (): string => {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(now.getHours())}:${pad(now.getMinutes())} ${pad(now.getDate())}/${pad(
    now.getMonth() + 1
  )}/${now.getFullYear()}`;
};

const isoToVnDate = (iso: string): string => {
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return '';
  return `${match[3]}/${match[2]}/${match[1]}`;
};

const vnDateToIso = (vn: string): string => {
  const cleaned = vn.replace(/\s+/g, '');
  const match = cleaned.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return '';
  return `${match[3]}-${match[2]}-${match[1]}`;
};

const normalizeCabinetRecord = (raw: any, idx: number): DocumentCabinetRecord => {
  const safeFiles: DocumentCabinetFileItem[] = Array.isArray(raw?.files)
    ? raw.files.slice(0, 50).map((f: any, fIdx: number) => ({
        id:
          typeof f?.id === 'string' && f.id.trim()
            ? f.id.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128)
            : `file-${idx}-${fIdx}`,
        description: String(f?.description || '').slice(0, 500),
        link: String(f?.link || '').slice(0, 500),
        fileName: String(f?.fileName || '').slice(0, 255),
      }))
    : [];

  return {
    id:
      typeof raw?.id === 'string' && raw.id.trim()
        ? raw.id.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128)
        : `doc-cab-${idx + 1}`,
    documentGroup: String(raw?.documentGroup || 'Chưa phân loại').slice(0, 200),
    documentType: String(raw?.documentType || '').slice(0, 200),
    storageType: String(raw?.storageType || '').slice(0, 100),
    location: String(raw?.location || '').slice(0, 200),
    effectiveDate: String(raw?.effectiveDate || '').slice(0, 32),
    expiryDate: String(raw?.expiryDate || '').slice(0, 32),
    isValid: Boolean(raw?.isValid),
    files: safeFiles,
    createdAt: String(raw?.createdAt || '').slice(0, 64),
    updatedAt: String(raw?.updatedAt || '').slice(0, 64),
  };
};

export const DocumentCabinetList: React.FC = () => {
  const loadInitialRecords = (): DocumentCabinetRecord[] => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((r, idx) => normalizeCabinetRecord(r, idx));
        }
      }
    } catch {
      // Ignore storage read errors
    }
    return INITIAL_DOCUMENT_CABINET_RECORDS;
  };

  const loadInitialCategories = (): DocumentStorageCategoryRecord[] => {
    try {
      const saved = localStorage.getItem(CATEGORIES_STORAGE_KEY);
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

  const [items, setItems] = useFirestoreCollection<DocumentCabinetRecord>(
    'document_cabinet_items',
    loadInitialRecords,
    'id',
    (syncedItems) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(syncedItems));
      } catch {
        // Ignore storage write errors
      }
    }
  );

  const [categories] = useFirestoreCollection<DocumentStorageCategoryRecord>(
    'document_storage_categories_items',
    loadInitialCategories,
    'id'
  );

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Add / Edit modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formGroup, setFormGroup] = useState('');
  const [groupSearch, setGroupSearch] = useState('');
  const [isGroupDropdownOpen, setIsGroupDropdownOpen] = useState(false);
  const [formDocType, setFormDocType] = useState('');
  const [formStorageType, setFormStorageType] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formEffectiveDate, setFormEffectiveDate] = useState('');
  const [formExpiryDate, setFormExpiryDate] = useState('');
  const [formIsValid, setFormIsValid] = useState(false);
  const [formFiles, setFormFiles] = useState<DocumentCabinetFileItem[]>([]);
  const [focusFileRowId, setFocusFileRowId] = useState<string | null>(null);
  const [formError, setFormError] = useState('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const groupDropdownRef = useRef<HTMLDivElement | null>(null);
  const effectiveDatePickerRef = useRef<HTMLInputElement | null>(null);
  const expiryDatePickerRef = useRef<HTMLInputElement | null>(null);

  const filteredCategories = useMemo(() => {
    const q = groupSearch.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((c) => c.groupName.toLowerCase().includes(q));
  }, [categories, groupSearch]);

  const availableDocTypes = useMemo(() => {
    const matched = categories.find(
      (c) => c.groupName.toLowerCase() === formGroup.trim().toLowerCase()
    );
    return matched ? matched.documentTypes : [];
  }, [categories, formGroup]);

  useEffect(() => {
    if (!isGroupDropdownOpen) return;
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        groupDropdownRef.current &&
        !groupDropdownRef.current.contains(event.target as Node)
      ) {
        setIsGroupDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isGroupDropdownOpen]);

  const handleAddFileRow = () => {
    if (formFiles.length >= 50) return;
    const newId = `file-draft-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setFormFiles((prev) => [
      ...prev,
      { id: newId, description: '', link: '', fileName: '' },
    ]);
    setFocusFileRowId(newId);
  };

  useEffect(() => {
    if (!isAddModalOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'F2') {
        event.preventDefault();
        handleAddFileRow();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAddModalOpen, formFiles.length]);

  const sortedItems = useMemo(() => {
    if (!sortField) return items;
    const copy = [...items];
    copy.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'documentGroup') {
        cmp = a.documentGroup.localeCompare(b.documentGroup, 'vi');
      } else {
        cmp = parseVnDateTime(a[sortField]) - parseVnDateTime(b[sortField]);
      }
      return sortDirection === 'asc' ? cmp : -cmp;
    });
    return copy;
  }, [items, sortField, sortDirection]);

  const isAllSelected =
    sortedItems.length > 0 &&
    sortedItems.every((item) => selectedIds.includes(item.id));

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleToggleAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(sortedItems.map((i) => i.id));
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
    const headers = [
      'Nhóm tài liệu',
      'Loại giấy tờ',
      'Loại bản lưu',
      'Vị trí (Tủ, kệ)',
      'Ngày hiệu lực',
      'Ngày hết hạn',
      'Còn hiệu lực',
      'Ngày tạo',
      'Ngày thay đổi gần nhất',
    ];
    const escapeCsv = (val: string) => `"${(val || '').replace(/"/g, '""')}"`;
    const rows = sortedItems.map((row) => [
      escapeCsv(row.documentGroup),
      escapeCsv(row.documentType),
      escapeCsv(row.storageType),
      escapeCsv(row.location),
      escapeCsv(row.effectiveDate),
      escapeCsv(row.expiryDate),
      escapeCsv(row.isValid ? 'Có' : 'Không'),
      escapeCsv(row.createdAt),
      escapeCsv(row.updatedAt),
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([new Uint8Array([0xef, 0xbb, 0xbf]), csvContent], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'tu_luu_tru.csv');
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
      const nowStr = formatNowVnDateTime();
      const imported: DocumentCabinetRecord[] = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map((c) => c.replace(/^"|"$/g, '').trim());
        if (cols[0]) {
          imported.push({
            id: `doc-cab-imp-${Date.now()}-${i}`,
            documentGroup: cols[0].slice(0, 200),
            documentType: (cols[1] || '').slice(0, 200),
            storageType: (cols[2] || 'Bản Cứng').slice(0, 100),
            location: (cols[3] || '').slice(0, 200),
            effectiveDate: (cols[4] || '').slice(0, 32),
            expiryDate: (cols[5] || '').slice(0, 32),
            isValid: cols[6]
              ? cols[6].toLowerCase() !== 'không' && cols[6].toLowerCase() !== 'false'
              : true,
            files: [],
            createdAt: (cols[7] || nowStr).slice(0, 64),
            updatedAt: (cols[8] || nowStr).slice(0, 64),
          });
        }
      }
      if (imported.length > 0) {
        setItems((prev) => [...imported, ...prev]);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const resetModalForm = () => {
    setFormGroup('');
    setGroupSearch('');
    setIsGroupDropdownOpen(false);
    setFormDocType('');
    setFormStorageType('');
    setFormLocation('');
    setFormEffectiveDate('');
    setFormExpiryDate('');
    setFormIsValid(false);
    setFormFiles([]);
    setFocusFileRowId(null);
    setFormError('');
  };

  const handleOpenAddModal = () => {
    setEditingId(null);
    resetModalForm();
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (record: DocumentCabinetRecord) => {
    setEditingId(record.id);
    setFormGroup(record.documentGroup || '');
    setGroupSearch(record.documentGroup || '');
    setIsGroupDropdownOpen(false);
    setFormDocType(record.documentType || '');
    setFormStorageType(record.storageType || '');
    setFormLocation(record.location || '');
    setFormEffectiveDate(record.effectiveDate || '');
    setFormExpiryDate(record.expiryDate || '');
    setFormIsValid(Boolean(record.isValid));
    setFormFiles((record.files || []).map((f) => ({ ...f })));
    setFocusFileRowId(null);
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setEditingId(null);
  };

  const handleRemoveFileRow = (id: string) => {
    setFormFiles((prev) => prev.filter((row) => row.id !== id));
  };

  const saveModalRecord = (keepOpen: boolean) => {
    const selectedGroup = (formGroup || groupSearch).trim();
    if (!selectedGroup) {
      setFormError('Vui lòng chọn Nhóm tài liệu.');
      return;
    }

    const cleanedFiles: DocumentCabinetFileItem[] = formFiles
      .map((f, idx) => ({
        id:
          f.id && !f.id.startsWith('file-draft-')
            ? f.id.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128)
            : `file-${Date.now()}-${idx}`,
        description: f.description.trim().slice(0, 500),
        link: f.link.trim().slice(0, 500),
        fileName: f.fileName.trim().slice(0, 255),
      }))
      .filter((f) => f.description || f.link || f.fileName)
      .slice(0, 50);

    const nowStr = formatNowVnDateTime();

    if (editingId) {
      setItems((prev) =>
        prev.map((item) =>
          item.id === editingId
            ? {
                ...item,
                documentGroup: selectedGroup.slice(0, 200),
                documentType: formDocType.trim().slice(0, 200),
                storageType: formStorageType.trim().slice(0, 100),
                location: formLocation.trim().slice(0, 200),
                effectiveDate: formEffectiveDate.trim().slice(0, 32),
                expiryDate: formExpiryDate.trim().slice(0, 32),
                isValid: formIsValid,
                files: cleanedFiles,
                updatedAt: nowStr,
              }
            : item
        )
      );
    } else {
      const newRecord: DocumentCabinetRecord = {
        id: `doc-cab-${Date.now()}`,
        documentGroup: selectedGroup.slice(0, 200),
        documentType: formDocType.trim().slice(0, 200),
        storageType: formStorageType.trim().slice(0, 100),
        location: formLocation.trim().slice(0, 200),
        effectiveDate: formEffectiveDate.trim().slice(0, 32),
        expiryDate: formExpiryDate.trim().slice(0, 32),
        isValid: formIsValid,
        files: cleanedFiles,
        createdAt: nowStr,
        updatedAt: nowStr,
      };
      setItems((prev) => [newRecord, ...prev]);
    }

    if (keepOpen) {
      setEditingId(null);
      resetModalForm();
    } else {
      handleCloseModal();
    }
  };

  const handleSaveNewRecord = (e: React.FormEvent) => {
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

      {/* Main Full-Height Table Viewlist */}
      <div className="flex-1 min-h-0 p-2 flex flex-col">
        <div className="flex-1 min-h-0 bg-white rounded-[8px] border border-gray-200 overflow-auto">
          <table className="w-full border-collapse text-[13px] min-w-[1180px]">
            <thead className="bg-[#F8FAFC] sticky top-0 z-10">
              <tr className="text-gray-700 font-semibold text-[12.5px]">
                <th className="w-[44px] py-2.5 px-2 border-r border-b border-gray-200 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleToggleAll}
                    className="w-3.5 h-3.5 rounded border-gray-300 cursor-pointer accent-[#1677FF]"
                  />
                </th>
                <th
                  onClick={() => handleSort('documentGroup')}
                  className="w-[155px] py-2.5 px-3 border-r border-b border-gray-200 text-left cursor-pointer hover:bg-gray-100/70 transition-colors"
                >
                  <div className="flex items-center justify-between gap-1.5">
                    <span>Nhóm tài liệu</span>
                    <ArrowUpDown
                      className={`w-3.5 h-3.5 shrink-0 ${
                        sortField === 'documentGroup' ? 'text-[#1677FF]' : 'text-gray-400'
                      }`}
                    />
                  </div>
                </th>
                <th className="w-[260px] py-2.5 px-3 border-r border-[#C7D8F4] border-b border-b-gray-200 text-left">
                  Loại giấy tờ
                </th>
                <th className="w-[155px] py-2.5 px-3 border-r border-b border-gray-200 text-left">
                  Loại bản lưu
                </th>
                <th className="w-[140px] py-2.5 px-3 border-r border-b border-gray-200 text-left">
                  Vị trí (Tủ, kệ)
                </th>
                <th className="w-[115px] py-2.5 px-3 border-r border-b border-gray-200 text-left">
                  Ngày hiệu lực
                </th>
                <th className="w-[115px] py-2.5 px-3 border-r border-b border-gray-200 text-left">
                  Ngày hết hạn
                </th>
                <th className="w-[105px] py-2.5 px-3 border-r border-b border-gray-200 text-center">
                  Còn hiệu lực
                </th>
                <th
                  onClick={() => handleSort('createdAt')}
                  className="w-[145px] py-2.5 px-3 border-r border-b border-gray-200 text-left cursor-pointer hover:bg-gray-100/70 transition-colors"
                >
                  <div className="flex items-center justify-between gap-1.5">
                    <span>Ngày tạo</span>
                    <ArrowUpDown
                      className={`w-3.5 h-3.5 shrink-0 ${
                        sortField === 'createdAt' ? 'text-[#1677FF]' : 'text-gray-400'
                      }`}
                    />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('updatedAt')}
                  className="w-[195px] py-2.5 px-3 border-r border-b border-gray-200 text-left cursor-pointer hover:bg-gray-100/70 transition-colors"
                >
                  <div className="flex items-center justify-between gap-1.5">
                    <span>Ngày thay đổi gần nhất</span>
                    <ArrowUpDown
                      className={`w-3.5 h-3.5 shrink-0 ${
                        sortField === 'updatedAt' ? 'text-[#1677FF]' : 'text-gray-400'
                      }`}
                    />
                  </div>
                </th>
                <th className="py-2.5 px-3 border-b border-gray-200"></th>
              </tr>
            </thead>
            <tbody>
              {sortedItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={11}
                    className="py-12 text-center text-gray-400 text-[13px]"
                  >
                    Không có dữ liệu phù hợp
                  </td>
                </tr>
              ) : (
                sortedItems.map((row) => {
                  const isSelected = selectedIds.includes(row.id);
                  return (
                    <tr
                      key={row.id}
                      onClick={() => handleOpenEditModal(row)}
                      className={`border-b border-gray-100 hover:bg-[#F4F7FA] transition-colors cursor-pointer ${
                        isSelected ? 'bg-blue-50/40' : 'bg-white'
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
                      <td className="py-2.5 px-3 border-r border-gray-100 text-gray-800 align-middle whitespace-nowrap">
                        {row.documentGroup}
                      </td>
                      <td className="py-2.5 px-3 border-r border-gray-100 text-gray-800 align-middle">
                        {row.documentType}
                      </td>
                      <td className="py-2.5 px-3 border-r border-gray-100 text-gray-800 align-middle whitespace-nowrap">
                        {row.storageType}
                      </td>
                      <td className="py-2.5 px-3 border-r border-gray-100 text-gray-800 align-middle whitespace-nowrap">
                        {row.location}
                      </td>
                      <td className="py-2.5 px-3 border-r border-gray-100 text-gray-800 align-middle tabular-nums whitespace-nowrap">
                        {row.effectiveDate}
                      </td>
                      <td className="py-2.5 px-3 border-r border-gray-100 text-gray-800 align-middle tabular-nums whitespace-nowrap">
                        {row.expiryDate}
                      </td>
                      <td className="py-2.5 px-3 border-r border-gray-100 text-center align-middle">
                        <span
                          className={`inline-flex items-center justify-center w-4 h-4 rounded-[3px] ${
                            row.isValid
                              ? 'bg-[#2563EB] text-white'
                              : 'border border-gray-300 bg-white'
                          }`}
                        >
                          {row.isValid && <Check className="w-3 h-3 stroke-[3]" />}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 border-r border-gray-100 text-gray-800 align-middle tabular-nums whitespace-nowrap">
                        {row.createdAt}
                      </td>
                      <td className="py-2.5 px-3 border-r border-gray-100 text-gray-800 align-middle tabular-nums whitespace-nowrap">
                        {row.updatedAt}
                      </td>
                      <td className="py-2.5 px-3"></td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Document Cabinet Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 select-text">
          <div className="bg-[#F8FAFC] rounded-xl border border-gray-200 shadow-2xl w-full max-w-[820px] overflow-visible">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 pt-4 pb-2">
              <h2 className="text-[18px] font-semibold text-[#1E293B]">
                {editingId ? 'Chỉnh sửa tài liệu lưu trữ' : 'Thêm tài liệu lưu trữ'}
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

            <form
              onSubmit={handleSaveNewRecord}
              className="px-6 pb-5 pt-2 space-y-4"
              noValidate
            >
              {/* Row 1: Nhóm tài liệu * | Loại giấy tờ | Loại bản lưu */}
              <div className="grid grid-cols-3 gap-4">
                {/* Nhóm tài liệu * */}
                <div ref={groupDropdownRef} className="relative">
                  <label className="block text-[13px] font-semibold text-[#1E293B] mb-1.5">
                    Nhóm tài liệu <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={200}
                      value={groupSearch}
                      onFocus={() => setIsGroupDropdownOpen(true)}
                      onChange={(e) => {
                        const val = e.target.value;
                        setGroupSearch(val);
                        setFormGroup(val);
                        setIsGroupDropdownOpen(true);
                        if (formError) setFormError('');
                      }}
                      placeholder="Tìm tên"
                      className={`w-full bg-white border rounded-[8px] pl-3.5 pr-8 py-2 text-[13.5px] text-gray-800 placeholder-[#94A3B8] focus:outline-none ${
                        formError
                          ? 'border-red-500 focus:border-red-500'
                          : 'border-gray-200 focus:border-[#2563EB]'
                      }`}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setIsGroupDropdownOpen((prev) => !prev)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
                      tabIndex={-1}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>

                  {isGroupDropdownOpen && (
                    <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-[8px] shadow-lg z-30 py-1 max-h-48 overflow-y-auto">
                      {filteredCategories.length === 0 ? (
                        <div className="px-3 py-2 text-[12.5px] text-gray-400">
                          Không tìm thấy nhóm tài liệu
                        </div>
                      ) : (
                        filteredCategories.map((cat) => (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => {
                              setFormGroup(cat.groupName);
                              setGroupSearch(cat.groupName);
                              setFormDocType('');
                              setIsGroupDropdownOpen(false);
                              if (formError) setFormError('');
                            }}
                            className={`w-full text-left px-3 py-2 text-[13px] hover:bg-[#EFF6FF] transition-colors cursor-pointer ${
                              formGroup === cat.groupName
                                ? 'bg-[#EFF6FF] text-[#1D63ED] font-medium'
                                : 'text-gray-700'
                            }`}
                          >
                            {cat.groupName}
                          </button>
                        ))
                      )}
                    </div>
                  )}

                  {formError && (
                    <p className="text-[12px] text-red-500 mt-1">{formError}</p>
                  )}
                </div>

                {/* Loại giấy tờ */}
                <div>
                  <label className="block text-[13px] font-semibold text-[#1E293B] mb-1.5">
                    Loại giấy tờ
                  </label>
                  <div className="relative">
                    <select
                      value={formDocType}
                      onChange={(e) => setFormDocType(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-[8px] pl-3.5 pr-8 py-2 text-[13.5px] text-gray-800 appearance-none focus:outline-none focus:border-[#2563EB] cursor-pointer"
                    >
                      <option value=""></option>
                      {formDocType &&
                        !availableDocTypes.some((dt) => dt.name === formDocType) && (
                          <option value={formDocType}>{formDocType}</option>
                        )}
                      {availableDocTypes.map((dt) => (
                        <option key={dt.id} value={dt.name}>
                          {dt.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Loại bản lưu */}
                <div>
                  <label className="block text-[13px] font-semibold text-[#1E293B] mb-1.5">
                    Loại bản lưu
                  </label>
                  <div className="relative">
                    <select
                      value={formStorageType}
                      onChange={(e) => setFormStorageType(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-[8px] pl-3.5 pr-8 py-2 text-[13.5px] text-gray-800 appearance-none focus:outline-none focus:border-[#2563EB] cursor-pointer"
                    >
                      <option value=""></option>
                      {formStorageType &&
                        !STORAGE_TYPE_OPTIONS.includes(formStorageType) && (
                          <option value={formStorageType}>{formStorageType}</option>
                        )}
                      {STORAGE_TYPE_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Row 2: Vị trí | Ngày hiệu lực | Ngày hết hạn */}
              <div className="grid grid-cols-3 gap-4">
                {/* Vị trí */}
                <div>
                  <label className="block text-[13px] font-semibold text-[#1E293B] mb-1.5">
                    Vị trí
                  </label>
                  <input
                    type="text"
                    maxLength={200}
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-[8px] px-3.5 py-2 text-[13.5px] text-gray-800 placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB]"
                  />
                </div>

                {/* Ngày hiệu lực */}
                <div>
                  <label className="block text-[13px] font-semibold text-[#1E293B] mb-1.5">
                    Ngày hiệu lực
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={32}
                      value={formEffectiveDate}
                      onChange={(e) => setFormEffectiveDate(e.target.value)}
                      placeholder="DD/ MM/ YYYY"
                      className="w-full bg-white border border-gray-200 rounded-[8px] pl-3.5 pr-9 py-2 text-[13.5px] text-gray-800 placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB] tabular-nums"
                    />
                    <input
                      ref={effectiveDatePickerRef}
                      type="date"
                      value={vnDateToIso(formEffectiveDate)}
                      onChange={(e) => {
                        const formatted = isoToVnDate(e.target.value);
                        if (formatted) setFormEffectiveDate(formatted);
                      }}
                      className="sr-only"
                      tabIndex={-1}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const el = effectiveDatePickerRef.current;
                        if (!el) return;
                        if (typeof el.showPicker === 'function') {
                          el.showPicker();
                        } else {
                          el.focus();
                          el.click();
                        }
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#475569] hover:text-[#1D63ED] cursor-pointer"
                      title="Chọn ngày hiệu lực"
                    >
                      <Calendar className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Ngày hết hạn */}
                <div>
                  <label className="block text-[13px] font-semibold text-[#1E293B] mb-1.5">
                    Ngày hết hạn
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={32}
                      value={formExpiryDate}
                      onChange={(e) => setFormExpiryDate(e.target.value)}
                      placeholder="DD/ MM/ YYYY"
                      className="w-full bg-white border border-gray-200 rounded-[8px] pl-3.5 pr-9 py-2 text-[13.5px] text-gray-800 placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB] tabular-nums"
                    />
                    <input
                      ref={expiryDatePickerRef}
                      type="date"
                      value={vnDateToIso(formExpiryDate)}
                      onChange={(e) => {
                        const formatted = isoToVnDate(e.target.value);
                        if (formatted) setFormExpiryDate(formatted);
                      }}
                      className="sr-only"
                      tabIndex={-1}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const el = expiryDatePickerRef.current;
                        if (!el) return;
                        if (typeof el.showPicker === 'function') {
                          el.showPicker();
                        } else {
                          el.focus();
                          el.click();
                        }
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#475569] hover:text-[#1D63ED] cursor-pointer"
                      title="Chọn ngày hết hạn"
                    >
                      <Calendar className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Row 3: Còn hiệu lực */}
              <div className="pt-0.5">
                <label className="inline-flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsValid}
                    onChange={(e) => setFormIsValid(e.target.checked)}
                    className="w-4 h-4 rounded-[3px] border-gray-400 accent-[#1D63ED] cursor-pointer"
                  />
                  <span className="text-[13.5px] text-[#1E293B]">Còn hiệu lực</span>
                </label>
              </div>

              {/* Row 4: Danh sách file */}
              <div>
                <label className="block text-[13px] font-semibold text-[#1E293B] mb-1.5">
                  Danh sách file
                </label>

                <div className="bg-white border border-gray-200 rounded-[10px] overflow-hidden">
                  <table className="w-full table-fixed border-collapse text-[13px]">
                    <thead className="bg-[#F1F5F9]">
                      <tr className="text-[#1E293B] font-semibold border-b border-[#BFDBFE]">
                        <th className="w-[44px] py-2.5 px-2 border-r border-gray-200"></th>
                        <th className="w-[46px] py-2.5 px-2 border-r border-gray-200 text-center">
                          #
                        </th>
                        <th className="w-[27%] py-2.5 px-3 border-r border-[#93C5FD]/70 text-left">
                          Mô tả
                        </th>
                        <th className="w-[34%] py-2.5 px-3 border-r border-[#93C5FD]/70 text-left">
                          Link
                        </th>
                        <th className="py-2.5 px-3 text-left">File tải lên</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formFiles.map((fileRow, idx) => (
                        <tr
                          key={fileRow.id}
                          className="border-b border-gray-100 hover:bg-[#F8FAFC]"
                        >
                          <td className="py-1.5 px-2 border-r border-dashed border-gray-200 text-center align-middle">
                            <button
                              type="button"
                              onClick={() => handleRemoveFileRow(fileRow.id)}
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
                              maxLength={500}
                              autoFocus={focusFileRowId === fileRow.id}
                              value={fileRow.description}
                              onChange={(e) => {
                                const val = e.target.value;
                                setFormFiles((prev) =>
                                  prev.map((row) =>
                                    row.id === fileRow.id
                                      ? { ...row, description: val }
                                      : row
                                  )
                                );
                              }}
                              placeholder="Nhập mô tả"
                              className="w-full bg-transparent px-1.5 py-1 text-[13px] text-gray-800 placeholder-[#94A3B8] focus:outline-none focus:bg-[#EFF6FF]/40 rounded"
                            />
                          </td>
                          <td className="py-1 px-2 border-r border-dashed border-gray-200 align-middle">
                            <input
                              type="text"
                              maxLength={500}
                              value={fileRow.link}
                              onChange={(e) => {
                                const val = e.target.value;
                                setFormFiles((prev) =>
                                  prev.map((row) =>
                                    row.id === fileRow.id ? { ...row, link: val } : row
                                  )
                                );
                              }}
                              placeholder="https://..."
                              className="w-full bg-transparent px-1.5 py-1 text-[13px] text-gray-800 placeholder-[#94A3B8] focus:outline-none focus:bg-[#EFF6FF]/40 rounded"
                            />
                          </td>
                          <td className="py-1 px-2 align-middle">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <label className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#334155] text-[12px] font-medium cursor-pointer shrink-0 transition-colors">
                                <Upload className="w-3 h-3" />
                                <span>{fileRow.fileName ? 'Đổi file' : 'Tải lên'}</span>
                                <input
                                  type="file"
                                  className="hidden"
                                  onChange={(e) => {
                                    const picked = e.target.files?.[0];
                                    if (!picked) return;
                                    setFormFiles((prev) =>
                                      prev.map((row) =>
                                        row.id === fileRow.id
                                          ? {
                                              ...row,
                                              fileName: picked.name.slice(0, 255),
                                            }
                                          : row
                                      )
                                    );
                                    e.target.value = '';
                                  }}
                                />
                              </label>
                              {fileRow.fileName && (
                                <span
                                  className="text-[12px] text-[#1D63ED] truncate"
                                  title={fileRow.fileName}
                                >
                                  {fileRow.fileName}
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}

                      {/* Inline Quick-Add Row */}
                      <tr className="bg-white">
                        <td className="py-2.5 px-2 border-r border-dashed border-gray-200"></td>
                        <td className="py-2.5 px-2 border-r border-dashed border-gray-200"></td>
                        <td
                          colSpan={2}
                          className="py-2.5 px-3 border-r border-dashed border-gray-200"
                        >
                          <button
                            type="button"
                            onClick={handleAddFileRow}
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
                    <button
                      type="button"
                      onClick={handleAddFileRow}
                      className="bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#1E293B] px-3 py-1.5 rounded-[8px] text-[13px] font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Thêm dòng (F2)</span>
                    </button>

                    <span
                      className="text-[#334155] cursor-help inline-flex items-center"
                      title="Nhấn F2 hoặc bấm vào dòng trống để thêm nhanh tệp đính kèm mới"
                    >
                      <HelpCircle className="w-4 h-4" />
                    </span>
                  </div>
                </div>
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
