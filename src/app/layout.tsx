import { Montserrat } from "next/font/google";
import "./globals.css";
import '@fortawesome/fontawesome-free/css/all.min.css';
const monSans = Montserrat({
  variable: "--font-mon-sans",
  subsets: ["latin"],
});

export const metadata = {
  title: "EduBot",
  description: "RAG model based application for solving doubts of students",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${monSans.className} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
