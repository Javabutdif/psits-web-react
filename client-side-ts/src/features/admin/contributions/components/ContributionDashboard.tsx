import { useMemo } from "react";
import type { ComponentType } from "react";
import {
  AlertCircle,
  BarChart3,
  GitCommit,
  HandHeart,
  Images,
  Trophy,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useContributions } from "../hooks/useContributions";
import type { Contribution, ContributionType } from "../types/contribution.types";

interface RankedContributor {
  idNumber: string;
  name: string;
  score: number;
  metricLabel: "commits" | "contributions";
  type: ContributionType;
}

interface MetricCardProps {
  label: string;
  value: number;
  icon: ComponentType<{ className?: string }>;
}

const cardBaseClass = "rounded-2xl border border-[#dedede] bg-white shadow-none";

const typeStyles: Record<ContributionType, string> = {
  developer: "bg-[#1c9dde]/10 text-[#1c9dde]",
  media: "bg-[#8b5cf6]/10 text-[#7c3aed]",
  volunteer: "bg-[#10b981]/10 text-[#059669]",
};

const formatScore = (score: number, label: "commits" | "contributions") => {
  const singular = label === "commits" ? "commit" : "contribution";
  return `${score.toLocaleString()} ${score === 1 ? singular : label}`;
};

const buildDeveloperRanking = (list: Contribution[]): RankedContributor[] => {
  const bestPerPerson = new Map<string, Contribution>();
  for (const contribution of list) {
    const existing = bestPerPerson.get(contribution.idNumber);
    if (
      !existing ||
      (contribution.commitCount ?? 0) > (existing.commitCount ?? 0)
    ) {
      bestPerPerson.set(contribution.idNumber, contribution);
    }
  }

  return Array.from(bestPerPerson.values())
    .map((contribution) => ({
      idNumber: contribution.idNumber,
      name: contribution.name || contribution.idNumber,
      score: contribution.commitCount ?? 0,
      metricLabel: "commits" as const,
      type: "developer" as const,
    }))
    .filter((contributor) => contributor.score > 0)
    .sort((a, b) => b.score - a.score);
};

const buildCountRanking = (
  list: Contribution[],
  type: Extract<ContributionType, "media" | "volunteer">
): RankedContributor[] => {
  const countPerPerson = new Map<string, { name: string; count: number }>();
  for (const contribution of list) {
    const existing = countPerPerson.get(contribution.idNumber);
    if (existing) {
      existing.count += 1;
    } else {
      countPerPerson.set(contribution.idNumber, {
        name: contribution.name || contribution.idNumber,
        count: 1,
      });
    }
  }

  return Array.from(countPerPerson.entries())
    .map(([idNumber, person]) => ({
      idNumber,
      name: person.name,
      score: person.count,
      metricLabel: "contributions" as const,
      type,
    }))
    .sort((a, b) => b.score - a.score);
};

const buildAllTimeRanking = (
  ...rankings: RankedContributor[][]
): RankedContributor[] => {
  const combined = new Map<string, RankedContributor>();
  for (const ranking of rankings) {
    for (const contributor of ranking) {
      const existing = combined.get(contributor.idNumber);
      const base =
        existing && existing.score > contributor.score ? existing : contributor;
      combined.set(contributor.idNumber, {
        ...base,
        score: (existing?.score ?? 0) + contributor.score,
      });
    }
  }

  return Array.from(combined.values()).sort((a, b) => b.score - a.score);
};

const rankBadgeClass = (rank: number) =>
  rank === 1
    ? "bg-[#f59e0b] text-white"
    : rank === 2
      ? "bg-[#9ca3af] text-white"
      : rank === 3
        ? "bg-[#cd7f32] text-white"
        : "bg-[#f1f1f1] text-[#555]";

const TypeBadge = ({
  type,
  className,
}: {
  type: ContributionType;
  className?: string;
}) => (
  <span
    className={cn(
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize",
      typeStyles[type],
      className
    )}
  >
    {type}
  </span>
);

