import './global.css';

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
      <body>{children}</body>
    </html>
  );
}
