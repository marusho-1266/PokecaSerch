import React from 'react';

function CardDetail({ card, onClose }) {
  if (!card) return null;

  return (
    <div className="card-detail-overlay" onClick={onClose}>
      <div className="card-detail-modal" onClick={(e) => e.stopPropagation()}>
        <button className="card-detail-close" onClick={onClose}>×</button>
        
        <div className="card-detail-content">
          <div className="card-detail-image">
            {card.imageUrl ? (
              <img src={card.imageUrl} alt={card.name} />
            ) : (
              <div className="card-detail-image-placeholder">画像なし</div>
            )}
          </div>
          
          <div className="card-detail-info">
            <h2 className="card-detail-name">{card.fullName || card.name}</h2>
            <p className="card-detail-id">カードID: {card.cardId}</p>
            
            <div className="card-detail-section">
              <h3>基本情報</h3>
              <table className="card-detail-table">
                <tbody>
                  <tr>
                    <th>カテゴリ</th>
                    <td>{card.category}</td>
                  </tr>
                  {card.type && (
                    <tr>
                      <th>タイプ</th>
                      <td>{card.type}</td>
                    </tr>
                  )}
                  {card.hp !== undefined && card.hp !== null && (
                    <tr>
                      <th>HP</th>
                      <td>{card.hp}</td>
                    </tr>
                  )}
                  {card.evolutionStage && (
                    <tr>
                      <th>進化段階</th>
                      <td>{card.evolutionStage}</td>
                    </tr>
                  )}
                  {card.weakness && (
                    <tr>
                      <th>弱点</th>
                      <td>{card.weakness}</td>
                    </tr>
                  )}
                  {card.resistance && (
                    <tr>
                      <th>抵抗力</th>
                      <td>{card.resistance}</td>
                    </tr>
                  )}
                  {card.retreatCost !== undefined && card.retreatCost !== null && (
                    <tr>
                      <th>にげるコスト</th>
                      <td>{card.retreatCost}</td>
                    </tr>
                  )}
                  {card.setName && (
                    <tr>
                      <th>セット</th>
                      <td>{card.setName}</td>
                    </tr>
                  )}
                  {card.rarity && (
                    <tr>
                      <th>レアリティ</th>
                      <td>{card.rarity}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {card.waza && card.waza.length > 0 && (
              <div className="card-detail-section">
                <h3>ワザ</h3>
                {card.waza.map((waza, index) => (
                  <div key={index} className="card-detail-waza">
                    <h4>{waza.name}</h4>
                    {waza.energyCost && waza.energyCost.length > 0 && (
                      <div className="waza-energy">
                        必要エネルギー: {waza.energyCost.join(', ')}
                      </div>
                    )}
                    {waza.damage !== null && waza.damage !== undefined && (
                      <div className="waza-damage">ダメージ: {waza.damage}</div>
                    )}
                    {waza.effect && (
                      <div className="waza-effect">{waza.effect}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {card.detailUrl && (
              <div className="card-detail-actions">
                <a
                  href={card.detailUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                >
                  公式サイトで見る
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CardDetail;
