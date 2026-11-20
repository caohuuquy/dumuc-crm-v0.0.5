import React from 'react';

interface CategoryListProps {
  onSelectSpareParts: () => void;
  onSelectVehicles: () => void;
  onSelectTaxCategories: () => void;
  onSelectOmnichannel: () => void;
}

export const CategoryList: React.FC<CategoryListProps> = ({
  onSelectSpareParts,
  onSelectVehicles,
  onSelectTaxCategories,
  onSelectOmnichannel,
}) => {
  const categories = [
    {
      title: 'Đối tượng',
      items: [
        { name: 'Khách hàng' },
        { name: 'Nhà cung cấp' },
        { name: 'Nhóm khách hàng' },
        { name: 'Đơn vị bảo hiểm' },
        { name: 'Khách hàng tiềm năng' },
      ],
    },
    {
      title: 'Vật tư hàng hóa',
      items: [
        { name: 'Vật tư, hàng hóa', onClick: onSelectSpareParts },
        { name: 'Nhóm vật tư, hàng hóa' },
        { name: 'Kho' },
        { name: 'Đơn vị tính' },
        { name: 'Lô' },
        { name: 'Loại vật tư' },
      ],
    },
    {
      title: 'Gara',
      items: [
        { name: 'Xe', onClick: onSelectVehicles },
        { name: 'Tài xế' },
        { name: 'Hiệu xe' },
        { name: 'Loại xe' },
        { name: 'Dòng xe' },
      ],
    },
    {
      title: 'Tài khoản',
      items: [
        { name: 'Hệ thống tài khoản' },
      ],
    },
    {
      title: 'HRM',
      items: [
        { name: 'Nhân sự' },
        { name: 'Phòng ban bộ phận' },
      ],
    },
    {
      title: 'Hệ thống',
      items: [
        { name: 'Người dùng' },
        { name: 'Nhóm người dùng' },
        { name: 'Cấu hình tài liệu' },
        { name: 'Tài liệu công ty' },
        { name: 'Danh mục thuế', onClick: onSelectTaxCategories },
        { name: 'Phương thức thanh toán' },
        { name: 'Đăng ký sàn', onClick: onSelectOmnichannel },
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
  ];

  return (
    <div className="min-h-full bg-[#F4F7FA] p-5 sm:p-6 overflow-x-auto">
      <div className="grid grid-cols-7 gap-4 items-stretch min-w-[1120px]">
        {categories.map((category, index) => (
          <section
            key={index}
            className="bg-white rounded-xl border border-[#E6EAF0] shadow-[0_1px_2px_rgba(15,23,42,0.03)] flex flex-col overflow-hidden"
          >
            <div className="px-5 py-3.5 border-b border-[#EEF2F6] flex items-center justify-between gap-3">
              <h2 className="text-[14.5px] font-semibold text-[#1E293B] leading-snug">
                {category.title}
              </h2>
              <span className="text-xs font-medium text-[#94A3B8] tabular-nums shrink-0">
                {category.items.length}
              </span>
            </div>

            <ul className="px-5 py-3.5 space-y-1.5 flex-1">
              {category.items.map((item, itemIndex) => (
                <li key={itemIndex}>
                  <button
                    type="button"
                    onClick={item.onClick}
                    className="w-full text-left px-2 py-1.5 -mx-2 rounded-md text-[13.5px] font-normal text-[#334155] hover:bg-[#F4F7FA] hover:text-[#1A4B9F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A73E8]/40 transition-colors cursor-pointer"
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
