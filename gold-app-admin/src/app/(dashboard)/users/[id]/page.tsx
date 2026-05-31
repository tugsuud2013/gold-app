"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import Badge from "@/components/ui/Badge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Table from "@/components/ui/Table";
import {
  useUpdateKycStatus,
  useUpdateMembership,
  useUpdateUserStatus,
  useUser,
  useUserPurchases,
  useUserSellRequests,
  useUserWallet,
} from "@/hooks/useUsers";
import { formatDate, formatDateTime, formatGrams, formatMNT, getPurchaseStatusLabel } from "@/lib/utils";
import { useToast } from "@/components/ui/ToastProvider";

const tabs = ["Үндсэн мэдээлэл", "Цахим түрүүвч", "Худалдааны түүх", "Зарах хүсэлтүүд"] as const;

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [tab, setTab] = useState<(typeof tabs)[number]>(tabs[0]);
  const { showToast } = useToast();

  const userQ = useUser(id);
  const walletQ = useUserWallet(id);
  const purchasesQ = useUserPurchases(id);
  const sellsQ = useUserSellRequests(id);
  const updateStatus = useUpdateUserStatus();
  const updateMembership = useUpdateMembership();
  const updateKyc = useUpdateKycStatus();

  if (userQ.isLoading) return <LoadingSpinner />;
  if (!userQ.data) return <div className="rounded border p-4">Хэрэглэгч олдсонгүй</div>;

  const user = userQ.data;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t}
            className={`rounded-lg px-3 py-2 text-sm ${tab === t ? "bg-amber-600 text-white" : "border bg-white"}`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Үндсэн мэдээлэл" && (
        <div className="rounded-xl border bg-white p-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 text-sm">
              <p>Утас: <strong>{user.phoneNumber}</strong></p>
              <p>Нэр: <strong>{`${user.lastName ?? ""} ${user.firstName ?? ""}`.trim() || "-"}</strong></p>
              <p>Регистр: <strong>{user.registerNumber ?? "-"}</strong></p>
              <p>KYC: <strong>{user.kycStatus}</strong></p>
              <p>Бүртгэгдсэн: <strong>{formatDateTime(user.createdAt)}</strong></p>
              <p>Шинэчлэгдсэн: <strong>{formatDateTime((user as any).updatedAt ?? user.createdAt)}</strong></p>
            </div>
            <div className="space-y-2">
              <p className="text-sm">Signature:</p>
              {(user as any).signatureImageUrl ? (
                <img src={`${process.env.NEXT_PUBLIC_API_URL}${(user as any).signatureImageUrl}`} alt="signature" className="h-24 rounded border object-contain" />
              ) : (
                <div className="rounded border p-3 text-sm text-slate-500">Зураг алга</div>
              )}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              className="rounded border px-3 py-2 text-sm"
              onClick={async () => {
                try {
                  const next = user.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
                  await updateStatus.mutateAsync({ id, status: next as "ACTIVE" | "SUSPENDED" });
                  showToast("Account status шинэчлэгдлээ");
                  userQ.refetch();
                } catch (e) {
                  showToast(e instanceof Error ? e.message : "Алдаа", "error");
                }
              }}
            >
              {user.status === "ACTIVE" ? "Хаах" : "Нээх"}
            </button>
            <select
              defaultValue={user.membershipLevel}
              className="rounded border px-3 py-2 text-sm"
              onChange={async (e) => {
                try {
                  await updateMembership.mutateAsync({ id, membershipLevel: e.target.value });
                  showToast("Membership шинэчлэгдлээ");
                  userQ.refetch();
                } catch (err) {
                  showToast(err instanceof Error ? err.message : "Алдаа", "error");
                }
              }}
            >
              {["NORMAL", "BRONZE", "SILVER", "GOLD"].map((x) => <option key={x}>{x}</option>)}
            </select>
            {user.kycStatus === "PENDING" && (
              <>
                <button
                  className="rounded bg-emerald-600 px-3 py-2 text-sm text-white"
                  onClick={async () => {
                    try {
                      await updateKyc.mutateAsync({ id, status: "VERIFIED" });
                      showToast("KYC баталгаажлаа");
                      userQ.refetch();
                    } catch (e) {
                      showToast(e instanceof Error ? e.message : "Алдаа", "error");
                    }
                  }}
                >
                  KYC Баталгаажуулах
                </button>
                <button
                  className="rounded bg-rose-600 px-3 py-2 text-sm text-white"
                  onClick={async () => {
                    try {
                      await updateKyc.mutateAsync({ id, status: "REJECTED" });
                      showToast("KYC татгалзлаа");
                      userQ.refetch();
                    } catch (e) {
                      showToast(e instanceof Error ? e.message : "Алдаа", "error");
                    }
                  }}
                >
                  KYC Татгалзах
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {tab === "Цахим түрүүвч" && (
        <div className="space-y-4">
          {walletQ.isLoading ? <LoadingSpinner /> : (
            <div className="rounded-xl border bg-white p-4">
              <p className="text-sm text-slate-500">Одоогийн үлдэгдэл</p>
              <p className="text-3xl font-bold">{formatGrams(walletQ.data?.balanceGrams ?? 0)}</p>
              <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                <p>Нийт худалдан авсан: {formatGrams(walletQ.data?.totalPurchasedGrams ?? 0)}</p>
                <p>Нийт зарсан: {formatGrams(walletQ.data?.totalSoldGrams ?? 0)}</p>
              </div>
            </div>
          )}
          <Table>
            <thead className="bg-slate-50"><tr>{["Огноо", "Төрөл", "Хэмжээ", "Өмнөх үлдэгдэл", "Дараах үлдэгдэл", "Тайлбар"].map((h) => <th key={h} className="px-2 py-2 text-left text-xs">{h}</th>)}</tr></thead>
            <tbody>
              {(walletQ.data?.transactions ?? []).map((t: any) => (
                <tr key={t.id} className="border-t">
                  <td className="px-2 py-2 text-sm">{formatDateTime(t.createdAt)}</td>
                  <td className={`px-2 py-2 text-sm ${t.type === "PURCHASE" ? "text-emerald-700" : "text-rose-700"}`}>{t.type}</td>
                  <td className="px-2 py-2 text-sm">{formatGrams(t.amountGrams)}</td>
                  <td className="px-2 py-2 text-sm">{formatGrams(t.balanceBefore)}</td>
                  <td className="px-2 py-2 text-sm">{formatGrams(t.balanceAfter)}</td>
                  <td className="px-2 py-2 text-sm">{t.note ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      {tab === "Худалдааны түүх" && (
        <Table>
          <thead className="bg-slate-50"><tr>{["Огноо", "Грамм", "Нэгж үнэ", "Нийт дүн", "Статус", "Гэрээ"].map((h) => <th key={h} className="px-2 py-2 text-left text-xs">{h}</th>)}</tr></thead>
          <tbody>
            {(purchasesQ.data?.items ?? []).map((p) => (
              <tr key={p.id} className="border-t">
                <td className="px-2 py-2 text-sm">{formatDate(p.createdAt)}</td>
                <td className="px-2 py-2 text-sm">{formatGrams(p.amountGrams)}</td>
                <td className="px-2 py-2 text-sm">{formatMNT(p.pricePerGram)}</td>
                <td className="px-2 py-2 text-sm">{formatMNT(p.totalAmountMnt)}</td>
                <td className="px-2 py-2 text-sm"><Badge className="bg-slate-100 text-slate-700">{getPurchaseStatusLabel(p.status)}</Badge></td>
                <td className="px-2 py-2 text-sm">
                  {p.contractPdfUrl ? (
                    <a href={`${process.env.NEXT_PUBLIC_API_URL}${p.contractPdfUrl}`} target="_blank" className="rounded border px-2 py-1">PDF</a>
                  ) : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {tab === "Зарах хүсэлтүүд" && (
        <Table>
          <thead className="bg-slate-50"><tr>{["Огноо", "Грамм", "Статус", "Тайлбар"].map((h) => <th key={h} className="px-2 py-2 text-left text-xs">{h}</th>)}</tr></thead>
          <tbody>
            {(sellsQ.data ?? []).map((s) => (
              <tr key={s.id} className="border-t">
                <td className="px-2 py-2 text-sm">{formatDateTime(s.createdAt)}</td>
                <td className="px-2 py-2 text-sm">{formatGrams(s.amountGrams)}</td>
                <td className="px-2 py-2 text-sm">{s.status}</td>
                <td className="px-2 py-2 text-sm">{s.adminNote ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
