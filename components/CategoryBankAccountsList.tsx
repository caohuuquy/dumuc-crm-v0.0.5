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
  Pin,
  Check,
  X,
} from 'lucide-react';
import { useFirestoreCollection } from '../firebase';

export interface CategoryBankAccountRecord {
  id: string;
  bankCode: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  isReceiptAccount: boolean;
  isPaymentAccount: boolean;
  isDefault: boolean;
}

const STORAGE_KEY = 'category_bank_accounts_v1';

interface BankCatalogOption {
  code: string;
  fullName: string;
}

const VIETNAM_BANKS: BankCatalogOption[] = [
  { code: 'BIDV', fullName: 'BIDV - Ngân hàng TMCP Đầu tư và Phát triển Việt Nam' },
  { code: 'ACB', fullName: 'ACB - Ngân hàng TMCP Á Châu' },
  { code: 'VCB', fullName: 'VCB - Ngân hàng TMCP Ngoại thương Việt Nam (Vietcombank)' },
  { code: 'CTG', fullName: 'CTG - Ngân hàng TMCP Công thương Việt Nam (VietinBank)' },
  { code: 'AGR', fullName: 'AGR - Ngân hàng Nông nghiệp và Phát triển Nông thôn Việt Nam (Agribank)' },
  { code: 'TCB', fullName: 'TCB - Ngân hàng TMCP Kỹ thương Việt Nam (Techcombank)' },
  { code: 'MBB', fullName: 'MBB - Ngân hàng TMCP Quân đội (MB Bank)' },
  { code: 'VPB', fullName: 'VPB - Ngân hàng TMCP Việt Nam Thịnh Vượng (VPBank)' },
  { code: 'STB', fullName: 'STB - Ngân hàng TMCP Sài Gòn Thương Tín (Sacombank)' },
  { code: 'TPB', fullName: 'TPB - Ngân hàng TMCP Tiên Phong (TPBank)' },
  { code: 'HDB', fullName: 'HDB - Ngân hàng TMCP Phát triển TP.HCM (HDBank)' },
  { code: 'VIB', fullName: 'VIB - Ngân hàng TMCP Quốc tế Việt Nam (VIB)' },
  { code: 'SHB', fullName: 'SHB - Ngân hàng TMCP Sài Gòn - Hà Nội (SHB)' },
  { code: 'EIB', fullName: 'EIB - Ngân hàng TMCP Xuất Nhập khẩu Việt Nam (Eximbank)' },
  { code: 'MSB', fullName: 'MSB - Ngân hàng TMCP Hàng Hải Việt Nam (MSB)' },
  { code: 'OCB', fullName: 'OCB - Ngân hàng TMCP Phương Đông (OCB)' },
  { code: 'LPB', fullName: 'LPB - Ngân hàng TMCP Lộc Phát Việt Nam (LPBank)' },
  { code: 'SSB', fullName: 'SSB - Ngân hàng TMCP Đông Nam Á (SeABank)' },
  { code: 'SCB', fullName: 'SCB - Ngân hàng TMCP Sài Gòn (SCB)' },
  { code: 'NAB', fullName: 'NAB - Ngân hàng TMCP Nam Á (Nam A Bank)' },
  { code: 'ABB', fullName: 'ABB - Ngân hàng TMCP An Bình (ABBANK)' },
  { code: 'BAB', fullName: 'BAB - Ngân hàng TMCP Bắc Á (Bac A Bank)' },
  { code: 'BVB', fullName: 'BVB - Ngân hàng TMCP Bản Việt (BVBank)' },
  { code: 'PGB', fullName: 'PGB - Ngân hàng TMCP Thịnh vượng và Phát triển (PGBank)' },
  { code: 'VAB', fullName: 'VAB - Ngân hàng TMCP Việt Á (VietABank)' },
  { code: 'NVB', fullName: 'NVB - Ngân hàng TMCP Quốc Dân (NCB)' },
  { code: 'KLB', fullName: 'KLB - Ngân hàng TMCP Kiên Long (KienlongBank)' },
  { code: 'SGB', fullName: 'SGB - Ngân hàng TMCP Sài Gòn Công Thương (SAIGONBANK)' },
  { code: 'SHBVN', fullName: 'SHBVN - Ngân hàng TNHH MTV Shinhan Việt Nam' },
  { code: 'HSBC', fullName: 'HSBC - Ngân hàng TNHH MTV HSBC (Việt Nam)' },
  { code: 'SCVN', fullName: 'SCVN - Ngân hàng TNHH MTV Standard Chartered (Việt Nam)' },
  { code: 'UOB', fullName: 'UOB - Ngân hàng TNHH MTV United Overseas Bank (Việt Nam)' },
  { code: 'WOO', fullName: 'WOO - Ngân hàng TNHH MTV Woori Việt Nam' },
];

