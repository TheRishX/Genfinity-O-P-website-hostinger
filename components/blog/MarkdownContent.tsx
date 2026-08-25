export function MarkdownContent({ html }: { html: string }) {
  return (
    <div
      className="markdown-article-content"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
