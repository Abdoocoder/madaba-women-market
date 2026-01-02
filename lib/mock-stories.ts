export interface SuccessStory {
  id: string;
  author: string;
  avatarUrl?: string;
  story: string;
}

export const MOCK_SUCCESS_STORIES: SuccessStory[] = [
  {
    id: "1",
    author: "نورة خالد",
    story: "بفضل سيدتي ماركت، تمكنت من الوصول إلى شريحة واسعة من الزبائن وعرض منتجاتي بكل سهولة. المنصة سهلة الاستخدام وفريق الدعم متعاون جداً.",
    avatarUrl: "https://i.pravatar.cc/150?u=nora",
  },
  {
    id: "2",
    author: "فاطمة عبد الله",
    story: "تجربتي مع سيدتي ماركت كانت رائعة. لقد بدأت بمشروع صغير من المنزل والآن لدي متجري الخاص الذي يحقق مبيعات ممتازة. شكراً لكم!",
    avatarUrl: "https://i.pravatar.cc/150?u=fatima",
  },
  {
    id: "3",
    author: "عائشة محمد",
    story: "وجدت في سيدتي ماركت البيئة المثالية لعرض أعمالي اليدوية. التصميم الأنيق والتركيز على المنتجات النسائية ساعدني في بناء علامتي التجارية.",
    avatarUrl: "https://i.pravatar.cc/150?u=aisha",
  },
];
