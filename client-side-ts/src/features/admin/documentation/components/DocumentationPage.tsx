import { useState } from "react";
import { PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DocSidebar } from "./DocSidebar";
import { DocContent } from "./DocContent";
import { documentationSections } from "../data/documentationData";

const DEFAULT_ARTICLE = "system-introduction";

export const DocumentationPage = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeArticleId, setActiveArticleId] = useState(DEFAULT_ARTICLE);

  const handleNavigate = (articleId: string) => {
    setActiveArticleId(articleId);
    window.scrollTo(0, 0);
  };

  return (
    <div className="bg-background flex h-screen overflow-hidden">
      <DocSidebar
        sections={documentationSections}
        activeArticleId={activeArticleId}
        onNavigate={handleNavigate}
        collapsed={collapsed}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center border-b px-4 lg:px-6">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setCollapsed((c) => !c)}
            className="shrink-0"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <PanelLeft className="h-4 w-4" />
          </Button>
          <div className="ml-3 flex-1 overflow-hidden">
            <p className="truncate text-sm font-medium">
              {documentationSections.find((s) =>
                s.children?.some((a) => a.id === activeArticleId)
              )?.title ?? "Documentation"}
            </p>
          </div>
        </header>

        <div className="flex-1 overflow-hidden">
          <DocContent articleId={activeArticleId} />
        </div>
      </div>
    </div>
  );
};
