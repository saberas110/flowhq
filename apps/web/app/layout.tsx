import './global.css';
import ChatProvider from "@/contexts/ChatContext";

export const metadata = {
  title: 'FlowHQ - AI Automation Platform',
  description: 'Automate your workflows with FlowHQ AI-powered platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ChatProvider>{children}</ChatProvider>
      </body>
    </html>
  );
}
