import './globals.css';

export const metadata = {
  title: 'meal mate — Meal Planner',
  description: 'A simple, budget-friendly meal planner built with Next.js.',
};

export default function RootLayout({ children }) {
  return <html lang="en"><body>{children}</body></html>;
}
