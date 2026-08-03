import { useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { documentationSections } from "../data/documentationData";

interface DocContentProps {
  articleId: string;
}

export const DocContent = ({ articleId }: DocContentProps) => {
  const article = useMemo(() => {
    for (const section of documentationSections) {
      const found = section.children?.find((a) => a.id === articleId);
      if (found) return found;
    }
    return null;
  }, [articleId]);

  const currentSection = useMemo(() => {
    for (const section of documentationSections) {
      const found = section.children?.some((a) => a.id === articleId);
      if (found) return section;
    }
    return null;
  }, [articleId]);

  if (!article) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center">
          <p className="text-lg font-medium text-muted-foreground">Article not found</p>
          <p className="mt-1 text-sm text-muted-foreground">Select an article from the sidebar.</p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="mx-auto max-w-3xl px-6 py-8">
        <div className="mb-6">
          <p className="text-xs font-medium uppercase tracking-wider text-[#1C9DDE]">
            {currentSection?.title}
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">{article.title}</h1>
          <div className="mt-3 h-px w-full bg-border" />
        </div>

        <div>
          {article.content.map((paragraph, idx) => (
            <p key={idx} className="mb-4 text-[15px] leading-relaxed text-[#4a4a4a]">
              {paragraph}
            </p>
          ))}
        </div>

        {article.codeBlocks && article.codeBlocks.length > 0 && (
          <div className="mt-6 space-y-4">
            {article.codeBlocks.map((block, idx) => (
              <CodeBlock key={idx} block={block} />
            ))}
          </div>
        )}

        {article.tables && article.tables.length > 0 && (
          <div className="mt-6 space-y-4">
            {article.tables.map((table, idx) => (
              <table key={idx} className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-[#f8f8f8]">
                    {table.headers.map((header, hIdx) => (
                      <th
                        key={hIdx}
                        className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-[#666]"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {table.rows.map((row, rIdx) => (
                    <tr key={rIdx} className="border-b last:border-0">
                      {row.map((cell, cIdx) => (
                        <td
                          key={cIdx}
                          className={cn(
                            "px-3 py-2.5 align-top",
                            cIdx === 0 ? "font-medium text-[#333]" : "text-[#555]"
                          )}
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ))}
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

function CodeBlock({ block }: { block: { language: string; code: string; title?: string } }) {
  return (
    <div className="overflow-hidden rounded-lg border border-[#e5e5e5]">
      {block.title && (
        <div className="border-b bg-[#f8f8f8] px-4 py-2 text-xs font-medium text-[#666]">
          {block.title}
        </div>
      )}
      <pre className="bg-[#fafafa] p-4 text-[13px] leading-relaxed">
        <code className="font-mono text-[#333]">{block.code}</code>
      </pre>
    </div>
  );
}
