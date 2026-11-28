export type Score = {
  slug: string;
  title: string;
  latin: string;
  artist: string;
  role: string;
  category: string;
  level: string;
  likes: number;
  price: string;
  cover: string;
  free?: boolean;
  recent?: boolean;
};

export const scores: Score[] = [
  { slug: "havas", title: "هوس", latin: "Havas", artist: "معین", role: "خواننده", category: "ترانه‌های ایرانی", level: "آسان تا سخت", likes: 1023, price: "رایگان", free: true, cover: "/images/score-cover-2.png" },
  { slug: "love-story", title: "Love Story", latin: "داستان عشق", artist: "فرانسیس له", role: "آهنگساز", category: "ترانه‌های جهان", level: "آسان تا سخت", likes: 1004, price: "رایگان", free: true, cover: "/images/score-cover-5.png" },
  { slug: "fur-elise", title: "Für Elise", latin: "برای الیزه", artist: "لودویگ فان بتهوون", role: "آهنگساز", category: "کلاسیک", level: "متوسط تا سخت", likes: 979, price: "رایگان", free: true, cover: "/images/score-cover-3.png" },
  { slug: "my-heart", title: "My Heart Will Go On", latin: "موسیقی فیلم تایتانیک", artist: "سلین دیون", role: "خواننده", category: "موسیقی فیلم", level: "سخت", likes: 910, price: "رایگان", free: true, cover: "/images/score-cover-6.png" },
  { slug: "nefeli", title: "Nefeli", latin: "نفلی", artist: "لودوویکو اینائودی", role: "آهنگساز", category: "بی‌کلام", level: "آسان", likes: 618, price: "رایگان", free: true, recent: true, cover: "/images/score-cover-4.png"},
  { slug: "ey-iran", title: "ای ایران", latin: "Ey Iran", artist: "روح‌الله خالقی", role: "آهنگساز", category: "ترانه‌های ایرانی", level: "متوسط تا سخت", likes: 334, price: "رایگان", free: true, cover: "/images/score-cover.png" },
  { slug: "happy-birthday", title: "تولدت مبارک", latin: "Happy Birthday", artist: "میلدرد جی. هیل", role: "آهنگساز", category: "کلاسیک", level: "آسان", likes: 102, price: "رایگان", free: true, recent: true, cover: "/images/score-cover.png" },
  { slug: "behaneh", title: "بهانه", latin: "Behaneh — Moein", artist: "معین", role: "خواننده", category: "ترانه‌های ایرانی", level: "متوسط", likes: 25, price: "تکی ۸۹٬۰۰۰ تومان", recent: true, cover: "/images/score-cover.png" },
  { slug: "mara-beboos", title: "مرا ببوس", latin: "Mara Beboos", artist: "حسن گلنراقی", role: "خواننده", category: "ترانه‌های ایرانی", level: "متوسط", likes: 55, price: "تکی ۸۹٬۰۰۰ تومان", recent: true, cover: "/images/score-cover.png" },
  { slug: "mordab", title: "مرداب", latin: "Mordab — Googoosh", artist: "گوگوش", role: "خواننده", category: "ترانه‌های ایرانی", level: "آسان تا سخت", likes: 16, price: "تکی ۸۹٬۰۰۰ تومان", recent: true, cover: "/images/score-cover.png" },
  { slug: "vatan", title: "وطن", latin: "Vatan — Dariush", artist: "داریوش", role: "خواننده", category: "ترانه‌های ایرانی", level: "متوسط", likes: 71, price: "تکی ۸۹٬۰۰۰ تومان", recent: true, cover: "/images/score-cover.png" },
  { slug: "bar-gisouyat", title: "بر گیسویت", latin: "Bar Gisouyat Ey Jan", artist: "ویگن", role: "خواننده", category: "ترانه‌های ایرانی", level: "سخت", likes: 219, price: "تکی ۸۹٬۰۰۰ تومان", recent: true, cover: "/images/score-cover.png" },
  { slug: "faryad", title: "فریاد", latin: "Faryad", artist: "هایده", role: "خواننده", category: "ترانه‌های ایرانی", level: "آسان تا سخت", likes: 346, price: "تکی ۸۹٬۰۰۰ تومان", recent: true, cover: "/images/score-cover.png" },
  { slug: "gharib-ashena", title: "غریب آشنا", latin: "Gharib Ashena", artist: "گوگوش", role: "خواننده", category: "ترانه‌های ایرانی", level: "آسان تا سخت", likes: 111, price: "تکی ۸۹٬۰۰۰ تومان", recent: true, cover: "/images/score-cover.png" },
  { slug: "pooste-shir", title: "پوست شیر", latin: "Pooste Shir — Ebi", artist: "ابی", role: "خواننده", category: "ترانه‌های ایرانی", level: "متوسط", likes: 107, price: "تکی ۸۹٬۰۰۰ تومان", recent: true, cover: "/images/score-cover.png" },
  { slug: "soghati", title: "سوغاتی", latin: "Soghati", artist: "هایده", role: "خواننده", category: "ترانه‌های ایرانی", level: "آسان", likes: 737, price: "تکی ۸۹٬۰۰۰ تومان", cover: "/images/score-cover.png" },
  { slug: "amelie", title: "آملی", latin: "Amelie", artist: "یان تیرسن", role: "آهنگساز", category: "موسیقی فیلم", level: "انتخاب تنظیم", likes: 0, price: "شرایط هر اثر", cover: "/images/score-cover-5.png" },
  { slug: "armaghan-tariki", title: "ارمغان تاریکی", latin: "Armaghan-e Tariki", artist: "سعید سعادت‌مند", role: "آهنگساز", category: "موسیقی فیلم", level: "انتخاب تنظیم", likes: 0, price: "شرایط هر اثر", cover: "/images/score-cover-6.png" },
  { slug: "game-of-thrones", title: "بازی تاج‌وتخت", latin: "Game of Thrones", artist: "رامین جوادی", role: "آهنگساز", category: "موسیقی فیلم", level: "انتخاب تنظیم", likes: 0, price: "رایگان", free: true, cover: "/images/score-cover-3.png" },
  { slug: "corpse-bride", title: "عروس مرده", latin: "Corpse Bride — The Piano Duet", artist: "دنی الفمن", role: "آهنگساز", category: "موسیقی فیلم", level: "انتخاب تنظیم", likes: 0, price: "رایگان", free: true, cover: "/images/score-cover-4.png" },
  { slug: "papillon", title: "پاپیون", latin: "Papillon", artist: "جری گلدسمیت", role: "آهنگساز", category: "موسیقی فیلم", level: "انتخاب تنظیم", likes: 0, price: "شرایط هر اثر", cover: "/images/score-cover-2.png" },
  { slug: "godfather", title: "پدرخوانده", latin: "The Godfather", artist: "نینو روتا", role: "آهنگساز", category: "موسیقی فیلم", level: "انتخاب تنظیم", likes: 0, price: "شرایط هر اثر", cover: "/images/score-cover-5.png" },
  { slug: "secret-garden", title: "آوازی از باغ اسرار", latin: "Song from a Secret Garden", artist: "رولف لوولاند", role: "آهنگساز", category: "بی‌کلام", level: "آسان تا متوسط", likes: 0, price: "شرایط هر اثر", cover: "/images/score-cover-4.png" },
  { slug: "a-comme-amour", title: "الف مثل عشق", latin: "A Comme Amour", artist: "پل دو سنویل", role: "آهنگساز", category: "بی‌کلام", level: "انتخاب تنظیم", likes: 0, price: "شرایط هر اثر", cover: "/images/score-cover-5.png" },
  { slug: "enmiro", title: "انمیرو", latin: "Enmiro", artist: "عرفان نادریان", role: "آهنگساز", category: "بی‌کلام", level: "آسان تا سخت", likes: 0, price: "شرایط هر اثر", cover: "/images/score-cover-2.png" },
  { slug: "olivier", title: "اولیویه", latin: "Olivier", artist: "عرفان نادریان", role: "آهنگساز", category: "بی‌کلام", level: "انتخاب تنظیم", likes: 0, price: "شرایط هر اثر", cover: "/images/score-cover-3.png" },
  { slug: "rain", title: "باران", latin: "Rain", artist: "—", role: "", category: "بی‌کلام", level: "انتخاب تنظیم", likes: 0, price: "شرایط هر اثر", cover: "/images/score-cover.png" },
  { slug: "memorise", title: "خاطره‌ها", latin: "Memorise", artist: "—", role: "", category: "بی‌کلام", level: "متوسط تا سخت", likes: 0, price: "شرایط هر اثر", cover: "/images/score-cover-6.png" },
  { slug: "lightly-road", title: "راه روشن", latin: "Lightly Road", artist: "عرفان نادریان", role: "آهنگساز", category: "بی‌کلام", level: "انتخاب تنظیم", likes: 0, price: "شرایط هر اثر", cover: "/images/score-cover-4.png" },
  { slug: "dance-of-river", title: "رقص رودخانه", latin: "Dance of River", artist: "عرفان نادریان", role: "آهنگساز", category: "بی‌کلام", level: "انتخاب تنظیم", likes: 0, price: "شرایط هر اثر", cover: "/images/score-cover-5.png" },
  { slug: "glass-winter", title: "زمستان شیشه‌ای", latin: "Glass Winter", artist: "عرفان نادریان", role: "آهنگساز", category: "بی‌کلام", level: "انتخاب تنظیم", likes: 0, price: "شرایط هر اثر", cover: "/images/score-cover-6.png" },
  { slug: "rainy-morning", title: "صبح بارانی", latin: "Rainy Morning", artist: "عرفان نادریان", role: "آهنگساز", category: "بی‌کلام", level: "انتخاب تنظیم", likes: 0, price: "شرایط هر اثر", cover: "/images/score-cover-3.png" },
  { slug: "nuance-sample", title: "تمرین نمونهٔ NUANCE شمارهٔ ۱", latin: "NUANCE Sample Study No. 1", artist: "تمرین تألیفی NUANCE", role: "", category: "تمرین‌های تألیفی", level: "آسان", likes: 0, price: "رایگان", free: true, cover: "/images/score-cover.png" },
];

export const categories = ["همه", "ترانه‌های ایرانی", "کلاسیک", "موسیقی فیلم", "بی‌کلام", "محلی", "ترانه‌های جهان", "تمرین‌های تألیفی"];
export const levels = ["همهٔ سطح‌ها", "آسان", "متوسط", "سخت"];
