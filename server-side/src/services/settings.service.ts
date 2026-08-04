import { Request, Response } from "express";
import { Settings } from "../models/settings.model";
import { ISettings } from "../models/settings.interface";
import { AppError } from "../util/app.error.util";

class SettingsService {
  getConfig = async (): Promise<ISettings | null> => {
    return await Settings.findOne();
  };

  getMembershipPrice = async (): Promise<ISettings> => {
    const settings = await this.getConfig();
    if (!settings) {
      throw new AppError("No settings available", 404);
    }
    return settings;
  };

  updateMembershipPrice = async (price: number): Promise<{ matchedCount: number }> => {
    const existing = await Settings.find();

    if (existing.length === 0) {
      await new Settings({ membership_price: price }).save();
      return { matchedCount: 0 };
    }

    const update = await Settings.updateOne(
      {},
      { $set: { membership_price: price } }
    );

    return { matchedCount: update.matchedCount };
  };

  getMigrationStatus = async (): Promise<{
    studentCreatedAtBackfilled: boolean;
    studentYearLastUpdated: Date | null;
  }> => {
    const settings = await this.getConfig();
    return {
      studentCreatedAtBackfilled: settings?.studentCreatedAtBackfilled ?? false,
      studentYearLastUpdated: settings?.studentYearLastUpdated ?? null,
    };
  };

  updateMigrationStatus = async (updates: Partial<ISettings>): Promise<number> => {
    const existing = await Settings.find();

    if (existing.length === 0) {
      await new Settings(updates).save();
      return 0;
    }

    const update = await Settings.updateOne({}, { $set: updates });
    return update.matchedCount;
  };
}

const settingsService = new SettingsService();

export { settingsService };
