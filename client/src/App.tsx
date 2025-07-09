import { useState, useEffect } from 'react'
import HeroStatus from './HeroStatus'
import ItemInfo from './item-info/ItemInfo'
import './App.css'
import heroBg from '/hero-bg.svg'
import characterSilhouette from '/character-silhouette.svg'
import weaponIcon from '/weapon-icon.svg'

interface GameInfo {
  title: string;
  description: string;
  features: string[];
  status: string;
}

function App() {
  const [gameInfo, setGameInfo] = useState<GameInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState<'home' | 'hero-status' | 'item-info'>('home')

  useEffect(() => {
    const fetchGameInfo = async () => {
      try {
        const response = await fetch('/ddgame/api/game-info')
        const data = await response.json()
        setGameInfo(data)
      } catch (error) {
        console.error('Error fetching game info:', error)
        setGameInfo({
          title: 'Deadlock',
          description: 'A competitive multiplayer third-person shooter with MOBA elements',
          features: [
            '6v6 competitive matches',
            'Unique hero abilities',
            'Lane-based gameplay',
            'Strategic item builds',
            'Team-based objectives'
          ],
          status: 'In Development'
        })
      } finally {
        setLoading(false)
      }
    }

    fetchGameInfo()
  }, [])

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  if (currentPage === 'hero-status') {
    return <HeroStatus onNavigateHome={() => setCurrentPage('home')} />
  }

  if (currentPage === 'item-info') {
    return (
      <div>
        <button 
          onClick={() => setCurrentPage('home')} 
          style={{ 
            margin: '20px', 
            padding: '10px 20px', 
            backgroundColor: '#3498db', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px', 
            cursor: 'pointer' 
          }}
        >
          ← ホームに戻る
        </button>
        <ItemInfo />
      </div>
    )
  }

  return (
    <div className="app">
      <header className="hero-section">
        <div className="hero-bg">
          <img src={heroBg} alt="FPS Background" className="hero-background" />
        </div>
        <div className="hero-content">
          <div className="hero-character">
            <img src={characterSilhouette} alt="Character" className="character-img" />
          </div>
          <div className="hero-text">
            <h1 className="game-title">{gameInfo?.title}</h1>
            <p className="game-status">{gameInfo?.status}</p>
            <p className="game-description">{gameInfo?.description}</p>
            <div className="button-group">
              <button className="cta-button">今すぐプレイ</button>
              <button 
                className="secondary-button" 
                onClick={() => setCurrentPage('hero-status')}
              >
                ヒーローステータス
              </button>
              <button 
                className="secondary-button" 
                onClick={() => setCurrentPage('item-info')}
              >
                アイテム情報
              </button>
            </div>
          </div>
        </div>
      </header>

      <section className="features-section">
        <div className="container">
          <h2>ゲームの特徴</h2>
          <div className="features-grid">
            {gameInfo?.features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">
                  <img src={weaponIcon} alt="Feature Icon" />
                </div>
                <h3>{feature}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="about-section">
        <div className="container">
          <h2>Deadlockについて</h2>
          <div className="about-content">
            <p>
              Deadlockは、革新的な第三人称シューティングゲームとMOBAの要素を組み合わせた
              新しいタイプのマルチプレイヤーゲームです。6対6の白熱したバトルで、
              戦略的な判断と素早いアクションが勝利の鍵となります。
            </p>
            <p>
              各ヒーローには独自のアビリティがあり、チームワークとアイテムビルドが
              試合の勝敗を左右します。レーンベースのゲームプレイと
              チーム目標の達成により、従来のシューティングゲームとは
              一線を画した戦略的な体験を提供します。
            </p>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <p>&copy; 2024 Deadlock Game. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default App