const MetricCard = ({ label, value, icon: Icon }: MetricCardProps) => (
  <div
    className={cn(
      cardBaseClass,
      "flex h-[102px] flex-col justify-between px-5 py-4"
    )}
  >
    <div className="flex items-center gap-1.5 text-[11px] leading-none text-[#282828]">
      <Icon className="h-3 w-3" />
      <span>{label}</span>
    </div>
    <div className="text-[34px] leading-none font-semibold tracking-tight text-[#343434]">
      {value.toLocaleString()}
    </div>
  </div>
);

const MetricSkeleton = () => (
  <div className={cn(cardBaseClass, "h-[102px] px-5 py-4")}>
    <Skeleton className="h-3 w-24 rounded-full" />
    <Skeleton className="mt-7 h-8 w-16 rounded-md" />
  </div>
);

const LeaderboardRow = ({
  contributor,
  rank,
}: {
  contributor: RankedContributor;
  rank: number;
}) => (
  <li className="flex items-center gap-3 rounded-lg px-2 py-1.5">
    <span
      className={cn(
        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold",
        rankBadgeClass(rank)
      )}
    >
      {rank}
    </span>
    <div className="min-w-0 flex-1">
      <div className="truncate text-sm font-medium text-[#303030]">
        {contributor.name}
      </div>
      <div className="truncate text-xs text-[#888]">
        {contributor.idNumber}
      </div>
    </div>
    <span
      className="shrink-0 text-sm font-semibold text-[#1c9dde]"
      title={formatScore(contributor.score, contributor.metricLabel)}
    >
      {contributor.score.toLocaleString()}
    </span>
  </li>
);

const LeaderboardCard = ({
  title,
  icon: Icon,
  contributors,
  emptyLabel,
}: {
  title: string;
  icon: ComponentType<{ className?: string }>;
  contributors: RankedContributor[];
  emptyLabel: string;
}) => (
  <div className={cn(cardBaseClass, "flex min-h-[320px] flex-col p-5")}>
    <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#202020]">
      <Icon className="h-3.5 w-3.5" />
      <span>{title}</span>
    </div>
    {contributors.length === 0 ? (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 py-10 text-center">
        <Trophy className="h-8 w-8 text-[#ccc]" />
        <p className="text-sm text-[#777]">{emptyLabel}</p>
      </div>
    ) : (
      <ol className="mt-3 flex-1 space-y-1">
        {contributors.slice(0, 10).map((contributor, index) => (
          <LeaderboardRow
            key={contributor.idNumber}
            contributor={contributor}
            rank={index + 1}
          />
        ))}
      </ol>
    )}
  </div>
);

