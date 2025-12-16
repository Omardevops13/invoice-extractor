# 🚀 Invoice Extractor - Quick Setup

## Prerequisites
- **Python 3.8+** (check with `python --version`)
- **Node.js 18+** (check with `node --version`)
- **npm** (comes with Node.js)

## One-Command Setup & Run

```bash
# Make the script executable and run
chmod +x run.sh
./run.sh
```

The script will automatically:
1. ✅ Create Python virtual environment (`backend/venv/`)
2. ✅ Install Python dependencies from `requirements.txt`
3. ✅ Install Node.js dependencies (`frontend/node_modules/`)
4. ✅ Start Flask backend server (port 5001)
5. ✅ Start Next.js frontend server (port 3000)

## Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001
- **API Documentation**: http://localhost:5001/api-docs/

## Features

- 📄 **Upload invoices** (PDF, JPG, PNG)
- 🔍 **Extract data** automatically
- ✏️ **Edit extracted data** before saving
- 💾 **Save to database** (creates products/customers dynamically)
- 📜 **View history** with delete functionality
- 🗄️ **Explore database** (starts empty, grows with usage)

## Manual Setup (Alternative)

If you prefer manual setup:

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

## Stopping the Application

Press `Ctrl+C` in the terminal running `./run.sh` to stop both servers.

---

**Ready to process invoices!** 🎉
