# CampusFind

**CampusFind** is a modern, community-driven platform designed to help students and faculty recover lost belongings and return found items effortlessly. By combining real-time location mapping with AI-driven categorization, we streamline the process of connecting owners with their lost assets.

## 🚀 Live Demo
**Check it out here**: [https://campusfind-7a340.web.app](https://campusfind-7a340.web.app)

## ✨ Key Features

- **AI-Powered Item Analysis**: Simply snap a photo. **Google Gemini** automatically detects the object, suggests a descriptive title, and categorizes it to save you time.
- **Precision Mapping**: Drop a pin exactly where an item was lost or found using the integrated **TomTom Maps** dashboard.
- **Smart Matches**: AI-driven matching to suggest potential "Found" reports that correlate with your "Lost" item.
- **Live Community Feed**: Filter items by category (Electronics, Keys, Wallet, etc.) or type (Lost vs. Found) to find what you're looking for instantly.
- **Secure Authentication**: Integrated with Firebase for secure Google Sign-In, ensuring every report is tied to a verified campus member.

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS
- **Backend**: Firebase Firestore (NoSQL Database)
- **AI Engine**: Google Gemini 1.5 Flash (Multimodal)
- **Mapping**: TomTom Maps Web SDK
- **Icons**: Lucide React

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- A TomTom Developer API Key
- A Firebase project with Google Auth and Firestore enabled
- A Gemini API Key from Google AI Studio

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Icey067/CampusFind.git
   cd CampusFind
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file in the root directory:
   ```env
   VITE_FIREBASE_API_KEY=your_firebase_key
   VITE_GEMINI_API_KEY=your_gemini_key
   VITE_TOMTOM_API_KEY=your_tomtom_key
   ```

4. **Launch the Development Server:**
   ```bash
   npm run dev
   ```

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

---

*Built for the TechSprint Hackathon.*
