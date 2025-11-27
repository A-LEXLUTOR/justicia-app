import React, { useState, useRef, useEffect } from 'react';
import { SendIcon, PaperclipIcon, MicrophoneIcon } from '../constants';
import { startRecognition, stopRecognition } from '../services/speechService';

interface ChatInputProps {
    onSubmit: (content: string) => void;
    isLoading: boolean;
    onUploadClick: () => void;
    hasStartedChat: boolean;
    isMobile?: boolean;
    onShowVoiceChat?: () => void;
    onShowTemplates?: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSubmit, isLoading, onUploadClick, hasStartedChat, isMobile = false, onShowVoiceChat, onShowTemplates }) => {
    const [content, setContent] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [transcriptionError, setTranscriptionError] = useState<string | null>(null);
    const [showMenu, setShowMenu] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    // Fermer le menu si on clique en dehors
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            const scrollHeight = textareaRef.current.scrollHeight;
            const maxHeight = isMobile ? 180 : 240;
            textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
        }
    }, [content, isMobile]);
    
    const doSubmit = () => {
        if (content.trim() && !isLoading) {
            onSubmit(content);
            setContent('');
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        doSubmit();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            doSubmit();
        }
    };

    const handleMicClick = () => {
        if (isRecording) {
            stopRecognition();
            setIsRecording(false);
            setTranscriptionError(null);
        } else {
            setTranscriptionError(null);
            startRecognition(
                (transcript) => {
                    // Ajouter le transcript au contenu existant
                    setContent(prev => prev ? prev + ' ' + transcript : transcript);
                    console.log('Transcript reçu:', transcript);
                },
                () => {
                    // Fin de la reconnaissance
                    setIsRecording(false);
                    console.log('Reconnaissance terminée');
                },
                (error) => {
                    // Erreur de reconnaissance
                    setIsRecording(false);
                    setTranscriptionError(error);
                    console.error('Erreur de reconnaissance:', error);
                    
                    // Afficher l'erreur pendant 3 secondes
                    setTimeout(() => setTranscriptionError(null), 3000);
                }
            );
            setIsRecording(true);
        }
    };

    const canSubmit = content.trim() && !isLoading;
    const placeholderText = isLoading 
        ? "Analyse en cours..." 
        : hasStartedChat 
            ? "Posez une question de suivi..."
            : "Posez une question ou uploadez un document...";

    return (
        <form onSubmit={handleSubmit} className="w-full">
            <div className="flex items-end gap-3 bg-gradient-to-r from-purple-900/30 via-purple-800/20 to-blue-900/30 border border-purple-500/30 rounded-2xl p-3 shadow-lg shadow-purple-500/10 backdrop-blur-sm">
                {/* Left icons */}
                <div className="flex items-center gap-2 pb-1 relative" ref={menuRef}>
                    {/* Bouton + avec menu */}
                    <button
                        type="button"
                        onClick={() => setShowMenu(!showMenu)}
                        className="p-2.5 rounded-xl bg-gray-700/50 text-gray-400 hover:bg-gray-700 hover:text-purple-400 transition-all"
                        aria-label="Plus d'options"
                        title="Plus d'options"
                        disabled={isLoading}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    </button>

                    {/* Menu déroulant */}
                    {showMenu && (
                        <div className="absolute bottom-full left-0 mb-2 w-64 bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl z-50 overflow-hidden">
                            {onShowTemplates && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        onShowTemplates();
                                        setShowMenu(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-left text-white hover:bg-neutral-800 transition"
                                >
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                    <div>
                                        <div className="text-sm font-medium">Créer un document</div>
                                        <div className="text-xs text-gray-500">Générer avec l'IA</div>
                                    </div>
                                </button>
                            )}
                            {onShowVoiceChat && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        onShowVoiceChat();
                                        setShowMenu(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-left text-white hover:bg-neutral-800 transition"
                                >
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                    </svg>
                                    <div>
                                        <div className="text-sm font-medium">Chat Vocal</div>
                                        <div className="text-xs text-gray-500">Conversation vocale avec l'IA</div>
                                    </div>
                                </button>
                            )}
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={handleMicClick}
                        className={`p-2.5 rounded-xl transition-all ${
                            isRecording 
                                ? 'bg-purple-500/20 text-purple-400 animate-pulse' 
                                : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700 hover:text-purple-400'
                        }`}
                        aria-label={isRecording ? 'Arrêter l\'enregistrement' : 'Commencer l\'enregistrement vocal'}
                        title={isRecording ? 'Arrêter l\'enregistrement' : 'Enregistrement vocal'}
                        disabled={isLoading}
                    >
                        <MicrophoneIcon className="w-5 h-5" />
                    </button>
                    <button
                        type="button"
                        onClick={onUploadClick}
                        className="p-2.5 rounded-xl bg-gray-700/50 text-gray-400 hover:bg-gray-700 hover:text-purple-400 transition-all"
                        aria-label="Joindre un fichier"
                        title="Joindre un fichier"
                        disabled={isLoading}
                    >
                        <PaperclipIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Textarea */}
                <textarea
                    ref={textareaRef}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholderText}
                    className="flex-1 bg-transparent text-gray-100 placeholder-gray-500 border-0 outline-none resize-none text-base leading-relaxed px-2 py-2 max-h-60"
                    rows={1}
                    disabled={isLoading}
                />

                {/* Send button */}
                <button
                    type="submit"
                    disabled={!canSubmit}
                    className={`flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 transform active:scale-95 ${
                        canSubmit 
                            ? 'bg-gradient-to-br from-purple-500 to-blue-500 text-white hover:shadow-lg hover:shadow-purple-500/30 hover:scale-105' 
                            : 'bg-gray-700/50 text-gray-600 cursor-not-allowed'
                    }`}
                    aria-label="Envoyer le message"
                    title="Envoyer (Entrée)"
                >
                    <SendIcon />
                </button>
            </div>
            
            {/* Indicateur de transcription */}
            {isRecording && (
                <div className="flex items-center justify-center gap-2 mt-2 text-purple-400 text-sm">
                    <div className="flex gap-1">
                        <div className="w-1 h-4 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-1 h-4 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-1 h-4 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    <span>Écoute en cours... Parlez maintenant</span>
                </div>
            )}
            
            {/* Message d'erreur */}
            {transcriptionError && (
                <div className="flex items-center justify-center gap-2 mt-2 text-red-400 text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{transcriptionError}</span>
                </div>
            )}
            
            {/* Hint text */}
            {!isRecording && !transcriptionError && (
                <p className="text-xs text-gray-500 mt-2 text-center">
                    Appuyez sur <kbd className="px-1.5 py-0.5 bg-gray-800 border border-gray-700 rounded text-gray-400">Entrée</kbd> pour envoyer, <kbd className="px-1.5 py-0.5 bg-gray-800 border border-gray-700 rounded text-gray-400">Maj + Entrée</kbd> pour une nouvelle ligne
                </p>
            )}
        </form>
    );
};

export default ChatInput;
