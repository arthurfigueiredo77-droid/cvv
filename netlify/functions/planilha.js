exports.handler = async function () {
  const sheetId = "1SqOGx8kNY_mzG6IFQ2ZXwbKuU4yGGX75m6O7f75JgPQ";
  const gid = "788810800";

  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;

  try {
    const response = await fetch(url, {
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0 CVV Dashboard",
        "Accept": "text/csv,*/*"
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const text = await response.text();

    if (!text || text.length < 20) {
      throw new Error("Planilha retornou vazia ou inválida.");
    }

    const inicio = text.trim().toLowerCase();
    if (inicio.startsWith("<!doctype") || inicio.startsWith("<html")) {
      throw new Error("O Google retornou HTML. Verifique se a planilha está pública para qualquer pessoa com o link.");
    }

    const buffer = Buffer.from(text, "utf8");

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-store"
      },
      body: JSON.stringify({
        ok: true,
        fonte: "Google Sheets",
        formato: "csv",
        sheetId,
        gid,
        fileBase64: buffer.toString("base64"),
        bytes: buffer.length,
        atualizadoEm: new Date().toISOString()
      })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-store"
      },
      body: JSON.stringify({
        ok: false,
        erro:
          "Falha ao baixar a planilha do Google Sheets. Verifique se ela está compartilhada como 'Qualquer pessoa com o link pode visualizar'. Detalhe: " +
          err.message
      })
    };
  }
};
