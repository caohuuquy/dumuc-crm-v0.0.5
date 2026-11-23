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
  X,
  Plus,
  HelpCircle,
  Image as ImageIcon,
  KeyRound,
  AlertCircle,
} from 'lucide-react';

export interface InsuranceTemplateRow {
  id: string;
  templateName: string;
  files: { id: string; name: string; size: string }[];
}

export interface InsuranceContractRow {
  id: string;
  contractNumber: string;
  contractName: string;
  files: { id: string; name: string; size: string }[];
}

export interface InsuranceInspectionProfileRow {
  id: string;
  profileName: string;
  note: string;
  files: { id: string; name: string; size: string }[];
}

export interface InsuranceStaffRow {
  id: string;
  position: string;
  fullName: string;
  phone: string;
  email: string;
  title: string;
  isWorking: boolean;
  note: string;
}

export interface InsuranceProductsSelection {
  compulsoryCivilLiability: boolean;
  autoPhysicalDamage: boolean;
}

export interface CategoryInsuranceCompanyRecord {
  id: string;
  code: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  taxCode: string;
  hotline: string;
  isCooperating: boolean;
  logoUrl?: string;
  logoName?: string;
  templates?: InsuranceTemplateRow[];
  contracts?: InsuranceContractRow[];
  inspectionProfiles?: InsuranceInspectionProfileRow[];
  staff?: InsuranceStaffRow[];
  products?: InsuranceProductsSelection;
}

const INSURANCE_STAFF_POSITION_OPTIONS = [
  'Giám định viên',
  'Chuyên viên bồi thường',
  'Nhân viên kinh doanh',
  'Kế toán',
  'Quản lý',
  'Chăm sóc khách hàng',
  'Khác',
];

const createEmptyTemplateRow = (): InsuranceTemplateRow => ({
  id: `tpl-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  templateName: '',
  files: [],
});

const createEmptyContractRow = (): InsuranceContractRow => ({
  id: `ctr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  contractNumber: '',
  contractName: '',
  files: [],
});

const createEmptyInspectionProfileRow = (): InsuranceInspectionProfileRow => ({
  id: `ins-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  profileName: '',
  note: '',
  files: [],
});

const createEmptyStaffRow = (): InsuranceStaffRow => ({
  id: `stf-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  position: '',
  fullName: '',
  phone: '',
  email: '',
  title: '',
  isWorking: false,
  note: '',
});

const createEmptyProductsSelection = (): InsuranceProductsSelection => ({
  compulsoryCivilLiability: false,
  autoPhysicalDamage: false,
});

const STORAGE_KEY = 'category_insurance_companies_v1';

export const INITIAL_CATEGORY_INSURANCE_COMPANIES: CategoryInsuranceCompanyRecord[] = [
  {
    id: 'ins-1',
    code: 'VPPTIPN',
    name: 'VĂN PHÒNG TỔNG CÔNG TY CỔ PHẦN BẢO HIỂM BƯU ĐIỆN KHU VỰC PHÍA NAM',
    phone: '',
    email: '',
    address: '27 Nguyễn Đình Chiểu, Phường Sài Gòn, TP Hồ Chí Minh, Việt Nam',
    taxCode: '0100774631-028',
    hotline: '1900 545 475',
    isCooperating: true,
  },
  {
    id: 'ins-2',
    code: 'VPPTIHN',
    name: 'VĂN PHÒNG ĐẠI DIỆN GIÁM ĐỊNH BỒI THƯỜNG PTI TẠI HÀ NỘI',
    phone: '',
    email: '',
    address:
      'T.2, nhà nối số 2, CC cao tầng tại ô đất CT3, KĐT mới Trung Văn, Phường Đại Mỗ , Thành phố Hà Nội, Việt Nam',
    taxCode: '0100774631-044',
    hotline: '1900 545 475',
    isCooperating: true,
  },
  {
    id: 'ins-3',
    code: 'VPPTIHCM',
    name: 'VĂN PHÒNG ĐẠI DIỆN GIÁM ĐỊNH BỒI THƯỜNG PTI TẠI THÀNH PHỐ HỒ CHÍ MINH',
    phone: '',
    email: '',
    address: 'Số 205 Nguyễn Xí, Phường Bình Thạnh, TP. Hồ Chí Minh, Việt Nam',
    taxCode: '0100774631-043',
    hotline: '1900 545 475',
    isCooperating: true,
  },
  {
    id: 'ins-4',
    code: 'VBIVT',
    name: 'CÔNG TY BẢO HIỂM VIETINBANK VŨNG TÀU',
    phone: '0905 354 709',
    email: '',
    address: 'Số 19 Phạm Ngọc Thạch, Phường Tam Thắng, Thành phố Hồ Chí Minh',
    taxCode: '0101335193-028',
    hotline: '1900 156 6',
    isCooperating: true,
  },
  {
    id: 'ins-5',
    code: 'VBIVP',
    name: 'CÔNG TY BẢO HIỂM VIETINBANK VĨNH PHÚC',
    phone: '',
    email: '',
    address: 'Số 10, đường Lý Nam Đế, Phường Vĩnh Phúc, Tỉnh Phú Thọ',
    taxCode: '0101335193-025',
    hotline: '1900 156 6',
    isCooperating: true,
  },
  {
    id: 'ins-6',
    code: 'VBIVL',
    name: 'CÔNG TY BẢO HIỂM VIETINBANK VĨNH LONG',
    phone: '0914 686 939',
    email: '',
    address: 'Số 54A, đường Nguyễn Huệ, Phường Long Châu, Tỉnh Vĩnh Long',
    taxCode: '0101335193-041',
    hotline: '1900 156 6',
    isCooperating: true,
  },
  {
    id: 'ins-7',
    code: 'VBITQ',
    name: 'CÔNG TY BẢO HIỂM VIETINBANK TUYÊN QUANG',
    phone: '',
    email: '',
    address:
      'Tầng 5, tòa nhà Vũ Công, số 174, đường Bình Thuận, Phường Minh Xuân, Tỉnh Tuyên Quang, Việt Nam',
    taxCode: '0101335193-027',
    hotline: '1900 156 6',
    isCooperating: true,
  },
  {
    id: 'ins-8',
    code: 'VBITN',
    name: 'CÔNG TY BẢO HIỂM VIETINBANK TÂY NGUYÊN',
    phone: '',
    email: '',
    address: 'Số 33-35 Nguyễn Đình Chiểu, Phường Buôn Ma Thuột, Tỉnh Đắk Lắk',
    taxCode: '0101.335.193-007',
    hotline: '1900 156 6',
    isCooperating: true,
  },
  {
    id: 'ins-9',
    code: 'VBITL',
    name: 'CÔNG TY BẢO HIỂM VIETINBANK THĂNG LONG',
    phone: '',
    email: '',
    address:
      'Tầng 11, tòa nhà VietBank office, Số 70-72 Bà Triệu, Phường Cửa Nam, TP Hà Nội',
    taxCode: '0101.335.193-008',
    hotline: '1900 156 6',
    isCooperating: true,
  },
  {
    id: 'ins-10',
    code: 'VBITH',
    name: 'CÔNG TY BẢO HIỂM VIETINBANK THANH HÓA',
    phone: '',
    email: '',
    address: 'Số nhà 18, Đường Nguyễn Duy Hiệu, Phường Hạc Thành, Tỉnh Thanh Hóa',
    taxCode: '0101335193-006',
    hotline: '1900 156 6',
    isCooperating: true,
  },
  {
    id: 'ins-11',
    code: 'VBITB',
    name: 'CÔNG TY BẢO HIỂM VIETINBANK TÂY BẮC',
    phone: '',
    email: '',
    address:
      'Tầng 7, Tòa nhà MB Việt Trì, số 1596, Đường Hùng Vương, Phường Việt Trì, Tỉnh Phú Thọ',
    taxCode: '0101335193-009',
    hotline: '1900 156 6',
    isCooperating: true,
  },
  {
    id: 'ins-12',
    code: 'VBIHN',
    name: 'CÔNG TY BẢO HIỂM VIETINBANK HÀ NỘI',
    phone: '',
    email: '',
    address: 'Tầng 2, tòa nhà HH2 Bắc Hà, Số 15 Tố Hữu, Phường Nhân Chính, TP Hà Nội',
    taxCode: '0101335193-001',
    hotline: '1900 156 6',
    isCooperating: true,
  },
];

