import { Meta, moduleMetadata, Story } from '@storybook/angular';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from './button.component';

export default {
  title: 'neo-ui-button',
  component: ButtonComponent,
  decorators: [
    moduleMetadata({
      imports: [CommonModule],
    }),
  ],
  parameters: {
    layout: 'fullscreen',
  },
} as Meta;

const Template: Story<ButtonComponent> = (args: ButtonComponent) => ({
  props: args,
});

export const ThemeSecondary = Template.bind({});
ThemeSecondary.args = {
  label: 'Button Secondary',
  theme: 'secondary',
};

export const SizeSmall = Template.bind({});
SizeSmall.args = {
  label: 'Button Small',
  size: 'small',
};

export const SizeBig = Template.bind({});
SizeBig.args = {
  label: 'Button Large',
  size: 'large',
};
