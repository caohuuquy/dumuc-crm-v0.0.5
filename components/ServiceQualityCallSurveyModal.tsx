import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import {
  X,
  Phone,
  Mail,
  MessageCircle,
  CalendarPlus,
  Car,
  FileText,
  UserCheck,
  CheckCircle2,
  Save,
  ClipboardCheck,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
} from 'lucide-react';
import type {
  PotentialCustomerItem,
  ServiceQualityCallResult,
  ServiceQualityStatus,
} from './ServiceQualityModule';
import type { HistoryItem, TaskItem, ActivityItem } from './EventsModule';

export interface SurveyQuestionAnswer {
  selected: string[];
  note: string;
}

export interface ServiceQualitySurveyData {
  answers: Record<string, SurveyQuestionAnswer>;
  updatedAt?: string;
}

interface SurveyQuestionConfig {
  id: string;
  index: number;
  category: string;
  question: string;
  script: string;
  options: string[];
}

export const SERVICE_QUALITY_SURVEY_QUESTIONS: SurveyQuestionConfig[] = [
  {
    id: 'repair_quality',
    index: 1,
    category: 'Chất lượng sửa chữa',
    question:
      'Từ lúc nhận xe đến nay, xe anh/chị có vận hành ổn định hay phát sinh vấn đề gì mới không?',
    script:
      'Từ hôm lấy xe về tới nay, anh/chị chạy thấy có êm không, có phát sinh vấn đề gì lạ không ạ?',
    options: ['Ổn định', 'Có phát sinh', 'Chưa đi nhiều nên chưa rõ'],
  },
  {
    id: 'quote_transparency',
    index: 2,
    category: 'Minh bạch và tuân thủ Quy trình báo giá',
    question:
      'Cố vấn dịch vụ có báo giá minh bạch và giải thích rõ từng hạng mục trước khi sửa chữa không?',
    script:
      'Hôm đó bạn cố vấn bên em có báo giá rõ ràng và giải thích kỹ từng mục trước khi làm xe cho mình không ạ?',
    options: [
      'Báo giá rõ ràng',
      'Giải thích chưa dễ hiểu',
      'Có phát sinh hạng mục nhưng chưa báo trước',
    ],
  },
  {
    id: 'payment_documents',
    index: 3,
    category: 'Thanh toán và chứng từ',
    question:
      'Anh/chị đã nhận đủ hóa đơn điện tử và các giấy tờ liên quan chưa?',
    script:
      'Không biết anh/chị đã nhận đủ hóa đơn điện tử với các giấy tờ liên quan đợt vừa rồi chưa ạ?',
    options: [
      'Đã nhận đủ',
      'Chưa nhận hóa đơn điện tử',
      'Khách không có nhu cầu lấy hóa đơn',
    ],
  },
  {
    id: 'time_commitment',
    index: 4,
    category: 'Cam kết thời gian',
    question: 'Garage có bàn giao xe đúng thời gian đã hẹn không?',
    script:
      'Hôm đó bên em giao xe cho anh/chị có đúng giờ hẹn không, hay có bị trễ hơn so với lúc đầu không ạ?',
    options: [
      'Đúng giờ hoặc sớm hơn hẹn',
      'Trễ hẹn (có báo trước)',
      'Trễ hẹn (không báo trước)',
    ],
  },
  {
    id: 'priority_improvement',
    index: 5,
    category: 'Cải thiện ưu tiên số 1 của Garage',
    question:
      'Anh/chị muốn garage cải thiện điểm nào nhất cho lần phục vụ tới?',
    script:
      'Để lần tới phục vụ mình tốt hơn nữa, anh/chị thấy bên em cần cải thiện nhất ở điểm nào ạ, ví dụ như khâu tư vấn, kỹ thuật hay phòng chờ ạ?',
    options: [
      'Hài lòng, không cần cải thiện',
      'Về dịch vụ',
      'Về KTV',
      'Về Cố vấn dịch vụ',
      'Về thanh toán',
      'Về giá',
      'Về cơ sở vật chất tại xưởng',
    ],
  },
  {
    id: 'utility_expansion',
    index: 6,
    category: 'Mong muốn mở rộng tiện ích',
    question:
      'Thời gian tới, anh/chị có nhu cầu sử dụng thêm dịch vụ hoặc tiện ích nào khác của garage không?',
    script:
      'Sắp tới nếu bên em mở thêm các tiện ích như làm ngoài giờ, làm Chủ Nhật, giao nhận xe tận nhà, cứu hộ hay hỗ trợ đăng kiểm, thì anh/chị thấy cái nào tiện nhất cho mình ạ?',
    options: [
      'Làm ngoài giờ',
      'Làm Chủ Nhật',
      'Giao nhận xe tận nhà',
      'Cứu hộ',
      'Hỗ trợ trước đăng kiểm',
      'Chưa có nhu cầu',
    ],
  },
];

export const CSKH_FEELING_QUESTION_ID = 'cskh_feeling';
export const CSKH_FEELING_OPTIONS: string[] = [
  'Rất thoải mái, thiện cảm cao',
  'Bình thường, trả lời ngắn gọn',
  'Có vẻ còn lăn tăn, ngại nói thẳng',
  'Bức xúc, có nguy cơ không quay lại',
];

const BASE_DESIGN_WIDTH = 1720;
const BASE_DESIGN_HEIGHT = 965;
const MIN_FIT_SCALE = 0.45;

const ACTIVITY_PAGE_SIZE = 4;
const NOTE_PAGE_SIZE = 3;
const TASK_PAGE_SIZE = 6;

const getLast5PlateDigits = (plate?: string): string => {
  if (!plate || !plate.trim()) return '[5 số cuối biển số]';
  const trimmed = plate.trim();
  const dashIdx = trimmed.indexOf('-');
  if (dashIdx !== -1 && dashIdx < trimmed.length - 1) {
    return trimmed.slice(dashIdx + 1);
  }
  const digits = trimmed.replace(/[^0-9]/g, '');
  if (digits.length >= 5) {
    return digits.slice(-5);
  }
  return trimmed.slice(-5);
};

const getVietnameseWeekdayAndDate = (dateStr?: string): string => {
  if (!dateStr || dateStr === '-') return '[Thứ/Ngày]';
  const match = dateStr.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return dateStr;
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const dt = new Date(year, month - 1, day);
  if (Number.isNaN(dt.getTime())) return dateStr;
  const weekdays = [
    'Chủ Nhật',
    'Thứ Hai',
    'Thứ Ba',
    'Thứ Tư',
    'Thứ Năm',
    'Thứ Sáu',
    'Thứ Bảy',
  ];
  return `${weekdays[dt.getDay()]} ${dateStr}`;
};

