import { useEffect, useState } from 'react';
import api from '../api';
import Modal from '../components/Modal';

const statusOptions = ['New', 'Contacted', 'Briefing', 'Proposal', 'Won', 'Lost'];
const sourceOptions = ['Instagram', 'TikTok', 'Сайт', 'Реклама', 'Рекомендація'];
const owners = [
  { id: 1, name: 'Олена Кравченко' },
  { id: 2, name: 'Іван Лисенко' }
];

const defaultForm = {
  name: '',
  contact: '',
  source: 'Instagram',
  status: 'New',
  estimatedBudget: 10000,
  ownerId: 2
};

const LeadsPage = ({ user }) => {
  const [leads, setLeads] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    source: '',
    ownerId: '',
    search: '',
    dateFrom: '',
    dateTo: '',
    minBudget: '',
    maxBudget: ''
  });
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [form, setForm] = useState(defaultForm);

  const fetchLeads = async () => {
    const { data } = await api.get('/leads', { params: filters });
    setLeads(data);
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleFilterChange = (event) => {
    setFilters((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const openCreateModal = () => {
    setEditingLead(null);
    setForm({ ...defaultForm, ownerId: user?.id || 2 });
    setModalOpen(true);
  };

  const openEditModal = (lead) => {
    setEditingLead(lead);
    setForm({
      name: lead.name,
      contact: lead.contact,
      source: lead.source,
      status: lead.status,
      estimatedBudget: lead.estimatedBudget,
      ownerId: lead.ownerId
    });
    setModalOpen(true);
  };

  const submitLead = async (event) => {
    event.preventDefault();
    if (editingLead) {
      await api.put(`/leads/${editingLead.id}`, form);
    } else {
      await api.post('/leads', form);
    }
    setModalOpen(false);
    fetchLeads();
  };

  const deleteLead = async (id) => {
    await api.delete(`/leads/${id}`);
    fetchLeads();
  };

  const nextStatus = async (lead) => {
    await api.post(`/leads/${lead.id}/status`);
    fetchLeads();
  };

  return (
    <div>
      <section className="section">
        <div className="section__header">
          <h3 className="section__title">Фільтри</h3>
          <button className="btn" onClick={openCreateModal}>
            + Новий лід
          </button>
        </div>
        <div className="filters">
          <input
            name="search"
            placeholder="Пошук по назві або контакту"
            value={filters.search}
            onChange={handleFilterChange}
          />
          <select name="status" value={filters.status} onChange={handleFilterChange}>
            <option value="">Усі статуси</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <select name="source" value={filters.source} onChange={handleFilterChange}>
            <option value="">Усі джерела</option>
            {sourceOptions.map((source) => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </select>
          <select name="ownerId" value={filters.ownerId} onChange={handleFilterChange}>
            <option value="">Усі менеджери</option>
            {owners.map((owner) => (
              <option key={owner.id} value={owner.id}>
                {owner.name}
              </option>
            ))}
          </select>
          <input type="date" name="dateFrom" value={filters.dateFrom} onChange={handleFilterChange} />
          <input type="date" name="dateTo" value={filters.dateTo} onChange={handleFilterChange} />
          <input
            type="number"
            name="minBudget"
            placeholder="Бюджет від"
            value={filters.minBudget}
            onChange={handleFilterChange}
          />
          <input
            type="number"
            name="maxBudget"
            placeholder="Бюджет до"
            value={filters.maxBudget}
            onChange={handleFilterChange}
          />
          <button className="btn" onClick={fetchLeads}>
            Застосувати
          </button>
          <button
            className="btn btn--ghost"
            onClick={() => {
              setFilters({
                status: '',
                source: '',
                ownerId: '',
                search: '',
                dateFrom: '',
                dateTo: '',
                minBudget: '',
                maxBudget: ''
              });
              setTimeout(fetchLeads, 0);
            }}
          >
            Очистити
          </button>
        </div>
      </section>

      <section className="section">
        <h3 className="section__title">Список лідів</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Назва</th>
              <th>Контакт</th>
              <th>Джерело</th>
              <th>Статус</th>
              <th>Бюджет</th>
              <th>Менеджер</th>
              <th>Дії</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id}>
                <td>{lead.name}</td>
                <td>{lead.contact}</td>
                <td>{lead.source}</td>
                <td>
                  <span className="badge">{lead.status}</span>
                </td>
                <td>{lead.estimatedBudget.toLocaleString('uk-UA')} ₴</td>
                <td>{lead.ownerName}</td>
                <td>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button className="btn btn--ghost" onClick={() => openEditModal(lead)}>
                      Редагувати
                    </button>
                    <button className="btn btn--ghost" onClick={() => nextStatus(lead)}>
                      Наступний статус
                    </button>
                    <button className="btn btn--ghost" onClick={() => deleteLead(lead.id)}>
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
        <Modal title={editingLead ? 'Редагувати лід' : 'Новий лід'} onClose={() => setModalOpen(false)}>
          <form onSubmit={submitLead} className="section">
            <div className="form-grid">
              <input
                name="name"
                placeholder="Назва компанії"
                value={form.name}
                onChange={handleFormChange}
                required
              />
              <input
                name="contact"
                placeholder="Контакт"
                value={form.contact}
                onChange={handleFormChange}
                required
              />
              <select name="source" value={form.source} onChange={handleFormChange}>
                {sourceOptions.map((source) => (
                  <option key={source} value={source}>
                    {source}
                  </option>
                ))}
              </select>
              <select name="status" value={form.status} onChange={handleFormChange}>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <input
                type="number"
                name="estimatedBudget"
                placeholder="Очікуваний бюджет"
                value={form.estimatedBudget}
                onChange={handleFormChange}
                required
              />
              <select name="ownerId" value={form.ownerId} onChange={handleFormChange}>
                {owners.map((owner) => (
                  <option key={owner.id} value={owner.id}>
                    {owner.name}
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

export default LeadsPage;
