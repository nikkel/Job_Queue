import React from 'react';
import Enzyme, { shallow, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import Dashboard from './Dashboard';

Enzyme.configure({ adapter: new Adapter() });

describe('Testing Dashboard Functionality', () => {
  test('Page renders without failure', () => {
    const wrapper = shallow(<Dashboard />);
    expect(wrapper.exists()).toBe(true);
  });

  test('The title element and value is expected', () => {
    const wrapper = shallow(<Dashboard />);
    expect(wrapper.find('h1').text()).toBe('Image to Text');
  });
});