interface RoDateDisplayInfo {
  receiveDate: string;
  promisedDate: string;
  actualDate: string;
  daysAfterDeliveryLabel: string;
}

interface ServiceQualityCallSurveyModalProps {
  currentGuest: PotentialCustomerItem;
  roDateInfo: RoDateDisplayInfo;
  normalizedCallResult: ServiceQualityCallResult;
  normalizedStatus: ServiceQualityStatus;
  onClose: () => void;
  onCallStatusChange: (id: string, value: 'Chưa gọi' | 'Đã gọi') => void;
  onCallResultChange: (id: string, value: ServiceQualityCallResult) => void;
  onStatusChange: (id: string, value: ServiceQualityStatus) => void;
  onSaveSurvey: (
    id: string,
    survey: ServiceQualitySurveyData,
    logActivity?: boolean,
    fieldsUpdate?: {
      callStatus: 'Chưa gọi' | 'Đã gọi';
      callResult: ServiceQualityCallResult;
      status: ServiceQualityStatus;
    }
  ) => Promise<void> | void;
  onOpenRoDetail: (record: PotentialCustomerItem) => void;
  onCreateBooking: (record: PotentialCustomerItem) => void;
  onOpenZalo: (record: PotentialCustomerItem) => void;
  onOpenEmail: (record: PotentialCustomerItem) => void;
  activeTab: 'activity_history' | 'history' | 'tasks';
  setActiveTab: (tab: 'activity_history' | 'history' | 'tasks') => void;
  activityHistory: ActivityItem[];
  notesHistory: HistoryItem[];
  noteContent: string;
  setNoteContent: (val: string) => void;
  onSaveNote: () => void;
  tasks: TaskItem[];
  taskContent: string;
  setTaskContent: (val: string) => void;
  onAddTask: () => void;
  onToggleTask: (taskId: string) => void;
  editingTaskId: string | null;
  editTaskContent: string;
  setEditTaskContent: (val: string) => void;
  onStartEditTask: (task: TaskItem) => void;
  onSaveEditTask: () => void;
  onCancelEditTask: () => void;
}

export const ServiceQualityCallSurveyModal: React.FC<
  ServiceQualityCallSurveyModalProps
