import { useCallback, useEffect, useRef, useState } from "react";
import {
  HiOutlineCloudArrowUp,
  HiOutlineDocumentText,
  HiOutlineTrash,
  HiOutlineArrowPath,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
  HiOutlineClock,
} from "react-icons/hi2";
import Card from "../../components/common/Card";
import {
  uploadDocument,
  listDocuments,
  deleteDocument,
  reindexDocument,
} from "../../api/documentsApi";

const ACCEPTED_EXTENSIONS = [
  "pdf", "docx", "pptx", "csv", "xlsx", "json", "txt", "html", "htm", "md",
];

const STATUS_CONFIG = {
  indexed: { label: "Indexado", color: "var(--color-success)", icon: HiOutlineCheckCircle },
  indexing: { label: "Indexando…", color: "var(--color-warning)", icon: HiOutlineClock },
  pending: { label: "Pendiente", color: "var(--color-text-secondary)", icon: HiOutlineClock },
  error: { label: "Error", color: "var(--color-error)", icon: HiOutlineExclamationCircle },
};

function formatBytes(bytes) {
  if (!bytes) return "0 KB";
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

export default function KnowledgeBase() {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingNames, setUploadingNames] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef(null);

  const refresh = useCallback(() => {
    listDocuments()
      .then(setDocuments)
      .catch(() => setErrorMsg("No se pudo conectar con el backend."))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleFiles = async (fileList) => {
    const files = Array.from(fileList);
    setErrorMsg("");
    for (const file of files) {
      const ext = file.name.split(".").pop().toLowerCase();
      if (!ACCEPTED_EXTENSIONS.includes(ext)) {
        setErrorMsg(`Formato no soportado: .${ext}`);
        continue;
      }
      setUploadingNames((prev) => [...prev, file.name]);
      try {
        await uploadDocument(file);
        refresh();
      } catch (err) {
        setErrorMsg(err.response?.data?.detail || `Error al subir ${file.name}`);
      } finally {
        setUploadingNames((prev) => prev.filter((n) => n !== file.name));
      }
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
  };

  const handleDelete = async (doc) => {
    try {
      await deleteDocument(doc.id);
      setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
    } catch {
      setErrorMsg("No se pudo eliminar el documento.");
    }
  };

  const handleReindex = async (doc) => {
    setDocuments((prev) =>
      prev.map((d) => (d.id === doc.id ? { ...d, status: "indexing" } : d))
    );
    try {
      const updated = await reindexDocument(doc.id);
      setDocuments((prev) => prev.map((d) => (d.id === doc.id ? updated : d)));
    } catch {
      setErrorMsg("No se pudo reindexar el documento.");
      refresh();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[var(--color-text-primary)] dark:text-[var(--color-text-dark)]">
          Base de conocimiento
        </h1>
        <p className="mt-1 text-[var(--color-text-secondary)]">
          Sube documentos corporativos para que CorpIA pueda responder preguntas sobre ellos.
        </p>
      </div>

      <Card
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center gap-3 border-2 border-dashed px-8 py-16 text-center transition-colors ${
          isDragging
            ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
            : "border-[var(--color-border)] dark:border-white/15"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          accept={ACCEPTED_EXTENSIONS.map((e) => `.${e}`).join(",")}
        />
        <HiOutlineCloudArrowUp size={40} className="text-[var(--color-primary)]" />
        <p className="font-medium text-[var(--color-text-primary)] dark:text-[var(--color-text-dark)]">
          Arrastra tus archivos aquí o haz clic para seleccionarlos
        </p>
        <p className="text-xs uppercase tracking-wide text-[var(--color-text-secondary)]">
          PDF · DOCX · PPTX · CSV · XLSX · JSON · TXT · HTML · Markdown
        </p>
      </Card>

      {uploadingNames.length > 0 && (
        <div className="space-y-2">
          {uploadingNames.map((name) => (
            <div
              key={name}
              className="flex items-center gap-3 rounded-xl border border-[var(--color-border)]/60 px-4 py-3 text-sm dark:border-white/10"
            >
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-primary)]/30 border-t-[var(--color-primary)]" />
              Subiendo e indexando {name}…
            </div>
          ))}
        </div>
      )}

      {errorMsg && (
        <div className="rounded-xl bg-[var(--color-error)]/10 px-4 py-3 text-sm text-[var(--color-error)]">
          {errorMsg}
        </div>
      )}

      <Card className="overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[var(--color-border)]/60 text-xs uppercase tracking-wide text-[var(--color-text-secondary)] dark:border-white/10">
            <tr>
              <th className="px-5 py-3 font-medium">Documento</th>
              <th className="px-5 py-3 font-medium">Tamaño</th>
              <th className="px-5 py-3 font-medium">Fragmentos</th>
              <th className="px-5 py-3 font-medium">Estado</th>
              <th className="px-5 py-3 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]/40 dark:divide-white/5">
            {isLoading && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-[var(--color-text-secondary)]">
                  Cargando documentos…
                </td>
              </tr>
            )}
            {!isLoading && documents.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-[var(--color-text-secondary)]">
                  Todavía no hay documentos. Sube el primero arriba.
                </td>
              </tr>
            )}
            {documents.map((doc) => {
              const status = STATUS_CONFIG[doc.status] || STATUS_CONFIG.pending;
              const StatusIcon = status.icon;
              return (
                <tr key={doc.id}>
                  <td className="flex items-center gap-3 px-5 py-3.5">
                    <HiOutlineDocumentText className="shrink-0 text-[var(--color-text-secondary)]" size={20} />
                    <div>
                      <p className="font-medium text-[var(--color-text-primary)] dark:text-[var(--color-text-dark)]">
                        {doc.original_name}
                      </p>
                      {doc.error_message && (
                        <p className="text-xs text-[var(--color-error)]">{doc.error_message}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-[var(--color-text-secondary)]">
                    {formatBytes(doc.size_bytes)}
                  </td>
                  <td className="px-5 py-3.5 text-[var(--color-text-secondary)]">
                    {doc.chunk_count}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className="inline-flex items-center gap-1.5 text-xs font-semibold"
                      style={{ color: status.color }}
                    >
                      <StatusIcon size={15} />
                      {status.label}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleReindex(doc)}
                        title="Reindexar"
                        className="rounded-lg p-2 text-[var(--color-text-secondary)] hover:bg-black/5 hover:text-[var(--color-primary)] dark:hover:bg-white/5"
                      >
                        <HiOutlineArrowPath size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(doc)}
                        title="Eliminar"
                        className="rounded-lg p-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-error)]/10 hover:text-[var(--color-error)]"
                      >
                        <HiOutlineTrash size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
