import React, { useState } from 'react';
import { useFirestoreCollection, useFirestoreRecord } from './firebase';
import { COLORS } from './constants';
import { Header } from './components/Header';
import { ProductTypeSelector } from './components/ProductTypeSelector';
import { MainForm } from './components/MainForm';
import { TabsSection } from './components/TabsSection';
import { ActionFooter } from './components/ActionFooter';
import { ProductType } from './types';
import { Layout } from './components/Layout';
import { CategoryList } from './components/CategoryList';
import { CategoryCustomersList } from './components/CategoryCustomersList';
import { CategorySuppliersList } from './components/CategorySuppliersList';
import { CategoryInsuranceCompaniesList } from './components/CategoryInsuranceCompaniesList';
import { CategoryMaterialGroupsList } from './components/CategoryMaterialGroupsList';
import { CategoryWarehousesList } from './components/CategoryWarehousesList';
import { CategoryUnitsList } from './components/CategoryUnitsList';
import { CategoryLotsList } from './components/CategoryLotsList';
import { SparePartsList } from './components/SparePartsList';
import { VehiclesList } from './components/VehiclesList';
import { CategoryDriversList } from './components/CategoryDriversList';
import { CategoryVehicleTypesList } from './components/CategoryVehicleTypesList';
import { CategoryBankAccountsList } from './components/CategoryBankAccountsList';
import { TaxCategoryList } from './components/TaxCategoryList';
import { OmnichannelConfig } from './components/OmnichannelConfig';
import { MarketplaceManagement } from './components/MarketplaceManagement';
import { OnlineOrdering } from './components/OnlineOrdering';
import { SupplierHomepage } from './components/SupplierHomepage';
import { CommercialSales } from './components/CommercialSales';
import { PurchaseOrders } from './components/PurchaseOrders';
import { RepairService } from './components/RepairService';
import {
  EventsModule,
  HistoryItem,
  TaskItem,
  ActivityItem,
} from './components/EventsModule';
import {
  PotentialCustomersModule,
  PotentialCustomerItem,
  MOCK_POTENTIAL_CUSTOMERS,
} from './components/PotentialCustomersModule';
import {
  ServiceQualityModule,
  ServiceQualityItem,
  ServiceQualityStatus,
  ServiceQualityCallResult,
} from './components/ServiceQualityModule';
import { CustomersModule } from './components/CustomersModule';
import {
  CustomerBookingsModule,
  CustomerBookingRecord,
  INITIAL_CUSTOMER_BOOKINGS,
  BookingNoteItem,
  BookingTaskItem,
  BookingActivityItem,
  INITIAL_BOOKING_INTERNAL_NOTES,
  INITIAL_BOOKING_TASKS,
} from './components/CustomerBookingsModule';
import {
  DiscountManagementModule,
  INITIAL_DISCOUNTS,
  DiscountRecord,
} from './components/DiscountManagementModule';
import { RegistrationApprovalModule } from './components/RegistrationApprovalModule';
import { EmployeeList } from './hrmv0.4-main/components/EmployeeList';
import { LaborList } from './hrmv0.4-main/components/LaborList';
import { DepartmentList } from './hrmv0.4-main/components/DepartmentList';
import { PositionList } from './hrmv0.4-main/components/PositionList';
import { SalaryGradeList } from './hrmv0.4-main/components/SalaryGradeList';
import { ContractTypeList } from './hrmv0.4-main/components/ContractTypeList';
import { SalaryRuleGroupList } from './hrmv0.4-main/components/SalaryRuleGroupList';
import { SalaryStructureList, INITIAL_STRUCTURES } from './hrmv0.4-main/components/SalaryStructureList';
import { InsuranceTaxParams } from './hrmv0.4-main/components/InsuranceTaxParams';
import { PayrollPeriodList, PayrollPeriod, INITIAL_PAYROLL_PERIODS } from './hrmv0.4-main/components/PayrollPeriodList';
import { PayrollTableList, PayrollTableRecord, INITIAL_PAYROLL_TABLES } from './hrmv0.4-main/components/PayrollTableList';
import { OrderProvider } from './context/OrderContext';

