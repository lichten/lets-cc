const express = require('express');
const { google } = require('googleapis');
const database = require('../utils/database');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const cacheKey = 'item_info';
    const forceRefresh = req.query.refresh === 'true';
    
    // Try to get data from cache first (unless force refresh is requested)
    if (!forceRefresh) {
      const cachedData = await database.getCache(cacheKey);
      if (cachedData) {
        console.log('Returning cached item data');
        return res.json(cachedData);
      }
    } else {
      console.log('Force refresh requested, bypassing cache');
    }

    // If no cache, fetch from Google Sheets
    const spreadsheetId = '14V_bpBBC7S5kadzKuZh29Yvpx8Hnpw0cLShS7xwRYXY';
    const sheetName = 'アイテム';
    const range = `${sheetName}!A:S`;
    const apiKey = process.env.GOOGLE_SHEETS_API_KEY;

    let items;

    if (!apiKey) {
      console.log('Google Sheets API key missing, using default item data');
      items = getDefaultItemData();
    } else {
      try {
        const sheets = google.sheets({ version: 'v4', auth: apiKey });
        
        const response = await sheets.spreadsheets.values.get({
          spreadsheetId: spreadsheetId,
          range: range,
        });

        const values = response.data.values;
        
        if (!values || values.length === 0) {
          console.log('No data found in spreadsheet, using default item data');
          items = getDefaultItemData();
        } else {
          items = convertTsvToJson(values);
          
          if (items.length === 0) {
            console.log('No valid items found in spreadsheet, using default item data');
            items = getDefaultItemData();
          } else {
            console.log(`Loaded ${items.length} items from Google Sheets`);
          }
        }
      } catch (sheetsError) {
        console.error('Error fetching from Google Sheets:', sheetsError.message);
        items = getDefaultItemData();
      }
    }

    // Cache the data for 60 minutes
    await database.setCache(cacheKey, items, 60);
    console.log('Data cached to SQLite database');
    
    res.json(items);

  } catch (error) {
    console.error('Error in item-info endpoint:', error.message);
    res.json(getDefaultItemData());
  }
});

function getDefaultItemData() {
  return [
    {
      種類: "スピリット",
      id: "3001",
      ability_no: "",
      upgradesto_id1: "",
      upgradesto_id2: "",
      upgradesto_id3: "",
      upgradesfrom_id: "",
      価格: "800",
      名称: "エクストラスピリット1",
      ボーナス: "",
      解説文: "",
      パッシブ: "FALSE",
      PCooldown: "",
      アクティブ: "FALSE",
      ACooldown: "",
      スペック1: "",
      スペック2: "",
      スペック3: "",
      スペック4: ""
    }
  ];
}

function convertTsvToJson(spreadsheetData) {
  if (spreadsheetData.length === 0) return [];
  
  const headers = spreadsheetData[0];
  const rows = spreadsheetData.slice(1);
  
  return rows.map((row) => {
    const item = {};
    
    headers.forEach((header, colIndex) => {
      const cellValue = row[colIndex] || '';
      item[header] = cellValue;
    });
    
    return item;
  }).filter(item => item.id && item.名称);
}

module.exports = router;