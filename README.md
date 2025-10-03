# Seydaty Market App

This is a modern e-commerce application built with Next.js and TypeScript.

## Overview

Seydaty Market App is a feature-rich online marketplace. It includes functionalities for customers, sellers, and administrators. The application is designed to be scalable and maintainable, using a component-based architecture and a robust set of tools and libraries.

## Features

*   **Authentication:** Secure user login and registration.
*   **Shopping Cart:** A fully functional shopping cart.
*   **Wishlist:** Users can save their favorite products.
*   **Product Management:** Admins and sellers can manage products.
*   **Admin Dashboard:** A dashboard for administrators to manage the platform.
*   **Seller Dashboard:** A dashboard for sellers to manage their products and orders.
*   **Localization:** Support for multiple languages (English and Arabic).
*   **Responsive Design:** The application is optimized for various screen sizes.

## Getting Started

### Prerequisites

*   Node.js (v18 or later)
*   pnpm

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    ```
2.  Navigate to the project directory:
    ```bash
    cd <project-directory>
    ```
3.  Install the dependencies:
    ```bash
    pnpm install
    ```

### Running the Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Technologies Used

*   **Framework:** [Next.js](https://nextjs.org/)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **UI Components:** [Shadcn/UI](https://ui.shadcn.com/)
*   **Authentication & Database:** [Firebase](https://firebase.google.com/)
*   **State Management:** React Context API
*   **Form Handling:** [React Hook Form](https://react-hook-form.com/)
*   **Linting:** [ESLint](https://eslint.org/)

## Project Structure

```
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
```
