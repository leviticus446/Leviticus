// Background blur ambient di belakang section (bukan bingkai mockup, tapi lapisan
// dekoratif yang beneran nempel di halaman) — foto redup+blur, konten tetap tajam di atasnya.
export default function AmbientBackdrop({ image }) {
  return (
    <div className="absolute inset-0 overflow-hidden -z-10">
      <div
        className="absolute inset-0 bg-cover bg-center scale-110 blur-md opacity-30"
        style={{ backgroundImage: `url(${image})` }}
      />
      <div className="absolute inset-0 bg-charcoal/70" />
    </div>
  );
}
