# ONYX-MD
### **A JAVASCRIPT WHATSAPP BOT 🌀🔥**

*A WhatsApp based third party application that provide many services with a real-time automated conversational experience.*

![cover](https://raw.githubusercontent.com/aroshsamuditha/ONYX-MEDIA/refs/heads/main/oNYX%20bOT.jpg)

**ONYX MD** is a user bot for WhatsApp that allows you to do many tasks. This project mainly focuses on making the user's work easier. This project is coded with JavaScript and Docker. Also, you are not allowed to make any modifications to this project. This is our first bot and we will work on providing more updates in the future. Until then, enjoy!🌀🔥
⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘

---
### ※ Visit our official whatsapp group
**[JOIN 🔗](https://chat.whatsapp.com/IT6mjqGINN6LaLSKnTZd6r)**

### ※ You can join our Cool Art WhatsApp Group by this invite link
**[JOIN 🔗](https://chat.whatsapp.com/IT6mjqGINN6LaLSKnTZd6r)**

---
### GET SESSION ID:
**[SESSION ID 🔗](https://replit.com/@aroshasamuditha/ONYX-PIER-CODE)**

### CREATE MEGA ACCOUNT:
**[MEGA 📁](https://mega.io/)**

### GEMINI API:
**[GEMINI ⭐](https://aistudio.google.com/prompts/new_chat)**

### MOVIE API:
**[MOVIE 🎞](https://api.skymansion.site/movies-dl/)**

---
### MOVIE API:
**[LUNES HOST 👾](https://betadash.lunes.host/login)**


*Run Comands*

  **npm install**
  
  **npm start**


***සෑ.යු - Lunes Host platform එකෙන් ඔයා Bot ව Deploy කරනවනම් Movie API එක දාන්න එපා (මේ platform එකෙන් deploy කරාම Movie download කරන්න බෑ )***

---


### DEPLOY FROM WORKFLOW :

COPY WORKFLOW CODE 🌀🔥

```
name: Node.js CI

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main
  schedule:
    # Run every 6 hours and 15 minutes (6.25 hours = 22500 seconds)
    # Cron format: minute hour day month day-of-week
    # This runs at 00:00, 06:15, 12:30, 18:45 UTC every day
    - cron: '0,15,30,45 0,6,12,18 * * *'

jobs:
  build:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [20.x]

    steps:
    - name: Checkout repository
      uses: actions/checkout@v3

    - name: Set up Node.js
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}

    - name: Install dependencies
      run: npm install

    - name: Start application
      run: npm start

  restart:
    runs-on: ubuntu-latest
    needs: build
    
    steps:
    - name: Checkout repository
      uses: actions/checkout@v3

    - name: Set up Node.js
      uses: actions/setup-node@v3
      with:
        node-version: 20.x

    - name: Install dependencies
      run: npm install

    - name: Restart application
      run: |
        echo "🔄 Restarting application..."
        npm restart || npm start
        echo "✅ Application restarted successfully"

    - name: Wait for restart
      run: |
        echo "⏳ Waiting for application to fully restart..."
        sleep 30
        echo "✅ Restart process completed" 

```

## **Contact ONYX MD Developers**

| <a href="https://wa.me/94761676948?text=*Hi,+Arosh🌀🔥*"><img src="https://raw.githubusercontent.com/aroshsamuditha/ONYX-MEDIA/refs/heads/main/IMG/me.png" width=150 height=150></a> | <a href="https://www.facebook.com/profile.php?id=61550302625124&mibextid=ZbWKwL"><img src="https://raw.githubusercontent.com/aroshsamuditha/ONYX-MEDIA/refs/heads/main/IMG/shakthi.png" width=150 height=150></a> |
|---|---|
| **[Arosh Samuditha](https://wa.me/94761676948?text=*Hi,+Arosh🌀🔥*)**</br>Main Developer & Owner</br>**[CREATIVE DEVIL💜🪄]** | **[Shakthi]( )**</br>Help Developer and errors fixed ||

