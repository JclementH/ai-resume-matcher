export default function SuggestionCard({ text }: { text: string }) {
  return (
    <div className="bg-gray-950 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition">
      <p className="text-gray-300 leading-relaxed">{text}</p>
    </div>
  );
}