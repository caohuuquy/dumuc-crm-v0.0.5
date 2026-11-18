import React, { useState } from 'react';
import {
  Download,
  Trash2,
  Settings,
  FilePlus2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X,
} from 'lucide-react';
import { useFirestoreCollection } from '../firebase';

export interface TaxCategoryRecord {
  id: string;
  code: string;
  rate: string;
  name: string;
  debitAccount: string;
  suspenseDebitAccount: string;
  creditAccount: string;
  suspenseCreditAccount?: string;
}

export const INITIAL_TAX_CATEGORIES: TaxCategoryRecord[] = [
  {
    id: 'tax-1',
    code: '00',
    rate: '0',
    name: '0%',
    debitAccount: '13311',
    suspenseDebitAccount: '',
    creditAccount: '33311',
  },
  {
    id: 'tax-2',
    code: '10',
    rate: '10',
    name: '10%',
    debitAccount: '13311',
    suspenseDebitAccount: '',
    creditAccount: '33311',
  },
  {
    id: 'tax-3',
    code: '05',
    rate: '5',
    name: '5%',
    debitAccount: '13311',
    suspenseDebitAccount: '',
    creditAccount: '33311',
  },
  {
    id: 'tax-4',
    code: '08',
    rate: '8',
    name: '8%',
    debitAccount: '13311',
    suspenseDebitAccount: '',
    creditAccount: '33311',
  },
  {
    id: 'tax-5',
    code: 'KT',
    rate: '0',
    name: 'KCT',
    debitAccount: '13311',
    suspenseDebitAccount: '',
    creditAccount: '33311',
  },
  {
    id: 'tax-6',
    code: 'TK',
    rate: '0',
    name: 'KHAC',
    debitAccount: '13311',
    suspenseDebitAccount: '',
    creditAccount: '33311',
  },
  {
    id: 'tax-7',
    code: 'KK',
    rate: '0',
    name: 'KKKNT',
    debitAccount: '13311',
    suspenseDebitAccount: '',
    creditAccount: '33311',
  },
];

const TAX_ACCOUNT_OPTIONS = [
  '13311',
  '13312',
  '1332',
  '1388',
  '33311',
  '33312',
  '3332',
  '3333',
  '3388',
];