> = ({
  currentGuest,
  roDateInfo,
  normalizedCallResult,
  normalizedStatus,
  onClose,
  onCallStatusChange,
  onCallResultChange,
  onStatusChange,
  onSaveSurvey,
  onOpenRoDetail,
  onCreateBooking,
  onOpenZalo,
  onOpenEmail,
  activeTab,
  setActiveTab,
  activityHistory,
  notesHistory,
  noteContent,
  setNoteContent,
  onSaveNote,
  tasks,
  taskContent,
  setTaskContent,
  onAddTask,
  onToggleTask,
  editingTaskId,
  editTaskContent,
  setEditTaskContent,
  onStartEditTask,
  onSaveEditTask,
  onCancelEditTask,
}) => {
  const [answers, setAnswers] = useState<Record<string, SurveyQuestionAnswer>>(
    () => currentGuest.qualitySurvey?.answers || {}
  );
  const [draftCallStatus, setDraftCallStatus] = useState<'Chưa gọi' | 'Đã gọi'>(
    () => currentGuest.callStatus
  );
  const [draftCallResult, setDraftCallResult] = useState<ServiceQualityCallResult>(
    () => normalizedCallResult
  );
  const [draftStatus, setDraftStatus] = useState<ServiceQualityStatus>(
    () => normalizedStatus
  );
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);
  const [showQuestionHint, setShowQuestionHint] = useState(true);

  // Pagination states for Zone (3) so there are zero scrollbars anywhere
  const [activityPage, setActivityPage] = useState(1);
  const [notePage, setNotePage] = useState(1);
  const [taskPage, setTaskPage] = useState(1);

  // Viewport auto-fit scaling to guarantee big legible text with zero clipping, zero overlap, zero scrollbars
  const outerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const fitAttemptsRef = useRef(0);

  const [viewport, setViewport] = useState<{ w: number; h: number }>(() => ({
    w: typeof window !== 'undefined' ? window.innerWidth : BASE_DESIGN_WIDTH,
    h: typeof window !== 'undefined' ? window.innerHeight : BASE_DESIGN_HEIGHT,
  }));

  const computeBaseScale = (w: number, h: number): number => {
    const raw = Math.min(1, w / BASE_DESIGN_WIDTH, h / BASE_DESIGN_HEIGHT);
    return Math.max(MIN_FIT_SCALE, Number(raw.toFixed(4)));
  };

  const [scale, setScale] = useState<number>(() =>
    computeBaseScale(
      typeof window !== 'undefined' ? window.innerWidth : BASE_DESIGN_WIDTH,
      typeof window !== 'undefined' ? window.innerHeight : BASE_DESIGN_HEIGHT
    )
  );

  useEffect(() => {
    setAnswers(currentGuest.qualitySurvey?.answers || {});
    setDraftCallStatus(currentGuest.callStatus);
    setDraftCallResult(normalizedCallResult);
    setDraftStatus(normalizedStatus);
    setIsDirty(false);
    setSaveError(null);
    setJustSaved(false);
    setActivityPage(1);
    setNotePage(1);
    setTaskPage(1);
  }, [currentGuest.id]);

  useEffect(() => {
    if (!isDirty) {
      setAnswers(currentGuest.qualitySurvey?.answers || {});
      setDraftCallStatus(currentGuest.callStatus);
      setDraftCallResult(normalizedCallResult);
      setDraftStatus(normalizedStatus);
    }
  }, [
    isDirty,
    currentGuest.qualitySurvey?.updatedAt,
    currentGuest.callStatus,
    normalizedCallResult,
    normalizedStatus,
  ]);

  useEffect(() => {
    const updateSize = () => {
      const el = outerRef.current;
      const nextW = el ? el.clientWidth : window.innerWidth;
      const nextH = el ? el.clientHeight : window.innerHeight;
      if (nextW <= 0 || nextH <= 0) return;
      fitAttemptsRef.current = 0;
      setViewport({ w: nextW, h: nextH });
      setScale(computeBaseScale(nextW, nextH));
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && outerRef.current) {
      ro = new ResizeObserver(updateSize);
      ro.observe(outerRef.current);
    }
    return () => {
      window.removeEventListener('resize', updateSize);
      ro?.disconnect();
    };
  }, []);

  // Verify no element overflows or gets clipped; if any box overflows, nudge scale down smoothly
  useLayoutEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl || fitAttemptsRef.current >= 5) return;

    let maxOverflowRatio = 1;
    if (canvasEl.scrollHeight > canvasEl.clientHeight + 2) {
      maxOverflowRatio = Math.max(
        maxOverflowRatio,
        canvasEl.scrollHeight / Math.max(1, canvasEl.clientHeight)
      );
    }
    if (canvasEl.scrollWidth > canvasEl.clientWidth + 2) {
      maxOverflowRatio = Math.max(
        maxOverflowRatio,
        canvasEl.scrollWidth / Math.max(1, canvasEl.clientWidth)
      );
    }

    const fitBoxes = canvasEl.querySelectorAll<HTMLElement>('[data-fit-check]');
    fitBoxes.forEach((box) => {
      if (box.clientHeight > 0 && box.scrollHeight > box.clientHeight + 2) {
        maxOverflowRatio = Math.max(
          maxOverflowRatio,
          box.scrollHeight / box.clientHeight
        );
      }
      if (box.clientWidth > 0 && box.scrollWidth > box.clientWidth + 2) {
        maxOverflowRatio = Math.max(
          maxOverflowRatio,
          box.scrollWidth / box.clientWidth
        );
      }
    });

    if (maxOverflowRatio > 1.005 && scale > MIN_FIT_SCALE) {
      fitAttemptsRef.current += 1;
      const nextScale = Math.max(
        MIN_FIT_SCALE,
        Number((scale / (maxOverflowRatio * 1.015)).toFixed(4))
      );
      if (nextScale < scale - 0.002) {
        setScale(nextScale);
      }
    }
  }, [scale, viewport.w, viewport.h, currentGuest.id, activeTab, showQuestionHint]);

  const handleToggleQuestionHint = () => {
    fitAttemptsRef.current = 0;
    setShowQuestionHint((prev) => !prev);
    setScale(computeBaseScale(viewport.w, viewport.h));
  };

  // Clamp pagination pages if list lengths shrink
  const totalActivityPages = Math.max(
    1,
    Math.ceil(activityHistory.length / ACTIVITY_PAGE_SIZE)
  );
  const safeActivityPage = Math.min(activityPage, totalActivityPages);
  const pagedActivities = activityHistory.slice(
    (safeActivityPage - 1) * ACTIVITY_PAGE_SIZE,
    safeActivityPage * ACTIVITY_PAGE_SIZE
  );

  const totalNotePages = Math.max(
    1,
    Math.ceil(notesHistory.length / NOTE_PAGE_SIZE)
  );
  const safeNotePage = Math.min(notePage, totalNotePages);
  const pagedNotes = notesHistory.slice(
    (safeNotePage - 1) * NOTE_PAGE_SIZE,
    safeNotePage * NOTE_PAGE_SIZE
  );

  const totalTaskPages = Math.max(1, Math.ceil(tasks.length / TASK_PAGE_SIZE));
  const safeTaskPage = Math.min(taskPage, totalTaskPages);
  const pagedTasks = tasks.slice(
    (safeTaskPage - 1) * TASK_PAGE_SIZE,
    safeTaskPage * TASK_PAGE_SIZE
  );

  const getAnswer = (qId: string): SurveyQuestionAnswer =>
    answers[qId] || { selected: [], note: '' };

  const handleToggleOption = (qId: string, option: string) => {
    const prev = getAnswer(qId);
    const exists = prev.selected.includes(option);
    const nextSelected = exists
      ? prev.selected.filter((o) => o !== option)
      : [...prev.selected, option];
    const nextAnswers: Record<string, SurveyQuestionAnswer> = {
      ...answers,
      [qId]: { ...prev, selected: nextSelected },
    };
    setAnswers(nextAnswers);
    setIsDirty(true);
    setJustSaved(false);
    setSaveError(null);
  };

  const handleNoteChange = (qId: string, value: string) => {
    const prev = getAnswer(qId);
    setAnswers((curr) => ({
      ...curr,
      [qId]: { ...prev, note: value },
    }));
    setIsDirty(true);
    setJustSaved(false);
    setSaveError(null);
  };

  const handleNoteBlur = () => {
    // Saved to database explicitly when clicking "Lưu"
  };

  const handleExplicitSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      await onSaveSurvey(
        currentGuest.id,
        {
          answers,
          updatedAt: new Date().toLocaleString('vi-VN'),
        },
        true,
        {
          callStatus: draftCallStatus,
          callResult: draftCallResult,
          status: draftStatus,
        }
      );
      setIsDirty(false);
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2500);
    } catch {
      setSaveError('Lưu dữ liệu thất bại, vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseModal = () => {
    onClose();
  };

  const answeredCount = [
    ...SERVICE_QUALITY_SURVEY_QUESTIONS.map((q) => q.id),
    CSKH_FEELING_QUESTION_ID,
  ].filter((id) => {
    const ans = answers[id];
    return ans && (ans.selected.length > 0 || ans.note.trim().length > 0);
  }).length;

  const incompleteTaskCount = tasks.filter((t) => !t.completed).length;

  const customerNameDisplay = currentGuest.fullName || '[Tên khách]';
  const cskhNameDisplay = currentGuest.createdBy || '[Tên CSKH]';
  const garageNameDisplay = currentGuest.garageName || '[Tên Garage]';
  const last5PlateDisplay = getLast5PlateDigits(currentGuest.licensePlate);
  const serviceDayDisplay = getVietnameseWeekdayAndDate(
    roDateInfo.actualDate !== '-' ? roDateInfo.actualDate : roDateInfo.receiveDate
  );

  const feelingAnswer = getAnswer(CSKH_FEELING_QUESTION_ID);

  const isScaled = scale < 0.999;
  const isLargeMonitor = !isScaled && viewport.w >= 1820 && viewport.h >= 1000;
  const logicalWidth = isScaled ? Math.ceil(viewport.w / scale) : viewport.w;
  const logicalHeight = isScaled ? Math.ceil(viewport.h / scale) : viewport.h;

  return (
    <div
      ref={outerRef}
      className="fixed inset-0 z-50 w-screen h-screen bg-slate-100 overflow-hidden select-text"
    >
      <div
        ref={canvasRef}
        style={
          isScaled
            ? {
                width: `${logicalWidth}px`,
                height: `${logicalHeight}px`,
                transform: `scale(${scale})`,
                transformOrigin: '0 0',
              }
            : {
                width: '100%',
                height: '100%',
              }
        }
        className="flex flex-col overflow-hidden bg-slate-100"
      >
        {/* KHU VỰC (1): THÔNG TIN CHUNG CỦA RECORD + TRẠNG THÁI CUỘC GỌI / KẾT QUẢ CUỘC GỌI / TRẠNG THÁI */}
        <header
          data-fit-check
          className="shrink-0 bg-white border-b-2 border-slate-200 px-3.5 py-2 shadow-2xs overflow-hidden"
        >
          {/* Top Line: Identity + Core Record Info + Quick Actions + Close */}
          <div className="flex items-center justify-between gap-3 pb-1.5 border-b border-slate-100">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-600 text-white text-[13.5px] font-extrabold tracking-tight shrink-0">
                <ClipboardCheck className="w-4 h-4 shrink-0" />
                <span>ĐÁNH GIÁ CHẤT LƯỢNG DỊCH VỤ</span>
              </div>
              <h2
                className={`${
                  isLargeMonitor ? 'text-[20px]' : 'text-[18px]'
                } font-extrabold text-slate-900 whitespace-nowrap`}
              >
                {currentGuest.fullName}
              </h2>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-blue-50 border border-blue-200 text-[#1A73E8] text-[14.5px] font-bold whitespace-nowrap shrink-0">
                <Phone className="w-4 h-4 shrink-0" />
                {currentGuest.phone}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-slate-800 text-white text-[14.5px] font-bold tracking-wide whitespace-nowrap shrink-0">
                <Car className="w-4 h-4 shrink-0 text-emerald-400" />
                {currentGuest.licensePlate || '-'}
              </span>
              <span className="text-[14.5px] font-bold text-slate-700 whitespace-nowrap shrink-0">
                {[currentGuest.carBrand, currentGuest.carModel]
                  .filter(Boolean)
                  .join(' ') || '-'}
              </span>
              <button
                type="button"
                onClick={() => onOpenRoDetail(currentGuest)}
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-[14.5px] font-bold whitespace-nowrap shrink-0 cursor-pointer transition-colors"
                title="Nhấn để xem chi tiết RO"
              >
                <FileText className="w-4 h-4 shrink-0" />
                RO: {currentGuest.originalRoCode || '-'}
              </button>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => onOpenZalo(currentGuest)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-[#0068FF] border border-blue-200 rounded-md text-[13.5px] font-bold transition-colors cursor-pointer whitespace-nowrap"
              >
                <MessageCircle className="w-4 h-4" />
                Zalo
              </button>
              <button
                type="button"
                onClick={() => onOpenEmail(currentGuest)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-md text-[13.5px] font-bold transition-colors cursor-pointer whitespace-nowrap"
              >
                <Mail className="w-4 h-4" />
                Email
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={handleExplicitSave}
                title={saveError || undefined}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[14px] font-extrabold transition-colors whitespace-nowrap ${
                  isSaving
                    ? 'bg-emerald-600/80 text-white cursor-wait'
                    : saveError
                    ? 'bg-red-600 hover:bg-red-700 text-white cursor-pointer'
                    : justSaved
                    ? 'bg-emerald-700 text-white cursor-pointer'
                    : 'bg-[#14A64A] hover:bg-emerald-700 text-white cursor-pointer'
                }`}
              >
                {isSaving ? (
                  <>
                    <Save className="w-4 h-4 animate-pulse" />
                    Đang lưu...
                  </>
                ) : justSaved ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Đã lưu ({answeredCount}/7)
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Lưu ({answeredCount}/7)
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleCloseModal}
                className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                title="Đóng"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Second Line: General Info Summary + 3 Required Call/Status Controls */}
          <div className="flex items-center justify-between gap-3 pt-1.5">
            <div className="flex items-center gap-2.5 min-w-0 text-[14px] text-slate-700">
              <div className="flex items-center gap-1 whitespace-nowrap">
                <UserCheck className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-slate-500">CVDV:</span>
                <span className="font-bold text-slate-900">
                  {currentGuest.serviceAdvisor || currentGuest.createdBy || '-'}
                </span>
              </div>
              <span className="text-slate-300">|</span>
              <div className="flex items-center gap-1 whitespace-nowrap">
                <span className="text-slate-500">Nhận:</span>
                <span className="font-bold text-slate-900">
                  {roDateInfo.receiveDate}
                </span>
              </div>
              <span className="text-slate-300">|</span>
              <div className="flex items-center gap-1 whitespace-nowrap">
                <span className="text-slate-500">Hẹn giao:</span>
                <span className="font-bold text-slate-900">
                  {roDateInfo.promisedDate}
                </span>
              </div>
              <span className="text-slate-300">|</span>
              <div className="flex items-center gap-1 whitespace-nowrap">
                <span className="text-slate-500">Bàn giao:</span>
                <span className="font-bold text-slate-900">
                  {roDateInfo.actualDate}
                </span>
                <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-extrabold text-[12.5px]">
                  {roDateInfo.daysAfterDeliveryLabel}
                </span>
              </div>
              <span className="text-slate-300">|</span>
              <div className="flex items-center gap-1 whitespace-nowrap">
                <span className="text-slate-500">Doanh thu:</span>
                <span className="font-extrabold text-emerald-700">
                  {currentGuest.originalRoRevenue || '-'}
                </span>
              </div>
            </div>

            {/* Nút Hiện/Ẩn gợi ý cách hỏi ngay trước Trạng thái cuộc gọi + 3 trường trạng thái */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleToggleQuestionHint}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[14px] font-extrabold transition-all cursor-pointer whitespace-nowrap shadow-sm ${
                  showQuestionHint
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-2 border-amber-300 ring-2 ring-amber-400/35'
                    : 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white border-2 border-indigo-300 ring-2 ring-indigo-400/35'
                }`}
              >
                {showQuestionHint ? (
                  <>
                    <EyeOff className="w-4 h-4 shrink-0" />
                    <span>Ẩn gợi ý cách hỏi</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 shrink-0" />
                    <span>Hiện gợi ý cách hỏi</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-md px-2.5 py-1">
                <label
                  htmlFor="sq-call-status"
                  className="text-[14px] font-bold text-slate-700 whitespace-nowrap"
                >
                  Trạng thái cuộc gọi:
                </label>
                <select
                  id="sq-call-status"
                  value={draftCallStatus}
                  onChange={(e) => {
                    setDraftCallStatus(e.target.value as 'Chưa gọi' | 'Đã gọi');
                    setIsDirty(true);
                    setJustSaved(false);
                    setSaveError(null);
                  }}
                  className={`border rounded px-2 py-0.5 text-[14px] font-extrabold outline-none cursor-pointer ${
                    draftCallStatus === 'Đã gọi'
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                      : 'bg-white border-slate-300 text-slate-900'
                  }`}
                >
                  <option value="Chưa gọi">Chưa gọi</option>
                  <option value="Đã gọi">Đã gọi</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-md px-2.5 py-1">
                <label
                  htmlFor="sq-call-result"
                  className="text-[14px] font-bold text-slate-700 whitespace-nowrap"
                >
                  Kết quả cuộc gọi:
                </label>
                <select
                  id="sq-call-result"
                  value={draftCallResult}
                  onChange={(e) => {
                    setDraftCallResult(e.target.value as ServiceQualityCallResult);
                    setIsDirty(true);
                    setJustSaved(false);
                    setSaveError(null);
                  }}
                  className="border border-slate-300 rounded px-2 py-0.5 text-[14px] font-extrabold text-slate-900 bg-white outline-none focus:border-[#1A73E8] cursor-pointer"
                >
                  <option value="Từ chối">Từ chối</option>
                  <option value="Gọi lần 1">Gọi lần 1</option>
                  <option value="Gọi lần 2">Gọi lần 2</option>
                  <option value="Gọi lần 3">Gọi lần 3</option>
                  <option value="Không nghe máy">Không nghe máy</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-md px-2.5 py-1">
                <label
                  htmlFor="sq-record-status"
                  className="text-[14px] font-bold text-slate-700 whitespace-nowrap"
                >
                  Trạng thái:
                </label>
                <select
                  id="sq-record-status"
                  value={draftStatus}
                  onChange={(e) => {
                    setDraftStatus(e.target.value as ServiceQualityStatus);
                    setIsDirty(true);
                    setJustSaved(false);
                    setSaveError(null);
                  }}
                  className={`border rounded px-2 py-0.5 text-[14px] font-extrabold outline-none cursor-pointer ${
                    draftStatus === 'Hoàn thành'
                      ? 'bg-green-100 text-green-800 border-green-400'
                      : draftStatus === 'Mới'
                      ? 'bg-blue-100 text-blue-800 border-blue-400'
                      : draftStatus === 'Đang thực hiện'
                      ? 'bg-amber-100 text-amber-800 border-amber-400'
                      : 'bg-red-100 text-red-800 border-red-400'
                  }`}
                >
                  <option value="Mới">Mới</option>
                  <option value="Đang thực hiện">Đang thực hiện</option>
                  <option value="Hoàn thành">Hoàn thành</option>
                  <option value="Dừng">Dừng</option>
                </select>
              </div>
            </div>
          </div>
        </header>

        {/* MAIN BODY: KHU VỰC (2) BÊN TRÁI (RỘNG, ĐỒNG LOẠT 1 MÀN HÌNH, KHÔNG CUỘN) + KHU VỰC (3) BÊN PHẢI */}
        <div className="flex-1 min-h-0 flex gap-2 p-2 overflow-hidden">
          {/* KHU VỰC (2): DANH SÁCH CÂU HỎI ĐỂ ĐỌC VÀ GHI NHẬN CÂU TRẢ LỜI */}
          <section className="flex-1 min-w-0 min-h-0 flex flex-col gap-2 overflow-hidden">
            {/* CSKH Mở đầu */}
            <div
              data-fit-check
              className="shrink-0 bg-emerald-50 border-2 border-emerald-400 rounded-lg px-3.5 py-2 shadow-2xs overflow-hidden"
            >
              <p
                className={`${
                  isLargeMonitor ? 'text-[17px]' : 'text-[15.5px]'
                } leading-snug text-slate-950`}
              >
                <span className="inline-block px-2.5 py-0.5 mr-2 rounded bg-emerald-700 text-white text-[13px] font-extrabold uppercase tracking-wide align-middle">
                  CSKH: Mở đầu
                </span>
                <span className="font-semibold">
                  &ldquo;Dạ em chào anh/chị{' '}
                  <strong className="text-emerald-800 underline decoration-emerald-500 decoration-2">
                    {customerNameDisplay}
                  </strong>
                  , em là{' '}
                  <strong className="text-emerald-800 underline decoration-emerald-500 decoration-2">
                    {cskhNameDisplay}
                  </strong>{' '}
                  bên Chăm sóc khách hàng Garage{' '}
                  <strong className="text-emerald-800 underline decoration-emerald-500 decoration-2">
                    {garageNameDisplay}
                  </strong>{' '}
                  ạ. Em gọi hỏi thăm chiếc{' '}
                  <strong className="text-emerald-800 underline decoration-emerald-500 decoration-2">
                    {last5PlateDisplay}
                  </strong>{' '}
                  làm dịch vụ hôm{' '}
                  <strong className="text-emerald-800 underline decoration-emerald-500 decoration-2">
                    {serviceDayDisplay}
                  </strong>
                  , xem mấy hôm nay chạy có ổn không. Em xin anh/chị khoảng 1
                  phút được không ạ?&rdquo;
                </span>
              </p>
            </div>

            {/* 6 Hạng mục câu hỏi hiển thị đồng loạt dạng lưới 2 cột x 3 hàng (hàng 3 rộng hơn cho 6-7 lựa chọn) */}
            <div className="flex-1 min-h-0 grid grid-cols-2 grid-rows-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.24fr)] gap-2 overflow-hidden">
              {SERVICE_QUALITY_SURVEY_QUESTIONS.map((q) => {
                const ans = getAnswer(q.id);
                const hasSelection = ans.selected.length > 0;
                return (
                  <div
                    key={q.id}
                    data-fit-check
                    className={`bg-white rounded-lg border-2 px-3 py-1.5 flex flex-col justify-between gap-1.5 min-h-0 overflow-hidden shadow-2xs transition-colors ${
                      hasSelection
                        ? 'border-emerald-500 ring-1 ring-emerald-100'
                        : 'border-slate-200'
                    }`}
                  >
                    {/* Hạng mục */}
                    <div className="flex items-center justify-between gap-2 min-w-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`${
                            showQuestionHint
                              ? 'w-6 h-6 text-[13px]'
                              : 'w-7 h-7 text-[14.5px]'
                          } rounded-full font-extrabold flex items-center justify-center shrink-0 ${
                            hasSelection
                              ? 'bg-emerald-600 text-white'
                              : 'bg-[#1A73E8] text-white'
                          }`}
                        >
                          {q.index}
                        </span>
                        <h3
                          className={`${
                            !showQuestionHint
                              ? isLargeMonitor
                                ? 'text-[18.5px]'
                                : 'text-[17px]'
                              : isLargeMonitor
                              ? 'text-[16.5px]'
                              : 'text-[15px]'
                          } font-extrabold text-slate-900 leading-tight`}
                        >
                          Hạng mục: {q.category}
                        </h3>
                      </div>
                      {hasSelection && (
                        <span className="shrink-0 inline-flex items-center gap-1 text-[12px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Đã ghi nhận
                        </span>
                      )}
                    </div>

                    {/* Câu hỏi — Nổi bật, tách bạch rõ ràng, dịu mắt */}
                    <div
                      className={`bg-indigo-50/80 border border-indigo-200/90 border-l-4 border-l-indigo-600 rounded-md ${
                        showQuestionHint ? 'px-2.5 py-1' : 'px-3 py-1.5'
                      }`}
                    >
                      <p
                        className={`${
                          !showQuestionHint
                            ? isLargeMonitor
                              ? 'text-[17.5px]'
                              : 'text-[16px]'
                            : isLargeMonitor
                            ? 'text-[15.5px]'
                            : 'text-[14.5px]'
                        } text-slate-950 font-bold leading-snug`}
                      >
                        <span
                          className={`inline-block px-2 py-0.5 mr-2 rounded bg-indigo-600 text-white ${
                            showQuestionHint ? 'text-[11.5px]' : 'text-[12.5px]'
                          } font-extrabold uppercase tracking-wide align-middle`}
                        >
                          Câu hỏi
                        </span>
                        <span>{q.question}</span>
                      </p>
                    </div>

                    {/* CSKH nói (Ẩn/Hiện theo nút gợi ý cách hỏi) */}
                    {showQuestionHint && (
                      <div className="bg-slate-50/90 border border-slate-200/80 border-l-4 border-l-sky-500 rounded-md px-2.5 py-1">
                        <p
                          className={`${
                            isLargeMonitor ? 'text-[15.5px]' : 'text-[14.5px]'
                          } leading-snug text-slate-800`}
                        >
                          <span className="font-bold text-sky-700 mr-1.5">
                            CSKH nói:
                          </span>
                          <span className="font-medium italic">
                            &ldquo;{q.script}&rdquo;
                          </span>
                        </p>
                      </div>
                    )}

                    {/* Ghi nhận — Nổi bật, tách bạch rõ ràng, dịu mắt */}
                    <div
                      className={`bg-emerald-50/75 border border-emerald-200/90 border-l-4 border-l-emerald-600 rounded-md ${
                        showQuestionHint
                          ? 'px-2.5 py-1.5 gap-x-2 gap-y-1'
                          : 'px-3 py-2 gap-x-2.5 gap-y-1.5'
                      } flex flex-wrap items-center`}
                    >
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded bg-emerald-700 text-white ${
                          showQuestionHint ? 'text-[11.5px]' : 'text-[12.5px]'
                        } font-extrabold uppercase tracking-wide shrink-0`}
                      >
                        Ghi nhận
                      </span>
                      {q.options.map((opt) => {
                        const isChecked = ans.selected.includes(opt);
                        return (
                          <label
                            key={opt}
                            className={`inline-flex items-center gap-1.5 ${
                              showQuestionHint
                                ? 'px-2.5 py-0.5'
                                : 'px-3 py-1'
                            } rounded-md border ${
                              !showQuestionHint
                                ? isLargeMonitor
                                  ? 'text-[17px]'
                                  : 'text-[15.5px]'
                                : isLargeMonitor
                                ? 'text-[15px]'
                                : 'text-[14px]'
                            } leading-snug cursor-pointer select-none transition-colors ${
                              isChecked
                                ? 'bg-emerald-100 border-emerald-600 text-emerald-950 font-extrabold ring-1 ring-emerald-500/30'
                                : 'bg-white border-emerald-300/90 text-slate-900 hover:bg-emerald-100/60 hover:border-emerald-500 font-semibold'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleOption(q.id, opt)}
                              className={`${
                                showQuestionHint ? 'w-4 h-4' : 'w-[18px] h-[18px]'
                              } rounded border-emerald-400 text-emerald-600 focus:ring-emerald-500 cursor-pointer shrink-0`}
                            />
                            <span>{opt}</span>
                          </label>
                        );
                      })}
                    </div>

                    {/* Ghi chú */}
                    <div className="flex items-center gap-2">
                      <label
                        htmlFor={`sq-note-${q.id}`}
                        className={`${
                          !showQuestionHint
                            ? isLargeMonitor
                              ? 'text-[16px]'
                              : 'text-[15px]'
                            : isLargeMonitor
                            ? 'text-[14.5px]'
                            : 'text-[13.5px]'
                        } font-bold text-slate-600 shrink-0`}
                      >
                        Ghi chú:
                      </label>
                      <input
                        id={`sq-note-${q.id}`}
                        type="text"
                        value={ans.note}
                        onChange={(e) => handleNoteChange(q.id, e.target.value)}
                        onBlur={handleNoteBlur}
                        placeholder="Nhập ghi chú..."
                        className={`flex-1 min-w-0 ${
                          !showQuestionHint
                            ? isLargeMonitor
                              ? 'h-9 text-[16px]'
                              : 'h-8.5 text-[15px]'
                            : isLargeMonitor
                            ? 'h-8 text-[14.5px]'
                            : 'h-7 text-[13.5px]'
                        } px-2.5 text-slate-900 bg-slate-50 focus:bg-white border border-slate-300 rounded-md focus:outline-none focus:border-[#1A73E8] focus:ring-1 focus:ring-[#1A73E8]/20`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Hàng cuối: Câu trước khi kết thúc (Trái) + CSKH cảm nhận về Khách hàng (Phải) */}
            <div className="shrink-0 grid grid-cols-12 gap-2">
              {/* Câu trước khi kết thúc */}
              <div
                data-fit-check
                className="col-span-4 bg-sky-50 border-2 border-sky-400 rounded-lg px-3 py-2 shadow-2xs flex flex-col justify-center overflow-hidden"
              >
                <div className="mb-1">
                  <span className="inline-block px-2.5 py-0.5 rounded bg-sky-700 text-white text-[12.5px] font-extrabold uppercase tracking-wide">
                    Câu trước khi kết thúc
                  </span>
                </div>
                <p
                  className={`${
                    isLargeMonitor ? 'text-[16px]' : 'text-[14.5px]'
                  } leading-snug font-bold text-slate-950`}
                >
                  Dạ em cảm ơn anh/chị nhiều ạ. Sau này nếu anh/chị hay người
                  thân, bạn bè mình có cần chăm sóc xe, anh/chị nhớ ghé và giới
                  thiệu giúp để bên em có dịp được đón tiếp chu đáo nha anh/chị!
                </p>
              </div>

              {/* CSKH cảm nhận về Khách hàng */}
              <div
                data-fit-check
                className={`col-span-8 rounded-lg border-2 px-3 py-2 shadow-2xs flex flex-col justify-between gap-1.5 overflow-hidden transition-colors ${
                  feelingAnswer.selected.length > 0
                    ? 'bg-amber-50 border-amber-500'
                    : 'bg-amber-50/75 border-amber-400'
                }`}
              >
                <div
                  className={`${
                    isLargeMonitor ? 'text-[16px]' : 'text-[14.5px]'
                  } leading-snug text-slate-950`}
                >
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 mr-2 rounded bg-amber-600 text-white text-[12.5px] font-extrabold uppercase tracking-wide align-middle">
                    <Sparkles className="w-3.5 h-3.5" />
                    CSKH cảm nhận về Khách hàng
                  </span>
                  <span className="font-extrabold">
                    Qua giọng điệu và cách phản hồi trong cuộc gọi, bạn đánh giá
                    mức độ hài lòng thực tế của khách hàng ở mức nào?
                  </span>
                </div>

                <div className="bg-emerald-50/80 border border-emerald-200/90 border-l-4 border-l-emerald-600 rounded-md px-2.5 py-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="inline-flex items-center px-2 py-0.5 rounded bg-emerald-700 text-white text-[11.5px] font-extrabold uppercase tracking-wide shrink-0">
                    Ghi nhận
                  </span>
                  {CSKH_FEELING_OPTIONS.map((opt) => {
                    const isChecked = feelingAnswer.selected.includes(opt);
                    return (
                      <label
                        key={opt}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md border ${
                          isLargeMonitor ? 'text-[15px]' : 'text-[14px]'
                        } leading-snug cursor-pointer select-none transition-colors ${
                          isChecked
                            ? 'bg-emerald-100 border-emerald-600 text-emerald-950 font-extrabold ring-1 ring-emerald-500/30'
                            : 'bg-white border-emerald-300/90 text-slate-900 hover:bg-emerald-100/60 hover:border-emerald-500 font-semibold'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() =>
                            handleToggleOption(CSKH_FEELING_QUESTION_ID, opt)
                          }
                          className="w-4 h-4 rounded border-emerald-400 text-emerald-600 focus:ring-emerald-500 cursor-pointer shrink-0"
                        />
                        <span>{opt}</span>
                      </label>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2">
                  <label
                    htmlFor="sq-note-feeling"
                    className={`${
                      isLargeMonitor ? 'text-[15px]' : 'text-[14px]'
                    } font-bold text-slate-800 shrink-0`}
                  >
                    Ghi chú:
                  </label>
                  <input
                    id="sq-note-feeling"
                    type="text"
                    value={feelingAnswer.note}
                    onChange={(e) =>
                      handleNoteChange(CSKH_FEELING_QUESTION_ID, e.target.value)
                    }
                    onBlur={handleNoteBlur}
                    placeholder="Ghi chú cảm nhận thêm về thái độ / giọng điệu của khách hàng..."
                    className={`flex-1 min-w-0 ${
                      isLargeMonitor ? 'h-9 text-[15px]' : 'h-8 text-[14px]'
                    } px-2.5 text-slate-900 bg-white border border-amber-400 rounded-md focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-500/20`}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* KHU VỰC (3): TAB LỊCH SỬ, GHI CHÚ NỘI BỘ, LỜI NHẮC & CÔNG VIỆC (TUYỆT ĐỐI KHÔNG CUỘN) */}
          <aside className="w-[375px] shrink-0 bg-white border-2 border-slate-200 rounded-lg flex flex-col min-h-0 overflow-hidden shadow-2xs">
            {/* Tab Header */}
            <div className="px-2.5 pt-2.5 border-b border-slate-200 bg-slate-50/80 shrink-0">
              <div className="flex items-center justify-between gap-1">
                <button
                  type="button"
                  className={`pb-2 px-1 text-[13.5px] font-extrabold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                    activeTab === 'activity_history'
                      ? 'border-[#1A73E8] text-[#1A73E8]'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                  onClick={() => setActiveTab('activity_history')}
                >
                  Lịch sử
                </button>
                <button
                  type="button"
                  className={`pb-2 px-1 text-[13.5px] font-extrabold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                    activeTab === 'history'
                      ? 'border-[#1A73E8] text-[#1A73E8]'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                  onClick={() => setActiveTab('history')}
                >
                  Ghi chú nội bộ
                </button>
                <button
                  type="button"
                  className={`pb-2 px-1 text-[13.5px] font-extrabold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    activeTab === 'tasks'
                      ? 'border-[#1A73E8] text-[#1A73E8]'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                  onClick={() => setActiveTab('tasks')}
                >
                  <span>Lời nhắc &amp; Công việc</span>
                  <span className="bg-amber-100 text-amber-900 text-[12px] font-extrabold px-1.5 py-0.5 rounded-full">
                    {incompleteTaskCount}
                  </span>
                </button>
              </div>
            </div>

            {/* Tab Body (Zero Scrollbars, Clean Pagination when needed) */}
            <div className="flex-1 min-h-0 p-3 flex flex-col overflow-hidden bg-slate-50/40">
              {activeTab === 'activity_history' && (
                <div className="flex-1 min-h-0 flex flex-col justify-between overflow-hidden">
                  <div className="flex-1 min-h-0 overflow-hidden space-y-2.5">
                    {pagedActivities.length === 0 ? (
                      <div className="text-[14.5px] text-slate-500 py-8 text-center font-medium">
                        Chưa có dữ liệu lịch sử hoạt động
                      </div>
                    ) : (
                      pagedActivities.map((item) => (
                        <div
                          key={item.id}
                          className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs"
                        >
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <span className="text-[14px] font-bold text-slate-900 leading-snug">
                              {item.action}
                            </span>
                            <span className="text-[12px] text-slate-500 whitespace-nowrap shrink-0">
                              {item.timestamp}
                            </span>
                          </div>
                          <div className="mb-1">
                            <span className="text-[12px] px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full font-semibold">
                              {item.author}
                            </span>
                          </div>
                          <p className="text-[13.5px] text-slate-700 whitespace-pre-wrap break-words leading-snug line-clamp-4">
                            {item.content}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                  {totalActivityPages > 1 && (
                    <div className="shrink-0 pt-2 mt-2 border-t border-slate-200 flex items-center justify-between text-[13px] font-bold text-slate-700">
                      <button
                        type="button"
                        disabled={safeActivityPage <= 1}
                        onClick={() =>
                          setActivityPage((p) => Math.max(1, p - 1))
                        }
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Trước
                      </button>
                      <span>
                        Trang {safeActivityPage} / {totalActivityPages}
                      </span>
                      <button
                        type="button"
                        disabled={safeActivityPage >= totalActivityPages}
                        onClick={() =>
                          setActivityPage((p) =>
                            Math.min(totalActivityPages, p + 1)
                          )
                        }
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                      >
                        Sau
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'history' && (
                <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                  <div className="shrink-0 mb-3">
                    <textarea
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      placeholder="Thêm ghi chú nội bộ..."
                      rows={3}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-[14px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1A73E8]/20 focus:border-[#1A73E8] resize-none mb-2"
                    />
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          onSaveNote();
                          setNotePage(1);
                        }}
                        disabled={!noteContent.trim()}
                        className="px-3.5 py-1.5 bg-[#1A73E8] hover:bg-blue-600 disabled:bg-blue-300 text-white text-[14px] font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        Lưu ghi chú
                      </button>
                    </div>
                  </div>

                  <h4 className="text-[13.5px] font-extrabold text-slate-700 uppercase tracking-wide mb-2 shrink-0">
                    Lịch sử ghi chú ({notesHistory.length})
                  </h4>

                  <div className="flex-1 min-h-0 flex flex-col justify-between overflow-hidden">
                    <div className="flex-1 min-h-0 overflow-hidden space-y-2.5">
                      {pagedNotes.length === 0 ? (
                        <div className="text-[14.5px] text-slate-500 py-4 text-center font-medium">
                          Chưa có lịch sử trao đổi
                        </div>
                      ) : (
                        pagedNotes.map((item) => (
                          <div
                            key={item.id}
                            className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs"
                          >
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="text-[12px] px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full font-semibold">
                                {item.author}
                              </span>
                              <span className="text-[12px] text-slate-500">
                                {item.timestamp}
                              </span>
                            </div>
                            <p className="text-[14px] text-slate-800 whitespace-pre-wrap break-words leading-snug line-clamp-4">
                              {item.content}
                            </p>
                          </div>
                        ))
                      )}
                    </div>

                    {totalNotePages > 1 && (
                      <div className="shrink-0 pt-2 mt-2 border-t border-slate-200 flex items-center justify-between text-[13px] font-bold text-slate-700">
                        <button
                          type="button"
                          disabled={safeNotePage <= 1}
                          onClick={() => setNotePage((p) => Math.max(1, p - 1))}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          Trước
                        </button>
                        <span>
                          Trang {safeNotePage} / {totalNotePages}
                        </span>
                        <button
                          type="button"
                          disabled={safeNotePage >= totalNotePages}
                          onClick={() =>
                            setNotePage((p) => Math.min(totalNotePages, p + 1))
                          }
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                        >
                          Sau
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'tasks' && (
                <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                  <div className="flex gap-2 mb-3 shrink-0">
                    <input
                      type="text"
                      value={taskContent}
                      onChange={(e) => setTaskContent(e.target.value)}
                      placeholder="Thêm lời nhắc mới..."
                      className="flex-1 min-w-0 px-3 py-2 bg-white border border-slate-300 rounded-lg text-[14px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1A73E8]/20 focus:border-[#1A73E8]"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          onAddTask();
                          setTaskPage(1);
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        onAddTask();
                        setTaskPage(1);
                      }}
                      disabled={!taskContent.trim()}
                      className="px-3.5 py-2 bg-[#1A73E8] hover:bg-blue-600 disabled:bg-blue-300 text-white text-[14px] font-bold rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                    >
                      Thêm
                    </button>
                  </div>

                  <div className="flex-1 min-h-0 flex flex-col justify-between overflow-hidden">
                    <div className="flex-1 min-h-0 overflow-hidden space-y-2.5">
                      {pagedTasks.length === 0 ? (
                        <div className="text-[14.5px] text-slate-500 py-4 text-center font-medium">
                          Chưa có lời nhắc &amp; công việc
                        </div>
                      ) : (
                        pagedTasks.map((task) => (
                          <div
                            key={task.id}
                            className={`flex items-start gap-2.5 p-2.5 rounded-lg border ${
                              task.completed
                                ? 'bg-slate-50 border-slate-200'
                                : 'bg-white border-slate-200 shadow-2xs'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={task.completed}
                              onChange={() => onToggleTask(task.id)}
                              className="mt-0.5 w-4 h-4 text-[#1A73E8] border-slate-400 rounded focus:ring-[#1A73E8] cursor-pointer shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              {editingTaskId === task.id ? (
                                <div className="flex flex-col gap-1.5">
                                  <input
                                    type="text"
                                    value={editTaskContent}
                                    onChange={(e) =>
                                      setEditTaskContent(e.target.value)
                                    }
                                    className="w-full px-2.5 py-1 text-[14px] bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1A73E8]/20 focus:border-[#1A73E8]"
                                    autoFocus
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') onSaveEditTask();
                                      if (e.key === 'Escape')
                                        onCancelEditTask();
                                    }}
                                  />
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={onSaveEditTask}
                                      disabled={!editTaskContent.trim()}
                                      className="text-[13px] font-bold px-2.5 py-1 bg-[#1A73E8] text-white rounded hover:bg-blue-600 disabled:bg-blue-300 cursor-pointer"
                                    >
                                      Lưu
                                    </button>
                                    <button
                                      type="button"
                                      onClick={onCancelEditTask}
                                      className="text-[13px] font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded hover:bg-slate-200 cursor-pointer"
                                    >
                                      Hủy
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <div className="flex items-start justify-between gap-2">
                                    <p
                                      className={`text-[14px] leading-snug break-words ${
                                        task.completed
                                          ? 'text-slate-400 line-through'
                                          : 'text-slate-900 font-semibold'
                                      }`}
                                    >
                                      {task.content}
                                    </p>
                                    {!task.completed && (
                                      <button
                                        type="button"
                                        onClick={() => onStartEditTask(task)}
                                        className="text-slate-400 hover:text-[#1A73E8] transition-colors shrink-0 cursor-pointer"
                                        title="Chỉnh sửa lời nhắc"
                                      >
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          width="15"
                                          height="15"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        >
                                          <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                                        </svg>
                                      </button>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[12px] px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full font-semibold">
                                      {task.author}
                                    </span>
                                    <span className="text-[12px] text-slate-500">
                                      {task.timestamp}
                                    </span>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {totalTaskPages > 1 && (
                      <div className="shrink-0 pt-2 mt-2 border-t border-slate-200 flex items-center justify-between text-[13px] font-bold text-slate-700">
                        <button
                          type="button"
                          disabled={safeTaskPage <= 1}
                          onClick={() => setTaskPage((p) => Math.max(1, p - 1))}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          Trước
                        </button>
                        <span>
                          Trang {safeTaskPage} / {totalTaskPages}
                        </span>
                        <button
                          type="button"
                          disabled={safeTaskPage >= totalTaskPages}
                          onClick={() =>
                            setTaskPage((p) => Math.min(totalTaskPages, p + 1))
                          }
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                        >
                          Sau
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};
