// app/pricing/page.jsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../api/auth/[...nextauth]/options";
import { Check } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function PricingPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/api/auth/signin');
  }
  
  const plans = [
    {
      name: "Free",
      price: "$0",
      description: "Basic features for individuals",
      features: [
        "Up to 10 tasks",
        "1 project",
        "Basic task management",
        "7-day history"
      ],
      buttonText: "Get Started",
      buttonVariant: "outline"
    },
    {
      name: "Pro",
      price: "$12",
      period: "/month",
      description: "Everything in Free plus more features",
      features: [
        "Unlimited tasks",
        "Up to 10 projects",
        "Advanced task management",
        "30-day history",
        "File attachments",
        "Priority support"
      ],
      buttonText: "Upgrade",
      buttonVariant: "default",
      popular: true
    },
    {
      name: "Team",
      price: "$49",
      period: "/month",
      description: "For teams who need to manage work together",
      features: [
        "Everything in Pro",
        "Unlimited projects",
        "Team collaboration",
        "Admin controls",
        "Analytics",
        "API access",
        "24/7 dedicated support"
      ],
      buttonText: "Contact Sales",
      buttonVariant: "outline"
    }
  ];

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar session={session} />
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-3xl font-bold mb-2">Pricing Plans</h1>
              <p className="text-muted-foreground">Choose the plan that's right for you</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {plans.map((plan) => (
                <Card key={plan.name} className={plan.popular ? "border-primary" : ""}>
                  {plan.popular && (
                    <div className="absolute top-0 right-0 -mt-2 -mr-2">
                      <span className="bg-primary text-primary-foreground text-xs font-medium px-2.5 py-0.5 rounded-full">
                        Popular
                      </span>
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle>{plan.name}</CardTitle>
                    <div className="flex items-baseline mt-2">
                      <span className="text-3xl font-bold">{plan.price}</span>
                      {plan.period && <span className="ml-1 text-muted-foreground">{plan.period}</span>}
                    </div>
                    <CardDescription className="mt-2">{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-center">
                          <Check className="h-4 w-4 text-primary mr-2" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button variant={plan.buttonVariant} className="w-full">
                      {plan.buttonText}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}