export const TaxCategoryList: React.FC = () => {
  const [items, setItems] = useFirestoreCollection<TaxCategoryRecord>(
    'tax_categories_items',
    INITIAL_TAX_CATEGORIES,
    'id'
  );
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [rowsPerPage, setRowsPerPage] = useState('20');
  const [currentPage, setCurrentPage] = useState(1);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formRate, setFormRate] = useState('');
  const [formCreditAccount, setFormCreditAccount] = useState('');
  const [formSuspenseCreditAccount, setFormSuspenseCreditAccount] = useState('');
  const [formDebitAccount, setFormDebitAccount] = useState('');
  const [formSuspenseDebitAccount, setFormSuspenseDebitAccount] = useState('');

  const resetForm = () => {
    setFormCode('');
    setFormName('');
    setFormRate('');
    setFormCreditAccount('');
    setFormSuspenseCreditAccount('');
    setFormDebitAccount('');
    setFormSuspenseDebitAccount('');
  };

  const handleOpenAddModal = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    resetForm();
  };

  const handleSaveTax = (keepOpen: boolean) => {
    if (!formCode.trim() && !formName.trim()) {
      return;
    }
    const newRecord: TaxCategoryRecord = {
      id: `tax-${Date.now()}`,
      code: formCode.trim(),
      rate: formRate.trim() !== '' ? formRate.trim() : '0',
      name: formName.trim(),
      debitAccount: formDebitAccount,
      suspenseDebitAccount: formSuspenseDebitAccount,
      creditAccount: formCreditAccount,
      suspenseCreditAccount: formSuspenseCreditAccount,
    };
    setItems((prev) => [...prev, newRecord]);
    if (keepOpen) {
      resetForm();
    } else {
      handleCloseAddModal();
    }
  };

  const isAllSelected =
    items.length > 0 && selectedIds.length === items.length;

  const handleToggleAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map((i) => i.id));
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

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-[#EEF2F6] text-[13px] text-gray-800 select-none">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#EEF2F6] shrink-0">
        <div className="flex items-center gap-2">
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
            className="bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded-[6px] text-[13px] flex items-center gap-1.5 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <FilePlus2 className="w-3.5 h-3.5 text-gray-500" />
            <span>Nhập excel</span>
          </button>

          <button
            type="button"
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
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            type="button"
            className="w-8 h-8 bg-white border border-gray-300 rounded-[6px] flex items-center justify-center text-[#1E3A8A] hover:bg-gray-50 transition-colors cursor-pointer"
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

      {/* Main Content Card */}
      <div className="flex-1 flex flex-col bg-white rounded-t-lg border border-gray-200 overflow-hidden mx-0.5">
        {/* Table Area */}
        <div className="flex-1 overflow-auto bg-white">
          <table className="w-full border-collapse text-[13px] table-fixed min-w-[960px]">
            <thead className="bg-[#F8FAFC] sticky top-0 z-10">
              <tr className="text-gray-600 font-semibold text-[12px]">
                <th className="w-[46px] py-2.5 px-2 border-r border-b border-gray-200 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleToggleAll}
                    className="w-3.5 h-3.5 rounded border-gray-300 cursor-pointer accent-[#1677FF]"
                  />
                </th>
                <th className="w-[100px] py-2.5 px-3 border-r border-b border-gray-200 text-left">
                  Mã
                </th>
                <th className="w-[100px] py-2.5 px-3 border-r border-b border-gray-200 text-left">
                  Thuế suất
                </th>
                <th className="w-[240px] py-2.5 px-3 border-r border-b border-gray-200 text-left">
                  Tên
                </th>
                <th className="w-[160px] py-2.5 px-3 border-r border-b border-gray-200 text-left">
                  TK thuế nợ
                </th>
                <th className="w-[160px] py-2.5 px-3 border-r border-b border-gray-200 text-left">
                  TK thuế nợ treo tạm
                </th>
                <th className="w-[160px] py-2.5 px-3 border-b border-gray-200 text-left">
                  TK thuế có
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((row) => {
                const isSelected = selectedIds.includes(row.id);
                return (
                  <tr
                    key={row.id}
                    className={`border-b border-gray-200 hover:bg-gray-50/70 transition-colors ${
                      isSelected ? 'bg-blue-50/40' : 'bg-white'
                    }`}
                  >
                    <td className="py-2.5 px-2 border-r border-gray-200 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleRow(row.id)}
                        className="w-3.5 h-3.5 rounded border-gray-300 cursor-pointer accent-[#1677FF]"
                      />
                    </td>
                    <td className="py-2.5 px-3 border-r border-gray-200 text-gray-800 truncate">
                      {row.code}
                    </td>
                    <td className="py-2.5 px-3 border-r border-gray-200 text-gray-800 truncate">
                      {row.rate}
                    </td>
                    <td className="py-2.5 px-3 border-r border-gray-200 text-gray-800 truncate">
                      {row.name}
                    </td>
                    <td className="py-2.5 px-3 border-r border-gray-200 text-gray-800 truncate">
                      {row.debitAccount}
                    </td>
                    <td className="py-2.5 px-3 border-r border-gray-200 text-gray-800 truncate">
                      {row.suspenseDebitAccount}
                    </td>
                    <td className="py-2.5 px-3 text-gray-800 truncate">
                      {row.creditAccount}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Pagination Bar */}
      <div className="bg-white border-t border-gray-200 px-3 py-2 flex items-center justify-between shrink-0 text-[12px] text-gray-600">
        <div className="flex items-center gap-2">
          <span>Số dòng:</span>
          <div className="relative">
            <select
              value={rowsPerPage}
              onChange={(e) => setRowsPerPage(e.target.value)}
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
            disabled={currentPage === 1}
            className="w-7 h-7 flex items-center justify-center rounded-[6px] text-gray-400 hover:text-gray-700 disabled:opacity-40 cursor-pointer"
          >
            <ChevronsLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="w-7 h-7 flex items-center justify-center rounded-[6px] text-gray-400 hover:text-gray-700 disabled:opacity-40 cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setCurrentPage(1)}
            className="w-7 h-7 flex items-center justify-center rounded-[6px] text-[12px] font-semibold border border-[#1677FF] text-[#1677FF] bg-white cursor-pointer"
          >
            1
          </button>

          <button
            type="button"
            disabled
            className="w-7 h-7 flex items-center justify-center rounded-[6px] text-gray-400 opacity-40 cursor-not-allowed border border-gray-200"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            disabled
            className="w-7 h-7 flex items-center justify-center rounded-[6px] text-gray-400 opacity-40 cursor-not-allowed border border-gray-200"
          >
            <ChevronsRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="border border-gray-200 rounded-[6px] px-3 py-1 bg-white text-[12px] text-gray-600">
          Hiển thị <strong className="font-semibold text-gray-800">1–{items.length}</strong> /{' '}
          <strong className="font-semibold text-gray-800">{items.length}</strong> kết quả
        </div>
      </div>

      {/* Add Tax Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-[12px] shadow-xl w-full max-w-[540px] px-6 py-5 flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[18px] font-semibold text-[#1E293B]">thuế</h2>
              <button
                type="button"
                onClick={handleCloseAddModal}
                className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Body */}
            <div className="space-y-4">
              {/* Mã thuế */}
              <div>
                <label className="block text-[14px] font-semibold text-[#1E293B] mb-1.5">
                  Mã thuế <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                  placeholder="Nhập mã thuế"
                  className="w-full border border-gray-200 rounded-[8px] px-3.5 py-2.5 text-[14px] text-gray-800 placeholder-[#94A3B8] focus:outline-none focus:border-[#1677FF]"
                />
              </div>

              {/* Tên thuế */}
              <div>
                <label className="block text-[14px] font-semibold text-[#1E293B] mb-1.5">
                  Tên thuế <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Nhập tên thuế"
                  className="w-full border border-gray-200 rounded-[8px] px-3.5 py-2.5 text-[14px] text-gray-800 placeholder-[#94A3B8] focus:outline-none focus:border-[#1677FF]"
                />
              </div>

              {/* Thuế suất */}
              <div>
                <label className="block text-[14px] font-semibold text-[#1E293B] mb-1.5">
                  Thuế suất
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formRate}
                    onChange={(e) => setFormRate(e.target.value)}
                    placeholder="Nhập thuế suất"
                    className="w-full border border-gray-200 rounded-[8px] pl-3.5 pr-9 py-2.5 text-[14px] text-gray-800 placeholder-[#94A3B8] focus:outline-none focus:border-[#1677FF]"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[14px] font-medium text-[#1E293B] pointer-events-none">
                    %
                  </span>
                </div>
              </div>

              {/* Row: TK thuế có & TK thuế có treo tạm */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[14px] font-semibold text-[#1E293B] mb-1.5">
                    TK thuế có <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={formCreditAccount}
                      onChange={(e) => setFormCreditAccount(e.target.value)}
                      className={`w-full border border-gray-200 rounded-[8px] pl-3.5 pr-9 py-2.5 text-[14px] appearance-none bg-white focus:outline-none focus:border-[#1677FF] cursor-pointer ${
                        formCreditAccount ? 'text-gray-800' : 'text-[#94A3B8]'
                      }`}
                    >
                      <option value="">Chọn tài khoản</option>
                      {TAX_ACCOUNT_OPTIONS.map((acc) => (
                        <option key={acc} value={acc} className="text-gray-800">
                          {acc}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-[14px] font-semibold text-[#1E293B] mb-1.5">
                    TK thuế có treo tạm
                  </label>
                  <div className="relative">
                    <select
                      value={formSuspenseCreditAccount}
                      onChange={(e) => setFormSuspenseCreditAccount(e.target.value)}
                      className={`w-full border border-gray-200 rounded-[8px] pl-3.5 pr-9 py-2.5 text-[14px] appearance-none bg-white focus:outline-none focus:border-[#1677FF] cursor-pointer ${
                        formSuspenseCreditAccount ? 'text-gray-800' : 'text-[#94A3B8]'
                      }`}
                    >
                      <option value="">Chọn tài khoản</option>
                      {TAX_ACCOUNT_OPTIONS.map((acc) => (
                        <option key={acc} value={acc} className="text-gray-800">
                          {acc}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Row: TK thuế nợ & TK thuế nợ treo tạm */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[14px] font-semibold text-[#1E293B] mb-1.5">
                    TK thuế nợ <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={formDebitAccount}
                      onChange={(e) => setFormDebitAccount(e.target.value)}
                      className={`w-full border border-gray-200 rounded-[8px] pl-3.5 pr-9 py-2.5 text-[14px] appearance-none bg-white focus:outline-none focus:border-[#1677FF] cursor-pointer ${
                        formDebitAccount ? 'text-gray-800' : 'text-[#94A3B8]'
                      }`}
                    >
                      <option value="">Chọn tài khoản</option>
                      {TAX_ACCOUNT_OPTIONS.map((acc) => (
                        <option key={acc} value={acc} className="text-gray-800">
                          {acc}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-[14px] font-semibold text-[#1E293B] mb-1.5">
                    TK thuế nợ treo tạm
                  </label>
                  <div className="relative">
                    <select
                      value={formSuspenseDebitAccount}
                      onChange={(e) => setFormSuspenseDebitAccount(e.target.value)}
                      className={`w-full border border-gray-200 rounded-[8px] pl-3.5 pr-9 py-2.5 text-[14px] appearance-none bg-white focus:outline-none focus:border-[#1677FF] cursor-pointer ${
                        formSuspenseDebitAccount ? 'text-gray-800' : 'text-[#94A3B8]'
                      }`}
                    >
                      <option value="">Chọn tài khoản</option>
                      {TAX_ACCOUNT_OPTIONS.map((acc) => (
                        <option key={acc} value={acc} className="text-gray-800">
                          {acc}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 mt-7">
              <button
                type="button"
                onClick={handleCloseAddModal}
                className="px-4 py-2 text-[14px] font-medium text-[#475569] hover:text-gray-800 transition-colors cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={() => handleSaveTax(true)}
                className="px-5 py-2 rounded-[8px] border border-[#1677FF] text-[#1677FF] bg-white hover:bg-blue-50 text-[14px] font-medium transition-colors cursor-pointer"
              >
                Lưu &amp; thêm
              </button>
              <button
                type="button"
                onClick={() => handleSaveTax(false)}
                className="px-7 py-2 rounded-[8px] bg-[#1677FF] hover:bg-blue-600 text-white text-[14px] font-semibold transition-colors cursor-pointer"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
