// /app/src/types/global.d.ts
// どこでも使える安全なプリミティブ
export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
export type JsonObject = { [k: string]: JsonValue };

// よくある辞書
export type Dict<T = unknown> = Record<string, T>;

// 結果型（成功/失敗）
export type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

// ユーティリティ
export type Nullable<T> = T | null | undefined;
export type Prettify<T> = { [K in keyof T]: T[K] } & {};

// 汎用ID/時刻
export type ID = string & { readonly brand: unique symbol };
export type TimestampISO = string; // "2025-08-16T12:34:56.000Z" など

// Finwiseドメイン（推定）
export interface Transaction {
  id: ID;
  date: TimestampISO;
  amount: number;
  category: string;
  note?: string;
  accountId: ID;
}

export interface Review {
  id: ID;
  rating: number; // 1-5
  comment: string;
  userId: ID;
  createdAt: TimestampISO;
}

export interface Goal {
  id: ID;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: TimestampISO;
}

export interface ReportRow {
  label: string;
  value: number;
  period: string; // '2025-08' など
}
