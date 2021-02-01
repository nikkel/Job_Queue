import React from 'react';
import Enzyme, { shallow, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import task from '.';
import backend from '../backend';
import fs from 'fs';

Enzyme.configure({ adapter: new Adapter() });

describe('Task Integration Tests Functionality', () => {
  test('Get all tasks', async () => {
    const { access_token } = await backend.post('/auth', {
      username: 'test',
      password: 'none',
    });
    const result = await task.getAll({
      headers: { Authorization: `JWT ${access_token}` },
    });
    expect(result).toStrictEqual({ tasks: [] });
  });
});
