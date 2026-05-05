export function Ornament({ symbol = "❦" }: { symbol?: string }) {
  return (
    <div className="ornament my-6">
      <span className="text-lg font-serif">{symbol}</span>
    </div>
  );
}
