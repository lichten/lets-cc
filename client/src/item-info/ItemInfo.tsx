import { useState, useEffect } from 'react';
import './ItemInfo.css';

interface ItemData {
  種類: string;
  id: string;
  ability_no: string;
  upgradesto_id1: string;
  upgradesto_id2: string;
  upgradesto_id3: string;
  upgradesfrom_id1: string;
  upgradesfrom_id2: string;
  価格: string;
  名称: string;
  ボーナス: string;
  解説文: string;
  パッシブ: string;
  PCooldown: string;
  アクティブ: string;
  ACooldown: string;
  スペック1: string;
  スペック2: string;
  スペック3: string;
  スペック4: string;
}

interface GroupedItemData {
  種類: string;
  id: string;
  upgradesto_id1: string;
  upgradesto_id2: string;
  upgradesto_id3: string;
  upgradesfrom_id1: string;
  upgradesfrom_id2: string;
  価格: string;
  名称: string;
  ボーナス: string;
  variants: Array<{
    ability_no: string;
    解説文: string;
    パッシブ: string;
    PCooldown: string;
    アクティブ: string;
    ACooldown: string;
    スペック1: string;
    スペック2: string;
    スペック3: string;
    スペック4: string;
  }>;
}

const ItemInfo = () => {
  const [items, setItems] = useState<ItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('全て');
  const [searchTerm, setSearchTerm] = useState('');

  const getItemImagePath = (category: string, name: string): string => {
    // Viteのbase設定により、開発環境・本番環境で自動的に/ddgame/が付加される
    return `/アイテム/${category}/${name}.png`;
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const img = e.target as HTMLImageElement;
    img.style.display = 'none';
  };

  const groupItemsById = (items: ItemData[]): GroupedItemData[] => {
    const grouped = new Map<string, ItemData[]>();
    
    // IDごとにグループ化
    items.forEach(item => {
      if (!grouped.has(item.id)) {
        grouped.set(item.id, []);
      }
      grouped.get(item.id)!.push(item);
    });

    // グループ化されたデータを変換
    const groupedItems: GroupedItemData[] = [];
    
    grouped.forEach((itemGroup) => {
      // ability_noでソート（空文字列は最後）
      const sortedGroup = itemGroup.sort((a, b) => {
        const aNum = a.ability_no ? parseInt(a.ability_no) || 0 : 999;
        const bNum = b.ability_no ? parseInt(b.ability_no) || 0 : 999;
        return aNum - bNum;
      });
      
      // 基本情報は最初のアイテムから取得
      const baseItem = sortedGroup[0];
      
      const groupedItem: GroupedItemData = {
        種類: baseItem.種類,
        id: baseItem.id,
        upgradesto_id1: baseItem.upgradesto_id1,
        upgradesto_id2: baseItem.upgradesto_id2,
        upgradesto_id3: baseItem.upgradesto_id3,
        upgradesfrom_id1: baseItem.upgradesfrom_id1,
        upgradesfrom_id2: baseItem.upgradesfrom_id2,
        価格: baseItem.価格,
        名称: baseItem.名称,
        ボーナス: baseItem.ボーナス,
        variants: sortedGroup.map(item => ({
          ability_no: item.ability_no,
          解説文: item.解説文,
          パッシブ: item.パッシブ,
          PCooldown: item.PCooldown,
          アクティブ: item.アクティブ,
          ACooldown: item.ACooldown,
          スペック1: item.スペック1,
          スペック2: item.スペック2,
          スペック3: item.スペック3,
          スペック4: item.スペック4,
        }))
      };
      
      groupedItems.push(groupedItem);
    });
    
    return groupedItems;
  };

  useEffect(() => {
    fetchItemData();
  }, []);

  const fetchItemData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/ddgame/api/item-info');
      if (!response.ok) {
        throw new Error('データの取得に失敗しました');
      }
      const data = await response.json();
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const groupedItems = groupItemsById(items);
  const categories = ['全て', ...Array.from(new Set(groupedItems.map(item => item.種類)))];

  const filteredItems = groupedItems.filter(item => {
    const matchesCategory = selectedCategory === '全て' || item.種類 === selectedCategory;
    const matchesSearch = item.名称.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.ボーナス.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.variants.some(variant => 
                           variant.解説文.toLowerCase().includes(searchTerm.toLowerCase())
                         );
    return matchesCategory && matchesSearch;
  });

  const formatPrice = (price: string) => {
    const numPrice = parseInt(price);
    return numPrice > 0 ? `${numPrice.toLocaleString()}ソウル` : '無料';
  };

  const getItemNameById = (id: string): string => {
    if (!id) return '';
    const item = groupedItems.find(item => item.id === id);
    return item ? item.名称 : '';
  };

  const renderSpecs = (variant: any) => {
    const specs = [variant.スペック1, variant.スペック2, variant.スペック3, variant.スペック4].filter(spec => spec);
    if (specs.length === 0) return null;
    
    return (
      <div className="item-specs">
        <strong>スペック:</strong>
        <ul>
          {specs.map((spec, index) => (
            <li key={index}>{spec}</li>
          ))}
        </ul>
      </div>
    );
  };

  const renderVariant = (variant: any, index: number) => {
    return (
      <div key={index} className="item-variant">
        {variant.解説文 && (
          <div className="description-text">{variant.解説文}</div>
        )}
        {(variant.パッシブ === 'TRUE' || variant.アクティブ === 'TRUE' || variant.PCooldown || variant.ACooldown) && (
          <div className="ability-info">
            {variant.パッシブ === 'TRUE' && (
              <span className="ability-tag passive">パッシブ</span>
            )}
            {variant.アクティブ === 'TRUE' && (
              <span className="ability-tag active">アクティブ</span>
            )}
            {variant.PCooldown && (
              <span className="cooldown">パッシブCD: {variant.PCooldown}s</span>
            )}
            {variant.ACooldown && (
              <span className="cooldown">アクティブCD: {variant.ACooldown}s</span>
            )}
          </div>
        )}
        {renderSpecs(variant)}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="item-info-container">
        <div className="loading">データを読み込み中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="item-info-container">
        <div className="error">エラー: {error}</div>
        <button onClick={fetchItemData} className="retry-button">再試行</button>
      </div>
    );
  }

  return (
    <div className="item-info-container">
      <h1>アイテム情報</h1>
      
      <div className="controls">
        <div className="search-container">
          <input
            type="text"
            placeholder="アイテム名で検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="category-filter">
          <label htmlFor="category-select">カテゴリ:</label>
          <select
            id="category-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="category-select"
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="items-count">
        {filteredItems.length} 個のアイテムが見つかりました
      </div>

      <div className="items-grid">
        {filteredItems.map((item) => (
          <div key={item.id} className="item-card">
            <div className="item-image-container">
              <img
                src={getItemImagePath(item.種類, item.名称)}
                alt={item.名称}
                className="item-image"
                onError={handleImageError}
              />
            </div>
            <div className="item-header">
              <h3 className="item-name">{item.名称}</h3>
              <span className={`item-category ${item.種類.toLowerCase()}`}>
                {item.種類}
              </span>
            </div>
            
            <div className="item-price">
              {formatPrice(item.価格)}
            </div>
            
            {item.ボーナス && (
              <div className="item-bonus">
                <strong>ボーナス効果:</strong>
                <div className="bonus-text">{item.ボーナス}</div>
              </div>
            )}
            
            <div className="item-variants">
              {item.variants.map((variant, index) => renderVariant(variant, index))}
            </div>
            
            {(item.upgradesfrom_id1 || item.upgradesfrom_id2) && (
              <div className="upgrade-from">
                <strong>アップグレード元:</strong>
                <div className="upgrade-list">
                  {item.upgradesfrom_id1 && (
                    <div className="upgrade-item">{getItemNameById(item.upgradesfrom_id1)}</div>
                  )}
                  {item.upgradesfrom_id2 && (
                    <div className="upgrade-item">{getItemNameById(item.upgradesfrom_id2)}</div>
                  )}
                </div>
              </div>
            )}
            
            {(item.upgradesto_id1 || item.upgradesto_id2 || item.upgradesto_id3) && (
              <div className="upgrade-targets">
                <strong>アップグレード先:</strong>
                <div className="upgrade-list">
                  {item.upgradesto_id1 && (
                    <div className="upgrade-item">{getItemNameById(item.upgradesto_id1)}</div>
                  )}
                  {item.upgradesto_id2 && (
                    <div className="upgrade-item">{getItemNameById(item.upgradesto_id2)}</div>
                  )}
                  {item.upgradesto_id3 && (
                    <div className="upgrade-item">{getItemNameById(item.upgradesto_id3)}</div>
                  )}
                </div>
              </div>
            )}
            
            <div className="item-details">
              <div className="item-id">ID: {item.id}</div>
            </div>
          </div>
        ))}
      </div>
      
      {filteredItems.length === 0 && !loading && (
        <div className="no-results">
          検索条件に一致するアイテムが見つかりません
        </div>
      )}
    </div>
  );
};

export default ItemInfo;