import React, { useState, useEffect, useRef } from 'react';
import { useCars } from '../hooks/useCars';
import { createChatSession } from '../services/geminiService';
import type { Chat } from '@google/genai';
import { ChatBubbleIcon, XIcon, SendIcon, CarIcon } from './IconComponents';

interface Message {
    role: 'user' | 'model';
    text: string;
}

const GeminiChat: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [chat, setChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const { cars, loading: carsLoading } = useCars();
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const initialMessageSent = useRef(false);

    useEffect(() => {
        if (!carsLoading && cars.length > 0 && !chat) {
            try {
                const session = createChatSession(cars);
                setChat(session);
            } catch (error) {
                console.error("Error creating chat session:", error);
                setMessages([{ role: 'model', text: 'Sorry, the AI assistant is currently unavailable.' }]);
            }
        }
    }, [carsLoading, cars, chat]);

    useEffect(() => {
        if (isOpen && chat && !initialMessageSent.current) {
            initialMessageSent.current = true;
            setIsLoading(true);
            setMessages([{ role: 'model', text: '' }]);
            
            const welcomeMessage = "Hello! I'm AutoBot, your AI assistant. How can I help you find the perfect car today? You can ask me about our cars or for recommendations.";
            let currentText = '';
            
            const interval = setInterval(() => {
                currentText = welcomeMessage.substring(0, currentText.length + 1);
                setMessages([{ role: 'model', text: currentText }]);
                if (currentText.length === welcomeMessage.length) {
                    clearInterval(interval);
                    setIsLoading(false);
                }
            }, 20);

            return () => clearInterval(interval);
        }
    }, [isOpen, chat]);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputValue.trim() || isLoading || !chat) return;

        const userMessage: Message = { role: 'user', text: inputValue };
        setMessages(prev => [...prev, userMessage, { role: 'model', text: '' }]);
        setInputValue('');
        setIsLoading(true);

        try {
            const result = await chat.sendMessageStream({ message: userMessage.text });
            for await (const chunk of result) {
                const chunkText = chunk.text;
                setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1].text += chunkText;
                    return newMessages;
                });
            }
        } catch (error) {
            console.error("Error sending message to Gemini:", error);
            setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1].text = "Sorry, I encountered an error. Please try again.";
                return newMessages;
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 bg-accent text-accent-foreground rounded-full p-4 shadow-lg hover:bg-accent/90 transition-transform duration-200 hover:scale-110 z-50"
                aria-label="Toggle AI Assistant"
            >
                {isOpen ? <XIcon className="h-8 w-8" /> : <ChatBubbleIcon className="h-8 w-8" />}
            </button>

            {isOpen && (
                <div className="fixed bottom-24 right-6 w-[90vw] max-w-sm h-[70vh] max-h-[600px] bg-card border border-border rounded-xl shadow-2xl flex flex-col z-50 overflow-hidden">
                    <header className="flex items-center justify-between p-4 border-b border-border">
                        <div className="flex items-center gap-2">
                            <CarIcon className="h-6 w-6 text-accent" />
                            <h2 className="text-lg font-bold text-card-foreground">AutoBot Assistant</h2>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
                            <XIcon className="h-5 w-5" />
                        </button>
                    </header>
                    <div ref={chatContainerRef} className="flex-grow p-4 overflow-y-auto">
                        <div className="space-y-4">
                            {messages.map((msg, index) => (
                                <div key={index} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                                    {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0"><CarIcon className="w-5 h-5 text-accent"/></div>}
                                    <div className={`max-w-[80%] p-3 rounded-2xl ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-secondary text-secondary-foreground rounded-bl-none'}`}>
                                        <p className="text-sm" dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br />') }}></p>
                                    </div>
                                </div>
                            ))}
                             {isLoading && messages.length > 0 && messages[messages.length - 1]?.role === 'user' && (
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0"><CarIcon className="w-5 h-5 text-accent"/></div>
                                    <div className="max-w-[80%] p-3 rounded-2xl bg-secondary text-secondary-foreground rounded-bl-none">
                                        <div className="flex items-center gap-1.5">
                                            <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                            <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                            <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce"></span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <footer className="p-4 border-t border-border">
                        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder={chat ? "Ask about our cars..." : "Connecting to assistant..."}
                                className="flex-grow bg-background border border-input rounded-full py-2 px-4 text-sm focus:ring-ring focus:border-ring"
                                disabled={isLoading || !chat}
                            />
                            <button type="submit" className="bg-accent text-accent-foreground rounded-full p-2.5 disabled:bg-muted" disabled={isLoading || !chat || !inputValue.trim()}>
                                <SendIcon className="h-5 w-5" />
                            </button>
                        </form>
                    </footer>
                </div>
            )}
        </>
    );
};

export default GeminiChat;