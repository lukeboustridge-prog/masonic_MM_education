import React, { useEffect, useState } from 'react';
import GameCanvas from './components/GameCanvas';

function App() {
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [rank, setRank] = useState<string | null>(null);
  const [initiationDate, setInitiationDate] = useState<string | null>(null);
  const [isGrandOfficer, setIsGrandOfficer] = useState<boolean | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const queryUserId = params.get('userId')?.trim();
    const queryName = params.get('name')?.trim();
    const queryRank = params.get('rank')?.trim();
    const queryInitiationDate = params.get('initiationDate')?.trim();
    const queryIsGrandOfficer = params.get('isGrandOfficer')?.trim();

    if (queryUserId) setUserId(queryUserId);
    if (queryName) setUserName(queryName);
    if (queryRank) setRank(queryRank);
    if (queryInitiationDate) setInitiationDate(queryInitiationDate);
    if (queryIsGrandOfficer) {
      const normalized = queryIsGrandOfficer.toLowerCase();
      setIsGrandOfficer(normalized === 'true' || normalized === '1' || normalized === 'yes');
    }
  }, []);

  return (
    <div className="w-screen h-screen overflow-hidden text-white selection:bg-[#c8a24a] selection:text-black">
      <GameCanvas
        userId={userId}
        userName={userName}
        rank={rank}
        initiationDate={initiationDate}
        isGrandOfficer={isGrandOfficer}
      />
    </div>
  );
}

export default App;
