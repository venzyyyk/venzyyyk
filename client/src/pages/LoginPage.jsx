import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const LoginPage = ({ auth }) => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/login', form);
      auth.login(data.token, data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Не вдалося увійти.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login">
      <form className="login__card" onSubmit={handleSubmit}>
        <h2>Вхід у SMM Pulse</h2>
        <p className="helper-text">
          Увійдіть як менеджер або адміністратор, щоб керувати лідами.
        </p>
        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="manager@smm-pulse.ua"
            required
          />
        </div>
        <div>
          <label htmlFor="password">Пароль</label>
          <input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Введіть пароль"
            required
          />
        </div>
        {error && <div className="helper-text">{error}</div>}
        <button className="btn" type="submit" disabled={loading}>
          {loading ? 'Вхід...' : 'Увійти'}
        </button>
        <div className="helper-text">
          Тестові дані: admin@smm-pulse.ua / admin123 або manager@smm-pulse.ua /
          manager123
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
