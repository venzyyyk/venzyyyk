import { useState } from 'react';
import api from '../api';

const SettingsPage = ({ auth }) => {
  const user = auth.user;
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const submitSupport = async (event) => {
    event.preventDefault();
    setLoading(true);
    setStatus('');
    try {
      const { data } = await api.post('/support', {
        name: form.name,
        email: form.email,
        subject: form.subject,
        message: form.message
      });
      setStatus(data.message);
      setForm((prev) => ({ ...prev, subject: '', message: '' }));
    } catch (error) {
      setStatus(error.response?.data?.message || 'Не вдалося відправити звернення.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <section className="section">
        <h3 className="section__title">Профіль користувача</h3>
        <div className="card">
          <div><strong>Імʼя:</strong> {user?.name}</div>
          <div><strong>Email:</strong> {user?.email}</div>
          <div><strong>Роль:</strong> {user?.role}</div>
        </div>
      </section>
      <section className="section">
        <h3 className="section__title">Звернення до підтримки</h3>
        <form className="card" onSubmit={submitSupport}>
          <div className="form-grid">
            <input name="name" value={form.name} onChange={handleChange} placeholder="Ваше імʼя" required />
            <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Ваш email" required />
            <input name="subject" value={form.subject} onChange={handleChange} placeholder="Тема" required />
          </div>
          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            placeholder="Опишіть проблему або запит"
            rows={5}
            required
          />
          {status && <div className="helper-text">{status}</div>}
          <button className="btn" type="submit" disabled={loading}>
            {loading ? 'Надсилання...' : 'Надіслати лист'}
          </button>
        </form>
      </section>
      <section className="section">
        <button className="btn" onClick={auth.logout}>
          Вийти з системи
        </button>
      </section>
    </div>
  );
};

export default SettingsPage;
