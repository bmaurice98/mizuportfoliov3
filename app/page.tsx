import Footer from "@/components/footer";
import Hero from "@/components/hero";
import Navbar from "@/components/navbar";
import ProfessionalSummary from "@/components/professionalSummary";
import TechDisplay from "@/components/techDisplay";
import Image from "next/image";

export default function Home() {
  return (
    <div className="">
      <div className="fixed top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-primary-container opacity-[0.03] blur-[150px] rounded-full pointer-events-none -z-10"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-secondary opacity-[0.02] blur-[120px] rounded-full pointer-events-none -z-10"></div>
      {/* // <!-- TopNavBar Component --> */}
      <Navbar />
      {/* // <!-- Main Content Canvas --> */}
      <main className="w-full">
        {/* <!-- Hero Section --> */}
        <Hero />
        {/* <!-- Professional Summary (Simulated below fold appearance) --> */}
        <ProfessionalSummary />
        {/* <!-- Abstract Tech Section (Bento Grid Style) --> */}
        <TechDisplay />
      </main>
      {/* // <!-- Footer Component --> */}
      <Footer />
    </div>
  );
}
