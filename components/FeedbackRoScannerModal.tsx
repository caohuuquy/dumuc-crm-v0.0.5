import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  X,
  Search,
  ScanSearch,
  AlertCircle,
  Check,
  Phone,
  Pencil,
  Car,
  Wrench,
  User,
  Building2,
  FileText,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react';
import type { PotentialCustomerItem } from './FeedbackModule';

export type DatePreset = 'yesterday' | 'last_7_days' | 'custom';

interface RoRepairLineItem {
  id: string;
  code: string;
  name: string;
  category: 'Công thợ' | 'Phụ tùng' | 'Vật tư';
  qty: number;
  unit: string;
  unitPrice: number;
  total: number;
}

interface ScannableRoRecord {
  id: string;
  roCode: string;
  branch: string;
  serviceType: string;
  serviceAdvisor: string;
  deliveredDaysAgo: number;
  deliveredTime: string;
  receiveDaysBeforeDelivery: number;
  promisedOffsetDays: number; // 0 = on time, -1 = promised 1 day earlier
  licensePlate: string;
  carBrand: string;
  carModel: string;
  vin: string;
  odoKm: number;
  ownerName: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  isDriverOrProxy: boolean;
  revenue: number;
  alreadyEvaluated?: boolean;
  lastCalledDaysAgo: number | null;
  customerNote?: string;
  items: RoRepairLineItem[];
}

interface FeedbackRoScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingRoCodes: string[];
  onConfirmCreate: (newRecords: PotentialCustomerItem[]) => void;
}

const BRANCH_OPTIONS = [
  'Xưởng Dịch vụ Quận 7',
  'Xưởng Dịch vụ Thủ Đức',
  'Xưởng Dịch vụ Tân Bình',
  'Tất cả chi nhánh',
];

const DEFAULT_USER_BRANCH = 'Xưởng Dịch vụ Quận 7';

const SERVICE_TYPE_OPTIONS = [
  'Tất cả loại dịch vụ',
  'Bảo dưỡng định kỳ',
  'Sửa chữa chung',
  'Đồng sơn & Bảo hiểm',
  'Chăm sóc & Làm đẹp xe',
  'Thay thế phụ tùng / Lốp',
];

const CVDV_OPTIONS = [
  'Tất cả CVDV',
  'Nguyễn Văn Tuấn',
  'Trần Thị Mai',
  'Lê Xuân Nguyên',
  'Phạm Quốc Bảo',
  'Đỗ Hoàng Minh',
];

