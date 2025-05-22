import { useEffect, useState } from 'react';
import { getAuthToken } from './lib/token/token';

import VideoDisplay from './components/VideoDisplay';
import WebcamStream from './WebcamStream';

function App(): React.JSX.Element {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    async function fetchToken() {
      try {
        const token = await getAuthToken("testuser");
        setToken(token);
      } catch (err) {
        console.error("Failed to fetch token:", err);
      }
    }
    fetchToken();
  }, []);

  if (!token) {
    return <div>Loading...</div>;
  }

  return (
    <div className='w-screen h-screen flex items-center justify-center bg-gray-100'>
      <VideoDisplay />
      <WebcamStream token={token} />
    </div>
  );
}

export default App;
