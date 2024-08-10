import '../App.css';
import { useEffect, useRef, useState } from 'react';
import React from 'react';
import DOMPurify from 'dompurify';
import sendBtn from '../assets/send.svg';
import ai from '../assets/bot.png';
import uicon from '../assets/uicon.png';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const ChatInterface = () => {
    
    const msgEnd = useRef(null);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(null);
    const [messages, setMessages] = useState([{text: 'Ask any questions on your repository!',isBot: true}]);

    useEffect(() => {
        if (msgEnd.current) {
            msgEnd.current.scrollIntoView();
        }
    }, [messages, loading]);

    const handleSend = async () => {
      const text = input;
      setInput('');
      setMessages([...messages, { text, isBot: false }])
      setLoading(true);
      const res = await fetch('http://127.0.0.1:5000/chat_with_repo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: input})
      });
  
      const data = await res.json();
  
      setMessages([...messages,
      {
        text,
        isBot: false
      },
      {
        text: data.answer,
        isBot: true
      }])
      setLoading(false);
    }

    const handleEnter = async (e) => {
        if (e.key === 'Enter') await handleSend();
    };

    const renderWithNewlinesAndHtml = (text) => {

        const sanitizedText = DOMPurify.sanitize(text);
      
        const urlRegex = /((http|https):\/\/[^\s/$.?#].[^\s]*)/gi;
        const emailRegex = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
        const specificRouteRegex = /\b(\/(api|home)\/[a-zA-Z0-9/_-]*)\b/gi;
        const wwwRegex = /\b(www\.[^\s/$.?#].[^\s]*)\b/gi;
      
        let textWithLinks = sanitizedText.replace(urlRegex, (url) => {
          return `<a href="${url}" style="color: #4848c4;" target="_blank" rel="noopener noreferrer">${url}</a>`;
        });
      
        textWithLinks = textWithLinks.replace(emailRegex, (email) => {
          return `<a href="mailto:${email}" style="color: #4848c4;">${email}</a>`;
        });
      
        textWithLinks = textWithLinks.replace(specificRouteRegex, (route) => {
          return `<a href="${route}" style="color: #4848c4;">${route}</a>`;
        });
      
        textWithLinks = textWithLinks.replace(wwwRegex, (www) => {
          return `<a href="http://${www}" style="color: #4848c4;" target="_blank" rel="noopener noreferrer">${www}</a>`;
        });
      
        const textWithNewlines = textWithLinks.split('\n').join('<br />');
      
        return <span dangerouslySetInnerHTML={{ __html: textWithNewlines }} />;
    };
         

    return (
        <div className="App">
            <div className='main'>
                <div className="chats">
                    {messages?.map((message, i) => {
                        if (message.isBot) {
                            return (
                                <div key={i} className="chat bot">
                                    <img src={ai} alt="" className="chatImg" />
                                    <div>
                                        <p className='txt'>{renderWithNewlinesAndHtml(message.text)}</p>
                                    </div>
                                </div>
                            );
                        } else {
                            return (
                                <div key={i} className="chat">
                                    <img src={uicon} alt="" className="chatImg" />
                                    <p className="txt">{renderWithNewlinesAndHtml(message.text)}</p>
                                </div>
                            );
                        }
                    })}
                    {loading && (
                        <div className="loading1">
                            <img src={ai} alt="" className="chatImg" />
                            <Skeleton
                                count={3}
                                enableAnimation="true"
                                borderRadius="0.3rem"
                                highlightColor='#100f13'
                                duration={1.5}
                                height="100%"
                                width="90%"
                                containerClassName="avatar-skeleton"
                            />
                        </div>
                    )}
                    <div ref={msgEnd} />
                </div>
                <div className="chatFooter">
                    <div className="inp">
                        <input type="text" placeholder='Enter your prompt!' value={input} onKeyDown={handleEnter} onChange={(e) => { setInput(e.target.value) }}/>
                        <button className="send" onClick={handleSend}><img src={sendBtn} alt="send" /></button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ChatInterface;