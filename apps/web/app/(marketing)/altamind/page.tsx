import { color } from '@alta/design-tokens';
import { DomainLanding } from '../_domain';

export default function AltaMindLanding() {
  return (
    <DomainLanding
      name="AltaMind"
      tagline="Understand yourself."
      accent={color.mind}
      intro="A private space to notice how you are, reflect, and make decisions with more clarity. It surfaces patterns; you draw the conclusions."
      features={[
        'A one-minute daily check-in — no scores, no streaks',
        'A private journal, linked to the parts of life you care about',
        'Goals and a gentle weekly reset',
        'A decision room to frame choices — it never decides for you',
      ]}
      isNot={[
        'A productivity tracker',
        'A diagnosis or therapy tool',
        'Something that decides for you',
      ]}
    />
  );
}
