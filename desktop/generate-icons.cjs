"use strict";

const fs = require("node:fs/promises");
const path = require("node:path");
const sharp = require("sharp");
const pngToIco = require("png-to-ico");

const root = __dirname;
const source = path.join(root, "build", "icon.svg");
const assets = path.join(root, "assets");
const iconset = path.join(root, "build", "icon.iconset");

async function main() {
  await fs.mkdir(assets, { recursive: true });
  await fs.mkdir(iconset, { recursive: true });
  const sizes = [16, 32, 64, 128, 256, 512, 1024];
  const pngs = [];
  for (const size of sizes) {
    const out = path.join(assets, `icon-${size}.png`);
    await sharp(source, { density: 300 }).resize(size, size).png().toFile(out);
    pngs.push(out);
  }
  const ico = await pngToIco(pngs.filter((_, i) => [0,1,3,4].includes(i)));
  await fs.writeFile(path.join(assets, "DSAI.ico"), ico);

  const macSizes = [
    [16, "icon_16x16.png"], [32, "icon_16x16@2x.png"],
    [32, "icon_32x32.png"], [64, "icon_32x32@2x.png"],
    [128, "icon_128x128.png"], [256, "icon_128x128@2x.png"],
    [256, "icon_256x256.png"], [512, "icon_256x256@2x.png"],
    [512, "icon_512x512.png"], [1024, "icon_512x512@2x.png"]
  ];
  for (const [size, name] of macSizes) {
    await sharp(source, { density: 300 }).resize(size, size).png()
      .toFile(path.join(iconset, name));
  }
  console.log("Generated DSAI ICO and macOS iconset from the repository SVG source.");
}

main().catch((error) => {
  console.error("Icon generation failed:", error);
  process.exitCode = 1;
});
