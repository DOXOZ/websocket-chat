import { useState, useEffect, useRef } from 'react';

function App() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [websocket, setWebsocket] = useState(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    // Connect to WebSocket server
    const ws = new WebSocket('ws://localhost:3000');
    
    ws.onopen = () => {
      console.log('Connected to WebSocket server');
    };
    
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      
      if (message.type === 'history') {
        // Handle history messages
        setMessages(message.data);
      } else if (message.type === 'message') {
        // Handle new messages
        setMessages(prev => [...prev, { data: message.data }]);
      }
    };
    
    ws.onclose = () => {
      console.log('Disconnected from WebSocket server');
    };
    
    setWebsocket(ws);
    
    // Clean up WebSocket on component unmount
    return () => {
      ws.close();
    };
  }, []);
  
  useEffect(() => {
    // Scroll to bottom when messages change
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);
  
  const handleSendMessage = () => {
    if (!inputMessage.trim() || !websocket) return;
    
    const messageObj = {
      type: 'message',
      data: inputMessage
    };
    
    websocket.send(JSON.stringify(messageObj));
    setInputMessage('');
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 p-4 max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold text-center mb-4">WebSocket Chat</h1>
      
      {/* Chat container */}
      <div 
        ref={chatContainerRef}
        className="flex-1 bg-white rounded-lg border border-gray-300 p-4 mb-4 overflow-y-auto"
        style={{ minHeight: '600px' }}
      >
        <div className="flex flex-col space-y-3">
          {messages.map((msg, index) => (
            <div key={index} className="inline-block bg-blue-500 text-white px-4 py-2 rounded-lg self-start max-w-[80%]">
              {msg.data}
            </div>
          ))}
        </div>
      </div>
      
      {/* Input area */}
      <div className="flex gap-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Введите сообщение"
          className="flex-1 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSendMessage}
          className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-lg transition-colors"
        >
          Отправить
        </button>
      </div>
    </div>
  );
}

export default App;
