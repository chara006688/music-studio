import { useNavigate } from 'react-router-dom';
import './Home.css';

function Home() {
  const navigate = useNavigate();

  const features = [
    {
      id: 'drum-kit',
      title: '🥁 虚拟鼓组',
      description: '使用键盘或节拍器演奏专业鼓组。支持多种鼓声、录音导出和回放功能。',
      route: '/drum-kit',
      color: '#ff6b9d'
    },
    {
      id: 'visualizer',
      title: '🎵 蒸汽波可视化',
      description: 'Lo-Fi音乐可视化播放器。多种视觉风格、动态光效，Windows 96复古界面。',
      route: '/visualizer',
      color: '#00d4ff'
    },
    {
      id: 'effects',
      title: '🎚️ 音频效果器',
      description: '专业音频处理工具。均衡器、混响、延迟、失真、滤波器等多种效果。',
      route: '/effects',
      color: '#00ff9d'
    },
    {
      id: 'piano',
      title: '🎹 虚拟钢琴',
      description: '完整88键钢琴键盘。多种音色、ADSR包络控制，支持键盘快捷键演奏。',
      route: '/piano',
      color: '#ffd700'
    }
  ];

  return (
    <div className="home-container">
      <header className="home-header">
        <h1 className="home-title">🎹 Retro Music Studio</h1>
        <p className="home-subtitle">复古音乐工作站 - 尽享音乐创作的乐趣</p>
      </header>

      <div className="cards-container">
        {features.map((feature) => (
          <div
            key={feature.id}
            className="feature-card"
            onClick={() => navigate(feature.route)}
            style={{ borderColor: feature.color }}
          >
            <div className="card-inner">
              <h2 className="card-title">{feature.title}</h2>
              <p className="card-description">{feature.description}</p>
              <button 
                className="card-button"
                style={{ backgroundColor: feature.color }}
              >
                启动应用
              </button>
            </div>
          </div>
        ))}
      </div>

      <footer className="home-footer">
        <p>Made with ❤️ using React + Vite</p>
      </footer>
    </div>
  );
}

export default Home;
