import React from 'react';

interface CategoryListProps {
  onSelectCategoryCustomers?: () => void;
  onSelectCategorySuppliers?: () => void;
  onSelectEmployees?: () => void;
  onSelectCategoryInsurance?: () => void;
  onSelectSpareParts: () => void;
  onSelectMaterialGroups?: () => void;
  onSelectWarehouses?: () => void;
  onSelectUnits?: () => void;
  onSelectLots?: () => void;
  onSelectVehicles: () => void;
  onSelectDrivers?: () => void;
  onSelectVehicleTypes?: () => void;
  onSelectBankAccounts?: () => void;
  onSelectDocumentCabinet?: () => void;
  onSelectDocumentStorageCategories?: () => void;
  onSelectDepartments?: () => void;
  onSelectPositions?: () => void;
  onSelectSalaryGrades?: () => void;
  onSelectContractTypes?: () => void;
  onSelectSalaryRuleGroups?: () => void;
  onSelectSalaryStructures?: () => void;
  onSelectInsuranceTaxParams?: () => void;
  onSelectTaxCategories: () => void;
  onSelectOmnichannel: () => void;
  onSelectOnlineOrdering?: () => void;
  onSelectPurchaseOrders?: () => void;
  onSelectMarketplace?: () => void;
  onSelectRegistrationApproval?: () => void;
  onSelectEvents?: () => void;
}

