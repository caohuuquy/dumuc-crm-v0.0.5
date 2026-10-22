import React, { useState } from 'react';
import {
  Rocket,
  X,
  Sliders,
  Calendar,
  Clock,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Share2,
  Globe,
  Mail,
  Smartphone,
  MapPin,
  MessageSquare,
  Plus,
  Trash2,
  ExternalLink,
  History,
  Check,
  Eye,
  Send,
  Sparkles,
  Layers,
  ChevronLeft,
} from 'lucide-react';
import { DiscountRecord } from './DiscountManagementModule';

export interface PostHistoryItem {
  id: string;
  title: string;
  content: string;
  images: string[];
  date: string;
  time: string;
  channels: string[];
  status: 'Đã gửi' | 'Đang lên lịch';
}

interface CampaignExecutionFullScreenModalProps {
  discount: DiscountRecord;
  onClose: () => void;
  onRunCampaign: (postData: {
    title: string;
    content: string;
    images: string[];
    channels: string[];
    isScheduled: boolean;
    scheduledDate?: string;
    scheduledTime?: string;
  }) => void;
}

export const CampaignExecutionFullScreenModal: React.FC<CampaignExecutionFullScreenModalProps> = ({
  discount,
  onClose,
  onRunCampaign,
}) => {
  // Cột 1: Nội dung bài đăng
  const [postTitle, setPostTitle] = useState(
    `[Ưu đãi] ${discount.name} - Siêu ưu đãi cho Khách hàng Garage / Phụ tùng`
  );
  const [postContent, setPostContent] = useState(
    `Nhận ngay ưu đãi hấp dẫn từ chương trình "${discount.name}" (Mã: ${discount.code}).\n` +
      `${discount.description ? `Chi tiết: ${discount.description}\n` : ''}` +
      `Thời gian áp dụng: Từ ${discount.startDate} đến ${discount.endDate}.\n` +
      `Liên hệ đặt lịch ngay hôm nay để nhận quyền lợi tốt nhất!`
  );
  const [postImages, setPostImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&auto=format&fit=crop&q=80',
  ]);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [showAddImageInput, setShowAddImageInput] = useState(false);

  // Cột 2: Đối tượng nhận
  // 1. Khách hàng hiện hữu qua:
  const [sendZaloOAExisting, setSendZaloOAExisting] = useState(true);
  const [sendEmailExisting, setSendEmailExisting] = useState(true);
  const [sendSMSExisting, setSendSMSExisting] = useState(false);

  // 2. Khách hàng mới qua:
  const [sendGoogleMapsNew, setSendGoogleMapsNew] = useState(true);
  const [sendWebsiteNew, setSendWebsiteNew] = useState(true);
  const [sendFacebookNew, setSendFacebookNew] = useState(true);
  const [sendTiktokNew, setSendTiktokNew] = useState(false);
  const [sendZaloOANew, setSendZaloOANew] = useState(true);

  // Field "Lên lịch đăng": tick/un-tick. Nếu un-tick, hiển thị 2 field : Ngày đăng, Giờ đăng
  const [isScheduled, setIsScheduled] = useState(false); // un-tick by default to display date and time fields directly
  const [scheduledDate, setScheduledDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [scheduledTime, setScheduledTime] = useState('09:00');

  // Cột 3: Lịch sử Bài đăng (dạng list "Tiêu đề", khi chọn thì tự động hiển thị lại vào Cột 1)
  const [postHistoryList, setPostHistoryList] = useState<PostHistoryItem[]>([
    {
      id: 'hist-1',
      title: `[Chiến dịch Lốp] ${discount.name} - Giảm giá trực tiếp dịch vụ thay lốp`,
      content: `Chương trình đặc biệt ${discount.code}: Tặng ngay voucher cân mâm bấm chì và kiểm tra góc đặt bánh xe miễn phí khi thay từ 2 lốp. Áp dụng đến ${discount.endDate}.`,
      images: [
        'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?w=800&auto=format&fit=crop&q=80',
      ],
      date: '2026-10-18',
      time: '08:30',
      channels: ['Zalo OA', 'Facebook', 'Email'],
      status: 'Đã gửi',
    },
    {
      id: 'hist-2',
      title: `[Tri ân Khách hàng] Tặng gói bảo dưỡng xe định kỳ cùng ${discount.code}`,
      content: `Dành riêng cho khách hàng thân thiết: Áp dụng mã ${discount.code} giảm thêm trên tổng hoá đơn phụ tùng và dịch vụ bảo dưỡng nhanh. Hotline hỗ trợ 24/7.`,
      images: [
        'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&auto=format&fit=crop&q=80',
      ],
      date: '2026-10-10',
      time: '14:15',
      channels: ['Email', 'SMS', 'Zalo OA', 'Website'],
      status: 'Đã gửi',
    },
    {
      id: 'hist-3',
      title: `[Thông báo ưu đãi Mùa lễ] ${discount.name} - Đặt lịch nhận quà`,
      content: `Chào đón mùa lễ hội, Garage tưng bừng khuyến mãi với chính sách ${discount.code}. Quý khách vui lòng đặt lịch hẹn trước để được phục vụ chu đáo nhất.`,
      images: [
        'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop&q=80',
      ],
      date: '2026-10-02',
      time: '10:00',
      channels: ['Google Maps', 'Facebook', 'Zalo OA'],
      status: 'Đã gửi',
    },
  ]);

  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [activePreviewTab, setActivePreviewTab] = useState<'Zalo' | 'Facebook' | 'SMS' | 'Web'>('Zalo');

  // Modal "Thiết lập Tích hợp"
  const [isIntegrationModalOpen, setIsIntegrationModalOpen] = useState(false);
  const [integrationConfigs, setIntegrationConfigs] = useState({
    zaloOAId: '284918294819284',
    zaloStatus: 'Đã kết nối',
    facebookPageId: '1092837465928',
    facebookStatus: 'Đã kết nối',
    googleMapsPlaceId: 'ChIJa6X...Garage-Center',
    googleMapsStatus: 'Đã kết nối',
    smsBrandname: 'GARAGE_CARE',
    smsStatus: 'Đã kết nối',
    emailSender: 'cskh@garagedumuc.vn',
    emailStatus: 'Đã kết nối',
    tiktokAccountId: 'TT-BIZ-9921',
    tiktokStatus: 'Chưa kích hoạt',
    websiteWebhook: 'https://garagedumuc.vn/api/v1/promotions/sync',
    websiteStatus: 'Đã kết nối',
  });

  // Chọn 1 bài đăng trong Lịch sử Bài đăng -> tự động đổ vào NỘI DUNG BÀI ĐĂNG
  const handleSelectHistoryItem = (item: PostHistoryItem) => {
    setSelectedHistoryId(item.id);
    setPostTitle(item.title);
    setPostContent(item.content);
    setPostImages([...item.images]);
    setSuccessToast(`Đã tự động nạp nội dung bài đăng "${item.title.slice(0, 35)}..." vào NỘI DUNG BÀI ĐĂNG`);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  // Thêm ảnh vào NỘI DUNG BÀI ĐĂNG
  const handleAddImage = (url: string) => {
    if (!url.trim()) return;
    setPostImages((prev) => [...prev, url.trim()]);
    setImageUrlInput('');
    setShowAddImageInput(false);
  };

  const handleRemoveImage = (index: number) => {
    setPostImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Nút "Chạy"
  const handleRun = () => {
    const selectedChannels: string[] = [];
    if (sendZaloOAExisting) selectedChannels.push('Zalo OA (Hiện hữu)');
    if (sendEmailExisting) selectedChannels.push('Email (Hiện hữu)');
    if (sendSMSExisting) selectedChannels.push('SMS (Hiện hữu)');
    if (sendGoogleMapsNew) selectedChannels.push('Google Maps (Mới)');
    if (sendWebsiteNew) selectedChannels.push('Website (Mới)');
    if (sendFacebookNew) selectedChannels.push('Facebook (Mới)');
    if (sendTiktokNew) selectedChannels.push('Tiktok (Mới)');
    if (sendZaloOANew) selectedChannels.push('Zalo OA (Mới)');

    if (selectedChannels.length === 0) {
      alert('Vui lòng chọn ít nhất 1 kênh nhận tại ĐỐI TƯỢNG / KÊNH NHẬN trước khi chạy chiến dịch.');
      return;
    }

    if (!postTitle.trim()) {
      alert('Vui lòng nhập tiêu đề bài đăng tại NỘI DUNG BÀI ĐĂNG.');
      return;
    }

    // Tạo bài đăng mới vào Lịch sử Bài đăng
    const now = new Date();
    const newHistoryItem: PostHistoryItem = {
      id: `hist-${Date.now()}`,
      title: postTitle,
      content: postContent,
      images: [...postImages],
      date: isScheduled ? scheduledDate : now.toISOString().split('T')[0],
      time: isScheduled
        ? scheduledTime
        : `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
      channels: selectedChannels,
      status: isScheduled ? 'Đang lên lịch' : 'Đã gửi',
    };

    setPostHistoryList((prev) => [newHistoryItem, ...prev]);

    // Gọi callback chạy chiến dịch để tăng số lượt chạy
    onRunCampaign({
      title: postTitle,
      content: postContent,
      images: postImages,
      channels: selectedChannels,
      isScheduled,
      scheduledDate: isScheduled ? scheduledDate : undefined,
      scheduledTime: isScheduled ? scheduledTime : undefined,
    });

    setSuccessToast(
      isScheduled
        ? `Đã lên lịch Chạy chiến dịch vào ngày ${scheduledDate} lúc ${scheduledTime} qua ${selectedChannels.length} kênh!`
        : `Đã kích hoạt Chạy chiến dịch thành công qua ${selectedChannels.length} kênh truyền thông!`
    );

    setTimeout(() => {
      setSuccessToast(null);
    }, 4000);
  };

  // Danh sách ảnh mẫu để người dùng nhanh chóng thêm
  const SAMPLE_IMAGES = [
    {
      name: 'Lốp xe & Mâm xe',
      url: 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?w=800&auto=format&fit=crop&q=80',
    },
    {
      name: 'Bảo dưỡng xe hơi',
      url: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=800&auto=format&fit=crop&q=80',
    },
    {
      name: 'Động cơ & Phụ tùng',
      url: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&auto=format&fit=crop&q=80',
    },
    {
      name: 'Chăm sóc xe & Rửa xe',
      url: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=800&auto=format&fit=crop&q=80',
    },
  ];

  return (
    <div className="fixed inset-0 z-[70] bg-[#F8FAFC] flex flex-col font-sans overflow-hidden animate-fadeIn text-gray-900">
      {/* ========================================================================= */}
      {/* TOP HEADER: Thanh tiêu đề chính & Nút Thiết lập Tích hợp, Nút Đóng */}
      {/* ========================================================================= */}
      <header className="flex items-center justify-between px-6 py-3.5 bg-white border-b border-gray-200 shrink-0 shadow-2xs z-20">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors cursor-pointer"
            title="Quay lại danh sách chiết khấu"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-xs">
              <Rocket className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-gray-900 tracking-tight leading-none">
                  Chạy chiến dịch
                </h1>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-[#1A73E8] border border-blue-200 font-mono">
                  {discount.code}
                </span>
                <span className="text-xs text-gray-600 font-medium">
                  {discount.name}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-2">
                <span>Số lần đã chạy: <strong className="text-emerald-700">{discount.campaignRunCount ?? 0}</strong></span>
                <span>•</span>
                <span>Hiệu lực: {discount.startDate} → {discount.endDate}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Nút Thiết lập Tích hợp & Nút Đóng */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsIntegrationModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-300 transition-all cursor-pointer shadow-2xs hover:border-gray-400"
            title="Thiết lập kết nối các kênh: Zalo OA, Facebook, Google Maps, SMS, Email..."
          >
            <Sliders className="w-4 h-4 text-blue-600" />
            <span>Thiết lập Tích hợp</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 flex items-center justify-center transition-colors cursor-pointer"
            title="Đóng màn hình Chạy chiến dịch"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* BANNER THÔNG BÁO THEO YÊU CẦU: */}
      {/* Tính năng "Chạy chiến dịch" tạm dừng. */}
      {/* "Mục đích Tính năng: Đẩy Chiến dịch ra khỏi Module này và đến được Khách hàng" */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-blue-500/10 border-b border-amber-200/80 px-6 py-2.5 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs shrink-0">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            Tính năng "Chạy chiến dịch" tạm dừng.
          </span>
          <div className="text-xs sm:text-sm font-semibold text-gray-800">
            <span className="text-gray-500 font-normal">Mục đích Tính năng: </span>
            <span className="text-blue-900 font-bold">
              Đẩy Chiến dịch ra khỏi Module này và đến được Khách hàng
            </span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2 text-xs text-gray-500 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Tích hợp đa kênh Omnichannel Marketing</span>
        </div>
      </div>

      {/* Toast thông báo nhanh */}
      {successToast && (
        <div className="mx-6 mt-3 p-3 bg-emerald-600 text-white rounded-xl shadow-lg flex items-center justify-between text-xs font-semibold animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-200" />
            <span>{successToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessToast(null)}
            className="text-white/80 hover:text-white cursor-pointer ml-3"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* BODY: GIAO DIỆN CHIA THÀNH 3 CỘT (HIỂN THỊ RỘNG GẦN NHƯ FULL MÀN HÌNH) */}
      {/* Cột 1: NỘI DUNG BÀI ĐĂNG */}
      {/* Cột 2 (Ở GIỮA): LỊCH SỬ BÀI ĐĂNG */}
      {/* Cột 3 (BÊN PHẢI): ĐỐI TƯỢNG / KÊNH NHẬN */}
      {/* ========================================================================= */}
      <main className="flex-1 p-4 md:p-6 overflow-y-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 w-full h-full items-start">
          {/* ===================================================================== */}
          {/* CỘT 1: NỘI DUNG BÀI ĐĂNG */}
          {/* Tiêu đề: gõ vào */}
          {/* Nội dung: gõ vào */}
          {/* Ảnh đính kèm */}
          {/* ===================================================================== */}
          <section className="bg-white rounded-2xl border border-gray-200 shadow-xs p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs">
                  1
                </span>
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                  NỘI DUNG BÀI ĐĂNG
                </h2>
              </div>
              <span className="text-[11px] text-gray-400 font-medium italic">
                Nội dung gửi khách hàng
              </span>
            </div>

            {/* 1. Tiêu đề: gõ vào */}
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1.5">
                Tiêu đề <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                placeholder="Nhập tiêu đề bài đăng chiến dịch..."
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm font-semibold outline-none focus:border-[#1A73E8] focus:ring-2 focus:ring-blue-100 bg-white transition-all"
              />
            </div>

            {/* 2. Nội dung: gõ vào */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-gray-800">
                  Nội dung <span className="text-red-500">*</span>
                </label>
                <span className="text-[11px] text-gray-400">
                  {postContent.length} ký tự
                </span>
              </div>
              <textarea
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                rows={6}
                placeholder="Gõ nội dung bài đăng, thông điệp ưu đãi, quyền lợi khách hàng..."
                className="w-full p-3.5 border border-gray-300 rounded-xl text-xs sm:text-sm outline-none focus:border-[#1A73E8] focus:ring-2 focus:ring-blue-100 bg-white leading-relaxed resize-y transition-all font-sans"
              />
            </div>

            {/* 3. Ảnh đính kèm */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                  <span>Ảnh đính kèm</span>
                  <span className="text-xs font-normal text-gray-400">
                    ({postImages.length} ảnh)
                  </span>
                </label>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setShowAddImageInput(!showAddImageInput)}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Thêm ảnh URL</span>
                  </button>
                </div>
              </div>

              {/* Form thêm URL ảnh */}
              {showAddImageInput && (
                <div className="mb-3 p-2.5 bg-gray-50 border border-gray-200 rounded-xl flex items-center gap-2">
                  <input
                    type="url"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    placeholder="Dán link ảnh (https://...)"
                    className="flex-1 px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg outline-none focus:border-blue-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddImage(imageUrlInput);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleAddImage(imageUrlInput)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
                  >
                    Thêm
                  </button>
                </div>
              )}

              {/* Danh sách ảnh hiện có */}
              {postImages.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-3">
                  {postImages.map((imgUrl, idx) => (
                    <div
                      key={idx}
                      className="relative group rounded-xl overflow-hidden border border-gray-200 bg-gray-100 aspect-video shadow-2xs"
                    >
                      <img
                        src={imgUrl}
                        alt={`Ảnh đính kèm ${idx + 1}`}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 hover:bg-red-600 text-white flex items-center justify-center transition-colors cursor-pointer opacity-80 group-hover:opacity-100 shadow-sm"
                        title="Xóa ảnh này"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                      <span className="absolute bottom-1 left-1.5 px-1.5 py-0.5 rounded bg-black/60 text-white text-[9px] font-mono leading-none">
                        #{idx + 1}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 border border-dashed border-gray-300 rounded-xl text-center text-xs text-gray-400 mb-3 bg-gray-50/50">
                  Chưa có ảnh đính kèm nào.
                </div>
              )}

              {/* Gợi ý ảnh nhanh từ kho ảnh Garage */}
              <div className="pt-2 border-t border-gray-100">
                <span className="text-[11px] font-semibold text-gray-500 block mb-1.5">
                  Chọn nhanh từ kho ảnh mẫu:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {SAMPLE_IMAGES.map((sample, sIdx) => (
                    <button
                      key={sIdx}
                      type="button"
                      onClick={() => handleAddImage(sample.url)}
                      className="text-[11px] px-2 py-1 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors cursor-pointer flex items-center gap-1 border border-gray-200"
                    >
                      <Plus className="w-3 h-3 text-gray-500" />
                      <span>{sample.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ===================================================================== */}
          {/* CỘT Ở GIỮA: LỊCH SỬ BÀI ĐĂNG */}
          {/* 1. Đưa phần "Xem trước bài đăng (Live Preview):" lên trên, ngang hàng với Cột 1 */}
          {/* 2. Phần "Lịch sử bài đăng" gọn lại ở dưới, chỉ hiển thị "Tiêu đề" và "Thời gian gửi" */}
          {/* ===================================================================== */}
          <section className="bg-white rounded-2xl border border-gray-200 shadow-xs p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs">
                  2
                </span>
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                  LỊCH SỬ BÀI ĐĂNG
                </h2>
              </div>
              <span className="text-[11px] text-gray-400 font-medium italic">
                Xem trước & Lịch sử
              </span>
            </div>

            {/* 1. MỤC XEM TRƯỚC (LIVE PREVIEW) - ĐƯA LÊN TRÊN ĐỂ NGANG HÀNG CÙNG DÒNG VỚI NỘI DUNG ĐĂNG CỘT 1 */}
            <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-blue-600" />
                  <span>Xem trước bài đăng (Live Preview):</span>
                </span>

                <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-gray-200">
                  {(['Zalo', 'Facebook', 'SMS', 'Web'] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActivePreviewTab(tab)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded transition-all cursor-pointer ${
                        activePreviewTab === tab
                          ? 'bg-[#1A73E8] text-white shadow-2xs'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Khung mô phỏng hiển thị trên kênh */}
              <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-2xs space-y-2">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px]">
                    G
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-gray-900 leading-none">
                      Garage Du Mục Auto Care
                    </div>
                    <div className="text-[9px] text-gray-400 mt-0.5">
                      Đăng qua {activePreviewTab} • Vừa xong
                    </div>
                  </div>
                </div>

                <div className="text-xs font-bold text-gray-900 leading-snug line-clamp-1">
                  {postTitle || 'Chưa nhập tiêu đề'}
                </div>

                <div className="text-[11px] text-gray-700 leading-relaxed whitespace-pre-line line-clamp-3">
                  {postContent || 'Chưa có nội dung bài đăng...'}
                </div>

                {postImages.length > 0 && (
                  <div className="rounded-lg overflow-hidden border border-gray-100 aspect-video bg-gray-100 max-h-40">
                    <img
                      src={postImages[0]}
                      alt="Xem trước ảnh"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* 2. DANH SÁCH LỊCH SỬ BÀI ĐĂNG GỌN LẠI: CHỈ HIỂN THỊ "TIÊU ĐỀ" VÀ "THỜI GIAN GỬI" */}
            <div className="space-y-2 pt-1 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-amber-600" />
                  <span>Lịch sử bài đăng ({postHistoryList.length}):</span>
                </span>
                <span className="text-[10px] text-gray-400 italic">
                  Nhấp để nạp vào Cột 1
                </span>
              </div>

              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {postHistoryList.map((item) => {
                  const isSelected = selectedHistoryId === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelectHistoryItem(item)}
                      className={`px-3 py-2 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 text-left group ${
                        isSelected
                          ? 'bg-blue-50/90 border-blue-400 shadow-2xs ring-1 ring-blue-300'
                          : 'bg-gray-50/70 border-gray-200 hover:bg-white hover:border-blue-300 hover:shadow-2xs'
                      }`}
                      title="Nhấn để tự động nạp bài đăng này vào NỘI DUNG BÀI ĐĂNG"
                    >
                      {/* Tiêu đề */}
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span
                          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            isSelected ? 'bg-blue-600' : 'bg-gray-400 group-hover:bg-blue-500'
                          }`}
                        />
                        <span className="text-xs font-semibold text-gray-900 group-hover:text-blue-700 truncate transition-colors">
                          {item.title}
                        </span>
                      </div>

                      {/* Thời gian gửi */}
                      <div className="flex items-center gap-1 shrink-0 text-[11px] text-gray-500 font-mono">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span>{item.date} {item.time}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* ===================================================================== */}
          {/* CỘT BÊN PHẢI: ĐỐI TƯỢNG / KÊNH NHẬN */}
          {/* Đẩy Chiến dịch đến với Khách hàng hiện hữu qua: Zalo OA, Email, SMS */}
          {/* Đẩy Chiến dịch đến với Khách hàng mới qua: Google Maps, Website, Facebook, Tiktok, Zalo OA */}
          {/* FIELD "LÊN LỊCH ĐĂNG": KHI TICK THÌ MỚI HIỂN THỊ 2 FIELD "NGÀY ĐĂNG" VÀ "GIỜ ĐĂNG" */}
          {/* ===================================================================== */}
          <section className="bg-white rounded-2xl border border-gray-200 shadow-xs p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
                  3
                </span>
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                  ĐỐI TƯỢNG / KÊNH NHẬN
                </h2>
              </div>
              <span className="text-[11px] text-gray-400 font-medium italic">
                Kênh phân phối
              </span>
            </div>

            {/* Nhóm 1: Đẩy Chiến dịch đến với Khách hàng hiện hữu qua: */}
            <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-100 space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-blue-950 uppercase tracking-wide">
                  Đẩy Chiến dịch đến với Khách hàng hiện hữu qua:
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  Data nội bộ
                </span>
              </div>

              <div className="space-y-2">
                {/* 1. Zalo OA */}
                <label className="flex items-center justify-between p-2 rounded-lg bg-white border border-gray-200 hover:border-blue-300 transition-all cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={sendZaloOAExisting}
                      onChange={(e) => setSendZaloOAExisting(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                    />
                    <div className="flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4 text-blue-500" />
                      <span className="text-xs font-bold text-gray-800">Zalo OA</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-500 font-medium">Tin nhắn ZNS & Broadcast</span>
                </label>

                {/* 2. Email */}
                <label className="flex items-center justify-between p-2 rounded-lg bg-white border border-gray-200 hover:border-blue-300 transition-all cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={sendEmailExisting}
                      onChange={(e) => setSendEmailExisting(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                    />
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-4 h-4 text-emerald-500" />
                      <span className="text-xs font-bold text-gray-800">Email</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-500 font-medium">Email Marketing HTML</span>
                </label>

                {/* 3. SMS */}
                <label className="flex items-center justify-between p-2 rounded-lg bg-white border border-gray-200 hover:border-blue-300 transition-all cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={sendSMSExisting}
                      onChange={(e) => setSendSMSExisting(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                    />
                    <div className="flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-indigo-500" />
                      <span className="text-xs font-bold text-gray-800">SMS</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-500 font-medium">SMS Brandname CSKH</span>
                </label>
              </div>
            </div>

            {/* Nhóm 2: Đẩy Chiến dịch đến với Khách hàng mới qua: */}
            <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-100 space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-emerald-950 uppercase tracking-wide">
                  Đẩy Chiến dịch đến với Khách hàng mới qua:
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Tạo Leads
                </span>
              </div>

              <div className="space-y-2">
                {/* 1. Google Maps */}
                <label className="flex items-center justify-between p-2 rounded-lg bg-white border border-gray-200 hover:border-emerald-300 transition-all cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={sendGoogleMapsNew}
                      onChange={(e) => setSendGoogleMapsNew(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                    />
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-red-500" />
                      <span className="text-xs font-bold text-gray-800">Google Maps</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-500 font-medium">Google Business Updates</span>
                </label>

                {/* 2. Website */}
                <label className="flex items-center justify-between p-2 rounded-lg bg-white border border-gray-200 hover:border-emerald-300 transition-all cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={sendWebsiteNew}
                      onChange={(e) => setSendWebsiteNew(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                    />
                    <div className="flex items-center gap-1.5">
                      <Globe className="w-4 h-4 text-cyan-600" />
                      <span className="text-xs font-bold text-gray-800">Website</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-500 font-medium">Trang Khuyến mãi Garage</span>
                </label>

                {/* 3. Facebook */}
                <label className="flex items-center justify-between p-2 rounded-lg bg-white border border-gray-200 hover:border-emerald-300 transition-all cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={sendFacebookNew}
                      onChange={(e) => setSendFacebookNew(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                    />
                    <div className="flex items-center gap-1.5">
                      <Share2 className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-bold text-gray-800">Facebook</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-500 font-medium">Fanpage & Group Xe</span>
                </label>

                {/* 4. Tiktok */}
                <label className="flex items-center justify-between p-2 rounded-lg bg-white border border-gray-200 hover:border-emerald-300 transition-all cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={sendTiktokNew}
                      onChange={(e) => setSendTiktokNew(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                    />
                    <div className="flex items-center gap-1.5">
                      <span className="w-4 h-4 flex items-center justify-center font-bold text-[10px] bg-black text-white rounded">T</span>
                      <span className="text-xs font-bold text-gray-800">Tiktok</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-500 font-medium">Video Ads & Profile</span>
                </label>

                {/* 5. Zalo OA */}
                <label className="flex items-center justify-between p-2 rounded-lg bg-white border border-gray-200 hover:border-emerald-300 transition-all cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={sendZaloOANew}
                      onChange={(e) => setSendZaloOANew(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                    />
                    <div className="flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4 text-blue-500" />
                      <span className="text-xs font-bold text-gray-800">Zalo OA</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-500 font-medium">Zalo Ads tìm kiếm khách mới</span>
                </label>
              </div>
            </div>

            {/* Nhóm 3: FIELD "LÊN LỊCH ĐĂNG": KHI TICK THÌ MỚI HIỂN THỊ 2 FIELD "NGÀY ĐĂNG" VÀ "GIỜ ĐĂNG" */}
            <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isScheduled}
                    onChange={(e) => setIsScheduled(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                  />
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-gray-600" />
                    <span className="text-xs font-bold text-gray-900">Lên lịch đăng</span>
                  </div>
                </label>

                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  isScheduled
                    ? 'bg-blue-100 text-blue-800 border-blue-300'
                    : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                }`}>
                  {isScheduled ? 'Lên lịch theo Ngày & Giờ' : 'Đăng ngay lập tức'}
                </span>
              </div>

              {/* KHI TICK THÌ MỚI HIỂN THỊ 2 FIELD "NGÀY ĐĂNG" VÀ "GIỜ ĐĂNG" */}
              {isScheduled && (
                <div className="pt-2 border-t border-gray-200/80 grid grid-cols-2 gap-3 animate-fadeIn">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-blue-600" />
                      <span>Ngày đăng</span>
                    </label>
                    <input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-300 rounded-lg outline-none focus:border-blue-500 font-medium cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-blue-600" />
                      <span>Giờ đăng</span>
                    </label>
                    <input
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-300 rounded-lg outline-none focus:border-blue-500 font-medium cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      {/* ========================================================================= */}
      {/* FOOTER BAR: Bổ sung nút "Chạy" kế bên nút "Đóng" */}
      {/* ========================================================================= */}
      <footer className="px-6 py-3.5 bg-white border-t border-gray-200 flex items-center justify-between shrink-0 shadow-lg z-20">
        <div className="flex items-center gap-3 text-xs text-gray-600">
          <span className="font-semibold text-gray-900">Chiến dịch:</span>
          <span className="font-mono text-blue-700 font-bold">{discount.code}</span>
          <span className="text-gray-400">|</span>
          <span>Trạng thái: <strong className="text-emerald-700">Sẵn sàng</strong></span>
          <span className="text-gray-400">|</span>
          <span>
            {isScheduled
              ? `Lên lịch phát hành: ${scheduledDate} ${scheduledTime}`
              : 'Chế độ: Đăng ngay lập tức'}
          </span>
        </div>

        {/* Cặp nút: "Đóng" và "Chạy" kế bên nhau */}
        <div className="flex items-center gap-3">
          {/* Nút Đóng */}
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer border border-gray-300"
          >
            Đóng
          </button>

          {/* Bổ sung nút "Chạy" kế bên nút "Đóng" */}
          <button
            type="button"
            onClick={handleRun}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
            title="Nhấn để thực thi Chạy chiến dịch ra các kênh đã chọn"
          >
            <Rocket className="w-4 h-4" />
            <span>Chạy</span>
          </button>
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* MODAL: THIẾT LẬP TÍCH HỢP */}
      {/* ========================================================================= */}
      {isIntegrationModalOpen && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/50 backdrop-blur-[2px] animate-fadeIn"
          onClick={() => setIsIntegrationModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-gray-100 overflow-hidden transform transition-all animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 bg-gradient-to-r from-blue-50 via-teal-50 to-indigo-50 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 leading-tight">
                    Thiết lập Tích hợp Kênh Truyền thông & Khách hàng
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Cấu hình kết nối API các kênh Omnichannel để đẩy chiến dịch tự động
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsIntegrationModalOpen(false)}
                className="w-8 h-8 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-white/80 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* 1. Zalo Official Account */}
              <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-xs text-gray-900">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                    <span>Zalo Official Account (OA)</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    {integrationConfigs.zaloStatus}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[11px] text-gray-500">OA ID</label>
                    <input
                      type="text"
                      value={integrationConfigs.zaloOAId}
                      onChange={(e) =>
                        setIntegrationConfigs({ ...integrationConfigs, zaloOAId: e.target.value })
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-gray-500">Khách hàng nhận dạng</label>
                    <input
                      type="text"
                      disabled
                      value="Đã liên kết 1.250 số điện thoại"
                      className="w-full px-2.5 py-1.5 bg-gray-100 border border-gray-200 rounded-lg text-xs text-gray-600"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Facebook & Fanpage */}
              <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-xs text-gray-900">
                    <Share2 className="w-4 h-4 text-blue-600" />
                    <span>Facebook Fanpage & Groups</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    {integrationConfigs.facebookStatus}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[11px] text-gray-500">Page ID / Meta API</label>
                    <input
                      type="text"
                      value={integrationConfigs.facebookPageId}
                      onChange={(e) =>
                        setIntegrationConfigs({ ...integrationConfigs, facebookPageId: e.target.value })
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-gray-500">Quyền hạn</label>
                    <input
                      type="text"
                      disabled
                      value="pages_manage_posts, pages_read_engagement"
                      className="w-full px-2.5 py-1.5 bg-gray-100 border border-gray-200 rounded-lg text-xs text-gray-600"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Google Maps / Business Profile */}
              <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-xs text-gray-900">
                    <MapPin className="w-4 h-4 text-red-500" />
                    <span>Google Maps / Google Business Profile</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    {integrationConfigs.googleMapsStatus}
                  </span>
                </div>
                <div>
                  <label className="text-[11px] text-gray-500">Place Location ID</label>
                  <input
                    type="text"
                    value={integrationConfigs.googleMapsPlaceId}
                    onChange={(e) =>
                      setIntegrationConfigs({ ...integrationConfigs, googleMapsPlaceId: e.target.value })
                    }
                    className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* 4. SMS Brandname */}
              <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-xs text-gray-900">
                    <Smartphone className="w-4 h-4 text-indigo-600" />
                    <span>SMS Brandname</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    {integrationConfigs.smsStatus}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[11px] text-gray-500">Brandname định danh</label>
                    <input
                      type="text"
                      value={integrationConfigs.smsBrandname}
                      onChange={(e) =>
                        setIntegrationConfigs({ ...integrationConfigs, smsBrandname: e.target.value })
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-gray-500">Nhà mạng hỗ trợ</label>
                    <input
                      type="text"
                      disabled
                      value="Viettel, VinaPhone, MobiFone, Vietnamobile"
                      className="w-full px-2.5 py-1.5 bg-gray-100 border border-gray-200 rounded-lg text-xs text-gray-600"
                    />
                  </div>
                </div>
              </div>

              {/* 5. Email Marketing */}
              <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-xs text-gray-900">
                    <Mail className="w-4 h-4 text-emerald-600" />
                    <span>Email Marketing SMTP</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    {integrationConfigs.emailStatus}
                  </span>
                </div>
                <div>
                  <label className="text-[11px] text-gray-500">Địa chỉ Email gửi đi</label>
                  <input
                    type="email"
                    value={integrationConfigs.emailSender}
                    onChange={(e) =>
                      setIntegrationConfigs({ ...integrationConfigs, emailSender: e.target.value })
                    }
                    className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="px-6 py-3.5 bg-gray-50 border-t border-gray-200 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsIntegrationModalOpen(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={() => {
                  setSuccessToast('Đã lưu cấu hình thiết lập tích hợp các kênh thành công!');
                  setIsIntegrationModalOpen(false);
                }}
                className="px-5 py-2 bg-[#1A73E8] hover:bg-blue-700 text-white text-xs font-bold rounded-lg cursor-pointer shadow-xs"
              >
                Lưu cấu hình
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
