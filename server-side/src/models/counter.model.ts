import mongoose, { Schema, Document } from "mongoose";

export interface ICounter {
  /** Sequence key, e.g. "membership-2026". */
  _id: string;
  seq: number;
}

export interface ICounterDocument extends Omit<ICounter, "_id">, Document<string> {}

const counterSchema = new Schema<ICounterDocument>({
  _id: { type: String, required: true },
  seq: { type: Number, required: true, default: 0 },
});

export const Counter = mongoose.model<ICounterDocument>(
  "Counter",
  counterSchema
);
