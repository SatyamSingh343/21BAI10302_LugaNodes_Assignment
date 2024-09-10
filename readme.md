# Ethereum Beacon Chain Deposit Tracker

This project monitors Ethereum Beacon Chain deposit events in real-time using Alchemy's WebSocket API. It captures and processes deposit data, logs details, and sends Telegram notifications for each deposit event.

## Key Features

1. Live tracking of Ethereum Beacon Chain deposit transactions.
2. Decoding and processing of deposit event data.
3. Logs all deposit information into a JSON file for easy reference.
4. Sends automated notifications via Telegram for each new deposit.
5. Calculates transaction fees and includes detailed information about deposits.

## Prerequisites

- Node.js (version 14.x or higher)
- Alchemy API Key
- Telegram Bot Token and Chat ID

## Setup and Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-username/your-repository.git

2. **Move to the project directory:**

   ```bash
   cd your-repository

3. **Install dependencies:**
    ```bash
    npm install

4. **Create .env file**
    ```bash
    ALCHEMY_API_KEY=your-alchemy-api-key
    TELEGRAM_BOT_TOKEN=your-telegram-bot-token
    TELEGRAM_CHAT_ID=your-telegram-chat-id

5. **Run tracker.js**
    ```bash
    node src/tracker.js

Once you've configured the .env file and started the tracker, join telegram channel to get live updates https://t.me/luganordes21BAI10302 after running the tracker.js with prefilled .env

Demo Video - https://drive.google.com/file/d/1p-OOw1D0c_Mr2f1hH3JeBc1tI1bSNyzT/view