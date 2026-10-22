import React, { useState } from 'react';
import { Camera, LoaderCircle, MessageCircle, Send, Upload } from 'lucide-react';
import { api } from '../services/api';
import {
  ChatbotMessageResponse,
  LandAssessmentInput,
  LandPhotoAnalysisResponse
} from '../types';

interface PhotoChatIntakeProps {
  currentInputs: LandAssessmentInput;
  onInputUpdate: (updates: Partial<LandAssessmentInput>) => void;
  isActive: boolean;
}

interface ChatMessage {
  sender: 'user' | 'assistant';
  text: string;
}

export const PhotoChatIntake: React.FC<PhotoChatIntakeProps> = ({
  currentInputs,
  onInputUpdate,
  isActive
}) => {
  const [imageData, setImageData] = useState<string>();
  const [imageName, setImageName] = useState('');
  const [photoNotes, setPhotoNotes] = useState('');
  const [photoAnalysis, setPhotoAnalysis] = useState<LandPhotoAnalysisResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'assistant',
      text: 'Ask me a general question about your soil, sunlight, frost, water, or terrace. I can also help you decide what to observe by hand.'
    }
  ]);
  const [isSending, setIsSending] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  const handlePhotoSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setImageData(undefined);
      setImageName('');
      setPhotoAnalysis(null);
      setPhotoError('Choose an image file to continue.');
      event.currentTarget.value = '';
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setImageData(undefined);
      setImageName('');
      setPhotoAnalysis(null);
      setPhotoError('The image must be 8 MB or smaller.');
      event.currentTarget.value = '';
      return;
    }

    setPhotoError(null);
    setPhotoAnalysis(null);
    setImageName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        setPhotoError('The selected image could not be read.');
        return;
      }
      setImageData(reader.result);
    };
    reader.onerror = () => setPhotoError('The selected image could not be read.');
    reader.readAsDataURL(file);
  };

  const analyzePhoto = async () => {
    if (!imageData) {
      setPhotoError('Upload a land or soil photo before requesting an assessment.');
      return;
    }
    setIsAnalyzing(true);
    setPhotoError(null);
    try {
      const result = await api.analyzeLandPhoto({
        image_base64: imageData,
        image_name: imageName,
        user_notes: photoNotes,
        current_inputs: currentInputs
      });
      setPhotoAnalysis(result);
    } catch (error) {
      setPhotoError(error instanceof Error ? error.message : 'Photo assessment failed.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const sendQuestion = async (text = question) => {
    const message = text.trim();
    if (!message || isSending) return;

    const nextMessages: ChatMessage[] = [...messages, { sender: 'user', text: message }];
    setMessages(nextMessages);
    setQuestion('');
    setChatError(null);
    setIsSending(true);
    try {
      const answer: ChatbotMessageResponse = await api.sendChatbotMessage({
        message,
        conversation_history: nextMessages,
        current_inputs: currentInputs
      });
      setMessages([...nextMessages, { sender: 'assistant', text: answer.reply }]);
      if (answer.detected_input_updates) onInputUpdate(answer.detected_input_updates);
    } catch (error) {
      setChatError(error instanceof Error ? error.message : 'The assistant could not answer.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section className="card" aria-labelledby="photo-chat-title" hidden={!isActive}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
        <Camera size={20} color="#2d6a4f" />
        <h3 id="photo-chat-title" className="card-title" style={{ margin: 0 }}>
          Step 1 — Land photo &amp; questions
        </h3>
      </div>
      <p style={{ fontSize: '0.84rem', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
        Upload a clear photo of the terrace and soil, then add anything you already know. Confirm all visual clues with the observations below.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px' }}>
        <div>
          <label
            htmlFor="land-photo-upload"
            className="btn btn-outline"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <Upload size={16} />
            {imageName || 'Choose a photo'}
          </label>
          <input
            id="land-photo-upload"
            type="file"
            accept="image/*"
            onChange={handlePhotoSelected}
            style={{ position: 'absolute', width: 1, height: 1, opacity: 0 }}
          />
          {imageData && (
            <div style={{ marginTop: '12px' }}>
              <img
                src={imageData}
                alt="Preview of the uploaded land or soil photo"
                style={{ width: '100%', maxHeight: '220px', objectFit: 'contain', borderRadius: 'var(--radius-md)', background: '#f0f2eb' }}
              />
            </div>
          )}
          <label htmlFor="photo-notes" style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, margin: '14px 0 6px' }}>
            Notes about this photo (optional)
          </label>
          <textarea
            id="photo-notes"
            value={photoNotes}
            onChange={event => setPhotoNotes(event.target.value)}
            rows={3}
            placeholder="For example: this is the lower terrace; the wall has a loose section."
            style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-border-card)', borderRadius: 'var(--radius-sm)', resize: 'vertical' }}
          />
          <button
            type="button"
            className="btn btn-primary"
            onClick={analyzePhoto}
            disabled={!imageData || isAnalyzing}
            style={{ marginTop: '10px' }}
          >
            {isAnalyzing ? <LoaderCircle size={16} className="spin" /> : <Camera size={16} />}
            <span>{isAnalyzing ? 'Reviewing photo…' : 'Review photo & notes'}</span>
          </button>
          {photoError && <p role="alert" style={{ color: '#991b1b', fontSize: '0.82rem', marginTop: '8px' }}>{photoError}</p>}
          {photoAnalysis && (
            <div role="status" style={{ marginTop: '12px', padding: '12px', background: '#f0f2eb', borderRadius: 'var(--radius-sm)' }}>
              <strong style={{ fontSize: '0.86rem' }}>{photoAnalysis.soil_archetype}</strong>
              <p style={{ fontSize: '0.82rem', marginTop: '6px' }}>{photoAnalysis.input_echo}</p>
              <ul style={{ paddingLeft: '20px', marginTop: '6px', fontSize: '0.8rem' }}>
                {photoAnalysis.uncertainties_marked.map((item, index) => <li key={index}>{item}</li>)}
              </ul>
            </div>
          )}
        </div>

        <div>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.94rem', marginBottom: '8px' }}>
            <MessageCircle size={17} color="#2d6a4f" /> Ask a general question
          </h4>
          <div
            aria-live="polite"
            style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '260px', overflowY: 'auto', padding: '10px', background: '#f7f8f5', borderRadius: 'var(--radius-sm)' }}
          >
            {messages.map((item, index) => (
              <div
                key={`${item.sender}-${index}`}
                style={{ alignSelf: item.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '95%', padding: '9px 11px', borderRadius: '10px', background: item.sender === 'user' ? '#e8f5e9' : '#fff', fontSize: '0.81rem' }}
              >
                {item.text}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
            <input
              value={question}
              onChange={event => setQuestion(event.target.value)}
              onKeyDown={event => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  void sendQuestion();
                }
              }}
              aria-label="Ask the land assistant a question"
              placeholder="Ask about soil, frost, sunlight…"
              style={{ minWidth: 0, flex: 1, padding: '10px', border: '1px solid var(--color-border-card)', borderRadius: 'var(--radius-sm)' }}
            />
            <button className="btn btn-primary" type="button" onClick={() => void sendQuestion()} disabled={!question.trim() || isSending} aria-label="Send question">
              {isSending ? <LoaderCircle size={16} className="spin" /> : <Send size={16} />}
            </button>
          </div>
          {chatError && <p role="alert" style={{ color: '#991b1b', fontSize: '0.82rem', marginTop: '8px' }}>{chatError}</p>}
        </div>
      </div>
    </section>
  );
};
