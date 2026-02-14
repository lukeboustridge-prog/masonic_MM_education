import React from 'react';
import GameCanvas from './components/GameCanvas';
import { useUser } from '@shared/auth';

function App() {
  const user = useUser();

  return (
    <div className="w-full h-full overflow-hidden text-white selection:bg-[#c8a24a] selection:text-black">
      <GameCanvas
        userId={user.userId}
        userName={user.name}
        rank={user.rank}
        initiationDate={user.initiationDate}
        isGrandOfficer={user.isGrandOfficer}
      />
    </div>
  );
}

export default App;
