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
} from 'lucide-react';
import {
  CategoryCustomerRecord,
  INITIAL_CATEGORY_CUSTOMERS,
} from './CategoryCustomersList';

export interface CategoryDriverRecord {
  id: string;
  customer: string;
  driverName: string;
  phone: string;
  email: string;
  address: string;
}

const STORAGE_KEY = 'category_drivers_v1';
const CUSTOMERS_STORAGE_KEY = 'category_customers_list_v1';

const normalizePhone = (value: string): string =>
  value.replace(/[\s.\-()]/g, '').trim();

const loadCategoryCustomers = (): CategoryCustomerRecord[] => {
  try {
    const saved = localStorage.getItem(CUSTOMERS_STORAGE_KEY);
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
};

const SEED_PAGE_ONE_DRIVERS: Omit<CategoryDriverRecord, 'id'>[] = [
  {
    customer: '111111',
    driverName: '111111',
    phone: '',
    email: '',
    address: '',
  },
  {
    customer: '123456',
    driverName: '123456',
    phone: '',
    email: '',
    address: '',
  },
  {
    customer: '12s12s1',
    driverName: '12s12s1',
    phone: '',
    email: '',
    address: '',
  },
  {
    customer: '29A 13919 - Anh Tam - Audi Q7',
    driverName: '29A 13919 - Anh Tam - Audi Q7',
    phone: '0776 703 978',
    email: '',
    address: '',
  },
  {
    customer: 'Anh Khánh',
    driverName: '29A 36960 - Anh Khánh - Ford Fiesta',
    phone: '0949 233 690',
    email: '',
    address: '',
  },
  {
    customer: '29H 12719 - Anh Phong - Mitsubishi Triton',
    driverName: '29H 12719 - Anh Phong - Mitsubishi Triton',
    phone: '0973 088 989',
    email: '',
    address: '',
  },
  {
    customer: '',
    driverName: '33223333',
    phone: '',
    email: '',
    address: '',
  },
  {
    customer: '38E 00195 - Anh Huy - Hyundai i10',
    driverName: '38E 00195 - Anh Huy - Hyundai i10',
    phone: '0932 403 109',
    email: '',
    address: '',
  },
  {
    customer: 'A Vĩnh Trang - MITSUBISHI XPANDER',
    driverName: '50H 50935 - A Vĩnh Trang - MITSUBISHI XPANDER',
    phone: '0903 705 240',
    email: '',
    address: '',
  },
  {
    customer: '51F 28833',
    driverName: '51F 28833',
    phone: '',
    email: '',
    address: '',
  },
  {
    customer: '51G 12922 - Nguyễn Văn Huấn - TOYOTA VIOS',
    driverName: '51G 12922 - Nguyễn Văn Huấn - TOYOTA VIOS',
    phone: '0972 990 069',
    email: '',
    address: '',
  },
  {
    customer: '',
    driverName: '51K 35941 - A Tùng - MERCEDES GLC 200',
    phone: '0908 358 359',
    email: '',
    address: 'Thành phố Hồ Chí Minh',
  },
  {
    customer: '51L 29020',
    driverName: '51L 29020',
    phone: '',
    email: '',
    address: '',
  },
  {
    customer: '51M 26788',
    driverName: '51M 26788',
    phone: '',
    email: '',
    address: '',
  },
  {
    customer: '51M 72600',
    driverName: '51M 72600',
    phone: '',
    email: '',
    address: '',
  },
  {
    customer: '51M 99938',
    driverName: '51M 99938',
    phone: '',
    email: '',
    address: 'Thành phố Hồ Chí Minh',
  },
  {
    customer: '61LD 00368',
    driverName: '61LD 00368',
    phone: '',
    email: '',
    address: '',
  },
  {
    customer: '66A 06907 - Anh Ten - Mercedes GLC 200',
    driverName: '66A 06907 - Anh Ten - Mercedes GLC 200',
    phone: '0932 129 979',
    email: '',
    address: '',
  },
  {
    customer: '72A 10051',
    driverName: '72A 10051',
    phone: '',
    email: '',
    address: '',
  },
  {
    customer: '72A 45812 - Anh Minh - Toyota Fortuner',
    driverName: '72A 45812 - Anh Minh - Toyota Fortuner',
    phone: '0918 452 781',
    email: '',
    address: 'Thành phố Hồ Chí Minh',
  },
];

const EXTRA_PLATES = [
  '51H', '51K', '51G', '51F', '51A', '29A', '30E', '30G', '60A', '61A', '62A', '65A', '72A', '79A', '43A',
];
const EXTRA_NAMES = [
  'Anh Tuấn', 'Anh Hùng', 'Anh Nam', 'Chị Lan', 'Anh Long', 'Anh Hải', 'Anh Dũng',
  'Nguyễn Văn An', 'Trần Minh Quân', 'Lê Hoàng Phúc', 'Phạm Quốc Bảo', 'Võ Thanh Sơn',
  'Anh Bình', 'Anh Sơn', 'Anh Cường', 'Anh Thành', 'Chị Hương', 'Anh Đạt',
];
const EXTRA_CARS = [
  'Toyota Vios', 'Toyota Innova', 'Hyundai Accent', 'Hyundai SantaFe', 'Honda City',
  'Honda CR-V', 'Mazda CX-5', 'Ford Ranger', 'Kia Seltos', 'Mitsubishi Xpander',
  'Mercedes GLC 200', 'VinFast VF8', 'Suzuki XL7',
];
const EXTRA_ADDRESSES = [
  'Thành phố Hồ Chí Minh',
  '',
  '',
  'Bình Dương',
  'Đồng Nai',
  '',
  'Hà Nội',
  '',
];
const EXTRA_PREFIXES = ['0903', '0908', '0918', '0932', '0938', '0972', '0989', '0776', '0949'];

function buildInitialDrivers(): CategoryDriverRecord[] {
  const list: CategoryDriverRecord[] = SEED_PAGE_ONE_DRIVERS.map((item, idx) => ({
    id: `drv-${idx + 1}`,
    ...item,
  }));

  const targetTotal = 387;
  for (let i = list.length; i < targetTotal; i++) {
    const platePrefix = EXTRA_PLATES[i % EXTRA_PLATES.length];
    const plateNum = String(10120 + ((i * 733) % 89000)).padStart(5, '0');
    const name = EXTRA_NAMES[i % EXTRA_NAMES.length];
    const car = EXTRA_CARS[i % EXTRA_CARS.length];
    const hasDetails = i % 3 !== 0;
    const label = hasDetails ? `${platePrefix} ${plateNum} - ${name} - ${car}` : `${platePrefix} ${plateNum}`;
    const phonePrefix = EXTRA_PREFIXES[i % EXTRA_PREFIXES.length];
    const p1 = String(100 + ((i * 37) % 900)).padStart(3, '0');
    const p2 = String(100 + ((i * 53) % 900)).padStart(3, '0');
    const phone = hasDetails ? `${phonePrefix} ${p1} ${p2}` : '';
    const address = EXTRA_ADDRESSES[i % EXTRA_ADDRESSES.length];

    list.push({
      id: `drv-${i + 1}`,
      customer: i % 7 === 0 ? '' : i % 5 === 0 ? name : label,
      driverName: label,
      phone,
      email: '',
      address,
    });
  }

  return list;
}

export const INITIAL_CATEGORY_DRIVERS: CategoryDriverRecord[] = buildInitialDrivers();

function getPaginationItems(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, idx) => idx + 1);
  }
  if (current <= 4) {
    return [1, 2, 3, 4, 5, 'ellipsis', total];
  }
  if (current >= total - 3) {
    return [1, 'ellipsis', total - 4, total - 3, total - 2, total - 1, total];
  }
  return [1, 'ellipsis', current - 1, current, current + 1, 'ellipsis', total];
}