export const CategoryInsuranceCompaniesList: React.FC = () => {
  const [items, setItems] = useState<CategoryInsuranceCompanyRecord[]>(() => {
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
    return INITIAL_CATEGORY_INSURANCE_COMPANIES;
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

  // Pagination
  const [rowsPerPage, setRowsPerPage] = useState('20');
  const [currentPage, setCurrentPage] = useState(1);

  // Full-screen Add modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeAddTab, setActiveAddTab] = useState<
    'templates' | 'contracts' | 'inspection' | 'staff' | 'products'
  >('templates');
  const [isDraggingLogo, setIsDraggingLogo] = useState(false);
  const [addFormError, setAddFormError] = useState('');
  const [taxCodeError, setTaxCodeError] = useState('');
  const [addForm, setAddForm] = useState({
    code: '',
    name: '',
    phone: '',
    email: '',
    address: '',
    taxCode: '',
    hotline: '',
    isCooperating: true,
    logoUrl: '',
    logoName: '',
    templates: [] as InsuranceTemplateRow[],
    contracts: [createEmptyContractRow()] as InsuranceContractRow[],
    inspectionProfiles: [
      createEmptyInspectionProfileRow(),
    ] as InsuranceInspectionProfileRow[],
    staff: [createEmptyStaffRow()] as InsuranceStaffRow[],
    products: createEmptyProductsSelection(),
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const logoFileInputRef = useRef<HTMLInputElement | null>(null);
  const templateFileInputRef = useRef<HTMLInputElement | null>(null);
  const contractFileInputRef = useRef<HTMLInputElement | null>(null);
  const inspectionFileInputRef = useRef<HTMLInputElement | null>(null);
  const activeUploadRowIdRef = useRef<string | null>(null);
  const activeContractUploadRowIdRef = useRef<string | null>(null);
  const activeInspectionUploadRowIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isAddModalOpen || activeAddTab === 'products') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        setAddForm((prev) => {
          if (activeAddTab === 'templates') {
            return { ...prev, templates: [...prev.templates, createEmptyTemplateRow()] };
          }
          if (activeAddTab === 'contracts') {
            return { ...prev, contracts: [...prev.contracts, createEmptyContractRow()] };
          }
          if (activeAddTab === 'inspection') {
            return {
              ...prev,
              inspectionProfiles: [
                ...prev.inspectionProfiles,
                createEmptyInspectionProfileRow(),
              ],
            };
          }
          if (activeAddTab === 'staff') {
            return { ...prev, staff: [...prev.staff, createEmptyStaffRow()] };
          }
          return prev;
        });
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
    return items.filter((item) => {
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
  }, [items, appliedFilters]);

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

  const handleToggleCooperating = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isCooperating: !item.isCooperating } : item
      )
    );
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
      'Email',
      'Địa chỉ',
      'Mã số thuế',
      'Hotline',
      'Đang hợp tác',
    ];
    const rows = filteredItems.map((row) => [
      `"${row.code}"`,
      `"${row.name}"`,
      `"${row.phone}"`,
      `"${row.email}"`,
      `"${row.address}"`,
      `"${row.taxCode}"`,
      `"${row.hotline}"`,
      row.isCooperating ? 'Có' : 'Không',
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([new Uint8Array([0xef, 0xbb, 0xbf]), csvContent], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'danh_muc_don_vi_bao_hiem.csv');
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
      const imported: CategoryInsuranceCompanyRecord[] = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map((c) => c.replace(/^"|"$/g, '').trim());
        if (cols[0] || cols[1]) {
          imported.push({
            id: `ins-imp-${Date.now()}-${i}`,
            code: cols[0] || `BH${Date.now()}${i}`,
            name: cols[1] || '',
            phone: cols[2] || '',
            email: cols[3] || '',
            address: cols[4] || '',
            taxCode: cols[5] || '',
            hotline: cols[6] || '',
            isCooperating:
              cols[7]?.toLowerCase() !== 'không' && cols[7]?.toLowerCase() !== 'false',
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
      phone: '',
      email: '',
      address: '',
      taxCode: '',
      hotline: '',
      isCooperating: true,
      logoUrl: '',
      logoName: '',
      templates: [],
      contracts: [createEmptyContractRow()],
      inspectionProfiles: [createEmptyInspectionProfileRow()],
      staff: [createEmptyStaffRow()],
      products: createEmptyProductsSelection(),
    });
    setActiveAddTab('templates');
    setIsDraggingLogo(false);
    setAddFormError('');
    setTaxCodeError('');
  };

  const handleOpenAddModal = () => {
    resetAddForm();
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    setAddFormError('');
    setTaxCodeError('');
  };

  const findDuplicateTaxCode = (
    value: string
  ): CategoryInsuranceCompanyRecord | undefined => {
    const normalized = value.trim().toLowerCase();
    if (!normalized) return undefined;
    return items.find((item) => item.taxCode?.trim().toLowerCase() === normalized);
  };

  const handleReadLogoFile = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAddForm((prev) => ({
          ...prev,
          logoUrl: reader.result as string,
          logoName: file.name,
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleReadLogoFile(e.target.files?.[0]);
    e.target.value = '';
  };

  const handleLogoDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingLogo(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleReadLogoFile(file);
    }
  };

  const handleAddTemplateRow = () => {
    setAddForm((prev) => ({
      ...prev,
      templates: [...prev.templates, createEmptyTemplateRow()],
    }));
  };

  const handleUpdateTemplateName = (rowId: string, value: string) => {
    setAddForm((prev) => ({
      ...prev,
      templates: prev.templates.map((row) =>
        row.id === rowId ? { ...row, templateName: value } : row
      ),
    }));
  };

  const handleRemoveTemplateRow = (rowId: string) => {
    setAddForm((prev) => ({
      ...prev,
      templates: prev.templates.filter((row) => row.id !== rowId),
    }));
  };

  const handleTriggerTemplateFileUpload = (rowId: string) => {
    activeUploadRowIdRef.current = rowId;
    templateFileInputRef.current?.click();
  };

  const handleTemplateFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    const targetRowId = activeUploadRowIdRef.current;
    if (!files || files.length === 0 || !targetRowId) return;
    const added = (Array.from(files) as File[]).map((file, idx) => ({
      id: `tpl-file-${Date.now()}-${idx}`,
      name: file.name,
      size:
        file.size < 1024 * 1024
          ? `${Math.max(1, Math.round(file.size / 1024))} KB`
          : `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
    }));
    setAddForm((prev) => ({
      ...prev,
      templates: prev.templates.map((row) =>
        row.id === targetRowId ? { ...row, files: [...row.files, ...added] } : row
      ),
    }));
    e.target.value = '';
  };

  const handleRemoveTemplateFile = (rowId: string, fileId: string) => {
    setAddForm((prev) => ({
      ...prev,
      templates: prev.templates.map((row) =>
        row.id === rowId
          ? { ...row, files: row.files.filter((f) => f.id !== fileId) }
          : row
      ),
    }));
  };

  const handleAddContractRow = () => {
    setAddForm((prev) => ({
      ...prev,
      contracts: [...prev.contracts, createEmptyContractRow()],
    }));
  };

  const handleUpdateContractRow = (
    rowId: string,
    field: 'contractNumber' | 'contractName',
    value: string
  ) => {
    setAddForm((prev) => ({
      ...prev,
      contracts: prev.contracts.map((row) =>
        row.id === rowId ? { ...row, [field]: value } : row
      ),
    }));
  };

  const handleRemoveContractRow = (rowId: string) => {
    setAddForm((prev) => {
      const remaining = prev.contracts.filter((row) => row.id !== rowId);
      return {
        ...prev,
        contracts: remaining.length > 0 ? remaining : [createEmptyContractRow()],
      };
    });
  };

  const handleTriggerContractFileUpload = (rowId: string) => {
    activeContractUploadRowIdRef.current = rowId;
    contractFileInputRef.current?.click();
  };

  const handleContractFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    const targetRowId = activeContractUploadRowIdRef.current;
    if (!files || files.length === 0 || !targetRowId) return;
    const added = (Array.from(files) as File[]).map((file, idx) => ({
      id: `ctr-file-${Date.now()}-${idx}`,
      name: file.name,
      size:
        file.size < 1024 * 1024
          ? `${Math.max(1, Math.round(file.size / 1024))} KB`
          : `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
    }));
    setAddForm((prev) => ({
      ...prev,
      contracts: prev.contracts.map((row) =>
        row.id === targetRowId ? { ...row, files: [...row.files, ...added] } : row
      ),
    }));
    e.target.value = '';
  };

  const handleRemoveContractFile = (rowId: string, fileId: string) => {
    setAddForm((prev) => ({
      ...prev,
      contracts: prev.contracts.map((row) =>
        row.id === rowId
          ? { ...row, files: row.files.filter((f) => f.id !== fileId) }
          : row
      ),
    }));
  };

  const handleAddInspectionRow = () => {
    setAddForm((prev) => ({
      ...prev,
      inspectionProfiles: [
        ...prev.inspectionProfiles,
        createEmptyInspectionProfileRow(),
      ],
    }));
  };

  const handleUpdateInspectionRow = (
    rowId: string,
    field: 'profileName' | 'note',
    value: string
  ) => {
    setAddForm((prev) => ({
      ...prev,
      inspectionProfiles: prev.inspectionProfiles.map((row) =>
        row.id === rowId ? { ...row, [field]: value } : row
      ),
    }));
  };

  const handleRemoveInspectionRow = (rowId: string) => {
    setAddForm((prev) => {
      const remaining = prev.inspectionProfiles.filter((row) => row.id !== rowId);
      return {
        ...prev,
        inspectionProfiles:
          remaining.length > 0 ? remaining : [createEmptyInspectionProfileRow()],
      };
    });
  };

  const handleTriggerInspectionFileUpload = (rowId: string) => {
    activeInspectionUploadRowIdRef.current = rowId;
    inspectionFileInputRef.current?.click();
  };

  const handleInspectionFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    const targetRowId = activeInspectionUploadRowIdRef.current;
    if (!files || files.length === 0 || !targetRowId) return;
    const added = (Array.from(files) as File[]).map((file, idx) => ({
      id: `ins-file-${Date.now()}-${idx}`,
      name: file.name,
      size:
        file.size < 1024 * 1024
          ? `${Math.max(1, Math.round(file.size / 1024))} KB`
          : `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
    }));
    setAddForm((prev) => ({
      ...prev,
      inspectionProfiles: prev.inspectionProfiles.map((row) =>
        row.id === targetRowId ? { ...row, files: [...row.files, ...added] } : row
      ),
    }));
    e.target.value = '';
  };

  const handleRemoveInspectionFile = (rowId: string, fileId: string) => {
    setAddForm((prev) => ({
      ...prev,
      inspectionProfiles: prev.inspectionProfiles.map((row) =>
        row.id === rowId
          ? { ...row, files: row.files.filter((f) => f.id !== fileId) }
          : row
      ),
    }));
  };

  const handleAddStaffRow = () => {
    setAddForm((prev) => ({
      ...prev,
      staff: [...prev.staff, createEmptyStaffRow()],
    }));
  };

  const handleUpdateStaffRow = <K extends keyof InsuranceStaffRow>(
    rowId: string,
    field: K,
    value: InsuranceStaffRow[K]
  ) => {
    setAddForm((prev) => ({
      ...prev,
      staff: prev.staff.map((row) =>
        row.id === rowId ? { ...row, [field]: value } : row
      ),
    }));
  };

  const handleRemoveStaffRow = (rowId: string) => {
    setAddForm((prev) => {
      const remaining = prev.staff.filter((row) => row.id !== rowId);
      return {
        ...prev,
        staff: remaining.length > 0 ? remaining : [createEmptyStaffRow()],
      };
    });
  };

  const handleAddSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    let hasError = false;

    if (!addForm.name.trim()) {
      setAddFormError('Vui lòng nhập Tên đơn vị bảo hiểm.');
      hasError = true;
    } else {
      setAddFormError('');
    }

    const dupTaxCode = findDuplicateTaxCode(addForm.taxCode);
    if (dupTaxCode) {
      setTaxCodeError(
        `Mã số thuế đã tồn tại (${dupTaxCode.code} - ${dupTaxCode.name}). Không được trùng.`
      );
      hasError = true;
    } else {
      setTaxCodeError('');
    }

    if (hasError) return;

    const newItem: CategoryInsuranceCompanyRecord = {
      id: `ins-${Date.now()}`,
      code: addForm.code.trim() || `BH${String(Date.now()).slice(-6)}`,
      name: addForm.name.trim(),
      phone: addForm.phone.trim(),
      email: addForm.email.trim(),
      address: addForm.address.trim(),
      taxCode: addForm.taxCode.trim(),
      hotline: addForm.hotline.trim(),
      isCooperating: addForm.isCooperating,
      logoUrl: addForm.logoUrl,
      logoName: addForm.logoName,
      templates: addForm.templates,
      contracts: addForm.contracts,
      inspectionProfiles: addForm.inspectionProfiles,
      staff: addForm.staff,
      products: addForm.products,
    };

    setItems((prev) => [newItem, ...prev]);
    resetAddForm();
    setIsAddModalOpen(false);
  };

  const totalResults = isFiltering
    ? filteredItems.length
    : 753 + (items.length - INITIAL_CATEGORY_INSURANCE_COMPANIES.length);
  const displayEnd = isFiltering
    ? Math.min(Number(rowsPerPage), filteredItems.length)
    : Math.min(Number(rowsPerPage), totalResults);

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
                placeholder="Tìm mã"
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
                placeholder="Tìm tên"
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
          <table className="w-full border-collapse text-[12.5px] table-fixed min-w-[1260px]">
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
                <th className="w-[98px] py-2.5 px-2.5 border-r border-b border-gray-200 text-left">
                  Mã
                </th>
                <th className="w-[180px] py-2.5 px-2.5 border-r border-b border-gray-200 text-left">
                  Tên
                </th>
                <th className="w-[140px] py-2.5 px-2.5 border-r border-b border-gray-200 text-left">
                  Điện thoại
                </th>
                <th className="w-[136px] py-2.5 px-2.5 border-r border-b border-gray-200 text-left">
                  Email
                </th>
                <th className="w-[216px] py-2.5 px-2.5 border-r border-b border-gray-200 text-left">
                  Địa chỉ
                </th>
                <th className="w-[146px] py-2.5 px-2.5 border-r border-b border-gray-200 text-left">
                  Mã số thuế
                </th>
                <th className="w-[156px] py-2.5 px-2.5 border-r border-b border-gray-200 text-left">
                  Hotline
                </th>
                <th className="w-[125px] py-2.5 px-2.5 border-r border-b border-gray-200 text-left">
                  Đang hợp tác
                </th>
                <th className="py-2.5 px-2 border-b border-gray-200"></th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
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
                      <td className="py-2.5 px-2 border-r border-gray-200 text-center align-middle">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleRow(row.id)}
                          className="w-3.5 h-3.5 rounded border-gray-300 cursor-pointer accent-[#1677FF]"
                        />
                      </td>
                      <td
                        className="py-2.5 px-2.5 border-r border-gray-200 text-gray-800 truncate align-middle"
                        title={row.code}
                      >
                        {row.code}
                      </td>
                      <td
                        className="py-2.5 px-2.5 border-r border-gray-200 text-gray-800 break-words leading-snug align-middle"
                        title={row.name}
                      >
                        {row.name}
                      </td>
                      <td className="py-2.5 px-2.5 border-r border-gray-200 text-gray-800 truncate align-middle">
                        {row.phone}
                      </td>
                      <td
                        className="py-2.5 px-2.5 border-r border-gray-200 text-gray-800 truncate align-middle"
                        title={row.email}
                      >
                        {row.email}
                      </td>
                      <td
                        className="py-2.5 px-2.5 border-r border-gray-200 text-gray-800 break-words leading-snug align-middle"
                        title={row.address}
                      >
                        {row.address}
                      </td>
                      <td className="py-2.5 px-2.5 border-r border-gray-200 text-gray-800 truncate align-middle">
                        {row.taxCode}
                      </td>
                      <td className="py-2.5 px-2.5 border-r border-gray-200 text-gray-800 truncate align-middle">
                        {row.hotline}
                      </td>
                      <td className="py-2.5 px-2.5 border-r border-gray-200 text-center align-middle">
                        <input
                          type="checkbox"
                          checked={row.isCooperating}
                          onChange={() => handleToggleCooperating(row.id)}
                          className="w-3.5 h-3.5 rounded border-gray-300 cursor-pointer accent-[#2563EB]"
                        />
                      </td>
                      <td className="py-2.5 px-2 align-middle"></td>
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
            onClick={() => setCurrentPage(38)}
            className={`w-7 h-7 flex items-center justify-center rounded-[6px] text-[12px] font-medium transition-colors cursor-pointer ${
              currentPage === 38
                ? 'border border-[#1677FF] text-[#1677FF] bg-[#EFF6FF] font-semibold'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            38
          </button>

          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(38, p + 1))}
            disabled={currentPage === 38}
            className="w-7 h-7 flex items-center justify-center rounded-[6px] text-gray-600 hover:bg-gray-100 disabled:opacity-40 cursor-pointer border border-gray-200"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setCurrentPage(38)}
            disabled={currentPage === 38}
            className="w-7 h-7 flex items-center justify-center rounded-[6px] text-gray-600 hover:bg-gray-100 disabled:opacity-40 cursor-pointer border border-gray-200"
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

      {/* Full-Screen Add Insurance Company Popup */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#EEF2F6] flex flex-col overflow-hidden select-text">
          <input
            ref={logoFileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/gif,image/*"
            className="hidden"
            onChange={handleLogoFileChange}
          />
          <input
            ref={templateFileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleTemplateFileUpload}
          />
          <input
            ref={contractFileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleContractFileUpload}
          />
          <input
            ref={inspectionFileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleInspectionFileUpload}
          />

          {/* Popup Top Header */}
          <div className="h-[52px] px-4 bg-white border-b border-gray-200 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-5 flex-wrap">
              <h2 className="text-[19px] font-semibold text-gray-900 leading-none">
                Đơn vị bảo hiểm
              </h2>

              <label className="inline-flex items-center gap-1.5 text-[12.5px] text-gray-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={addForm.isCooperating}
                  onChange={(e) =>
                    setAddForm({ ...addForm, isCooperating: e.target.checked })
                  }
                  className="w-3.5 h-3.5 rounded border-gray-300 accent-[#1677FF] cursor-pointer"
                />
                <span>Đang hợp tác</span>
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
            id="category-insurance-add-form"
            onSubmit={handleAddSubmit}
            className="flex-1 flex flex-col gap-2.5 p-2.5 overflow-auto"
          >
            {/* Top Row: Three White Cards */}
            <div className="flex flex-col lg:flex-row gap-2.5 items-stretch shrink-0">
              {/* Left Card */}
              <div className="w-full lg:w-[290px] shrink-0 bg-white rounded-lg border border-gray-200 shadow-[0_1px_2px_rgba(15,23,42,0.04)] p-3.5 space-y-3">
                <div>
                  <label className="block text-[12px] font-medium text-gray-800 mb-1">
                    Mã
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
                    Tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    autoFocus
                    value={addForm.name}
                    onChange={(e) => {
                      setAddForm({ ...addForm, name: e.target.value });
                      if (addFormError) setAddFormError('');
                    }}
                    placeholder="Nhập tên đơn vị"
                    className={`w-full bg-white border rounded-[6px] px-3 py-1.5 text-[13px] text-gray-800 placeholder-gray-400 focus:outline-none ${
                      addFormError
                        ? 'border-red-400 focus:border-red-500'
                        : 'border-gray-200 focus:border-[#1677FF] focus:ring-1 focus:ring-[#1677FF]/30'
                    }`}
                  />
                  {addFormError && (
                    <p className="mt-1 text-[11.5px] text-red-500">{addFormError}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[12px] font-medium text-gray-800 mb-1">
                    Hotline
                  </label>
                  <input
                    type="text"
                    value={addForm.hotline}
                    onChange={(e) =>
                      setAddForm({ ...addForm, hotline: e.target.value })
                    }
                    placeholder="Nhập số hotline"
                    className="w-full bg-white border border-gray-200 rounded-[6px] px-3 py-1.5 text-[13px] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#1677FF]"
                  />
                </div>
              </div>

              {/* Middle Card */}
              <div className="w-full lg:w-[590px] shrink-0 bg-white rounded-lg border border-gray-200 shadow-[0_1px_2px_rgba(15,23,42,0.04)] p-3.5 flex flex-col gap-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-3 gap-y-3">
                  <div>
                    <label className="block text-[12px] font-medium text-gray-800 mb-1">
                      Điện thoại
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
                      placeholder="Nhập email"
                      className="w-full bg-white border border-gray-200 rounded-[6px] px-3 py-1.5 text-[13px] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#1677FF]"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-1.5 text-[12px] font-medium text-gray-800 mb-1">
                      <span>Mã số thuế</span>
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
                      value={addForm.taxCode}
                      onChange={(e) => {
                        const val = e.target.value;
                        setAddForm({ ...addForm, taxCode: val });
                        const dup = findDuplicateTaxCode(val);
                        setTaxCodeError(
                          dup
                            ? `Mã số thuế đã tồn tại (${dup.code} - ${dup.name}). Không được trùng.`
                            : ''
                        );
                      }}
                      placeholder="Nhập mã số thuế"
                      className={`w-full bg-white border rounded-[6px] px-3 py-1.5 text-[13px] text-gray-800 placeholder-gray-400 focus:outline-none ${
                        taxCodeError
                          ? 'border-red-400 focus:border-red-500'
                          : 'border-gray-200 focus:border-[#1677FF]'
                      }`}
                    />
                    {taxCodeError && (
                      <p className="mt-1 flex items-start gap-1 text-[11.5px] text-red-500 leading-snug">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>{taxCodeError}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] font-medium text-gray-800 mb-1">
                    Địa chỉ
                  </label>
                  <textarea
                    rows={3}
                    value={addForm.address}
                    onChange={(e) =>
                      setAddForm({ ...addForm, address: e.target.value })
                    }
                    placeholder="Nhập địa chỉ"
                    className="w-full bg-white border border-gray-200 rounded-[6px] px-3 py-2 text-[13px] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#1677FF] resize-y"
                  />
                </div>
              </div>

              {/* Right Card: Logo Upload */}
              <div className="w-full lg:w-[295px] shrink-0 bg-white rounded-lg border border-gray-200 shadow-[0_1px_2px_rgba(15,23,42,0.04)] p-3 flex flex-col">
                <div
                  onClick={() => logoFileInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingLogo(true);
                  }}
                  onDragLeave={() => setIsDraggingLogo(false)}
                  onDrop={handleLogoDrop}
                  className={`flex-1 min-h-[260px] rounded-[6px] border border-dashed flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-colors relative ${
                    isDraggingLogo
                      ? 'border-[#1677FF] bg-blue-50/40'
                      : 'border-gray-200 hover:border-blue-300 bg-white'
                  }`}
                >
                  {addForm.logoUrl ? (
                    <div className="relative w-full h-full flex flex-col items-center justify-center gap-2">
                      <img
                        src={addForm.logoUrl}
                        alt={addForm.logoName || 'Logo'}
                        className="max-h-[200px] max-w-full object-contain rounded"
                      />
                      <span className="text-[11.5px] text-gray-500 truncate max-w-full">
                        {addForm.logoName}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAddForm((prev) => ({
                            ...prev,
                            logoUrl: '',
                            logoName: '',
                          }));
                        }}
                        className="absolute top-0 right-0 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-red-600 cursor-pointer"
                        title="Xóa logo"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <ImageIcon className="w-9 h-9 text-gray-400 stroke-[1.5] mb-2" />
                      <span className="text-[#2563EB] text-[12.5px] font-medium hover:underline">
                        Nhấn để tải lên
                      </span>
                      <span className="text-gray-500 text-[11.5px] mt-0.5">
                        Hoặc kéo thả file PNG, JPG, GIF
                      </span>
                    </>
                  )}
                </div>
                <div className="pt-2 text-center text-[12.5px] font-semibold text-gray-800">
                  Logo
                </div>
              </div>
            </div>

            {/* Bottom Large Card with 5 Tabs */}
            <div className="flex-1 bg-white rounded-lg border border-gray-200 shadow-[0_1px_2px_rgba(15,23,42,0.04)] flex flex-col min-h-[340px]">
              {/* Tab Strip */}
              <div className="px-2.5 pt-2 border-b border-gray-200 flex items-end gap-1 flex-wrap">
                {(
                  [
                    { key: 'templates', label: 'Biểu mẫu' },
                    { key: 'contracts', label: 'Hợp đồng' },
                    { key: 'inspection', label: 'Hồ sơ giám định' },
                    { key: 'staff', label: 'Nhân sự' },
                    { key: 'products', label: 'Sản phẩm' },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveAddTab(tab.key)}
                    className={`px-4 py-1.5 rounded-t-[6px] text-[12.5px] transition-colors cursor-pointer ${
                      activeAddTab === tab.key
                        ? 'bg-[#FAD957] text-gray-900 font-semibold'
                        : 'bg-[#FEF9E7] text-gray-700 font-medium hover:bg-[#FEF3C7]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="flex-1 flex flex-col">
                {activeAddTab === 'templates' ? (
                  <div className="flex flex-col flex-1">
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-[12.5px] min-w-[1000px]">
                        <thead>
                          <tr className="bg-[#F3F6FB] text-gray-800 font-semibold text-[12.5px] border-b border-gray-200">
                            <th className="w-[34px] py-2 px-2 border-r border-[#D6E0EE]"></th>
                            <th className="w-[46px] py-2 px-2 border-r border-[#D6E0EE] text-center">
                              #
                            </th>
                            <th className="w-[195px] py-2 px-2.5 border-r border-[#A5B8D9] text-left">
                              Tên biểu mẫu <span className="text-red-500">*</span>
                            </th>
                            <th className="w-[720px] py-2 px-2.5 border-r border-[#A5B8D9] text-left">
                              Danh sách file
                            </th>
                            <th className="py-2 px-2"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {addForm.templates.map((tplRow, rowIdx) => (
                            <tr
                              key={tplRow.id}
                              className="group border-b border-gray-200 bg-white hover:bg-gray-50/40"
                            >
                              <td className="py-1.5 px-1.5 border-r border-dashed border-gray-200 text-center align-middle">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveTemplateRow(tplRow.id)}
                                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 p-0.5 transition-opacity cursor-pointer"
                                  title="Xóa dòng"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                              <td className="py-1.5 px-2 border-r border-dashed border-gray-200 text-center align-middle">
                                <span className="inline-flex items-center justify-center min-w-[28px] h-[22px] px-2 rounded-[4px] bg-[#F1F5F9] text-gray-800 text-[12px] font-medium">
                                  {rowIdx + 1}
                                </span>
                              </td>
                              <td className="py-1 px-2 border-r border-dashed border-gray-200 align-middle">
                                <input
                                  type="text"
                                  value={tplRow.templateName}
                                  onChange={(e) =>
                                    handleUpdateTemplateName(tplRow.id, e.target.value)
                                  }
                                  placeholder="Nhập tên biểu mẫu"
                                  className="w-full bg-transparent text-[12.5px] text-gray-800 placeholder-gray-400 py-1 outline-none"
                                />
                              </td>
                              <td className="py-1.5 px-2.5 border-r border-dashed border-gray-200 align-middle">
                                <div className="flex flex-wrap items-center gap-2">
                                  {tplRow.files.map((file) => (
                                    <span
                                      key={file.id}
                                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-[#1D4ED8] border border-blue-100 text-[11.5px]"
                                    >
                                      <span
                                        className="max-w-[180px] truncate"
                                        title={file.name}
                                      >
                                        {file.name}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleRemoveTemplateFile(tplRow.id, file.id)
                                        }
                                        className="text-blue-400 hover:text-red-500 cursor-pointer"
                                        title="Xóa file"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </span>
                                  ))}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleTriggerTemplateFileUpload(tplRow.id)
                                    }
                                    className="text-[#3B82F6] hover:text-[#1D4ED8] hover:underline text-[12.5px] font-normal cursor-pointer"
                                  >
                                    Nhấn để tải lên
                                  </button>
                                </div>
                              </td>
                              <td className="py-1.5 px-2"></td>
                            </tr>
                          ))}

                          {/* Inline Quick-Add Row */}
                          <tr
                            onClick={handleAddTemplateRow}
                            className="border-b border-gray-200 bg-white hover:bg-blue-50/30 cursor-pointer transition-colors"
                          >
                            <td className="py-2 px-2 border-r border-dashed border-gray-200"></td>
                            <td className="py-2 px-2 border-r border-dashed border-gray-200"></td>
                            <td className="py-2 px-2.5 border-r border-dashed border-gray-200 text-[12px] italic text-gray-400 whitespace-nowrap">
                              <span className="inline-flex items-center gap-1.5">
                                <Plus className="w-3.5 h-3.5 text-gray-400" />
                                <span>Bấm vào đây để thêm dòng mới</span>
                              </span>
                            </td>
                            <td className="py-2 px-2 border-r border-dashed border-gray-200"></td>
                            <td className="py-2 px-2"></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Grid Footer Bar */}
                    <div className="px-2.5 py-2 border-b border-gray-200 bg-white flex items-center justify-between">
                      <button
                        type="button"
                        onClick={handleAddTemplateRow}
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
                ) : activeAddTab === 'contracts' ? (
                  <div className="flex flex-col flex-1">
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-[12.5px] min-w-[1160px]">
                        <thead>
                          <tr className="bg-[#F3F6FB] text-gray-800 font-semibold text-[12.5px] border-b border-gray-200">
                            <th className="w-[34px] py-2 px-2 border-r border-[#D6E0EE]"></th>
                            <th className="w-[46px] py-2 px-2 border-r border-[#D6E0EE] text-center">
                              STT
                            </th>
                            <th className="w-[156px] py-2 px-2.5 border-r border-[#A5B8D9] text-left">
                              Số hợp đồng <span className="text-red-500">*</span>
                            </th>
                            <th className="w-[196px] py-2 px-2.5 border-r border-[#A5B8D9] text-left">
                              Tên hợp đồng <span className="text-red-500">*</span>
                            </th>
                            <th className="w-[590px] py-2 px-2.5 border-r border-[#A5B8D9] text-left">
                              Danh sách file
                            </th>
                            <th className="py-2 px-2"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {addForm.contracts.map((cRow, rowIdx) => (
                            <tr
                              key={cRow.id}
                              className="group border-b border-gray-200 bg-white hover:bg-gray-50/40"
                            >
                              <td className="py-1.5 px-1.5 border-r border-dashed border-gray-200 text-center align-middle">
                                {addForm.contracts.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveContractRow(cRow.id)}
                                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 p-0.5 transition-opacity cursor-pointer"
                                    title="Xóa dòng"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </td>
                              <td className="py-1.5 px-2 border-r border-dashed border-gray-200 text-center align-middle">
                                <span className="inline-flex items-center justify-center min-w-[28px] h-[22px] px-2 rounded-[4px] bg-[#F1F5F9] text-gray-800 text-[12px] font-medium">
                                  {rowIdx + 1}
                                </span>
                              </td>
                              <td
                                className={`py-1 px-2 border-r border-dashed border-gray-200 align-middle transition-colors ${
                                  !cRow.contractNumber.trim() ? 'bg-[#FFF4F4]' : ''
                                }`}
                              >
                                <input
                                  type="text"
                                  value={cRow.contractNumber}
                                  onChange={(e) =>
                                    handleUpdateContractRow(
                                      cRow.id,
                                      'contractNumber',
                                      e.target.value
                                    )
                                  }
                                  className="w-full bg-transparent text-[12.5px] text-gray-800 py-1 outline-none"
                                />
                              </td>
                              <td
                                className={`py-1 px-2 border-r border-dashed border-gray-200 align-middle transition-colors ${
                                  !cRow.contractName.trim() ? 'bg-[#FFF4F4]' : ''
                                }`}
                              >
                                <input
                                  type="text"
                                  value={cRow.contractName}
                                  onChange={(e) =>
                                    handleUpdateContractRow(
                                      cRow.id,
                                      'contractName',
                                      e.target.value
                                    )
                                  }
                                  className="w-full bg-transparent text-[12.5px] text-gray-800 py-1 outline-none"
                                />
                              </td>
                              <td className="py-1.5 px-2.5 border-r border-dashed border-gray-200 align-middle">
                                <div className="flex flex-wrap items-center gap-2">
                                  {cRow.files.map((file) => (
                                    <span
                                      key={file.id}
                                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-[#1D4ED8] border border-blue-100 text-[11.5px]"
                                    >
                                      <span
                                        className="max-w-[180px] truncate"
                                        title={file.name}
                                      >
                                        {file.name}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleRemoveContractFile(cRow.id, file.id)
                                        }
                                        className="text-blue-400 hover:text-red-500 cursor-pointer"
                                        title="Xóa file"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </span>
                                  ))}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleTriggerContractFileUpload(cRow.id)
                                    }
                                    className="text-[#3B82F6] hover:text-[#1D4ED8] hover:underline text-[12.5px] font-normal cursor-pointer"
                                  >
                                    Nhấn để tải lên
                                  </button>
                                </div>
                              </td>
                              <td className="py-1.5 px-2"></td>
                            </tr>
                          ))}

                          <tr
                            onClick={handleAddContractRow}
                            className="border-b border-gray-200 bg-white hover:bg-blue-50/30 cursor-pointer transition-colors"
                          >
                            <td className="py-2 px-2 border-r border-dashed border-gray-200"></td>
                            <td className="py-2 px-2 border-r border-dashed border-gray-200"></td>
                            <td
                              colSpan={2}
                              className="py-2 px-2.5 border-r border-dashed border-gray-200 text-[12px] italic text-gray-400 whitespace-nowrap"
                            >
                              <span className="inline-flex items-center gap-1.5">
                                <Plus className="w-3.5 h-3.5 text-gray-400" />
                                <span>Bấm vào đây để thêm dòng mới</span>
                              </span>
                            </td>
                            <td className="py-2 px-2 border-r border-dashed border-gray-200"></td>
                            <td className="py-2 px-2"></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="px-2.5 py-2 border-b border-gray-200 bg-white flex items-center justify-between">
                      <button
                        type="button"
                        onClick={handleAddContractRow}
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
                ) : activeAddTab === 'inspection' ? (
                  <div className="flex flex-col flex-1">
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-[12.5px] min-w-[1160px]">
                        <thead>
                          <tr className="bg-[#F3F6FB] text-gray-800 font-semibold text-[12.5px] border-b border-gray-200">
                            <th className="w-[34px] py-2 px-2 border-r border-[#D6E0EE]"></th>
                            <th className="w-[46px] py-2 px-2 border-r border-[#D6E0EE] text-center">
                              #
                            </th>
                            <th className="w-[178px] py-2 px-2.5 border-r border-[#A5B8D9] text-left">
                              Tên hồ sơ <span className="text-red-500">*</span>
                            </th>
                            <th className="w-[202px] py-2 px-2.5 border-r border-[#A5B8D9] text-left">
                              Ghi chú
                            </th>
                            <th className="w-[610px] py-2 px-2.5 border-r border-[#A5B8D9] text-left">
                              Danh sách file
                            </th>
                            <th className="py-2 px-2"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {addForm.inspectionProfiles.map((iRow, rowIdx) => (
                            <tr
                              key={iRow.id}
                              className="group border-b border-gray-200 bg-white hover:bg-gray-50/40"
                            >
                              <td className="py-1.5 px-1.5 border-r border-dashed border-gray-200 text-center align-middle">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveInspectionRow(iRow.id)}
                                  className="text-red-500 hover:text-red-600 p-0.5 transition-colors cursor-pointer"
                                  title="Xóa dòng"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                              <td className="py-1.5 px-2 border-r border-dashed border-gray-200 text-center align-middle">
                                <span className="inline-flex items-center justify-center min-w-[28px] h-[22px] px-2 rounded-[4px] bg-[#F1F5F9] text-gray-800 text-[12px] font-medium">
                                  {rowIdx + 1}
                                </span>
                              </td>
                              <td
                                className={`py-1 px-2 border-r border-dashed border-gray-200 align-middle transition-colors ${
                                  !iRow.profileName.trim() ? 'bg-[#FFF4F4]' : ''
                                }`}
                              >
                                <input
                                  type="text"
                                  value={iRow.profileName}
                                  onChange={(e) =>
                                    handleUpdateInspectionRow(
                                      iRow.id,
                                      'profileName',
                                      e.target.value
                                    )
                                  }
                                  className="w-full bg-transparent text-[12.5px] text-gray-800 py-1 outline-none"
                                />
                              </td>
                              <td className="py-1 px-2 border-r border-dashed border-gray-200 align-middle">
                                <input
                                  type="text"
                                  value={iRow.note}
                                  onChange={(e) =>
                                    handleUpdateInspectionRow(
                                      iRow.id,
                                      'note',
                                      e.target.value
                                    )
                                  }
                                  className="w-full bg-transparent text-[12.5px] text-gray-800 py-1 outline-none"
                                />
                              </td>
                              <td className="py-1.5 px-2.5 border-r border-dashed border-gray-200 align-middle">
                                <div className="flex flex-wrap items-center gap-2">
                                  {iRow.files.map((file) => (
                                    <span
                                      key={file.id}
                                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-[#1D4ED8] border border-blue-100 text-[11.5px]"
                                    >
                                      <span
                                        className="max-w-[180px] truncate"
                                        title={file.name}
                                      >
                                        {file.name}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleRemoveInspectionFile(iRow.id, file.id)
                                        }
                                        className="text-blue-400 hover:text-red-500 cursor-pointer"
                                        title="Xóa file"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </span>
                                  ))}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleTriggerInspectionFileUpload(iRow.id)
                                    }
                                    className="text-[#3B82F6] hover:text-[#1D4ED8] hover:underline text-[12.5px] font-normal cursor-pointer"
                                  >
                                    Nhấn để tải lên
                                  </button>
                                </div>
                              </td>
                              <td className="py-1.5 px-2"></td>
                            </tr>
                          ))}

                          <tr
                            onClick={handleAddInspectionRow}
                            className="border-b border-gray-200 bg-white hover:bg-blue-50/30 cursor-pointer transition-colors"
                          >
                            <td className="py-2 px-2 border-r border-dashed border-gray-200"></td>
                            <td className="py-2 px-2 border-r border-dashed border-gray-200"></td>
                            <td
                              colSpan={2}
                              className="py-2 px-2.5 border-r border-dashed border-gray-200 text-[12px] italic text-gray-400 whitespace-nowrap"
                            >
                              <span className="inline-flex items-center gap-1.5">
                                <Plus className="w-3.5 h-3.5 text-gray-400" />
                                <span>Bấm vào đây để thêm dòng mới</span>
                              </span>
                            </td>
                            <td className="py-2 px-2 border-r border-dashed border-gray-200"></td>
                            <td className="py-2 px-2"></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="px-2.5 py-2 border-b border-gray-200 bg-white flex items-center justify-between">
                      <button
                        type="button"
                        onClick={handleAddInspectionRow}
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
                ) : activeAddTab === 'staff' ? (
                  <div className="flex flex-col flex-1">
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-[12.5px] min-w-[1320px]">
                        <thead>
                          <tr className="bg-[#F3F6FB] text-gray-800 font-semibold text-[12.5px] border-b border-gray-200">
                            <th className="w-[34px] py-2 px-2 border-r border-[#D6E0EE]"></th>
                            <th className="w-[46px] py-2 px-2 border-r border-[#D6E0EE] text-center">
                              #
                            </th>
                            <th className="w-[175px] py-2 px-2.5 border-r border-[#A5B8D9] text-left">
                              Vị trí
                            </th>
                            <th className="w-[195px] py-2 px-2.5 border-r border-[#A5B8D9] text-left">
                              Họ tên <span className="text-red-500">*</span>
                            </th>
                            <th className="w-[155px] py-2 px-2.5 border-r border-[#A5B8D9] text-left">
                              Số điện thoại
                            </th>
                            <th className="w-[170px] py-2 px-2.5 border-r border-[#A5B8D9] text-left">
                              Email
                            </th>
                            <th className="w-[150px] py-2 px-2.5 border-r border-[#A5B8D9] text-left">
                              Chức vụ
                            </th>
                            <th className="w-[125px] py-2 px-2.5 border-r border-[#A5B8D9] text-left">
                              Đang làm việc
                            </th>
                            <th className="w-[190px] py-2 px-2.5 border-r border-[#A5B8D9] text-left">
                              Ghi chú
                            </th>
                            <th className="py-2 px-2"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {addForm.staff.map((sRow, rowIdx) => (
                            <tr
                              key={sRow.id}
                              className="group border-b border-gray-200 bg-white hover:bg-gray-50/40"
                            >
                              <td className="py-1.5 px-1.5 border-r border-dashed border-gray-200 text-center align-middle">
                                {addForm.staff.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveStaffRow(sRow.id)}
                                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 p-0.5 transition-opacity cursor-pointer"
                                    title="Xóa dòng"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </td>
                              <td className="py-1.5 px-2 border-r border-dashed border-gray-200 text-center align-middle">
                                <span className="inline-flex items-center justify-center min-w-[28px] h-[22px] px-2 rounded-[4px] bg-[#F1F5F9] text-gray-800 text-[12px] font-medium">
                                  {rowIdx + 1}
                                </span>
                              </td>
                              <td className="py-1 px-2 border-r border-dashed border-gray-200 align-middle">
                                <div className="relative flex items-center">
                                  <select
                                    value={sRow.position}
                                    onChange={(e) =>
                                      handleUpdateStaffRow(
                                        sRow.id,
                                        'position',
                                        e.target.value
                                      )
                                    }
                                    className="w-full bg-transparent text-[12.5px] text-gray-800 pr-5 py-1 appearance-none outline-none cursor-pointer"
                                  >
                                    <option value=""></option>
                                    {INSURANCE_STAFF_POSITION_OPTIONS.map((opt) => (
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
                              <td
                                className={`py-1 px-2 border-r border-dashed border-gray-200 align-middle transition-colors ${
                                  !sRow.fullName.trim() ? 'bg-[#FFF4F4]' : ''
                                }`}
                              >
                                <input
                                  type="text"
                                  value={sRow.fullName}
                                  onChange={(e) =>
                                    handleUpdateStaffRow(
                                      sRow.id,
                                      'fullName',
                                      e.target.value
                                    )
                                  }
                                  className="w-full bg-transparent text-[12.5px] text-gray-800 py-1 outline-none"
                                />
                              </td>
                              <td className="py-1 px-2 border-r border-dashed border-gray-200 align-middle">
                                <input
                                  type="text"
                                  value={sRow.phone}
                                  onChange={(e) =>
                                    handleUpdateStaffRow(
                                      sRow.id,
                                      'phone',
                                      e.target.value
                                    )
                                  }
                                  className="w-full bg-transparent text-[12.5px] text-gray-800 py-1 outline-none"
                                />
                              </td>
                              <td className="py-1 px-2 border-r border-dashed border-gray-200 align-middle">
                                <input
                                  type="email"
                                  value={sRow.email}
                                  onChange={(e) =>
                                    handleUpdateStaffRow(
                                      sRow.id,
                                      'email',
                                      e.target.value
                                    )
                                  }
                                  className="w-full bg-transparent text-[12.5px] text-gray-800 py-1 outline-none"
                                />
                              </td>
                              <td className="py-1 px-2 border-r border-dashed border-gray-200 align-middle">
                                <input
                                  type="text"
                                  value={sRow.title}
                                  onChange={(e) =>
                                    handleUpdateStaffRow(
                                      sRow.id,
                                      'title',
                                      e.target.value
                                    )
                                  }
                                  className="w-full bg-transparent text-[12.5px] text-gray-800 py-1 outline-none"
                                />
                              </td>
                              <td className="py-1.5 px-2 border-r border-dashed border-gray-200 text-center align-middle">
                                <input
                                  type="checkbox"
                                  checked={sRow.isWorking}
                                  onChange={(e) =>
                                    handleUpdateStaffRow(
                                      sRow.id,
                                      'isWorking',
                                      e.target.checked
                                    )
                                  }
                                  className="w-3.5 h-3.5 rounded border-gray-400 cursor-pointer accent-[#1677FF]"
                                />
                              </td>
                              <td className="py-1 px-2 border-r border-dashed border-gray-200 align-middle">
                                <input
                                  type="text"
                                  value={sRow.note}
                                  onChange={(e) =>
                                    handleUpdateStaffRow(
                                      sRow.id,
                                      'note',
                                      e.target.value
                                    )
                                  }
                                  className="w-full bg-transparent text-[12.5px] text-gray-800 py-1 outline-none"
                                />
                              </td>
                              <td className="py-1.5 px-2"></td>
                            </tr>
                          ))}

                          <tr
                            onClick={handleAddStaffRow}
                            className="border-b border-gray-200 bg-white hover:bg-blue-50/30 cursor-pointer transition-colors"
                          >
                            <td className="py-2 px-2 border-r border-dashed border-gray-200"></td>
                            <td className="py-2 px-2 border-r border-dashed border-gray-200"></td>
                            <td
                              colSpan={2}
                              className="py-2 px-2.5 border-r border-dashed border-gray-200 text-[12px] italic text-gray-400 whitespace-nowrap"
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
                            <td className="py-2 px-2 border-r border-dashed border-gray-200"></td>
                            <td className="py-2 px-2"></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="px-2.5 py-2 border-b border-gray-200 bg-white flex items-center justify-between">
                      <button
                        type="button"
                        onClick={handleAddStaffRow}
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
                ) : (
                  <div className="px-4 py-4 flex flex-wrap items-center gap-x-48 gap-y-3 bg-white">
                    <label className="inline-flex items-center gap-2 text-[13px] text-gray-800 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={addForm.products.compulsoryCivilLiability}
                        onChange={(e) =>
                          setAddForm((prev) => ({
                            ...prev,
                            products: {
                              ...prev.products,
                              compulsoryCivilLiability: e.target.checked,
                            },
                          }))
                        }
                        className="w-3.5 h-3.5 rounded-[2px] border-gray-400 accent-[#1677FF] cursor-pointer"
                      />
                      <span>Bảo hiểm trách nhiệm dân sự bắt buộc</span>
                    </label>

                    <label className="inline-flex items-center gap-2 text-[13px] text-gray-800 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={addForm.products.autoPhysicalDamage}
                        onChange={(e) =>
                          setAddForm((prev) => ({
                            ...prev,
                            products: {
                              ...prev.products,
                              autoPhysicalDamage: e.target.checked,
                            },
                          }))
                        }
                        className="w-3.5 h-3.5 rounded-[2px] border-gray-400 accent-[#1677FF] cursor-pointer"
                      />
                      <span>Bảo hiểm vật chất ô tô</span>
                    </label>
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
              form="category-insurance-add-form"
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
