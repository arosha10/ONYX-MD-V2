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
**[SESSION ID 🔗](https://improved-jillian-arosha01-51df8b45.koyeb.app/)**

### CREATE MEGA ACCOUNT:
**[MEGA 📁](https://mega.io/)**

### GEMINI API:
**[GEMINI ⭐](https://aistudio.google.com/prompts/new_chat)**

### MOVIE API:
**[MOVIE 🎞](https://api.skymansion.site/movies-dl/)**

---
### MOVIE API:
**[LUNES HOST 👾](https://betadash.lunes.host/login)**


## 🚀 Quick Start

### Local Development
```bash
npm install
npm start
```

### 🚂 Railway Deployment
This bot is now configured for Railway deployment! 

**Quick Deploy:**
1. Fork this repository
2. Go to [Railway](https://railway.app)
3. Create new project from GitHub
4. Add environment variables (see `env.example`)
5. Deploy!

**For detailed Railway deployment guide, see [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md)**


***සෑ.යු - Lunes Host platform එකෙන් ඔයා Bot ව Deploy කරනවනම් Movie API එක දාන්න එපා (මේ platform එකෙන් deploy කරාම Movie download කරන්න බෑ )***

---


## 🚀 Deployment Options

### 🚂 Railway (Recommended)
- **Easy deployment** with automatic scaling
- **24/7 uptime** with health checks
- **Free tier available**
- See [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md) for detailed guide

### 🌊 GitHub Actions
COPY WORKFLOW CODE 🌀🔥

```
name: OnyxMD.js CI

concurrency:
  group: onyx-md-v2-main
  cancel-in-progress: true

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main
  schedule:
    - cron: '0 0,6,12,18 * * *'

jobs:
  build:
    runs-on: ubuntu-latest
    env:
      GITHUB_TOKEN: ${{ secrets.PAT_GITHUB }}
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

      - name: Clean node_modules
        run: rm -rf node_modules

      - name: Install dependencies (with real PAT)
        run: npm install

      - name: Start application
        run: nohup npm start &

      - name: Keep workflow alive
        run: sleep 21540

  next-job:
    needs: build
    runs-on: ubuntu-latest
    env:
      GITHUB_TOKEN: ${{ secrets.PAT_GITHUB }}
    steps:
      - name: Checkout repository
        uses: actions/checkout@v3

      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 20.x

      - name: Do something after build
        run: echo "The first job is done! Now running the next job." 

```

## **Contact ONYX MD Developers**

| <a href="https://wa.me/94761676948?text=*Hi,+Arosh🌀🔥*"><img src="https://raw.githubusercontent.com/aroshsamuditha/ONYX-MEDIA/refs/heads/main/IMG/me.png" width=150 height=150></a> | <a href="https://www.facebook.com/profile.php?id=61550302625124&mibextid=ZbWKwL"><img src="https://raw.githubusercontent.com/aroshsamuditha/ONYX-MEDIA/refs/heads/main/IMG/shakthi.png" width=150 height=150></a> |
|---|---|
| **[Arosh Samuditha](https://wa.me/94761676948?text=*Hi,+Arosh🌀🔥*)**</br>Main Developer & Owner</br>**[CREATIVE DEVIL💜🪄]** | **[Shakthi]( )**</br>Help Developer and errors fixed ||

