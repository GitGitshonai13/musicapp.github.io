import React, { useEffect, useState } from 'react';
import axios from 'axios';

const TopSong = () => {
  const [songs, setSongs] = useState([]);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [hoveredSongId, setHoveredSongId] = useState(null);
  const [selectedGenre, setSelectedGenre] = useState('すべて');
  const genres = ['すべて', '邦楽', '邦楽ロック', '邦楽ヒップホップ', 'アニメ', 'ボーカロイド', 'K-pop', '洋楽'];

  const fetchSongs = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/music', {
        params: { genre: selectedGenre === 'すべて' ? null : selectedGenre },
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
      });
      
      if (response.data.length === 0) {
        setError('選択したジャンルには音楽がありません');
      } else {
        let sortedSongs = response.data.sort((a, b) => b.play_count - a.play_count).slice(0, 30);
  
        while (sortedSongs.length < 30) {
          sortedSongs.push({
            id: `placeholder-${sortedSongs.length}`,
            music_name: 'No Data',
            artist_name: 'Unknown',
            play_count: 0,
            image_file_url: '',
          });
        }
        setSongs(sortedSongs);
      }
    } catch (error) {
      console.error('Error fetching music data:', error);
      setError('音楽データの取得に失敗しました');
    }
  };

  useEffect(() => {
    fetchSongs();
  }, [selectedGenre]);

  const handleNext = () => {
    setPage((prevPage) => (prevPage + 1) % 3);
  };

  const handlePrevious = () => {
    setPage((prevPage) => (prevPage - 1 + 3) % 3);
  };

  const handleSongClick = async (song) => {
    try {
      await axios.post('http://127.0.0.1:5000/history/add', {
        music_id: song.id,
      });
      window.location.reload();
    } catch (error) {
      console.error('Error adding song to history:', error);
      alert('履歴への追加に失敗しました');
    }
  };

  const handleAddToPlaylist = async (song) => {
    try {
      await axios.post('http://127.0.0.1:5000/playlist/add', {
        music_id: song.id,
      });
      alert('プレイリストに追加されました');
    } catch (error) {
      console.error('Error adding song to playlist:', error);
      alert('プレイリストへの追加に失敗しました');
    }
  };

  const displayedSongs = songs.slice(page * 10, page * 10 + 10);

  return (
    <div className="relative rounded-lg mx-20">
      {error && <p className="text-red-500 mb-4">{error}</p>}
      
      <div className="mb-10 flex flex-wrap gap-4">
        {genres.map((genre) => (
          <button
            key={genre}
            className={`rounded-3xl w-36 h-12 ${
              selectedGenre === genre
                ? 'bg-amber-300 border-2 border-white text-black'
                : 'bg-white border-2 border-amber-300 hover:bg-gray-100 text-gray-600'
            }`}
            onClick={() => setSelectedGenre(genre)}
          >
            {genre}
          </button>
        ))}
      </div>

      <button
        onClick={handlePrevious}
        className="absolute left-[-70px] w-12 h-12 mt-8 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-200 transition"
        style={{
          top: `${(displayedSongs.length / 10) * 100 / 2}%`, // 10要素分の高さの1/10の中央位置
        }}
      >
        <img src="public/images/move_right.jpeg" alt="Previous" className="w-6 h-6" />
      </button>

      <div className="grid grid-cols-2 gap-1 bg-gray-100">
        {displayedSongs.map((song, index) => {
          const imageUrl = song.image_file_url
            ? `http://127.0.0.1:5000/uploads/${song.image_file_url}`
            : 'https://via.placeholder.com/70';
          return (
            <div
              key={song.id}
              className="flex items-center space-x-4 bg-white p-2 rounded-lg shadow-sm transition transform cursor-pointer relative"
              onClick={() => handleSongClick(song)}
              onMouseEnter={() => setHoveredSongId(song.id)}
              onMouseLeave={() => setHoveredSongId(null)}
            >
              <span className="text-sm font-bold text-gray-800 w-4 text-center">{page * 10 + index + 1}</span>
              <img
                src={imageUrl}
                alt={song.music_name}
                className="w-16 h-16 object-cover rounded-md shadow-md"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/70';
                }}
              />
              <div className="flex-1">
                <p className="text-base font-semibold text-gray-900 mb-1 truncate">{song.music_name}</p>
                <p className="text-sm text-gray-600 mb-1 truncate">{song.artist_name}</p>
              </div>
              <div className="flex items-center justify-end space-x-2">
                {hoveredSongId === song.id && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToPlaylist(song); // Call the add to playlist function
                    }}
                  >
                    <img src="/public/images/download.png" className="w-5 h-5" alt="Download" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      
      <button
        onClick={handleNext}
        className="absolute right-[-70px] mt-8 w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-200 transition"
        style={{
          top: `${(displayedSongs.length / 10) * 100 / 2}%`, // 10要素分の高さの1/10の中央位置
        }}
      >
        <img src="public/images/move_left.jpeg" alt="Next" className="w-6 h-6" />
      </button>
    </div>
  );
};

export default TopSong;
