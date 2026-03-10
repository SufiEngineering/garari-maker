// ============================================================================
// DownloadModal — Post-download CTA for Sufi Engineering physical service
// ============================================================================

interface DownloadModalProps {
  onClose: () => void;
}

export default function DownloadModal({ onClose }: DownloadModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-[#1a0e0e] border border-red-900/50 rounded-2xl shadow-2xl shadow-red-950/40 max-w-md w-full mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Red accent top bar */}
        <div className="h-1.5 bg-gradient-to-r from-red-700 via-red-500 to-red-700" />

        <div className="p-6 text-center">
          {/* Success icon */}
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-600/20 border-2 border-red-500/40 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12.75l6 6 9-13.5"
              />
            </svg>
          </div>

          <h2 className="text-xl font-bold text-white mb-1">
            DXF Downloaded!
          </h2>
          <p className="text-sm text-neutral-400 mb-5">
            Your sprocket file is ready.
          </p>

          {/* CTA Card */}
          <div className="bg-[#120909] border border-red-900/30 rounded-xl p-5 mb-5 text-left">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 shrink-0 rounded-lg bg-red-600 flex items-center justify-center mt-0.5">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white mb-1">
                  Need it manufactured?
                </h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Send this DXF file to{" "}
                  <span className="text-red-400 font-semibold">
                    Sufi Engineering
                  </span>{" "}
                  and get your sprocket CNC-machined in steel, aluminum, or
                  stainless steel. Fast turnaround, precision guaranteed.
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <a
                href="https://wa.me/923001234567?text=Hi%20Sufi%20Engineering!%20I%20designed%20a%20sprocket%20on%20Garari%20Maker%20and%20would%20like%20to%20get%20it%20manufactured."
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-green-600 hover:bg-green-500 text-white text-sm font-semibold transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                WhatsApp Sufi Engineering
              </a>
              <a
                href="mailto:info@sufiengineering.com?subject=Sprocket%20Manufacturing%20Request%20from%20Garari%20Maker&body=Hi%20Sufi%20Engineering%2C%0A%0AI%20designed%20a%20sprocket%20using%20Garari%20Maker%20and%20would%20like%20to%20get%20it%20manufactured.%20Please%20find%20the%20DXF%20file%20attached.%0A%0AThank%20you!"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-red-700/30 hover:bg-red-700/50 border border-red-800/50 text-red-300 text-sm font-semibold transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                  />
                </svg>
                Email Your DXF File
              </a>
            </div>
          </div>

          {/* Footer link */}
          <p className="text-[11px] text-neutral-500 mb-4">
            Visit{" "}
            <a
              href="https://gararimaker.bysufi.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-400 hover:text-red-300 underline underline-offset-2"
            >
              gararimaker.bysufi.com
            </a>
          </p>

          <button
            onClick={onClose}
            className="w-full py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
