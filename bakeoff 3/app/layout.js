import './globals.css';

export const metadata = {
  title: 'FryRank | Find your perfect fry',
  description: 'Discover, rate, and review fast-food fries.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
