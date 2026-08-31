import { Raleway, Noto_Sans } from "next/font/google";
import "./globals.css";

const raleway = Raleway({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const notoSans = Noto_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: "Behind the Camera",
  description:
    "Discover the people behind the scenes—from directing the action to capturing every cinematic frame.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${raleway.variable} ${notoSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
