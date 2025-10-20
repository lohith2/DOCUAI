import React, { useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperclip } from '@fortawesome/free-solid-svg-icons';
import './ChatBot.css';

const ChatBot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [file, setFile] = useState(null); 
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(true); 

  const sendMessage = async (event) => {
    event.preventDefault();

    if (input.trim() === '' || !file) return;

    const userMessage = { id: Date.now(), text: input, isUser: true, fileName: file.name };
    setMessages([...messages, userMessage]);
    setInput('');

    setLoading(true);

    try {
      const formData = new FormData();

      if (file) {
        formData.append('file', file);
        setFile(null);
      }

      formData.append('question', input);
      formData.append('bucket', 'sahil32107');

      const response = await axios.post('http://54.148.243.22:3000/process', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const responseData = JSON.parse(response.data.body);

      const botMessage = {
        id: Date.now() + 1,
        text: responseData.answer || 'No answer found.',
        isUser: false,
      };

      setMessages((prevMessages) => [...prevMessages, botMessage]);

    } catch (error) {
      console.error('Error uploading file or fetching response:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: 'Error occurred. Please try again.',
        isUser: false,
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    }

    setInput('');
    setLoading(false);
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const closePopup = () => {
    setShowPopup(false); 
  };

  return (
    <div className="chatbot-container">
      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            <h2>Welcome to Docu AI!</h2>
            <p>This bot can help you analyze your documents. Just upload a PDF and ask your question!</p>
            <button className="close-popup-button" onClick={closePopup}>Close</button>
          </div>
        </div>
      )}
      <div className="chat-header">
        <h1>Docu AI</h1>
      </div>
      <div className="chat-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.isUser ? 'user-message' : 'bot-message'}`}>
            {msg.isUser && msg.fileName && (
              <div className="file-quote">
                <span className="file-quote-text">File: {msg.fileName}</span>
              </div>
            )}
            <p>{msg.text}</p>
          </div>
        ))}
        {loading && (
          <div className="typing-indicator">
            <div className="typing-dots">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}
      </div>
      <form className="chat-input-area" onSubmit={sendMessage}>
        <label htmlFor="file-upload" className="file-upload-label">
          <FontAwesomeIcon icon={faPaperclip} size="lg" />
          <span className="file-name">{file ? file.name : ''}</span>
        </label>
        <input
          type="file"
          id="file-upload"
          accept=".pdf,.doc,.docx"
          onChange={handleFileChange}
          className="file-input"
        />
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter your question..."
          className="text-input"
          autoComplete="off"
        />
        <button
          type="submit"
          className={`send-button ${input.trim() === '' || !file ? 'disabled' : ''}`}
          disabled={input.trim() === '' || !file}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatBot;
