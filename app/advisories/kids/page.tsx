import type { Metadata } from "next";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  LockPasswordIcon,
  Alert02Icon,
  UserShield02Icon,
  SearchVisualIcon,
  GameController03Icon,
  GlobeIcon,
  Home01Icon,
  UserMultiple02Icon,
  FavouriteIcon,
  Mouse13Icon,
  Award01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import Carousel from "@/components/ui/Carousel";

export const metadata: Metadata = {
  title: "Kids Advisory | CERRT",
  description:
    "Fun and educational cybersecurity resources for children to learn about staying safe online",
};

export default function KidsAdvisoryPage() {
  // Static kids advisory data - will be replaced with Sanity CMS later
  const advisories = [
    {
      id: 1,
      title: "Password Power",
      description:
        "Learn how to create strong passwords and keep your accounts safe!",
      icon: LockPasswordIcon,
      color: "bg-blue-500",
    },
    {
      id: 2,
      title: "Stranger Danger Online",
      description:
        "Important tips about talking to people you don't know on the internet.",
      icon: Alert02Icon,
      color: "bg-yellow-500",
    },
    {
      id: 3,
      title: "Smart Sharing",
      description:
        "What's safe to share online and what should you keep private?",
      icon: UserShield02Icon,
      color: "bg-green-500",
    },
    {
      id: 4,
      title: "Spotting Scams",
      description:
        "How to recognize when someone is trying to trick you online.",
      icon: SearchVisualIcon,
      color: "bg-purple-500",
    },
    {
      id: 5,
      title: "Gaming Safety",
      description: "Stay safe while playing your favorite online games!",
      icon: GameController03Icon,
      color: "bg-pink-500",
    },
    {
      id: 6,
      title: "Social Media Smarts",
      description: "How to use social media safely and responsibly.",
      icon: GlobeIcon,
      color: "bg-indigo-500",
    },
  ];

  const safetyTips = [
    {
      title: "Never Share Personal Info",
      description:
        "Don't share your full name, address, phone number, or school name online",
      icon: Home01Icon,
    },
    {
      title: "Ask an Adult First",
      description:
        "Always ask a parent or teacher before signing up for new websites or apps",
      icon: UserMultiple02Icon,
    },
    {
      title: "Be Kind Online",
      description: "Treat others with respect. Don't bully or say mean things",
      icon: FavouriteIcon,
    },
    {
      title: "Think Before You Click",
      description:
        "Don't click on links or download files from people you don't know",
      icon: Mouse13Icon,
    },
  ];

  // Gallery images - placeholder data
  const galleryImages = [
    "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80",
    "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80",
    "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&q=80",
    "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80",
  ];

  return (
    <main className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-secondary py-20 pattern-dots relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto animate-slide-in-up">
            <div className="inline-flex items-center justify-center mb-6">
              <div className="w-28 h-28 bg-primary/10 rounded-full flex items-center justify-center animate-float border-4 border-primary/20">
                <HugeiconsIcon
                  icon={UserShield02Icon}
                  size={80}
                  color="currentColor"
                  className="text-primary"
                />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 font-serif leading-tight">
              Kids Safety Corner
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Stay informed about the latest cybersecurity threats,
              vulnerabilities, and security updates affecting kids in Nigerian
              and globally.
            </p>
          </div>
        </div>
      </section>

      {/* Safety Tips */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block mb-4">
              <span className="text-primary font-semibold text-sm uppercase tracking-wider bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
                Stay Safe
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 font-serif">
              Top Safety Tips
            </h2>
            <p className="text-xl text-muted-foreground">
              Remember these important rules to stay safe online!
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {safetyTips.map((tip, index) => (
              <div
                key={index}
                className="group bg-white border-2 border-primary/20 rounded-2xl p-8 text-center hover-lift card-interactive relative overflow-hidden animate-slide-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Top accent line */}
                <div className="absolute top-0 left-0 w-full h-1 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>

                <div className="mb-6 flex justify-center">
                  <div
                    className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all duration-300 animate-float"
                    style={{ animationDelay: `${index * 0.5}s` }}
                  >
                    <HugeiconsIcon
                      icon={tip.icon}
                      size={48}
                      color="currentColor"
                      className="text-primary group-hover:text-white transition-colors"
                    />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors">
                  {tip.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {tip.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block mb-4">
              <span className="text-primary font-semibold text-sm uppercase tracking-wider bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
                Safety Adventures
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 font-serif">
              Kids Advisory Gallery
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Check out our fun and colorful safety posters and educational
              materials!
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="h-125">
              <Carousel
                images={galleryImages}
                autoPlay={true}
                interval={4000}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Learning Cards */}
      <section className="py-20 bg-secondary/30 pattern-dots relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block mb-4">
              <span className="text-primary font-semibold text-sm uppercase tracking-wider bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
                Learning Modules
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 font-serif">
              Learn About...
            </h2>
            <p className="text-xl text-muted-foreground">
              Click on any card to learn more about staying safe online!
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {advisories.map((advisory, index) => (
              <div
                key={advisory.id}
                className="bg-white border-2 border-border rounded-2xl overflow-hidden hover-lift cursor-pointer group card-interactive animate-slide-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div
                  className={`${advisory.color} p-10 text-center text-white relative overflow-hidden`}
                >
                  <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all duration-300"></div>
                  <div className="flex justify-center mb-4 relative z-10">
                    <div className="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center group-hover:scale-125 transition-transform duration-300">
                      <HugeiconsIcon
                        icon={advisory.icon}
                        size={64}
                        color="white"
                      />
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold relative z-10">
                    {advisory.title}
                  </h3>
                </div>
                <div className="p-8">
                  <p className="text-muted-foreground mb-6 text-lg leading-relaxed">
                    {advisory.description}
                  </p>
                  <button className="group/btn w-full px-6 py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary-light hover:shadow-lg transition-all inline-flex items-center justify-center gap-2">
                    Learn More
                    <HugeiconsIcon
                      icon={ArrowRight01Icon}
                      size={20}
                      color="currentColor"
                      className="group-hover/btn:translate-x-1 transition-transform"
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Quiz Teaser */}
      <section className="py-20 bg-secondary/30 pattern-dots">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative bg-linear-to-r from-primary to-accent text-primary-foreground rounded-3xl p-10 md:p-16 text-center overflow-hidden shadow-2xl">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pattern-dots"></div>

            <div className="relative z-10">
              <div className="flex justify-center mb-8">
                <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center animate-float border-4 border-white/30">
                  <HugeiconsIcon icon={Award01Icon} size={80} color="white" />
                </div>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 font-serif">
                Test Your Safety Skills!
              </h2>
              <p className="text-xl text-primary-foreground/90 mb-10 max-w-2xl mx-auto leading-relaxed">
                Take our fun quiz to see how much you know about staying safe
                online. Can you get all the answers right?
              </p>
              <button className="group px-10 py-4 bg-white text-primary font-bold rounded-xl hover:shadow-2xl hover:-translate-y-1 transition-all text-xl inline-flex items-center gap-3">
                <span className="relative z-10">Start Quiz</span>
                <HugeiconsIcon
                  icon={ArrowRight01Icon}
                  size={24}
                  color="currentColor"
                  className="group-hover:translate-x-2 transition-transform"
                />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Parent Resources */}
      <section className="py-20 bg-secondary pattern-dots relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <div className="inline-block mb-6">
            <span className="text-primary font-semibold text-sm uppercase tracking-wider bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
              For Adults
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 font-serif">
            For Parents & Teachers
          </h2>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Looking for resources to help teach kids about online safety? We
            have guides, lesson plans, and activities to help you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary-light hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              Download Parent Guide
              <svg
                className="w-5 h-5 group-hover:translate-y-1 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                />
              </svg>
            </button>
            <button className="group inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-primary text-primary font-bold rounded-lg hover:bg-primary hover:text-primary-foreground hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              Teacher Resources
              <svg
                className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
