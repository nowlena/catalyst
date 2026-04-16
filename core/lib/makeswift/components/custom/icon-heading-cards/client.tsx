import { clsx } from 'clsx';
import { Hourglass, type LucideProps, Search } from 'lucide-react';

import { ButtonLink } from '@/vibes/soul/primitives/button-link';

export interface IconHeadingCardsProps {
  className?: string;
  cards: Array<{
    icon?: 'hour-glass' | 'search';
    heading: string;
    body: string;
    button: {
      text: string;
      link: { href: string; target?: string };
      variant: 'primary' | 'secondary' | 'tertiary' | 'ghost';
    };
  }>;
  orientation: 'horizontal' | 'vertical';
  colorScheme: 'light' | 'dark';
  showBorder: boolean;
}

const Icons = {
  'hour-glass': Hourglass,
  search: Search,
};

interface IconComponentProps extends LucideProps {
  name?: 'hour-glass' | 'search';
}

const IconComponent: React.FC<IconComponentProps> = ({ name, ...props }) => {
  if (!name) return null;

  const Component = Icons[name];

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!Component) {
    return null;
  }

  return <Component {...props} />;
};

export function IconHeadingCards({
  cards,
  orientation,
  showBorder,
  colorScheme,
  className,
}: IconHeadingCardsProps) {
  return (
    <div
      className={clsx(
        'flex gap-4 p-4',
        { horizontal: 'flex-row', vertical: 'flex-col' }[orientation],
        {
          light: 'text-[var(--card-light-text,hsl(var(--foreground)))]',
          dark: 'text-[var(--card-dark-text,hsl(var(--background)))]',
        }[colorScheme],
        className,
      )}
    >
      {cards.map((card, index) => (
        <div
          className={clsx('flex flex-1 flex-col gap-2 p-4', showBorder && 'rounded-md border-2')}
          key={index}
        >
          <div className="flex items-center gap-2">
            <IconComponent className="size-5" name={card.icon} />
            <h3 className={clsx('text-lg font-bold leading-tight tracking-normal @xs:text-xl')}>
              {card.heading}
            </h3>
          </div>
          <p>{card.body}</p>
          <ButtonLink
            className="w-fit"
            href={card.button.link.href}
            size="small"
            target={card.button.link.target}
            variant={card.button.variant}
          >
            {card.button.text}
          </ButtonLink>
        </div>
      ))}
    </div>
  );
}
