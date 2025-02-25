import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BookText, CheckCircle, ClipboardList, FileText } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 space-y-12 bg-background">
      <div className="text-center space-y-4 max-w-2xl">
        <BookText className="mx-auto h-12 w-12 text-primary mb-4" />
        <h1 className="text-4xl font-bold tracking-tight">
          Notate
        </h1>
        <p className="text-muted-foreground text-lg">
          The homework submission platform that just works.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl px-4">
        {[
          {
            icon: CheckCircle,
            title: "Submit Work",
            desc: "Upload assignments before deadlines with confirmation"
          },
          {
            icon: FileText,
            title: "Receive Feedback",
            desc: "Get grades and comments from instructors"
          },
          {
            icon: ClipboardList,
            title: "Track Assignments",
            desc: "Monitor submissions and assignment deadlines."
          }
        ].map((feature, index) => (
          <Card
            key={index}
            className="hover:border-primary/20 transition-colors"
          >
            <CardHeader className="space-y-3 p-5">
              <div className="p-3 rounded-lg bg-primary/10 w-fit">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">{feature.title}</CardTitle>
              <CardDescription className="text-muted-foreground/80 leading-snug">
                {feature.desc}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="flex flex-col items-center space-y-8">
        <Link href="/login">
          <Button size="lg" className="px-8">
            Get Started
          </Button>
        </Link>
      </div>
    </div>
  );
}
