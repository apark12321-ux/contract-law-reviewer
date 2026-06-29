import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "계약서 법무 검토툴",
  description: "계약서 초안을 업로드하면 리스크와 수정안을 시각적으로 분석합니다."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
