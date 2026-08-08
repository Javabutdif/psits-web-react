import axios from "axios";
import mongoose from "mongoose";
import { Admin } from "../models/admin.model";
import { Student } from "../models/student.model";
import { Contribution } from "../models/contribution.model";
import { contribution_types } from "../enums/contribution.enums";

export interface SyncStatus {
  lastSyncedAt: Date | null;
  status: "success" | "error" | null;
  developerCount: number;
  repository?: string;
  errorMessage?: string;
  failedDevelopers?: { githubUsername: string; error: string }[];
}

export interface DeveloperContributionResult {
  idNumber: string;
  name: string;
  githubUsername: string;
  commitCount: number;
}

class ContributionService {
  async getContributions(type?: string) {
    const query: Record<string, unknown> = type ? { type } : {};
    return await Contribution.find(query)
      .sort({ date: -1 })
      .lean();
  }

  async getAdminOptions() {
    return await Admin.find(
      { status: "STATUS_ACTIVE" },
      { id_number: 1, name: 1, position: 1, githubUsername: 1 }
    )
      .sort({ name: 1 })
      .lean();
  }

  async searchStudents(query: string, limit = 15) {
    const trimmed = query.trim();
    if (!trimmed) return [];

    const regex = new RegExp(trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

    return await Student.find(
      {
        $or: [
          { id_number: regex },
          { first_name: regex },
          { last_name: regex },
        ],
      },
      { id_number: 1, first_name: 1, middle_name: 1, last_name: 1, course: 1, year: 1 }
    )
      .limit(limit)
      .lean();
  }

  async getContribution(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid contribution ID");
    }
    return await Contribution.findById(id).lean();
  }

  async createContribution(
    payload: {
      idNumber: string;
      type: "developer" | "media" | "volunteer";
      description: string;
      date: string;
    },
    createdBy: string
  ) {
    const admin = await Admin.findOne({ id_number: payload.idNumber });
    const student = admin
      ? null
      : await Student.findOne({ id_number: payload.idNumber });
    const member = admin || student;

    if (!member) {
      throw new Error("Member not found");
    }

    const contribution = new Contribution({
      memberId: member._id,
      memberType: admin ? "admin" : "student",
      idNumber: payload.idNumber,
      name: admin ? admin.name : `${student!.first_name} ${student!.middle_name || ""} ${student!.last_name}`.replace(/\s+/g, " ").trim(),
      type: payload.type,
      description: payload.description,
      date: new Date(payload.date),
      createdBy,
    });

    await contribution.save();
    return contribution;
  }

