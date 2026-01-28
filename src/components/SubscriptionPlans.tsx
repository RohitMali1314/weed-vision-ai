import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Leaf, Sprout, TreeDeciduous } from "lucide-react";

interface Plan {
  id: string;
  nameKey: string;
  price: number;
  icon: React.ReactNode;
  featuresKeys: string[];
  popular?: boolean;
}

const plans: Plan[] = [
  {
    id: "basic",
    nameKey: "subscription.plans.basic.name",
    price: 99,
    icon: <Sprout className="h-8 w-8 text-primary" />,
    featuresKeys: [
      "subscription.plans.basic.feature1",
      "subscription.plans.basic.feature2",
      "subscription.plans.basic.feature3",
    ],
  },
  {
    id: "standard",
    nameKey: "subscription.plans.standard.name",
    price: 499,
    icon: <Leaf className="h-8 w-8 text-primary" />,
    featuresKeys: [
      "subscription.plans.standard.feature1",
      "subscription.plans.standard.feature2",
      "subscription.plans.standard.feature3",
      "subscription.plans.standard.feature4",
    ],
    popular: true,
  },
  {
    id: "premium",
    nameKey: "subscription.plans.premium.name",
    price: 999,
    icon: <TreeDeciduous className="h-8 w-8 text-primary" />,
    featuresKeys: [
      "subscription.plans.premium.feature1",
      "subscription.plans.premium.feature2",
      "subscription.plans.premium.feature3",
      "subscription.plans.premium.feature4",
      "subscription.plans.premium.feature5",
    ],
  },
];

export const SubscriptionPlans = () => {
  const { t } = useTranslation();

  return (
    <section className="py-16 px-4" id="subscription">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4 border-primary/30 text-primary">
            {t("subscription.badge")}
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent mb-4">
            {t("subscription.title")}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t("subscription.description")}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                plan.popular
                  ? "border-primary shadow-lg shadow-primary/20"
                  : "border-border/50"
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0">
                  <Badge className="rounded-none rounded-bl-lg bg-primary text-primary-foreground">
                    {t("subscription.popular")}
                  </Badge>
                </div>
              )}
              <CardHeader className="text-center pb-2">
                <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 w-fit">
                  {plan.icon}
                </div>
                <CardTitle className="text-xl">{t(plan.nameKey)}</CardTitle>
                <CardDescription className="text-muted-foreground">
                  {t("subscription.perMonth")}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="mb-6">
                  <span className="text-4xl font-bold">₹{plan.price}</span>
                  <span className="text-muted-foreground">/mo</span>
                </div>
                <ul className="space-y-3 text-left">
                  {plan.featuresKeys.map((featureKey, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">
                        {t(featureKey)}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className={`w-full ${
                    plan.popular
                      ? "bg-primary hover:bg-primary/90"
                      : "bg-secondary hover:bg-secondary/80"
                  }`}
                  variant={plan.popular ? "default" : "secondary"}
                >
                  {t("subscription.choosePlan")}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          {t("subscription.note")}
        </p>
      </div>
    </section>
  );
};
