import React from 'react';
import Enzyme, { shallow, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import TaskTable from './TaskTable';

Enzyme.configure({ adapter: new Adapter() });

describe('Testing TaskTable Functionality', () => {
  test('Page renders without failure', () => {
    const wrapper = shallow(<TaskTable />);
    expect(wrapper.exists()).toBe(true);
  });
});