export const CategoryList: React.FC<CategoryListProps> = ({
  onSelectCategoryCustomers,
  onSelectCategorySuppliers,
  onSelectEmployees,
  onSelectCategoryInsurance,
  onSelectSpareParts,
  onSelectMaterialGroups,
  onSelectWarehouses,
  onSelectUnits,
  onSelectLots,
  onSelectVehicles,
  onSelectDrivers,
  onSelectVehicleTypes,
  onSelectBankAccounts,
  onSelectDocumentCabinet,
  onSelectDocumentStorageCategories,
  onSelectDepartments,
  onSelectPositions,
  onSelectSalaryGrades,
  onSelectContractTypes,
  onSelectSalaryRuleGroups,
  onSelectSalaryStructures,
  onSelectInsuranceTaxParams,
  onSelectTaxCategories,
  onSelectOmnichannel,
  onSelectOnlineOrdering,
  onSelectPurchaseOrders,
  onSelectMarketplace,
  onSelectRegistrationApproval,
  onSelectEvents,
}) => {
  const categories = [
    {
      title: 'Đối tượng quản lý',
      items: [
        { name: 'Khách hàng', onClick: onSelectCategoryCustomers },
        { name: 'Tài xế', onClick: onSelectDrivers },
        { name: 'Nhà cung cấp', onClick: onSelectCategorySuppliers },
      ],
    },
    {
      title: 'Vật tư hàng hóa',
      items: [
        { name: 'Vật tư, hàng hóa', onClick: onSelectSpareParts },
        { name: 'Nhóm vật tư, hàng hóa', onClick: onSelectMaterialGroups },
        { name: 'Danh sách Kho', onClick: onSelectWarehouses },
        { name: 'Đơn vị tính', onClick: onSelectUnits },
        { name: 'Lô', onClick: onSelectLots },
      ],
    },
    {
      title: 'Quản lý phương tiện',
      items: [
        { name: 'Danh sách Xe', onClick: onSelectVehicles },
        { name: 'Loại xe', onClick: onSelectVehicleTypes },
      ],
    },
    {
      title: 'Thanh toán',
      items: [
        { name: 'Tài khoản ngân hàng', onClick: onSelectBankAccounts },
        { name: 'Danh mục thuế', onClick: onSelectTaxCategories },
        { name: 'Phương thức thanh toán' },
      ],
    },
    {
      title: 'Hồ sơ & Tài liệu',
      items: [
        { name: 'Tủ lưu trữ', onClick: onSelectDocumentCabinet },
        { name: 'Phân loại lưu trữ', onClick: onSelectDocumentStorageCategories },
      ],
    },
    {
      title: 'HRM',
      items: [
        { name: 'Danh sách Nhân sự', onClick: onSelectEmployees },
        { name: 'Phòng ban / Bộ phận', onClick: onSelectDepartments },
        { name: 'Chức vụ / Vị trí', onClick: onSelectPositions },
        { name: 'Thang bảng Lương', onClick: onSelectSalaryGrades },
        { name: 'Loại hợp đồng', onClick: onSelectContractTypes },
        { name: 'Nhóm quy tắc Lương', onClick: onSelectSalaryRuleGroups },
        { name: 'Cấu trúc Lương', onClick: onSelectSalaryStructures },
        { name: 'Tham số BHXH & Thuế', onClick: onSelectInsuranceTaxParams },
      ],
    },
    {
      title: 'Hệ thống',
      items: [
        { name: 'Người dùng' },
        { name: 'Nhóm người dùng' },
      ],
    },
    {
      title: 'Tài sản',
      items: [
        { name: 'Loại TSCĐ, CCDC' },
        { name: 'Tài sản cố định, công cụ dụng cụ' },
        { name: 'Kiểu tăng / giảm tài sản' },
        { name: 'Hệ số phân bổ khấu hao' },
      ],
    },
    {
      title: 'Đối tượng bên thứ 3',
      items: [
        { name: 'Đơn vị bảo hiểm', onClick: onSelectCategoryInsurance },
      ],
    },
    {
      title: 'Đa kênh',
      items: [
        { name: 'Đăng ký sàn', onClick: onSelectOmnichannel },
        { name: 'Đặt hàng online', onClick: onSelectOnlineOrdering },
        { name: 'Đơn đặt hàng', onClick: onSelectPurchaseOrders },
        { name: 'Quản lý sàn', onClick: onSelectMarketplace },
      ],
    },
    {
      title: 'ADMIN - QUẢN TRỊ',
      isAdmin: true,
      items: [
        { name: 'Xét duyệt Đăng ký sàn', onClick: onSelectRegistrationApproval },
        { name: 'Sự kiện', onClick: onSelectEvents },
      ],
    },
  ];

  return (
    <div className="min-h-full bg-[#F4F7FA] p-4 sm:p-5 overflow-x-hidden">
      <div className="grid grid-cols-[minmax(max-content,1fr)_minmax(max-content,1fr)_minmax(max-content,1.25fr)_minmax(max-content,1fr)_minmax(max-content,1fr)] gap-3.5 items-stretch w-full">
        {categories.map((category, index) => (
          <section
            key={index}
            className={`rounded-xl border shadow-[0_1px_2px_rgba(15,23,42,0.03)] flex flex-col overflow-hidden ${
              category.isAdmin
                ? 'bg-[#FFFBEB] border-[#FDE68A]'
                : 'bg-white border-[#E6EAF0]'
            }`}
          >
            <div
              className={`px-3.5 py-3 border-b flex items-center justify-between gap-2 ${
                category.isAdmin
                  ? 'bg-[#FEF3C7]/70 border-[#FDE68A]'
                  : 'border-[#EEF2F6]'
              }`}
            >
              <h2
                className={`text-[13.5px] font-semibold leading-snug whitespace-nowrap ${
                  category.isAdmin ? 'text-[#92400E]' : 'text-[#1E293B]'
                }`}
              >
                {category.title}
              </h2>
              <span
                className={`text-xs font-medium tabular-nums shrink-0 ${
                  category.isAdmin ? 'text-[#B45309]' : 'text-[#94A3B8]'
                }`}
              >
                {category.items.length}
              </span>
            </div>

            <ul className="px-2.5 py-2.5 space-y-1 flex-1">
              {category.items.map((item, itemIndex) => (
                <li key={itemIndex}>
                  <button
                    type="button"
                    onClick={item.onClick}
                    className={`w-full text-left px-2 py-1.5 rounded-md text-[13px] font-normal whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 transition-colors cursor-pointer ${
                      category.isAdmin
                        ? 'text-[#78350F] hover:bg-[#FEF3C7] hover:text-[#92400E] focus-visible:ring-[#D97706]/40'
                        : 'text-[#334155] hover:bg-[#F4F7FA] hover:text-[#1A4B9F] focus-visible:ring-[#1A73E8]/40'
                    }`}
                  >
                    {item.name}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
};
