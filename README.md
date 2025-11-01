# ✨ Doodle Quest: AI Adventure Creator

**Turn any webpage into a fun, AI-powered adventure game!**

Doodle Quest is a Chrome Extension that uses the power of on-device AI to transform dense articles, blog posts, and stories into playful, interactive "quests." It's a visual educator designed to make learning engaging and fun for kids and adults alike.


---

## 🚀 About The Project

In a world saturated with information, how we learn is as important as what we learn. Doodle Quest was born from a simple question: **What if we could give every webpage an "infographic mode"?**

This extension acts as an on-the-fly game designer. It analyzes the content of any webpage and uses the Gemini Nano model to generate a unique, interactive adventure. It creates a theme, a simple summary, and a series of emoji-based "Quest Steps." But there's a twist! Some silly, out-of-place "impostors" are mixed in, and it's your job to find them, turning learning into a fun "spot the imposter" game.

### Key Features

*   **🧠 Instant Adventure Generation:** Turn any article, blog, or story into a game with a single click.
*   **🎮 Gamified Learning:** Understand complex topics through visual emoji scenes and an interactive "spot the imposter" challenge.
*   **⚙️ Adjustable Difficulty:** Choose from Easy, Medium, or Hard to change the complexity of the summary and the number of quest steps.
*   **🌍 Multilingual Support:** Generate adventures in English, Spanish, or Japanese.
*   **🔒 100% Private & Offline:** All AI processing happens directly on your computer using Google's on-device model. Your data never leaves your device, and it works even without an internet connection.

---

## 🛠️ Built With

This project is built with a modern, powerful tech stack:

*   **[React](https://reactjs.org/)** - For building the user interface.
*   **[TypeScript](https://www.typescriptlang.org/)** - For type-safe JavaScript.
*   **[Vite](https://vitejs.dev/)** - For a blazing-fast development experience.
*   **[Tailwind CSS](https://tailwindcss.com/)** - For utility-first styling.
*   **[Framer Motion](https://www.framer.com/motion/)** - For beautiful, fluid animations.
*   **Google Chrome's Built-in AI** - Powered by the **Gemini Nano** on-device model.

---

## 📋 System Requirements (IMPORTANT!)

Doodle Quest relies on the experimental Chrome Prompt API and the Gemini Nano model. To use this extension, your system **must** meet the following requirements:

1.  **Browser:** **Chrome version 127 or newer** (Chrome Dev or Canary is recommended).
2.  **Hardware:** The on-device model is only available on select hardware. As of now, this generally includes:
    *   Recent Google Pixel devices.
    *   Select modern laptops and desktops with sufficient RAM (at least 8GB recommended) and hardware acceleration.
    *   *(For the most up-to-date list, please refer to the official Chrome for Developers documentation on Built-in AI.)*
3.  **Chrome Flags:** You must enable two experimental flags in your Chrome browser:
    *   Navigate to `chrome://flags`
    *   Enable **`#prompt-api-for-gemini-nano`**
    *   Enable **`#enable-experimental-web-platform-features`**
    *   Relaunch your browser after enabling them.

---

## ⚙️ Getting Started: Installation & Setup

To get a local copy up and running, follow these simple steps.

### Prerequisites

*   **Node.js:** Make sure you have Node.js (version 18.x or later) installed. You can check with `node -v`.
*   **npm:** `npm` is installed automatically with Node.js.

### 1. Installation from Source

1.  **Clone the repository:**
    ```sh
    https://github.com/marietta-a/doodle-quest.git
    ```
2.  **Navigate into the project directory:**
    ```sh
    cd doodle-quest
    ```
3.  **Install NPM packages:**
    ```sh
    npm install
    ```

### 2. Chrome Setup

1.  **Start the development server:**
    ```sh
    npm run dev
    ```
    This command will watch for file changes and create a `dist` folder containing the unpackaged extension. **Keep this terminal window running.**

2.  **Load the extension in Chrome:**
    *   Open Chrome and navigate to `chrome://extensions`.
    *   In the top-right corner, turn on **"Developer mode"**.
    *   Click the **"Load unpacked"** button.
    *   A file dialog will open. Select the `dist` folder that was created inside your project directory.

Your Doodle Quest extension should now appear in your list of extensions and be ready to use!

---

## 📖 How to Use

1.  Navigate to any text-rich webpage you want to explore (a Wikipedia article or Google search is a great start!).
2.  Click the **Doodle Quest icon** in your Chrome toolbar.
3.  In the pop-up, use the default **Language** and set the **Difficulty**.
4.  Click the **"Create Adventure!"** button.
5.  Wait a few moments as the AI reads the page and builds your quest. A new browser tab will automatically open with your unique adventure!
6.  Explore the main scene, and then play the game by checking the boxes containing all the valid quests and win the game!

---

## 📄 License

This project is open-sourced under the **MIT License**. See the `LICENSE` file for more details.
