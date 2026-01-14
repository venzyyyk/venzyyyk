import { useEffect, useState } from 'react';
import api from '../api';
import Card from '../components/Card';

const DashboardPage = () => {
  const [kpi, setKpi] = useState(null);
  const [leads, setLeads] = useState([]);

  useEffect(() => {
    const load = async () => {
      const [kpiRes, leadsRes] = await Promise.all([
        api.get('/analytics/kpi'),
        api.get('/leads')
      ]);
      setKpi(kpiRes.data);
      setLeads(leadsRes.data.slice(0, 5));
    };
    load();
  }, []);

  return (
    <div>
      <div className="card-grid">
        <Card label="Всього лідів" value={kpi?.totalLeads ?? '--'} />
        <Card label="Виграні" value={kpi?.wonLeads ?? '--'} />
        <Card label="Конверсія" value={kpi ? `${kpi.conversion}%` : '--'} />
        <Card
          label="Дохід"
          value={kpi ? `${Number(kpi.revenue).toLocaleString('uk-UA')} ₴` : '--'}
        />
      </div>

      <section className="section">
        <div className="section__header">
          <h3 className="section__title">Останні ліди</h3>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Назва</th>
              <th>Статус</th>
              <th>Бюджет</th>
              <th>Менеджер</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id}>
                <td>{lead.name}</td>
                <td>
                  <span className="badge">{lead.status}</span>
                </td>
                <td>{lead.estimatedBudget.toLocaleString('uk-UA')} ₴</td>
                <td>{lead.ownerName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default DashboardPage;
