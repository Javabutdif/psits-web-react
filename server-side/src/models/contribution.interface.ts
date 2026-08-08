export interface IContribution {
  memberId: import("mongoose").Types.ObjectId;
  memberType?: "admin" | "student";
  idNumber: string;
  name?: string;
  type: "developer" | "media" | "volunteer";
  githubUsername?: string;
  commitCount?: number;
  description?: string;
  date: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IContributionDocument extends IContribution, Document {
  _id: import("mongoose").Types.ObjectId;
}