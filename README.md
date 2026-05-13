# Resibo - Smart Utility Tracker 💡💧

Resibo is a modern, high-end web application designed to help users track and manage their utility consumption with ease. By leveraging **AI-powered OCR (Optical Character Recognition)**, Resibo allows users to simply scan their electricity and water bills to automatically extract billing data, visualize usage trends, and maintain a digital history of their expenses.

![Resibo Dashboard Mockup](https://raw.githubusercontent.com/lucide-react/lucide/main/icons/trending-up.svg) <!-- Replace with actual screenshot link -->

## ✨ Key Features

-   **AI OCR Scanning**: Automatically extract Total Amount, Consumption (kWh/m³), and Billing Date from utility receipts using Tesseract.js.
-   **Interactive Dashboard**: Visualize your consumption patterns with elegant Area and Line charts powered by Recharts.
-   **Dual Utility Tracking**: Seamlessly switch between **Electricity** (e.g., OEDC) and **Water** (e.g., Subic Water) tracking.
-   **Comprehensive History**: Access a full digital log of all analyzed receipts with easy editing and deletion capabilities.
-   **Responsive & Premium UI**: A mobile-first, glassmorphic design that adapts beautifully to any device—featuring a desktop sidebar and a mobile bottom navigation bar.
-   **Dark Mode Support**: Vibrant light and deep dark modes with smooth transitions.
-   **Secure Authentication**: Managed by Supabase (PostgreSQL) with password management and secure session handling.

## 🚀 Tech Stack

-   **Frontend**: [Next.js 15+](https://nextjs.org/), [React 19](https://reactjs.org/)
-   **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) (with custom safe-area utilities)
-   **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
-   **Backend & Database**: [Supabase](https://supabase.com/) (Auth & PostgreSQL)
-   **OCR Engine**: [Tesseract.js](https://tesseract.projectnaptha.com/)
-   **Charts**: [Recharts](https://recharts.org/)
-   **Icons**: [Lucide React](https://lucide.dev/)

## 🛠️ Getting Started

### Prerequisites

-   Node.js 18.x or later
-   pnpm, npm, or yarn
-   A Supabase project (URL and Anon Key)

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/yourusername/resibo.git
    cd resibo
    ```

2.  **Install dependencies**:
    ```bash
    pnpm install
    ```

3.  **Set up environment variables**:
    Create a `.env.local` file in the root directory and add your Supabase credentials:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Run the development server**:
    ```bash
    pnpm dev
    ```

5.  **Open the app**:
    Navigate to [http://localhost:3000](http://localhost:3000).

## 📁 Project Structure

```text
src/
├── app/             # Next.js App Router (Pages & Layouts)
│   ├── dashboard/   # Main dashboard logic
│   ├── login/       # Authentication pages
│   └── globals.css  # Global styles & Tailwind config
├── components/      # Reusable UI components (OCR, Charts, etc.)
├── lib/             # Third-party library configurations (Supabase)
├── services/        # Business logic (OCR Parsing, Regex)
├── store/           # Zustand state management
└── types/           # TypeScript interfaces & enums
```

## 📱 Responsive Design

Resibo is built to be a Progressive Web App (PWA) ready experience:
-   **Desktop**: Leverages a fixed sidebar for fast navigation.
-   **Mobile**: Uses a bottom navigation bar for ergonomic one-handed use.
-   **Safe Areas**: Fully supports devices with notches (iPhone/Android) via `env(safe-area-inset-*)`.

## 🔒 Security

-   **Authentication**: Secure login/register flow using Supabase Auth.
-   **Protected Routes**: Client-side redirect logic ensures only authenticated users can access the dashboard.
-   **Privacy**: All data is stored in your private Supabase instance.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ by [Your Name/Handle]
