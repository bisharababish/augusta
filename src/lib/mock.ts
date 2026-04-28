export interface Appointment {
  id: string;
  type: "chemotherapy" | "radiation" | "clinic" | "physioSession";
  date: string;
  time: string;
  doctor: string;
  doctorAr: string;
  status: "scheduled" | "completed" | "pending";
  room?: string;
}

export const mockAppointments: Appointment[] = [
  { id: "a1", type: "chemotherapy", date: "2026-05-04", time: "09:30", doctor: "Dr. Omar Haddad", doctorAr: "د. عمر حداد", status: "scheduled", room: "Oncology Ward 3" },
  { id: "a2", type: "radiation", date: "2026-05-06", time: "11:00", doctor: "Dr. Rana Saleh", doctorAr: "د. رنا صالح", status: "scheduled", room: "Radiation Suite B" },
  { id: "a3", type: "clinic", date: "2026-05-10", time: "14:00", doctor: "Dr. Khaled Abu-Sneineh", doctorAr: "د. خالد أبو سنينة", status: "pending", room: "Clinic 12" },
  { id: "a4", type: "physioSession", date: "2026-04-22", time: "10:00", doctor: "Maya Issa", doctorAr: "مايا عيسى", status: "completed", room: "Physio Hall" },
  { id: "a5", type: "chemotherapy", date: "2026-04-18", time: "08:30", doctor: "Dr. Omar Haddad", doctorAr: "د. عمر حداد", status: "completed", room: "Oncology Ward 3" },
];

export interface Announcement {
  id: string;
  title: string;
  titleAr: string;
  body: string;
  bodyAr: string;
  author: string;
  authorAr: string;
  date: string;
}

export const mockAnnouncements: Announcement[] = [
  {
    id: "n1",
    title: "New radiation suite opening",
    titleAr: "افتتاح غرفة العلاج الإشعاعي الجديدة",
    body: "Our upgraded radiation suite opens next Monday with state-of-the-art linear accelerators.",
    bodyAr: "تُفتتح غرفة العلاج الإشعاعي المطوّرة يوم الإثنين القادم بأحدث المسرعات الخطية.",
    author: "Hospital Administration",
    authorAr: "إدارة المستشفى",
    date: "2026-04-26",
  },
  {
    id: "n2",
    title: "Support group every Thursday",
    titleAr: "مجموعة دعم كل خميس",
    body: "Join our weekly cancer support group at 5pm in the patient lounge.",
    bodyAr: "انضم لمجموعة دعم الأورام الأسبوعية الساعة 5 مساءً في صالة المرضى.",
    author: "Counseling Team",
    authorAr: "فريق الإرشاد",
    date: "2026-04-24",
  },
  {
    id: "n3",
    title: "Ramadan visiting hours",
    titleAr: "ساعات الزيارة في رمضان",
    body: "Visiting hours during Ramadan: 10am–2pm and 8pm–10pm.",
    bodyAr: "ساعات الزيارة في رمضان: 10ص–2م و 8م–10م.",
    author: "Nursing Department",
    authorAr: "قسم التمريض",
    date: "2026-04-20",
  },
];

export interface ChatMessage {
  id: string;
  from: "me" | "them";
  text: string;
  textAr: string;
  time: string;
}

export const mockConversation: { with: string; withAr: string; specialty: string; specialtyAr: string; messages: ChatMessage[] } = {
  with: "Dr. Omar Haddad",
  withAr: "د. عمر حداد",
  specialty: "Medical Oncology",
  specialtyAr: "أورام طبية",
  messages: [
    { id: "m1", from: "them", text: "How are you feeling after yesterday's session?", textAr: "كيف تشعرين بعد جلسة الأمس؟", time: "09:12" },
    { id: "m2", from: "me", text: "A bit tired but the nausea is much better.", textAr: "متعبة قليلاً لكن الغثيان أفضل بكثير.", time: "09:15" },
    { id: "m3", from: "them", text: "Good. Keep hydrating and we'll review your bloodwork on Tuesday.", textAr: "جيد. حافظي على شرب الماء وسنراجع تحاليلك يوم الثلاثاء.", time: "09:17" },
  ],
};
