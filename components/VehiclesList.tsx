import React, { useState, useMemo, useEffect, useRef } from 'react';
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
  Calendar,
  Search,
  Save,
  Check,
} from 'lucide-react';
import { useFirestoreCollection } from '../firebase';
import {
  CategoryCustomersList,
  CategoryCustomerRecord,
  INITIAL_CATEGORY_CUSTOMERS,
} from './CategoryCustomersList';

export interface VehicleDocumentRow {
  id: number;
  docType: string;
  effectiveDate: string;
  expiryDate: string;
  note: string;
  isValid: boolean;
  fileName: string;
}

export interface VehicleRecord {
  id: string;
  plate: string;
  plateColor?: 'Trắng' | 'Vàng' | 'Xanh';
  customerCode: string;
  customerName: string;
  phone: string;
  brand: string;
  model: string;
  vehicleType: string;
  vin: string;
  year: string;
  engineNumber: string;
  displacement: string;
  color?: string;
  payload?: string;
  seats?: string;
  documents?: VehicleDocumentRow[];
}

const CUSTOMERS_STORAGE_KEY = 'category_customers_list_v1';
const VEHICLES_STORAGE_KEY = 'vehicles_list_v1';

const VEHICLE_BRAND_OPTIONS = [
  'Toyota',
  'BMW',
  'Vinfast',
  'GAC',
  'Lexus',
  'Ford',
  'Mercedes',
  'Hino',
  'Volkswagen',
  'Mazda',
  'Hyundai',
  'Kia',
  'Honda',
  'Mitsubishi',
  'Suzuki',
  'Isuzu',
];

const PLATE_COLOR_OPTIONS: Array<'Trắng' | 'Vàng' | 'Xanh'> = [
  'Trắng',
  'Vàng',
  'Xanh',
];

const VEHICLE_BRAND_MODEL_OPTIONS: Array<{ brand: string; model: string }> = [
  { brand: 'Toyota', model: 'Innova' },
  { brand: 'Toyota', model: 'Camry' },
  { brand: 'Toyota', model: 'Fortuner' },
  { brand: 'Toyota', model: 'Vios' },
  { brand: 'Toyota', model: 'Corolla Cross' },
  { brand: 'Toyota', model: 'Veloz Cross' },
  { brand: 'Lexus', model: 'Lx570' },
  { brand: 'Lexus', model: 'RX450' },
  { brand: 'Lexus', model: 'ES250' },
  { brand: 'Mercedes', model: 'Maybach' },
  { brand: 'Mercedes', model: 'C200' },
  { brand: 'Mercedes', model: 'E200' },
  { brand: 'Mercedes', model: 'GLC300' },
  { brand: 'Volkswagen', model: 'Tigion' },
  { brand: 'Vinfast', model: 'VF8' },
  { brand: 'Vinfast', model: 'VF9' },
  { brand: 'Vinfast', model: 'VF5' },
  { brand: 'Vinfast', model: 'VF6' },
  { brand: 'Vinfast', model: 'Lux A2.0' },
  { brand: 'Mazda', model: 'CX-5' },
  { brand: 'Mazda', model: 'Mazda 3' },
  { brand: 'Mazda', model: 'CX-8' },
  { brand: 'Ford', model: 'Ranger' },
  { brand: 'Ford', model: 'Everest' },
  { brand: 'Ford', model: 'Territory' },
  { brand: 'Hyundai', model: 'SantaFe' },
  { brand: 'Hyundai', model: 'Accent' },
  { brand: 'Hyundai', model: 'Tucson' },
  { brand: 'Honda', model: 'City' },
  { brand: 'Honda', model: 'CR-V' },
  { brand: 'Honda', model: 'Civic' },
  { brand: 'Mitsubishi', model: 'Xpander' },
  { brand: 'Mitsubishi', model: 'Outlander' },
  { brand: 'Kia', model: 'Carnival' },
  { brand: 'Kia', model: 'Seltos' },
  { brand: 'BMW', model: '320i' },
  { brand: 'BMW', model: 'X5' },
  { brand: 'GAC', model: 'GS8' },
  { brand: 'GAC', model: 'M8' },
  { brand: 'Hino', model: 'XZU720L' },
  { brand: 'Isuzu', model: 'D-Max' },
  { brand: 'Suzuki', model: 'XL7' },
];

const VEHICLE_TYPE_OPTIONS = [
  '4 Chỗ',
  '5 Chỗ',
  '7 Chỗ',
  'SUV',
  'Sedan',
  'Hatchback',
  'Pickup',
  'MPV',
  'Xe tải',
  'Xe khách',
];

const VEHICLE_DOCUMENT_TYPES = [
  'Đăng ký xe (Cà vẹt)',
  'Giấy đăng kiểm',
  'Bảo hiểm TNDS bắt buộc',
  'Bảo hiểm vật chất xe',
  'Giấy phép kinh doanh vận tải',
  'Khác',
];

export const INITIAL_VEHICLES: VehicleRecord[] = [
  {
    id: 'veh-1',
    plate: '51H11112',
    customerCode: 'KH000018-DM',
    customerName: 'Trần Lâm',
    phone: '',
    brand: 'Toyota',
    model: '',
    vehicleType: '',
    vin: '',
    year: '',
    engineNumber: '',
    displacement: '',
  },
  {
    id: 'veh-2',
    plate: '51H11111',
    customerCode: 'KH000017-DM',
    customerName: 'Nguyễn Lâm',
    phone: '',
    brand: 'Toyota',
    model: 'Innova',
    vehicleType: '',
    vin: '',
    year: '',
    engineNumber: '',
    displacement: '',
  },
  {
    id: 'veh-3',
    plate: '51H22004',
    customerCode: 'KH000016-DM',
    customerName: 'Quy',
    phone: '',
    brand: 'BMW',
    model: '',
    vehicleType: '',
    vin: '',
    year: '',
    engineNumber: '',
    displacement: '',
  },
  {
    id: 'veh-4',
    plate: '2D3S2S23',
    customerCode: 'KH000015-DM',
    customerName: '12s12s1',
    phone: '',
    brand: 'Vinfast',
    model: '',
    vehicleType: '',
    vin: '',
    year: '',
    engineNumber: '',
    displacement: '',
  },
  {
    id: 'veh-5',
    plate: 'A12SE22',
    customerCode: 'KH000014-DM',
    customerName: 'Tester',
    phone: '',
    brand: 'GAC',
    model: '',
    vehicleType: '',
    vin: '',
    year: '',
    engineNumber: '',
    displacement: '',
  },
  {
    id: 'veh-6',
    plate: 'CODETES',
    customerCode: 'KH000013-DM',
    customerName: 'Tester',
    phone: '0973 709 456',
    brand: 'GAC',
    model: '',
    vehicleType: '',
    vin: '',
    year: '',
    engineNumber: '',
    displacement: '',
  },
  {
    id: 'veh-7',
    plate: 'TEST11',
    customerCode: 'KH000011-DM',
    customerName: 'Trường',
    phone: '0116 494 969 8',
    brand: 'Vinfast',
    model: '',
    vehicleType: '',
    vin: '',
    year: '',
    engineNumber: '',
    displacement: '',
  },
  {
    id: 'veh-8',
    plate: '99Z99998',
    customerCode: 'KH000010-DM',
    customerName: 'ZZ Khach thu',
    phone: '0900 000 099',
    brand: 'Toyota',
    model: '',
    vehicleType: '',
    vin: '',
    year: '',
    engineNumber: '',
    displacement: '',
  },
  {
    id: 'veh-9',
    plate: '033685',
    customerCode: 'KH000007-DM',
    customerName: 'Truong T',
    phone: '',
    brand: 'Lexus',
    model: 'Lx570',
    vehicleType: 'Pickup',
    vin: '',
    year: '',
    engineNumber: '',
    displacement: '',
  },
  {
    id: 'veh-10',
    plate: '12IO26113',
    customerCode: 'KH000006-DM',
    customerName: 'Truong',
    phone: '',
    brand: 'Vinfast',
    model: '',
    vehicleType: '',
    vin: '',
    year: '',
    engineNumber: '',
    displacement: '',
  },
  {
    id: 'veh-11',
    plate: '12IO26102',
    customerCode: 'KH000005-DM',
    customerName: 'Truong Test2',
    phone: '0901 234 567',
    brand: 'Ford',
    model: '',
    vehicleType: '',
    vin: '',
    year: '',
    engineNumber: '',
    displacement: '',
  },
  {
    id: 'veh-12',
    plate: '66A99999',
    customerCode: 'KH000004-DM',
    customerName: 'anh Thắng',
    phone: '0358 500 775',
    brand: 'Mercedes',
    model: 'Maybach',
    vehicleType: '7 Chỗ',
    vin: 'KXZ78-UGDEEGGW',
    year: '2020',
    engineNumber: '88463798879',
    displacement: '1.5',
  },
  {
    id: 'veh-13',
    plate: '50G09876',
    customerCode: 'KH000048',
    customerName: 'Trường 2',
    phone: '0973 709 479',
    brand: 'Hino',
    model: '',
    vehicleType: '',
    vin: '',
    year: '',
    engineNumber: '',
    displacement: '',
  },
  {
    id: 'veh-14',
    plate: 'TESTAPP',
    customerCode: 'TESTAPP',
    customerName: 'testapp',
    phone: '',
    brand: '',
    model: '',
    vehicleType: '',
    vin: '',
    year: '12541',
    engineNumber: '',
    displacement: '',
  },
  {
    id: 'veh-15',
    plate: '51K69751',
    customerCode: 'KH000046',
    customerName: 'A Anh',
    phone: '',
    brand: 'LEXUS',
    model: 'RX450',
    vehicleType: 'Pickup',
    vin: '11233',
    year: '2018',
    engineNumber: '009098',
    displacement: '',
  },
  {
    id: 'veh-16',
    plate: '11SU1405',
    customerCode: 'KH000044',
    customerName: 'Tuấn',
    phone: '',
    brand: 'Lexus',
    model: '',
    vehicleType: '',
    vin: '',
    year: '',
    engineNumber: '',
    displacement: '',
  },
  {
    id: 'veh-17',
    plate: '19OB26094',
    customerCode: 'KH000043',
    customerName: 'Trường',
    phone: '0977 379 38',
    brand: 'Volkswagen',
    model: 'Tigion',
    vehicleType: 'SUV',
    vin: '1111',
    year: '2022',
    engineNumber: '23456',
    displacement: '1.5',
  },
];

