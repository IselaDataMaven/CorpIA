import { useEffect, useMemo, useState } from "react";
import {
  HiOutlinePlus,
  HiOutlineMagnifyingGlass,
  HiOutlinePencilSquare,
  HiOutlineUserMinus,
  HiOutlineUserPlus,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
} from "react-icons/hi2";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import TextField from "../../components/common/TextField";
import { SkeletonRow } from "../../components/common/Skeleton";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { getErrorMessage } from "../../utils/errors";
import {
  listUsers,
  createUser,
  updateUser,
  deactivateUser,
  reactivateUser,
} from "../../api/usersApi";

const ROLE_OPTIONS = [
  { value: "admin", label: "Administrador" },
  { value: "hr", label: "Recursos Humanos" },
  { value: "marketing", label: "Marketing" },
  { value: "it", label: "TI" },
  { value: "finance", label: "Finanzas" },
];
const ROLE_LABELS = Object.fromEntries(ROLE_OPTIONS.map((r) => [r.value, r.label]));
const PAGE_SIZE = 6;

const emptyCreateForm = {
  username: "",
  password: "",
  full_name: "",
  role_key: "hr",
  department: "",
};

function formatDate(iso) {
  if (!iso) return "Nunca";
  return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export default function Users() {
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();
  const isAdmin = currentUser?.roleKey === "admin";

  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState(emptyCreateForm);
  const [isSaving, setIsSaving] = useState(false);

  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState(null);

  const [confirmTarget, setConfirmTarget] = useState(null); // { user, action: "deactivate" | "reactivate" }

  const refresh = () => {
    listUsers()
      .then(setUsers)
      .catch((err) => showToast(getErrorMessage(err), "error"))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        !search.trim() ||
        u.full_name.toLowerCase().includes(search.toLowerCase()) ||
        u.username.toLowerCase().includes(search.toLowerCase());
      const matchesRole = roleFilter === "all" || u.role_key === roleFilter;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && u.is_active) ||
        (statusFilter === "inactive" && !u.is_active);
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [search, roleFilter, statusFilter]);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await createUser(createForm);
      showToast("Usuario creado correctamente.", "success");
      setIsCreateOpen(false);
      setCreateForm(emptyCreateForm);
      refresh();
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    } finally {
      setIsSaving(false);
    }
  };

  const openEdit = (u) => {
    setEditingUser(u);
    setEditForm({ full_name: u.full_name, role_key: u.role_key, department: u.department });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateUser(editingUser.id, editForm);
      showToast("Usuario actualizado.", "success");
      setEditingUser(null);
      refresh();
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmAction = async () => {
    const { user: target, action } = confirmTarget;
    setIsSaving(true);
    try {
      if (action === "deactivate") {
        await deactivateUser(target.id);
        showToast(`${target.full_name} desactivado.`, "success");
      } else {
        await reactivateUser(target.id);
        showToast(`${target.full_name} reactivado.`, "success");
      }
      setConfirmTarget(null);
      refresh();
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)] dark:text-[var(--color-text-dark)]">
            Usuarios
          </h1>
          <p className="mt-1 text-[var(--color-text-secondary)]">
            Personas con acceso a CorpIA en tu organización.
          </p>
        </div>
        {isAdmin && (
          <Button icon={HiOutlinePlus} onClick={() => setIsCreateOpen(true)}>
            Nuevo usuario
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <HiOutlineMagnifyingGlass className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o usuario..."
            className="w-full rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface-light)] py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[var(--color-primary)] dark:bg-white/5 dark:border-white/10 dark:text-[var(--color-text-dark)]"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface-light)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-primary)] dark:bg-white/5 dark:border-white/10 dark:text-[var(--color-text-dark)]"
        >
          <option value="all">Todos los roles</option>
          {ROLE_OPTIONS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface-light)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-primary)] dark:bg-white/5 dark:border-white/10 dark:text-[var(--color-text-dark)]"
        >
          <option value="all">Todos los estados</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
        </select>
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[var(--color-border)]/60 text-xs uppercase tracking-wide text-[var(--color-text-secondary)] dark:border-white/10">
            <tr>
              <th className="px-5 py-3 font-medium">Usuario</th>
              <th className="px-5 py-3 font-medium">Rol</th>
              <th className="px-5 py-3 font-medium">Departamento</th>
              <th className="px-5 py-3 font-medium">Estado</th>
              <th className="px-5 py-3 font-medium">Último acceso</th>
              {isAdmin && <th className="px-5 py-3 font-medium text-right">Acciones</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]/40 dark:divide-white/5">
            {isLoading &&
              Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} columns={6} />)}
            {!isLoading && pageItems.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-[var(--color-text-secondary)]">
                  No hay usuarios que coincidan con la búsqueda.
                </td>
              </tr>
            )}
            {pageItems.map((u) => (
              <tr key={u.id}>
                <td className="flex items-center gap-3 px-5 py-3.5">
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
                    style={{ backgroundColor: u.avatar_color || "#2563EB" }}
                  >
                    {u.full_name
                      ?.split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")}
                  </div>
                  <div>
                    <p className="font-medium text-[var(--color-text-primary)] dark:text-[var(--color-text-dark)]">
                      {u.full_name}
                    </p>
                    <p className="text-xs text-[var(--color-text-secondary)]">{u.username}</p>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-[var(--color-text-secondary)]">
                  {ROLE_LABELS[u.role_key] || u.role_key}
                </td>
                <td className="px-5 py-3.5 text-[var(--color-text-secondary)]">{u.department}</td>
                <td className="px-5 py-3.5">
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                      u.is_active ? "text-[var(--color-success)]" : "text-[var(--color-text-secondary)]"
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${
                        u.is_active ? "bg-[var(--color-success)]" : "bg-[var(--color-border)]"
                      }`}
                    />
                    {u.is_active ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-xs text-[var(--color-text-secondary)]">
                  {formatDate(u.last_login_at)}
                </td>
                {isAdmin && (
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(u)}
                        title="Editar"
                        className="rounded-lg p-2 text-[var(--color-text-secondary)] hover:bg-black/5 hover:text-[var(--color-primary)] dark:hover:bg-white/5"
                      >
                        <HiOutlinePencilSquare size={16} />
                      </button>
                      {u.is_active ? (
                        <button
                          onClick={() => setConfirmTarget({ user: u, action: "deactivate" })}
                          disabled={u.id === currentUser?.id}
                          title={u.id === currentUser?.id ? "No puedes desactivarte a ti mismo" : "Desactivar"}
                          className="rounded-lg p-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-error)]/10 hover:text-[var(--color-error)] disabled:opacity-30"
                        >
                          <HiOutlineUserMinus size={16} />
                        </button>
                      ) : (
                        <button
                          onClick={() => setConfirmTarget({ user: u, action: "reactivate" })}
                          title="Reactivar"
                          className="rounded-lg p-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-success)]/10 hover:text-[var(--color-success)]"
                        >
                          <HiOutlineUserPlus size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-lg p-2 text-[var(--color-text-secondary)] hover:bg-black/5 disabled:opacity-30 dark:hover:bg-white/5"
          >
            <HiOutlineChevronLeft size={18} />
          </button>
          <span className="text-sm text-[var(--color-text-secondary)]">
            Página {page} de {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="rounded-lg p-2 text-[var(--color-text-secondary)] hover:bg-black/5 disabled:opacity-30 dark:hover:bg-white/5"
          >
            <HiOutlineChevronRight size={18} />
          </button>
        </div>
      )}

      {/* Modal: crear usuario */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Nuevo usuario">
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <TextField
            label="Nombre completo"
            required
            value={createForm.full_name}
            onChange={(e) => setCreateForm((p) => ({ ...p, full_name: e.target.value }))}
          />
          <TextField
            label="Usuario"
            required
            placeholder="nombre.apellido"
            value={createForm.username}
            onChange={(e) => setCreateForm((p) => ({ ...p, username: e.target.value }))}
          />
          <TextField
            label="Contraseña"
            type="password"
            required
            value={createForm.password}
            onChange={(e) => setCreateForm((p) => ({ ...p, password: e.target.value }))}
          />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--color-text-secondary)]">
              Rol
            </label>
            <select
              value={createForm.role_key}
              onChange={(e) => setCreateForm((p) => ({ ...p, role_key: e.target.value }))}
              className="w-full rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface-light)] px-4 py-2.5 text-sm outline-none focus:border-[var(--color-primary)] dark:bg-white/5 dark:border-white/10 dark:text-[var(--color-text-dark)]"
            >
              {ROLE_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
          <TextField
            label="Departamento"
            required
            value={createForm.department}
            onChange={(e) => setCreateForm((p) => ({ ...p, department: e.target.value }))}
          />
          <Button type="submit" isLoading={isSaving} className="w-full">
            Crear usuario
          </Button>
        </form>
      </Modal>

      {/* Modal: editar usuario */}
      <Modal isOpen={!!editingUser} onClose={() => setEditingUser(null)} title="Editar usuario">
        {editForm && (
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <TextField
              label="Nombre completo"
              required
              value={editForm.full_name}
              onChange={(e) => setEditForm((p) => ({ ...p, full_name: e.target.value }))}
            />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--color-text-secondary)]">
                Rol
              </label>
              <select
                value={editForm.role_key}
                onChange={(e) => setEditForm((p) => ({ ...p, role_key: e.target.value }))}
                className="w-full rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface-light)] px-4 py-2.5 text-sm outline-none focus:border-[var(--color-primary)] dark:bg-white/5 dark:border-white/10 dark:text-[var(--color-text-dark)]"
              >
                {ROLE_OPTIONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
            <TextField
              label="Departamento"
              required
              value={editForm.department}
              onChange={(e) => setEditForm((p) => ({ ...p, department: e.target.value }))}
            />
            <Button type="submit" isLoading={isSaving} className="w-full">
              Guardar cambios
            </Button>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!confirmTarget}
        onClose={() => setConfirmTarget(null)}
        onConfirm={handleConfirmAction}
        title={confirmTarget?.action === "deactivate" ? "Desactivar usuario" : "Reactivar usuario"}
        description={
          confirmTarget?.action === "deactivate"
            ? `${confirmTarget?.user.full_name} no podrá iniciar sesión hasta que lo reactives.`
            : `${confirmTarget?.user.full_name} podrá volver a iniciar sesión.`
        }
        confirmLabel={confirmTarget?.action === "deactivate" ? "Desactivar" : "Reactivar"}
        isDanger={confirmTarget?.action === "deactivate"}
        isLoading={isSaving}
      />
    </div>
  );
}
