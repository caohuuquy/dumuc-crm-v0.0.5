import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Download,
  Trash2,
  Settings,
  Filter,
  FilterX,
  ChevronDown,
  FilePlus2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  X,
  Calendar,
  HelpCircle,
  Plus,
} from 'lucide-react';

export interface CustomerDocumentRow {
  id: string;
  docType: string;
  effectiveDate: string;
  expiryDate: string;
  note: string;
  isValid: boolean;
  files: { id: string; name: string; size: string }[];
}

export interface CategoryCustomerRecord {
  id: string;
  code: string;
  name: string;
  phone: string;
  vehicle: string;
  brand: string;
  model: string;
  email: string;
  cccd: string;
  address: string;
  classification: 'Cá nhân' | 'Công ty';
  group: string;
  isSupplier: boolean;
  isCompany?: boolean;
  isEmployee?: boolean;
  createDriver?: boolean;
  province?: string;
  ward?: string;
  streetAddress?: string;
  companyName?: string;
  position?: string;
  taxCode?: string;
  documents?: CustomerDocumentRow[];
}

const DOCUMENT_TYPE_OPTIONS = [
  'CCCD / CMND',
  'Giấy phép kinh doanh',
  'Giấy phép lái xe',
  'Đăng ký xe',
  'Giấy đăng kiểm',
  'Bảo hiểm xe',
  'Hợp đồng',
  'Khác',
];

