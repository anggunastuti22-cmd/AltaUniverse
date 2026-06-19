import { color } from '@alta/design-tokens';
import { DomainLanding } from '../_domain';

export default function AltaLabLanding() {
  return (
    <DomainLanding
      name="AltaLab"
      tagline="Care for yourself."
      accent={color.lab}
      intro="Track your skincare gently, learn calmly, and understand your routine — in your own words. Educational, never diagnostic."
      features={[
        'A self-described skin baseline you can change anytime',
        'A product cabinet with cost-per-use and function overlap',
        'Morning and evening routines',
        'A private observation log and product experiments',
      ]}
      isNot={[
        'A diagnosis or medical advice',
        'A substitute for a dermatologist',
        'A promise of results',
      ]}
    />
  );
}
