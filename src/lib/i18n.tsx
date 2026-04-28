import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "ar";

type Dict = Record<string, { en: string; ar: string }>;

export const dict: Dict = {
  appName: { en: "Augusta Victoria Hospital", ar: "مستشفى المطلع" },
  tagline: { en: "Cancer Care • Chemotherapy • Radiation", ar: "رعاية الأورام • العلاج الكيميائي • العلاج الإشعاعي" },
  login: { en: "Sign in", ar: "تسجيل الدخول" },
  logout: { en: "Log out", ar: "تسجيل الخروج" },
  idNumber: { en: "ID Number", ar: "رقم الهوية" },
  role: { en: "Role", ar: "الدور" },
  patient: { en: "Patient", ar: "مريض" },
  doctor: { en: "Doctor", ar: "طبيب" },
  nurse: { en: "Nurse", ar: "ممرض/ة" },
  escort: { en: "Escort", ar: "مرافق" },
  enterId: { en: "Enter your ID number", ar: "أدخل رقم هويتك" },
  welcome: { en: "Welcome back", ar: "أهلاً بعودتك" },
  dashboard: { en: "Dashboard", ar: "لوحة التحكم" },
  appointments: { en: "Appointments", ar: "المواعيد" },
  chat: { en: "Chat with Doctor", ar: "محادثة الطبيب" },
  physio: { en: "Physiotherapy & Support", ar: "العلاج الطبيعي والدعم" },
  announcements: { en: "Announcements", ar: "الإعلانات" },
  portfolio: { en: "Portfolio", ar: "الملف الشخصي" },
  reports: { en: "Reports", ar: "التقارير" },
  upcoming: { en: "Upcoming treatments", ar: "العلاجات القادمة" },
  todayAppointments: { en: "Today's appointments", ar: "مواعيد اليوم" },
  unreadMessages: { en: "Unread messages", ar: "رسائل غير مقروءة" },
  newAnnouncements: { en: "New announcements", ar: "إعلانات جديدة" },
  quickActions: { en: "Quick actions", ar: "إجراءات سريعة" },
  bookSession: { en: "Book a session", ar: "احجز جلسة" },
  talkToSomeone: { en: "Talk to someone", ar: "تحدث مع شخص ما" },
  viewSchedule: { en: "View schedule", ar: "عرض الجدول" },
  postAnnouncement: { en: "Post announcement", ar: "نشر إعلان" },
  type: { en: "Type", ar: "النوع" },
  date: { en: "Date", ar: "التاريخ" },
  time: { en: "Time", ar: "الوقت" },
  doctorCol: { en: "Specialist", ar: "الأخصائي" },
  status: { en: "Status", ar: "الحالة" },
  chemotherapy: { en: "Chemotherapy", ar: "علاج كيميائي" },
  radiation: { en: "Radiation", ar: "علاج إشعاعي" },
  clinic: { en: "Clinic visit", ar: "زيارة عيادة" },
  physioSession: { en: "Physiotherapy", ar: "علاج طبيعي" },
  scheduled: { en: "Scheduled", ar: "مجدول" },
  completed: { en: "Completed", ar: "مكتمل" },
  pending: { en: "Pending", ar: "قيد الانتظار" },
  send: { en: "Send", ar: "إرسال" },
  typeMessage: { en: "Type a message…", ar: "اكتب رسالة…" },
  title: { en: "Title", ar: "العنوان" },
  body: { en: "Message", ar: "الرسالة" },
  publish: { en: "Publish", ar: "نشر" },
  name: { en: "Name", ar: "الاسم" },
  specialty: { en: "Specialty", ar: "التخصص" },
  bio: { en: "About", ar: "نبذة" },
  contact: { en: "Contact", ar: "التواصل" },
  save: { en: "Save changes", ar: "حفظ التغييرات" },
  saved: { en: "Saved", ar: "تم الحفظ" },
  switchLang: { en: "العربية", ar: "English" },
  searchHospital: { en: "Visit hospital website", ar: "زيارة موقع المستشفى" },
  bookNew: { en: "Book new", ar: "حجز جديد" },
  needSupport: { en: "Need someone to talk to?", ar: "بحاجة لمن يستمع لك؟" },
  needSupportDesc: { en: "Our counselors and physiotherapists are here for you, anytime.", ar: "مستشارونا وأخصائيو العلاج الطبيعي بخدمتك في أي وقت." },
  requestCall: { en: "Request a call", ar: "اطلب اتصال" },
  patientsServed: { en: "Patients in care", ar: "المرضى في الرعاية" },
  staffOnline: { en: "Staff online", ar: "الكادر المتصل" },
  loginSubtitle: { en: "Sign in to access your portal", ar: "سجّل الدخول للوصول إلى بوابتك" },
  loginCta: { en: "Sign in", ar: "تسجيل الدخول" },
  invalidId: { en: "Please enter a valid ID number", ar: "يرجى إدخال رقم هوية صحيح" },
  email: { en: "Email", ar: "البريد الإلكتروني" },
  password: { en: "Password", ar: "كلمة المرور" },
  enterEmail: { en: "you@example.com", ar: "you@example.com" },
  enterPassword: { en: "Your password", ar: "كلمة المرور الخاصة بك" },
  noAccount: { en: "Don't have an account?", ar: "ليس لديك حساب؟" },
  hasAccount: { en: "Already have an account?", ar: "لديك حساب بالفعل؟" },
  register: { en: "Create account", ar: "إنشاء حساب" },
  registerSubtitle: { en: "For patients and escorts only. Staff accounts are issued by the hospital.", ar: "للمرضى والمرافقين فقط. حسابات الكادر يتم إنشاؤها من قبل المستشفى." },
  fullName: { en: "Full name", ar: "الاسم الكامل" },
  phone: { en: "Phone", ar: "الهاتف" },
  dob: { en: "Date of birth", ar: "تاريخ الميلاد" },
  gender: { en: "Gender", ar: "الجنس" },
  male: { en: "Male", ar: "ذكر" },
  female: { en: "Female", ar: "أنثى" },
  other: { en: "Other", ar: "آخر" },
  signupSuccess: { en: "Account created. Check your email to confirm.", ar: "تم إنشاء الحساب. تحقق من بريدك للتأكيد." },
  loginFailed: { en: "Invalid email or password", ar: "البريد الإلكتروني أو كلمة المرور غير صحيحة" },
  staffNote: { en: "Staff (doctors / nurses): your account is created by the hospital admin. Contact IT.", ar: "الكادر (الأطباء/الممرضين): يتم إنشاء حسابك من قبل إدارة المستشفى. تواصل مع قسم تكنولوجيا المعلومات." },
  settings: { en: "Settings", ar: "الإعدادات" },
  language: { en: "Language", ar: "اللغة" },
  noMessages: { en: "No conversations yet", ar: "لا توجد محادثات بعد" },
  noAppointments: { en: "No appointments scheduled", ar: "لا توجد مواعيد مجدولة" },
  posted: { en: "Posted", ar: "نُشر" },
  by: { en: "by", ar: "بواسطة" },
  details: { en: "Details", ar: "التفاصيل" },
  reschedule: { en: "Reschedule", ar: "إعادة جدولة" },
  cancel: { en: "Cancel", ar: "إلغاء" },
  confirm: { en: "Confirm", ar: "تأكيد" },
  weeklyReport: { en: "Weekly summary", ar: "ملخص أسبوعي" },
  monthlyReport: { en: "Monthly summary", ar: "ملخص شهري" },
  download: { en: "Download report", ar: "تحميل التقرير" },
};

interface I18nCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: keyof typeof dict) => string;
  dir: "ltr" | "rtl";
}

const I18nContext = createContext<I18nCtx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const saved = (typeof window !== "undefined" && localStorage.getItem("avh.lang")) as Lang | null;
    if (saved === "ar" || saved === "en") setLangState(saved);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") localStorage.setItem("avh.lang", l);
  };

  const t = (key: keyof typeof dict) => dict[key]?.[lang] ?? key;

  return (
    <I18nContext.Provider value={{ lang, setLang, t, dir: lang === "ar" ? "rtl" : "ltr" }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}