const formatDateDDMMYYYY = (date: Date): string => {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

const formatDateISO = (date: Date): string => {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${yyyy}-${mm}-${dd}`;
};

const shiftDays = (base: Date, deltaDays: number): Date => {
  const d = new Date(base.getFullYear(), base.getMonth(), base.getDate());
  d.setDate(d.getDate() + deltaDays);
  return d;
};

const formatRelativeDelivery = (daysAgo: number): string => {
  if (daysAgo <= 0) return 'Hôm nay';
  if (daysAgo === 1) return 'Hôm qua';
  return `${daysAgo} ngày trước`;
};

const formatVnd = (amount: number): string => {
  return `${amount.toLocaleString('vi-VN')} đ`;
};

const isValidVietnamesePhone = (phone: string): boolean => {
  const digits = phone.replace(/[\s.-]/g, '');
  return /^(0|\+84)[0-9]{9,10}$/.test(digits);
};

const INITIAL_RO_DATASET: ScannableRoRecord[] = [
  {
    id: 'ro-scan-01',
    roCode: 'RO-2611-0412',
    branch: 'Xưởng Dịch vụ Quận 7',
    serviceType: 'Bảo dưỡng định kỳ',
    serviceAdvisor: 'Nguyễn Văn Tuấn',
    deliveredDaysAgo: 2,
    deliveredTime: '15:20',
    receiveDaysBeforeDelivery: 1,
    promisedOffsetDays: 0,
    licensePlate: '51K-889.21',
    carBrand: 'Mazda',
    carModel: 'CX-5 2.0 Premium',
    vin: 'RN2KE4921PC018842',
    odoKm: 40250,
    ownerName: 'Phạm Hoàng Nam',
    contactName: 'Phạm Hoàng Nam',
    contactPhone: '0901 234 567',
    contactEmail: 'nam.pham@namsaigonauto.vn',
    isDriverOrProxy: false,
    revenue: 6450000,
    lastCalledDaysAgo: null,
    customerNote: 'Khách yêu cầu kiểm tra kỹ tiếng kêu gầm trước khi giao xe.',
    items: [
      { id: 'i1', code: 'BD-40K', name: 'Gói bảo dưỡng cấp lớn 40.000 km', category: 'Công thợ', qty: 1, unit: 'Gói', unitPrice: 1850000, total: 1850000 },
      { id: 'i2', code: 'PT-OIL5W30', name: 'Dầu động cơ tổng hợp toàn phần 5W-30', category: 'Vật tư', qty: 4.5, unit: 'Lít', unitPrice: 320000, total: 1440000 },
      { id: 'i3', code: 'PT-FLT-09', name: 'Lọc nhớt + Lọc gió động cơ + Lọc điều hòa chính hãng', category: 'Phụ tùng', qty: 1, unit: 'Bộ', unitPrice: 1680000, total: 1680000 },
      { id: 'i4', code: 'PT-BRK-02', name: 'Vệ sinh bảo dưỡng 4 cụm phanh & cân bằng động', category: 'Công thợ', qty: 1, unit: 'Lần', unitPrice: 1480000, total: 1480000 },
    ],
  },
  {
    id: 'ro-scan-02',
    roCode: 'RO-2611-0409',
    branch: 'Xưởng Dịch vụ Quận 7',
    serviceType: 'Sửa chữa chung',
    serviceAdvisor: 'Trần Thị Mai',
    deliveredDaysAgo: 2,
    deliveredTime: '17:05',
    receiveDaysBeforeDelivery: 2,
    promisedOffsetDays: 0,
    licensePlate: '51H-442.19',
    carBrand: 'Toyota',
    carModel: 'Fortuner Legender',
    vin: 'RL4KA8GS7N9012344',
    odoKm: 68410,
    ownerName: 'Công ty TNHH Vận Tải Nam Việt',
    contactName: 'Nguyễn Minh Tài',
    contactPhone: '0938 612 889',
    contactEmail: 'tainguyen.driver@namviettrans.vn',
    isDriverOrProxy: true,
    revenue: 11280000,
    lastCalledDaysAgo: null,
    customerNote: 'Tài xế công ty trực tiếp đưa xe vào xưởng và nghiệm thu bàn giao.',
    items: [
      { id: 'i5', code: 'PT-SUS-11', name: 'Thay cặp phuộc giảm xóc trước (Trái/Phải)', category: 'Phụ tùng', qty: 2, unit: 'Cái', unitPrice: 3850000, total: 7700000 },
      { id: 'i6', code: 'PT-ROT-04', name: 'Rotuyn cân bằng trước', category: 'Phụ tùng', qty: 2, unit: 'Cái', unitPrice: 940000, total: 1880000 },
      { id: 'i7', code: 'DV-ALN-3D', name: 'Công thay thế & cân chỉnh thước lái 3D Hunter', category: 'Công thợ', qty: 1, unit: 'Gói', unitPrice: 1700000, total: 1700000 },
    ],
  },
  {
    id: 'ro-scan-03',
    roCode: 'RO-2611-0398',
    branch: 'Xưởng Dịch vụ Quận 7',
    serviceType: 'Đồng sơn & Bảo hiểm',
    serviceAdvisor: 'Lê Xuân Nguyên',
    deliveredDaysAgo: 3,
    deliveredTime: '11:40',
    receiveDaysBeforeDelivery: 4,
    promisedOffsetDays: -1,
    licensePlate: '51G-705.66',
    carBrand: 'Mercedes-Benz',
    carModel: 'GLC 300 4MATIC',
    vin: 'RWD2539841V224901',
    odoKm: 31800,
    ownerName: 'Võ Thị Thanh Hương',
    contactName: 'Võ Thị Thanh Hương',
    contactPhone: '',
    contactEmail: 'huong.vo@gmail.com',
    isDriverOrProxy: false,
    revenue: 18950000,
    lastCalledDaysAgo: null,
    customerNote: 'Sơn dặm cản trước + thay đèn pha bên phụ theo hồ sơ bảo hiểm PVI.',
    items: [
      { id: 'i8', code: 'DS-BUMP-F', name: 'Phục hồi & sơn hoàn thiện cản trước (phòng sơn tiêu chuẩn)', category: 'Công thợ', qty: 1, unit: 'Hạng mục', unitPrice: 4200000, total: 4200000 },
      { id: 'i9', code: 'PT-LED-RH', name: 'Cụm đèn pha LED Multibeam bên phụ (chính hãng)', category: 'Phụ tùng', qty: 1, unit: 'Bộ', unitPrice: 13500000, total: 13500000 },
      { id: 'i10', code: 'DV-POLISH', name: 'Đánh bóng hiệu chỉnh bề mặt & kiểm tra cảm biến trước', category: 'Công thợ', qty: 1, unit: 'Gói', unitPrice: 1250000, total: 1250000 },
    ],
  },
  {
    id: 'ro-scan-04',
    roCode: 'RO-2611-0395',
    branch: 'Xưởng Dịch vụ Quận 7',
    serviceType: 'Thay thế phụ tùng / Lốp',
    serviceAdvisor: 'Phạm Quốc Bảo',
    deliveredDaysAgo: 2,
    deliveredTime: '14:15',
    receiveDaysBeforeDelivery: 0,
    promisedOffsetDays: 0,
    licensePlate: '51L-219.04',
    carBrand: 'Hyundai',
    carModel: 'SantaFe 2.2D Cao cấp',
    vin: 'RLU842911PP005612',
    odoKm: 52100,
    ownerName: 'Trần Quốc Khải',
    contactName: 'Lê Hoàng Phúc',
    contactPhone: '0914 552 308',
    contactEmail: 'phuc.le@khaihoangcorp.vn',
    isDriverOrProxy: true,
    revenue: 14600000,
    lastCalledDaysAgo: null,
    customerNote: 'Người nhà mang xe đi thay dàn lốp Michelin và kiểm tra ắc-quy.',
    items: [
      { id: 'i11', code: 'LP-MICH-19', name: 'Lốp Michelin Primacy SUV+ 235/55R19', category: 'Phụ tùng', qty: 4, unit: 'Quả', unitPrice: 3450000, total: 13800000 },
      { id: 'i12', code: 'DV-BAL-4W', name: 'Thay van cao su, cân mâm bấm chì 4 bánh', category: 'Công thợ', qty: 1, unit: 'Gói', unitPrice: 800000, total: 800000 },
    ],
  },
  {
    id: 'ro-scan-05',
    roCode: 'RO-2611-0389',
    branch: 'Xưởng Dịch vụ Quận 7',
    serviceType: 'Chăm sóc & Làm đẹp xe',
    serviceAdvisor: 'Nguyễn Văn Tuấn',
    deliveredDaysAgo: 3,
    deliveredTime: '16:30',
    receiveDaysBeforeDelivery: 1,
    promisedOffsetDays: 0,
    licensePlate: '51K-512.88',
    carBrand: 'Honda',
    carModel: 'CR-V L Sensing',
    vin: 'RLHRW1880NY104431',
    odoKm: 24900,
    ownerName: 'Đặng Gia Bảo',
    contactName: 'Đặng Gia Bảo',
    contactPhone: '0978 441 920',
    contactEmail: 'baodg.arch@gmail.com',
    isDriverOrProxy: false,
    revenue: 4350000,
    lastCalledDaysAgo: null,
    items: [
      { id: 'i13', code: 'CS-INT-PRO', name: 'Vệ sinh nội thất chuyên sâu & dưỡng da ghế', category: 'Công thợ', qty: 1, unit: 'Gói', unitPrice: 2450000, total: 2450000 },
      { id: 'i14', code: 'CS-ENG-CLN', name: 'Vệ sinh khoang máy hơi nước nóng & phủ bảo dưỡng', category: 'Công thợ', qty: 1, unit: 'Gói', unitPrice: 950000, total: 950000 },
      { id: 'i15', code: 'CS-AC-OZ', name: 'Vệ sinh giàn lạnh nội soi & khử mùi Ozone', category: 'Công thợ', qty: 1, unit: 'Gói', unitPrice: 950000, total: 950000 },
    ],
  },
  {
    id: 'ro-scan-06',
    roCode: 'RO-2611-0384',
    branch: 'Xưởng Dịch vụ Quận 7',
    serviceType: 'Bảo dưỡng định kỳ',
    serviceAdvisor: 'Trần Thị Mai',
    deliveredDaysAgo: 3,
    deliveredTime: '10:15',
    receiveDaysBeforeDelivery: 0,
    promisedOffsetDays: 0,
    licensePlate: '60A-773.12',
    carBrand: 'Toyota',
    carModel: 'Corolla Cross 1.8HV',
    vin: 'MR2K23AG7P0098711',
    odoKm: 30120,
    ownerName: 'Hoàng Minh Đức',
    contactName: 'Hoàng Minh Đức',
    contactPhone: '',
    contactEmail: 'duc.hoang@ducphat.vn',
    isDriverOrProxy: false,
    revenue: 3120000,
    lastCalledDaysAgo: null,
    customerNote: 'Bảo dưỡng định kỳ 30.000 km xe Hybrid, vệ sinh lọc gió pin.',
    items: [
      { id: 'i16', code: 'BD-30K-HV', name: 'Bảo dưỡng định kỳ mốc 30.000 km (Hybrid)', category: 'Công thợ', qty: 1, unit: 'Gói', unitPrice: 1200000, total: 1200000 },
      { id: 'i17', code: 'PT-OIL0W16', name: 'Dầu động cơ 0W-16 chuyên dụng Hybrid', category: 'Vật tư', qty: 4.2, unit: 'Lít', unitPrice: 350000, total: 1470000 },
      { id: 'i18', code: 'PT-FLT-HV', name: 'Lọc nhớt + vệ sinh lọc gió làm mát pin Hybrid', category: 'Phụ tùng', qty: 1, unit: 'Bộ', unitPrice: 450000, total: 450000 },
    ],
  },
  {
    id: 'ro-scan-07',
    roCode: 'RO-2611-0381',
    branch: 'Xưởng Dịch vụ Quận 7',
    serviceType: 'Sửa chữa chung',
    serviceAdvisor: 'Đỗ Hoàng Minh',
    deliveredDaysAgo: 2,
    deliveredTime: '18:00',
    receiveDaysBeforeDelivery: 1,
    promisedOffsetDays: 0,
    licensePlate: '51D-609.33',
    carBrand: 'Ford',
    carModel: 'Ranger Wildtrak',
    vin: 'MNBLMFF60PW192831',
    odoKm: 75400,
    ownerName: 'Công ty CP Xây dựng An Thịnh',
    contactName: 'Phan Thanh Sơn',
    contactPhone: '0908 331 745',
    contactEmail: 'son.phan@anthinhcons.vn',
    isDriverOrProxy: true,
    revenue: 7850000,
    lastCalledDaysAgo: 4, // Called 4 days ago -> filtered out when recent-call rule >= 4 days is ON!
    customerNote: 'Xe đội công ty quay lại xưởng bổ sung thay má phanh sau.',
    items: [
      { id: 'i19', code: 'PT-BRK-R', name: 'Bộ má phanh sau chính hãng Ford', category: 'Phụ tùng', qty: 1, unit: 'Bộ', unitPrice: 3250000, total: 3250000 },
      { id: 'i20', code: 'PT-DSC-R', name: 'Láng đĩa phanh & thay dầu phanh DOT4', category: 'Công thợ', qty: 1, unit: 'Gói', unitPrice: 1450000, total: 1450000 },
      { id: 'i21', code: 'PT-BAT-80', name: 'Thay bình ắc-quy Varta DIN80', category: 'Phụ tùng', qty: 1, unit: 'Bình', unitPrice: 3150000, total: 3150000 },
    ],
  },
  {
    id: 'ro-scan-08',
    roCode: 'RO-2611-0428',
    branch: 'Xưởng Dịch vụ Quận 7',
    serviceType: 'Bảo dưỡng định kỳ',
    serviceAdvisor: 'Nguyễn Văn Tuấn',
    deliveredDaysAgo: 1,
    deliveredTime: '16:45',
    receiveDaysBeforeDelivery: 0,
    promisedOffsetDays: 0,
    licensePlate: '51K-934.15',
    carBrand: 'Kia',
    carModel: 'Carnival 2.2D Signature',
    vin: 'RNYMB814BPC077123',
    odoKm: 20180,
    ownerName: 'Lý Quang Minh',
    contactName: 'Lý Quang Minh',
    contactPhone: '0903 778 214',
    contactEmail: 'minh.ly@quangminhgroup.vn',
    isDriverOrProxy: false,
    revenue: 5290000,
    lastCalledDaysAgo: null,
    items: [
      { id: 'i22', code: 'BD-20K-D', name: 'Bảo dưỡng định kỳ cấp trung 20.000 km máy dầu', category: 'Công thợ', qty: 1, unit: 'Gói', unitPrice: 1450000, total: 1450000 },
      { id: 'i23', code: 'PT-OIL-D', name: 'Dầu động cơ Diesel 5W-30 C3', category: 'Vật tư', qty: 6, unit: 'Lít', unitPrice: 340000, total: 2040000 },
      { id: 'i24', code: 'PT-FLT-D', name: 'Lọc nhiên liệu Diesel + Lọc nhớt', category: 'Phụ tùng', qty: 1, unit: 'Bộ', unitPrice: 1800000, total: 1800000 },
    ],
  },
  {
    id: 'ro-scan-09',
    roCode: 'RO-2611-0425',
    branch: 'Xưởng Dịch vụ Quận 7',
    serviceType: 'Sửa chữa chung',
    serviceAdvisor: 'Lê Xuân Nguyên',
    deliveredDaysAgo: 1,
    deliveredTime: '14:50',
    receiveDaysBeforeDelivery: 1,
    promisedOffsetDays: 0,
    licensePlate: '51F-820.77',
    carBrand: 'VinFast',
    carModel: 'VF 8 Plus',
    vin: 'RLLV8A2E9PH004812',
    odoKm: 18600,
    ownerName: 'Bùi Thị Ngọc Ánh',
    contactName: 'Bùi Thị Ngọc Ánh',
    contactPhone: '0989 224 510',
    contactEmail: 'anh.bui@gmail.com',
    isDriverOrProxy: false,
    revenue: 2950000,
    lastCalledDaysAgo: null,
    items: [
      { id: 'i25', code: 'EV-DIAG', name: 'Kiểm tra hệ thống điều hòa & cập nhật phần mềm điều khiển', category: 'Công thợ', qty: 1, unit: 'Gói', unitPrice: 1150000, total: 1150000 },
      { id: 'i26', code: 'PT-WIP-EV', name: 'Thay bộ gạt mưa trước sau & lọc gió HEPA', category: 'Phụ tùng', qty: 1, unit: 'Bộ', unitPrice: 1800000, total: 1800000 },
    ],
  },
  {
    id: 'ro-scan-10',
    roCode: 'RO-2611-0362',
    branch: 'Xưởng Dịch vụ Quận 7',
    serviceType: 'Đồng sơn & Bảo hiểm',
    serviceAdvisor: 'Phạm Quốc Bảo',
    deliveredDaysAgo: 5,
    deliveredTime: '15:10',
    receiveDaysBeforeDelivery: 3,
    promisedOffsetDays: 0,
    licensePlate: '51H-123.99',
    carBrand: 'BMW',
    carModel: '320i M Sport',
    vin: 'WBA5F31080N118290',
    odoKm: 28500,
    ownerName: 'Trương Quốc Vinh',
    contactName: 'Trương Quốc Vinh',
    contactPhone: '0909 811 456',
    contactEmail: 'vinh.truong@vinhstudio.vn',
    isDriverOrProxy: false,
    revenue: 9600000,
    lastCalledDaysAgo: null,
    items: [
      { id: 'i27', code: 'DS-DOOR-RL', name: 'Gò phục hồi & sơn cửa sau bên trái', category: 'Công thợ', qty: 1, unit: 'Cánh', unitPrice: 5400000, total: 5400000 },
      { id: 'i28', code: 'DS-FEND-RL', name: 'Sơn vè hông sau bên trái & phủ bóng Ceramic cục bộ', category: 'Công thợ', qty: 1, unit: 'Hạng mục', unitPrice: 4200000, total: 4200000 },
    ],
  },
  {
    id: 'ro-scan-11',
    roCode: 'RO-2611-0404',
    branch: 'Xưởng Dịch vụ Thủ Đức',
    serviceType: 'Bảo dưỡng định kỳ',
    serviceAdvisor: 'Đỗ Hoàng Minh',
    deliveredDaysAgo: 2,
    deliveredTime: '11:25',
    receiveDaysBeforeDelivery: 0,
    promisedOffsetDays: 0,
    licensePlate: '51K-345.70',
    carBrand: 'Mitsubishi',
    carModel: 'Xpander Cross',
    vin: 'RL4NC1W2XPN022341',
    odoKm: 35400,
    ownerName: 'Ngô Văn Hùng',
    contactName: 'Ngô Văn Hùng',
    contactPhone: '0912 456 781',
    contactEmail: 'hung.ngo@gmail.com',
    isDriverOrProxy: false,
    revenue: 3680000,
    lastCalledDaysAgo: null,
    items: [
      { id: 'i29', code: 'BD-35K', name: 'Bảo dưỡng định kỳ cấp nhỏ + vệ sinh kim phun', category: 'Công thợ', qty: 1, unit: 'Gói', unitPrice: 1380000, total: 1380000 },
      { id: 'i30', code: 'PT-OIL-M', name: 'Dầu máy 5W-30 + Lọc nhớt + Dung dịch súc béc', category: 'Vật tư', qty: 1, unit: 'Bộ', unitPrice: 2300000, total: 2300000 },
    ],
  },
  {
    id: 'ro-scan-12',
    roCode: 'RO-2611-0392',
    branch: 'Xưởng Dịch vụ Tân Bình',
    serviceType: 'Thay thế phụ tùng / Lốp',
    serviceAdvisor: 'Trần Thị Mai',
    deliveredDaysAgo: 3,
    deliveredTime: '17:30',
    receiveDaysBeforeDelivery: 1,
    promisedOffsetDays: 0,
    licensePlate: '51A-992.18',
    carBrand: 'Toyota',
    carModel: 'Camry 2.5Q',
    vin: 'MR0B23HK6N0145672',
    odoKm: 61200,
    ownerName: 'Công ty TNHH Thương Mại Phát Đạt',
    contactName: 'Hồ Tấn Lộc',
    contactPhone: '0932 998 412',
    contactEmail: 'loc.ho@phatdattrade.vn',
    isDriverOrProxy: true,
    revenue: 8420000,
    lastCalledDaysAgo: null,
    items: [
      { id: 'i31', code: 'PT-BRK-SET', name: 'Thay bộ má phanh trước & sau chính hãng Toyota', category: 'Phụ tùng', qty: 1, unit: 'Bộ', unitPrice: 5920000, total: 5920000 },
      { id: 'i32', code: 'PT-SPK-4', name: 'Thay 4 bugi Iridium chính hãng', category: 'Phụ tùng', qty: 4, unit: 'Cái', unitPrice: 625000, total: 2500000 },
    ],
  },
  {
    id: 'ro-scan-13',
    roCode: 'RO-2611-0351',
    branch: 'Xưởng Dịch vụ Quận 7',
    serviceType: 'Sửa chữa chung',
    serviceAdvisor: 'Lê Xuân Nguyên',
    deliveredDaysAgo: 6,
    deliveredTime: '13:45',
    receiveDaysBeforeDelivery: 1,
    promisedOffsetDays: 0,
    licensePlate: '51K-618.42',
    carBrand: 'Mazda',
    carModel: 'Mazda 3 Luxury',
    vin: 'RN2BP1920PC081234',
    odoKm: 44900,
    ownerName: 'Nguyễn Thị Kim Ngân',
    contactName: 'Nguyễn Thị Kim Ngân',
    contactPhone: '0965 110 284',
    contactEmail: 'ngan.nguyen@gmail.com',
    isDriverOrProxy: false,
    revenue: 4780000,
    lastCalledDaysAgo: null,
    items: [
      { id: 'i33', code: 'PT-AC-COMP', name: 'Bảo dưỡng lốc lạnh, nạp gas R134a & thay phin lọc gas', category: 'Công thợ', qty: 1, unit: 'Gói', unitPrice: 3180000, total: 3180000 },
      { id: 'i34', code: 'PT-BELT-01', name: 'Thay dây curoa tổng & bi tăng tổng', category: 'Phụ tùng', qty: 1, unit: 'Bộ', unitPrice: 1600000, total: 1600000 },
    ],
  },
];

export const FeedbackRoScannerModal: React.FC<FeedbackRoScannerModalProps> = ({
  isOpen,
  onClose,
  existingRoCodes,
  onConfirmCreate,
}) => {
  const today = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

  // Editable local copy of RO pool so inline "Bổ sung nhanh" persists during session
  const [roPool, setRoPool] = useState<ScannableRoRecord[]>(INITIAL_RO_DATASET);

  // Filter states (Phần 1)
  const [isVehicleDelivered, setIsVehicleDelivered] = useState<boolean>(true);
  const [datePreset, setDatePreset] = useState<DatePreset>('custom');
  const [customDateFrom, setCustomDateFrom] = useState<string>(() => formatDateISO(shiftDays(new Date(), -3)));
  const [customDateTo, setCustomDateTo] = useState<string>(() => formatDateISO(shiftDays(new Date(), -2)));
  const [selectedBranch, setSelectedBranch] = useState<string>(DEFAULT_USER_BRANCH);
  const [selectedServiceType, setSelectedServiceType] = useState<string>('Tất cả loại dịch vụ');
  const [selectedAdvisor, setSelectedAdvisor] = useState<string>('Tất cả CVDV');
  const [quickSearch, setQuickSearch] = useState<string>('');
  const [roDropdownOpen, setRoDropdownOpen] = useState<boolean>(false);
  const [roDropdownQuery, setRoDropdownQuery] = useState<string>('');

  // Control Rules
  const [onlyUnevaluated, setOnlyUnevaluated] = useState<boolean>(true);
  const [skipRecentlyCalled, setSkipRecentlyCalled] = useState<boolean>(true);
  const [recentCallDays, setRecentCallDays] = useState<number>(7);

  // Whether the user has clicked "Quét danh sách RO" yet
  const [hasScanned, setHasScanned] = useState<boolean>(false);

  // Applied scan snapshot (updated ONLY when clicking "Quét danh sách RO")
  const [appliedCriteria, setAppliedCriteria] = useState({
    isVehicleDelivered: true,
    customDateFrom: formatDateISO(shiftDays(new Date(), -3)),
    customDateTo: formatDateISO(shiftDays(new Date(), -2)),
    branch: DEFAULT_USER_BRANCH,
    serviceType: 'Tất cả loại dịch vụ',
    advisor: 'Tất cả CVDV',
    quickSearch: '',
    onlyUnevaluated: true,
    skipRecentlyCalled: true,
    recentCallDays: 7,
  });

  // Selection state
  const [selectedRoIds, setSelectedRoIds] = useState<string[]>([]);

  // Inline quick-add phone state
  const [editingPhoneRoId, setEditingPhoneRoId] = useState<string | null>(null);
  const [editingPhoneValue, setEditingPhoneValue] = useState<string>('');
  const [editingPhoneError, setEditingPhoneError] = useState<string>('');

  // Quick RO detail slide-over drawer
  const [detailRoId, setDetailRoId] = useState<string | null>(null);

  const selectAllCheckboxRef = useRef<HTMLInputElement>(null);
  const roDropdownRef = useRef<HTMLDivElement>(null);
  const roSearchInputRef = useRef<HTMLInputElement>(null);

  const resolveDateRange = (
    fromIso: string,
    toIso: string
  ): { from: Date; to: Date } => {
    const parsedFrom = fromIso ? new Date(`${fromIso}T00:00:00`) : shiftDays(today, -7);
    const parsedTo = toIso ? new Date(`${toIso}T00:00:00`) : today;
    return {
      from: isNaN(parsedFrom.getTime()) ? shiftDays(today, -7) : parsedFrom,
      to: isNaN(parsedTo.getTime()) ? today : parsedTo,
    };
  };

  const existingRoCodeSet = useMemo(
    () => new Set(existingRoCodes.map((c) => c.trim().toUpperCase()).filter(Boolean)),
    [existingRoCodes]
  );

  const computeScannedList = (
    pool: ScannableRoRecord[],
    criteria: typeof appliedCriteria
  ): ScannableRoRecord[] => {
    const { from, to } = resolveDateRange(
      criteria.customDateFrom,
      criteria.customDateTo
    );
    const searchNorm = criteria.quickSearch.trim().toLowerCase();

    return pool.filter((ro) => {
      // 1. Delivery date range check (applies when "Đã giao xe" is checked)
      if (criteria.isVehicleDelivered) {
        const deliveredDate = shiftDays(today, -ro.deliveredDaysAgo);
        if (deliveredDate < from || deliveredDate > to) return false;
      }

      // 2. Branch check
      if (criteria.branch !== 'Tất cả chi nhánh' && ro.branch !== criteria.branch) {
        return false;
      }

      // 3. Service type check
      if (
        criteria.serviceType !== 'Tất cả loại dịch vụ' &&
        ro.serviceType !== criteria.serviceType
      ) {
        return false;
      }

      // 4. Service advisor check
      if (criteria.advisor !== 'Tất cả CVDV' && ro.serviceAdvisor !== criteria.advisor) {
        return false;
      }

      // 5. Quick search by plate or RO code
      if (searchNorm) {
        const plateNorm = ro.licensePlate.toLowerCase();
        const plateCompact = plateNorm.replace(/[-.\s]/g, '');
        const searchCompact = searchNorm.replace(/[-.\s]/g, '');
        const roNorm = ro.roCode.toLowerCase();
        if (
          !plateNorm.includes(searchNorm) &&
          !plateCompact.includes(searchCompact) &&
          !roNorm.includes(searchNorm)
        ) {
          return false;
        }
      }

      // 6. Optional/default-ON rule: exclude ROs that already have an evaluation
      if (criteria.onlyUnevaluated) {
        if (ro.alreadyEvaluated || existingRoCodeSet.has(ro.roCode.trim().toUpperCase())) {
          return false;
        }
      }

      // 7. Anti-spam rule: skip recently called vehicles within N days
      if (
        criteria.skipRecentlyCalled &&
        ro.lastCalledDaysAgo !== null &&
        ro.lastCalledDaysAgo <= criteria.recentCallDays
      ) {
        return false;
      }

      return true;
    });
  };

  const scannedRos = useMemo(
    () => (hasScanned ? computeScannedList(roPool, appliedCriteria) : []),
    [hasScanned, roPool, appliedCriteria, existingRoCodeSet]
  );

  const validRos = useMemo(
    () => scannedRos.filter((ro) => isValidVietnamesePhone(ro.contactPhone)),
    [scannedRos]
  );

  const attentionRos = useMemo(
    () => scannedRos.filter((ro) => !isValidVietnamesePhone(ro.contactPhone)),
    [scannedRos]
  );

  // Check if draft filters differ from applied criteria (only relevant after a scan)
  const hasPendingFilterChanges =
    hasScanned &&
    (isVehicleDelivered !== appliedCriteria.isVehicleDelivered ||
      customDateFrom !== appliedCriteria.customDateFrom ||
      customDateTo !== appliedCriteria.customDateTo ||
      selectedBranch !== appliedCriteria.branch ||
      selectedServiceType !== appliedCriteria.serviceType ||
      selectedAdvisor !== appliedCriteria.advisor ||
      quickSearch !== appliedCriteria.quickSearch ||
      onlyUnevaluated !== appliedCriteria.onlyUnevaluated ||
      skipRecentlyCalled !== appliedCriteria.skipRecentlyCalled ||
      recentCallDays !== appliedCriteria.recentCallDays);

  const filteredRoListOptions = useMemo(() => {
    const q = roDropdownQuery.trim().toLowerCase();
    if (!q) return roPool;
    const qCompact = q.replace(/[-.\s]/g, '');
    return roPool.filter((ro) => {
      const plate = ro.licensePlate.toLowerCase();
      const plateCompact = plate.replace(/[-.\s]/g, '');
      const roCode = ro.roCode.toLowerCase();
      const combined = `${plate} - ${roCode}`;
      return (
        plate.includes(q) ||
        plateCompact.includes(qCompact) ||
        roCode.includes(q) ||
        combined.includes(q)
      );
    });
  }, [roPool, roDropdownQuery]);

  const selectedRoOptionObj = useMemo(
    () => roPool.find((ro) => ro.roCode === quickSearch) || null,
    [roPool, quickSearch]
  );

  // Close searchable plate/RO dropdown on outside click
  useEffect(() => {
    if (!roDropdownOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        roDropdownRef.current &&
        !roDropdownRef.current.contains(event.target as Node)
      ) {
        setRoDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [roDropdownOpen]);

  // Focus search input when opening plate/RO dropdown
  useEffect(() => {
    if (roDropdownOpen) {
      requestAnimationFrame(() => roSearchInputRef.current?.focus());
    }
  }, [roDropdownOpen]);

  // Reset filters and do NOT auto-display data when modal opens
  useEffect(() => {
    if (!isOpen) return;
    const defaultFrom = formatDateISO(shiftDays(today, -3));
    const defaultTo = formatDateISO(shiftDays(today, -2));
    setIsVehicleDelivered(true);
    setDatePreset('custom');
    setCustomDateFrom(defaultFrom);
    setCustomDateTo(defaultTo);
    setSelectedBranch(DEFAULT_USER_BRANCH);
    setSelectedServiceType('Tất cả loại dịch vụ');
    setSelectedAdvisor('Tất cả CVDV');
    setQuickSearch('');
    setRoDropdownOpen(false);
    setRoDropdownQuery('');
    setOnlyUnevaluated(true);
    setSkipRecentlyCalled(true);
    setRecentCallDays(7);
    setHasScanned(false);
    setSelectedRoIds([]);
    setEditingPhoneRoId(null);
    setDetailRoId(null);
  }, [isOpen]);

  // Sync indeterminate state on header select-all checkbox
  useEffect(() => {
    if (!selectAllCheckboxRef.current) return;
    const validIds = validRos.map((r) => r.id);
    const selectedValidCount = validIds.filter((id) => selectedRoIds.includes(id)).length;
    selectAllCheckboxRef.current.indeterminate =
      selectedValidCount > 0 && selectedValidCount < validIds.length;
  }, [selectedRoIds, validRos]);

  if (!isOpen) return null;

  const handleApplyDatePreset = (preset: 'yesterday' | 'last_7_days') => {
    setDatePreset(preset);
    if (preset === 'yesterday') {
      const yIso = formatDateISO(shiftDays(today, -1));
      setCustomDateFrom(yIso);
      setCustomDateTo(yIso);
    } else {
      setCustomDateFrom(formatDateISO(shiftDays(today, -7)));
      setCustomDateTo(formatDateISO(today));
    }
  };

  const handleScanRos = () => {
    const nextCriteria = {
      isVehicleDelivered,
      customDateFrom,
      customDateTo,
      branch: selectedBranch,
      serviceType: selectedServiceType,
      advisor: selectedAdvisor,
      quickSearch,
      onlyUnevaluated,
      skipRecentlyCalled,
      recentCallDays: Math.max(1, Number(recentCallDays) || 7),
    };
    setAppliedCriteria(nextCriteria);
    setHasScanned(true);
    setEditingPhoneRoId(null);
    const nextMatches = computeScannedList(roPool, nextCriteria);
    // Auto-check all valid ROs, keep invalid ROs unchecked
    setSelectedRoIds(
      nextMatches
        .filter((ro) => isValidVietnamesePhone(ro.contactPhone))
        .map((ro) => ro.id)
    );
  };

  const validRoIds = validRos.map((r) => r.id);
  const selectedValidIds = selectedRoIds.filter((id) => validRoIds.includes(id));
  const allValidSelected =
    validRoIds.length > 0 && selectedValidIds.length === validRoIds.length;

  const handleToggleSelectAllValid = () => {
    if (allValidSelected) {
      setSelectedRoIds([]);
    } else {
      setSelectedRoIds(validRoIds);
    }
  };

  const handleToggleSingleRo = (ro: ScannableRoRecord) => {
    if (!isValidVietnamesePhone(ro.contactPhone)) return;
    setSelectedRoIds((prev) =>
      prev.includes(ro.id) ? prev.filter((id) => id !== ro.id) : [...prev, ro.id]
    );
  };

  const handleStartQuickPhoneEdit = (ro: ScannableRoRecord) => {
    setEditingPhoneRoId(ro.id);
    setEditingPhoneValue(ro.contactPhone || '');
    setEditingPhoneError('');
  };

  const handleSaveQuickPhone = (roId: string) => {
    const trimmed = editingPhoneValue.trim();
    if (!isValidVietnamesePhone(trimmed)) {
      setEditingPhoneError('SĐT chưa hợp lệ (cần 10–11 số, bắt đầu bằng 0 hoặc +84)');
      return;
    }
    setRoPool((prev) =>
      prev.map((ro) => (ro.id === roId ? { ...ro, contactPhone: trimmed } : ro))
    );
    // Automatically select the now-valid RO
    setSelectedRoIds((prev) => (prev.includes(roId) ? prev : [...prev, roId]));
    setEditingPhoneRoId(null);
    setEditingPhoneValue('');
    setEditingPhoneError('');
  };

  const handleConfirm = () => {
    const selectedRosToCreate = scannedRos.filter(
      (ro) => selectedValidIds.includes(ro.id) && isValidVietnamesePhone(ro.contactPhone)
    );
    if (selectedRosToCreate.length === 0) return;

    const todayStr = formatDateDDMMYYYY(today);
    const newRecords: PotentialCustomerItem[] = selectedRosToCreate.map((ro, idx) => {
      const actualDateObj = shiftDays(today, -ro.deliveredDaysAgo);
      const receiveDateObj = shiftDays(actualDateObj, -ro.receiveDaysBeforeDelivery);
      const promisedDateObj = shiftDays(actualDateObj, ro.promisedOffsetDays);

      const receiveStr = formatDateDDMMYYYY(receiveDateObj);
      const promisedStr = formatDateDDMMYYYY(promisedDateObj);
      const actualStr = formatDateDDMMYYYY(actualDateObj);

      return {
        id: `fb-ro-${Date.now()}-${idx}`,
        code: ro.roCode,
        name: `Đánh giá CLDV - ${ro.roCode}`,
        channelUserCode: ro.roCode,
        fullName: ro.isDriverOrProxy ? `${ro.contactName} (Tài xế / Người đi làm xe)` : ro.contactName,
        garageName: ro.branch,
        phone: ro.contactPhone,
        email: ro.contactEmail || '',
        demands: ['Bảo dưỡng định kỳ'],
        taxCode: '',
        registrationDate: todayStr,
        appointmentDate: todayStr,
        appointmentTimeSlot: '09:00 - 10:00',
        status: 'Mới',
        address: ro.branch,
        link: '',
        startDate: receiveStr,
        endDate: actualStr,
        isLocked: false,
        source: 'Website',
        callStatus: 'Chưa gọi',
        callResult: 'Gọi lần 1',
        licensePlate: ro.licensePlate,
        carBrand: ro.carBrand,
        carModel: ro.carModel,
        originalRoCode: ro.roCode,
        serviceAdvisor: ro.serviceAdvisor,
        originalRoDates: `${receiveStr} - ${promisedStr}`,
        vehicleReceiveDate: receiveStr,
        promisedDeliveryDate: promisedStr,
        actualDeliveryDate: actualStr,
        originalRoRevenue: formatVnd(ro.revenue),
        createdBy: 'Chủ xưởng',
        notes: ro.isDriverOrProxy
          ? `Người liên hệ trực tiếp: ${ro.contactName} (Tài xế / Người đi làm xe) — Chủ xe: ${ro.ownerName}. Loại DV: ${ro.serviceType}.`
          : `Loại DV: ${ro.serviceType} (${ro.branch}).`,
      };
    });

    onConfirmCreate(newRecords);
    onClose();
  };

  const activeRange = resolveDateRange(customDateFrom, customDateTo);
  const detailRo = detailRoId ? roPool.find((r) => r.id === detailRoId) || null : null;

  return (
    <div className="fixed inset-0 z-[140] bg-slate-50 flex flex-col overflow-hidden font-sans text-slate-800">
      {/* Top Header Bar */}
      <header className="h-14 px-6 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <h2 className="text-base font-bold text-slate-900 truncate">
            Thêm phiếu Phản ánh từ danh sách RO
          </h2>
          <span className="text-slate-300 select-none" aria-hidden="true">
            /
          </span>
          <span className="text-xs text-slate-500 whitespace-nowrap">
            Quét RO đã bàn giao &amp; tạo danh sách gọi CSKH
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          title="Đóng màn hình"
        >
          <X className="w-4 h-4" />
          <span>Đóng</span>
        </button>
      </header>

      {/* Main 2-Part Horizontal Split (Top: Filter Panel, Bottom: Results & Confirmation) */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* ================= PHẦN 1: BỘ LỌC (FILTER PANEL) ================= */}
        <section className="bg-white border-b border-slate-200 px-6 py-4 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-slate-500 tracking-wide uppercase">
              Phần 1 · Bộ lọc dữ liệu RO
            </h3>
            <div className="text-xs text-slate-500 tabular-nums">
              Khoảng ngày bàn giao:{' '}
              <span className="font-semibold text-slate-800">
                {formatDateDDMMYYYY(activeRange.from)} – {formatDateDDMMYYYY(activeRange.to)}
              </span>
            </div>
          </div>

          {/* 1. Nhóm tiêu chí lọc chính */}
          <div className="flex flex-wrap items-start gap-3">
            {/* Đã giao xe (tick/un-tick) */}
            <div className="shrink-0 flex flex-col">
              <span
                className="block text-xs font-medium text-transparent mb-1.5 select-none"
                aria-hidden="true"
              >
                &nbsp;
              </span>
              <label className="h-9 px-3 border border-slate-300 rounded-md bg-white inline-flex items-center gap-2 cursor-pointer select-none hover:border-slate-400 transition-colors">
                <input
                  type="checkbox"
                  checked={isVehicleDelivered}
                  onChange={(e) => setIsVehicleDelivered(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-[#1A73E8] focus:ring-[#1A73E8] cursor-pointer"
                />
                <span className="text-xs font-medium text-slate-800 whitespace-nowrap">
                  Đã giao xe
                </span>
              </label>
            </div>

            {/* Ngày bàn giao xe thực tế [Bắt buộc] */}
            <div className="shrink-0">
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Ngày bàn giao thực tế <span className="text-red-600">*</span>
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="date"
                  value={customDateFrom}
                  onChange={(e) => {
                    setCustomDateFrom(e.target.value);
                    setDatePreset('custom');
                  }}
                  className="h-9 px-2.5 border border-slate-300 rounded-md text-xs text-slate-800 bg-white outline-none focus:border-[#1A73E8] tabular-nums"
                  aria-label="Từ ngày"
                />
                <span className="text-xs text-slate-400">–</span>
                <input
                  type="date"
                  value={customDateTo}
                  onChange={(e) => {
                    setCustomDateTo(e.target.value);
                    setDatePreset('custom');
                  }}
                  className="h-9 px-2.5 border border-slate-300 rounded-md text-xs text-slate-800 bg-white outline-none focus:border-[#1A73E8] tabular-nums"
                  aria-label="Đến ngày"
                />
              </div>
              <div className="mt-1.5 flex items-center gap-1.5">
                {(
                  [
                    { id: 'yesterday', label: 'Hôm qua' },
                    { id: 'last_7_days', label: '7 ngày qua' },
                  ] as { id: 'yesterday' | 'last_7_days'; label: string }[]
                ).map((preset) => {
                  const active = datePreset === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleApplyDatePreset(preset.id)}
                      className={`px-2.5 py-1 text-[11px] font-medium rounded border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                        active
                          ? 'bg-[#1A73E8] text-white border-[#1A73E8]'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Chi nhánh / Xưởng [Bắt buộc] */}
            <div className="min-w-[195px] flex-1 max-w-[240px]">
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Chi nhánh / Xưởng <span className="text-red-600">*</span>
              </label>
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="w-full h-9 px-2.5 border border-slate-300 rounded-md text-xs text-slate-800 bg-white outline-none focus:border-[#1A73E8]"
              >
                {BRANCH_OPTIONS.map((b) => (
                  <option key={b} value={b}>
                    {b === DEFAULT_USER_BRANCH ? `${b} (Mặc định)` : b}
                  </option>
                ))}
              </select>
            </div>

            {/* Loại dịch vụ [Tùy chọn] */}
            <div className="min-w-[165px] flex-1 max-w-[215px]">
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Loại dịch vụ
              </label>
              <select
                value={selectedServiceType}
                onChange={(e) => setSelectedServiceType(e.target.value)}
                className="w-full h-9 px-2.5 border border-slate-300 rounded-md text-xs text-slate-800 bg-white outline-none focus:border-[#1A73E8]"
              >
                {SERVICE_TYPE_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Cố vấn dịch vụ [Tùy chọn] */}
            <div className="min-w-[155px] flex-1 max-w-[200px]">
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Cố vấn dịch vụ
              </label>
              <select
                value={selectedAdvisor}
                onChange={(e) => setSelectedAdvisor(e.target.value)}
                className="w-full h-9 px-2.5 border border-slate-300 rounded-md text-xs text-slate-800 bg-white outline-none focus:border-[#1A73E8]"
              >
                {CVDV_OPTIONS.map((adv) => (
                  <option key={adv} value={adv}>
                    {adv}
                  </option>
                ))}
              </select>
            </div>

            {/* Tìm Biển số xe / Mã RO [Dạng list, cho phép search, hiển thị: Biển số xe - RO] */}
            <div
              ref={roDropdownRef}
              className="min-w-[220px] flex-1 max-w-[280px] relative"
            >
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Tìm Biển số xe / Mã RO
              </label>
              <div
                role="combobox"
                aria-expanded={roDropdownOpen}
                aria-haspopup="listbox"
                tabIndex={0}
                onClick={() => setRoDropdownOpen((prev) => !prev)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setRoDropdownOpen((prev) => !prev);
                  }
                }}
                className={`w-full h-9 px-2.5 border rounded-md text-xs bg-white flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                  roDropdownOpen
                    ? 'border-[#1A73E8] ring-1 ring-[#1A73E8]/20'
                    : 'border-slate-300 hover:border-slate-400'
                }`}
              >
                <span
                  className={`truncate ${
                    selectedRoOptionObj ? 'text-slate-900 font-medium' : 'text-slate-400'
                  }`}
                >
                  {selectedRoOptionObj
                    ? `${selectedRoOptionObj.licensePlate} - ${selectedRoOptionObj.roCode}`
                    : 'Chọn Biển số xe - RO'}
                </span>
                <div className="flex items-center gap-1 shrink-0">
                  {quickSearch && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setQuickSearch('');
                        setRoDropdownQuery('');
                      }}
                      className="p-0.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                      aria-label="Xóa lựa chọn"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                      roDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </div>

              {roDropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white border border-slate-200 rounded-md shadow-lg overflow-hidden">
                  <div className="p-2 border-b border-slate-100 bg-slate-50">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        ref={roSearchInputRef}
                        type="text"
                        value={roDropdownQuery}
                        onChange={(e) => setRoDropdownQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Escape') {
                            setRoDropdownOpen(false);
                          }
                        }}
                        placeholder="Tìm biển số hoặc mã RO..."
                        className="w-full h-8 pl-8 pr-7 border border-slate-300 rounded text-xs text-slate-800 bg-white outline-none focus:border-[#1A73E8]"
                      />
                      {roDropdownQuery && (
                        <button
                          type="button"
                          onClick={() => setRoDropdownQuery('')}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                          aria-label="Xóa từ khóa tìm kiếm"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div
                    role="listbox"
                    className="max-h-56 overflow-y-auto py-1 divide-y divide-slate-50"
                  >
                    {!roDropdownQuery.trim() && (
                      <button
                        type="button"
                        role="option"
                        aria-selected={!quickSearch}
                        onClick={() => {
                          setQuickSearch('');
                          setRoDropdownOpen(false);
                        }}
                        className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between transition-colors cursor-pointer ${
                          !quickSearch
                            ? 'bg-blue-50 text-[#1A73E8] font-medium'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span>Tất cả Biển số xe - RO</span>
                        {!quickSearch && <Check className="w-3.5 h-3.5 shrink-0" />}
                      </button>
                    )}
                    {filteredRoListOptions.length > 0 ? (
                      filteredRoListOptions.map((ro) => {
                        const isSelected = quickSearch === ro.roCode;
                        return (
                          <button
                            key={ro.id}
                            type="button"
                            role="option"
                            aria-selected={isSelected}
                            onClick={() => {
                              setQuickSearch(ro.roCode);
                              setRoDropdownQuery('');
                              setRoDropdownOpen(false);
                            }}
                            className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-blue-50 text-[#1A73E8] font-semibold'
                                : 'text-slate-800 hover:bg-slate-50'
                            }`}
                          >
                            <span className="truncate tabular-nums">
                              {ro.licensePlate} - {ro.roCode}
                            </span>
                            {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                          </button>
                        );
                      })
                    ) : (
                      <div className="px-3 py-4 text-center text-xs text-slate-400">
                        Không tìm thấy Biển số xe - RO phù hợp
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 2. Nhóm quy tắc kiểm soát trùng lặp & chống làm phiền + 3. Nút Quét danh sách RO */}
          <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-6">
              {/* Checkbox 1: Allow tick/un-tick */}
              <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={onlyUnevaluated}
                  onChange={(e) => setOnlyUnevaluated(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-[#1A73E8] focus:ring-[#1A73E8] cursor-pointer"
                />
                <span className="text-xs font-medium text-slate-800">
                  Chỉ lấy RO chưa từng tạo đánh giá
                </span>
              </label>

              {/* Toggle 2: Anti-spam recently called vehicles */}
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  role="switch"
                  aria-checked={skipRecentlyCalled}
                  onClick={() => setSkipRecentlyCalled((prev) => !prev)}
                  className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors cursor-pointer ${
                    skipRecentlyCalled ? 'bg-[#1A73E8]' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-xs transition-transform ${
                      skipRecentlyCalled ? 'translate-x-4.5' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className="text-xs font-medium text-slate-800 flex items-center gap-1.5">
                  <span
                    onClick={() => setSkipRecentlyCalled((prev) => !prev)}
                    className="cursor-pointer select-none"
                  >
                    Bỏ qua xe đã được gọi gần đây trong vòng
                  </span>
                  <input
                    type="number"
                    min={1}
                    max={90}
                    disabled={!skipRecentlyCalled}
                    value={recentCallDays}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      setRecentCallDays(isNaN(val) ? 1 : Math.min(90, Math.max(1, val)));
                    }}
                    className={`w-14 h-7 px-2 text-center border rounded text-xs font-semibold tabular-nums outline-none ${
                      skipRecentlyCalled
                        ? 'border-slate-300 bg-white text-slate-900 focus:border-[#1A73E8]'
                        : 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  />
                  <span className="text-slate-600 font-normal">ngày</span>
                </span>
              </div>
            </div>

            {/* 3. Hành động kích hoạt */}
            <div className="flex items-center gap-3">
              {hasPendingFilterChanges && (
                <span className="text-xs text-amber-700 font-medium whitespace-nowrap">
                  Bộ lọc đã thay đổi — nhấn quét để cập nhật
                </span>
              )}
              <button
                type="button"
                onClick={handleScanRos}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[#1A73E8] hover:bg-blue-700 text-white text-sm font-medium shadow-xs transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <ScanSearch className="w-4 h-4" />
                <span>Quét danh sách RO</span>
              </button>
            </div>
          </div>
        </section>

        {/* ================= PHẦN 2: BẢNG KẾT QUẢ & XÁC NHẬN ================= */}
        <section className="flex-1 flex flex-col min-h-0 px-6 pt-3 pb-0">
          {/* 1. Thanh tóm tắt nhanh (Summary Bar) */}
          <div className="bg-white border border-slate-200 rounded-t-lg px-4 py-2.5 flex flex-wrap items-center justify-between gap-4 shrink-0">
            <div className="flex flex-wrap items-center gap-6 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Tổng số RO tìm thấy:</span>
                <span className="text-sm font-bold text-slate-900 tabular-nums">
                  {scannedRos.length}
                </span>
              </div>
              <span className="h-4 w-px bg-slate-200" aria-hidden="true" />
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-slate-500">Số RO hợp lệ đã được chọn sẵn:</span>
                <span className="text-sm font-bold text-emerald-700 tabular-nums">
                  {selectedValidIds.length} / {validRos.length}
                </span>
              </div>
              <span className="h-4 w-px bg-slate-200" aria-hidden="true" />
              <div className="flex items-center gap-2">
                <AlertCircle
                  className={`w-4 h-4 shrink-0 ${
                    attentionRos.length > 0 ? 'text-red-600' : 'text-slate-400'
                  }`}
                />
                <span className="text-slate-500">Số RO cần lưu ý:</span>
                <span
                  className={`text-sm font-bold tabular-nums ${
                    attentionRos.length > 0 ? 'text-red-600' : 'text-slate-600'
                  }`}
                >
                  {attentionRos.length}
                </span>
                {attentionRos.length > 0 && (
                  <span className="text-red-600/90 font-normal">
                    (thiếu SĐT hợp lệ — chưa được chọn)
                  </span>
                )}
              </div>
            </div>

            <div className="text-xs text-slate-500">
              Phần 2 · Danh sách RO kết quả
            </div>
          </div>

          {/* 2. Bảng danh sách RO (Compact Rows) */}
          <div className="flex-1 bg-white border-x border-b border-slate-200 overflow-auto min-h-0">
            {!hasScanned ? (
              <div className="h-full min-h-[260px] flex flex-col items-center justify-center text-center px-6 py-12">
                <ScanSearch className="w-10 h-10 text-slate-300 mb-3" />
                <p className="text-sm font-semibold text-slate-700">
                  Chưa quét danh sách RO
                </p>
                <p className="text-xs text-slate-500 mt-1 max-w-md">
                  Thiết lập điều kiện lọc ở Phần 1 và nhấn nút &ldquo;Quét danh sách RO&rdquo; để tải danh sách dữ liệu.
                </p>
              </div>
            ) : scannedRos.length === 0 ? (
              <div className="h-full min-h-[260px] flex flex-col items-center justify-center text-center px-6 py-12">
                <ScanSearch className="w-10 h-10 text-slate-300 mb-3" />
                <p className="text-sm font-semibold text-slate-700">
                  Không tìm thấy RO nào phù hợp với điều kiện lọc
                </p>
                <p className="text-xs text-slate-500 mt-1 max-w-md">
                  Thử mở rộng khoảng ngày bàn giao thực tế (ví dụ 7 ngày qua), chọn tất cả chi nhánh hoặc tắt bộ lọc chống gọi lặp.
                </p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10 text-xs font-semibold text-slate-600">
                  <tr>
                    <th className="py-2.5 px-3 w-11 text-center">
                      <input
                        ref={selectAllCheckboxRef}
                        type="checkbox"
                        checked={allValidSelected}
                        disabled={validRoIds.length === 0}
                        onChange={handleToggleSelectAllValid}
                        title="Chọn / bỏ chọn tất cả RO hợp lệ"
                        className="w-4 h-4 rounded border-slate-300 text-[#1A73E8] focus:ring-[#1A73E8] cursor-pointer disabled:cursor-not-allowed"
                      />
                    </th>
                    <th className="py-2.5 px-3">Mã RO &amp; Thời gian đã giao xe</th>
                    <th className="py-2.5 px-3">Thông tin Xe</th>
                    <th className="py-2.5 px-3">Người liên hệ &amp; Số điện thoại gọi</th>
                    <th className="py-2.5 px-3 text-right">Doanh thu</th>
                    <th className="py-2.5 px-3">Tên CVDV</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {scannedRos.map((ro) => {
                    const hasValidPhone = isValidVietnamesePhone(ro.contactPhone);
                    const isChecked = hasValidPhone && selectedRoIds.includes(ro.id);
                    const deliveredDate = shiftDays(today, -ro.deliveredDaysAgo);
                    const isEditingPhone = editingPhoneRoId === ro.id;

                    return (
                      <tr
                        key={ro.id}
                        className={`transition-colors ${
                          !hasValidPhone
                            ? 'bg-red-50/40 hover:bg-red-50/70'
                            : isChecked
                            ? 'bg-blue-50/30 hover:bg-blue-50/60'
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        {/* 1. Checkbox */}
                        <td className="py-2.5 px-3 text-center align-middle">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            disabled={!hasValidPhone}
                            onChange={() => handleToggleSingleRo(ro)}
                            title={
                              hasValidPhone
                                ? 'Chọn hoặc bỏ chọn RO này'
                                : 'Không thể chọn vì thiếu số điện thoại hợp lệ — hãy bổ sung nhanh SĐT'
                            }
                            className="w-4 h-4 rounded border-slate-300 text-[#1A73E8] focus:ring-[#1A73E8] cursor-pointer disabled:cursor-not-allowed disabled:opacity-45"
                          />
                        </td>

                        {/* 2. Mã RO & Thời gian đã giao xe */}
                        <td className="py-2.5 px-3 align-middle whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setDetailRoId(ro.id)}
                              className="font-mono font-semibold text-sm text-[#1A73E8] hover:underline cursor-pointer tabular-nums"
                              title="Bấm để xem nhanh chi tiết hạng mục sửa chữa của RO"
                            >
                              {ro.roCode}
                            </button>
                            <span className="text-slate-300" aria-hidden="true">
                              ·
                            </span>
                            <span className="text-slate-700 font-medium">
                              {formatRelativeDelivery(ro.deliveredDaysAgo)}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5 tabular-nums">
                            {formatDateDDMMYYYY(deliveredDate)} · {ro.deliveredTime}
                            <span className="mx-1.5 text-slate-300">/</span>
                            <span>{ro.serviceType}</span>
                          </div>
                        </td>

                        {/* 3. Thông tin Xe (Thực thể trung tâm) */}
                        <td className="py-2.5 px-3 align-middle whitespace-nowrap">
                          <div className="font-mono font-bold text-sm text-slate-900 tracking-tight">
                            {ro.licensePlate}
                          </div>
                          <div className="text-[11px] text-slate-600 mt-0.5">
                            {ro.carBrand} {ro.carModel}
                          </div>
                        </td>

                        {/* 4. Người liên hệ & Số điện thoại gọi */}
                        <td className="py-2.5 px-3 align-middle">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="font-semibold text-slate-900 text-xs">
                              {ro.contactName}
                            </span>
                            {ro.isDriverOrProxy && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-semibold whitespace-nowrap">
                                Tài xế / Người đi làm xe
                              </span>
                            )}
                          </div>

                          {isEditingPhone ? (
                            <div className="mt-1.5 flex flex-col gap-1">
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="tel"
                                  autoFocus
                                  value={editingPhoneValue}
                                  onChange={(e) => {
                                    setEditingPhoneValue(e.target.value);
                                    if (editingPhoneError) setEditingPhoneError('');
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveQuickPhone(ro.id);
                                    if (e.key === 'Escape') setEditingPhoneRoId(null);
                                  }}
                                  placeholder="Nhập SĐT (VD: 0901234567)"
                                  className="w-44 h-7 px-2 border border-[#1A73E8] rounded text-xs text-slate-900 bg-white outline-none tabular-nums"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleSaveQuickPhone(ro.id)}
                                  className="inline-flex items-center gap-1 h-7 px-2.5 rounded bg-[#1A73E8] hover:bg-blue-700 text-white text-[11px] font-medium cursor-pointer whitespace-nowrap"
                                >
                                  <Check className="w-3 h-3" />
                                  <span>Lưu</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingPhoneRoId(null);
                                    setEditingPhoneError('');
                                  }}
                                  className="h-7 px-2 rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-600 text-[11px] font-medium cursor-pointer whitespace-nowrap"
                                >
                                  Hủy
                                </button>
                              </div>
                              {editingPhoneError && (
                                <span className="text-[11px] text-red-600 font-medium">
                                  {editingPhoneError}
                                </span>
                              )}
                            </div>
                          ) : hasValidPhone ? (
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="inline-flex items-center gap-1 font-mono text-slate-700 tabular-nums">
                                <Phone className="w-3 h-3 text-slate-400" />
                                {ro.contactPhone}
                              </span>
                              {ro.isDriverOrProxy && (
                                <span className="text-[11px] text-slate-500">
                                  · Chủ xe: {ro.ownerName}
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 mt-1">
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-100 text-red-700 border border-red-200 text-[11px] font-semibold whitespace-nowrap">
                                <AlertCircle className="w-3 h-3" />
                                Thiếu SĐT
                              </span>
                              <button
                                type="button"
                                onClick={() => handleStartQuickPhoneEdit(ro)}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-[#1A73E8] text-[#1A73E8] bg-white hover:bg-blue-50 text-[11px] font-semibold transition-colors cursor-pointer whitespace-nowrap"
                              >
                                <Pencil className="w-3 h-3" />
                                <span>Bổ sung nhanh</span>
                              </button>
                            </div>
                          )}
                        </td>

                        {/* 5. Doanh thu */}
                        <td className="py-2.5 px-3 align-middle text-right whitespace-nowrap">
                          <span className="font-semibold text-sm text-slate-900 tabular-nums">
                            {formatVnd(ro.revenue)}
                          </span>
                        </td>

                        {/* 6. Tên CVDV */}
                        <td className="py-2.5 px-3 align-middle whitespace-nowrap">
                          <div className="text-slate-800 font-medium">{ro.serviceAdvisor}</div>
                          <div className="text-[11px] text-slate-500">{ro.branch}</div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* ================= FOOTER CONFIRMATION BAR ================= */}
        <footer className="px-6 py-3 bg-white border-t border-slate-200 flex items-center justify-between gap-4 shrink-0">
          <div className="text-xs text-slate-500">
            {selectedValidIds.length > 0 ? (
              <span>
                Sẵn sàng tạo{' '}
                <strong className="text-slate-900 tabular-nums">
                  {selectedValidIds.length} phiếu gọi CSKH
                </strong>{' '}
                từ các RO hợp lệ đã chọn.
              </span>
            ) : (
              <span>Vui lòng chọn ít nhất 1 RO hợp lệ để tạo phiếu đánh giá chất lượng dịch vụ.</span>
            )}
          </div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap"
            >
              Hủy
            </button>
            <button
              type="button"
              disabled={selectedValidIds.length === 0}
              onClick={handleConfirm}
              className={`inline-flex items-center gap-2 px-5 py-2 rounded-md text-sm font-semibold transition-colors whitespace-nowrap ${
                selectedValidIds.length > 0
                  ? 'bg-[#1A73E8] hover:bg-blue-700 text-white shadow-xs cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Check className="w-4 h-4" />
              <span className="tabular-nums">
                Xác nhận ({selectedValidIds.length} RO)
              </span>
            </button>
          </div>
        </footer>
      </div>

      {/* ================= SLIDE-OVER DRAWER: CHI TIẾT NHANH RO ================= */}
      {detailRo && (
        <div
          className="fixed inset-0 z-[150] bg-slate-900/35 flex justify-end"
          onClick={() => setDetailRoId(null)}
        >
          <div
            className="w-full max-w-xl bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-base text-[#1A73E8] tabular-nums">
                    {detailRo.roCode}
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className="text-xs font-medium text-slate-600">
                    {detailRo.serviceType}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
                  Bàn giao thực tế: {formatDateDDMMYYYY(shiftDays(today, -detailRo.deliveredDaysAgo))} lúc{' '}
                  {detailRo.deliveredTime} ({formatRelativeDelivery(detailRo.deliveredDaysAgo)})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDetailRoId(null)}
                className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 transition-colors cursor-pointer"
                aria-label="Đóng chi tiết RO"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-xs pb-4 border-b border-slate-100">
                <div>
                  <div className="text-slate-500 mb-0.5 flex items-center gap-1">
                    <Car className="w-3.5 h-3.5 text-slate-400" />
                    <span>Phương tiện</span>
                  </div>
                  <div className="font-mono font-bold text-sm text-slate-900">
                    {detailRo.licensePlate}
                  </div>
                  <div className="text-slate-600">
                    {detailRo.carBrand} {detailRo.carModel} · ODO{' '}
                    <span className="tabular-nums">{detailRo.odoKm.toLocaleString('vi-VN')} km</span>
                  </div>
                </div>

                <div>
                  <div className="text-slate-500 mb-0.5 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Người liên hệ trên RO</span>
                  </div>
                  <div className="font-semibold text-slate-900">{detailRo.contactName}</div>
                  <div className="text-slate-600 tabular-nums">
                    {detailRo.contactPhone || (
                      <span className="text-red-600 font-semibold">Chưa có SĐT</span>
                    )}
                  </div>
                  {detailRo.isDriverOrProxy && (
                    <div className="text-[11px] text-amber-700 mt-0.5">
                      Tài xế / Người đi làm xe · Chủ xe: {detailRo.ownerName}
                    </div>
                  )}
                </div>

                <div>
                  <div className="text-slate-500 mb-0.5 flex items-center gap-1">
                    <Wrench className="w-3.5 h-3.5 text-slate-400" />
                    <span>Cố vấn dịch vụ</span>
                  </div>
                  <div className="font-medium text-slate-900">{detailRo.serviceAdvisor}</div>
                </div>

                <div>
                  <div className="text-slate-500 mb-0.5 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Chi nhánh thực hiện</span>
                  </div>
                  <div className="font-medium text-slate-900">{detailRo.branch}</div>
                </div>
              </div>

              {detailRo.customerNote && (
                <div className="text-xs bg-slate-50 border border-slate-200 rounded-md p-3">
                  <div className="font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span>Ghi chú bàn giao</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">{detailRo.customerNote}</p>
                </div>
              )}

              {/* Itemized Repair Lines */}
              <div>
                <h4 className="text-xs font-semibold text-slate-700 mb-2">
                  Chi tiết hạng mục sửa chữa &amp; phụ tùng ({detailRo.items.length})
                </h4>
                <div className="border border-slate-200 rounded-md overflow-hidden">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                      <tr>
                        <th className="py-2 px-3">Hạng mục</th>
                        <th className="py-2 px-2 text-center">SL</th>
                        <th className="py-2 px-3 text-right">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {detailRo.items.map((item) => (
                        <tr key={item.id}>
                          <td className="py-2 px-3">
                            <div className="font-medium text-slate-800">{item.name}</div>
                            <div className="text-[11px] text-slate-500">
                              <span className="font-mono">{item.code}</span> · {item.category}
                            </div>
                          </td>
                          <td className="py-2 px-2 text-center text-slate-700 tabular-nums whitespace-nowrap">
                            {item.qty} {item.unit}
                          </td>
                          <td className="py-2 px-3 text-right font-medium text-slate-900 tabular-nums whitespace-nowrap">
                            {formatVnd(item.total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-50 border-t border-slate-200">
                      <tr>
                        <td colSpan={2} className="py-2.5 px-3 font-semibold text-slate-700">
                          Tổng doanh thu RO
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-sm text-[#1A73E8] tabular-nums">
                          {formatVnd(detailRo.revenue)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setDetailRoId(null)}
                className="px-4 py-1.5 rounded-md bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-medium cursor-pointer"
              >
                Đóng chi tiết
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
