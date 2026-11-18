import React, { useState, useMemo } from 'react';
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
} from 'lucide-react';
import { useFirestoreCollection } from '../firebase';

export interface VehicleRecord {
  id: string;
  plate: string;
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
}

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
  const [items, setItems] = useFirestoreCollection<VehicleRecord>(
    'vehicles_items',
    INITIAL_VEHICLES,
    'id'
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
          <table className="w-full border-collapse text-[13px] table-fixed min-w-[1620px]">
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
                <th className="w-[140px] py-2.5 px-3 border-r border-b border-gray-200 text-left">
                  Biển số
                </th>
                <th className="w-[155px] py-2.5 px-3 border-r border-b border-gray-200 text-left">
                  Khách hàng
                </th>
                <th className="w-[175px] py-2.5 px-3 border-r border-b border-gray-200 text-left">
                  Tên khách hàng
                </th>
                <th className="w-[145px] py-2.5 px-3 border-r border-b border-gray-200 text-left">
                  Điện thoại
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
                      {row.plate}
                    </td>
                    <td className="py-2.5 px-3 border-r border-gray-200 text-gray-800 truncate">
                      {row.customerCode}
                    </td>
                    <td className="py-2.5 px-3 border-r border-gray-200 text-gray-800 truncate">
                      {row.customerName}
                    </td>
                    <td className="py-2.5 px-3 border-r border-gray-200 text-gray-800 truncate">
                      {row.phone}
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
    </div>
  );
};
