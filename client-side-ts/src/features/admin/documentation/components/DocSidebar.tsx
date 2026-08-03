import { cn } from "@/lib/utils";
import type { DocSection } from "../types/documentation.types";

interface DocSidebarProps {
  sections: DocSection[];
  activeArticleId: string;
  onNavigate: (articleId: string) => void;
  collapsed: boolean;
}

export const DocSidebar = ({ sections, activeArticleId, onNavigate, collapsed }: DocSidebarProps) => {
  return (
    <aside
      className={cn(
        "hidden border-r bg-background transition-all duration-300 lg:block",
        collapsed ? "w-16" : "w-64 xl:w-72"
      )}
    >
      <div className="flex h-full flex-col">
        <div className={cn("border-b px-4 py-4", collapsed && "px-2 py-3")}>
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#1C9DDE]/10">
                <span className="text-[#1C9DDE] text-sm font-bold">D</span>
              </div>
              <div>
                <p className="text-sm font-semibold leading-none">Documentation</p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">PSITS System</p>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1C9DDE]/10">
              <span className="text-[#1C9DDE] text-sm font-bold">D</span>
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto p-2">
          {sections.map((section) => (
            <SidebarSection
              key={section.id}
              section={section}
              activeArticleId={activeArticleId}
              onNavigate={onNavigate}
              collapsed={collapsed}
            />
          ))}
        </nav>
      </div>
    </aside>
  );
};

interface SidebarSectionProps {
  section: DocSection;
  activeArticleId: string;
  onNavigate: (articleId: string) => void;
  collapsed: boolean;
}

const SidebarSection = ({ section, activeArticleId, onNavigate, collapsed }: SidebarSectionProps) => {
  return (
    <div className="mb-1">
      <button
        type="button"
        onClick={() => {
          if (!collapsed && section.children && section.children.length > 0) {
            const firstChild = section.children[0];
            onNavigate(firstChild.id);
          }
        }}
        className={cn(
          "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors",
          collapsed ? "justify-center" : ""
        )}
      >
        <span className="text-base">{getSectionIcon(section.icon)}</span>
        {!collapsed && <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{section.title}</span>}
      </button>
      {!collapsed && section.children && (
        <div className="mt-0.5 space-y-0.5 pl-3">
          {section.children.map((article) => (
            <button
              key={article.id}
              type="button"
              onClick={() => onNavigate(article.id)}
              className={cn(
                "flex w-full items-center rounded-md px-2 py-1.5 text-left transition-colors",
                activeArticleId === article.id
                  ? "bg-[#1C9DDE]/10 text-[#1C9DDE]"
                  : "text-muted-foreground hover:bg-[#1C9DDE]/5 hover:text-foreground"
              )}
            >
              <span className="truncate text-xs">{article.title}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const getSectionIcon = (icon: string): string => {
  const icons: Record<string, string> = {
    overview: "O",
    auth: "A",
    roles: "R",
    "admin-features": "a",
    "student-features": "s",
    "public-features": "p",
    api: "API",
    infrastructure: "I",
  };
  return icons[icon] ?? "·";
};
