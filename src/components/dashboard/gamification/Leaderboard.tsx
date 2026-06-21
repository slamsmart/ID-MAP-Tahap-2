"use client";

import { Trophy, Sprout, Medal } from "lucide-react";
import { Id } from "../../../../convex/_generated/dataModel";

type Row = {
  userId: Id<"users">;
  name: string;
  points: number;
  verifiedReferrals: number;
  seedlings: number;
  totalPoints: number;
};

const rankStyle = (i: number) =>
  i === 0
    ? "bg-amber-100 text-amber-700"
    : i === 1
    ? "bg-gray-100 text-gray-600"
    : i === 2
    ? "bg-orange-100 text-orange-700"
    : "bg-emerald-50 text-emerald-700";

export default function Leaderboard({
  rows,
  currentUserId,
}: {
  rows: Row[];
  currentUserId?: Id<"users">;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <h3 className="font-display font-semibold text-gray-800 flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-amber-500" />
        Leaderboard Sahabat Pesisir
      </h3>

      {rows.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-6">
          Belum ada peringkat. Mulai kumpulkan poin!
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-gray-400 border-b border-gray-100">
                <th className="py-2 pr-2 w-10">#</th>
                <th className="py-2 pr-2">Nama</th>
                <th className="py-2 px-2 text-right">Poin</th>
                <th className="py-2 px-2 text-right hidden sm:table-cell">Referral</th>
                <th className="py-2 pl-2 text-right">Bibit</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => {
                const isMe = currentUserId && r.userId === currentUserId;
                return (
                  <tr
                    key={r.userId}
                    className={`border-b border-gray-50 last:border-0 ${
                      isMe ? "bg-emerald-50/70" : ""
                    }`}
                  >
                    <td className="py-2.5 pr-2">
                      <span
                        className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${rankStyle(
                          i
                        )}`}
                      >
                        {i < 3 ? <Medal className="w-3.5 h-3.5" /> : i + 1}
                      </span>
                    </td>
                    <td className="py-2.5 pr-2 font-medium text-gray-800">
                      {r.name}
                      {isMe && (
                        <span className="ml-1.5 text-[10px] font-bold text-emerald-600">
                          (Kamu)
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-2 text-right font-display font-bold text-emerald-800">
                      {r.totalPoints.toLocaleString("id-ID")}
                    </td>
                    <td className="py-2.5 px-2 text-right text-gray-500 hidden sm:table-cell">
                      {r.verifiedReferrals}
                    </td>
                    <td className="py-2.5 pl-2 text-right">
                      <span className="inline-flex items-center gap-0.5 font-semibold text-emerald-700">
                        <Sprout className="w-3.5 h-3.5" />
                        {r.seedlings}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-[10px] text-gray-400 mt-3">
        Peringkat berdasarkan total poin (check-in + bonus referral ter-KYC).
      </p>
    </div>
  );
}
