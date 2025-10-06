# Modular Translation Structure

## Overview

This project uses a modular translation structure to improve maintainability and developer experience. Instead of having one large translation file, translations are organized into domain-specific files.

## Directory Structure

```
/locales/
├── ar/                    # Arabic translations
│   ├── common.json       # Common UI elements (buttons, actions, etc.)
│   ├── home.json         # Homepage content
│   ├── product.json      # Product-related content
│   ├── seller.json       # Seller dashboard content
│   ├── admin.json        # Admin dashboard content
│   ├── buyer.json        # Buyer dashboard content
│   ├── orders.json       # Order-related content
│   ├── privacy.json      # Privacy policy content
│   ├── terms.json        # Terms of service content
│   ├── faq.json          # FAQ content
│   ├── help.json         # Help center content
│   └── footer.json       # Footer content
├── en/                    # English translations
│   ├── common.json       # Common UI elements
│   ├── home.json         # Homepage content
│   ├── product.json      # Product-related content
│   ├── seller.json       # Seller dashboard content
│   └── footer.json       # Footer content
├── ar.json               # Legacy Arabic file (for backward compatibility)
└── en.json               # Legacy English file (for backward compatibility)
```

## Usage

### Using Modular Translations

Use dot notation to access nested translations:

```tsx
import { useLocale } from "@/lib/locale-context"

function MyComponent() {
  const { t } = useLocale()
  
  return (
    <div>
      <h1>{t("home.welcome")}</h1>           {/* From home.json */}
      <button>{t("common.save")}</button>     {/* From common.json */}
      <p>{t("product.description")}</p>       {/* From product.json */}
    </div>
  )
}
```

### Backward Compatibility

Legacy flat keys still work for existing code:

```tsx
// This still works
<p>{t("home.welcome")}</p>   // Legacy flat key
<p>{t("common.save")}</p>    // Legacy flat key
```

### Adding New Translations

1. **Choose the appropriate file** based on the content domain
2. **Add the key-value pair** to both Arabic and English files
3. **Use dot notation** in your components

Example - Adding a new product feature:

**locales/ar/product.json:**
```json
{
  "newFeature": "ميزة جديدة",
  "newFeatureDescription": "وصف للميزة الجديدة"
}
```

**locales/en/product.json:**
```json
{
  "newFeature": "New Feature",
  "newFeatureDescription": "Description for the new feature"
}
```

**Usage in component:**
```tsx
<h2>{t("product.newFeature")}</h2>
<p>{t("product.newFeatureDescription")}</p>
```

## Migration Strategy

### Phase 1: ✅ Complete
- Created modular structure
- Implemented backward compatibility
- Updated locale context to support both formats

### Phase 2: 🔄 In Progress
- Complete English translation files
- Gradually migrate components to use modular keys

### Phase 3: 📋 Planned
- Remove legacy files
- Full migration to modular structure
- Enhanced TypeScript support for translation keys

## Benefits

1. **Better Organization**: Related translations are grouped together
2. **Easier Maintenance**: Smaller files are easier to manage
3. **Improved Collaboration**: Translators can work on specific domains
4. **Reduced Conflicts**: Less chance of merge conflicts
5. **Better Performance**: Only load needed translation modules (future enhancement)

## Best Practices

1. **Consistent Naming**: Use clear, descriptive key names
2. **Logical Grouping**: Group related translations in the same file
3. **Sync Updates**: Always update both Arabic and English files
4. **Use Interpolation**: Support dynamic content with `{variable}` syntax

## File Responsibilities

| File | Contains |
|------|----------|
| `common.json` | Buttons, actions, generic UI elements |
| `home.json` | Homepage content, welcome messages |
| `product.json` | Product details, shopping features |
| `seller.json` | Seller dashboard, seller-specific features |
| `admin.json` | Admin dashboard, management features |
| `buyer.json` | Buyer dashboard, customer features |
| `orders.json` | Order status, order management |
| `privacy.json` | Privacy policy content |
| `terms.json` | Terms of service content |
| `faq.json` | Frequently asked questions |
| `help.json` | Help center content |
| `footer.json` | Footer links and information |

## Example Implementation

```tsx
// Before (flat structure)
{t("product.addToCart")}
{t("seller.dashboard")}
{t("admin.users")}

// After (modular structure)
{t("product.addToCart")}     // From product.json
{t("seller.dashboard")}      // From seller.json  
{t("admin.users")}           // From admin.json
```

This modular approach scales better for large applications and makes translation management much more efficient.