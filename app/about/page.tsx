import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";

interface TeamMember {
  name: string;
  role: string;
  image: string;
}

const teamMembers: TeamMember[] = [
  {
    name: "Hồ Đức Trung",
    role: "B21DCCN728",
    image: "/about.jpg",
  },
  {
    name: "Đinh Quốc Việt",
    role: "B21DCCN788",
    image: "/about.jpg",
  },
  {
    name: "Nguyễn Duy Mạnh",
    role: "B21DCCN512",
    image: "/about.jpg",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-[400px] w-full overflow-hidden">
        <Image
          src="/banner.webp"
          alt="About Us Hero"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              About Ecom
            </h1>
            <p className="text-lg md:text-xl max-w-2xl mx-auto">
              Your one-stop shop for premium keyboards, mice, and tech accessories
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Mission</h2>
          <p className="text-muted-foreground max-w-3xl mx-auto">
            At Ecom, we&apos;re passionate about providing high-quality tech
            accessories that enhance your digital experience. From mechanical
            keyboards to precision mice, we curate products that combine
            performance, style, and durability.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Our Vision</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                To be the leading destination for tech enthusiasts seeking
                innovative and reliable accessories that elevate their setup.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Our Values</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-4">
                <li>Quality: Premium products that last</li>
                <li>Innovation: Cutting-edge designs</li>
                <li>Community: Supporting tech enthusiasts</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 px-4 md:px-8 bg-muted">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Meet Our Team
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member) => (
              <Card key={member.name} className="text-center">
                <CardContent className="pt-6">
                  <div className="relative w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden">
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h3 className="text-xl font-semibold">{member.name}</h3>
                  <p className="text-muted-foreground">{member.role}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 md:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Ready to Upgrade Your Setup?
        </h2>
        <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
          Explore our collection of premium keyboards, mice, and accessories
          designed for performance and style.
        </p>
        <Button asChild size="lg">
          <Link href="/products">Shop Now</Link>
        </Button>
      </section>
    </div>
  );
}