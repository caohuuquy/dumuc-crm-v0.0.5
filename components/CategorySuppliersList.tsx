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
  ArrowUpDown,
  X,
  Upload,
  Calendar,
  HelpCircle,
  Plus,
  KeyRound,
  AlertCircle,
} from 'lucide-react';

export interface SupplierDocumentRow {
  id: string;
  groupName: string;
  contractNumber: string;
  description: string;
  effectiveDate: string;
  expiryDate: string;
  isValid: boolean;
  link: string;
  files: { id: string; name: string; size: string }[];
}

export interface CategorySupplierRecord {
  id: string;
  code: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  companyName: string;
  taxCode: string;
  headquartersAddress: string;
  isCustomer: boolean;
  province?: string;
  ward?: string;
  streetAddress?: string;
  legalRepresentative?: string;
  paymentTermDays?: string;
  creditLimit?: string;
  configNote?: string;
  images?: { id: string; name: string; url: string }[];
  documents?: SupplierDocumentRow[];
}

const SUPPLIER_DOC_GROUP_OPTIONS = [
  'Hợp đồng nguyên tắc',
  'Hợp đồng mua bán',
  'Phụ lục hợp đồng',
  'Báo giá',
  'Giấy phép kinh doanh',
  'Hồ sơ năng lực',
  'Chứng chỉ chất lượng',
  'Khác',
];

