const jsbarcode = require("jsbarcode");
const { createCanvas } = require("@napi-rs/canvas");
const { writeFileSync, existsSync } = require("node:fs");
const path = require("node:path");

function generateRandomStringFromDate() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const now = Date.now();

  const randomLetter =
    letters[Math.floor(Math.random() * now) % letters.length];

  const randomNumbers1 = String(Math.floor(Math.random() * now)).slice(-6, -1);

  const randomNumbers2 = String(Math.floor(Math.random() * now)).slice(-3);

  return `${randomLetter}${randomNumbers1}${randomNumbers2}`;
}

async function createBarcodeSheet() {
  const width = 210 * 3.78;
  const height = 297 * 3.78;

  const finalCanvas = createCanvas(width, height);
  const ctx = finalCanvas.getContext("2d");
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, width, height);
  let x = 0;
  let y = 0;
  const spacing = 15;

  while (y < height) {
    const barcodeData = generateRandomStringFromDate();

    const barcodeCanvas = createCanvas(1, 1);
    await jsbarcode(barcodeCanvas, barcodeData, {
      format: "CODE128",
      width: 2,
      height: 55,
      displayValue: true,
      margin: 10,
      textMargin: 0,
      fontSize: 11,
    });
    console.log(`Generated Barcode Data: ${barcodeData}`);
    if (existsSync(path.join(__dirname, "debug"))) {
      writeFileSync(
        path.join(__dirname, "debug", `${barcodeData}.png`),
        barcodeCanvas.toBuffer("image/png")
      );
    }
    const barcodeHeight = barcodeCanvas.height;
    const barcodeWidth = barcodeCanvas.width;
    if (y + barcodeHeight > height) {
      x += barcodeWidth + spacing;
      y = 0;
    }

    if (x + barcodeWidth > width) {
      break;
    }

    ctx.drawImage(barcodeCanvas, x, y, barcodeWidth, barcodeHeight);

    y += barcodeHeight + spacing;
  }

  const buffer = finalCanvas.toBuffer("image/png");
  await writeFileSync("barcode_sheet.png", buffer);
}

// Barkodları oluştur ve dosyaya yaz
createBarcodeSheet()
  .then(() => {
    console.log("Barkodlar başarıyla oluşturuldu.");
  })
  .catch((err) => {
    console.error("Barkod oluşturulurken bir hata oluştu:", err);
  });