export const VehiclesList: React.FC = () => {
  const loadInitialVehicles = (): VehicleRecord[] => {
    try {
      const saved = localStorage.getItem(VEHICLES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Ignore storage read errors
    }
    return INITIAL_VEHICLES;
  };

  const [items, setItems] = useFirestoreCollection<VehicleRecord>(
    'vehicles_items',
    loadInitialVehicles,
    'id',
    (syncedItems) => {
      try {
        localStorage.setItem(VEHICLES_STORAGE_KEY, JSON.stringify(syncedItems));
      } catch {
        // Ignore storage write errors
      }
    }
  );
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [plateVinInput, setPlateVinInput] = useState('');
  const [customerInput, setCustomerInput] = useState('');
  const [brandInput, setBrandInput] = useState('');
  const [vehicleTypeInput, setVehicleTypeInput] = useState('');
  const [appliedFilters, setAppliedFilters] = useState({
    plateVin: '',
    customer: '',
    brand: '',
    vehicleType: '',
  });
  const [rowsPerPage, setRowsPerPage] = useState('20');
  const [currentPage, setCurrentPage] = useState(1);

  // Customers loaded from Danh mục > Khách hàng
  const loadCustomers = (): CategoryCustomerRecord[] => {
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

  const [customers, setCustomers] = useState<CategoryCustomerRecord[]>(loadCustomers);

  // Add / Edit Vehicle Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);
  const [isQuickAddCustomerOpen, setIsQuickAddCustomerOpen] = useState(false);
  const [addForm, setAddForm] = useState<{
    plate: string;
    plateColor: 'Trắng' | 'Vàng' | 'Xanh';
    customerCode: string;
    brand: string;
    model: string;
    vehicleType: string;
    vin: string;
    engineNumber: string;
    year: string;
    color: string;
    displacement: string;
    payload: string;
    seats: string;
  }>({
    plate: '',
    plateColor: 'Trắng',
    customerCode: '',
    brand: '',
    model: '',
    vehicleType: '',
    vin: '',
    engineNumber: '',
    year: '',
    color: '',
    displacement: '',
    payload: '',
    seats: '',
  });
  const [customerQuery, setCustomerQuery] = useState('');
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const [modelQuery, setModelQuery] = useState('');
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [lookupStatus, setLookupStatus] = useState<{
    type: 'info' | 'success' | 'error';
    text: string;
    canSave?: boolean;
    savedToGrid?: boolean;
    inspectionDoc?: Omit<VehicleDocumentRow, 'id'>;
  } | null>(null);
  const [docRows, setDocRows] = useState<VehicleDocumentRow[]>([
    {
      id: 1,
      docType: '',
      effectiveDate: '',
      expiryDate: '',
      note: '',
      isValid: false,
      fileName: '',
    },
  ]);
  const [addErrors, setAddErrors] = useState<{
    plate?: string;
    customerCode?: string;
    brand?: string;
  }>({});
  const docFileInputRef = useRef<HTMLInputElement | null>(null);
  const activeUploadRowIdRef = useRef<number | null>(null);
  const customerDropdownRef = useRef<HTMLDivElement | null>(null);
  const modelDropdownRef = useRef<HTMLDivElement | null>(null);

  const editingVehicle = useMemo(
    () => (editingVehicleId ? items.find((i) => i.id === editingVehicleId) || null : null),
    [editingVehicleId, items]
  );

  const selectedCustomer = useMemo(() => {
    const found = customers.find((c) => c.code === addForm.customerCode);
    if (found) return found;
    if (
      editingVehicle &&
      editingVehicle.customerCode === addForm.customerCode &&
      (editingVehicle.customerName || editingVehicle.phone)
    ) {
      return {
        id: editingVehicle.id,
        code: editingVehicle.customerCode,
        name: editingVehicle.customerName,
        phone: editingVehicle.phone,
        email: '',
        cccd: '',
        taxCode: '',
        group: '',
        address: '',
      } as CategoryCustomerRecord;
    }
    return null;
  }, [customers, addForm.customerCode, editingVehicle]);

  const filteredCustomerOptions = useMemo(() => {
    const q = customerQuery.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.code.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q)
    );
  }, [customers, customerQuery]);

  const brandOptions = useMemo(() => {
    const merged = new Set([...VEHICLE_BRAND_OPTIONS]);
    items.forEach((i) => {
      if (i.brand.trim()) merged.add(i.brand.trim());
    });
    return Array.from(merged);
  }, [items]);

  const brandModelOptions = useMemo(() => {
    const seen = new Set<string>();
    const list: Array<{ brand: string; model: string }> = [];
    const pushUnique = (brand: string, model: string) => {
      const b = brand.trim();
      const m = model.trim();
      if (!m) return;
      const key = `${b.toLowerCase()}|${m.toLowerCase()}`;
      if (!seen.has(key)) {
        seen.add(key);
        list.push({ brand: b, model: m });
      }
    };
    VEHICLE_BRAND_MODEL_OPTIONS.forEach((opt) => pushUnique(opt.brand, opt.model));
    items.forEach((i) => {
      if (i.model.trim()) {
        pushUnique(i.brand.trim() || 'Khác', i.model.trim());
      }
    });
    return list;
  }, [items]);

  const filteredBrandModelOptions = useMemo(() => {
    const q = modelQuery.trim().toLowerCase();
    if (!q) return brandModelOptions;
    return brandModelOptions.filter((opt) => {
      const combined = `${opt.brand} - ${opt.model}`.toLowerCase();
      return (
        opt.brand.toLowerCase().includes(q) ||
        opt.model.toLowerCase().includes(q) ||
        combined.includes(q)
      );
    });
  }, [brandModelOptions, modelQuery]);

  const vehicleTypeOptions = useMemo(() => {
    const merged = new Set([...VEHICLE_TYPE_OPTIONS]);
    items.forEach((i) => {
      if (i.vehicleType.trim()) merged.add(i.vehicleType.trim());
    });
    return Array.from(merged);
  }, [items]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        customerDropdownRef.current &&
        !customerDropdownRef.current.contains(e.target as Node)
      ) {
        setIsCustomerDropdownOpen(false);
      }
      if (
        modelDropdownRef.current &&
        !modelDropdownRef.current.contains(e.target as Node)
      ) {
        setIsModelDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const resetAddForm = (customerList: CategoryCustomerRecord[]) => {
    const defaultCustomer = customerList[0] || null;
    setAddForm({
      plate: '',
      plateColor: 'Trắng',
      customerCode: defaultCustomer?.code || '',
      brand: '',
      model: '',
      vehicleType: '',
      vin: '',
      engineNumber: '',
      year: '',
      color: '',
      displacement: '',
      payload: '',
      seats: '',
    });
    setCustomerQuery(
      defaultCustomer
        ? defaultCustomer.name
          ? `${defaultCustomer.code} - ${defaultCustomer.name}`
          : defaultCustomer.code
        : ''
    );
    setIsCustomerDropdownOpen(false);
    setModelQuery('');
    setIsModelDropdownOpen(false);
    setLookupStatus(null);
    setDocRows([
      {
        id: Date.now(),
        docType: '',
        effectiveDate: '',
        expiryDate: '',
        note: '',
        isValid: false,
        fileName: '',
      },
    ]);
    setAddErrors({});
  };

  const handleOpenAddModal = () => {
    const latestCustomers = loadCustomers();
    setCustomers(latestCustomers);
    setEditingVehicleId(null);
    resetAddForm(latestCustomers);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (vehicle: VehicleRecord) => {
    const latestCustomers = loadCustomers();
    setCustomers(latestCustomers);
    setEditingVehicleId(vehicle.id);

    const matchedCust = latestCustomers.find(
      (c) => c.code === vehicle.customerCode
    );
    const displayCustomerQuery = matchedCust
      ? matchedCust.name
        ? `${matchedCust.code} - ${matchedCust.name}`
        : matchedCust.code
      : vehicle.customerCode
        ? vehicle.customerName
          ? `${vehicle.customerCode} - ${vehicle.customerName}`
          : vehicle.customerCode
        : vehicle.customerName || '';

    setAddForm({
      plate: vehicle.plate || '',
      plateColor: vehicle.plateColor || 'Trắng',
      customerCode: vehicle.customerCode || '',
      brand: vehicle.brand || '',
      model: vehicle.model || '',
      vehicleType: vehicle.vehicleType || '',
      vin: vehicle.vin || '',
      engineNumber: vehicle.engineNumber || '',
      year: vehicle.year || '',
      color: vehicle.color || '',
      displacement: vehicle.displacement || '',
      payload: vehicle.payload || '',
      seats: vehicle.seats || '',
    });
    setCustomerQuery(displayCustomerQuery);
    setIsCustomerDropdownOpen(false);
    setModelQuery(
      vehicle.model
        ? vehicle.brand
          ? `${vehicle.brand} - ${vehicle.model}`
          : vehicle.model
        : ''
    );
    setIsModelDropdownOpen(false);
    setLookupStatus(null);
    setDocRows(
      vehicle.documents && vehicle.documents.length > 0
        ? vehicle.documents.map((d, idx) => ({
            ...d,
            id: d.id || Date.now() + idx,
          }))
        : [
            {
              id: Date.now(),
              docType: '',
              effectiveDate: '',
              expiryDate: '',
              note: '',
              isValid: false,
              fileName: '',
            },
          ]
    );
    setAddErrors({});
    setIsAddModalOpen(true);
  };

  const formatDateDDMMYYYY = (date: Date) => {
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  const handleLookupInspection = () => {
    const rawPlate = addForm.plate.trim().toUpperCase();
    const normalizedPlate = rawPlate.replace(/[\s.-]/g, '');
    const normalizedVin = addForm.vin.trim().toUpperCase();

    const matched = items.find((v) => {
      const p = v.plate.trim().toUpperCase().replace(/[\s.-]/g, '');
      const vin = v.vin.trim().toUpperCase();
      return (
        (normalizedPlate && p === normalizedPlate) ||
        (normalizedVin && vin && vin === normalizedVin)
      );
    });

    if (!matched && (!normalizedPlate || !normalizedVin)) {
      setLookupStatus({
        type: 'error',
        text: 'Vui lòng nhập đầy đủ Biển số và Số khung để tra cứu đăng kiểm xe.',
        canSave: false,
      });
      return;
    }

    const plateDisplay = matched?.plate || rawPlate;
    const vinDisplay = matched?.vin || normalizedVin;
    const engineSuffix = (vinDisplay || plateDisplay).slice(-6) || '884637';

    const resolvedEngine = matched?.engineNumber || `ENG${engineSuffix}`;
    const resolvedYear = matched?.year || '2023';
    const resolvedColor = matched?.color || 'Trắng';
    const resolvedDisplacement = matched?.displacement || '1.5';
    const resolvedPayload = matched?.payload || '550 kg';
    const resolvedSeats =
      matched?.seats ||
      (matched?.vehicleType?.includes('7') ? '7' : '5');

    setAddForm((prev) => ({
      ...prev,
      plate: prev.plate.trim() || plateDisplay,
      vin: prev.vin.trim() || vinDisplay,
      brand: matched?.brand || prev.brand,
      model: matched?.model || prev.model,
      vehicleType: matched?.vehicleType || prev.vehicleType,
      engineNumber: resolvedEngine,
      year: resolvedYear,
      color: resolvedColor,
      displacement: resolvedDisplacement,
      payload: resolvedPayload,
      seats: resolvedSeats,
    }));

    if (matched?.model) {
      setModelQuery(
        matched.brand ? `${matched.brand} - ${matched.model}` : matched.model
      );
    }

    const today = new Date();
    const nextYear = new Date(today);
    nextYear.setFullYear(today.getFullYear() + 1);

    const safeFilePlate = (plateDisplay || vinDisplay).replace(/[^A-Z0-9]/g, '');

    setLookupStatus({
      type: 'success',
      text: `Đã tra cứu thành công Giấy Đăng kiểm xe điện tử cho xe ${plateDisplay} (Biển ${addForm.plateColor}).`,
      canSave: true,
      savedToGrid: false,
      inspectionDoc: {
        docType: 'Giấy đăng kiểm',
        effectiveDate: formatDateDDMMYYYY(today),
        expiryDate: formatDateDDMMYYYY(nextYear),
        note: `Đăng kiểm điện tử - ${plateDisplay} (Biển ${addForm.plateColor}${
          vinDisplay ? `, SK: ${vinDisplay}` : ''
        })`,
        isValid: true,
        fileName: `DangKiemDienTu_${safeFilePlate}.pdf`,
      },
    });
  };

  const handleSaveElectronicInspection = () => {
    if (!lookupStatus?.canSave || !lookupStatus.inspectionDoc || lookupStatus.savedToGrid) {
      return;
    }

    const newRow: VehicleDocumentRow = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      ...lookupStatus.inspectionDoc,
    };

    setDocRows((prev) => {
      if (
        prev.length === 1 &&
        !prev[0].docType &&
        !prev[0].effectiveDate &&
        !prev[0].expiryDate &&
        !prev[0].note &&
        !prev[0].fileName &&
        !prev[0].isValid
      ) {
        return [newRow];
      }
      return [...prev, newRow];
    });

    setLookupStatus((prev) =>
      prev ? { ...prev, savedToGrid: true } : prev
    );
  };

  const handleAddDocRow = () => {
    setDocRows((prev) => [
      ...prev,
      {
        id: Date.now() + Math.floor(Math.random() * 1000),
        docType: '',
        effectiveDate: '',
        expiryDate: '',
        note: '',
        isValid: false,
        fileName: '',
      },
    ]);
  };

  const handleRemoveDocRow = (id: number) => {
    setDocRows((prev) => prev.filter((row) => row.id !== id));
  };

  const handleClearAllDocRows = () => {
    setDocRows([]);
  };

  const handleUpdateDocRow = (
    id: number,
    patch: Partial<VehicleDocumentRow>
  ) => {
    setDocRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, ...patch } : row))
    );
  };

  const handleTriggerFileUpload = (rowId: number) => {
    activeUploadRowIdRef.current = rowId;
    docFileInputRef.current?.click();
  };

  const handleDocFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const rowId = activeUploadRowIdRef.current;
    if (file && rowId !== null) {
      handleUpdateDocRow(rowId, { fileName: file.name });
    }
    e.target.value = '';
    activeUploadRowIdRef.current = null;
  };

  useEffect(() => {
    if (!isAddModalOpen || isQuickAddCustomerOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        handleAddDocRow();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAddModalOpen, isQuickAddCustomerOpen]);

  const handleSaveVehicle = (keepOpen: boolean) => {
    const errors: { plate?: string; customerCode?: string; brand?: string } = {};
    if (!addForm.plate.trim()) {
      errors.plate = 'Vui lòng nhập Biển số.';
    }

    if (Object.keys(errors).length > 0) {
      setAddErrors(errors);
      return;
    }

    // Resolve customer even if user typed code/name/phone without clicking dropdown item
    const qCustomer = customerQuery.trim().toLowerCase();
    const resolvedCustomer =
      selectedCustomer ||
      (qCustomer
        ? customers.find(
            (c) =>
              c.code.toLowerCase() === qCustomer ||
              c.name.toLowerCase() === qCustomer ||
              c.phone.toLowerCase() === qCustomer ||
              `${c.code} - ${c.name}`.toLowerCase() === qCustomer
          ) || null
        : null);

    // Resolve brand/model smoothly if user typed "Brand - Model" or a known model
    let resolvedBrand = addForm.brand.trim();
    let resolvedModel = addForm.model.trim();
    if (!resolvedBrand && modelQuery.trim()) {
      const rawModel = modelQuery.trim();
      if (rawModel.includes(' - ')) {
        const [bPart, ...mParts] = rawModel.split(' - ');
        resolvedBrand = bPart.trim();
        resolvedModel = mParts.join(' - ').trim() || resolvedModel;
      } else {
        const matchedPair = brandModelOptions.find(
          (opt) => opt.model.toLowerCase() === rawModel.toLowerCase()
        );
        if (matchedPair) {
          resolvedBrand = matchedPair.brand;
          resolvedModel = matchedPair.model;
        }
      }
    }

    const savedVehicle: VehicleRecord = {
      id: editingVehicleId || `veh-${Date.now()}`,
      plate: addForm.plate.trim().toUpperCase(),
      plateColor: addForm.plateColor,
      customerCode:
        resolvedCustomer?.code ||
        addForm.customerCode.trim() ||
        customerQuery.trim(),
      customerName: resolvedCustomer?.name || '',
      phone: resolvedCustomer?.phone || '',
      brand: resolvedBrand,
      model: resolvedModel,
      vehicleType: addForm.vehicleType.trim(),
      vin: addForm.vin.trim(),
      year: addForm.year.trim(),
      engineNumber: addForm.engineNumber.trim(),
      displacement: addForm.displacement.trim(),
      color: addForm.color.trim(),
      payload: addForm.payload.trim(),
      seats: addForm.seats.trim(),
      documents: docRows.filter(
        (r) =>
          r.docType ||
          r.effectiveDate ||
          r.expiryDate ||
          r.note ||
          r.fileName
      ),
    };

    setItems((prev) => {
      const next = editingVehicleId
        ? prev.map((item) => (item.id === editingVehicleId ? savedVehicle : item))
        : [savedVehicle, ...prev];
      try {
        localStorage.setItem(VEHICLES_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore storage write errors
      }
      return next;
    });

    // Clear active filters if any when adding a new vehicle so it is immediately visible
    if (
      !editingVehicleId &&
      (appliedFilters.plateVin ||
        appliedFilters.customer ||
        appliedFilters.brand ||
        appliedFilters.vehicleType)
    ) {
      setPlateVinInput('');
      setCustomerInput('');
      setBrandInput('');
      setVehicleTypeInput('');
      setAppliedFilters({
        plateVin: '',
        customer: '',
        brand: '',
        vehicleType: '',
      });
    }
    if (!editingVehicleId) {
      setCurrentPage(1);
    }
    setAddErrors({});

    if (keepOpen) {
      setEditingVehicleId(null);
      resetAddForm(customers);
    } else {
      setEditingVehicleId(null);
      setIsAddModalOpen(false);
    }
  };

  const uniqueCustomers = useMemo(() => {
    const map = new Map<string, string>();
    items.forEach((item) => {
      if (item.customerCode) {
        map.set(item.customerCode, item.customerName);
      }
    });
    return Array.from(map.entries());
  }, [items]);

  const uniqueBrands = useMemo(() => {
    return Array.from(
      new Set(items.map((i) => i.brand).filter((b) => b.trim() !== ''))
    );
  }, [items]);

  const uniqueVehicleTypes = useMemo(() => {
    return Array.from(
      new Set(items.map((i) => i.vehicleType).filter((t) => t.trim() !== ''))
    );
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (appliedFilters.plateVin.trim()) {
        const q = appliedFilters.plateVin.trim().toLowerCase();
        const matchPlate = item.plate.toLowerCase().includes(q);
        const matchVin = item.vin.toLowerCase().includes(q);
        if (!matchPlate && !matchVin) return false;
      }
      if (
        appliedFilters.customer &&
        item.customerCode !== appliedFilters.customer
      ) {
        return false;
      }
      if (appliedFilters.brand && item.brand !== appliedFilters.brand) {
        return false;
      }
      if (
        appliedFilters.vehicleType &&
        item.vehicleType !== appliedFilters.vehicleType
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

  const handleFilter = () => {
    setAppliedFilters({
      plateVin: plateVinInput,
      customer: customerInput,
      brand: brandInput,
      vehicleType: vehicleTypeInput,
    });
  };

  const handleReset = () => {
    setPlateVinInput('');
    setCustomerInput('');
    setBrandInput('');
    setVehicleTypeInput('');
    setAppliedFilters({
      plateVin: '',
      customer: '',
      brand: '',
      vehicleType: '',
    });
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
        {/* Filter Bar */}
        <div className="px-3 pt-2.5 pb-3 border-b border-gray-200 flex items-end justify-between bg-white shrink-0">
          <div className="flex items-center gap-3 flex-wrap">
            <div>
              <label className="block text-[12px] font-semibold text-gray-800 mb-1">
                Biển số, số VIN
              </label>
              <input
                type="text"
                value={plateVinInput}
                onChange={(e) => setPlateVinInput(e.target.value)}
                placeholder="Tìm biển số, số VIN"
                className="w-[190px] border border-gray-200 rounded-[6px] px-3 py-1.5 text-[13px] text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-gray-800 mb-1">
                Khách hàng
              </label>
              <div className="relative w-[170px]">
                <select
                  value={customerInput}
                  onChange={(e) => setCustomerInput(e.target.value)}
                  className={`w-full border border-gray-200 rounded-[6px] py-1.5 pl-3 pr-8 text-[13px] appearance-none bg-white focus:outline-none focus:border-blue-500 ${
                    customerInput ? 'text-gray-700' : 'text-gray-400'
                  }`}
                >
                  <option value="">Chọn khách ...</option>
                  {uniqueCustomers.map(([code, name]) => (
                    <option key={code} value={code}>
                      {code} {name ? `- ${name}` : ''}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-gray-800 mb-1">
                Hiệu xe
              </label>
              <div className="relative w-[165px]">
                <select
                  value={brandInput}
                  onChange={(e) => setBrandInput(e.target.value)}
                  className={`w-full border border-gray-200 rounded-[6px] py-1.5 pl-3 pr-8 text-[13px] appearance-none bg-white focus:outline-none focus:border-blue-500 ${
                    brandInput ? 'text-gray-700' : 'text-gray-400'
                  }`}
                >
                  <option value="">Chọn hiệu xe</option>
                  {uniqueBrands.map((brand) => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-gray-800 mb-1">
                Loại xe
              </label>
              <div className="relative w-[165px]">
                <select
                  value={vehicleTypeInput}
                  onChange={(e) => setVehicleTypeInput(e.target.value)}
                  className={`w-full border border-gray-200 rounded-[6px] py-1.5 pl-3 pr-8 text-[13px] appearance-none bg-white focus:outline-none focus:border-blue-500 ${
                    vehicleTypeInput ? 'text-gray-700' : 'text-gray-400'
                  }`}
                >
                  <option value="">Chọn loại xe</option>
                  {uniqueVehicleTypes.map((vType) => (
                    <option key={vType} value={vType}>
                      {vType}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
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
          <table className="w-full border-collapse text-[13px] table-fixed min-w-[1250px]">
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
                <th className="w-[105px] py-2.5 px-3 border-r border-b border-gray-200 text-left">
                  Màu biển
                </th>
                <th className="w-[140px] py-2.5 px-3 border-r border-b border-gray-200 text-left">
                  Biển số
                </th>
                <th className="w-[145px] py-2.5 px-3 border-r border-b border-gray-200 text-left">
                  Hiệu xe
                </th>
                <th className="w-[145px] py-2.5 px-3 border-r border-b border-gray-200 text-left">
                  Dòng xe
                </th>
                <th className="w-[145px] py-2.5 px-3 border-r border-b border-gray-200 text-left">
                  Loại xe
                </th>
                <th className="w-[165px] py-2.5 px-3 border-r border-b border-gray-200 text-left">
                  Số khung
                </th>
                <th className="w-[140px] py-2.5 px-3 border-r border-b border-gray-200 text-right">
                  Năm
                </th>
                <th className="w-[145px] py-2.5 px-3 border-r border-b border-gray-200 text-left">
                  Số máy
                </th>
                <th className="w-[120px] py-2.5 px-3 border-b border-gray-200 text-left">
                  Dung tích
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((row) => {
                const isSelected = selectedIds.includes(row.id);
                const plateColor = row.plateColor || 'Trắng';
                const plateColorBadgeClass =
                  plateColor === 'Vàng'
                    ? 'bg-[#FEF08A] text-[#713F12] border-[#EAB308]'
                    : plateColor === 'Xanh'
                      ? 'bg-[#2563EB] text-white border-[#1D4ED8]'
                      : 'bg-white text-gray-700 border-gray-300';
                return (
                  <tr
                    key={row.id}
                    onClick={() => handleOpenEditModal(row)}
                    className={`border-b border-gray-200 hover:bg-blue-50/40 transition-colors cursor-pointer ${
                      isSelected ? 'bg-blue-50/40' : 'bg-white'
                    }`}
                  >
                    <td
                      onClick={(e) => e.stopPropagation()}
                      className="py-2.5 px-2 border-r border-gray-200 text-center"
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleRow(row.id)}
                        className="w-3.5 h-3.5 rounded border-gray-300 cursor-pointer accent-[#1677FF]"
                      />
                    </td>
                    <td className="py-2.5 px-3 border-r border-gray-200 text-gray-800 truncate">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-[5px] border text-[11.5px] font-medium leading-tight ${plateColorBadgeClass}`}
                      >
                        {plateColor}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 border-r border-gray-200 text-gray-800 truncate">
                      {row.plate}
                    </td>
                    <td className="py-2.5 px-3 border-r border-gray-200 text-gray-800 truncate">
                      {row.brand}
                    </td>
                    <td className="py-2.5 px-3 border-r border-gray-200 text-gray-800 truncate">
                      {row.model}
                    </td>
                    <td className="py-2.5 px-3 border-r border-gray-200 text-gray-800 truncate">
                      {row.vehicleType}
                    </td>
                    <td className="py-2.5 px-3 border-r border-gray-200 text-gray-800 truncate">
                      {row.vin}
                    </td>
                    <td className="py-2.5 px-3 border-r border-gray-200 text-right text-gray-800 truncate">
                      {row.year}
                    </td>
                    <td className="py-2.5 px-3 border-r border-gray-200 text-gray-800 truncate">
                      {row.engineNumber}
                    </td>
                    <td className="py-2.5 px-3 text-gray-800 truncate">
                      {row.displacement}
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

          {[1, 2, 3, 4, 5].map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => setCurrentPage(page)}
              className={`w-7 h-7 flex items-center justify-center rounded-[6px] text-[12px] font-medium transition-colors cursor-pointer ${
                currentPage === page
                  ? 'border border-[#1677FF] text-[#1677FF] bg-white font-semibold'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {page}
            </button>
          ))}

          <span className="px-1.5 text-gray-400">...</span>

          <button
            type="button"
            onClick={() => setCurrentPage(35)}
            className={`w-7 h-7 flex items-center justify-center rounded-[6px] text-[12px] font-medium transition-colors cursor-pointer ${
              currentPage === 35
                ? 'border border-[#1677FF] text-[#1677FF] bg-white font-semibold'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            35
          </button>

          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(35, p + 1))}
            className="w-7 h-7 flex items-center justify-center rounded-[6px] text-gray-600 hover:bg-gray-100 cursor-pointer border border-gray-200"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setCurrentPage(35)}
            className="w-7 h-7 flex items-center justify-center rounded-[6px] text-gray-600 hover:bg-gray-100 cursor-pointer border border-gray-200"
          >
            <ChevronsRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="border border-gray-200 rounded-[6px] px-3 py-1 bg-white text-[12px] text-gray-600">
          Hiển thị <strong className="font-semibold text-gray-800">1–20</strong> /{' '}
          <strong className="font-semibold text-gray-800">692</strong> kết quả
        </div>
      </div>

      {/* Hidden File Input for Vehicle Document Upload */}
      <input
        ref={docFileInputRef}
        type="file"
        className="hidden"
        onChange={handleDocFileChange}
      />

      {/* Add Vehicle Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/45 flex items-center justify-center p-4 select-text">
          <div className="bg-[#F5F7FA] rounded-[14px] border border-gray-200 shadow-2xl w-full max-w-[1200px] max-h-[92vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-5 pt-3.5 pb-2.5 flex items-center justify-between shrink-0">
              <h3 className="text-[15px] font-semibold text-[#1E293B]">
                {editingVehicleId ? 'Chỉnh sửa xe' : 'xe'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setEditingVehicleId(null);
                  setIsAddModalOpen(false);
                }}
                className="w-8 h-8 rounded-full bg-white border border-gray-200 hover:bg-gray-50 flex items-center justify-center text-gray-500 hover:text-gray-800 shadow-xs transition-colors cursor-pointer"
                title="Đóng"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Scrollable Form Body */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveVehicle(false);
              }}
              className="flex-1 flex flex-col min-h-0"
            >
              <div className="flex-1 overflow-y-auto px-4 pb-3 space-y-3">
                {/* 2-Column Main Area: Left (Vehicle) | Right (Customer) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
                  {/* LEFT COLUMN: Màu biển, Biển số, Số khung, Tra cứu Đăng kiểm xe | Dòng xe, Hãng xe, Loại xe | Remaining Vehicle Specs */}
                  <div className="lg:col-span-8 bg-white rounded-[10px] border border-gray-200/80 shadow-xs p-4 space-y-3.5">
                    {/* Row 1: Màu biển | Biển số * | Số khung | Tra cứu Đăng kiểm xe */}
                    <div className="grid grid-cols-1 sm:grid-cols-[174px_1fr_1fr_auto] gap-2.5 items-start">
                      {/* Màu biển (single-select buttons before Biển số) */}
                      <div>
                        <label className="block text-[12.5px] font-medium text-[#1E293B] mb-1.5">
                          Màu biển
                        </label>
                        <div className="grid grid-cols-3 gap-1">
                          {PLATE_COLOR_OPTIONS.map((colorOption) => {
                            const isSelected = addForm.plateColor === colorOption;
                            const activeStyles =
                              colorOption === 'Trắng'
                                ? 'bg-white border-[#2563EB] text-[#1E293B] ring-2 ring-[#2563EB]/20 font-semibold'
                                : colorOption === 'Vàng'
                                  ? 'bg-[#FEF08A] border-[#CA8A04] text-[#713F12] ring-2 ring-[#FACC15]/40 font-semibold'
                                  : 'bg-[#2563EB] border-[#1D4ED8] text-white ring-2 ring-[#2563EB]/25 font-semibold';
                            const inactiveStyles =
                              colorOption === 'Trắng'
                                ? 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                                : colorOption === 'Vàng'
                                  ? 'bg-[#FEF9C3]/60 border-gray-200 text-[#854D0E] hover:border-[#EAB308]'
                                  : 'bg-[#EFF6FF] border-gray-200 text-[#1D4ED8] hover:border-[#60A5FA]';

                            return (
                              <button
                                key={colorOption}
                                type="button"
                                onClick={() =>
                                  setAddForm((prev) => ({
                                    ...prev,
                                    plateColor: colorOption,
                                  }))
                                }
                                className={`h-[38px] rounded-[8px] border text-[12px] transition-all cursor-pointer flex items-center justify-center ${
                                  isSelected ? activeStyles : inactiveStyles
                                }`}
                              >
                                {colorOption}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Biển số * */}
                      <div>
                        <label className="block text-[12.5px] font-medium text-[#1E293B] mb-1.5">
                          Biển số <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          autoFocus
                          value={addForm.plate}
                          onChange={(e) => {
                            setAddForm({ ...addForm, plate: e.target.value });
                            if (addErrors.plate) {
                              setAddErrors((prev) => ({ ...prev, plate: undefined }));
                            }
                            if (lookupStatus) setLookupStatus(null);
                          }}
                          placeholder="Ví dụ: 51F06615"
                          className={`w-full h-[38px] bg-white border rounded-[8px] px-3 text-[13px] text-gray-800 placeholder-gray-400 focus:outline-none transition-shadow ${
                            addErrors.plate
                              ? 'border-red-500 focus:ring-2 focus:ring-red-200'
                              : 'border-[#2563EB]/70 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20'
                          }`}
                        />
                        {addErrors.plate && (
                          <p className="mt-1 text-[11.5px] text-red-500">
                            {addErrors.plate}
                          </p>
                        )}
                      </div>

                      {/* Số khung (directly after Biển số) */}
                      <div>
                        <label className="block text-[12.5px] font-medium text-[#1E293B] mb-1.5">
                          Số khung
                        </label>
                        <input
                          type="text"
                          value={addForm.vin}
                          onChange={(e) => {
                            setAddForm({ ...addForm, vin: e.target.value });
                            if (lookupStatus) setLookupStatus(null);
                          }}
                          placeholder="Nhập số khung"
                          className="w-full h-[38px] bg-white border border-gray-200 rounded-[8px] px-3 text-[13px] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
                        />
                      </div>

                      {/* Tra cứu Đăng kiểm xe */}
                      <div>
                        <label className="block text-[12.5px] font-medium mb-1.5 invisible select-none">
                          &nbsp;
                        </label>
                        <button
                          type="button"
                          onClick={handleLookupInspection}
                          className="w-full h-[38px] px-3 bg-white hover:bg-[#EFF6FF] border border-[#2563EB] text-[#2563EB] rounded-[8px] text-[12.5px] font-medium inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                        >
                          <Search className="w-3.5 h-3.5 shrink-0" />
                          <span>Tra cứu Đăng kiểm xe</span>
                        </button>
                      </div>
                    </div>

                    {lookupStatus && (
                      <div
                        className={`text-[12px] px-3 py-2 rounded-[6px] border flex items-center justify-between gap-3 flex-wrap ${
                          lookupStatus.type === 'success'
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                            : lookupStatus.type === 'error'
                              ? 'bg-red-50 border-red-200 text-red-600'
                              : 'bg-blue-50 border-blue-200 text-blue-700'
                        }`}
                      >
                        <span className="flex-1 min-w-[200px]">
                          {lookupStatus.text}
                        </span>
                        {lookupStatus.canSave && (
                          <button
                            type="button"
                            disabled={lookupStatus.savedToGrid}
                            onClick={handleSaveElectronicInspection}
                            className={`shrink-0 px-3 py-1.5 rounded-[6px] text-[12px] font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                              lookupStatus.savedToGrid
                                ? 'bg-emerald-100 text-emerald-700 border border-emerald-300 cursor-default'
                                : 'bg-[#2563EB] hover:bg-blue-700 text-white shadow-xs cursor-pointer'
                            }`}
                          >
                            {lookupStatus.savedToGrid ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Đã lưu Đăng kiểm điện tử</span>
                              </>
                            ) : (
                              <>
                                <Save className="w-3.5 h-3.5" />
                                <span>Lưu Đăng kiểm điện tử</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    )}

                    {/* Row 2: Dòng xe | Hãng xe * | Loại xe */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
                      {/* Dòng xe (searchable: Hãng xe - Dòng xe on 1 line) */}
                      <div className="sm:col-span-5" ref={modelDropdownRef}>
                        <label className="block text-[12.5px] font-medium text-[#1E293B] mb-1.5">
                          Dòng xe
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={modelQuery}
                            onFocus={() => setIsModelDropdownOpen(true)}
                            onChange={(e) => {
                              const val = e.target.value;
                              setModelQuery(val);
                              setIsModelDropdownOpen(true);
                              const trimmed = val.trim();
                              const matchedOpt = brandModelOptions.find(
                                (opt) =>
                                  `${opt.brand} - ${opt.model}`.toLowerCase() ===
                                  trimmed.toLowerCase()
                              );
                              if (matchedOpt) {
                                setAddForm((prev) => ({
                                  ...prev,
                                  brand: matchedOpt.brand,
                                  model: matchedOpt.model,
                                }));
                                if (addErrors.brand) {
                                  setAddErrors((prev) => ({
                                    ...prev,
                                    brand: undefined,
                                  }));
                                }
                              } else {
                                setAddForm((prev) => ({
                                  ...prev,
                                  model: trimmed,
                                }));
                              }
                            }}
                            placeholder="Gõ tìm Hãng xe - Dòng xe..."
                            className="w-full h-[38px] bg-white border border-gray-200 rounded-[8px] pl-3 pr-8 text-[13px] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
                          />
                          {modelQuery ? (
                            <button
                              type="button"
                              onClick={() => {
                                setModelQuery('');
                                setAddForm((prev) => ({ ...prev, model: '' }));
                                setIsModelDropdownOpen(true);
                              }}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                              title="Xóa"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          )}

                          {isModelDropdownOpen && (
                            <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-white border border-gray-200 rounded-[8px] shadow-lg overflow-hidden">
                              <div className="max-h-52 overflow-y-auto divide-y divide-gray-100">
                                {filteredBrandModelOptions.length > 0 ? (
                                  filteredBrandModelOptions.map((opt) => {
                                    const label = `${opt.brand} - ${opt.model}`;
                                    const isSelected =
                                      addForm.brand.toLowerCase() ===
                                        opt.brand.toLowerCase() &&
                                      addForm.model.toLowerCase() ===
                                        opt.model.toLowerCase();
                                    return (
                                      <button
                                        key={label}
                                        type="button"
                                        onClick={() => {
                                          setAddForm((prev) => ({
                                            ...prev,
                                            brand: opt.brand,
                                            model: opt.model,
                                          }));
                                          setModelQuery(label);
                                          setIsModelDropdownOpen(false);
                                          if (addErrors.brand) {
                                            setAddErrors((prev) => ({
                                              ...prev,
                                              brand: undefined,
                                            }));
                                          }
                                        }}
                                        className={`w-full text-left px-3 py-2 text-[12.5px] truncate transition-colors cursor-pointer ${
                                          isSelected
                                            ? 'bg-blue-50 text-[#2563EB] font-medium'
                                            : 'hover:bg-gray-50 text-gray-800'
                                        }`}
                                      >
                                        <span className="font-semibold">
                                          {opt.brand}
                                        </span>
                                        <span className="text-gray-400 mx-1.5">-</span>
                                        <span>{opt.model}</span>
                                      </button>
                                    );
                                  })
                                ) : (
                                  <div className="px-3 py-2.5 text-[12px] text-gray-500 text-center">
                                    Không tìm thấy dòng xe phù hợp
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Hãng xe * (directly after Dòng xe) */}
                      <div className="sm:col-span-4">
                        <label className="block text-[12.5px] font-medium text-[#1E293B] mb-1.5">
                          Hãng xe <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <select
                            value={addForm.brand}
                            onChange={(e) => {
                              setAddForm({ ...addForm, brand: e.target.value });
                              if (addErrors.brand) {
                                setAddErrors((prev) => ({
                                  ...prev,
                                  brand: undefined,
                                }));
                              }
                            }}
                            className={`w-full h-[38px] bg-white border rounded-[8px] pl-3 pr-8 text-[13px] text-gray-800 appearance-none focus:outline-none cursor-pointer ${
                              addErrors.brand
                                ? 'border-red-500 focus:ring-2 focus:ring-red-200'
                                : 'border-gray-200 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20'
                            }`}
                          >
                            <option value=""></option>
                            {brandOptions.map((b) => (
                              <option key={b} value={b}>
                                {b}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="w-4 h-4 text-gray-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                        {addErrors.brand && (
                          <p className="mt-1 text-[11.5px] text-red-500">
                            {addErrors.brand}
                          </p>
                        )}
                      </div>

                      {/* Loại xe (after Hãng xe) */}
                      <div className="sm:col-span-3">
                        <label className="block text-[12.5px] font-medium text-[#1E293B] mb-1.5">
                          Loại xe
                        </label>
                        <div className="relative">
                          <select
                            value={addForm.vehicleType}
                            onChange={(e) =>
                              setAddForm({
                                ...addForm,
                                vehicleType: e.target.value,
                              })
                            }
                            className="w-full h-[38px] bg-white border border-gray-200 rounded-[8px] pl-3 pr-8 text-[13px] text-gray-800 appearance-none focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 cursor-pointer"
                          >
                            <option value=""></option>
                            {vehicleTypeOptions.map((t) => (
                              <option key={t} value={t}>
                                {t}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="w-4 h-4 text-gray-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    {/* Dashed Box: Dữ liệu từ Giấy Đăng kiểm xe điện tử (all read-only) */}
                    <div className="border border-dashed border-[#2563EB]/70 rounded-[8px] px-4 py-3.5 bg-white">
                      <div className="text-[12.5px] font-semibold text-[#1D4ED8] mb-3">
                        Dữ liệu từ Giấy Đăng kiểm xe điện tử
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-3.5 gap-y-3">
                        <div>
                          <label className="block text-[12.5px] font-medium text-[#1E293B] mb-1">
                            Số máy
                          </label>
                          <input
                            type="text"
                            readOnly
                            value={addForm.engineNumber}
                            placeholder="--"
                            className="w-full bg-[#F8FAFC] border border-gray-200 rounded-[8px] px-3 py-2 text-[13px] text-gray-700 placeholder-gray-400 cursor-default focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[12.5px] font-medium text-[#1E293B] mb-1">
                            Năm sản xuất
                          </label>
                          <input
                            type="text"
                            readOnly
                            value={addForm.year}
                            placeholder="--"
                            className="w-full bg-[#F8FAFC] border border-gray-200 rounded-[8px] px-3 py-2 text-[13px] text-gray-700 placeholder-gray-400 cursor-default focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[12.5px] font-medium text-[#1E293B] mb-1">
                            Màu xe
                          </label>
                          <input
                            type="text"
                            readOnly
                            value={addForm.color}
                            placeholder="--"
                            className="w-full bg-[#F8FAFC] border border-gray-200 rounded-[8px] px-3 py-2 text-[13px] text-gray-700 placeholder-gray-400 cursor-default focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[12.5px] font-medium text-[#1E293B] mb-1">
                            Dung tích
                          </label>
                          <input
                            type="text"
                            readOnly
                            value={addForm.displacement}
                            placeholder="--"
                            className="w-full bg-[#F8FAFC] border border-gray-200 rounded-[8px] px-3 py-2 text-[13px] text-gray-700 placeholder-gray-400 cursor-default focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[12.5px] font-medium text-[#1E293B] mb-1">
                            Trọng tải
                          </label>
                          <input
                            type="text"
                            readOnly
                            value={addForm.payload}
                            placeholder="--"
                            className="w-full bg-[#F8FAFC] border border-gray-200 rounded-[8px] px-3 py-2 text-[13px] text-gray-700 placeholder-gray-400 cursor-default focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[12.5px] font-medium text-[#1E293B] mb-1">
                            Số chỗ ngồi
                          </label>
                          <input
                            type="text"
                            readOnly
                            value={addForm.seats}
                            placeholder="--"
                            className="w-full bg-[#F8FAFC] border border-gray-200 rounded-[8px] px-3 py-2 text-[13px] text-gray-700 placeholder-gray-400 cursor-default focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT COLUMN: Khách hàng + Thông tin khách hàng */}
                  <div className="lg:col-span-4 bg-white rounded-[10px] border border-gray-200/80 shadow-xs p-4 flex flex-col gap-3.5">
                    {/* Khách hàng * (searchable with Thêm nhanh inside the field) */}
                    <div ref={customerDropdownRef}>
                      <label className="block text-[12.5px] font-medium text-[#1E293B] mb-1.5">
                        Khách hàng <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div
                          className={`w-full h-[38px] bg-white border rounded-[8px] flex items-center pl-3 pr-1 gap-1.5 transition-shadow ${
                            addErrors.customerCode
                              ? 'border-red-500 focus-within:ring-2 focus-within:ring-red-200'
                              : 'border-gray-200 focus-within:border-[#2563EB] focus-within:ring-2 focus-within:ring-[#2563EB]/20'
                          }`}
                        >
                          <input
                            type="text"
                            value={customerQuery}
                            onFocus={() => setIsCustomerDropdownOpen(true)}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCustomerQuery(val);
                              setIsCustomerDropdownOpen(true);
                              if (!val.trim()) {
                                setAddForm((prev) => ({
                                  ...prev,
                                  customerCode: '',
                                }));
                              } else {
                                const exact = customers.find(
                                  (c) =>
                                    c.code.toLowerCase() === val.trim().toLowerCase() ||
                                    `${c.code} - ${c.name}`.toLowerCase() ===
                                      val.trim().toLowerCase()
                                );
                                setAddForm((prev) => ({
                                  ...prev,
                                  customerCode: exact ? exact.code : '',
                                }));
                              }
                              if (addErrors.customerCode) {
                                setAddErrors((prev) => ({
                                  ...prev,
                                  customerCode: undefined,
                                }));
                              }
                            }}
                            placeholder="Tìm mã, tên, SĐT..."
                            className="flex-1 min-w-0 h-full bg-transparent text-[13px] text-gray-800 placeholder-gray-400 focus:outline-none"
                          />
                          {customerQuery && (
                            <button
                              type="button"
                              onClick={() => {
                                setCustomerQuery('');
                                setAddForm((prev) => ({
                                  ...prev,
                                  customerCode: '',
                                }));
                                setIsCustomerDropdownOpen(true);
                              }}
                              className="text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer shrink-0"
                              title="Xóa"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setIsCustomerDropdownOpen(false);
                              setIsQuickAddCustomerOpen(true);
                            }}
                            className="h-[28px] shrink-0 px-2 bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#2563EB] rounded-[6px] text-[12px] font-medium inline-flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
                            title="Thêm nhanh khách hàng"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Thêm nhanh</span>
                          </button>
                        </div>

                        {isCustomerDropdownOpen && (
                          <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-white border border-gray-200 rounded-[8px] shadow-lg overflow-hidden">
                            <div className="max-h-52 overflow-y-auto divide-y divide-gray-100">
                              {filteredCustomerOptions.length > 0 ? (
                                filteredCustomerOptions.map((c) => {
                                  const isSelected = addForm.customerCode === c.code;
                                  return (
                                    <button
                                      key={c.id}
                                      type="button"
                                      onClick={() => {
                                        setAddForm((prev) => ({
                                          ...prev,
                                          customerCode: c.code,
                                        }));
                                        setCustomerQuery(
                                          c.name ? `${c.code} - ${c.name}` : c.code
                                        );
                                        setIsCustomerDropdownOpen(false);
                                        if (addErrors.customerCode) {
                                          setAddErrors((prev) => ({
                                            ...prev,
                                            customerCode: undefined,
                                          }));
                                        }
                                      }}
                                      className={`w-full text-left px-3 py-2 text-[12.5px] transition-colors cursor-pointer flex items-center justify-between gap-2 ${
                                        isSelected
                                          ? 'bg-blue-50 text-[#2563EB]'
                                          : 'hover:bg-gray-50 text-gray-800'
                                      }`}
                                    >
                                      <span className="truncate">
                                        <strong className="font-semibold">
                                          {c.code}
                                        </strong>
                                        {c.name ? ` - ${c.name}` : ''}
                                      </span>
                                      {c.phone && (
                                        <span className="text-[11.5px] text-gray-500 shrink-0">
                                          {c.phone}
                                        </span>
                                      )}
                                    </button>
                                  );
                                })
                              ) : (
                                <div className="px-3 py-2.5 text-[12px] text-gray-500 text-center">
                                  Không tìm thấy khách hàng phù hợp
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      {addErrors.customerCode && (
                        <p className="mt-1 text-[11.5px] text-red-500">
                          {addErrors.customerCode}
                        </p>
                      )}
                    </div>

                    {/* Dashed Box: Customer Summary Info */}
                    <div className="flex-1 border border-dashed border-[#2563EB]/70 rounded-[8px] px-4 py-3.5 bg-white">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3.5">
                        <div className="sm:col-span-2">
                          <div className="text-[12px] text-[#64748B]">
                            Tên khách hàng
                          </div>
                          <div className="text-[13px] font-medium text-[#1E293B] mt-0.5 break-words">
                            {selectedCustomer?.name || '--'}
                          </div>
                        </div>

                        <div>
                          <div className="text-[12px] text-[#64748B]">
                            Điện thoại
                          </div>
                          <div className="text-[13px] font-medium text-[#1E293B] mt-0.5 break-words">
                            {selectedCustomer?.phone || '--'}
                          </div>
                        </div>

                        <div>
                          <div className="text-[12px] text-[#64748B]">Email</div>
                          <div className="text-[13px] font-medium text-[#1E293B] mt-0.5 break-words">
                            {selectedCustomer?.email || '--'}
                          </div>
                        </div>

                        <div>
                          <div className="text-[12px] text-[#64748B]">CCCD</div>
                          <div className="text-[13px] font-medium text-[#1E293B] mt-0.5 break-words">
                            {selectedCustomer?.cccd || '--'}
                          </div>
                        </div>

                        <div>
                          <div className="text-[12px] text-[#64748B]">
                            Mã số thuế
                          </div>
                          <div className="text-[13px] font-medium text-[#1E293B] mt-0.5 break-words">
                            {selectedCustomer?.taxCode || '--'}
                          </div>
                        </div>

                        <div className="sm:col-span-2">
                          <div className="text-[12px] text-[#64748B]">Địa chỉ</div>
                          <div className="text-[13px] font-medium text-[#1E293B] mt-0.5 break-words">
                            {selectedCustomer?.address || '--'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Documents Grid Card (Full-width evenly distributed) */}
                <div className="bg-white rounded-[10px] border border-gray-200/80 shadow-xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full table-fixed border-collapse text-[12.5px] min-w-[820px]">
                      <thead className="bg-[#F3F6FA] border-b border-gray-200">
                        <tr className="text-[#1E293B] font-semibold">
                          <th className="w-[38px] py-2 px-1.5 border-r border-gray-200/80"></th>
                          <th className="w-[44px] py-2 px-2 border-r border-gray-200/80 text-center">
                            #
                          </th>
                          <th className="w-[20%] py-2 px-2.5 border-r border-gray-200/80 text-left">
                            Loại giấy tờ
                          </th>
                          <th className="w-[17%] py-2 px-2.5 border-r border-gray-200/80 text-left">
                            Ngày hiệu lực
                          </th>
                          <th className="w-[17%] py-2 px-2.5 border-r border-gray-200/80 text-left">
                            Ngày hết hạn
                          </th>
                          <th className="w-[20%] py-2 px-2.5 border-r border-gray-200/80 text-left">
                            Ghi chú
                          </th>
                          <th className="w-[12%] py-2 px-2 border-r border-gray-200/80 text-center whitespace-nowrap">
                            Còn hiệu lực
                          </th>
                          <th className="w-[14%] py-2 px-2.5 text-left whitespace-nowrap">
                            Tệp lưu trữ
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {docRows.map((row, idx) => (
                          <tr
                            key={row.id}
                            className="border-b border-dashed border-gray-200 hover:bg-gray-50/40"
                          >
                            <td className="py-1.5 px-1.5 border-r border-dashed border-gray-200 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveDocRow(row.id)}
                                className="text-gray-300 hover:text-red-500 p-0.5 rounded transition-colors cursor-pointer"
                                title="Xóa dòng"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </td>
                            <td className="py-1.5 px-2 border-r border-dashed border-gray-200 text-center text-gray-700">
                              {idx + 1}
                            </td>
                            <td className="py-1 px-1.5 border-r border-dashed border-gray-200">
                              <div className="relative">
                                <select
                                  value={row.docType}
                                  onChange={(e) =>
                                    handleUpdateDocRow(row.id, {
                                      docType: e.target.value,
                                    })
                                  }
                                  className="w-full bg-transparent text-[12.5px] text-gray-800 pr-5 py-1 appearance-none focus:outline-none cursor-pointer"
                                >
                                  <option value=""></option>
                                  {VEHICLE_DOCUMENT_TYPES.map((dt) => (
                                    <option key={dt} value={dt}>
                                      {dt}
                                    </option>
                                  ))}
                                </select>
                                <ChevronDown className="w-3.5 h-3.5 text-gray-500 absolute right-0.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                              </div>
                            </td>
                            <td className="py-1 px-2 border-r border-dashed border-gray-200">
                              <div className="relative flex items-center">
                                <input
                                  type="text"
                                  value={row.effectiveDate}
                                  onChange={(e) =>
                                    handleUpdateDocRow(row.id, {
                                      effectiveDate: e.target.value,
                                    })
                                  }
                                  placeholder="DD/ MM/ YYYY"
                                  className="w-full bg-transparent text-[12.5px] text-gray-800 placeholder-gray-400 pr-6 py-1 focus:outline-none"
                                />
                                <Calendar className="w-3.5 h-3.5 text-gray-500 absolute right-0.5 pointer-events-none" />
                              </div>
                            </td>
                            <td className="py-1 px-2 border-r border-dashed border-gray-200">
                              <div className="relative flex items-center">
                                <input
                                  type="text"
                                  value={row.expiryDate}
                                  onChange={(e) =>
                                    handleUpdateDocRow(row.id, {
                                      expiryDate: e.target.value,
                                    })
                                  }
                                  placeholder="DD/ MM/ YYYY"
                                  className="w-full bg-transparent text-[12.5px] text-gray-800 placeholder-gray-400 pr-6 py-1 focus:outline-none"
                                />
                                <Calendar className="w-3.5 h-3.5 text-gray-500 absolute right-0.5 pointer-events-none" />
                              </div>
                            </td>
                            <td className="py-1 px-2 border-r border-dashed border-gray-200">
                              <input
                                type="text"
                                value={row.note}
                                onChange={(e) =>
                                  handleUpdateDocRow(row.id, {
                                    note: e.target.value,
                                  })
                                }
                                className="w-full bg-transparent text-[12.5px] text-gray-800 py-1 focus:outline-none"
                              />
                            </td>
                            <td className="py-1.5 px-2 border-r border-dashed border-gray-200 text-center">
                              <input
                                type="checkbox"
                                checked={row.isValid}
                                onChange={(e) =>
                                  handleUpdateDocRow(row.id, {
                                    isValid: e.target.checked,
                                  })
                                }
                                className="w-3.5 h-3.5 rounded border-gray-300 accent-[#2563EB] cursor-pointer"
                              />
                            </td>
                            <td className="py-1.5 px-2.5 whitespace-nowrap">
                              {row.fileName ? (
                                <div className="inline-flex items-center gap-1 max-w-[115px]">
                                  <span
                                    className="text-[12px] text-[#2563EB] truncate"
                                    title={row.fileName}
                                  >
                                    {row.fileName}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleUpdateDocRow(row.id, {
                                        fileName: '',
                                      })
                                    }
                                    className="text-gray-400 hover:text-red-500 shrink-0 cursor-pointer"
                                    title="Gỡ tệp"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleTriggerFileUpload(row.id)}
                                  className="text-[12.5px] text-[#2563EB] hover:underline cursor-pointer"
                                >
                                  Nhấn để tải lên
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}

                        {/* Inline Quick-Add Row */}
                        <tr
                          onClick={handleAddDocRow}
                          className="border-b border-gray-200 hover:bg-blue-50/30 transition-colors cursor-pointer"
                        >
                          <td className="py-2 px-1.5 border-r border-dashed border-gray-200"></td>
                          <td
                            colSpan={7}
                            className="py-2 px-3 text-[12px] italic text-gray-400"
                          >
                            + Bấm vào đây để thêm dòng mới
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Grid Bottom Toolbar */}
                  <div className="px-3 py-2.5 bg-white border-t border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={handleAddDocRow}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#F3F4F6] hover:bg-gray-200 text-[#1E293B] text-[12.5px] font-medium transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Thêm dòng (F2)</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleClearAllDocRows}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-[6px] text-[#DC2626] hover:bg-red-50 text-[12.5px] font-medium transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Xóa tất cả</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      className="text-gray-500 hover:text-gray-700 p-1 rounded-full cursor-pointer"
                      title="Nhấn F2 hoặc bấm vào dòng trống để thêm giấy tờ xe"
                    >
                      <HelpCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="px-5 py-3 bg-[#F5F7FA] flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setEditingVehicleId(null);
                    setIsAddModalOpen(false);
                  }}
                  className="px-4 py-2 text-[13.5px] font-medium text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveVehicle(true)}
                  className="px-5 py-2 bg-white border border-[#93C5FD] hover:bg-blue-50 text-[#2563EB] rounded-[8px] text-[13.5px] font-medium transition-colors cursor-pointer"
                >
                  Lưu &amp; thêm
                </button>
                <button
                  type="submit"
                  className="px-8 py-2 bg-[#2563EB] hover:bg-blue-700 text-white rounded-[8px] text-[13.5px] font-medium transition-colors shadow-xs cursor-pointer"
                >
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick-Add Customer Modal (Danh mục > Khách hàng > Thêm) */}
      {isQuickAddCustomerOpen && (
        <CategoryCustomersList
          modalOnly
          onCloseModal={() => setIsQuickAddCustomerOpen(false)}
          onCustomerAdded={(newCustomer) => {
            setCustomers((prev) => [
              newCustomer,
              ...prev.filter((c) => c.id !== newCustomer.id),
            ]);
            setAddForm((prev) => ({
              ...prev,
              customerCode: newCustomer.code,
            }));
            setCustomerQuery(
              newCustomer.name
                ? `${newCustomer.code} - ${newCustomer.name}`
                : newCustomer.code
            );
            if (addErrors.customerCode) {
              setAddErrors((prev) => ({ ...prev, customerCode: undefined }));
            }
          }}
        />
      )}
    </div>
  );
};
