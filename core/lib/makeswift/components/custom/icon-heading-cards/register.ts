import {
  Checkbox,
  Group,
  Link,
  List,
  Select,
  Style,
  TextArea,
  TextInput,
} from '@makeswift/runtime/controls';

import { runtime } from '~/lib/makeswift/runtime';

import { IconHeadingCards } from './client';

export const COMPONENT_TYPE = 'icon-heading-cards';

// can be global
const icon = Select({
  label: 'Icon',
  options: [
    { value: 'hour-glass', label: 'Hour Glass' },
    { value: 'search', label: 'Search' },
  ],
});

const button = Group({
  label: 'Button',
  props: {
    text: TextInput({ label: 'Button Text', defaultValue: 'Button' }),
    link: Link({ label: 'Button URL' }),
    variant: Select({
      label: 'Variant',
      options: [
        { value: 'primary', label: 'Primary' },
        { value: 'secondary', label: 'Secondary' },
        { value: 'tertiary', label: 'Tertiary' },
        { value: 'ghost', label: 'Ghost' },
      ],
      defaultValue: 'primary',
    }),
  },
});

const card = Group({
  label: 'Card',
  props: {
    icon,
    heading: TextInput({ label: 'Heading', defaultValue: 'heading' }),
    body: TextArea({ label: 'Body', defaultValue: 'body' }),
    button,
  },
});

runtime.registerComponent(IconHeadingCards, {
  type: COMPONENT_TYPE,
  label: 'Cards (Icon + Heading)',
  icon: 'layout',
  props: {
    className: Style(),
    cards: List({
      label: 'Cards',
      type: card,
      getItemLabel: (item) => item?.heading ?? 'Heading',
    }),
    orientation: Select({
      label: 'Orientation',
      options: [
        { value: 'horizontal', label: 'Horizontal' },
        { value: 'vertical', label: 'Vertical' },
      ],
      defaultValue: 'horizontal',
    }),
    showBorder: Checkbox({ label: 'Show border', defaultValue: true }),
  },
});
