import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
  Legend
} from 'recharts';
import api from '../api';
import Card from '../components/Card';

const palette = ['#4b7bff', '#7b5cff', '#34d399', '#fbbf24', '#f87171'];

const AnalyticsPage = () => {
  const [kpi, setKpi] = useState(null);
  const [funnel, setFunnel] = useState([]);
  const [revenue, setRevenue] = useState([]);
  const [sources, setSources] = useState([]);
  const [owners, setOwners] = useState([]);

  useEffect(() => {
    const load = async () => {
      const [kpiRes, funnelRes, revenueRes, sourcesRes, ownersRes] = await Promise.all([
        api.get('/analytics/kpi'),
        api.get('/analytics/funnel'),
        api.get('/analytics/revenue'),
        api.get('/analytics/sources'),
        api.get('/analytics/owners')
      ]);
      setKpi(kpiRes.data);
      setFunnel(funnelRes.data);
      setRevenue(revenueRes.data);
      setSources(sourcesRes.data);
      setOwners(ownersRes.data);
    };
    load();
  }, []);

  return (
    <div>
      <div className="card-grid">
        <Card label="Всього лідів" value={kpi?.totalLeads ?? '--'} />
        <Card label="Виграні" value={kpi?.wonLeads ?? '--'} />
        <Card label="Програні" value={kpi?.lostLeads ?? '--'} />
        <Card label="Конверсія" value={kpi ? `${kpi.conversion}%` : '--'} />
        <Card
          label="Дохід"
          value={kpi ? `${Number(kpi.revenue).toLocaleString('uk-UA')} ₴` : '--'}
        />
      </div>

      <section className="section">
        <h3 className="section__title">Воронка лідів</h3>
        <div style={{ height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={funnel}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a3141" />
              <XAxis dataKey="label" stroke="#9fa9bf" />
              <YAxis stroke="#9fa9bf" />
              <Tooltip />
              <Bar dataKey="value" fill="#4b7bff" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="section">
        <h3 className="section__title">Дохід у часі</h3>
        <div style={{ height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a3141" />
              <XAxis dataKey="period" stroke="#9fa9bf" />
              <YAxis stroke="#9fa9bf" />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#34d399" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="section">
        <h3 className="section__title">Топ-джерела</h3>
        <div style={{ height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip />
              <Legend />
              <Pie data={sources} dataKey="leads" nameKey="label" outerRadius={90}>
                {sources.map((entry, index) => (
                  <Cell key={entry.label} fill={palette[index % palette.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="section">
        <h3 className="section__title">Активність менеджерів</h3>
        <div style={{ height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={owners}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a3141" />
              <XAxis dataKey="label" stroke="#9fa9bf" />
              <YAxis stroke="#9fa9bf" />
              <Tooltip />
              <Bar dataKey="value" fill="#7b5cff" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
};

export default AnalyticsPage;
