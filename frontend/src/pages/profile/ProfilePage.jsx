// pages/profile/ProfilePage.jsx
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useProfile } from './hooks/useProfile';
import { fmtDateTime as fmt } from './utils/format';
import { Info } from './components/Info';

/**
 * Страница профиля:
 * - показывает данные пользователя или skeleton/сообщение об ошибке
 * - позволяет выйти, обновить профиль, очистить локальные токены
 */
export default function ProfilePage() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const {
    user, loading, err, onLogout, refresh, clearLocal, initial,
  } = useProfile({ navigate, logout });

  return (
    <div className="flex-1 p-6">
      <h1 className="text-xl font-semibold mb-6">Профиль</h1>

      <div className="bg-white rounded-2xl shadow p-6">
        {loading ? (
          <Skeleton />
        ) : user ? (
          <>
            {/* Шапка профиля: аватарка с инициалом + имя и почта */}
            <div className="flex items-center gap-4 mb-6">
              <div className="h-16 w-16 rounded-full bg-emerald-600 text-white flex items-center justify-center text-2xl font-bold">
                {initial}
              </div>
              <div>
                <div className="text-xl font-semibold">
                  {user.fullName || user.full_name || 'Без имени'}
                </div>
                <div className="text-slate-600">{user.email}</div>
              </div>
            </div>

            {/* Сообщение об ошибке (если было при последней операции) */}
            {err && <div className="text-sm text-red-600 mb-3">{err}</div>}

            {/* Ключевые поля профиля */}
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <Info label="Роль" value={user.role} />
              <Info
                label="Статус"
                value={
                  user.is_active === undefined
                    ? '—'
                    : user.is_active
                      ? 'Активен'
                      : 'Отключён'
                }
              />
              <Info label="Последний вход" value={fmt(user.last_login_at)} />
              <Info label="Аккаунт создан" value={fmt(user.created_at)} />
            </div>

            {/* Действия */}
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={onLogout}
                className="px-4 py-2 rounded-xl bg-[#154c5b] text-white font-semibold hover:opacity-90"
                title="Выйти из аккаунта и очистить локальные токены"
              >
                Выйти из аккаунта
              </button>

              <button
                type="button"
                onClick={refresh}
                className="px-4 py-2 rounded-xl border font-semibold hover:bg-slate-50"
                title="Перезагрузить данные профиля"
              >
                Обновить данные
              </button>

              <button
                type="button"
                onClick={clearLocal}
                className="px-4 py-2 rounded-xl bg-red-600 text-white font-semibold hover:opacity-90"
                title="Очистить локальный токен и вернуться на страницу входа"
              >
                Очистить токен и выйти
              </button>
            </div>
          </>
        ) : (
          // Нет пользователя (например, неавторизован)
          <div className="text-slate-600">
            Пользователь не найден. Возможно, токен истёк.{' '}
            <button
              type="button"
              onClick={clearLocal}
              className="underline text-emerald-700"
              title="Очистить локальные токены и перейти к авторизации"
            >
              Войти заново
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Скелетон-заглушка на время загрузки профиля.
 */
function Skeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-16 w-16 rounded-full bg-slate-200 mb-4" />
      <div className="h-5 w-48 bg-slate-200 mb-2" />
      <div className="h-4 w-64 bg-slate-200 mb-6" />
      <div className="grid md:grid-cols-2 gap-4">
        <div className="h-10 bg-slate-200 rounded" />
        <div className="h-10 bg-slate-200 rounded" />
        <div className="h-10 bg-slate-200 rounded" />
        <div className="h-10 bg-slate-200 rounded" />
      </div>
    </div>
  );
}
