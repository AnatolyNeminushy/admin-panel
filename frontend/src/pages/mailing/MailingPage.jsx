// pages/mailing/MailingPage.jsx
import { useMemo, useState } from 'react';
import MessageForm from './components/MessageForm';
import FiltersCard from './components/FiltersCard';
import ModeCard from './components/ModeCard';
import RecipientsCard from './components/RecipientsCard';
import ProgressCard from './components/ProgressCard';
import { useRecipients } from './hooks/useRecipients';
import { useBroadcast } from './hooks/useBroadcast';
import { parseManualIds, canSend as canSendUtil } from './utils';

/**
 * Страница рассылки:
 *  - ввод контента (заголовок/текст/картинка)
 *  - выбор платформ и фильтров получателей
 *  - режим отправки (всем/лимит/только выбранным/тест)
 *  - предпросмотр получателей и прогресс отправки
 */
export default function MailingPage() {
  // Данные сообщения
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  // Параметры рассылки
  const [platforms, setPlatforms] = useState({ tg: true, vk: false });
  const [filters, setFilters] = useState({ onlyActiveDays: 90, minOrders: 0, platform: 'any' });
  const [testMode, setTestMode] = useState(true);
  const [sendMode, setSendMode] = useState('all'); // 'all' | 'limit' | 'selected'
  const [limit, setLimit] = useState(50);

  // Получатели и отправка
  const {
    recipients,
    setRecipients,
    loadingRecipients,
    loadError,
    loadRecipients,
  } = useRecipients();
  const { isSending, progress, setProgress, handleSend } = useBroadcast();

  // Ручной выбор получателей
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [manualIdsText, setManualIdsText] = useState('');

  // Разрешение на отправку для кнопки
  const canSend = useMemo(
    () => canSendUtil({ text, platforms, sendMode, selectedIds }),
    [text, platforms, sendMode, selectedIds],
  );

  // Чекбокс-выбор одного ID
  function toggleOne(id) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  // Снять все выделения
  function clearSelection() {
    setSelectedIds(new Set());
  }

  // Добавление ID вручную (из textarea)
  function addManualIds() {
    const ids = parseManualIds(manualIdsText);
    if (!ids.length) return;
    setSelectedIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.add(String(id)));
      return next;
    });
    setSendMode('selected');
  }

  // Загрузка списка получателей по текущим фильтрам
  async function onLoadRecipients() {
    await loadRecipients({ platformsObj: platforms, filters, limit: 500 });
  }

  // Отправка рассылки
  async function onSend() {
    if (!canSend || isSending) return;

    await handleSend({
      title: title || 'Без названия',
      text,
      imageUrl: imageUrl || null,
      platforms: Object.entries(platforms)
        .filter(([, v]) => v)
        .map(([k]) => k),
      filters,
      testMode,
      mode: sendMode,
      limit: sendMode === 'limit' ? Number(limit) || null : null,
      recipientIds: sendMode === 'selected' ? Array.from(selectedIds) : [],
    });
  }

  return (
    <div className="p-6 flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-[#0b132b]">Рассылка</h1>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Форма контента сообщения */}
        <MessageForm
          title={title}
          setTitle={setTitle}
          text={text}
          setText={setText}
          imageUrl={imageUrl}
          setImageUrl={setImageUrl}
        />

        {/* Фильтры, режим и действия */}
        <div className="flex flex-col gap-4">
          <FiltersCard
            platforms={platforms}
            setPlatforms={setPlatforms}
            filters={filters}
            setFilters={setFilters}
            limit={limit}
            setLimit={setLimit}
            sendMode={sendMode}
          />

          <ModeCard
            sendMode={sendMode}
            setSendMode={setSendMode}
            testMode={testMode}
            setTestMode={setTestMode}
            canSend={canSend}
            onSend={onSend}
            onLoad={onLoadRecipients}
            loadingRecipients={loadingRecipients}
            isSending={isSending}
          />

          {loadError && <div className="text-sm text-red-400">{loadError}</div>}
        </div>

        {/* Список получателей и ручной выбор */}
        <RecipientsCard
          sendMode={sendMode}
          recipients={recipients}
          manualIdsText={manualIdsText}
          setManualIdsText={setManualIdsText}
          addManualIds={addManualIds}
          selectedIds={selectedIds}
          toggleOne={toggleOne}
          clearSelection={clearSelection}
        />
      </div>

      {/* Прогресс отправки */}
      <ProgressCard progress={progress} />
    </div>
  );
}
