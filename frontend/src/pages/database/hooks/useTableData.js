import { useEffect, useMemo, useState } from "react";
import { loadRows } from "../api/databaseApi";

export default function useTableData(initialTab = "chats") {
  // вкладки
  const tabs = ["chats", "messages", "orders", "reservations"];
  const [tab, setTab] = useState(initialTab);

  // список
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  // пагинация/поиск
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [q, setQ] = useState({ input: "", value: "" });

  // фильтры
  const [filtersDraft, setFiltersDraft] = useState({});
  const [filtersApplied, setFiltersApplied] = useState({});
  const [filtersOpen, setFiltersOpen] = useState(false);
  const applyFilters = () => { setFiltersApplied(filtersDraft); setPage(1); setFiltersOpen(false); };
  const resetFilters = () => { setFiltersDraft({}); setFiltersApplied({}); setPage(1); };

  // загрузка данных
  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      setLoading(true);
      try {
        const { items, total } = await loadRows(tab, {
          page, pageSize, qValue: q.value, filters: filtersApplied, signal: controller.signal,
        });
        setRows(items); setTotal(total);
      } catch (e) {
        if (e.name !== "AbortError") console.error(e);
        setRows([]); setTotal(0);
      } finally {
        setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [tab, page, pageSize, q.value, filtersApplied]);

  // смена вкладки со сбросами
  const switchTab = (t) => {
    setTab(t);
    setPage(1);
    setQ({ input: "", value: "" });
    setFiltersDraft({});
    setFiltersApplied({});
    setFiltersOpen(false);
  };

  const pages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);

  return {
    tabs, tab, switchTab,
    rows, loading, total,
    page, setPage, pageSize, setPageSize, pages,
    q, setQ,
    filtersDraft, setFiltersDraft, filtersApplied,
    filtersOpen, setFiltersOpen, applyFilters, resetFilters,
  };
}
