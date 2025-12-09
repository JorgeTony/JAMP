import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getWithAuth, postWithAuth } from '../../utils/api';

type Transaccion = {
  id: number;
  producto: string | null;
  almacen: string | null;
  cantidad: number | string | null; // puede venir raro del backend
  codigo: string | null;
  estado: string | null;
  fecha: string | null;
  observaciones: string | null;
  tipo: string | null;
  usuario: string | null;
};

type TransaccionVista = {
  id: number;
  fecha: string;
  hora: string;
  producto: string;
  almacen: string;
  tipo: string;
  cantidad: string; // guardamos lo que venga como texto
  usuario: string;
  referencia: string;
};

// 🔹 Nuevo tipo SOLO para el POST (no incluye estado)
type NuevaTransaccionPayload = {
  producto: string;
  almacen: string;
  cantidad: number;
  codigo: string | null;
  fecha: string;
  observaciones: string | null;
  tipo: 'ENTRADA' | 'SALIDA' | 'OTROS';
  usuario: string;
};

export default function Kardex() {
  const navigate = useNavigate();

  const [movimientos, setMovimientos] = useState<TransaccionVista[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [formProducto, setFormProducto] = useState('');
  const [formAlmacen, setFormAlmacen] = useState('');
  const [formTipo, setFormTipo] = useState<'ENTRADA' | 'SALIDA' | 'OTROS'>('ENTRADA');
  const [formCantidad, setFormCantidad] = useState<number>(0);
  const [formObs, setFormObs] = useState('');
  const [saving, setSaving] = useState(false);

  // =============== CARGAR TRANSACCIONES ==================
  const loadTransacciones = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getWithAuth<Transaccion[]>('/transacciones/api');
      console.log('Transacciones recibidas para Kardex:', data);

      const mapped: TransaccionVista[] = (data || []).map((t) => {
        let fechaStr = '';
        let horaStr = '';

        if (t.fecha) {
          if (t.fecha.includes('T')) {
            const [f, h] = t.fecha.split('T');
            fechaStr = f;
            horaStr = (h || '').slice(0, 5);
          } else {
            const [f, h] = t.fecha.split(' ');
            fechaStr = f;
            horaStr = (h || '').slice(0, 5);
          }
        }

        // cantidad cruda en texto (puede ser "-1", "--1", "1", etc.)
        const cantidadRaw =
          t.cantidad === null || t.cantidad === undefined
            ? '0'
            : t.cantidad.toString();

        return {
          id: t.id,
          fecha: fechaStr || '-',
          hora: horaStr || '',
          producto: t.producto ?? '-',
          almacen: t.almacen ?? '-',
          tipo: t.tipo ? t.tipo.toUpperCase() : '-',
          cantidad: cantidadRaw,
          usuario: t.usuario ?? '-',
          referencia: t.codigo ?? '-',
        };
      });

      console.log('Transacciones MAPEADAS para mostrar:', mapped);
      setMovimientos(mapped);
    } catch (err) {
      console.error('Error cargando transacciones para Kardex:', err);
      setError('No se pudo cargar el kardex. Verifica el backend.');
      setMovimientos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('KARDEX COMPONENT MONTADO');
    loadTransacciones();
  }, []);

  // =============== GUARDAR NUEVO MOVIMIENTO ==================
  const handleGuardarMovimiento = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formProducto.trim() || !formAlmacen.trim() || formCantidad <= 0) {
      alert('Producto, almacén y cantidad deben estar completos.');
      return;
    }

    try {
      setSaving(true);

      let usuario = 'Sistema';
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          usuario = user.name || user.username || 'Sistema';
        }
      } catch {
        // ignore
      }

      const now = new Date();
      const isoFecha = now.toISOString();

      // Siempre mandamos cantidad con signo correcto:
      // ENTRADA -> +N, SALIDA -> -N
      const cantidadFinal =
        formTipo === 'SALIDA' ? -Math.abs(formCantidad) : Math.abs(formCantidad);

      const nuevaTransaccion: NuevaTransaccionPayload = {
        producto: formProducto,
        almacen: formAlmacen,
        cantidad: cantidadFinal,
        codigo: null, // el backend genera el código real
        fecha: isoFecha,
        observaciones: formObs || null,
        tipo: formTipo,
        usuario,
      };

      await postWithAuth('/transacciones/api', nuevaTransaccion);
      await loadTransacciones();

      setFormProducto('');
      setFormAlmacen('');
      setFormTipo('ENTRADA');
      setFormCantidad(0);
      setFormObs('');
      setShowModal(false);
    } catch (err) {
      console.error('Error al guardar el movimiento:', err);
      alert('No se pudo guardar el movimiento. Revisa la consola/servidor.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <header className="bg-blue-600 text-white shadow">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500">
              <i className="ri-archive-line text-lg" />
            </div>
            <button
              onClick={() => navigate('/')}
              className="text-lg font-bold hover:text-blue-200"
            >
              Control de Inventario
            </button>
          </div>
        </div>
      </header>

      {/* CONTENIDO */}
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Kardex de Inventario</h2>
            <p className="text-gray-600">
              Registro histórico de entradas y salidas por producto
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <i className="ri-add-line mr-2 text-lg" />
            Nuevo Movimiento
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Fecha/Hora
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Producto
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                    Cantidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Referencia
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 bg-white">
                {loading && (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                      Cargando movimientos...
                    </td>
                  </tr>
                )}

                {!loading &&
                  movimientos.map((m) => {
                    // 🔧 Normalizamos cantidad para mostrarla SIEMPRE bien:
                    // 1. Quitamos todos los guiones de delante ("--1" -> "1")
                    // 2. Convertimos a número y tomamos valor absoluto
                    const raw = (m.cantidad ?? '0').toString();
                    const sinGuiones = raw.replace(/^-+/, '');
                    const num = Math.abs(Number(sinGuiones) || 0);
                    const cantidadFormateada =
                      m.tipo === 'SALIDA' ? `-${num}` : `${num}`;

                    return (
                      <tr key={m.id} className="hover:bg-gray-50">
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {m.fecha}
                          </div>
                          <div className="text-xs text-gray-500">{m.hora}</div>
                        </td>

                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="text-sm font-semibold text-gray-900">
                            {m.producto}
                          </div>
                          <div className="text-xs text-gray-500">{m.almacen}</div>
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 text-center">
                          <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                            {m.tipo}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 text-center">
                          <span
                            className={`text-sm font-semibold ${
                              m.tipo === 'SALIDA'
                                ? 'text-red-500'
                                : 'text-blue-600'
                            }`}
                          >
                            {cantidadFormateada}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-6 py-4">
                          <span className="text-sm text-gray-900">
                            {m.usuario}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-6 py-4">
                          <span className="text-sm text-gray-700">
                            {m.referencia}
                          </span>
                        </td>
                      </tr>
                    );
                  })}

                {!loading && movimientos.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                      No hay movimientos registrados en el kardex.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* MODAL NUEVO MOVIMIENTO */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Nuevo Movimiento
              </h3>
              <button
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                onClick={() => !saving && setShowModal(false)}
              >
                <i className="ri-close-line text-xl" />
              </button>
            </div>

            <form onSubmit={handleGuardarMovimiento} className="space-y-4 px-6 py-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Producto *
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  value={formProducto}
                  onChange={(e) => setFormProducto(e.target.value)}
                  disabled={saving}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Almacén *
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  value={formAlmacen}
                  onChange={(e) => setFormAlmacen(e.target.value)}
                  disabled={saving}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Tipo
                  </label>
                  <select
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    value={formTipo}
                    onChange={(e) =>
                      setFormTipo(e.target.value as 'ENTRADA' | 'SALIDA' | 'OTROS')
                    }
                    disabled={saving}
                  >
                    <option value="ENTRADA">Entrada</option>
                    <option value="SALIDA">Salida</option>
                    <option value="OTROS">Otros</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Cantidad *
                  </label>
                  <input
                    type="number"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    value={formCantidad}
                    onChange={(e) => {
                      const val = e.target.value;
                      const num = Number(val);

                      if (isNaN(num)) {
                        setFormCantidad(0);
                      } else {
                        setFormCantidad(Math.abs(num));
                      }
                    }}
                    min={0}
                    disabled={saving}
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Observaciones
                </label>
                <textarea
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  value={formObs}
                  onChange={(e) => setFormObs(e.target.value)}
                  disabled={saving}
                />
              </div>

              <div className="flex items-center justify-end space-x-3 border-t px-6 py-4">
                <button
                  type="button"
                  onClick={() => !saving && setShowModal(false)}
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100"
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {saving ? 'Guardando...' : 'Guardar Movimiento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
