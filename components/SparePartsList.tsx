import React, { useState, useMemo } from 'react';
import {
  Download,
  Trash2,
  Settings,
  Filter,
  FilterX,
  ChevronDown,
  FilePlus2,
  Check,
  X,
  Pencil,
  Camera,
  Plus,
} from 'lucide-react';
import { useFirestoreCollection } from '../firebase';

export interface SparePartRecord {
  id: string;
  code: string;
  name: string;
  invoiceName: string;
  unit: string;
  costPrice: string;
  priceBeforeVat: string;
  vatRate: string;
  priceWithVat: string;
  group: string;
  nature: string;
  brand: string;
  origin: string;
  barcode: string;
  internationalCode: string;
  isService: boolean;
  trackInventory: boolean;
}

export const INITIAL_SPARE_PARTS: SparePartRecord[] = [
  {
    id: 'sp-1',
    code: 'BANGKEO',
    name: 'Băng keo',
    invoiceName: '',
    unit: 'Cuộn',
    costPrice: '50,000',
    priceBeforeVat: '46,296',
    vatRate: '8',
    priceWithVat: '50,000',
    group: 'Dụng cụ',
    nature: 'HH',
    brand: 'Dezen',
    origin: 'Thổ Nhĩ Kỳ',
    barcode: 'ERE',
    internationalCode: 'edd',
    isService: false,
    trackInventory: true,
  },
  {
    id: 'sp-2',
    code: 'BACDAN...',
    name: 'Bạc đạn PT',
    invoiceName: '',
    unit: 'Cái',
    costPrice: '150,000',
    priceBeforeVat: '150,000',
    vatRate: '8',
    priceWithVat: '162,000',
    group: '',
    nature: 'HH',
    brand: 'Dunlop',
    origin: '',
    barcode: '',
    internationalCode: '',
    isService: false,
    trackInventory: true,
  },
  {
    id: 'sp-3',
    code: '97312H6...',
    name: 'Ống vào két sư...',
    invoiceName: '',
    unit: 'Cái',
    costPrice: '0',
    priceBeforeVat: '0',
    vatRate: '5',
    priceWithVat: '0',
    group: '',
    nature: 'HH',
    brand: '',
    origin: '',
    barcode: '',
    internationalCode: '',
    isService: false,
    trackInventory: true,
  },
  {
    id: 'sp-4',
    code: 'BAMONG',
    name: 'Bấm ống',
    invoiceName: '',
    unit: 'Cái',
    costPrice: '0',
    priceBeforeVat: '0',
    vatRate: '0',
    priceWithVat: '0',
    group: '',
    nature: 'HH',
    brand: '',
    origin: '',
    barcode: '',
    internationalCode: '',
    isService: false,
    trackInventory: true,
  },
  {
    id: 'sp-5',
    code: 'BACDAN...',
    name: 'Bạc đạn 32207',
    invoiceName: '',
    unit: 'Cái',
    costPrice: '600,000',
    priceBeforeVat: '555,556',
    vatRate: '8',
    priceWithVat: '600,000',
    group: '',
    nature: 'CCDC',
    brand: '',
    origin: '',
    barcode: '',
    internationalCode: '',
    isService: false,
    trackInventory: true,
  },
  {
    id: 'sp-6',
    code: 'ACQUY002',
    name: 'Bình ắc quy Bo...',
    invoiceName: '',
    unit: 'Cái',
    costPrice: '900,000',
    priceBeforeVat: '900,000',
    vatRate: '8',
    priceWithVat: '972,000',
    group: 'Sửa chữa',
    nature: 'HH',
    brand: '',
    origin: '',
    barcode: '',
    internationalCode: '',
    isService: false,
    trackInventory: true,
  },
  {
    id: 'sp-7',
    code: 'BAUSAR...',
    name: 'Bầu sarvo',
    invoiceName: '',
    unit: 'Cái',
    costPrice: '500,000',
    priceBeforeVat: '500,000',
    vatRate: '8',
    priceWithVat: '540,000',
    group: '',
    nature: 'HH',
    brand: '',
    origin: '',
    barcode: '',
    internationalCode: '',
    isService: false,
    trackInventory: true,
  },
  {
    id: 'sp-8',
    code: '90915-YZ...',
    name: 'Lọc nhớt innova...',
    invoiceName: '',
    unit: 'Cái',
    costPrice: '0',
    priceBeforeVat: '0',
    vatRate: '',
    priceWithVat: '0',
    group: '',
    nature: 'HH',
    brand: '',
    origin: '',
    barcode: '',
    internationalCode: '',
    isService: false,
    trackInventory: true,
  },
  {
    id: 'sp-9',
    code: 'BACDAN...',
    name: 'Bạc đạn Koyo 6...',
    invoiceName: '',
    unit: 'Cái',
    costPrice: '0',
    priceBeforeVat: '0',
    vatRate: '',
    priceWithVat: '0',
    group: '',
    nature: 'HH',
    brand: '',
    origin: '',
    barcode: '',
    internationalCode: '',
    isService: false,
    trackInventory: true,
  },
  {
    id: 'sp-10',
    code: 'AB31110...',
    name: 'Tán tắc kê bánh...',
    invoiceName: '',
    unit: 'Cái',
    costPrice: '143,000',
    priceBeforeVat: '143,000',
    vatRate: '10',
    priceWithVat: '157,300',
    group: '',
    nature: 'HH',
    brand: '',
    origin: '',
    barcode: '',
    internationalCode: '',
    isService: false,
    trackInventory: true,
  },
  {
    id: 'sp-11',
    code: 'BAMDTL0...',
    name: 'Bấm đầu thắng ...',
    invoiceName: '',
    unit: 'Cái',
    costPrice: '0',
    priceBeforeVat: '0',
    vatRate: '',
    priceWithVat: '0',
    group: '',
    nature: 'HH',
    brand: '',
    origin: '',
    barcode: '',
    internationalCode: 'BAM',
    isService: false,
    trackInventory: true,
  },
  {
    id: 'sp-12',
    code: 'BACDAN...',
    name: 'Bạc đạn 42210',
    invoiceName: '',
    unit: 'Cái',
    costPrice: '200,000',
    priceBeforeVat: '200,000',
    vatRate: '10',
    priceWithVat: '220,000',
    group: '',
    nature: 'HH',
    brand: '',
    origin: '',
    barcode: '',
    internationalCode: '',
    isService: false,
    trackInventory: true,
  },
  {
    id: 'sp-13',
    code: 'ACQUY001',
    name: 'Bình ắc quy GS...',
    invoiceName: '',
    unit: 'Cái',
    costPrice: '0',
    priceBeforeVat: '0',
    vatRate: '10',
    priceWithVat: '0',
    group: '',
    nature: 'HH',
    brand: '',
    origin: '',
    barcode: '',
    internationalCode: '',
    isService: false,
    trackInventory: true,
  },
  {
    id: 'sp-14',
    code: 'BANDG001',
    name: 'Bàn đạp ga',
    invoiceName: '',
    unit: 'Cái',
    costPrice: '0',
    priceBeforeVat: '0',
    vatRate: '10',
    priceWithVat: '0',
    group: '',
    nature: 'HH',
    brand: '',
    origin: '',
    barcode: '',
    internationalCode: '',
    isService: false,
    trackInventory: true,
  },
];

