# CampusFind

**CampusFind** is a modern, community-driven platform designed to help students and faculty recover lost belongings and return found items effortlessly. By combining real-time location mapping with AI-driven categorization, we streamline the process of connecting owners with their lost assets.

## ✨ Key Features

- **AI-Powered Item Analysis**: Simply snap a photo. **Google Gemini** automatically detects the object, suggests a descriptive title, and categorizes it to save you time.
- **Precision Mapping**: Drop a pin exactly where an item was lost or found using the integrated **Google Maps** dashboard.
- **Live Community Feed**: Filter items by category (Electronics, Keys, Wallet, etc.) or type (Lost vs. Found) to find what you're looking for instantly.
- **Secure Authentication**: Integrated with Firebase for secure Google Sign-In, ensuring every report is tied to a verified campus member.

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS
- **Backend & Auth**: Firebase (Firestore, Storage, Authentication)
- **AI Engine**: Google Gemini 1.5 Flash
- **Mapping**: Google Maps JavaScript API
- **Icons**: Lucide React

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- A Firebase project
- A Google Cloud API Key (with Gemini and Maps enabled)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/CampusFind.git
   cd CampusFind
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file in the root directory and add your keys:
   ```env
   VITE_FIREBASE_API_KEY=your_firebase_key
   VITE_GEMINI_API_KEY=your_gemini_key
   VITE_GOOGLE_MAPS_KEY=your_google_maps_key
   ```

4. **Launch the Development Server:**
   ```bash
   npm run dev
   ```

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

---

*Built for the TechSprint Hackathon.*
