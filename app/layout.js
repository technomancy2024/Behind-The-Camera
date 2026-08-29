import { Oswald, Noto_Sans } from "next/font/google";
import "./globals.css";

const oswald = Oswald({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const notoSans = Noto_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: "IIFJK Festival Caricature Studio",
  description: "Turn your selfie into a vibrant AI festival caricature.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${oswald.variable} ${notoSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
