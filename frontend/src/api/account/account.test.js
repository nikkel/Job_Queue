import React from 'react';
import Enzyme, { shallow, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import backend from '../backend';

Enzyme.configure({ adapter: new Adapter() });

describe('Account Integration Tests Functionality', () => {
  test('Get all tasks', async () => {
    const { access_token } = await backend.post('/auth', {
      username: 'test',
      password: 'none',
    });
    expect(access_token).toBeTruthy();
  });
});
