import { useState, useEffect, useMemo } from "react";
import ChatSearch from "./components/ChatSearch";
import LimitControl from "./components/LimitControl";
import ChatList from "./components/ChatList";
import MessagePane from "./components/MessagePane";
import { getDialogTimestamp, matchesLocal } from "./utils/chatUtils";

export default function ChatsPage() {
  const [dialogs, setDialogs] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const [totalCount, setTotalCount] = useState(0);
  const [visibleCount, setVisibleCount] = useState(50);

  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const API = import.meta.env.VITE_API_URL;

  // md и выше?
  const [isMdUp, setIsMdUp] = useState(
    typeof window !== "undefined"
      ? window.matchMedia("(min-width: 768px)").matches
      : true
  );
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = (e) => setIsMdUp(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const sortedDialogs = useMemo(
    () => [...dialogs].sort((a, b) => getDialogTimestamp(b) - getDialogTimestamp(a)),
    [dialogs]
  );

  const locallyFiltered = useMemo(
    () => sortedDialogs.filter((d) => matchesLocal(d, searchInput)),
    [sortedDialogs, searchInput]
  );

  const displayedDialogs = useMemo(() => {
    const count = Math.min(
      typeof visibleCount === "number" ? visibleCount : totalCount,
      locallyFiltered.length
    );
    return locallyFiltered.slice(0, count);
  }, [locallyFiltered, visibleCount, totalCount]);

  // текущий диалог для заголовка/аватара
  const selectedDialog = useMemo(
    () => dialogs.find((d) => d.chat_id === selectedId) || null,
    [dialogs, selectedId]
  );

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${API}/chats?limit=10000&offset=0&q=${encodeURIComponent(searchQuery)}`,
          { signal: controller.signal }
        );
        const totalFromHeader = Number(res.headers.get("X-Total-Count"));
        const data = await res.json();

        if (data && Array.isArray(data.items)) {
          setDialogs(data.items);
          const metaTotal = Number(data.total ?? data.count ?? data.totalCount);
          const fallbackTotal = data.items.length;
          setTotalCount(
            Number.isFinite(totalFromHeader) && totalFromHeader > 0
              ? totalFromHeader
              : Number.isFinite(metaTotal) && metaTotal > 0
              ? metaTotal
              : fallbackTotal
          );
        } else if (Array.isArray(data)) {
          setDialogs(data);
          const fallbackTotal = data.length;
          setTotalCount(
            Number.isFinite(totalFromHeader) && totalFromHeader > 0
              ? totalFromHeader
              : fallbackTotal
          );
        } else {
          setDialogs([]);
          setTotalCount(0);
        }
      } catch (e) {
        if (e.name !== "AbortError") {
          setDialogs([]);
          setTotalCount(0);
        }
      } finally {
        setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [searchQuery, API]);

  // автоселект только на md+
  useEffect(() => {
    if (!sortedDialogs.length) return;
    if (!isMdUp) return;
    if (selectedId && sortedDialogs.some((d) => d.chat_id === selectedId)) return;
    setSelectedId(sortedDialogs[0].chat_id);
  }, [sortedDialogs, selectedId, isMdUp]);

  useEffect(() => {
    if (!selectedId) return;
    setLoadingMessages(true);
    fetch(`${API}/messages?chatId=${selectedId}`)
      .then((res) => res.json())
      .then((data) => {
        const arr = Array.isArray(data) ? data : [];
        const mapped = arr.map((m, idx) => {
          const role = String(
            m.role || m.sender || m.author || m.sender_name || ""
          ).toLowerCase();
          const isBot =
            role === "bot" ||
            role === "assistant" ||
            role === "ai" ||
            role === "irbi" ||
            m.is_bot === true ||
            m.is_bot === 1 ||
            m.is_bot === "1";
          return {
            ...m,
            is_bot: isBot,
            _clientOrder: Number.isFinite(Date.parse(m.date))
              ? Date.parse(m.date)
              : idx,
          };
        });
        setMessages(mapped);
      })
      .catch(() => setMessages([]))
      .finally(() => setLoadingMessages(false));
  }, [selectedId, API]);

  async function handleSend(text) {
    if (!selectedId || !text || !text.trim()) return;
    const now = Date.now();
    const tempId = `tmp-${now}`;
    const tempMsg = {
      id: tempId,
      chat_id: selectedId,
      from_me: true,
      text: text.trim(),
      date: new Date(now).toISOString(),
      _pending: true,
      _clientOrder: now,
    };
    setMessages((prev) => [...prev, tempMsg]);

    let res, data;
    try {
      res = await fetch(`${API}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId: selectedId, text: text.trim() }),
      });
      data = await res.json().catch(() => null);
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      alert("Не удалось отправить сообщение (нет соединения).");
      return;
    }
    if (!res.ok || !data) {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      alert((data && data.error) || "Не удалось отправить сообщение");
      return;
    }
    setMessages((prev) =>
      prev.map((m) =>
        m.id === tempId
          ? {
              ...m,
              id: data.id ?? m.id,
              chat_id: data.chat_id ?? m.chat_id,
              from_me: true,
              text: data.text ?? m.text,
              _pending: false,
            }
          : m
      )
    );
  }

  const presets = useMemo(() => {
    const candidates = [20, 50, 100, 200, 500];
    return candidates.filter((n) => n < totalCount).concat([totalCount || 0]).filter(Boolean);
  }, [totalCount]);

  const handleSelectChat = (id) => setSelectedId(id);
  const handleBackToChats = () => setSelectedId(null);

  return (
    <div className="flex h-full relative min-h-0">
      {/* ===== Desktop / Tablet (две колонки) ===== */}
      {isMdUp ? (
        <>
          {/* Sidebar */}
          <div
            className="
              hidden md:flex md:flex-col h-full min-h-0 overflow-y-auto p-4
              bg-white rounded-l-2xl shadow-sm border border-gray-200
              md:w-[260px] lg:w-[320px] xl:w-[360px] transition-[width] duration-200
            "
          >
            <ChatSearch
              value={searchInput}
              onChange={setSearchInput}
              onSubmit={() => setSearchQuery(searchInput.trim())}
              onClear={() => {
                setSearchInput("");
                setSearchQuery("");
              }}
            />
            <LimitControl
              visibleCount={visibleCount}
              setVisibleCount={setVisibleCount}
              totalCount={totalCount}
              shownCount={displayedDialogs.length}
              filteredCount={locallyFiltered.length}
              showTotalNote={Boolean(searchInput)}
            />
            <div className="flex flex-wrap gap-2 mb-3">
              {presets.map((n) => (
                <button
                  key={n}
                  onClick={() => setVisibleCount(n)}
                  className={`text-xs px-2 py-1 rounded border ${
                    visibleCount === n
                      ? "bg-[#17e1b1] text-white border-transparent"
                      : "bg-[#f7f7f9] text-gray-700 border-gray-200"
                  }`}
                >
                  {n === totalCount ? `Все (${totalCount})` : n}
                </button>
              ))}
            </div>
            {loading ? (
              <div className="text-center text-gray-400">Загрузка...</div>
            ) : (
              <ChatList
                dialogs={displayedDialogs}
                selectedId={selectedId}
                onSelect={handleSelectChat}
              />
            )}
          </div>

          {/* Message pane */}
          <div
            className="flex-1 min-w-0 min-h-0 rounded-r-2xl border border-gray-200 md:ml-2
                       flex flex-col overflow-hidden"
            style={{ background: "linear-gradient(135deg, #6FC0BE 0%, #A8E5C7 120%)" }}
          >
            <MessagePane
              selectedId={selectedId}
              peer={selectedDialog}                /* << передаём собеседника */
              messages={messages}
              loading={loadingMessages}
              onSend={handleSend}
              onBack={() => {}}
              isMobile={false}
            />
          </div>
        </>
      ) : (
        //  ===== Mobile (за раз) ===== 
        <div className="flex-1 min-w-0 min-h-0 flex flex-col">
          {!selectedId ? (
            // Экран "Чаты"
            <div className="flex-1 min-h-0 flex flex-col bg-white  shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200 font-semibold">Чаты</div>
              <div className="p-4">
                <ChatSearch
                  value={searchInput}
                  onChange={setSearchInput}
                  onSubmit={() => setSearchQuery(searchInput.trim())}
                  onClear={() => {
                    setSearchInput("");
                    setSearchQuery("");
                  }}
                />
                <LimitControl
                  visibleCount={visibleCount}
                  setVisibleCount={setVisibleCount}
                  totalCount={totalCount}
                  shownCount={displayedDialogs.length}
                  filteredCount={locallyFiltered.length}
                  showTotalNote={Boolean(searchInput)}
                />
                <div className="flex flex-wrap gap-2 mb-3">
                  {presets.map((n) => (
                    <button
                      key={n}
                      onClick={() => setVisibleCount(n)}
                      className={`text-xs px-2 py-1 rounded border ${
                        visibleCount === n
                          ? "bg-[#17E1B1] text-white border-transparent"
                          : "bg-[#f7f7f9] text-gray-700 border-gray-200"
                      }`}
                    >
                      {n === totalCount ? `Все (${totalCount})` : n}
                    </button>
                  ))}
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto">
                {loading ? (
                  <div className="p-4 text-center text-gray-400">Загрузка...</div>
                ) : (
                  <ChatList
                    dialogs={displayedDialogs}
                    selectedId={selectedId}
                    onSelect={handleSelectChat}
                  />
                )}
              </div>
            </div>
          ) : (
            // Экран "Сообщения"
            <div
              className="flex-1 min-h-0 flex flex-col  border border-gray-200 overflow-hidden"
              style={{ background: "linear-gradient(135deg, #6FC0BE 0%, #A8E5C7 120%)" }}
            >
              <MessagePane
                selectedId={selectedId}
                peer={selectedDialog}              /* << для заголовка/аватара */
                messages={messages}
                loading={loadingMessages}
                onSend={handleSend}
                onBack={handleBackToChats}         /* << кнопка ← Назад */
                isMobile={true}                    /* << рисуем мобильный хедер */
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