const TECHNICAL_CATEGORIES = [
  'Lốp',
  'Phụ tùng',
  'Máy / thiết bị',
  'Dầu nhớt',
  'Ắc quy',
  'Phụ kiện',
];

const MODAL_TABS = [
  { id: 'description', label: 'Mô tả' },
  { id: 'replacement_cycle', label: 'Chu kỳ thay thế' },
  { id: 'compatible_cars', label: 'Xe tương thích' },
  { id: 'equivalent_parts', label: 'Vật tư tương đương' },
  { id: 'upsell_parts', label: 'Vật tư Up-sell' },
  { id: 'crosssell_parts', label: 'Vật tư Cross-sell' },
  { id: 'consumable_parts', label: 'Vật tư đi kèm / tiêu hao' },
  { id: 'accounting', label: 'Định khoản kế toán' },
];

type RelatedPartRow = {
  id: number;
  partId?: string;
  code: string;
  name: string;
  invoiceName: string;
  unit: string;
  costPrice: string;
};

const createInitialRelatedPartRows = (): Record<string, RelatedPartRow[]> => ({
  equivalent_parts: [{ id: 1, code: '', name: '', invoiceName: '', unit: '', costPrice: '' }],
  upsell_parts: [{ id: 1, code: '', name: '', invoiceName: '', unit: '', costPrice: '' }],
  crosssell_parts: [{ id: 1, code: '', name: '', invoiceName: '', unit: '', costPrice: '' }],
  consumable_parts: [{ id: 1, code: '', name: '', invoiceName: '', unit: '', costPrice: '' }],
});

