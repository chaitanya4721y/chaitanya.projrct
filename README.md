# Amazon Clone – E-Commerce Web App

A front-end Amazon-inspired e-commerce web application built with HTML, CSS, and vanilla JavaScript, using **Supabase** as the backend for authentication and data storage.

---

## 🚀 Features

- **Home Page** – Amazon-style landing page with a navigation bar, hero banner, and product category cards.
- **Products Page** – Grid of product cards with image, name, price, and an "Add to Cart" button.
- **Shopping Cart** – Dynamic cart that reads from `localStorage`, shows item details, calculates subtotal, shipping, and total in a live order summary.
- **User Authentication**
  - **Sign Up** – Collects full name, country, status, email, and password; stores data in Supabase.
  - **Login** – Email/password authentication via Supabase Auth with a loading spinner and show/hide password toggle.
- **Cart Badge** – Live item-count badge on the cart icon that updates across all pages.

---

## 🛠️ Tech Stack

| Layer      | Technology                                    |
|------------|-----------------------------------------------|
| Markup     | HTML5                                         |
| Styling    | CSS3 (custom, no framework)                   |
| Logic      | Vanilla JavaScript (ES6+)                     |
| Backend    | [Supabase](https://supabase.com) (Database + Auth) |
| Icons      | [Font Awesome 7](https://fontawesome.com/)    |
| Fonts      | Google Fonts – Montserrat                     |

---

## 📁 Project Structure

```
chaitanya.projrct/
├── index.html          # Home / landing page
├── style.css           # Styles for the home page
├── script.js           # Home page scripts
│
├── products.html       # Product listing page
├── product.css         # Styles for the products page
│
├── cart.html           # Shopping cart page
├── cart.css            # Styles for the cart page
├── cart.js             # Cart logic (render items, totals, checkout)
├── cart-badge.js       # Updates cart item-count badge on all pages
│
├── login.html          # Login page
├── login.css           # Styles for the login page
├── login.js            # Login helper script
│
└── signup.html         # Sign-up page (self-contained with inline styles & script)
```

---

## ⚙️ Setup & Running Locally

This project is entirely static — no build step or package install is required.

1. **Clone the repository**
   ```bash
   git clone https://github.com/chaitanya4721y/chaitanya.project.git
   cd chaitanya.project
   ```

2. **Open in a browser**

   Simply open `index.html` directly in your browser, **or** use a local dev server for best results (avoids ES-module CORS restrictions):

   ```bash
   # Using the VS Code Live Server extension  (recommended)
   # Right-click index.html → "Open with Live Server"

   # Or with Python
   python -m http.server 8080
   # Then visit http://localhost:8080
   ```

3. **Supabase is already configured** – the Supabase project URL and anon key are embedded in the source. No `.env` file is needed for local development.

---

## 🗄️ Supabase Schema

The app uses a `users` table for sign-up data:

| Column     | Type   | Notes                      |
|------------|--------|----------------------------|
| `id`       | uuid   | Auto-generated primary key |
| `name`     | text   | Full name                  |
| `country`  | text   | Country                    |
| `status`   | text   | User status                |
| `email`    | text   | Email address              |
| `password` | text   | Password (plain text – see note below) |

> **🚨 Critical Security Vulnerability:** Storing passwords in plain text is a serious security risk and must be fixed immediately — not only for production, but for any deployment. Any breach of the database would expose every user's password directly. **Action required:** remove the `password` column from the `users` table, migrate sign-up to use only `supabase.auth.signUp()`, and invalidate any existing plain-text stored passwords right away.

---

## 🛒 How the Cart Works

1. When a user clicks **Add to Cart** on any product, the item `{ name, price, img }` is pushed into a JSON array stored in `localStorage` under the key `"cart"`.
2. `cart.html` reads `localStorage` on load, renders each item, and calculates totals dynamically.
3. `cart-badge.js` is included on every page and reads the cart array length to show the badge count on the cart nav icon.

---

## 📄 License

This project is open-source and available for educational purposes.
