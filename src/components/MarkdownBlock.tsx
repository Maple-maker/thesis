import { Fragment } from "react";
import { Text, View } from "react-native";

/** Simple markdown block renderer for support/legal documents.
 *  Handles headings, paragraphs, bold text, bullet lists, tables, and dividers. */
export function MarkdownBlock({ content }: { content: string }) {
  const lines = content.split("\n");
  const blocks: React.ReactNode[] = [];

  let i = 0;
  let inTable = false;
  let tableRows: { cells: string[]; isHeader: boolean }[] = [];
  let keyCounter = 0;

  function k() {
    return `md-${keyCounter++}`;
  }

  function flushTable() {
    if (!inTable || tableRows.length === 0) return;
    const rows = tableRows;
    tableRows = [];
    inTable = false;

    blocks.push(
      <View key={k()} className="my-2 rounded-[10px] overflow-hidden border border-line">
        {rows.map((row, ri) => {
          const isHeader = row.isHeader;
          const isLast = ri === rows.length - 1;
          return (
            <View
              key={`tr-${ri}`}
              className={`flex-row ${isHeader ? "bg-bg-subtle" : ""} ${!isLast ? "border-b border-line" : ""}`}
            >
              {row.cells.map((cell, ci) => {
                const clean = cell.replace(/^\*?\*?(.*?)\*?\*?$/, "$1").trim();
                return (
                  <View
                    key={`td-${ci}`}
                    className={`flex-1 px-2 py-1.5 ${ci < row.cells.length - 1 ? "border-r border-line" : ""}`}
                  >
                    <Text
                      className={`text-[11px] leading-[15px] text-ink ${isHeader ? "font-sansX" : "font-sansMd"}`}
                    >
                      {clean}
                    </Text>
                  </View>
                );
              })}
            </View>
          );
        })}
      </View>,
    );
  }

  function renderInline(text: string): React.ReactNode[] {
    // Bold: **text** or __text__
    const parts = text.split(/(\*\*.*?\*\*|__.*?__)/g);
    return parts.map((part, idx) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <Text key={idx} className="font-sansX">
            {part.slice(2, -2)}
          </Text>
        );
      }
      if (part.startsWith("__") && part.endsWith("__")) {
        return (
          <Text key={idx} className="font-sansX">
            {part.slice(2, -2)}
          </Text>
        );
      }
      return <Text key={idx}>{part}</Text>;
    });
  }

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Divider
    if (trimmed === "---" || trimmed === "***") {
      flushTable();
      blocks.push(
        <View key={k()} className="h-px bg-line my-4" />,
      );
      i++;
      continue;
    }

    // Table row detection
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      // Check if it's a separator row (e.g. |---|---|)
      const cells = trimmed
        .slice(1, -1)
        .split("|")
        .map((c) => c.trim());
      const isSepRow = cells.every(
        (c) => /^:?-{3,}:?$/.test(c) || c === "",
      );
      if (isSepRow) {
        i++;
        continue;
      }
      if (!inTable) {
        inTable = true;
        tableRows = [];
      }
      // First row of a table is the header
      const isHeader = tableRows.length === 0;
      tableRows.push({ cells, isHeader });
      i++;
      continue;
    } else if (inTable) {
      flushTable();
    }

    // Blank line
    if (trimmed === "") {
      i++;
      continue;
    }

    // H1
    if (trimmed.startsWith("# ")) {
      blocks.push(
        <Text
          key={k()}
          className="text-ink font-displayX text-[22px] mt-5 mb-1"
          style={{ letterSpacing: -0.4, lineHeight: 28 }}
        >
          {trimmed.slice(2)}
        </Text>,
      );
      i++;
      continue;
    }

    // H2
    if (trimmed.startsWith("## ")) {
      blocks.push(
        <Text
          key={k()}
          className="text-ink font-sansX text-[15px] mt-5 mb-1"
        >
          {trimmed.slice(3)}
        </Text>,
      );
      i++;
      continue;
    }

    // H3
    if (trimmed.startsWith("### ")) {
      blocks.push(
        <Text
          key={k()}
          className="text-ink font-sansSb text-[13px] mt-4 mb-0.5"
        >
          {trimmed.slice(4)}
        </Text>,
      );
      i++;
      continue;
    }

    // Bullet list
    if (/^[-*] /.test(trimmed)) {
      const bulletText = trimmed.slice(2);
      blocks.push(
        <View key={k()} className="flex-row mt-0.5 ml-1">
          <Text className="text-ink-3 font-sansMd mr-2 text-[13px] leading-[20px]">
            •
          </Text>
          <Text className="text-ink-2 font-sansMd text-[13px] leading-[20px] flex-1">
            {renderInline(bulletText)}
          </Text>
        </View>,
      );
      i++;
      continue;
    }

    // Numbered list (e.g. "1. text")
    if (/^\d+\. /.test(trimmed)) {
      const match = trimmed.match(/^(\d+)\.\s/);
      const num = match ? match[1] : "";
      const rest = trimmed.slice(match ? match[0].length : 0);
      blocks.push(
        <View key={k()} className="flex-row mt-0.5 ml-1">
          <Text className="text-ink-3 font-sansMd mr-2 text-[13px] leading-[20px] w-5">
            {num}.
          </Text>
          <Text className="text-ink-2 font-sansMd text-[13px] leading-[20px] flex-1">
            {renderInline(rest)}
          </Text>
        </View>,
      );
      i++;
      continue;
    }

    // Checkbox list
    if (/^-\s\[x\]/i.test(trimmed)) {
      const rest = trimmed.slice(5).trim();
      blocks.push(
        <View key={k()} className="flex-row mt-0.5 ml-1">
          <Text className="text-brand font-sansX mr-2 text-[13px] leading-[20px]">
            ☑
          </Text>
          <Text className="text-ink-2 font-sansMd text-[13px] leading-[20px] flex-1">
            {renderInline(rest)}
          </Text>
        </View>,
      );
      i++;
      continue;
    }

    // Arrow-style ( ↓ or → )
    if (trimmed === "↓" || trimmed === "→") {
      blocks.push(
        <Text key={k()} className="text-ink-3 text-center text-[14px] my-1 font-mono">
          ↓
        </Text>,
      );
      i++;
      continue;
    }

    // Block quote
    if (trimmed.startsWith("> ")) {
      blocks.push(
        <View key={k()} className="border-l-2 border-brand pl-3 my-2 py-1 ml-1">
          <Text className="text-ink-2 font-sansMd text-[13px] leading-[19px] italic">
            {trimmed.slice(2)}
          </Text>
        </View>,
      );
      i++;
      continue;
    }

    // Emphasis line (bold + colon list items, e.g. "**Label:** description")
    // Already handled as regular paragraph with inline bold

    // Regular paragraph
    blocks.push(
      <Text key={k()} className="text-ink-2 font-sansMd text-[13px] leading-[20px] mt-2">
        {renderInline(trimmed)}
      </Text>,
    );
    i++;
  }

  // Flush any remaining table
  flushTable();

  return <>{blocks}</>;
}
