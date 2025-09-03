const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

let mainWindow;
let db;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, "preload.js")
        }
    });
    
    console.log("preload path:", path.join(__dirname, "preload.js"));
    mainWindow.loadFile("renderer/index.html");
}

app.on("ready", () => {
    const dbPath = path.join(app.getPath("userData"), "app.db");
    db = new sqlite3.Database(dbPath);

    db.run(`
        CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        text TEXT
        )
    `);

    createWindow();
});

ipcMain.handle('get-notes', () => {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM notes', (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
});

ipcMain.handle("add-note", (event, text) => {
    return new Promise((resolve, reject) => {
        db.run('INSERT INTO notes (text) VALUES (?)', [text], function (err) {
            if (err) reject(err);
            else resolve({ id: this.lastID, text});
        });
    });
});

console.log('UserData path:', app.getPath('userData'));