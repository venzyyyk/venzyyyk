INSERT INTO users (name, email, password, role) VALUES
  ('Олена Кравченко', 'admin@smm-pulse.ua', 'admin123', 'admin'),
  ('Іван Лисенко', 'manager@smm-pulse.ua', 'manager123', 'manager');

INSERT INTO leads (name, contact, source, status, estimatedBudget, ownerId) VALUES
  ('Кафе «М’ята»', '+380501112233 / Instagram', 'Instagram', 'New', 12000, 2),
  ('Магазин «GlowSkin»', 'Telegram @glowskin', 'TikTok', 'Contacted', 18000, 2),
  ('Салон «BeautyRoom»', '+380671234567', 'Сайт', 'Briefing', 25000, 1),
  ('Студія «PhotoLab»', 'Instagram @photolab', 'Реклама', 'Proposal', 30000, 1),
  ('Барбершоп «Sharp»', 'Telegram @sharpbarber', 'Рекомендація', 'Won', 22000, 2),
  ('Фітнес «StrongTime»', '+380931234567', 'Instagram', 'Lost', 15000, 1);

INSERT INTO deals (leadId, package, price, startDate, endDate, dealStatus) VALUES
  (5, 'SMM Pro', 24000, '2024-01-10', '2024-04-10', 'Active');

INSERT INTO tasks (dealId, title, type, status, dueDate) VALUES
  (1, 'Контент-план на місяць', 'Copywriting', 'InProgress', '2024-02-05'),
  (1, '10 креативів для Reels', 'Design', 'Todo', '2024-02-12'),
  (1, 'Пакет stories для запуску', 'Stories', 'Todo', '2024-02-08');

INSERT INTO notes (entityType, entityId, text, authorId) VALUES
  ('lead', 5, 'Клієнт готовий стартувати з пакетом Pro, хоче фокус на відео.', 2),
  ('deal', 1, 'Погодили старт з 10.01, очікує звіти щотижня.', 1);
