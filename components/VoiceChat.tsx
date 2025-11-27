import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Phone, PhoneOff } from 'lucide-react';
import { OpenAIRealtimeService } from '../services/openai-realtime.service';

interface VoiceChatProps {
  onClose: () => void;
  context?: string; // Contexte du document pour l'IA
}

const VoiceChat: React.FC<VoiceChatProps> = ({ onClose, context }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const realtimeServiceRef = useRef<OpenAIRealtimeService | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  // Initialiser le service Realtime
  useEffect(() => {
    const initService = async () => {
      try {
        const apiKey = import.meta.env.VITE_OPENAI_API_KEY || ''; // Clé API OpenAI depuis variables d'environnement
        
        // Enrichir le contexte avec la base de connaissances RAG
        let enrichedContext = context || '';
        try {
          const { getRAGStats } = await import('../services/ragService.enhanced');
          const stats = await getRAGStats();
          
          if (stats.documentCount > 0) {
            enrichedContext += `\n\n=== BASE DE CONNAISSANCES ===\nVous avez accès à ${stats.documentCount} document(s) dans la base de connaissances avec ${stats.totalChunks} sections indexées.\nLorsque l'utilisateur pose une question, vous pouvez faire référence à tous les documents de la base.`;
            console.log('[VoiceChat] Base de connaissances ajoutée au contexte:', stats);
          }
        } catch (ragError) {
          console.warn('[VoiceChat] Impossible de charger les stats RAG:', ragError);
        }
        
        const instructions = enrichedContext 
          ? `Vous êtes JUSTICIA, un assistant juridique expert spécialisé dans l'analyse de documents juridiques.

=== CONTEXTE DU DOCUMENT ===
${enrichedContext}

=== VOS CAPACITÉS ===
Vous avez accès à l'intégralité du document et de son analyse. Vous pouvez:
- Répondre à des questions précises sur le contenu du document
- Expliquer les signalements détectés et leur gravité
- Détailler les risques identifiés et leurs implications
- Clarifier les clauses complexes en langage simple
- Proposer des reformulations pour les clauses problématiques
- Donner des recommandations juridiques basées sur l'analyse
- Comparer différentes sections du document
- Répondre sur les statistiques et la structure du document
- Rechercher sur internet des informations juridiques complémentaires si nécessaire
- Consulter la base de connaissances RAG pour des références légales

=== INSTRUCTIONS ===
1. Répondez en français de manière claire et professionnelle
2. Citez toujours les clauses spécifiques quand vous référencez le document
3. Soyez précis et factuel, basé sur l'analyse fournie
4. Si l'utilisateur pose une question sur un élément non présent dans le contexte, indiquez-le clairement
5. Utilisez un ton accessible tout en restant expert
6. Précisez le niveau de sévérité quand vous parlez des risques

Aidez l'utilisateur à comprendre et analyser ce document juridique de manière approfondie.`
          : 'Vous êtes JUSTICIA, un assistant juridique expert qui aide à analyser des documents juridiques. Répondez en français de manière claire et professionnelle.';
        
        const service = new OpenAIRealtimeService({
          apiKey,
          voice: 'alloy',
          instructions
        });

        // Gérer les événements
        service.on('response.audio.delta', (data) => {
          if (data.delta) {
            service.playAudio(data.delta);
            setIsSpeaking(true);
          }
        });

        service.on('response.audio.done', () => {
          setIsSpeaking(false);
        });

        service.on('conversation.item.input_audio_transcription.completed', (data) => {
          if (data.transcript) {
            setTranscript(prev => [...prev, `👤 Vous: ${data.transcript}`]);
          }
        });

        service.on('response.text.delta', (data) => {
          if (data.delta) {
            setTranscript(prev => {
              const last = prev[prev.length - 1];
              if (last && last.startsWith('🤖 IA:')) {
                return [...prev.slice(0, -1), last + data.delta];
              }
              return [...prev, `🤖 IA: ${data.delta}`];
            });
          }
        });

        service.on('response.text.done', () => {
          // Réponse complète de l'IA terminée
          console.log('[VoiceChat] Réponse de l\'IA terminée');
        });

        service.on('response.done', (data) => {
          // Toute la réponse (audio + texte) est terminée
          console.log('[VoiceChat] Réponse complète terminée');
          setIsSpeaking(false);
        });

        service.on('error', (data) => {
          console.error('Erreur Realtime:', data);
          setError(data.error?.message || 'Une erreur est survenue');
        });

        await service.connect();
        realtimeServiceRef.current = service;
        setIsConnected(true);
        setTranscript(['✅ Connecté à l\'assistant vocal']);
        
      } catch (err) {
        console.error('Erreur d\'initialisation:', err);
        setError('Impossible de se connecter au service vocal');
      }
    };

    initService();

    return () => {
      if (realtimeServiceRef.current) {
        realtimeServiceRef.current.disconnect();
      }
    };
  }, [context]);

  // Auto-scroll vers le bas
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  // Démarrer/arrêter l'enregistrement
  const toggleRecording = async () => {
    if (!realtimeServiceRef.current) return;

    try {
      if (isRecording) {
        realtimeServiceRef.current.stopAudioCapture();
        setIsRecording(false);
        setTranscript(prev => [...prev, '🎤 Microphone désactivé']);
      } else {
        await realtimeServiceRef.current.startAudioCapture();
        setIsRecording(true);
        setTranscript(prev => [...prev, '🎤 Microphone activé - Parlez maintenant']);
      }
    } catch (err) {
      console.error('Erreur microphone:', err);
      setError('Impossible d\'accéder au microphone');
    }
  };

  // Raccrocher
  const hangUp = () => {
    if (realtimeServiceRef.current) {
      realtimeServiceRef.current.disconnect();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99999]">
      <div className="bg-neutral-900 rounded-xl shadow-2xl w-[600px] h-[700px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-700">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
            <h2 className="text-xl font-bold text-white">
              {isConnected ? 'Conversation Vocale Active' : 'Connexion...'}
            </h2>
          </div>
          <button
            onClick={hangUp}
            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <PhoneOff size={24} />
          </button>
        </div>

        {/* Transcript */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {transcript.map((line, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg ${
                line.startsWith('👤')
                  ? 'bg-blue-900/30 text-blue-200 ml-8'
                  : line.startsWith('🤖')
                  ? 'bg-purple-900/30 text-purple-200 mr-8'
                  : 'bg-neutral-800 text-gray-300 text-center text-sm'
              }`}
            >
              {line}
            </div>
          ))}
          <div ref={transcriptEndRef} />
        </div>

        {/* Error */}
        {error && (
          <div className="mx-6 mb-4 p-3 bg-red-900/30 border border-red-500 rounded-lg text-red-200 text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Controls */}
        <div className="p-6 border-t border-neutral-700">
          <div className="flex items-center justify-center gap-6">
            {/* Microphone */}
            <button
              onClick={toggleRecording}
              disabled={!isConnected}
              className={`p-6 rounded-full transition-all ${
                isRecording
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                  : 'bg-blue-500 hover:bg-blue-600'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isRecording ? <MicOff size={32} className="text-white" /> : <Mic size={32} className="text-white" />}
            </button>

            {/* Speaker indicator */}
            <div className={`p-6 rounded-full ${isSpeaking ? 'bg-purple-500 animate-pulse' : 'bg-gray-600'}`}>
              {isSpeaking ? <Volume2 size={32} className="text-white" /> : <VolumeX size={32} className="text-gray-400" />}
            </div>

            {/* Hang up */}
            <button
              onClick={hangUp}
              className="p-6 rounded-full bg-red-500 hover:bg-red-600 transition-colors"
            >
              <Phone size={32} className="text-white transform rotate-135" />
            </button>
          </div>

          <div className="mt-4 text-center text-sm text-gray-400">
            {isRecording ? (
              <span className="text-red-400">● En écoute - Parlez maintenant</span>
            ) : (
              <span>Cliquez sur le microphone pour parler</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceChat;

