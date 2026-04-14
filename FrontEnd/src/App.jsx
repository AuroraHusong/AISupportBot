import { useState, useRef, useEffect } from "react";
import "./App.css";
import aiAvatar from "../src/assets/AIbot.png";
export default function App() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! I'm Sara, TechLife's virtual assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    if (!input.trim() || loading) return;

    const userMessage = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, something went wrong. Please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  async function resetChat() {
    await fetch("http://127.0.0.1:5000/reset", { method: "POST" });
    setMessages([{ role: "assistant", content: "Hi! I'm Sara, TechLife's virtual assistant. How can I help you today?" }]);
  }

  function handleEnterKey(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="app">
      <div className="chat-container">
        <div className="chat-header">
          <div className="header-left">
            <img src={aiAvatar} alt="AI Assistant" className="avatar" />
            <div>
              <h1>Sara</h1>
              <span className="status">TechLife Support</span>
            </div>
          </div>
          <button className="reset-btn" onClick={resetChat}>New chat</button>
        </div>

        <div className="messages">
          {messages.map((msg, i) => (
            <div key={i} className={`message ${msg.role}`}>
              {msg.role === "assistant" && <img src={aiAvatar} alt="AI Assistant" className="msg-avatar" />}
              <div className="bubble">{msg.content}</div>
            </div>
          ))}
          {loading && (
            <div className="message assistant">
              <img src={aiAvatar} alt="AI Assistant" className="msg-avatar" />
              <div className="bubble typing">
                <span/><span/><span/>
              </div>
            </div>
          )}
          <div ref={bottomRef}/>
        </div>

        <div className="input-area">
          <textarea
            rows="1"
            placeholder="Type a message..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleEnterKey}
          />
          <button onClick={sendMessage} disabled={loading || !input.trim()}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}