# 🚀 Quick Start - Dual Database Mode

## Mode Switching

### Simulation Mode (Development)
```bash
# Edit .env
NODE_ENV=simulation

# Start server
npm start
```

### Production Mode (Live)
```bash
# Edit .env
NODE_ENV=production

# Start server
npm start
```

## Visual Indicators

### Console
```
🧪 SIMULATION (Local JSON)    # Development mode
☁️  PRODUCTION (MongoDB Atlas)  # Live mode
```

### Dashboard
- Yellow badge 🧪 = Simulation
- Green badge ☁️ = Production

## File Locations

### Simulation Data
```
data/peminjaman.json
data/booking.json
data/proyektor.json
```

### Production Data
```
MongoDB Atlas
cluster0.h4zvgnd.mongodb.net
Database: peminjamanProyektor
```

## Quick Commands

```bash
# Start server
npm start

# Test API
curl http://localhost:3000/api/peminjaman

# Migrate JSON to MongoDB
node migrate.js
node migrate-proyektor.js

# Check server status
# Look for: "Database Mode: 🧪 SIMULATION" or "☁️ PRODUCTION"
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Cannot connect MongoDB | Set `NODE_ENV=simulation` |
| JSON file not found | Create empty array: `echo [] > data/peminjaman.json` |
| Data not showing | Check correct mode in console log |
| Server won't start | Check .env file exists and valid |

## Default Settings

- **Default Mode**: Production
- **Default Port**: 3000
- **JSON Folder**: data/
- **MongoDB**: Atlas Cloud

For detailed documentation, see `DATABASE_MODE.md`
