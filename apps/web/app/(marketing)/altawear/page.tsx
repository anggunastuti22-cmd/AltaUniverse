import { color } from '@alta/design-tokens';
import { DomainLanding } from '../_domain';

export default function AltaWearLanding() {
  return (
    <DomainLanding
      name="AltaWear"
      tagline="Express yourself."
      accent={color.wear}
      intro="Understand what you own and dress well for the life you actually live. Image-forward but data-legible — value and usage sit alongside the picture."
      features={[
        'A calm wardrobe inventory with your own photos',
        'Outfit building from pieces you already own',
        'Wear logging and honest cost-per-wear',
        'A wishlist for reflection — a reason, not a buy button',
      ]}
      isNot={['An online store or checkout', 'A fashion social feed', 'A nudge to buy more']}
    />
  );
}
