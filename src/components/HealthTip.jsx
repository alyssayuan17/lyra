export default function HealthTip({ tip }) {
    if (!tip) return null;
    return (
      <div className="bg-yellow-100 text-yellow-900 border border-yellow-300 px-5 py-4 rounded-lg max-w-md mx-auto shadow-sm">
        <p className="text-sm font-medium">{tip}</p>
      </div>
    );
}