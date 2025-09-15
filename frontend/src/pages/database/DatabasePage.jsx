import Button from "@/components/Button";
import { useMemo, useState } from "react";

import { TAB_TITLES, schema } from "./config/constants";
import { fmtDate } from "./utils/format";
import { isPlaceholderId, makePlaceholderId } from "./utils/placeholders";

import Badge from "./components/Badge";
import Toolbar from "./components/Toolbar";
import FilterBar from "./components/FilterBar";
import MobileCards from "./components/MobileCards";
import EditorModal from "./components/EditorModal";
import { schema as allSchemas } from "./config/constants";

import {
  saveRow as apiSaveRow,
  deleteRow as apiDeleteRow,
} from "./api/databaseApi";
import useTableData from "./hooks/useTableData";

export default function DatabasePage() {
  const td = useTableData("chats"); // всё состояние списка и загрузка — в хуке

  // editor
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState("add");
  const [form, setForm] = useState({});

  // колонки
  const columns = useMemo(() => {
    switch (td.tab) {
      case "chats":
        return [
          {
            key: "chat_id",
            title: "ID чата",
            render: (v) => (isPlaceholderId(v) ? "—" : v),
          },
          { key: "username", title: "Юзернейм" },
          { key: "first_name", title: "Имя" },
          { key: "last_name", title: "Фамилия" },
          {
            key: "platform",
            title: "Платформа",
            render: (v) => <Badge>{v || "—"}</Badge>,
          },
        ];
      case "messages":
        return [
          { key: "id", title: "ID" },
          { key: "chat_id", title: "ID чата" },
          { key: "username", title: "Юзернейм" },
          {
            key: "from_me",
            title: "Отправитель",
            render: (v) => <Badge>{v ? "Оператор" : "Клиент"}</Badge>,
          },
          { key: "text", title: "Сообщение" },
          { key: "date", title: "Дата и время", render: fmtDate },
        ];
      case "orders":
        return [
          { key: "id", title: "ID" },
          { key: "tg_username", title: "TG юзернейм" },
          { key: "name", title: "Имя" },
          { key: "phone", title: "Телефон" },
          { key: "order_type", title: "Тип заказа" },
          { key: "date", title: "Дата" },
          { key: "time", title: "Время" },
          { key: "total", title: "Сумма" },
          {
            key: "platform",
            title: "Платформа",
            render: (v) => <Badge>{v || "—"}</Badge>,
          },
          { key: "created_at", title: "Создано", render: fmtDate },
        ];
      default:
        return [
          { key: "id", title: "ID" },
          { key: "tg_username", title: "TG юзернейм" },
          { key: "name", title: "Имя" },
          { key: "phone", title: "Телефон" },
          { key: "address", title: "Адрес" },
          { key: "date", title: "Дата" },
          { key: "time", title: "Время" },
          { key: "guests", title: "Гостей" },
          {
            key: "platform",
            title: "Платформа",
            render: (v) => <Badge>{v || "—"}</Badge>,
          },
          { key: "created_at", title: "Создано", render: fmtDate },
        ];
    }
  }, [td.tab]);

  // редактор
  function openEditor(mode, row = null) {
    setEditorMode(mode);
    const clean = {};
    for (const f of schema[td.tab]) clean[f.key] = row?.[f.key] ?? "";
    setForm(clean);
    setEditorOpen(true);
  }

  async function saveEditor() {
    let body = { ...form };

    if (td.tab === "chats") {
      const raw = String(body.chat_id ?? "").trim();
      if (raw === "" || raw === "-") body.chat_id = makePlaceholderId();
      else {
        const n = Number(raw);
        if (!Number.isFinite(n)) {
          alert("ID чата должен быть числом или оставьте «—»");
          return;
        }
        body.chat_id = n;
      }
    } else {
      for (const f of schema[td.tab]) {
        if (f.readOnly) delete body[f.key];
        else if (f.type === "number" && body[f.key] !== "")
          body[f.key] = Number(body[f.key]);
        else if (f.type === "checkbox") body[f.key] = !!body[f.key];
      }
    }

    if (td.tab === "orders" || td.tab === "reservations") {
      const allowed = ["telegram", "vk"];
      if (!allowed.includes(body.platform)) {
        alert("Выберите платформу: telegram или vk");
        return;
      }
    }

    try {
      await apiSaveRow(td.tab, editorMode, form, body);
      setEditorOpen(false);
      td.setPage(1);
      td.setQ((p) => ({ ...p })); // триггер перезагрузки
    } catch (e) {
      alert(e.message || "Save error");
    }
  }

  async function deleteRow(row) {
    if (!confirm("Удалить запись?")) return;
    try {
      await apiDeleteRow(td.tab, row);
      td.setPage(1);
      td.setQ((p) => ({ ...p }));
    } catch (e) {
      alert(e.message);
    }
  }

  return (
    <div className="p-3 sm:p-4 lg:p-6 max-w-7xl mx-auto space-y-4">
      {/* Tabs */}
      <div className="overflow-x-auto -mx-1">
        <div className="flex gap-2 px-1 min-w-max snap-x snap-mandatory">
          {td.tabs.map((t) => (
            <Button
              key={t}
              onClick={() => td.switchTab(t)}
              variant="tab"
              size="sm"
              aria-selected={td.tab === t}
              className="snap-start"
            >
              {TAB_TITLES[t]}
            </Button>
          ))}
        </div>
      </div>

      <Toolbar
        title={`Таблица: ${TAB_TITLES[td.tab]}`}
        q={td.q}
        setQ={td.setQ}
        onSearch={() => {
          td.setPage(1);
          td.setQ({ ...td.q, value: td.q.input.trim() });
        }}
        onClear={() => {
          td.setQ({ input: "", value: "" });
          td.setPage(1);
        }}
        total={td.total}
        loading={td.loading}
      />

      {/* Фильтры */}
      <div className="md:hidden">
        <button
          onClick={() => td.setFiltersOpen((v) => !v)}
          className="w-full rounded-lg px-3 py-2 bg-slate-700 text-white"
        >
          {td.filtersOpen ? "Скрыть фильтры" : "Показать фильтры"}
        </button>
      </div>
      <FilterBar
        tab={td.tab}
        filters={td.filtersDraft}
        setFilters={td.setFiltersDraft}
        onApply={td.applyFilters}
        onReset={td.resetFilters}
        mobileOpen={td.filtersOpen}
      />

      <div className="flex justify-end md:justify-end">
        <Button
          type="button"
          onClick={() => openEditor("add")}
          variant="tab"
          size="sm"
          aria-selected
          className="w-full md:w-auto px-4"
        >
          Добавить
        </Button>
      </div>

      {/* MOBILE */}
      <div className="md:hidden">
        <MobileCards
          rows={td.rows}
          columns={columns}
          tab={td.tab}
          onEdit={(r) => openEditor("edit", r)}
          onDelete={deleteRow}
          page={td.page}
          pageSize={td.pageSize}
          loading={td.loading}
        />
      </div>

      {/* DESKTOP */}
      <div className="hidden md:block overflow-auto rounded-xl border border-slate-700">
        <table className="min-w-[760px] md:min-w-[980px] w-full text-sm">
          <thead className="bg-[#0f1b44] text-slate-200">
            <tr>
              <th className="text-left px-3 py-2 font-semibold">#</th>
              {columns.map((c) => (
                <th key={c.key} className="text-left px-3 py-2 font-semibold">
                  {c.title}
                </th>
              ))}
              <th className="text-right px-3 py-2 font-semibold">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {td.rows.length === 0 && !td.loading ? (
              <tr>
                <td
                  colSpan={1 + columns.length + 1}
                  className="px-3 py-6 text-center text-slate-400"
                >
                  Пусто
                </td>
              </tr>
            ) : (
              td.rows.map((r, idx) => (
                <tr
                  key={`${td.tab}-${idx}`}
                  className="group hover:bg-[#0c173a]"
                >
                  <td className="px-3 py-2 group-hover:text-[#17e1b1]">
                    {(td.page - 1) * td.pageSize + idx + 1}
                  </td>
                  {columns.map((c) => (
                    <td
                      key={c.key}
                      className="px-3 py-2 group-hover:text-[#17e1b1]"
                    >
                      {c.render ? c.render(r[c.key], r) : r[c.key] ?? "—"}
                    </td>
                  ))}
                  <td className="px-3 py-2 text-right whitespace-nowrap">
                    <button
                      onClick={() => openEditor("edit", r)}
                      className="px-2 py-1 rounded bg-sky-700 hover:bg-sky-600 text-white mr-2"
                    >
                      Изм.
                    </button>
                    <button
                      onClick={() => deleteRow(r)}
                      className="px-2 py-1 rounded bg-rose-700 hover:bg-rose-600 text-white"
                    >
                      Удал.
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Пагинация */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">На странице:</span>
          <select
            value={td.pageSize}
            onChange={(e) => {
              td.setPageSize(Number(e.target.value));
              td.setPage(1);
            }}
            className="bg-[#0b1533] border border-slate-700 rounded-lg px-2 py-1 text-slate-100"
          >
            {[25, 50, 100, 200, 500].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            onClick={() => td.setPage((p) => Math.max(1, p - 1))}
            disabled={td.page <= 1 || td.loading}
            variant="tab"
            size="sm"
            className="px-4"
          >
            Назад
          </Button>
          <span className="text-sm text-slate-500">
            стр. {td.page} / {td.pages}
          </span>
          <Button
            type="button"
            onClick={() => td.setPage((p) => Math.min(td.pages, p + 1))}
            disabled={td.page >= td.pages || td.loading}
            variant="tab"
            size="sm"
            className="px-4"
          >
            Вперёд
          </Button>
        </div>
      </div>

      {/* модалка редактора — как было */}
      <EditorModal
        open={editorOpen}
        mode={editorMode}
        tab={td.tab}
        schema={allSchemas[td.tab]}
        form={form}
        setForm={setForm}
        onClose={() => setEditorOpen(false)}
        onSave={saveEditor}
      />
    </div>
  );
}
