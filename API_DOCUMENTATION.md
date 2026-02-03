# API Documentation - Madaba Women Market

## Products API (`/api/products`)

Endpoint for managing and retrieving products.

### GET `/api/products`

Retrieves a paginated list of products.

**Query Parameters:**
- `page` (optional): Page number (default: 1).
- `limit` (optional): Items per page (default: 10, max: 100).
- `category` (optional): Filter by category.
- `search` (optional): Search in name and description (Arabic/English).
- `sellerId` (optional): Filter by a specific seller's ID.

**Response (200 OK):**
```json
{
  "items": [
    {
      "id": "uuid",
      "name": "Product Name",
      "nameAr": "اسم المنتج",
      "price": 10.5,
      ...
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

### POST `/api/products`

Creates a new product (Requires Seller role).

**Request Body (FormData):**
- `nameAr`: string
- `descriptionAr`: string
- `price`: number
- `category`: string
- `stock`: integer
- `imageUrl`: string (optional)

---

## Security & Middleware

- **Rate Limiting**: 100 requests per minute per IP. Returns `429 Too Many Requests` on violation.
- **Route Protections**:
    - `/admin/*`: Restricted to users with `admin` role.
    - `/seller/*`: Restricted to users with `seller` or `admin` role.
