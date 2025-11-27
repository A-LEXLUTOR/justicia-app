/**
 * Service de synthèse vocale utilisant l'API OpenAI TTS
 * Remplace la voix robotique par une voix naturelle
 */

// L'API TTS est maintenant gérée par le backend local
const TTS_ENDPOINT = '/api/tts';

export type TTSVoice = 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';

let currentAudio: HTMLAudioElement | null = null;

/**
 * Convertit du texte en parole avec une voix naturelle OpenAI
 */
export async function speakTextWithOpenAI(
  text: string,
  onEnd?: () => void,
  voice: TTSVoice = 'nova'
): Promise<void> {
  try {
    // Arrêter l'audio en cours
    if (currentAudio) {
      currentAudio.pause();
      currentAudio = null;
    }

    // Appeler l'API TTS locale (qui fait le proxy vers OpenAI)
    const response = await fetch(TTS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: text,
        voice: voice
      })
    });

    if (!response.ok) {
      throw new Error(`Erreur API TTS: ${response.statusText}`);
    }

    // Convertir la réponse en blob audio
    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);

    // Créer et jouer l'élément audio
    currentAudio = new Audio(audioUrl);
    
    currentAudio.onended = () => {
      URL.revokeObjectURL(audioUrl);
      currentAudio = null;
      if (onEnd) onEnd();
    };

    currentAudio.onerror = (error) => {
      console.error('Erreur de lecture audio:', error);
      URL.revokeObjectURL(audioUrl);
      currentAudio = null;
      if (onEnd) onEnd();
    };

    await currentAudio.play();
    
  } catch (error) {
    console.error('Erreur TTS OpenAI:', error);
    // Fallback sur la voix du navigateur
    fallbackToWebSpeech(text, onEnd);
  }
}

/**
 * Arrête la lecture audio en cours
 */
export function stopSpeakingOpenAI(): void {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
}

/**
 * Fallback sur la synthèse vocale du navigateur si OpenAI échoue
 */
function fallbackToWebSpeech(text: string, onEnd?: () => void): void {
  if (!('speechSynthesis' in window)) {
    console.error('Synthèse vocale non supportée');
    if (onEnd) onEnd();
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'fr-FR';
  utterance.onend = onEnd || null;
  window.speechSynthesis.speak(utterance);
}

/**
 * Vérifie si l'audio est en cours de lecture
 */
export function isSpeakingOpenAI(): boolean {
  return currentAudio !== null && !currentAudio.paused;
}

export default {
  speak: speakTextWithOpenAI,
  stop: stopSpeakingOpenAI,
  isSpeaking: isSpeakingOpenAI
};