  async updateContribution(
    id: string,
    payload: {
      description?: string;
      date?: string;
    }
  ) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid contribution ID");
    }

    const existing = await Contribution.findById(id);
    if (!existing) {
      throw new Error("Contribution not found");
    }

    const updateFields: Record<string, unknown> = {};
    if (payload.description !== undefined) {
      updateFields.description = payload.description;
    }
    if (payload.date !== undefined) {
      updateFields.date = new Date(payload.date);
    }
    updateFields.updatedAt = new Date();

    return await Contribution.findByIdAndUpdate(id, updateFields, {
      new: true,
    });
  }

  async deleteContribution(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid contribution ID");
    }

    return await Contribution.findByIdAndDelete(id);
  }

  async syncDeveloperContributions(): Promise<{
    success: boolean;
    result: SyncStatus & { updatedDevelopers: DeveloperContributionResult[] };
  }> {
    const token = process.env.GITHUB_TOKEN;
    const owner = process.env.GITHUB_OWNER;
    const repo = process.env.GITHUB_REPOSITORY;

    if (!token || !owner || !repo) {
      return {
        success: false,
        result: {
          lastSyncedAt: null,
          status: null,
          developerCount: 0,
          errorMessage: "GitHub credentials not configured",
          updatedDevelopers: [],
        },
      };
    }

    const developers = await Admin.find({
      githubUsername: { $exists: true, $ne: "" },
      status: "STATUS_ACTIVE",
    }).lean();

    const repository = `${owner}/${repo}`;

    if (developers.length === 0) {
      return {
        success: true,
        result: {
          lastSyncedAt: new Date(),
          status: "success",
          developerCount: 0,
          repository,
          updatedDevelopers: [],
        },
      };
    }

    const updatedDevelopers: DeveloperContributionResult[] = [];
    const failedDevelopers: { githubUsername: string; error: string }[] = [];

    for (const developer of developers) {
      try {
        const username = developer.githubUsername;
        if (!username) continue;
        const response = await axios.get(
          `https://api.github.com/repos/${owner}/${repo}/commits`,
          {
            headers: {
              Authorization: `token ${token}`,
              Accept: "application/vnd.github.v3+json",
            },
            params: { author: username, per_page: 1 },
          }
        );

        const linkHeader: string = response.headers["link"] || "";
        const lastPageMatch = linkHeader.match(
          /[?&]page=(\d+)>;\s*rel="last"/
        );
        let commitCount = 0;
        if (lastPageMatch) {
          commitCount = parseInt(lastPageMatch[1], 10);
        } else {
          commitCount = Array.isArray(response.data) ? response.data.length : 0;
        }

        const existing = await Contribution.findOne({
          type: contribution_types.DEVELOPER,
          idNumber: developer.id_number,
        });

        const contributionData = {
          memberId: developer._id,
          memberType: "admin",
          idNumber: developer.id_number,
          name: developer.name,
          type: contribution_types.DEVELOPER,
          githubUsername: username,
          commitCount,
          date: new Date(),
          createdBy: "system",
        };

        if (existing) {
          await Contribution.findByIdAndUpdate(existing._id, contributionData);
        } else {
          await new Contribution(contributionData).save();
        }

        updatedDevelopers.push({
          idNumber: developer.id_number,
          name: developer.name,
          githubUsername: username,
          commitCount,
        });
      } catch (error: unknown) {
        const statusCode =
          (error as { response?: { status?: number } })?.response?.status;
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        const detail = statusCode
          ? `${statusCode}: ${errorMessage}`
          : errorMessage;
        failedDevelopers.push({
          githubUsername: developer.githubUsername || "unknown",
          error: detail,
        });
        console.error(
          `Failed to fetch commits for ${developer.githubUsername}: ${detail}`
        );
      }
    }

    return {
      success: true,
      result: {
        lastSyncedAt: new Date(),
        status: "success",
        developerCount: updatedDevelopers.length,
        repository,
        updatedDevelopers,
        failedDevelopers,
        ...(failedDevelopers.length > 0
          ? {
              errorMessage: `${
                failedDevelopers.length
              } developer(s) failed to sync: ${failedDevelopers
                .map((f) => `${f.githubUsername} (${f.error})`)
                .join(", ")}`,
            }
          : {}),
      },
    };
  }

  async getSyncStatus(): Promise<SyncStatus> {
    const owner = process.env.GITHUB_OWNER;
    const repo = process.env.GITHUB_REPOSITORY;
    const repository =
      owner && repo ? `${owner}/${repo}` : undefined;

    const latest = await Contribution.findOne({
      type: contribution_types.DEVELOPER,
    })
      .sort({ updatedAt: -1 })
      .lean();

    if (!latest) {
      return {
        lastSyncedAt: null,
        status: null,
        developerCount: 0,
        repository,
      };
    }

    return {
      lastSyncedAt: latest.updatedAt,
      status: "success",
      developerCount: await Contribution.countDocuments({
        type: contribution_types.DEVELOPER,
      }),
      repository,
    };
  }

  async setAdminGithubUsername(idNumber: string, username: string) {
    const admin = await Admin.findOne({ id_number: idNumber });
    if (!admin) {
      throw new Error("Admin not found");
    }

    admin.githubUsername = username || undefined;
    await admin.save();
    return admin;
  }
}

const contributionService = new ContributionService();
export { contributionService };