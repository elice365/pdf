import { FeatureCard } from "./feature-card";
import { featuresData } from "./features-data";
import { ILoveImgCard } from "./ilove-img-card";
import { PremiumBanner } from "./premium-banner";

export function FeaturesSection() {
  return (
    <section
      className="w-full bg-surface dark:bg-background py-12 md:py-16"
      aria-labelledby="features-heading"
    >
      <div className="container mx-auto px-4">
        {/* Business Features Cards */}
        <div className="mb-12">
          <h2
            id="features-heading"
            className="mb-8 text-center text-2xl md:text-3xl font-bold text-foreground"
          >
            나만의 방식으로 작업하세요
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:gap-6">
            {featuresData.slice(0, 3).map((feature) => (
              <FeatureCard
                key={feature.id}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </div>

        {/* Premium Banner */}
        <div className="mb-12">
          <PremiumBanner />
        </div>

        {/* iLoveIMG Integration Card */}
        <div className="mb-12">
          <ILoveImgCard />
        </div>
      </div>
    </section>
  );
}
