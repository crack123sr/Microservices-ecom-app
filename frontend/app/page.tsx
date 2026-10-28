import Header from "@/_components/Header";
import RecentProducts from "@/_components/RecentProducts";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <RecentProducts />
    </div>
  );
}
