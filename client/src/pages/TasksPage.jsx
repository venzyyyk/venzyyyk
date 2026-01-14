import { useEffect, useState } from 'react';
import api from '../api';
import Modal from '../components/Modal';

const statusOptions = ['Todo', 'InProgress', 'Done'];
const typeOptions = ['Post', 'Stories', 'Reels', 'Copywriting', 'Design'];

const defaultForm = {
  dealId: '',
  title: '',
  type: 'Post',
  status: 'Todo',
  dueDate: ''
};

const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [deals, setDeals] = useState([]);
  const [sort, setSort] = useState('');
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [form, setForm] = useState(defaultForm);

  const loadData = async () => {
    const [tasksRes, dealsRes] = await Promise.all([
      api.get('/tasks', { params: { sort } }),
      api.get('/deals')
    ]);
    setTasks(tasksRes.data);
    setDeals(dealsRes.data);
  };

  useEffect(() => {
    loadData();
  }, [sort]);

  const handleFormChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const openCreateModal = () => {
    setEditingTask(null);
    setForm(defaultForm);
    setModalOpen(true);
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setForm({
      dealId: task.dealId,
      title: task.title,
      type: task.type,
      status: task.status,
      dueDate: task.dueDate
    });
    setModalOpen(true);
  };

  const submitTask = async (event) => {
    event.preventDefault();
    if (editingTask) {
      await api.put(`/tasks/${editingTask.id}`, form);
    } else {
      await api.post('/tasks', form);
    }
    setModalOpen(false);
    loadData();
  };

  const deleteTask = async (id) => {
    await api.delete(`/tasks/${id}`);
    loadData();
  };

  const moveTask = async (task, direction) => {
    const currentIndex = statusOptions.indexOf(task.status);
    const nextIndex = Math.min(Math.max(currentIndex + direction, 0), statusOptions.length - 1);
    const nextStatus = statusOptions[nextIndex];
    await api.put(`/tasks/${task.id}`, { ...task, status: nextStatus });
    loadData();
  };

  const columns = statusOptions.map((status) => ({
    status,
    items: tasks.filter((task) => task.status === status)
  }));

  return (
    <div>
      <section className="section">
        <div className="section__header">
          <h3 className="section__title">Контент-задачі</h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn--ghost" onClick={() => setSort(sort ? '' : 'dueDate')}>
              {sort ? 'Скинути сортування' : 'Сортувати за дедлайном'}
            </button>
            <button className="btn" onClick={openCreateModal}>
              + Нова задача
            </button>
          </div>
        </div>
        <div className="kanban">
          {columns.map((column) => (
            <div key={column.status} className="kanban__column">
              <div className="section__title">{column.status}</div>
              {column.items.map((task) => (
                <div key={task.id} className="task-card">
                  <strong>{task.title}</strong>
                  <div className="helper-text">Тип: {task.type}</div>
                  <div className="helper-text">Дедлайн: {task.dueDate}</div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <button className="btn btn--ghost" onClick={() => moveTask(task, -1)}>
                      ←
                    </button>
                    <button className="btn btn--ghost" onClick={() => moveTask(task, 1)}>
                      →
                    </button>
                    <button className="btn btn--ghost" onClick={() => openEditModal(task)}>
                      Редагувати
                    </button>
                    <button className="btn btn--ghost" onClick={() => deleteTask(task.id)}>
                      Видалити
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {isModalOpen && (
        <Modal title={editingTask ? 'Редагувати задачу' : 'Нова задача'} onClose={() => setModalOpen(false)}>
          <form onSubmit={submitTask} className="section">
            <div className="form-grid">
              <select name="dealId" value={form.dealId} onChange={handleFormChange} required>
                <option value="">Оберіть угоду</option>
                {deals.map((deal) => (
                  <option key={deal.id} value={deal.id}>
                    {deal.leadName} — {deal.package}
                  </option>
                ))}
              </select>
              <input name="title" placeholder="Назва задачі" value={form.title} onChange={handleFormChange} required />
              <select name="type" value={form.type} onChange={handleFormChange}>
                {typeOptions.map((type) => (
                  <option key={type} value={type}>
                    {type}
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
              <input type="date" name="dueDate" value={form.dueDate} onChange={handleFormChange} required />
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

export default TasksPage;
