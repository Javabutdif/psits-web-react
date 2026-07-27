import puppeteer, { Browser, PDFOptions } from "puppeteer";
import ejs from "ejs";
import path from "path";
import { pngToBase64, ttfToBase64 } from "../../utils/to-base64";
import { TCertificateData } from "../mail.interface";
import { Extensions } from "../../utils/path-normalizer";
import {
  normalizeFinalPath,
  isFilenameExtensionsAny,
} from "../../utils/path-normalizer";

const ASSETS_BASE_DIR = path.resolve(__dirname, "../../assets");
const pdfConfig: PDFOptions = {
  format: "A4",
  landscape: true,
  printBackground: true,
};

let browserInstance: Browser | null = null;

const getBrowser = async (): Promise<Browser> => {
  // If no browser exists or the connection was dropped, spin up/connect a new one
  if (!browserInstance || !browserInstance.isConnected()) {
    const browserlessUrl = process.env.BROWSERLESS_URL;
    
    if (browserlessUrl) {
      browserInstance = await puppeteer.connect({ browserWSEndpoint: browserlessUrl });
    } else {
      browserInstance = await puppeteer.launch({ 
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"]
      });
    }
  }
  return browserInstance;
};

export const validateAndFinalizeFilePath = (
  basePath: string,
  relativePath: string,
  allowedExtensions: Extensions[]
): string => {
  const finalPath = normalizeFinalPath(basePath, relativePath);
  if (!isFilenameExtensionsAny(finalPath, allowedExtensions)) {
    throw new Error(
      "This file extension is not allowed for this implementation"
    );
  }
  return finalPath;
};

export const generatePDFFromEJS = async (
  templatePath: string,
  data: TCertificateData
) => {
  if (data.images) {
    for (const [key, value] of Object.entries(data.images)) {
      const allowedExtensions: Extensions[] = [Extensions.png];
      const imagePath = validateAndFinalizeFilePath(
        ASSETS_BASE_DIR,
        value,
        allowedExtensions
      );
      data.images[key] = await pngToBase64(imagePath);
    }
  }

  if (data.fonts) {
    for (const [key, value] of Object.entries(data.fonts)) {
      const allowedExtensions: Extensions[] = [Extensions.ttf];
      const fontPath = validateAndFinalizeFilePath(
        ASSETS_BASE_DIR,
        value,
        allowedExtensions
      );
      data.fonts[key] = await ttfToBase64(fontPath);
    }
  }

  // const start = performance.now();

  const ejsTemplate = (await ejs.renderFile(
    path.join(ASSETS_BASE_DIR, templatePath),
    data,
    { cache: true }
  )) as string;

  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    await page.setContent(ejsTemplate, { waitUntil: "load" });
    const pdfBuffer = await page.pdf(pdfConfig);
    return pdfBuffer;
  } finally {
    // ALWAYS close the tab to free up memory, but keep the browser connection alive
    await page.close();
  }
};