export const SparePartsList: React.FC = () => {
  const [items, setItems] = useFirestoreCollection<SparePartRecord>(
    'spare_parts_items',
    INITIAL_SPARE_PARTS,
    'id'
  );
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const [natureInput, setNatureInput] = useState('');
  const [appliedFilters, setAppliedFilters] = useState({
    search: '',
    nature: '',
  });

  // Full-screen "Thêm" modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [trackInventory, setTrackInventory] = useState(true);
  const [trackByBatch, setTrackByBatch] = useState(false);
  const [trackBySerial, setTrackBySerial] = useState(false);

  const [partName, setPartName] = useState('');
  const [unit, setUnit] = useState('');
  const [nature, setNature] = useState('Nguyên vật liệu');
  const [partCode, setPartCode] = useState('');
  const [partGroup, setPartGroup] = useState('');
  const [costingMethod, setCostingMethod] = useState('Bình quân cuối kỳ');
  const [industryGroup, setIndustryGroup] = useState('');

  const [invoiceName, setInvoiceName] = useState('');
  const [priceIncludesTax, setPriceIncludesTax] = useState(false);
  const [sellingPrice, setSellingPrice] = useState('');
  const [taxRate, setTaxRate] = useState('');
  const [tempCostPrice, setTempCostPrice] = useState('');
  const [origin, setOrigin] = useState('');
  const [brand, setBrand] = useState('');
  const [hsCode, setHsCode] = useState('');
  const [barcode, setBarcode] = useState('');

  const [selectedTechCategory, setSelectedTechCategory] = useState<string | null>(null);
  const [activeModalTab, setActiveModalTab] = useState('description');
  const [descriptionText, setDescriptionText] = useState('');
  const [replacementCycleKm, setReplacementCycleKm] = useState('');
  const [replacementCycleMonths, setReplacementCycleMonths] = useState('');
  const [compatibleCars, setCompatibleCars] = useState<
    { id: number; brand: string; model: string; year: string }[]
  >([{ id: 1, brand: '', model: '', year: '' }]);
  const [relatedPartTabs, setRelatedPartTabs] = useState<
    Record<string, RelatedPartRow[]>
  >(createInitialRelatedPartRows);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (appliedFilters.search.trim()) {
        const q = appliedFilters.search.trim().toLowerCase();
        const matchCode = item.code.toLowerCase().includes(q);
        const matchName = item.name.toLowerCase().includes(q);
        if (!matchCode && !matchName) return false;
      }
      if (appliedFilters.nature && item.nature !== appliedFilters.nature) {
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
      search: searchInput,
      nature: natureInput,
    });
  };

  const handleReset = () => {
    setSearchInput('');
    setNatureInput('');
    setAppliedFilters({ search: '', nature: '' });
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    setItems((prev) => prev.filter((item) => !selectedIds.includes(item.id)));
    setSelectedIds([]);
  };

  const resetModalForm = () => {
    setTrackInventory(true);
    setTrackByBatch(false);
    setTrackBySerial(false);
    setPartName('');
    setUnit('');
    setNature('Nguyên vật liệu');
    setPartCode('');
    setPartGroup('');
    setCostingMethod('Bình quân cuối kỳ');
    setIndustryGroup('');
    setInvoiceName('');
    setPriceIncludesTax(false);
    setSellingPrice('');
    setTaxRate('');
    setTempCostPrice('');
    setOrigin('');
    setBrand('');
    setHsCode('');
    setBarcode('');
    setSelectedTechCategory(null);
    setActiveModalTab('description');
    setDescriptionText('');
    setReplacementCycleKm('');
    setReplacementCycleMonths('');
    setCompatibleCars([{ id: 1, brand: '', model: '', year: '' }]);
    setRelatedPartTabs(createInitialRelatedPartRows());
  };

  const handleAddCompatibleCarRow = () => {
    setCompatibleCars((prev) => [
      ...prev,
      {
        id: prev.length > 0 ? Math.max(...prev.map((r) => r.id)) + 1 : 1,
        brand: '',
        model: '',
        year: '',
      },
    ]);
  };

  const handleUpdateCompatibleCarRow = (
    id: number,
    field: 'brand' | 'model' | 'year',
    value: string
  ) => {
    setCompatibleCars((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const handleRemoveCompatibleCarRow = (id: number) => {
    setCompatibleCars((prev) => prev.filter((row) => row.id !== id));
  };

  const handleAddEquivalentPartRow = (tabId: string) => {
    setRelatedPartTabs((prev) => {
      const currentRows = prev[tabId] || [];
      return {
        ...prev,
        [tabId]: [
          ...currentRows,
          {
            id:
              currentRows.length > 0
                ? Math.max(...currentRows.map((r) => r.id)) + 1
                : 1,
            code: '',
            name: '',
            invoiceName: '',
            unit: '',
            costPrice: '',
          },
        ],
      };
    });
  };

  const handleUpdateEquivalentPartRow = (
    tabId: string,
    id: number,
    field: 'code' | 'name' | 'invoiceName' | 'unit' | 'costPrice',
    value: string
  ) => {
    setRelatedPartTabs((prev) => ({
      ...prev,
      [tabId]: (prev[tabId] || []).map((row) =>
        row.id === id ? { ...row, [field]: value } : row
      ),
    }));
  };

  const handleRemoveEquivalentPartRow = (tabId: string, id: number) => {
    setRelatedPartTabs((prev) => ({
      ...prev,
      [tabId]: (prev[tabId] || []).filter((row) => row.id !== id),
    }));
  };

  const handleSelectRelatedPart = (
    tabId: string,
    rowId: number,
    selectedPartId: string
  ) => {
    const found = items.find((item) => item.id === selectedPartId);
    setRelatedPartTabs((prev) => ({
      ...prev,
      [tabId]: (prev[tabId] || []).map((row) =>
        row.id === rowId
          ? found
            ? {
                ...row,
                partId: found.id,
                code: found.code,
                name: found.name,
                invoiceName: found.invoiceName || found.name,
                unit: found.unit,
                costPrice: found.costPrice,
              }
            : {
                ...row,
                partId: '',
                code: '',
                name: '',
                invoiceName: '',
                unit: '',
                costPrice: '',
              }
          : row
      ),
    }));
  };

  const handleOpenAddModal = () => {
    resetModalForm();
    setIsAddModalOpen(true);
  };

  const handleSaveNewPart = () => {
    if (partName.trim()) {
      const newRecord: SparePartRecord = {
        id: `sp-${Date.now()}`,
        code: partCode.trim() || `VT${String(items.length + 1).padStart(3, '0')}`,
        name: partName.trim(),
        invoiceName: invoiceName.trim(),
        unit: unit || 'Cái',
        costPrice: tempCostPrice.trim() || '0',
        priceBeforeVat: sellingPrice.trim() || '0',
        vatRate: taxRate.replace('%', ''),
        priceWithVat: sellingPrice.trim() || '0',
        group: partGroup,
        nature: nature === 'Công cụ dụng cụ' ? 'CCDC' : 'HH',
        brand,
        origin,
        barcode: barcode.trim(),
        internationalCode: hsCode.trim(),
        isService: nature === 'Dịch vụ',
        trackInventory,
      };
      setItems((prev) => [newRecord, ...prev]);
    }
    setIsAddModalOpen(false);
  };

  // Format costPrice like the screenshot where 6+ character numbers wrap last digit to second line inside narrow column
  const renderCostPrice = (val: string) => {
    if (val.length >= 7 && val.endsWith('0')) {
      return (
        <div className="leading-[1.25]">
          <div>{val.slice(0, -1)}</div>
          <div>{val.slice(-1)}</div>
        </div>
      );
    }
    return val;
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
            className="relative w-8 h-8 bg-white border border-gray-300 rounded-[6px] flex items-center justify-center text-[#1E3A8A] hover:bg-gray-50 transition-colors cursor-pointer"
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
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-white" />
          </button>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="flex-1 flex flex-col bg-white rounded-t-lg border border-gray-200 overflow-hidden mx-0.5">
        {/* Filter Bar */}
        <div className="px-3 pt-2.5 pb-3 border-b border-gray-200 flex items-end justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div>
              <label className="block text-[12px] font-semibold text-gray-800 mb-1">
                Mã, tên vật tư
              </label>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Tìm mã, tên vật tư"
                className="w-[190px] border border-gray-200 rounded-[6px] px-3 py-1.5 text-[13px] text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-gray-800 mb-1">
                Tính chất
              </label>
              <div className="relative w-[160px]">
                <select
                  value={natureInput}
                  onChange={(e) => setNatureInput(e.target.value)}
                  className={`w-full border border-gray-200 rounded-[6px] py-1.5 pl-3 pr-8 text-[13px] appearance-none bg-white focus:outline-none focus:border-blue-500 ${
                    natureInput ? 'text-gray-700' : 'text-gray-400'
                  }`}
                >
                  <option value="">Tìm tính chất</option>
                  <option value="HH">HH</option>
                  <option value="CCDC">CCDC</option>
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
          <table className="w-full border-collapse text-[13px] table-fixed min-w-[1520px]">
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
                <th className="w-[95px] py-2.5 px-2.5 border-r border-b border-gray-200 text-left">
                  Mã
                </th>
                <th className="w-[130px] py-2.5 px-2.5 border-r border-b border-gray-200 text-left">
                  Tên
                </th>
                <th className="w-[125px] py-2.5 px-2.5 border-r border-b border-gray-200 text-center">
                  Tên trên hóa đơn
                </th>
                <th className="w-[65px] py-2.5 px-2 border-r border-b border-gray-200 text-center">
                  ĐVT
                </th>
                <th className="w-[75px] py-2.5 px-2.5 border-r border-b border-gray-200 text-center">
                  Giá gốc
                </th>
                <th className="w-[130px] py-2.5 px-2.5 border-r border-b border-gray-200 text-center">
                  Giá bán không VAT
                </th>
                <th className="w-[90px] py-2.5 px-2 border-r border-b border-gray-200 text-center">
                  % Thuế suất
                </th>
                <th className="w-[115px] py-2.5 px-2.5 border-r border-b border-gray-200 text-center">
                  Giá bán có VAT
                </th>
                <th className="w-[110px] py-2.5 px-2.5 border-r border-b border-gray-200 text-center">
                  Nhóm SP &amp; DV
                </th>
                <th className="w-[80px] py-2.5 px-2 border-r border-b border-gray-200 text-center">
                  Tính chất
                </th>
                <th className="w-[82px] py-2.5 px-2 border-r border-b border-gray-200 text-center truncate">
                  Thương...
                </th>
                <th className="w-[95px] py-2.5 px-2 border-r border-b border-gray-200 text-center">
                  Tên xuất xứ
                </th>
                <th className="w-[82px] py-2.5 px-2 border-r border-b border-gray-200 text-center">
                  Mã vạch
                </th>
                <th className="w-[90px] py-2.5 px-2.5 border-r border-b border-gray-200 text-center">
                  Mã quốc tế
                </th>
                <th className="w-[82px] py-2.5 px-2 border-r border-b border-gray-200 text-center">
                  Là dịch vụ
                </th>
                <th className="w-[95px] py-2.5 px-2 border-b border-gray-200 text-center truncate">
                  Theo dõi tồn..
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((row) => {
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
                    <td className="py-2.5 px-2.5 border-r border-gray-200 text-gray-800 truncate">
                      {row.code}
                    </td>
                    <td className="py-2.5 px-2.5 border-r border-gray-200 text-gray-800 truncate">
                      {row.name}
                    </td>
                    <td className="py-2.5 px-2.5 border-r border-gray-200 text-gray-800 truncate">
                      {row.invoiceName}
                    </td>
                    <td className="py-2.5 px-2 border-r border-gray-200 text-center text-gray-800">
                      {row.unit}
                    </td>
                    <td className="py-2 px-2.5 border-r border-gray-200 text-right text-gray-800">
                      {renderCostPrice(row.costPrice)}
                    </td>
                    <td className="py-2.5 px-2.5 border-r border-gray-200 text-right text-gray-800">
                      {row.priceBeforeVat}
                    </td>
                    <td className="py-2.5 px-2 border-r border-gray-200 text-center text-gray-800">
                      {row.vatRate}
                    </td>
                    <td className="py-2.5 px-2.5 border-r border-gray-200 text-right text-gray-800">
                      {row.priceWithVat}
                    </td>
                    <td className="py-2.5 px-2.5 border-r border-gray-200 text-center text-gray-800">
                      {row.group}
                    </td>
                    <td className="py-2.5 px-2 border-r border-gray-200 text-center text-gray-800">
                      {row.nature}
                    </td>
                    <td className="py-2.5 px-2 border-r border-gray-200 text-center text-gray-800">
                      {row.brand}
                    </td>
                    <td className="py-2.5 px-2 border-r border-gray-200 text-center text-gray-800">
                      {row.origin}
                    </td>
                    <td className="py-2.5 px-2 border-r border-gray-200 text-center text-gray-800">
                      {row.barcode}
                    </td>
                    <td className="py-2.5 px-2.5 border-r border-gray-200 text-left text-gray-800">
                      {row.internationalCode}
                    </td>
                    <td className="py-2.5 px-2 border-r border-gray-200 text-center">
                      <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-[3px] border border-gray-300 bg-white" />
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      {row.trackInventory ? (
                        <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-[3px] bg-[#64748B] text-white">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-[3px] border border-gray-300 bg-white" />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Full-Screen Popup Modal "Vật tư, dịch vụ" */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#EEF2F6] flex flex-col font-sans text-gray-800 select-none">
          {/* Modal Top Header */}
          <div className="bg-white px-5 py-3 border-b border-gray-200 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-6">
              <h2 className="text-[18px] font-bold text-[#1E293B]">
                Vật tư, dịch vụ
              </h2>

              <label className="inline-flex items-center gap-2 text-[13px] font-medium text-gray-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={trackInventory}
                  onChange={(e) => setTrackInventory(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-gray-300 accent-[#2563EB] cursor-pointer"
                />
                <span>Theo dõi tồn kho</span>
              </label>

              <label className="inline-flex items-center gap-2 text-[13px] font-medium text-gray-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={trackByBatch}
                  onChange={(e) => setTrackByBatch(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-gray-300 accent-[#2563EB] cursor-pointer"
                />
                <span>Theo dõi theo lô</span>
              </label>

              <label className="inline-flex items-center gap-2 text-[13px] font-medium text-gray-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={trackBySerial}
                  onChange={(e) => setTrackBySerial(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-gray-300 accent-[#2563EB] cursor-pointer"
                />
                <span>Theo dõi số serial</span>
              </label>
            </div>

            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="text-gray-500 hover:text-gray-800 p-1 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {/* Top 2 Cards Row */}
            <div className="grid grid-cols-12 gap-3">
              {/* Left Card (4 cols) */}
              <div className="col-span-12 lg:col-span-4 bg-white rounded-lg border border-gray-200 shadow-xs p-4 space-y-4">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-800 mb-1.5">
                    Tên vật tư <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={partName}
                    onChange={(e) => setPartName(e.target.value)}
                    placeholder="Tên hiển thị trên hệ thống"
                    autoFocus
                    className="w-full bg-white border-[1.5px] border-gray-900 rounded-[6px] px-3 py-2 text-[13px] text-gray-800 placeholder-gray-400 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[12px] font-semibold text-gray-800 mb-1.5">
                      Đơn vị tính <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={unit}
                        onChange={(e) => setUnit(e.target.value)}
                        className="w-full bg-[#F8FAFC] border border-gray-200 rounded-[6px] py-2 pl-3 pr-8 text-[13px] text-gray-800 appearance-none focus:outline-none focus:border-blue-500"
                      >
                        <option value=""></option>
                        <option value="Cái">Cái</option>
                        <option value="Cuộn">Cuộn</option>
                        <option value="Bộ">Bộ</option>
                        <option value="Hộp">Hộp</option>
                        <option value="Lít">Lít</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-gray-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-1 text-[12px] font-semibold text-gray-800 mb-1.5">
                      <span>Tính chất</span>
                      <span className="text-red-500">*</span>
                      <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-[#94A3B8] text-white text-[10px] font-bold leading-none">
                        ?
                      </span>
                    </label>
                    <div className="relative">
                      <select
                        value={nature}
                        onChange={(e) => setNature(e.target.value)}
                        className="w-full bg-[#F8FAFC] border border-gray-200 rounded-[6px] py-2 pl-3 pr-14 text-[13px] text-gray-800 appearance-none focus:outline-none focus:border-blue-500"
                      >
                        <option value="Nguyên vật liệu">Nguyên vật liệu</option>
                        <option value="Hàng hóa">Hàng hóa</option>
                        <option value="Công cụ dụng cụ">Công cụ dụng cụ</option>
                        <option value="Dịch vụ">Dịch vụ</option>
                      </select>
                      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none text-gray-500">
                        <Pencil className="w-3.5 h-3.5" />
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[12px] font-semibold text-gray-800 mb-1.5">
                      Mã vật tư
                    </label>
                    <input
                      type="text"
                      value={partCode}
                      onChange={(e) => setPartCode(e.target.value)}
                      placeholder="Nhập hoặc tạo tự động"
                      className="w-full bg-[#F8FAFC] border border-gray-200 rounded-[6px] px-3 py-2 text-[13px] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-semibold text-gray-800 mb-1.5">
                      Nhóm vật tư
                    </label>
                    <div className="relative">
                      <select
                        value={partGroup}
                        onChange={(e) => setPartGroup(e.target.value)}
                        className="w-full bg-[#F8FAFC] border border-gray-200 rounded-[6px] py-2 pl-3 pr-8 text-[13px] text-gray-800 appearance-none focus:outline-none focus:border-blue-500"
                      >
                        <option value=""></option>
                        <option value="Dụng cụ">Dụng cụ</option>
                        <option value="Sửa chữa">Sửa chữa</option>
                        <option value="Phụ tùng">Phụ tùng</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-gray-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[12px] font-semibold text-gray-800 mb-1.5">
                      Phương pháp tính giá xuất kho
                    </label>
                    <div className="relative">
                      <select
                        value={costingMethod}
                        onChange={(e) => setCostingMethod(e.target.value)}
                        className="w-full bg-[#F8FAFC] border border-gray-200 rounded-[6px] py-2 pl-3 pr-8 text-[13px] text-gray-800 appearance-none focus:outline-none focus:border-blue-500"
                      >
                        <option value="Bình quân cuối kỳ">Bình quân cuối kỳ</option>
                        <option value="Bình quân tức thời">Bình quân tức thời</option>
                        <option value="Nhập trước xuất trước (FIFO)">
                          Nhập trước xuất trước (FIFO)
                        </option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-gray-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[12px] font-semibold text-gray-800 mb-1.5">
                      Nhóm ngành
                    </label>
                    <div className="relative">
                      <select
                        value={industryGroup}
                        onChange={(e) => setIndustryGroup(e.target.value)}
                        className="w-full bg-[#F8FAFC] border border-gray-200 rounded-[6px] py-2 pl-3 pr-8 text-[13px] text-gray-800 appearance-none focus:outline-none focus:border-blue-500"
                      >
                        <option value=""></option>
                        <option value="Ô tô">Ô tô</option>
                        <option value="Phụ tùng">Phụ tùng</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-gray-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Card (8 cols) */}
              <div className="col-span-12 lg:col-span-8 bg-white rounded-lg border border-gray-200 shadow-xs p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                  <div>
                    <label className="block text-[12px] font-semibold text-gray-800 mb-1.5">
                      Tên trên hóa đơn
                    </label>
                    <input
                      type="text"
                      value={invoiceName}
                      onChange={(e) => setInvoiceName(e.target.value)}
                      placeholder="Nhập tên in trên hóa đơn"
                      className="w-full bg-[#F8FAFC] border border-gray-200 rounded-[6px] px-3 py-2 text-[13px] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[12px] font-semibold text-gray-800">
                        Giá bán
                      </span>
                      <label className="inline-flex items-center gap-1.5 text-[12px] text-gray-500 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={priceIncludesTax}
                          onChange={(e) => setPriceIncludesTax(e.target.checked)}
                          className="w-3.5 h-3.5 rounded border-gray-300 accent-[#2563EB] cursor-pointer"
                        />
                        <span>bao gồm thuế</span>
                      </label>
                    </div>

                    <div className="flex items-center bg-[#F8FAFC] border border-gray-200 rounded-[6px] overflow-hidden">
                      <input
                        type="text"
                        value={sellingPrice}
                        onChange={(e) => setSellingPrice(e.target.value)}
                        className="flex-1 bg-transparent px-3 py-2 text-[13px] text-gray-800 focus:outline-none"
                      />
                      <div className="w-px h-5 bg-gray-300 shrink-0" />
                      <div className="relative w-[115px] shrink-0">
                        <select
                          value={taxRate}
                          onChange={(e) => setTaxRate(e.target.value)}
                          className="w-full bg-transparent py-2 pl-3 pr-7 text-[13px] text-gray-800 appearance-none focus:outline-none"
                        >
                          <option value="">Thuế suất</option>
                          <option value="0%">0%</option>
                          <option value="5%">5%</option>
                          <option value="8%">8%</option>
                          <option value="10%">10%</option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-gray-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-1.5 text-[12px]">
                      <span className="text-[#EF4444]">
                        Giá chưa thuế:{' '}
                        <strong className="text-gray-900 font-semibold ml-1">
                          0.00
                        </strong>
                      </span>
                      <span className="text-[#10B981]">
                        Giá có thuế:{' '}
                        <strong className="text-gray-900 font-semibold ml-1">
                          0
                        </strong>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[12px] font-semibold text-gray-800 mb-1.5">
                      Giá vốn tạm
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={tempCostPrice}
                        onChange={(e) => setTempCostPrice(e.target.value)}
                        className="w-full bg-[#F8FAFC] border border-gray-200 rounded-[6px] pl-3 pr-12 py-2 text-[13px] text-gray-800 focus:outline-none focus:border-blue-500"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[13px] text-gray-500 pointer-events-none">
                        VND
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[12px] font-semibold text-gray-800 mb-1.5">
                      Xuất xứ
                    </label>
                    <div className="relative">
                      <select
                        value={origin}
                        onChange={(e) => setOrigin(e.target.value)}
                        className="w-full bg-[#F8FAFC] border border-gray-200 rounded-[6px] py-2 pl-3 pr-8 text-[13px] text-gray-800 appearance-none focus:outline-none focus:border-blue-500"
                      >
                        <option value=""></option>
                        <option value="Việt Nam">Việt Nam</option>
                        <option value="Nhật Bản">Nhật Bản</option>
                        <option value="Hàn Quốc">Hàn Quốc</option>
                        <option value="Thái Lan">Thái Lan</option>
                        <option value="Thổ Nhĩ Kỳ">Thổ Nhĩ Kỳ</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-gray-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[12px] font-semibold text-gray-800 mb-1.5">
                      Thương hiệu
                    </label>
                    <div className="relative">
                      <select
                        value={brand}
                        onChange={(e) => setBrand(e.target.value)}
                        className="w-full bg-[#F8FAFC] border border-gray-200 rounded-[6px] py-2 pl-3 pr-8 text-[13px] text-gray-800 appearance-none focus:outline-none focus:border-blue-500"
                      >
                        <option value=""></option>
                        <option value="Dezen">Dezen</option>
                        <option value="Dunlop">Dunlop</option>
                        <option value="Bosch">Bosch</option>
                        <option value="Denso">Denso</option>
                        <option value="Toyota">Toyota</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-gray-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12px] font-semibold text-gray-800 mb-1.5">
                      Mã quốc tế (HS code)
                    </label>
                    <input
                      type="text"
                      value={hsCode}
                      onChange={(e) => setHsCode(e.target.value)}
                      className="w-full bg-[#F8FAFC] border border-gray-200 rounded-[6px] px-3 py-2 text-[13px] text-gray-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-semibold text-gray-800 mb-1.5">
                      Mã vạch (barcode)
                    </label>
                    <input
                      type="text"
                      value={barcode}
                      onChange={(e) => setBarcode(e.target.value)}
                      className="w-full bg-[#F8FAFC] border border-gray-200 rounded-[6px] px-3 py-2 text-[13px] text-gray-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Card: Phân loại kỹ thuật */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-xs p-4">
              <label className="block text-[12px] font-semibold text-gray-800 mb-2.5">
                Phân loại kỹ thuật
              </label>
              <div className="flex items-center gap-2.5 flex-wrap pb-2">
                {TECHNICAL_CATEGORIES.map((cat) => {
                  const isActive = selectedTechCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() =>
                        setSelectedTechCategory((prev) =>
                          prev === cat ? null : cat
                        )
                      }
                      className={`px-4 py-2 rounded-[6px] text-[13px] transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-blue-100 text-blue-700 font-semibold border border-blue-300'
                          : 'bg-[#F0F6FF] hover:bg-blue-100/70 text-gray-800'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Tabs Card */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-xs flex flex-col min-h-[360px]">
              {/* Tabs Header */}
              <div className="px-2 pt-2 border-b border-gray-200 flex items-center gap-1.5 flex-wrap">
                {MODAL_TABS.map((tab) => {
                  const isActive = activeModalTab === tab.id;
                  const isReplacementTab = tab.id === 'replacement_cycle';
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveModalTab(tab.id)}
                      className={`px-4 py-2 rounded-t-[6px] text-[13px] transition-colors cursor-pointer ${
                        isReplacementTab
                          ? isActive
                            ? 'bg-emerald-200/90 border-b-2 border-emerald-600 font-semibold text-emerald-950'
                            : 'bg-emerald-100/80 hover:bg-emerald-200/60 font-medium text-emerald-800'
                          : isActive
                          ? 'bg-[#FDE68A]/70 border-b-2 border-[#F59E0B] font-semibold text-gray-900'
                          : 'bg-[#FEF9C3]/40 hover:bg-[#FEF3C7]/60 font-medium text-gray-800'
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Tab Content */}
              {activeModalTab === 'replacement_cycle' ? (
                <div className="p-5 flex-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-[640px]">
                    <div>
                      <label className="block text-[12px] font-semibold text-gray-800 mb-1.5">
                        Chu kỳ thay (theo Km):
                      </label>
                      <input
                        type="text"
                        value={replacementCycleKm}
                        onChange={(e) => setReplacementCycleKm(e.target.value)}
                        placeholder="Nhập chu kỳ thay theo Km"
                        className="w-full bg-[#F8FAFC] border border-gray-200 rounded-[6px] px-3 py-2 text-[13px] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[12px] font-semibold text-gray-800 mb-1.5">
                        Chu kỳ thay (theo Tháng):
                      </label>
                      <input
                        type="text"
                        value={replacementCycleMonths}
                        onChange={(e) => setReplacementCycleMonths(e.target.value)}
                        placeholder="Nhập chu kỳ thay theo Tháng"
                        className="w-full bg-[#F8FAFC] border border-gray-200 rounded-[6px] px-3 py-2 text-[13px] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              ) : activeModalTab === 'compatible_cars' ? (
                <div className="p-4 flex-1 flex flex-col">
                  <div className="border border-gray-200 rounded-[6px] overflow-hidden">
                    <table className="w-full border-collapse text-[13px]">
                      <thead className="bg-[#F8FAFC] text-gray-700 font-semibold text-[12px]">
                        <tr>
                          <th className="w-16 py-2.5 px-3 border-r border-b border-gray-200 text-center">
                            STT
                          </th>
                          <th className="py-2.5 px-3 border-r border-b border-gray-200 text-left">
                            Hãng xe
                          </th>
                          <th className="py-2.5 px-3 border-r border-b border-gray-200 text-left">
                            Dòng xe
                          </th>
                          <th className="py-2.5 px-3 border-r border-b border-gray-200 text-left">
                            Năm sản xuất
                          </th>
                          <th className="w-12 py-2.5 px-2 border-b border-gray-200 text-center"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {compatibleCars.map((row, idx) => (
                          <tr
                            key={row.id}
                            className="border-b border-gray-200 last:border-b-0 bg-white hover:bg-gray-50/60"
                          >
                            <td className="py-2 px-3 border-r border-gray-200 text-center text-gray-700">
                              {idx + 1}
                            </td>
                            <td className="py-1.5 px-2.5 border-r border-gray-200">
                              <input
                                type="text"
                                value={row.brand}
                                onChange={(e) =>
                                  handleUpdateCompatibleCarRow(
                                    row.id,
                                    'brand',
                                    e.target.value
                                  )
                                }
                                placeholder="Chọn hoặc nhập hãng xe"
                                className="w-full bg-[#F8FAFC] border border-gray-200 rounded-[5px] px-2.5 py-1.5 text-[13px] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500"
                              />
                            </td>
                            <td className="py-1.5 px-2.5 border-r border-gray-200">
                              <input
                                type="text"
                                value={row.model}
                                onChange={(e) =>
                                  handleUpdateCompatibleCarRow(
                                    row.id,
                                    'model',
                                    e.target.value
                                  )
                                }
                                placeholder="Chọn hoặc nhập dòng xe"
                                className="w-full bg-[#F8FAFC] border border-gray-200 rounded-[5px] px-2.5 py-1.5 text-[13px] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500"
                              />
                            </td>
                            <td className="py-1.5 px-2.5 border-r border-gray-200">
                              <input
                                type="text"
                                value={row.year}
                                onChange={(e) =>
                                  handleUpdateCompatibleCarRow(
                                    row.id,
                                    'year',
                                    e.target.value
                                  )
                                }
                                placeholder="Nhập năm sản xuất"
                                className="w-full bg-[#F8FAFC] border border-gray-200 rounded-[5px] px-2.5 py-1.5 text-[13px] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500"
                              />
                            </td>
                            <td className="py-1.5 px-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveCompatibleCarRow(row.id)}
                                className="text-gray-400 hover:text-red-500 p-1 transition-colors cursor-pointer"
                                title="Xóa dòng"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={handleAddCompatibleCarRow}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] border border-[#1677FF] text-[#1677FF] bg-white hover:bg-blue-50 text-[13px] font-medium transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Thêm dòng</span>
                    </button>
                  </div>
                </div>
              ) : [
                  'equivalent_parts',
                  'upsell_parts',
                  'crosssell_parts',
                  'consumable_parts',
                ].includes(activeModalTab) ? (
                <div className="p-4 flex-1 flex flex-col">
                  <div className="border border-gray-200 rounded-[6px] overflow-hidden">
                    <table className="w-full border-collapse text-[13px]">
                      <thead className="bg-[#F8FAFC] text-gray-700 font-semibold text-[12px]">
                        <tr>
                          <th className="w-16 py-2.5 px-3 border-r border-b border-gray-200 text-center">
                            STT
                          </th>
                          <th className="py-2.5 px-3 border-r border-b border-gray-200 text-left">
                            Mã Vật tư
                          </th>
                          <th className="py-2.5 px-3 border-r border-b border-gray-200 text-left">
                            Tên vật tư
                          </th>
                          <th className="py-2.5 px-3 border-r border-b border-gray-200 text-left">
                            Tên trên hóa đơn
                          </th>
                          <th className="w-28 py-2.5 px-3 border-r border-b border-gray-200 text-left">
                            ĐVT
                          </th>
                          <th className="w-40 py-2.5 px-3 border-r border-b border-gray-200 text-left">
                            Giá gốc
                          </th>
                          <th className="w-12 py-2.5 px-2 border-b border-gray-200 text-center"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {(relatedPartTabs[activeModalTab] || []).map((row, idx) => (
                          <tr
                            key={row.id}
                            className="border-b border-gray-200 last:border-b-0 bg-white hover:bg-gray-50/60"
                          >
                            <td className="py-2 px-3 border-r border-gray-200 text-center text-gray-700">
                              {idx + 1}
                            </td>
                            <td className="py-1.5 px-2.5 border-r border-gray-200">
                              <div className="relative">
                                <select
                                  value={row.partId || ''}
                                  onChange={(e) =>
                                    handleSelectRelatedPart(
                                      activeModalTab,
                                      row.id,
                                      e.target.value
                                    )
                                  }
                                  className={`w-full bg-[#F8FAFC] border border-gray-200 rounded-[5px] pl-2.5 pr-7 py-1.5 text-[13px] appearance-none focus:outline-none focus:border-blue-500 cursor-pointer ${
                                    row.partId ? 'text-gray-800' : 'text-gray-400'
                                  }`}
                                >
                                  <option value="">Chọn mã vật tư</option>
                                  {items.map((part) => (
                                    <option key={part.id} value={part.id}>
                                      {part.code} - {part.name}
                                    </option>
                                  ))}
                                </select>
                                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                              </div>
                            </td>
                            <td className="py-1.5 px-2.5 border-r border-gray-200">
                              <input
                                type="text"
                                value={row.name}
                                onChange={(e) =>
                                  handleUpdateEquivalentPartRow(
                                    activeModalTab,
                                    row.id,
                                    'name',
                                    e.target.value
                                  )
                                }
                                placeholder="Nhập tên vật tư"
                                className="w-full bg-[#F8FAFC] border border-gray-200 rounded-[5px] px-2.5 py-1.5 text-[13px] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500"
                              />
                            </td>
                            <td className="py-1.5 px-2.5 border-r border-gray-200">
                              <input
                                type="text"
                                value={row.invoiceName}
                                onChange={(e) =>
                                  handleUpdateEquivalentPartRow(
                                    activeModalTab,
                                    row.id,
                                    'invoiceName',
                                    e.target.value
                                  )
                                }
                                placeholder="Nhập tên trên hóa đơn"
                                className="w-full bg-[#F8FAFC] border border-gray-200 rounded-[5px] px-2.5 py-1.5 text-[13px] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500"
                              />
                            </td>
                            <td className="py-1.5 px-2.5 border-r border-gray-200">
                              <input
                                type="text"
                                value={row.unit}
                                onChange={(e) =>
                                  handleUpdateEquivalentPartRow(
                                    activeModalTab,
                                    row.id,
                                    'unit',
                                    e.target.value
                                  )
                                }
                                placeholder="ĐVT"
                                className="w-full bg-[#F8FAFC] border border-gray-200 rounded-[5px] px-2.5 py-1.5 text-[13px] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500"
                              />
                            </td>
                            <td className="py-1.5 px-2.5 border-r border-gray-200">
                              <input
                                type="text"
                                value={row.costPrice}
                                onChange={(e) =>
                                  handleUpdateEquivalentPartRow(
                                    activeModalTab,
                                    row.id,
                                    'costPrice',
                                    e.target.value
                                  )
                                }
                                placeholder="0"
                                className="w-full bg-[#F8FAFC] border border-gray-200 rounded-[5px] px-2.5 py-1.5 text-[13px] text-right text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500"
                              />
                            </td>
                            <td className="py-1.5 px-2 text-center">
                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveEquivalentPartRow(
                                    activeModalTab,
                                    row.id
                                  )
                                }
                                className="text-gray-400 hover:text-red-500 p-1 transition-colors cursor-pointer"
                                title="Xóa dòng"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => handleAddEquivalentPartRow(activeModalTab)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] border border-[#1677FF] text-[#1677FF] bg-white hover:bg-blue-50 text-[13px] font-medium transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Thêm dòng</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-5 flex-1 flex flex-col items-center">
                  <div className="w-full max-w-[430px]">
                    <label className="block text-[12px] font-semibold text-gray-800 mb-1.5">
                      Mô tả
                    </label>
                    <textarea
                      value={descriptionText}
                      onChange={(e) => setDescriptionText(e.target.value)}
                      placeholder="Nhập mô tả..."
                      className="w-full h-[90px] bg-[#F8FAFC] border border-gray-200 rounded-[6px] p-3 text-[13px] text-gray-700 placeholder-gray-400 resize-none focus:outline-none focus:border-blue-500"
                    />

                    <div className="mt-4 grid grid-cols-3 gap-3">
                      {[1, 2, 3].map((num) => (
                        <div
                          key={num}
                          className="h-[165px] border border-gray-200 rounded-[8px] bg-white flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-blue-400 transition-colors"
                        >
                          <Camera className="w-5 h-5 text-gray-700" />
                          <span className="text-[12px] text-gray-500">
                            Ảnh {num}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Modal Sticky Footer */}
          <div className="bg-[#F8FAFC] border-t border-gray-200 px-5 py-2.5 flex items-center justify-end gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-1.5 rounded-[6px] text-[13px] font-medium transition-colors cursor-pointer"
            >
              Đóng
            </button>
            <button
              type="button"
              onClick={handleSaveNewPart}
              className="bg-[#1677FF] hover:bg-blue-600 text-white px-4 py-1.5 rounded-[6px] text-[13px] font-medium transition-colors cursor-pointer"
            >
              Lưu
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
