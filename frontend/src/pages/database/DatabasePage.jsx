// pages/database/DatabasePage.jsx

import { useMemo, useState } from 'react';
import Button from '@/components/Button';

import { TAB_TITLES, schema as SCHEMAS } from './config/constants'; // РµРґРёРЅС‹Р№ РёРјРїРѕСЂС‚ СЃС…РµРј
import { fmtDate } from './utils/format';
import { isPlaceholderId, makePlaceholderId } from './utils/placeholders';

import Badge from './components/Badge';
import Toolbar from './components/Toolbar';
import FilterBar from './components/FilterBar';
import MobileCards from './components/MobileCards';
import EditorModal from './components/EditorModal';

import {
  saveRow as apiSaveRow,
  deleteRow as apiDeleteRow,
} from './api/databaseApi';
import useTableData from './hooks/useTableData';

// РґРѕРїСѓСЃС‚РёРјС‹Рµ РїР»Р°С‚С„РѕСЂРјС‹ РґР»СЏ orders/reservations
const ALLOWED_PLATFORMS = ['telegram', 'vk'];

export default function DatabasePage() {
  // РҐСѓРє РёРЅРєР°РїСЃСѓР»РёСЂСѓРµС‚ Р·Р°РіСЂСѓР·РєСѓ С‚Р°Р±Р»РёС†С‹, РїР°РіРёРЅР°С†РёСЋ, С„РёР»СЊС‚СЂС‹, РїРѕРёСЃРє Рё Р°РєС‚РёРІРЅСѓСЋ РІРєР»Р°РґРєСѓ
  const td = useTableData('chats');

  // РЎРѕСЃС‚РѕСЏРЅРёРµ РјРѕРґР°Р»РєРё-СЂРµРґР°РєС‚РѕСЂР°
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState('add'); // 'add' | 'edit'
  const [form, setForm] = useState({}); // Р·РЅР°С‡РµРЅРёСЏ РїРѕР»РµР№ С‚РµРєСѓС‰РµР№ С„РѕСЂРјС‹

  // РљРѕРЅС„РёРіСѓСЂР°С†РёСЏ РєРѕР»РѕРЅРѕРє РґР»СЏ С‚РµРєСѓС‰РµР№ РІРєР»Р°РґРєРё (РјРµРјРѕРёР·Р°С†РёСЏ РїРѕ РёРјРµРЅРё РІРєР»Р°РґРєРё)
  const columns = useMemo(() => {
    switch (td.tab) {
      case 'chats':
        return [
          {
            key: 'chat_id',
            title: 'ID С‡Р°С‚Р°',
            // Р”Р»СЏ placeholder-ID РїРѕРєР°Р·С‹РІР°РµРј В«вЂ”В»
            render: (v) => (isPlaceholderId(v) ? 'вЂ”' : v),
          },
          { key: 'username', title: 'Р®Р·РµСЂРЅРµР№Рј' },
          { key: 'first_name', title: 'РРјСЏ' },
          { key: 'last_name', title: 'Р¤Р°РјРёР»РёСЏ' },
          {
            key: 'platform',
            title: 'РџР»Р°С‚С„РѕСЂРјР°',
            render: (v) => <Badge>{v || 'вЂ”'}</Badge>,
          },
        ];
      case 'messages':
        return [
          { key: 'id', title: 'ID' },
          { key: 'chat_id', title: 'ID С‡Р°С‚Р°' },
          { key: 'username', title: 'Р®Р·РµСЂРЅРµР№Рј' },
          {
            key: 'from_me',
            title: 'РћС‚РїСЂР°РІРёС‚РµР»СЊ',
            render: (v) => <Badge>{v ? 'РћРїРµСЂР°С‚РѕСЂ' : 'РљР»РёРµРЅС‚'}</Badge>,
          },
          { key: 'text', title: 'РЎРѕРѕР±С‰РµРЅРёРµ' },
          { key: 'date', title: 'Р”Р°С‚Р° Рё РІСЂРµРјСЏ', render: fmtDate },
        ];
      case 'orders':
        return [
          { key: 'id', title: 'ID' },
          { key: 'tg_username', title: 'TG СЋР·РµСЂРЅРµР№Рј' },
          { key: 'name', title: 'РРјСЏ' },
          { key: 'phone', title: 'РўРµР»РµС„РѕРЅ' },
          { key: 'order_type', title: 'РўРёРї Р·Р°РєР°Р·Р°' },
          { key: 'date', title: 'Р”Р°С‚Р°' },
          { key: 'time', title: 'Р’СЂРµРјСЏ' },
          { key: 'total', title: 'РЎСѓРјРјР°' },
          {
            key: 'platform',
            title: 'РџР»Р°С‚С„РѕСЂРјР°',
            render: (v) => <Badge>{v || 'вЂ”'}</Badge>,
          },
          { key: 'created_at', title: 'РЎРѕР·РґР°РЅРѕ', render: fmtDate },
        ];
      default:
        // reservations (Рё РїСЂРѕС‡РёРµ РІРєР»Р°РґРєРё РїРѕ СѓРјРѕР»С‡Р°РЅРёСЋ)
        return [
          { key: 'id', title: 'ID' },
          { key: 'tg_username', title: 'TG СЋР·РµСЂРЅРµР№Рј' },
          { key: 'name', title: 'РРјСЏ' },
          { key: 'phone', title: 'РўРµР»РµС„РѕРЅ' },
          { key: 'address', title: 'РђРґСЂРµСЃ' },
          { key: 'date', title: 'Р”Р°С‚Р°' },
          { key: 'time', title: 'Р’СЂРµРјСЏ' },
          { key: 'guests', title: 'Р“РѕСЃС‚РµР№' },
          {
            key: 'platform',
            title: 'РџР»Р°С‚С„РѕСЂРјР°',
            render: (v) => <Badge>{v || 'вЂ”'}</Badge>,
          },
          { key: 'created_at', title: 'РЎРѕР·РґР°РЅРѕ', render: fmtDate },
        ];
    }
  }, [td.tab]);

  // РћС‚РєСЂС‹С‚РёРµ СЂРµРґР°РєС‚РѕСЂР°: РїРѕРґРіРѕС‚Р°РІР»РёРІР°РµС‚ С„РѕСЂРјСѓ РїРѕ СЃС…РµРјРµ С‚РµРєСѓС‰РµР№ РІРєР»Р°РґРєРё
  function openEditor(mode, row = null) {
    setEditorMode(mode);
    const clean = {};
    for (const f of SCHEMAS[td.tab]) clean[f.key] = row?.[f.key] ?? '';
    setForm(clean);
    setEditorOpen(true);
  }

  // РЎРѕС…СЂР°РЅРµРЅРёРµ С„РѕСЂРјС‹: РЅРѕСЂРјР°Р»РёР·СѓРµС‚ С‚РёРїС‹ РїРѕ СЃС…РµРјРµ Рё РІС‹Р·С‹РІР°РµС‚ API
  async function saveEditor() {
    const body = { ...form };

    if (td.tab === 'chats') {
      // Р”Р»СЏ С‡Р°С‚РѕРІ РїРѕР»Рµ chat_id РґРѕРїСѓСЃРєР°РµС‚ placeholder (В«вЂ”В»). РРЅР°С‡Рµ вЂ” С‡РёСЃР»Рѕ.
      const raw = String(body.chat_id ?? '').trim();
      if (raw === '' || raw === '-') {
        body.chat_id = makePlaceholderId();
      } else {
        const n = Number(raw);
        if (!Number.isFinite(n)) {
          alert('ID С‡Р°С‚Р° РґРѕР»Р¶РµРЅ Р±С‹С‚СЊ С‡РёСЃР»РѕРј РёР»Рё РѕСЃС‚Р°РІСЊС‚Рµ В«вЂ”В»');
          return;
        }
        body.chat_id = n;
      }
    } else {
      // РџСЂРёРІРµРґРµРЅРёРµ С‚РёРїРѕРІ РїРѕ РѕРїРёСЃР°РЅРёСЋ СЃС…РµРјС‹: number, checkbox, readOnly
      for (const f of SCHEMAS[td.tab]) {
        if (f.readOnly) {
          delete body[f.key];
        } else if (f.type === 'number' && body[f.key] !== '') {
          body[f.key] = Number(body[f.key]);
        } else if (f.type === 'checkbox') {
          body[f.key] = !!body[f.key];
        }
      }
    }

    // Р’Р°Р»РёРґР°С†РёСЏ РїР»Р°С‚С„РѕСЂРјС‹ РґР»СЏ Р·Р°РєР°Р·РѕРІ Рё Р±СЂРѕРЅРµР№
    if (td.tab === 'orders' || td.tab === 'reservations') {
      if (!ALLOWED_PLATFORMS.includes(body.platform)) {
        alert('Р’С‹Р±РµСЂРёС‚Рµ РїР»Р°С‚С„РѕСЂРјСѓ: telegram РёР»Рё vk');
        return;
      }
    }

    try {
      await apiSaveRow(td.tab, editorMode, form, body);
      setEditorOpen(false);
      // РџСЂРѕСЃС‚РѕР№ РІР°СЂРёР°РЅС‚: Р¶С‘СЃС‚РєРѕ РѕР±РЅРѕРІР»СЏРµРј СЃС‚СЂР°РЅРёС†Сѓ, С‡С‚РѕР±С‹ С‚РѕС‡РЅРѕ СѓРІРёРґРµС‚СЊ РёР·РјРµРЅРµРЅРёСЏ
      // (РЅР° СЃР»СѓС‡Р°Р№, РµСЃР»Рё РєРµС€/СЃРѕСЃС‚РѕСЏРЅРёРµ РјРµС€Р°СЋС‚ РјРіРЅРѕРІРµРЅРЅРѕ СѓРІРёРґРµС‚СЊ СЂРµР·СѓР»СЊС‚Р°С‚)
      td.refresh();
    } catch (e) {
      alert(e.message || 'Save error');
    }
  }

  // РЈРґР°Р»РµРЅРёРµ СЃС‚СЂРѕРєРё СЃ РїРѕРґС‚РІРµСЂР¶РґРµРЅРёРµРј Рё РїРѕСЃР»РµРґСѓСЋС‰РµР№ РїРµСЂРµР·Р°РіСЂСѓР·РєРѕР№ РґР°РЅРЅС‹С…
  async function deleteRow(row) {
    // confirm вЂ” СЃРёРЅС…СЂРѕРЅРЅРѕРµ РїРѕРґС‚РІРµСЂР¶РґРµРЅРёРµ РІ Р±СЂР°СѓР·РµСЂРµ
    if (!confirm('РЈРґР°Р»РёС‚СЊ Р·Р°РїРёСЃСЊ?')) return;
    try {
      await apiDeleteRow(td.tab, row);
      // РџРѕСЃР»Рµ СѓРґР°Р»РµРЅРёСЏ С‚РѕР¶Рµ РѕР±РЅРѕРІР»СЏРµРј СЃС‚СЂР°РЅРёС†Сѓ С†РµР»РёРєРѕРј
      td.refresh();
    } catch (e) {
      alert(e.message);
    }
  }

  return (
    <div className="p-3 sm:p-4 lg:p-6 max-w-7xl mx-auto space-y-4">
      {/* Tabs */}
      <div className="overflow-x-auto -mx-1">
        <div
          className="flex gap-2 px-1 min-w-max snap-x snap-mandatory"
          role="tablist" // РєРѕРЅС‚РµР№РЅРµСЂ С‚Р°Р±РѕРІ РґР»СЏ a11y
          aria-label="Р Р°Р·РґРµР»С‹ Р±Р°Р·С‹ РґР°РЅРЅС‹С…"
        >
          {td.tabs.map((t) => (
            <Button
              key={t}
              onClick={() => td.switchTab(t)}
              variant="tab"
              size="sm"
              role="tab" // СЃР°Рј С‚Р°Р±
              aria-selected={td.tab === t}
              aria-controls={`panel-${t}`}
              id={`tab-${t}`}
              className="snap-start"
              type="button"
            >
              {TAB_TITLES[t]}
            </Button>
          ))}
        </div>
      </div>

      {/* РџР°РЅРµР»СЊ РёРЅСЃС‚СЂСѓРјРµРЅС‚РѕРІ: Р·Р°РіРѕР»РѕРІРѕРє, РїРѕРёСЃРє, СЃС‡РµС‚С‡РёРєРё, РёРЅРґРёРєР°С‚РѕСЂ Р·Р°РіСЂСѓР·РєРё */}
      <Toolbar
        title={`РўР°Р±Р»РёС†Р°: ${TAB_TITLES[td.tab]}`}
        q={td.q}
        setQ={td.setQ}
        onSearch={() => {
          td.setPage(1);
          td.setQ({ ...td.q, value: td.q.input.trim() });
        }}
        onClear={() => {
          td.setQ({ input: '', value: '' });
          td.setPage(1);
        }}
        total={td.total}
        loading={td.loading}
      />

      {/* Р¤РёР»СЊС‚СЂС‹ (РјРѕР±РёР»СЊРЅР°СЏ РєРЅРѕРїРєР° РїРѕРєР°Р·Р°С‚СЊ/СЃРєСЂС‹С‚СЊ) */}
      <div className="md:hidden">
        <button
          onClick={() => td.setFiltersOpen((v) => !v)}
          className="w-full rounded-lg px-3 py-2 bg-slate-700 text-white"
          type="button"
          aria-expanded={td.filtersOpen}
          aria-controls="filters-panel"
        >
          {td.filtersOpen ? 'РЎРєСЂС‹С‚СЊ С„РёР»СЊС‚СЂС‹' : 'РџРѕРєР°Р·Р°С‚СЊ С„РёР»СЊС‚СЂС‹'}
        </button>
      </div>

      {/* РџР°РЅРµР»СЊ С„РёР»СЊС‚СЂРѕРІ */}
      <FilterBar
        tab={td.tab}
        filters={td.filtersDraft}
        setFilters={td.setFiltersDraft}
        onApply={td.applyFilters}
        onReset={td.resetFilters}
        mobileOpen={td.filtersOpen}
      />

      {/* РљРЅРѕРїРєР° РґРѕР±Р°РІР»РµРЅРёСЏ Р·Р°РїРёСЃРё */}
      <div className="flex justify-end">
        <Button
          type="button"
          onClick={() => openEditor('add')}
          variant="tab"
          size="sm"
          aria-selected // РґРµРєРѕСЂР°С‚РёРІРЅС‹Р№ СЃС‚РёР»СЊ
          className="w-full md:w-auto px-4"
        >
          Р”РѕР±Р°РІРёС‚СЊ
        </Button>
      </div>

      {/* MOBILE: РєР°СЂС‚РѕС‡РєРё Р·Р°РїРёСЃРµР№ СЃРѕ РІСЃС‚СЂРѕРµРЅРЅС‹РјРё РґРµР№СЃС‚РІРёСЏРјРё */}
      <div className="md:hidden" id={`panel-${td.tab}`} role="tabpanel" aria-labelledby={`tab-${td.tab}`}>
        <MobileCards
          rows={td.rows}
          columns={columns}
          tab={td.tab}
          onEdit={(r) => openEditor('edit', r)}
          onDelete={deleteRow}
          page={td.page}
          pageSize={td.pageSize}
          loading={td.loading}
        />
      </div>

      {/* DESKTOP: С‚Р°Р±Р»РёС†Р° СЃРѕ СЃРїРёСЃРєРѕРј Р·Р°РїРёСЃРµР№ */}
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
              <th className="text-right px-3 py-2 font-semibold">Р”РµР№СЃС‚РІРёСЏ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {td.rows.length === 0 && !td.loading ? (
              <tr>
                <td
                  colSpan={1 + columns.length + 1}
                  className="px-3 py-6 text-center text-slate-400"
                >
                  РџСѓСЃС‚Рѕ
                </td>
              </tr>
            ) : (
              td.rows.map((r, idx) => {
                // РЎС‚Р°Р±РёР»СЊРЅС‹Р№ РєР»СЋС‡ РґР»СЏ СЃС‚СЂРѕРєРё: id > chat_id > fallback
                const rowKey = r.id ?? r.chat_id ?? `${td.tab}-${idx}`;
                return (
                  <tr key={rowKey} className="group hover:bg-[#0c173a]">
                    <td className="px-3 py-2 group-hover:text-[#17e1b1]">
                      {(td.page - 1) * td.pageSize + idx + 1}
                    </td>
                    {columns.map((c) => (
                      <td key={c.key} className="px-3 py-2 group-hover:text-[#17e1b1]">
                        {c.render ? c.render(r[c.key], r) : r[c.key] ?? 'вЂ”'}
                      </td>
                    ))}
                    <td className="px-3 py-2 text-right whitespace-nowrap">
                      <button
                        onClick={() => openEditor('edit', r)}
                        className="px-2 py-1 rounded bg-sky-700 hover:bg-sky-600 text-white mr-2"
                        type="button"
                      >
                        РР·Рј.
                      </button>
                      <button
                        onClick={() => deleteRow(r)}
                        className="px-2 py-1 rounded bg-rose-700 hover:bg-rose-600 text-white"
                        type="button"
                      >
                        РЈРґР°Р».
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* РџР°РіРёРЅР°С†РёСЏ: РІС‹Р±РѕСЂ СЂР°Р·РјРµСЂР° СЃС‚СЂР°РЅРёС†С‹ Рё РїРµСЂРµС…РѕРґ РїРѕ СЃС‚СЂР°РЅРёС†Р°Рј */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">РќР° СЃС‚СЂР°РЅРёС†Рµ:</span>
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
            РќР°Р·Р°Рґ
          </Button>
          <span className="text-sm text-slate-500">
            СЃС‚СЂ. {td.page} / {td.pages}
          </span>
          <Button
            type="button"
            onClick={() => td.setPage((p) => Math.min(td.pages, p + 1))}
            disabled={td.page >= td.pages || td.loading}
            variant="tab"
            size="sm"
            className="px-4"
          >
            Р’РїРµСЂС‘Рґ
          </Button>
        </div>
      </div>

      {/* РњРѕРґР°Р»РєР° СЂРµРґР°РєС‚РѕСЂР° Р·Р°РїРёСЃРµР№ */}
      <EditorModal
        open={editorOpen}
        mode={editorMode}
        tab={td.tab}
        schema={SCHEMAS[td.tab]}
        form={form}
        setForm={setForm}
        onClose={() => setEditorOpen(false)}
        onSave={saveEditor}
      />
    </div>
  );
}

