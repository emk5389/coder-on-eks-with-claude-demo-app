import React from "react";

interface Props {
  documentId: string;
  documentName: string;
  onClose: () => void;
}

export function PDFModal({
  documentId,
  documentName,
  onClose,
}: Props): React.ReactElement {
  const url = `/api/documents/${documentId}/file`;

  React.useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div className="pdf-modal-overlay" onClick={onClose}>
      <div className="pdf-modal" onClick={(e) => e.stopPropagation()}>
        <div className="pdf-modal-header">
          <span className="pdf-modal-title">{documentName}</span>
          <button className="pdf-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <iframe className="pdf-modal-frame" src={url} title={documentName} />
      </div>
    </div>
  );
}
