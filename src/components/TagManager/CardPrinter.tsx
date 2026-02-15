import { useState } from "react";
import { Printer, QrCode } from "lucide-react";
import { useTags } from "../../hooks/useTags";

interface CardPrinterProps {
  mediaPath: string | null;
}

export default function CardPrinter({ mediaPath }: CardPrinterProps) {
  const { generateCard, cardData, isGenerating } = useTags();
  const [generateError, setGenerateError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!mediaPath) return;
    setGenerateError(null);
    try {
      await generateCard(mediaPath);
    } catch (e) {
      setGenerateError(
        e instanceof Error ? e.message : "Failed to generate card data."
      );
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleGenerate}
          disabled={!mediaPath || isGenerating}
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 active:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <QrCode className="h-4 w-4" />
          {isGenerating ? "Generating..." : "Generate Card"}
        </button>

        {cardData && (
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-300 active:bg-gray-400"
          >
            <Printer className="h-4 w-4" />
            Print
          </button>
        )}
      </div>

      {/* Error */}
      {generateError && (
        <div className="rounded-md bg-red-50 px-4 py-3">
          <p className="text-sm text-red-700">{generateError}</p>
        </div>
      )}

      {/* Card preview area */}
      {cardData ? (
        <div
          id="printable-card"
          className="mx-auto w-[3.5in] rounded-lg border border-gray-300 bg-white shadow-md print:shadow-none print:border-black print:rounded-none"
        >
          {/* Card inner layout */}
          <div className="flex flex-col items-center gap-4 p-6">
            {/* Poster image */}
            {cardData.poster ? (
              <img
                src={cardData.poster}
                alt={cardData.title ?? "Media poster"}
                className="h-48 w-32 rounded-md object-cover shadow-sm"
              />
            ) : (
              <div className="flex h-48 w-32 items-center justify-center rounded-md bg-gray-100">
                <QrCode className="h-10 w-10 text-gray-300" />
              </div>
            )}

            {/* Title */}
            <h4 className="text-center text-lg font-bold text-gray-900 leading-tight">
              {cardData.title ?? "Untitled"}
            </h4>

            {/* Tag ID */}
            {cardData.tag_id && (
              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] font-medium uppercase tracking-widest text-gray-400">
                  Tag ID
                </span>
                <span className="rounded bg-gray-100 px-3 py-1 font-mono text-xs text-gray-700">
                  {cardData.tag_id}
                </span>
              </div>
            )}

            {/* QR code placeholder */}
            <div className="flex flex-col items-center gap-1">
              <div className="flex h-24 w-24 items-center justify-center rounded-md border-2 border-dashed border-gray-300 bg-gray-50">
                <QrCode className="h-10 w-10 text-gray-400" />
              </div>
              <span className="text-[10px] text-gray-400">QR Code</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 py-16">
          <QrCode className="mb-3 h-10 w-10 text-gray-300" />
          <p className="text-sm text-gray-500">
            {mediaPath
              ? "Press \"Generate Card\" to preview the printable card."
              : "Select a media item to generate a card."}
          </p>
        </div>
      )}

      {/* Print styles hint */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-card,
          #printable-card * {
            visibility: visible;
          }
          #printable-card {
            position: absolute;
            left: 0;
            top: 0;
            width: 3.5in;
          }
        }
      `}</style>
    </div>
  );
}
