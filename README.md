# Go Green Rwanda - Admin Dashboard

A comprehensive admin panel for managing the Go Green Rwanda e-commerce platform.

## Features

- **Dashboard**: Overview of key metrics and recent activity
- **Products Management**: Add, edit, delete products and set featured items
- **Categories Management**: Organize products into categories
- **Go Hub Management**: Manage loyalty program, members, and points
- **Blog Management**: Create and manage blog posts
- **Promotions**: Create and manage promotional campaigns
- **Orders**: View and manage customer orders
- **Customers**: Manage customer accounts and data
- **Settings**: Configure store settings

## Getting Started

### Installation

```bash
cd go-green-admin
npm install
```

### Development

```bash
npm run dev
```

The admin panel will run on **http://localhost:3001** (different port from main site)

### Build

```bash
npm run build
npm start
```

## Project Structure

```
go-green-admin/
├── app/
│   ├── page.tsx              # Dashboard
│   ├── products/             # Products management
│   ├── categories/           # Categories management
│   ├── hub/                  # Go Hub management
│   ├── blog/                 # Blog management
│   ├── promotions/           # Promotions management
│   ├── orders/               # Orders management
│   ├── customers/            # Customers management
│   └── settings/             # Settings
├── components/
│   ├── admin-sidebar.tsx     # Navigation sidebar
│   └── ui/                   # Reusable UI components
└── lib/
    └── utils.ts              # Utility functions
```

## Next Steps

To complete the admin panel, you need to create pages for:

1. **Products** (`app/products/page.tsx`) - List, add, edit, delete, feature products
2. **Categories** (`app/categories/page.tsx`) - Manage product categories
3. **Go Hub** (`app/hub/page.tsx`) - Manage Hub members, points, tiers
4. **Blog** (`app/blog/page.tsx`) - Create and manage blog posts
5. **Promotions** (`app/promotions/page.tsx`) - Manage promotional campaigns
6. **Orders** (`app/orders/page.tsx`) - View and manage orders
7. **Customers** (`app/customers/page.tsx`) - Manage customer accounts
8. **Settings** (`app/settings/page.tsx`) - Store configuration

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Notifications**: Sonner

## Port Configuration

- Main Website: `http://localhost:3000`
- Admin Panel: `http://localhost:3001`
