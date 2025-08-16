"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportTaxReport = void 0;
// functions/src/tax-report.ts
const https_1 = require("firebase-functions/v2/https");
const admin = __importStar(require("firebase-admin"));
const pdf_lib_1 = require("pdf-lib");
const fontkit_1 = __importDefault(require("@pdf-lib/fontkit"));
admin.initializeApp();
let cachedFont = null;
async function loadJpFont() {
    if (cachedFont)
        return cachedFont;
    const [buf] = await admin
        .storage()
        .bucket()
        .file('fonts/ipaexg.ttf') // ← Storage 上のパス
        .download();
    cachedFont = new Uint8Array(buf);
    return cachedFont;
}
exports.exportTaxReport = (0, https_1.onRequest)({ cors: true }, async (req, res) => {
    try {
        const year = String(req.query.year ?? new Date().getFullYear());
        // TODO: Firebase Auth 検証（IDトークン）＆ uid でデータ取得
        const pdfDoc = await pdf_lib_1.PDFDocument.create();
        pdfDoc.registerFontkit(fontkit_1.default);
        const jpFontData = await loadJpFont();
        const jpFont = await pdfDoc.embedFont(jpFontData, { subset: true });
        // A4: 595.28 x 841.89 pt
        const page = pdfDoc.addPage([595.28, 841.89]);
        const margin = 48;
        const { width, height } = page.getSize();
        // タイトル
        page.drawText(`確定申告レポート（${year}年）`, {
            x: margin, y: height - margin,
            size: 16, font: jpFont, color: (0, pdf_lib_1.rgb)(0, 0, 0),
        });
        // 例：サマリー（ここにFireStore集計結果を差し込む）
        const lines = [
            '事業収入合計：¥1,234,567',
            '必要経費合計：¥456,789',
            '課税対象所得：¥777,778',
            '納付見込み：¥123,456'
        ];
        let y = height - margin - 32;
        for (const line of lines) {
            page.drawText(line, { x: margin, y, size: 12, font: jpFont });
            y -= 18;
        }
        // 罫線例
        page.drawLine({
            start: { x: margin, y: y - 8 },
            end: { x: width - margin, y: y - 8 },
            thickness: 0.5, color: (0, pdf_lib_1.rgb)(0.7, 0.7, 0.7),
        });
        // 明細（テーブル風に）
        y -= 24;
        const headers = ['日付', '内容', '区分', '金額'];
        const rows = [
            ['2025/01/05', 'クラウド利用料', '経費', '-¥3,300'],
            ['2025/01/10', 'Web制作代金', '売上', '¥120,000'],
        ];
        const colsX = [margin, margin + 120, margin + 320, width - margin - 80];
        headers.forEach((h, i) => {
            page.drawText(h, { x: colsX[i], y, size: 11, font: jpFont });
        });
        y -= 16;
        for (const r of rows) {
            r.forEach((cell, i) => {
                page.drawText(cell, { x: colsX[i], y, size: 10, font: jpFont });
            });
            y -= 14;
            if (y < margin + 60) {
                // ページ繰り越し（必要なときに新ページ）
                y = height - margin - 32;
                const p = pdfDoc.addPage([595.28, 841.89]);
                p.drawText('（続き）', { x: margin, y: height - margin, size: 12, font: jpFont });
            }
        }
        const bytes = await pdfDoc.save();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="tax-${year}.pdf"`);
        res.status(200).send(Buffer.from(bytes));
    }
    catch (e) {
        console.error(e);
        const message = e instanceof Error ? e.message : String(e);
        res.status(500).json({ error: 'PDF生成に失敗しました', detail: message });
    }
});
