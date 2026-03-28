import React, { useState, useContext } from 'react';
import axios from '../../../axios';
import { ThemeContext } from '../../../context/ThemeContext';
import s from '../Dashboard.module.sass';
import { Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function SmartOrderForm({ onOrderCreated }) {
  const { theme } = useContext(ThemeContext);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [parsedData, setParsedData] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  const userId = localStorage.getItem('id');

  const handleParse = async () => {
    if (!description.trim()) return;
    setLoading(true);
    try {
      const { data } = await axios.post('/api/v1/ai/parse', { text: description });
      // Expecting data: { cargoDetails: {...}, route: {...}, estimatedPrice: ... }
      setParsedData(data);
      toast.success('Заказ успешно разобран AI!');
    } catch (error) {
      console.error("AI Parse Error:", error);
      toast.error('Не удалось разобрать текст. Попробуйте еще раз.');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!parsedData) return;
    setSubmitting(true);
    try {
      const payload = {
        customerId: userId,
        cargo: {
          description: description,
          weight: Number(parsedData.cargoDetails?.weight || parsedData.weight || 0),
          volume: Number(parsedData.cargoDetails?.volume || parsedData.volume || 0)
        },
        route: {
          from: { 
            address: parsedData.route?.from?.address || parsedData.from, 
            city: parsedData.route?.from?.city || parsedData.from 
          },
          to: { 
            address: parsedData.route?.to?.address || parsedData.to, 
            city: parsedData.route?.to?.city || parsedData.to 
          }
        },
        pricing: {
          customerOffer: Number(parsedData.estimatedPrice || parsedData.price || 0)
        }
      };

      const { data } = await axios.post('/orders', payload);
      toast.success('Заказ опубликован!');
      onOrderCreated(data);
      setParsedData(null);
      setDescription('');
    } catch (error) {
      console.error("Publish Error:", error);
      toast.error('Ошибка при публикации заказа.');
    } finally {
      setSubmitting(false);
    }
  };

  const isDark = theme === 'dark';

  return (
    <div className={s.card}>
      <h3><Sparkles size={18} style={{ display: 'inline', marginRight: 8 }} />Умный заказ</h3>
      
      {!parsedData ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <textarea
            className={s.input}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Опишите, что нужно перевезти (например: 5 тонн кирпича из Москвы в Казань, бюджет 15000)"
            style={{ minHeight: 100, padding: 12, resize: 'vertical' }}
          />
          <button 
            className={s.createButton} 
            onClick={handleParse} 
            disabled={loading || !description.trim()}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {loading ? <Loader2 className="animate-spin" /> : 'Разобрать и заполнить'}
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: '#888' }}>Откуда</label>
              <input 
                className={s.input} 
                value={parsedData.route?.from?.city || parsedData.from || ''} 
                onChange={(e) => setParsedData({
                    ...parsedData, 
                    route: { ...parsedData.route, from: { ...parsedData.route?.from, city: e.target.value } }
                })} 
              />
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#888' }}>Куда</label>
              <input 
                className={s.input} 
                value={parsedData.route?.to?.city || parsedData.to || ''} 
                onChange={(e) => setParsedData({
                    ...parsedData, 
                    route: { ...parsedData.route, to: { ...parsedData.route?.to, city: e.target.value } }
                })} 
              />
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#888' }}>Вес (кг)</label>
              <input 
                className={s.input} 
                value={parsedData.cargoDetails?.weight || parsedData.weight || ''} 
                onChange={(e) => setParsedData({
                    ...parsedData, 
                    cargoDetails: { ...parsedData.cargoDetails, weight: e.target.value }
                })} 
              />
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#888' }}>Цена (₽)</label>
              <input 
                className={s.input} 
                value={parsedData.estimatedPrice || parsedData.price || ''} 
                onChange={(e) => setParsedData({...parsedData, estimatedPrice: e.target.value})} 
              />
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: 12 }}>
            <button 
              className={s.backBtn} 
              onClick={() => setParsedData(null)}
              style={{ flex: 1, border: '1px solid #ccc', borderRadius: 8 }}
            >
              Назад
            </button>
            <button 
              className={s.createButton} 
              onClick={handlePublish}
              disabled={submitting}
              style={{ flex: 2, justifyContent: 'center' }}
            >
              {submitting ? <Loader2 className="animate-spin" /> : 'Опубликовать заказ'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