const App: React.FC = () => {
  const [productType, setProductType] = useState<ProductType>(ProductType.SPARE_PART);
  const [currentView, setCurrentView] = useState<'categories' | 'category_customers' | 'category_suppliers' | 'category_insurance' | 'category_material_groups' | 'category_warehouses' | 'category_units' | 'category_lots' | 'spare_parts' | 'vehicles' | 'category_drivers' | 'category_vehicle_types' | 'category_bank_accounts' | 'tax_categories' | 'omnichannel' | 'online_ordering' | 'commercial_sales' | 'purchase_orders' | 'supplier_homepage' | 'marketplace' | 'repair_service' | 'events' | 'potential_customers' | 'proactive_reminders' | 'customer_segments' | 'service_quality' | 'customer_bookings' | 'customers' | 'discount_management' | 'registration_approval' | 'employee_list' | 'labor_list' | 'department_list' | 'position_list' | 'salary_grade_list' | 'contract_type_list' | 'salary_rule_group' | 'salary_structure' | 'insurance_tax_params' | 'payroll_period' | 'payroll_table'>('categories');
  const [selectedSupplierId, setSelectedSupplierId] = useState<number | null>(null);
  const [potentialCustomers, setPotentialCustomers] = useFirestoreCollection<
    PotentialCustomerItem
  >('potential_customers', MOCK_POTENTIAL_CUSTOMERS, 'id');
  const [guestHistory, setGuestHistory] = useFirestoreRecord<Record<string, HistoryItem[]>>('crm_state_maps', 'guest_history', {});
  const [guestTasks, setGuestTasks] = useFirestoreRecord<Record<string, TaskItem[]>>('crm_state_maps', 'guest_tasks', {});
  const [guestActivityHistory, setGuestActivityHistory] = useFirestoreRecord<
    Record<string, ActivityItem[]>
  >('crm_state_maps', 'guest_activity_history', {});
  const [customerBookings, setCustomerBookings] = useFirestoreCollection<CustomerBookingRecord>(
    'customer_bookings',
    INITIAL_CUSTOMER_BOOKINGS,
    'id'
  );
  const [bookingInternalNotes, setBookingInternalNotes] = useFirestoreRecord<
    Record<string, BookingNoteItem[]>
  >('crm_state_maps', 'booking_internal_notes', INITIAL_BOOKING_INTERNAL_NOTES);
  const [bookingTasks, setBookingTasks] = useFirestoreRecord<
    Record<string, BookingTaskItem[]>
  >('crm_state_maps', 'booking_tasks', INITIAL_BOOKING_TASKS);
  const [bookingActivities, setBookingActivities] = useFirestoreRecord<
    Record<string, BookingActivityItem[]>
  >('crm_state_maps', 'booking_activities', {});
  const [bookingCounts, setBookingCounts] = useFirestoreRecord<Record<string, number>>('crm_state_maps', 'booking_counts', {});
  const [discounts, setDiscounts] = useFirestoreCollection<DiscountRecord>('discounts', INITIAL_DISCOUNTS, 'id');

  // Isolated & independent states for "Lịch nhắc chủ động" (proactive_reminders)
  const [proactiveReminders, setProactiveReminders] = useFirestoreCollection<
    PotentialCustomerItem
  >('proactive_reminders', () => {
    const cloned: PotentialCustomerItem[] = JSON.parse(JSON.stringify(MOCK_POTENTIAL_CUSTOMERS));
    const proactiveStatuses: PotentialCustomerItem['status'][] = [
      'Mới',
      'Khách hàng đã đặt lịch',
      'Đang theo dõi',
      'Khách hàng từ chối',
      'Khách hàng đã đặt lịch',
      'Khách hàng từ chối',
      'Mới',
      'Khách hàng đã đặt lịch',
      'Đang theo dõi',
      'Mới',
    ];
    return cloned.map((item, idx) => ({
      ...item,
      status: proactiveStatuses[idx % proactiveStatuses.length],
    }));
  }, 'id');
  const [proactiveGuestHistory, setProactiveGuestHistory] = useFirestoreRecord<Record<string, HistoryItem[]>>('crm_state_maps', 'proactive_guest_history', {});
  const [proactiveGuestTasks, setProactiveGuestTasks] = useFirestoreRecord<Record<string, TaskItem[]>>('crm_state_maps', 'proactive_guest_tasks', {});
  const [proactiveGuestActivityHistory, setProactiveGuestActivityHistory] = useFirestoreRecord<
    Record<string, ActivityItem[]>
  >('crm_state_maps', 'proactive_guest_activity_history', {});
  const [proactiveCustomerBookings, setProactiveCustomerBookings] = useFirestoreCollection<CustomerBookingRecord>(
    'proactive_customer_bookings',
    () => JSON.parse(JSON.stringify(INITIAL_CUSTOMER_BOOKINGS)),
    'id'
  );
  const [proactiveBookingInternalNotes, setProactiveBookingInternalNotes] = useFirestoreRecord<
    Record<string, BookingNoteItem[]>
  >('crm_state_maps', 'proactive_booking_internal_notes', () => JSON.parse(JSON.stringify(INITIAL_BOOKING_INTERNAL_NOTES)));
  const [proactiveBookingTasks, setProactiveBookingTasks] = useFirestoreRecord<
    Record<string, BookingTaskItem[]>
  >('crm_state_maps', 'proactive_booking_tasks', () => JSON.parse(JSON.stringify(INITIAL_BOOKING_TASKS)));
  const [proactiveBookingActivities, setProactiveBookingActivities] = useFirestoreRecord<
    Record<string, BookingActivityItem[]>
  >('crm_state_maps', 'proactive_booking_activities', {});
  const [proactiveBookingCounts, setProactiveBookingCounts] = useFirestoreRecord<Record<string, number>>('crm_state_maps', 'proactive_booking_counts', {});
  const [proactiveDiscounts] = useState<DiscountRecord[]>(() => JSON.parse(JSON.stringify(INITIAL_DISCOUNTS)));

  // Isolated & independent states for "Phân khúc khách hàng" (customer_segments)
  const [customerSegments, setCustomerSegments] = useFirestoreCollection<
    PotentialCustomerItem
  >('customer_segments', () => {
    const cloned: PotentialCustomerItem[] = JSON.parse(JSON.stringify(MOCK_POTENTIAL_CUSTOMERS));
    const segmentStatuses: PotentialCustomerItem['status'][] = [
      'Mới',
      'Khách hàng đã đặt lịch',
      'Đang theo dõi',
      'Khách hàng từ chối',
      'Khách hàng đã đặt lịch',
      'Khách hàng từ chối',
      'Mới',
      'Khách hàng đã đặt lịch',
      'Đang theo dõi',
      'Mới',
    ];
    const mockSegmentData = [
      {
        segmentName: 'Khách hàng sắp hết hạn Đăng kiểm & Bảo hiểm (30 ngày tới)',
        segmentPurpose: 'Mời gia hạn đăng kiểm & bảo hiểm vật chất xe',
        totalFilterCriteria: 3,
        roFilterScope: '6 tháng trở lại',
      },
      {
        segmentName: 'Khách hàng chạm mốc bảo dưỡng ODO & sau giao xe 3 tháng',
        segmentPurpose: 'Nhắc bảo dưỡng định kỳ & thay dầu nhớt',
        totalFilterCriteria: 4,
        roFilterScope: '3 tháng trở lại',
      },
      {
        segmentName: 'Khách hàng VIP Doanh thu cao & Đánh giá 5 sao',
        segmentPurpose: 'Chăm sóc khách hàng VIP doanh thu cao',
        totalFilterCriteria: 4,
        roFilterScope: '1 năm trở lại',
      },
      {
        segmentName: 'Khách hàng có Công nợ & Bảo hành cần theo dõi',
        segmentPurpose: 'Thu hồi công nợ & đối soát thanh toán',
        totalFilterCriteria: 3,
        roFilterScope: 'Tất cả',
      },
      {
        segmentName: 'Khách hàng lâu chưa quay lại xưởng (> 6 tháng)',
        segmentPurpose: 'Tái kích hoạt khách hàng lâu chưa quay lại xưởng',
        totalFilterCriteria: 5,
        roFilterScope: '6 tháng trở lại',
      },
      {
        segmentName: 'Khách hàng sắp hết hạn Bảo hành sản phẩm bán',
        segmentPurpose: 'Tư vấn gia hạn bảo hành phụ tùng & dịch vụ',
        totalFilterCriteria: 2,
        roFilterScope: '1 năm trở lại',
      },
      {
        segmentName: 'Khách hàng sử dụng RO - Dịch vụ sửa chữa đồng sơn',
        segmentPurpose: 'Khảo sát & xử lý khiếu nại chất lượng dịch vụ',
        totalFilterCriteria: 3,
        roFilterScope: '1 tháng trở lại',
      },
      {
        segmentName: 'Khách hàng mua Lốp & Ắc quy thương mại',
        segmentPurpose: 'Nhắc bảo dưỡng định kỳ & thay dầu nhớt',
        totalFilterCriteria: 3,
        roFilterScope: '6 tháng trở lại',
      },
      {
        segmentName: 'Khách hàng đánh giá dịch vụ dưới 4 sao cần CSKH',
        segmentPurpose: 'Khảo sát & xử lý khiếu nại chất lượng dịch vụ',
        totalFilterCriteria: 2,
        roFilterScope: '1 tháng trở lại',
      },
      {
        segmentName: 'Khách hàng bảo dưỡng mốc 40.000 km - 80.000 km',
        segmentPurpose: 'Nhắc bảo dưỡng định kỳ & thay dầu nhớt',
        totalFilterCriteria: 4,
        roFilterScope: '3 tháng trở lại',
      },
    ];
    return cloned.map((item, idx) => {
      const segInfo = mockSegmentData[idx % mockSegmentData.length];
      return {
        ...item,
        id: `seg-${item.id}`,
        status: segmentStatuses[idx % segmentStatuses.length],
        segmentName: segInfo.segmentName,
        segmentPurpose: segInfo.segmentPurpose,
        totalFilterCriteria: segInfo.totalFilterCriteria,
        roFilterScope: segInfo.roFilterScope,
      };
    });
  }, 'id');
  const [segmentGuestHistory, setSegmentGuestHistory] = useFirestoreRecord<Record<string, HistoryItem[]>>('crm_state_maps', 'segment_guest_history', {});
  const [segmentGuestTasks, setSegmentGuestTasks] = useFirestoreRecord<Record<string, TaskItem[]>>('crm_state_maps', 'segment_guest_tasks', {});
  const [segmentGuestActivityHistory, setSegmentGuestActivityHistory] = useFirestoreRecord<
    Record<string, ActivityItem[]>
  >('crm_state_maps', 'segment_guest_activity_history', {});
  const [segmentCustomerBookings, setSegmentCustomerBookings] = useFirestoreCollection<CustomerBookingRecord>(
    'segment_customer_bookings',
    () => JSON.parse(JSON.stringify(INITIAL_CUSTOMER_BOOKINGS)),
    'id'
  );
  const [segmentBookingInternalNotes, setSegmentBookingInternalNotes] = useFirestoreRecord<
    Record<string, BookingNoteItem[]>
  >('crm_state_maps', 'segment_booking_internal_notes', () => JSON.parse(JSON.stringify(INITIAL_BOOKING_INTERNAL_NOTES)));
  const [segmentBookingTasks, setSegmentBookingTasks] = useFirestoreRecord<
    Record<string, BookingTaskItem[]>
  >('crm_state_maps', 'segment_booking_tasks', () => JSON.parse(JSON.stringify(INITIAL_BOOKING_TASKS)));
  const [segmentBookingActivities, setSegmentBookingActivities] = useFirestoreRecord<
    Record<string, BookingActivityItem[]>
  >('crm_state_maps', 'segment_booking_activities', {});
  const [segmentBookingCounts, setSegmentBookingCounts] = useFirestoreRecord<Record<string, number>>('crm_state_maps', 'segment_booking_counts', {});
  const [segmentDiscounts] = useState<DiscountRecord[]>(() => JSON.parse(JSON.stringify(INITIAL_DISCOUNTS)));

  // Isolated & independent states for "Đánh giá chất lượng dịch vụ" (service_quality)
  const [serviceQualityReviews, setServiceQualityReviews] = useFirestoreCollection<
    ServiceQualityItem
  >('service_quality_reviews', () => {
    const cloned: ServiceQualityItem[] = JSON.parse(JSON.stringify(MOCK_POTENTIAL_CUSTOMERS));
    const serviceQualityStatuses: ServiceQualityStatus[] = [
      'Mới',
      'Hoàn thành',
      'Đang thực hiện',
      'Dừng',
      'Hoàn thành',
      'Dừng',
      'Mới',
      'Hoàn thành',
      'Đang thực hiện',
      'Mới',
    ];
    const serviceQualityCallResults: ServiceQualityCallResult[] = [
      'Gọi lần 1',
      'Gọi lần 2',
      'Gọi lần 3',
      'Từ chối',
      'Không nghe máy',
      'Từ chối',
      'Gọi lần 1',
      'Gọi lần 2',
      'Không nghe máy',
      'Gọi lần 1',
    ];
    return cloned.map((item, idx) => ({
      ...item,
      id: `sq-${item.id}`,
      status: serviceQualityStatuses[idx % serviceQualityStatuses.length],
      callResult: serviceQualityCallResults[idx % serviceQualityCallResults.length],
    }));
  }, 'id');
  const [serviceQualityGuestHistory, setServiceQualityGuestHistory] = useFirestoreRecord<Record<string, HistoryItem[]>>('crm_state_maps', 'service_quality_guest_history', {});
  const [serviceQualityGuestTasks, setServiceQualityGuestTasks] = useFirestoreRecord<Record<string, TaskItem[]>>('crm_state_maps', 'service_quality_guest_tasks', {});
  const [serviceQualityGuestActivityHistory, setServiceQualityGuestActivityHistory] = useFirestoreRecord<
    Record<string, ActivityItem[]>
  >('crm_state_maps', 'service_quality_guest_activity_history', {});
  const [serviceQualityCustomerBookings, setServiceQualityCustomerBookings] = useFirestoreCollection<CustomerBookingRecord>(
    'service_quality_customer_bookings',
    () => JSON.parse(JSON.stringify(INITIAL_CUSTOMER_BOOKINGS)),
    'id'
  );
  const [serviceQualityBookingInternalNotes, setServiceQualityBookingInternalNotes] = useFirestoreRecord<
    Record<string, BookingNoteItem[]>
  >('crm_state_maps', 'service_quality_booking_internal_notes', () => JSON.parse(JSON.stringify(INITIAL_BOOKING_INTERNAL_NOTES)));
  const [serviceQualityBookingTasks, setServiceQualityBookingTasks] = useFirestoreRecord<
    Record<string, BookingTaskItem[]>
  >('crm_state_maps', 'service_quality_booking_tasks', () => JSON.parse(JSON.stringify(INITIAL_BOOKING_TASKS)));
  const [serviceQualityBookingActivities, setServiceQualityBookingActivities] = useFirestoreRecord<
    Record<string, BookingActivityItem[]>
  >('crm_state_maps', 'service_quality_booking_activities', {});
  const [serviceQualityBookingCounts, setServiceQualityBookingCounts] = useFirestoreRecord<Record<string, number>>('crm_state_maps', 'service_quality_booking_counts', {});
  const [serviceQualityDiscounts] = useState<DiscountRecord[]>(() => JSON.parse(JSON.stringify(INITIAL_DISCOUNTS)));

  // Shared Salary Structures State between Cấu trúc Lương and Hồ sơ hợp đồng
  const [salaryStructures, setSalaryStructures] = useFirestoreCollection('salary_structures', INITIAL_STRUCTURES, 'id');

  // Shared Payroll States between Kỳ tính lương and Bảng lương
  const [payrollPeriods, setPayrollPeriods] = useFirestoreCollection<PayrollPeriod>('payroll_periods', INITIAL_PAYROLL_PERIODS, 'id');
  // Bảng lương: 1 record phù hợp với kỳ tính lương T10/2025 (T10_2025)
  const [payrollTables, setPayrollTables] = useFirestoreCollection<PayrollTableRecord>('payroll_tables', INITIAL_PAYROLL_TABLES, 'id');

  const handleCreateCustomerBooking = (
    bookingData: Omit<CustomerBookingRecord, 'id' | 'bookingCode'> & {
      id?: string;
    }
  ) => {
    setCustomerBookings((prev) => {
      const nextNum = String(prev.length + 1).padStart(2, '0');
      const newRecord: CustomerBookingRecord = {
        ...bookingData,
        id: bookingData.id || `cb-${Date.now()}`,
        bookingCode: `LH-241027-${nextNum}`,
      };
      return [newRecord, ...prev];
    });
  };

  const handleCreateProactiveBooking = (
    bookingData: Omit<CustomerBookingRecord, 'id' | 'bookingCode'> & {
      id?: string;
    }
  ) => {
    setProactiveCustomerBookings((prev) => {
      const nextNum = String(prev.length + 1).padStart(2, '0');
      const newRecord: CustomerBookingRecord = {
        ...bookingData,
        id: bookingData.id || `cb-pr-${Date.now()}`,
        bookingCode: `LH-241027-${nextNum}`,
      };
      return [newRecord, ...prev];
    });
  };

  const handleCreateSegmentBooking = (
    bookingData: Omit<CustomerBookingRecord, 'id' | 'bookingCode'> & {
      id?: string;
    }
  ) => {
    setSegmentCustomerBookings((prev) => {
      const nextNum = String(prev.length + 1).padStart(2, '0');
      const newRecord: CustomerBookingRecord = {
        ...bookingData,
        id: bookingData.id || `cb-seg-${Date.now()}`,
        bookingCode: `LH-241027-${nextNum}`,
      };
      return [newRecord, ...prev];
    });
  };

  const handleCreateServiceQualityBooking = (
    bookingData: Omit<CustomerBookingRecord, 'id' | 'bookingCode'> & {
      id?: string;
    }
  ) => {
    setServiceQualityCustomerBookings((prev) => {
      const nextNum = String(prev.length + 1).padStart(2, '0');
      const newRecord: CustomerBookingRecord = {
        ...bookingData,
        id: bookingData.id || `cb-sq-${Date.now()}`,
        bookingCode: `LH-241027-${nextNum}`,
      };
      return [newRecord, ...prev];
    });
  };

  return (
    <OrderProvider>
      <Layout currentView={currentView} onNavigate={(view) => setCurrentView(view as any)}>
        {currentView === 'categories' ? (
          <CategoryList 
            onSelectCategoryCustomers={() => setCurrentView('category_customers')}
            onSelectCategorySuppliers={() => setCurrentView('category_suppliers')}
            onSelectEmployees={() => setCurrentView('employee_list')}
            onSelectCategoryInsurance={() => setCurrentView('category_insurance')}
            onSelectSpareParts={() => setCurrentView('spare_parts')} 
            onSelectMaterialGroups={() => setCurrentView('category_material_groups')}
            onSelectWarehouses={() => setCurrentView('category_warehouses')}
            onSelectUnits={() => setCurrentView('category_units')}
            onSelectLots={() => setCurrentView('category_lots')}
            onSelectVehicles={() => setCurrentView('vehicles')}
            onSelectDrivers={() => setCurrentView('category_drivers')}
            onSelectVehicleTypes={() => setCurrentView('category_vehicle_types')}
            onSelectBankAccounts={() => setCurrentView('category_bank_accounts')}
            onSelectTaxCategories={() => setCurrentView('tax_categories')}
            onSelectOmnichannel={() => setCurrentView('omnichannel')}
          />
        ) : currentView === 'category_customers' ? (
          <CategoryCustomersList />
        ) : currentView === 'category_suppliers' ? (
          <CategorySuppliersList />
        ) : currentView === 'category_insurance' ? (
          <CategoryInsuranceCompaniesList />
        ) : currentView === 'category_material_groups' ? (
          <CategoryMaterialGroupsList />
        ) : currentView === 'category_warehouses' ? (
          <CategoryWarehousesList />
        ) : currentView === 'category_units' ? (
          <CategoryUnitsList />
        ) : currentView === 'category_lots' ? (
          <CategoryLotsList />
        ) : currentView === 'spare_parts' ? (
          <SparePartsList />
        ) : currentView === 'vehicles' ? (
          <VehiclesList />
        ) : currentView === 'category_drivers' ? (
          <CategoryDriversList />
        ) : currentView === 'category_vehicle_types' ? (
          <CategoryVehicleTypesList />
        ) : currentView === 'category_bank_accounts' ? (
          <CategoryBankAccountsList />
        ) : currentView === 'tax_categories' ? (
          <TaxCategoryList />
        ) : currentView === 'omnichannel' ? (
          <OmnichannelConfig onBack={() => setCurrentView('categories')} />
        ) : currentView === 'online_ordering' ? (
          <OnlineOrdering onNavigateToSupplier={(id) => {
            setSelectedSupplierId(id);
            setCurrentView('supplier_homepage');
          }} />
        ) : currentView === 'supplier_homepage' && selectedSupplierId ? (
          <SupplierHomepage supplierId={selectedSupplierId} onBack={() => setCurrentView('online_ordering')} />
        ) : currentView === 'commercial_sales' ? (
          <CommercialSales />
        ) : currentView === 'purchase_orders' ? (
          <PurchaseOrders />
        ) : currentView === 'marketplace' ? (
          <MarketplaceManagement />
        ) : currentView === 'repair_service' ? (
          <RepairService />
        ) : currentView === 'employee_list' ? (
          <EmployeeList />
        ) : currentView === 'labor_list' ? (
          <LaborList salaryStructures={salaryStructures} />
        ) : currentView === 'department_list' ? (
          <DepartmentList />
        ) : currentView === 'position_list' ? (
          <PositionList />
        ) : currentView === 'salary_grade_list' ? (
          <SalaryGradeList />
        ) : currentView === 'contract_type_list' ? (
          <ContractTypeList />
        ) : currentView === 'salary_rule_group' ? (
          <SalaryRuleGroupList />
        ) : currentView === 'salary_structure' ? (
          <SalaryStructureList structures={salaryStructures} setStructures={setSalaryStructures} />
        ) : currentView === 'insurance_tax_params' ? (
          <InsuranceTaxParams />
        ) : currentView === 'payroll_period' ? (
          <PayrollPeriodList 
            periods={payrollPeriods}
            setPeriods={setPayrollPeriods}
            payrollTables={payrollTables}
            setPayrollTables={setPayrollTables}
            onNavigateToPayrollTable={() => setCurrentView('payroll_table')}
          />
        ) : currentView === 'payroll_table' ? (
          <PayrollTableList 
            payrollTables={payrollTables}
            setPayrollTables={setPayrollTables}
            payrollPeriods={payrollPeriods}
            onNavigateToPeriod={() => setCurrentView('payroll_period')}
          />
        ) : currentView === 'events' ? (
          <EventsModule />
        ) : currentView === 'potential_customers' ? (
          <PotentialCustomersModule
            key="potential_customers"
            onCreateCustomerBooking={handleCreateCustomerBooking}
            bookingCounts={bookingCounts}
            setBookingCounts={setBookingCounts}
            customerBookings={customerBookings}
            setCustomerBookings={setCustomerBookings}
            discounts={discounts}
            events={potentialCustomers}
            setEvents={setPotentialCustomers}
            guestHistory={guestHistory}
            setGuestHistory={setGuestHistory}
            guestTasks={guestTasks}
            setGuestTasks={setGuestTasks}
            guestActivityHistory={guestActivityHistory}
            setGuestActivityHistory={setGuestActivityHistory}
            bookingInternalNotes={bookingInternalNotes}
            setBookingInternalNotes={setBookingInternalNotes}
            bookingTasks={bookingTasks}
            setBookingTasks={setBookingTasks}
            bookingActivities={bookingActivities}
            setBookingActivities={setBookingActivities}
          />
        ) : currentView === 'proactive_reminders' ? (
          <PotentialCustomersModule
            key="proactive_reminders"
            hideRegistrationSummary={true}
            onCreateCustomerBooking={handleCreateProactiveBooking}
            bookingCounts={proactiveBookingCounts}
            setBookingCounts={setProactiveBookingCounts}
            customerBookings={proactiveCustomerBookings}
            setCustomerBookings={setProactiveCustomerBookings}
            discounts={proactiveDiscounts}
            events={proactiveReminders}
            setEvents={setProactiveReminders}
            guestHistory={proactiveGuestHistory}
            setGuestHistory={setProactiveGuestHistory}
            guestTasks={proactiveGuestTasks}
            setGuestTasks={setProactiveGuestTasks}
            guestActivityHistory={proactiveGuestActivityHistory}
            setGuestActivityHistory={setProactiveGuestActivityHistory}
            bookingInternalNotes={proactiveBookingInternalNotes}
            setBookingInternalNotes={setProactiveBookingInternalNotes}
            bookingTasks={proactiveBookingTasks}
            setBookingTasks={setProactiveBookingTasks}
            bookingActivities={proactiveBookingActivities}
            setBookingActivities={setProactiveBookingActivities}
          />
        ) : currentView === 'customer_segments' ? (
          <PotentialCustomersModule
            key="customer_segments"
            hideRegistrationSummary={true}
            isCustomerSegmentsMode={true}
            onCreateCustomerBooking={handleCreateSegmentBooking}
            bookingCounts={segmentBookingCounts}
            setBookingCounts={setSegmentBookingCounts}
            customerBookings={segmentCustomerBookings}
            setCustomerBookings={setSegmentCustomerBookings}
            discounts={segmentDiscounts}
            events={customerSegments}
            setEvents={setCustomerSegments}
            guestHistory={segmentGuestHistory}
            setGuestHistory={setSegmentGuestHistory}
            guestTasks={segmentGuestTasks}
            setGuestTasks={setSegmentGuestTasks}
            guestActivityHistory={segmentGuestActivityHistory}
            setGuestActivityHistory={setSegmentGuestActivityHistory}
            bookingInternalNotes={segmentBookingInternalNotes}
            setBookingInternalNotes={setSegmentBookingInternalNotes}
            bookingTasks={segmentBookingTasks}
            setBookingTasks={setSegmentBookingTasks}
            bookingActivities={segmentBookingActivities}
            setBookingActivities={setSegmentBookingActivities}
          />
        ) : currentView === 'service_quality' ? (
          <ServiceQualityModule
            key="service_quality"
            hideRegistrationSummary={true}
            onCreateCustomerBooking={handleCreateServiceQualityBooking}
            bookingCounts={serviceQualityBookingCounts}
            setBookingCounts={setServiceQualityBookingCounts}
            customerBookings={serviceQualityCustomerBookings}
            setCustomerBookings={setServiceQualityCustomerBookings}
            discounts={serviceQualityDiscounts}
            events={serviceQualityReviews}
            setEvents={setServiceQualityReviews}
            guestHistory={serviceQualityGuestHistory}
            setGuestHistory={setServiceQualityGuestHistory}
            guestTasks={serviceQualityGuestTasks}
            setGuestTasks={setServiceQualityGuestTasks}
            guestActivityHistory={serviceQualityGuestActivityHistory}
            setGuestActivityHistory={setServiceQualityGuestActivityHistory}
            bookingInternalNotes={serviceQualityBookingInternalNotes}
            setBookingInternalNotes={setServiceQualityBookingInternalNotes}
            bookingTasks={serviceQualityBookingTasks}
            setBookingTasks={setServiceQualityBookingTasks}
            bookingActivities={serviceQualityBookingActivities}
            setBookingActivities={setServiceQualityBookingActivities}
          />
        ) : currentView === 'customer_bookings' ? (
          <CustomerBookingsModule
            bookings={customerBookings}
            setBookings={setCustomerBookings}
            discounts={discounts}
            bookingInternalNotes={bookingInternalNotes}
            setBookingInternalNotes={setBookingInternalNotes}
            bookingTasks={bookingTasks}
            setBookingTasks={setBookingTasks}
            bookingActivities={bookingActivities}
            setBookingActivities={setBookingActivities}
            guestHistory={guestHistory}
            setGuestHistory={setGuestHistory}
            guestTasks={guestTasks}
            setGuestTasks={setGuestTasks}
            guestActivityHistory={guestActivityHistory}
            setGuestActivityHistory={setGuestActivityHistory}
          />
        ) : currentView === 'customers' ? (
          <CustomersModule />
        ) : currentView === 'discount_management' ? (
          <DiscountManagementModule
            discounts={discounts}
            setDiscounts={setDiscounts}
          />
        ) : currentView === 'registration_approval' ? (
          <RegistrationApprovalModule />
        ) : (
          <div className="min-h-full font-sans bg-[#F2FBF5] text-gray-800 flex flex-col">
            <Header />
            
            <main className="flex-1 max-w-[1440px] w-full mx-auto px-8 py-8 animate-fadeIn">
              {/* Product Type Selection */}
              <ProductTypeSelector selected={productType} onChange={setProductType} />

              {/* Main Form Area */}
              <MainForm productType={productType} />

              {/* Detailed Tabs Area */}
              <TabsSection productType={productType} />
            </main>

            <ActionFooter onBack={() => setCurrentView('categories')} />
            
            {/* Global CSS for custom animations if needed */}
            <style>{`
              @keyframes fadeIn {
                  from { opacity: 0; transform: translateY(10px); }
                  to { opacity: 1; transform: translateY(0); }
              }
              .animate-fadeIn {
                  animation: fadeIn 0.4s ease-out forwards;
              }
            `}</style>
          </div>
        )}
      </Layout>
    </OrderProvider>
  );
};

export default App;