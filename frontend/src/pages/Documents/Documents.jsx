import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { HiOutlineDocumentText, HiOutlineArrowTopRightOnSquare } from "react-icons/hi2";
import Card from "../../components/common/Card";
import { listDocuments } from "../../api/documentsApi";

const STATUS_COLORS = {
  indexed: "var(--color-success)",
  indexing: "var(--color-warning)",
  pending: "var(--color-text-secondary)",
  error: "var(--color-error)",
};

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function Documents() {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    listDocuments()
      .then(setDocuments)
      .catch(() => setError("No se pudo conectar con el backend."))
      .finally(() => setIsLoading(false));
  }, []);

  const totalChunks = documents.reduce((sum, d) => sum + (d.chunk_count || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)] dark:text-[var(--color-text-dark)]">
            Documentos
          </h1>
          <p className="mt-1 text-[var(--color-text-secondary)]">
            Vista detallada de todos los archivos indexados en la base de conocimiento.
          </p>
        </div>
        <Link
          to="/knowledge-base"
          className="flex items-center gap-1.5 text-sm font-medium text-[var(--color-primary)] hover:underline"
        >
          Subir o gestionar documentos <HiOutlineArrowTopRightOnSquare size={15} />
        </Link>
      </div>

      {error && (
        <div className="rounded-xl bg-[var(--color-error)]/10 px-4 py-3 text-sm text-[var(--color-error)]">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <Card className="p-5">
          <p className="text-sm text-[var(--color-text-secondary)]">Total de documentos</p>
          <p className="mt-1 text-2xl font-bold text-[var(--color-text-primary)] dark:text-[var(--color-text-dark)]">
            {isLoading ? "…" : documents.length}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-[var(--color-text-secondary)]">Indexados correctamente</p>
          <p className="mt-1 text-2xl font-bold text-[var(--color-success)]">
            {isLoading ? "…" : documents.filter((d) => d.status === "indexed").length}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-[var(--color-text-secondary)]">Fragmentos totales</p>
          <p className="mt-1 text-2xl font-bold text-[var(--color-text-primary)] dark:text-[var(--color-text-dark)]">
            {isLoading ? "…" : totalChunks}
          </p>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[var(--color-border)]/60 text-xs uppercase tracking-wide text-[var(--color-text-secondary)] dark:border-white/10">
            <tr>
              <th className="px-5 py-3 font-medium">Documento</th>
              <th className="px-5 py-3 font-medium">Formato</th>
              <th className="px-5 py-3 font-medium">Subido</th>
              <th className="px-5 py-3 font-medium">Indexado</th>
              <th className="px-5 py-3 font-medium">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]/40 dark:divide-white/5">
            {!isLoading && documents.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-[var(--color-text-secondary)]">
                  Todavía no hay documentos indexados.
                </td>
              </tr>
            )}
            {documents.map((doc) => (
              <tr key={doc.id}>
                <td className="flex items-center gap-3 px-5 py-3.5">
                  <HiOutlineDocumentText className="text-[var(--color-text-secondary)]" size={18} />
                  <span className="font-medium text-[var(--color-text-primary)] dark:text-[var(--color-text-dark)]">
                    {doc.original_name}
                  </span>
                </td>
                <td className="px-5 py-3.5 uppercase text-[var(--color-text-secondary)]">
                  {doc.extension}
                </td>
                <td className="px-5 py-3.5 text-[var(--color-text-secondary)]">
                  {formatDate(doc.created_at)}
                </td>
                <td className="px-5 py-3.5 text-[var(--color-text-secondary)]">
                  {formatDate(doc.indexed_at)}
                </td>
                <td className="px-5 py-3.5">
                  <span
                    className="text-xs font-semibold"
                    style={{ color: STATUS_COLORS[doc.status] || STATUS_COLORS.pending }}
                  >
                    {doc.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
