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