export const CategoryDriversList: React.FC = () => {
  const [items, setItems] = useState<CategoryDriverRecord[]>(() => {
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
    return INITIAL_CATEGORY_DRIVERS;
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

  // Customers from Danh mục > Khách hàng
  const [customers, setCustomers] = useState<CategoryCustomerRecord[]>(loadCategoryCustomers);

  // Add / Edit modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formCustomer, setFormCustomer] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const [formDriverName, setFormDriverName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [customerError, setCustomerError] = useState('');
  const [driverNameError, setDriverNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const customerDropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        customerDropdownRef.current &&
        !customerDropdownRef.current.contains(event.target as Node)
      ) {
        setIsCustomerDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCustomers = useMemo(() => {
    const q = customerSearch.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        (c.name || '').toLowerCase().includes(q) ||
        (c.code || '').toLowerCase().includes(q) ||
        (c.phone || '').toLowerCase().includes(q)
    );
  }, [customers, customerSearch]);

  const findDuplicatePhoneDriver = (
    phoneValue: string,
    excludeId: string | null
  ): CategoryDriverRecord | null => {
    const normalized = normalizePhone(phoneValue);
    if (!normalized) return null;
    return (
      items.find(
        (item) =>
          item.id !== excludeId &&
          item.phone &&
          normalizePhone(item.phone) === normalized
      ) || null
    );
  };

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.customer.toLowerCase().includes(q) ||
        item.driverName.toLowerCase().includes(q) ||
        item.phone.toLowerCase().includes(q) ||
        item.email.toLowerCase().includes(q) ||
        item.address.toLowerCase().includes(q)
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
    const headers = ['Khách hàng', 'Tên tài xế', 'Số điện thoại', 'Email', 'Địa chỉ'];
    const escapeCsv = (val: string) => `"${(val || '').replace(/"/g, '""')}"`;
    const rows = filteredItems.map((row) => [
      escapeCsv(row.customer),
      escapeCsv(row.driverName),
      escapeCsv(row.phone),
      escapeCsv(row.email),
      escapeCsv(row.address),
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([new Uint8Array([0xef, 0xbb, 0xbf]), csvContent], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'tai_xe.csv');
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
      const imported: CategoryDriverRecord[] = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map((c) => c.replace(/^"|"$/g, '').trim());
        if (cols[0] || cols[1]) {
          imported.push({
            id: `drv-imp-${Date.now()}-${i}`,
            customer: cols[0] || '',
            driverName: cols[1] || cols[0] || '',
            phone: cols[2] || '',
            email: cols[3] || '',
            address: cols[4] || '',
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
    setCustomers(loadCategoryCustomers());
    setEditingId(null);
    setFormCustomer('');
    setCustomerSearch('');
    setIsCustomerDropdownOpen(false);
    setFormDriverName('');
    setFormPhone('');
    setFormEmail('');
    setFormAddress('');
    setCustomerError('');
    setDriverNameError('');
    setPhoneError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (row: CategoryDriverRecord) => {
    setCustomers(loadCategoryCustomers());
    setEditingId(row.id);
    setFormCustomer(row.customer);
    setCustomerSearch(row.customer);
    setIsCustomerDropdownOpen(false);
    setFormDriverName(row.driverName);
    setFormPhone(row.phone);
    setFormEmail(row.email);
    setFormAddress(row.address);
    setCustomerError('');
    setDriverNameError('');
    setPhoneError('');
    setIsModalOpen(true);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedCustomer = formCustomer.trim();
    const trimmedDriverName = formDriverName.trim();
    const trimmedPhone = formPhone.trim();

    let hasError = false;

    if (!trimmedCustomer) {
      setCustomerError('Vui lòng chọn Khách hàng.');
      hasError = true;
    } else {
      setCustomerError('');
    }

    if (!trimmedDriverName) {
      setDriverNameError('Vui lòng nhập Tên tài xế.');
      hasError = true;
    } else {
      setDriverNameError('');
    }

    if (!trimmedPhone) {
      setPhoneError('Vui lòng nhập Số điện thoại.');
      hasError = true;
    } else {
      const duplicateDriver = findDuplicatePhoneDriver(trimmedPhone, editingId);
      if (duplicateDriver) {
        setPhoneError(
          `Số điện thoại "${trimmedPhone}" đã tồn tại trong danh sách Tài xế.`
        );
        hasError = true;
      } else {
        setPhoneError('');
      }
    }

    if (hasError) return;

    if (editingId) {
      setItems((prev) =>
        prev.map((item) =>
          item.id === editingId
            ? {
                ...item,
                customer: trimmedCustomer,
                driverName: trimmedDriverName,
                phone: trimmedPhone,
                email: formEmail.trim(),
                address: formAddress.trim(),
              }
            : item
        )
      );
    } else {
      const newRecord: CategoryDriverRecord = {
        id: `drv-${Date.now()}`,
        customer: trimmedCustomer,
        driverName: trimmedDriverName,
        phone: trimmedPhone,
        email: formEmail.trim(),
        address: formAddress.trim(),
      };
      setItems((prev) => [newRecord, ...prev]);
      setCurrentPage(1);
    }
    setIsModalOpen(false);
  };

  const paginationItems = useMemo(
    () => getPaginationItems(safeCurrentPage, totalPages),
    [safeCurrentPage, totalPages]
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
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Tìm tên, điện thoại, email"
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
        <table className="w-full border-collapse text-[13px] table-fixed min-w-[1160px]">
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
              <th className="w-[210px] py-2.5 px-3 border-r border-b border-gray-200 text-left">
                Khách hàng
              </th>
              <th className="w-[210px] py-2.5 px-3 border-r border-b border-gray-200 text-left">
                Tên tài xế
              </th>
              <th className="w-[210px] py-2.5 px-3 border-r border-b border-gray-200 text-left">
                Số điện thoại
              </th>
              <th className="w-[210px] py-2.5 px-3 border-r border-b border-gray-200 text-left">
                Email
              </th>
              <th className="w-[310px] py-2.5 px-3 border-r border-b border-gray-200 text-left">
                Địa chỉ
              </th>
              <th className="py-2.5 px-3 border-b border-gray-200"></th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
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
                    <td className="py-2.5 px-3 border-r border-gray-100 text-gray-800 align-middle whitespace-normal break-words leading-snug">
                      {row.customer}
                    </td>
                    <td className="py-2.5 px-3 border-r border-gray-100 text-gray-800 align-middle whitespace-normal break-words leading-snug">
                      {row.driverName}
                    </td>
                    <td className="py-2.5 px-3 border-r border-gray-100 text-gray-800 align-middle whitespace-nowrap">
                      {row.phone}
                    </td>
                    <td className="py-2.5 px-3 border-r border-gray-100 text-gray-800 align-middle whitespace-normal break-words">
                      {row.email}
                    </td>
                    <td className="py-2.5 px-3 border-r border-gray-100 text-gray-800 align-middle whitespace-normal break-words leading-snug">
                      {row.address}
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

          {paginationItems.map((item, idx) =>
            item === 'ellipsis' ? (
              <span
                key={`ellipsis-${idx}`}
                className="w-7 h-7 flex items-center justify-center text-gray-400 text-[12px]"
              >
                ...
              </span>
            ) : (
              <button
                key={item}
                type="button"
                onClick={() => setCurrentPage(item)}
                className={`w-7 h-7 flex items-center justify-center rounded-[6px] text-[12px] font-medium transition-colors cursor-pointer ${
                  safeCurrentPage === item
                    ? 'border border-[#1677FF] text-[#1677FF] bg-[#EFF6FF] font-semibold'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {item}
              </button>
            )
          )}

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

      {/* Add / Edit Driver Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 select-text">
          <div className="bg-white rounded-lg border border-gray-200 shadow-xl w-full max-w-[480px] overflow-visible">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-[#F8FAFC] rounded-t-lg">
              <h2 className="text-[15px] font-semibold text-gray-800">
                {editingId ? 'Chỉnh sửa tài xế' : 'Thêm tài xế'}
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
              <div ref={customerDropdownRef} className="relative">
                <label className="block text-[12.5px] font-medium text-gray-700 mb-1">
                  Khách hàng <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={customerSearch}
                    onFocus={() => setIsCustomerDropdownOpen(true)}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCustomerSearch(val);
                      setIsCustomerDropdownOpen(true);
                      if (val !== formCustomer) {
                        setFormCustomer('');
                      }
                      if (customerError) setCustomerError('');
                    }}
                    placeholder="Chọn khách hàng"
                    className={`w-full border rounded-[6px] pl-3 pr-8 py-1.5 text-[13px] text-gray-800 focus:outline-none ${
                      customerError
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:border-[#1677FF]'
                    }`}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setIsCustomerDropdownOpen((prev) => !prev)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>

                {isCustomerDropdownOpen && (
                  <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-[6px] shadow-lg max-h-[220px] overflow-y-auto z-50">
                    {filteredCustomers.length === 0 ? (
                      <div className="px-3 py-2.5 text-[12.5px] text-gray-400 text-center">
                        Không tìm thấy khách hàng phù hợp
                      </div>
                    ) : (
                      filteredCustomers.map((customer) => {
                        const displayValue = customer.name || customer.code;
                        const isSelected = formCustomer === displayValue;
                        return (
                          <button
                            key={customer.id}
                            type="button"
                            onClick={() => {
                              setFormCustomer(displayValue);
                              setCustomerSearch(displayValue);
                              setCustomerError('');
                              setIsCustomerDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 text-[13px] hover:bg-[#EFF6FF] transition-colors flex flex-col cursor-pointer ${
                              isSelected ? 'bg-[#EFF6FF] text-[#1677FF] font-medium' : 'text-gray-800'
                            }`}
                          >
                            <span className="truncate">{displayValue}</span>
                            {(customer.code || customer.phone) && (
                              <span className="text-[11.5px] text-gray-500 truncate">
                                {[customer.code, customer.phone].filter(Boolean).join(' • ')}
                              </span>
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>
                )}

                {customerError && (
                  <p className="text-[12px] text-red-500 mt-1">{customerError}</p>
                )}
              </div>

              <div>
                <label className="block text-[12.5px] font-medium text-gray-700 mb-1">
                  Tên tài xế <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formDriverName}
                  onChange={(e) => {
                    setFormDriverName(e.target.value);
                    if (driverNameError) setDriverNameError('');
                  }}
                  placeholder="Nhập tên tài xế"
                  className={`w-full border rounded-[6px] px-3 py-1.5 text-[13px] text-gray-800 focus:outline-none ${
                    driverNameError
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:border-[#1677FF]'
                  }`}
                />
                {driverNameError && (
                  <p className="text-[12px] text-red-500 mt-1">{driverNameError}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12.5px] font-medium text-gray-700 mb-1">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormPhone(val);
                      const dup = findDuplicatePhoneDriver(val, editingId);
                      if (dup) {
                        setPhoneError(
                          `Số điện thoại "${val.trim()}" đã tồn tại trong danh sách Tài xế.`
                        );
                      } else if (phoneError) {
                        setPhoneError('');
                      }
                    }}
                    placeholder="Nhập số điện thoại"
                    className={`w-full border rounded-[6px] px-3 py-1.5 text-[13px] text-gray-800 focus:outline-none ${
                      phoneError
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:border-[#1677FF]'
                    }`}
                  />
                  {phoneError && (
                    <p className="text-[12px] text-red-500 mt-1">{phoneError}</p>
                  )}
                </div>
                <div>
                  <label className="block text-[12.5px] font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="Nhập email"
                    className="w-full border border-gray-300 rounded-[6px] px-3 py-1.5 text-[13px] text-gray-800 focus:outline-none focus:border-[#1677FF]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12.5px] font-medium text-gray-700 mb-1">
                  Địa chỉ
                </label>
                <input
                  type="text"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  placeholder="Nhập địa chỉ"
                  className="w-full border border-gray-300 rounded-[6px] px-3 py-1.5 text-[13px] text-gray-800 focus:outline-none focus:border-[#1677FF]"
                />
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
                  className="px-4 py-1.5 rounded-[6px] bg-[#1677FF] hover:bg-blue-600 text-white text-[13px] font-medium cursor-pointer"
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
