# تطبيق سوق سيدتي

هذا تطبيق تجارة إلكترونية حديث مبني باستخدام Next.js و TypeScript.

## نظرة عامة

تطبيق سوق سيدتي هو سوق إلكتروني غني بالميزات. يتضمن وظائف للعملاء والبائعين والمسؤولين. تم تصميم التطبيق ليكون قابلاً للتطوير والصيانة، باستخدام بنية قائمة على المكونات ومجموعة قوية من الأدوات والمكتبات.

## الميزات

*   **المصادقة:** تسجيل دخول وتسجيل مستخدم آمن.
*   **عربة التسوق:** عربة تسوق تعمل بكامل طاقتها.
*   **قائمة الرغبات:** يمكن للمستخدمين حفظ منتجاتهم المفضلة.
*   **إدارة المنتجات:** يمكن للمسؤولين والبائعين إدارة المنتجات.
*   **لوحة تحكم المسؤول:** لوحة تحكم للمسؤولين لإدارة المنصة.
*   **لوحة تحكم البائع:** لوحة تحكم للبائعين لإدارة منتجاتهم وطلباتهم.
*   **التعريب:** دعم لغات متعددة (الإنجليزية والعربية).
*   **تصميم متجاوب:** تم تحسين التطبيق لمختلف أحجام الشاشات.

## البدء

### المتطلبات الأساسية

*   Node.js (الإصدار 18 أو أحدث)
*   pnpm

### التثبيت

1.  Clone the repository:
    \`\`\`bash
    git clone <repository-url>
    \`\`\`
2.  Navigate to the project directory:
    \`\`\`bash
    cd <project-directory>
    \`\`\`
3.  Install the dependencies:
    \`\`\`bash
    pnpm install
    \`\`\`

### تشغيل خادم التطوير

\`\`\`bash
pnpm dev
\`\`\`

افتح [http://localhost:3000](http://localhost:3000) في متصفحك لرؤية النتيجة.

## التقنيات المستخدمة

*   **إطار العمل:** [Next.js](https://nextjs.org/)
*   **اللغة:** [TypeScript](https://www.typescriptlang.org/)
*   **التصميم:** [Tailwind CSS](https://tailwindcss.com/)
*   **مكونات واجهة المستخدم:** [Shadcn/UI](https://ui.shadcn.com/), [Radix UI](https://www.radix-ui.com/)
*   **المصادقة وقاعدة البيانات:** [Firebase](https://firebase.google.com/)
*   **إدارة الحالة:** React Context API
*   **معالجة النماذج:** [React Hook Form](https://react-hook-form.com/)
*   **التدقيق:** [ESLint](https://eslint.org/)
*   **التحليلات:** [Vercel Analytics](https://vercel.com/analytics)


## هيكل المشروع

\`\`\`
.
├── app/                  # Main application routes and pages
├── components/           # Reusable UI components
├── lib/                  # Helper functions and utilities
├── public/               # Static assets (images, fonts, etc.)
├── styles/               # Global styles
├── locales/              # Localization files
├── next.config.mjs       # Next.js configuration
├── package.json          # Project dependencies and scripts
└── tsconfig.json         # TypeScript configuration
\`\`\`

## شرح للبنية (Architecture)
بني هذا التطبيق باستخدام بنية حديثة وقابلة للتطوير ترتكز على Next.js.
*   **الواجهة الأمامية (Frontend):** تم بناء واجهة المستخدم باستخدام React و TypeScript. يتم استخدام Next.js كإطار عمل أساسي, مما يتيح لنا الاستفادة من ميزات مثل العرض من جانب الخادم (SSR) وتوليد المواقع الثابتة (SSG). يتم تنسيق المكونات باستخدام Tailwind CSS ومكتبة مكونات Shadcn/UI.
*   **الواجهة الخلفية (Backend):** يتم الاعتماد على خدمات Firebase بشكل كامل.
    *   **المصادقة (Authentication):** نستخدم Firebase Authentication لإدارة المستخدمين وتسجيل الدخول.
    *   **قاعدة البيانات (Database):** يتم استخدام Firestore كقاعدة بيانات NoSQL لتخزين المنتجات، الطلبات، وبيانات المستخدمين.
    *   **API Routes:** يتم استخدام مسارات API الخاصة بـ Next.js (في `app/api`) كوسيط للتواصل الآمن مع خدمات Firebase من جهة الخادم.
*   **إدارة الحالة (State Management):** تتم إدارة الحالة العامة للتطبيق، مثل حالة المصادقة أو عربة التسوق، باستخدام React Context API.

## كيفية النشر (Deployment)
يمكن نشر هذا التطبيق مباشرة من هذه البيئة.

1.  **بناء المشروع:**
    \`\`\`bash
    pnpm build
    \`\`\`
2.  **النشر:**
    بعد اكتمال عملية البناء بنجاح، سيتم نشر التطبيق تلقائيًا باستخدام الإعدادات المناسبة لهذا المشروع. يتم التعامل مع النشر على أنه تطبيق خادم (Server-side) للاستفادة الكاملة من ميزات Next.js.

## تفاصيل عن المتغيرات البيئية (Environment Variables)
للتشغيل الصحيح للتطبيق، يجب عليك إنشاء ملف `.env.local` في جذر المشروع وتوفير متغيرات البيئة التالية. هذه المتغيرات ضرورية للاتصال بخدمات Firebase.

\`\`\`
# Firebase public configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin SDK (for server-side operations)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_PRIVATE_KEY=your_private_key
\`\`\`

**ملاحظة:** يمكنك العثور على قيم هذه المتغيرات في لوحة تحكم مشروع Firebase الخاص بك. يجب الحفاظ على سرية متغيرات `FIREBASE_PRIVATE_KEY` و `FIREBASE_CLIENT_EMAIL` وعدم تعريضها للعامة.
