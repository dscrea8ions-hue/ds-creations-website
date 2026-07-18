export default function AdminNotice({ error, success }: { error?: string; success?: string }) {
  if (error) return <p role="alert" className="mb-6 rounded-xl bg-red-50 p-4 font-bold text-red-800">{error}</p>;
  if (success) return <p role="status" className="mb-6 rounded-xl bg-green-50 p-4 font-bold text-green-800">{success}</p>;
  return null;
}