export const ContributionDashboard = () => {
  const {
    contributions,
    developerContributions,
    mediaContributions,
    volunteerContributions,
    isLoading,
    error,
  } = useContributions();

  const developerRanking = useMemo(
    () => buildDeveloperRanking(developerContributions),
    [developerContributions]
  );
  const mediaRanking = useMemo(
    () => buildCountRanking(mediaContributions, "media"),
    [mediaContributions]
  );
  const volunteerRanking = useMemo(
    () => buildCountRanking(volunteerContributions, "volunteer"),
    [volunteerContributions]
  );
  const allTimeRanking = useMemo(
    () => buildAllTimeRanking(developerRanking, mediaRanking, volunteerRanking),
    [developerRanking, mediaRanking, volunteerRanking]
  );

  const topContributor = allTimeRanking[0];

  const stats: MetricCardProps[] = [
    {
      label: "Total Contributions",
      value: contributions.length,
      icon: BarChart3,
    },
    {
      label: "Developers",
      value: developerRanking.length,
      icon: GitCommit,
    },
    {
      label: "Media Members",
      value: mediaRanking.length,
      icon: Images,
    },
    {
      label: "Volunteers",
      value: volunteerRanking.length,
      icon: HandHeart,
    },
  ];

  if (error) {
    return (
      <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }, (_, index) => (
              <MetricSkeleton key={index} />
            ))
          : stats.map((item) => <MetricCard key={item.label} {...item} />)}
      </section>

      {isLoading ? (
        <Skeleton className="h-[132px] rounded-2xl" />
      ) : topContributor ? (
        <section className="flex flex-col gap-4 overflow-hidden rounded-2xl bg-gradient-to-r from-[#0b4a63] to-[#178fca] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/15">
              <Trophy className="h-7 w-7 text-[#f6c453]" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium tracking-wider text-white/80 uppercase">
                #1 Top Contributor
                <TypeBadge
                  type={topContributor.type}
                  className="bg-black/20 text-white"
                />
              </div>
              <div className="mt-1 truncate text-2xl font-semibold text-white sm:text-3xl">
                {topContributor.name}
              </div>
              <div className="text-sm text-white/70">
                {topContributor.idNumber}
              </div>
            </div>
          </div>
          <div className="shrink-0 sm:text-right">
            <div className="text-[11px] tracking-wider text-white/70 uppercase">
              All-time total
            </div>
            <div className="mt-1 text-2xl font-semibold text-white sm:text-3xl">
              {topContributor.score.toLocaleString()}
            </div>
            <div className="text-xs text-white/70">
              {topContributor.metricLabel}
            </div>
          </div>
        </section>
      ) : null}

      <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {isLoading ? (
          <>
            <Skeleton className="h-[320px] rounded-2xl" />
            <Skeleton className="h-[320px] rounded-2xl" />
            <Skeleton className="h-[320px] rounded-2xl" />
          </>
        ) : (
          <>
            <LeaderboardCard
              title="Top Developers"
              icon={GitCommit}
              contributors={developerRanking}
              emptyLabel="No developer contributions yet"
            />
            <LeaderboardCard
              title="Top Media"
              icon={Images}
              contributors={mediaRanking}
              emptyLabel="No media contributions yet"
            />
            <LeaderboardCard
              title="Top Volunteers"
              icon={HandHeart}
              contributors={volunteerRanking}
              emptyLabel="No volunteer contributions yet"
            />
          </>
        )}
      </section>

      {!isLoading && (
        <section className={cn(cardBaseClass, "p-5")}>
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#202020]">
            <Trophy className="h-3.5 w-3.5" />
            <span>All-Time Top Contributors</span>
          </div>
          <p className="mt-1 text-xs text-[#888]">
            Developers are ranked by GitHub commits; media and volunteers by
            number of contributions.
          </p>
          {allTimeRanking.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
              <Trophy className="h-8 w-8 text-[#ccc]" />
              <p className="text-sm text-[#777]">
                No contributions recorded yet
              </p>
            </div>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-[11px] text-[#252525]">
                <thead>
                  <tr className="bg-[#f1f1f1]">
                    <th className="w-[10%] rounded-l-md px-3 py-2 text-left font-medium">
                      Rank
                    </th>
                    <th className="px-3 py-2 text-left font-medium">Name</th>
                    <th className="px-3 py-2 text-left font-medium">
                      ID Number
                    </th>
                    <th className="px-3 py-2 text-left font-medium">Type</th>
                    <th className="rounded-r-md px-3 py-2 text-right font-medium">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {allTimeRanking.slice(0, 10).map((contributor, index) => (
                    <tr
                      key={contributor.idNumber}
                      className="border-b border-[#eeeeee] last:border-b-0"
                    >
                      <td className="px-3 py-2">
                        <span
                          className={cn(
                            "flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold",
                            rankBadgeClass(index + 1)
                          )}
                        >
                          {index + 1}
                        </span>
                      </td>
                      <td className="px-3 py-2 font-medium">
                        {contributor.name}
                      </td>
                      <td className="px-3 py-2 text-[#777]">
                        {contributor.idNumber}
                      </td>
                      <td className="px-3 py-2">
                        <TypeBadge type={contributor.type} />
                      </td>
                      <td className="px-3 py-2 text-right font-semibold text-[#1c9dde]">
                        {formatScore(
                          contributor.score,
                          contributor.metricLabel
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  );
};