const createEmptyDocumentRow = (): CustomerDocumentRow => ({
  id: `doc-row-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  docType: '',
  effectiveDate: '',
  expiryDate: '',
  note: '',
  isValid: false,
  files: [],
});

const formatIsoToDisplayDate = (iso: string): string => {
  if (!iso) return '';
  const parts = iso.split('-');
  if (parts.length !== 3) return iso;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

const STORAGE_KEY = 'category_customers_list_v1';

const CUSTOMER_GROUP_OPTIONS = [
  'Cá nhân',
  'Tổ chức',
  'Khách hàng VIP',
  'Khách hàng doanh nghiệp',
  'Khách hàng thân thiết',
  'Khách lẻ',
];

const PROVINCE_WARD_MAP: Record<string, string[]> = {
  'Thành phố Hồ Chí Minh': [
    'Phường Bến Nghé',
    'Phường Bến Thành',
    'Phường Thủ Đức',
    'Phường Tân Phú',
    'Phường Thạnh Xuân',
    'Phường 4',
    'Phường Tân Thuận Tây',
  ],
  'Thành phố Hà Nội': [
    'Phường Bạch Đằng',
    'Phường Thanh Nhàn',
    'Phường Tràng Tiền',
    'Phường Dịch Vọng',
    'Xã Kim Long',
  ],
  'Thành phố Đà Nẵng': [
    'Phường Hải Châu 1',
    'Phường Thạch Thang',
    'Phường An Hải Bắc',
    'Phường Hòa Cường Nam',
  ],
  'Tỉnh Bình Dương': [
    'Phường Phú Cường',
    'Phường Dĩ An',
    'Phường Lái Thiêu',
  ],
  'Tỉnh Đồng Nai': [
    'Phường Tân Phong',
    'Phường Trảng Dài',
    'Phường Tam Hiệp',
  ],
  'Thành phố Cần Thơ': [
    'Phường Tân An',
    'Phường Xuân Khánh',
    'Phường An Khánh',
  ],
};

export const INITIAL_CATEGORY_CUSTOMERS: CategoryCustomerRecord[] = [
  {
    id: 'cc-1',
    code: 'VIETTEL',
    name: 'VIETTEL POST',
    phone: '0933 511 376',
    vehicle: '51H 78905',
    brand: 'Mazda',
    model: '',
    email: '',
    cccd: '',
    address: 'Thành phố Hồ Chí Minh',
    classification: 'Cá nhân',
    group: '',
    isSupplier: false,
  },
  {
    id: 'cc-2',
    code: 'UT',
    name: 'CÔNG TY TNHH ƯU THỊNH',
    phone: '0906 386 068',
    vehicle: '',
    brand: '',
    model: '',
    email: '',
    cccd: '',
    address: 'Lô 12-13, Đường D2, KCN Tân Bình',
    classification: 'Cá nhân',
    group: '',
    isSupplier: true,
  },
  {
    id: 'cc-3',
    code: 'TTTTTTTTTTTTTT',
    name: 'Trường',
    phone: '',
    vehicle: '',
    brand: '',
    model: '',
    email: '',
    cccd: '',
    address: '',
    classification: 'Cá nhân',
    group: '',
    isSupplier: false,
  },
  {
    id: 'cc-4',
    code: 'TRUONG0973123',
    name: 'Trường test',
    phone: '',
    vehicle: '',
    brand: '',
    model: '',
    email: '',
    cccd: '',
    address: '',
    classification: 'Cá nhân',
    group: '',
    isSupplier: false,
  },
  {
    id: 'cc-5',
    code: 'TRNGLCA',
    name: 'Trường-LCA',
    phone: '',
    vehicle: '51H 24929,63A 26157,51H11111',
    brand: 'MERCEDES BENZ,BMW,',
    model: '..',
    email: '',
    cccd: '',
    address: '',
    classification: 'Cá nhân',
    group: 'Cá nhân',
    isSupplier: false,
  },
  {
    id: 'cc-6',
    code: 'TRG',
    name: 'Trường',
    phone: '',
    vehicle: '',
    brand: '',
    model: '',
    email: 'nxtruong0811@gmail.com',
    cccd: '',
    address: '',
    classification: 'Cá nhân',
    group: '',
    isSupplier: false,
  },
  {
    id: 'cc-7',
    code: 'THUNGHIEM',
    name: 'Thử nghiệm',
    phone: '1234 567 890',
    vehicle: '',
    brand: '',
    model: '',
    email: 'thunghiem@thunghiem.com',
    cccd: '',
    address: '1245 Nguyễn Thử, Xã Kim Long',
    classification: 'Công ty',
    group: '',
    isSupplier: false,
  },
  {
    id: 'cc-8',
    code: 'THEANH',
    name: 'The Anh',
    phone: '',
    vehicle: '',
    brand: '',
    model: '',
    email: '',
    cccd: '',
    address: '',
    classification: 'Cá nhân',
    group: '',
    isSupplier: false,
  },
  {
    id: 'cc-9',
    code: 'TESTAPP',
    name: 'testapp',
    phone: '',
    vehicle: 'TESTAPP',
    brand: '',
    model: '',
    email: '',
    cccd: '',
    address: '',
    classification: 'Cá nhân',
    group: '',
    isSupplier: false,
  },
  {
    id: 'cc-10',
    code: 'TESTAP1',
    name: 'Test App',
    phone: '0901 000 002',
    vehicle: '',
    brand: '',
    model: '',
    email: 'xtruong0811@gmail.com',
    cccd: '',
    address: '',
    classification: 'Cá nhân',
    group: '',
    isSupplier: false,
  },
  {
    id: 'cc-11',
    code: 'TESSTTT',
    name: 'Test',
    phone: '',
    vehicle: '',
    brand: '',
    model: '',
    email: '',
    cccd: '',
    address: '',
    classification: 'Cá nhân',
    group: '',
    isSupplier: false,
  },
  {
    id: 'cc-12',
    code: 'TC211025002',
    name: 'Công Ty Cổ Phần Điện Trường Giang',
    phone: '0999 865 765',
    vehicle: '43C 09964',
    brand: 'Mazda',
    model: '',
    email: 'truonggiang@contact.vn',
    cccd: '',
    address: 'Phường Thủ Đức, Thành phố Hồ Chí Minh',
    classification: 'Công ty',
    group: 'Tổ chức',
    isSupplier: false,
  },
  {
    id: 'cc-13',
    code: 'PTTN',
    name: 'PHỤ TÙNG Ô TÔ TIỆP NGUYỄN',
    phone: '0999 999 999',
    vehicle: '',
    brand: '',
    model: '',
    email: 'email@gmail.com',
    cccd: 'cccd',
    address: 'Số 3/11/101 Thanh Nhàn, Xã Thanh Nhàn',
    classification: 'Cá nhân',
    group: '',
    isSupplier: true,
  },
  {
    id: 'cc-14',
    code: 'PTNAMPHONG',
    name: 'Công ty Cổ Phần Phụ Tùng Ô Tô Nam Phong',
    phone: '0961 534 699',
    vehicle: '',
    brand: '',
    model: '',
    email: '',
    cccd: '',
    address: '8B10 Đầm Trấu, Bạch Đằng',
    classification: 'Cá nhân',
    group: '',
    isSupplier: true,
  },
  {
    id: 'cc-15',
    code: 'PTDY',
    name: 'CÔNG TY TNHH TM ĐẮC YẾN',
    phone: '0997 768 867',
    vehicle: '',
    brand: '',
    model: '',
    email: '',
    cccd: '',
    address: '403 Tô Ngọc Vân, Phường Thạnh Xuân',
    classification: 'Cá nhân',
    group: '',
    isSupplier: true,
  },
  {
    id: 'cc-16',
    code: 'PTDG',
    name: 'PHỤ TÙNG Ô TÔ DƯƠNG GIA',
    phone: '0983 987 873',
    vehicle: '',
    brand: '',
    model: '',
    email: '',
    cccd: '',
    address: '442 An Dương Vương, Phường 4',
    classification: 'Cá nhân',
    group: '',
    isSupplier: true,
  },
  {
    id: 'cc-17',
    code: 'PHMNGCLM',
    name: 'Phạm Ngọc Lâm',
    phone: '',
    vehicle: '',
    brand: '',
    model: '',
    email: '',
    cccd: '',
    address: 'Phường Tân Phú, Thành phố Hồ Chí Minh',
    classification: 'Cá nhân',
    group: '',
    isSupplier: false,
  },
  {
    id: 'cc-18',
    code: 'PHANKHNHTNG',
    name: 'Phan Khánh Tường',
    phone: '',
    vehicle: '',
    brand: '',
    model: '',
    email: '',
    cccd: '',
    address: '',
    classification: 'Cá nhân',
    group: '',
    isSupplier: false,
  },
  {
    id: 'cc-19',
    code: 'NXTRUONG',
    name: 'N X Truong',
    phone: '0901 000 001',
    vehicle: '',
    brand: '',
    model: '',
    email: 'truongnx@goodapp.vn',
    cccd: '',
    address: '',
    classification: 'Cá nhân',
    group: '',
    isSupplier: false,
  },
  {
    id: 'cc-20',
    code: 'NVB',
    name: 'Nguyễn Văn B',
    phone: '0358 779 987',
    vehicle: '',
    brand: '',
    model: '',
    email: '',
    cccd: '',
    address: 'Thành phố Đà Nẵng',
    classification: 'Cá nhân',
    group: '',
    isSupplier: false,
  },
];

export const CategoryCustomersList: React.FC = () => {
  const [items, setItems] = useState<CategoryCustomerRecord[]>(() => {
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
    return INITIAL_CATEGORY_CUSTOMERS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore storage write errors
    }
  }, [items]);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Filter inputs
  const [codeInput, setCodeInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [emailInput, setEmailInput] = useState('');

  // Applied filters
  const [appliedFilters, setAppliedFilters] = useState({
    code: '',
    name: '',
    phone: '',
    email: '',
  });

  // Sorting
  const [sortField, setSortField] = useState<'code' | 'name' | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  // Pagination
  const [rowsPerPage, setRowsPerPage] = useState('20');
  const [currentPage, setCurrentPage] = useState(1);

  // Full-screen Add modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeAddTab, setActiveAddTab] = useState<'company' | 'documents'>('company');
  const [addFormError, setAddFormError] = useState('');
  const [addForm, setAddForm] = useState({
    code: '',
    name: '',
    group: '',
    phone: '',
    email: '',
    cccd: '',
    province: '',
    ward: '',
    streetAddress: '',
    isCompany: false,
    isSupplier: false,
    isEmployee: false,
    createDriver: false,
    companyName: '',
    position: '',
    taxCode: '',
    documents: [createEmptyDocumentRow()] as CustomerDocumentRow[],
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const docFileInputRef = useRef<HTMLInputElement | null>(null);
  const activeUploadRowIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isAddModalOpen || activeAddTab !== 'documents') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        setAddForm((prev) => ({
          ...prev,
          documents: [...prev.documents, createEmptyDocumentRow()],
        }));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAddModalOpen, activeAddTab]);

  const isFiltering =
    appliedFilters.code.trim() !== '' ||
    appliedFilters.name.trim() !== '' ||
    appliedFilters.phone.trim() !== '' ||
    appliedFilters.email.trim() !== '';

  const filteredItems = useMemo(() => {
    const filtered = items.filter((item) => {
      if (
        appliedFilters.code.trim() &&
        !item.code.toLowerCase().includes(appliedFilters.code.trim().toLowerCase())
      ) {
        return false;
      }
      if (
        appliedFilters.name.trim() &&
        !item.name.toLowerCase().includes(appliedFilters.name.trim().toLowerCase())
      ) {
        return false;
      }
      if (
        appliedFilters.phone.trim() &&
        !item.phone
          .replace(/\s+/g, '')
          .toLowerCase()
          .includes(appliedFilters.phone.replace(/\s+/g, '').trim().toLowerCase())
      ) {
        return false;
      }
      if (
        appliedFilters.email.trim() &&
        !item.email.toLowerCase().includes(appliedFilters.email.trim().toLowerCase())
      ) {
        return false;
      }
      return true;
    });

    if (!sortField) return filtered;
    return [...filtered].sort((a, b) => {
      const aVal = a[sortField].toLowerCase();
      const bVal = b[sortField].toLowerCase();
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [items, appliedFilters, sortField, sortDir]);

  const isAllSelected =
    filteredItems.length > 0 && selectedIds.length === filteredItems.length;

  const handleToggleAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredItems.map((i) => i.id));
    }
  };

  const handleToggleRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleSupplier = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isSupplier: !item.isSupplier } : item
      )
    );
  };

  const handleSort = (field: 'code' | 'name') => {
    if (sortField === field) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const handleFilter = () => {
    setAppliedFilters({
      code: codeInput,
      name: nameInput,
      phone: phoneInput,
      email: emailInput,
    });
    setCurrentPage(1);
  };

  const handleReset = () => {
    setCodeInput('');
    setNameInput('');
    setPhoneInput('');
    setEmailInput('');
    setAppliedFilters({
      code: '',
      name: '',
      phone: '',
      email: '',
    });
    setCurrentPage(1);
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    setItems((prev) => prev.filter((item) => !selectedIds.includes(item.id)));
    setSelectedIds([]);
  };

  const handleExportExcel = () => {
    const headers = [
      'Mã',
      'Tên',
      'Điện thoại',
      'Xe',
      'Hãng xe',
      'Dòng xe',
      'Email',
      'CCCD',
      'Địa chỉ',
      'Phân loại',
      'Nhóm',
      'Là nhà cung cấp',
    ];
    const rows = filteredItems.map((row) => [
      `"${row.code}"`,
      `"${row.name}"`,
      `"${row.phone}"`,
      `"${row.vehicle}"`,
      `"${row.brand}"`,
      `"${row.model}"`,
      `"${row.email}"`,
      `"${row.cccd}"`,
      `"${row.address}"`,
      `"${row.classification}"`,
      `"${row.group}"`,
      row.isSupplier ? 'Có' : 'Không',
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([new Uint8Array([0xef, 0xbb, 0xbf]), csvContent], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'danh_muc_khach_hang.csv');
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
      const imported: CategoryCustomerRecord[] = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map((c) => c.replace(/^"|"$/g, '').trim());
        if (cols[0] || cols[1]) {
          imported.push({
            id: `cc-imp-${Date.now()}-${i}`,
            code: cols[0] || `KH${Date.now()}${i}`,
            name: cols[1] || '',
            phone: cols[2] || '',
            vehicle: cols[3] || '',
            brand: cols[4] || '',
            model: cols[5] || '',
            email: cols[6] || '',
            cccd: cols[7] || '',
            address: cols[8] || '',
            classification: cols[9] === 'Công ty' ? 'Công ty' : 'Cá nhân',
            group: cols[10] || '',
            isSupplier: cols[11]?.toLowerCase() === 'có' || cols[11]?.toLowerCase() === 'true',
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

  const resetAddForm = () => {
    setAddForm({
      code: '',
      name: '',
      group: '',
      phone: '',
      email: '',
      cccd: '',
      province: '',
      ward: '',
      streetAddress: '',
      isCompany: false,
      isSupplier: false,
      isEmployee: false,
      createDriver: false,
      companyName: '',
      position: '',
      taxCode: '',
      documents: [createEmptyDocumentRow()],
    });
    setActiveAddTab('company');
    setAddFormError('');
  };

  const handleOpenAddModal = () => {
    resetAddForm();
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    setAddFormError('');
  };

  const handleAddDocumentRow = () => {
    setAddForm((prev) => ({
      ...prev,
      documents: [...prev.documents, createEmptyDocumentRow()],
    }));
  };

  const handleUpdateDocumentRow = <K extends keyof CustomerDocumentRow>(
    rowId: string,
    field: K,
    value: CustomerDocumentRow[K]
  ) => {
    setAddForm((prev) => ({
      ...prev,
      documents: prev.documents.map((row) =>
        row.id === rowId ? { ...row, [field]: value } : row
      ),
    }));
  };

  const handleRemoveDocumentRow = (rowId: string) => {
    setAddForm((prev) => {
      const remaining = prev.documents.filter((row) => row.id !== rowId);
      return {
        ...prev,
        documents: remaining.length > 0 ? remaining : [createEmptyDocumentRow()],
      };
    });
  };

  const handleTriggerRowFileUpload = (rowId: string) => {
    activeUploadRowIdRef.current = rowId;
    docFileInputRef.current?.click();
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    const targetRowId = activeUploadRowIdRef.current;
    if (!files || files.length === 0 || !targetRowId) return;
    const added = (Array.from(files) as File[]).map((file, idx) => ({
      id: `doc-${Date.now()}-${idx}`,
      name: file.name,
      size: file.size < 1024 * 1024
        ? `${Math.max(1, Math.round(file.size / 1024))} KB`
        : `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
    }));
    setAddForm((prev) => ({
      ...prev,
      documents: prev.documents.map((row) =>
        row.id === targetRowId
          ? { ...row, files: [...row.files, ...added] }
          : row
      ),
    }));
    e.target.value = '';
  };

  const handleRemoveRowFile = (rowId: string, fileId: string) => {
    setAddForm((prev) => ({
      ...prev,
      documents: prev.documents.map((row) =>
        row.id === rowId
          ? { ...row, files: row.files.filter((f) => f.id !== fileId) }
          : row
      ),
    }));
  };

  const handleAddSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!addForm.name.trim()) {
      setAddFormError('Vui lòng nhập Tên khách hàng.');
      return;
    }

    const generatedCode =
      addForm.code.trim() ||
      `KH${String(Date.now()).slice(-6)}`;

    const composedAddress = [
      addForm.streetAddress.trim(),
      addForm.ward.trim(),
      addForm.province.trim(),
    ]
      .filter(Boolean)
      .join(', ');

    const newItem: CategoryCustomerRecord = {
      id: `cc-${Date.now()}`,
      code: generatedCode,
      name: addForm.name.trim(),
      phone: addForm.phone.trim(),
      vehicle: '',
      brand: '',
      model: '',
      email: addForm.email.trim(),
      cccd: addForm.cccd.trim(),
      address: composedAddress,
      classification: addForm.isCompany ? 'Công ty' : 'Cá nhân',
      group: addForm.group,
      isSupplier: addForm.isSupplier,
      isCompany: addForm.isCompany,
      isEmployee: addForm.isEmployee,
      createDriver: addForm.createDriver,
      province: addForm.province,
      ward: addForm.ward,
      streetAddress: addForm.streetAddress.trim(),
      companyName: addForm.companyName.trim(),
      position: addForm.position.trim(),
      taxCode: addForm.taxCode.trim(),
      documents: addForm.documents,
    };

    setItems((prev) => [newItem, ...prev]);
    resetAddForm();
    setIsAddModalOpen(false);
  };

  const totalResults = isFiltering ? filteredItems.length : 739 + (items.length - INITIAL_CATEGORY_CUSTOMERS.length);
  const displayEnd = Math.min(Number(rowsPerPage), filteredItems.length);

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

      {/* Main Content Card */}
      <div className="flex-1 flex flex-col bg-white rounded-t-lg border border-gray-200 overflow-hidden mx-0.5">
        {/* Filter Bar */}
        <div className="px-3 pt-2 pb-2.5 border-b border-gray-200 flex items-end justify-between bg-[#F4F7FA] shrink-0 gap-3 flex-wrap">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div>
              <label className="block text-[12px] font-medium text-gray-700 mb-1">
                Mã
              </label>
              <input
                type="text"
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                placeholder="Tìm theo mã"
                className="w-[156px] bg-white border border-gray-200 rounded-[6px] px-2.5 py-1.5 text-[13px] text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#1677FF]"
              />
            </div>

            <div>
              <label className="block text-[12px] font-medium text-gray-700 mb-1">
                Tên
              </label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                placeholder="Tìm theo tên"
                className="w-[156px] bg-white border border-gray-200 rounded-[6px] px-2.5 py-1.5 text-[13px] text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#1677FF]"
              />
            </div>

            <div>
              <label className="block text-[12px] font-medium text-gray-700 mb-1">
                Điện thoại
              </label>
              <input
                type="text"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                placeholder="Nhập số điện thoại"
                className="w-[156px] bg-white border border-gray-200 rounded-[6px] px-2.5 py-1.5 text-[13px] text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#1677FF]"
              />
            </div>

            <div>
              <label className="block text-[12px] font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="text"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                placeholder="Nhập email"
                className="w-[156px] bg-white border border-gray-200 rounded-[6px] px-2.5 py-1.5 text-[13px] text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#1677FF]"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleFilter}
              className="border border-[#1677FF] text-[#1677FF] bg-white hover:bg-blue-50 px-3.5 py-1.5 rounded-[6px] text-[13px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Filter className="w-3.5 h-3.5 fill-[#1677FF] text-[#1677FF]" />
              <span>Lọc</span>
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 px-3 py-1.5 rounded-[6px] text-[13px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FilterX className="w-3.5 h-3.5 text-gray-700" />
              <span>Đặt lại</span>
            </button>
          </div>
        </div>

        {/* Table Area */}
        <div className="flex-1 overflow-auto bg-white">
          <table className="w-full border-collapse text-[12.5px] table-fixed min-w-[1480px]">
            <thead className="bg-[#F8FAFC] sticky top-0 z-10">
              <tr className="text-gray-600 font-semibold text-[12px]">
                <th className="w-[42px] py-2.5 px-2 border-r border-b border-gray-200 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleToggleAll}
                    className="w-3.5 h-3.5 rounded border-gray-300 cursor-pointer accent-[#1677FF]"
                  />
                </th>
                <th
                  onClick={() => handleSort('code')}
                  className="w-[116px] py-2.5 px-2.5 border-r border-b border-gray-200 text-left cursor-pointer hover:bg-gray-100/70 transition-colors"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span>Mã</span>
                    <ArrowUpDown
                      className={`w-3.5 h-3.5 shrink-0 ${
                        sortField === 'code' ? 'text-[#1677FF]' : 'text-gray-400'
                      }`}
                    />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('name')}
                  className="w-[180px] py-2.5 px-2.5 border-r border-b border-gray-200 text-left cursor-pointer hover:bg-gray-100/70 transition-colors"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span>Tên</span>
                    <ArrowUpDown
                      className={`w-3.5 h-3.5 shrink-0 ${
                        sortField === 'name' ? 'text-[#1677FF]' : 'text-gray-400'
                      }`}
                    />
                  </div>
                </th>
                <th className="w-[106px] py-2.5 px-2.5 border-r border-b border-gray-200 text-left">
                  Điện thoại
                </th>
                <th className="w-[125px] py-2.5 px-2.5 border-r border-b border-gray-200 text-left">
                  Xe
                </th>
                <th className="w-[118px] py-2.5 px-2.5 border-r border-b border-gray-200 text-left">
                  Hãng xe
                </th>
                <th className="w-[116px] py-2.5 px-2.5 border-r border-b border-gray-200 text-left">
                  Dòng xe
                </th>
                <th className="w-[172px] py-2.5 px-2.5 border-r border-b border-gray-200 text-left">
                  Email
                </th>
                <th className="w-[172px] py-2.5 px-2.5 border-r border-b border-gray-200 text-left">
                  CCCD
                </th>
                <th className="w-[178px] py-2.5 px-2.5 border-r border-b border-gray-200 text-left">
                  Địa chỉ
                </th>
                <th className="w-[110px] py-2.5 px-2.5 border-r border-b border-gray-200 text-left">
                  Phân loại
                </th>
                <th className="w-[112px] py-2.5 px-2.5 border-r border-b border-gray-200 text-left">
                  Nhóm
                </th>
                <th className="w-[116px] py-2.5 px-2.5 border-b border-gray-200 text-center">
                  Là nhà cung cấp
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={13}
                    className="py-10 text-center text-gray-400 text-[13px]"
                  >
                    Không có dữ liệu phù hợp
                  </td>
                </tr>
              ) : (
                filteredItems.map((row) => {
                  const isSelected = selectedIds.includes(row.id);
                  return (
                    <tr
                      key={row.id}
                      className={`border-b border-gray-200 hover:bg-gray-50/70 transition-colors ${
                        isSelected ? 'bg-blue-50/40' : 'bg-white'
                      }`}
                    >
                      <td className="py-2 px-2 border-r border-gray-200 text-center align-middle">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleRow(row.id)}
                          className="w-3.5 h-3.5 rounded border-gray-300 cursor-pointer accent-[#1677FF]"
                        />
                      </td>
                      <td
                        className="py-2 px-2.5 border-r border-gray-200 text-gray-800 truncate align-middle"
                        title={row.code}
                      >
                        {row.code}
                      </td>
                      <td
                        className="py-2 px-2.5 border-r border-gray-200 text-gray-800 truncate align-middle"
                        title={row.name}
                      >
                        {row.name}
                      </td>
                      <td className="py-2 px-2.5 border-r border-gray-200 text-gray-800 truncate align-middle">
                        {row.phone}
                      </td>
                      <td
                        className="py-2 px-2.5 border-r border-gray-200 text-gray-800 break-words leading-snug align-middle"
                        title={row.vehicle}
                      >
                        {row.vehicle}
                      </td>
                      <td
                        className="py-2 px-2.5 border-r border-gray-200 text-gray-800 break-words leading-snug align-middle"
                        title={row.brand}
                      >
                        {row.brand}
                      </td>
                      <td
                        className="py-2 px-2.5 border-r border-gray-200 text-gray-800 truncate align-middle"
                        title={row.model}
                      >
                        {row.model}
                      </td>
                      <td
                        className="py-2 px-2.5 border-r border-gray-200 text-gray-800 truncate align-middle"
                        title={row.email}
                      >
                        {row.email}
                      </td>
                      <td
                        className="py-2 px-2.5 border-r border-gray-200 text-gray-800 truncate align-middle"
                        title={row.cccd}
                      >
                        {row.cccd}
                      </td>
                      <td
                        className="py-2 px-2.5 border-r border-gray-200 text-gray-800 truncate align-middle"
                        title={row.address}
                      >
                        {row.address}
                      </td>
                      <td className="py-2 px-2.5 border-r border-gray-200 text-gray-800 truncate align-middle">
                        {row.classification}
                      </td>
                      <td className="py-2 px-2.5 border-r border-gray-200 text-gray-800 truncate align-middle">
                        {row.group}
                      </td>
                      <td className="py-2 px-2.5 text-center align-middle">
                        <input
                          type="checkbox"
                          checked={row.isSupplier}
                          onChange={() => handleToggleSupplier(row.id)}
                          className="w-3.5 h-3.5 rounded border-gray-300 cursor-pointer accent-[#2563EB]"
                        />
                      </td>
                    </tr>
                  );
                })
              )}
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

          {[1, 2, 3, 4, 5].map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => setCurrentPage(page)}
              className={`w-7 h-7 flex items-center justify-center rounded-[6px] text-[12px] font-medium transition-colors cursor-pointer ${
                currentPage === page
                  ? 'border border-[#1677FF] text-[#1677FF] bg-[#EFF6FF] font-semibold'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {page}
            </button>
          ))}

          <span className="px-1.5 text-gray-400">...</span>

          <button
            type="button"
            onClick={() => setCurrentPage(37)}
            className={`w-7 h-7 flex items-center justify-center rounded-[6px] text-[12px] font-medium transition-colors cursor-pointer ${
              currentPage === 37
                ? 'border border-[#1677FF] text-[#1677FF] bg-[#EFF6FF] font-semibold'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            37
          </button>

          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(37, p + 1))}
            className="w-7 h-7 flex items-center justify-center rounded-[6px] text-gray-600 hover:bg-gray-100 cursor-pointer border border-gray-200"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setCurrentPage(37)}
            className="w-7 h-7 flex items-center justify-center rounded-[6px] text-gray-600 hover:bg-gray-100 cursor-pointer border border-gray-200"
          >
            <ChevronsRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="border border-gray-200 rounded-[6px] px-3 py-1 bg-white text-[12px] text-gray-600">
          Hiển thị{' '}
          <strong className="font-semibold text-gray-800">
            {filteredItems.length === 0 ? '0' : `1–${displayEnd}`}
          </strong>{' '}
          / <strong className="font-semibold text-gray-800">{totalResults}</strong> kết quả
        </div>
      </div>

      {/* Full-Screen Add Customer Popup */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#EEF2F6] flex flex-col overflow-hidden select-text">
          {/* Popup Top Header */}
          <div className="h-[52px] px-4 bg-white border-b border-gray-200 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-5 flex-wrap">
              <h2 className="text-[19px] font-semibold text-gray-900 leading-none">
                Khách hàng
              </h2>

              <label className="inline-flex items-center gap-1.5 text-[12.5px] text-gray-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={addForm.isCompany}
                  onChange={(e) =>
                    setAddForm({ ...addForm, isCompany: e.target.checked })
                  }
                  className="w-3.5 h-3.5 rounded border-gray-300 accent-[#1677FF] cursor-pointer"
                />
                <span>Là công ty</span>
              </label>

              <label className="inline-flex items-center gap-1.5 text-[12.5px] text-gray-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={addForm.isSupplier}
                  onChange={(e) =>
                    setAddForm({ ...addForm, isSupplier: e.target.checked })
                  }
                  className="w-3.5 h-3.5 rounded border-gray-300 accent-[#1677FF] cursor-pointer"
                />
                <span>Là nhà cung cấp</span>
              </label>

              <label className="inline-flex items-center gap-1.5 text-[12.5px] text-gray-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={addForm.isEmployee}
                  onChange={(e) =>
                    setAddForm({ ...addForm, isEmployee: e.target.checked })
                  }
                  className="w-3.5 h-3.5 rounded border-gray-300 accent-[#1677FF] cursor-pointer"
                />
                <span>Là nhân viên</span>
              </label>

              <label className="inline-flex items-center gap-1.5 text-[12.5px] text-gray-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={addForm.createDriver}
                  onChange={(e) =>
                    setAddForm({ ...addForm, createDriver: e.target.checked })
                  }
                  className="w-3.5 h-3.5 rounded border-gray-300 accent-[#1677FF] cursor-pointer"
                />
                <span>Tạo tài xế từ khách hàng này</span>
              </label>
            </div>

            <button
              type="button"
              onClick={handleCloseAddModal}
              className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
              title="Đóng"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Popup Main Body */}
          <form
            id="category-customer-add-form"
            onSubmit={handleAddSubmit}
            className="flex-1 flex flex-col gap-2.5 p-2.5 overflow-auto"
          >
            {/* Top Row: Two White Info Cards */}
            <div className="flex flex-col lg:flex-row gap-2.5 items-stretch shrink-0">
              {/* Left Card */}
              <div className="w-full lg:w-[360px] shrink-0 bg-white rounded-lg border border-gray-200 shadow-[0_1px_2px_rgba(15,23,42,0.04)] p-3.5 space-y-3">
                <div>
                  <label className="block text-[12px] font-medium text-gray-800 mb-1">
                    Mã khách hàng
                  </label>
                  <input
                    type="text"
                    value={addForm.code}
                    onChange={(e) =>
                      setAddForm({ ...addForm, code: e.target.value })
                    }
                    placeholder="Nhập hoặc tạo tự động"
                    className="w-full bg-white border border-gray-200 rounded-[6px] px-3 py-1.5 text-[13px] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#1677FF]"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-medium text-gray-800 mb-1">
                    Tên khách hàng <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={addForm.name}
                    onChange={(e) => {
                      setAddForm({ ...addForm, name: e.target.value });
                      if (addFormError) setAddFormError('');
                    }}
                    placeholder="Nhập tên khách hàng"
                    className={`w-full bg-white border rounded-[6px] px-3 py-1.5 text-[13px] text-gray-800 placeholder-gray-400 focus:outline-none ${
                      addFormError
                        ? 'border-red-400 focus:border-red-500'
                        : 'border-gray-200 focus:border-[#1677FF]'
                    }`}
                  />
                  {addFormError && (
                    <p className="mt-1 text-[11.5px] text-red-500">{addFormError}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[12px] font-medium text-gray-800 mb-1">
                    Nhóm khách
                  </label>
                  <div className="relative">
                    <select
                      value={addForm.group}
                      onChange={(e) =>
                        setAddForm({ ...addForm, group: e.target.value })
                      }
                      className={`w-full bg-white border border-gray-200 rounded-[6px] pl-3 pr-8 py-1.5 text-[13px] appearance-none focus:outline-none focus:border-[#1677FF] cursor-pointer ${
                        addForm.group ? 'text-gray-800' : 'text-gray-400'
                      }`}
                    >
                      <option value="">Chọn nhóm khách hàng</option>
                      {CUSTOMER_GROUP_OPTIONS.map((grp) => (
                        <option key={grp} value={grp} className="text-gray-800">
                          {grp}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Right Card */}
              <div className="w-full lg:w-[730px] shrink-0 bg-white rounded-lg border border-gray-200 shadow-[0_1px_2px_rgba(15,23,42,0.04)] p-3.5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-3 gap-y-3">
                  <div>
                    <label className="block text-[12px] font-medium text-gray-800 mb-1">
                      Số điện thoại
                    </label>
                    <input
                      type="text"
                      value={addForm.phone}
                      onChange={(e) =>
                        setAddForm({ ...addForm, phone: e.target.value })
                      }
                      placeholder="Nhập số điện thoại"
                      className="w-full bg-white border border-gray-200 rounded-[6px] px-3 py-1.5 text-[13px] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#1677FF]"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium text-gray-800 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={addForm.email}
                      onChange={(e) =>
                        setAddForm({ ...addForm, email: e.target.value })
                      }
                      placeholder="Nhập email khách hàng"
                      className="w-full bg-white border border-gray-200 rounded-[6px] px-3 py-1.5 text-[13px] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#1677FF]"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium text-gray-800 mb-1">
                      CCCD
                    </label>
                    <input
                      type="text"
                      value={addForm.cccd}
                      onChange={(e) =>
                        setAddForm({ ...addForm, cccd: e.target.value })
                      }
                      placeholder="Nhập số CCCD"
                      className="w-full bg-white border border-gray-200 rounded-[6px] px-3 py-1.5 text-[13px] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#1677FF]"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium text-gray-800 mb-1">
                      Tỉnh thành
                    </label>
                    <div className="relative">
                      <select
                        value={addForm.province}
                        onChange={(e) =>
                          setAddForm({
                            ...addForm,
                            province: e.target.value,
                            ward: '',
                          })
                        }
                        className={`w-full bg-white border border-gray-200 rounded-[6px] pl-3 pr-8 py-1.5 text-[13px] appearance-none focus:outline-none focus:border-[#1677FF] cursor-pointer ${
                          addForm.province ? 'text-gray-800' : 'text-gray-400'
                        }`}
                      >
                        <option value="">Chọn tỉnh thành</option>
                        {Object.keys(PROVINCE_WARD_MAP).map((prov) => (
                          <option key={prov} value={prov} className="text-gray-800">
                            {prov}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium text-gray-800 mb-1">
                      Xã phường
                    </label>
                    <div className="relative">
                      <select
                        value={addForm.ward}
                        onChange={(e) =>
                          setAddForm({ ...addForm, ward: e.target.value })
                        }
                        className={`w-full bg-white border border-gray-200 rounded-[6px] pl-3 pr-8 py-1.5 text-[13px] appearance-none focus:outline-none focus:border-[#1677FF] cursor-pointer ${
                          addForm.ward ? 'text-gray-800' : 'text-gray-400'
                        }`}
                      >
                        <option value="">Chọn xã phường</option>
                        {(addForm.province
                          ? PROVINCE_WARD_MAP[addForm.province] || []
                          : Object.values(PROVINCE_WARD_MAP).flat()
                        ).map((ward) => (
                          <option key={ward} value={ward} className="text-gray-800">
                            {ward}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium text-gray-800 mb-1">
                      Số nhà, tên đường
                    </label>
                    <input
                      type="text"
                      value={addForm.streetAddress}
                      onChange={(e) =>
                        setAddForm({ ...addForm, streetAddress: e.target.value })
                      }
                      placeholder="Nhập địa chỉ cụ thể"
                      className="w-full bg-white border border-gray-200 rounded-[6px] px-3 py-1.5 text-[13px] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#1677FF]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Large Card with Tabs */}
            <div className="flex-1 bg-white rounded-lg border border-gray-200 shadow-[0_1px_2px_rgba(15,23,42,0.04)] flex flex-col min-h-[360px]">
              {/* Tab Strip */}
              <div className="px-2.5 pt-2 border-b border-gray-200 flex items-end gap-1">
                <button
                  type="button"
                  onClick={() => setActiveAddTab('company')}
                  className={`px-4 py-1.5 rounded-t-[6px] text-[12.5px] transition-colors cursor-pointer ${
                    activeAddTab === 'company'
                      ? 'bg-[#FAD957] text-gray-900 font-semibold'
                      : 'bg-[#FEF9E7] text-gray-700 font-medium hover:bg-[#FEF3C7]'
                  }`}
                >
                  Công ty
                </button>
                <button
                  type="button"
                  onClick={() => setActiveAddTab('documents')}
                  className={`px-4 py-1.5 rounded-t-[6px] text-[12.5px] transition-colors cursor-pointer ${
                    activeAddTab === 'documents'
                      ? 'bg-[#FAD957] text-gray-900 font-semibold'
                      : 'bg-[#FEF9E7] text-gray-700 font-medium hover:bg-[#FEF3C7]'
                  }`}
                >
                  Giấy tờ
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-3.5 flex-1">
                {activeAddTab === 'company' ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-[1440px]">
                    <div>
                      <label className="block text-[12px] font-medium text-gray-800 mb-1">
                        Tên công ty
                      </label>
                      <input
                        type="text"
                        value={addForm.companyName}
                        onChange={(e) =>
                          setAddForm({ ...addForm, companyName: e.target.value })
                        }
                        placeholder="Nhập tên công ty"
                        className="w-full bg-white border border-gray-200 rounded-[6px] px-3 py-1.5 text-[13px] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#1677FF]"
                      />
                    </div>

                    <div>
                      <label className="block text-[12px] font-medium text-gray-800 mb-1">
                        Chức vụ
                      </label>
                      <input
                        type="text"
                        value={addForm.position}
                        onChange={(e) =>
                          setAddForm({ ...addForm, position: e.target.value })
                        }
                        placeholder="Nhập tên chức vụ"
                        className="w-full bg-white border border-gray-200 rounded-[6px] px-3 py-1.5 text-[13px] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#1677FF]"
                      />
                    </div>

                    <div>
                      <label className="block text-[12px] font-medium text-gray-800 mb-1">
                        Mã số thuế
                      </label>
                      <input
                        type="text"
                        value={addForm.taxCode}
                        onChange={(e) =>
                          setAddForm({ ...addForm, taxCode: e.target.value })
                        }
                        placeholder="Nhập mã số thuế công ty"
                        className="w-full bg-white border border-gray-200 rounded-[6px] px-3 py-1.5 text-[13px] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#1677FF]"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col h-full">
                    <input
                      ref={docFileInputRef}
                      type="file"
                      multiple
                      className="hidden"
                      onChange={handleDocumentUpload}
                    />

                    <div className="border border-gray-200 rounded-[6px] bg-white overflow-hidden flex flex-col">
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-[12.5px] min-w-[1180px]">
                          <thead>
                            <tr className="bg-[#F3F6FB] text-gray-800 font-semibold text-[12.5px] border-b border-gray-200">
                              <th className="w-[34px] py-2.5 px-2 border-r border-[#D6E0EE]"></th>
                              <th className="w-[52px] py-2.5 px-2 border-r border-[#D6E0EE] text-center">
                                STT
                              </th>
                              <th className="w-[155px] py-2.5 px-2.5 border-r border-[#A5B8D9] text-left">
                                Loại giấy tờ
                              </th>
                              <th className="w-[150px] py-2.5 px-2.5 border-r border-[#A5B8D9] text-left">
                                Ngày hiệu lực
                              </th>
                              <th className="w-[150px] py-2.5 px-2.5 border-r border-[#A5B8D9] text-left">
                                Ngày hết hạn
                              </th>
                              <th className="w-[215px] py-2.5 px-2.5 border-r border-[#A5B8D9] text-left">
                                Ghi chú
                              </th>
                              <th className="w-[125px] py-2.5 px-2.5 border-r border-[#A5B8D9] text-left">
                                Còn hiệu lực
                              </th>
                              <th className="w-[460px] py-2.5 px-2.5 border-r border-[#A5B8D9] text-left">
                                Danh sách file
                              </th>
                              <th className="py-2.5 px-2"></th>
                            </tr>
                          </thead>
                          <tbody>
                            {addForm.documents.map((docRow, rowIdx) => (
                              <tr
                                key={docRow.id}
                                className="group border-b border-gray-200 bg-white hover:bg-gray-50/40"
                              >
                                {/* Left gutter */}
                                <td className="py-1.5 px-1.5 border-r border-dashed border-gray-200 text-center align-middle">
                                  {addForm.documents.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveDocumentRow(docRow.id)}
                                      className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 p-0.5 transition-opacity cursor-pointer"
                                      title="Xóa dòng"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </td>

                                {/* STT */}
                                <td className="py-1.5 px-2 border-r border-dashed border-gray-200 text-center align-middle">
                                  <span className="inline-flex items-center justify-center min-w-[30px] h-[22px] px-2 rounded-[4px] bg-[#F1F5F9] text-gray-800 text-[12px] font-medium">
                                    {rowIdx + 1}
                                  </span>
                                </td>

                                {/* Loại giấy tờ */}
                                <td className="py-1 px-2 border-r border-dashed border-gray-200 align-middle">
                                  <div className="relative flex items-center">
                                    <select
                                      value={docRow.docType}
                                      onChange={(e) =>
                                        handleUpdateDocumentRow(docRow.id, 'docType', e.target.value)
                                      }
                                      className="w-full bg-transparent text-[12.5px] text-gray-800 pr-5 py-1 appearance-none outline-none cursor-pointer"
                                    >
                                      <option value=""></option>
                                      {DOCUMENT_TYPE_OPTIONS.map((opt) => (
                                        <option key={opt} value={opt}>
                                          {opt}
                                        </option>
                                      ))}
                                    </select>
                                    <span className="pointer-events-none absolute right-1 text-[10px] text-gray-500 leading-none">
                                      ▾
                                    </span>
                                  </div>
                                </td>

                                {/* Ngày hiệu lực */}
                                <td className="py-1 px-2 border-r border-dashed border-gray-200 align-middle">
                                  <div className="relative flex items-center">
                                    <input
                                      type="text"
                                      value={docRow.effectiveDate}
                                      onChange={(e) =>
                                        handleUpdateDocumentRow(
                                          docRow.id,
                                          'effectiveDate',
                                          e.target.value
                                        )
                                      }
                                      placeholder="DD/ MM/ YYYY"
                                      className="w-full bg-transparent text-[12.5px] text-gray-800 placeholder-gray-400 pr-6 py-1 outline-none"
                                    />
                                    <label
                                      className="relative flex items-center justify-center w-5 h-5 shrink-0 text-gray-500 hover:text-gray-700 cursor-pointer"
                                      title="Chọn ngày hiệu lực"
                                    >
                                      <Calendar className="w-3.5 h-3.5" />
                                      <input
                                        type="date"
                                        onChange={(e) =>
                                          handleUpdateDocumentRow(
                                            docRow.id,
                                            'effectiveDate',
                                            formatIsoToDisplayDate(e.target.value)
                                          )
                                        }
                                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                      />
                                    </label>
                                  </div>
                                </td>

                                {/* Ngày hết hạn */}
                                <td className="py-1 px-2 border-r border-dashed border-gray-200 align-middle">
                                  <div className="relative flex items-center">
                                    <input
                                      type="text"
                                      value={docRow.expiryDate}
                                      onChange={(e) =>
                                        handleUpdateDocumentRow(
                                          docRow.id,
                                          'expiryDate',
                                          e.target.value
                                        )
                                      }
                                      placeholder="DD/ MM/ YYYY"
                                      className="w-full bg-transparent text-[12.5px] text-gray-800 placeholder-gray-400 pr-6 py-1 outline-none"
                                    />
                                    <label
                                      className="relative flex items-center justify-center w-5 h-5 shrink-0 text-gray-500 hover:text-gray-700 cursor-pointer"
                                      title="Chọn ngày hết hạn"
                                    >
                                      <Calendar className="w-3.5 h-3.5" />
                                      <input
                                        type="date"
                                        onChange={(e) =>
                                          handleUpdateDocumentRow(
                                            docRow.id,
                                            'expiryDate',
                                            formatIsoToDisplayDate(e.target.value)
                                          )
                                        }
                                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                      />
                                    </label>
                                  </div>
                                </td>

                                {/* Ghi chú */}
                                <td className="py-1 px-2 border-r border-dashed border-gray-200 align-middle">
                                  <input
                                    type="text"
                                    value={docRow.note}
                                    onChange={(e) =>
                                      handleUpdateDocumentRow(docRow.id, 'note', e.target.value)
                                    }
                                    className="w-full bg-transparent text-[12.5px] text-gray-800 py-1 outline-none"
                                  />
                                </td>

                                {/* Còn hiệu lực */}
                                <td className="py-1.5 px-2 border-r border-dashed border-gray-200 text-center align-middle">
                                  <input
                                    type="checkbox"
                                    checked={docRow.isValid}
                                    onChange={(e) =>
                                      handleUpdateDocumentRow(
                                        docRow.id,
                                        'isValid',
                                        e.target.checked
                                      )
                                    }
                                    className="w-3.5 h-3.5 rounded border-gray-400 cursor-pointer accent-[#1677FF]"
                                  />
                                </td>

                                {/* Danh sách file */}
                                <td className="py-1.5 px-2.5 border-r border-dashed border-gray-200 align-middle">
                                  <div className="flex flex-wrap items-center gap-2">
                                    {docRow.files.map((file) => (
                                      <span
                                        key={file.id}
                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-[#1D4ED8] border border-blue-100 text-[11.5px]"
                                      >
                                        <span className="max-w-[160px] truncate" title={file.name}>
                                          {file.name}
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => handleRemoveRowFile(docRow.id, file.id)}
                                          className="text-blue-400 hover:text-red-500 cursor-pointer"
                                          title="Xóa file"
                                        >
                                          <X className="w-3 h-3" />
                                        </button>
                                      </span>
                                    ))}
                                    <button
                                      type="button"
                                      onClick={() => handleTriggerRowFileUpload(docRow.id)}
                                      className="text-[#3B82F6] hover:text-[#1D4ED8] hover:underline text-[12.5px] font-normal cursor-pointer"
                                    >
                                      Nhấn để tải lên
                                    </button>
                                  </div>
                                </td>

                                {/* Trailing filler cell */}
                                <td className="py-1.5 px-2"></td>
                              </tr>
                            ))}

                            {/* Inline Quick-Add Row */}
                            <tr
                              onClick={handleAddDocumentRow}
                              className="border-b border-gray-200 bg-white hover:bg-blue-50/30 cursor-pointer transition-colors"
                            >
                              <td className="py-2 px-2 border-r border-dashed border-gray-200"></td>
                              <td className="py-2 px-2 border-r border-dashed border-gray-200"></td>
                              <td
                                colSpan={2}
                                className="py-2 px-2.5 border-r border-dashed border-gray-200 text-[12px] italic text-gray-400"
                              >
                                <span className="inline-flex items-center gap-1.5">
                                  <Plus className="w-3.5 h-3.5 text-gray-400" />
                                  <span>Bấm vào đây để thêm dòng mới</span>
                                </span>
                              </td>
                              <td className="py-2 px-2 border-r border-dashed border-gray-200"></td>
                              <td className="py-2 px-2 border-r border-dashed border-gray-200"></td>
                              <td className="py-2 px-2 border-r border-dashed border-gray-200"></td>
                              <td className="py-2 px-2 border-r border-dashed border-gray-200"></td>
                              <td className="py-2 px-2"></td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {/* Grid Footer Bar */}
                      <div className="px-2.5 py-2 bg-white flex items-center justify-between">
                        <button
                          type="button"
                          onClick={handleAddDocumentRow}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F8FAFC] hover:bg-gray-100 border border-gray-200 rounded-[6px] text-[12.5px] font-medium text-gray-700 transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5 text-gray-600" />
                          <span>Thêm dòng (F2)</span>
                        </button>

                        <button
                          type="button"
                          title="Nhấn F2 hoặc bấm vào bảng để thêm dòng mới"
                          className="p-1 text-gray-600 hover:text-gray-900 rounded-full transition-colors cursor-pointer"
                        >
                          <HelpCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </form>

          {/* Popup Bottom Footer */}
          <div className="px-3 py-2 bg-[#EEF2F6] border-t border-gray-200 flex items-center justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCloseAddModal}
              className="px-4 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-[6px] text-[13px] font-medium transition-colors cursor-pointer"
            >
              Đóng
            </button>
            <button
              type="submit"
              form="category-customer-add-form"
              className="px-4 py-1.5 bg-[#1677FF] hover:bg-blue-600 text-white rounded-[6px] text-[13px] font-medium transition-colors cursor-pointer"
            >
              Ghi nhận
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
