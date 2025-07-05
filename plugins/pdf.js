const { cmd } = require("../command");
const { getBuffer, isUrl } = require("../lib/functions");

cmd(
  {
    pattern: "pdf",
    alias: ["getpdf", "dlpdf"],
    react: "📄",
    desc: "Download and send a PDF from a given URL.",
    category: "tools",
    filename: __filename,
  },
  async (
    robin,
    mek,
    m,
    {
      from,
      quoted,
      body,
      isCmd,
      command,
      args,
      q,
      reply,
    }
  ) => {
    try {
      if (!q || !isUrl(q) || !q.endsWith('.pdf')) {
        return reply("*Usage:* /pdf <direct PDF url>\nExample: /pdf https://example.com/file.pdf");
      }
      reply("*Fetching your PDF...* 📄");
      // Try to get the PDF buffer
      const buffer = await getBuffer(q);
      if (!buffer) return reply("*Failed to download the PDF. The link may be invalid or the file is too large.*");
      // Send as document
      await robin.sendMessage(
        from,
        {
          document: buffer,
          mimetype: "application/pdf",
          fileName: q.split("/").pop() || "file.pdf",
          caption: `*PDF from:* ${q}`,
        },
        { quoted: mek }
      );
      return reply("> *PDF sent successfully!* 📄");
    } catch (e) {
      console.error(e);
      reply(`*Error: ${e.message || e}*`);
    }
  }
); 