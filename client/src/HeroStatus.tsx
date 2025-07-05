import { useState, useEffect } from 'react';
import './HeroStatus.css';

interface Hero {
  hero_name_jp: string;
  hero_name_en: string;
  dps: number;
  weapon_name: string;
  distance: string;
  type: string;
  range: string;
  ammo_damage: number;
  fire_rate: number;
  fire_speed: string;
  ammo_count: number;
  reload_time: number;
  bullet_speed: number;
  critical_bonus_scale: number;
  melee_attack: number;
  melee_attack2: number;
  max_hp: number;
  hp_regen: number;
  ammo_resistance: string;
  spirit_resistance: string;
  critical_reduction: number;
  movement_speed: number;
  sprint_speed: number;
  stamina: number;
  stamina_cooldown: number;
}

interface HeroStatusData {
  heroes: Hero[];
  last_updated: string;
  total_heroes: number;
}

interface HeroStatusProps {
  onNavigateHome: () => void;
}

function HeroStatus({ onNavigateHome }: HeroStatusProps) {
  const [statusData, setStatusData] = useState<HeroStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedHero, setSelectedHero] = useState<Hero | null>(null);

  useEffect(() => {
    const fetchStatusData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/status-info');
        const data = await response.json();
        setStatusData(data);
        if (data.heroes && data.heroes.length > 0) {
          setSelectedHero(data.heroes[0]);
        }
      } catch (error) {
        console.error('Error fetching hero status:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatusData();
  }, []);

  if (loading) {
    return <div className="loading">ヒーローステータスを読み込み中...</div>;
  }

  if (!statusData || !statusData.heroes || statusData.heroes.length === 0) {
    return (
      <div className="hero-status-container">
        <button onClick={onNavigateHome} className="back-button">
          ← ホームに戻る
        </button>
        <div className="no-data">ヒーローステータスデータが見つかりません</div>
      </div>
    );
  }

  return (
    <div className="hero-status-container">
      <header className="hero-status-header">
        <button onClick={onNavigateHome} className="back-button">
          ← ホームに戻る
        </button>
        <h1>ヒーローステータス</h1>
        <p className="last-updated">
          最終更新: {new Date(statusData.last_updated).toLocaleString('ja-JP')}
        </p>
        <p className="total-heroes">総ヒーロー数: {statusData.total_heroes}</p>
      </header>

      <div className="hero-status-content">
        <div className="hero-list">
          <h2>ヒーロー一覧</h2>
          <div className="hero-grid">
            {statusData.heroes.map((hero, index) => (
              <div
                key={index}
                className={`hero-card ${selectedHero === hero ? 'selected' : ''}`}
                onClick={() => setSelectedHero(hero)}
              >
                <h3>{hero.hero_name_jp}</h3>
                <p className="hero-name-en">{hero.hero_name_en}</p>
                <div className="hero-basic-stats">
                  <span className="dps">DPS: {hero.dps}</span>
                  <span className="distance">{hero.distance}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedHero && (
          <div className="hero-details">
            <h2>詳細ステータス</h2>
            <div className="hero-info">
              <h3>{selectedHero.hero_name_jp} ({selectedHero.hero_name_en})</h3>
              
              <div className="stats-grid">
                <div className="stat-section">
                  <h4>基本ステータス</h4>
                  <div className="stat-item">
                    <span className="stat-label">DPS:</span>
                    <span className="stat-value">{selectedHero.dps}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">最大HP:</span>
                    <span className="stat-value">{selectedHero.max_hp}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">HPリジェネ:</span>
                    <span className="stat-value">{selectedHero.hp_regen}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">移動速度:</span>
                    <span className="stat-value">{selectedHero.movement_speed}</span>
                  </div>
                </div>

                <div className="stat-section">
                  <h4>武器ステータス</h4>
                  <div className="stat-item">
                    <span className="stat-label">武器名:</span>
                    <span className="stat-value">{selectedHero.weapon_name}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">タイプ:</span>
                    <span className="stat-value">{selectedHero.type}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">射程:</span>
                    <span className="stat-value">{selectedHero.range}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">弾薬ダメージ:</span>
                    <span className="stat-value">{selectedHero.ammo_damage}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">発射レート:</span>
                    <span className="stat-value">{selectedHero.fire_rate}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">弾数:</span>
                    <span className="stat-value">{selectedHero.ammo_count}</span>
                  </div>
                </div>

                <div className="stat-section">
                  <h4>防御ステータス</h4>
                  <div className="stat-item">
                    <span className="stat-label">弾薬耐性:</span>
                    <span className="stat-value">{selectedHero.ammo_resistance}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">スピリット耐性:</span>
                    <span className="stat-value">{selectedHero.spirit_resistance}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">クリティカル軽減:</span>
                    <span className="stat-value">{selectedHero.critical_reduction}</span>
                  </div>
                </div>

                <div className="stat-section">
                  <h4>機動性ステータス</h4>
                  <div className="stat-item">
                    <span className="stat-label">スプリント速度:</span>
                    <span className="stat-value">{selectedHero.sprint_speed}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">スタミナ:</span>
                    <span className="stat-value">{selectedHero.stamina}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">スタミナクールダウン:</span>
                    <span className="stat-value">{selectedHero.stamina_cooldown}s</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default HeroStatus;