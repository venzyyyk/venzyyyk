import { useEffect, useState } from 'react';
import api from '../api';
import Modal from '../components/Modal';

const packageOptions = ['SMM Basic', 'SMM Standard', 'SMM Pro'];
const dealStatusOptions = ['Active', 'Paused', 'Finished'];

const defaultForm = {
  leadId: '',
  package: 'SMM Standard',
  price: 15000,
  startDate: '',
  endDate: '',
  dealStatus: 'Active'
};

const DealsPage = () => {
  const [deals, setDeals] = useState([]);
  const [leads, setLeads] = useState([]);
  const [filters, setFilters] = useState({ package: '', dealStatus: '' });
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);
  const [form, setForm] = useState(defaultForm);

  const loadData = async () => {
    const [dealsRes, leadsRes] = await Promise.all([
      api.get('/deals', { params: filters }),
      api.get('/leads', { params: { status: 'Won' } })
    ]);
    setDeals(dealsRes.data);
    setLeads(leadsRes.data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFilterChange = (event) => {
    setFilters((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleFormChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const openCreateModal = () => {
    setEditingDeal(null);
    setForm(defaultForm);
    setModalOpen(true);
  };

  const openEditModal = (deal) => {
    setEditingDeal(deal);
    setForm({
      leadId: deal.leadId,
      package: deal.package,
      price: deal.price,
      startDate: deal.startDate,
      endDate: deal.endDate,
      dealStatus: deal.dealStatus
    });
    setModalOpen(true);
  };

  const submitDeal = async (event) => {
    event.preventDefault();
    if (editingDeal) {
      await api.put(`/deals/${editingDeal.id}`, form);
    } else {
      await api.post('/deals', form);
    }
    setModalOpen(false);
    loadData();
  };

  const deleteDeal = async (id) => {
    await api.delete(`/deals/${id}`);
    loadData();
  };

  return (
    <div>
      <section className="section">
        <div className="section__header">
          <h3 className="section__title">Фільтри угод</h3>
          <button className="btn" onClick={openCreateModal}>
            + Нова угода
          </button>
        </div>
        <div className="filters">
          <select name="package" value={filters.package} onChange={handleFilterChange}>
            <option value="">Усі пакети</option>
            {packageOptions.map((pkg) => (
              <option key={pkg} value={pkg}>
                {pkg}
              </option>
            ))}
          </select>
          <select name="dealStatus" value={filters.dealStatus} onChange={handleFilterChange}>
            <option value="">Усі статуси</option>
            {dealStatusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <button className="btn" onClick={loadData}>
            Застосувати
          </button>
        </div>
      </section>

      <section className="section">
        <h3 className="section__title">Список угод</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Лід</th>
              <th>Пакет</th>
              <th>Ціна</th>
              <th>Період</th>
              <th>Статус</th>
              <th>Дії</th>
            </tr>
          </thead>
          <tbody>
            {deals.map((deal) => (
              <tr key={deal.id}>
                <td>{deal.leadName}</td>
                <td>{deal.package}</td>
                <td>{deal.price.toLocaleString('uk-UA')} ₴</td>
                <td>
                  {deal.startDate} — {deal.endDate}
                </td>
                <td>
                  <span className="badge">{deal.dealStatus}</span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn--ghost" onClick={() => openEditModal(deal)}>
                      Редагувати
                    </button>
                    <button className="btn btn--ghost" onClick={() => deleteDeal(deal.id)}>
                      Видалити
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {isModalOpen && (
        <Modal title={editingDeal ? 'Редагувати угоду' : 'Нова угода'} onClose={() => setModalOpen(false)}>
          <form onSubmit={submitDeal} className="section">
            <div className="form-grid">
              <select name="leadId" value={form.leadId} onChange={handleFormChange} required>
                <option value="">Оберіть виграний лід</option>
                {leads.map((lead) => (
                  <option key={lead.id} value={lead.id}>
                    {lead.name}
                  </option>
                ))}
              </select>
              <select name="package" value={form.package} onChange={handleFormChange}>
                {packageOptions.map((pkg) => (
                  <option key={pkg} value={pkg}>
                    {pkg}
                  </option>
                ))}
              </select>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleFormChange}
                placeholder="Ціна"
                required
              />
              <input type="date" name="startDate" value={form.startDate} onChange={handleFormChange} required />
              <input type="date" name="endDate" value={form.endDate} onChange={handleFormChange} required />
              <select name="dealStatus" value={form.dealStatus} onChange={handleFormChange}>
                {dealStatusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <button className="btn" type="submit">
              Зберегти
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default DealsPage;
