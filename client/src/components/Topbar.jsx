const Topbar = ({ title, user }) => (
  <header className="topbar">
    <div className="topbar__title">{title}</div>
    <div className="topbar__user">{user ? `${user.name} • ${user.role}` : ''}</div>
  </header>
);

export default Topbar;