const normalizeAccountNumber = (val: string): string =>
  val.replace(/[\s\-]/g, '').trim().toLowerCase();

export const INITIAL_CATEGORY_BANK_ACCOUNTS: CategoryBankAccountRecord[] = [
  {
    id: 'bank-acc-1',
    bankCode: 'BIDV',
    bankName: 'BIDV - Ngân hàng TMCP Đầu tư và Phát triển Việt Nam',
    accountNumber: '99789565737',
    accountHolder: 'Nguyen Hoang Duc Khang',
    isReceiptAccount: true,
    isPaymentAccount: false,
    isDefault: true,
  },
  {
    id: 'bank-acc-2',
    bankCode: 'ACB',
    bankName: 'ACB - Ngân hàng TMCP Á Châu',
    accountNumber: '899679442',
    accountHolder: 'Truong Van Tai',
    isReceiptAccount: false,
    isPaymentAccount: true,
    isDefault: false,
  },
];

export const CategoryBankAccountsList: React.FC = () => {
  const loadInitialBankAccounts = (): CategoryBankAccountRecord[] => {
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
    return INITIAL_CATEGORY_BANK_ACCOUNTS;
  };

  const [items, setItems] = useFirestoreCollection<CategoryBankAccountRecord>(
    'category_bank_accounts_items',
    loadInitialBankAccounts,
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
  const [searchQuery, setSearchQuery] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState('20');
  const [currentPage, setCurrentPage] = useState(1);

  // Add / Edit modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formBankCode, setFormBankCode] = useState('');
  const [formBankName, setFormBankName] = useState('');
  const [bankSearch, setBankSearch] = useState('');
  const [isBankDropdownOpen, setIsBankDropdownOpen] = useState(false);
  const [formAccountNumber, setFormAccountNumber] = useState('');
  const [formAccountHolder, setFormAccountHolder] = useState('');
  const [formIsReceipt, setFormIsReceipt] = useState(false);
  const [formIsPayment, setFormIsPayment] = useState(false);
  const [formIsDefault, setFormIsDefault] = useState(false);
  const [bankError, setBankError] = useState('');
  const [accountNumberError, setAccountNumberError] = useState('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const bankDropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        bankDropdownRef.current &&
        !bankDropdownRef.current.contains(event.target as Node)
      ) {
        setIsBankDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredBanks = useMemo(() => {
    const q = bankSearch.trim().toLowerCase();
    if (!q) return VIETNAM_BANKS;
    return VIETNAM_BANKS.filter(
      (b) =>
        b.code.toLowerCase().includes(q) ||
        b.fullName.toLowerCase().includes(q)
    );
  }, [bankSearch]);

  const findDuplicateAccountNumber = (
    accountVal: string,
    excludeId: string | null
  ): CategoryBankAccountRecord | null => {
    const normalized = normalizeAccountNumber(accountVal);
    if (!normalized) return null;
    return (
      items.find(
        (item) =>
          item.id !== excludeId &&
          item.accountNumber &&
          normalizeAccountNumber(item.accountNumber) === normalized
      ) || null
    );
  };

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.bankCode.toLowerCase().includes(q) ||
        item.bankName.toLowerCase().includes(q) ||
        item.accountNumber.toLowerCase().includes(q) ||
        item.accountHolder.toLowerCase().includes(q)
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

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    setItems((prev) => prev.filter((item) => !selectedIds.includes(item.id)));
    setSelectedIds([]);
  };

  const handleExportExcel = () => {
    const headers = [
      'Ngân hàng',
      'Tên ngân hàng',
      'Số tài khoản',
      'Tên chủ tài khoản',
      'TK thu',
      'TK chi',
      'Mặc định',
    ];
    const escapeCsv = (val: string) => `"${(val || '').replace(/"/g, '""')}"`;
    const rows = filteredItems.map((row) => [
      escapeCsv(row.bankCode),
      escapeCsv(row.bankName),
      escapeCsv(row.accountNumber),
      escapeCsv(row.accountHolder),
      row.isReceiptAccount ? 'Có' : 'Không',
      row.isPaymentAccount ? 'Có' : 'Không',
      row.isDefault ? 'Có' : 'Không',
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([new Uint8Array([0xef, 0xbb, 0xbf]), csvContent], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'tai_khoan_ngan_hang.csv');
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
      const imported: CategoryBankAccountRecord[] = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map((c) => c.replace(/^"|"$/g, '').trim());
        if (cols[0] && cols[2]) {
          imported.push({
            id: `bank-acc-imp-${Date.now()}-${i}`,
            bankCode: cols[0].slice(0, 50),
            bankName: (cols[1] || '').slice(0, 250),
            accountNumber: cols[2].slice(0, 64),
            accountHolder: (cols[3] || '').slice(0, 200),
            isReceiptAccount: cols[4]?.toLowerCase() === 'có' || cols[4] === 'true' || cols[4] === '1',
            isPaymentAccount: cols[5]?.toLowerCase() === 'có' || cols[5] === 'true' || cols[5] === '1',
            isDefault: cols[6]?.toLowerCase() === 'có' || cols[6] === 'true' || cols[6] === '1',
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
    setFormBankCode('');
    setFormBankName('');
    setBankSearch('');
    setIsBankDropdownOpen(false);
    setFormAccountNumber('');
    setFormAccountHolder('');
    setFormIsReceipt(false);
    setFormIsPayment(false);
    setFormIsDefault(false);
    setBankError('');
    setAccountNumberError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (row: CategoryBankAccountRecord) => {
    setEditingId(row.id);
    setFormBankCode(row.bankCode);
    setFormBankName(row.bankName);
    const matched = VIETNAM_BANKS.find(
      (b) => b.code.toLowerCase() === row.bankCode.toLowerCase()
    );
    setBankSearch(row.bankName || matched?.fullName || row.bankCode);
    setIsBankDropdownOpen(false);
    setFormAccountNumber(row.accountNumber);
    setFormAccountHolder(row.accountHolder);
    setFormIsReceipt(row.isReceiptAccount);
    setFormIsPayment(row.isPaymentAccount);
    setFormIsDefault(row.isDefault);
    setBankError('');
    setAccountNumberError('');
    setIsModalOpen(true);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedBankCode = formBankCode.trim().slice(0, 50);
    const trimmedBankName = formBankName.trim().slice(0, 250);
    const trimmedAccountNumber = formAccountNumber.trim().slice(0, 64);
    const trimmedAccountHolder = formAccountHolder.trim().slice(0, 200);

    let hasError = false;

    if (!trimmedBankCode) {
      setBankError('Vui lòng chọn Ngân hàng từ danh mục.');
      hasError = true;
    } else {
      setBankError('');
    }

    if (!trimmedAccountNumber) {
      setAccountNumberError('Vui lòng nhập Số tài khoản.');
      hasError = true;
    } else {
      const dup = findDuplicateAccountNumber(trimmedAccountNumber, editingId);
      if (dup) {
        setAccountNumberError(
          `Số tài khoản "${trimmedAccountNumber}" đã tồn tại. Không được trùng.`
        );
        hasError = true;
      } else {
        setAccountNumberError('');
      }
    }

    if (hasError) return;

    if (editingId) {
      setItems((prev) =>
        prev.map((item) => {
          if (item.id === editingId) {
            return {
              ...item,
              bankCode: trimmedBankCode,
              bankName: trimmedBankName,
              accountNumber: trimmedAccountNumber,
              accountHolder: trimmedAccountHolder,
              isReceiptAccount: formIsReceipt,
              isPaymentAccount: formIsPayment,
              isDefault: formIsDefault,
            };
          }
          return formIsDefault ? { ...item, isDefault: false } : item;
        })
      );
    } else {
      const newRecord: CategoryBankAccountRecord = {
        id: `bank-acc-${Date.now()}`,
        bankCode: trimmedBankCode,
        bankName: trimmedBankName,
        accountNumber: trimmedAccountNumber,
        accountHolder: trimmedAccountHolder,
        isReceiptAccount: formIsReceipt,
        isPaymentAccount: formIsPayment,
        isDefault: formIsDefault,
      };
      setItems((prev) => {
        const base = formIsDefault
          ? prev.map((item) => ({ ...item, isDefault: false }))
          : prev;
        return [newRecord, ...base];
      });
      setCurrentPage(1);
    }
    setIsModalOpen(false);
  };

  const renderStatusCheckbox = (checked: boolean) => (
    <span
      className={`inline-flex items-center justify-center w-3.5 h-3.5 rounded-[3px] transition-colors ${
        checked
          ? 'bg-[#8FA0B5] text-white'
          : 'bg-white border border-gray-300'
      }`}
    >
      {checked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
    </span>
  );

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
            className="bg-[#1A4B9F] hover:bg-[#153E85] text-white px-3 py-1.5 rounded-[6px] text-[13px] font-medium flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <span className="w-4 h-4 rounded-full bg-white text-[#1A4B9F] inline-flex items-center justify-center font-bold text-xs leading-none">
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
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Tìm mã, số tài khoản"
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
        <table className="w-full border-collapse text-[13px] table-fixed min-w-[1120px]">
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
              <th className="w-[130px] py-2.5 px-3 border-r border-b border-gray-200 text-left">
                <div className="flex items-center justify-between gap-1">
                  <span>Ngân hàng</span>
                  <Pin className="w-3 h-3 text-[#B45309] fill-[#B45309] shrink-0" />
                </div>
              </th>
              <th className="w-[255px] py-2.5 px-3 border-r border-b border-gray-200 text-left">
                Tên ngân hàng
              </th>
              <th className="w-[130px] py-2.5 px-3 border-r border-b border-gray-200 text-left">
                Số tài khoản
              </th>
              <th className="w-[215px] py-2.5 px-3 border-r border-b border-gray-200 text-left">
                Tên chủ tài khoản
              </th>
              <th className="w-[95px] py-2.5 px-3 border-r border-b border-gray-200 text-center">
                TK thu
              </th>
              <th className="w-[95px] py-2.5 px-3 border-r border-b border-gray-200 text-center">
                TK chi
              </th>
              <th className="w-[95px] py-2.5 px-3 border-r border-b border-gray-200 text-center">
                Mặc định
              </th>
              <th className="py-2.5 px-3 border-b border-gray-200"></th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
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
                    <td className="py-2.5 px-3 border-r border-gray-100 text-gray-800 align-middle">
                      {row.bankCode}
                    </td>
                    <td className="py-2.5 px-3 border-r border-gray-100 text-gray-800 align-middle whitespace-normal break-words leading-snug">
                      {row.bankName}
                    </td>
                    <td className="py-2.5 px-3 border-r border-gray-100 text-gray-800 align-middle whitespace-nowrap">
                      {row.accountNumber}
                    </td>
                    <td className="py-2.5 px-3 border-r border-gray-100 text-gray-800 align-middle whitespace-normal break-words">
                      {row.accountHolder}
                    </td>
                    <td className="py-2.5 px-3 border-r border-gray-100 text-center align-middle">
                      {renderStatusCheckbox(row.isReceiptAccount)}
                    </td>
                    <td className="py-2.5 px-3 border-r border-gray-100 text-center align-middle">
                      {renderStatusCheckbox(row.isPaymentAccount)}
                    </td>
                    <td className="py-2.5 px-3 border-r border-gray-100 text-center align-middle">
                      {renderStatusCheckbox(row.isDefault)}
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
            {filteredItems.length === 0 ? '0' : `${displayStart}–${displayEnd}`}
          </strong>{' '}
          /{' '}
          <strong className="font-semibold text-gray-800">
            {filteredItems.length}
          </strong>{' '}
          kết quả
        </div>
      </div>

      {/* Add / Edit Bank Account Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 select-text">
          <div className="bg-white rounded-lg border border-gray-200 shadow-xl w-full max-w-[500px] overflow-visible">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-[#F8FAFC] rounded-t-lg">
              <h2 className="text-[15px] font-semibold text-gray-800">
                {editingId ? 'Chỉnh sửa tài khoản ngân hàng' : 'Thêm tài khoản ngân hàng'}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="p-4 space-y-3" noValidate>
              <div ref={bankDropdownRef} className="relative">
                <label className="block text-[12.5px] font-medium text-gray-700 mb-1">
                  Ngân hàng <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={bankSearch}
                    onFocus={() => setIsBankDropdownOpen(true)}
                    onChange={(e) => {
                      const val = e.target.value;
                      setBankSearch(val);
                      setIsBankDropdownOpen(true);
                      if (val !== formBankName) {
                        setFormBankCode('');
                        setFormBankName('');
                      }
                      if (bankError) setBankError('');
                    }}
                    placeholder="Chọn ngân hàng (Mã - Tên ngân hàng đầy đủ)"
                    className={`w-full border rounded-[6px] pl-3 pr-8 py-1.5 text-[13px] text-gray-800 focus:outline-none ${
                      bankError
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:border-[#1677FF]'
                    }`}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setIsBankDropdownOpen((prev) => !prev)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>

                {isBankDropdownOpen && (
                  <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-[6px] shadow-lg max-h-[240px] overflow-y-auto z-50">
                    {filteredBanks.length === 0 ? (
                      <div className="px-3 py-2.5 text-[12.5px] text-gray-400 text-center">
                        Không tìm thấy ngân hàng phù hợp
                      </div>
                    ) : (
                      filteredBanks.map((bank) => {
                        const isSelected = formBankCode === bank.code;
                        return (
                          <button
                            key={bank.code}
                            type="button"
                            onClick={() => {
                              setFormBankCode(bank.code);
                              setFormBankName(bank.fullName);
                              setBankSearch(bank.fullName);
                              setBankError('');
                              setIsBankDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 text-[13px] hover:bg-[#EFF6FF] transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-[#EFF6FF] text-[#1677FF] font-medium'
                                : 'text-gray-800'
                            }`}
                          >
                            {bank.fullName}
                          </button>
                        );
                      })
                    )}
                  </div>
                )}

                {bankError && (
                  <p className="text-[12px] text-red-500 mt-1">{bankError}</p>
                )}
              </div>

              <div>
                <label className="block text-[12.5px] font-medium text-gray-700 mb-1">
                  Số tài khoản <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formAccountNumber}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormAccountNumber(val);
                    const dup = findDuplicateAccountNumber(val, editingId);
                    if (dup) {
                      setAccountNumberError(
                        `Số tài khoản "${val.trim()}" đã tồn tại. Không được trùng.`
                      );
                    } else if (accountNumberError) {
                      setAccountNumberError('');
                    }
                  }}
                  placeholder="Nhập số tài khoản"
                  className={`w-full border rounded-[6px] px-3 py-1.5 text-[13px] text-gray-800 focus:outline-none ${
                    accountNumberError
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:border-[#1677FF]'
                  }`}
                />
                {accountNumberError && (
                  <p className="text-[12px] text-red-500 mt-1">
                    {accountNumberError}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[12.5px] font-medium text-gray-700 mb-1">
                  Tên chủ tài khoản
                </label>
                <input
                  type="text"
                  value={formAccountHolder}
                  onChange={(e) => setFormAccountHolder(e.target.value)}
                  placeholder="Nhập tên chủ tài khoản"
                  className="w-full border border-gray-300 rounded-[6px] px-3 py-1.5 text-[13px] text-gray-800 focus:outline-none focus:border-[#1677FF]"
                />
              </div>

              <div className="flex items-center gap-6 pt-1">
                <label className="inline-flex items-center gap-2 text-[13px] text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsReceipt}
                    onChange={(e) => setFormIsReceipt(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-gray-300 accent-[#1677FF] cursor-pointer"
                  />
                  <span>TK thu</span>
                </label>
                <label className="inline-flex items-center gap-2 text-[13px] text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsPayment}
                    onChange={(e) => setFormIsPayment(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-gray-300 accent-[#1677FF] cursor-pointer"
                  />
                  <span>TK chi</span>
                </label>
                <label className="inline-flex items-center gap-2 text-[13px] text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsDefault}
                    onChange={(e) => setFormIsDefault(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-gray-300 accent-[#1677FF] cursor-pointer"
                  />
                  <span>Mặc định</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-[6px] border border-gray-300 text-gray-700 text-[13px] hover:bg-gray-50 cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-[6px] bg-[#1A4B9F] hover:bg-[#153E85] text-white text-[13px] font-medium cursor-pointer"
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
