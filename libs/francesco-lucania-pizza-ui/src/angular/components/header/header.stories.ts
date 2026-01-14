import { Meta, moduleMetadata, Story } from '@storybook/angular';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from 'ngx-neo-ui';

export default {
  title: 'neo-ui-header',
  component: HeaderComponent,
  decorators: [
    moduleMetadata({
      imports: [CommonModule],
    }),
  ],
  parameters: {
    // More on Story layout: https://storybook.js.org/docs/angular/configure/story-layout
    layout: 'fullscreen',
  },
} as Meta;

const Template: Story<HeaderComponent> = (args: HeaderComponent) => ({
  props: {
    navigate: [
      {
        name: 'link 1',
        uri: '',
      },
      {
        name: 'link 2',
        uri: '',
      },
      {
        name: 'link 3',
        uri: '',
      },
      {
        name: 'link 4',
        uri: '',
      },
    ],
  },
});

export const LoggedIn = Template.bind({});
LoggedIn.args = {};

export const LoggedOut = Template.bind({});
LoggedOut.args = {};
