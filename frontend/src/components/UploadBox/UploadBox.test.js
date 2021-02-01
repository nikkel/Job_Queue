import React from 'react';
import Enzyme, { shallow, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import UploadBox from './UploadBox';

Enzyme.configure({ adapter: new Adapter() });

describe('Testing UploadBox Functionality', () => {
  test('Page renders without failure', () => {
    const wrapper = shallow(<UploadBox />);
    expect(wrapper.exists()).toBe(true);
  });
});
