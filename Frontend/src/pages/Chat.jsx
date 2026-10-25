import { useEffect, useRef, useState } from "react";
import { api } from "../api";

function speak(text) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.95;
  window.speechSynthesis.speak(utterance);
}

export default function Chat() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "Namaste! Ask about watering, fertilizer, pests, soil, or weather. You can also use the mic.",
    },
  ]);
  const [listening, setListening] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (text) => {
    const message = text.trim();
    if (!message) return;

    setBusy(true);
    setError("");
    setMessages((prev) => [...prev, { role: "user", text: message }]);
    setInput("");

    try {
      const data = await api.chat(message);
      setMessages((prev) => [...prev, { role: "bot", text: data.reply }]);
      speak(data.reply);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    send(input);
  };

  const toggleVoice = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError("Voice not supported in this browser. Try Chrome.");
      return;
    }

    if (listening && recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognitionRef.current = recognition;

    recognition.onstart = () => setListening(true);
    recognition.onerror = () => {
      setListening(false);
      setError("Could not hear you. Try again.");
    };
    recognition.onend = () => setListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      send(transcript);
    };

    recognition.start();
  };

  return (
    <section className="panel chat-panel">
      <div className="chat-header">
        <div>
          <h1>Farming chatbot</h1>
          <p className="muted">Type or speak — replies are read aloud.</p>
        </div>
        <button
          type="button"
          className={`btn ${listening ? "danger" : "ghost"}`}
          onClick={toggleVoice}
        >
          {listening ? "Stop mic" : "Speak"}
        </button>
      </div>

      <div className="chat-log">
        {messages.map((msg, index) => (
          <div key={index} className={`bubble ${msg.role}`}>
            {msg.text}
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {error && <p className="error">{error}</p>}

      <form className="chat-form" onSubmit={onSubmit}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a farming question..."
          disabled={busy}
        />
        <button className="btn primary" type="submit" disabled={busy}>
          Send
        </button>
      </form>
    </section>
  );
}