const createEmptySupplierDocRow = (): SupplierDocumentRow => ({
  id: `sdoc-row-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  groupName: '',
  contractNumber: '',
  description: '',
  effectiveDate: '',
  expiryDate: '',
  isValid: false,
  link: '',
  files: [],
});

const formatIsoToDisplayDate = (iso: string): string => {
  if (!iso) return '';
  const parts = iso.split('-');
  if (parts.length !== 3) return iso;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

const STORAGE_KEY = 'category_suppliers_list_v1';

const PROVINCE_WARD_MAP: Record<string, string[]> = {
  'Thành phố Hồ Chí Minh': [
    'Phường Bến Nghé',
    'Phường Bến Thành',
    'Phường Thủ Đức',
    'Phường Tân Phú',
    'Phường Thạnh Xuân',
    'Phường Tân Thành',
    'Phường Tây Thạnh',
    'Phường 1',
    'Phường 3',
    'Phường 4',
    'Xã Hóc Môn',
  ],
  'Thành phố Hà Nội': [
    'Phường Bạch Đằng',
    'Phường Thanh Nhàn',
    'Phường Tràng Tiền',
    'Phường Dịch Vọng',
  ],
  'Thành phố Đà Nẵng': [
    'Phường Hải Châu 1',
    'Phường Thạch Thang',
    'Phường An Hải Bắc',
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

export const INITIAL_CATEGORY_SUPPLIERS: CategorySupplierRecord[] = [
  {
    id: 'sup-1',
    code: 'UT',
    name: 'CÔNG TY TNHH ƯU THỊNH',
    contactPerson: 'Anh Hưng',
    phone: '0906 386 068',
    email: '',
    address: 'Lô 12-13, Đường D2, KCN Tân Bình',
    companyName: '',
    taxCode: '',
    headquartersAddress: '',
    isCustomer: true,
  },
  {
    id: 'sup-2',
    code: 'PTTN',
    name: 'PHỤ TÙNG Ô TÔ TIỆP NGUYỄN',
    contactPerson: 'Anh Tiệp',
    phone: '0999 999 999',
    email: 'email@gmail.com',
    address: 'Số 3/11/101 Thanh Nhàn, Xã Thanh Nhàn',
    companyName: '',
    taxCode: '9980980876',
    headquartersAddress: '',
    isCustomer: true,
  },
  {
    id: 'sup-3',
    code: 'PTNAMPHONG',
    name: 'Công ty Cổ Phần Phụ Tùng Ô Tô Nam Phong',
    contactPerson: 'Mr Toàn',
    phone: '0961 534 699',
    email: '',
    address: '8B10 Đầm Trấu, Bạch Đằng, Hai Bà Trưng',
    companyName: '',
    taxCode: '',
    headquartersAddress: '',
    isCustomer: true,
  },
  {
    id: 'sup-4',
    code: 'PTDY',
    name: 'CÔNG TY TNHH TM ĐẮC YẾN',
    contactPerson: 'Mrs Sương',
    phone: '0997 768 867',
    email: '',
    address: '403 Tô Ngọc Vân, Phường Thạnh Xuân',
    companyName: '',
    taxCode: '4434567657',
    headquartersAddress: '',
    isCustomer: true,
  },
  {
    id: 'sup-5',
    code: 'PTDG',
    name: 'PHỤ TÙNG Ô TÔ DƯƠNG GIA',
    contactPerson: 'DƯƠNG GIA',
    phone: '0983 987 873',
    email: '',
    address: '442 An Dương Vương, Phường 4, Quận 5',
    companyName: '',
    taxCode: '',
    headquartersAddress: '',
    isCustomer: true,
  },
  {
    id: 'sup-6',
    code: 'NCC_XDMINHTAM',
    name: 'CÔNG TY TNHH CƠ KHÍ VÀ XÂY DỰNG MINH TÂM',
    contactPerson: '',
    phone: '',
    email: '',
    address: '327 Trương Vĩnh Ký, Phường Tân Thành',
    companyName: '',
    taxCode: '0316688103',
    headquartersAddress: '',
    isCustomer: false,
  },
  {
    id: 'sup-7',
    code: 'NCC_VPPTHANHPHAT',
    name: 'CÔNG TY TNHH D&Q THÀNH PHÁT',
    contactPerson: '',
    phone: '0286 292 546 9',
    email: '',
    address: 'số 71/10 Cộng Hòa, Phường 4, Tân Bình',
    companyName: '',
    taxCode: '0316834763',
    headquartersAddress: '',
    isCustomer: false,
  },
  {
    id: 'sup-8',
    code: 'NCC_VINHAUTO',
    name: 'Vinh Auto',
    contactPerson: '',
    phone: '0907 851 799',
    email: '',
    address: '190A Đ. Trần Bình Trọng, Phường 3, Quận 5',
    companyName: '',
    taxCode: '',
    headquartersAddress: '',
    isCustomer: false,
  },
  {
    id: 'sup-9',
    code: 'NCC_VANSON',
    name: 'Công ty Cổ phần dịch vụ Vân Sơn',
    contactPerson: '',
    phone: '0909 123 123',
    email: '',
    address: '35 Đường TL 02 - KP 3A - P. Thạnh Lộc',
    companyName: '',
    taxCode: '',
    headquartersAddress: '',
    isCustomer: false,
  },
  {
    id: 'sup-10',
    code: 'NCC_VANNGUYEN',
    name: 'Chủ Mặt Bằng 25 Chế Lan Viên',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    companyName: '',
    taxCode: '',
    headquartersAddress: '',
    isCustomer: false,
  },
  {
    id: 'sup-11',
    code: 'NCC_TUANVINH',
    name: 'Phụ tùng ô tô Tuấn Vinh',
    contactPerson: '',
    phone: '',
    email: '',
    address: '1954, Quốc lộ 1A, P. Tân Thới Hiệp',
    companyName: '',
    taxCode: '',
    headquartersAddress: '',
    isCustomer: false,
  },
  {
    id: 'sup-12',
    code: 'NCC_TRÍ TÍN',
    name: 'TRÍ TÍN AUTO',
    contactPerson: '',
    phone: '',
    email: '',
    address: 'Xã Hóc Môn, Thành phố Hồ Chí Minh',
    companyName: '',
    taxCode: '1234567890',
    headquartersAddress: '',
    isCustomer: true,
  },
  {
    id: 'sup-13',
    code: 'NCC_TRUONGPHAT',
    name: 'CÔNG TY TNHH PHÁT TRIỂN TRƯỜNG PHÁT',
    contactPerson: '',
    phone: '',
    email: '',
    address: '881 Phan Văn Trị, Phường 1, Gò Vấp',
    companyName: '',
    taxCode: '0312179313',
    headquartersAddress: '',
    isCustomer: false,
  },
  {
    id: 'sup-14',
    code: 'NCC_TRUCTIN',
    name: 'CÔNG TY TNHH THƯƠNG MẠI TRỰC TÍN',
    contactPerson: '',
    phone: '',
    email: '',
    address: '78 Chế Lan Viên, Phường Tây Thạnh',
    companyName: '',
    taxCode: '0312991564',
    headquartersAddress: '',
    isCustomer: false,
  },
  {
    id: 'sup-15',
    code: 'NCC_TRIDUNG',
    name: 'Trí Dũng Auto',
    contactPerson: '',
    phone: '0938 623 396',
    email: '',
    address: '132 Chế Lan Viên phường Tây Thạnh',
    companyName: '',
    taxCode: '',
    headquartersAddress: '',
    isCustomer: false,
  },
  {
    id: 'sup-16',
    code: 'NCC_TRANVANSON',
    name: 'Cơ sở hàn tiện Trần Văn Sơn',
    contactPerson: '',
    phone: '0785 237 799',
    email: '',
    address: '4A Quốc lộ 1A - KP7 - P. Tân Thới Nhất',
    companyName: '',
    taxCode: '',
    headquartersAddress: '',
    isCustomer: false,
  },
  {
    id: 'sup-17',
    code: 'NCC_TONTHANH',
    name: 'Cửa hàng dầu nhớt Tôn Thành',
    contactPerson: '',
    phone: '',
    email: '',
    address: '22C QL22, Trung Mỹ Tây, Quận 12',
    companyName: '',
    taxCode: '',
    headquartersAddress: '',
    isCustomer: false,
  },
  {
    id: 'sup-18',
    code: 'NCC_TOANY',
    name: 'Phụ tùng Ô tô Toàn Ý',
    contactPerson: '',
    phone: '0903 835 521',
    email: '',
    address: '323A An Dương Vương, P.3, Quận 5',
    companyName: '',
    taxCode: '',
    headquartersAddress: '',
    isCustomer: false,
  },
  {
    id: 'sup-19',
    code: 'NCC_TIENNGUYEN',
    name: 'Garage Tiến Nguyện',
    contactPerson: '',
    phone: '0939 050 272',
    email: '',
    address: 'C7/17/G12, Ấp 4 - Xã Bình Hưng',
    companyName: '',
    taxCode: '',
    headquartersAddress: '',
    isCustomer: false,
  },
  {
    id: 'sup-20',
    code: 'NCC_THUVAN',
    name: 'Chủ Mặt Bằng Phòng Sơn - Hậu Cần',
    contactPerson: '',
    phone: '0903 846 242',
    email: '',
    address: '',
    companyName: '',
    taxCode: '',
    headquartersAddress: '',
    isCustomer: false,
  },
];

export const CategorySuppliersList: React.FC = () => {
  const [items, setItems] = useState<CategorySupplierRecord[]>(() => {
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
    return INITIAL_CATEGORY_SUPPLIERS;
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

  // Sorting
  const [sortField, setSortField] = useState<'code' | 'name' | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  // Pagination
  const [rowsPerPage, setRowsPerPage] = useState('20');
  const [currentPage, setCurrentPage] = useState(1);

  // Full-screen Add modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeAddTab, setActiveAddTab] = useState<
    'config' | 'business_license' | 'images' | 'documents'
  >('business_license');
  const [addFormError, setAddFormError] = useState('');
  const [taxCodeError, setTaxCodeError] = useState('');
  const [addForm, setAddForm] = useState({
    code: '',
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    province: '',
    ward: '',
    streetAddress: '',
    isCustomer: false,
    companyName: '',
    legalRepresentative: '',
    taxCode: '',
    headquartersAddress: '',
    paymentTermDays: '',
    creditLimit: '',
    configNote: '',
    images: [] as { id: string; name: string; url: string }[],
    documents: [createEmptySupplierDocRow()] as SupplierDocumentRow[],
  });
  const [dossierRowId, setDossierRowId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const imageUploadRef = useRef<HTMLInputElement | null>(null);
  const docUploadRef = useRef<HTMLInputElement | null>(null);
  const activeUploadRowIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isAddModalOpen || activeAddTab !== 'documents') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        setAddForm((prev) => ({
          ...prev,
          documents: [...prev.documents, createEmptySupplierDocRow()],
        }));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAddModalOpen, activeAddTab]);

  const isFiltering = searchQuery.trim() !== '';

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const qNoSpace = q.replace(/\s+/g, '');
    const filtered = !q
      ? items
      : items.filter((item) => {
          return (
            item.code.toLowerCase().includes(q) ||
            item.name.toLowerCase().includes(q) ||
            item.contactPerson.toLowerCase().includes(q) ||
            item.phone.replace(/\s+/g, '').toLowerCase().includes(qNoSpace) ||
            item.email.toLowerCase().includes(q) ||
            item.taxCode.toLowerCase().includes(q) ||
            item.address.toLowerCase().includes(q)
          );
        });

    if (!sortField) return filtered;
    return [...filtered].sort((a, b) => {
      const aVal = a[sortField].toLowerCase();
      const bVal = b[sortField].toLowerCase();
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [items, searchQuery, sortField, sortDir]);

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

  const handleToggleIsCustomer = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isCustomer: !item.isCustomer } : item
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

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    setItems((prev) => prev.filter((item) => !selectedIds.includes(item.id)));
    setSelectedIds([]);
  };

  const handleExportExcel = () => {
    const headers = [
      'Mã',
      'Tên',
      'Người liên hệ',
      'SĐT',
      'Email',
      'Địa chỉ',
      'Tên công ty',
      'Mã số thuế',
      'Địa chỉ trụ sở chính',
      'Là khách hàng',
    ];
    const rows = filteredItems.map((row) => [
      `"${row.code}"`,
      `"${row.name}"`,
      `"${row.contactPerson}"`,
      `"${row.phone}"`,
      `"${row.email}"`,
      `"${row.address}"`,
      `"${row.companyName}"`,
      `"${row.taxCode}"`,
      `"${row.headquartersAddress}"`,
      row.isCustomer ? 'Có' : 'Không',
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([new Uint8Array([0xef, 0xbb, 0xbf]), csvContent], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'danh_muc_nha_cung_cap.csv');
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
      const imported: CategorySupplierRecord[] = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map((c) => c.replace(/^"|"$/g, '').trim());
        if (cols[0] || cols[1]) {
          imported.push({
            id: `sup-imp-${Date.now()}-${i}`,
            code: cols[0] || `NCC_${Date.now()}${i}`,
            name: cols[1] || '',
            contactPerson: cols[2] || '',
            phone: cols[3] || '',
            email: cols[4] || '',
            address: cols[5] || '',
            companyName: cols[6] || '',
            taxCode: cols[7] || '',
            headquartersAddress: cols[8] || '',
            isCustomer: cols[9]?.toLowerCase() === 'có' || cols[9]?.toLowerCase() === 'true',
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
      contactPerson: '',
      phone: '',
      email: '',
      province: '',
      ward: '',
      streetAddress: '',
      isCustomer: false,
      companyName: '',
      legalRepresentative: '',
      taxCode: '',
      headquartersAddress: '',
      paymentTermDays: '',
      creditLimit: '',
      configNote: '',
      images: [],
      documents: [createEmptySupplierDocRow()],
    });
    setActiveAddTab('business_license');
    setAddFormError('');
    setTaxCodeError('');
    setDossierRowId(null);
  };

  const handleOpenAddModal = () => {
    resetAddForm();
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    setAddFormError('');
    setTaxCodeError('');
    setDossierRowId(null);
  };

  const findDuplicateTaxCode = (value: string): CategorySupplierRecord | undefined => {
    const normalized = value.trim().toLowerCase();
    if (!normalized) return undefined;
    return items.find((item) => item.taxCode?.trim().toLowerCase() === normalized);
  };

  const handleSupplierImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    (Array.from(files) as File[]).forEach((file, idx) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setAddForm((prev) => ({
            ...prev,
            images: [
              ...prev.images,
              {
                id: `img-${Date.now()}-${idx}`,
                name: file.name,
                url: reader.result as string,
              },
            ],
          }));
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleAddDocumentRow = () => {
    setAddForm((prev) => ({
      ...prev,
      documents: [...prev.documents, createEmptySupplierDocRow()],
    }));
  };

  const handleUpdateDocumentRow = <K extends keyof SupplierDocumentRow>(
    rowId: string,
    field: K,
    value: SupplierDocumentRow[K]
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
        documents:
          remaining.length > 0 ? remaining : [createEmptySupplierDocRow()],
      };
    });
  };

  const handleTriggerRowFileUpload = (rowId: string) => {
    activeUploadRowIdRef.current = rowId;
    docUploadRef.current?.click();
  };

  const handleSupplierDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    const targetRowId = activeUploadRowIdRef.current;
    if (!files || files.length === 0 || !targetRowId) return;
    const added = (Array.from(files) as File[]).map((file, idx) => ({
      id: `sdoc-${Date.now()}-${idx}`,
      name: file.name,
      size:
        file.size < 1024 * 1024
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

    let hasError = false;

    if (!addForm.name.trim()) {
      setAddFormError('Vui lòng nhập Tên nhà cung cấp.');
      hasError = true;
    } else {
      setAddFormError('');
    }

    const dupTaxCode = findDuplicateTaxCode(addForm.taxCode);
    if (dupTaxCode) {
      setTaxCodeError(
        `Mã số thuế đã tồn tại (${dupTaxCode.code} - ${dupTaxCode.name}). Không được trùng.`
      );
      setActiveAddTab('business_license');
      hasError = true;
    } else {
      setTaxCodeError('');
    }

    if (hasError) return;

    const generatedCode =
      addForm.code.trim() || `NCC_${String(Date.now()).slice(-6)}`;

    const composedAddress = [
      addForm.streetAddress.trim(),
      addForm.ward.trim(),
      addForm.province.trim(),
    ]
      .filter(Boolean)
      .join(', ');

    const newItem: CategorySupplierRecord = {
      id: `sup-${Date.now()}`,
      code: generatedCode,
      name: addForm.name.trim(),
      contactPerson: addForm.contactPerson.trim(),
      phone: addForm.phone.trim(),
      email: addForm.email.trim(),
      address: composedAddress,
      companyName: addForm.companyName.trim(),
      taxCode: addForm.taxCode.trim(),
      headquartersAddress: addForm.headquartersAddress.trim(),
      isCustomer: addForm.isCustomer,
      province: addForm.province,
      ward: addForm.ward,
      streetAddress: addForm.streetAddress.trim(),
      legalRepresentative: addForm.legalRepresentative.trim(),
      paymentTermDays: addForm.paymentTermDays.trim(),
      creditLimit: addForm.creditLimit.trim(),
      configNote: addForm.configNote.trim(),
      images: addForm.images,
      documents: addForm.documents,
    };

    setItems((prev) => [newItem, ...prev]);
    resetAddForm();
    setIsAddModalOpen(false);
  };

  const totalResults = isFiltering
    ? filteredItems.length
    : 124 + (items.length - INITIAL_CATEGORY_SUPPLIERS.length);
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
      <div className="flex items-center justify-between px-3 py-2 bg-white border-b border-gray-200 shrink-0 gap-3 flex-wrap">
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
          <div className="relative w-[205px]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Tìm mã, tên, điện thoại, email"
              className="w-full bg-white border border-gray-300 rounded-[6px] pl-3 pr-8 py-1.5 text-[12.5px] text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#1677FF]"
            />
            <Search className="w-3.5 h-3.5 text-gray-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
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

      {/* Main Content Card */}
      <div className="flex-1 flex flex-col bg-white overflow-hidden">
        {/* Table Area */}
        <div className="flex-1 overflow-auto bg-white">
          <table className="w-full border-collapse text-[12.5px] table-fixed min-w-[1440px]">
            <thead className="bg-[#F4F6F9] sticky top-0 z-10">
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
                  className="w-[120px] py-2.5 px-2.5 border-r border-b border-gray-200 text-left cursor-pointer hover:bg-gray-200/50 transition-colors"
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
                  className="w-[190px] py-2.5 px-2.5 border-r border-b border-gray-200 text-left cursor-pointer hover:bg-gray-200/50 transition-colors"
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
                <th className="w-[175px] py-2.5 px-2.5 border-r border-b border-gray-200 text-left">
                  Người liên hệ
                </th>
                <th className="w-[170px] py-2.5 px-2.5 border-r border-b border-gray-200 text-left">
                  SĐT
                </th>
                <th className="w-[170px] py-2.5 px-2.5 border-r border-b border-gray-200 text-left">
                  Email
                </th>
                <th className="w-[185px] py-2.5 px-2.5 border-r border-b border-gray-200 text-left">
                  Địa chỉ
                </th>
                <th className="w-[175px] py-2.5 px-2.5 border-r border-b border-gray-200 text-left">
                  Tên công ty
                </th>
                <th className="w-[125px] py-2.5 px-2.5 border-r border-b border-gray-200 text-left">
                  Mã số thuế
                </th>
                <th className="w-[175px] py-2.5 px-2.5 border-r border-b border-gray-200 text-left">
                  Địa chỉ trụ sở chính
                </th>
                <th className="w-[118px] py-2.5 px-2.5 border-b border-gray-200 text-center">
                  Là khách hàng
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={11}
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
                      <td
                        className="py-2 px-2.5 border-r border-gray-200 text-gray-800 truncate align-middle"
                        title={row.contactPerson}
                      >
                        {row.contactPerson}
                      </td>
                      <td className="py-2 px-2.5 border-r border-gray-200 text-gray-800 truncate align-middle">
                        {row.phone}
                      </td>
                      <td
                        className="py-2 px-2.5 border-r border-gray-200 text-gray-800 truncate align-middle"
                        title={row.email}
                      >
                        {row.email}
                      </td>
                      <td
                        className="py-2 px-2.5 border-r border-gray-200 text-gray-800 truncate align-middle"
                        title={row.address}
                      >
                        {row.address}
                      </td>
                      <td
                        className="py-2 px-2.5 border-r border-gray-200 text-gray-800 truncate align-middle"
                        title={row.companyName}
                      >
                        {row.companyName}
                      </td>
                      <td className="py-2 px-2.5 border-r border-gray-200 text-gray-800 truncate align-middle">
                        {row.taxCode}
                      </td>
                      <td
                        className="py-2 px-2.5 border-r border-gray-200 text-gray-800 truncate align-middle"
                        title={row.headquartersAddress}
                      >
                        {row.headquartersAddress}
                      </td>
                      <td className="py-2 px-2.5 text-center align-middle">
                        <input
                          type="checkbox"
                          checked={row.isCustomer}
                          onChange={() => handleToggleIsCustomer(row.id)}
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

          {[1, 2, 3, 4, 5, 6, 7].map((page) => (
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

          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(7, p + 1))}
            disabled={currentPage === 7}
            className="w-7 h-7 flex items-center justify-center rounded-[6px] text-gray-600 hover:bg-gray-100 disabled:opacity-40 cursor-pointer border border-gray-200"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setCurrentPage(7)}
            disabled={currentPage === 7}
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

      {/* Full-Screen Add Supplier Popup */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#EEF2F6] flex flex-col overflow-hidden select-text">
          {/* Popup Top Header */}
          <div className="h-[52px] px-4 bg-white border-b border-gray-200 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-5 flex-wrap">
              <h2 className="text-[19px] font-semibold text-gray-900 leading-none">
                Nhà cung cấp
              </h2>

              <label className="inline-flex items-center gap-1.5 text-[12.5px] text-gray-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={addForm.isCustomer}
                  onChange={(e) =>
                    setAddForm({ ...addForm, isCustomer: e.target.checked })
                  }
                  className="w-3.5 h-3.5 rounded border-gray-300 accent-[#1677FF] cursor-pointer"
                />
                <span>Là khách hàng</span>
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
            id="category-supplier-add-form"
            onSubmit={handleAddSubmit}
            className="flex-1 flex flex-col gap-2.5 p-2.5 overflow-auto"
          >
            {/* Top Row: Two White Info Cards */}
            <div className="flex flex-col lg:flex-row gap-2.5 items-stretch shrink-0">
              {/* Left Card */}
              <div className="w-full lg:w-[360px] shrink-0 bg-white rounded-lg border border-gray-200 shadow-[0_1px_2px_rgba(15,23,42,0.04)] p-3.5 space-y-3">
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
                    value={addForm.name}
                    onChange={(e) => {
                      setAddForm({ ...addForm, name: e.target.value });
                      if (addFormError) setAddFormError('');
                    }}
                    placeholder="Nhập tên nhà cung cấp"
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
              </div>

              {/* Right Card */}
              <div className="w-full lg:w-[730px] shrink-0 bg-white rounded-lg border border-gray-200 shadow-[0_1px_2px_rgba(15,23,42,0.04)] p-3.5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-3 gap-y-3">
                  <div>
                    <label className="block text-[12px] font-medium text-gray-800 mb-1">
                      Người liên hệ
                    </label>
                    <input
                      type="text"
                      value={addForm.contactPerson}
                      onChange={(e) =>
                        setAddForm({ ...addForm, contactPerson: e.target.value })
                      }
                      placeholder="Nhập tên người liên hệ"
                      className="w-full bg-white border border-gray-200 rounded-[6px] px-3 py-1.5 text-[13px] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#1677FF]"
                    />
                  </div>

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
            <div className="flex-1 bg-white rounded-lg border border-gray-200 shadow-[0_1px_2px_rgba(15,23,42,0.04)] flex flex-col min-h-[380px]">
              {/* Tab Strip */}
              <div className="px-2.5 pt-2 border-b border-gray-200 flex items-end gap-1">
                <button
                  type="button"
                  onClick={() => setActiveAddTab('config')}
                  className={`px-4 py-1.5 rounded-t-[6px] text-[12.5px] transition-colors cursor-pointer ${
                    activeAddTab === 'config'
                      ? 'bg-[#FAD957] text-gray-900 font-semibold'
                      : 'bg-[#FEF9E7] text-gray-700 font-medium hover:bg-[#FEF3C7]'
                  }`}
                >
                  Cấu hình
                </button>
                <button
                  type="button"
                  onClick={() => setActiveAddTab('business_license')}
                  className={`px-4 py-1.5 rounded-t-[6px] text-[12.5px] transition-colors cursor-pointer ${
                    activeAddTab === 'business_license'
                      ? 'bg-[#FAD957] text-gray-900 font-semibold'
                      : 'bg-[#FEF9E7] text-gray-700 font-medium hover:bg-[#FEF3C7]'
                  }`}
                >
                  Giấy phép kinh doanh
                </button>
                <button
                  type="button"
                  onClick={() => setActiveAddTab('images')}
                  className={`px-4 py-1.5 rounded-t-[6px] text-[12.5px] transition-colors cursor-pointer ${
                    activeAddTab === 'images'
                      ? 'bg-[#FAD957] text-gray-900 font-semibold'
                      : 'bg-[#FEF9E7] text-gray-700 font-medium hover:bg-[#FEF3C7]'
                  }`}
                >
                  Hình ảnh
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
                  Tài liệu
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-3.5 flex-1">
                {activeAddTab === 'business_license' ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-x-3 gap-y-3.5 max-w-[1440px]">
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
                        Người đại diện pháp luật
                      </label>
                      <input
                        type="text"
                        value={addForm.legalRepresentative}
                        onChange={(e) =>
                          setAddForm({
                            ...addForm,
                            legalRepresentative: e.target.value,
                          })
                        }
                        placeholder="Nhập tên Người đại diện pháp luật"
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
                        placeholder="Nhập mã số thuế công ty"
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

                    <div className="md:col-span-2">
                      <label className="block text-[12px] font-medium text-gray-800 mb-1">
                        Địa chỉ trụ sở chính
                      </label>
                      <textarea
                        rows={3}
                        value={addForm.headquartersAddress}
                        onChange={(e) =>
                          setAddForm({
                            ...addForm,
                            headquartersAddress: e.target.value,
                          })
                        }
                        placeholder="Nhập địa chỉ trụ sở chính"
                        className="w-full bg-white border border-gray-200 rounded-[6px] px-3 py-2 text-[13px] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#1677FF] resize-y"
                      />
                    </div>
                  </div>
                ) : activeAddTab === 'config' ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-x-3 gap-y-3.5 max-w-[1440px]">
                    <div>
                      <label className="block text-[12px] font-medium text-gray-800 mb-1">
                        Số ngày công nợ
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={addForm.paymentTermDays}
                        onChange={(e) =>
                          setAddForm({ ...addForm, paymentTermDays: e.target.value })
                        }
                        placeholder="Nhập số ngày công nợ"
                        className="w-full bg-white border border-gray-200 rounded-[6px] px-3 py-1.5 text-[13px] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#1677FF]"
                      />
                    </div>

                    <div>
                      <label className="block text-[12px] font-medium text-gray-800 mb-1">
                        Hạn mức công nợ
                      </label>
                      <input
                        type="text"
                        value={addForm.creditLimit}
                        onChange={(e) =>
                          setAddForm({ ...addForm, creditLimit: e.target.value })
                        }
                        placeholder="Nhập hạn mức công nợ"
                        className="w-full bg-white border border-gray-200 rounded-[6px] px-3 py-1.5 text-[13px] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#1677FF]"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-[12px] font-medium text-gray-800 mb-1">
                        Ghi chú cấu hình
                      </label>
                      <textarea
                        rows={3}
                        value={addForm.configNote}
                        onChange={(e) =>
                          setAddForm({ ...addForm, configNote: e.target.value })
                        }
                        placeholder="Nhập ghi chú cấu hình"
                        className="w-full bg-white border border-gray-200 rounded-[6px] px-3 py-2 text-[13px] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#1677FF] resize-y"
                      />
                    </div>
                  </div>
                ) : activeAddTab === 'images' ? (
                  <div className="space-y-3">
                    <input
                      ref={imageUploadRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleSupplierImageUpload}
                    />
                    <button
                      type="button"
                      onClick={() => imageUploadRef.current?.click()}
                      className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 rounded-[6px] text-[13px] text-gray-700 font-medium cursor-pointer transition-colors"
                    >
                      <Upload className="w-4 h-4 text-gray-500" />
                      <span>Tải lên hình ảnh</span>
                    </button>

                    {addForm.images.length === 0 ? (
                      <div className="text-[12.5px] text-gray-400">
                        Chưa có hình ảnh đính kèm.
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-3">
                        {addForm.images.map((img) => (
                          <div
                            key={img.id}
                            className="relative w-28 h-28 rounded-[6px] border border-gray-200 overflow-hidden bg-gray-50"
                          >
                            <img
                              src={img.url}
                              alt={img.name}
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setAddForm((prev) => ({
                                  ...prev,
                                  images: prev.images.filter((i) => i.id !== img.id),
                                }))
                              }
                              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-red-600 cursor-pointer"
                              title="Xóa ảnh"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col h-full">
                    <input
                      ref={docUploadRef}
                      type="file"
                      multiple
                      className="hidden"
                      onChange={handleSupplierDocUpload}
                    />

                    <div className="border border-gray-200 rounded-[6px] bg-white overflow-hidden flex flex-col">
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-[12.5px] min-w-[1440px]">
                          <thead>
                            <tr className="bg-[#F3F6FB] text-gray-800 font-semibold text-[12.5px] border-b border-gray-200">
                              <th className="w-[34px] py-2.5 px-2 border-r border-[#D6E0EE]"></th>
                              <th className="w-[46px] py-2.5 px-2 border-r border-[#D6E0EE] text-center">
                                #
                              </th>
                              <th className="w-[148px] py-2.5 px-2.5 border-r border-[#A5B8D9] text-left">
                                Tên nhóm
                              </th>
                              <th className="w-[146px] py-2.5 px-2.5 border-r border-[#A5B8D9] text-left">
                                Số hợp đồng
                              </th>
                              <th className="w-[146px] py-2.5 px-2.5 border-r border-[#A5B8D9] text-left">
                                Mô tả
                              </th>
                              <th className="w-[146px] py-2.5 px-2.5 border-r border-[#A5B8D9] text-left">
                                Ngày hiệu lực
                              </th>
                              <th className="w-[146px] py-2.5 px-2.5 border-r border-[#A5B8D9] text-left">
                                Ngày hết hạn
                              </th>
                              <th className="w-[122px] py-2.5 px-2.5 border-r border-[#A5B8D9] text-left">
                                Còn hiệu lực
                              </th>
                              <th className="w-[146px] py-2.5 px-2.5 border-r border-[#A5B8D9] text-left">
                                Link
                              </th>
                              <th className="w-[310px] py-2.5 px-2.5 border-r border-[#A5B8D9] text-left">
                                File tải lên
                              </th>
                              <th className="w-[122px] py-2.5 px-2 border-r border-[#A5B8D9]"></th>
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

                                {/* # */}
                                <td className="py-1.5 px-2 border-r border-dashed border-gray-200 text-center align-middle">
                                  <span className="inline-flex items-center justify-center min-w-[28px] h-[22px] px-2 rounded-[4px] bg-[#F1F5F9] text-gray-800 text-[12px] font-medium">
                                    {rowIdx + 1}
                                  </span>
                                </td>

                                {/* Tên nhóm */}
                                <td className="py-1 px-2 border-r border-dashed border-gray-200 align-middle">
                                  <div className="relative flex items-center">
                                    <select
                                      value={docRow.groupName}
                                      onChange={(e) =>
                                        handleUpdateDocumentRow(
                                          docRow.id,
                                          'groupName',
                                          e.target.value
                                        )
                                      }
                                      className="w-full bg-transparent text-[12.5px] text-gray-800 pr-5 py-1 appearance-none outline-none cursor-pointer"
                                    >
                                      <option value=""></option>
                                      {SUPPLIER_DOC_GROUP_OPTIONS.map((opt) => (
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

                                {/* Số hợp đồng */}
                                <td className="py-1 px-2 border-r border-dashed border-gray-200 align-middle">
                                  <input
                                    type="text"
                                    value={docRow.contractNumber}
                                    onChange={(e) =>
                                      handleUpdateDocumentRow(
                                        docRow.id,
                                        'contractNumber',
                                        e.target.value
                                      )
                                    }
                                    className="w-full bg-transparent text-[12.5px] text-gray-800 py-1 outline-none"
                                  />
                                </td>

                                {/* Mô tả */}
                                <td className="py-1 px-2 border-r border-dashed border-gray-200 align-middle">
                                  <input
                                    type="text"
                                    value={docRow.description}
                                    onChange={(e) =>
                                      handleUpdateDocumentRow(
                                        docRow.id,
                                        'description',
                                        e.target.value
                                      )
                                    }
                                    className="w-full bg-transparent text-[12.5px] text-gray-800 py-1 outline-none"
                                  />
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

                                {/* Link */}
                                <td className="py-1 px-2 border-r border-dashed border-gray-200 align-middle">
                                  <input
                                    type="text"
                                    value={docRow.link}
                                    onChange={(e) =>
                                      handleUpdateDocumentRow(
                                        docRow.id,
                                        'link',
                                        e.target.value
                                      )
                                    }
                                    className="w-full bg-transparent text-[12.5px] text-gray-800 py-1 outline-none"
                                  />
                                </td>

                                {/* File tải lên */}
                                <td className="py-1.5 px-2.5 border-r border-dashed border-gray-200 align-middle">
                                  <div className="flex flex-wrap items-center gap-2">
                                    {docRow.files.map((file) => (
                                      <span
                                        key={file.id}
                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-[#1D4ED8] border border-blue-100 text-[11.5px]"
                                      >
                                        <span
                                          className="max-w-[140px] truncate"
                                          title={file.name}
                                        >
                                          {file.name}
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleRemoveRowFile(docRow.id, file.id)
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
                                        handleTriggerRowFileUpload(docRow.id)
                                      }
                                      className="text-[#3B82F6] hover:text-[#1D4ED8] hover:underline text-[12.5px] font-normal cursor-pointer"
                                    >
                                      Nhấn để tải lên
                                    </button>
                                  </div>
                                </td>

                                {/* Hồ sơ hợp đồng button */}
                                <td className="py-1 px-2 border-r border-dashed border-gray-200 text-center align-middle">
                                  <button
                                    type="button"
                                    onClick={() => setDossierRowId(docRow.id)}
                                    className="px-2.5 py-1 bg-white border border-[#3B82F6] text-[#2563EB] hover:bg-blue-50 rounded-[5px] text-[12px] font-medium whitespace-nowrap transition-colors cursor-pointer"
                                  >
                                    Hồ sơ hợp đồng
                                  </button>
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

                    {/* Contract Dossier Quick Modal */}
                    {dossierRowId && (() => {
                      const activeRow = addForm.documents.find(
                        (r) => r.id === dossierRowId
                      );
                      if (!activeRow) return null;
                      return (
                        <div className="fixed inset-0 z-[60] bg-black/30 flex items-center justify-center p-4">
                          <div className="bg-white rounded-lg border border-gray-200 shadow-lg w-full max-w-lg overflow-hidden">
                            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                              <h3 className="text-[15px] font-semibold text-gray-900">
                                Hồ sơ hợp đồng
                              </h3>
                              <button
                                type="button"
                                onClick={() => setDossierRowId(null)}
                                className="p-1 text-gray-500 hover:text-gray-800 rounded cursor-pointer"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="p-4 space-y-3 text-[13px]">
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <span className="text-[12px] text-gray-500 block">
                                    Tên nhóm
                                  </span>
                                  <span className="font-medium text-gray-800">
                                    {activeRow.groupName || '—'}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-[12px] text-gray-500 block">
                                    Số hợp đồng
                                  </span>
                                  <span className="font-medium text-gray-800">
                                    {activeRow.contractNumber || '—'}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-[12px] text-gray-500 block">
                                    Ngày hiệu lực
                                  </span>
                                  <span className="font-medium text-gray-800">
                                    {activeRow.effectiveDate || '—'}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-[12px] text-gray-500 block">
                                    Ngày hết hạn
                                  </span>
                                  <span className="font-medium text-gray-800">
                                    {activeRow.expiryDate || '—'}
                                  </span>
                                </div>
                              </div>

                              <div>
                                <span className="text-[12px] text-gray-500 block mb-1">
                                  Tệp đính kèm ({activeRow.files.length})
                                </span>
                                {activeRow.files.length === 0 ? (
                                  <div className="text-[12.5px] text-gray-400">
                                    Chưa có tệp nào được tải lên.
                                  </div>
                                ) : (
                                  <ul className="divide-y divide-gray-100 border border-gray-200 rounded-[6px]">
                                    {activeRow.files.map((f) => (
                                      <li
                                        key={f.id}
                                        className="px-3 py-1.5 flex items-center justify-between text-[12.5px]"
                                      >
                                        <span className="truncate text-gray-800">
                                          {f.name}
                                        </span>
                                        <span className="text-gray-400 text-[11.5px] shrink-0 ml-2">
                                          {f.size}
                                        </span>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            </div>
                            <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  handleTriggerRowFileUpload(activeRow.id)
                                }
                                className="px-3 py-1.5 bg-white border border-[#3B82F6] text-[#2563EB] hover:bg-blue-50 rounded-[6px] text-[12.5px] font-medium cursor-pointer"
                              >
                                Tải lên tệp
                              </button>
                              <button
                                type="button"
                                onClick={() => setDossierRowId(null)}
                                className="px-3.5 py-1.5 bg-[#1677FF] hover:bg-blue-600 text-white rounded-[6px] text-[12.5px] font-medium cursor-pointer"
                              >
                                Đóng
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
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
              form="category-supplier-add-form"
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
