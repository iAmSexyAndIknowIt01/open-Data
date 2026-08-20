import Header from "../components/landingPage/Header";
import Hero from "../components/landingPage/Hero";
import ProblemSolution from "../components/landingPage/ProblemSolution";
import Features from "../components/landingPage/Features";
import Testimonial from "../components/landingPage/Testimonial";
import FooterCTA from "../components/landingPage/FooterCTA";
import Footer from "../components/landingPage/Footer";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 min-h-screen items-center justify-between bg-slate-50 font-sans dark:bg-black selection:bg-blue-600 selection:text-white">
      <main className="flex flex-col w-full items-center justify-center">
        <Header />
        <Hero />
        <ProblemSolution />
        <Features />
        <Testimonial />
        <FooterCTA />
      </main>
      <Footer />
    </div>
  );
}