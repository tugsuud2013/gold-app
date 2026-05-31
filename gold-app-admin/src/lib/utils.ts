export const formatMNT = (amount: number | string) =>
  `₮${Number(amount || 0).toLocaleString("mn-MN")}`;

export const formatGrams = (grams: number | string) => `${Number(grams || 0)} гр`;

export const formatDate = (date: string | Date) =>
  new Date(date).toLocaleDateString("mn-MN").replace(/\//g, ".");

export const formatDateTime = (date: string | Date) =>
  new Date(date).toLocaleString("mn-MN", { hour12: false }).replace(/\//g, ".");

export const getMembershipColor = (level: string) => {
  if (level === "GOLD") return "text-amber-700 bg-amber-100";
  if (level === "SILVER") return "text-slate-700 bg-slate-100";
  if (level === "BRONZE") return "text-orange-700 bg-orange-100";
  return "text-zinc-700 bg-zinc-100";
};

export const getPurchaseStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    PENDING: "Хүлээгдэж буй",
    CONTRACT_SIGNED: "Гэрээ баталгаажсан",
    PAYMENT_PENDING: "Төлбөр хүлээгдэж буй",
    COMPLETED: "Дууссан",
    CANCELLED: "Цуцлагдсан",
  };
  return map[status] ?? status;
};

export const getPurchaseStatusColor = (status: string) => {
  const map: Record<string, string> = {
    PENDING: "bg-amber-100 text-amber-700",
    CONTRACT_SIGNED: "bg-blue-100 text-blue-700",
    PAYMENT_PENDING: "bg-purple-100 text-purple-700",
    COMPLETED: "bg-emerald-100 text-emerald-700",
    CANCELLED: "bg-rose-100 text-rose-700",
  };
  return map[status] ?? "bg-zinc-100 text-zinc-700";
};

export const getKycStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    PENDING: "Хянагдаж байна",
    VERIFIED: "Баталгаажсан",
    REJECTED: "Татгалзсан",
  };
  return map[status] ?? status;
};
