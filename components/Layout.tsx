import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, List, ChevronDown, Bell, User, Users, Store, Wrench, Tag, LogOut, Phone, X, Camera, Pencil, Check, Lock, FileText, Menu } from 'lucide-react';
import { signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '../firebase';

interface LayoutProps {
  children: React.ReactNode;
  currentView?: string;
  onNavigate?: (view: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentView = 'categories', onNavigate }) => {
  const documentViews = ['document_cabinet', 'document_storage_categories'];
  const isDocumentsActive = documentViews.includes(currentView);
  const [isDocumentsOpen, setIsDocumentsOpen] = useState(false);

  const crmViews = [
    'potential_customers',
    'proactive_reminders',
    'customer_segments',
    'customer_bookings',
    'customers',
    'discount_management',
    'service_quality'
  ];
  const isCrmActive = crmViews.includes(currentView);
  const [isCrmOpen, setIsCrmOpen] = useState(false);
  const isReturnInviteActive = currentView === 'proactive_reminders' || currentView === 'customer_segments';
  const [isReturnInviteOpen, setIsReturnInviteOpen] = useState(false);

  const hrmViews = [
    'employee_list',
    'labor_list',
    'department_list',
    'position_list',
    'salary_grade_list',
    'contract_type_list',
    'salary_rule_group',
    'salary_structure',
    'insurance_tax_params',
    'payroll_period',
    'payroll_table'
  ];
  const isHrmActive = hrmViews.includes(currentView);
  const [isHrmOpen, setIsHrmOpen] = useState(false);
  const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false);
  const [isHeaderDocsOpen, setIsHeaderDocsOpen] = useState(false);
  const [isHeaderCrmOpen, setIsHeaderCrmOpen] = useState(false);
  const [isHeaderReturnInviteOpen, setIsHeaderReturnInviteOpen] = useState(false);
  const [isHeaderHrmOpen, setIsHeaderHrmOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isGeneralInfoModalOpen, setIsGeneralInfoModalOpen] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [activeProfileTab, setActiveProfileTab] = useState<'options' | 'account_info'>('options');
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmNewPasswordInput, setConfirmNewPasswordInput] = useState('');
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(() => auth.currentUser);
  const [customAvatarUrl, setCustomAvatarUrl] = useState<string | null>(null);
  const [signatureImageUrl, setSignatureImageUrl] = useState<string | null>(null);
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('+84 909-123-456');
  const [profileLanguage, setProfileLanguage] = useState('Tiếng Việt');
  const [notificationEmail, setNotificationEmail] = useState('');
  const [loggedInDevices, setLoggedInDevices] = useState<
    { id: string; deviceName: string; location: string; lastActive: string; isCurrent?: boolean }[]
  >([
    {
      id: 'dev-1',
      deviceName: 'Chrome trên Windows 11 (Phiên hiện tại)',
      location: 'TP. Hồ Chí Minh, Việt Nam',
      lastActive: 'Đang hoạt động',
      isCurrent: true,
    },
    {
      id: 'dev-2',
      deviceName: 'Safari trên iPhone 15 Pro Max',
      location: 'TP. Hồ Chí Minh, Việt Nam',
      lastActive: '2 giờ trước',
    },
    {
      id: 'dev-3',
      deviceName: 'Microsoft Edge trên MacBook Pro',
      location: 'Hà Nội, Việt Nam',
      lastActive: 'Hôm qua, 18:45',
    },
  ]);
  const avatarFileInputRef = useRef<HTMLInputElement>(null);
  const signatureFileInputRef = useRef<HTMLInputElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const headerMenuRef = useRef<HTMLDivElement>(null);
  const headerMenuPanelRef = useRef<HTMLDivElement>(null);
  const [headerMenuPos, setHeaderMenuPos] = useState<{ top: number; right: number }>({ top: 72, right: 24 });

  const updateHeaderMenuPosition = () => {
    if (headerMenuRef.current) {
      const rect = headerMenuRef.current.getBoundingClientRect();
      setHeaderMenuPos({
        top: rect.bottom + 8,
        right: Math.max(12, window.innerWidth - rect.right),
      });
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setCurrentUser(u);
      const emailStr = u?.email || 'trungnualasao@gmail.com';
      const defaultName = u?.displayName || (emailStr ? emailStr.split('@')[0] : 'Chủ xưởng');
      setProfileName((prev) => prev || defaultName);
      setNotificationEmail((prev) => prev || emailStr);
      if (u?.phoneNumber) {
        setProfilePhone(u.phoneNumber);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (
        headerMenuRef.current &&
        !headerMenuRef.current.contains(event.target as Node) &&
        (!headerMenuPanelRef.current || !headerMenuPanelRef.current.contains(event.target as Node))
      ) {
        setIsHeaderMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isHeaderMenuOpen) return;
    updateHeaderMenuPosition();
    window.addEventListener('resize', updateHeaderMenuPosition);
    return () => window.removeEventListener('resize', updateHeaderMenuPosition);
  }, [isHeaderMenuOpen]);

  const handleHeaderMenuNavigate = (view: string) => {
    setIsHeaderMenuOpen(false);
    onNavigate?.(view);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 text-gray-800 font-sans">
      {/* Sidebar */}
      <aside className="w-[260px] flex-shrink-0 border-r border-gray-200 bg-white flex flex-col">
        {/* Logo */}
        <div className="h-16 flex items-center justify-center px-6 border-b border-gray-200">
          <div className="text-[#14A64A] font-bold text-2xl italic tracking-tighter flex items-center">
            DU MỤC
          </div>
        </div>

        {/* Sidebar Search */}
        <div className="p-4">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Tìm tính năng, danh mục, báo cáo" 
              className="w-full bg-gray-100 border border-transparent rounded-md py-2 pl-3 pr-8 text-sm outline-none focus:bg-white focus:border-blue-500 transition-colors" 
            />
            <Search className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 space-y-1">
          <div 
            onClick={() => onNavigate?.('repair_service')}
            className={`flex items-center px-3 py-2.5 rounded-md relative cursor-pointer transition-colors ${currentView === 'repair_service' ? 'bg-[#EBF5FF] text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            {currentView === 'repair_service' && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r-md"></div>
            )}
            <Wrench className="w-5 h-5 mr-3" />
            <span className="text-sm font-medium">Dịch vụ sửa chữa</span>
          </div>
          <div 
            onClick={() => onNavigate?.('commercial_sales')}
            className={`flex items-center px-3 py-2.5 rounded-md relative cursor-pointer transition-colors ${currentView === 'commercial_sales' ? 'bg-[#EBF5FF] text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            {currentView === 'commercial_sales' && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r-md"></div>
            )}
            <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium">Bán hàng thương mại</span>
          </div>
          {/* Hồ sơ & Tài liệu Modules */}
          <div>
            <div 
              onClick={() => setIsDocumentsOpen(!isDocumentsOpen)}
              className={`flex items-center justify-between px-3 py-2.5 rounded-md relative cursor-pointer transition-colors ${isDocumentsActive ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <div className="flex items-center">
                <FileText className="w-5 h-5 mr-3" />
                <span className="text-sm font-medium">Hồ sơ &amp; Tài liệu</span>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isDocumentsOpen ? 'rotate-180' : ''}`} />
            </div>
            {isDocumentsOpen && (
              <div className="mt-1 space-y-1">
                <div 
                  onClick={() => onNavigate?.('document_cabinet')}
                  className={`flex items-center pl-11 pr-3 py-2 rounded-md relative cursor-pointer transition-colors ${currentView === 'document_cabinet' ? 'bg-[#EBF5FF] text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  {currentView === 'document_cabinet' && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r-md"></div>
                  )}
                  <span className="text-sm font-medium">Tủ lưu trữ</span>
                </div>
                <div 
                  onClick={() => onNavigate?.('document_storage_categories')}
                  className={`flex items-center pl-11 pr-3 py-2 rounded-md relative cursor-pointer transition-colors ${currentView === 'document_storage_categories' ? 'bg-[#EBF5FF] text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  {currentView === 'document_storage_categories' && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r-md"></div>
                  )}
                  <span className="text-sm font-medium">Phân loại lưu trữ</span>
                </div>
              </div>
            )}
          </div>
          {/* CRM Modules */}
          <div>
            <div 
              onClick={() => setIsCrmOpen(!isCrmOpen)}
              className={`flex items-center justify-between px-3 py-2.5 rounded-md relative cursor-pointer transition-colors ${isCrmActive ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="text-sm font-medium">CRM</span>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isCrmOpen ? 'rotate-180' : ''}`} />
            </div>
            {isCrmOpen && (
              <div className="mt-1 space-y-1">
                <div 
                  onClick={() => onNavigate?.('potential_customers')}
                  className={`flex items-center pl-11 pr-3 py-2 rounded-md relative cursor-pointer transition-colors ${currentView === 'potential_customers' ? 'bg-[#EBF5FF] text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  {currentView === 'potential_customers' && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r-md"></div>
                  )}
                  <span className="text-sm font-medium">Khách hàng quan tâm</span>
                </div>
                <div>
                  <div 
                    onClick={() => setIsReturnInviteOpen(!isReturnInviteOpen)}
                    className={`flex items-center justify-between pl-11 pr-3 py-2 rounded-md relative cursor-pointer transition-colors ${isReturnInviteActive ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    <span className="text-sm font-medium">Mời Khách quay lại</span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isReturnInviteOpen ? 'rotate-180' : ''}`} />
                  </div>
                  {isReturnInviteOpen && (
                    <div className="mt-1 space-y-1">
                      <div 
                        onClick={() => onNavigate?.('proactive_reminders')}
                        className={`flex items-center pl-16 pr-3 py-2 rounded-md relative cursor-pointer transition-colors ${currentView === 'proactive_reminders' ? 'bg-[#EBF5FF] text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                      >
                        {currentView === 'proactive_reminders' && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r-md"></div>
                        )}
                        <span className="text-sm font-medium">Lịch nhắc chủ động</span>
                      </div>
                      <div 
                        onClick={() => onNavigate?.('customer_segments')}
                        className={`flex items-center pl-16 pr-3 py-2 rounded-md relative cursor-pointer transition-colors ${currentView === 'customer_segments' ? 'bg-[#EBF5FF] text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                      >
                        {currentView === 'customer_segments' && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r-md"></div>
                        )}
                        <span className="text-sm font-medium">Phân khúc Khách hàng</span>
                      </div>
                    </div>
                  )}
                </div>
                <div 
                  onClick={() => onNavigate?.('customer_bookings')}
                  className={`flex items-center pl-11 pr-3 py-2 rounded-md relative cursor-pointer transition-colors ${currentView === 'customer_bookings' ? 'bg-[#EBF5FF] text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  {currentView === 'customer_bookings' && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r-md"></div>
                  )}
                  <span className="text-sm font-medium">Lịch hẹn Khách đặt</span>
                </div>
                <div 
                  onClick={() => onNavigate?.('customers')}
                  className={`flex items-center pl-11 pr-3 py-2 rounded-md relative cursor-pointer transition-colors ${currentView === 'customers' ? 'bg-[#EBF5FF] text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  {currentView === 'customers' && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r-md"></div>
                  )}
                  <span className="text-sm font-medium">Khách hàng</span>
                </div>
                <div 
                  onClick={() => onNavigate?.('discount_management')}
                  className={`flex items-center pl-11 pr-3 py-2 rounded-md relative cursor-pointer transition-colors ${currentView === 'discount_management' ? 'bg-[#EBF5FF] text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  {currentView === 'discount_management' && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r-md"></div>
                  )}
                  <span className="text-sm font-medium">Quản lý chiết khấu</span>
                </div>
                <div 
                  onClick={() => onNavigate?.('service_quality')}
                  className={`flex items-center pl-11 pr-3 py-2 rounded-md relative cursor-pointer transition-colors ${currentView === 'service_quality' ? 'bg-[#EBF5FF] text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  {currentView === 'service_quality' && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r-md"></div>
                  )}
                  <span className="text-sm font-medium">Đánh giá chất lượng dịch vụ</span>
                </div>
              </div>
            )}
          </div>

          {/* HRM Modules */}
          <div>
            <div 
              onClick={() => setIsHrmOpen(!isHrmOpen)}
              className={`flex items-center justify-between px-3 py-2.5 rounded-md relative cursor-pointer transition-colors ${isHrmActive ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <div className="flex items-center">
                <Users className="w-5 h-5 mr-3" />
                <span className="text-sm font-medium">HRM</span>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isHrmOpen ? 'rotate-180' : ''}`} />
            </div>
            {isHrmOpen && (
              <div className="mt-1 space-y-1">
                <div 
                  onClick={() => onNavigate?.('employee_list')}
                  className={`flex items-center pl-11 pr-3 py-2 rounded-md relative cursor-pointer transition-colors ${currentView === 'employee_list' ? 'bg-[#EBF5FF] text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  {currentView === 'employee_list' && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r-md"></div>
                  )}
                  <span className="text-sm font-medium">Danh sách Nhân sự</span>
                </div>
                <div 
                  onClick={() => onNavigate?.('labor_list')}
                  className={`flex items-center pl-11 pr-3 py-2 rounded-md relative cursor-pointer transition-colors ${currentView === 'labor_list' ? 'bg-[#EBF5FF] text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  {currentView === 'labor_list' && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r-md"></div>
                  )}
                  <span className="text-sm font-medium">Hồ sơ Hợp đồng</span>
                </div>
                <div 
                  onClick={() => onNavigate?.('department_list')}
                  className={`flex items-center pl-11 pr-3 py-2 rounded-md relative cursor-pointer transition-colors ${currentView === 'department_list' ? 'bg-[#EBF5FF] text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  {currentView === 'department_list' && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r-md"></div>
                  )}
                  <span className="text-sm font-medium">Phòng ban / Bộ phận</span>
                </div>
                <div 
                  onClick={() => onNavigate?.('position_list')}
                  className={`flex items-center pl-11 pr-3 py-2 rounded-md relative cursor-pointer transition-colors ${currentView === 'position_list' ? 'bg-[#EBF5FF] text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  {currentView === 'position_list' && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r-md"></div>
                  )}
                  <span className="text-sm font-medium">Chức vụ / Vị trí</span>
                </div>
                <div 
                  onClick={() => onNavigate?.('salary_grade_list')}
                  className={`flex items-center pl-11 pr-3 py-2 rounded-md relative cursor-pointer transition-colors ${currentView === 'salary_grade_list' ? 'bg-[#EBF5FF] text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  {currentView === 'salary_grade_list' && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r-md"></div>
                  )}
                  <span className="text-sm font-medium">Thang bảng Lương</span>
                </div>
                <div 
                  onClick={() => onNavigate?.('contract_type_list')}
                  className={`flex items-center pl-11 pr-3 py-2 rounded-md relative cursor-pointer transition-colors ${currentView === 'contract_type_list' ? 'bg-[#EBF5FF] text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  {currentView === 'contract_type_list' && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r-md"></div>
                  )}
                  <span className="text-sm font-medium">Loại hợp đồng</span>
                </div>
                <div 
                  onClick={() => onNavigate?.('salary_rule_group')}
                  className={`flex items-center pl-11 pr-3 py-2 rounded-md relative cursor-pointer transition-colors ${currentView === 'salary_rule_group' ? 'bg-[#EBF5FF] text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  {currentView === 'salary_rule_group' && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r-md"></div>
                  )}
                  <span className="text-sm font-medium">Nhóm quy tắc Lương</span>
                </div>
                <div 
                  onClick={() => onNavigate?.('salary_structure')}
                  className={`flex items-center pl-11 pr-3 py-2 rounded-md relative cursor-pointer transition-colors ${currentView === 'salary_structure' ? 'bg-[#EBF5FF] text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  {currentView === 'salary_structure' && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r-md"></div>
                  )}
                  <span className="text-sm font-medium">Cấu trúc Lương</span>
                </div>
                <div 
                  onClick={() => onNavigate?.('insurance_tax_params')}
                  className={`flex items-center pl-11 pr-3 py-2 rounded-md relative cursor-pointer transition-colors ${currentView === 'insurance_tax_params' ? 'bg-[#EBF5FF] text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  {currentView === 'insurance_tax_params' && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r-md"></div>
                  )}
                  <span className="text-sm font-medium">Tham số BHXH & Thuế</span>
                </div>
                <div 
                  onClick={() => onNavigate?.('payroll_period')}
                  className={`flex items-center pl-11 pr-3 py-2 rounded-md relative cursor-pointer transition-colors ${currentView === 'payroll_period' ? 'bg-[#EBF5FF] text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  {currentView === 'payroll_period' && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r-md"></div>
                  )}
                  <span className="text-sm font-medium">Kỳ tính Lương</span>
                </div>
                <div 
                  onClick={() => onNavigate?.('payroll_table')}
                  className={`flex items-center pl-11 pr-3 py-2 rounded-md relative cursor-pointer transition-colors ${currentView === 'payroll_table' ? 'bg-[#EBF5FF] text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  {currentView === 'payroll_table' && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r-md"></div>
                  )}
                  <span className="text-sm font-medium">Bảng lương</span>
                </div>
              </div>
            )}
          </div>
          <div 
            onClick={() => onNavigate?.('categories')}
            className={`flex items-center px-3 py-2.5 rounded-md relative cursor-pointer transition-colors ${currentView === 'categories' || currentView === 'category_customers' || currentView === 'category_suppliers' || currentView === 'category_insurance' || currentView === 'category_material_groups' || currentView === 'category_warehouses' || currentView === 'category_units' || currentView === 'category_lots' || currentView === 'spare_parts' || currentView === 'vehicles' || currentView === 'category_drivers' || currentView === 'category_vehicle_types' || currentView === 'category_bank_accounts' || currentView === 'tax_categories' || currentView === 'omnichannel' ? 'bg-[#EBF5FF] text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            {(currentView === 'categories' || currentView === 'category_customers' || currentView === 'category_suppliers' || currentView === 'category_insurance' || currentView === 'category_material_groups' || currentView === 'category_warehouses' || currentView === 'category_units' || currentView === 'category_lots' || currentView === 'spare_parts' || currentView === 'vehicles' || currentView === 'category_drivers' || currentView === 'category_vehicle_types' || currentView === 'category_bank_accounts' || currentView === 'tax_categories' || currentView === 'omnichannel') && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r-md"></div>
            )}
            <List className="w-5 h-5 mr-3" />
            <span className="text-sm font-medium">Danh mục</span>
          </div>
        </nav>

        {/* Version Footer */}
        <div className="px-6 py-3 border-t border-gray-200 text-base font-bold text-red-600">
          v.0.1.8
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-6 z-10">
          <div className="flex-1 flex items-center">
            {currentView === 'repair_service' && (
              <h1 className="text-xl font-bold text-gray-800 mr-8">Dịch vụ sửa chữa</h1>
            )}
            {currentView === 'customers' && (
              <h1 className="text-xl font-bold text-gray-800 mr-8">Khách hàng</h1>
            )}
            {currentView === 'customer_bookings' && (
              <h1 className="text-xl font-bold text-gray-800 mr-8">Lịch hẹn Khách đặt</h1>
            )}
            {currentView === 'discount_management' && (
              <h1 className="text-xl font-bold text-gray-800 mr-8">Quản lý chiết khấu</h1>
            )}
            {currentView === 'employee_list' && (
              <h1 className="text-xl font-bold text-gray-800 mr-8">Danh sách Nhân sự</h1>
            )}
            {currentView === 'labor_list' && (
              <h1 className="text-xl font-bold text-gray-800 mr-8">Hồ sơ Hợp đồng</h1>
            )}
            {currentView === 'department_list' && (
              <h1 className="text-xl font-bold text-gray-800 mr-8">Bộ phận</h1>
            )}
            {currentView === 'position_list' && (
              <h1 className="text-xl font-bold text-gray-800 mr-8">Chức vụ/ Vị trí</h1>
            )}
            {currentView === 'salary_grade_list' && (
              <h1 className="text-xl font-bold text-gray-800 mr-8">Cấu trúc Thang bảng lương</h1>
            )}
            {currentView === 'contract_type_list' && (
              <h1 className="text-xl font-bold text-gray-800 mr-8">Quản lý loại hợp đồng</h1>
            )}
            {currentView === 'salary_rule_group' && (
              <h1 className="text-xl font-bold text-gray-800 mr-8">Nhóm quy tắc Lương</h1>
            )}
            {currentView === 'salary_structure' && (
              <h1 className="text-xl font-bold text-gray-800 mr-8">Cấu trúc Lương</h1>
            )}
            {currentView === 'insurance_tax_params' && (
              <h1 className="text-xl font-bold text-gray-800 mr-8">Tham số BHXH & Thuế</h1>
            )}
            {currentView === 'payroll_period' && (
              <h1 className="text-xl font-bold text-gray-800 mr-8">Kỳ tính lương</h1>
            )}
            {currentView === 'payroll_table' && (
              <h1 className="text-xl font-bold text-gray-800 mr-8">Bảng lương</h1>
            )}
            {currentView === 'category_customers' && (
              <h1 className="text-xl font-bold text-gray-800 mr-8">Khách hàng</h1>
            )}
            {currentView === 'category_suppliers' && (
              <h1 className="text-xl font-bold text-gray-800 mr-8">Nhà cung cấp</h1>
            )}
            {currentView === 'category_insurance' && (
              <h1 className="text-xl font-bold text-gray-800 mr-8">Đơn vị bảo hiểm</h1>
            )}
            {currentView === 'category_material_groups' && (
              <h1 className="text-xl font-bold text-gray-800 mr-8">Nhóm sản phẩm &amp; dịch vụ</h1>
            )}
            {currentView === 'category_warehouses' && (
              <h1 className="text-xl font-bold text-gray-800 mr-8">Danh sách kho</h1>
            )}
            {currentView === 'category_units' && (
              <h1 className="text-xl font-bold text-gray-800 mr-8">Đơn vị tính</h1>
            )}
            {currentView === 'category_lots' && (
              <h1 className="text-xl font-bold text-gray-800 mr-8">Danh mục lô</h1>
            )}
            {currentView === 'vehicles' && (
              <h1 className="text-xl font-bold text-gray-800 mr-8">Danh sách xe</h1>
            )}
            {currentView === 'category_drivers' && (
              <h1 className="text-xl font-bold text-gray-800 mr-8">Tài xế</h1>
            )}
            {currentView === 'category_vehicle_types' && (
              <h1 className="text-xl font-bold text-gray-800 mr-8">Loại xe</h1>
            )}
            {currentView === 'category_bank_accounts' && (
              <h1 className="text-xl font-bold text-gray-800 mr-8">Tài khoản ngân hàng</h1>
            )}
            {currentView === 'tax_categories' && (
              <h1 className="text-xl font-bold text-gray-800 mr-8">Danh mục thuế</h1>
            )}
            {currentView === 'document_cabinet' && (
              <h1 className="text-xl font-bold text-gray-800 mr-8">Tủ lưu trữ</h1>
            )}
            {currentView === 'document_storage_categories' && (
              <h1 className="text-xl font-bold text-gray-800 mr-8">Phân loại lưu trữ</h1>
            )}
            {['category_customers', 'category_suppliers', 'category_insurance', 'category_material_groups', 'category_warehouses', 'category_units', 'category_lots', 'vehicles', 'category_drivers', 'category_vehicle_types', 'category_bank_accounts', 'tax_categories', 'document_cabinet', 'document_storage_categories', 'employee_list', 'labor_list', 'department_list', 'position_list', 'salary_grade_list', 'contract_type_list', 'salary_rule_group', 'salary_structure', 'insurance_tax_params', 'payroll_period', 'payroll_table'].includes(currentView) ? (
              <div className="flex-1 flex justify-end gap-3 mr-6 items-center">
                <button className="bg-[#1A4B9F] text-white px-4 py-1.5 rounded-[4px] text-sm font-medium flex items-center gap-2">
                  <Tag className="w-4 h-4 fill-white" />
                  Bán hàng
                </button>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Tra cứu phụ tùng" 
                    className="w-full border border-gray-300 rounded-full py-1.5 pl-9 pr-3 text-sm focus:outline-none focus:border-blue-500" 
                  />
                </div>
                <div className="relative w-[280px]">
                  <select className="w-full border border-gray-300 rounded-full py-1.5 pl-3 pr-8 text-sm outline-none appearance-none bg-white text-gray-700">
                    <option>[2026] - CTY TNHH SA...</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                </div>
              </div>
            ) : (
              <div className={`relative w-[400px] ${currentView === 'repair_service' || currentView === 'customers' || currentView === 'customer_bookings' || currentView === 'discount_management' ? '' : 'mx-auto'}`}>
                <input 
                  type="text" 
                  placeholder="Tìm biển số xe" 
                  className="w-full border border-gray-300 rounded-md py-2 pl-4 pr-10 text-sm outline-none focus:border-blue-500 transition-colors" 
                />
                <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-6">
            <button className="relative text-gray-500 hover:text-gray-700 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="relative" ref={headerMenuRef}>
              <button
                type="button"
                onClick={() => {
                  setIsUserMenuOpen(false);
                  updateHeaderMenuPosition();
                  setIsHeaderMenuOpen((prev) => !prev);
                }}
                title="Menu"
                aria-label="Menu"
                className={`w-10 h-10 rounded-lg border flex items-center justify-center transition-colors cursor-pointer shadow-xs ${
                  isHeaderMenuOpen
                    ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                    : 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 hover:border-blue-300'
                }`}
              >
                <Menu className="w-6 h-6" strokeWidth={2.25} />
              </button>
              {isHeaderMenuOpen &&
                createPortal(
                  <div
                    ref={headerMenuPanelRef}
                    style={{ top: `${headerMenuPos.top}px`, right: `${headerMenuPos.right}px` }}
                    className="fixed w-72 max-h-[80vh] overflow-y-auto bg-[#0F294A] text-slate-100 rounded-xl shadow-[0_24px_60px_rgba(15,23,42,0.55)] border-2 border-[#3B82F6] p-2.5 z-[9999] space-y-1"
                  >
                    <div
                      onClick={() => handleHeaderMenuNavigate('repair_service')}
                      className={`flex items-center px-3 py-2.5 rounded-md relative cursor-pointer transition-colors ${currentView === 'repair_service' ? 'bg-[#2563EB] text-white font-semibold' : 'text-slate-100 hover:bg-[#1E3A5F] hover:text-white'}`}
                    >
                      {currentView === 'repair_service' && (
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-amber-400 rounded-r-md"></div>
                      )}
                      <Wrench className="w-5 h-5 mr-3" />
                      <span className="text-sm font-medium">Dịch vụ sửa chữa</span>
                    </div>
                    <div
                      onClick={() => handleHeaderMenuNavigate('commercial_sales')}
                      className={`flex items-center px-3 py-2.5 rounded-md relative cursor-pointer transition-colors ${currentView === 'commercial_sales' ? 'bg-[#2563EB] text-white font-semibold' : 'text-slate-100 hover:bg-[#1E3A5F] hover:text-white'}`}
                    >
                      {currentView === 'commercial_sales' && (
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-amber-400 rounded-r-md"></div>
                      )}
                      <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm font-medium">Bán hàng thương mại</span>
                    </div>
                    {/* Hồ sơ & Tài liệu */}
                    <div>
                      <div
                        onClick={() => setIsHeaderDocsOpen((prev) => !prev)}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-md relative cursor-pointer transition-colors ${isDocumentsActive ? 'bg-[#1B3B66] text-amber-300 font-semibold' : 'text-slate-100 hover:bg-[#1E3A5F] hover:text-white'}`}
                      >
                        <div className="flex items-center">
                          <FileText className="w-5 h-5 mr-3" />
                          <span className="text-sm font-medium">Hồ sơ &amp; Tài liệu</span>
                        </div>
                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isHeaderDocsOpen ? 'rotate-180' : ''}`} />
                      </div>
                      {isHeaderDocsOpen && (
                        <div className="mt-1 space-y-1">
                          <div
                            onClick={() => handleHeaderMenuNavigate('document_cabinet')}
                            className={`flex items-center pl-11 pr-3 py-2 rounded-md relative cursor-pointer transition-colors ${currentView === 'document_cabinet' ? 'bg-[#2563EB] text-white font-semibold' : 'text-slate-200 hover:bg-[#1E3A5F] hover:text-white'}`}
                          >
                            {currentView === 'document_cabinet' && (
                              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-amber-400 rounded-r-md"></div>
                            )}
                            <span className="text-sm font-medium">Tủ lưu trữ</span>
                          </div>
                          <div
                            onClick={() => handleHeaderMenuNavigate('document_storage_categories')}
                            className={`flex items-center pl-11 pr-3 py-2 rounded-md relative cursor-pointer transition-colors ${currentView === 'document_storage_categories' ? 'bg-[#2563EB] text-white font-semibold' : 'text-slate-200 hover:bg-[#1E3A5F] hover:text-white'}`}
                          >
                            {currentView === 'document_storage_categories' && (
                              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-amber-400 rounded-r-md"></div>
                            )}
                            <span className="text-sm font-medium">Phân loại lưu trữ</span>
                          </div>
                        </div>
                      )}
                    </div>
                    {/* CRM */}
                    <div>
                      <div
                        onClick={() => setIsHeaderCrmOpen((prev) => !prev)}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-md relative cursor-pointer transition-colors ${isCrmActive ? 'bg-[#1B3B66] text-amber-300 font-semibold' : 'text-slate-100 hover:bg-[#1E3A5F] hover:text-white'}`}
                      >
                        <div className="flex items-center">
                          <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <span className="text-sm font-medium">CRM</span>
                        </div>
                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isHeaderCrmOpen ? 'rotate-180' : ''}`} />
                      </div>
                      {isHeaderCrmOpen && (
                        <div className="mt-1 space-y-1">
                          <div
                            onClick={() => handleHeaderMenuNavigate('potential_customers')}
                            className={`flex items-center pl-11 pr-3 py-2 rounded-md relative cursor-pointer transition-colors ${currentView === 'potential_customers' ? 'bg-[#2563EB] text-white font-semibold' : 'text-slate-200 hover:bg-[#1E3A5F] hover:text-white'}`}
                          >
                            {currentView === 'potential_customers' && (
                              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-amber-400 rounded-r-md"></div>
                            )}
                            <span className="text-sm font-medium">Khách hàng quan tâm</span>
                          </div>
                          <div>
                            <div
                              onClick={() => setIsHeaderReturnInviteOpen((prev) => !prev)}
                              className={`flex items-center justify-between pl-11 pr-3 py-2 rounded-md relative cursor-pointer transition-colors ${isReturnInviteActive ? 'bg-[#1B3B66] text-amber-300 font-semibold' : 'text-slate-200 hover:bg-[#1E3A5F] hover:text-white'}`}
                            >
                              <span className="text-sm font-medium">Mời Khách quay lại</span>
                              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isHeaderReturnInviteOpen ? 'rotate-180' : ''}`} />
                            </div>
                            {isHeaderReturnInviteOpen && (
                              <div className="mt-1 space-y-1">
                                <div
                                  onClick={() => handleHeaderMenuNavigate('proactive_reminders')}
                                  className={`flex items-center pl-16 pr-3 py-2 rounded-md relative cursor-pointer transition-colors ${currentView === 'proactive_reminders' ? 'bg-[#2563EB] text-white font-semibold' : 'text-slate-200 hover:bg-[#1E3A5F] hover:text-white'}`}
                                >
                                  {currentView === 'proactive_reminders' && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-amber-400 rounded-r-md"></div>
                                  )}
                                  <span className="text-sm font-medium">Lịch nhắc chủ động</span>
                                </div>
                                <div
                                  onClick={() => handleHeaderMenuNavigate('customer_segments')}
                                  className={`flex items-center pl-16 pr-3 py-2 rounded-md relative cursor-pointer transition-colors ${currentView === 'customer_segments' ? 'bg-[#2563EB] text-white font-semibold' : 'text-slate-200 hover:bg-[#1E3A5F] hover:text-white'}`}
                                >
                                  {currentView === 'customer_segments' && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-amber-400 rounded-r-md"></div>
                                  )}
                                  <span className="text-sm font-medium">Phân khúc Khách hàng</span>
                                </div>
                              </div>
                            )}
                          </div>
                          <div
                            onClick={() => handleHeaderMenuNavigate('customer_bookings')}
                            className={`flex items-center pl-11 pr-3 py-2 rounded-md relative cursor-pointer transition-colors ${currentView === 'customer_bookings' ? 'bg-[#2563EB] text-white font-semibold' : 'text-slate-200 hover:bg-[#1E3A5F] hover:text-white'}`}
                          >
                            {currentView === 'customer_bookings' && (
                              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-amber-400 rounded-r-md"></div>
                            )}
                            <span className="text-sm font-medium">Lịch hẹn Khách đặt</span>
                          </div>
                          <div
                            onClick={() => handleHeaderMenuNavigate('customers')}
                            className={`flex items-center pl-11 pr-3 py-2 rounded-md relative cursor-pointer transition-colors ${currentView === 'customers' ? 'bg-[#2563EB] text-white font-semibold' : 'text-slate-200 hover:bg-[#1E3A5F] hover:text-white'}`}
                          >
                            {currentView === 'customers' && (
                              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-amber-400 rounded-r-md"></div>
                            )}
                            <span className="text-sm font-medium">Khách hàng</span>
                          </div>
                          <div
                            onClick={() => handleHeaderMenuNavigate('discount_management')}
                            className={`flex items-center pl-11 pr-3 py-2 rounded-md relative cursor-pointer transition-colors ${currentView === 'discount_management' ? 'bg-[#2563EB] text-white font-semibold' : 'text-slate-200 hover:bg-[#1E3A5F] hover:text-white'}`}
                          >
                            {currentView === 'discount_management' && (
                              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-amber-400 rounded-r-md"></div>
                            )}
                            <span className="text-sm font-medium">Quản lý chiết khấu</span>
                          </div>
                          <div
                            onClick={() => handleHeaderMenuNavigate('service_quality')}
                            className={`flex items-center pl-11 pr-3 py-2 rounded-md relative cursor-pointer transition-colors ${currentView === 'service_quality' ? 'bg-[#2563EB] text-white font-semibold' : 'text-slate-200 hover:bg-[#1E3A5F] hover:text-white'}`}
                          >
                            {currentView === 'service_quality' && (
                              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-amber-400 rounded-r-md"></div>
                            )}
                            <span className="text-sm font-medium">Đánh giá chất lượng dịch vụ</span>
                          </div>
                        </div>
                      )}
                    </div>
                    {/* HRM */}
                    <div>
                      <div
                        onClick={() => setIsHeaderHrmOpen((prev) => !prev)}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-md relative cursor-pointer transition-colors ${isHrmActive ? 'bg-[#1B3B66] text-amber-300 font-semibold' : 'text-slate-100 hover:bg-[#1E3A5F] hover:text-white'}`}
                      >
                        <div className="flex items-center">
                          <Users className="w-5 h-5 mr-3" />
                          <span className="text-sm font-medium">HRM</span>
                        </div>
                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isHeaderHrmOpen ? 'rotate-180' : ''}`} />
                      </div>
                      {isHeaderHrmOpen && (
                        <div className="mt-1 space-y-1">
                          <div
                            onClick={() => handleHeaderMenuNavigate('employee_list')}
                            className={`flex items-center pl-11 pr-3 py-2 rounded-md relative cursor-pointer transition-colors ${currentView === 'employee_list' ? 'bg-[#2563EB] text-white font-semibold' : 'text-slate-200 hover:bg-[#1E3A5F] hover:text-white'}`}
                          >
                            {currentView === 'employee_list' && (
                              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-amber-400 rounded-r-md"></div>
                            )}
                            <span className="text-sm font-medium">Danh sách Nhân sự</span>
                          </div>
                          <div
                            onClick={() => handleHeaderMenuNavigate('labor_list')}
                            className={`flex items-center pl-11 pr-3 py-2 rounded-md relative cursor-pointer transition-colors ${currentView === 'labor_list' ? 'bg-[#2563EB] text-white font-semibold' : 'text-slate-200 hover:bg-[#1E3A5F] hover:text-white'}`}
                          >
                            {currentView === 'labor_list' && (
                              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-amber-400 rounded-r-md"></div>
                            )}
                            <span className="text-sm font-medium">Hồ sơ Hợp đồng</span>
                          </div>
                          <div
                            onClick={() => handleHeaderMenuNavigate('department_list')}
                            className={`flex items-center pl-11 pr-3 py-2 rounded-md relative cursor-pointer transition-colors ${currentView === 'department_list' ? 'bg-[#2563EB] text-white font-semibold' : 'text-slate-200 hover:bg-[#1E3A5F] hover:text-white'}`}
                          >
                            {currentView === 'department_list' && (
                              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-amber-400 rounded-r-md"></div>
                            )}
                            <span className="text-sm font-medium">Phòng ban / Bộ phận</span>
                          </div>
                          <div
                            onClick={() => handleHeaderMenuNavigate('position_list')}
                            className={`flex items-center pl-11 pr-3 py-2 rounded-md relative cursor-pointer transition-colors ${currentView === 'position_list' ? 'bg-[#2563EB] text-white font-semibold' : 'text-slate-200 hover:bg-[#1E3A5F] hover:text-white'}`}
                          >
                            {currentView === 'position_list' && (
                              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-amber-400 rounded-r-md"></div>
                            )}
                            <span className="text-sm font-medium">Chức vụ / Vị trí</span>
                          </div>
                          <div
                            onClick={() => handleHeaderMenuNavigate('salary_grade_list')}
                            className={`flex items-center pl-11 pr-3 py-2 rounded-md relative cursor-pointer transition-colors ${currentView === 'salary_grade_list' ? 'bg-[#2563EB] text-white font-semibold' : 'text-slate-200 hover:bg-[#1E3A5F] hover:text-white'}`}
                          >
                            {currentView === 'salary_grade_list' && (
                              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-amber-400 rounded-r-md"></div>
                            )}
                            <span className="text-sm font-medium">Thang bảng Lương</span>
                          </div>
                          <div
                            onClick={() => handleHeaderMenuNavigate('contract_type_list')}
                            className={`flex items-center pl-11 pr-3 py-2 rounded-md relative cursor-pointer transition-colors ${currentView === 'contract_type_list' ? 'bg-[#2563EB] text-white font-semibold' : 'text-slate-200 hover:bg-[#1E3A5F] hover:text-white'}`}
                          >
                            {currentView === 'contract_type_list' && (
                              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-amber-400 rounded-r-md"></div>
                            )}
                            <span className="text-sm font-medium">Loại hợp đồng</span>
                          </div>
                          <div
                            onClick={() => handleHeaderMenuNavigate('salary_rule_group')}
                            className={`flex items-center pl-11 pr-3 py-2 rounded-md relative cursor-pointer transition-colors ${currentView === 'salary_rule_group' ? 'bg-[#2563EB] text-white font-semibold' : 'text-slate-200 hover:bg-[#1E3A5F] hover:text-white'}`}
                          >
                            {currentView === 'salary_rule_group' && (
                              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-amber-400 rounded-r-md"></div>
                            )}
                            <span className="text-sm font-medium">Nhóm quy tắc Lương</span>
                          </div>
                          <div
                            onClick={() => handleHeaderMenuNavigate('salary_structure')}
                            className={`flex items-center pl-11 pr-3 py-2 rounded-md relative cursor-pointer transition-colors ${currentView === 'salary_structure' ? 'bg-[#2563EB] text-white font-semibold' : 'text-slate-200 hover:bg-[#1E3A5F] hover:text-white'}`}
                          >
                            {currentView === 'salary_structure' && (
                              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-amber-400 rounded-r-md"></div>
                            )}
                            <span className="text-sm font-medium">Cấu trúc Lương</span>
                          </div>
                          <div
                            onClick={() => handleHeaderMenuNavigate('insurance_tax_params')}
                            className={`flex items-center pl-11 pr-3 py-2 rounded-md relative cursor-pointer transition-colors ${currentView === 'insurance_tax_params' ? 'bg-[#2563EB] text-white font-semibold' : 'text-slate-200 hover:bg-[#1E3A5F] hover:text-white'}`}
                          >
                            {currentView === 'insurance_tax_params' && (
                              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-amber-400 rounded-r-md"></div>
                            )}
                            <span className="text-sm font-medium">Tham số BHXH &amp; Thuế</span>
                          </div>
                          <div
                            onClick={() => handleHeaderMenuNavigate('payroll_period')}
                            className={`flex items-center pl-11 pr-3 py-2 rounded-md relative cursor-pointer transition-colors ${currentView === 'payroll_period' ? 'bg-[#2563EB] text-white font-semibold' : 'text-slate-200 hover:bg-[#1E3A5F] hover:text-white'}`}
                          >
                            {currentView === 'payroll_period' && (
                              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-amber-400 rounded-r-md"></div>
                            )}
                            <span className="text-sm font-medium">Kỳ tính Lương</span>
                          </div>
                          <div
                            onClick={() => handleHeaderMenuNavigate('payroll_table')}
                            className={`flex items-center pl-11 pr-3 py-2 rounded-md relative cursor-pointer transition-colors ${currentView === 'payroll_table' ? 'bg-[#2563EB] text-white font-semibold' : 'text-slate-200 hover:bg-[#1E3A5F] hover:text-white'}`}
                          >
                            {currentView === 'payroll_table' && (
                              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-amber-400 rounded-r-md"></div>
                            )}
                            <span className="text-sm font-medium">Bảng lương</span>
                          </div>
                        </div>
                      )}
                    </div>
                    <div
                      onClick={() => handleHeaderMenuNavigate('categories')}
                      className={`flex items-center px-3 py-2.5 rounded-md relative cursor-pointer transition-colors ${currentView === 'categories' || currentView === 'category_customers' || currentView === 'category_suppliers' || currentView === 'category_insurance' || currentView === 'category_material_groups' || currentView === 'category_warehouses' || currentView === 'category_units' || currentView === 'category_lots' || currentView === 'spare_parts' || currentView === 'vehicles' || currentView === 'category_drivers' || currentView === 'category_vehicle_types' || currentView === 'category_bank_accounts' || currentView === 'tax_categories' || currentView === 'omnichannel' ? 'bg-[#2563EB] text-white font-semibold' : 'text-slate-100 hover:bg-[#1E3A5F] hover:text-white'}`}
                    >
                      {(currentView === 'categories' || currentView === 'category_customers' || currentView === 'category_suppliers' || currentView === 'category_insurance' || currentView === 'category_material_groups' || currentView === 'category_warehouses' || currentView === 'category_units' || currentView === 'category_lots' || currentView === 'spare_parts' || currentView === 'vehicles' || currentView === 'category_drivers' || currentView === 'category_vehicle_types' || currentView === 'category_bank_accounts' || currentView === 'tax_categories' || currentView === 'omnichannel') && (
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-amber-400 rounded-r-md"></div>
                      )}
                      <List className="w-5 h-5 mr-3" />
                      <span className="text-sm font-medium">Danh mục</span>
                    </div>
                  </div>,
                  document.body
                )}
            </div>
            <div className="relative" ref={userMenuRef}>
              <div
                onClick={() => {
                  setIsHeaderMenuOpen(false);
                  setIsUserMenuOpen((prev) => !prev);
                }}
                className="flex items-center space-x-3 cursor-pointer select-none"
              >
                <div className="w-9 h-9 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                  <User className="w-5 h-5" />
                </div>
                <div className="text-sm">
                  <div className="font-semibold text-gray-800">Chủ xưởng</div>
                  <div className="text-xs text-gray-500">Chào buổi chiều</div>
                </div>
              </div>
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                  <button
                    type="button"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      setIsGeneralInfoModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 font-medium transition-colors cursor-pointer"
                  >
                    <User className="w-4 h-4 text-gray-500" />
                    <span>Thông tin chung</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      setCurrentPasswordInput('');
                      setNewPasswordInput('');
                      setConfirmNewPasswordInput('');
                      setIsChangePasswordModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 font-medium transition-colors cursor-pointer"
                  >
                    <Lock className="w-4 h-4 text-gray-500" />
                    <span>Đổi mật khẩu</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      signOut(auth);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-white">
          {children}
        </main>
      </div>

      {/* Pop-up Thông tin chung */}
      {isGeneralInfoModalOpen && (() => {
        const accountEmail = currentUser?.email || 'trungnualasao@gmail.com';
        const displayNameValue =
          profileName ||
          currentUser?.displayName ||
          (accountEmail ? accountEmail.split('@')[0] : 'Chủ xưởng');
        const avatarSrc = customAvatarUrl || currentUser?.photoURL || null;

        const profileTabs: { id: 'options' | 'account_info'; label: string }[] = [
          { id: 'options', label: 'Tùy chọn' },
          { id: 'account_info', label: 'Thông tin tài khoản' },
        ];

        const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = () => {
            if (typeof reader.result === 'string') {
              setCustomAvatarUrl(reader.result);
            }
          };
          reader.readAsDataURL(file);
        };

        const handleSignatureFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = () => {
            if (typeof reader.result === 'string') {
              setSignatureImageUrl(reader.result);
            }
          };
          reader.readAsDataURL(file);
        };

        return (
          <div className="fixed inset-0 z-[200] bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-5xl min-h-[560px] flex flex-col overflow-hidden">
              {/* Modal Top Bar */}
              <div className="px-6 py-3.5 border-b border-gray-200 flex items-center justify-between bg-white">
                <span className="text-sm font-semibold text-gray-700">Thông tin chung</span>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingProfile(false);
                    setIsGeneralInfoModalOpen(false);
                  }}
                  className="text-gray-400 hover:text-gray-700 p-1 rounded-md transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-8 flex-1 flex flex-col bg-white">
                {/* Top User Info Header */}
                <div className="flex flex-col sm:flex-row items-start gap-8 mb-7">
                  {/* Avatar Square */}
                  <div className="relative w-[156px] h-[156px] rounded-[12px] bg-[#7D4E78] overflow-hidden shrink-0 flex items-end justify-center shadow-xs group">
                    <input
                      ref={avatarFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarFileChange}
                      className="hidden"
                    />
                    {avatarSrc ? (
                      <img
                        src={avatarSrc}
                        alt={displayNameValue}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <svg viewBox="0 0 160 160" className="w-full h-full">
                        <rect width="160" height="160" fill="#7D4E78" />
                        {/* Shoulders / Shirt */}
                        <path
                          d="M20 160 C22 126, 48 118, 80 118 C112 118, 138 126, 140 160 Z"
                          fill="#1E2356"
                        />
                        {/* Neck */}
                        <rect x="65" y="96" width="30" height="28" rx="8" fill="#F29B7E" />
                        {/* Collar */}
                        <path
                          d="M55 114 L80 134 L66 142 L48 122 Z"
                          fill="#1E2356"
                          stroke="#0D102D"
                          strokeWidth="1.5"
                        />
                        <path
                          d="M105 114 L80 134 L94 142 L112 122 Z"
                          fill="#1E2356"
                          stroke="#0D102D"
                          strokeWidth="1.5"
                        />
                        {/* Ears */}
                        <circle cx="44" cy="70" r="10" fill="#F4A688" />
                        <circle cx="116" cy="70" r="10" fill="#F4A688" />
                        {/* Face */}
                        <rect x="48" y="32" width="64" height="74" rx="26" fill="#F8B497" />
                        {/* Hair */}
                        <path
                          d="M46 62 C44 36, 56 20, 84 22 C102 23, 114 18, 116 28 C118 42, 114 54, 112 62 C112 46, 102 38, 80 38 C58 38, 48 46, 46 62 Z"
                          fill="#0B0B0D"
                        />
                        {/* Eyebrows */}
                        <path d="M58 53 Q66 49 74 53" stroke="#0B0B0D" strokeWidth="4" strokeLinecap="round" fill="none" />
                        <path d="M86 53 Q94 49 102 53" stroke="#0B0B0D" strokeWidth="4" strokeLinecap="round" fill="none" />
                        {/* Glasses */}
                        <circle cx="66" cy="66" r="11" fill="#D8DCE6" fillOpacity="0.45" stroke="#1E2356" strokeWidth="2" />
                        <circle cx="94" cy="66" r="11" fill="#D8DCE6" fillOpacity="0.45" stroke="#1E2356" strokeWidth="2" />
                        <line x1="77" y1="65" x2="83" y2="65" stroke="#1E2356" strokeWidth="2" />
                        {/* Eyes */}
                        <ellipse cx="66" cy="66" rx="2" ry="4" fill="#1E2356" />
                        <ellipse cx="94" cy="66" rx="2" ry="4" fill="#1E2356" />
                        {/* Nose */}
                        <path d="M80 65 L80 79 L75 80" stroke="#D97E5E" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                        {/* Smile */}
                        <path d="M72 87 Q78 92 85 88" stroke="#C86D51" strokeWidth="2.2" strokeLinecap="round" fill="none" />
                      </svg>
                    )}

                    {isEditingProfile && (
                      <button
                        type="button"
                        onClick={() => avatarFileInputRef.current?.click()}
                        className="absolute inset-0 bg-black/45 flex flex-col items-center justify-center gap-1.5 text-white text-xs font-medium transition-opacity cursor-pointer"
                      >
                        <Camera className="w-6 h-6" />
                        <span>Thay đổi ảnh</span>
                      </button>
                    )}
                  </div>

                  {/* Account Details Column */}
                  <div className="pt-1 space-y-2.5 flex-1">
                    {isEditingProfile ? (
                      <input
                        type="text"
                        value={displayNameValue}
                        onChange={(e) => setProfileName(e.target.value)}
                        className="text-[32px] font-normal text-[#111827] leading-tight tracking-tight mb-2 px-3 py-1 border border-blue-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full max-w-md"
                      />
                    ) : (
                      <h2 className="text-[36px] font-normal text-[#111827] leading-tight tracking-tight mb-3">
                        {displayNameValue}
                      </h2>
                    )}

                    <div className="flex items-center gap-3 text-[15px] text-[#374151]">
                      <Phone className="w-4 h-4 fill-[#212529] text-[#212529] shrink-0" />
                      {isEditingProfile ? (
                        <input
                          type="text"
                          value={profilePhone}
                          onChange={(e) => setProfilePhone(e.target.value)}
                          className="px-2.5 py-1 border border-blue-400 rounded-md text-[15px] text-[#374151] focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                        />
                      ) : (
                        <span>{profilePhone}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tabs Navigation */}
                <div className="border-b border-gray-200 flex items-end">
                  {profileTabs.map((tab, idx) => {
                    const isActive = activeProfileTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveProfileTab(tab.id)}
                        className={`px-5 py-3 text-[15px] transition-colors cursor-pointer relative -mb-px ${
                          isActive
                            ? 'bg-white text-[#714B67] font-medium border-t-[3px] border-t-[#714B67] border-l border-r border-gray-200 border-b-white'
                            : `bg-[#F8F9FA] hover:bg-gray-100 text-[#374151] font-normal border-t border-b border-r border-gray-200 ${
                                idx === 0 ? 'border-l' : ''
                              } ${idx === profileTabs.length - 1 ? 'rounded-tr-md' : ''}`
                        }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                {/* Tab Content */}
                <div className="pt-6 flex-1 text-sm text-gray-700">
                  {activeProfileTab === 'options' && (
                    <div className="space-y-6 max-w-2xl">
                      <div className="flex items-center justify-between py-2 border-b border-gray-100 gap-4">
                        <span className="font-semibold text-gray-600">Ngôn ngữ</span>
                        <select
                          value={profileLanguage}
                          onChange={(e) => setProfileLanguage(e.target.value)}
                          className="px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        >
                          <option value="Tiếng Việt">Tiếng Việt</option>
                          <option value="Tiếng Anh">Tiếng Anh</option>
                        </select>
                      </div>

                      <div className="flex items-start justify-between py-2 border-b border-gray-100 gap-4">
                        <span className="font-semibold text-gray-600 pt-1">Tệp chữ ký:</span>
                        <div className="flex flex-col items-end gap-2">
                          <input
                            ref={signatureFileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleSignatureFileChange}
                            className="hidden"
                          />
                          {signatureImageUrl ? (
                            <div className="relative group border border-gray-200 rounded-lg p-2 bg-gray-50">
                              <img
                                src={signatureImageUrl}
                                alt="Tệp chữ ký"
                                className="h-24 max-w-[260px] object-contain rounded"
                              />
                              <button
                                type="button"
                                onClick={() => signatureFileInputRef.current?.click()}
                                className="mt-2 w-full px-3 py-1 text-xs font-medium text-blue-600 bg-white border border-blue-200 rounded hover:bg-blue-50 transition-colors cursor-pointer"
                              >
                                Thay đổi ảnh chữ ký
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => signatureFileInputRef.current?.click()}
                              className="w-56 h-28 border-2 border-dashed border-gray-300 hover:border-blue-400 rounded-lg bg-gray-50/70 hover:bg-blue-50/30 flex flex-col items-center justify-center gap-1.5 text-gray-500 hover:text-blue-600 transition-colors cursor-pointer"
                            >
                              <Camera className="w-5 h-5" />
                              <span className="text-xs font-medium">Chèn hình ảnh chữ ký</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeProfileTab === 'account_info' && (
                    <div className="space-y-5 max-w-3xl">
                      {/* Tài khoản: read-only mãi mãi */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-4 py-2 border-b border-gray-100">
                        <label className="font-semibold text-gray-600">Tài khoản:</label>
                        <div className="sm:col-span-2 flex items-center gap-2.5">
                          <input
                            type="text"
                            value={accountEmail}
                            readOnly
                            disabled
                            className="flex-1 px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm text-gray-500 cursor-not-allowed select-none focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setCurrentPasswordInput('');
                              setNewPasswordInput('');
                              setConfirmNewPasswordInput('');
                              setIsChangePasswordModalOpen(true);
                            }}
                            className="px-3.5 py-2 rounded-md border border-blue-200 bg-blue-50 hover:bg-blue-100 text-[#1677FF] text-xs font-semibold transition-colors cursor-pointer shrink-0 whitespace-nowrap"
                          >
                            Đổi mật khẩu
                          </button>
                        </div>
                      </div>

                      {/* Email nhận thông báo: */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-4 py-2 border-b border-gray-100">
                        <label className="font-semibold text-gray-600">Email nhận thông báo:</label>
                        <div className="sm:col-span-2">
                          <input
                            type="email"
                            value={notificationEmail}
                            readOnly={!isEditingProfile}
                            onChange={(e) => setNotificationEmail(e.target.value)}
                            placeholder="Nhập email nhận thông báo..."
                            className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none ${
                              isEditingProfile
                                ? 'bg-white border-blue-400 text-gray-900 focus:ring-2 focus:ring-blue-500'
                                : 'bg-white border-gray-200 text-gray-800'
                            }`}
                          />
                        </div>
                      </div>

                      {/* Thiết bị đang đăng nhập: */}
                      <div className="py-2">
                        <label className="block font-semibold text-gray-600 mb-3">
                          Thiết bị đang đăng nhập:
                        </label>
                        <div className="border border-gray-200 rounded-lg divide-y divide-gray-200 overflow-hidden">
                          {loggedInDevices.length === 0 ? (
                            <div className="px-4 py-6 text-center text-gray-400 italic text-xs">
                              Không có phiên đăng nhập nào.
                            </div>
                          ) : (
                            loggedInDevices.map((session) => (
                              <div
                                key={session.id}
                                className="px-4 py-3 bg-white hover:bg-gray-50/70 flex items-center justify-between gap-4"
                              >
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {session.deviceName}
                                  </div>
                                  <div className="text-xs text-gray-500 mt-0.5">
                                    {session.location} • {session.lastActive}
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setLoggedInDevices((prev) =>
                                      prev.filter((d) => d.id !== session.id)
                                    );
                                  }}
                                  className="px-3 py-1.5 rounded-md border border-red-200 bg-red-50/60 hover:bg-red-100 text-red-600 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                                >
                                  <LogOut className="w-3.5 h-3.5" />
                                  <span>Đăng xuất</span>
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile((prev) => !prev)}
                  className="px-4 py-1.5 rounded-md bg-[#1677FF] hover:bg-blue-600 text-white text-sm font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {isEditingProfile ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Lưu</span>
                    </>
                  ) : (
                    <>
                      <Pencil className="w-4 h-4" />
                      <span>Chỉnh sửa</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingProfile(false);
                    setIsGeneralInfoModalOpen(false);
                  }}
                  className="px-4 py-1.5 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 text-sm font-medium transition-colors cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Pop-up Đổi mật khẩu */}
      {isChangePasswordModalOpen && (
        <div className="fixed inset-0 z-[220] bg-black/45 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-md overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <h4 className="text-sm font-bold text-gray-800">Đổi mật khẩu</h4>
              <button
                type="button"
                onClick={() => setIsChangePasswordModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 p-1 rounded-md transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Mật khẩu hiện tại
                </label>
                <input
                  type="password"
                  value={currentPasswordInput}
                  onChange={(e) => setCurrentPasswordInput(e.target.value)}
                  placeholder="Nhập mật khẩu hiện tại..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Mật khẩu mới
                </label>
                <input
                  type="password"
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  placeholder="Nhập mật khẩu mới..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Nhập lại Mật khẩu mới
                </label>
                <input
                  type="password"
                  value={confirmNewPasswordInput}
                  onChange={(e) => setConfirmNewPasswordInput(e.target.value)}
                  placeholder="Nhập lại mật khẩu mới..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsChangePasswordModalOpen(false)}
                className="px-4 py-1.5 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 text-xs font-medium transition-colors cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={() => setIsChangePasswordModalOpen(false)}
                className="px-4 py-1.5 rounded-md bg-[#1677FF] hover:bg-blue-600 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
