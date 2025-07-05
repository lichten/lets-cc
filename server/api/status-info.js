const express = require('express');
const { google } = require('googleapis');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const spreadsheetId = process.env.STATUS_GOOGLE_SHEETS_ID || '14V_bpBBC7S5kadzKuZh29Yvpx8Hnpw0cLShS7xwRYXY';
    const apiKey = process.env.GOOGLE_SHEETS_API_KEY;
    const sheetName = process.env.STATUS_GOOGLE_SHEETS_NAME || 'Sheet1';
    const range = `${sheetName}!A1:Z1000`;

    if (!apiKey) {
      console.log('Google Sheets API key missing, using default status data');
      return res.json(getDefaultStatusData());
    }

    const sheets = google.sheets({ version: 'v4', auth: apiKey });
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: range,
    });

    const values = response.data.values;
    
    if (!values || values.length === 0) {
      console.log('No data found in spreadsheet, using default status data');
      return res.json(getDefaultStatusData());
    }

    const statusData = convertSpreadsheetToStatusData(values);
    
    if (!statusData || Object.keys(statusData).length === 0) {
      console.log('No valid status data found in spreadsheet, using default data');
      return res.json(getDefaultStatusData());
    }

    console.log('Loaded status data from Google Sheets');
    res.json(statusData);

  } catch (error) {
    console.error('Error fetching from Google Sheets:', error.message);
    res.json(getDefaultStatusData());
  }
});

function getDefaultStatusData() {
  return {
    heroes: [
      {
        hero_name_jp: "エイブラムス",
        hero_name_en: "Abrams",
        dps: 54,
        weapon_name: "ケースクローズド",
        distance: "近距離",
        type: "スプレッド射撃",
        range: "20m → 46m",
        ammo_damage: 3.7,
        fire_rate: 1.67,
        fire_speed: "0%",
        ammo_count: 9,
        reload_time: 0.35,
        bullet_speed: 60,
        critical_bonus_scale: 0,
        melee_attack: 63,
        melee_attack2: 116,
        max_hp: 720,
        hp_regen: 1.5,
        ammo_resistance: "0%",
        spirit_resistance: "0%",
        critical_reduction: 0,
        movement_speed: 6.5,
        sprint_speed: 2,
        stamina: 3,
        stamina_cooldown: 5
      }
    ],
    last_updated: new Date().toISOString(),
    total_heroes: 1
  };
}

function convertSpreadsheetToStatusData(spreadsheetData) {
  if (spreadsheetData.length === 0) return {};
  
  const headers = spreadsheetData[0];
  const rows = spreadsheetData.slice(1);
  
  const heroes = rows.map(row => {
    const hero = {};
    
    headers.forEach((header, index) => {
      const value = row[index] || '';
      
      // ヘッダーに基づいてプロパティ名を決定
      switch (header) {
        case 'ヒーロー名':
          hero.hero_name_jp = value;
          break;
        case 'ヒーロー名（英語）':
          hero.hero_name_en = value;
          break;
        case 'DPS':
          hero.dps = parseFloat(value) || 0;
          break;
        case '武器名':
          hero.weapon_name = value;
          break;
        case '距離':
          hero.distance = value;
          break;
        case 'タイプ':
          hero.type = value;
          break;
        case '射程':
          hero.range = value;
          break;
        case '弾薬ダメージ':
          hero.ammo_damage = parseFloat(value) || 0;
          break;
        case '発射レート':
          hero.fire_rate = parseFloat(value) || 0;
          break;
        case '発射速度':
          hero.fire_speed = value;
          break;
        case '弾数':
          hero.ammo_count = parseInt(value) || 0;
          break;
        case 'リロード時間':
          hero.reload_time = parseFloat(value) || 0;
          break;
        case '弾速':
          hero.bullet_speed = parseFloat(value) || 0;
          break;
        case 'クリティカルボーナススケール':
          hero.critical_bonus_scale = parseFloat(value) || 0;
          break;
        case '近接攻撃':
          hero.melee_attack = parseFloat(value) || 0;
          break;
        case '近接攻撃2':
          hero.melee_attack2 = parseFloat(value) || 0;
          break;
        case '最大HP':
          hero.max_hp = parseFloat(value) || 0;
          break;
        case 'HPリジェネ':
          hero.hp_regen = parseFloat(value) || 0;
          break;
        case '弾薬耐性':
          hero.ammo_resistance = value;
          break;
        case 'スピリット耐性':
          hero.spirit_resistance = value;
          break;
        case 'クリティカル軽減':
          hero.critical_reduction = parseFloat(value) || 0;
          break;
        case '移動速度':
          hero.movement_speed = parseFloat(value) || 0;
          break;
        case 'スプリント速度':
          hero.sprint_speed = parseFloat(value) || 0;
          break;
        case 'スタミナ':
          hero.stamina = parseFloat(value) || 0;
          break;
        case 'スタミナクールダウン':
          hero.stamina_cooldown = parseFloat(value) || 0;
          break;
      }
    });
    
    return hero;
  }).filter(hero => hero.hero_name_jp && hero.hero_name_jp.trim() !== '');
  
  return {
    heroes: heroes,
    last_updated: new Date().toISOString(),
    total_heroes: heroes.length
  };
}

module.exports = router;