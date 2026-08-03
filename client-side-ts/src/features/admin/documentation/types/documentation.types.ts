export interface DocSection {
  id: string;
  title: string;
  icon: string;
  children?: DocArticle[];
}

export interface DocArticle {
  id: string;
  title: string;
  sectionId: string;
  content: string[];
  codeBlocks?: CodeBlock[];
  tables?: MarkdownTable[];
}

export interface CodeBlock {
  language: string;
  code: string;
  title?: string;
}

export interface MarkdownTable {
  headers: string[];
  rows: string[][];
}

export interface DocumentationRoute {
  path: string;
  sectionId: string;
  articleId: string;
}
