import Hero from "../components/Hero";
import QuickAccessCards from "../components/QuickAccessCards";
import MetricsCounter from "../components/MetricsCounter";
import ProgramsOverview from "../components/ProgramsOverview";
import SwastikExperience from "../components/SwastikExperience";
import EventCountdown from "../components/EventCountdown";
import NewsEvents from "../components/NewsEvents";
import Testimonials from "../components/Testimonials";
import BlogSection from "../components/BlogSection";
import TakeATour from "./TakeATour";
import PlacementPartners from "./PlacementPartners";
import SisterInstitutes from "./SisterInstitutes";
import WhyChooseUs from "./WhyChooseUs";
import { Section } from "../components/Visibility";
import Reveal from "../components/Reveal";
import SEO, { SITE_URL } from "../components/SEO";

export default function Home() {
  return (
    <>
      <SEO
        title="Best BSc. CSIT & BCA College in Kathmandu, Nepal"
        description="Swastik College is a Tribhuvan University (TU) affiliated college in Kathmandu offering BSc. CSIT and BCA programs with 100% placement support, industry partnerships and experienced faculty."
        path="/"
        keywords="Swastik College, best college in Kathmandu, best college in Nepal, BSc CSIT college, BCA college,  college, TU affiliated college"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "CollegeOrUniversity",
          name: "Swastik College",
          alternateName: [
            "Swastik College Kathmandu",
            "Swastik CSIT College",
            "Swastik BCA College",
          ],
          url: SITE_URL,
          description:
            "TU-affiliated college in Kathmandu, Nepal offering BSc. CSIT and BCA programs with industry partnerships and 100% placement support.",
          address: {
            "@type": "PostalAddress",
            addressLocality: "Kathmandu",
            addressCountry: "NP",
          },
        }}
      />
      {/* Hero stays un-wrapped — it's the first thing on screen, so it
          should be there immediately rather than fading in. */}
      <Section page="home" section="hero">
        <Hero />
      </Section>
      <Section page="home" section="quickAccess">
        <Reveal>
          <QuickAccessCards />
        </Reveal>
      </Section>
      <Section page="home" section="whyChooseUs">
        <Reveal>
          <WhyChooseUs />
        </Reveal>
      </Section>
      <Section page="home" section="programsOverview">
        <Reveal>
          <ProgramsOverview />
        </Reveal>
      </Section>
      <Section page="home" section="swastikExperience">
        <Reveal>
          <SwastikExperience />
        </Reveal>
      </Section>

      <Section page="home" section="eventCountdown">
        <Reveal>
          <EventCountdown />
        </Reveal>
      </Section>
      <Section page="home" section="newsEvents">
        <Reveal>
          <NewsEvents />
        </Reveal>
      </Section>
      <Section page="home" section="takeATour">
        <Reveal>
          <TakeATour />
        </Reveal>
      </Section>
      <Section page="home" section="placementPartners">
        <Reveal>
          <PlacementPartners />
        </Reveal>
      </Section>
      <Section page="home" section="sisterInstitutes">
        <Reveal>
          <SisterInstitutes />
        </Reveal>
      </Section>
      <Section page="home" section="blog">
        <Reveal>
          <BlogSection />
        </Reveal>
      </Section>
    </>
  );
}
