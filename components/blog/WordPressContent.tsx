import Image from "next/image";
import parse, { DOMNode, Element } from "html-react-parser";
import sanitizeHtml from "sanitize-html";

const cleanHtml = (html: string) =>
  sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      "img",
      "figure",
      "figcaption",
    ]),
    allowedAttributes: {
      "*": ["class", "id"],
      a: ["href", "target", "rel", "title"],
      img: [
        "src",
        "alt",
        "width",
        "height",
        "loading",
        "decoding",
        "srcset",
        "sizes",
      ],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    transformTags: {
      a: (_tagName, attributes) => ({
        tagName: "a",
        attribs: {
          ...attributes,
          ...(attributes.target === "_blank"
            ? { rel: "noopener noreferrer" }
            : {}),
        },
      }),
    },
  });

function positiveDimension(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function WordPressContent({ html }: { html: string }) {
  return (
    <div className="wp-article-content">
      {parse(cleanHtml(html), {
        replace(node: DOMNode) {
          if (!(node instanceof Element) || node.name !== "img") return;

          const src = node.attribs.src;
          if (!src || !/^https?:\/\//i.test(src)) return;

          const width = positiveDimension(node.attribs.width, 1400);
          const height = positiveDimension(node.attribs.height, 788);
          return (
            <Image
              src={src}
              alt={node.attribs.alt || "Orthotic and prosthetic care article image"}
              width={width}
              height={height}
              sizes="(max-width: 768px) 92vw, 760px"
              className="h-auto w-full rounded-2xl"
            />
          );
        },
      })}
    </div>
  );
}
