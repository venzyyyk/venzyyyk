import { NavLink } from 'react-router-dom';

const links = [
  { to: '/dashboard', label: 'Дашборд' },
  { to: '/leads', label: 'Ліди' },
  { to: '/deals', label: 'Угоди' },
  { to: '/tasks', label: 'Задачі' },
  { to: '/analytics', label: 'Аналітика' },
  { to: '/settings', label: 'Налаштування' }
];

const Sidebar = () => (
  <aside className="sidebar">
    <div>
      <div className="sidebar__logo">SMM Pulse</div>
      <div className="helper-text">MiniCRM для SMM-агенції</div>
    </div>
    <nav className="sidebar__nav">
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          className={({ isActive }) =>
            isActive ? 'sidebar__link active' : 'sidebar__link'
          }
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  </aside>
);

export default Sidebar;
