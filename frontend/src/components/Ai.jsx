import React, { useContext, useEffect, useRef, useState } from 'react';
import robot from '../assets/airobot.gif';
import { X, MessageCircle, Send, Mic, MicOff } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { authDataContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function Ai() {
  const { serverUrl } = useContext(authDataContext);
  const navigate = useNavigate();

  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);

  const chatRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognitionRef.current = recognition;
  }, []);

  const speak = (text) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const sendMessage = async (message) => {
    if (!message.trim()) return;

    const userMessage = {
      sender: 'user',
      text: message,
    };

    setMessages((prev) => [...prev, userMessage]);

    try {
      setLoading(true);

      const response = await axios.post(
        `${serverUrl}/api/ai/chat`,
        { message },
        { withCredentials: true }
      );

      const data = response.data;

      if (data.type === 'navigate') {
        navigate(data.route);
        setLoading(false);
      }

      const reply = data.message || 'Sorry, I did not understand';

      const aiMessage = {
        sender: 'ai',
        text: reply,
      };

      setMessages((prev) => [...prev, aiMessage]);

      speak(reply);
    } catch (error) {
      console.log(error);
      toast.error('AI request failed');
    } finally {
      setLoading(false);
    }
  };

  const startListening = async () => {
    const recognition = recognitionRef.current;

    if (!recognition) {
      toast.error('Speech Recognition not supported');
      return;
    }

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });

      setListening(true);
      recognition.start();

      recognition.onresult = (event) => {
        const text = event.results[0][0].transcript;
        setInput(text);
        sendMessage(text);
      };

      recognition.onerror = () => {
        toast.error('Voice Error');
        setListening(false);
      };

      recognition.onend = () => {
        setListening(false);
      };
    } catch (error) {
      toast.error('Allow microphone access');
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div
        className="relative cursor-pointer"
        onClick={() => setShowChat(!showChat)}
      >
        <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
          <MessageCircle size={11} />
        </div>

        <img
          src={robot}
          alt="robot"
          className="w-20 h-20 hover:scale-105 transition-all"
        />
      </div>

      {showChat && (
        <div className="absolute bottom-24 right-0 w-[350px] h-[520px] bg-white dark:bg-[#111827] rounded-3xl shadow-2xl flex flex-col">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-4 flex justify-between">
            <div className="flex items-center gap-3">
              <img
                src={robot}
                className="w-10 h-10 bg-white p-1 rounded-full"
              />
              <div>
                <h2 className="text-sm font-semibold">RIVETO AI</h2>
                <p className="text-xs text-blue-100">Online</p>
              </div>
            </div>

            <button onClick={() => setShowChat(false)}>
              <X size={18} />
            </button>
          </div>

          <div
            ref={chatRef}
            className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-[#0F172A]"
          >
            {messages.length === 0 && (
              <div className="text-center text-gray-500 mt-20">
                <img src={robot} className="w-20 mx-auto mb-3" />
                <p>Hello 👋 Ask me anything</p>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`px-4 py-2 rounded-2xl text-sm max-w-[80%] ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-gray-800 dark:text-white'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="text-gray-500 text-sm">Thinking...</div>
            )}
          </div>

          <div className="p-3 border-t flex gap-2 items-center">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  sendMessage(input);
                  setInput('');
                }
              }}
              className="flex-1 p-2 rounded-full bg-gray-100 dark:bg-gray-800 outline-none"
              placeholder="Type message..."
            />

            <button onClick={startListening}>
              {listening ? <MicOff /> : <Mic />}
            </button>

            <button
              onClick={() => {
                sendMessage(input);
                setInput('');
              }}
              className="bg-blue-600 text-white p-2 rounded-full"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Ai;
