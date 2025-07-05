const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '../data/proxy.db');

class DatabaseCache {
  constructor() {
    this.db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Error opening database:', err.message);
      } else {
        console.log('Connected to SQLite database');
      }
    });
  }

  async getCache(cacheKey) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT data FROM cache_data 
        WHERE cache_key = ? AND (expires_at IS NULL OR expires_at > datetime('now'))
      `;
      
      this.db.get(query, [cacheKey], (err, row) => {
        if (err) {
          reject(err);
        } else if (row) {
          try {
            resolve(JSON.parse(row.data));
          } catch (parseErr) {
            reject(parseErr);
          }
        } else {
          resolve(null);
        }
      });
    });
  }

  async setCache(cacheKey, data, expiresInMinutes = 60) {
    return new Promise((resolve, reject) => {
      const expiresAt = expiresInMinutes ? 
        `datetime('now', '+${expiresInMinutes} minutes')` : 
        null;
      
      const query = `
        INSERT OR REPLACE INTO cache_data (cache_key, data, expires_at, updated_at) 
        VALUES (?, ?, ${expiresAt}, datetime('now'))
      `;
      
      this.db.run(query, [cacheKey, JSON.stringify(data)], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      });
    });
  }

  async clearExpiredCache() {
    return new Promise((resolve, reject) => {
      const query = `DELETE FROM cache_data WHERE expires_at < datetime('now')`;
      
      this.db.run(query, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes);
        }
      });
    });
  }

  close() {
    this.db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
      } else {
        console.log('Database connection closed');
      }
    });
  }
}

module.exports = new DatabaseCache();