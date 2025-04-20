import TransactionHistory from "@/components/transaction-history";

export default function TransactionsPage() {
  return (
    <main className="max-w-[100vw] mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Lịch sử giao dịch</h1>
      <TransactionHistory />
    </main>
  );
}
